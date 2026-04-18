import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CATEGORY_IDS } from "@/lib/categories";

/**
 * GET /api/v1/projects
 *
 * Public API for traders, bots, and dashboard builders.
 * No auth required. Rate-limited by Vercel/hosting naturally.
 *
 * Query params:
 *   ?category=dex
 *   ?verified=true
 *   ?sort=holders|score|new|name
 *   ?limit=50 (max 200)
 *   ?offset=0
 *   ?q=search term
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const verified = url.searchParams.get("verified");
  const sort = url.searchParams.get("sort") ?? "holders";
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50")));
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0"));
  const q = url.searchParams.get("q")?.trim();

  const where: Record<string, unknown> = { flagged: false };
  if (category && CATEGORY_IDS.includes(category as never)) where.category = category;
  if (verified === "true") where.verified = true;
  if (q) {
    where.OR = [{ name: { contains: q } }, { description: { contains: q } }];
  }

  type OrderBy = Record<string, unknown>;
  let orderBy: OrderBy[];
  switch (sort) {
    case "holders":
      orderBy = [{ metrics: { holders: "desc" } }, { name: "asc" }];
      break;
    case "score":
      orderBy = [{ scoreOverride: "desc" }, { scoreComputed: "desc" }];
      break;
    case "new":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "name":
      orderBy = [{ name: "asc" }];
      break;
    default:
      orderBy = [{ metrics: { holders: "desc" } }, { name: "asc" }];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: { metrics: true, socials: true },
    }),
    prisma.project.count({ where }),
  ]);

  const data = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    contractAddress: p.contractAddress,
    verified: p.verified,
    score: p.scoreOverride ?? p.scoreComputed,
    riskLevel: p.riskLevel,
    createdAt: p.createdAt.toISOString(),
    metrics: p.metrics
      ? {
          holders: p.metrics.holders,
          txCount: p.metrics.txCount,
          volume24h: p.metrics.volume24h,
          tvl: p.metrics.tvl,
          liquidity: p.metrics.liquidity,
        }
      : null,
    socials: p.socials
      ? {
          website: p.socials.website,
          twitter: p.socials.twitter,
          telegram: p.socials.telegram,
          discord: p.socials.discord,
          github: p.socials.github,
          docs: p.socials.docs,
        }
      : null,
  }));

  return NextResponse.json(
    { data, total, limit, offset },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
