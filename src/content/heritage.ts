import type { HeritageArticle, HeritageTimelineEntry, GalleryItem } from "./types";

export const heritageIntro = {
  title: "Jats Heritage",
  lede:
    "Explore Jat community history and traditions with a Canadian lens. Founding facts below come from public CJA About copy; richer heritage articles are Coming Soon pending CJA contributions.",
};

export const heritageArticles: HeritageArticle[] = [
  {
    slug: "cja-founding",
    title: "Canadian Jats Association — founding",
    excerpt:
      "CJA was formed in 2006 as a common forum for Jat community members in Canada.",
    body: [
      "According to public About copy on draft.cjacanada.ca and cjacanada.com, CJA was formed in 2006 with the idea of having a common forum where members could meet, exchange views, and interact personally with other community members.",
      "The association provides opportunities to participate in social celebrations including Holi and Diwali, and to share cultural experiences among Indo-Canadians with roots in India.",
      "Additional heritage essays are Coming Soon — content pending from CJA.",
    ],
  },
  {
    slug: "festivals-and-community",
    title: "Festivals and community life",
    excerpt:
      "Holi, Diwali, and social gatherings help connect families and newcomers.",
    body: [
      "Public CJA materials highlight Holi and Diwali festivals, social gatherings, and annual Gala events as ways members and families participate in community life.",
      "Vision copy emphasizes helping newcomers adapt to life in Canada and engage with the existing Jat community.",
      "Expanded festival history: Coming Soon (content pending from CJA).",
    ],
  },
];

export const heritageTimeline: HeritageTimelineEntry[] = [
  {
    id: "t-1",
    year: "2006",
    title: "Canadian Jats Association formed",
    summary:
      "CJA founded as a non-for-profit forum for the Jat community in Canada (public About copy).",
  },
  {
    id: "t-2",
    year: "Today",
    title: "400+ members and growing",
    summary:
      "Public About copy states CJA currently has over 400 members and continues to enroll new members regularly.",
  },
  {
    id: "t-3",
    year: "Coming Soon",
    title: "Expanded heritage timeline",
    summary:
      "Additional verified historical milestones are pending from CJA — not invented here.",
  },
];

export const heritageGallery: GalleryItem[] = [
  {
    id: "hg-1",
    title: "Diwali community photos",
    kind: "photo",
    caption: "See public Diwali Drive album linked from Gallery.",
    album: "Heritage",
  },
  {
    id: "hg-2",
    title: "Holi community photos",
    kind: "photo",
    caption: "See public Holi Facebook album linked from Gallery.",
    album: "Heritage",
  },
];
