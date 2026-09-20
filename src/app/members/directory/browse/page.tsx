export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { DirectorySearchForm } from "@/modules/directory/components/directory-search-form";
import { ProfileCard } from "@/modules/directory/components/profile-card";
import {
  listDistinctCities,
  searchDirectoryProfiles,
} from "@/modules/directory/queries";
import { viewerCanSeeSensitive } from "@/modules/directory/privacy";

export const metadata: Metadata = {
  title: "Browse members — Directory",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ q?: string; city?: string; province?: string }>;
};

export default async function BrowseMembersPage({ searchParams }: Props) {
  const user = await requireMemberUser();
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const city = sp.city?.trim() || "";
  const province = sp.province?.trim() || "";

  const [profiles, cities, canSensitive] = await Promise.all([
    searchDirectoryProfiles(user, { q, city, province }),
    listDistinctCities(),
    viewerCanSeeSensitive(user),
  ]);

  return (
    <>
      <PageHero
        title="Browse members"
        description="Members who opted into the community directory."
        eyebrow="Directory"
      />

      <section className="card">
        <p>
          <Link href="/members/directory">← Directory home</Link>
          {" · "}
          <Link href="/members/directory/businesses">Businesses</Link>
        </p>

        <DirectorySearchForm
          action="/members/directory/browse"
          q={q}
          city={city}
          province={province}
          cities={cities}
          placeholder="Search name, city, province, education…"
        />

        {!canSensitive ? (
          <p className="stub-note">
            Opt in on{" "}
            <Link href="/members/directory">your directory profile</Link> to see
            peer phone and address fields.
          </p>
        ) : null}

        <p className="muted" style={{ marginTop: "1rem" }}>
          {profiles.length} result{profiles.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>

        {profiles.length === 0 ? (
          <p className="muted">No opted-in members match these filters.</p>
        ) : (
          <div className="card-grid directory-grid">
            {profiles.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
