export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireAdminUser } from "@/modules/auth/session";
import {
  adminResolveReportAction,
  adminReviewMatrimonialAction,
} from "@/modules/matrimonial/actions";
import {
  adminListAllProfiles,
  adminListOpenReports,
  adminListPendingProfiles,
  countOverduePending,
} from "@/modules/matrimonial/queries";
import { ageFromDob, isPendingOverdue } from "@/modules/matrimonial/utils";

export const metadata: Metadata = {
  title: "Admin — Matrimonial",
  robots: { index: false, follow: false },
};

export default async function AdminMatrimonialPage() {
  await requireAdminUser();
  const [pending, all, reports, overdueCount] = await Promise.all([
    adminListPendingProfiles(),
    adminListAllProfiles(100),
    adminListOpenReports(),
    countOverduePending(),
  ]);

  return (
    <>
      <PageHero
        title="Matrimonial review"
        description="Approve or reject pending profiles. Overdue = pending > 24 hours."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
        </p>

        {overdueCount > 0 ? (
          <p className="form-error">
            <strong>{overdueCount}</strong> pending profile
            {overdueCount === 1 ? "" : "s"} overdue (&gt; 24 hours).
          </p>
        ) : (
          <p className="muted">No overdue pending profiles.</p>
        )}

        <h2>Pending inbox ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="muted">Nothing pending.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Gender / age</th>
                  <th>City</th>
                  <th>Submitted</th>
                  <th>Flag</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => {
                  const age = ageFromDob(p.date_of_birth);
                  const overdue = isPendingOverdue(
                    p.submitted_at ?? p.created_at,
                  );
                  return (
                    <tr
                      key={p.id}
                      className={overdue ? "mat-row-overdue" : undefined}
                    >
                      <td>{p.id}</td>
                      <td>
                        {p.member_name}
                        <br />
                        <span className="muted">{p.member_email}</span>
                      </td>
                      <td>
                        {p.gender}
                        {age != null ? ` / ${age}` : ""}
                      </td>
                      <td>
                        {[p.city, p.province].filter(Boolean).join(", ")}
                      </td>
                      <td>{p.submitted_at ?? p.created_at}</td>
                      <td>
                        {overdue ? (
                          <span className="mat-overdue-badge">Overdue</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <form
                          action={adminReviewMatrimonialAction}
                          className="mat-admin-actions"
                        >
                          <input type="hidden" name="id" value={p.id} />
                          <input
                            name="admin_note"
                            type="text"
                            placeholder="Note (optional)"
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

        <h2 style={{ marginTop: "1.5rem" }}>
          Open reports ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p className="muted">No open reports.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Profile</th>
                  <th>Reporter</th>
                  <th>Reason</th>
                  <th>Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>#{r.reported_profile_id}</td>
                    <td>{r.reporter_email}</td>
                    <td>{r.reason}</td>
                    <td>{r.details ?? "—"}</td>
                    <td>
                      <form
                        action={adminResolveReportAction}
                        style={{ display: "inline" }}
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          name="status"
                          value="reviewed"
                          className="btn-secondary btn-small"
                        >
                          Reviewed
                        </button>{" "}
                        <button
                          type="submit"
                          name="status"
                          value="dismissed"
                          className="btn-secondary btn-small"
                        >
                          Dismiss
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 style={{ marginTop: "1.5rem" }}>All profiles ({all.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Gender</th>
                <th>Status</th>
                <th>City</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {all.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.member_name}</td>
                  <td>{p.gender}</td>
                  <td>{p.status}</td>
                  <td>{[p.city, p.province].filter(Boolean).join(", ")}</td>
                  <td>{p.updated_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
