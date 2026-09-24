import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { socialEmbeds } from "@/content/social";

export const metadata: Metadata = {
  title: "Social",
  description:
    "Follow the Canadian Jats Association on Facebook, Instagram, and YouTube.",
  openGraph: {
    title: "Social",
    description: "Follow CJA on Facebook, Instagram, and YouTube.",
    url: "/social",
  },
};

export default function SocialPage() {
  const { facebook, instagram, youtube, x } = socialEmbeds;

  return (
    <>
      <PageHero
        eyebrow="Connect"
        title="Social"
        description="Official CJA links on Facebook, Instagram, and YouTube."
      />

      <section className="card embed-card">
        <h2>{facebook.label}</h2>
        <p className="muted">{facebook.note}</p>
        {facebook.pageUrl ? (
          <p>
            <a href={facebook.pageUrl} rel="noopener noreferrer" target="_blank">
              Open Facebook page
            </a>
          </p>
        ) : null}
      </section>

      <section className="card embed-card">
        <h2>{instagram.label}</h2>
        <p className="muted">{instagram.note}</p>
        {instagram.profileUrl ? (
          <p>
            <a
              href={instagram.profileUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open Instagram (@cjacanadaofficial)
            </a>
          </p>
        ) : null}
      </section>

      <section className="card embed-card">
        <h2>{youtube.label}</h2>
        <p className="muted">{youtube.note}</p>
        {youtube.channelUrl ? (
          <p>
            <a href={youtube.channelUrl} rel="noopener noreferrer" target="_blank">
              Open on YouTube
            </a>
          </p>
        ) : null}
        <div className="video-embed">
          <iframe
            src={youtube.sampleEmbedUrl}
            title="CJA YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>

      <section className="card embed-card">
        <h2>{x.label}</h2>
        <p className="muted">{x.note}</p>
        {x.profileUrl ? (
          <p>
            <a href={x.profileUrl} rel="noopener noreferrer" target="_blank">
              {x.handlePlaceholder}
            </a>
          </p>
        ) : null}
      </section>
    </>
  );
}
