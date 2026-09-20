export const dynamic = "force-dynamic";

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

export default async function NewsListPage() {
  const articles = await getAllNews();

  return (
    <>
      <PageHero
        eyebrow="Updates"
        title="News & Announcements"
        description="Published articles from the admin CMS (falls back to sample file content if the database is empty)."
      />
      <div className="card-grid">
        {articles.map((a) => (
          <NewsCard key={a.slug} article={a} />
        ))}
      </div>
    </>
  );
}
