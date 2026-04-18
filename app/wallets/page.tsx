import type { Metadata } from "next";
import Link from "next/link";
import { fetchTopAddresses, fetchChainStats, explorerUrl } from "@/lib/blockscout-api";
import { resolveAddresses } from "@/lib/address-resolver";
import { formatNumber, shortAddr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Top wallets",
  description: "Ranked list of top wallets and contracts by balance on Arc blockchain.",
};
export const revalidate = 60;

function formatBalance(wei?: string | null): string {
  if (!wei || wei === "0") return "0";
  const usdc = Number(BigInt(wei)) / 1e6;
  if (usdc < 0.01) return "<0.01";
  if (usdc < 1000) return usdc.toFixed(2);
  return formatNumber(usdc);
}

export default async function WalletsPage() {
  const [addresses, stats] = await Promise.all([fetchTopAddresses(100), fetchChainStats()]);

  const resolved = await resolveAddresses(addresses.map((a) => a.hash));

  // Aggregate stats
  const totalBalance = addresses.reduce((acc, a) => acc + (Number(BigInt(a.coin_balance ?? "0")) / 1e6), 0);
  const contractsCount = addresses.filter((a) => a.is_contract).length;

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow">Leaderboard</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-700">
          Top wallets on Arc
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Ranked by USDC balance. Known contracts resolve to their project. Data refreshes
          every 60 seconds.
        </p>
      </div>

      {/* Stats */}
      <div className="surface grid grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total addresses", value: formatNumber(stats.totalAddresses) },
          { label: "Contracts in top 100", value: formatNumber(contractsCount) },
          { label: "USDC in top 100", value: formatBalance(String(BigInt(Math.round(totalBalance * 1e6)))) },
          {
            label: "Wallets in top 100",
            value: formatNumber(addresses.length - contractsCount),
          },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`px-5 py-4 ${i % 2 !== 0 ? "border-l border-ink-200" : ""} ${
              i >= 2 ? "border-t lg:border-t-0 border-ink-200" : ""
            } ${i >= 2 ? "lg:border-l" : ""}`}
          >
            <div className="eyebrow">{s.label}</div>
            <div className="mono mt-1 text-2xl font-semibold tracking-tighter text-ink-700">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="eyebrow">Ranked by balance</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-700">
              Top 100 wallets
            </h2>
          </div>
          <span className="mono text-2xs uppercase tracking-wider text-ink-400">
            refresh · 60s
          </span>
        </div>

        {addresses.length === 0 ? (
          <div className="surface p-10 text-center text-sm text-ink-500">
            No wallet data available right now.
          </div>
        ) : (
          <div className="surface overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th>Address</th>
                  <th>Tag</th>
                  <th>Type</th>
                  <th className="text-right">Transactions</th>
                  <th className="text-right">Balance · USDC</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((addr, i) => {
                  const r = resolved.get(addr.hash.toLowerCase());
                  const txCount = parseInt(addr.transactions_count ?? addr.tx_count ?? "0") || 0;
                  return (
                    <tr key={addr.hash}>
                      <td className="mono text-ink-400">
                        {String(i + 1).padStart(3, "0")}
                      </td>
                      <td>
                        {r ? (
                          <Link
                            href={`/project/${r.slug}`}
                            className="inline-flex items-center gap-2 font-medium text-ink-700 hover:underline"
                          >
                            {r.name}
                            {r.verified && <span className="tag-dark">Verified</span>}
                          </Link>
                        ) : (
                          <a
                            href={explorerUrl(`/address/${addr.hash}`)}
                            target="_blank"
                            rel="noreferrer"
                            className="mono text-xs text-ink-700 hover:underline"
                          >
                            {shortAddr(addr.hash)}
                          </a>
                        )}
                      </td>
                      <td className="text-sm text-ink-500">
                        {addr.name || addr.ens_domain_name || "—"}
                      </td>
                      <td>
                        {addr.is_contract ? (
                          <span className="tag">Contract</span>
                        ) : (
                          <span className="tag">EOA</span>
                        )}
                      </td>
                      <td className="mono text-right text-ink-700">{formatNumber(txCount)}</td>
                      <td className="mono text-right text-ink-700">
                        {formatBalance(addr.coin_balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-2xs uppercase tracking-wider text-ink-400">
        EOA · externally-owned account (user wallet) · Contract · smart contract address
        · Data from Blockscout testnet.arcscan.app
      </p>
    </div>
  );
}
