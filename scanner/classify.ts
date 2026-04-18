import { getAddress, type Address } from "viem";
import { client } from "./chain";

const erc20Abi = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export type ContractKind = "erc20" | "unknown";

export interface ClassifyResult {
  kind: ContractKind;
  name?: string;
  symbol?: string;
  decimals?: number;
}

/**
 * Best-effort ERC-20 classifier. Calls name/symbol/decimals — if all three
 * succeed, we treat it as a fungible token. Swallows revert/bytes errors.
 */
export async function classifyAddress(addr: string): Promise<ClassifyResult> {
  let address: Address;
  try {
    address = getAddress(addr);
  } catch {
    return { kind: "unknown" };
  }

  try {
    const [name, symbol, decimals] = await Promise.all([
      client.readContract({ address, abi: erc20Abi, functionName: "name" }),
      client.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address, abi: erc20Abi, functionName: "decimals" }),
    ]);
    return {
      kind: "erc20",
      name: String(name),
      symbol: String(symbol),
      decimals: Number(decimals),
    };
  } catch {
    return { kind: "unknown" };
  }
}
