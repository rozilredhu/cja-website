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
        description="Official public links from draft.cjacanada.ca / cjacanada.com. Instagram is intentionally not built."
      />

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
        <div className="embed-placeholder">
          <p>
            Timeline embed Coming Soon
            <br />
            <span className="muted">{x.handlePlaceholder}</span>
          </p>
        </div>
      </section>

      <section className="card embed-card">
        <h2>{facebook.label}</h2>
        <p className="muted">{facebook.note}</p>
        {facebook.pageUrl ? (
          <p>
            <a href={facebook.pageUrl} rel="noopener noreferrer" target="_blank">
              Open Facebook group
            </a>
          </p>
        ) : null}
        <div className="embed-placeholder">
          <p>Facebook group link above (Page Plugin not used — source is a group URL).</p>
        </div>
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

      <p className="stub-note">
        No Instagram embed or link (not present on public CJA sites; handoff
        also excludes Instagram).
      </p>
    </>
  );
}
