"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { slugify } from "@/lib/slug";

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Not authorized");
}

export async function approveSubmissionAction(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;

  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub || sub.status !== "pending") return;

  // Generate unique slug
  let slug = slugify(sub.name);
  let n = 0;
  while (await prisma.project.findUnique({ where: { slug } })) {
    n++;
    slug = `${slugify(sub.name)}-${n}`;
    if (n > 10) return;
  }

  // Create project from submission
  await prisma.project.create({
    data: {
      slug,
      name: sub.name,
      category: sub.category,
      description: sub.description,
      contractAddress: sub.contractAddress,
      source: "submission",
      sourceNote: sub.submitterEmail
        ? `Submitted by ${sub.submitterEmail}`
        : "Community submission",
      verified: false,
      socials: {
        create: {
          website: sub.website,
          twitter: sub.twitter,
          telegram: sub.telegram,
        },
      },
    },
  });

  await prisma.submission.update({
    where: { id },
    data: { status: "approved" },
  });

  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
  revalidatePath("/explorer");
  revalidatePath("/");
}

export async function rejectSubmissionAction(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;

  await prisma.submission.update({
    where: { id },
    data: { status: "rejected" },
  });

  revalidatePath("/admin/submissions");
}
