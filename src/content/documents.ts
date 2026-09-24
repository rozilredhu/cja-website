import type { PublicDocument } from "./types";

/**
 * Document Centre entries for About CJA.
 * Bylaws / code of conduct PDFs were not found on cjacanada.com (404) or in the repo.
 * directory.pdf on the old site is a member contact list (PII) — not linked here.
 * Privacy Policy and Terms of Use already exist as site pages.
 */
export const publicDocuments: PublicDocument[] = [
  {
    id: "doc-pending-bylaws",
    title: "Association bylaws",
    description:
      "Coming soon. A public bylaws PDF was not published on cjacanada.com or found in this repository.",
    category: "Governance",
    href: "#document-centre",
    publishedAt: "2026-09-24",
    comingSoon: true,
  },
  {
    id: "doc-pending-conduct",
    title: "Code of conduct",
    description:
      "Coming soon. A code of conduct was not found on the public CJA sites or in this repository.",
    category: "Governance",
    href: "#document-centre",
    publishedAt: "2026-09-24",
    comingSoon: true,
  },
  {
    id: "doc-privacy",
    title: "Privacy Policy",
    description: "How CJA handles personal information on this website.",
    category: "Legal",
    href: "/privacy",
    publishedAt: "2026-09-20",
    comingSoon: false,
  },
  {
    id: "doc-terms",
    title: "Terms of Use",
    description: "Terms governing use of the CJA website.",
    category: "Legal",
    href: "/terms",
    publishedAt: "2026-09-20",
    comingSoon: false,
  },
];
