"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

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
      if (!res.ok) { setStatus("error"); setMsg(data.error); return; }
      setStatus("done");
      setMsg(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-arc-muted" />
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="your@email.com"
          className="input pl-9"
          required
        />
      </div>
      <button type="submit" className="btn-primary whitespace-nowrap" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "done" && <span className="self-center text-xs text-arc-good">{msg}</span>}
      {status === "error" && <span className="self-center text-xs text-arc-bad">{msg}</span>}
    </form>
  );
}
