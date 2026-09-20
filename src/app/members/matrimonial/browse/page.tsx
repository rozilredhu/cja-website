export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { MatrimonialBrowseFilters } from "@/modules/matrimonial/components/browse-filters";
import { MatrimonialProfileCard } from "@/modules/matrimonial/components/profile-card";
import {
  getOwnMatrimonialProfile,
  listMatrimonialCities,
  searchMatrimonialProfiles,
} from "@/modules/matrimonial/queries";
import { oppositeGender } from "@/modules/matrimonial/utils";

export const metadata: Metadata = {
  title: "Browse matrimonial",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    age_min?: string;
    age_max?: string;
    height_min?: string;
    height_max?: string;
    city?: string;
    province?: string;
    education?: string;
    occupation?: string;
    gotra?: string;
    marital_status?: string;
  }>;
};

function numOrUndef(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export default async function MatrimonialBrowsePage({ searchParams }: Props) {
  const user = await requireMemberUser();
  const sp = await searchParams;
  const own = await getOwnMatrimonialProfile(user.id);

  const ageMin = sp.age_min?.trim() || "";
  const ageMax = sp.age_max?.trim() || "";
  const heightMin = sp.height_min?.trim() || "";
  const heightMax = sp.height_max?.trim() || "";
  const city = sp.city?.trim() || "";
  const province = sp.province?.trim() || "";
  const education = sp.education?.trim() || "";
  const occupation = sp.occupation?.trim() || "";
  const gotra = sp.gotra?.trim() || "";
  const maritalStatus = sp.marital_status?.trim() || "";

  const canBrowse = own?.status === "approved";
  const [profiles, cities] = canBrowse
    ? await Promise.all([
        searchMatrimonialProfiles(user, {
          ageMin: numOrUndef(ageMin),
          ageMax: numOrUndef(ageMax),
          heightMinCm: numOrUndef(heightMin),
          heightMaxCm: numOrUndef(heightMax),
          city,
          province,
          education,
          occupation,
          gotra,
          maritalStatus,
        }),
        listMatrimonialCities(),
      ])
    : [[], [] as string[]];

  return (
    <>
      <PageHero
        title="Browse matrimonial"
        description={
          canBrowse && own
            ? `Showing ${oppositeGender(own.gender)} profiles (opposite gender only).`
            : "Your profile must be approved before you can browse."
        }
        eyebrow="Matrimonial"
      />

      <section className="card">
        <p>
          <Link href="/members/matrimonial">← My profile</Link>
          {" · "}
          <Link href="/members/matrimonial/messages">Messages</Link>
        </p>

        {!canBrowse ? (
          <p className="form-error">
            {own
              ? `Your profile status is “${own.status}”. Browse unlocks after admin approval.`
              : "Create and submit a matrimonial profile first."}{" "}
            <Link href="/members/matrimonial">Manage profile</Link>
          </p>
        ) : (
          <>
            <MatrimonialBrowseFilters
              action="/members/matrimonial/browse"
              ageMin={ageMin}
              ageMax={ageMax}
              heightMinCm={heightMin}
              heightMaxCm={heightMax}
              city={city}
              province={province}
              education={education}
              occupation={occupation}
              gotra={gotra}
              maritalStatus={maritalStatus}
              cities={cities}
            />

            <p className="muted" style={{ marginTop: "1rem" }}>
              {profiles.length} result{profiles.length === 1 ? "" : "s"} · phone
              &amp; email hidden · contact via message form
            </p>

            {profiles.length === 0 ? (
              <p className="muted">No approved profiles match these filters.</p>
            ) : (
              <div className="card-grid directory-grid">
                {profiles.map((p) => (
                  <MatrimonialProfileCard key={p.id} profile={p} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
