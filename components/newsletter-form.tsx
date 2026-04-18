"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error);
        return;
      }
      setStatus("done");
      setMsg(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="you@domain.com"
          className="input flex-1"
          required
        />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {status === "done" && (
        <span className="mono text-2xs uppercase tracking-wider text-ink-700">{msg}</span>
      )}
      {status === "error" && (
        <span className="mono text-2xs uppercase tracking-wider text-ink-900">{msg}</span>
      )}
    </form>
  );
}
