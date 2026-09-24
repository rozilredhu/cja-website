export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { OrganizationJsonLd } from "@/components/json-ld";
import { aboutContent } from "@/content/about";
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
  const featured = await getFeaturedOfficials(12);
  const latest = await getLatestNews(3);
  const about = homeContent.aboutPreview;
  const matrimonial = homeContent.matrimonialPreview;
  const directory = homeContent.directoryPreview;
  const services = homeContent.servicesPreview;

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
                cta.href === "/contact/volunteer" ? "btn-saffron" : "btn-on-dark"
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

      <section className="section-block" aria-labelledby="about-preview">
        <div className="section-head">
          <h2 id="about-preview">{about.title}</h2>
          <Link href={about.href}>{about.cta} →</Link>
        </div>
        <article className="card preview-card">
          <p className="eyebrow">Mission</p>
          <p>{about.mission}</p>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            <strong>Vision:</strong> {about.visionTeaser}
          </p>
          <ul className="plain-list" style={{ marginTop: "0.85rem" }}>
            {aboutContent.values.slice(0, 2).map((v) => (
              <li key={v.title}>
                <strong>{v.title}</strong> — {v.body}
              </li>
            ))}
          </ul>
          <Link className="text-link" href={about.href}>
            Learn more →
          </Link>
        </article>
      </section>

      <section className="section-block" aria-labelledby="featured-officials">
        <div className="section-head">
          <h2 id="featured-officials">Officials</h2>
          <Link href="/officials">View full leadership →</Link>
        </div>
        <p className="muted" style={{ marginBottom: "0.85rem" }}>
          Meet featured members of CJA leadership. Full roster and categories on
          the Officials page.
        </p>
        <div className="officials-grid officials-grid--home">
          {featured.map((o) => (
            <OfficialCard key={o.id} official={o} compact />
          ))}
        </div>
        <p style={{ marginTop: "0.85rem" }}>
          <Link className="text-link" href="/officials">
            Learn more about officials →
          </Link>
        </p>
      </section>

      <section className="section-block" aria-labelledby="news-events">
        <div className="section-head">
          <h2 id="news-events">News &amp; events</h2>
          <span>
            <Link href="/news">All news</Link>
            {" · "}
            <Link href="/events">All events</Link>
          </span>
        </div>
        {upcoming ? (
          <article className="card preview-card" style={{ marginBottom: "1rem" }}>
            <p className="eyebrow">Event teaser</p>
            <h3>{upcoming.title}</h3>
            <p className="muted">
              {formatDate(upcoming.dateStart)}
              {upcoming.location ? ` · ${upcoming.location}` : ""}
            </p>
            <p>{upcoming.summary}</p>
            <Link className="text-link" href={`/events/${upcoming.slug}`}>
              Read more →
            </Link>
            {" · "}
            <Link className="text-link" href="/events">
              Browse events →
            </Link>
          </article>
        ) : (
          <article className="card preview-card" style={{ marginBottom: "1rem" }}>
            <h3>Events</h3>
            <p className="muted">
              Check the events calendar for upcoming gatherings, galas, and
              cultural celebrations.
            </p>
            <Link className="text-link" href="/events">
              Browse events →
            </Link>
          </article>
        )}
        <div className="card-grid">
          {latest.map((a) => (
            <NewsCard key={a.slug} article={a} />
          ))}
        </div>
        <p style={{ marginTop: "0.85rem" }}>
          <Link className="text-link" href="/news">
            More announcements →
          </Link>
        </p>
      </section>

      <section className="section-block" aria-labelledby="preview-members">
        <div className="section-head">
          <h2 id="preview-members">Member features</h2>
          <Link href="/members/register">Join / Register →</Link>
        </div>
        <div className="card-grid home-preview-grid">
          <article className="card preview-card">
            <h3>{matrimonial.title}</h3>
            <p>{matrimonial.body}</p>
            <p className="stub-note">{matrimonial.note}</p>
            <Link className="text-link" href={matrimonial.href}>
              {matrimonial.cta} →
            </Link>
            {" · "}
            <Link className="text-link" href="/members/register">
              Register
            </Link>
          </article>
          <article className="card preview-card">
            <h3>{directory.title}</h3>
            <p>{directory.body}</p>
            <p className="stub-note">{directory.note}</p>
            <Link className="text-link" href={directory.href}>
              {directory.cta} →
            </Link>
            {" · "}
            <Link className="text-link" href="/members/register">
              Register
            </Link>
          </article>
          <article className="card preview-card">
            <h3>{services.title}</h3>
            <p>{services.body}</p>
            <p className="stub-note">{services.note}</p>
            <Link className="text-link" href={services.href}>
              {services.cta} →
            </Link>
            {" · "}
            <Link className="text-link" href="/members/services">
              List a service
            </Link>
          </article>
        </div>
      </section>

      <section className="section-block" aria-labelledby="contact-preview">
        <div className="section-head">
          <h2 id="contact-preview">Contact</h2>
          <Link href="/contact">Contact form →</Link>
        </div>
        <article className="card preview-card">
          <h3>{siteConfig.name}</h3>
          <p className="muted">{siteConfig.address}</p>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Email:{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Questions about membership, events, or volunteering? Reach the team
            by form or email.
          </p>
          <Link className="text-link" href="/contact">
            Learn more / send a message →
          </Link>
        </article>
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
