import type { GalleryItem } from "@/content/types";

type Props = { items: GalleryItem[] };

export function GalleryGrid({ items }: Props) {
  return (
    <div className="gallery-grid">
      {items.map((item) =>
        item.kind === "video" && item.embedUrl ? (
          <figure key={item.id} className="gallery-item gallery-video">
            <div className="video-embed">
              <iframe
                src={item.embedUrl}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <figcaption>
              <strong>{item.title}</strong>
              <span className="muted">{item.caption}</span>
            </figcaption>
          </figure>
        ) : (
          <figure key={item.id} className="gallery-item gallery-photo">
            <div className="photo-placeholder" aria-hidden>
              <span>{item.album ?? "Photo"}</span>
            </div>
            <figcaption>
              <strong>{item.title}</strong>
              <span className="muted">{item.caption}</span>
            </figcaption>
          </figure>
        ),
      )}
    </div>
  );
}
