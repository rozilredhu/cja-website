import type { CommunityEvent } from "./types";

/**
 * Events: Diwali 2026 from draft.cjacanada.ca (preferred).
 * Outdated Diwali 2024 (cjacanada.com) intentionally omitted.
 * Past Holi/Picnic album dates replaced with Coming Soon / future placeholders per staging policy.
 */
export const events: CommunityEvent[] = [
  {
    slug: "diwali-2026",
    title: "Diwali Function 2026",
    summary:
      "Spectacular Diwali celebration — snacks & dinner, live music and dance, games for all ages. Venue details TBA.",
    dateStart: "2026-10-24",
    location: "Venue details TBA",
    upcoming: true,
    coverLabel: "Diwali Function 2026",
    googleDriveUrl:
      "https://drive.google.com/drive/folders/1Lqqov40YI1fn5edZ6iMyYbHglBmWUUFh",
    body: [
      "You're Invited to a Spectacular Diwali Celebration! presented by Canadian Jats Association !!",
      "Date: Saturday, 24 October 2026 · Time: 6 PM onwards · Location: Venue details TBA.",
      "Highlights: Delicious Indian Snacks and Dinner; Live music and dance performances; Fun games and activities for all ages.",
      "Tickets: Adult $70; Early bird $10 off (expires 10 October 2026); CJA member $5 off (discounts combinable); Child (6–12) $60; Child (under 6) free.",
      "Email info@cjacanada.com with ticket counts, or contact CJA Executives.",
    ],
  },
  {
    slug: "holi-coming-soon",
    title: "Holi Colour Festival — Coming Soon",
    summary:
      "Next Holi gathering details will be announced here. Past Holi album links remain on the Gallery page.",
    dateStart: "2027-03-14",
    location: "Coming Soon",
    upcoming: true,
    coverLabel: "Holi — Coming Soon",
    googleDriveUrl:
      "https://www.facebook.com/media/set/?set=oa.2248305128753248&type=3",
    body: [
      "CJA typically celebrates Holi with the community. Exact date, venue, and ticket details for the next Holi are Coming Soon.",
      "A past Holi photo album is linked from the public Gallery (Facebook).",
      "Placeholder future date used for staging so the listing does not appear expired.",
    ],
  },
  {
    slug: "family-picnic-coming-soon",
    title: "Family Picnic — Coming Soon",
    summary:
      "Next family picnic details will be announced here. Past picnic photos are linked from the Gallery.",
    dateStart: "2027-07-11",
    location: "Coming Soon",
    upcoming: true,
    coverLabel: "Picnic — Coming Soon",
    googleDriveUrl:
      "https://www.facebook.com/media/set/?set=oa.2074633692787060&type=3",
    body: [
      "CJA family picnics bring members together for outdoor community time. Next picnic date and location: Coming Soon.",
      "A past picnic album is available via the Gallery page (Facebook).",
      "Placeholder future date used for staging so the listing does not appear expired.",
    ],
  },
];
