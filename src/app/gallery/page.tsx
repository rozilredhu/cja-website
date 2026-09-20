import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Photo & Video Gallery",
  description: "Community photos and videos.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Photo & Video Gallery"} description={"Community photos and videos."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Gallery media on R2 comes later.</p>
      </section>
    </>
  );
}
