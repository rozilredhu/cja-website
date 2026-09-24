export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { adminLogoutAction } from "@/modules/auth/actions";
import { requireAdminUser } from "@/modules/auth/session";
import { listFeatureFlags } from "@/modules/admin/feature-flags";
import { getDashboardCounts } from "@/modules/admin/queries";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const user = await requireAdminUser();
  const [counts, flags] = await Promise.all([
    getDashboardCounts(),
    listFeatureFlags(),
  ]);

  const cards: {
    href: string;
    title: string;
    description: string;
    badge?: string | null;
    badgeTone?: "warn" | "ok" | "muted";
  }[] = [
    {
      href: "/admin/officials",
      title: "Officials manager",
      description: "Add, edit, reorder, activate, archive leadership (§4).",
      badge: `${counts.officialsActive} active`,
      badgeTone: "ok",
    },
    {
      href: "/admin/members",
      title: "Members",
      description: "Search users, view roles, enable/disable accounts.",
      badge:
        counts.membersDisabled > 0
          ? `${counts.membersDisabled} disabled`
          : null,
      badgeTone: "muted",
    },
    {
      href: "/admin/directory",
      title: "Directory moderation",
      description: "Disable abused member profiles and businesses.",
      badge:
        counts.directoryDisabledProfiles + counts.directoryDisabledBusinesses >
        0
          ? `${counts.directoryDisabledProfiles + counts.directoryDisabledBusinesses} disabled flags`
          : null,
      badgeTone: "muted",
    },
    {
      href: "/admin/news",
      title: "News / CMS",
      description: "Create and publish news articles (title, slug, body).",
      badge:
        counts.newsDrafts > 0 ? `${counts.newsDrafts} draft(s)` : null,
      badgeTone: "warn",
    },
    {
      href: "/admin/matrimonial",
      title: "Matrimonial review",
      description: "Approve/reject profiles. Overdue if pending > 24h.",
      badge:
        counts.matrimonialOverdue > 0
          ? `${counts.matrimonialOverdue} overdue / ${counts.matrimonialPending} pending`
          : counts.matrimonialPending > 0
            ? `${counts.matrimonialPending} pending`
            : null,
      badgeTone: counts.matrimonialOverdue > 0 ? "warn" : "muted",
    },
    {
      href: "/admin/services",
      title: "Services moderation",
      description: "Approve/reject paid service listings. Overdue if pending > 24h.",
      badge:
        counts.servicesOverdue > 0
          ? `${counts.servicesOverdue} overdue / ${counts.servicesPending} pending`
          : counts.servicesPending > 0
            ? `${counts.servicesPending} pending`
            : null,
      badgeTone: counts.servicesOverdue > 0 ? "warn" : "muted",
    },
    {
      href: "/admin/promotions",
      title: "Promotion orders",
      description: "Review paid promotion stub orders.",
    },
    {
      href: "/admin/features",
      title: "Feature switches",
      description: "Toggle directory, matrimonial, promotions, volunteer.",
      badge: `${flags.filter((f) => f.enabled).length}/${flags.length} on`,
      badgeTone: "ok",
    },
    {
      href: "/admin/settings",
      title: "Site settings",
      description: "Maintenance mode and site-wide flags.",
      badge: counts.maintenanceMode ? "Maintenance ON" : "Live",
      badgeTone: counts.maintenanceMode ? "warn" : "ok",
    },
    {
      href: "/admin/mfa",
      title: "Admin MFA",
      description: user.totpEnabled
        ? "TOTP enabled for this admin account."
        : "Set up TOTP for stronger admin sign-in.",
      badge: user.totpEnabled ? "enabled" : "not enabled",
      badgeTone: user.totpEnabled ? "ok" : "warn",
    },
  ];

  return (
    <>
      <PageHero
        title="Admin dashboard"
        description={`Signed in as ${user.email}`}
        eyebrow="Administration"
      />

      <section className="admin-hub-grid" aria-label="Admin tools">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="admin-hub-card">
            <h2>{c.title}</h2>
            <p className="muted">{c.description}</p>
            {c.badge ? (
              <span
                className={
                  c.badgeTone === "warn"
                    ? "admin-hub-badge admin-hub-badge-warn"
                    : c.badgeTone === "ok"
                      ? "admin-hub-badge admin-hub-badge-ok"
                      : "admin-hub-badge"
                }
              >
                {c.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <ul className="member-dash-links">
          <li>
            <Link href="/members">Member area</Link>
          </li>
          <li>
            <Link href="/officials">Public Officials page</Link>
          </li>
          <li>
            <Link href="/news">Public News page</Link>
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
