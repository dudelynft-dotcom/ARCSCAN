import Link from "next/link";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-ink-0/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center border border-ink-700 bg-ink-700 text-[11px] font-bold text-ink-0">
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tighter text-ink-700">
            {appName}
          </span>
          <span className="mono text-2xs uppercase text-ink-400 border-l border-ink-200 pl-3">
            testnet · 5042002
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link href="/explorer" className="px-3 py-1.5 text-ink-500 hover:text-ink-700 transition-colors">
            Explorer
          </Link>
          <Link href="/stats" className="px-3 py-1.5 text-ink-500 hover:text-ink-700 transition-colors">
            Network
          </Link>
          <Link href="/compare" className="hidden px-3 py-1.5 text-ink-500 hover:text-ink-700 transition-colors sm:inline">
            Compare
          </Link>
          <Link href="/watchlist" className="hidden px-3 py-1.5 text-ink-500 hover:text-ink-700 transition-colors sm:inline">
            Watchlist
          </Link>
          <Link href="/submit" className="btn-primary ml-2">
            Submit project
          </Link>
        </nav>
      </div>
    </header>
  );
}
