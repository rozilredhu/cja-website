import type { Official } from "./types";

/**
 * Leadership roster for public Officials page and homepage preview.
 * Executives 1–3 use names published on draft.cjacanada.ca; remaining seats
 * are explicit placeholders until CJA publishes names.
 */
export const officials: Official[] = [
  // —— Directors (3 placeholders) ——
  {
    id: "dir-01",
    fullName: "Director 1",
    designation: "Director",
    category: "Directors",
    displayOrder: 1,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
  {
    id: "dir-02",
    fullName: "Director 2",
    designation: "Director",
    category: "Directors",
    displayOrder: 2,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
  {
    id: "dir-03",
    fullName: "Director 3",
    designation: "Director",
    category: "Directors",
    displayOrder: 3,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },

  // —— Executives (3 real + 6 placeholders) ——
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
  {
    id: "ex-04",
    fullName: "Executive 4",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 4,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
  {
    id: "ex-05",
    fullName: "Executive 5",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 5,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
  {
    id: "ex-06",
    fullName: "Executive 6",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 6,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
  {
    id: "ex-07",
    fullName: "Executive 7",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 7,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
  {
    id: "ex-08",
    fullName: "Executive 8",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 8,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
  {
    id: "ex-09",
    fullName: "Executive 9",
    designation: "Executive Member",
    category: "Executives",
    displayOrder: 9,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },

  // —— Corporate Secretary (1 placeholder) ——
  {
    id: "cs-01",
    fullName: "Corporate Secretary",
    designation: "Corporate Secretary",
    category: "Corporate Secretary",
    displayOrder: 1,
    status: "active",
    shortBio: "Placeholder — name to be confirmed by CJA.",
  },
];

/** Preferred category display order when present; unknown categories follow alphabetically. */
export const categoryOrder = [
  "Directors",
  "Executives",
  "Corporate Secretary",
] as const;
