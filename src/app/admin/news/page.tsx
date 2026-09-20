export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { deleteNewsArticleAction } from "@/modules/admin/actions";
import { adminListNews } from "@/modules/admin/queries";
import { requireAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin — News",
  robots: { index: false, follow: false },
};

export default async function AdminNewsPage() {
  await requireAdminUser();
  const articles = await adminListNews();

  return (
    <>
      <PageHero
        title="News / CMS"
        description="Create, edit, and publish news articles. Public pages prefer D1 over static content."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
          {" · "}
          <Link href="/admin/news/new">New article</Link>
          {" · "}
          <Link href="/news">Public news</Link>
        </p>

        <h2>Articles ({articles.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Published at</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/news/${a.id}`}>{a.title}</Link>
                  </td>
                  <td className="admin-code">{a.slug}</td>
                  <td>{a.published ? "published" : "draft"}</td>
                  <td>{a.published_at ?? "—"}</td>
                  <td>
                    <div className="mat-admin-actions">
                      <Link
                        href={`/admin/news/${a.id}`}
                        className="btn-secondary btn-small"
                      >
                        Edit
                      </Link>
                      {a.published ? (
                        <Link
                          href={`/news/${a.slug}`}
                          className="btn-secondary btn-small"
                        >
                          View
                        </Link>
                      ) : null}
                      <form action={deleteNewsArticleAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="btn-secondary btn-small">
                          Delete
                        </button>
                      </form>
                    </div>
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
