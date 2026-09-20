export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { NewsForm } from "@/modules/admin/components/news-form";
import { getNewsArticleById } from "@/modules/admin/queries";
import { requireAdminUser } from "@/modules/auth/session";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Admin — Edit article",
  robots: { index: false, follow: false },
};

export default async function AdminNewsEditPage({ params }: Props) {
  await requireAdminUser();
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();
  const article = await getNewsArticleById(id);
  if (!article) notFound();

  return (
    <>
      <PageHero
        title={`Edit: ${article.title}`}
        description="Update CMS fields and publish status."
        eyebrow="Admin · News"
      />
      <section className="card">
        <p>
          <Link href="/admin/news">← News list</Link>
        </p>
        <NewsForm article={article} />
      </section>
    </>
  );
}
