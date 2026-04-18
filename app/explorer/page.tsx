import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";
import { ExplorerFilters } from "@/components/explorer-filters";
import { CATEGORY_IDS, categoryLabel } from "@/lib/categories";
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
      { name: { contains: q } },
      { description: { contains: q } },
      { category: { contains: q } },
    ];
  }

  const orderBy: Prisma.ProjectOrderByWithRelationInput[] =
    sort === "new"
      ? [{ verified: "desc" }, { createdAt: "desc" }]
      : sort === "name"
        ? [{ verified: "desc" }, { name: "asc" }]
        : [{ verified: "desc" }, { scoreOverride: "desc" }, { scoreComputed: "desc" }, { name: "asc" }];

  const [projects, total] = await Promise.all([
    prisma.project.findMany({ where, orderBy, take: 200 }),
    prisma.project.count({ where }),
  ]);

  const heading = category ? categoryLabel(category) : "All projects";

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        <p className="text-sm text-arc-muted">
          {total} project{total === 1 ? "" : "s"}
          {q ? <> matching “{q}”</> : null}
        </p>
      </div>
      <ExplorerFilters />
      {projects.length === 0 ? (
        <div className="panel p-8 text-center text-arc-muted">
          No projects match your filters yet. Try clearing them or browsing all categories.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
