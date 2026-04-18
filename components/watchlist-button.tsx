"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "arcradar_watchlist";

function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setWatchlist(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

export function WatchlistButton({ slug }: { slug: string }) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(getWatchlist().includes(slug));
  }, [slug]);

  function toggle() {
    const list = getWatchlist();
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    setWatchlist(next);
    setWatched(next.includes(slug));
  }

  return (
    <button
      onClick={toggle}
      className={cn("btn text-xs gap-1", watched && "border-arc-accent text-arc-accent")}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star className={cn("h-3.5 w-3.5", watched && "fill-arc-accent")} />
      {watched ? "Watching" : "Watch"}
    </button>
  );
}

export function useWatchlist() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getWatchlist());
    const handler = () => setSlugs(getWatchlist());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return slugs;
}
