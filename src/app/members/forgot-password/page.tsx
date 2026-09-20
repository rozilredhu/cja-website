export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { getTurnstilePublicConfig } from "@/lib/env";
import { ForgotPasswordForm } from "@/modules/members/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const turnstile = await getTurnstilePublicConfig();

  return (
    <>
      <PageHero
        title="Forgot password"
        description="We will prepare a reset link. In staging/dev, email is stubbed and the sample link is shown on success."
        eyebrow="Members"
      />
      <section className="card admin-login-card">
        <ForgotPasswordForm
          siteKey={turnstile.turnstileSiteKey}
          bypass={turnstile.turnstileBypass}
        />
      </section>
    </>
  );
}
