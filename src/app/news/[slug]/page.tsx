export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getNewsBySlug, getNewsSlugs } from "@/modules/public/news";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getNewsSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/news/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <PageHero
        eyebrow={formatDate(article.publishedAt)}
        title={article.title}
        description={article.excerpt}
      />
      <article className="card prose-card">
        {article.author ? (
          <p className="muted" style={{ marginBottom: "1rem" }}>
            By {article.author}
          </p>
        ) : null}
        {article.body.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/news">← All news</Link>
        </p>
      </article>
    </>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
