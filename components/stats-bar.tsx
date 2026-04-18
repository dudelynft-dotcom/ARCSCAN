import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";

export async function StatsBar() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [total, verified, newThisWeek, newToday, totalHolders] = await Promise.all([
    prisma.project.count({ where: { flagged: false } }),
    prisma.project.count({ where: { verified: true, flagged: false } }),
    prisma.project.count({ where: { createdAt: { gte: weekAgo }, flagged: false, source: { not: "seed" } } }),
    prisma.project.count({ where: { createdAt: { gte: dayAgo }, flagged: false, source: { not: "seed" } } }),
    prisma.metric.aggregate({ _sum: { holders: true } }),
  ]);

  const holders = totalHolders._sum.holders ?? 0;

  const stats = [
    { label: "Total projects", value: formatNumber(total) },
    { label: "Verified", value: formatNumber(verified) },
    { label: "New this week", value: `+${newThisWeek}` },
    { label: "New today", value: `+${newToday}` },
    { label: "Total holders", value: formatNumber(holders) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="panel px-4 py-3 text-center">
          <div className="text-xl font-bold tabular-nums">{s.value}</div>
          <div className="text-xs text-arc-muted">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
