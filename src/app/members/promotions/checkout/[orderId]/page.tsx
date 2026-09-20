export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { stubPayOrderAction } from "@/modules/payments/actions";
import {
  formatCadCents,
  getPackageByCode,
} from "@/modules/payments/packages";
import { getOwnOrder } from "@/modules/payments/queries";

export const metadata: Metadata = {
  title: "Checkout — Promotions",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function PromotionCheckoutPage({
  params,
  searchParams,
}: Props) {
  const user = await requireMemberUser();
  const { orderId: raw } = await params;
  const sp = await searchParams;
  const orderId = Number(raw);
  if (!Number.isFinite(orderId)) notFound();

  const order = await getOwnOrder(orderId, user.id);
  if (!order) notFound();

  const pkg = getPackageByCode(order.package_code);
  const justPaid = sp.paid === "1" || order.status === "paid";

  return (
    <>
      <PageHero
        title="Checkout"
        description="Stripe stub — simulate payment without card data."
        eyebrow="Promotions"
      />

      <section className="card">
        <p>
          <Link href="/members/promotions">← Promotions</Link>
        </p>

        <h2>Order #{order.id}</h2>
        <dl className="promo-order-dl">
          <div>
            <dt>Package</dt>
            <dd>{pkg?.name ?? order.package_code}</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>
              {order.target_type} #{order.target_id}
            </dd>
          </div>
          <div>
            <dt>Amount (CAD)</dt>
            <dd>{formatCadCents(order.amount_cad_cents)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{order.status}</dd>
          </div>
          {order.ends_at ? (
            <div>
              <dt>Promoted until</dt>
              <dd>{order.ends_at}</dd>
            </div>
          ) : null}
          {order.provider_ref ? (
            <div>
              <dt>Provider ref</dt>
              <dd>
                <code>{order.provider_ref}</code>
              </dd>
            </div>
          ) : null}
        </dl>

        {justPaid && order.status === "paid" ? (
          <p className="form-success">
            Payment simulated successfully. Your listing is promoted until{" "}
            <strong>{order.ends_at}</strong>. Browse lists show promoted items
            first with a badge (query-time filter; expired rows drop
            automatically).
          </p>
        ) : null}

        {order.status === "pending" ? (
          <>
            <p className="stub-note">
              This is a <strong>stub Pay</strong> button. It marks the order
              paid and sets expiry — no Stripe API call, no card form. Real
              Stripe Checkout + webhooks replace this later.
            </p>
            <form action={stubPayOrderAction}>
              <input type="hidden" name="order_id" value={order.id} />
              <button type="submit" className="btn-saffron">
                Pay {formatCadCents(order.amount_cad_cents)} (stub)
              </button>
            </form>
          </>
        ) : null}

        {order.status === "failed" ? (
          <p className="form-error">
            Payment failed (or target was no longer eligible). Create a new
            order from{" "}
            <Link href="/members/promotions">promotions</Link>.
          </p>
        ) : null}

        {order.status === "cancelled" || order.status === "expired" ? (
          <p className="muted">This order is {order.status}.</p>
        ) : null}
      </section>
    </>
  );
}
