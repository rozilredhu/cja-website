export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { adminLogoutAction } from "@/modules/auth/actions";
import { getCurrentUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHero
        title="Admin dashboard"
        description={`Signed in as ${user.email}`}
        eyebrow="Administration"
      />
      <section className="card">
        <h2>Administration</h2>
        <p className="muted">
          Officials manager, members, directory approvals, news CMS, and
          matrimonial review will attach here in later modules.
        </p>
        <ul className="member-dash-links">
          <li>
            <Link href="/admin/mfa">
              Admin MFA {user.totpEnabled ? "(enabled)" : "(not enabled)"}
            </Link>
          </li>
          <li>
            <Link href="/admin/directory">Community Directory moderation</Link>
          </li>
          <li>
            <Link href="/members">Member area</Link>
          </li>
          <li>
            <Link href="/members/directory">Member directory (browse)</Link>
          </li>
        </ul>
        <form action={adminLogoutAction} style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn-secondary">
            Sign out
          </button>
        </form>
      </section>
    </>
  );
}
