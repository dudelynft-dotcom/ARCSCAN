"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { CATEGORY_IDS } from "@/lib/categories";

const schema = z.object({
  name: z.string().min(1, "Project name is required").max(120),
  category: z.enum(CATEGORY_IDS as [string, ...string[]]),
  description: z.string().max(2000).optional(),
  contractAddress: z
    .string()
    .trim()
    .refine((v) => !v || /^0x[a-fA-F0-9]{40}$/.test(v), "Invalid EVM address")
    .optional()
    .or(z.literal("")),
  website: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  twitter: z.string().trim().max(50).optional().or(z.literal("")),
  telegram: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  submitterEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  submitterNote: z.string().max(500).optional(),
});

export async function submitProjectAction(_prev: unknown, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    description: (formData.get("description") as string) || undefined,
    contractAddress: (formData.get("contractAddress") as string) || "",
    website: (formData.get("website") as string) || "",
    twitter: (formData.get("twitter") as string) || "",
    telegram: (formData.get("telegram") as string) || "",
    submitterEmail: (formData.get("submitterEmail") as string) || "",
    submitterNote: (formData.get("submitterNote") as string) || undefined,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const d = parsed.data;

  await prisma.submission.create({
    data: {
      name: d.name,
      category: d.category,
      description: d.description,
      contractAddress: d.contractAddress || null,
      website: d.website || null,
      twitter: d.twitter || null,
      telegram: d.telegram || null,
      submitterEmail: d.submitterEmail || null,
      submitterNote: d.submitterNote || null,
    },
  });

  return { ok: true };
}
