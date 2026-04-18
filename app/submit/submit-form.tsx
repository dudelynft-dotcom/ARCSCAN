"use client";

import { useActionState } from "react";
import { submitProjectAction } from "./actions";
import { CATEGORIES } from "@/lib/categories";

type State = { error?: string; ok?: boolean } | null;

export function SubmitForm() {
  const [state, action, pending] = useActionState<State, FormData>(submitProjectAction, null);

  if (state?.ok) {
    return (
      <div className="panel p-8 text-center">
        <h2 className="text-lg font-semibold">Submission received</h2>
        <p className="mt-2 text-sm text-arc-muted">
          Your project has been submitted for review. It will appear on the
          explorer once approved by our team.
        </p>
        <a href="/explorer" className="btn-primary mt-4 inline-block">
          Back to explorer
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="panel space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-arc-muted">Project name *</span>
          <input name="name" required className="input mt-1" placeholder="e.g. Synthra" />
        </label>
        <label className="block text-sm">
          <span className="text-arc-muted">Category *</span>
          <select name="category" required defaultValue="" className="input mt-1">
            <option value="" disabled>Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-arc-muted">Description</span>
        <textarea
          name="description"
          rows={3}
          className="input mt-1"
          placeholder="What does your project do on Arc?"
        />
      </label>

      <label className="block text-sm">
        <span className="text-arc-muted">Contract address</span>
        <input
          name="contractAddress"
          className="input mt-1 font-mono text-xs"
          placeholder="0x..."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-arc-muted">Website</span>
          <input name="website" className="input mt-1" placeholder="https://..." />
        </label>
        <label className="block text-sm">
          <span className="text-arc-muted">Twitter handle</span>
          <input name="twitter" className="input mt-1" placeholder="handle (no @)" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-arc-muted">Telegram</span>
        <input name="telegram" className="input mt-1" placeholder="https://t.me/..." />
      </label>

      <div className="border-t border-arc-border pt-4">
        <p className="mb-3 text-xs text-arc-muted">
          Optional: leave your email so we can notify you when approved.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-arc-muted">Your email</span>
            <input name="submitterEmail" type="email" className="input mt-1" placeholder="you@example.com" />
          </label>
          <label className="block text-sm">
            <span className="text-arc-muted">Note to reviewer</span>
            <input name="submitterNote" className="input mt-1" placeholder="Anything we should know?" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Submitting..." : "Submit project"}
        </button>
        {state?.error && <span className="text-sm text-arc-bad">{state.error}</span>}
      </div>
    </form>
  );
}
