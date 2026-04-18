import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";
import { signOutAction, quickToggleAction } from "./actions";
import { AdminProjectRow } from "./project-row";
import { AdminCreateForm } from "./create-form";
import { EnrichButton } from "./enrich-button";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; category?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const sp = await searchParams;
  const q = sp.q?.trim();
  const filter = sp.filter;
  const cat = sp.category;

  const projects = await prisma.project.findMany({
    where: {
      ...(q && {
        OR: [{ name: { contains: q } }, { description: { contains: q } }],
      }),
      ...(filter === "unverified" && { verified: false, flagged: false }),
      ...(filter === "flagged" && { flagged: true }),
      ...(filter === "verified" && { verified: true }),
      ...(cat && { category: cat }),
    },
    include: { socials: true },
    orderBy: [{ createdAt: "desc" }],
    take: 500,
  });

  const [total, verified, flagged] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { verified: true } }),
    prisma.project.count({ where: { flagged: true } }),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-arc-muted">
            {total} total · {verified} verified · {flagged} flagged
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/candidates" className="btn-primary">
            Discovery candidates
          </a>
          <a href="/admin/submissions" className="btn">
            Submissions
          </a>
          <EnrichButton />
          <form action={signOutAction}>
            <button type="submit" className="btn">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="panel p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-arc-muted">
          Add project
        </h2>
        <AdminCreateForm />
      </section>

      <section className="space-y-3">
        <form className="flex flex-wrap gap-2">
          <input
            name="q"
            placeholder="Search…"
            defaultValue={q ?? ""}
            className="input max-w-xs"
          />
          <select name="filter" defaultValue={filter ?? ""} className="input max-w-[180px]">
            <option value="">All</option>
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
            <option value="flagged">Flagged</option>
          </select>
          <select name="category" defaultValue={cat ?? ""} className="input max-w-[200px]">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <button className="btn">Filter</button>
          <a href="/admin" className="btn">
            Clear
          </a>
        </form>

        <div className="space-y-2">
          {projects.map((p) => (
            <AdminProjectRow
              key={p.id}
              project={p}
              quickToggle={quickToggleAction}
            />
          ))}
          {projects.length === 0 && (
            <div className="panel p-6 text-center text-arc-muted">No projects match.</div>
          )}
        </div>
      </section>
    </div>
  );
}
