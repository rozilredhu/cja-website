import type { CommunityEvent } from "./types";

/**
 * Events: Diwali 2026 from gathered CJA package + Instagram flyers + draft site.
 * Venue and start time are intentionally soft-confirmed (sources differ / pending).
 * Outdated Diwali 2024 (cjacanada.com) intentionally omitted.
 * Past Holi/Picnic album dates replaced with Coming Soon / future placeholders per staging policy.
 */
export const events: CommunityEvent[] = [
  {
    slug: "diwali-2026",
    title: "CJA Annual Diwali Mahotsav 2026",
    summary:
      "CJA’s annual Diwali celebration in Brampton — Indian snacks and dinner, DJ and live singer, cultural performances, fashion show, kids’ activities, awards, lucky draw, and games for all ages. Festive dress encouraged.",
    dateStart: "2026-10-24",
    location:
      "Likely venue: Chandni Banquet Hall, Brampton — to be confirmed",
    upcoming: true,
    coverLabel: "Diwali Mahotsav 2026",
    googleDriveUrl:
      "https://drive.google.com/drive/folders/1Lqqov40YI1fn5edZ6iMyYbHglBmWUUFh",
    body: [
      "You're invited to a spectacular Diwali celebration presented by the Canadian Jats Association — also known as Diwali Function 2026 / Diwali Mahotsav 2026.",
      "Date: Saturday, 24 October 2026 · City: Brampton, Ontario.",
      "Time: Sources differ. Instagram flyers list 4:00 PM onwards; the CJA package and website list 6:00 PM onwards. Showing from 4:00 PM (program details / doors to be confirmed) — we have not assigned which time is doors versus program start.",
      "Venue: Likely Chandni Banquet Hall, Brampton (venue confirmation pending). Do not treat the hall as final until CJA confirms.",
      "Celebrate the Festival of Lights with delicious food, vibrant music, cultural performances, and togetherness — a fun-filled, family-friendly day for all ages, and a great chance for newcomers in Canada to meet other Jat families.",
      "Program and inclusions: Indian snacks and dinner; DJ and live singer; music, cultural and dance performances, and bhangra; fashion show; kids’ activities; awards; lucky draw; games for all ages. Festive dress is encouraged.",
      "Super Early Bird pricing (through 25 September 2026), CAD: Adult $60; Child (7–15) $50; Kids 6 and under free; Table of 10 $500.",
      "Standard / package pricing, CAD: Adult $70; Early bird $10 off until 10 October 2026; CJA member additional $5 off (early bird and member discounts are combinable); Child (6–12) $60; Under 6 free; Table of 10 $600.",
      "Note: Child age bands differ between Super Early Bird (7–15) and standard (6–12) materials — both are shown as published; confirm with organizers when booking if unsure.",
      "Sponsorship tiers (CAD, optional): Title $1,500 · Platinum $1,100 · Gold $750 · Silver $500 · Bronze $250. Named 2026 sponsors are not listed here unless already published on the site.",
      "To request tickets, email info@cjacanada.com with ticket counts, or contact: Yoginder Gulia 416-557-4137; Sandeep Phogat 416-939-5369; Sanjeev Malik 647-883-4445; Sumit Rana 437-259-4035; Mandeep Kataria 437-256-3000; Subhash Punia 416-569-3442; Pardeep Punia 905-407-8642; Virender Rathee 437-237-5000; Virendra Sheoran 647-231-4561. Website: cjacanada.com.",
      "Warm wishes, CJA Executive Team.",
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
