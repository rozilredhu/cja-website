"use server";

import { featureDisabledMessage } from "@/modules/admin/feature-flags";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireAdminUser, requireMemberUser } from "@/modules/auth/session";
import { getPackageByCode, type PromotionTargetType } from "./packages";
import { getOwnOrder } from "./queries";
import { getPaymentAdapter } from "./stripe-stub";
import type { PromotionFormState } from "./types";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function assertOwnsTarget(
  userId: number,
  targetType: PromotionTargetType,
  targetId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDb();
  if (targetType === "directory_profile") {
    const row = await db
      .prepare(
        `SELECT id, opted_in, disabled FROM directory_profiles
         WHERE id = ? AND user_id = ?`,
      )
      .bind(targetId, userId)
      .first<{ id: number; opted_in: number; disabled: number }>();
    if (!row) return { ok: false, error: "Directory profile not found." };
    if (!row.opted_in || row.disabled) {
      return {
        ok: false,
        error:
          "Opt in to the directory (and ensure it is not disabled) before promoting.",
      };
    }
    return { ok: true };
  }

  if (targetType === "matrimonial_profile") {
    const row = await db
      .prepare(
        `SELECT id, status FROM matrimonial_profiles
         WHERE id = ? AND user_id = ?`,
      )
      .bind(targetId, userId)
      .first<{ id: number; status: string }>();
    if (!row) return { ok: false, error: "Matrimonial profile not found." };
    if (row.status !== "approved") {
      return {
        ok: false,
        error: "Matrimonial profile must be approved before promoting.",
      };
    }
    return { ok: true };
  }

  const row = await db
    .prepare(
      `SELECT id, opted_in, disabled, status FROM business_listings
       WHERE id = ? AND user_id = ?`,
    )
    .bind(targetId, userId)
    .first<{
      id: number;
      opted_in: number;
      disabled: number;
      status: string;
    }>();
  if (!row) return { ok: false, error: "Business listing not found." };
  if (!row.opted_in || row.disabled || row.status !== "active") {
    return {
      ok: false,
      error: "Business must be opted in, active, and not disabled to promote.",
    };
  }
  return { ok: true };
}

/** Add durationDays to an ISO-ish SQLite datetime string (or now). */
function addDaysIso(baseIso: string | null, durationDays: number): string {
  const base = baseIso ? new Date(baseIso.includes("T") ? baseIso : `${baseIso}Z`) : new Date();
  const ms = Number.isFinite(base.getTime()) ? base.getTime() : Date.now();
  const end = new Date(ms + durationDays * 24 * 60 * 60 * 1000);
  // Store as UTC SQLite-friendly "YYYY-MM-DD HH:MM:SS"
  return end.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

export async function createPromotionOrderAction(
  _prev: PromotionFormState,
  formData: FormData,
): Promise<PromotionFormState> {
  const __ff = await featureDisabledMessage("promotions");
  if (__ff) return { error: __ff };

  const user = await requireMemberUser();
  const packageCode = str(formData, "package_code");
  const targetType = str(formData, "target_type") as PromotionTargetType;
  const targetId = Number(str(formData, "target_id"));

  const pkg = getPackageByCode(packageCode);
  if (!pkg) return { error: "Unknown or inactive promotion package." };
  if (pkg.targetType !== targetType) {
    return { error: "Package does not match the selected target type." };
  }
  if (
    targetType !== "directory_profile" &&
    targetType !== "business_listing" &&
    targetType !== "matrimonial_profile"
  ) {
    return { error: "Invalid target type." };
  }
  if (!Number.isFinite(targetId) || targetId <= 0) {
    return { error: "Select a valid profile or business to promote." };
  }

  const ownership = await assertOwnsTarget(user.id, targetType, targetId);
  if (!ownership.ok) return { error: ownership.error };

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database unavailable." };
  }

  const insert = await db
    .prepare(
      `INSERT INTO promotion_orders (
        user_id, target_type, target_id, package_code, amount_cad_cents,
        status, provider
      ) VALUES (?, ?, ?, ?, ?, 'pending', 'stripe_stub')`,
    )
    .bind(user.id, targetType, targetId, pkg.code, pkg.amountCadCents)
    .run();

  const orderId = Number(insert.meta.last_row_id);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return { error: "Could not create order." };
  }

  const adapter = getPaymentAdapter();
  const checkout = await adapter.createCheckout({
    orderId,
    amountCadCents: pkg.amountCadCents,
    currency: "cad",
    description: pkg.name,
    successUrl: `/members/promotions/checkout/${orderId}`,
    cancelUrl: `/members/promotions`,
    metadata: {
      package_code: pkg.code,
      target_type: targetType,
      target_id: String(targetId),
    },
  });

  await db
    .prepare(
      `UPDATE promotion_orders SET provider_ref = ? WHERE id = ? AND user_id = ?`,
    )
    .bind(checkout.providerRef, orderId, user.id)
    .run();

  revalidatePath("/members/promotions");
  redirect(checkout.checkoutUrl);
}

/**
 * Stub "Pay" — marks the pending order paid and sets starts_at / ends_at.
 * No card data is collected. Real Stripe will use Checkout + webhooks instead.
 */
export async function stubPayOrderAction(formData: FormData): Promise<void> {
  const __ff = await featureDisabledMessage("promotions");
  if (__ff) return;

  const user = await requireMemberUser();
  const orderId = Number(str(formData, "order_id"));
  if (!Number.isFinite(orderId)) return;

  const order = await getOwnOrder(orderId, user.id);
  if (!order || order.status !== "pending") {
    redirect(`/members/promotions/checkout/${orderId}`);
  }

  const pkg = getPackageByCode(order.package_code);
  if (!pkg) {
    redirect(`/members/promotions/checkout/${orderId}`);
  }

  const ownership = await assertOwnsTarget(
    user.id,
    order.target_type,
    order.target_id,
  );
  const db = await getDb();

  if (!ownership.ok) {
    await db
      .prepare(
        `UPDATE promotion_orders SET status = 'failed' WHERE id = ? AND user_id = ?`,
      )
      .bind(orderId, user.id)
      .run();
    revalidatePath("/members/promotions");
    redirect(`/members/promotions/checkout/${orderId}`);
  }

  const adapter = getPaymentAdapter();
  const result = await adapter.confirmPayment({
    orderId,
    providerRef: order.provider_ref,
  });

  if (!result.success) {
    await db
      .prepare(
        `UPDATE promotion_orders SET status = 'failed', provider_ref = ?
         WHERE id = ? AND user_id = ?`,
      )
      .bind(result.providerRef, orderId, user.id)
      .run();
    revalidatePath("/members/promotions");
    redirect(`/members/promotions/checkout/${orderId}`);
  }

  // Stack on existing active promotion end if present
  const existing = await db
    .prepare(
      `SELECT ends_at FROM promotion_orders
       WHERE target_type = ? AND target_id = ?
         AND status = 'paid' AND ends_at IS NOT NULL AND ends_at > datetime('now')
         AND id != ?
       ORDER BY ends_at DESC LIMIT 1`,
    )
    .bind(order.target_type, order.target_id, orderId)
    .first<{ ends_at: string }>();

  const startsAt = new Date()
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, "");
  const endsAt = addDaysIso(existing?.ends_at ?? null, pkg.durationDays);

  await db
    .prepare(
      `UPDATE promotion_orders SET
        status = 'paid',
        provider_ref = ?,
        paid_at = ?,
        starts_at = ?,
        ends_at = ?
       WHERE id = ? AND user_id = ? AND status = 'pending'`,
    )
    .bind(
      result.providerRef,
      startsAt,
      startsAt,
      endsAt,
      orderId,
      user.id,
    )
    .run();

  revalidatePath("/members/promotions");
  revalidatePath("/members/directory/browse");
  revalidatePath("/members/directory/businesses");
  revalidatePath("/members/matrimonial/browse");
  revalidatePath("/admin/promotions");
  redirect(`/members/promotions/checkout/${orderId}?paid=1`);
}

export async function cancelOwnPendingOrderAction(
  formData: FormData,
): Promise<void> {
  const __ff = await featureDisabledMessage("promotions");
  if (__ff) return;

  const user = await requireMemberUser();
  const orderId = Number(str(formData, "order_id"));
  if (!Number.isFinite(orderId)) return;
  const db = await getDb();
  await db
    .prepare(
      `UPDATE promotion_orders SET status = 'cancelled'
       WHERE id = ? AND user_id = ? AND status = 'pending'`,
    )
    .bind(orderId, user.id)
    .run();
  revalidatePath("/members/promotions");
}

export async function adminSetOrderStatusAction(
  formData: FormData,
): Promise<void> {
  const __ff = await featureDisabledMessage("promotions");
  if (__ff) return;

  await requireAdminUser();
  const orderId = Number(str(formData, "order_id"));
  const status = str(formData, "status");
  if (!Number.isFinite(orderId)) return;
  if (status !== "expired" && status !== "cancelled") return;

  const db = await getDb();
  await db
    .prepare(`UPDATE promotion_orders SET status = ? WHERE id = ?`)
    .bind(status, orderId)
    .run();

  revalidatePath("/admin/promotions");
  revalidatePath("/members/directory/browse");
  revalidatePath("/members/directory/businesses");
  revalidatePath("/members/matrimonial/browse");
}
