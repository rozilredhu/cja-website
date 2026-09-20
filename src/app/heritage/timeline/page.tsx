import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getHeritageTimeline } from "@/modules/public/heritage";

export const metadata: Metadata = {
  title: "Heritage Timeline",
  description: "Sample timeline of Jat community milestones in Canada.",
  openGraph: {
    title: "Heritage Timeline",
    description: "Sample Jat heritage timeline.",
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
        description="Sample milestones — replace with researched dates and stories."
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
