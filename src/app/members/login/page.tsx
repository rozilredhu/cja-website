export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getCurrentUser } from "@/modules/auth/session";
import { MemberLoginForm } from "@/modules/members/components/member-login-form";

export const metadata: Metadata = {
  title: "Member login",
  description: "Sign in to your Canadian Jats Association member account.",
  robots: { index: false, follow: false },
};

export default async function MemberLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "member" || user?.role === "admin") {
    redirect("/members");
  }

  return (
    <>
      <PageHero
        title="Member login"
        description="Separate from admin sign-in. Sample credentials are in the README."
        eyebrow="Members"
      />
      <section className="card admin-login-card">
        <MemberLoginForm />
      </section>
    </>
  );
}
