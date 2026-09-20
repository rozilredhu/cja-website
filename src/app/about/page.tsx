import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "About CJA",
  description: "Learn who we are and what the Canadian Jats Association stands for.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"About CJA"} description={"Learn who we are and what the Canadian Jats Association stands for."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Full About content arrives in the Public pages module.</p>
      </section>
    </>
  );
}
