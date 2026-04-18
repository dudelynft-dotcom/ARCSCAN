import type { Metadata } from "next";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "Submit a project",
  description: "Submit your project to be listed on the Arc explorer.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit a project</h1>
        <p className="mt-2 text-sm text-arc-muted">
          Building on Arc? Submit your project to be listed in the explorer.
          Submissions are reviewed by our team before going live.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
