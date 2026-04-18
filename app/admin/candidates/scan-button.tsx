"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function triggerScan() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scanner/tick", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Error: ${data.error ?? res.status}`);
      } else {
        const tokens = data.results?.tokens;
        const bs = data.results?.blockscout;
        const eco = data.results?.ecosystem;
        const parts: string[] = [];
        if (tokens?.ok) parts.push(`${tokens.added} projects added from tokens`);
        if (bs?.ok) parts.push(`${bs.inserted} contract candidates`);
        if (eco?.ok) parts.push(`${eco.newCandidates} ecosystem candidates`);
        if (parts.length === 0) parts.push("no new projects found");
        setResult(parts.join(" / "));
      }
    } catch (e) {
      setResult(`Error: ${String(e)}`);
    } finally {
      setLoading(false);
      // Reload page to show new candidates
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={triggerScan} disabled={loading} className="btn-primary">
        <RefreshCw className={`mr-1 inline h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Scanning…" : "Scan now"}
      </button>
      {result && <span className="text-xs text-arc-muted">{result}</span>}
    </div>
  );
}
