/**
 * Services Stripe helpers — one-time Checkout for listing plans.
 * When STRIPE_SECRET_KEY is set → real Checkout Session (USD).
 * Otherwise → stub mode (local pay buttons).
 *
 * Env (Workers secrets / .dev.vars — never commit):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_PRICE_SERVICES_MONTHLY   (optional Price id; else inline price_data)
 *   STRIPE_PRICE_SERVICES_QUARTERLY
 *   STRIPE_PRICE_SERVICES_ANNUAL
 *   NEXT_PUBLIC_SITE_URL (success/cancel URLs)
 */

import { getEnv } from "@/lib/db";
import { getPlanByTier, type ServicePlan } from "./pricing";
import type { ServicePlanTier } from "./types";

export type ServicesCheckoutResult = {
  mode: "stripe" | "stub";
  providerRef: string;
  checkoutUrl: string;
};

export async function hasStripeSecret(): Promise<boolean> {
  try {
    const env = await getEnv();
    const key =
      (env as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY;
    return Boolean(key && key.startsWith("sk_"));
  } catch {
    return Boolean(
      process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_SECRET_KEY.startsWith("sk_"),
    );
  }
}

async function stripeSecret(): Promise<string | null> {
  try {
    const env = await getEnv();
    const key =
      (env as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY ||
      null;
    return key && key.startsWith("sk_") ? key : null;
  } catch {
    const key = process.env.STRIPE_SECRET_KEY || null;
    return key && key.startsWith("sk_") ? key : null;
  }
}

async function stripeWebhookSecret(): Promise<string | null> {
  try {
    const env = await getEnv();
    return (
      (env as { STRIPE_WEBHOOK_SECRET?: string }).STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET ||
      null
    );
  } catch {
    return process.env.STRIPE_WEBHOOK_SECRET || null;
  }
}

function priceIdForPlan(plan: ServicePlan, env: Record<string, unknown>): string | null {
  const fromEnv =
    (env[plan.stripePriceEnv] as string | undefined) ||
    process.env[plan.stripePriceEnv];
  return fromEnv && fromEnv.startsWith("price_") ? fromEnv : null;
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://cja-website-staging.cja-staging.workers.dev"
  ).replace(/\/$/, "");
}

export async function createServicesCheckout(input: {
  listingId: number;
  planTier: ServicePlanTier;
  businessName: string;
  successPath?: string;
  cancelPath?: string;
}): Promise<ServicesCheckoutResult> {
  const plan = getPlanByTier(input.planTier);
  if (!plan) throw new Error("Unknown plan tier");

  const secret = await stripeSecret();
  if (!secret) {
    const providerRef = `stub_svc_${input.listingId}_${Date.now().toString(36)}`;
    return {
      mode: "stub",
      providerRef,
      checkoutUrl: `/members/services/checkout/${input.listingId}`,
    };
  }

  let envObj: Record<string, unknown> = {};
  try {
    envObj = (await getEnv()) as unknown as Record<string, unknown>;
  } catch {
    envObj = process.env as unknown as Record<string, unknown>;
  }

  const priceId = priceIdForPlan(plan, envObj);
  const successUrl = `${siteUrl()}${input.successPath ?? `/members/services/checkout/${input.listingId}?paid=1`}`;
  const cancelUrl = `${siteUrl()}${input.cancelPath ?? `/members/services/checkout/${input.listingId}?cancelled=1`}`;

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("client_reference_id", String(input.listingId));
  params.set("metadata[listing_id]", String(input.listingId));
  params.set("metadata[plan_tier]", plan.tier);
  params.set("metadata[product_type]", "services_listing");
  params.set("metadata[duration_days]", String(plan.durationDays));

  if (priceId) {
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
  } else {
    params.set("line_items[0][price_data][currency]", "usd");
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(plan.amountUsdCents),
    );
    params.set(
      "line_items[0][price_data][product_data][name]",
      `CJA Services listing — ${plan.name}`,
    );
    params.set(
      "line_items[0][price_data][product_data][description]",
      `${input.businessName} (${plan.durationDays} days after approval)`,
    );
    params.set("line_items[0][quantity]", "1");
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe Checkout error: ${res.status} ${text.slice(0, 200)}`);
  }

  const session = (await res.json()) as {
    id: string;
    url: string | null;
  };

  if (!session.url) {
    throw new Error("Stripe session missing url");
  }

  return {
    mode: "stripe",
    providerRef: session.id,
    checkoutUrl: session.url,
  };
}

export type ServicesWebhookResult = {
  handled: boolean;
  listingId?: number;
  sessionId?: string;
  planTier?: ServicePlanTier;
  note?: string;
};

/**
 * Verify Stripe signature (when secret present) and extract checkout.session.completed
 * for product_type=services_listing. Stub/no-secret: acknowledge without mutating.
 */
export async function handleServicesWebhook(input: {
  rawBody: string;
  signature: string | null;
}): Promise<ServicesWebhookResult> {
  const whSecret = await stripeWebhookSecret();
  if (!whSecret) {
    return {
      handled: true,
      note: "No STRIPE_WEBHOOK_SECRET — webhook acknowledged as no-op. Stub pay marks pending_approval.",
    };
  }

  // Minimal signature check (Stripe-Signature: t=…,v1=…)
  if (!input.signature) {
    return { handled: false, note: "Missing stripe-signature header" };
  }

  const ok = await verifyStripeSignature(
    input.rawBody,
    input.signature,
    whSecret,
  );
  if (!ok) {
    return { handled: false, note: "Invalid Stripe signature" };
  }

  let event: {
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  try {
    event = JSON.parse(input.rawBody);
  } catch {
    return { handled: false, note: "Invalid JSON" };
  }

  if (event.type !== "checkout.session.completed") {
    return { handled: true, note: `Ignored event type ${event.type}` };
  }

  const obj = event.data?.object ?? {};
  const metadata = (obj.metadata ?? {}) as Record<string, string>;
  if (metadata.product_type && metadata.product_type !== "services_listing") {
    return {
      handled: true,
      note: "Not a services_listing session — ignored here",
    };
  }

  const listingId = Number(
    metadata.listing_id || obj.client_reference_id || 0,
  );
  const planTier = (metadata.plan_tier || "") as ServicePlanTier;
  const sessionId = String(obj.id || "");

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return { handled: false, note: "Missing listing_id on session" };
  }

  return {
    handled: true,
    listingId,
    sessionId,
    planTier: getPlanByTier(planTier) ? planTier : undefined,
    note: "checkout.session.completed for services_listing",
  };
}

async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(
      header.split(",").map((p) => {
        const [k, v] = p.split("=");
        return [k.trim(), v];
      }),
    );
    const t = parts.t;
    const v1 = parts.v1;
    if (!t || !v1) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signed = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${t}.${payload}`),
    );
    const hex = [...new Uint8Array(signed)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return timingSafeEqual(hex, v1);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
