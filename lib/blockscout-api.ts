const EXPLORER = (process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app").replace(/\/$/, "");

export interface BlockscoutTx {
  hash: string;
  block_number?: number;
  timestamp?: string;
  from?: { hash?: string; is_contract?: boolean };
  to?: { hash?: string; is_contract?: boolean } | null;
  method?: string | null;
  value?: string;
  gas_used?: string;
  gas_price?: string;
  status?: string;
  type?: number;
  decoded_input?: { method_call?: string } | null;
  transaction_types?: string[];
}

export interface BlockscoutAddress {
  hash: string;
  coin_balance?: string | null;
  is_contract?: boolean;
  is_verified?: boolean;
  name?: string | null;
  ens_domain_name?: string | null;
  transactions_count?: string;
  tx_count?: string;
}

export async function fetchRecentTransactions(limit = 50): Promise<BlockscoutTx[]> {
  try {
    const res = await fetch(`${EXPLORER}/api/v2/main-page/transactions`, {
      next: { revalidate: 15 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as BlockscoutTx[];
    return body.slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchTransactions(limit = 50): Promise<BlockscoutTx[]> {
  try {
    const res = await fetch(`${EXPLORER}/api/v2/transactions`, {
      next: { revalidate: 30 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { items?: BlockscoutTx[] };
    return (body.items ?? []).slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchTopAddresses(limit = 100): Promise<BlockscoutAddress[]> {
  try {
    const res = await fetch(`${EXPLORER}/api/v2/addresses`, {
      next: { revalidate: 60 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { items?: BlockscoutAddress[] };
    return (body.items ?? []).slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchChainStats(): Promise<{
  totalTxCount: number;
  totalAddresses: number;
  totalBlocks: number;
  avgBlockTime: number;
  gasPriceMedian?: string;
}> {
  try {
    const res = await fetch(`${EXPLORER}/api/v2/stats`, {
      next: { revalidate: 60 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return { totalTxCount: 0, totalAddresses: 0, totalBlocks: 0, avgBlockTime: 0 };
    const s = (await res.json()) as {
      total_transactions?: string;
      total_addresses?: string;
      total_blocks?: string;
      average_block_time?: number;
      gas_prices?: { average?: string; fast?: string; slow?: string };
    };
    return {
      totalTxCount: parseInt(s.total_transactions ?? "0") || 0,
      totalAddresses: parseInt(s.total_addresses ?? "0") || 0,
      totalBlocks: parseInt(s.total_blocks ?? "0") || 0,
      avgBlockTime: s.average_block_time ? s.average_block_time / 1000 : 0,
      gasPriceMedian: s.gas_prices?.average,
    };
  } catch {
    return { totalTxCount: 0, totalAddresses: 0, totalBlocks: 0, avgBlockTime: 0 };
  }
}

export function explorerUrl(path: string): string {
  return `${EXPLORER}${path.startsWith("/") ? path : "/" + path}`;
}
