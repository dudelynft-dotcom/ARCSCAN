import type { Metadata } from "next";
import Link from "next/link";
import { fetchRecentTransactions, fetchChainStats, explorerUrl } from "@/lib/blockscout-api";
import { resolveAddresses } from "@/lib/address-resolver";
import { formatNumber, shortAddr, timeAgo } from "@/lib/format";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Live transaction feed from Arc blockchain with project resolution.",
};
export const revalidate = 15;

function formatValue(wei?: string): string {
  if (!wei || wei === "0") return "0";
  const val = BigInt(wei);
  const usdc = Number(val) / 1e6;
  if (usdc < 0.01) return "<0.01";
  if (usdc < 1000) return usdc.toFixed(2);
  return formatNumber(usdc);
}

function methodLabel(tx: {
  method?: string | null;
  decoded_input?: { method_call?: string } | null;
  transaction_types?: string[];
}): string {
  if (tx.method) return tx.method;
  if (tx.decoded_input?.method_call) {
    const m = tx.decoded_input.method_call.match(/^(\w+)/);
    if (m) return m[1];
  }
  const type = tx.transaction_types?.[0];
  if (type === "contract_creation") return "Deploy";
  if (type === "contract_call") return "Call";
  if (type === "coin_transfer") return "Transfer";
  if (type === "token_transfer") return "Token Transfer";
  return "—";
}

export default async function TransactionsPage() {
  const [txs, stats] = await Promise.all([fetchRecentTransactions(60), fetchChainStats()]);

  const allAddresses = txs.flatMap(
    (t) => [t.from?.hash, t.to?.hash].filter(Boolean) as string[],
  );
  const resolved = await resolveAddresses(allAddresses);

  const renderAddr = (addr?: string, isContract?: boolean) => {
    if (!addr) return <span className="text-ink-400">—</span>;
    const r = resolved.get(addr.toLowerCase());
    if (r) {
      return (
        <Link
          href={`/project/${r.slug}`}
          className="inline-flex items-center gap-1.5 text-ink-700 hover:underline"
        >
          <span className="font-medium">{r.name}</span>
          {r.verified && <span className="tag-dark">Verified</span>}
        </Link>
      );
    }
    return (
      <a
        href={explorerUrl(`/address/${addr}`)}
        target="_blank"
        rel="noreferrer"
        className="mono text-xs text-ink-500 hover:text-ink-700"
      >
        {shortAddr(addr)}
        {isContract && <span className="ml-1 text-ink-400">·c</span>}
      </a>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow">Live feed</div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-ink-700">
          Arc transactions
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Real-time transaction stream from Arc testnet. Updates every 15 seconds. Known
          contracts resolve to their project.
        </p>
      </div>

      {/* Stats */}
      <div className="surface grid grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total transactions", value: formatNumber(stats.totalTxCount) },
          { label: "Total addresses", value: formatNumber(stats.totalAddresses) },
          { label: "Total blocks", value: formatNumber(stats.totalBlocks) },
          {
            label: "Avg block time",
            value: stats.avgBlockTime ? `${stats.avgBlockTime.toFixed(2)}s` : "—",
          },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`px-4 py-4 sm:px-5 ${i % 2 !== 0 ? "border-l border-ink-200" : ""} ${
              i >= 2 ? "border-t lg:border-t-0 border-ink-200" : ""
            } ${i >= 2 ? "lg:border-l" : ""}`}
          >
            <div className="eyebrow">{s.label}</div>
            <div className="mono mt-1 text-xl sm:text-2xl font-semibold tracking-tighter text-ink-700">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="eyebrow">Stream</div>
            <h2 className="mt-1 text-lg sm:text-xl font-semibold tracking-tight text-ink-700">
              Latest · {txs.length} transactions
            </h2>
          </div>
          <span className="mono text-2xs uppercase tracking-wider text-ink-400">
            refresh · 15s
          </span>
        </div>

        {txs.length === 0 ? (
          <div className="surface p-8 text-center text-sm text-ink-500">
            No transaction data available right now.
          </div>
        ) : (
          <div className="surface overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Hash</th>
                  <th>Block</th>
                  <th>Age</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Method</th>
                  <th className="text-right">Value · USDC</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.hash}>
                    <td>
                      <a
                        href={explorerUrl(`/tx/${tx.hash}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="mono text-xs text-ink-700 hover:underline"
                      >
                        {shortAddr(tx.hash)}
                      </a>
                    </td>
                    <td className="mono text-xs text-ink-500">{tx.block_number ?? "—"}</td>
                    <td className="mono text-xs text-ink-400">{timeAgo(tx.timestamp)}</td>
                    <td>{renderAddr(tx.from?.hash, tx.from?.is_contract)}</td>
                    <td>{renderAddr(tx.to?.hash, tx.to?.is_contract)}</td>
                    <td>
                      <span className="tag">{methodLabel(tx)}</span>
                    </td>
                    <td className="mono text-right text-ink-700">{formatValue(tx.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
