export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { memberLogoutAction } from "@/modules/auth/actions";
import { isAdmin } from "@/modules/auth/roles";
import { requireMemberUser } from "@/modules/auth/session";
import { ResendVerificationForm } from "@/modules/members/components/resend-verification-form";

export const metadata: Metadata = {
  title: "Member area",
  robots: { index: false, follow: false },
};

export default async function MembersDashboardPage() {
  const user = await requireMemberUser();

  return (
    <>
      <PageHero
        title="Member area"
        description={`Welcome, ${user.name || user.email}`}
        eyebrow="Members"
      />

      {!user.emailVerified && user.role === "member" ? (
        <section className="card" style={{ marginBottom: "1rem" }}>
          <h2>Verify your email</h2>
          <p className="muted">
            Your account is active. Email delivery is stubbed in staging/dev —
            use the sample link from registration or resend below.
          </p>
          <ResendVerificationForm />
        </section>
      ) : null}

      <section className="card">
        <h2>Dashboard</h2>
        <p className="muted">
          Signed in as <strong>{user.email}</strong> ({user.role}
          {user.emailVerified ? ", email verified" : ""}).
        </p>
        <ul className="member-dash-links">
          <li>
            <Link href="/members/directory">Directory</Link>
          </li>
          <li>
            <Link href="/members/promotions">Paid promotions (CAD stub)</Link>
          </li>
          <li>
            <Link href="/members/matrimonial">Matrimonial</Link>
          </li>
          <li>
            <Link href="/members/services">Services</Link>
          </li>
          <li>
            <Link href="/services">Browse Services (public)</Link>
          </li>
          {isAdmin(user) ? (
            <li>
              <Link href="/admin">Admin dashboard</Link>
            </li>
          ) : null}
        </ul>
        <form action={memberLogoutAction} style={{ marginTop: "1.25rem" }}>
          <button type="submit" className="btn-secondary">
            Sign out
          </button>
        </form>
      </section>
    </>
  );
}
