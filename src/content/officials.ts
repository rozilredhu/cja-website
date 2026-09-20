import type { Official } from "./types";

/**
 * Executive Committee from draft.cjacanada.ca (preferred over cjacanada.com).
 * Draft lists 3 named members + additional seats as TBA — TBA seats omitted here
 * (honest gap; not invented people). Officer titles are not published on either site.
 */
export const officials: Official[] = [
  {
    id: "ex-01",
    fullName: "Sumit Rana",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 1,
    status: "active",
    shortBio: "Mississauga · 437-259-4035 (public on draft.cjacanada.ca).",
    photoUrl: "/images/members/sumitr.jpg",
  },
  {
    id: "ex-02",
    fullName: "Subhash Punia",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 2,
    status: "active",
    shortBio: "Brampton · 416-569-3442 (public on draft.cjacanada.ca).",
    photoUrl: "/images/members/subhashp.jpg",
  },
  {
    id: "ex-03",
    fullName: "Virendra Sheoran",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 3,
    status: "active",
    shortBio: "Mississauga · 647-231-4561 (public on draft.cjacanada.ca).",
    photoUrl: "/images/members/virenders.jpg",
  },
];

/** Preferred category display order when present; unknown categories follow alphabetically. */
export const categoryOrder = [
  "Executives",
  "Directors",
  "Corporate Secretary",
] as const;
