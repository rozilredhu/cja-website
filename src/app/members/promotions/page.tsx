export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { isFeatureEnabled } from "@/modules/admin/feature-flags";
import { FeatureUnavailable } from "@/components/feature-unavailable";
import {
  getOwnBusinesses,
  getOwnProfile,
} from "@/modules/directory/queries";
import { getOwnMatrimonialProfile } from "@/modules/matrimonial/queries";
import { cancelOwnPendingOrderAction } from "@/modules/payments/actions";
import { CreateOrderForm } from "@/modules/payments/components/create-order-form";
import {
  formatCadCents,
  PROMOTION_PACKAGES,
} from "@/modules/payments/packages";
import { listOrdersForUser } from "@/modules/payments/queries";

export const metadata: Metadata = {
  title: "Paid promotions",
  robots: { index: false, follow: false },
};

export default async function MemberPromotionsPage() {
  const user = await requireMemberUser();
  if (!(await isFeatureEnabled("promotions"))) {
    return (
      <FeatureUnavailable title="Paid promotions" moduleLabel="Paid promotions" />
    );
  }
  const [profile, businesses, matProfile, orders] = await Promise.all([
    getOwnProfile(user.id),
    getOwnBusinesses(user.id),
    getOwnMatrimonialProfile(user.id),
    listOrdersForUser(user.id),
  ]);

  const profileTargets =
    profile && profile.opted_in && !profile.disabled
      ? [
          {
            id: profile.id,
            label: `${profile.display_name || user.name || "My profile"} (#${profile.id})`,
          },
        ]
      : [];

  const businessTargets = businesses
    .filter((b) => b.opted_in && !b.disabled && b.status === "active")
    .map((b) => ({
      id: b.id,
      label: `${b.name} (#${b.id})`,
    }));

  const matrimonialTargets =
    matProfile && matProfile.status === "approved"
      ? [
          {
            id: matProfile.id,
            label: `Matrimonial #${matProfile.id} (${matProfile.gender})`,
          },
        ]
      : [];

  const activePackages = PROMOTION_PACKAGES.filter((p) => p.active);

  return (
    <>
      <PageHero
        title="Paid promotions"
        description="Highlight your directory, business, or matrimonial profile (CAD). Stub checkout — no real charges."
        eyebrow="Members"
      />

      <section className="card">
        <p>
          <Link href="/members">← Member area</Link>
          {" · "}
          <Link href="/members/directory">Directory</Link>
        </p>
        <p className="stub-note">
          Payments use the <strong>Stripe stub</strong> adapter. No Stripe keys
          are required. Card numbers are never collected or stored. Real Stripe
          secrets (<code>STRIPE_SECRET_KEY</code>,{" "}
          <code>STRIPE_WEBHOOK_SECRET</code>) will plug into{" "}
          <code>src/modules/payments/</code> later; webhooks at{" "}
          <code>/api/payments/webhook</code> become the source of truth then.
        </p>

        <h2>Packages</h2>
        <ul className="promo-package-list">
          {activePackages.map((p) => (
            <li key={p.code}>
              <strong>{p.name}</strong> — {formatCadCents(p.amountCadCents)} /{" "}
              {p.durationDays} days
              <br />
              <span className="muted">{p.description}</span>
            </li>
          ))}
        </ul>

        <CreateOrderForm
          packages={[...activePackages]}
          profileTargets={profileTargets}
          businessTargets={businessTargets}
          matrimonialTargets={matrimonialTargets}
        />
      </section>

      <section className="card">
        <h2>Your orders</h2>
        {orders.length === 0 ? (
          <p className="muted">No promotion orders yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Package</th>
                  <th>Target</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Ends</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.package_code}</td>
                    <td>
                      {o.target_type} #{o.target_id}
                    </td>
                    <td>{formatCadCents(o.amount_cad_cents)}</td>
                    <td>{o.status}</td>
                    <td>{o.ends_at ?? "—"}</td>
                    <td>
                      {o.status === "pending" ? (
                        <>
                          <Link
                            href={`/members/promotions/checkout/${o.id}`}
                            className="btn-secondary btn-small"
                          >
                            Pay
                          </Link>{" "}
                          <form
                            action={cancelOwnPendingOrderAction}
                            style={{ display: "inline" }}
                          >
                            <input type="hidden" name="order_id" value={o.id} />
                            <button
                              type="submit"
                              className="btn-secondary btn-small"
                            >
                              Cancel
                            </button>
                          </form>
                        </>
                      ) : o.status === "paid" ? (
                        <span className="promo-badge">Active / paid</span>
                      ) : (
                        "—"
                      )}
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
