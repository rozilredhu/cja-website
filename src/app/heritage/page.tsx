import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import {
  getHeritageArticles,
  getHeritageIntro,
  getHeritageSections,
} from "@/modules/public/heritage";

export const metadata: Metadata = {
  title: "Jats Heritage",
  description:
    "Who the Jats are — overview, brief history, and diaspora life connecting families in Canada through CJA.",
  openGraph: {
    title: "Jats Heritage",
    description:
      "Explore Jat community overview, history, and heritage in Canada.",
    url: "/heritage",
  },
};

export default function HeritageLandingPage() {
  const intro = getHeritageIntro();
  const sections = getHeritageSections();
  const articles = getHeritageArticles();

  return (
    <>
      <PageHero
        eyebrow="Culture & history"
        title={intro.title}
        description={intro.lede}
      />

      <nav className="subnav card" aria-label="Heritage sections">
        <a href="#overview">Overview</a>
        <a href="#history">History</a>
        <a href="#today">Today & diaspora</a>
        <a href="#culture">Culture</a>
        <Link href="/heritage/timeline">Timeline</Link>
        <Link href="/heritage/gallery">Heritage gallery</Link>
      </nav>

      <section id="overview" className="section-block" aria-labelledby="heritage-overview">
        <h2 id="heritage-overview" className="section-title">
          {sections.overview.title}
        </h2>
        <div className="card">
          {sections.overview.paragraphs.map((para) => (
            <p key={para.slice(0, 48)}>{para}</p>
          ))}
        </div>
        <div className="card-grid" style={{ marginTop: "1.25rem" }}>
          {sections.overview.highlights.map((h) => (
            <article key={h.title} className="card content-card">
              <h3>{h.title}</h3>
              <p className="muted">{h.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="history" className="section-block" aria-labelledby="heritage-history">
        <h2 id="heritage-history" className="section-title">
          {sections.history.title}
        </h2>
        <div className="card">
          {sections.history.paragraphs.map((para) => (
            <p key={para.slice(0, 48)}>{para}</p>
          ))}
        </div>
        <p style={{ marginTop: "1rem" }}>
          <Link className="text-link" href="/heritage/timeline">
            View heritage timeline →
          </Link>
        </p>
      </section>

      <section id="today" className="section-block" aria-labelledby="heritage-today">
        <h2 id="heritage-today" className="section-title">
          {sections.today.title}
        </h2>
        <div className="card">
          {sections.today.paragraphs.map((para) => (
            <p key={para.slice(0, 48)}>{para}</p>
          ))}
        </div>
        <p style={{ marginTop: "1rem" }}>
          <Link className="text-link" href="/about">
            About CJA →
          </Link>
          {" · "}
          <Link className="text-link" href="/contact">
            Contact →
          </Link>
        </p>
      </section>

      <section id="culture" className="section-block" aria-labelledby="heritage-culture">
        <h2 id="heritage-culture" className="section-title">
          {sections.culture.title}
        </h2>
        <div className="card-grid">
          {sections.culture.cards.map((c) => (
            <article key={c.title} className="card content-card">
              <h3>{c.title}</h3>
              <p className="muted">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

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
        {sections.attribution.note}{" "}
        <a
          href={sections.attribution.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {sections.attribution.linkLabel}
        </a>
        .
      </p>
    </>
  );
}
