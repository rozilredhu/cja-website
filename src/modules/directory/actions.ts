"use server";

import { featureDisabledMessage } from "@/modules/admin/feature-flags";

import { revalidatePath } from "next/cache";
import { getDb, getMediaBucket } from "@/lib/db";
import { requireAdminUser, requireMemberUser } from "@/modules/auth/session";
import type { DirectoryFormState } from "./types";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function boolFlag(formData: FormData, key: string): number {
  const v = formData.get(key);
  return v === "on" || v === "1" || v === "true" ? 1 : 0;
}

async function tryUploadPhoto(
  formData: FormData,
  field: string,
  prefix: string,
): Promise<{ photo_key: string | null; photo_url: string | null }> {
  const urlField = str(formData, "photo_url");
  const file = formData.get(field);

  if (file && typeof file !== "string" && "arrayBuffer" in file) {
    const f = file as File;
    if (f.size > 0 && f.size <= 2_000_000) {
      const bucket = await getMediaBucket();
      if (bucket) {
        const ext =
          f.type === "image/png"
            ? "png"
            : f.type === "image/webp"
              ? "webp"
              : "jpg";
        const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        await bucket.put(key, await f.arrayBuffer(), {
          httpMetadata: { contentType: f.type || "image/jpeg" },
        });
        return { photo_key: key, photo_url: urlField || null };
      }
    }
  }

  return { photo_key: null, photo_url: urlField || null };
}

export async function saveDirectoryProfileAction(
  _prev: DirectoryFormState,
  formData: FormData,
): Promise<DirectoryFormState> {
  const __ff = await featureDisabledMessage("directory");
  if (__ff) return { error: __ff };

  const user = await requireMemberUser();
  const displayName = str(formData, "display_name") || user.name || user.email;
  const phone = str(formData, "phone") || null;
  const addressLine = str(formData, "address_line") || null;
  const city = str(formData, "city") || null;
  const province = str(formData, "province").toUpperCase() || null;
  const education = str(formData, "education") || null;
  const bio = str(formData, "bio") || null;
  const optedIn = boolFlag(formData, "opted_in");
  const showPhone = boolFlag(formData, "show_phone");
  const showAddress = boolFlag(formData, "show_address");
  const showPhoto = boolFlag(formData, "show_photo");
  const showEducation = boolFlag(formData, "show_education");

  if (province && province.length !== 2) {
    return { error: "Province must be a 2-letter Canadian code (e.g. ON)." };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database unavailable." };
  }

  const existing = await db
    .prepare(`SELECT id, photo_key, photo_url FROM directory_profiles WHERE user_id = ?`)
    .bind(user.id)
    .first<{ id: number; photo_key: string | null; photo_url: string | null }>();

  const uploaded = await tryUploadPhoto(
    formData,
    "photo",
    `directory/profiles/${user.id}`,
  );
  const finalPhotoKey = uploaded.photo_key || existing?.photo_key || null;
  // Explicit empty photo_url clears the URL unless a new R2 upload arrived
  const submittedUrl = str(formData, "photo_url");
  const finalPhotoUrl = uploaded.photo_key
    ? submittedUrl || existing?.photo_url || null
    : submittedUrl || null;

  if (existing) {
    await db
      .prepare(
        `UPDATE directory_profiles SET
          opted_in = ?,
          display_name = ?,
          phone = ?,
          address_line = ?,
          city = ?,
          province = ?,
          education = ?,
          bio = ?,
          photo_key = ?,
          photo_url = ?,
          show_phone = ?,
          show_address = ?,
          show_photo = ?,
          show_education = ?,
          opted_in_at = CASE
            WHEN ? = 1 AND (opted_in = 0 OR opted_in_at IS NULL) THEN datetime('now')
            WHEN ? = 0 THEN NULL
            ELSE opted_in_at
          END,
          updated_at = datetime('now')
         WHERE user_id = ?`,
      )
      .bind(
        optedIn,
        displayName,
        phone,
        addressLine,
        city,
        province,
        education,
        bio,
        finalPhotoKey,
        finalPhotoUrl,
        showPhone,
        showAddress,
        showPhoto,
        showEducation,
        optedIn,
        optedIn,
        user.id,
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO directory_profiles (
          user_id, opted_in, display_name, phone, address_line, city, province,
          education, bio, photo_key, photo_url, show_phone, show_address,
          show_photo, show_education, opted_in_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END)`,
      )
      .bind(
        user.id,
        optedIn,
        displayName,
        phone,
        addressLine,
        city,
        province,
        education,
        bio,
        finalPhotoKey,
        finalPhotoUrl,
        showPhone,
        showAddress,
        showPhoto,
        showEducation,
        optedIn,
      )
      .run();
  }

  revalidatePath("/members/directory");
  revalidatePath("/members/directory/browse");
  return {
    ok: true,
    message: optedIn
      ? "Directory profile saved — you are opted in."
      : "Directory profile saved — you are opted out (not listed).",
  };
}

export async function saveBusinessListingAction(
  _prev: DirectoryFormState,
  formData: FormData,
): Promise<DirectoryFormState> {
  const __ff = await featureDisabledMessage("directory");
  if (__ff) return { error: __ff };

  const user = await requireMemberUser();
  const idRaw = str(formData, "id");
  const id = idRaw ? Number(idRaw) : null;
  const name = str(formData, "name");
  const description = str(formData, "description") || null;
  const city = str(formData, "city") || null;
  const province = str(formData, "province").toUpperCase() || null;
  const phone = str(formData, "phone") || null;
  const email = str(formData, "email") || null;
  const website = str(formData, "website") || null;
  const addressLine = str(formData, "address_line") || null;
  const optedIn = boolFlag(formData, "opted_in");

  if (!name) return { error: "Business name is required." };
  if (province && province.length !== 2) {
    return { error: "Province must be a 2-letter Canadian code (e.g. ON)." };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database unavailable." };
  }

  const uploaded = await tryUploadPhoto(
    formData,
    "photo",
    `directory/businesses/${user.id}`,
  );

  if (id && Number.isFinite(id)) {
    const owned = await db
      .prepare(
        `SELECT id, photo_key, photo_url FROM business_listings WHERE id = ? AND user_id = ?`,
      )
      .bind(id, user.id)
      .first<{ id: number; photo_key: string | null; photo_url: string | null }>();
    if (!owned) return { error: "Business listing not found." };

    const finalPhotoKey = uploaded.photo_key || owned.photo_key || null;
    const clearUrl = str(formData, "photo_url") === "" && !uploaded.photo_key;
    const finalPhotoUrl = clearUrl
      ? null
      : uploaded.photo_url || owned.photo_url || null;

    await db
      .prepare(
        `UPDATE business_listings SET
          name = ?, description = ?, city = ?, province = ?, phone = ?,
          email = ?, website = ?, address_line = ?, photo_key = ?, photo_url = ?,
          opted_in = ?, status = CASE WHEN ? = 1 THEN 'active' ELSE status END,
          updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
      )
      .bind(
        name,
        description,
        city,
        province,
        phone,
        email,
        website,
        addressLine,
        finalPhotoKey,
        finalPhotoUrl,
        optedIn,
        optedIn,
        id,
        user.id,
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO business_listings (
          user_id, name, description, city, province, phone, email, website,
          address_line, photo_key, photo_url, opted_in, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      )
      .bind(
        user.id,
        name,
        description,
        city,
        province,
        phone,
        email,
        website,
        addressLine,
        uploaded.photo_key,
        uploaded.photo_url,
        optedIn,
      )
      .run();
  }

  revalidatePath("/members/directory");
  revalidatePath("/members/directory/businesses");
  return {
    ok: true,
    message: optedIn
      ? "Business listing saved and visible to members."
      : "Business listing saved (opted out — not listed).",
  };
}

export async function deleteBusinessListingAction(
  formData: FormData,
): Promise<void> {
  const __ff = await featureDisabledMessage("directory");
  if (__ff) return;

  const user = await requireMemberUser();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id)) return;
  const db = await getDb();
  await db
    .prepare(`DELETE FROM business_listings WHERE id = ? AND user_id = ?`)
    .bind(id, user.id)
    .run();
  revalidatePath("/members/directory");
  revalidatePath("/members/directory/businesses");
}

export async function adminSetProfileDisabledAction(
  formData: FormData,
): Promise<void> {
  const __ff = await featureDisabledMessage("directory");
  if (__ff) return;

  await requireAdminUser();
  const id = Number(str(formData, "id"));
  const disabled = boolFlag(formData, "disabled");
  if (!Number.isFinite(id)) return;
  const db = await getDb();
  await db
    .prepare(
      `UPDATE directory_profiles SET disabled = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(disabled, id)
    .run();
  revalidatePath("/admin/directory");
  revalidatePath("/members/directory/browse");
}

export async function adminSetBusinessDisabledAction(
  formData: FormData,
): Promise<void> {
  const __ff = await featureDisabledMessage("directory");
  if (__ff) return;

  await requireAdminUser();
  const id = Number(str(formData, "id"));
  const disabled = boolFlag(formData, "disabled");
  if (!Number.isFinite(id)) return;
  const db = await getDb();
  await db
    .prepare(
      `UPDATE business_listings SET disabled = ?,
        status = CASE WHEN ? = 1 THEN 'disabled' ELSE 'active' END,
        updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(disabled, disabled, id)
    .run();
  revalidatePath("/admin/directory");
  revalidatePath("/members/directory/businesses");
}
