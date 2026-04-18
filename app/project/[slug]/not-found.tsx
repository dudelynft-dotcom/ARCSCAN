import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface mx-auto max-w-lg p-10 text-center">
      <div className="eyebrow">404</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-700">
        Project not found
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        This project isn&apos;t in the directory. If it should be, let us know.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link href="/explorer" className="btn-primary">
          Back to explorer
        </Link>
        <Link href="/submit" className="btn">
          Submit a project
        </Link>
      </div>
    </div>
  );
}
