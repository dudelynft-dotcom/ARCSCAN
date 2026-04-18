import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatNumber, formatUsd } from "@/lib/format";
import { displayScore } from "@/lib/scoring";
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
    slugA
      ? prisma.project.findUnique({
          where: { slug: slugA },
          include: { metrics: true, socials: true },
        })
      : null,
    slugB
      ? prisma.project.findUnique({
          where: { slug: slugB },
          include: { metrics: true, socials: true },
        })
      : null,
  ]);

  const allProjects = await prisma.project.findMany({
    where: { flagged: false },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  const rows = [
    { label: "Category", a: projectA?.category, b: projectB?.category },
    {
      label: "Verified",
      a: projectA?.verified ? "Yes" : "No",
      b: projectB?.verified ? "Yes" : "No",
    },
    {
      label: "Score",
      a: displayScore(projectA ?? {}).score?.toString() ?? "—",
      b: displayScore(projectB ?? {}).score?.toString() ?? "—",
    },
    { label: "Risk", a: projectA?.riskLevel ?? "—", b: projectB?.riskLevel ?? "—" },
    {
      label: "Holders",
      a: formatNumber(projectA?.metrics?.holders),
      b: formatNumber(projectB?.metrics?.holders),
    },
    {
      label: "Transactions",
      a: formatNumber(projectA?.metrics?.txCount),
      b: formatNumber(projectB?.metrics?.txCount),
    },
    {
      label: "Unique users",
      a: formatNumber(projectA?.metrics?.uniqueUsers),
      b: formatNumber(projectB?.metrics?.uniqueUsers),
    },
    { label: "TVL", a: formatUsd(projectA?.metrics?.tvl), b: formatUsd(projectB?.metrics?.tvl) },
    {
      label: "Volume 24h",
      a: formatUsd(projectA?.metrics?.volume24h),
      b: formatUsd(projectB?.metrics?.volume24h),
    },
    {
      label: "Website",
      a: projectA?.socials?.website ? "Yes" : "No",
      b: projectB?.socials?.website ? "Yes" : "No",
    },
    {
      label: "Twitter",
      a: projectA?.socials?.twitter ? `@${projectA.socials.twitter}` : "—",
      b: projectB?.socials?.twitter ? `@${projectB.socials.twitter}` : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Compare</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-700">
          Side-by-side comparison
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Pick two Arc projects to compare on-chain metrics and metadata.
        </p>
      </div>

      <CompareSelector projects={allProjects} selectedA={slugA} selectedB={slugB} />

      {projectA && projectB ? (
        <div className="surface overflow-x-auto">
          <table className="data-table min-w-[560px]">
            <thead>
              <tr>
                <th className="w-1/4">Metric</th>
                <th>
                  <Link
                    href={`/project/${projectA.slug}`}
                    className="font-medium text-ink-700 hover:underline"
                  >
                    {projectA.name}
                  </Link>
                  <span className="ml-2">
                    <VerifiedBadge verified={projectA.verified} />
                  </span>
                </th>
                <th>
                  <Link
                    href={`/project/${projectB.slug}`}
                    className="font-medium text-ink-700 hover:underline"
                  >
                    {projectB.name}
                  </Link>
                  <span className="ml-2">
                    <VerifiedBadge verified={projectB.verified} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="eyebrow">{r.label}</td>
                  <td className="mono text-ink-700">{r.a ?? "—"}</td>
                  <td className="mono text-ink-700">{r.b ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="surface p-10 text-center text-sm text-ink-500">
          Select two projects above to compare them side by side.
        </div>
      )}
    </div>
  );
}
