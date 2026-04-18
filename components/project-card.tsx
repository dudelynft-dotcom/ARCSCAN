import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { displayScore } from "@/lib/scoring";
import { VerifiedBadge } from "./verified-badge";
import { ScoreBar } from "./score-bar";
import { formatNumber } from "@/lib/format";

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
  metrics?: { holders?: number | null } | null;
};

export function ProjectCard({ p }: { p: CardProject }) {
  const { score } = displayScore(p);
  const holders = (p.metrics as unknown as { holders?: number | null })?.holders ?? null;

  return (
    <Link
      href={`/project/${p.slug}`}
      className="surface surface-hover group flex flex-col gap-3 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold tracking-tight text-ink-700">{p.name}</h3>
            <VerifiedBadge verified={p.verified} flagged={p.flagged} />
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="tag">{categoryLabel(p.category)}</span>
            {p.riskLevel !== "UNKNOWN" && (
              <span className="mono text-2xs uppercase tracking-wider text-ink-400">
                {p.riskLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      {p.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-500">{p.description}</p>
      )}

      <div className="flex items-center justify-between border-t border-ink-100 pt-3">
        <ScoreBar score={score} />
        {holders != null && holders > 0 && (
          <div className="text-right">
            <div className="mono text-xs font-semibold text-ink-700">{formatNumber(holders)}</div>
            <div className="text-2xs uppercase tracking-wider text-ink-400">holders</div>
          </div>
        )}
      </div>
    </Link>
  );
}
