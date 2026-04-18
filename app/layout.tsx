import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";
const appTagline =
  process.env.NEXT_PUBLIC_APP_TAGLINE || "Discovery infrastructure for Arc blockchain";

export const metadata: Metadata = {
  title: {
    default: `${appName} — ${appTagline}`,
    template: `%s · ${appName}`,
  },
  description: appTagline,
  openGraph: {
    title: `${appName} — ${appTagline}`,
    description:
      "Every project on Arc blockchain, tracked and indexed in real time. Auto-synced from on-chain data.",
    siteName: appName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — ${appTagline}`,
    description:
      "Every project on Arc blockchain, tracked and indexed in real time.",
  },
};

const themeScript = `
  try {
    var t = localStorage.getItem('arcradar_theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-ink-0 text-ink-700 antialiased">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8">{children}</main>
        <footer className="border-t border-ink-200">
          <div className="mx-auto max-w-7xl px-4 py-8 text-2xs uppercase tracking-wider text-ink-400 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                {appName} · Arc blockchain explorer · Not affiliated with Circle or Arc
              </div>
              <div className="flex gap-4">
                <a href="/api/v1/projects" className="hover:text-ink-700">API</a>
                <a href="/submit" className="hover:text-ink-700">Submit</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
