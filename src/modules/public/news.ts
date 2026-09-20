import { newsArticles as fileNews } from "@/content/news";
import type { NewsArticle } from "@/content/types";
import { getDb } from "@/lib/db";
import type { NewsArticleRow } from "@/modules/admin/types";

function bodyToParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function mapRow(row: NewsArticleRow): NewsArticle {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.meta_description,
    body: bodyToParagraphs(row.body),
    publishedAt: (row.published_at ?? row.created_at).slice(0, 10),
    author: row.author ?? undefined,
    featured: Boolean(row.featured),
  };
}

async function loadPublishedFromDb(): Promise<NewsArticle[] | null> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT * FROM news_articles
         WHERE published = 1
         ORDER BY IFNULL(published_at, created_at) DESC`,
      )
      .all<NewsArticleRow>();
    const rows = res.results ?? [];
    if (!rows.length) return null;
    return rows.map(mapRow);
  } catch {
    return null;
  }
}

export async function getAllNews(): Promise<NewsArticle[]> {
  const fromDb = await loadPublishedFromDb();
  if (fromDb) return fromDb;
  return [...fileNews].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export async function getNewsBySlug(
  slug: string,
): Promise<NewsArticle | undefined> {
  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT * FROM news_articles WHERE slug = ? AND published = 1`,
      )
      .bind(slug)
      .first<NewsArticleRow>();
    if (row) return mapRow(row);
  } catch {
    // fall through to file
  }
  return fileNews.find((a) => a.slug === slug);
}

export async function getLatestNews(limit = 3): Promise<NewsArticle[]> {
  return (await getAllNews()).slice(0, limit);
}

export async function getNewsSlugs(): Promise<string[]> {
  return (await getAllNews()).map((a) => a.slug);
}
