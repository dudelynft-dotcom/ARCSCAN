"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
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
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your watchlist</h1>
        <p className="mt-1 text-sm text-arc-muted">
          Projects you bookmarked. Stored locally in your browser.
        </p>
      </div>

      {loading ? (
        <div className="panel p-8 text-center text-arc-muted">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="panel p-8 text-center">
          <Star className="mx-auto h-8 w-8 text-arc-muted" />
          <h2 className="mt-3 font-semibold">No projects watched yet</h2>
          <p className="mt-1 text-sm text-arc-muted">
            Click the &quot;Watch&quot; button on any project page to add it here.
          </p>
          <Link href="/explorer" className="btn-primary mt-4 inline-block">
            Browse projects
          </Link>
        </div>
      ) : (
        <div className="panel divide-y divide-arc-border">
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/project/${p.slug}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-arc-border/30"
            >
              <Star className="h-4 w-4 fill-arc-accent text-arc-accent shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-arc-muted">{p.category}</div>
              </div>
              {p.verified && (
                <span className="text-xs text-arc-accent">Verified</span>
              )}
              {p.metrics?.holders && (
                <span className="font-mono text-xs text-arc-muted tabular-nums">
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
