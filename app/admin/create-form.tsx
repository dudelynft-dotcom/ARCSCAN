"use client";

import { useActionState } from "react";
import { createProjectAction } from "./actions";
import { CATEGORIES } from "@/lib/categories";

type State = { error?: string; ok?: boolean; slug?: string } | null;

export function AdminCreateForm() {
  const [state, action, pending] = useActionState<State, FormData>(createProjectAction, null);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-2">
      <input name="name" placeholder="Project name" required className="input" />
      <select name="category" required defaultValue="" className="input">
        <option value="" disabled>
          Category…
        </option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <input name="website" placeholder="https://example.com (optional)" className="input" />
      <input name="twitter" placeholder="twitter handle (optional)" className="input" />
      <textarea
        name="description"
        placeholder="Short description (optional)"
        className="input sm:col-span-2"
        rows={2}
      />
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Adding…" : "Add project"}
        </button>
        {state?.error && <span className="text-sm text-arc-bad">{state.error}</span>}
        {state?.ok && <span className="text-sm text-arc-good">Added</span>}
      </div>
    </form>
  );
}
