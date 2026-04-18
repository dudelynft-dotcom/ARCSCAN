import { PrismaClient } from "@prisma/client";
import { SEED_PROJECTS } from "./seed-data";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${SEED_PROJECTS.length} Arc launch partners…`);

  let created = 0;
  let updated = 0;

  for (const p of SEED_PROJECTS) {
    const slug = slugify(p.name);
    const socialsPayload = {
      website: p.website ?? null,
      twitter: p.twitter ?? null,
    };

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      await prisma.project.update({
        where: { slug },
        data: {
          name: p.name,
          category: p.category,
          description: p.description,
          verified: p.verified ?? false,
          source: "seed",
          sourceNote: "Circle Arc public testnet partner list, 2025-10-28",
          socials: {
            upsert: { create: socialsPayload, update: socialsPayload },
          },
        },
      });
      updated++;
    } else {
      await prisma.project.create({
        data: {
          name: p.name,
          slug,
          category: p.category,
          description: p.description,
          verified: p.verified ?? false,
          source: "seed",
          sourceNote: "Circle Arc public testnet partner list, 2025-10-28",
          socials: { create: socialsPayload },
        },
      });
      created++;
    }
  }

  const total = await prisma.project.count();
  console.log(`✓ Created ${created}, updated ${updated}. Total projects in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
