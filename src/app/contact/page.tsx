export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { getTurnstilePublicConfig } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Canadian Jats Association. Forms are protected by Cloudflare Turnstile when configured.",
  openGraph: {
    title: "Contact",
    description: "Contact the Canadian Jats Association.",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const turnstile = await getTurnstilePublicConfig();

  return (
    <>
      <PageHero
        title="Contact us"
        description="Do you have any questions? Please do not hesitate to contact us directly. Our team will come back to you at the earliest to help you."
      />
      <div className="split-layout">
        <section className="card">
          <h2>Send a message</h2>
          <ContactForm
            siteKey={turnstile.turnstileSiteKey}
            bypass={turnstile.turnstileBypass}
          />
          <p className="stub-note">
            You can also email{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>{" "}
            directly (same address listed on draft.cjacanada.ca).
          </p>
        </section>
        <aside className="card">
          <h2>Canadian Jats Association</h2>
          <p className="muted">{siteConfig.address}</p>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            Email:{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </p>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            Prefer to help on the ground?{" "}
            <Link href="/volunteer">Volunteer interest form</Link>
          </p>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            Follow updates on the <Link href="/social">Social</Link> page.
          </p>
        </aside>
      </div>
    </>
  );
}
