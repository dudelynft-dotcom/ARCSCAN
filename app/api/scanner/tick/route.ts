import { NextRequest, NextResponse } from "next/server";
import { pullTokens, pullVerifiedContracts } from "@/scanner/blockscout";
import { scrapeEcosystem } from "@/scanner/ecosystem-scraper";

/**
 * POST /api/scanner/tick
 *
 * Triggers a scan cycle:
 *   1. pullTokens — fetches real tokens from Blockscout, auto-adds as Projects
 *   2. pullVerifiedContracts — fetches verified contracts, adds to candidates
 *   3. scrapeEcosystem — scrapes arc.network/ecosystem for new partner names
 *
 * Protected by SCANNER_SECRET / ADMIN_PASSWORD / admin cookie / Vercel cron header.
 */

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SCANNER_SECRET || process.env.ADMIN_PASSWORD;
  const authHeader = req.headers.get("authorization");
  if (authHeader && secret) {
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token === secret) return true;
  }
  const cookie = req.cookies.get("arc_admin")?.value;
  if (cookie) return true;
  const cronSecret = req.headers.get("x-vercel-cron-secret");
  if (cronSecret && cronSecret === process.env.CRON_SECRET) return true;
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = new URL(req.url).searchParams.get("sources") ?? "tokens,blockscout,ecosystem";
  const enabledSources = sources.split(",").map((s) => s.trim());

  const results: Record<string, unknown> = {};

  // Primary source: real tokens with holder counts — auto-adds to Projects
  if (enabledSources.includes("tokens")) {
    results.tokens = await pullTokens(100).catch((e) => ({
      ok: false,
      error: String(e),
    }));
  }

  // Secondary: verified contracts — adds to DiscoveryCandidate for review
  if (enabledSources.includes("blockscout")) {
    results.blockscout = await pullVerifiedContracts().catch((e) => ({
      ok: false,
      error: String(e),
    }));
  }

  // Tertiary: ecosystem page scrape — adds new partner names to candidates
  if (enabledSources.includes("ecosystem")) {
    results.ecosystem = await scrapeEcosystem().catch((e) => ({
      ok: false,
      error: String(e),
    }));
  }

  return NextResponse.json({
    scannedAt: new Date().toISOString(),
    results,
  });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const [totalProjects, autoDiscovered, totalCandidates, unprocessed] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { source: { startsWith: "blockscout" } } }),
    prisma.discoveryCandidate.count(),
    prisma.discoveryCandidate.count({ where: { processed: false } }),
  ]);

  return NextResponse.json({
    projects: { total: totalProjects, autoDiscovered },
    candidates: { total: totalCandidates, unprocessed },
  });
}
