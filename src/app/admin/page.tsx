export const dynamic = "force-dynamic";

import type { Metadata } from "next";
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
        <h2>Foundation ready</h2>
        <p className="muted">
          Officials manager, members, directory approvals, news CMS, and
          matrimonial review will attach here in later modules.
        </p>
        <form action={adminLogoutAction} style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn-secondary">
            Sign out
          </button>
        </form>
      </section>
    </>
  );
}
