import { BadgeCheck, ShieldAlert } from "lucide-react";

export function VerifiedBadge({ verified, flagged }: { verified?: boolean; flagged?: boolean }) {
  if (flagged) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-arc-bad/15 px-2 py-0.5 text-xs font-medium text-arc-bad">
        <ShieldAlert className="h-3 w-3" /> Flagged
      </span>
    );
  }
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-arc-accent/15 px-2 py-0.5 text-xs font-medium text-arc-accent">
        <BadgeCheck className="h-3 w-3" /> Verified
      </span>
    );
  }
  return null;
}
