export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { AdminMfaSetupPanel } from "@/components/admin-mfa-forms";
import { requireAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin MFA",
  robots: { index: false, follow: false },
};

export default async function AdminMfaPage() {
  const user = await requireAdminUser();

  return (
    <>
      <PageHero
        title="Admin MFA"
        description={`TOTP for ${user.email}`}
        eyebrow="Administration"
      />
      <section className="card admin-login-card">
        <AdminMfaSetupPanel enabled={user.totpEnabled} />
        <p className="form-hint" style={{ marginTop: "1rem" }}>
          <Link href="/admin">← Back to admin</Link>
        </p>
      </section>
    </>
  );
}
