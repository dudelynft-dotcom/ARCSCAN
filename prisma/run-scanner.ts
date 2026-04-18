import { pullTokens } from "../scanner/blockscout";

async function main() {
  console.log("Pulling tokens from Blockscout...");
  const result = await pullTokens(100);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
