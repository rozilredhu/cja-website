import type { LegalDoc } from "@/content/types";

type Props = { doc: LegalDoc };

export function LegalDocView({ doc }: Props) {
  return (
    <article className="card legal-doc">
      <p className="draft-banner" role="note">
        {doc.draftNotice}
      </p>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        Last updated: {doc.lastUpdated}
      </p>
      {doc.sections.map((section) => (
        <section key={section.heading} className="legal-section">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
