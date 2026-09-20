import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Document Centre",
  description: "Public documents and downloads.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Document Centre"} description={"Public documents and downloads."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Document library comes later.</p>
      </section>
    </>
  );
}
