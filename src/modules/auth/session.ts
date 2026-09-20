import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { randomToken } from "./password";
import type { AuthUser, UserRole } from "./roles";

export const SESSION_COOKIE = "cja_session";
export const SESSION_DAYS = 14;
/** Short-lived cookie after password OK but before TOTP (admin MFA). */
export const MFA_PENDING_COOKIE = "cja_mfa_pending";
export const MFA_PENDING_MINUTES = 10;

type SessionRow = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  disabled: number;
  email_verified_at: string | null;
  totp_enabled_at: string | null;
};

function mapUser(row: SessionRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    emailVerified: Boolean(row.email_verified_at),
    totpEnabled: Boolean(row.totp_enabled_at),
  };
}

export async function createSession(userId: number): Promise<string> {
  const db = await getDb();
  const id = randomToken(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    )
    .bind(id, userId, expires)
    .run();
  return id;
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function setMfaPendingCookie(userId: number): Promise<void> {
  const jar = await cookies();
  jar.set(MFA_PENDING_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MFA_PENDING_MINUTES * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearMfaPendingCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(MFA_PENDING_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getMfaPendingUserId(): Promise<number | null> {
  const jar = await cookies();
  const raw = jar.get(MFA_PENDING_COOKIE)?.value;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const db = await getDb();
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
    } catch {
      // DB may be unavailable in some local paths; still clear cookie
    }
  }
  await clearSessionCookie();
  await clearMfaPendingCookie();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT u.id, u.email, u.name, u.role, u.disabled,
                u.email_verified_at, u.totp_enabled_at
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > datetime('now')`,
      )
      .bind(token)
      .first<SessionRow>();

    if (!row || row.disabled) return null;
    return mapUser(row);
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/** Redirect to member login if not a logged-in member or admin. */
export async function requireMemberUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "member" && user.role !== "admin")) {
    redirect("/members/login");
  }
  return user;
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }
  return user;
}

export function sqlExpiresInHours(hours: number): string {
  return new Date(Date.now() + hours * 3600 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
}
