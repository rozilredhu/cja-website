export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { OrganizationJsonLd } from "@/components/json-ld";
import { homeContent } from "@/content/home";
import { OfficialCard } from "@/modules/public/components/official-card";
import { NewsCard } from "@/modules/public/components/news-card";
import { getPrimaryUpcoming } from "@/modules/public/events";
import { getLatestNews } from "@/modules/public/news";
import { getFeaturedOfficials } from "@/modules/public/officials";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: siteConfig.name },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
  },
};

export default async function HomePage() {
  const upcoming = getPrimaryUpcoming();
  const featured = await getFeaturedOfficials(4);
  const latest = await getLatestNews(3);

  return (
    <>
      <OrganizationJsonLd />

      <section className="home-hero">
        <p className="eyebrow" style={{ color: "#ffcc80" }}>
          {homeContent.heroEyebrow}
        </p>
        <h1>{homeContent.heroTitle}</h1>
        <p>{homeContent.heroBody}</p>
        <div className="hero-actions">
          {homeContent.heroCtas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={
                cta.href === "/volunteer" ? "btn-saffron" : "btn-on-dark"
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      {upcoming ? (
        <section className="event-banner" aria-label="Upcoming event">
          <div>
            <p className="eyebrow">Upcoming event</p>
            <h2>{upcoming.title}</h2>
            <p className="muted">
              {formatDate(upcoming.dateStart)}
              {upcoming.location ? ` · ${upcoming.location}` : ""}
            </p>
            <p>{upcoming.summary}</p>
          </div>
          <Link href={`/events/${upcoming.slug}`} className="btn-primary">
            Event details
          </Link>
        </section>
      ) : null}

      <section className="section-block" aria-labelledby="featured-officials">
        <div className="section-head">
          <h2 id="featured-officials">Featured officials</h2>
          <Link href="/officials">View full leadership →</Link>
        </div>
        <div className="officials-grid">
          {featured.map((o) => (
            <OfficialCard key={o.id} official={o} />
          ))}
        </div>
      </section>

      <section className="section-block" aria-labelledby="latest-news">
        <div className="section-head">
          <h2 id="latest-news">Latest news</h2>
          <Link href="/news">All announcements →</Link>
        </div>
        <div className="card-grid">
          {latest.map((a) => (
            <NewsCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      <section className="card social-strip" aria-labelledby="social-strip">
        <h2 id="social-strip">{homeContent.socialStripTitle}</h2>
        <p className="muted">{homeContent.socialStripBody}</p>
        <div className="social-strip-links">
          <Link href="/social">Open social hubs</Link>
          <span aria-hidden>·</span>
          <Link href="/gallery">Photo & video gallery</Link>
          <span aria-hidden>·</span>
          <Link href="/contact">Contact</Link>
        </div>
      </section>
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
