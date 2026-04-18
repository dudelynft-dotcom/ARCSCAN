import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";

export async function StatsBar() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [total, verified, newThisWeek, newToday, totalHolders] = await Promise.all([
    prisma.project.count({ where: { flagged: false } }),
    prisma.project.count({ where: { verified: true, flagged: false } }),
    prisma.project.count({
      where: { createdAt: { gte: weekAgo }, flagged: false, source: { not: "seed" } },
    }),
    prisma.project.count({
      where: { createdAt: { gte: dayAgo }, flagged: false, source: { not: "seed" } },
    }),
    prisma.metric.aggregate({ _sum: { holders: true } }),
  ]);

  const holders = totalHolders._sum.holders ?? 0;

  const stats = [
    { label: "Projects", value: formatNumber(total) },
    { label: "Verified", value: formatNumber(verified) },
    { label: "Added · 7d", value: `+${newThisWeek}` },
    { label: "Added · 24h", value: `+${newToday}` },
    { label: "Total holders", value: formatNumber(holders) },
  ];

  return (
    <div className="surface grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`px-5 py-4 ${i > 0 ? "border-l border-ink-200" : ""} ${
            i >= 3 ? "border-t sm:border-t-0 border-ink-200" : ""
          }`}
        >
          <div className="eyebrow">{s.label}</div>
          <div className="mono mt-1 text-2xl font-semibold tracking-tighter text-ink-700">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
