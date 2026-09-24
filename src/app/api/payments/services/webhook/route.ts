import { NextResponse } from "next/server";
import { processServicesWebhookAction } from "@/modules/services/actions";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook for Services marketplace Checkout sessions.
 * Dashboard: point endpoint to this URL; events: checkout.session.completed
 * Secret: STRIPE_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  const result = await processServicesWebhookAction({
    rawBody,
    signature,
  });

  return NextResponse.json(
    {
      ok: result.ok,
      note: result.note,
      endpoint: "/api/payments/services/webhook",
    },
    { status: result.ok ? 200 : 400 },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/payments/services/webhook",
    note: "POST Stripe checkout.session.completed events here for services_listing metadata.",
  });
}
