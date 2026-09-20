import Link from "next/link";
import type { NewsArticle } from "@/content/types";

type Props = { article: NewsArticle };

export function NewsCard({ article }: Props) {
  return (
    <article className="card content-card">
      <p className="eyebrow">{formatDate(article.publishedAt)}</p>
      <h2>
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h2>
      <p className="muted">{article.excerpt}</p>
      <Link className="text-link" href={`/news/${article.slug}`}>
        Read article →
      </Link>
    </article>
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
