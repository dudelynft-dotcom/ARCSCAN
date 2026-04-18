"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { useCallback, useEffect, useState, useTransition } from "react";

export function ExplorerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCat = params.get("category");
  const activeSort = params.get("sort") ?? "score";
  const activeVerified = params.get("verified") === "1";
  const activeFresh = params.get("fresh") === "1";
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      startTransition(() => router.push(`${pathname}?${next.toString()}`));
    },
    [params, pathname, router],
  );

  return (
    <div className="surface divide-y divide-ink-200">
      {/* Search + toggles */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            push({ q: q.trim() || null });
          }}
          className="flex flex-1 gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, contracts, categories..."
            className="input flex-1"
          />
          <button type="submit" className="btn">Search</button>
        </form>

        <div className="flex gap-1.5 text-sm">
          <button
            onClick={() => push({ verified: activeVerified ? null : "1" })}
            className={activeVerified ? "btn-primary h-9 px-3" : "btn"}
          >
            Verified
          </button>
          <button
            onClick={() => push({ fresh: activeFresh ? null : "1" })}
            className={activeFresh ? "btn-primary h-9 px-3" : "btn"}
          >
            Fresh · 7d
          </button>
        </div>
      </div>

      {/* Sort row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="eyebrow">Sort</span>
        {(["score", "holders", "new", "name"] as const).map((s) => (
          <button
            key={s}
            onClick={() => push({ sort: s === "score" ? null : s })}
            className={
              activeSort === s
                ? "text-xs font-semibold text-ink-700 underline underline-offset-4 decoration-ink-700 decoration-2"
                : "text-xs font-medium text-ink-400 hover:text-ink-700"
            }
          >
            {s === "score" ? "Top" : s === "new" ? "Newest" : s === "holders" ? "Holders" : "A-Z"}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
        <span className="eyebrow mr-1">Category</span>
        <Link
          href="/explorer"
          className={!activeCat ? "tag-dark" : "tag hover:border-ink-700"}
        >
          All
        </Link>
        {CATEGORIES.map((c) => {
          const isActive = activeCat === c.id;
          const next = new URLSearchParams(params.toString());
          if (isActive) next.delete("category");
          else next.set("category", c.id);
          return (
            <Link
              key={c.id}
              href={`/explorer?${next.toString()}`}
              className={isActive ? "tag-dark" : "tag hover:border-ink-700"}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
