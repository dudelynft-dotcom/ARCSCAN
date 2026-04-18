import Link from "next/link";
import { prisma } from "@/lib/db";
import { ExplorerFilters } from "@/components/explorer-filters";
import { CATEGORY_IDS, categoryLabel } from "@/lib/categories";
import { VerifiedBadge } from "@/components/verified-badge";
import { ScoreBar } from "@/components/score-bar";
import { formatNumber, timeAgo } from "@/lib/format";
import { displayScore } from "@/lib/scoring";
import type { Prisma } from "@prisma/client";

export const revalidate = 60;

type SP = Promise<{ [k: string]: string | string[] | undefined }>;

function pickStr(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ExplorerPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const category = pickStr(sp.category);
  const q = pickStr(sp.q)?.trim();
  const sort = pickStr(sp.sort) ?? "score";
  const verified = pickStr(sp.verified) === "1";
  const fresh = pickStr(sp.fresh) === "1";

  const where: Prisma.ProjectWhereInput = { flagged: false };
  if (category && CATEGORY_IDS.includes(category as never)) {
    where.category = category;
  }
  if (verified) where.verified = true;
  if (fresh) {
    where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProjectOrderByWithRelationInput[] =
    sort === "new"
      ? [{ verified: "desc" }, { createdAt: "desc" }]
      : sort === "name"
        ? [{ verified: "desc" }, { name: "asc" }]
        : sort === "holders"
          ? [{ verified: "desc" }, { metrics: { holders: "desc" } }]
          : [
              { verified: "desc" },
              { scoreOverride: "desc" },
              { scoreComputed: "desc" },
              { name: "asc" },
            ];

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      take: 200,
      include: { metrics: true },
    }),
    prisma.project.count({ where }),
  ]);

  const heading = category ? categoryLabel(category) : "All projects";

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Explorer</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-700">{heading}</h1>
        <p className="mt-1 text-sm text-ink-500">
          <span className="mono text-ink-700">{total}</span> project{total === 1 ? "" : "s"}
          {q ? (
            <>
              {" "}matching <span className="mono">&quot;{q}&quot;</span>
            </>
          ) : null}
        </p>
      </div>

      <ExplorerFilters />

      {projects.length === 0 ? (
        <div className="surface p-10 text-center">
          <div className="text-sm text-ink-500">No projects match your filters.</div>
          <Link href="/explorer" className="btn mt-4">Clear filters</Link>
        </div>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="data-table min-w-[760px]">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Project</th>
                <th>Category</th>
                <th className="text-right">Holders</th>
                <th className="text-right">Score</th>
                <th className="text-right">Risk</th>
                <th className="text-right">Added</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => {
                const { score } = displayScore(p);
                return (
                  <tr key={p.id}>
                    <td className="mono text-ink-400">{String(i + 1).padStart(3, "0")}</td>
                    <td>
                      <Link
                        href={`/project/${p.slug}`}
                        className="group flex items-center gap-2"
                      >
                        <span className="font-medium text-ink-700 group-hover:underline">
                          {p.name}
                        </span>
                        <VerifiedBadge verified={p.verified} flagged={p.flagged} />
                      </Link>
                    </td>
                    <td className="text-ink-500">{categoryLabel(p.category)}</td>
                    <td className="mono text-right text-ink-700">
                      {p.metrics?.holders ? formatNumber(p.metrics.holders) : "—"}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end">
                        <ScoreBar score={score} />
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="mono text-2xs uppercase tracking-wider text-ink-500">
                        {p.riskLevel === "UNKNOWN" ? "—" : p.riskLevel}
                      </span>
                    </td>
                    <td className="mono text-right text-ink-400">
                      {timeAgo(p.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
