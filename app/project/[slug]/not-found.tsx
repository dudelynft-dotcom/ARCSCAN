import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Project not found</h1>
      <p className="text-arc-muted">
        This project isn&apos;t in the directory yet. If you think it should be, let us know.
      </p>
      <Link href="/explorer" className="btn-primary inline-block">
        Back to explorer
      </Link>
    </div>
  );
}
