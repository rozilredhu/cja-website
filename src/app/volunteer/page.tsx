export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { VolunteerForm } from "@/components/volunteer-form";
import { PageHero } from "@/components/page-hero";
import { getTurnstilePublicConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Volunteer interest form for the Canadian Jats Association — events, culture, youth, and more.",
  openGraph: {
    title: "Volunteer",
    description: "Share how you’d like to help CJA.",
    url: "/volunteer",
  },
};

export default async function VolunteerPage() {
  const turnstile = await getTurnstilePublicConfig();

  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Volunteer interest"
        description="Tell us how you’d like to help at festivals, sports, youth programs, or communications. Turnstile protects this form when keys are set."
      />
      <section className="card">
        <VolunteerForm
          siteKey={turnstile.turnstileSiteKey}
          bypass={turnstile.turnstileBypass}
        />
        <p className="stub-note">
          Sample flow only — submissions are verified for bots but not yet
          emailed to officials. No real member data collected here beyond what
          you type.
        </p>
      </section>
    </>
  );
}
