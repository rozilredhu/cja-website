import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/modules/payments/stripe-stub";

export const dynamic = "force-dynamic";

/**
 * Payment provider webhook stub (§3E).
 *
 * Accepts provider events but is a safe no-op for stripe_stub.
 * When real Stripe is wired, this route becomes the source of truth for
 * paid / failed / cancelled transitions (verify STRIPE_WEBHOOK_SECRET,
 * then update promotion_orders). Never trust client-side "Pay" alone in prod.
 *
 * Do not require Stripe keys to run.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers: Record<string, string | null> = {
    "stripe-signature": request.headers.get("stripe-signature"),
    "content-type": request.headers.get("content-type"),
  };

  const adapter = getPaymentAdapter();
  const result = await adapter.handleWebhook({
    provider: adapter.providerId,
    type: "stub.event",
    rawBody,
    headers,
  });

  return NextResponse.json(
    {
      ok: true,
      provider: adapter.providerId,
      handled: result.handled,
      note:
        result.note ??
        "Webhook acknowledged. Stub does not mutate orders; use checkout Pay for demos.",
    },
    { status: 200 },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/payments/webhook",
    provider: "stripe_stub",
    note: "POST provider events here. Stub is a no-op; real Stripe webhooks will be source of truth later.",
  });
}
