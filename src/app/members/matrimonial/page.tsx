export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getMediaBucket } from "@/lib/db";
import { requireMemberUser } from "@/modules/auth/session";
import { isFeatureEnabled } from "@/modules/admin/feature-flags";
import { FeatureUnavailable } from "@/components/feature-unavailable";
import { MatrimonialProfileEditForm } from "@/modules/matrimonial/components/profile-edit-form";
import { getOwnMatrimonialProfile } from "@/modules/matrimonial/queries";
import { ageFromDob, formatHeightCm } from "@/modules/matrimonial/utils";

export const metadata: Metadata = {
  title: "Matrimonial profile",
  robots: { index: false, follow: false },
};

export default async function MatrimonialManagePage() {
  const user = await requireMemberUser();
  if (!(await isFeatureEnabled("matrimonial"))) {
    return (
      <FeatureUnavailable title="Matrimonial profile" moduleLabel="Matrimonial" />
    );
  }
  const [profile, media] = await Promise.all([
    getOwnMatrimonialProfile(user.id),
    getMediaBucket().catch(() => null),
  ]);

  const age = profile ? ageFromDob(profile.date_of_birth) : null;

  return (
    <>
      <PageHero
        title="Matrimonial profile"
        description="Create or edit your matrimonial profile. Submissions require admin approval."
        eyebrow="Members"
      />

      <section className="card">
        <p>
          <Link href="/members">← Member area</Link>
          {" · "}
          <Link href="/members/matrimonial/browse">Browse</Link>
          {" · "}
          <Link href="/members/matrimonial/messages">Messages</Link>
          {" · "}
          <Link href="/members/promotions">Promote profile</Link>
        </p>

        <p className="stub-note">
          Members-only · noindex. After approval you browse opposite gender only
          (man→women, woman→men). Phone/email never appear on cards — use the
          platform message form. Report and Block are available from day one.
        </p>

        {profile ? (
          <p className="muted">
            Status: <strong>{profile.status}</strong>
            {age != null ? ` · Display age: ${age}` : null}
            {profile.height_cm != null
              ? ` · ${formatHeightCm(profile.height_cm)}`
              : null}
          </p>
        ) : (
          <p className="muted">No matrimonial profile yet — create one below.</p>
        )}

        <MatrimonialProfileEditForm
          mediaReady={Boolean(media)}
          initial={{
            gender: profile?.gender ?? "",
            date_of_birth: profile?.date_of_birth ?? "",
            height_cm: profile?.height_cm ?? null,
            marital_status: profile?.marital_status ?? "",
            city: profile?.city ?? "",
            province: profile?.province ?? "",
            education: profile?.education ?? "",
            occupation: profile?.occupation ?? "",
            gotra: profile?.gotra ?? "",
            mother_gotra: profile?.mother_gotra ?? "",
            native_place: profile?.native_place ?? "",
            mother_tongue: profile?.mother_tongue ?? "",
            diet: profile?.diet ?? "",
            willing_to_relocate: Boolean(profile?.willing_to_relocate),
            partner_preferences: profile?.partner_preferences ?? "",
            short_bio: profile?.short_bio ?? "",
            photo_url: profile?.photo_url ?? "",
            photo_key: profile?.photo_key ?? null,
            status: profile?.status ?? null,
          }}
        />
      </section>
    </>
  );
}
