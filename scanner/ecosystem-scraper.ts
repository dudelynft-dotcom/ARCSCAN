import { prisma } from "../lib/db";
import { slugify } from "../lib/slug";

/**
 * Scrapes arc.network/ecosystem for partner names,
 * diffs against existing projects, and creates DiscoveryCandidates
 * for any new names found.
 */

const ECOSYSTEM_URL = "https://www.arc.network/ecosystem";

/** Strip HTML tags, decode entities, collapse whitespace */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract likely company/project names from the page text.
 * Strategy: the ecosystem page lists names as short strings (1-4 words).
 * We split on common delimiters and filter by length/pattern.
 */
function extractNames(text: string): string[] {
  // Split on bullet points, newlines, pipes, commas between names
  const chunks = text.split(/[•|,\n\r\t]+/).map((s) => s.trim());

  const names: string[] = [];
  for (const chunk of chunks) {
    // Skip very long strings (sentences, not names)
    if (chunk.length > 50 || chunk.length < 2) continue;
    // Skip common noise words
    if (/^(and|or|the|a|an|with|for|to|in|on|is|are|was|were)$/i.test(chunk)) continue;
    // Skip things that look like URLs or long descriptions
    if (chunk.includes("http") || chunk.split(" ").length > 5) continue;
    names.push(chunk);
  }
  return [...new Set(names)];
}

export async function scrapeEcosystem() {
  const res = await fetch(ECOSYSTEM_URL, {
    headers: {
      "User-Agent": "ArcRadar/1.0 (ecosystem-sync)",
      Accept: "text/html",
    },
  });
  if (!res.ok) {
    return { ok: false as const, error: `arc.network returned ${res.status}` };
  }

  const html = await res.text();
  const text = htmlToText(html);
  const rawNames = extractNames(text);

  // Get all existing project names + slugs for dedup
  const existing = await prisma.project.findMany({
    select: { name: true, slug: true },
  });
  const existingSlugs = new Set(existing.map((p) => p.slug));
  const existingNamesLower = new Set(existing.map((p) => p.name.toLowerCase()));

  // Also check existing candidates
  const existingCandidates = await prisma.discoveryCandidate.findMany({
    where: { source: "ecosystem-page" },
    select: { tokenName: true },
  });
  const existingCandidateNames = new Set(
    existingCandidates.map((c) => c.tokenName?.toLowerCase()).filter(Boolean),
  );

  let inserted = 0;
  const newNames: string[] = [];

  for (const name of rawNames) {
    const slug = slugify(name);
    const nameLower = name.toLowerCase();

    // Skip if we already have this project or candidate
    if (existingSlugs.has(slug)) continue;
    if (existingNamesLower.has(nameLower)) continue;
    if (existingCandidateNames.has(nameLower)) continue;

    // Use a synthetic address since ecosystem names don't have contracts
    const syntheticAddr = `ecosystem:${slug}`;

    const alreadyExists = await prisma.discoveryCandidate.findUnique({
      where: { contractAddress: syntheticAddr },
    });
    if (alreadyExists) continue;

    await prisma.discoveryCandidate.create({
      data: {
        contractAddress: syntheticAddr,
        chainId: Number(process.env.ARC_CHAIN_ID || 5042002),
        source: "ecosystem-page",
        tokenName: name,
        notes: `Found on ${ECOSYSTEM_URL} at ${new Date().toISOString()}`,
      },
    });
    inserted++;
    newNames.push(name);
  }

  return {
    ok: true as const,
    scrapedNames: rawNames.length,
    newCandidates: inserted,
    newNames,
  };
}
