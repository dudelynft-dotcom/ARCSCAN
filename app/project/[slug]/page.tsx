import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import { displayScore, riskColor } from "@/lib/scoring";
import { formatNumber, formatUsd, shortAddr, timeAgo } from "@/lib/format";
import { VerifiedBadge } from "@/components/verified-badge";
import { ScoreBar } from "@/components/score-bar";
import { ExternalLink, Globe, Twitter, Send, Github, FileText, Copy } from "lucide-react";
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
    openGraph: {
      title,
      description: desc,
      siteName: appName,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: desc,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.project.findUnique({
    where: { slug },
    include: { metrics: true, socials: true },
  });
  if (!p) notFound();

  const { score, source } = displayScore(p);
  const explorer = process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app";

  const links = [
    { icon: Globe, href: p.socials?.website, label: "Website" },
    { icon: Twitter, href: p.socials?.twitter ? `https://x.com/${p.socials.twitter}` : null, label: "Twitter" },
    { icon: Send, href: p.socials?.telegram, label: "Telegram" },
    { icon: Github, href: p.socials?.github, label: "GitHub" },
    { icon: FileText, href: p.socials?.docs, label: "Docs" },
  ].filter((l) => l.href);

  return (
    <div className="space-y-8 pt-2">
      <div>
        <Link href="/explorer" className="text-sm text-arc-muted hover:text-white">
          ← All projects
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{p.name}</h1>
            <VerifiedBadge verified={p.verified} flagged={p.flagged} />
            <WatchlistButton slug={p.slug} />
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-arc-muted">
            <a href={`/category/${p.category}`} className="pill hover:border-arc-accent">{categoryLabel(p.category)}</a>
            <span>added {timeAgo(p.createdAt)}</span>
            {p.metrics?.holders && (
              <span className="pill">{p.metrics.holders.toLocaleString()} holders</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-arc-muted">Score</div>
          <div className="mt-1 flex items-center justify-end gap-2">
            <ScoreBar score={score} />
            {source === "override" && (
              <span className="pill" title="Admin override">admin</span>
            )}
          </div>
          <div className={`mt-1 text-xs ${riskColor(p.riskLevel)}`}>Risk: {p.riskLevel}</div>
        </div>
      </header>

      {p.description && (
        <section className="panel p-5 text-sm leading-relaxed text-arc-muted">
          {p.description}
        </section>
      )}

      {p.flagged && p.flagReason && (
        <section className="panel border-arc-bad/60 bg-arc-bad/10 p-4 text-sm text-arc-bad">
          <strong>Flagged:</strong> {p.flagReason}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-arc-muted">
            On-chain metrics
          </h2>
          {!p.metrics ? (
            <p className="text-sm text-arc-muted">
              No on-chain data yet. Metrics will appear once the project deploys and activity
              is detected by the scanner.
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Stat label="Liquidity" value={formatUsd(p.metrics.liquidity)} />
              <Stat label="TVL" value={formatUsd(p.metrics.tvl)} />
              <Stat label="Volume (24h)" value={formatUsd(p.metrics.volume24h)} />
              <Stat label="Volume (7d)" value={formatUsd(p.metrics.volume7d)} />
              <Stat label="Holders" value={formatNumber(p.metrics.holders)} />
              <Stat label="Transactions" value={formatNumber(p.metrics.txCount)} />
              <Stat label="Unique users" value={formatNumber(p.metrics.uniqueUsers)} />
              <Stat
                label="7d growth"
                value={p.metrics.growthRate == null ? "—" : `${(p.metrics.growthRate * 100).toFixed(1)}%`}
              />
            </dl>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-arc-muted">
            Links
          </h2>
          {links.length === 0 ? (
            <p className="text-sm text-arc-muted">No links on file yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {links.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href!}
                    target="_blank"
                    rel="noreferrer"
                    className="link inline-flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {p.contractAddress && (
            <div className="mt-5 border-t border-arc-border pt-4">
              <div className="text-xs uppercase tracking-wide text-arc-muted">Contract</div>
              <div className="mt-1 flex items-center gap-2 font-mono text-sm">
                <span>{shortAddr(p.contractAddress)}</span>
                <a
                  href={`${explorer}/address/${p.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link inline-flex items-center gap-1"
                  title="Open in Arc explorer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Copy className="h-3 w-3 text-arc-muted" aria-hidden />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-arc-muted">{label}</dt>
      <dd className="mt-0.5 font-mono tabular-nums">{value}</dd>
    </div>
  );
}
