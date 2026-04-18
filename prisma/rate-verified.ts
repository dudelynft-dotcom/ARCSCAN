import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const verified = await prisma.project.findMany({
    where: { verified: true },
    select: { id: true, name: true },
  });

  console.log(`Rating ${verified.length} verified projects...`);

  let updated = 0;
  for (const p of verified) {
    const score = 85 + Math.floor(Math.random() * 11); // 85-95 inclusive
    await prisma.project.update({
      where: { id: p.id },
      data: {
        scoreOverride: score,
        riskLevel: "SAFE",
      },
    });
    console.log(`  ${p.name}: score ${score}, SAFE`);
    updated++;
  }

  console.log(`Done. ${updated} verified projects rated.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
