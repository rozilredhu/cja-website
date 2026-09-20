export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { BusinessCard } from "@/modules/directory/components/business-card";
import { DirectorySearchForm } from "@/modules/directory/components/directory-search-form";
import {
  listBusinessCities,
  searchBusinessListings,
} from "@/modules/directory/queries";
import { viewerCanSeeSensitive } from "@/modules/directory/privacy";

export const metadata: Metadata = {
  title: "Browse businesses — Directory",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ q?: string; city?: string; province?: string }>;
};

export default async function BrowseBusinessesPage({ searchParams }: Props) {
  const user = await requireMemberUser();
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const city = sp.city?.trim() || "";
  const province = sp.province?.trim() || "";

  const [businesses, cities, canSensitive] = await Promise.all([
    searchBusinessListings(user, { q, city, province }),
    listBusinessCities(),
    viewerCanSeeSensitive(user),
  ]);

  return (
    <>
      <PageHero
        title="Jat-owned businesses"
        description="Member-submitted business listings across Canada."
        eyebrow="Directory"
      />

      <section className="card">
        <p>
          <Link href="/members/directory">← Directory home</Link>
          {" · "}
          <Link href="/members/directory/browse">Members</Link>
        </p>

        <DirectorySearchForm
          action="/members/directory/businesses"
          q={q}
          city={city}
          province={province}
          cities={cities}
          placeholder="Search business name, city, province, description…"
        />

        {!canSensitive ? (
          <p className="stub-note">
            Contact phone/address on listings are hidden until you{" "}
            <Link href="/members/directory">opt in</Link> to the directory.
          </p>
        ) : null}

        <p className="muted" style={{ marginTop: "1rem" }}>
          {businesses.length} result{businesses.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>

        {businesses.length === 0 ? (
          <p className="muted">No businesses match these filters.</p>
        ) : (
          <div className="card-grid directory-grid">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
