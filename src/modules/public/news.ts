import { newsArticles } from "@/content/news";
import type { NewsArticle } from "@/content/types";

export function getAllNews(): NewsArticle[] {
  return [...newsArticles].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find((a) => a.slug === slug);
}

export function getLatestNews(limit = 3): NewsArticle[] {
  return getAllNews().slice(0, limit);
}

export function getNewsSlugs(): string[] {
  return newsArticles.map((a) => a.slug);
}
