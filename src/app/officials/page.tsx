export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { OfficialCard } from "@/modules/public/components/official-card";
import {
  getActiveOfficials,
  groupOfficialsByCategory,
} from "@/modules/public/officials";

export const metadata: Metadata = {
  title: "Officials / Leadership",
  description:
    "Current executives, directors, and corporate secretary of the Canadian Jats Association.",
  openGraph: {
    title: "Officials / Leadership",
    description: "Current CJA leadership team.",
    url: "/officials",
  },
};

export default async function OfficialsPage() {
  const groups = groupOfficialsByCategory(await getActiveOfficials());

  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Officials / Leadership"
        description="Executive Committee as published on draft.cjacanada.ca. Categories and counts come from the database."
      />

      {groups.map((group) => (
        <section
          key={group.category}
          className="section-block"
          aria-labelledby={`cat-${slugify(group.category)}`}
        >
          <div className="section-head">
            <h2 id={`cat-${slugify(group.category)}`}>
              {group.category}
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
          Looking for previous terms?{" "}
          <Link href="/past-executives">View Past Executives</Link>
        </p>
        <p className="stub-note">
          Named executives and public phone/city details match draft.cjacanada.ca.
          Additional seats shown as TBA on that draft are omitted here until CJA
          publishes names. Officer titles (e.g. President) are not listed on the
          public sites.
        </p>
      </section>
    </>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
