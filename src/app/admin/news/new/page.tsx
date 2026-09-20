export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { NewsForm } from "@/modules/admin/components/news-form";
import { requireAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin — New article",
  robots: { index: false, follow: false },
};

export default async function AdminNewsNewPage() {
  await requireAdminUser();
  return (
    <>
      <PageHero
        title="New article"
        description="Title, slug, meta description, body, published flag."
        eyebrow="Admin · News"
      />
      <section className="card">
        <p>
          <Link href="/admin/news">← News list</Link>
        </p>
        <NewsForm />
      </section>
    </>
  );
}
