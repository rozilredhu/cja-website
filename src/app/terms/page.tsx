import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { termsOfUse } from "@/content/legal";
import { LegalDocView } from "@/modules/public/components/legal-doc-view";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Draft terms of use for the Canadian Jats Association website — for counsel review.",
  openGraph: {
    title: "Terms of Use",
    description: "Website terms of use (draft).",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={termsOfUse.title}
        description="Readable draft for CJA counsel. Not final legal terms."
      />
      <LegalDocView doc={termsOfUse} />
    </>
  );
}
