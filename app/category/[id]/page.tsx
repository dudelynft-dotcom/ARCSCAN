import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CATEGORY_MAP, type CategoryId } from "@/lib/categories";
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
    description: `${cat.blurb} — discover and track ${cat.label.toLowerCase()} projects building on Arc blockchain.`,
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

  const totalHolders = projects.reduce((s, p) => s + ((p as unknown as { metrics?: { holders?: number } }).metrics?.holders ?? 0), 0);

  return (
    <div className="space-y-6 pt-2">
      <div>
        <Link href="/explorer" className="text-sm text-arc-muted hover:text-white">
          All projects
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{cat.label}</h1>
        <p className="mt-1 text-sm text-arc-muted">{cat.blurb}</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="panel px-3 py-1">{projects.length} projects</span>
          {totalHolders > 0 && (
            <span className="panel px-3 py-1">{totalHolders.toLocaleString()} total holders</span>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="panel p-8 text-center text-arc-muted">
          No {cat.label.toLowerCase()} projects listed yet.{" "}
          <Link href="/submit" className="link">Submit one</Link>.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
