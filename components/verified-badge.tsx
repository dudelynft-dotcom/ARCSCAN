export function VerifiedBadge({ verified, flagged }: { verified?: boolean; flagged?: boolean }) {
  if (flagged) {
    return <span className="tag-outline border-ink-900 text-ink-900">Flagged</span>;
  }
  if (verified) {
    return <span className="tag-dark">Verified</span>;
  }
  return null;
}
