import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import {
  getHeritageArticle,
  getHeritageArticleSlugs,
} from "@/modules/public/heritage";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getHeritageArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getHeritageArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: `${article.title} | Heritage`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/heritage/articles/${article.slug}`,
    },
  };
}

export default async function HeritageArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getHeritageArticle(slug);
  if (!article) notFound();

  return (
    <>
      <PageHero
        eyebrow="Heritage article"
        title={article.title}
        description={article.excerpt}
      />
      <article className="card prose-card">
        {article.body.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/heritage">← Heritage home</Link>
        </p>
      </article>
    </>
  );
}
