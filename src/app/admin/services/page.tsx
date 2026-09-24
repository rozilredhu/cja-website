export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireAdminUser } from "@/modules/auth/session";
import {
  adminDisableServiceListingAction,
  adminReviewServiceListingAction,
} from "@/modules/services/actions";
import { formatCadCents } from "@/modules/services/pricing";
import {
  adminListLive,
  adminListPending,
  countOverduePendingServices,
  isPendingOverdue,
  markExpiredListings,
} from "@/modules/services/queries";

export const metadata: Metadata = {
  title: "Admin — Services",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  await requireAdminUser();
  await markExpiredListings().catch(() => 0);

  const [pending, live, overdueCount] = await Promise.all([
    adminListPending(),
    adminListLive(100),
    countOverduePendingServices(),
  ]);

  return (
    <>
      <PageHero
        title="Services moderation"
        description="Approve or reject paid listings. Overdue = pending approval > 24 hours after payment. Live duration starts at approval."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
          {" · "}
          <Link href="/services">Public Services</Link>
        </p>

        {overdueCount > 0 ? (
          <p className="form-error">
            <strong>{overdueCount}</strong> pending listing
            {overdueCount === 1 ? "" : "s"} overdue (&gt; 24 hours since payment).
          </p>
        ) : (
          <p className="muted">No overdue pending listings.</p>
        )}

        <h2>Pending approval ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="muted">Nothing pending.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Business</th>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Paid</th>
                  <th>Flag</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => {
                  const overdue = isPendingOverdue(p.paid_at);
                  return (
                    <tr
                      key={p.id}
                      className={overdue ? "mat-row-overdue" : undefined}
                    >
                      <td>{p.id}</td>
                      <td>
                        {p.business_name}
                        <br />
                        <span className="muted">
                          {p.category_name ?? p.category_slug} · {p.city},{" "}
                          {p.province}
                        </span>
                      </td>
                      <td>
                        {p.member_name}
                        <br />
                        <span className="muted">{p.member_email}</span>
                      </td>
                      <td>
                        {p.plan_tier}
                        <br />
                        <span className="muted">
                          {p.amount_cents != null
                            ? formatCadCents(p.amount_cents)
                            : "—"}{" "}
                          / {p.duration_days}d
                        </span>
                      </td>
                      <td>{p.paid_at ?? "—"}</td>
                      <td>
                        {overdue ? (
                          <span className="mat-overdue-badge">Overdue</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <form
                          action={adminReviewServiceListingAction}
                          className="mat-admin-actions"
                        >
                          <input type="hidden" name="id" value={p.id} />
                          <input
                            name="admin_note"
                            type="text"
                            placeholder="Reject note (optional)"
                          />
                          <button
                            type="submit"
                            name="decision"
                            value="approve"
                            className="btn-saffron btn-small"
                          >
                            Approve
                          </button>
                          <button
                            type="submit"
                            name="decision"
                            value="reject"
                            className="btn-secondary btn-small"
                          >
                            Reject
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <h2 style={{ marginTop: "1.5rem" }}>Live listings ({live.length})</h2>
        {live.length === 0 ? (
          <p className="muted">No live listings.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Business</th>
                  <th>Member</th>
                  <th>Approved</th>
                  <th>Expires</th>
                  <th>Disabled</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {live.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>
                      {l.business_name}
                      <br />
                      <span className="muted">
                        {l.category_name ?? l.category_slug} · {l.city}
                      </span>
                    </td>
                    <td>
                      <span className="muted">{l.member_email}</span>
                    </td>
                    <td>{l.approved_at?.slice(0, 10) ?? "—"}</td>
                    <td>{l.expires_at?.slice(0, 10) ?? "—"}</td>
                    <td>{l.disabled ? "yes" : "no"}</td>
                    <td>
                      <form action={adminDisableServiceListingAction}>
                        <input type="hidden" name="id" value={l.id} />
                        <input
                          type="hidden"
                          name="disabled"
                          value={l.disabled ? "0" : "1"}
                        />
                        <button type="submit" className="btn-secondary btn-small">
                          {l.disabled ? "Enable" : "Disable"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
