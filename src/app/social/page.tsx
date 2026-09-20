import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Social",
  description: "X, Facebook, and YouTube embeds.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Social"} description={"X, Facebook, and YouTube embeds."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Social embeds come in the Public pages module. Instagram is out of scope.</p>
      </section>
    </>
  );
}
