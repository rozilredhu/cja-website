import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { NewsCard } from "@/modules/public/components/news-card";
import { getAllNews } from "@/modules/public/news";

export const metadata: Metadata = {
  title: "News & Announcements",
  description:
    "Community news and announcements from the Canadian Jats Association.",
  openGraph: {
    title: "News & Announcements",
    description: "CJA community news and announcements.",
    url: "/news",
  },
};

export default function NewsListPage() {
  const articles = getAllNews();

  return (
    <>
      <PageHero
        eyebrow="Updates"
        title="News & Announcements"
        description="Sample articles for Phase 1. An admin CMS editor arrives in a later module."
      />
      <div className="card-grid">
        {articles.map((a) => (
          <NewsCard key={a.slug} article={a} />
        ))}
      </div>
    </>
  );
}
