"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { hashPassword, randomToken } from "@/modules/auth/password";
import { isAdminRole, type UserRole } from "@/modules/auth/roles";
import { requireSuperAdminUser } from "@/modules/auth/session";
import { writeAuditLog } from "./audit";
import type { AdminFormState } from "./types";

export type AdminAccountRow = {
  id: number;
  email: string;
  name: string;
  role: "super_admin" | "admin";
  disabled: number;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
};

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

const MIN_PASSWORD = 10;

async function countActiveSuperAdmins(db: D1Database): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS c FROM users
       WHERE role = 'super_admin' AND disabled = 0`,
    )
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function listAdminAccounts(): Promise<AdminAccountRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT id, email, name, role, disabled, email_verified_at,
              last_login_at, created_at
       FROM users
       WHERE role IN ('super_admin', 'admin')
       ORDER BY
         CASE role WHEN 'super_admin' THEN 0 ELSE 1 END,
         email ASC`,
    )
    .all<AdminAccountRow>();
  return res.results ?? [];
}

export type CreateAdminResult = AdminFormState & {
  tempPassword?: string;
  email?: string;
};

export async function createAdminAccountAction(
  _prev: CreateAdminResult,
  formData: FormData,
): Promise<CreateAdminResult> {
  const actor = await requireSuperAdminUser();
  const email = normalizeEmail(str(formData, "email"));
  const name = str(formData, "name") || email.split("@")[0] || "Admin";
  const roleRaw = str(formData, "role");
  const role: UserRole =
    roleRaw === "super_admin" ? "super_admin" : "admin";
  let password = str(formData, "password");
  const generate = formData.get("generate_password") === "1" || !password;

  if (!email || !email.includes("@")) {
    return { error: "A valid email is required." };
  }
  if (generate) {
    password = randomToken(12).slice(0, 16);
  }
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const { hash, salt } = await hashPassword(password);
  const db = await getDb();

  const existing = await db
    .prepare(`SELECT id, role FROM users WHERE email = ? COLLATE NOCASE`)
    .bind(email)
    .first<{ id: number; role: string }>();
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const result = await db
    .prepare(
      `INSERT INTO users (email, password_hash, salt, name, role, disabled, email_verified_at)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now'))`,
    )
    .bind(email, hash, salt, name, role)
    .run();

  const newId = result.meta.last_row_id;
  await writeAuditLog({
    actorUserId: actor.id,
    action: "admin.create",
    entityType: "user",
    entityId: newId ?? null,
    details: `${email} (${role})`,
  });
  revalidatePath("/admin/admins");
  revalidatePath("/admin");
  return {
    success: `Created ${role === "super_admin" ? "super admin" : "admin"} account.`,
    tempPassword: password,
    email,
  };
}

export async function setAdminDisabledAction(
  formData: FormData,
): Promise<void> {
  const actor = await requireSuperAdminUser();
  const id = Number(str(formData, "id"));
  const disabled = str(formData, "disabled") === "1" ? 1 : 0;
  if (!id || id === actor.id) return;

  const db = await getDb();
  const target = await db
    .prepare(`SELECT id, email, role, disabled FROM users WHERE id = ?`)
    .bind(id)
    .first<{ id: number; email: string; role: string; disabled: number }>();
  if (!target || !isAdminRole(target.role)) return;

  if (disabled && target.role === "super_admin") {
    const active = await countActiveSuperAdmins(db);
    if (active <= 1) {
      // Never lock out the last active super admin
      return;
    }
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
    actorUserId: actor.id,
    action: disabled ? "admin.disable" : "admin.enable",
    entityType: "user",
    entityId: id,
    details: target.email,
  });
  revalidatePath("/admin/admins");
  revalidatePath("/admin");
}

export type ResetAdminPasswordResult = AdminFormState & {
  tempPassword?: string;
  email?: string;
};

export async function resetAdminPasswordAction(
  _prev: ResetAdminPasswordResult,
  formData: FormData,
): Promise<ResetAdminPasswordResult> {
  const actor = await requireSuperAdminUser();
  const id = Number(str(formData, "id"));
  let password = str(formData, "password");
  const generate = formData.get("generate_password") === "1" || !password;

  if (!id) return { error: "Missing admin id." };
  if (generate) {
    password = randomToken(12).slice(0, 16);
  }
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const db = await getDb();
  const target = await db
    .prepare(`SELECT id, email, role FROM users WHERE id = ?`)
    .bind(id)
    .first<{ id: number; email: string; role: string }>();
  if (!target || !isAdminRole(target.role)) {
    return { error: "Admin account not found." };
  }

  const { hash, salt } = await hashPassword(password);
  await db
    .prepare(
      `UPDATE users
       SET password_hash = ?, salt = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(hash, salt, id)
    .run();

  // Force re-login
  await db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(id).run();

  await writeAuditLog({
    actorUserId: actor.id,
    action: "admin.reset_password",
    entityType: "user",
    entityId: id,
    details: target.email,
  });
  revalidatePath("/admin/admins");
  return {
    success: "Temporary password set. Copy it now — it will not be shown again.",
    tempPassword: password,
    email: target.email,
  };
}

export async function setAdminRoleAction(formData: FormData): Promise<void> {
  const actor = await requireSuperAdminUser();
  const id = Number(str(formData, "id"));
  const roleRaw = str(formData, "role");
  const role: UserRole =
    roleRaw === "super_admin" ? "super_admin" : "admin";
  if (!id || id === actor.id) return;

  const db = await getDb();
  const target = await db
    .prepare(`SELECT id, email, role FROM users WHERE id = ?`)
    .bind(id)
    .first<{ id: number; email: string; role: string }>();
  if (!target || !isAdminRole(target.role)) return;

  // Demoting the last active super_admin is not allowed
  if (target.role === "super_admin" && role === "admin") {
    const active = await countActiveSuperAdmins(db);
    if (active <= 1) return;
  }

  await db
    .prepare(
      `UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(role, id)
    .run();

  await writeAuditLog({
    actorUserId: actor.id,
    action: "admin.set_role",
    entityType: "user",
    entityId: id,
    details: `${target.email} → ${role}`,
  });
  revalidatePath("/admin/admins");
  revalidatePath("/admin");
}
