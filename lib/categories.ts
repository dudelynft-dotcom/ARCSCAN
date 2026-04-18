export const CATEGORIES = [
  { id: "stablecoin", label: "Stablecoin", blurb: "Issuers of fiat-backed digital currency on Arc" },
  { id: "dex", label: "DEX", blurb: "Decentralized exchanges & AMMs" },
  { id: "cex", label: "CEX", blurb: "Centralized exchanges integrating Arc" },
  { id: "lending", label: "Lending", blurb: "Credit, borrow/lend & money markets" },
  { id: "payments", label: "Payments", blurb: "Merchant, remittance & consumer payments" },
  { id: "wallet", label: "Wallet", blurb: "Self-custody & smart-wallet providers" },
  { id: "custody", label: "Custody", blurb: "Institutional custody & asset security" },
  { id: "market-maker", label: "Market Maker", blurb: "Liquidity providers & OTC desks" },
  { id: "yield-funds", label: "Yield & Funds", blurb: "Tokenized funds, RWA & yield products" },
  { id: "crosschain", label: "Crosschain", blurb: "Bridges & cross-chain messaging" },
  { id: "infra", label: "Infrastructure", blurb: "Node providers, indexers & compliance" },
  { id: "dev-tools", label: "Dev Tools", blurb: "SDKs, APIs & developer platforms" },
  { id: "capital-markets", label: "Capital Markets", blurb: "Institutional trading & settlement" },
  { id: "bank-asset-mgr", label: "Bank / Asset Mgr", blurb: "Banks, insurers & asset managers" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const CATEGORY_MAP: Record<string, (typeof CATEGORIES)[number]> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export function categoryLabel(id: string): string {
  return CATEGORY_MAP[id]?.label ?? id;
}
