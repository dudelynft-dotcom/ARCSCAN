import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Gift, Clock, ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Airdrops & Points" };
export const revalidate = 60;

export default async function AirdropsPage() {
  const [active, ended] = await Promise.all([
    prisma.airdrop.findMany({
      where: { status: "active" },
      include: { project: { select: { name: true, slug: true, verified: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.airdrop.findMany({
      where: { status: "ended" },
      include: { project: { select: { name: true, slug: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8 pt-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Airdrops and Points</h1>
        <p className="mt-1 text-sm text-arc-muted">
          Track active reward programs, airdrops, and points systems across the Arc ecosystem.
        </p>
      </div>

      {active.length === 0 && ended.length === 0 ? (
        <div className="panel p-8 text-center">
          <Gift className="mx-auto h-8 w-8 text-arc-muted" />
          <h2 className="mt-3 font-semibold">No airdrops tracked yet</h2>
          <p className="mt-1 text-sm text-arc-muted">
            Airdrops and points programs are added by the admin team. Check back soon or{" "}
            <Link href="/submit" className="link">submit a tip</Link>.
          </p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-arc-good">
                <Gift className="h-4 w-4" /> Active now
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((a) => (
                  <div key={a.id} className="panel space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{a.title}</h3>
                        <Link href={`/project/${a.project.slug}`} className="text-xs text-arc-accent hover:underline">
                          {a.project.name}
                          {a.project.verified && " (verified)"}
                        </Link>
                      </div>
                      {a.reward && <span className="pill shrink-0">{a.reward}</span>}
                    </div>
                    {a.description && <p className="text-sm text-arc-muted">{a.description}</p>}
                    <div className="flex items-center gap-3 pt-1 text-xs text-arc-muted">
                      {a.endsAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ends {new Date(a.endsAt).toLocaleDateString()}
                        </span>
                      )}
                      {a.url && (
                        <a href={a.url} target="_blank" rel="noreferrer" className="link flex items-center gap-1">
                          Participate <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {ended.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-arc-muted">
                Ended
              </h2>
              <div className="panel divide-y divide-arc-border">
                {ended.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <span className="font-medium">{a.title}</span>
                      <span className="ml-2 text-arc-muted">({a.project.name})</span>
                    </div>
                    <span className="text-arc-muted">ended</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
