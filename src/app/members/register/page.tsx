export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getTurnstilePublicConfig } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/session";
import { MemberRegisterForm } from "@/modules/members/components/member-register-form";

export const metadata: Metadata = {
  title: "Create member account",
  description: "Register for a Canadian Jats Association member account.",
  robots: { index: false, follow: false },
};

export default async function MemberRegisterPage() {
  const user = await getCurrentUser();
  if (user?.role === "member") {
    redirect("/members");
  }

  const turnstile = await getTurnstilePublicConfig();

  return (
    <>
      <PageHero
        title="Create member account"
        description="One central account for members, directory, and future paid features."
        eyebrow="Members"
      />
      <section className="card admin-login-card">
        <MemberRegisterForm
          siteKey={turnstile.turnstileSiteKey}
          bypass={turnstile.turnstileBypass}
        />
      </section>
    </>
  );
}
