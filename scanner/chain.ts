import { createPublicClient, http, defineChain } from "viem";

const rpc = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
const chainId = Number(process.env.ARC_CHAIN_ID || 5042002);
const explorer = process.env.ARC_EXPLORER_URL || "https://testnet.arcscan.app";

export const arc = defineChain({
  id: chainId,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: [rpc] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: explorer },
  },
  testnet: true,
});

export const client = createPublicClient({
  chain: arc,
  transport: http(rpc, { batch: true }),
});
