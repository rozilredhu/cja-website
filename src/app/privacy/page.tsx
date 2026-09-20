import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { privacyPolicy } from "@/content/legal";
import { LegalDocView } from "@/modules/public/components/legal-doc-view";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Draft privacy policy for the Canadian Jats Association website — for counsel review.",
  openGraph: {
    title: "Privacy Policy",
    description: "How CJA handles personal information (draft).",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={privacyPolicy.title}
        description="Readable draft for CJA counsel. Not final legal advice."
      />
      <LegalDocView doc={privacyPolicy} />
    </>
  );
}
