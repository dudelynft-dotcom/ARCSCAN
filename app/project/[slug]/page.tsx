import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import { displayScore } from "@/lib/scoring";
import { formatNumber, formatUsd, shortAddr, timeAgo } from "@/lib/format";
import { VerifiedBadge } from "@/components/verified-badge";
import { WatchlistButton } from "@/components/watchlist-button";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.project.findUnique({ where: { slug } });
  if (!p) return { title: "Not found" };
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";
  const title = `${p.name} on Arc`;
  const desc = p.description || `Discover ${p.name} on Arc blockchain — tracked by ${appName}.`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, siteName: appName, type: "website" },
    twitter: { card: "summary", title, description: desc },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.project.findUnique({
    where: { slug },
    include: { metrics: true, socials: true },
  });
  if (!p) notFound();

  const { score, source: scoreSource } = displayScore(p);
  const explorer = process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app";

  const links = [
    { href: p.socials?.website, label: "Website" },
    {
      href: p.socials?.twitter ? `https://x.com/${p.socials.twitter}` : null,
      label: "Twitter",
    },
    { href: p.socials?.telegram, label: "Telegram" },
    { href: p.socials?.discord, label: "Discord" },
    { href: p.socials?.github, label: "GitHub" },
    { href: p.socials?.docs, label: "Docs" },
  ].filter((l) => l.href);

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <div className="text-2xs uppercase tracking-wider text-ink-400">
        <Link href="/explorer" className="hover:text-ink-700">
          Explorer
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/category/${p.category}`}
          className="hover:text-ink-700"
        >
          {categoryLabel(p.category)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">{p.name}</span>
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-ink-200 pb-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-700">{p.name}</h1>
            <VerifiedBadge verified={p.verified} flagged={p.flagged} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link href={`/category/${p.category}`} className="tag hover:border-ink-700">
              {categoryLabel(p.category)}
            </Link>
            {(p.tags ?? []).map((t) => (
              <Link key={t} href={`/category/${t}`} className="tag hover:border-ink-700">
                {categoryLabel(t)}
              </Link>
            ))}
            <span className="mono text-2xs uppercase tracking-wider text-ink-400">
              added {timeAgo(p.createdAt)}
            </span>
            {p.contractAddress && (
              <a
                href={`${explorer}/address/${p.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="mono text-xs text-ink-500 hover:text-ink-700"
              >
                {shortAddr(p.contractAddress)}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WatchlistButton slug={p.slug} />
        </div>
      </header>

      {p.description && (
        <section>
          <div className="eyebrow mb-3">Overview</div>
          <p className="max-w-3xl text-[15px] leading-relaxed text-ink-700">{p.description}</p>
        </section>
      )}

      {p.flagged && p.flagReason && (
        <section className="surface border-ink-900 bg-ink-100 p-4 text-sm">
          <strong className="text-ink-900">Flagged:</strong> {p.flagReason}
        </section>
      )}

      {/* Metrics grid */}
      <section>
        <div className="eyebrow mb-3">On-chain metrics</div>
        <div className="surface grid grid-cols-2 sm:grid-cols-4">
          <MetricCell label="Score" value={score != null ? String(score) : "—"} hint={scoreSource === "override" ? "admin-set" : ""} />
          <MetricCell label="Risk" value={p.riskLevel === "UNKNOWN" ? "—" : p.riskLevel} />
          <MetricCell label="Holders" value={formatNumber(p.metrics?.holders)} />
          <MetricCell label="Transactions" value={formatNumber(p.metrics?.txCount)} />
          <MetricCell label="Unique users" value={formatNumber(p.metrics?.uniqueUsers)} border />
          <MetricCell label="TVL" value={formatUsd(p.metrics?.tvl)} border />
          <MetricCell label="Volume 24h" value={formatUsd(p.metrics?.volume24h)} border />
          <MetricCell label="Volume 7d" value={formatUsd(p.metrics?.volume7d)} border />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Links */}
        <section>
          <div className="eyebrow mb-3">Official links</div>
          {links.length === 0 ? (
            <div className="surface p-4 text-sm text-ink-500">
              No official links on file yet.
            </div>
          ) : (
            <div className="surface divide-y divide-ink-200">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href!}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-4 py-3 hover:bg-ink-50"
                >
                  <span className="eyebrow">{l.label}</span>
                  <span className="mono text-xs text-ink-700 truncate max-w-xs">
                    {l.href!.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Contract */}
        <section>
          <div className="eyebrow mb-3">Contract details</div>
          <div className="surface divide-y divide-ink-200">
            <KV label="Address" value={p.contractAddress ? shortAddr(p.contractAddress) : "—"} mono />
            <KV label="Category" value={categoryLabel(p.category)} />
            <KV label="Verification" value={p.verified ? "Verified" : "Unverified"} />
            <KV label="Source" value={p.source} mono />
            <KV label="Added" value={new Date(p.createdAt).toLocaleDateString()} />
            <KV label="Updated" value={new Date(p.updatedAt).toLocaleDateString()} />
          </div>
        </section>
      </div>

      {/* Score bar at bottom for emphasis */}
      {score != null && (
        <section className="surface px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="eyebrow">Trust score</div>
              <div className="mt-1 text-sm text-ink-500">
                Composite of on-chain activity, verified links, risk flags, and growth.
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="mono text-3xl font-semibold text-ink-700">{score}</div>
              <div className="h-2 w-32 overflow-hidden bg-ink-100">
                <div className="h-full bg-ink-700" style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCell({
  label,
  value,
  hint,
  border,
}: {
  label: string;
  value: string;
  hint?: string;
  border?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 ${border ? "border-t border-ink-200" : ""} [&:not(:first-child)]:border-l [&:not(:first-child)]:border-ink-200`}
    >
      <div className="eyebrow">{label}</div>
      <div className="mono mt-1 text-xl font-semibold text-ink-700">{value}</div>
      {hint && <div className="mt-0.5 text-2xs uppercase tracking-wider text-ink-400">{hint}</div>}
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="eyebrow">{label}</span>
      <span className={`text-sm text-ink-700 ${mono ? "mono" : ""}`}>{value}</span>
    </div>
  );
}
