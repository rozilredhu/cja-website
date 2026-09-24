import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { HinduCalendarView } from "@/components/hindu-calendar-view";
import {
  defaultMonthKey,
  hinduCalendar,
} from "@/lib/hindu-calendar";

export const metadata: Metadata = {
  title: "Hindu Calendar",
  description:
    "Indicative Hindu panchang calendar for the Greater Toronto Area — tithi timings, Purnima, Amavasya, and festivals.",
  openGraph: {
    title: "Hindu Calendar",
    description:
      "Month-by-month Hindu calendar with tithi start/end times for Mississauga / GTA (America/Toronto).",
    url: "/hindu-calendar",
  },
};

export default function HinduCalendarPage() {
  const data = hinduCalendar;
  const initial = defaultMonthKey();

  return (
    <>
      <PageHero
        eyebrow="Panchang"
        title="Hindu Calendar"
        description={`One year from ${data.range.start} through ${data.range.end} · times in ${data.location.timeZone} for ${data.location.name}. Browse by month: grid above, day-by-day list below.`}
      />

      <HinduCalendarView data={data} initialMonthKey={initial} />

      <aside className="card hindu-cal-footnote" aria-label="Disclaimer">
        <p>
          <strong>Indicative only.</strong> Tithi, nakshatra, and festival dates are
          computed astronomically (Drik Ganita / Smarta, purnimanta) with the open-source{" "}
          <code>{data.source.library}</code> library (MIT) for {data.location.name}.{" "}
          {data.source.note} Sunrise-prevailing tithi is shown with its exact start and
          end. Regional calendars and temple almanacs may differ by a day for some
          observances. Verify muhurat with a local pandit.
        </p>
        <p className="muted">
          Data range: {data.range.start} – {data.range.end} ({data.range.dayCount}{" "}
          days). Generated {new Date(data.generatedAt).toLocaleString("en-CA", {
            timeZone: data.location.timeZone,
          })}{" "}
          ET.
        </p>
      </aside>
    </>
  );
}
