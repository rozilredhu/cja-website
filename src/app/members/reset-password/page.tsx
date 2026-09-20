export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ResetPasswordForm } from "@/modules/members/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <>
      <PageHero
        title="Set a new password"
        description="Choose a new password for your member account."
        eyebrow="Members"
      />
      <section className="card admin-login-card">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="form-error">
            Missing reset token. Request a new link from{" "}
            <a href="/members/forgot-password">forgot password</a>.
          </p>
        )}
      </section>
    </>
  );
}
