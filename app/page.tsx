import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";
import { StatsBar } from "@/components/stats-bar";
import { CATEGORIES } from "@/lib/categories";
import { ShieldCheck, Clock, TrendingUp, Layers, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";

export const revalidate = 60;

async function getHomeData() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [justLaunched, newest, verified, total, byCat] = await Promise.all([
    prisma.project.findMany({
      where: { flagged: false, createdAt: { gte: dayAgo }, source: { not: "seed" } },
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.project.findMany({
      where: { flagged: false, createdAt: { gte: weekAgo }, source: { not: "seed" } },
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.project.findMany({
      where: { verified: true, flagged: false },
      orderBy: [{ scoreOverride: "desc" }, { scoreComputed: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.project.count(),
    prisma.project.groupBy({ by: ["category"], _count: { category: true } }),
  ]);
  const byCatMap = Object.fromEntries(byCat.map((r) => [r.category, r._count.category]));
  return { justLaunched, newest, verified, total, byCatMap };
}

export default async function HomePage() {
  const { justLaunched, newest, verified, total, byCatMap } = await getHomeData();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="space-y-4 pt-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          The discovery engine for{" "}
          <span className="text-arc-accent">Arc</span>.
        </h1>
        <p className="max-w-2xl text-arc-muted">
          {appName} tracks every project building on{" "}
          <a href="https://www.arc.network" className="link" target="_blank" rel="noreferrer">
            Arc blockchain
          </a>{" "}
          — Circle&apos;s stablecoin-native L1.
          Auto-synced from on-chain data. Updated every 6 hours.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/explorer" className="btn-primary">
            Explore {total} projects
          </Link>
          <Link href="/submit" className="btn">
            Submit a project
          </Link>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Just launched (last 24h) */}
      {justLaunched.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-arc-accent" />
            <h2 className="text-lg font-semibold">Just launched</h2>
            <span className="pill">last 24h</span>
            <Link href="/explorer?sort=new&fresh=1" className="ml-auto text-sm text-arc-muted hover:text-white">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {justLaunched.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Verified */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-arc-accent" />
          <h2 className="text-lg font-semibold">Verified on Arc</h2>
          <Link href="/explorer?verified=1" className="ml-auto text-sm text-arc-muted hover:text-white">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {verified.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* New this week */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-arc-accent" />
          <h2 className="text-lg font-semibold">New this week</h2>
          <Link href="/explorer?sort=new" className="ml-auto text-sm text-arc-muted hover:text-white">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="panel p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-arc-accent" />
          <h2 className="text-lg font-semibold">Arc ecosystem digest</h2>
        </div>
        <p className="mb-4 text-sm text-arc-muted">
          Weekly roundup of new projects, trending tokens, and ecosystem updates. No spam.
        </p>
        <NewsletterForm />
      </section>

      {/* Browse by category */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-arc-accent" />
          <h2 className="text-lg font-semibold">Browse by category</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="panel flex items-center justify-between p-3 hover:border-arc-accent/60"
            >
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-xs text-arc-muted">{c.blurb}</div>
              </div>
              <span className="pill">{byCatMap[c.id] ?? 0}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
