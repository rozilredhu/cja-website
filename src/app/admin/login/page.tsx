export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin login",
  description: "Redirects to the unified login page.",
  robots: { index: false, follow: false },
};

/** Old /admin/login URL — redirect to unified login (admin section). */
export default async function AdminLoginRedirectPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect("/admin");
  }
  redirect("/members/login#admin");
}
