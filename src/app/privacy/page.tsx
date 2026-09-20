import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CJA handles personal information.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Privacy Policy"} description={"How CJA handles personal information."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Legal copy to be provided by CJA.</p>
      </section>
    </>
  );
}
