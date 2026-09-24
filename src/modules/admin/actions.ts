"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, getMediaBucket } from "@/lib/db";
import { isAdminRole, isSuperAdmin } from "@/modules/auth/roles";
import { requireAdminUser } from "@/modules/auth/session";
import { writeAuditLog } from "./audit";
import { setSetting } from "./site-settings";
import type { AdminFormState, FeatureFlagKey, OfficialStatus } from "./types";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function boolFlag(formData: FormData, key: string): number {
  const v = formData.get(key);
  return v === "on" || v === "1" || v === "true" ? 1 : 0;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 2_000_000;

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function resolveOfficialPhoto(
  formData: FormData,
): Promise<
  | { ok: true; photo_url: string | null; photo_key: string | null }
  | { ok: false; error: string }
> {
  const urlField = str(formData, "photo_url");
  const keyStub = str(formData, "photo_key") || null;
  const file = formData.get("photo_file");

  if (urlField && !isValidHttpUrl(urlField)) {
    return { ok: false, error: "Photo URL must be http(s)." };
  }

  if (file && typeof file !== "string" && "arrayBuffer" in file) {
    const f = file as File;
    if (f.size > 0) {
      if (f.size > MAX_IMAGE_BYTES) {
        return { ok: false, error: "Image must be 2 MB or smaller." };
      }
      const type = f.type || "";
      if (type && !ALLOWED_IMAGE_TYPES.has(type)) {
        return {
          ok: false,
          error: "Image must be JPEG, PNG, WebP, or GIF.",
        };
      }
      const bucket = await getMediaBucket();
      if (bucket) {
        const ext =
          type === "image/png"
            ? "png"
            : type === "image/webp"
              ? "webp"
              : type === "image/gif"
                ? "gif"
                : "jpg";
        const key = `officials/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        await bucket.put(key, await f.arrayBuffer(), {
          httpMetadata: { contentType: type || "image/jpeg" },
        });
        return {
          ok: true,
          photo_key: key,
          photo_url: urlField || null,
        };
      }
      // No R2 — accept URL / key stub only
      if (!urlField && !keyStub) {
        return {
          ok: false,
          error:
            "R2 media is not configured. Provide a photo URL or R2 key stub instead of uploading a file.",
        };
      }
    }
  }

  return {
    ok: true,
    photo_url: urlField || null,
    photo_key: keyStub,
  };
}

function parseStatus(raw: string): OfficialStatus | null {
  if (raw === "active" || raw === "inactive" || raw === "archived") return raw;
  return null;
}

function revalidateOfficialsPublic() {
  revalidatePath("/officials");
  revalidatePath("/past-executives");
  revalidatePath("/");
  revalidatePath("/admin/officials");
  revalidatePath("/admin");
}

function revalidateNewsPublic(slug?: string) {
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/news/${slug}`);
}

/* ── Officials CRUD ────────────────────────────────────── */

export async function saveOfficialAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdminUser();
  const idRaw = str(formData, "id");
  const id = idRaw ? Number(idRaw) : null;

  const fullName = str(formData, "full_name");
  const designation = str(formData, "designation");
  const category = str(formData, "category");
  const joinDate = str(formData, "join_date") || null;
  const shortBio = str(formData, "short_bio") || null;
  const termStart = str(formData, "term_start") || null;
  const termEnd = str(formData, "term_end") || null;
  const socialUrl = str(formData, "social_url") || null;
  const displayOrder = Number(str(formData, "display_order") || "0");
  const status = parseStatus(str(formData, "status"));
  const tenureLabel = str(formData, "tenure_label") || null;

  if (!fullName || !designation || !category) {
    return { error: "Full name, designation, and category are required." };
  }
  if (!status) {
    return { error: "Status must be active, inactive, or archived." };
  }
  if (!Number.isFinite(displayOrder)) {
    return { error: "Display order must be a number." };
  }
  if (socialUrl && !isValidHttpUrl(socialUrl)) {
    return { error: "Social link must be a valid http(s) URL." };
  }

  const photo = await resolveOfficialPhoto(formData);
  if (!photo.ok) return { error: photo.error };

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database unavailable." };
  }

  if (id) {
    const existing = await db
      .prepare(`SELECT id, photo_url, photo_key FROM officials WHERE id = ?`)
      .bind(id)
      .first<{ id: number; photo_url: string | null; photo_key: string | null }>();
    if (!existing) return { error: "Official not found." };

    const nextUrl = photo.photo_url ?? existing.photo_url;
    const nextKey = photo.photo_key ?? existing.photo_key;

    await db
      .prepare(
        `UPDATE officials SET
           full_name = ?, designation = ?, category = ?,
           photo_url = ?, photo_key = ?, join_date = ?, short_bio = ?,
           term_start = ?, term_end = ?, social_url = ?,
           display_order = ?, status = ?, tenure_label = ?,
           updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        fullName,
        designation,
        category,
        nextUrl,
        nextKey,
        joinDate,
        shortBio,
        termStart,
        termEnd,
        socialUrl,
        displayOrder,
        status,
        tenureLabel,
        id,
      )
      .run();

    await writeAuditLog({
      actorUserId: admin.id,
      action: "official.update",
      entityType: "official",
      entityId: id,
      details: `${fullName} → ${status}`,
    });
  } else {
    const result = await db
      .prepare(
        `INSERT INTO officials (
           full_name, designation, category, photo_url, photo_key,
           join_date, short_bio, term_start, term_end, social_url,
           display_order, status, tenure_label
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        fullName,
        designation,
        category,
        photo.photo_url,
        photo.photo_key,
        joinDate,
        shortBio,
        termStart,
        termEnd,
        socialUrl,
        displayOrder,
        status,
        tenureLabel,
      )
      .run();

    await writeAuditLog({
      actorUserId: admin.id,
      action: "official.create",
      entityType: "official",
      entityId: result.meta.last_row_id ?? null,
      details: fullName,
    });
  }

  revalidateOfficialsPublic();
  return { success: id ? "Official updated." : "Official created." };
}

export async function setOfficialStatusAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdminUser();
  const id = Number(str(formData, "id"));
  const status = parseStatus(str(formData, "status"));
  if (!id || !status) return;

  const db = await getDb();
  await db
    .prepare(
      `UPDATE officials SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(status, id)
    .run();

  await writeAuditLog({
    actorUserId: admin.id,
    action: `official.${status}`,
    entityType: "official",
    entityId: id,
  });
  revalidateOfficialsPublic();
}

export async function reorderOfficialAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdminUser();
  const id = Number(str(formData, "id"));
  const displayOrder = Number(str(formData, "display_order"));
  if (!id || !Number.isFinite(displayOrder)) return;

  const db = await getDb();
  await db
    .prepare(
      `UPDATE officials SET display_order = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(displayOrder, id)
    .run();

  await writeAuditLog({
    actorUserId: admin.id,
    action: "official.reorder",
    entityType: "official",
    entityId: id,
    details: `order=${displayOrder}`,
  });
  revalidateOfficialsPublic();
}

export async function saveOfficialCategoryAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdminUser();
  const name = str(formData, "name");
  const displayOrder = Number(str(formData, "display_order") || "0");
  if (!name) return { error: "Category name is required." };

  const db = await getDb();
  try {
    await db
      .prepare(
        `INSERT INTO official_categories (name, display_order, active)
         VALUES (?, ?, 1)`,
      )
      .bind(name, displayOrder)
      .run();
  } catch {
    return { error: "Category already exists or could not be saved." };
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "official_category.create",
    entityType: "official_category",
    details: name,
  });
  revalidatePath("/admin/officials");
  return { success: "Category added." };
}

/* ── Members ───────────────────────────────────────────── */

export async function adminSetUserDisabledAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdminUser();
  const id = Number(str(formData, "id"));
  const disabled = str(formData, "disabled") === "1" ? 1 : 0;
  if (!id) return;
  if (id === admin.id) return; // never disable self

  const db = await getDb();
  const target = await db
    .prepare(`SELECT id, role, email FROM users WHERE id = ?`)
    .bind(id)
    .first<{ id: number; role: string; email: string }>();
  if (!target) return;

  // Limited admins may only enable/disable members — never other admins.
  if (isAdminRole(target.role) && !isSuperAdmin(admin)) {
    return;
  }

  // Super admins manage other admins via /admin/admins; members page is for members.
  if (isAdminRole(target.role) && isSuperAdmin(admin)) {
    return;
  }

  await db
    .prepare(
      `UPDATE users SET disabled = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(disabled, id)
    .run();

  if (disabled) {
    await db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(id).run();
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: disabled ? "user.disable" : "user.enable",
    entityType: "user",
    entityId: id,
    details: target.email,
  });
  revalidatePath("/admin/members");
  revalidatePath("/admin");
}

/* ── News CMS ──────────────────────────────────────────── */

export async function saveNewsArticleAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdminUser();
  const idRaw = str(formData, "id");
  const id = idRaw ? Number(idRaw) : null;

  const title = str(formData, "title");
  let slug = str(formData, "slug") || slugify(title);
  const metaDescription = str(formData, "meta_description");
  const body = str(formData, "body");
  const author = str(formData, "author") || null;
  const published = boolFlag(formData, "published");
  const featured = boolFlag(formData, "featured");
  let publishedAt = str(formData, "published_at") || null;

  if (!title || !slug) {
    return { error: "Title and slug are required." };
  }
  slug = slugify(slug);
  if (!slug) return { error: "Slug is invalid." };

  if (published && !publishedAt) {
    publishedAt = new Date().toISOString().slice(0, 10);
  }
  if (!published) {
    // keep published_at if set, for scheduling later
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database unavailable." };
  }

  const clash = await db
    .prepare(
      `SELECT id FROM news_articles WHERE slug = ? AND id != IFNULL(?, -1)`,
    )
    .bind(slug, id ?? null)
    .first<{ id: number }>();
  if (clash) return { error: "That slug is already in use." };

  if (id) {
    await db
      .prepare(
        `UPDATE news_articles SET
           title = ?, slug = ?, meta_description = ?, body = ?,
           published = ?, published_at = ?, author = ?, featured = ?,
           updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        title,
        slug,
        metaDescription,
        body,
        published,
        publishedAt,
        author,
        featured,
        id,
      )
      .run();

    await writeAuditLog({
      actorUserId: admin.id,
      action: "news.update",
      entityType: "news_article",
      entityId: id,
      details: slug,
    });
    revalidateNewsPublic(slug);
    return { success: "Article saved." };
  }

  const result = await db
    .prepare(
      `INSERT INTO news_articles (
         title, slug, meta_description, body, published, published_at, author, featured
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      title,
      slug,
      metaDescription,
      body,
      published,
      publishedAt,
      author,
      featured,
    )
    .run();

  const newId = result.meta.last_row_id;
  await writeAuditLog({
    actorUserId: admin.id,
    action: "news.create",
    entityType: "news_article",
    entityId: newId ?? null,
    details: slug,
  });
  revalidateNewsPublic(slug);
  redirect(`/admin/news/${newId}`);
}

export async function deleteNewsArticleAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdminUser();
  const id = Number(str(formData, "id"));
  if (!id) return;

  const db = await getDb();
  const row = await db
    .prepare(`SELECT slug FROM news_articles WHERE id = ?`)
    .bind(id)
    .first<{ slug: string }>();
  if (!row) return;

  await db.prepare(`DELETE FROM news_articles WHERE id = ?`).bind(id).run();
  await writeAuditLog({
    actorUserId: admin.id,
    action: "news.delete",
    entityType: "news_article",
    entityId: id,
    details: row.slug,
  });
  revalidateNewsPublic(row.slug);
}

/* ── Feature flags ─────────────────────────────────────── */

export async function toggleFeatureFlagAction(
  formData: FormData,
): Promise<void> {
  const { requireSuperAdminUser } = await import("@/modules/auth/session");
  const admin = await requireSuperAdminUser();
  const key = str(formData, "key") as FeatureFlagKey;
  const enabled = str(formData, "enabled") === "1" ? 1 : 0;
  const allowed: FeatureFlagKey[] = [
    "directory",
    "matrimonial",
    "promotions",
    "volunteer_form",
  ];
  if (!allowed.includes(key)) return;

  const db = await getDb();
  await db
    .prepare(
      `UPDATE feature_flags SET enabled = ?, updated_at = datetime('now')
       WHERE key = ?`,
    )
    .bind(enabled, key)
    .run();

  await writeAuditLog({
    actorUserId: admin.id,
    action: enabled ? "feature.enable" : "feature.disable",
    entityType: "feature_flag",
    entityId: key,
  });
  revalidatePath("/admin/features");
  revalidatePath("/admin");
  revalidatePath("/members");
  revalidatePath("/contact/volunteer");
}

/* ── Maintenance ───────────────────────────────────────── */

export async function setMaintenanceModeAction(
  formData: FormData,
): Promise<void> {
  const { requireSuperAdminUser } = await import("@/modules/auth/session");
  const admin = await requireSuperAdminUser();
  const enabled = str(formData, "enabled") === "1" ? "1" : "0";
  await setSetting("maintenance_mode", enabled);

  await writeAuditLog({
    actorUserId: admin.id,
    action: enabled === "1" ? "maintenance.on" : "maintenance.off",
    entityType: "site_settings",
    entityId: "maintenance_mode",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}
