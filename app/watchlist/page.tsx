"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "arcradar_watchlist";

interface WatchedProject {
  slug: string;
  name: string;
  category: string;
  verified: boolean;
  description: string | null;
  metrics: { holders: number | null } | null;
}

export default function WatchlistPage() {
  const [projects, setProjects] = useState<WatchedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/v1/projects?limit=200`)
      .then((r) => r.json())
      .then((data) => {
        const all = data.data as WatchedProject[];
        setProjects(all.filter((p) => slugs.includes(p.slug)));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Personal</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-700">Watchlist</h1>
        <p className="mt-1 text-sm text-ink-500">
          Projects you bookmarked. Stored locally in your browser · no account needed.
        </p>
      </div>

      {loading ? (
        <div className="surface p-10 text-center text-sm text-ink-500">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="surface p-10 text-center">
          <div className="eyebrow">Empty</div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-700">
            No projects watched yet
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Click &quot;Add to watchlist&quot; on any project page to save it here.
          </p>
          <Link href="/explorer" className="btn-primary mt-5 inline-flex">
            Browse projects
          </Link>
        </div>
      ) : (
        <div className="surface divide-y divide-ink-200">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/project/${p.slug}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-ink-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink-700">{p.name}</span>
                  {p.verified && <span className="tag-dark">Verified</span>}
                </div>
                <div className="mt-0.5 text-2xs uppercase tracking-wider text-ink-400">
                  {p.category}
                </div>
              </div>
              {p.metrics?.holders && (
                <span className="mono text-xs text-ink-500">
                  {p.metrics.holders.toLocaleString()} holders
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
