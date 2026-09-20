export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { consumeVerificationToken } from "@/modules/auth/actions";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = token
    ? await consumeVerificationToken(token)
    : { error: "Missing verification token." };

  return (
    <>
      <PageHero
        title="Email verification"
        description="Confirming your member email address."
        eyebrow="Members"
      />
      <section className="card">
        {result.ok ? (
          <>
            <p className="form-success">{result.message}</p>
            <p>
              <Link className="btn-primary" href="/members">
                Go to member area
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="form-error">{result.error}</p>
            <p className="form-hint">
              You can request a new link after signing in from the member
              dashboard.
            </p>
            <p>
              <Link href="/members/login">Sign in</Link>
            </p>
          </>
        )}
      </section>
    </>
  );
}
