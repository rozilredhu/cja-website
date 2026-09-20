import { getDb } from "@/lib/db";
import type { PromotionTargetType } from "./packages";
import type { ActivePromotion, PromotionOrderRow } from "./types";

/** True when order is paid and ends_at is still in the future (query-time expiry). */
const ACTIVE_PROMO_SQL = `status = 'paid' AND ends_at IS NOT NULL AND ends_at > datetime('now')`;

export async function getOrderById(
  id: number,
): Promise<PromotionOrderRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM promotion_orders WHERE id = ?`)
      .bind(id)
      .first<PromotionOrderRow>()) ?? null
  );
}

export async function getOwnOrder(
  id: number,
  userId: number,
): Promise<PromotionOrderRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM promotion_orders WHERE id = ? AND user_id = ?`)
      .bind(id, userId)
      .first<PromotionOrderRow>()) ?? null
  );
}

export async function listOrdersForUser(
  userId: number,
): Promise<PromotionOrderRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM promotion_orders WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 100`,
    )
    .bind(userId)
    .all<PromotionOrderRow>();
  return res.results ?? [];
}

export async function adminListOrders(): Promise<PromotionOrderRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM promotion_orders ORDER BY created_at DESC LIMIT 500`,
    )
    .all<PromotionOrderRow>();
  return res.results ?? [];
}

export async function getActivePromotionForTarget(
  targetType: PromotionTargetType,
  targetId: number,
): Promise<ActivePromotion | null> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT target_type, target_id, ends_at, package_code
       FROM promotion_orders
       WHERE target_type = ? AND target_id = ? AND ${ACTIVE_PROMO_SQL}
       ORDER BY ends_at DESC LIMIT 1`,
    )
    .bind(targetType, targetId)
    .first<{
      target_type: PromotionTargetType;
      target_id: number;
      ends_at: string;
      package_code: string;
    }>();
  if (!row) return null;
  return {
    targetType: row.target_type,
    targetId: row.target_id,
    endsAt: row.ends_at,
    packageCode: row.package_code,
  };
}

/** Map of target_id → ends_at for all currently active promotions of a type. */
export async function getActivePromotionMap(
  targetType: PromotionTargetType,
): Promise<Map<number, string>> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT target_id, MAX(ends_at) AS ends_at
       FROM promotion_orders
       WHERE target_type = ? AND ${ACTIVE_PROMO_SQL}
       GROUP BY target_id`,
    )
    .bind(targetType)
    .all<{ target_id: number; ends_at: string }>();
  const map = new Map<number, string>();
  for (const r of res.results ?? []) {
    map.set(r.target_id, r.ends_at);
  }
  return map;
}

export function isPromotionActiveSqlFragment(alias = "o"): string {
  return `${alias}.status = 'paid' AND ${alias}.ends_at IS NOT NULL AND ${alias}.ends_at > datetime('now')`;
}
