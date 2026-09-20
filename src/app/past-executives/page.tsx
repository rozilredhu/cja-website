import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Past Executives",
  description: "Archived tenures and past leadership teams.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Past Executives"} description={"Archived tenures and past leadership teams."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Tenure grouping ships with the Officials module.</p>
      </section>
    </>
  );
}
