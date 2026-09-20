import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { galleryItems } from "@/content/gallery";
import { GalleryGrid } from "@/modules/public/components/gallery-grid";

export const metadata: Metadata = {
  title: "Photo & Video Gallery",
  description:
    "Community photo placeholders and video embeds from CJA events.",
  openGraph: {
    title: "Photo & Video Gallery",
    description: "CJA community photos and videos.",
    url: "/gallery",
  },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Media"
        title="Photo & Video Gallery"
        description="Sample grid with photo placeholders and external video embeds. Real media will move to R2 in a later module."
      />
      <GalleryGrid items={galleryItems} />
    </>
  );
}
