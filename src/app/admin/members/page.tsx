export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { adminSetUserDisabledAction } from "@/modules/admin/actions";
import { adminSearchUsers } from "@/modules/admin/queries";
import { requireAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin — Members",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminMembersPage({ searchParams }: Props) {
  const admin = await requireAdminUser();
  const { q } = await searchParams;
  const users = await adminSearchUsers({ q, limit: 200 });

  return (
    <>
      <PageHero
        title="Members manager"
        description="List users, view roles, and disable/enable accounts."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
        </p>

        <form method="get" className="stack-form" style={{ maxWidth: "28rem" }}>
          <label>
            Search (email or name)
            <input name="q" defaultValue={q ?? ""} placeholder="member@" />
          </label>
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>

        <h2 style={{ marginTop: "1.25rem" }}>Users ({users.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Disabled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.email_verified_at ? "yes" : "no"}</td>
                  <td>{u.disabled ? "yes" : "no"}</td>
                  <td>
                    {u.id === admin.id ? (
                      <span className="muted">you</span>
                    ) : (
                      <form action={adminSetUserDisabledAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          type="hidden"
                          name="disabled"
                          value={u.disabled ? "0" : "1"}
                        />
                        <button type="submit" className="btn-secondary btn-small">
                          {u.disabled ? "Enable" : "Disable"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
