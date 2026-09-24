import { events } from "@/content/events";
import type { CommunityEvent } from "@/content/types";

export function getAllEvents(): CommunityEvent[] {
  return [...events].sort((a, b) => b.dateStart.localeCompare(a.dateStart));
}

export function getUpcomingEvents(): CommunityEvent[] {
  return getAllEvents().filter((e) => e.upcoming);
}

export function getPastEvents(): CommunityEvent[] {
  return getAllEvents().filter((e) => !e.upcoming);
}

export function getEventBySlug(slug: string): CommunityEvent | undefined {
  return events.find((e) => e.slug === slug);
}

export function getEventSlugs(): string[] {
  return events.map((e) => e.slug);
}

export function getPrimaryUpcoming(): CommunityEvent | undefined {
  // Soonest upcoming first (getUpcomingEvents is date-desc from getAllEvents).
  const upcoming = getUpcomingEvents().sort((a, b) =>
    a.dateStart.localeCompare(b.dateStart),
  );
  return upcoming[0];
}
