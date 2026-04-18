"use client";

import { useEffect, useState } from "react";

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
      className={watched ? "btn-primary h-9 px-3" : "btn"}
    >
      {watched ? "Watching" : "Add to watchlist"}
    </button>
  );
}
