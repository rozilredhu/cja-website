import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getHeritageTimeline } from "@/modules/public/heritage";

export const metadata: Metadata = {
  title: "Heritage Timeline",
  description:
    "High-level milestones in Jat community history and CJA in Canada.",
  openGraph: {
    title: "Heritage Timeline",
    description: "Jat heritage and CJA milestones at a glance.",
    url: "/heritage/timeline",
  },
};

export default function HeritageTimelinePage() {
  const entries = getHeritageTimeline();

  return (
    <>
      <PageHero
        eyebrow="Heritage"
        title="Timeline"
        description="A short, carefully phrased arc — from community traditions to CJA in Canada. Origins are presented as accounts, not absolute claims."
      />
      <ol className="timeline">
        {entries.map((entry) => (
          <li key={entry.id} className="timeline-item card">
            <p className="eyebrow">{entry.year}</p>
            <h2>{entry.title}</h2>
            <p className="muted">{entry.summary}</p>
          </li>
        ))}
      </ol>
      <p style={{ marginTop: "1.25rem" }}>
        <Link href="/heritage">← Heritage home</Link>
      </p>
    </>
  );
}
