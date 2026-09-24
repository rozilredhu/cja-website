import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/modules/payments/stripe-stub";
import { processServicesWebhookAction } from "@/modules/services/actions";

export const dynamic = "force-dynamic";

/**
 * Shared payment webhook.
 * - Promotions: stripe_stub no-op (or future StripeAdapter)
 * - Services: checkout.session.completed with metadata.product_type=services_listing
 *   Prefer dedicated /api/payments/services/webhook in Stripe Dashboard for clarity.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers: Record<string, string | null> = {
    "stripe-signature": request.headers.get("stripe-signature"),
    "content-type": request.headers.get("content-type"),
  };

  // Try services handler first when body looks like Stripe checkout for services
  let servicesNote: string | undefined;
  try {
    const parsed = JSON.parse(rawBody) as {
      type?: string;
      data?: { object?: { metadata?: Record<string, string> } };
    };
    const product = parsed.data?.object?.metadata?.product_type;
    if (
      parsed.type === "checkout.session.completed" &&
      product === "services_listing"
    ) {
      const svc = await processServicesWebhookAction({
        rawBody,
        signature: headers["stripe-signature"],
      });
      return NextResponse.json(
        {
          ok: svc.ok,
          route: "services",
          note: svc.note,
        },
        { status: svc.ok ? 200 : 400 },
      );
    }
  } catch {
    servicesNote = "Body not JSON or not a services event";
  }

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
      servicesNote,
      note:
        result.note ??
        "Webhook acknowledged. Stub does not mutate promotion orders; use checkout Pay for demos. Services: use /api/payments/services/webhook.",
    },
    { status: 200 },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/payments/webhook",
    also: "/api/payments/services/webhook",
    provider: "stripe_stub + services",
    note: "POST provider events here. Services listings prefer /api/payments/services/webhook.",
  });
}
