import { getDb } from "@/lib/db";
import type {
  ServiceBrowseFilters,
  ServiceCategoryRow,
  ServiceListingAdmin,
  ServiceListingPublic,
  ServiceListingRow,
} from "./types";

/** Live + not expired + not disabled (query-time expiry). */
export const LIVE_LISTING_SQL = `status = 'live' AND disabled = 0 AND expires_at IS NOT NULL AND expires_at > datetime('now')`;

export function isPendingOverdue(
  paidAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!paidAt) return false;
  const iso = paidAt.includes("T") ? paidAt : `${paidAt}Z`;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  return now - t > 24 * 60 * 60 * 1000;
}


export async function listCategories(): Promise<ServiceCategoryRow[]> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT * FROM service_categories WHERE active = 1
         ORDER BY sort_order ASC, name ASC`,
      )
      .all<ServiceCategoryRow>();
    return res.results ?? [];
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<ServiceCategoryRow | null> {
  try {
    const db = await getDb();
    return (
      (await db
        .prepare(`SELECT * FROM service_categories WHERE slug = ? AND active = 1`)
        .bind(slug)
        .first<ServiceCategoryRow>()) ?? null
    );
  } catch {
    return null;
  }
}

export async function getListingById(
  id: number,
): Promise<ServiceListingRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM service_listings WHERE id = ?`)
      .bind(id)
      .first<ServiceListingRow>()) ?? null
  );
}

export async function getOwnListing(
  id: number,
  userId: number,
): Promise<ServiceListingRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM service_listings WHERE id = ? AND user_id = ?`)
      .bind(id, userId)
      .first<ServiceListingRow>()) ?? null
  );
}

export async function listOwnListings(
  userId: number,
): Promise<ServiceListingRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM service_listings WHERE user_id = ?
       ORDER BY updated_at DESC LIMIT 200`,
    )
    .bind(userId)
    .all<ServiceListingRow>();
  return res.results ?? [];
}

export async function listDistinctCities(): Promise<string[]> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT DISTINCT city AS c FROM service_listings
         WHERE ${LIVE_LISTING_SQL} AND city IS NOT NULL AND city != ''
         ORDER BY city COLLATE NOCASE`,
      )
      .all<{ c: string }>();
    return (res.results ?? []).map((r) => r.c);
  } catch {
    return [];
  }
}

/**
 * Public browse: live + unexpired. Filters: category, city/province, price; sort by price.
 */
export async function browseLiveListings(
  filters: ServiceBrowseFilters = {},
): Promise<ServiceListingPublic[]> {
  try {
    const db = await getDb();
    const clauses: string[] = [LIVE_LISTING_SQL];
    const binds: (string | number)[] = [];

    const category = filters.category?.trim();
    if (category) {
      clauses.push(`category_slug = ?`);
      binds.push(category);
    }

    const city = filters.city?.trim();
    if (city) {
      clauses.push(`LOWER(IFNULL(city,'')) = LOWER(?)`);
      binds.push(city);
    }

    const province = filters.province?.trim().toUpperCase();
    if (province) {
      clauses.push(`UPPER(IFNULL(province,'')) = ?`);
      binds.push(province);
    }

    if (
      filters.priceMinCents != null &&
      Number.isFinite(filters.priceMinCents)
    ) {
      clauses.push(`price_cents IS NOT NULL AND price_cents >= ?`);
      binds.push(filters.priceMinCents);
    }
    if (
      filters.priceMaxCents != null &&
      Number.isFinite(filters.priceMaxCents)
    ) {
      clauses.push(`price_cents IS NOT NULL AND price_cents <= ?`);
      binds.push(filters.priceMaxCents);
    }

    const orderSql =
      filters.sort === "price_desc"
        ? `CASE WHEN price_cents IS NULL THEN 1 ELSE 0 END, price_cents DESC, business_name COLLATE NOCASE ASC`
        : `CASE WHEN price_cents IS NULL THEN 1 ELSE 0 END, price_cents ASC, business_name COLLATE NOCASE ASC`;

    const sql = `
      SELECT s.*, c.name AS category_name
      FROM service_listings s
      LEFT JOIN service_categories c ON c.slug = s.category_slug
      WHERE ${clauses.join(" AND ")}
      ORDER BY ${orderSql}
      LIMIT 200
    `;

    const res = await db
      .prepare(sql)
      .bind(...binds)
      .all<ServiceListingPublic>();
    return res.results ?? [];
  } catch {
    return [];
  }
}

export async function countLiveByCategory(): Promise<
  { slug: string; name: string; count: number }[]
> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT c.slug, c.name,
                SUM(
                  CASE
                    WHEN s.id IS NOT NULL
                      AND s.status = 'live'
                      AND s.disabled = 0
                      AND s.expires_at IS NOT NULL
                      AND s.expires_at > datetime('now')
                    THEN 1 ELSE 0
                  END
                ) AS count
         FROM service_categories c
         LEFT JOIN service_listings s ON s.category_slug = c.slug
         WHERE c.active = 1
         GROUP BY c.slug, c.name, c.sort_order
         ORDER BY c.sort_order ASC`,
      )
      .all<{ slug: string; name: string; count: number }>();
    return res.results ?? [];
  } catch {
    return [];
  }
}

export async function adminListPending(): Promise<ServiceListingAdmin[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT s.*, u.email AS member_email, u.name AS member_name, c.name AS category_name
       FROM service_listings s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN service_categories c ON c.slug = s.category_slug
       WHERE s.status = 'pending_approval'
       ORDER BY s.paid_at ASC`,
    )
    .all<ServiceListingAdmin>();
  return res.results ?? [];
}

export async function adminListLive(limit = 100): Promise<ServiceListingAdmin[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT s.*, u.email AS member_email, u.name AS member_name, c.name AS category_name
       FROM service_listings s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN service_categories c ON c.slug = s.category_slug
       WHERE s.status = 'live'
       ORDER BY s.expires_at ASC
       LIMIT ?`,
    )
    .bind(limit)
    .all<ServiceListingAdmin>();
  return res.results ?? [];
}

export async function adminListRecent(limit = 100): Promise<ServiceListingAdmin[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT s.*, u.email AS member_email, u.name AS member_name, c.name AS category_name
       FROM service_listings s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN service_categories c ON c.slug = s.category_slug
       ORDER BY s.updated_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<ServiceListingAdmin>();
  return res.results ?? [];
}

export async function countPendingServices(): Promise<number> {
  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS c FROM service_listings WHERE status = 'pending_approval'`,
      )
      .first<{ c: number }>();
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

export async function countOverduePendingServices(): Promise<number> {
  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS c FROM service_listings
         WHERE status = 'pending_approval'
           AND paid_at IS NOT NULL
           AND paid_at < datetime('now', '-1 day')`,
      )
      .first<{ c: number }>();
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

/** Mark live rows past expires_at as expired (optional housekeeping). */
export async function markExpiredListings(): Promise<number> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        `UPDATE service_listings SET status = 'expired', updated_at = datetime('now')
         WHERE status = 'live'
           AND expires_at IS NOT NULL
           AND expires_at <= datetime('now')`,
      )
      .run();
    return res.meta.changes ?? 0;
  } catch {
    return 0;
  }
}
