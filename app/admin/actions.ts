"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { CATEGORY_IDS } from "@/lib/categories";
import { isAuthed, signIn, signOut } from "@/lib/auth";
import { slugify } from "@/lib/slug";

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Not authorized");
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  category: z.enum(CATEGORY_IDS as [string, ...string[]]),
  description: z.string().max(2000).optional().nullable(),
  contractAddress: z
    .string()
    .trim()
    .refine((v) => !v || /^0x[a-fA-F0-9]{40}$/.test(v), "Invalid EVM address")
    .optional()
    .nullable(),
  website: z.string().trim().url().optional().or(z.literal("")),
  twitter: z.string().trim().optional().or(z.literal("")),
  telegram: z.string().trim().url().optional().or(z.literal("")),
  discord: z.string().trim().url().optional().or(z.literal("")),
  github: z.string().trim().url().optional().or(z.literal("")),
  docs: z.string().trim().url().optional().or(z.literal("")),
  verified: z.coerce.boolean().optional(),
  flagged: z.coerce.boolean().optional(),
  flagReason: z.string().max(500).optional().nullable(),
  scoreOverride: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .refine((n) => n == null || (Number.isInteger(n) && n >= 0 && n <= 100), "Score must be 0–100"),
  riskLevel: z.enum(["UNKNOWN", "SAFE", "MEDIUM", "HIGH"]).optional(),
});

function fd(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

export async function signInAction(_prev: unknown, formData: FormData) {
  const password = fd(formData.get("password"));
  const ok = await signIn(password);
  if (!ok) return { error: "Wrong password." };
  redirect("/admin");
}

export async function signOutAction() {
  await signOut();
  redirect("/admin/login");
}

export async function updateProjectAction(_prev: unknown, formData: FormData) {
  await requireAuth();

  const raw = {
    id: fd(formData.get("id")),
    name: fd(formData.get("name")),
    category: fd(formData.get("category")),
    description: fd(formData.get("description")) || null,
    contractAddress: fd(formData.get("contractAddress")) || null,
    website: fd(formData.get("website")),
    twitter: fd(formData.get("twitter")),
    telegram: fd(formData.get("telegram")),
    discord: fd(formData.get("discord")),
    github: fd(formData.get("github")),
    docs: fd(formData.get("docs")),
    verified: formData.get("verified") === "on",
    flagged: formData.get("flagged") === "on",
    flagReason: fd(formData.get("flagReason")) || null,
    scoreOverride: fd(formData.get("scoreOverride")) || "",
    riskLevel: (fd(formData.get("riskLevel")) || "UNKNOWN") as "UNKNOWN" | "SAFE" | "MEDIUM" | "HIGH",
  };

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const { id, website, twitter, telegram, discord, github, docs, ...rest } = parsed.data;

  await prisma.project.update({
    where: { id },
    data: {
      name: rest.name,
      category: rest.category,
      description: rest.description,
      contractAddress: rest.contractAddress,
      verified: rest.verified ?? false,
      flagged: rest.flagged ?? false,
      flagReason: rest.flagged ? rest.flagReason : null,
      scoreOverride: rest.scoreOverride,
      riskLevel: rest.riskLevel ?? "UNKNOWN",
      socials: {
        upsert: {
          create: {
            website: website || null,
            twitter: twitter || null,
            telegram: telegram || null,
            discord: discord || null,
            github: github || null,
            docs: docs || null,
          },
          update: {
            website: website || null,
            twitter: twitter || null,
            telegram: telegram || null,
            discord: discord || null,
            github: github || null,
            docs: docs || null,
          },
        },
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/explorer");
  revalidatePath("/");
  return { ok: true };
}

export async function quickToggleAction(formData: FormData) {
  await requireAuth();
  const id = fd(formData.get("id"));
  const field = fd(formData.get("field"));
  if (!["verified", "flagged"].includes(field)) return;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return;

  await prisma.project.update({
    where: { id },
    data: {
      [field]: !(project as unknown as Record<string, boolean>)[field],
    },
  });
  revalidatePath("/admin");
  revalidatePath("/explorer");
  revalidatePath("/");
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.enum(CATEGORY_IDS as [string, ...string[]]),
  description: z.string().max(2000).optional(),
  website: z.string().trim().url().optional().or(z.literal("")),
  twitter: z.string().trim().optional().or(z.literal("")),
});

export async function createProjectAction(_prev: unknown, formData: FormData) {
  await requireAuth();
  const parsed = createSchema.safeParse({
    name: fd(formData.get("name")),
    category: fd(formData.get("category")),
    description: fd(formData.get("description")) || undefined,
    website: fd(formData.get("website")),
    twitter: fd(formData.get("twitter")),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  let slug = slugify(parsed.data.name);
  let tries = 0;
  while (await prisma.project.findUnique({ where: { slug } })) {
    tries++;
    slug = `${slugify(parsed.data.name)}-${tries + 1}`;
    if (tries > 10) return { error: "Slug conflict — pick a different name" };
  }

  await prisma.project.create({
    data: {
      name: parsed.data.name,
      slug,
      category: parsed.data.category,
      description: parsed.data.description,
      source: "manual",
      socials: {
        create: {
          website: parsed.data.website || null,
          twitter: parsed.data.twitter || null,
        },
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/explorer");
  return { ok: true, slug };
}

export async function deleteProjectAction(formData: FormData) {
  await requireAuth();
  const id = fd(formData.get("id"));
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/explorer");
}
