import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { randomToken } from "./password";
import type { AuthUser, UserRole } from "./roles";

export const SESSION_COOKIE = "cja_session";
export const SESSION_DAYS = 14;

type SessionRow = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  disabled: number;
};

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
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT u.id, u.email, u.name, u.role, u.disabled
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > datetime('now')`,
      )
      .bind(token)
      .first<SessionRow>();

    if (!row || row.disabled) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
