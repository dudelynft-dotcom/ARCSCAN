import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 pt-2">{children}</div>;
}
