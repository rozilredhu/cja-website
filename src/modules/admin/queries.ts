import { getDb } from "@/lib/db";
import { countOverduePending } from "@/modules/matrimonial/queries";
import {
  countOverduePendingServices,
  countPendingServices,
} from "@/modules/services/queries";
import { isMaintenanceMode } from "./site-settings";
import type {
  DashboardCounts,
  NewsArticleRow,
  OfficialCategoryRow,
  OfficialRow,
  OfficialStatus,
  UserAdminRow,
} from "./types";

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const empty: DashboardCounts = {
    matrimonialPending: 0,
    matrimonialOverdue: 0,
    servicesPending: 0,
    servicesOverdue: 0,
    directoryDisabledProfiles: 0,
    directoryDisabledBusinesses: 0,
    newsDrafts: 0,
    membersDisabled: 0,
    officialsActive: 0,
    maintenanceMode: false,
  };

  try {
    const db = await getDb();
    const [
      matPending,
      matOverdue,
      svcPending,
      svcOverdue,
      dirProf,
      dirBiz,
      newsDrafts,
      memDisabled,
      offActive,
      maintenanceMode,
    ] = await Promise.all([
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM matrimonial_profiles WHERE status = 'pending'`,
        )
        .first<{ c: number }>(),
      countOverduePending().catch(() => 0),
      countPendingServices().catch(() => 0),
      countOverduePendingServices().catch(() => 0),
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM directory_profiles WHERE disabled = 1`,
        )
        .first<{ c: number }>(),
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM business_listings WHERE disabled = 1`,
        )
        .first<{ c: number }>(),
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM news_articles WHERE published = 0`,
        )
        .first<{ c: number }>(),
      db
        .prepare(`SELECT COUNT(*) AS c FROM users WHERE disabled = 1`)
        .first<{ c: number }>(),
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM officials WHERE status = 'active'`,
        )
        .first<{ c: number }>(),
      isMaintenanceMode(),
    ]);

    return {
      matrimonialPending: matPending?.c ?? 0,
      matrimonialOverdue: matOverdue,
      servicesPending: svcPending,
      servicesOverdue: svcOverdue,
      directoryDisabledProfiles: dirProf?.c ?? 0,
      directoryDisabledBusinesses: dirBiz?.c ?? 0,
      newsDrafts: newsDrafts?.c ?? 0,
      membersDisabled: memDisabled?.c ?? 0,
      officialsActive: offActive?.c ?? 0,
      maintenanceMode,
    };
  } catch {
    return empty;
  }
}

/* ── Officials ─────────────────────────────────────────── */

export async function listOfficials(opts?: {
  status?: OfficialStatus | "all";
}): Promise<OfficialRow[]> {
  const db = await getDb();
  const status = opts?.status ?? "all";
  if (status === "all") {
    const res = await db
      .prepare(
        `SELECT * FROM officials
         ORDER BY
           CASE status WHEN 'active' THEN 0 WHEN 'inactive' THEN 1 ELSE 2 END,
           category ASC, display_order ASC, id ASC`,
      )
      .all<OfficialRow>();
    return res.results ?? [];
  }
  const res = await db
    .prepare(
      `SELECT * FROM officials WHERE status = ?
       ORDER BY category ASC, display_order ASC, id ASC`,
    )
    .bind(status)
    .all<OfficialRow>();
  return res.results ?? [];
}

export async function getOfficialById(
  id: number,
): Promise<OfficialRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM officials WHERE id = ?`)
      .bind(id)
      .first<OfficialRow>()) ?? null
  );
}

export async function listOfficialCategories(): Promise<OfficialCategoryRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM official_categories
       ORDER BY display_order ASC, name ASC`,
    )
    .all<OfficialCategoryRow>();
  return res.results ?? [];
}

export async function listActiveCategoryNames(): Promise<string[]> {
  try {
    const cats = await listOfficialCategories();
    const active = cats.filter((c) => c.active).map((c) => c.name);
    if (active.length) return active;
  } catch {
    // fall through
  }
  return ["Executives", "Directors", "Corporate Secretary"];
}

/* ── News ──────────────────────────────────────────────── */

export async function adminListNews(): Promise<NewsArticleRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT * FROM news_articles
       ORDER BY
         CASE WHEN published = 1 THEN 0 ELSE 1 END,
         IFNULL(published_at, created_at) DESC`,
    )
    .all<NewsArticleRow>();
  return res.results ?? [];
}

export async function getNewsArticleById(
  id: number,
): Promise<NewsArticleRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM news_articles WHERE id = ?`)
      .bind(id)
      .first<NewsArticleRow>()) ?? null
  );
}

export async function getPublishedNewsBySlug(
  slug: string,
): Promise<NewsArticleRow | null> {
  try {
    const db = await getDb();
    return (
      (await db
        .prepare(
          `SELECT * FROM news_articles
           WHERE slug = ? AND published = 1`,
        )
        .bind(slug)
        .first<NewsArticleRow>()) ?? null
    );
  } catch {
    return null;
  }
}

export async function listPublishedNews(): Promise<NewsArticleRow[]> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT * FROM news_articles
         WHERE published = 1
         ORDER BY IFNULL(published_at, created_at) DESC`,
      )
      .all<NewsArticleRow>();
    return res.results ?? [];
  } catch {
    return [];
  }
}

/* ── Members ───────────────────────────────────────────── */

export async function adminSearchUsers(opts?: {
  q?: string;
  limit?: number;
}): Promise<UserAdminRow[]> {
  const db = await getDb();
  const limit = opts?.limit ?? 100;
  const q = opts?.q?.trim();
  if (q) {
    const pat = `%${q.replace(/[%_\\]/g, (ch) => `\\${ch}`)}%`;
    const res = await db
      .prepare(
        `SELECT id, email, name, role, disabled, email_verified_at, created_at
         FROM users
         WHERE email LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\'
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .bind(pat, pat, limit)
      .all<UserAdminRow>();
    return res.results ?? [];
  }
  const res = await db
    .prepare(
      `SELECT id, email, name, role, disabled, email_verified_at, created_at,
              last_login_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<UserAdminRow>();
  return res.results ?? [];
}
