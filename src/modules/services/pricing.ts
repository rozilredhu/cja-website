/**
 * Services listing plans — one-time USD Checkout for listing period.
 * After payment → pending_approval; after admin approve → live for duration_days.
 *
 * Stripe Price IDs (optional):
 *   STRIPE_PRICE_SERVICES_MONTHLY
 *   STRIPE_PRICE_SERVICES_QUARTERLY
 *   STRIPE_PRICE_SERVICES_ANNUAL
 */

import type { ServicePlanTier } from "./types";

export type ServicePlan = {
  tier: ServicePlanTier;
  name: string;
  description: string;
  /** Amount in USD cents */
  amountUsdCents: number;
  durationDays: number;
  /** Env var name for Stripe Price id */
  stripePriceEnv: string;
};

export const SERVICE_PLANS: readonly ServicePlan[] = [
  {
    tier: "monthly",
    name: "Monthly",
    description: "Listing live for 1 month from admin approval.",
    amountUsdCents: 1000, // $10 USD
    durationDays: 30,
    stripePriceEnv: "STRIPE_PRICE_SERVICES_MONTHLY",
  },
  {
    tier: "quarterly",
    name: "Quarterly",
    description: "Listing live for 3 months from admin approval.",
    amountUsdCents: 2500, // $25 USD
    durationDays: 90,
    stripePriceEnv: "STRIPE_PRICE_SERVICES_QUARTERLY",
  },
  {
    tier: "annual",
    name: "Annual",
    description: "Listing live for 12 months from admin approval.",
    amountUsdCents: 9000, // $90 USD
    durationDays: 365,
    stripePriceEnv: "STRIPE_PRICE_SERVICES_ANNUAL",
  },
] as const;

export function getPlanByTier(tier: string): ServicePlan | undefined {
  return SERVICE_PLANS.find((p) => p.tier === tier);
}

export function formatUsdCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatServicePrice(
  priceCents: number | null | undefined,
  priceRange: string | null | undefined,
): string {
  if (priceRange?.trim()) return priceRange.trim();
  if (priceCents != null && Number.isFinite(priceCents)) {
    return formatUsdCents(priceCents);
  }
  return "Contact for price";
}
