"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { VerifiedBadge } from "@/components/verified-badge";
import { updateProjectAction, deleteProjectAction } from "./actions";
import { ChevronDown, ChevronRight, ExternalLink, Trash2 } from "lucide-react";

type Project = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  tags: string[];
  contractAddress: string | null;
  verified: boolean;
  flagged: boolean;
  flagReason: string | null;
  scoreOverride: number | null;
  scoreComputed: number | null;
  riskLevel: string;
  socials: {
    website: string | null;
    twitter: string | null;
    telegram: string | null;
    discord: string | null;
    github: string | null;
    docs: string | null;
  } | null;
};

type UpdateState = { error?: string; ok?: boolean } | null;

export function AdminProjectRow({
  project,
  quickToggle,
}: {
  project: Project;
  quickToggle: (fd: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<UpdateState, FormData>(updateProjectAction, null);

  return (
    <div className="panel">
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-arc-muted hover:text-white"
          aria-label="Expand"
          type="button"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{project.name}</span>
            <VerifiedBadge verified={project.verified} flagged={project.flagged} />
            <Link
              href={`/project/${project.slug}`}
              className="text-arc-muted hover:text-white"
              target="_blank"
              aria-label="Open public page"
            >
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-arc-muted">
            <span>{categoryLabel(project.category)}</span>
            <span>·</span>
            <span>
              score: {project.scoreOverride ?? project.scoreComputed ?? "—"}
            </span>
            <span>·</span>
            <span>risk: {project.riskLevel}</span>
          </div>
        </div>

        {project.verified ? (
          <form action={quickToggle}>
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="field" value="verified" />
            <button type="submit" className="btn text-xs">Unverify</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-primary text-xs"
          >
            Verify + Edit
          </button>
        )}
        <form action={quickToggle}>
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="field" value="flagged" />
          <button
            type="submit"
            className={`btn text-xs ${project.flagged ? "border-arc-bad text-arc-bad" : ""}`}
          >
            {project.flagged ? "Unflag" : "Flag"}
          </button>
        </form>
      </div>

      {open && (
        <form action={action} className="space-y-3 border-t border-arc-border p-4">
          <input type="hidden" name="id" value={project.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input name="name" defaultValue={project.name} className="input" required />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={project.category} className="input">
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags (comma separated, e.g. dex,lending)" full>
              <input
                name="tags"
                defaultValue={(project.tags ?? []).join(",")}
                className="input"
                placeholder="e.g. dex,lending (optional — adds secondary categories)"
              />
            </Field>
            <Field label="Description" full>
              <textarea
                name="description"
                defaultValue={project.description ?? ""}
                className="input"
                rows={2}
              />
            </Field>
            <Field label="Contract address (0x…)">
              <input
                name="contractAddress"
                defaultValue={project.contractAddress ?? ""}
                className="input font-mono text-xs"
                placeholder="0x…"
              />
            </Field>
            <Field label="Website">
              <input
                name="website"
                defaultValue={project.socials?.website ?? ""}
                className="input"
                placeholder="https://…"
              />
            </Field>
            <Field label="Twitter handle">
              <input
                name="twitter"
                defaultValue={project.socials?.twitter ?? ""}
                className="input"
                placeholder="handle (no @)"
              />
            </Field>
            <Field label="Telegram">
              <input
                name="telegram"
                defaultValue={project.socials?.telegram ?? ""}
                className="input"
                placeholder="https://t.me/…"
              />
            </Field>
            <Field label="Discord">
              <input
                name="discord"
                defaultValue={project.socials?.discord ?? ""}
                className="input"
                placeholder="https://discord.gg/…"
              />
            </Field>
            <Field label="GitHub">
              <input
                name="github"
                defaultValue={project.socials?.github ?? ""}
                className="input"
                placeholder="https://github.com/…"
              />
            </Field>
            <Field label="Docs">
              <input
                name="docs"
                defaultValue={project.socials?.docs ?? ""}
                className="input"
                placeholder="https://docs.…"
              />
            </Field>
            <Field label="Score override (0-100)">
              <input
                name="scoreOverride"
                defaultValue={project.scoreOverride ?? ""}
                className="input"
                type="number"
                min={0}
                max={100}
                placeholder="blank = auto"
              />
            </Field>
            <Field label="Risk level">
              <select name="riskLevel" defaultValue={project.riskLevel} className="input">
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="SAFE">SAFE</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </Field>
            <Field label="Flag reason (if flagged)" full>
              <input
                name="flagReason"
                defaultValue={project.flagReason ?? ""}
                className="input"
                placeholder="e.g. reported scam, impersonator, liquidity pulled"
              />
            </Field>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="verified" defaultChecked={project.verified} />
              Verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="flagged" defaultChecked={project.flagged} />
              Flagged
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            <DeleteButton id={project.id} />
            {state?.error && <span className="text-sm text-arc-bad">{state.error}</span>}
            {state?.ok && <span className="text-sm text-arc-good">Saved</span>}
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-xs ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-arc-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteProjectAction}
      onSubmit={(e) => {
        if (!confirm("Delete this project? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="btn border-arc-bad/50 text-arc-bad hover:bg-arc-bad/10"
      >
        <Trash2 className="mr-1 inline h-3 w-3" />
        Delete
      </button>
    </form>
  );
}
