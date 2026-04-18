import { prisma } from "../lib/db";
import { slugify } from "../lib/slug";

/**
 * Pulls tokens + verified contracts from the Arc Blockscout explorer
 * and auto-adds them as unverified Projects (not just candidates).
 *
 * This is the primary discovery source for real projects on Arc.
 */

const EXPLORER = (process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app").replace(/\/$/, "");

// Skip generic/test contract names
const SKIP_NAMES = new Set([
  "mytoken", "storage", "test", "hello", "counter", "lock",
  "greeter", "sample", "demo", "example", "token", "nft",
]);

// Known stablecoin addresses to skip (already seeded)
const KNOWN_STABLES = new Set([
  "0x3600000000000000000000000000000000000000", // USDC
]);

interface BlockscoutToken {
  name: string;
  symbol: string;
  address_hash: string;
  type: string;
  holders_count: string;
  total_supply: string | null;
  exchange_rate: string | null;
  icon_url: string | null;
}

interface BlockscoutContract {
  address: { hash: string };
  name?: string | null;
  verified_at?: string | null;
}

function guessCategory(name: string, symbol: string, type: string): string {
  const lName = name.toLowerCase();
  const lSymbol = symbol.toLowerCase();

  if (lName.includes("swap") || lName.includes("dex") || lName.includes("lp") || lSymbol.includes("lp")) return "dex";
  if (lName.includes("nft") || lName.includes("card") || type === "ERC-721" || type === "ERC-1155") return "infra";
  if (lName.includes("usdc") || lName.includes("usdt") || lName.includes("eurc")) return "stablecoin";
  if (lName.includes("vault") || lName.includes("yield")) return "yield-funds";
  if (lName.includes("bridge") || lName.includes("wrapped")) return "crosschain";
  if (lName.includes("name") || lName.includes("domain") || lName.includes("zns")) return "dev-tools";
  if (type === "ERC-20") return "dex";

  return "infra";
}

async function ensureSlug(baseName: string): Promise<string | null> {
  let slug = slugify(baseName);
  if (!slug) return null;

  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) return null; // already exists

  return slug;
}

/**
 * Pull tokens from Blockscout token list API.
 * These are real tokens with on-chain activity — high signal.
 */
export async function pullTokens(minHolders = 100) {
  const url = `${EXPLORER}/api/v2/tokens`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    return { ok: false as const, error: `explorer returned ${res.status}` };
  }

  const body = (await res.json()) as { items?: BlockscoutToken[]; next_page_params?: unknown };
  const items = body.items ?? [];

  let added = 0;
  let skipped = 0;
  const addedNames: string[] = [];

  for (const token of items) {
    const holders = parseInt(token.holders_count, 10) || 0;
    if (holders < minHolders) { skipped++; continue; }

    const addr = token.address_hash?.toLowerCase();
    if (!addr) continue;
    if (KNOWN_STABLES.has(addr)) { skipped++; continue; }

    const cleanName = token.name?.trim();
    if (!cleanName) continue;
    if (SKIP_NAMES.has(cleanName.toLowerCase())) { skipped++; continue; }

    // Check if already exists by contract address
    const existingByAddr = await prisma.project.findFirst({
      where: { contractAddress: addr },
    });
    if (existingByAddr) { skipped++; continue; }

    const slug = await ensureSlug(cleanName);
    if (!slug) { skipped++; continue; }

    const category = guessCategory(cleanName, token.symbol || "", token.type || "ERC-20");

    await prisma.project.create({
      data: {
        slug,
        name: cleanName,
        description: `${token.type} token on Arc (${token.symbol}). ${holders.toLocaleString()} holders.`,
        category,
        contractAddress: addr,
        source: "blockscout-token",
        sourceNote: `Auto-discovered from Blockscout token list. ${holders} holders at scan time.`,
        verified: false,
        logoUrl: token.icon_url || null,
        socials: { create: {} },
        metrics: {
          create: {
            holders,
          },
        },
      },
    });

    added++;
    addedNames.push(`${cleanName} (${token.symbol}, ${holders} holders)`);
  }

  return { ok: true as const, added, skipped, addedNames, scanned: items.length };
}

/**
 * Pull verified contracts from Blockscout smart-contracts API.
 * Lower signal than tokens (no holder data) but catches utility contracts.
 */
export async function pullVerifiedContracts(limit = 100) {
  const url = `${EXPLORER}/api/v2/smart-contracts`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    return { ok: false as const, error: `explorer returned ${res.status}` };
  }
  const body = (await res.json()) as { items?: BlockscoutContract[] };
  const items = (body.items ?? []).slice(0, limit);

  let inserted = 0;
  for (const c of items) {
    const addr = c.address?.hash?.toLowerCase();
    if (!addr) continue;
    const name = c.name?.trim();
    if (!name || SKIP_NAMES.has(name.toLowerCase())) continue;

    // Check if already in candidates or projects
    const existingCandidate = await prisma.discoveryCandidate.findUnique({
      where: { contractAddress: addr },
    });
    if (existingCandidate) continue;

    const existingProject = await prisma.project.findFirst({
      where: { contractAddress: addr },
    });
    if (existingProject) continue;

    await prisma.discoveryCandidate.create({
      data: {
        contractAddress: addr,
        chainId: Number(process.env.ARC_CHAIN_ID || 5042002),
        source: "blockscout-verified",
        tokenName: name,
        notes: c.verified_at ? `verified_at=${c.verified_at}` : null,
      },
    });
    inserted++;
  }

  return { ok: true as const, inserted, scanned: items.length };
}

/**
 * Pull address counters (tx count, gas used, transfers) and estimate unique wallets
 * from recent transactions. Used to populate on-chain activity metrics per project.
 */
export async function pullAddressStats(contractAddress: string): Promise<{
  ok: boolean;
  txCount?: number;
  gasUsed?: number;
  transfersCount?: number;
  uniqueWallets?: number;
}> {
  try {
    const countersUrl = `${EXPLORER}/api/v2/addresses/${contractAddress}/counters`;
    const countersRes = await fetch(countersUrl, { headers: { accept: "application/json" } });
    if (!countersRes.ok) return { ok: false };

    const counters = (await countersRes.json()) as {
      transactions_count?: string;
      gas_usage_count?: string;
      token_transfers_count?: string;
      validations_count?: string;
    };

    // Estimate unique wallets from recent transfers
    let uniqueWallets: number | undefined;
    try {
      const transfersUrl = `${EXPLORER}/api/v2/addresses/${contractAddress}/token-transfers`;
      const transfersRes = await fetch(transfersUrl, { headers: { accept: "application/json" } });
      if (transfersRes.ok) {
        const body = (await transfersRes.json()) as {
          items?: Array<{ from?: { hash?: string }; to?: { hash?: string } }>;
        };
        const wallets = new Set<string>();
        for (const item of body.items ?? []) {
          if (item.from?.hash) wallets.add(item.from.hash.toLowerCase());
          if (item.to?.hash) wallets.add(item.to.hash.toLowerCase());
        }
        uniqueWallets = wallets.size;
      }
    } catch { /* skip */ }

    return {
      ok: true,
      txCount: parseInt(counters.transactions_count ?? "0") || 0,
      gasUsed: parseInt(counters.gas_usage_count ?? "0") || 0,
      transfersCount: parseInt(counters.token_transfers_count ?? "0") || 0,
      uniqueWallets,
    };
  } catch {
    return { ok: false };
  }
}
