import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { displayScore, riskColor } from "@/lib/scoring";
import { VerifiedBadge } from "./verified-badge";
import { ScoreBar } from "./score-bar";
import { timeAgo } from "@/lib/format";

type CardProject = {
  slug: string;
  name: string;
  description: string | null;
  category: string;
  verified: boolean;
  flagged: boolean;
  riskLevel: string;
  scoreOverride: number | null;
  scoreComputed: number | null;
  createdAt: Date | string;
};

export function ProjectCard({ p }: { p: CardProject }) {
  const { score } = displayScore(p);
  return (
    <Link
      href={`/project/${p.slug}`}
      className="panel group flex flex-col gap-3 p-4 transition-colors hover:border-arc-accent/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{p.name}</h3>
            <VerifiedBadge verified={p.verified} flagged={p.flagged} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-arc-muted">
            <span className="pill">{categoryLabel(p.category)}</span>
            <span>added {timeAgo(p.createdAt)}</span>
          </div>
        </div>
        <div className={riskColor(p.riskLevel)} title={`Risk: ${p.riskLevel}`}>
          <span className="font-mono text-[10px]">{p.riskLevel}</span>
        </div>
      </div>
      {p.description && (
        <p className="line-clamp-2 text-sm text-arc-muted">{p.description}</p>
      )}
      <div className="mt-auto">
        <ScoreBar score={score} />
      </div>
    </Link>
  );
}
