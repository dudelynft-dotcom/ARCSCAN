"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  projects: Array<{ slug: string; name: string }>;
  selectedA?: string;
  selectedB?: string;
}

export function CompareSelector({ projects, selectedA, selectedB }: Props) {
  const router = useRouter();
  const [a, setA] = useState(selectedA ?? "");
  const [b, setB] = useState(selectedB ?? "");

  function go() {
    if (!a || !b) return;
    router.push(`/compare?a=${a}&b=${b}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block text-sm flex-1 min-w-[200px]">
        <span className="text-arc-muted">Project A</span>
        <select value={a} onChange={(e) => setA(e.target.value)} className="input mt-1">
          <option value="">Select project...</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </label>
      <span className="pb-2 text-arc-muted">vs</span>
      <label className="block text-sm flex-1 min-w-[200px]">
        <span className="text-arc-muted">Project B</span>
        <select value={b} onChange={(e) => setB(e.target.value)} className="input mt-1">
          <option value="">Select project...</option>
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </label>
      <button onClick={go} disabled={!a || !b} className="btn-primary">
        Compare
      </button>
    </div>
  );
}
