import { getDb } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const db = await getDb();
    const row = await db
      .prepare(`SELECT value FROM site_settings WHERE key = ?`)
      .bind(key)
      .first<{ value: string }>();
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = datetime('now')`,
    )
    .bind(key, value)
    .run();
}

export async function isMaintenanceMode(): Promise<boolean> {
  const v = await getSetting("maintenance_mode");
  return v === "1" || v === "true" || v === "on";
}
