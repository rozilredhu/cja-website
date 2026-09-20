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
        description="Albums linked from public CJA sites (Diwali Drive, Holi & Picnic Facebook albums) plus the public YouTube link."
      />
      <GalleryGrid items={galleryItems} />
    </>
  );
}
