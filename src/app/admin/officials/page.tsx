export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import {
  OfficialCategoryForm,
  OfficialForm,
} from "@/modules/admin/components/official-form";
import {
  reorderOfficialAction,
  setOfficialStatusAction,
} from "@/modules/admin/actions";
import { listRecentAudit } from "@/modules/admin/audit";
import {
  listActiveCategoryNames,
  listOfficialCategories,
  listOfficials,
} from "@/modules/admin/queries";
import { requireAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin — Officials",
  robots: { index: false, follow: false },
};

export default async function AdminOfficialsPage() {
  await requireAdminUser();
  const [officials, categories, categoryNames, audit] = await Promise.all([
    listOfficials(),
    listOfficialCategories(),
    listActiveCategoryNames(),
    listRecentAudit(20),
  ]);

  return (
    <>
      <PageHero
        title="Officials manager"
        description="Add, edit, reorder, activate, deactivate, archive, or restore without code changes. Not hard-coded to 13 seats."
        eyebrow="Admin · §4"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
          {" · "}
          <Link href="/officials">Public page</Link>
          {" · "}
          <Link href="/past-executives">Past Executives</Link>
        </p>

        <h2>All officials ({officials.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {officials.map((o) => (
                <tr key={o.id}>
                  <td>
                    <form action={reorderOfficialAction} className="inline-order">
                      <input type="hidden" name="id" value={o.id} />
                      <input
                        name="display_order"
                        type="number"
                        defaultValue={o.display_order}
                        style={{ width: "4rem" }}
                      />
                      <button type="submit" className="btn-secondary btn-small">
                        Set
                      </button>
                    </form>
                  </td>
                  <td>
                    <Link href={`/admin/officials/${o.id}`}>{o.full_name}</Link>
                  </td>
                  <td>{o.designation}</td>
                  <td>{o.category}</td>
                  <td>{o.status}</td>
                  <td>
                    <div className="mat-admin-actions">
                      {o.status !== "active" ? (
                        <form action={setOfficialStatusAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value="active" />
                          <button type="submit" className="btn-secondary btn-small">
                            Activate
                          </button>
                        </form>
                      ) : null}
                      {o.status !== "inactive" ? (
                        <form action={setOfficialStatusAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value="inactive" />
                          <button type="submit" className="btn-secondary btn-small">
                            Deactivate
                          </button>
                        </form>
                      ) : null}
                      {o.status !== "archived" ? (
                        <form action={setOfficialStatusAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value="archived" />
                          <button type="submit" className="btn-secondary btn-small">
                            Archive
                          </button>
                        </form>
                      ) : (
                        <form action={setOfficialStatusAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value="active" />
                          <button type="submit" className="btn-secondary btn-small">
                            Restore
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Add official</h2>
        <OfficialForm categories={categoryNames} />
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Categories</h2>
        <ul>
          {categories.map((c) => (
            <li key={c.id}>
              {c.name}{" "}
              <span className="muted">
                (order {c.display_order}
                {c.active ? "" : ", inactive"})
              </span>
            </li>
          ))}
        </ul>
        <OfficialCategoryForm />
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Recent audit log</h2>
        {audit.length === 0 ? (
          <p className="muted">No audit entries yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td>{a.created_at}</td>
                    <td>{a.actor_email ?? a.actor_user_id ?? "—"}</td>
                    <td>{a.action}</td>
                    <td>
                      {a.entity_type}
                      {a.entity_id ? ` #${a.entity_id}` : ""}
                    </td>
                    <td className="admin-code">{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
