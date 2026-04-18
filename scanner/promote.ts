import { prisma } from "../lib/db";
import { slugify } from "../lib/slug";

/**
 * Promote a DiscoveryCandidate into a Project (pending admin verification).
 * Called from admin panel or CLI once a candidate looks real.
 */
export async function promoteCandidate(
  candidateAddress: string,
  opts: { name?: string; category?: string; description?: string } = {},
) {
  const addr = candidateAddress.toLowerCase();
  const c = await prisma.discoveryCandidate.findUnique({ where: { contractAddress: addr } });
  if (!c) throw new Error(`candidate not found: ${addr}`);
  if (c.promoted) throw new Error(`already promoted: ${addr}`);

  const baseName = opts.name || c.tokenName || c.symbol || addr.slice(0, 10);
  let slug = slugify(baseName);
  let n = 1;
  while (await prisma.project.findUnique({ where: { slug } })) {
    n++;
    slug = `${slugify(baseName)}-${n}`;
  }

  const project = await prisma.project.create({
    data: {
      slug,
      name: baseName,
      category: opts.category || "infra",
      description: opts.description,
      contractAddress: c.contractAddress,
      source: `auto:${c.source}`,
      sourceNote: `discovered at block ${c.blockNumber ?? "?"}`,
      verified: false,
    },
  });

  await prisma.discoveryCandidate.update({
    where: { contractAddress: addr },
    data: { promoted: true, processed: true },
  });

  return project;
}
