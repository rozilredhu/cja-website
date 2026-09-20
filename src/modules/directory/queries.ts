import { getDb } from "@/lib/db";
import type { AuthUser } from "@/modules/auth/roles";
import { getActivePromotionMap } from "@/modules/payments/queries";
import {
  toPublicBusiness,
  toPublicProfile,
  viewerCanSeeSensitive,
} from "./privacy";
import type {
  BusinessListingPublic,
  BusinessListingRow,
  DirectoryProfilePublic,
  DirectoryProfileRow,
  DirectorySearchFilters,
} from "./types";

function likePattern(q: string): string {
  // Escape LIKE wildcards so user input is literal
  const escaped = q.replace(/[%_\\]/g, (ch) => `\\${ch}`);
  return `%${escaped}%`;
}

export async function getOptedInMemberCount(): Promise<number> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS c FROM directory_profiles
       WHERE opted_in = 1 AND disabled = 0`,
    )
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function getOptedInBusinessCount(): Promise<number> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS c FROM business_listings
       WHERE opted_in = 1 AND disabled = 0 AND status = 'active'`,
    )
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function getOwnProfile(
  userId: number,
): Promise<DirectoryProfileRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM directory_profiles WHERE user_id = ?`)
      .bind(userId)
      .first<DirectoryProfileRow>()) ?? null
  );
}

export async function getOwnBusinesses(
  userId: number,
): Promise<BusinessListingRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM business_listings WHERE user_id = ?
       ORDER BY updated_at DESC`,
    )
    .bind(userId)
    .all<BusinessListingRow>();
  return res.results ?? [];
}

export async function searchDirectoryProfiles(
  viewer: AuthUser,
  filters: DirectorySearchFilters = {},
): Promise<DirectoryProfilePublic[]> {
  const canSensitive = await viewerCanSeeSensitive(viewer);
  const db = await getDb();

  const clauses = ["opted_in = 1", "disabled = 0"];
  const binds: (string | number)[] = [];

  const q = filters.q?.trim();
  if (q) {
    clauses.push(
      `(display_name LIKE ? ESCAPE '\\' OR city LIKE ? ESCAPE '\\' OR province LIKE ? ESCAPE '\\' OR IFNULL(education,'') LIKE ? ESCAPE '\\')`,
    );
    const pat = likePattern(q);
    binds.push(pat, pat, pat, pat);
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

  const sql = `SELECT * FROM directory_profiles
    WHERE ${clauses.join(" AND ")}
    ORDER BY display_name COLLATE NOCASE ASC
    LIMIT 200`;

  const stmt = db.prepare(sql);
  const [res, promoMap] = await Promise.all([
    binds.length
      ? stmt.bind(...binds).all<DirectoryProfileRow>()
      : stmt.all<DirectoryProfileRow>(),
    getActivePromotionMap("directory_profile"),
  ]);

  const mapped = (res.results ?? []).map((row) => {
    const endsAt = promoMap.get(row.id);
    return toPublicProfile(
      row,
      canSensitive,
      endsAt ? { endsAt } : null,
    );
  });
  // Promoted first (query-time; expired promotions omitted from map)
  mapped.sort((a, b) => {
    if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
    return a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: "base",
    });
  });
  return mapped;
}

export async function getDirectoryProfileById(
  viewer: AuthUser,
  id: number,
): Promise<DirectoryProfilePublic | null> {
  const canSensitive = await viewerCanSeeSensitive(viewer);
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT * FROM directory_profiles
       WHERE id = ? AND opted_in = 1 AND disabled = 0`,
    )
    .bind(id)
    .first<DirectoryProfileRow>();
  if (!row) return null;
  const promoMap = await getActivePromotionMap("directory_profile");
  const endsAt = promoMap.get(row.id);
  return toPublicProfile(row, canSensitive, endsAt ? { endsAt } : null);
}

export async function searchBusinessListings(
  viewer: AuthUser,
  filters: DirectorySearchFilters = {},
): Promise<BusinessListingPublic[]> {
  const canSensitive = await viewerCanSeeSensitive(viewer);
  const db = await getDb();

  const clauses = [
    "opted_in = 1",
    "disabled = 0",
    "status = 'active'",
  ];
  const binds: (string | number)[] = [];

  const q = filters.q?.trim();
  if (q) {
    clauses.push(
      `(name LIKE ? ESCAPE '\\' OR city LIKE ? ESCAPE '\\' OR province LIKE ? ESCAPE '\\' OR IFNULL(description,'') LIKE ? ESCAPE '\\')`,
    );
    const pat = likePattern(q);
    binds.push(pat, pat, pat, pat);
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

  const sql = `SELECT * FROM business_listings
    WHERE ${clauses.join(" AND ")}
    ORDER BY name COLLATE NOCASE ASC
    LIMIT 200`;

  const stmt = db.prepare(sql);
  const [res, promoMap] = await Promise.all([
    binds.length
      ? stmt.bind(...binds).all<BusinessListingRow>()
      : stmt.all<BusinessListingRow>(),
    getActivePromotionMap("business_listing"),
  ]);

  const mapped = (res.results ?? []).map((row) => {
    const endsAt = promoMap.get(row.id);
    return toPublicBusiness(
      row,
      canSensitive,
      endsAt ? { endsAt } : null,
    );
  });
  mapped.sort((a, b) => {
    if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  return mapped;
}

export async function getBusinessById(
  viewer: AuthUser,
  id: number,
): Promise<BusinessListingPublic | null> {
  const canSensitive = await viewerCanSeeSensitive(viewer);
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT * FROM business_listings
       WHERE id = ? AND opted_in = 1 AND disabled = 0 AND status = 'active'`,
    )
    .bind(id)
    .first<BusinessListingRow>();
  if (!row) return null;
  const promoMap = await getActivePromotionMap("business_listing");
  const endsAt = promoMap.get(row.id);
  return toPublicBusiness(row, canSensitive, endsAt ? { endsAt } : null);
}

export async function getBusinessRowForOwner(
  id: number,
  userId: number,
): Promise<BusinessListingRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(
        `SELECT * FROM business_listings WHERE id = ? AND user_id = ?`,
      )
      .bind(id, userId)
      .first<BusinessListingRow>()) ?? null
  );
}

/** Admin: list all profiles (including opted-out / disabled). */
export async function adminListProfiles(): Promise<DirectoryProfileRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM directory_profiles ORDER BY updated_at DESC LIMIT 500`,
    )
    .all<DirectoryProfileRow>();
  return res.results ?? [];
}

export async function adminListBusinesses(): Promise<BusinessListingRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM business_listings ORDER BY updated_at DESC LIMIT 500`,
    )
    .all<BusinessListingRow>();
  return res.results ?? [];
}

export async function listDistinctCities(): Promise<string[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT DISTINCT city AS c FROM directory_profiles
       WHERE opted_in = 1 AND disabled = 0 AND city IS NOT NULL AND city != ''
       ORDER BY city COLLATE NOCASE`,
    )
    .all<{ c: string }>();
  return (res.results ?? []).map((r) => r.c);
}

export async function listBusinessCities(): Promise<string[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT DISTINCT city AS c FROM business_listings
       WHERE opted_in = 1 AND disabled = 0 AND status = 'active'
         AND city IS NOT NULL AND city != ''
       ORDER BY city COLLATE NOCASE`,
    )
    .all<{ c: string }>();
  return (res.results ?? []).map((r) => r.c);
}
