export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import {
  startServicesCheckoutAction,
  stubPayServiceListingAction,
} from "@/modules/services/actions";
import {
  SERVICE_PLANS,
  formatCadCents,
  getPlanByTier,
} from "@/modules/services/pricing";
import { getOwnListing } from "@/modules/services/queries";
import { hasStripeSecret } from "@/modules/services/stripe";

export const metadata: Metadata = {
  title: "Checkout — Services",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
};

export default async function ServicesCheckoutPage({
  params,
  searchParams,
}: Props) {
  const user = await requireMemberUser();
  const { listingId: raw } = await params;
  const sp = await searchParams;
  const listingId = Number(raw);
  if (!Number.isFinite(listingId)) notFound();

  const listing = await getOwnListing(listingId, user.id);
  if (!listing) notFound();

  const stripeReady = await hasStripeSecret();
  const plan = getPlanByTier(listing.plan_tier || "monthly");
  const justPaid =
    sp.paid === "1" || listing.status === "pending_approval";

  return (
    <>
      <PageHero
        title="Services checkout"
        description={
          stripeReady
            ? "Stripe Checkout — one-time CAD payment for your listing period."
            : "Stub checkout — no Stripe keys; demo pay sets pending_approval."
        }
        eyebrow="Members"
      />

      <section className="card">
        <p>
          <Link href="/members/services">← My listings</Link>
        </p>

        <h2>
          {listing.business_name}{" "}
          <span className="muted">#{listing.id}</span>
        </h2>
        <dl className="promo-order-dl">
          <div>
            <dt>Category</dt>
            <dd>{listing.category_slug}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>
              {listing.city}, {listing.province}
            </dd>
          </div>
          <div>
            <dt>Plan</dt>
            <dd>
              {plan?.name ?? listing.plan_tier} —{" "}
              {formatCadCents(
                listing.amount_cents ?? plan?.amountCadCents ?? 0,
              )}{" "}
              / {listing.duration_days ?? plan?.durationDays} days after
              approval
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{listing.status}</dd>
          </div>
          {listing.paid_at ? (
            <div>
              <dt>Paid at</dt>
              <dd>{listing.paid_at}</dd>
            </div>
          ) : null}
          {listing.payment_ref ? (
            <div>
              <dt>Payment ref</dt>
              <dd>
                <code>{listing.payment_ref}</code>
              </dd>
            </div>
          ) : null}
        </dl>

        {justPaid && listing.status === "pending_approval" ? (
          <p className="form-success">
            Payment recorded. Your listing is{" "}
            <strong>pending admin approval</strong> (target within 24 hours).
            It will go live only after approval; the {listing.duration_days}-day
            period starts then.
          </p>
        ) : null}

        {sp.cancelled === "1" ? (
          <p className="form-error">Checkout cancelled — you can try again.</p>
        ) : null}

        {listing.status === "pending_payment" ||
        listing.status === "rejected" ||
        listing.status === "expired" ? (
          <>
            {!stripeReady ? (
              <p className="stub-note">
                <strong>Stub mode</strong> (no <code>STRIPE_SECRET_KEY</code>).
                Choose a tier and click stub pay — status becomes{" "}
                <code>pending_approval</code>, not live.
              </p>
            ) : (
              <p className="muted">
                Real Stripe Checkout will open for a one-time CAD payment.
              </p>
            )}

            <h3>Choose plan</h3>
            <div
              style={{
                display: "grid",
                gap: "0.75rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {SERVICE_PLANS.map((p) => (
                <div key={p.tier} className="card">
                  <h4>{p.name}</h4>
                  <p>
                    <strong>{formatCadCents(p.amountCadCents)}</strong> CAD
                  </p>
                  <p className="muted">{p.description}</p>
                  {stripeReady ? (
                    <form action={startServicesCheckoutAction}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="plan_tier" value={p.tier} />
                      <button type="submit" className="btn-saffron btn-small">
                        Pay with Stripe
                      </button>
                    </form>
                  ) : (
                    <form action={stubPayServiceListingAction}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="plan_tier" value={p.tier} />
                      <button type="submit" className="btn-saffron btn-small">
                        Stub pay {formatCadCents(p.amountCadCents)}
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {listing.status === "live" ? (
          <p className="form-success">
            Listing is live until <strong>{listing.expires_at}</strong>.
          </p>
        ) : null}
      </section>
    </>
  );
}
