"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";

const LINKS = [
  { href: "/explorer", label: "Explorer" },
  { href: "/transactions", label: "Transactions" },
  { href: "/wallets", label: "Wallets" },
  { href: "/stats", label: "Network" },
  { href: "/compare", label: "Compare" },
  { href: "/watchlist", label: "Watchlist" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-ink-0/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-ink-700 bg-ink-700 text-[11px] font-bold text-ink-0">
              A
            </span>
            <span className="text-[15px] font-semibold tracking-tighter text-ink-700">
              {appName}
            </span>
            <span className="mono text-2xs uppercase text-ink-400 border-l border-ink-200 pl-2 sm:pl-3 hidden sm:inline">
              testnet · 5042002
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 text-sm lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  pathname === l.href
                    ? "text-ink-700 font-medium"
                    : "text-ink-500 hover:text-ink-700",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/submit" className="btn-primary ml-2">
              Submit project
            </Link>
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile / tablet right cluster */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center border border-ink-200 bg-ink-0 text-ink-700 hover:border-ink-700"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 top-14 z-20 bg-ink-0 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <nav
            className="flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center justify-between border-b border-ink-200 px-6 py-4 text-base transition-colors",
                  pathname === l.href
                    ? "bg-ink-50 font-semibold text-ink-700"
                    : "text-ink-700 hover:bg-ink-50",
                )}
              >
                {l.label}
                <span className="mono text-2xs uppercase tracking-wider text-ink-400">
                  →
                </span>
              </Link>
            ))}

            <div className="p-6">
              <Link href="/submit" className="btn-primary w-full">
                Submit project
              </Link>
            </div>

            <div className="mt-auto border-t border-ink-200 px-6 py-4">
              <div className="mono text-2xs uppercase tracking-wider text-ink-400">
                Arc testnet · Chain ID 5042002
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
