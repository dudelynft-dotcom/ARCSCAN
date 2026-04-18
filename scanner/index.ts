import { tickBlockWatcher } from "./block-watcher";
import { tickDexFactoryWatcher } from "./dex-factory-watcher";
import { pullVerifiedContracts } from "./blockscout";

const ENABLED = process.env.SCANNER_ENABLED === "true";
const POLL_MS = Number(process.env.SCANNER_POLL_INTERVAL_MS || 15_000);

async function tick() {
  const started = Date.now();
  try {
    const [block, dex] = await Promise.all([
      tickBlockWatcher().catch((e) => ({ error: String(e) })),
      tickDexFactoryWatcher().catch((e) => ({ error: String(e) })),
    ]);
    console.log(`[tick ${new Date().toISOString()}] block=${JSON.stringify(block)} dex=${JSON.stringify(dex)} (${Date.now() - started}ms)`);
  } catch (e) {
    console.error("[tick error]", e);
  }
}

async function slowTick() {
  try {
    const r = await pullVerifiedContracts();
    console.log(`[slow-tick ${new Date().toISOString()}] blockscout=${JSON.stringify(r)}`);
  } catch (e) {
    console.error("[slow-tick error]", e);
  }
}

async function main() {
  if (!ENABLED) {
    console.log(
      "Scanner disabled (set SCANNER_ENABLED=true to start). Exiting.\n" +
        "Until mainnet ships you probably don't want this running on testnet (free gas → spam).",
    );
    return;
  }
  console.log(`Scanner starting. Poll every ${POLL_MS}ms.`);

  await tick();
  await slowTick();

  setInterval(tick, POLL_MS);
  setInterval(slowTick, Math.max(POLL_MS * 20, 5 * 60 * 1000));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
