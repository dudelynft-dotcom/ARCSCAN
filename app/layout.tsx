import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";
const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE || "Discover projects building on Arc";

export const metadata: Metadata = {
  title: {
    default: `${appName} — ${appTagline}`,
    template: `%s · ${appName}`,
  },
  description: appTagline,
  openGraph: {
    title: `${appName} — ${appTagline}`,
    description: `Track every project building on Arc blockchain. ${appName} auto-syncs from on-chain data.`,
    siteName: appName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — ${appTagline}`,
    description: `Track every project building on Arc blockchain. Auto-synced from on-chain data.`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-arc-bg text-white antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-xs text-arc-muted">
          <div className="border-t border-arc-border pt-6">
            {appName} is an independent explorer. Data is community-curated and partner lists
            sourced from Circle&apos;s public Arc testnet announcement. Not affiliated with Circle or Arc.
          </div>
        </footer>
      </body>
    </html>
  );
}
