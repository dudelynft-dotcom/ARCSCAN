import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { categoryLabel } from "@/lib/categories";
import { approveSubmissionAction, rejectSubmissionAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const [pending, reviewed] = await Promise.all([
    prisma.submission.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.findMany({
      where: { status: { not: "pending" } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-sm text-arc-muted">
            {pending.length} pending / {reviewed.length} reviewed
          </p>
        </div>
        <a href="/admin" className="btn">Back to Projects</a>
      </header>

      {pending.length === 0 ? (
        <div className="panel p-8 text-center text-arc-muted">No pending submissions.</div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-arc-muted">
            Pending review
          </h2>
          {pending.map((s) => (
            <div key={s.id} className="panel p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-arc-muted">
                    <span className="pill">{categoryLabel(s.category)}</span>
                    {s.contractAddress && (
                      <span className="font-mono">{s.contractAddress.slice(0, 10)}...</span>
                    )}
                    {s.website && (
                      <a href={s.website} target="_blank" rel="noreferrer" className="link">
                        {new URL(s.website).hostname}
                      </a>
                    )}
                    {s.twitter && <span>@{s.twitter}</span>}
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  {s.description && (
                    <p className="mt-2 text-sm text-arc-muted">{s.description}</p>
                  )}
                  {s.submitterNote && (
                    <p className="mt-1 text-xs text-arc-muted italic">
                      Note: {s.submitterNote}
                    </p>
                  )}
                  {s.submitterEmail && (
                    <p className="mt-1 text-xs text-arc-muted">
                      From: {s.submitterEmail}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveSubmissionAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="btn-primary text-xs">
                      Approve
                    </button>
                  </form>
                  <form action={rejectSubmissionAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="btn border-arc-bad/50 text-arc-bad text-xs">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-arc-muted">
            Recently reviewed
          </h2>
          {reviewed.map((s) => (
            <div key={s.id} className="panel flex items-center justify-between p-3 text-sm">
              <span>{s.name}</span>
              <span className={s.status === "approved" ? "text-arc-good" : "text-arc-bad"}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
