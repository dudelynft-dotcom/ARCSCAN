import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.newsletter.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json({ ok: true, message: "Already subscribed" });
  }

  await prisma.newsletter.create({ data: { email: parsed.data.email } });
  return NextResponse.json({ ok: true, message: "Subscribed" });
}
