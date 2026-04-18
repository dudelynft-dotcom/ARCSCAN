import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "doge-forge";

  await prisma.project.upsert({
    where: { slug },
    update: {
      name: "Doge Forge",
      description:
        "Mining protocol on Arc where users commit USDC to earn fDOGE tokens through an emission curve-based system. Features 3 harvest modes (Instant, Monthly, Long-Term), a proprietary DEX with factory and router, and an on-chain .fdoge identity system. 95% of committed USDC routes to fDOGE/USDC liquidity. Total supply capped at 210M fDOGE.",
      category: "dex",
      verified: true,
      scoreOverride: 78,
      riskLevel: "MEDIUM",
      source: "manual",
      sourceNote: "Added as verified project. No audit yet — testnet phase.",
      socials: {
        upsert: {
          create: {
            website: "https://dogeforge.fun",
            twitter: "DogeForgefun",
            telegram: "https://t.me/dogeforge",
            docs: "https://dogeforge.fun",
          },
          update: {
            website: "https://dogeforge.fun",
            twitter: "DogeForgefun",
            telegram: "https://t.me/dogeforge",
            docs: "https://dogeforge.fun",
          },
        },
      },
    },
    create: {
      slug,
      name: "Doge Forge",
      description:
        "Mining protocol on Arc where users commit USDC to earn fDOGE tokens through an emission curve-based system. Features 3 harvest modes (Instant, Monthly, Long-Term), a proprietary DEX with factory and router, and an on-chain .fdoge identity system. 95% of committed USDC routes to fDOGE/USDC liquidity. Total supply capped at 210M fDOGE.",
      category: "dex",
      verified: true,
      scoreOverride: 78,
      riskLevel: "MEDIUM",
      source: "manual",
      sourceNote: "Added as verified project. No audit yet — testnet phase.",
      socials: {
        create: {
          website: "https://dogeforge.fun",
          twitter: "DogeForgefun",
          telegram: "https://t.me/dogeforge",
          docs: "https://dogeforge.fun",
        },
      },
    },
  });

  console.log("Doge Forge added/updated as verified project");

  // Also update any existing Dogg Token entry to link to Doge Forge
  const doggToken = await prisma.project.findFirst({
    where: { name: "Dogg Token" },
  });
  if (doggToken) {
    await prisma.project.update({
      where: { id: doggToken.id },
      data: {
        description:
          "fDOGE token from the Doge Forge mining protocol. ERC-20 on Arc with 0.1% transfer fee. 210M supply cap with emission curve pricing.",
        socials: {
          upsert: {
            create: {
              website: "https://dogeforge.fun",
              twitter: "DogeForgefun",
              telegram: "https://t.me/dogeforge",
            },
            update: {
              website: "https://dogeforge.fun",
              twitter: "DogeForgefun",
              telegram: "https://t.me/dogeforge",
            },
          },
        },
      },
    });
    console.log("Dogg Token entry also updated with Doge Forge links");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
