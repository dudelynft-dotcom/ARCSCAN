"use client";

import { useActionState, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { promoteCandidateAction, dismissCandidateAction } from "./actions";
import { ChevronDown, ChevronRight, Rocket, X } from "lucide-react";

type Candidate = {
  id: string;
  contractAddress: string;
  source: string;
  detectedAt: Date | string;
  tokenName: string | null;
  symbol: string | null;
  decimals: number | null;
  blockNumber: number | null;
  notes: string | null;
};

type PromoteState = { error?: string; ok?: boolean; slug?: string } | null;

export function CandidateRow({ candidate: c }: { candidate: Candidate }) {
  const [open, setOpen] = useState(false);
  const [state, promoteAction, pending] = useActionState<PromoteState, FormData>(
    promoteCandidateAction,
    null,
  );
  const isEcosystem = c.contractAddress.startsWith("ecosystem:");
  const displayAddr = isEcosystem ? "(no contract)" : `${c.contractAddress.slice(0, 10)}…`;
  const detectedAt =
    typeof c.detectedAt === "string" ? new Date(c.detectedAt) : c.detectedAt;

  return (
    <div className="panel">
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-arc-muted hover:text-white"
          type="button"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {c.tokenName || c.symbol || "Unknown"}
            </span>
            {c.symbol && c.tokenName && (
              <span className="pill">{c.symbol}</span>
            )}
            <span className="pill">{c.source}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-arc-muted">
            <span className="font-mono">{displayAddr}</span>
            <span>·</span>
            <span>{detectedAt.toLocaleDateString()}</span>
            {c.blockNumber && (
              <>
                <span>·</span>
                <span>block {c.blockNumber}</span>
              </>
            )}
          </div>
        </div>

        <form action={dismissCandidateAction}>
          <input type="hidden" name="candidateId" value={c.id} />
          <button type="submit" className="btn text-xs" title="Dismiss">
            <X className="mr-1 inline h-3 w-3" /> Skip
          </button>
        </form>
      </div>

      {open && (
        <form action={promoteAction} className="space-y-3 border-t border-arc-border p-4">
          <input type="hidden" name="candidateId" value={c.id} />
          <h3 className="text-sm font-semibold text-arc-accent">
            <Rocket className="mr-1 inline h-4 w-4" /> Promote to project
          </h3>

          {c.notes && (
            <p className="text-xs text-arc-muted">{c.notes}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs">
              <span className="text-arc-muted">Project name</span>
              <input
                name="name"
                defaultValue={c.tokenName || c.symbol || ""}
                className="input mt-1"
                required
              />
            </label>
            <label className="block text-xs">
              <span className="text-arc-muted">Category</span>
              <select name="category" defaultValue="infra" className="input mt-1" required>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="text-arc-muted">Description (optional)</span>
              <textarea
                name="description"
                className="input mt-1"
                rows={2}
                placeholder="What does this project do?"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Promoting…" : "Promote to project"}
            </button>
            {state?.error && <span className="text-sm text-arc-bad">{state.error}</span>}
            {state?.ok && (
              <span className="text-sm text-arc-good">
                Promoted! → <a href={`/project/${state.slug}`} className="link">view</a>
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
