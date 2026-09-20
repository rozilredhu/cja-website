export type UserRole = "admin" | "member";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === "admin";
}

export function isMember(user: AuthUser | null | undefined): boolean {
  return user?.role === "member" || user?.role === "admin";
}
