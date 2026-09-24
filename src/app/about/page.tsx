import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { aboutContent } from "@/content/about";
import { publicDocuments } from "@/content/documents";

export const metadata: Metadata = {
  title: "About CJA",
  description:
    "About Us for the Canadian Jats Association — history, mission, vision, and Document Centre.",
  openGraph: {
    title: "About CJA",
    description:
      "About Us for the Canadian Jats Association — history, mission, vision, and Document Centre.",
    url: "/about",
  },
};

export default function AboutPage() {
  const categories = [...new Set(publicDocuments.map((d) => d.category))];

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="About CJA"
        description={aboutContent.lede}
      />

      <section className="card" aria-labelledby="about-cja">
        <h2 id="about-cja">Who we are</h2>
        {aboutContent.introParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </section>

      <section className="card" aria-labelledby="history">
        <h2 id="history">{aboutContent.history.heading}</h2>
        <ul className="plain-list history-facts">
          {aboutContent.history.facts.map((fact) => (
            <li key={fact.label}>
              <strong>
                {fact.label}: {fact.value}
              </strong>
              <p className="muted" style={{ margin: "0.35rem 0 0.15rem" }}>
                {fact.detail}
              </p>
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                Source: {fact.source}
              </p>
            </li>
          ))}
        </ul>
        <p className="stub-note">{aboutContent.history.omittedNote}</p>
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
          <Link href="/contact#volunteer">Volunteer</Link>
          {" · "}
          <Link href="/officials">Leadership</Link>
        </p>
      </section>

      <section
        id="document-centre"
        className="section-block"
        aria-labelledby="document-centre-heading"
      >
        <h2 id="document-centre-heading" className="section-title">
          Document centre
        </h2>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Governance and legal documents for the Canadian Jats Association.
          Bylaws and code of conduct will appear here when CJA publishes them.
        </p>
        {categories.map((category) => (
          <div key={category} style={{ marginBottom: "1.25rem" }}>
            <h3 className="section-title" style={{ fontSize: "1.1rem" }}>
              {category}
            </h3>
            <ul className="doc-list">
              {publicDocuments
                .filter((d) => d.category === category)
                .map((doc) => (
                  <li key={doc.id} className="card">
                    <h3>
                      {doc.comingSoon ? (
                        <>
                          {doc.title}{" "}
                          <span className="doc-coming-soon">Coming soon</span>
                        </>
                      ) : (
                        <Link href={doc.href}>{doc.title}</Link>
                      )}
                    </h3>
                    <p className="muted">{doc.description}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
