export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { VolunteerForm } from "@/components/volunteer-form";
import { getTurnstilePublicConfig } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";
import { isFeatureEnabled } from "@/modules/admin/feature-flags";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Canadian Jats Association or share volunteer interest. Forms are protected by Cloudflare Turnstile when configured.",
  openGraph: {
    title: "Contact",
    description: "Contact the Canadian Jats Association.",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const [turnstile, volunteerEnabled] = await Promise.all([
    getTurnstilePublicConfig(),
    isFeatureEnabled("volunteer_form"),
  ]);

  return (
    <>
      <section className="contact-section" aria-label="Contact Canadian Jats Association">
        <header className="contact-section-head">
          <h1>Canadian Jats Association</h1>
          <p className="contact-section-lede">
            Do you have any questions? Please do not hesitate to contact us
            directly. Our team will come back to you at the earliest to help
            you.
          </p>
        </header>
        <div className="split-layout contact-section-body">
          <section className="card contact-form-card">
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
          <aside className="card contact-info-card">
            <h2>Contact details</h2>
            <p className="muted">{siteConfig.address}</p>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Email:{" "}
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </p>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Follow updates on the <Link href="/social">Social</Link> page.
            </p>
          </aside>
        </div>
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }} id="volunteer">
        <h2>Volunteer with CJA</h2>
        <p className="muted">
          Prefer to help on the ground at festivals, sports, youth programs, or
          communications? Tell us how you can help and the team will follow up.
        </p>
        {volunteerEnabled ? (
          <>
            <VolunteerForm
              siteKey={turnstile.turnstileSiteKey}
              bypass={turnstile.turnstileBypass}
            />
            <p className="stub-note">
              Sample flow only — submissions are verified for bots but not yet
              emailed to officials.
            </p>
          </>
        ) : (
          <p className="form-error">
            Volunteer interest form is temporarily unavailable.
          </p>
        )}
      </section>
    </>
  );
}
