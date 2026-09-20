import { categoryOrder, officials } from "@/content/officials";
import type { Official } from "@/content/types";

export function getActiveOfficials(): Official[] {
  return officials
    .filter((o) => o.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getArchivedOfficials(): Official[] {
  return officials
    .filter((o) => o.status === "archived")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getFeaturedOfficials(limit = 4): Official[] {
  return getActiveOfficials().slice(0, limit);
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
  list: Official[] = getArchivedOfficials(),
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
  // Newest tenure first roughly by sorting label descending
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  return keys.map((tenure) => ({ tenure, items: map.get(tenure)! }));
}
