/**
 * Promotion packages (§3E) — CAD only.
 *
 * Phase 1: typed constants (source of truth for checkout pricing).
 * DB table `promotion_packages` mirrors these codes for reporting / future
 * admin edits. When an Admin CMS lands, prefer DB rows and treat this file
 * as fallback defaults.
 *
 * Real Stripe products/prices will map to these codes later via env secrets
 * (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_*). Do NOT require
 * Stripe keys to run the stub adapter.
 */

export type PromotionTargetType = "directory_profile" | "business_listing";

export type PromotionPackage = {
  code: string;
  name: string;
  description: string;
  targetType: PromotionTargetType;
  /** Amount in Canadian cents (CAD). Never store card numbers. */
  amountCadCents: number;
  durationDays: number;
  active: boolean;
};

export const PROMOTION_PACKAGES: readonly PromotionPackage[] = [
  {
    code: "directory_highlight_30d",
    name: "Directory profile highlight",
    description:
      "Boost your opted-in member directory profile for 30 days. Appears first in browse with a Promoted badge.",
    targetType: "directory_profile",
    amountCadCents: 1000, // 10.00 CAD
    durationDays: 30,
    active: true,
  },
  {
    code: "business_highlight_30d",
    name: "Business listing highlight",
    description:
      "Boost your opted-in business listing for 30 days. Appears first in browse with a Promoted badge.",
    targetType: "business_listing",
    amountCadCents: 1500, // 15.00 CAD
    durationDays: 30,
    active: true,
  },
] as const;

export function getPackageByCode(code: string): PromotionPackage | undefined {
  return PROMOTION_PACKAGES.find((p) => p.code === code && p.active);
}

export function packagesForTarget(
  targetType: PromotionTargetType,
): PromotionPackage[] {
  return PROMOTION_PACKAGES.filter(
    (p) => p.targetType === targetType && p.active,
  );
}

export function formatCadCents(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}
