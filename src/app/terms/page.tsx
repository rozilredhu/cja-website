import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of this website.",
};

export default function Page() {
  return (
    <>
      <PageHero title={"Terms of Use"} description={"Terms governing use of this website."} />
      <section className="card">
        <p className="muted">Placeholder page for Phase 1 Foundation.</p>
        <p className="stub-note">Legal copy to be provided by CJA.</p>
      </section>
    </>
  );
}
