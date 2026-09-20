import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { publicDocuments } from "@/content/documents";

export const metadata: Metadata = {
  title: "Document Centre",
  description:
    "Public CJA documents — bylaws, agendas, and program overviews (sample).",
  openGraph: {
    title: "Document Centre",
    description: "Public CJA documents.",
    url: "/documents",
  },
};

export default function DocumentsPage() {
  const categories = [...new Set(publicDocuments.map((d) => d.category))];

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Document Centre"
        description="Public documents only. Private member lists and internal files are out of scope here."
      />

      {categories.map((category) => (
        <section
          key={category}
          className="section-block"
          aria-labelledby={`doc-${category}`}
        >
          <h2 id={`doc-${category}`} className="section-title">
            {category}
          </h2>
          <ul className="doc-list">
            {publicDocuments
              .filter((d) => d.category === category)
              .map((doc) => (
                <li key={doc.id} className="card">
                  <h3>
                    <a href={doc.href}>{doc.title}</a>
                  </h3>
                  <p className="muted">{doc.description}</p>
                  <p className="muted" style={{ fontSize: "0.85rem" }}>
                    Published {doc.publishedAt}
                  </p>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <p className="stub-note">
        Links are sample placeholders (#) until PDFs are uploaded to R2 or Drive.
      </p>
    </>
  );
}
