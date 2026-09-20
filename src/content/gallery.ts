import type { GalleryItem } from "./types";

/** Gallery albums linked from draft.cjacanada.ca / cjacanada.com (same album URLs). */
export const galleryItems: GalleryItem[] = [
  {
    id: "g-01",
    title: "Diwali Album",
    kind: "photo",
    caption:
      "Pictures from past CJA Diwali events (Google Drive album linked from public sites).",
    album: "Diwali",
  },
  {
    id: "g-02",
    title: "Holi Album",
    kind: "photo",
    caption: "Holi album on Facebook (linked from public CJA sites).",
    album: "Holi",
  },
  {
    id: "g-03",
    title: "Picnic Picture",
    kind: "photo",
    caption: "Picnic album on Facebook (linked from public CJA sites).",
    album: "Picnic",
  },
  {
    id: "g-04",
    title: "CJA on YouTube",
    kind: "video",
    caption: "YouTube link from public CJA navigation.",
    album: "Videos",
    embedUrl: "https://www.youtube.com/embed/snPEyAif9xc",
  },
];
