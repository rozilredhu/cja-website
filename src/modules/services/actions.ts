"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { featureDisabledMessage } from "@/modules/admin/feature-flags";
import { requireAdminUser, requireMemberUser } from "@/modules/auth/session";
import { getPlanByTier } from "./pricing";
import {
  createServicesCheckout,
  handleServicesWebhook,
} from "./stripe";
import { getOwnListing, getListingById } from "./queries";
import type {
  ServiceAvailability,
  ServiceFormState,
  ServicePlanTier,
} from "./types";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function numOrNull(formData: FormData, key: string): number | null {
  const raw = str(formData, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function nowSql(): string {
  return new Date()
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, "");
}

function addDaysSql(baseIso: string, days: number): string {
  const base = new Date(baseIso.includes("T") ? baseIso : `${baseIso}Z`);
  const ms = Number.isFinite(base.getTime()) ? base.getTime() : Date.now();
  return new Date(ms + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, "");
}

const AVAIL: ServiceAvailability[] = [
  "24_7",
  "weekdays",
  "weekends",
  "by_appointment",
];

async function assertServicesEnabled(): Promise<string | null> {
  return featureDisabledMessage("services");
}

export async function saveServiceListingAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const ff = await assertServicesEnabled();
  if (ff) return { error: ff };

  const user = await requireMemberUser();
  const idRaw = str(formData, "id");
  const id = idRaw ? Number(idRaw) : null;

  const categorySlug = str(formData, "category_slug");
  const businessName = str(formData, "business_name");
  const description = str(formData, "description") || null;
  const contactPhone = str(formData, "contact_phone") || null;
  const contactEmail = str(formData, "contact_email") || null;
  const city = str(formData, "city");
  const province = str(formData, "province").toUpperCase();
  // Form collects whole CAD dollars; store as cents
  const priceDollars = numOrNull(formData, "price_cents");
  const priceCents =
    priceDollars != null ? Math.round(priceDollars * 100) : null;
  const priceRange = str(formData, "price_range") || null;
  const availability = str(formData, "availability") as ServiceAvailability;
  const languages = str(formData, "languages") || "";
  const yearsExperience = numOrNull(formData, "years_experience") ?? 0;
  const verifiedLicensed = formData.get("verified_licensed") ? 1 : 0;
  const lat = numOrNull(formData, "lat");
  const lng = numOrNull(formData, "lng");
  const planTier = str(formData, "plan_tier") as ServicePlanTier;

  if (!categorySlug) return { error: "Select a category." };
  if (!businessName || businessName.length < 2) {
    return { error: "Business name is required." };
  }
  if (!city) return { error: "City is required." };
  if (!province || province.length !== 2) {
    return { error: "Select a valid Canadian province." };
  }
  if (!AVAIL.includes(availability)) {
    return { error: "Select availability." };
  }

  const plan = getPlanByTier(planTier);
  // plan required only when creating new / starting payment; allow edit without re-picking if already set
  const db = await getDb();

  const cat = await db
    .prepare(
      `SELECT slug FROM service_categories WHERE slug = ? AND active = 1`,
    )
    .bind(categorySlug)
    .first<{ slug: string }>();
  if (!cat) return { error: "Unknown category." };

  if (id && Number.isFinite(id)) {
    const existing = await getOwnListing(id, user.id);
    if (!existing) return { error: "Listing not found." };
    if (
      existing.status === "live" ||
      existing.status === "pending_approval"
    ) {
      // Allow content edits but not plan change while pending/live
      await db
        .prepare(
          `UPDATE service_listings SET
            category_slug = ?, business_name = ?, description = ?,
            contact_phone = ?, contact_email = ?, city = ?, province = ?,
            price_cents = ?, price_range = ?, availability = ?, languages = ?,
            years_experience = ?, verified_licensed = ?, lat = ?, lng = ?,
            updated_at = datetime('now')
           WHERE id = ? AND user_id = ?`,
        )
        .bind(
          categorySlug,
          businessName,
          description,
          contactPhone,
          contactEmail,
          city,
          province,
          priceCents,
          priceRange,
          availability,
          languages,
          yearsExperience,
          verifiedLicensed,
          lat,
          lng,
          id,
          user.id,
        )
        .run();
      revalidatePath("/members/services");
      revalidatePath("/services");
      return { ok: true, message: "Listing updated.", listingId: id };
    }

    if (!plan) return { error: "Select a listing plan (Monthly / Quarterly / Annual)." };

    await db
      .prepare(
        `UPDATE service_listings SET
          category_slug = ?, business_name = ?, description = ?,
          contact_phone = ?, contact_email = ?, city = ?, province = ?,
          price_cents = ?, price_range = ?, availability = ?, languages = ?,
          years_experience = ?, verified_licensed = ?, lat = ?, lng = ?,
          plan_tier = ?, amount_cents = ?, duration_days = ?,
          status = 'pending_payment',
          updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
      )
      .bind(
        categorySlug,
        businessName,
        description,
        contactPhone,
        contactEmail,
        city,
        province,
        priceCents,
        priceRange,
        availability,
        languages,
        yearsExperience,
        verifiedLicensed,
        lat,
        lng,
        plan.tier,
        plan.amountCadCents,
        plan.durationDays,
        id,
        user.id,
      )
      .run();
    revalidatePath("/members/services");
    redirect(`/members/services/checkout/${id}`);
  }

  if (!plan) return { error: "Select a listing plan (Monthly / Quarterly / Annual)." };

  const insert = await db
    .prepare(
      `INSERT INTO service_listings (
        user_id, category_slug, business_name, description,
        contact_phone, contact_email, city, province,
        price_cents, price_range, availability, languages,
        years_experience, verified_licensed, lat, lng,
        plan_tier, amount_cents, duration_days, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment')`,
    )
    .bind(
      user.id,
      categorySlug,
      businessName,
      description,
      contactPhone,
      contactEmail,
      city,
      province,
      priceCents,
      priceRange,
      availability,
      languages,
      yearsExperience,
      verifiedLicensed,
      lat,
      lng,
      plan.tier,
      plan.amountCadCents,
      plan.durationDays,
    )
    .run();

  const listingId = Number(insert.meta.last_row_id);
  if (!Number.isFinite(listingId) || listingId <= 0) {
    return { error: "Could not create listing." };
  }

  revalidatePath("/members/services");
  redirect(`/members/services/checkout/${listingId}`);
}

/** Start Stripe Checkout or stay on stub checkout page. */
export async function startServicesCheckoutAction(
  formData: FormData,
): Promise<void> {
  const ff = await assertServicesEnabled();
  if (ff) return;

  const user = await requireMemberUser();
  const listingId = Number(str(formData, "listing_id"));
  const planTierOverride = str(formData, "plan_tier") as ServicePlanTier;

  if (!Number.isFinite(listingId)) return;
  const listing = await getOwnListing(listingId, user.id);
  if (!listing) redirect("/members/services");

  let planTier = listing.plan_tier;
  let amount = listing.amount_cents;
  let duration = listing.duration_days;

  if (planTierOverride && getPlanByTier(planTierOverride)) {
    const plan = getPlanByTier(planTierOverride)!;
    planTier = plan.tier;
    amount = plan.amountCadCents;
    duration = plan.durationDays;
    const db = await getDb();
    await db
      .prepare(
        `UPDATE service_listings SET
          plan_tier = ?, amount_cents = ?, duration_days = ?,
          status = 'pending_payment', updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
      )
      .bind(plan.tier, plan.amountCadCents, plan.durationDays, listingId, user.id)
      .run();
  }

  if (!planTier || !getPlanByTier(planTier)) {
    redirect(`/members/services/checkout/${listingId}`);
  }

  const checkout = await createServicesCheckout({
    listingId,
    planTier: planTier as ServicePlanTier,
    businessName: listing.business_name,
  });

  const db = await getDb();
  await db
    .prepare(
      `UPDATE service_listings SET
        stripe_session_id = ?, payment_ref = ?,
        amount_cents = COALESCE(?, amount_cents),
        duration_days = COALESCE(?, duration_days),
        updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
    )
    .bind(
      checkout.mode === "stripe" ? checkout.providerRef : listing.stripe_session_id,
      checkout.providerRef,
      amount,
      duration,
      listingId,
      user.id,
    )
    .run();

  redirect(checkout.checkoutUrl);
}

/**
 * Stub pay — marks listing pending_approval (demo when no Stripe keys).
 * Does NOT go live; admin must approve.
 */
export async function stubPayServiceListingAction(
  formData: FormData,
): Promise<void> {
  const ff = await assertServicesEnabled();
  if (ff) return;

  const user = await requireMemberUser();
  const listingId = Number(str(formData, "listing_id"));
  const planTier = str(formData, "plan_tier") as ServicePlanTier;

  if (!Number.isFinite(listingId)) return;
  const listing = await getOwnListing(listingId, user.id);
  if (!listing) redirect("/members/services");

  const plan = getPlanByTier(planTier || listing.plan_tier || "");
  if (!plan) {
    redirect(`/members/services/checkout/${listingId}`);
  }

  if (
    listing.status !== "pending_payment" &&
    listing.status !== "rejected" &&
    listing.status !== "expired"
  ) {
    redirect(`/members/services/checkout/${listingId}`);
  }

  const paidAt = nowSql();
  const providerRef = `stub_pay_svc_${listingId}_${Date.now().toString(36)}`;
  const db = await getDb();
  await db
    .prepare(
      `UPDATE service_listings SET
        status = 'pending_approval',
        plan_tier = ?, amount_cents = ?, duration_days = ?,
        payment_ref = ?, paid_at = ?,
        rejected_reason = NULL,
        updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
    )
    .bind(
      plan.tier,
      plan.amountCadCents,
      plan.durationDays,
      providerRef,
      paidAt,
      listingId,
      user.id,
    )
    .run();

  revalidatePath("/members/services");
  revalidatePath("/admin/services");
  redirect(`/members/services/checkout/${listingId}?paid=1`);
}

/** Apply successful payment (from webhook or success redirect confirmation). */
export async function markListingPaidFromStripe(input: {
  listingId: number;
  sessionId: string;
  planTier?: ServicePlanTier;
}): Promise<boolean> {
  const db = await getDb();
  const listing = await getListingById(input.listingId);
  if (!listing) return false;
  if (
    listing.status !== "pending_payment" &&
    listing.status !== "rejected" &&
    listing.status !== "expired"
  ) {
    // Already paid / live — idempotent success
    return true;
  }

  const plan = getPlanByTier(input.planTier || listing.plan_tier || "");
  const paidAt = nowSql();
  await db
    .prepare(
      `UPDATE service_listings SET
        status = 'pending_approval',
        stripe_session_id = ?,
        payment_ref = ?,
        paid_at = ?,
        plan_tier = COALESCE(?, plan_tier),
        amount_cents = COALESCE(?, amount_cents),
        duration_days = COALESCE(?, duration_days),
        rejected_reason = NULL,
        updated_at = datetime('now')
       WHERE id = ? AND status IN ('pending_payment', 'rejected', 'expired')`,
    )
    .bind(
      input.sessionId,
      input.sessionId,
      paidAt,
      plan?.tier ?? null,
      plan?.amountCadCents ?? null,
      plan?.durationDays ?? null,
      input.listingId,
    )
    .run();
  return true;
}

export async function processServicesWebhookAction(input: {
  rawBody: string;
  signature: string | null;
}): Promise<{ ok: boolean; note?: string }> {
  const result = await handleServicesWebhook(input);
  if (!result.handled) return { ok: false, note: result.note };
  if (result.listingId && result.sessionId) {
    await markListingPaidFromStripe({
      listingId: result.listingId,
      sessionId: result.sessionId,
      planTier: result.planTier,
    });
    revalidatePath("/members/services");
    revalidatePath("/admin/services");
  }
  return { ok: true, note: result.note };
}

export async function adminReviewServiceListingAction(
  formData: FormData,
): Promise<void> {
  const ff = await assertServicesEnabled();
  if (ff) return;

  await requireAdminUser();
  const id = Number(str(formData, "id"));
  const decision = str(formData, "decision");
  const note = str(formData, "admin_note") || null;
  if (!Number.isFinite(id)) return;

  const listing = await getListingById(id);
  if (!listing || listing.status !== "pending_approval") return;

  const db = await getDb();

  if (decision === "approve") {
    const duration = listing.duration_days || 30;
    const approvedAt = nowSql();
    const expiresAt = addDaysSql(approvedAt, duration);
    await db
      .prepare(
        `UPDATE service_listings SET
          status = 'live',
          approved_at = ?,
          expires_at = ?,
          rejected_reason = NULL,
          updated_at = datetime('now')
         WHERE id = ? AND status = 'pending_approval'`,
      )
      .bind(approvedAt, expiresAt, id)
      .run();
  } else if (decision === "reject") {
    await db
      .prepare(
        `UPDATE service_listings SET
          status = 'rejected',
          rejected_reason = ?,
          updated_at = datetime('now')
         WHERE id = ? AND status = 'pending_approval'`,
      )
      .bind(note || "Rejected by admin", id)
      .run();
  }

  revalidatePath("/admin/services");
  revalidatePath("/admin");
  revalidatePath("/services");
  revalidatePath("/members/services");
}

export async function adminDisableServiceListingAction(
  formData: FormData,
): Promise<void> {
  await requireAdminUser();
  const id = Number(str(formData, "id"));
  const disabled = str(formData, "disabled") === "1" ? 1 : 0;
  if (!Number.isFinite(id)) return;
  const db = await getDb();
  await db
    .prepare(
      `UPDATE service_listings SET disabled = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(disabled, id)
    .run();
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function deleteOwnPendingListingAction(
  formData: FormData,
): Promise<void> {
  const user = await requireMemberUser();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id)) return;
  const db = await getDb();
  await db
    .prepare(
      `DELETE FROM service_listings
       WHERE id = ? AND user_id = ?
         AND status IN ('pending_payment', 'rejected', 'expired')`,
    )
    .bind(id, user.id)
    .run();
  revalidatePath("/members/services");
}
