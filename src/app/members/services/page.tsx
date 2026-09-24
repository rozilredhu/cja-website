export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { FeatureUnavailable } from "@/components/feature-unavailable";
import { isFeatureEnabled } from "@/modules/admin/feature-flags";
import { requireMemberUser } from "@/modules/auth/session";
import {
  deleteOwnPendingListingAction,
} from "@/modules/services/actions";
import { ServiceListingForm } from "@/modules/services/components/listing-form";
import { formatUsdCents } from "@/modules/services/pricing";
import {
  listCategories,
  listOwnListings,
} from "@/modules/services/queries";

export const metadata: Metadata = {
  title: "My service listings",
  robots: { index: false, follow: false },
};

export default async function MemberServicesPage() {
  const user = await requireMemberUser();
  if (!(await isFeatureEnabled("services"))) {
    return (
      <FeatureUnavailable title="Services" moduleLabel="Services marketplace" />
    );
  }

  const [categories, listings] = await Promise.all([
    listCategories(),
    listOwnListings(user.id),
  ]);

  return (
    <>
      <PageHero
        title="My service listings"
        description="Create a listing, pay ($10 / $25 / $90 USD), then wait for admin approval before it goes live."
        eyebrow="Members"
      />

      <section className="card">
        <p>
          <Link href="/members">← Member area</Link>
          {" · "}
          <Link href="/services">Public Services browse</Link>
        </p>
        <p className="stub-note">
          Checkout uses <strong>Stripe</strong> when{" "}
          <code>STRIPE_SECRET_KEY</code> is set; otherwise a clear{" "}
          <strong>stub pay</strong> flow marks the listing{" "}
          <code>pending_approval</code> (not live) for demo.
        </p>
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Your listings</h2>
        {listings.length === 0 ? (
          <p className="muted">No listings yet — create one below.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.business_name}</td>
                    <td>{l.category_slug}</td>
                    <td>
                      {l.plan_tier ?? "—"}
                      {l.amount_cents != null
                        ? ` (${formatUsdCents(l.amount_cents)})`
                        : ""}
                    </td>
                    <td>{l.status}</td>
                    <td>{l.expires_at?.slice(0, 10) ?? "—"}</td>
                    <td>
                      {(l.status === "pending_payment" ||
                        l.status === "rejected" ||
                        l.status === "expired") && (
                        <>
                          <Link
                            href={`/members/services/checkout/${l.id}`}
                            className="btn-secondary btn-small"
                          >
                            Pay / renew
                          </Link>{" "}
                          <form
                            action={deleteOwnPendingListingAction}
                            style={{ display: "inline" }}
                          >
                            <input type="hidden" name="id" value={l.id} />
                            <button
                              type="submit"
                              className="btn-secondary btn-small"
                            >
                              Delete
                            </button>
                          </form>
                        </>
                      )}
                      {l.status === "pending_approval" ? (
                        <span className="muted">Awaiting admin</span>
                      ) : null}
                      {l.status === "live" ? (
                        <span className="promo-badge">Live</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Create listing</h2>
        <ServiceListingForm categories={categories} />
      </section>
    </>
  );
}
