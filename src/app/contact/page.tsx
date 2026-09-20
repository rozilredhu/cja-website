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
        title="Contact"
        description="Send a message to CJA. Bot protection via Cloudflare Turnstile when keys are set."
      />
      <div className="split-layout">
        <section className="card">
          <h2>Send a message</h2>
          <ContactForm
            siteKey={turnstile.turnstileSiteKey}
            bypass={turnstile.turnstileBypass}
          />
          <p className="stub-note">
            Turnstile is verified when configured. Messages are accepted in
            this module but not yet emailed or stored in D1 — that wires up with
            Admin tools later.
          </p>
        </section>
        <aside className="card">
          <h2>Other ways</h2>
          <p className="muted">
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
