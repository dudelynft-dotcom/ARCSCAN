import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAuthed()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm pt-12">
      <h1 className="mb-2 text-2xl font-bold">Admin login</h1>
      <p className="mb-6 text-sm text-arc-muted">
        Enter the admin password set in <code>ADMIN_PASSWORD</code>.
      </p>
      <LoginForm />
    </div>
  );
}
