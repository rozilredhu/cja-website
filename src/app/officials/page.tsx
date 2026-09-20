import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Officials / Leadership",
  description: "Current executives, directors, and corporate secretary.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Officials / Leadership"} description={"Current executives, directors, and corporate secretary."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Officials cards and admin CRUD ship in later modules.</p>
      </section>
    </>
  );
}
