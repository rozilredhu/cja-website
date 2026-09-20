export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { VolunteerForm } from "@/components/volunteer-form";
import { PageHero } from "@/components/page-hero";
import { getTurnstilePublicConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Volunteer interest form for the Canadian Jats Association.",
};

export default async function VolunteerPage() {
  const turnstile = await getTurnstilePublicConfig();

  return (
    <>
      <PageHero
        title="Volunteer"
        description="Tell us how you’d like to help. Turnstile protects this form when keys are set."
      />
      <section className="card">
        <VolunteerForm
          siteKey={turnstile.turnstileSiteKey}
          bypass={turnstile.turnstileBypass}
        />
      </section>
    </>
  );
}
