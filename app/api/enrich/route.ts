import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enrichProjectLinks } from "@/scanner/link-enricher";

/**
 * POST /api/enrich
 *
 * Auto-fills missing website, twitter, telegram, discord, github, docs
 * by scraping known websites and searching for unknown ones.
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

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Projects missing at least one social link
  const projects = await prisma.project.findMany({
    where: { flagged: false },
    include: { socials: true },
  });

  const needsEnrichment = projects.filter((p) => {
    const s = p.socials;
    return !s?.website || !s?.twitter || !s?.telegram || !s?.github || !s?.docs;
  });

  let enriched = 0;
  const updates: Array<{ name: string; added: string[] }> = [];

  // Process up to 15 per call to stay under Vercel timeout
  for (const p of needsEnrichment.slice(0, 15)) {
    const found = await enrichProjectLinks(p.name, p.socials?.website);
    const updateData: Record<string, string> = {};
    const added: string[] = [];

    if (found.website && !p.socials?.website) { updateData.website = found.website; added.push("website"); }
    if (found.twitter && !p.socials?.twitter) { updateData.twitter = found.twitter; added.push("twitter"); }
    if (found.telegram && !p.socials?.telegram) { updateData.telegram = found.telegram; added.push("telegram"); }
    if (found.discord && !p.socials?.discord) { updateData.discord = found.discord; added.push("discord"); }
    if (found.github && !p.socials?.github) { updateData.github = found.github; added.push("github"); }
    if (found.docs && !p.socials?.docs) { updateData.docs = found.docs; added.push("docs"); }

    if (Object.keys(updateData).length === 0) continue;

    await prisma.socials.upsert({
      where: { projectId: p.id },
      create: { projectId: p.id, ...updateData },
      update: updateData,
    });

    enriched++;
    updates.push({ name: p.name, added });

    // Polite delay
    await new Promise((r) => setTimeout(r, 400));
  }

  return NextResponse.json({
    enrichedAt: new Date().toISOString(),
    checked: Math.min(needsEnrichment.length, 15),
    remaining: Math.max(0, needsEnrichment.length - 15),
    enriched,
    updates,
  });
}
