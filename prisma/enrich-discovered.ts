import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Bulk-enrich auto-discovered projects with official links found via search.
 */
const enrichments: Record<string, { website?: string; twitter?: string; github?: string; docs?: string; description?: string; category?: string }> = {
  "synthra": {
    website: "https://app.synthra.org",
    docs: "https://docs.synthra.org",
    twitter: "SynthraDEX",
    description: "Decentralized exchange on Arc with concentrated liquidity (V3). Supports token swaps with low fees across Arc ecosystem assets.",
    category: "dex",
  },
  "zns-connect": {
    website: "https://zns.bio",
    github: "https://github.com/ZNS-Connect",
    twitter: "ZNSConnect",
    description: "Decentralized naming system on Arc. Claim .arc domain names for wallets, profiles, and Web3 identity.",
    category: "dev-tools",
  },
  "xylonet-usdc-eurc-lp": {
    website: "https://xylonet.xyz",
    description: "XyloNet DEX liquidity pool token for the USDC/EURC pair on Arc. Core trading pair for stablecoin FX.",
    category: "dex",
  },
  "xylonet-usdc-vault": {
    website: "https://xylonet.xyz",
    description: "XyloNet USDC yield vault on Arc. Deposit USDC for automated yield from DEX trading fees.",
    category: "yield-funds",
  },
  "swaparc-token": {
    description: "Swaparc DEX governance token on Arc. Decentralized exchange for swapping Arc ecosystem tokens.",
    category: "dex",
  },
  "infinityname": {
    description: "On-chain identity and naming system on Arc with 1.5M+ holders. Claim unique names tied to your wallet.",
    category: "dev-tools",
  },
  "gmcards": {
    description: "NFT trading card collection on Arc with 686K+ holders. Community-driven collectible card game.",
    category: "infra",
  },
  "neoarc": {
    description: "NFT collection on Arc with 571K+ holders. Digital art and collectibles native to the Arc ecosystem.",
    category: "infra",
  },
  "arcflow-nft": {
    description: "NFT collection on Arc with 518K+ holders. Generative art collection for the Arc community.",
    category: "infra",
  },
  "synthra-v3-positions-nft-v1": {
    website: "https://app.synthra.org",
    docs: "https://docs.synthra.org",
    description: "Synthra V3 liquidity position NFTs. Each NFT represents a concentrated liquidity position in a Synthra pool.",
    category: "dex",
  },
  "wrapped-usdc": {
    description: "Wrapped USDC on Arc. ERC-20 wrapper enabling USDC compatibility with protocols requiring standard token interfaces.",
    category: "stablecoin",
  },
  "usdt": {
    description: "Tether USDT on Arc testnet. USD-pegged stablecoin for trading and payments.",
    category: "stablecoin",
  },
  "eurc": {
    website: "https://www.circle.com/eurc",
    description: "Euro Coin by Circle. EUR-backed stablecoin native to Arc, enabling euro-denominated payments and FX.",
    category: "stablecoin",
  },
  "usdc-eurc": {
    description: "USDC/EURC trading pair LP token on Arc. Core liquidity pair for USD-EUR on-chain foreign exchange.",
    category: "dex",
  },
};

async function main() {
  let updated = 0;

  for (const [slug, data] of Object.entries(enrichments)) {
    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) {
      console.log(`  skip: ${slug} not found`);
      continue;
    }

    const projectUpdate: Record<string, unknown> = {};
    if (data.description) projectUpdate.description = data.description;
    if (data.category) projectUpdate.category = data.category;

    if (Object.keys(projectUpdate).length > 0) {
      await prisma.project.update({ where: { slug }, data: projectUpdate });
    }

    const socialsUpdate: Record<string, string> = {};
    if (data.website) socialsUpdate.website = data.website;
    if (data.twitter) socialsUpdate.twitter = data.twitter;
    if (data.github) socialsUpdate.github = data.github;
    if (data.docs) socialsUpdate.docs = data.docs;

    if (Object.keys(socialsUpdate).length > 0) {
      await prisma.socials.upsert({
        where: { projectId: project.id },
        create: { projectId: project.id, ...socialsUpdate },
        update: socialsUpdate,
      });
    }

    console.log(`  updated: ${slug}`);
    updated++;
  }

  console.log(`Done. ${updated} projects enriched.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
