import Link from "next/link";
import type { Metadata } from "next";
import { OrganizationJsonLd } from "@/components/json-ld";
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

const highlights = [
  {
    href: "/officials",
    title: "Officials",
    body: "Current leadership team (content coming soon).",
  },
  {
    href: "/news",
    title: "News",
    body: "Announcements and community updates.",
  },
  {
    href: "/volunteer",
    title: "Volunteer",
    body: "Share how you’d like to help CJA.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <section className="home-hero">
        <p className="eyebrow" style={{ color: "#ffcc80" }}>
          Welcome
        </p>
        <h1>{siteConfig.name}</h1>
        <p>
          A community home for Canadian Jat families — events, leadership,
          heritage, and member connection. This Foundation release delivers the
          public shell, SEO/PWA basics, Turnstile, and admin login.
        </p>
      </section>

      <section className="home-grid" aria-label="Highlights">
        {highlights.map((item) => (
          <Link key={item.href} href={item.href} className="card">
            <h2>{item.title}</h2>
            <p className="muted">{item.body}</p>
          </Link>
        ))}
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Coming next</h2>
        <p className="muted">
          Public page content, member accounts, community directory,
          matrimonial, and admin CMS tools ship in later Phase 1 modules. Staging
          only until CJA approves production.
        </p>
      </section>
    </>
  );
}
