import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { CandidateRow } from "./candidate-row";
import { ScanButton } from "./scan-button";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const candidates = await prisma.discoveryCandidate.findMany({
    where: { processed: false },
    orderBy: { detectedAt: "desc" },
    take: 200,
  });

  const processed = await prisma.discoveryCandidate.count({ where: { processed: true } });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discovery candidates</h1>
          <p className="text-sm text-arc-muted">
            {candidates.length} pending / {processed} processed
          </p>
          <p className="mt-1 text-xs text-arc-muted">
            Auto-discovered from Blockscout verified contracts and the Arc ecosystem page.
            Promote valid ones to make them visible on the public site, or dismiss junk.
          </p>
        </div>
        <div className="flex gap-2">
          <ScanButton />
          <a href="/admin" className="btn">
            Back to Projects
          </a>
        </div>
      </header>

      {candidates.length === 0 ? (
        <div className="panel p-8 text-center text-arc-muted">
          No pending candidates. Hit &quot;Scan now&quot; to pull from Blockscout and Arc ecosystem page.
        </div>
      ) : (
        <div className="space-y-2">
          {candidates.map((c) => (
            <CandidateRow key={c.id} candidate={c} />
          ))}
        </div>
      )}
    </div>
  );
}
