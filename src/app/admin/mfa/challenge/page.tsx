export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AdminMfaChallengeForm } from "@/components/admin-mfa-forms";
import {
  getCurrentUser,
  getMfaPendingUserId,
} from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin MFA challenge",
  robots: { index: false, follow: false },
};

export default async function AdminMfaChallengePage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect("/admin");
  }
  const pending = await getMfaPendingUserId();
  if (!pending) {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHero
        title="Two-factor authentication"
        description="Enter the code from your authenticator app to finish signing in."
        eyebrow="Administration"
      />
      <section className="card admin-login-card">
        <AdminMfaChallengeForm />
        <p className="form-hint" style={{ marginTop: "1rem" }}>
          <Link href="/admin/login">Cancel and return to login</Link>
        </p>
      </section>
    </>
  );
}
