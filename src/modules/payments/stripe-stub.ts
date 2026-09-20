import type {
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentAdapter,
  WebhookEvent,
  WebhookHandleResult,
} from "./adapter";

/**
 * Stripe stub — no Stripe SDK, no API keys required.
 * Simulates checkout + immediate success for Phase 1 demos.
 *
 * To wire real Stripe later:
 * 1. Add secrets STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET (Workers / .dev.vars)
 * 2. Implement StripeAdapter implementing PaymentAdapter
 * 3. Switch getPaymentAdapter() to return StripeAdapter when keys present
 * 4. Make /api/payments/webhook the source of truth for paid/failed
 * 5. Never store card numbers — use Stripe Checkout / Elements only
 */
export class StripeStubAdapter implements PaymentAdapter {
  readonly providerId = "stripe_stub";

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const providerRef = `stub_sess_${input.orderId}_${Date.now().toString(36)}`;
    return {
      providerRef,
      // Stub checkout stays on-site; real Stripe would return session.url
      checkoutUrl: `/members/promotions/checkout/${input.orderId}`,
    };
  }

  async confirmPayment(
    input: ConfirmPaymentInput,
  ): Promise<ConfirmPaymentResult> {
    const providerRef =
      input.providerRef || `stub_pay_${input.orderId}_${Date.now().toString(36)}`;
    return {
      success: true,
      providerRef,
      paidAtIso: new Date().toISOString(),
    };
  }

  async handleWebhook(event: WebhookEvent): Promise<WebhookHandleResult> {
    // Safe no-op: acknowledge provider events without mutating orders.
    // Real Stripe: verify signature with STRIPE_WEBHOOK_SECRET, then update
    // order status from checkout.session.completed / payment_intent.*.
    void event;
    return {
      handled: true,
      note: "stripe_stub webhook is a no-op; local Pay action marks orders paid. Real Stripe webhooks will be the source of truth later.",
    };
  }
}

let singleton: StripeStubAdapter | null = null;

export function getPaymentAdapter(): PaymentAdapter {
  // Later: if (env.STRIPE_SECRET_KEY) return new StripeAdapter(...)
  if (!singleton) singleton = new StripeStubAdapter();
  return singleton;
}
