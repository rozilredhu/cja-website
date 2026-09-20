export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireAdminUser } from "@/modules/auth/session";
import { adminSetOrderStatusAction } from "@/modules/payments/actions";
import { formatCadCents } from "@/modules/payments/packages";
import { adminListOrders } from "@/modules/payments/queries";

export const metadata: Metadata = {
  title: "Admin — Promotions",
  robots: { index: false, follow: false },
};

export default async function AdminPromotionsPage() {
  await requireAdminUser();
  const orders = await adminListOrders();

  return (
    <>
      <PageHero
        title="Promotion orders"
        description="List orders; mark expired or cancelled. CAD only — no card data stored."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
        </p>
        <p className="form-hint">
          Expiry is enforced at query time (<code>status = paid</code> and{" "}
          <code>ends_at &gt; now</code>). Marking expired/cancelled here is for
          admin housekeeping; optional cron can automate status flips later.
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Package</th>
                <th>Target</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Ends</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="muted">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.user_id}</td>
                    <td>{o.package_code}</td>
                    <td>
                      {o.target_type} #{o.target_id}
                    </td>
                    <td>{formatCadCents(o.amount_cad_cents)}</td>
                    <td>{o.status}</td>
                    <td>
                      {o.provider}
                      {o.provider_ref ? (
                        <>
                          <br />
                          <code className="admin-code">{o.provider_ref}</code>
                        </>
                      ) : null}
                    </td>
                    <td>{o.ends_at ?? "—"}</td>
                    <td>
                      {o.status === "paid" || o.status === "pending" ? (
                        <div className="admin-action-stack">
                          <form action={adminSetOrderStatusAction}>
                            <input type="hidden" name="order_id" value={o.id} />
                            <input type="hidden" name="status" value="expired" />
                            <button
                              type="submit"
                              className="btn-secondary btn-small"
                            >
                              Mark expired
                            </button>
                          </form>
                          <form action={adminSetOrderStatusAction}>
                            <input type="hidden" name="order_id" value={o.id} />
                            <input
                              type="hidden"
                              name="status"
                              value="cancelled"
                            />
                            <button
                              type="submit"
                              className="btn-secondary btn-small"
                            >
                              Cancel
                            </button>
                          </form>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
