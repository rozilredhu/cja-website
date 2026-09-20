export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { PageHero } from "@/components/page-hero";
import { getCurrentUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin login",
  description: "Administrator sign-in for CJA site management.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <>
      <PageHero
        title="Admin login"
        description="Separate from member accounts. Sample credentials are in the README."
        eyebrow="Administration"
      />
      <section className="card admin-login-card">
        <AdminLoginForm />
      </section>
    </>
  );
}
