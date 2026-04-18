import { parseAbiItem, type Address } from "viem";
import { prisma } from "../lib/db";
import { client } from "./chain";
import { classifyAddress } from "./classify";

/**
 * Watches known DEX factory contracts on Arc for new pool creations.
 * Fill in FACTORIES with real mainnet addresses once Arc DEXs deploy their
 * factories. Pattern supports Uniswap V2 / V3, Curve, Aerodrome, etc.
 */

interface FactoryConfig {
  name: string;
  address: Address;
  eventSig: string;
}

const FACTORIES: FactoryConfig[] = [
  // Example (fill in real addresses when DEXs deploy to Arc mainnet):
  // { name: "Uniswap V3", address: "0x0000000000000000000000000000000000000000", eventSig: "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)" },
  // { name: "Uniswap V2", address: "0x0000000000000000000000000000000000000000", eventSig: "event PairCreated(address indexed token0, address indexed token1, address pair, uint)" },
];

const CURSOR_ID = "dex-factory-watcher";
const MAX_BLOCKS_PER_TICK = 1_000;

async function getCursor(): Promise<number> {
  const row = await prisma.scannerCursor.findUnique({ where: { id: CURSOR_ID } });
  if (row) return row.lastBlock;
  const seed = Number(process.env.SCANNER_START_BLOCK || 0);
  await prisma.scannerCursor.create({ data: { id: CURSOR_ID, lastBlock: seed } });
  return seed;
}

async function setCursor(n: number) {
  await prisma.scannerCursor.upsert({
    where: { id: CURSOR_ID },
    create: { id: CURSOR_ID, lastBlock: n },
    update: { lastBlock: n },
  });
}

export async function tickDexFactoryWatcher() {
  if (FACTORIES.length === 0) {
    return { processed: 0, note: "No factories configured yet — fill FACTORIES array" };
  }

  const chainHead = Number(await client.getBlockNumber());
  let cursor = await getCursor();
  if (cursor === 0) cursor = Math.max(0, chainHead - 100);

  const target = Math.min(chainHead, cursor + MAX_BLOCKS_PER_TICK);
  if (target <= cursor) return { processed: 0, head: chainHead, cursor };

  let detected = 0;

  for (const f of FACTORIES) {
    type PoolLog = {
      args: { token0?: Address; token1?: Address };
      blockNumber: bigint;
      transactionHash: string;
    };
    const logs = (await client.getLogs({
      address: f.address,
      event: parseAbiItem(f.eventSig) as never,
      fromBlock: BigInt(cursor + 1),
      toBlock: BigInt(target),
    })) as unknown as PoolLog[];

    for (const log of logs) {
      const tokens = [log.args.token0, log.args.token1].filter(Boolean) as Address[];
      for (const tokenAddr of tokens) {
        const classified = await classifyAddress(tokenAddr);
        if (classified.kind !== "erc20") continue;

        await prisma.discoveryCandidate.upsert({
          where: { contractAddress: tokenAddr.toLowerCase() },
          create: {
            contractAddress: tokenAddr.toLowerCase(),
            chainId: Number(process.env.ARC_CHAIN_ID || 5042002),
            source: `dex-factory:${f.name}`,
            blockNumber: Number(log.blockNumber),
            txHash: log.transactionHash,
            symbol: classified.symbol,
            tokenName: classified.name,
            decimals: classified.decimals,
          },
          update: {},
        });
        detected++;
      }
    }
  }

  await setCursor(target);
  return { processed: target - cursor, head: chainHead, cursor: target, detected };
}
