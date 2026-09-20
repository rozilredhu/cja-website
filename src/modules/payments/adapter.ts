/**
 * Payment adapter interface (§3E).
 *
 * Stub implementation: StripeStubAdapter (no real Stripe keys).
 * Production later: StripeAdapter using secrets:
 *   - STRIPE_SECRET_KEY (Workers secret / .dev.vars — never commit)
 *   - STRIPE_WEBHOOK_SECRET
 *   - Optional STRIPE_PUBLISHABLE_KEY for Checkout.js
 *
 * Webhooks at /api/payments/webhook will become the source of truth for
 * paid/failed transitions once real Stripe is wired. The stub marks paid
 * synchronously from the checkout "Pay" action for local demos only.
 */

export type CreateCheckoutInput = {
  orderId: number;
  amountCadCents: number;
  currency: "cad";
  description: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type CreateCheckoutResult = {
  /** Provider reference (e.g. Stripe session id, or stub_…). */
  providerRef: string;
  /** URL to send the user to (stub returns local checkout path). */
  checkoutUrl: string;
};

export type ConfirmPaymentInput = {
  orderId: number;
  providerRef: string | null;
};

export type ConfirmPaymentResult = {
  success: boolean;
  providerRef: string;
  paidAtIso: string;
  error?: string;
};

export type WebhookEvent = {
  provider: string;
  type: string;
  rawBody: string;
  headers: Record<string, string | null>;
};

export type WebhookHandleResult = {
  handled: boolean;
  /** Optional order id if the event maps to one. */
  orderId?: number;
  note?: string;
};

export interface PaymentAdapter {
  readonly providerId: string;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  /** Stub: simulate success. Real Stripe: retrieve session / PaymentIntent. */
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>;
  /** Stub: safe no-op. Real Stripe: verify signature + apply status. */
  handleWebhook(event: WebhookEvent): Promise<WebhookHandleResult>;
}
