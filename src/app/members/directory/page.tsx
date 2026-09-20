export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getMediaBucket } from "@/lib/db";
import { requireMemberUser } from "@/modules/auth/session";
import { deleteBusinessListingAction } from "@/modules/directory/actions";
import { BusinessEditForm } from "@/modules/directory/components/business-edit-form";
import { ProfileEditForm } from "@/modules/directory/components/profile-edit-form";
import {
  getOptedInBusinessCount,
  getOptedInMemberCount,
  getOwnBusinesses,
  getOwnProfile,
} from "@/modules/directory/queries";
import { viewerCanSeeSensitive } from "@/modules/directory/privacy";

export const metadata: Metadata = {
  title: "Community Directory",
  robots: { index: false, follow: false },
};

export default async function DirectoryHomePage() {
  const user = await requireMemberUser();
  const [profile, businesses, memberCount, bizCount, canSensitive, media] =
    await Promise.all([
      getOwnProfile(user.id),
      getOwnBusinesses(user.id),
      getOptedInMemberCount(),
      getOptedInBusinessCount(),
      viewerCanSeeSensitive(user),
      getMediaBucket(),
    ]);

  const mediaReady = Boolean(media);

  return (
    <>
      <PageHero
        title="Community Directory"
        description="Opt in to share your profile with fellow members. Browse is members-only."
        eyebrow="Members"
      />

      <section className="card directory-stats">
        <h2>Directory at a glance</h2>
        <p className="muted">
          <strong>{memberCount}</strong> members opted in ·{" "}
          <strong>{bizCount}</strong> businesses listed
        </p>
        <ul className="member-dash-links">
          <li>
            <Link href="/members/directory/browse">Browse members</Link>
          </li>
          <li>
            <Link href="/members/directory/businesses">Browse businesses</Link>
          </li>
          <li>
            <Link href="/members/promotions">Promote profile / business (CAD)</Link>
          </li>
          <li>
            <Link href="/members">Back to member area</Link>
          </li>
        </ul>
        {!canSensitive ? (
          <p className="stub-note">
            Phone and address on other profiles are hidden until you opt in to
            the directory yourself.
          </p>
        ) : (
          <p className="form-hint">
            You are opted in — you can see peer phone/address when they chose to
            share them.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Your directory profile</h2>
        <ProfileEditForm
          mediaReady={mediaReady}
          initial={{
            display_name: profile?.display_name || user.name || "",
            phone: profile?.phone || "",
            address_line: profile?.address_line || "",
            city: profile?.city || "",
            province: profile?.province || "",
            education: profile?.education || "",
            bio: profile?.bio || "",
            photo_url: profile?.photo_url || "",
            photo_key: profile?.photo_key ?? null,
            opted_in: Boolean(profile?.opted_in),
            show_phone: profile ? Boolean(profile.show_phone) : false,
            show_address: profile ? Boolean(profile.show_address) : false,
            show_photo: profile ? Boolean(profile.show_photo) : true,
            show_education: profile ? Boolean(profile.show_education) : true,
          }}
        />
      </section>

      <section className="card">
        <h2>Your business listings</h2>
        <p className="muted">
          List Jat-owned businesses in Canada. Visible only to logged-in
          members. Contact fields follow the same peer opt-in privacy rules.
        </p>

        {businesses.length > 0 ? (
          <ul className="directory-own-list">
            {businesses.map((b) => (
              <li key={b.id}>
                <strong>{b.name}</strong>
                {b.city || b.province
                  ? ` — ${[b.city, b.province].filter(Boolean).join(", ")}`
                  : null}
                {" · "}
                {b.opted_in && !b.disabled ? "listed" : "hidden"}
                {" · "}
                <Link href={`#edit-biz-${b.id}`}>Edit below</Link>
                <form
                  action={deleteBusinessListingAction}
                  style={{ display: "inline", marginLeft: "0.5rem" }}
                >
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="btn-secondary btn-small">
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No businesses yet.</p>
        )}

        {businesses.map((b) => (
          <div key={b.id} id={`edit-biz-${b.id}`} className="directory-edit-block">
            <h3>Edit: {b.name}</h3>
            <BusinessEditForm
              mediaReady={mediaReady}
              initial={{
                id: b.id,
                name: b.name,
                description: b.description || "",
                city: b.city || "",
                province: b.province || "",
                phone: b.phone || "",
                email: b.email || "",
                website: b.website || "",
                address_line: b.address_line || "",
                photo_url: b.photo_url || "",
                opted_in: Boolean(b.opted_in),
              }}
            />
          </div>
        ))}

        <div className="directory-edit-block">
          <h3>Add a business</h3>
          <BusinessEditForm mediaReady={mediaReady} />
        </div>
      </section>
    </>
  );
}
