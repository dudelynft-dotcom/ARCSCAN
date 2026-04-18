"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function EnrichButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/enrich", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Error: ${data.error ?? res.status}`);
      } else {
        setResult(
          `${data.enriched} enriched, ${data.remaining} remaining`,
        );
      }
    } catch (e) {
      setResult(`Error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={run} disabled={loading} className="btn">
        <Search className={`mr-1 inline h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
        {loading ? "Enriching..." : "Enrich links"}
      </button>
      {result && <span className="text-xs text-arc-muted">{result}</span>}
    </div>
  );
}
