import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Past Functions / Events",
  description: "Event history with optional Drive links.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Past Functions / Events"} description={"Event history with optional Drive links."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Event pages ship in the Public pages module.</p>
      </section>
    </>
  );
}
