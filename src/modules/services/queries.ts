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

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
 * Public browse: only live + unexpired. Supports text, category, city,
 * price, rating, availability, language, experience, verified filters + sorts.
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

    const q = filters.q?.trim();
    if (q) {
      const pat = `%${q.replace(/[%_\\]/g, (ch) => `\\${ch}`)}%`;
      clauses.push(
        `(business_name LIKE ? ESCAPE '\\' OR IFNULL(description,'') LIKE ? ESCAPE '\\' OR city LIKE ? ESCAPE '\\' OR category_slug LIKE ? ESCAPE '\\' OR IFNULL(languages,'') LIKE ? ESCAPE '\\')`,
      );
      binds.push(pat, pat, pat, pat, pat);
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

    if (filters.minRating != null && Number.isFinite(filters.minRating)) {
      clauses.push(`avg_rating >= ?`);
      binds.push(filters.minRating);
    }

    if (filters.availability) {
      clauses.push(`availability = ?`);
      binds.push(filters.availability);
    }

    const language = filters.language?.trim();
    if (language) {
      const pat = `%${language.replace(/[%_\\]/g, (ch) => `\\${ch}`)}%`;
      clauses.push(`languages LIKE ? ESCAPE '\\'`);
      binds.push(pat);
    }

    if (
      filters.minExperience != null &&
      Number.isFinite(filters.minExperience)
    ) {
      clauses.push(`years_experience >= ?`);
      binds.push(filters.minExperience);
    }

    if (filters.verifiedOnly) {
      clauses.push(`verified_licensed = 1`);
    }

    let orderSql = `avg_rating DESC, review_count DESC, business_name COLLATE NOCASE ASC`;
    switch (filters.sort) {
      case "price_asc":
        orderSql = `CASE WHEN price_cents IS NULL THEN 1 ELSE 0 END, price_cents ASC, business_name COLLATE NOCASE ASC`;
        break;
      case "price_desc":
        orderSql = `CASE WHEN price_cents IS NULL THEN 1 ELSE 0 END, price_cents DESC, business_name COLLATE NOCASE ASC`;
        break;
      case "rating":
        orderSql = `avg_rating DESC, review_count DESC, business_name COLLATE NOCASE ASC`;
        break;
      case "experience":
        orderSql = `years_experience DESC, avg_rating DESC, business_name COLLATE NOCASE ASC`;
        break;
      case "distance":
      case "relevance":
      default:
        orderSql = `avg_rating DESC, review_count DESC, business_name COLLATE NOCASE ASC`;
        break;
    }

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
    let rows = res.results ?? [];

    // Optional client-supplied geolocation: sort by distance when coords present
    if (
      filters.sort === "distance" &&
      filters.userLat != null &&
      filters.userLng != null &&
      Number.isFinite(filters.userLat) &&
      Number.isFinite(filters.userLng)
    ) {
      const ulat = filters.userLat;
      const ulng = filters.userLng;
      rows = [...rows].sort((a, b) => {
        const da =
          a.lat != null && a.lng != null
            ? haversineKm(ulat, ulng, a.lat, a.lng)
            : Number.POSITIVE_INFINITY;
        const dbKm =
          b.lat != null && b.lng != null
            ? haversineKm(ulat, ulng, b.lat, b.lng)
            : Number.POSITIVE_INFINITY;
        return da - dbKm;
      });
    }

    return rows;
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
