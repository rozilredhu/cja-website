export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import {
  CreateAdminForm,
  ResetAdminPasswordForm,
} from "@/modules/admin/components/admin-accounts-forms";
import {
  listAdminAccounts,
  setAdminDisabledAction,
  setAdminRoleAction,
} from "@/modules/admin/admin-users";
import { roleLabel } from "@/modules/auth/roles";
import { requireSuperAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin — Admin accounts",
  robots: { index: false, follow: false },
};

export default async function AdminAdminsPage() {
  const actor = await requireSuperAdminUser();
  const admins = await listAdminAccounts();
  const activeSuperCount = admins.filter(
    (a) => a.role === "super_admin" && !a.disabled,
  ).length;

  return (
    <>
      <PageHero
        title="Admin accounts"
        description="Super Admin only. Create, disable, and reset passwords for volunteer admins. Infrastructure (Cloudflare, GoDaddy, GitHub) stays with owners."
        eyebrow="Super Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
        </p>
        <p className="muted">
          Signed in as {actor.email}. Active super admins: {activeSuperCount}{" "}
          (at least one must remain enabled).
        </p>

        <div className="admin-table-wrap" style={{ marginTop: "1rem" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Disabled</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.id === actor.id;
                const isLastSuper =
                  a.role === "super_admin" &&
                  !a.disabled &&
                  activeSuperCount <= 1;
                return (
                  <tr key={a.id}>
                    <td>{a.email}</td>
                    <td>{a.name}</td>
                    <td>
                      <span
                        className={
                          a.role === "super_admin"
                            ? "admin-role-badge admin-role-badge-super"
                            : "admin-role-badge"
                        }
                      >
                        {roleLabel(a.role)}
                      </span>
                    </td>
                    <td>{a.disabled ? "yes" : "no"}</td>
                    <td>{a.last_login_at ?? "—"}</td>
                    <td>
                      <div className="admin-actions-col">
                        {isSelf ? (
                          <span className="muted">you</span>
                        ) : (
                          <>
                            <form action={setAdminDisabledAction}>
                              <input type="hidden" name="id" value={a.id} />
                              <input
                                type="hidden"
                                name="disabled"
                                value={a.disabled ? "0" : "1"}
                              />
                              <button
                                type="submit"
                                className="btn-secondary btn-small"
                                disabled={!a.disabled && isLastSuper}
                                title={
                                  isLastSuper
                                    ? "Cannot disable the last active Super Admin"
                                    : undefined
                                }
                              >
                                {a.disabled ? "Enable" : "Disable"}
                              </button>
                            </form>
                            <form action={setAdminRoleAction}>
                              <input type="hidden" name="id" value={a.id} />
                              <input
                                type="hidden"
                                name="role"
                                value={
                                  a.role === "super_admin"
                                    ? "admin"
                                    : "super_admin"
                                }
                              />
                              <button
                                type="submit"
                                className="btn-secondary btn-small"
                                disabled={
                                  a.role === "super_admin" && isLastSuper
                                }
                              >
                                {a.role === "super_admin"
                                  ? "Make limited Admin"
                                  : "Make Super Admin"}
                              </button>
                            </form>
                            <ResetAdminPasswordForm
                              adminId={a.id}
                              email={a.email}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <CreateAdminForm />
      </section>
    </>
  );
}
