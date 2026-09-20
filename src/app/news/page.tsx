import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "News & Announcements",
  description: "Community news and announcements.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"News & Announcements"} description={"Community news and announcements."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">List + article CMS comes later.</p>
      </section>
    </>
  );
}
