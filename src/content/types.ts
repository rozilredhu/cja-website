/** Shared content types for public pages (file-based until Admin CMS). */

export type OfficialStatus = "active" | "inactive" | "archived";

export type Official = {
  id: string;
  fullName: string;
  designation: string;
  /** Free-form category label (e.g. Executives, Directors). Not a fixed enum. */
  category: string;
  /** Display order within category (lower first). */
  displayOrder: number;
  status: OfficialStatus;
  photoUrl?: string | null;
  shortBio?: string;
  joinedAt?: string;
  termStart?: string;
  termEnd?: string;
  /** Optional public social profile URL. */
  socialUrl?: string;
  /** Tenure label for archived officials, e.g. "2022–2025". */
  tenureLabel?: string;
};

export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  publishedAt: string;
  author?: string;
  featured?: boolean;
};

export type CommunityEvent = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
  dateStart: string;
  dateEnd?: string;
  location?: string;
  /** Optional Google Drive album / folder link. */
  googleDriveUrl?: string;
  upcoming?: boolean;
  coverLabel?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  kind: "photo" | "video";
  /** Placeholder caption; real media later via R2. */
  caption: string;
  /** External video embed URL (YouTube/Vimeo) when kind === video. */
  embedUrl?: string;
  album?: string;
};

export type HeritageArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
};

export type HeritageTimelineEntry = {
  id: string;
  year: string;
  title: string;
  summary: string;
};

export type PublicDocument = {
  id: string;
  title: string;
  description: string;
  category: string;
  /** Placeholder href — sample PDFs or # until R2/CMS. */
  href: string;
  publishedAt: string;
};

export type LegalDoc = {
  title: string;
  lastUpdated: string;
  draftNotice: string;
  sections: { heading: string; paragraphs: string[] }[];
};
