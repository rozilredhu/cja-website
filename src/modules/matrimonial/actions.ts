"use server";

import { revalidatePath } from "next/cache";
import { getDb, getMediaBucket } from "@/lib/db";
import { enqueueEmailStub } from "@/modules/auth/email";
import { requireAdminUser, requireMemberUser } from "@/modules/auth/session";
import type { MatrimonialFormState, MatrimonialGender } from "./types";
import { ftInToCm, isPendingOverdue } from "./utils";
import {
  getApprovedOwnProfile,
  getMatrimonialProfileById,
  getOwnMatrimonialProfile,
  isBlockedBetween,
} from "./queries";

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

function parseHeightCm(formData: FormData): number | null {
  const direct = str(formData, "height_cm");
  if (direct) {
    const n = Number(direct);
    if (Number.isFinite(n) && n >= 100 && n <= 250) return Math.round(n);
  }
  const ft = Number(str(formData, "height_ft") || "0");
  const inches = Number(str(formData, "height_in") || "0");
  if (ft > 0 || inches > 0) return ftInToCm(ft, inches);
  return null;
}

async function notifyAdminsNewSubmission(opts: {
  profileId: number;
  memberName: string;
  memberEmail: string;
}): Promise<void> {
  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return;
  }
  const admins = await db
    .prepare(
      `SELECT email, name FROM users WHERE role = 'admin' AND disabled = 0`,
    )
    .all<{ email: string; name: string }>();

  for (const a of admins.results ?? []) {
    await enqueueEmailStub({
      to: a.email,
      subject: "Matrimonial profile pending review",
      body: `Hi ${a.name || "Admin"},\n\nA matrimonial profile (#${opts.profileId}) from ${opts.memberName} <${opts.memberEmail}> was submitted and is pending review.\n\nReview inbox: /admin/matrimonial\nProfiles pending > 24 hours are flagged overdue.\n\n— CJA`,
      meta: {
        kind: "matrimonial_pending",
        profile_id: opts.profileId,
      },
    });
  }
}

export async function saveMatrimonialProfileAction(
  _prev: MatrimonialFormState,
  formData: FormData,
): Promise<MatrimonialFormState> {
  const user = await requireMemberUser();
  const gender = str(formData, "gender") as MatrimonialGender;
  const dob = str(formData, "date_of_birth");
  const maritalStatus = str(formData, "marital_status") || null;
  const city = str(formData, "city") || null;
  const province = str(formData, "province").toUpperCase() || null;
  const education = str(formData, "education") || null;
  const occupation = str(formData, "occupation") || null;
  const gotra = str(formData, "gotra") || null;
  const motherGotra = str(formData, "mother_gotra") || null;
  const nativePlace = str(formData, "native_place") || null;
  const motherTongue = str(formData, "mother_tongue") || null;
  const diet = str(formData, "diet") || null;
  const willing = boolFlag(formData, "willing_to_relocate");
  const partnerPrefs = str(formData, "partner_preferences") || null;
  const shortBio = str(formData, "short_bio") || null;
  const heightCm = parseHeightCm(formData);

  if (gender !== "man" && gender !== "woman") {
    return { error: "Select gender (man or woman)." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return { error: "Date of birth is required (YYYY-MM-DD). Age is calculated automatically." };
  }
  // Sanity: 18+
  const birth = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) {
    return { error: "Invalid date of birth." };
  }
  const ageMs = Date.now() - birth.getTime();
  const years = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 18 || years > 100) {
    return { error: "You must be at least 18 years old." };
  }
  if (province && province.length !== 2) {
    return { error: "Province must be a 2-letter Canadian code (e.g. ON)." };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database unavailable." };
  }

  const existing = await getOwnMatrimonialProfile(user.id);
  const uploaded = await tryUploadPhoto(
    formData,
    "photo",
    `matrimonial/profiles/${user.id}`,
  );
  const submittedUrl = str(formData, "photo_url");
  const finalPhotoKey = uploaded.photo_key || existing?.photo_key || null;
  const finalPhotoUrl = uploaded.photo_key
    ? submittedUrl || existing?.photo_url || null
    : submittedUrl || null;

  // Any create/edit → pending (re-review)
  if (existing) {
    await db
      .prepare(
        `UPDATE matrimonial_profiles SET
          gender = ?, date_of_birth = ?, height_cm = ?, marital_status = ?,
          city = ?, province = ?, education = ?, occupation = ?,
          gotra = ?, mother_gotra = ?, native_place = ?, mother_tongue = ?,
          diet = ?, willing_to_relocate = ?, partner_preferences = ?, short_bio = ?,
          photo_key = ?, photo_url = ?,
          status = 'pending', admin_note = NULL, reviewed_at = NULL, reviewed_by = NULL,
          submitted_at = datetime('now'), updated_at = datetime('now')
         WHERE user_id = ?`,
      )
      .bind(
        gender,
        dob,
        heightCm,
        maritalStatus,
        city,
        province,
        education,
        occupation,
        gotra,
        motherGotra,
        nativePlace,
        motherTongue,
        diet,
        willing,
        partnerPrefs,
        shortBio,
        finalPhotoKey,
        finalPhotoUrl,
        user.id,
      )
      .run();

    await notifyAdminsNewSubmission({
      profileId: existing.id,
      memberName: user.name || user.email,
      memberEmail: user.email,
    });
  } else {
    const insert = await db
      .prepare(
        `INSERT INTO matrimonial_profiles (
          user_id, gender, date_of_birth, height_cm, marital_status,
          city, province, education, occupation,
          gotra, mother_gotra, native_place, mother_tongue, diet,
          willing_to_relocate, partner_preferences, short_bio,
          photo_key, photo_url, status, submitted_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, 'pending', datetime('now')
        )`,
      )
      .bind(
        user.id,
        gender,
        dob,
        heightCm,
        maritalStatus,
        city,
        province,
        education,
        occupation,
        gotra,
        motherGotra,
        nativePlace,
        motherTongue,
        diet,
        willing,
        partnerPrefs,
        shortBio,
        finalPhotoKey,
        finalPhotoUrl,
      )
      .run();

    const profileId = Number(insert.meta.last_row_id);
    await notifyAdminsNewSubmission({
      profileId: Number.isFinite(profileId) ? profileId : 0,
      memberName: user.name || user.email,
      memberEmail: user.email,
    });
  }

  revalidatePath("/members/matrimonial");
  revalidatePath("/members/matrimonial/browse");
  revalidatePath("/admin/matrimonial");
  return {
    ok: true,
    message:
      "Profile saved and submitted for admin review (status: pending). You can browse after approval.",
  };
}

export async function adminReviewMatrimonialAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdminUser();
  const id = Number(str(formData, "id"));
  const decision = str(formData, "decision"); // approve | reject
  const note = str(formData, "admin_note") || null;
  if (!Number.isFinite(id) || (decision !== "approve" && decision !== "reject")) {
    return;
  }

  const db = await getDb();
  const status = decision === "approve" ? "approved" : "rejected";
  await db
    .prepare(
      `UPDATE matrimonial_profiles SET
        status = ?, admin_note = ?, reviewed_at = datetime('now'),
        reviewed_by = ?, updated_at = datetime('now')
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(status, note, admin.id, id)
    .run();

  const row = await db
    .prepare(
      `SELECT mp.id, u.email, u.name FROM matrimonial_profiles mp
       JOIN users u ON u.id = mp.user_id WHERE mp.id = ?`,
    )
    .bind(id)
    .first<{ id: number; email: string; name: string }>();

  if (row) {
    await enqueueEmailStub({
      to: row.email,
      subject:
        status === "approved"
          ? "Your matrimonial profile was approved"
          : "Your matrimonial profile was not approved",
      body:
        status === "approved"
          ? `Hi ${row.name || "there"},\n\nYour matrimonial profile (#${row.id}) is approved. You can browse opposite-gender profiles at /members/matrimonial/browse.\n\n— CJA`
          : `Hi ${row.name || "there"},\n\nYour matrimonial profile (#${row.id}) was not approved.${note ? `\n\nNote: ${note}` : ""}\n\nYou may edit and resubmit at /members/matrimonial.\n\n— CJA`,
      meta: { kind: "matrimonial_review", profile_id: id, status },
    });
  }

  revalidatePath("/admin/matrimonial");
  revalidatePath("/members/matrimonial");
  revalidatePath("/members/matrimonial/browse");
}

export async function sendMatrimonialContactAction(
  _prev: MatrimonialFormState,
  formData: FormData,
): Promise<MatrimonialFormState> {
  const user = await requireMemberUser();
  const profileId = Number(str(formData, "profile_id"));
  const subject = str(formData, "subject") || "Matrimonial interest";
  const body = str(formData, "body");

  if (!Number.isFinite(profileId) || profileId <= 0) {
    return { error: "Invalid profile." };
  }
  if (body.length < 10) {
    return { error: "Message must be at least 10 characters." };
  }
  if (body.length > 4000) {
    return { error: "Message is too long." };
  }

  const own = await getApprovedOwnProfile(user.id);
  if (!own) {
    return { error: "Your matrimonial profile must be approved to send messages." };
  }

  const target = await getMatrimonialProfileById(user, profileId);
  if (!target || target.userId === user.id) {
    return { error: "Profile not available for contact." };
  }
  if (await isBlockedBetween(user.id, target.userId)) {
    return { error: "You cannot message this member." };
  }

  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO matrimonial_contact_messages
        (from_user_id, to_user_id, to_profile_id, subject, body)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(user.id, target.userId, profileId, subject, body)
    .run();

  const recipient = await db
    .prepare(`SELECT email, name FROM users WHERE id = ?`)
    .bind(target.userId)
    .first<{ email: string; name: string }>();

  if (recipient) {
    await enqueueEmailStub({
      to: recipient.email,
      subject: `New matrimonial message: ${subject}`,
      body: `Hi ${recipient.name || "there"},\n\nYou received a matrimonial message via the CJA platform (phone/email are never shared on cards).\n\nFrom: ${user.name || "A member"}\nSubject: ${subject}\n\n${body}\n\nReply in the member area: /members/matrimonial/messages\n\n— CJA`,
      meta: {
        kind: "matrimonial_contact",
        from_user_id: user.id,
        to_profile_id: profileId,
      },
    });
  }

  revalidatePath("/members/matrimonial/messages");
  revalidatePath(`/members/matrimonial/browse/${profileId}`);
  return { ok: true, message: "Message sent via the platform (email stub queued)." };
}

export async function blockMatrimonialUserAction(
  formData: FormData,
): Promise<void> {
  const user = await requireMemberUser();
  const blockedUserId = Number(str(formData, "blocked_user_id"));
  if (!Number.isFinite(blockedUserId) || blockedUserId === user.id) return;

  const db = await getDb();
  await db
    .prepare(
      `INSERT OR IGNORE INTO matrimonial_blocks (blocker_user_id, blocked_user_id)
       VALUES (?, ?)`,
    )
    .bind(user.id, blockedUserId)
    .run();

  revalidatePath("/members/matrimonial/browse");
  revalidatePath("/members/matrimonial/messages");
}

export async function reportMatrimonialProfileAction(
  _prev: MatrimonialFormState,
  formData: FormData,
): Promise<MatrimonialFormState> {
  const user = await requireMemberUser();
  const profileId = Number(str(formData, "profile_id"));
  const reason = str(formData, "reason");
  const details = str(formData, "details") || null;

  if (!Number.isFinite(profileId) || !reason) {
    return { error: "Select a reason for the report." };
  }

  const db = await getDb();
  const profile = await db
    .prepare(`SELECT id, user_id FROM matrimonial_profiles WHERE id = ?`)
    .bind(profileId)
    .first<{ id: number; user_id: number }>();
  if (!profile || profile.user_id === user.id) {
    return { error: "Profile not found." };
  }

  await db
    .prepare(
      `INSERT INTO matrimonial_reports
        (reporter_user_id, reported_profile_id, reason, details)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(user.id, profileId, reason, details)
    .run();

  const admins = await db
    .prepare(
      `SELECT email, name FROM users WHERE role = 'admin' AND disabled = 0`,
    )
    .all<{ email: string; name: string }>();
  for (const a of admins.results ?? []) {
    await enqueueEmailStub({
      to: a.email,
      subject: "Matrimonial profile reported",
      body: `Hi ${a.name || "Admin"},\n\nProfile #${profileId} was reported.\nReason: ${reason}\n${details ? `Details: ${details}\n` : ""}\nReview: /admin/matrimonial\n\n— CJA`,
      meta: { kind: "matrimonial_report", profile_id: profileId },
    });
  }

  revalidatePath("/admin/matrimonial");
  return { ok: true, message: "Report submitted. Admins have been notified." };
}

export async function adminResolveReportAction(formData: FormData): Promise<void> {
  await requireAdminUser();
  const id = Number(str(formData, "id"));
  const status = str(formData, "status");
  if (!Number.isFinite(id)) return;
  if (status !== "reviewed" && status !== "dismissed") return;

  const db = await getDb();
  await db
    .prepare(`UPDATE matrimonial_reports SET status = ? WHERE id = ?`)
    .bind(status, id)
    .run();
  revalidatePath("/admin/matrimonial");
}

/** Exported for admin UI overdue badge helper (same rule as queries). */
export { isPendingOverdue };
