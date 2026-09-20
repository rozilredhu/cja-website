import { getDb } from "@/lib/db";
import type { AuthUser } from "@/modules/auth/roles";
import { getActivePromotionMap } from "@/modules/payments/queries";
import { toPublicProfile } from "./privacy";
import type {
  AdminPendingProfile,
  MatrimonialContactMessageRow,
  MatrimonialProfilePublic,
  MatrimonialProfileRow,
  MatrimonialSearchFilters,
} from "./types";
import {
  dobBoundsForAgeRange,
  isPendingOverdue,
  oppositeGender,
} from "./utils";

type RowWithName = MatrimonialProfileRow & {
  member_name: string | null;
};

function likePattern(q: string): string {
  const escaped = q.replace(/[%_\\]/g, (ch) => `\\${ch}`);
  return `%${escaped}%`;
}

export async function getOwnMatrimonialProfile(
  userId: number,
): Promise<MatrimonialProfileRow | null> {
  const db = await getDb();
  return (
    (await db
      .prepare(`SELECT * FROM matrimonial_profiles WHERE user_id = ?`)
      .bind(userId)
      .first<MatrimonialProfileRow>()) ?? null
  );
}

export async function getApprovedOwnProfile(
  userId: number,
): Promise<MatrimonialProfileRow | null> {
  const own = await getOwnMatrimonialProfile(userId);
  if (!own || own.status !== "approved") return null;
  return own;
}

async function blockedUserIds(viewerId: number): Promise<Set<number>> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT blocked_user_id AS id FROM matrimonial_blocks WHERE blocker_user_id = ?
       UNION
       SELECT blocker_user_id AS id FROM matrimonial_blocks WHERE blocked_user_id = ?`,
    )
    .bind(viewerId, viewerId)
    .all<{ id: number }>();
  return new Set((res.results ?? []).map((r) => r.id));
}

export async function isBlockedBetween(
  a: number,
  b: number,
): Promise<boolean> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT 1 AS ok FROM matrimonial_blocks
       WHERE (blocker_user_id = ? AND blocked_user_id = ?)
          OR (blocker_user_id = ? AND blocked_user_id = ?)
       LIMIT 1`,
    )
    .bind(a, b, b, a)
    .first<{ ok: number }>();
  return Boolean(row);
}

/**
 * Browse opposite-gender approved profiles.
 * Viewer must have an approved profile. Blocks excluded. Promoted sorted first.
 * Scale: LIMIT 500 (≤ ~1000 profiles design).
 */
export async function searchMatrimonialProfiles(
  viewer: AuthUser,
  filters: MatrimonialSearchFilters = {},
): Promise<MatrimonialProfilePublic[]> {
  const own = await getApprovedOwnProfile(viewer.id);
  if (!own) return [];

  const targetGender = oppositeGender(own.gender);
  const blocked = await blockedUserIds(viewer.id);
  const db = await getDb();

  const clauses = [
    "mp.status = 'approved'",
    "mp.gender = ?",
    "mp.user_id != ?",
  ];
  const binds: (string | number)[] = [targetGender, viewer.id];

  const { dobMin, dobMax } = dobBoundsForAgeRange(
    filters.ageMin,
    filters.ageMax,
  );
  if (dobMax) {
    clauses.push("mp.date_of_birth <= ?");
    binds.push(dobMax);
  }
  if (dobMin) {
    clauses.push("mp.date_of_birth > ?");
    binds.push(dobMin);
  }

  if (filters.heightMinCm != null && Number.isFinite(filters.heightMinCm)) {
    clauses.push("mp.height_cm IS NOT NULL AND mp.height_cm >= ?");
    binds.push(filters.heightMinCm);
  }
  if (filters.heightMaxCm != null && Number.isFinite(filters.heightMaxCm)) {
    clauses.push("mp.height_cm IS NOT NULL AND mp.height_cm <= ?");
    binds.push(filters.heightMaxCm);
  }

  const city = filters.city?.trim();
  if (city) {
    clauses.push(`LOWER(IFNULL(mp.city,'')) = LOWER(?)`);
    binds.push(city);
  }
  const province = filters.province?.trim().toUpperCase();
  if (province) {
    clauses.push(`UPPER(IFNULL(mp.province,'')) = ?`);
    binds.push(province);
  }
  const education = filters.education?.trim();
  if (education) {
    clauses.push(`IFNULL(mp.education,'') LIKE ? ESCAPE '\\'`);
    binds.push(likePattern(education));
  }
  const occupation = filters.occupation?.trim();
  if (occupation) {
    clauses.push(`IFNULL(mp.occupation,'') LIKE ? ESCAPE '\\'`);
    binds.push(likePattern(occupation));
  }
  const gotra = filters.gotra?.trim();
  if (gotra) {
    clauses.push(`LOWER(IFNULL(mp.gotra,'')) = LOWER(?)`);
    binds.push(gotra);
  }
  const marital = filters.maritalStatus?.trim();
  if (marital) {
    clauses.push(`LOWER(IFNULL(mp.marital_status,'')) = LOWER(?)`);
    binds.push(marital);
  }

  const sql = `SELECT mp.*, u.name AS member_name
    FROM matrimonial_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY mp.updated_at DESC
    LIMIT 500`;

  const [res, promoMap] = await Promise.all([
    db.prepare(sql).bind(...binds).all<RowWithName>(),
    getActivePromotionMap("matrimonial_profile"),
  ]);

  const mapped: MatrimonialProfilePublic[] = [];
  for (const row of res.results ?? []) {
    if (blocked.has(row.user_id)) continue;
    const endsAt = promoMap.get(row.id);
    const pub = toPublicProfile(row, row.member_name, endsAt ? { endsAt } : null);
    if (pub) mapped.push(pub);
  }

  mapped.sort((a, b) => {
    if (a.promoted !== b.promoted) return a.promoted ? -1 : 1;
    return a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: "base",
    });
  });
  return mapped;
}

export async function getMatrimonialProfileById(
  viewer: AuthUser,
  id: number,
): Promise<MatrimonialProfilePublic | null> {
  const own = await getApprovedOwnProfile(viewer.id);
  if (!own) return null;

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT mp.*, u.name AS member_name
       FROM matrimonial_profiles mp
       JOIN users u ON u.id = mp.user_id
       WHERE mp.id = ? AND mp.status = 'approved'`,
    )
    .bind(id)
    .first<RowWithName>();
  if (!row) return null;
  if (row.user_id === viewer.id) {
    const promoMap = await getActivePromotionMap("matrimonial_profile");
    const endsAt = promoMap.get(row.id);
    return toPublicProfile(row, row.member_name, endsAt ? { endsAt } : null);
  }
  if (row.gender !== oppositeGender(own.gender)) return null;
  if (await isBlockedBetween(viewer.id, row.user_id)) return null;

  const promoMap = await getActivePromotionMap("matrimonial_profile");
  const endsAt = promoMap.get(row.id);
  return toPublicProfile(row, row.member_name, endsAt ? { endsAt } : null);
}

export async function listMatrimonialCities(): Promise<string[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT DISTINCT city AS c FROM matrimonial_profiles
       WHERE status = 'approved' AND city IS NOT NULL AND city != ''
       ORDER BY city COLLATE NOCASE`,
    )
    .all<{ c: string }>();
  return (res.results ?? []).map((r) => r.c);
}

export async function adminListPendingProfiles(): Promise<AdminPendingProfile[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT mp.*, u.name AS member_name, u.email AS member_email
       FROM matrimonial_profiles mp
       JOIN users u ON u.id = mp.user_id
       WHERE mp.status = 'pending'
       ORDER BY mp.submitted_at ASC, mp.created_at ASC
       LIMIT 200`,
    )
    .all<
      MatrimonialProfileRow & {
        member_name: string | null;
        member_email: string | null;
      }
    >();

  return (res.results ?? []).map((r) => ({
    ...r,
    overdue: isPendingOverdue(r.submitted_at ?? r.created_at),
  }));
}

export async function adminListAllProfiles(
  limit = 200,
): Promise<
  (MatrimonialProfileRow & {
    member_name: string | null;
    member_email: string | null;
  })[]
> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT mp.*, u.name AS member_name, u.email AS member_email
       FROM matrimonial_profiles mp
       JOIN users u ON u.id = mp.user_id
       ORDER BY mp.updated_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<
      MatrimonialProfileRow & {
        member_name: string | null;
        member_email: string | null;
      }
    >();
  return res.results ?? [];
}

export async function listInboxMessages(
  userId: number,
): Promise<MatrimonialContactMessageRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT m.*,
              fu.name AS from_name, fu.email AS from_email,
              tu.name AS to_name
       FROM matrimonial_contact_messages m
       JOIN users fu ON fu.id = m.from_user_id
       JOIN users tu ON tu.id = m.to_user_id
       WHERE m.to_user_id = ? OR m.from_user_id = ?
       ORDER BY m.created_at DESC
       LIMIT 200`,
    )
    .bind(userId, userId)
    .all<MatrimonialContactMessageRow>();
  return res.results ?? [];
}

export async function adminListOpenReports(): Promise<
  (import("./types").MatrimonialReportRow & {
    reporter_email: string | null;
    profile_user_id: number;
  })[]
> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT r.*, u.email AS reporter_email, mp.user_id AS profile_user_id
       FROM matrimonial_reports r
       JOIN users u ON u.id = r.reporter_user_id
       JOIN matrimonial_profiles mp ON mp.id = r.reported_profile_id
       WHERE r.status = 'open'
       ORDER BY r.created_at ASC
       LIMIT 100`,
    )
    .all<
      import("./types").MatrimonialReportRow & {
        reporter_email: string | null;
        profile_user_id: number;
      }
    >();
  return res.results ?? [];
}

export async function countOverduePending(): Promise<number> {
  const pending = await adminListPendingProfiles();
  return pending.filter((p) => p.overdue).length;
}
