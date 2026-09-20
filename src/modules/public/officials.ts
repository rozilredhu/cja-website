import { categoryOrder, officials as fileOfficials } from "@/content/officials";
import type { Official } from "@/content/types";
import { getDb } from "@/lib/db";
import type { OfficialRow } from "@/modules/admin/types";

function mapRow(row: OfficialRow): Official {
  return {
    id: String(row.id),
    fullName: row.full_name,
    designation: row.designation,
    category: row.category,
    displayOrder: row.display_order,
    status: row.status,
    photoUrl: row.photo_url,
    shortBio: row.short_bio ?? undefined,
    joinedAt: row.join_date ?? undefined,
    termStart: row.term_start ?? undefined,
    termEnd: row.term_end ?? undefined,
    socialUrl: row.social_url ?? undefined,
    tenureLabel: row.tenure_label ?? undefined,
  };
}

async function loadFromDb(): Promise<Official[] | null> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(`SELECT * FROM officials`)
      .all<OfficialRow>();
    const rows = res.results ?? [];
    if (!rows.length) return null;
    return rows.map(mapRow);
  } catch {
    return null;
  }
}

async function allOfficials(): Promise<Official[]> {
  const fromDb = await loadFromDb();
  return fromDb ?? fileOfficials;
}

export async function getActiveOfficials(): Promise<Official[]> {
  return (await allOfficials())
    .filter((o) => o.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getArchivedOfficials(): Promise<Official[]> {
  return (await allOfficials())
    .filter((o) => o.status === "archived")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getFeaturedOfficials(limit = 4): Promise<Official[]> {
  return (await getActiveOfficials()).slice(0, limit);
}

/** Group active officials by category, respecting preferred order then alpha. */
export function groupOfficialsByCategory(
  list: Official[],
): { category: string; items: Official[] }[] {
  const map = new Map<string, Official[]>();
  for (const item of list) {
    const bucket = map.get(item.category) ?? [];
    bucket.push(item);
    map.set(item.category, bucket);
  }
  for (const [, items] of map) {
    items.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  const preferred = categoryOrder as readonly string[];
  const keys = [...map.keys()].sort((a, b) => {
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return keys.map((category) => ({
    category,
    items: map.get(category)!,
  }));
}

/** Group archived officials by tenureLabel (e.g. 2022–2025). */
export function groupArchivedByTenure(
  list: Official[],
): { tenure: string; items: Official[] }[] {
  const map = new Map<string, Official[]>();
  for (const item of list) {
    const tenure = item.tenureLabel ?? "Other";
    const bucket = map.get(tenure) ?? [];
    bucket.push(item);
    map.set(tenure, bucket);
  }
  for (const [, items] of map) {
    items.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  return keys.map((tenure) => ({ tenure, items: map.get(tenure)! }));
}
