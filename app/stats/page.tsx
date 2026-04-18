import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export const metadata: Metadata = { title: "Network stats" };
export const revalidate = 300;

async function getNetworkStats() {
  const explorer = process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app";

  let chainStats = {
    total_transactions: "0",
    total_addresses: "0",
    total_blocks: "0",
    average_block_time: 0,
  };
  try {
    const res = await fetch(`${explorer}/api/v2/stats`, { next: { revalidate: 300 } });
    if (res.ok) chainStats = await res.json();
  } catch {
    /* offline */
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalProjects, verified, newThisWeek, totalHolders, topByHolders, categories] =
    await Promise.all([
      prisma.project.count({ where: { flagged: false } }),
      prisma.project.count({ where: { verified: true } }),
      prisma.project.count({
        where: { createdAt: { gte: weekAgo }, flagged: false, source: { not: "seed" } },
      }),
      prisma.metric.aggregate({ _sum: { holders: true } }),
      prisma.project.findMany({
        where: { flagged: false, metrics: { holders: { gt: 0 } } },
        include: { metrics: true },
        orderBy: { metrics: { holders: "desc" } },
        take: 15,
      }),
      prisma.project.groupBy({
        by: ["category"],
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
      }),
    ]);

  return {
    chainStats,
    totalProjects,
    verified,
    newThisWeek,
    totalHolders: totalHolders._sum.holders ?? 0,
    topByHolders,
    categories,
  };
}

export default async function StatsPage() {
  const {
    chainStats,
    totalProjects,
    verified,
    newThisWeek,
    totalHolders,
    topByHolders,
    categories,
  } = await getNetworkStats();

  const networkCards = [
    { label: "Total tx", value: formatNumber(parseInt(chainStats.total_transactions) || 0) },
    { label: "Addresses", value: formatNumber(parseInt(chainStats.total_addresses) || 0) },
    { label: "Blocks", value: formatNumber(parseInt(chainStats.total_blocks) || 0) },
    {
      label: "Block time",
      value: chainStats.average_block_time
        ? `${(chainStats.average_block_time / 1000).toFixed(2)}s`
        : "—",
    },
  ];

  const ecosystemCards = [
    { label: "Projects", value: formatNumber(totalProjects) },
    { label: "Verified", value: formatNumber(verified) },
    { label: "Added · 7d", value: `+${newThisWeek}` },
    { label: "Total holders", value: formatNumber(totalHolders) },
  ];

  return (
    <div className="space-y-12">
      <div>
        <div className="eyebrow">Network</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-700">
          Arc network stats
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Live on-chain data from Arc testnet. Refreshes every 5 minutes.
        </p>
      </div>

      <section>
        <div className="eyebrow mb-3">Chain</div>
        <div className="surface grid grid-cols-2 lg:grid-cols-4">
          {networkCards.map((c, i) => (
            <StatCell key={c.label} label={c.label} value={c.value} index={i} cols={4} />
          ))}
        </div>
      </section>

      <section>
        <div className="eyebrow mb-3">Ecosystem</div>
        <div className="surface grid grid-cols-2 lg:grid-cols-4">
          {ecosystemCards.map((c, i) => (
            <StatCell key={c.label} label={c.label} value={c.value} index={i} cols={4} />
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <div className="eyebrow mb-3">Leaderboard · by holders</div>
          <div className="surface overflow-x-auto">
            <table className="data-table min-w-[420px]">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Project</th>
                  <th className="text-right">Holders</th>
                </tr>
              </thead>
              <tbody>
                {topByHolders.map((p, i) => (
                  <tr key={p.id}>
                    <td className="mono text-ink-400">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td>
                      <Link
                        href={`/project/${p.slug}`}
                        className="inline-flex items-center gap-2 font-medium text-ink-700 hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.verified && <span className="ml-2 tag-dark">Verified</span>}
                    </td>
                    <td className="mono text-right text-ink-700">
                      {formatNumber(p.metrics?.holders)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="eyebrow mb-3">Categories</div>
          <div className="surface divide-y divide-ink-200">
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/category/${c.category}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-ink-50"
              >
                <span className="text-sm font-medium text-ink-700">
                  {categoryLabel(c.category)}
                </span>
                <span className="mono text-xs text-ink-500">
                  {String(c._count.category).padStart(3, "0")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  index,
  cols,
}: {
  label: string;
  value: string;
  index: number;
  cols: number;
}) {
  const needsTop = index >= 2;
  const needsLeft = index % cols !== 0;
  return (
    <div
      className={`px-5 py-5 ${needsTop ? "border-t border-ink-200 lg:border-t-0" : ""} ${
        needsLeft ? "border-l border-ink-200" : ""
      } ${index >= cols ? "lg:border-t" : ""}`}
    >
      <div className="eyebrow">{label}</div>
      <div className="mono mt-1.5 text-2xl font-semibold tracking-tighter text-ink-700">
        {value}
      </div>
    </div>
  );
}
