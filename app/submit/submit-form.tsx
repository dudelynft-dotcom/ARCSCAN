"use client";

import { useActionState } from "react";
import { submitProjectAction } from "./actions";
import { CATEGORIES } from "@/lib/categories";

type State = { error?: string; ok?: boolean } | null;

export function SubmitForm() {
  const [state, action, pending] = useActionState<State, FormData>(submitProjectAction, null);

  if (state?.ok) {
    return (
      <div className="surface p-10 text-center">
        <div className="eyebrow">Submitted</div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-700">
          Thank you
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          Your submission is queued for review. Approved projects appear on the explorer
          within 24 hours.
        </p>
        <a href="/explorer" className="btn mt-5 inline-flex">
          Back to explorer
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="surface divide-y divide-ink-200">
      <Section title="Identity">
        <Grid>
          <Field label="Project name *">
            <input name="name" required className="input" placeholder="e.g. Synthra" />
          </Field>
          <Field label="Category *">
            <select name="category" required defaultValue="" className="input">
              <option value="" disabled>Select</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </Grid>
        <Field label="Description" full>
          <textarea
            name="description"
            rows={3}
            className="input"
            placeholder="What does your project do on Arc? (max 2000 chars)"
          />
        </Field>
      </Section>

      <Section title="On-chain">
        <Field label="Contract address">
          <input
            name="contractAddress"
            className="input mono text-xs"
            placeholder="0x..."
          />
        </Field>
      </Section>

      <Section title="Links">
        <Grid>
          <Field label="Website">
            <input name="website" className="input" placeholder="https://..." />
          </Field>
          <Field label="Twitter handle">
            <input name="twitter" className="input" placeholder="handle (no @)" />
          </Field>
        </Grid>
        <Field label="Telegram">
          <input name="telegram" className="input" placeholder="https://t.me/..." />
        </Field>
      </Section>

      <Section title="Submitter">
        <Grid>
          <Field label="Your email">
            <input
              name="submitterEmail"
              type="email"
              className="input"
              placeholder="you@domain.com"
            />
          </Field>
          <Field label="Note to reviewer">
            <input
              name="submitterNote"
              className="input"
              placeholder="Anything we should know?"
            />
          </Field>
        </Grid>
      </Section>

      <div className="flex items-center gap-4 p-5">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Submitting..." : "Submit for review"}
        </button>
        {state?.error && (
          <span className="mono text-2xs uppercase tracking-wider text-ink-900">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5">
      <div className="eyebrow mb-4">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="eyebrow">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
