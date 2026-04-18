/**
 * Arc-tuned scoring: volume & real usage dominate; social is deprioritized
 * because Arc is a fintech/enterprise chain, not a meme-coin chain.
 */

export interface ScoreInputs {
  volume24h?: number | null;
  uniqueUsers?: number | null;
  liquidity?: number | null;
  tvl?: number | null;
  growthRate?: number | null;
  socialsCount?: number | null;
  riskPenalty?: number | null;
}

export interface RiskInputs {
  ownerCanMint?: boolean;
  liquidityLocked?: boolean;
  topHolderPctSupply?: number | null;
  hasVerifiedLinks?: boolean;
}

const norm = (v: number | null | undefined, cap: number) =>
  v == null ? 0 : Math.min(1, Math.max(0, v / cap));

export function computeScore(inp: ScoreInputs): number {
  const volume = norm(inp.volume24h, 1_000_000);
  const users = norm(inp.uniqueUsers, 1_000);
  const liq = norm(Math.max(inp.liquidity ?? 0, inp.tvl ?? 0), 5_000_000);
  const growth = Math.max(-1, Math.min(1, inp.growthRate ?? 0));
  const social = norm(inp.socialsCount, 4);
  const risk = Math.max(0, Math.min(1, inp.riskPenalty ?? 0));

  const raw =
    volume * 35 +
    users * 20 +
    liq * 15 +
    ((growth + 1) / 2) * 15 +
    social * 5 -
    risk * 30;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

export type RiskLevel = "SAFE" | "MEDIUM" | "HIGH" | "UNKNOWN";

export function computeRisk(inp: RiskInputs): { level: RiskLevel; penalty: number; flags: string[] } {
  const flags: string[] = [];
  let penalty = 0;

  if (inp.ownerCanMint) {
    flags.push("Owner can mint tokens");
    penalty += 0.4;
  }
  if (inp.liquidityLocked === false) {
    flags.push("Liquidity not locked");
    penalty += 0.3;
  }
  if ((inp.topHolderPctSupply ?? 0) > 0.5) {
    flags.push("Top wallet holds >50% supply");
    penalty += 0.4;
  }
  if (inp.hasVerifiedLinks === false) {
    flags.push("No verified links");
    penalty += 0.1;
  }

  const pen = Math.min(1, penalty);
  const level: RiskLevel =
    pen >= 0.6 ? "HIGH" : pen >= 0.25 ? "MEDIUM" : pen > 0 ? "SAFE" : "UNKNOWN";

  return { level, penalty: pen, flags };
}

export function displayScore(p: {
  scoreOverride?: number | null;
  scoreComputed?: number | null;
}): { score: number | null; source: "override" | "computed" | "none" } {
  if (p.scoreOverride != null) return { score: p.scoreOverride, source: "override" };
  if (p.scoreComputed != null) return { score: p.scoreComputed, source: "computed" };
  return { score: null, source: "none" };
}

export function riskColor(level: string): string {
  switch (level) {
    case "SAFE":
      return "text-arc-good";
    case "MEDIUM":
      return "text-arc-warn";
    case "HIGH":
      return "text-arc-bad";
    default:
      return "text-arc-muted";
  }
}
