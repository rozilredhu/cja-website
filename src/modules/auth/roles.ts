export type UserRole = "admin" | "member";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  totpEnabled: boolean;
};

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === "admin";
}

/** Members area: members and admins may enter. */
export function isMember(user: AuthUser | null | undefined): boolean {
  return user?.role === "member" || user?.role === "admin";
}
