import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { socialEmbeds } from "@/content/social";

export const metadata: Metadata = {
  title: "Social",
  description:
    "CJA on X, Facebook, and YouTube. Instagram is not included by design.",
  openGraph: {
    title: "Social",
    description: "Follow CJA on X, Facebook, and YouTube.",
    url: "/social",
  },
};

export default function SocialPage() {
  const { x, facebook, youtube } = socialEmbeds;

  return (
    <>
      <PageHero
        eyebrow="Connect"
        title="Social"
        description="Embed placeholders for X timeline, Facebook Page Plugin, and YouTube. Instagram is intentionally not built."
      />

      <section className="card embed-card">
        <h2>{x.label}</h2>
        <p className="muted">{x.note}</p>
        <div className="embed-placeholder">
          <p>
            Timeline placeholder
            <br />
            <span className="muted">{x.handlePlaceholder}</span>
          </p>
        </div>
      </section>

      <section className="card embed-card">
        <h2>{facebook.label}</h2>
        <p className="muted">{facebook.note}</p>
        <div className="embed-placeholder">
          <p>Facebook Page Plugin placeholder</p>
        </div>
      </section>

      <section className="card embed-card">
        <h2>{youtube.label}</h2>
        <p className="muted">{youtube.note}</p>
        <div className="video-embed">
          <iframe
            src={youtube.sampleEmbedUrl}
            title="CJA YouTube sample"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>

      <p className="stub-note">
        No Instagram embed or link per handoff §3B. Replace sample YouTube
        embed and empty X/Facebook URLs when CJA confirms official accounts.
      </p>
    </>
  );
}
