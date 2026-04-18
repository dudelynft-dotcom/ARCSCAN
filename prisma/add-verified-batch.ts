import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

interface VerifiedProject {
  name: string;
  category: string;
  description: string;
  website?: string;
  twitter: string;
  score: number;
  risk: "SAFE" | "MEDIUM" | "HIGH";
}

const projects: VerifiedProject[] = [
  {
    name: "Unit Flow Finance",
    category: "dex",
    description:
      "Next-generation DEX on Arc L1 with multi-version AMM support (V2.5, V3, V4), cross-chain USDC bridging, no-code token factory, and NFT-gated access. Builds the liquidity hub for Arc, connecting builders, communities, and institutions. Creators can whitelist UnitFlow LiquidityRouter for seamless liquidity management on reflection token pools without taxes. Compatible with a trustless USDC agents system for secure, automated trading.",
    website: "https://www.unitflow.finance",
    twitter: "UnitFlowFinance",
    score: 85,
    risk: "SAFE",
  },
  {
    name: "Tower Exchange",
    category: "dex",
    description:
      "Trading exchange on Arc testnet combining DEX functionality with exchange-grade liquidity. Part of the emerging Arc DeFi stack.",
    twitter: "TowerExchange",
    score: 70,
    risk: "MEDIUM",
  },
  {
    name: "Arcswap",
    category: "dex",
    description:
      "Token swap protocol on Arc. Automated market-maker style DEX for swapping stablecoins and tokens in the Arc ecosystem.",
    twitter: "AchProtocol",
    score: 80,
    risk: "SAFE",
  },
  {
    name: "Synthra",
    category: "dex",
    description:
      "Decentralized exchange on Arc with concentrated liquidity (V3-style). Supports efficient token swaps with low fees and a sustainable revenue model. Serves emerging and under-explored EVM chains with V3 positions NFTs for liquidity providers.",
    website: "https://app.synthra.org",
    twitter: "synthra_finance",
    score: 85,
    risk: "SAFE",
  },
  {
    name: "Moa",
    category: "infra",
    description:
      "NFT launchpad on Arc for creators to mint, list, and distribute collections. Streamlined tooling for launching NFT projects natively on Arc's stablecoin-native L1.",
    twitter: "Mintonarc",
    score: 80,
    risk: "SAFE",
  },
  {
    name: "Lunex",
    category: "yield-funds",
    description:
      "Stablecoin vault protocol on Arc. Users deposit stablecoins to earn yield through optimized strategies on the Arc L1.",
    twitter: "lunexfinance",
    score: 70,
    risk: "MEDIUM",
  },
];

async function main() {
  console.log(`Adding/updating ${projects.length} verified projects...`);

  for (const p of projects) {
    const slug = slugify(p.name);
    const socialsData = {
      website: p.website ?? null,
      twitter: p.twitter,
    };

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      await prisma.project.update({
        where: { slug },
        data: {
          name: p.name,
          category: p.category,
          description: p.description,
          verified: true,
          scoreOverride: p.score,
          riskLevel: p.risk,
          socials: {
            upsert: { create: socialsData, update: socialsData },
          },
        },
      });
      console.log(`  UPDATED: ${p.name} (score ${p.score}, ${p.risk})`);
    } else {
      await prisma.project.create({
        data: {
          slug,
          name: p.name,
          category: p.category,
          description: p.description,
          verified: true,
          scoreOverride: p.score,
          riskLevel: p.risk,
          source: "manual",
          sourceNote: "Admin-verified project",
          socials: { create: socialsData },
        },
      });
      console.log(`  CREATED: ${p.name} (score ${p.score}, ${p.risk})`);
    }
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
