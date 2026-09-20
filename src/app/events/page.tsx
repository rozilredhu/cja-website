import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { EventCard } from "@/modules/public/components/event-card";
import { getPastEvents, getUpcomingEvents } from "@/modules/public/events";

export const metadata: Metadata = {
  title: "Past Functions / Event History",
  description:
    "Upcoming and past CJA community events, each with optional Google Drive album links.",
  openGraph: {
    title: "Past Functions / Event History",
    description: "CJA event history and upcoming functions.",
    url: "/events",
  },
};

export default function EventsPage() {
  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  return (
    <>
      <PageHero
        eyebrow="Functions"
        title="Past Functions / Event History"
        description="Browse upcoming celebrations and archived events. Each event page can include an optional Google Drive link."
      />

      {upcoming.length > 0 ? (
        <section className="section-block" aria-labelledby="upcoming-events">
          <h2 id="upcoming-events" className="section-title">
            Upcoming
          </h2>
          <div className="card-grid">
            {upcoming.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block" aria-labelledby="past-events">
        <h2 id="past-events" className="section-title">
          Event history
        </h2>
        <div className="card-grid">
          {past.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      </section>
    </>
  );
}
