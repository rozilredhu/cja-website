import { getDb } from "@/lib/db";
import type { FeatureFlagKey, FeatureFlagRow } from "./types";

const DEFAULTS: Record<FeatureFlagKey, boolean> = {
  directory: true,
  matrimonial: true,
  promotions: true,
  volunteer_form: true,
};

export async function listFeatureFlags(): Promise<FeatureFlagRow[]> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT key, enabled, label, updated_at FROM feature_flags
         ORDER BY key ASC`,
      )
      .all<FeatureFlagRow>();
    return res.results ?? [];
  } catch {
    return (Object.keys(DEFAULTS) as FeatureFlagKey[]).map((key) => ({
      key,
      enabled: DEFAULTS[key] ? 1 : 0,
      label: key,
      updated_at: "",
    }));
  }
}

export async function isFeatureEnabled(
  key: FeatureFlagKey,
): Promise<boolean> {
  try {
    const db = await getDb();
    const row = await db
      .prepare(`SELECT enabled FROM feature_flags WHERE key = ?`)
      .bind(key)
      .first<{ enabled: number }>();
    if (!row) return DEFAULTS[key] ?? true;
    return Boolean(row.enabled);
  } catch {
    return DEFAULTS[key] ?? true;
  }
}

/** Gate a module: returns error message when disabled, else null. */
export async function featureDisabledMessage(
  key: FeatureFlagKey,
): Promise<string | null> {
  const on = await isFeatureEnabled(key);
  if (on) return null;
  const labels: Record<FeatureFlagKey, string> = {
    directory: "Community Directory",
    matrimonial: "Matrimonial",
    promotions: "Paid promotions",
    volunteer_form: "Volunteer form",
  };
  return `${labels[key]} is temporarily unavailable.`;
}
