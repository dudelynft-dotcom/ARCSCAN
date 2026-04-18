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
    <div className="surface p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
        <label className="block">
          <span className="eyebrow">Project A</span>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="input mt-1.5"
          >
            <option value="">Select...</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <span className="self-center text-center text-2xs uppercase tracking-wider text-ink-400">
          vs
        </span>
        <label className="block">
          <span className="eyebrow">Project B</span>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="input mt-1.5"
          >
            <option value="">Select...</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={go} disabled={!a || !b} className="btn-primary">
          Compare
        </button>
      </div>
    </div>
  );
}
