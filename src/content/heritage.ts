import type { HeritageArticle, HeritageTimelineEntry, GalleryItem } from "./types";

export const heritageIntro = {
  title: "Jats Heritage",
  lede:
    "Explore the history, values, and cultural traditions of Jat communities — with a Canadian lens. Content here starts thin and will grow with contributions from members and historians.",
};

export const heritageArticles: HeritageArticle[] = [
  {
    slug: "roots-and-identity",
    title: "Roots and identity (sample)",
    excerpt:
      "A brief introduction to Jat heritage, agricultural roots, and community values.",
    body: [
      "Jat communities have deep agricultural and cultural roots across northern India, with diaspora families now thriving across Canada.",
      "This sample article is a placeholder. CJA will expand heritage content with verified sources and community stories.",
    ],
  },
  {
    slug: "festivals-and-traditions",
    title: "Festivals and traditions (sample)",
    excerpt:
      "How festivals like Diwali, Holi, and Teej bring families together in Canada.",
    body: [
      "Cultural festivals help pass language, food traditions, and values to the next generation.",
      "CJA events celebrate these traditions while welcoming friends and neighbours from all backgrounds.",
    ],
  },
];

export const heritageTimeline: HeritageTimelineEntry[] = [
  {
    id: "t-1",
    year: "Early diaspora",
    title: "First Canadian Jat families (sample)",
    summary:
      "Placeholder timeline entry — early settlement stories to be researched and published.",
  },
  {
    id: "t-2",
    year: "Association founding",
    title: "Canadian Jats Association formed (sample)",
    summary:
      "CJA was established to connect families, preserve culture, and support community programs.",
  },
  {
    id: "t-3",
    year: "Today",
    title: "Growing chapters across Canada (sample)",
    summary:
      "Regional activities, youth programs, and digital community tools continue to expand.",
  },
];

export const heritageGallery: GalleryItem[] = [
  {
    id: "hg-1",
    title: "Heritage artefact photo (sample)",
    kind: "photo",
    caption: "Placeholder for cultural artefacts or historical photos.",
    album: "Heritage",
  },
  {
    id: "hg-2",
    title: "Traditional attire (sample)",
    kind: "photo",
    caption: "Sample gallery tile for heritage clothing and dress.",
    album: "Heritage",
  },
];
