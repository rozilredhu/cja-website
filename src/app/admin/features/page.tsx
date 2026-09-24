export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { toggleFeatureFlagAction } from "@/modules/admin/actions";
import { listFeatureFlags } from "@/modules/admin/feature-flags";
import { requireSuperAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin — Feature switches",
  robots: { index: false, follow: false },
};

export default async function AdminFeaturesPage() {
  await requireSuperAdminUser();
  const flags = await listFeatureFlags();

  return (
    <>
      <PageHero
        title="Feature switches"
        description="Gate modules server-side without a deploy. Keys: directory, matrimonial, promotions, volunteer_form."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Label</th>
                <th>Enabled</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f.key}>
                  <td className="admin-code">{f.key}</td>
                  <td>{f.label || f.key}</td>
                  <td>{f.enabled ? "yes" : "no"}</td>
                  <td>{f.updated_at}</td>
                  <td>
                    <form action={toggleFeatureFlagAction}>
                      <input type="hidden" name="key" value={f.key} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={f.enabled ? "0" : "1"}
                      />
                      <button type="submit" className="btn-secondary btn-small">
                        {f.enabled ? "Disable" : "Enable"}
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
