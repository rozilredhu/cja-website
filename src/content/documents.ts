import type { PublicDocument } from "./types";

/** Public Document Centre — sample only. No private member lists. */
export const publicDocuments: PublicDocument[] = [
  {
    id: "doc-bylaws",
    title: "Association bylaws (sample PDF)",
    description:
      "Placeholder link for public bylaws. Replace with real PDF in R2 or Drive.",
    category: "Governance",
    href: "#sample-bylaws-pdf",
    publishedAt: "2025-01-15",
  },
  {
    id: "doc-code",
    title: "Code of conduct (sample)",
    description: "Expected conduct at CJA events and online spaces.",
    category: "Governance",
    href: "#sample-code-of-conduct",
    publishedAt: "2025-03-01",
  },
  {
    id: "doc-agm-agenda",
    title: "AGM 2025 agenda (sample)",
    description: "Sample public agenda from a past annual meeting.",
    category: "Meetings",
    href: "#sample-agm-agenda",
    publishedAt: "2025-11-01",
  },
  {
    id: "doc-volunteer",
    title: "Volunteer handbook overview (sample)",
    description: "High-level overview of volunteer roles at CJA events.",
    category: "Programs",
    href: "#sample-volunteer-handbook",
    publishedAt: "2026-02-10",
  },
];
