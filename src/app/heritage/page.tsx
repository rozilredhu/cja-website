import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Jats Heritage",
  description: "Articles, timeline, and heritage gallery.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Jats Heritage"} description={"Articles, timeline, and heritage gallery."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Heritage content starts thin in a later module.</p>
      </section>
    </>
  );
}
