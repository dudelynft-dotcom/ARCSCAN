"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { CATEGORY_IDS } from "@/lib/categories";
import { slugify } from "@/lib/slug";

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Not authorized");
}

export async function promoteCandidateAction(_prev: unknown, formData: FormData) {
  await requireAuth();

  const candidateId = formData.get("candidateId") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "Name is required" };
  if (!CATEGORY_IDS.includes(category as never)) return { error: "Invalid category" };

  const candidate = await prisma.discoveryCandidate.findUnique({
    where: { id: candidateId },
  });
  if (!candidate) return { error: "Candidate not found" };

  // Generate unique slug
  let slug = slugify(name);
  let n = 0;
  while (await prisma.project.findUnique({ where: { slug } })) {
    n++;
    slug = `${slugify(name)}-${n}`;
    if (n > 10) return { error: "Slug conflict — pick a different name" };
  }

  // Determine contract address (skip synthetic ecosystem addresses)
  const contractAddress = candidate.contractAddress.startsWith("ecosystem:")
    ? null
    : candidate.contractAddress;

  await prisma.project.create({
    data: {
      slug,
      name,
      category,
      description,
      contractAddress,
      source: `auto:${candidate.source}`,
      sourceNote: `Discovered ${candidate.detectedAt.toISOString()} at block ${candidate.blockNumber ?? "n/a"}`,
      verified: false,
      socials: { create: {} },
    },
  });

  await prisma.discoveryCandidate.update({
    where: { id: candidateId },
    data: { processed: true, promoted: true },
  });

  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
  revalidatePath("/explorer");
  revalidatePath("/");
  return { ok: true, slug };
}

export async function dismissCandidateAction(formData: FormData) {
  await requireAuth();
  const candidateId = formData.get("candidateId") as string;
  await prisma.discoveryCandidate.update({
    where: { id: candidateId },
    data: { processed: true, promoted: false, notes: "Dismissed by admin" },
  });
  revalidatePath("/admin/candidates");
}
