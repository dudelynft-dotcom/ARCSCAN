/**
 * Enhanced link enricher — given a project name (and optional website),
 * finds and returns its official website, twitter, telegram, discord, docs.
 *
 * Strategy:
 *   1. If we have a website, scrape its HTML for og: / twitter: meta tags
 *      and extract social links from footer/navigation.
 *   2. If no website, use DuckDuckGo HTML search for "<name> official site arc"
 *      and extract the first reasonable-looking URL.
 *   3. Validate extracted links against common patterns.
 */

export interface EnrichedLinks {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  docs?: string;
}

const TWITTER_HOSTS = ["x.com", "twitter.com"];
const TELEGRAM_HOSTS = ["t.me", "telegram.me"];
const DISCORD_HOSTS = ["discord.gg", "discord.com"];
const GITHUB_HOSTS = ["github.com"];

function extractHandle(url: string, hosts: string[]): string | null {
  try {
    const u = new URL(url);
    if (!hosts.some((h) => u.hostname.endsWith(h))) return null;
    const path = u.pathname.replace(/^\/+/, "").split(/[/?#]/)[0];
    if (!path || path === "intent" || path === "share") return null;
    return path;
  } catch {
    return null;
  }
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Scrape a website's HTML for socials and meta tags.
 */
export async function scrapeWebsiteSocials(websiteUrl: string): Promise<EnrichedLinks> {
  const out: EnrichedLinks = {};

  let html = "";
  try {
    const res = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (ArcRadar-Enricher)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return out;
    html = await res.text();
  } catch {
    return out;
  }

  out.website = websiteUrl;

  // Meta tags
  const metaMatches = [...html.matchAll(/<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["']/gi)];
  for (const m of metaMatches) {
    const key = m[1].toLowerCase();
    const val = decodeHtml(m[2]);
    if (key === "twitter:site" || key === "twitter:creator") {
      const handle = val.replace(/^@/, "").trim();
      if (handle && !out.twitter) out.twitter = handle;
    }
  }

  // Look for hrefs to known social platforms
  const hrefMatches = [...html.matchAll(/href=["']([^"']+)["']/gi)];
  for (const m of hrefMatches) {
    const href = decodeHtml(m[1]);
    if (!href.startsWith("http")) continue;

    if (!out.twitter) {
      const h = extractHandle(href, TWITTER_HOSTS);
      if (h) out.twitter = h;
    }
    if (!out.telegram) {
      try {
        const u = new URL(href);
        if (TELEGRAM_HOSTS.some((h) => u.hostname.endsWith(h))) out.telegram = href;
      } catch { /* skip */ }
    }
    if (!out.discord) {
      try {
        const u = new URL(href);
        if (DISCORD_HOSTS.some((h) => u.hostname.endsWith(h))) out.discord = href;
      } catch { /* skip */ }
    }
    if (!out.github) {
      try {
        const u = new URL(href);
        if (GITHUB_HOSTS.some((h) => u.hostname.endsWith(h))) out.github = href;
      } catch { /* skip */ }
    }
    if (!out.docs) {
      try {
        const u = new URL(href);
        if (u.hostname.startsWith("docs.") || u.pathname === "/docs" || u.pathname.startsWith("/docs/")) {
          out.docs = href;
        }
      } catch { /* skip */ }
    }
  }

  return out;
}

/**
 * Use DuckDuckGo HTML search to find a project's official website.
 * Returns the first URL that looks like a real project site.
 */
export async function findOfficialWebsite(projectName: string): Promise<string | undefined> {
  try {
    const q = encodeURIComponent(`${projectName} arc blockchain official`);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html",
      },
    });
    if (!res.ok) return undefined;
    const html = await res.text();

    const urlMatches = [...html.matchAll(/uddg=([^"&]+)/gi)];
    const blacklist = ["wikipedia.org", "twitter.com", "x.com", "coingecko.com", "coinmarketcap.com", "defillama.com", "github.com", "medium.com", "youtube.com", "linkedin.com"];
    for (const m of urlMatches) {
      try {
        const decoded = decodeURIComponent(m[1]);
        const url = new URL(decoded);
        if (blacklist.some((b) => url.hostname.includes(b))) continue;
        return `${url.protocol}//${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return undefined;
}

/**
 * Full enrichment: given a project name and optional known website,
 * return all discovered social links.
 */
export async function enrichProjectLinks(
  name: string,
  knownWebsite?: string | null,
): Promise<EnrichedLinks> {
  let site = knownWebsite;
  if (!site) {
    site = await findOfficialWebsite(name);
  }
  if (!site) return {};

  return await scrapeWebsiteSocials(site);
}
