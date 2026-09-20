import type { PublicDocument } from "./types";

/** No public bylaws/PDFs found on cjacanada.com or draft.cjacanada.ca — honest placeholders only. */
export const publicDocuments: PublicDocument[] = [
  {
    id: "doc-pending-bylaws",
    title: "Association bylaws — Coming Soon",
    description:
      "Public bylaws PDF not published on cjacanada.com or draft.cjacanada.ca. Content pending from CJA.",
    category: "Governance",
    href: "#coming-soon",
    publishedAt: "2026-09-20",
  },
  {
    id: "doc-pending-conduct",
    title: "Code of conduct — Coming Soon",
    description: "Not found on public CJA sites. Content pending from CJA.",
    category: "Governance",
    href: "#coming-soon",
    publishedAt: "2026-09-20",
  },
];
