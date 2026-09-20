import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { GalleryGrid } from "@/modules/public/components/gallery-grid";
import { getHeritageGallery } from "@/modules/public/heritage";

export const metadata: Metadata = {
  title: "Heritage Gallery",
  description: "Sample heritage photo placeholders for cultural artefacts and history.",
  openGraph: {
    title: "Heritage Gallery",
    description: "Heritage photo stubs.",
    url: "/heritage/gallery",
  },
};

export default function HeritageGalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Heritage"
        title="Heritage gallery"
        description="Thin stub gallery for cultural photos. Full media library comes later."
      />
      <GalleryGrid items={getHeritageGallery()} />
      <p style={{ marginTop: "1.25rem" }}>
        <Link href="/heritage">← Heritage home</Link>
      </p>
    </>
  );
}
