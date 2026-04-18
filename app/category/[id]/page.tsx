import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CATEGORY_MAP } from "@/lib/categories";
import { ProjectCard } from "@/components/project-card";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = CATEGORY_MAP[id];
  if (!cat) return { title: "Not found" };
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ArcRadar";
  return {
    title: `${cat.label} projects on Arc`,
    description: `${cat.blurb} — discover and track ${cat.label.toLowerCase()} projects on Arc blockchain.`,
    openGraph: {
      title: `${cat.label} on Arc — ${appName}`,
      description: cat.blurb,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = CATEGORY_MAP[id];
  if (!cat) notFound();

  const projects = await prisma.project.findMany({
    where: { category: id, flagged: false },
    orderBy: [{ verified: "desc" }, { scoreOverride: "desc" }, { createdAt: "desc" }],
    include: { metrics: true },
  });

  const totalHolders = projects.reduce(
    (s, p) =>
      s + ((p as unknown as { metrics?: { holders?: number } }).metrics?.holders ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">
          <Link href="/explorer" className="hover:text-ink-700">
            Explorer
          </Link>
          <span className="mx-2">/</span>
          <span>{cat.label}</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-700">
          {cat.label}
        </h1>
        <p className="mt-1 text-sm text-ink-500">{cat.blurb}</p>
        <div className="mt-4 flex gap-3 text-sm">
          <div className="surface px-4 py-2">
            <span className="eyebrow">Projects</span>
            <span className="mono ml-2 font-semibold text-ink-700">{projects.length}</span>
          </div>
          {totalHolders > 0 && (
            <div className="surface px-4 py-2">
              <span className="eyebrow">Total holders</span>
              <span className="mono ml-2 font-semibold text-ink-700">
                {totalHolders.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="surface p-10 text-center text-sm text-ink-500">
          No {cat.label.toLowerCase()} projects listed yet.{" "}
          <Link href="/submit" className="link">
            Submit one
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p, i) => (
            <div
              key={p.id}
              className={`surface -m-px ${i === 0 ? "" : ""}`}
            >
              <ProjectCard p={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
