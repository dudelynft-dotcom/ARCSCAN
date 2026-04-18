import Link from "next/link";
import { Radar } from "lucide-react";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-arc-border bg-arc-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Radar className="h-5 w-5 text-arc-accent" aria-hidden />
          <span>{appName}</span>
          <span className="pill ml-2">Arc testnet</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/explorer" className="btn">
            Explorer
          </Link>
          <Link href="/stats" className="btn">
            Stats
          </Link>
          <Link href="/compare" className="btn hidden sm:inline-flex">
            Compare
          </Link>
          <Link href="/watchlist" className="btn hidden sm:inline-flex">
            Watchlist
          </Link>
          <Link href="/submit" className="btn-primary">
            Submit
          </Link>
        </nav>
      </div>
    </header>
  );
}
