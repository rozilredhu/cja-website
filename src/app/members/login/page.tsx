import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Member login",
  description: "Member sign-in (coming soon).",
  robots: { index: false, follow: false },
};

export default function MemberLoginPage() {
  return (
    <>
      <PageHero
        title="Member login"
        description="Member accounts ship in Phase 1C. This page is a placeholder hook."
      />
      <section className="card">
        <p className="stub-note">
          Register / login / email verification / password reset are not built
          yet. Admins use <Link href="/admin/login">/admin/login</Link>.
        </p>
      </section>
    </>
  );
}
