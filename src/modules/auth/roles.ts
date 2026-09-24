export type UserRole = "super_admin" | "admin" | "member";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  totpEnabled: boolean;
};

/** Any admin-capable role (limited admin or super admin). */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return isAdminRole(user?.role);
}

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === "super_admin";
}

/** Members area: members and both admin roles may enter. */
export function isMember(user: AuthUser | null | undefined): boolean {
  return (
    user?.role === "member" ||
    user?.role === "admin" ||
    user?.role === "super_admin"
  );
}

export function roleLabel(role: UserRole | string): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "member":
      return "Member";
    default:
      return role;
  }
}
