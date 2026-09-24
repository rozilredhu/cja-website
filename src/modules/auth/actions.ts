"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { verifyTurnstile } from "@/modules/turnstile/verify";
import {
  sendPasswordResetEmailStub,
  sendVerificationEmailStub,
} from "./email";
import { hashPassword, randomToken, verifyPassword } from "./password";
import {
  clearMfaPendingCookie,
  createSession,
  destroySession,
  getMfaPendingUserId,
  setMfaPendingCookie,
  setSessionCookie,
  sqlExpiresInHours,
} from "./session";
import { generateTotpSecret, totpOtpauthUri, verifyTotp } from "./totp";

export type LoginState = {
  error?: string;
  ok?: boolean;
  message?: string;
  sampleUrl?: string;
};

export type AuthFormState = LoginState;

type UserAuthRow = {
  id: number;
  email: string;
  password_hash: string;
  salt: string;
  role: string;
  disabled: number;
  name: string;
  totp_enabled_at: string | null;
};

const MIN_PASSWORD = 8;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

async function issueVerificationToken(userId: number): Promise<string> {
  const db = await getDb();
  const token = randomToken(32);
  await db
    .prepare(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
    )
    .bind(userId, token, sqlExpiresInHours(48))
    .run();
  return token;
}

async function issuePasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  const token = randomToken(32);
  // Invalidate prior unused tokens
  await db
    .prepare(
      `UPDATE password_reset_tokens SET used_at = datetime('now')
       WHERE user_id = ? AND used_at IS NULL`,
    )
    .bind(userId)
    .run();
  await db
    .prepare(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
    )
    .bind(userId, token, sqlExpiresInHours(2))
    .run();
  return token;
}

/* ─── Admin login / logout (Foundation + MFA gate) ─── */

export async function adminLoginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
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
      `SELECT id, email, password_hash, salt, role, disabled, name, totp_enabled_at
       FROM users WHERE email = ? COLLATE NOCASE`,
    )
    .bind(email)
    .first<UserAuthRow>();

  if (!row || row.disabled) {
    return { error: "Invalid email or password." };
  }

  if (row.role !== "admin") {
    return { error: "This account is not an admin. Use the Regular users section." };
  }

  const ok = await verifyPassword(password, row.salt, row.password_hash);
  if (!ok) {
    return { error: "Invalid email or password." };
  }

  if (row.totp_enabled_at) {
    await setMfaPendingCookie(row.id);
    redirect("/admin/mfa/challenge");
  }

  const token = await createSession(row.id);
  await setSessionCookie(token);
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await destroySession();
  redirect("/members/login#admin");
}

export async function adminMfaChallengeAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const code = String(formData.get("code") ?? "").trim();
  const pendingId = await getMfaPendingUserId();
  if (!pendingId) {
    return { error: "MFA session expired. Sign in again." };
  }
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code from your authenticator app." };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database is not available." };
  }

  const row = await db
    .prepare(
      `SELECT id, role, disabled, totp_secret, totp_enabled_at
       FROM users WHERE id = ?`,
    )
    .bind(pendingId)
    .first<{
      id: number;
      role: string;
      disabled: number;
      totp_secret: string | null;
      totp_enabled_at: string | null;
    }>();

  if (
    !row ||
    row.disabled ||
    row.role !== "admin" ||
    !row.totp_secret ||
    !row.totp_enabled_at
  ) {
    await clearMfaPendingCookie();
    return { error: "MFA is not configured for this account." };
  }

  const valid = await verifyTotp(row.totp_secret, code);
  if (!valid) {
    return { error: "Invalid authentication code." };
  }

  await clearMfaPendingCookie();
  const session = await createSession(row.id);
  await setSessionCookie(session);
  redirect("/admin");
}

export async function adminMfaStartAction(): Promise<LoginState & { otpauthUrl?: string; secret?: string }> {
  const { requireAdminUser } = await import("./session");
  const user = await requireAdminUser();
  const db = await getDb();
  const secret = generateTotpSecret();
  await db
    .prepare(
      `UPDATE users SET totp_pending_secret = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .bind(secret, user.id)
    .run();
  const otpauthUrl = totpOtpauthUri({
    secret,
    accountName: user.email,
    issuer: "CJA Admin",
  });
  return {
    ok: true,
    secret,
    otpauthUrl,
    message: "Scan the otpauth URL in your authenticator app, then confirm with a code.",
  };
}

export async function adminMfaConfirmAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { requireAdminUser } = await import("./session");
  const user = await requireAdminUser();
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code from your authenticator app." };
  }

  const db = await getDb();
  const row = await db
    .prepare(`SELECT totp_pending_secret FROM users WHERE id = ?`)
    .bind(user.id)
    .first<{ totp_pending_secret: string | null }>();

  if (!row?.totp_pending_secret) {
    return { error: "No pending MFA setup. Click Enable MFA first." };
  }

  const valid = await verifyTotp(row.totp_pending_secret, code);
  if (!valid) {
    return { error: "Invalid code. Check your authenticator and try again." };
  }

  await db
    .prepare(
      `UPDATE users
       SET totp_secret = totp_pending_secret,
           totp_pending_secret = NULL,
           totp_enabled_at = datetime('now'),
           updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(user.id)
    .run();

  return { ok: true, message: "Admin MFA is now enabled." };
}

export async function adminMfaDisableAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { requireAdminUser } = await import("./session");
  const user = await requireAdminUser();
  const code = String(formData.get("code") ?? "").trim();
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT totp_secret, totp_enabled_at FROM users WHERE id = ?`,
    )
    .bind(user.id)
    .first<{ totp_secret: string | null; totp_enabled_at: string | null }>();

  if (!row?.totp_enabled_at || !row.totp_secret) {
    return { error: "MFA is not enabled." };
  }
  if (!/^\d{6}$/.test(code) || !(await verifyTotp(row.totp_secret, code))) {
    return { error: "Invalid authentication code." };
  }

  await db
    .prepare(
      `UPDATE users
       SET totp_secret = NULL, totp_pending_secret = NULL, totp_enabled_at = NULL,
           updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(user.id)
    .run();

  return { ok: true, message: "Admin MFA has been disabled." };
}

/* ─── Member register / login / logout ─── */

export async function memberRegisterAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== passwordConfirm) {
    return { error: "Passwords do not match." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const turnstile = await verifyTurnstile(turnstileToken);
  if (!turnstile.ok) {
    return { error: turnstile.error };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return {
      error:
        "Database is not available. Apply D1 migrations (npm run db:migrate:local).",
    };
  }

  const existing = await db
    .prepare(`SELECT id FROM users WHERE email = ? COLLATE NOCASE`)
    .bind(email)
    .first<{ id: number }>();
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const { hash, salt } = await hashPassword(password);
  const insert = await db
    .prepare(
      `INSERT INTO users (email, password_hash, salt, name, role, disabled)
       VALUES (?, ?, ?, ?, 'member', 0)`,
    )
    .bind(email, hash, salt, name)
    .run();

  const userId =
    typeof insert.meta.last_row_id === "number" ? insert.meta.last_row_id : null;
  if (!userId) {
    return { error: "Could not create account. Please try again." };
  }

  const verifyToken = await issueVerificationToken(userId);
  const { sampleUrl } = await sendVerificationEmailStub({
    to: email,
    name,
    token: verifyToken,
  });

  // Auto-sign-in so they land in the member area; verification remains optional until real email.
  const session = await createSession(userId);
  await setSessionCookie(session);

  return {
    ok: true,
    message:
      "Account created. Email delivery is stubbed in staging/dev — use the sample verification link below.",
    sampleUrl,
  };
}

export async function memberLoginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
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
        "Database is not available. Apply D1 migrations (npm run db:migrate:local).",
    };
  }

  const row = await db
    .prepare(
      `SELECT id, email, password_hash, salt, role, disabled, name, totp_enabled_at
       FROM users WHERE email = ? COLLATE NOCASE`,
    )
    .bind(email)
    .first<UserAuthRow>();

  if (!row || row.disabled) {
    return { error: "Invalid email or password." };
  }

  if (row.role === "admin") {
    return {
      error: "Admin accounts use the Admin login section on this page.",
    };
  }

  const ok = await verifyPassword(password, row.salt, row.password_hash);
  if (!ok) {
    return { error: "Invalid email or password." };
  }

  const token = await createSession(row.id);
  await setSessionCookie(token);
  redirect("/members");
}

export async function memberLogoutAction(): Promise<void> {
  await destroySession();
  redirect("/members/login");
}

export async function verifyEmailAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { error: "Missing verification token." };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database is not available." };
  }

  const row = await db
    .prepare(
      `SELECT id, user_id FROM email_verification_tokens
       WHERE token = ? AND used_at IS NULL AND expires_at > datetime('now')`,
    )
    .bind(token)
    .first<{ id: number; user_id: number }>();

  if (!row) {
    return { error: "This verification link is invalid or has expired." };
  }

  await db.batch([
    db
      .prepare(
        `UPDATE users SET email_verified_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(row.user_id),
    db
      .prepare(
        `UPDATE email_verification_tokens SET used_at = datetime('now') WHERE id = ?`,
      )
      .bind(row.id),
  ]);

  return { ok: true, message: "Email verified. Thank you!" };
}

/** GET-friendly verify used by /members/verify?token= */
export async function consumeVerificationToken(
  token: string,
): Promise<AuthFormState> {
  const fd = new FormData();
  fd.set("token", token);
  return verifyEmailAction({}, fd);
}

export async function resendVerificationAction(
  _prev: AuthFormState,
  _formData: FormData,
): Promise<AuthFormState> {
  const { getCurrentUser } = await import("./session");
  const user = await getCurrentUser();
  if (!user || user.role === "admin") {
    return { error: "Sign in as a member to resend verification." };
  }
  if (user.emailVerified) {
    return { ok: true, message: "Your email is already verified." };
  }

  const token = await issueVerificationToken(user.id);
  const { sampleUrl } = await sendVerificationEmailStub({
    to: user.email,
    name: user.name,
    token,
  });
  return {
    ok: true,
    message: "Verification email stubbed (see sample link).",
    sampleUrl,
  };
}

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");

  if (!email) {
    return { error: "Email is required." };
  }

  const turnstile = await verifyTurnstile(turnstileToken);
  if (!turnstile.ok) {
    return { error: turnstile.error };
  }

  // Always return a generic success to avoid account enumeration,
  // but include sampleUrl when the account exists (dev/stub UX).
  let sampleUrl: string | undefined;
  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT id, email, name, role, disabled FROM users WHERE email = ? COLLATE NOCASE`,
      )
      .bind(email)
      .first<{
        id: number;
        email: string;
        name: string;
        role: string;
        disabled: number;
      }>();

    if (row && !row.disabled && row.role === "member") {
      const token = await issuePasswordResetToken(row.id);
      const sent = await sendPasswordResetEmailStub({
        to: row.email,
        name: row.name,
        token,
      });
      sampleUrl = sent.sampleUrl;
    }
  } catch {
    // still return generic message
  }

  return {
    ok: true,
    message:
      "If that email is registered, a reset link was prepared. In staging/dev the sample link is shown when the account exists.",
    sampleUrl,
  };
}

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (!token) {
    return { error: "Missing reset token." };
  }
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== passwordConfirm) {
    return { error: "Passwords do not match." };
  }

  let db: D1Database;
  try {
    db = await getDb();
  } catch {
    return { error: "Database is not available." };
  }

  const row = await db
    .prepare(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token = ? AND used_at IS NULL AND expires_at > datetime('now')`,
    )
    .bind(token)
    .first<{ id: number; user_id: number }>();

  if (!row) {
    return { error: "This reset link is invalid or has expired." };
  }

  const { hash, salt } = await hashPassword(password);
  await db.batch([
    db
      .prepare(
        `UPDATE users SET password_hash = ?, salt = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(hash, salt, row.user_id),
    db
      .prepare(
        `UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?`,
      )
      .bind(row.id),
    // Invalidate other sessions for safety
    db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(row.user_id),
  ]);

  return {
    ok: true,
    message: "Password updated. You can sign in with your new password.",
  };
}

/** @deprecated stubs kept so old imports do not break mid-refactor */
export async function memberLoginStub(): Promise<LoginState> {
  return { error: "Use memberLoginAction." };
}

export async function memberRegisterStub(): Promise<LoginState> {
  return { error: "Use memberRegisterAction." };
}
