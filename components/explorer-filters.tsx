"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/cn";
import { useCallback, useEffect, useState, useTransition } from "react";

export function ExplorerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

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
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: q.trim() || null });
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, categories, descriptions…"
          className="input"
        />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={pending}>
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => push({ verified: activeVerified ? null : "1" })}
          className={cn("btn", activeVerified && "border-arc-accent text-arc-accent")}
        >
          Verified
        </button>
        <button
          onClick={() => push({ fresh: activeFresh ? null : "1" })}
          className={cn("btn", activeFresh && "border-arc-accent text-arc-accent")}
        >
          Fresh (7d)
        </button>
        <div className="ml-auto flex gap-1">
          {(["score", "new", "name"] as const).map((s) => (
            <button
              key={s}
              onClick={() => push({ sort: s === "score" ? null : s })}
              className={cn("btn", activeSort === s && "border-arc-accent text-arc-accent")}
            >
              {s === "score" ? "Top" : s === "new" ? "Newest" : "A-Z"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-sm">
        <Link
          href="/explorer"
          className={cn("btn", !activeCat && "border-arc-accent text-arc-accent")}
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
              className={cn("btn", isActive && "border-arc-accent text-arc-accent")}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
