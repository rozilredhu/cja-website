import Link from "next/link";
import type { CommunityEvent } from "@/content/types";

type Props = { event: CommunityEvent };

export function EventCard({ event }: Props) {
  return (
    <article className="card content-card">
      <div className="event-cover" aria-hidden>
        <span>{event.coverLabel ?? "Event"}</span>
      </div>
      <p className="eyebrow">{formatDate(event.dateStart)}</p>
      <h2>
        <Link href={`/events/${event.slug}`}>{event.title}</Link>
      </h2>
      <p className="muted">{event.summary}</p>
      {event.location ? (
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          {event.location}
        </p>
      ) : null}
      <Link className="text-link" href={`/events/${event.slug}`}>
        Event details →
      </Link>
    </article>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
