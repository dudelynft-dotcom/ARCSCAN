import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatNumber, formatUsd } from "@/lib/format";
import { Activity, Users, FileCode, Layers, TrendingUp, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Network Stats" };
export const revalidate = 300;

async function getNetworkStats() {
  const explorer = process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app";

  let chainStats = { total_transactions: "0", total_addresses: "0", total_blocks: "0", average_block_time: 0 };
  try {
    const res = await fetch(`${explorer}/api/v2/stats`, { next: { revalidate: 300 } });
    if (res.ok) chainStats = await res.json();
  } catch { /* offline */ }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalProjects, verified, newThisWeek, totalHolders, topByHolders, topByScore, categories] =
    await Promise.all([
      prisma.project.count({ where: { flagged: false } }),
      prisma.project.count({ where: { verified: true } }),
      prisma.project.count({ where: { createdAt: { gte: weekAgo }, flagged: false } }),
      prisma.metric.aggregate({ _sum: { holders: true } }),
      prisma.project.findMany({
        where: { flagged: false, metrics: { holders: { gt: 0 } } },
        include: { metrics: true },
        orderBy: { metrics: { holders: "desc" } },
        take: 10,
      }),
      prisma.project.findMany({
        where: { flagged: false, scoreOverride: { not: null } },
        orderBy: { scoreOverride: "desc" },
        take: 10,
      }),
      prisma.project.groupBy({ by: ["category"], _count: { category: true }, orderBy: { _count: { category: "desc" } } }),
    ]);

  return { chainStats, totalProjects, verified, newThisWeek, totalHolders: totalHolders._sum.holders ?? 0, topByHolders, topByScore, categories };
}

export default async function StatsPage() {
  const { chainStats, totalProjects, verified, newThisWeek, totalHolders, topByHolders, topByScore, categories } =
    await getNetworkStats();

  const networkCards = [
    { icon: Activity, label: "Total transactions", value: formatNumber(parseInt(chainStats.total_transactions) || 0) },
    { icon: Users, label: "Total addresses", value: formatNumber(parseInt(chainStats.total_addresses) || 0) },
    { icon: Layers, label: "Total blocks", value: formatNumber(parseInt(chainStats.total_blocks) || 0) },
    { icon: Clock, label: "Avg block time", value: chainStats.average_block_time ? `${(chainStats.average_block_time / 1000).toFixed(1)}s` : "--" },
  ];

  const ecosystemCards = [
    { label: "Projects tracked", value: formatNumber(totalProjects) },
    { label: "Verified projects", value: formatNumber(verified) },
    { label: "New this week", value: `+${newThisWeek}` },
    { label: "Total token holders", value: formatNumber(totalHolders) },
  ];

  return (
    <div className="space-y-10 pt-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Arc Network Stats</h1>
        <p className="mt-1 text-sm text-arc-muted">
          Live on-chain data from Arc testnet. Auto-refreshes every 5 minutes.
        </p>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-arc-muted">
          <Activity className="h-4 w-4" /> Network
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {networkCards.map((c) => (
            <div key={c.label} className="panel p-4">
              <div className="flex items-center gap-2 text-xs text-arc-muted">
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-arc-muted">
          <FileCode className="h-4 w-4" /> Ecosystem
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ecosystemCards.map((c) => (
            <div key={c.label} className="panel p-4">
              <div className="text-xs text-arc-muted">{c.label}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-arc-muted">
            <TrendingUp className="h-4 w-4" /> Top projects by holders
          </h2>
          <div className="panel divide-y divide-arc-border">
            {topByHolders.map((p, i) => (
              <a key={p.id} href={`/project/${p.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-arc-border/30">
                <span className="w-6 text-center text-sm font-mono text-arc-muted">{i + 1}</span>
                <span className="flex-1 font-medium truncate">{p.name}</span>
                <span className="font-mono text-sm tabular-nums">{formatNumber(p.metrics?.holders)}</span>
              </a>
            ))}
            {topByHolders.length === 0 && (
              <div className="p-4 text-sm text-arc-muted">No holder data yet. Run a scan to populate.</div>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-arc-muted">
            <Layers className="h-4 w-4" /> Projects by category
          </h2>
          <div className="panel divide-y divide-arc-border">
            {categories.map((c) => (
              <a key={c.category} href={`/explorer?category=${c.category}`} className="flex items-center justify-between px-4 py-3 hover:bg-arc-border/30">
                <span className="font-medium">{c.category}</span>
                <span className="pill">{c._count.category}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
