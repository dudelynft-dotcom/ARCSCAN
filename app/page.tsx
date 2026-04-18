import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";
import { StatsBar } from "@/components/stats-bar";
import { CATEGORIES } from "@/lib/categories";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatNumber } from "@/lib/format";

export const revalidate = 60;

async function getHomeData() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [justLaunched, newest, verified, topByHolders, total, byCat] = await Promise.all([
    prisma.project.findMany({
      where: { flagged: false, createdAt: { gte: dayAgo }, source: { not: "seed" } },
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      include: { metrics: true },
      take: 6,
    }),
    prisma.project.findMany({
      where: { flagged: false, createdAt: { gte: weekAgo }, source: { not: "seed" } },
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      include: { metrics: true },
      take: 6,
    }),
    prisma.project.findMany({
      where: { verified: true, flagged: false },
      orderBy: [{ scoreOverride: "desc" }, { scoreComputed: "desc" }, { createdAt: "desc" }],
      include: { metrics: true },
      take: 8,
    }),
    prisma.project.findMany({
      where: { flagged: false, metrics: { holders: { gt: 1000 } } },
      orderBy: { metrics: { holders: "desc" } },
      include: { metrics: true },
      take: 10,
    }),
    prisma.project.count(),
    prisma.project.groupBy({ by: ["category"], _count: { category: true } }),
  ]);
  const byCatMap = Object.fromEntries(byCat.map((r) => [r.category, r._count.category]));
  return { justLaunched, newest, verified, topByHolders, total, byCatMap };
}

export default async function HomePage() {
  const { justLaunched, newest, verified, topByHolders, total, byCatMap } = await getHomeData();

  return (
    <div className="space-y-16">
      {/* Hero — institutional, terse, confident */}
      <section className="space-y-6 pt-4">
        <div className="space-y-4">
          <div className="eyebrow">Arc · Stablecoin-native L1 · Chain ID 5042002</div>
          <h1 className="max-w-4xl text-[44px] font-semibold leading-[1.05] tracking-tightest text-ink-700 sm:text-[56px]">
            Every project building on Arc, indexed and tracked.
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-ink-500">
            Real-time discovery infrastructure for{" "}
            <a
              href="https://www.arc.network"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              Arc blockchain
            </a>
            . Auto-synced from on-chain data. No gatekeepers, no paid listings.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/explorer" className="btn-primary">
            Open explorer · {total} projects
          </Link>
          <Link href="/stats" className="btn">
            Network stats
          </Link>
          <Link href="/api/v1/projects" className="btn">
            API
          </Link>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Verified projects */}
      <section>
        <SectionHeader
          eyebrow="Institutional"
          title="Verified on Arc"
          href="/explorer?verified=1"
        />
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {verified.map((p, i) => (
            <div
              key={p.id}
              className={`${i > 0 ? "border-t sm:border-t-0 sm:border-l" : ""} ${
                i >= 2 ? "sm:border-t" : ""
              } ${i % 4 !== 0 ? "lg:border-l" : ""} ${
                i >= 4 ? "lg:border-t" : ""
              } border-ink-200`}
            >
              <ProjectCard p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Top by holders — leaderboard */}
      {topByHolders.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="Leaderboard"
            title="Top by holders"
            href="/explorer?sort=holders"
          />
          <div className="surface overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th>Project</th>
                  <th>Category</th>
                  <th className="text-right">Holders</th>
                  <th className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {topByHolders.map((p, i) => (
                  <tr key={p.id}>
                    <td className="mono text-ink-400">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <Link
                        href={`/project/${p.slug}`}
                        className="font-medium text-ink-700 hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.verified && <span className="ml-2 tag-dark">Verified</span>}
                    </td>
                    <td className="text-ink-500">{p.category}</td>
                    <td className="mono text-right text-ink-700">
                      {formatNumber(p.metrics?.holders)}
                    </td>
                    <td className="mono text-right text-ink-700">
                      {p.scoreOverride ?? p.scoreComputed ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Just launched + new this week — side by side */}
      <div className="grid gap-10 lg:grid-cols-2">
        {justLaunched.length > 0 && (
          <section>
            <SectionHeader eyebrow="24h" title="Just launched" href="/explorer?fresh=1" compact />
            <div className="surface divide-y divide-ink-200">
              {justLaunched.map((p) => (
                <RowLink key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}
        {newest.length > 0 && (
          <section>
            <SectionHeader eyebrow="7d" title="New this week" href="/explorer?sort=new" compact />
            <div className="surface divide-y divide-ink-200">
              {newest.map((p) => (
                <RowLink key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Categories */}
      <section>
        <SectionHeader eyebrow="Taxonomy" title="Browse by category" />
        <div className="surface grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className={`group px-4 py-3 hover:bg-ink-50 ${i % 2 !== 0 ? "border-l" : ""} ${
                i % 3 !== 0 ? "sm:border-l" : "sm:border-l-0"
              } ${i % 4 !== 0 ? "lg:border-l" : "lg:border-l-0"} ${
                i >= 2 ? "border-t" : ""
              } border-ink-200`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-700 group-hover:underline">
                  {c.label}
                </span>
                <span className="mono text-xs text-ink-400">
                  {String(byCatMap[c.id] ?? 0).padStart(3, "0")}
                </span>
              </div>
              <div className="mt-1 text-2xs text-ink-500">{c.blurb}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="surface px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <div className="eyebrow">Digest</div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink-700">
              Weekly Arc ecosystem report
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Every Monday — new verified projects, holder movements, launch activity.
            </p>
          </div>
          <div className="w-full sm:max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  compact,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-end justify-between ${compact ? "mb-3" : "mb-5"}`}>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2
          className={`mt-1 font-semibold tracking-tight text-ink-700 ${
            compact ? "text-lg" : "text-2xl"
          }`}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-2xs uppercase tracking-wider text-ink-500 hover:text-ink-700"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

function RowLink({
  p,
}: {
  p: {
    slug: string;
    name: string;
    category: string;
    verified: boolean;
    metrics?: { holders: number | null } | null;
  };
}) {
  return (
    <Link
      href={`/project/${p.slug}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-ink-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-ink-700">{p.name}</span>
          {p.verified && <span className="tag-dark">Verified</span>}
        </div>
        <div className="mt-0.5 text-2xs uppercase tracking-wider text-ink-400">
          {p.category}
        </div>
      </div>
      {p.metrics?.holders != null && p.metrics.holders > 0 && (
        <span className="mono text-xs text-ink-500 shrink-0">
          {formatNumber(p.metrics.holders)} holders
        </span>
      )}
    </Link>
  );
}
