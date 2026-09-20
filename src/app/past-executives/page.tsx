import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { OfficialCard } from "@/modules/public/components/official-card";
import { groupArchivedByTenure } from "@/modules/public/officials";

export const metadata: Metadata = {
  title: "Past Executives",
  description:
    "Archived CJA leadership tenures grouped by term (sample data).",
  openGraph: {
    title: "Past Executives",
    description: "Archived CJA leadership tenures.",
    url: "/past-executives",
  },
};

export default function PastExecutivesPage() {
  const tenures = groupArchivedByTenure();

  return (
    <>
      <PageHero
        eyebrow="Archives"
        title="Past Executives"
        description="Archived officials grouped by tenure. Sample terms shown for layout — replace with real archived records later."
      />

      {tenures.map((group) => (
        <section
          key={group.tenure}
          className="section-block"
          aria-labelledby={`tenure-${slugify(group.tenure)}`}
        >
          <div className="section-head">
            <h2 id={`tenure-${slugify(group.tenure)}`}>
              Tenure {group.tenure}
              <span className="count-pill">{group.items.length}</span>
            </h2>
          </div>
          <div className="officials-grid">
            {group.items.map((o) => (
              <OfficialCard key={o.id} official={o} />
            ))}
          </div>
        </section>
      ))}

      <section className="card">
        <p>
          <Link href="/officials">← Back to current leadership</Link>
        </p>
      </section>
    </>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
