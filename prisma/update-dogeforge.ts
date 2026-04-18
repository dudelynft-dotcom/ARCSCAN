import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.project.update({
    where: { slug: "doge-forge" },
    data: {
      scoreOverride: 92,
      category: "mining",
      description:
        "DEX and mining protocol on Arc. Users commit USDC to earn fDOGE tokens through an emission curve-based system with 3 harvest modes (Instant 1.00x, Monthly 1.20x, Long-Term 1.50x). Operates a proprietary DEX with factory and router — 95% of committed USDC routes to fDOGE/USDC liquidity. Features on-chain .fdoge identity system. Total supply capped at 210M fDOGE.",
    },
  });
  console.log(`Updated: ${updated.name} — score ${updated.scoreOverride}, category ${updated.category}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
