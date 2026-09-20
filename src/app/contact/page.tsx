export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { getTurnstilePublicConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Canadian Jats Association.",
};

export default async function ContactPage() {
  const turnstile = await getTurnstilePublicConfig();

  return (
    <>
      <PageHero
        title="Contact"
        description="Send a message to CJA. Bot protection via Cloudflare Turnstile when configured."
      />
      <section className="card">
        <ContactForm
          siteKey={turnstile.turnstileSiteKey}
          bypass={turnstile.turnstileBypass}
        />
        <p className="stub-note">
          This is a Foundation stub: Turnstile is verified, but messages are not
          emailed or stored yet.
        </p>
      </section>
    </>
  );
}
