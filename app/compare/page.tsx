import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatNumber, formatUsd } from "@/lib/format";
import { displayScore, riskColor } from "@/lib/scoring";
import { VerifiedBadge } from "@/components/verified-badge";
import { CompareSelector } from "./compare-selector";
import Link from "next/link";

export const metadata: Metadata = { title: "Compare projects" };

type SP = Promise<{ a?: string; b?: string }>;

export default async function ComparePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const slugA = sp.a;
  const slugB = sp.b;

  const [projectA, projectB] = await Promise.all([
    slugA ? prisma.project.findUnique({ where: { slug: slugA }, include: { metrics: true, socials: true } }) : null,
    slugB ? prisma.project.findUnique({ where: { slug: slugB }, include: { metrics: true, socials: true } }) : null,
  ]);

  const allProjects = await prisma.project.findMany({
    where: { flagged: false },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  const rows = [
    { label: "Category", a: projectA?.category, b: projectB?.category },
    { label: "Verified", a: projectA?.verified ? "Yes" : "No", b: projectB?.verified ? "Yes" : "No" },
    { label: "Score", a: displayScore(projectA ?? {}).score?.toString() ?? "--", b: displayScore(projectB ?? {}).score?.toString() ?? "--" },
    { label: "Risk", a: projectA?.riskLevel ?? "--", b: projectB?.riskLevel ?? "--" },
    { label: "Holders", a: formatNumber(projectA?.metrics?.holders), b: formatNumber(projectB?.metrics?.holders) },
    { label: "Transactions", a: formatNumber(projectA?.metrics?.txCount), b: formatNumber(projectB?.metrics?.txCount) },
    { label: "TVL", a: formatUsd(projectA?.metrics?.tvl), b: formatUsd(projectB?.metrics?.tvl) },
    { label: "Volume 24h", a: formatUsd(projectA?.metrics?.volume24h), b: formatUsd(projectB?.metrics?.volume24h) },
    { label: "Website", a: projectA?.socials?.website ? "Yes" : "No", b: projectB?.socials?.website ? "Yes" : "No" },
    { label: "Twitter", a: projectA?.socials?.twitter ? `@${projectA.socials.twitter}` : "--", b: projectB?.socials?.twitter ? `@${projectB.socials.twitter}` : "--" },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare projects</h1>
        <p className="mt-1 text-sm text-arc-muted">
          Side-by-side comparison of two Arc ecosystem projects.
        </p>
      </div>

      <CompareSelector projects={allProjects} selectedA={slugA} selectedB={slugB} />

      {projectA && projectB ? (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arc-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-arc-muted">Metric</th>
                <th className="px-4 py-3 text-left">
                  <Link href={`/project/${projectA.slug}`} className="link font-semibold">
                    {projectA.name}
                  </Link>
                  <VerifiedBadge verified={projectA.verified} />
                </th>
                <th className="px-4 py-3 text-left">
                  <Link href={`/project/${projectB.slug}`} className="link font-semibold">
                    {projectB.name}
                  </Link>
                  <VerifiedBadge verified={projectB.verified} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arc-border">
              {rows.map((r) => (
                <tr key={r.label} className="hover:bg-arc-border/20">
                  <td className="px-4 py-2.5 text-xs text-arc-muted">{r.label}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{r.a ?? "--"}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{r.b ?? "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel p-8 text-center text-arc-muted">
          Select two projects above to compare them side by side.
        </div>
      )}
    </div>
  );
}
