"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { verifyPassword } from "./password";
import {
  createSession,
  destroySession,
  setSessionCookie,
} from "./session";

export type LoginState = {
  error?: string;
  ok?: boolean;
};

type UserAuthRow = {
  id: number;
  email: string;
  password_hash: string;
  salt: string;
  role: string;
  disabled: number;
};

export async function adminLoginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return {
      error:
        "Database is not available. Apply D1 migrations locally or configure the DB binding.",
    };
  }

  const row = await db
    .prepare(
      `SELECT id, email, password_hash, salt, role, disabled
       FROM users WHERE email = ? COLLATE NOCASE`,
    )
    .bind(email)
    .first<UserAuthRow>();

  if (!row || row.disabled) {
    return { error: "Invalid email or password." };
  }

  if (row.role !== "admin") {
    return { error: "This account is not an admin. Use member login instead." };
  }

  const ok = await verifyPassword(password, row.salt, row.password_hash);
  if (!ok) {
    return { error: "Invalid email or password." };
  }

  const token = await createSession(row.id);
  await setSessionCookie(token);
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/** Stub hooks for future member auth (Phase 1C). */
export async function memberLoginStub(): Promise<LoginState> {
  return { error: "Member login is not available yet (Phase 1C)." };
}

export async function memberRegisterStub(): Promise<LoginState> {
  return { error: "Member registration is not available yet (Phase 1C)." };
}
