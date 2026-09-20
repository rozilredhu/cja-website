import type { GalleryItem } from "./types";

export const galleryItems: GalleryItem[] = [
  {
    id: "g-01",
    title: "Diwali stage (sample)",
    kind: "photo",
    caption: "Sample photo placeholder — replace with R2 media later.",
    album: "Diwali",
  },
  {
    id: "g-02",
    title: "Family picnic games (sample)",
    kind: "photo",
    caption: "Outdoor sports and kids’ games at the summer picnic.",
    album: "Picnic",
  },
  {
    id: "g-03",
    title: "AGM group photo (sample)",
    kind: "photo",
    caption: "Members at the annual general meeting.",
    album: "AGM",
  },
  {
    id: "g-04",
    title: "Cultural dance highlight (sample)",
    kind: "photo",
    caption: "Youth cultural performance highlight.",
    album: "Culture",
  },
  {
    id: "g-05",
    title: "Event recap video (sample embed)",
    kind: "video",
    caption: "YouTube embed placeholder — replace with CJA channel video.",
    album: "Videos",
    // Public sample video; CJA will replace with own channel content
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "g-06",
    title: "Community welcome message (sample embed)",
    kind: "video",
    caption: "Second video embed placeholder for layout testing.",
    album: "Videos",
    embedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
];
