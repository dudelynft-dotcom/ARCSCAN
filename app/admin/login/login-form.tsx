"use client";

import { useActionState } from "react";
import { signInAction } from "../actions";

type State = { error?: string } | null;

export function LoginForm() {
  const [state, action, pending] = useActionState<State, FormData>(signInAction, null);
  return (
    <form action={action} className="space-y-3">
      <input
        type="password"
        name="password"
        placeholder="Admin password"
        className="input"
        autoFocus
        required
      />
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state?.error && <p className="text-sm text-arc-bad">{state.error}</p>}
    </form>
  );
}
