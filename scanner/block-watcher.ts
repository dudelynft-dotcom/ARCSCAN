import { prisma } from "../lib/db";
import { client } from "./chain";
import { classifyAddress } from "./classify";

const CURSOR_ID = "block-watcher";

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

const MAX_BLOCKS_PER_TICK = 25;

export async function tickBlockWatcher() {
  const chainHead = Number(await client.getBlockNumber());
  let cursor = await getCursor();

  if (cursor === 0) cursor = Math.max(0, chainHead - 100);

  const target = Math.min(chainHead, cursor + MAX_BLOCKS_PER_TICK);
  if (target <= cursor) return { processed: 0, head: chainHead, cursor };

  let detected = 0;

  for (let n = cursor + 1; n <= target; n++) {
    const block = await client.getBlock({ blockNumber: BigInt(n), includeTransactions: true });
    for (const tx of block.transactions) {
      if (typeof tx === "string") continue;
      if (tx.to != null) continue;

      const receipt = await client.getTransactionReceipt({ hash: tx.hash });
      const addr = receipt.contractAddress;
      if (!addr) continue;

      const classified = await classifyAddress(addr);
      if (classified.kind !== "erc20") continue;

      await prisma.discoveryCandidate.upsert({
        where: { contractAddress: addr.toLowerCase() },
        create: {
          contractAddress: addr.toLowerCase(),
          chainId: Number(process.env.ARC_CHAIN_ID || 5042002),
          source: "block-watcher",
          txHash: tx.hash,
          blockNumber: n,
          symbol: classified.symbol,
          tokenName: classified.name,
          decimals: classified.decimals,
        },
        update: {},
      });
      detected++;
    }
  }

  await setCursor(target);
  return { processed: target - cursor, head: chainHead, cursor: target, detected };
}
