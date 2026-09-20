import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getEventBySlug, getEventSlugs } from "@/modules/public/events";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      url: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return (
    <>
      <PageHero
        eyebrow={event.upcoming ? "Upcoming" : "Past function"}
        title={event.title}
        description={event.summary}
      />
      <article className="card prose-card">
        <dl className="meta-list">
          <div>
            <dt>Date</dt>
            <dd>{formatDate(event.dateStart)}</dd>
          </div>
          {event.location ? (
            <div>
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </div>
          ) : null}
        </dl>
        {event.body.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        {event.googleDriveUrl ? (
          <p className="drive-link">
            <strong>Photo album:</strong>{" "}
            <a
              href={event.googleDriveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open Google Drive folder
            </a>
            <span className="muted"> (sample / placeholder URL)</span>
          </p>
        ) : null}
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/events">← All events</Link>
        </p>
      </article>
    </>
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
