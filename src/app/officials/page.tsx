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
    "Current directors, executives, and corporate secretary of the Canadian Jats Association.",
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
        description="Three Directors, nine Executives, and one Corporate Secretary. Named executives match draft.cjacanada.ca; remaining seats are placeholders until CJA publishes names."
      />

      {groups.map((group) => (
        <section
          key={group.category}
          className="section-block officials-category"
          aria-labelledby={`cat-${slugify(group.category)}`}
        >
          <div className="section-head">
            <h2 id={`cat-${slugify(group.category)}`}>
              {group.category}
              <span className="count-pill">{group.items.length}</span>
            </h2>
          </div>
          <div
            className={
              group.category === "Directors"
                ? "officials-grid officials-grid--directors"
                : group.category === "Corporate Secretary"
                  ? "officials-grid officials-grid--secretary"
                  : "officials-grid"
            }
          >
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
          Sumit Rana, Subhash Punia, and Virendra Sheoran are published on
          draft.cjacanada.ca. Other seats use placeholders (Director 1–3,
          Executive 4–9, Corporate Secretary) until CJA confirms names. Officer
          titles such as President are not listed on the public sites.
        </p>
      </section>
    </>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
