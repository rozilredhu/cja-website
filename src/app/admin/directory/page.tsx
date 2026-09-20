export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireAdminUser } from "@/modules/auth/session";
import {
  adminSetBusinessDisabledAction,
  adminSetProfileDisabledAction,
} from "@/modules/directory/actions";
import {
  adminListBusinesses,
  adminListProfiles,
} from "@/modules/directory/queries";

export const metadata: Metadata = {
  title: "Admin — Directory",
  robots: { index: false, follow: false },
};

export default async function AdminDirectoryPage() {
  await requireAdminUser();
  const [profiles, businesses] = await Promise.all([
    adminListProfiles(),
    adminListBusinesses(),
  ]);

  return (
    <>
      <PageHero
        title="Directory moderation"
        description="List and disable abused directory profiles / businesses."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
        </p>

        <h2>Member profiles ({profiles.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Opted in</th>
                <th>Disabled</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.display_name}</td>
                  <td>
                    {[p.city, p.province].filter(Boolean).join(", ")}
                  </td>
                  <td>{p.opted_in ? "yes" : "no"}</td>
                  <td>{p.disabled ? "yes" : "no"}</td>
                  <td>
                    <form action={adminSetProfileDisabledAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        type="hidden"
                        name="disabled"
                        value={p.disabled ? "0" : "1"}
                      />
                      <button type="submit" className="btn-secondary btn-small">
                        {p.disabled ? "Enable" : "Disable"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ marginTop: "1.5rem" }}>
          Businesses ({businesses.length})
        </h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Opted in</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>
                    {[b.city, b.province].filter(Boolean).join(", ")}
                  </td>
                  <td>{b.opted_in ? "yes" : "no"}</td>
                  <td>
                    {b.disabled ? "disabled" : b.status}
                  </td>
                  <td>
                    <form action={adminSetBusinessDisabledAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <input
                        type="hidden"
                        name="disabled"
                        value={b.disabled ? "0" : "1"}
                      />
                      <button type="submit" className="btn-secondary btn-small">
                        {b.disabled ? "Enable" : "Disable"}
                      </button>
                    </form>
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
