import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/enrich
 *
 * Auto-fills missing website/twitter for projects using web search.
 * Works by fetching DuckDuckGo instant answers (no API key needed).
 *
 * Protected by admin cookie or bearer token.
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
  return false;
}

interface DDGResult {
  AbstractURL?: string;
  AbstractSource?: string;
  Heading?: string;
  RelatedTopics?: Array<{ FirstURL?: string; Text?: string }>;
  Infobox?: { content?: Array<{ data_type?: string; value?: string; label?: string }> };
}

async function searchProject(name: string): Promise<{ website?: string; twitter?: string }> {
  const result: { website?: string; twitter?: string } = {};

  try {
    // DuckDuckGo Instant Answer API (no key needed)
    const q = encodeURIComponent(`${name} official site`);
    const res = await fetch(`https://api.duckduckgo.com/?q=${q}&format=json&no_html=1`, {
      headers: { "User-Agent": "ArcRadar/1.0" },
    });
    if (!res.ok) return result;
    const data = (await res.json()) as DDGResult;

    // Try to get website from AbstractURL
    if (data.AbstractURL && !data.AbstractURL.includes("wikipedia.org")) {
      result.website = data.AbstractURL;
    }

    // Try to find twitter from Infobox
    const infobox = data.Infobox?.content;
    if (infobox) {
      for (const item of infobox) {
        if (
          item.label?.toLowerCase().includes("twitter") ||
          item.data_type === "twitter_profile"
        ) {
          const handle = item.value?.replace(/^@/, "").replace(/https?:\/\/(x|twitter)\.com\//, "");
          if (handle) result.twitter = handle;
        }
      }
    }
  } catch {
    // Silently skip search failures
  }

  return result;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find projects missing website or twitter
  const projects = await prisma.project.findMany({
    include: { socials: true },
  });

  const needsEnrichment = projects.filter((p) => {
    const s = p.socials;
    return !s?.website || !s?.twitter;
  });

  let enriched = 0;
  const updates: Array<{ name: string; website?: string; twitter?: string }> = [];

  for (const p of needsEnrichment.slice(0, 20)) {
    // Rate limit: max 20 per call to avoid hammering DDG
    const found = await searchProject(p.name);

    if (!found.website && !found.twitter) continue;

    const updateData: Record<string, string> = {};
    if (found.website && !p.socials?.website) updateData.website = found.website;
    if (found.twitter && !p.socials?.twitter) updateData.twitter = found.twitter;

    if (Object.keys(updateData).length === 0) continue;

    await prisma.socials.upsert({
      where: { projectId: p.id },
      create: { projectId: p.id, ...updateData },
      update: updateData,
    });

    enriched++;
    updates.push({ name: p.name, ...updateData });

    // Be polite: 500ms between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  return NextResponse.json({
    enrichedAt: new Date().toISOString(),
    checked: Math.min(needsEnrichment.length, 20),
    remaining: Math.max(0, needsEnrichment.length - 20),
    enriched,
    updates,
  });
}
