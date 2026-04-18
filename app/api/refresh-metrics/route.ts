import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/refresh-metrics
 *
 * Refreshes holder counts for all projects with contract addresses
 * by querying the Blockscout token API. Also takes a daily snapshot.
 */

const EXPLORER = (process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app").replace(/\/$/, "");

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SCANNER_SECRET || process.env.ADMIN_PASSWORD;
  const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (auth && secret && auth === secret) return true;
  if (req.cookies.get("arc_admin")?.value) return true;
  return false;
}

interface TokenInfo {
  address_hash: string;
  holders_count: string;
  name: string;
  symbol: string;
  total_supply: string | null;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all tokens from Blockscout
  let tokens: TokenInfo[] = [];
  try {
    const res = await fetch(`${EXPLORER}/api/v2/tokens`, {
      headers: { accept: "application/json" },
    });
    if (res.ok) {
      const body = await res.json();
      tokens = body.items ?? [];
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch Blockscout tokens" }, { status: 502 });
  }

  const tokenMap = new Map(tokens.map((t) => [t.address_hash.toLowerCase(), t]));

  // Get all projects with contract addresses
  const projects = await prisma.project.findMany({
    where: { contractAddress: { not: null } },
    select: { id: true, contractAddress: true },
  });

  const today = new Date().toISOString().slice(0, 10);
  let updated = 0;

  for (const p of projects) {
    if (!p.contractAddress) continue;
    const token = tokenMap.get(p.contractAddress.toLowerCase());
    if (!token) continue;

    const holders = parseInt(token.holders_count, 10) || 0;

    // Update live metrics
    await prisma.metric.upsert({
      where: { projectId: p.id },
      create: { projectId: p.id, holders },
      update: { holders },
    });

    // Take daily snapshot
    await prisma.dailySnapshot.upsert({
      where: { projectId_date: { projectId: p.id, date: today } },
      create: { projectId: p.id, date: today, holders },
      update: { holders },
    });

    updated++;
  }

  // Also store network-level stats
  try {
    const statsRes = await fetch(`${EXPLORER}/api/v2/stats`);
    if (statsRes.ok) {
      const s = await statsRes.json();
      await prisma.networkStat.upsert({
        where: { date: today },
        create: {
          date: today,
          totalTxCount: parseInt(s.total_transactions) || null,
          totalAddresses: parseInt(s.total_addresses) || null,
          totalContracts: parseInt(s.total_contracts) || null,
          avgBlockTime: s.average_block_time ? s.average_block_time / 1000 : null,
        },
        update: {
          totalTxCount: parseInt(s.total_transactions) || null,
          totalAddresses: parseInt(s.total_addresses) || null,
          totalContracts: parseInt(s.total_contracts) || null,
          avgBlockTime: s.average_block_time ? s.average_block_time / 1000 : null,
        },
      });
    }
  } catch { /* skip */ }

  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    projectsUpdated: updated,
    tokensAvailable: tokens.length,
    snapshotDate: today,
  });
}
