import { prisma } from "@/lib/db";

export interface ResolvedAddress {
  slug?: string;
  name?: string;
  verified?: boolean;
}

/**
 * Resolve a list of contract addresses to project names.
 * Returns a map of lowercase address -> project info.
 */
export async function resolveAddresses(addresses: string[]): Promise<Map<string, ResolvedAddress>> {
  const unique = [...new Set(addresses.map((a) => a.toLowerCase()))].filter(Boolean);
  if (unique.length === 0) return new Map();

  const projects = await prisma.project.findMany({
    where: {
      contractAddress: { in: unique, mode: "insensitive" },
    },
    select: { slug: true, name: true, verified: true, contractAddress: true },
  });

  const map = new Map<string, ResolvedAddress>();
  for (const p of projects) {
    if (p.contractAddress) {
      map.set(p.contractAddress.toLowerCase(), {
        slug: p.slug,
        name: p.name,
        verified: p.verified,
      });
    }
  }
  return map;
}
