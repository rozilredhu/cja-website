import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { aboutContent } from "@/content/about";

export const metadata: Metadata = {
  title: "About CJA",
  description:
    "About, mission, and vision of the Canadian Jats Association — connecting Jat families across Canada.",
  openGraph: {
    title: "About CJA",
    description:
      "About, mission, and vision of the Canadian Jats Association.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="About CJA"
        description={aboutContent.mission}
      />

      <section className="card">
        <h2>About CJA</h2>
        <p>{aboutContent.intro}</p>
      </section>

      <section className="card">
        <h2>Our vision</h2>
        <p>{aboutContent.vision}</p>
      </section>

      <section className="card">
        <h2>Our mission</h2>
        <p>{aboutContent.mission}</p>
      </section>

      <section className="section-block" aria-labelledby="values">
        <h2 id="values" className="section-title">
          What we stand for
        </h2>
        <div className="card-grid">
          {aboutContent.values.map((v) => (
            <article key={v.title} className="card">
              <h3>{v.title}</h3>
              <p className="muted">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>What we do</h2>
        <ul className="plain-list">
          {aboutContent.whatWeDo.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="stub-note">{aboutContent.note}</p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/contact">Contact CJA</Link>
          {" · "}
          <Link href="/contact/volunteer">Volunteer</Link>
          {" · "}
          <Link href="/officials">Leadership</Link>
        </p>
      </section>
    </>
  );
}
