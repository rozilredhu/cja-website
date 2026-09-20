export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { MatrimonialContactForm } from "@/modules/matrimonial/components/contact-form";
import {
  BlockMatrimonialButton,
  ReportMatrimonialForm,
} from "@/modules/matrimonial/components/report-block-forms";
import { getMatrimonialProfileById } from "@/modules/matrimonial/queries";

export const metadata: Metadata = {
  title: "Matrimonial profile",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function MatrimonialDetailPage({ params }: Props) {
  const user = await requireMemberUser();
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id)) notFound();

  const profile = await getMatrimonialProfileById(user, id);
  if (!profile) notFound();

  const loc = [profile.city, profile.province].filter(Boolean).join(", ");
  const isSelf = profile.userId === user.id;

  return (
    <>
      <PageHero
        title={`${profile.displayName}, ${profile.age}`}
        description={loc || "Matrimonial profile"}
        eyebrow="Matrimonial"
      />

      <section className="card">
        <p>
          <Link href="/members/matrimonial/browse">← Browse</Link>
          {" · "}
          <Link href="/members/matrimonial">My profile</Link>
        </p>

        {profile.promoted ? (
          <p>
            <span className="promo-badge">Promoted</span>
          </p>
        ) : null}

        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt=""
            className="mat-photo"
            width={240}
            height={240}
          />
        ) : null}

        <dl className="promo-order-dl">
          <div>
            <dt>Age</dt>
            <dd>{profile.age} (from date of birth)</dd>
          </div>
          {profile.heightLabel ? (
            <div>
              <dt>Height</dt>
              <dd>{profile.heightLabel}</dd>
            </div>
          ) : null}
          {profile.maritalStatus ? (
            <div>
              <dt>Marital status</dt>
              <dd>{profile.maritalStatus}</dd>
            </div>
          ) : null}
          {profile.education ? (
            <div>
              <dt>Education</dt>
              <dd>{profile.education}</dd>
            </div>
          ) : null}
          {profile.occupation ? (
            <div>
              <dt>Occupation</dt>
              <dd>{profile.occupation}</dd>
            </div>
          ) : null}
          {profile.gotra ? (
            <div>
              <dt>Gotra</dt>
              <dd>{profile.gotra}</dd>
            </div>
          ) : null}
          {profile.motherGotra ? (
            <div>
              <dt>Mother&apos;s gotra</dt>
              <dd>{profile.motherGotra}</dd>
            </div>
          ) : null}
          {profile.nativePlace ? (
            <div>
              <dt>Native place</dt>
              <dd>{profile.nativePlace}</dd>
            </div>
          ) : null}
          {profile.motherTongue ? (
            <div>
              <dt>Mother tongue</dt>
              <dd>{profile.motherTongue}</dd>
            </div>
          ) : null}
          {profile.diet ? (
            <div>
              <dt>Diet</dt>
              <dd>{profile.diet}</dd>
            </div>
          ) : null}
          <div>
            <dt>Willing to relocate</dt>
            <dd>{profile.willingToRelocate ? "Yes" : "No"}</dd>
          </div>
        </dl>

        {profile.shortBio ? (
          <>
            <h2>About</h2>
            <p>{profile.shortBio}</p>
          </>
        ) : null}
        {profile.partnerPreferences ? (
          <>
            <h2>Partner preferences</h2>
            <p>{profile.partnerPreferences}</p>
          </>
        ) : null}

        <p className="stub-note">
          Privacy: phone and email are never shown on matrimonial cards. Contact
          only via the platform message form below.
        </p>
      </section>

      {!isSelf ? (
        <>
          <section className="card">
            <h2>Contact via platform</h2>
            <MatrimonialContactForm profileId={profile.id} />
          </section>

          <section className="card">
            <h2>Safety</h2>
            <BlockMatrimonialButton blockedUserId={profile.userId} />
            <div style={{ marginTop: "1rem" }}>
              <ReportMatrimonialForm profileId={profile.id} />
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
