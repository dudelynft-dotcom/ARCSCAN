import { cn } from "@/lib/cn";

export function ScoreBar({ score }: { score: number | null }) {
  if (score == null) {
    return <span className="text-xs text-arc-muted">unrated</span>;
  }
  const colorClass =
    score >= 75 ? "bg-arc-good" : score >= 50 ? "bg-arc-accent" : score >= 25 ? "bg-arc-warn" : "bg-arc-bad";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-arc-border">
        <div className={cn("h-full", colorClass)} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums">{score}</span>
    </div>
  );
}
