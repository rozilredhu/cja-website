import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Member register",
  description: "Create a CJA member account (coming soon).",
  robots: { index: false, follow: false },
};

export default function MemberRegisterPage() {
  return (
    <>
      <PageHero
        title="Create member account"
        description="Registration will open in a later Phase 1 module."
      />
      <section className="card">
        <p className="stub-note">
          Stub only — see <Link href="/members/login">member login</Link> hook.
        </p>
      </section>
    </>
  );
}
