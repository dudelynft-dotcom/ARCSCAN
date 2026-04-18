import type { Metadata } from "next";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "Submit a project",
  description: "Submit your project to be listed on the Arc explorer.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="eyebrow">Submit</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-700">
          List a project on Arc
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-500">
          Submissions go through a review process before appearing on the explorer.
          Include the contract address and official links to speed up approval.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
