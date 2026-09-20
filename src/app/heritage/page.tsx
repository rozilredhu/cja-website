import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import {
  getHeritageArticles,
  getHeritageIntro,
} from "@/modules/public/heritage";

export const metadata: Metadata = {
  title: "Jats Heritage",
  description:
    "Articles, timeline, and heritage gallery exploring Jat culture in Canada.",
  openGraph: {
    title: "Jats Heritage",
    description: "Explore Jat heritage — articles, timeline, and gallery.",
    url: "/heritage",
  },
};

export default function HeritageLandingPage() {
  const intro = getHeritageIntro();
  const articles = getHeritageArticles();

  return (
    <>
      <PageHero
        eyebrow="Culture & history"
        title={intro.title}
        description={intro.lede}
      />

      <nav className="subnav card" aria-label="Heritage sections">
        <Link href="/heritage/timeline">Timeline</Link>
        <Link href="/heritage/gallery">Heritage gallery</Link>
      </nav>

      <section className="section-block" aria-labelledby="heritage-articles">
        <h2 id="heritage-articles" className="section-title">
          Articles
        </h2>
        <div className="card-grid">
          {articles.map((a) => (
            <article key={a.slug} className="card content-card">
              <h3>
                <Link href={`/heritage/articles/${a.slug}`}>{a.title}</Link>
              </h3>
              <p className="muted">{a.excerpt}</p>
              <Link
                className="text-link"
                href={`/heritage/articles/${a.slug}`}
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <p className="stub-note">
        Heritage content starts thin by design. Contributions and verified
        history will expand this section over time.
      </p>
    </>
  );
}
