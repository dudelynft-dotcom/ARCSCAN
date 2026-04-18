export function ScoreBar({ score }: { score: number | null }) {
  if (score == null) {
    return <span className="mono text-2xs uppercase tracking-wider text-ink-400">unrated</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden bg-ink-100">
        <div className="h-full bg-ink-700" style={{ width: `${score}%` }} />
      </div>
      <span className="mono text-xs font-semibold text-ink-700">{score}</span>
    </div>
  );
}
