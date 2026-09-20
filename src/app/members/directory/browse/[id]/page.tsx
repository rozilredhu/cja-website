export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { getDirectoryProfileById } from "@/modules/directory/queries";

export const metadata: Metadata = {
  title: "Member profile — Directory",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function MemberProfileDetailPage({ params }: Props) {
  const user = await requireMemberUser();
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();

  const profile = await getDirectoryProfileById(user, id);
  if (!profile) notFound();

  const loc = [profile.city, profile.province].filter(Boolean).join(", ");

  return (
    <>
      <PageHero
        title={profile.displayName}
        description={loc || "Community directory profile"}
        eyebrow="Directory"
      />

      <section className="card">
        <p>
          <Link href="/members/directory/browse">← Back to browse</Link>
        </p>

        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt=""
            className="directory-photo"
            width={160}
            height={160}
          />
        ) : null}

        {profile.education ? (
          <p>
            <strong>Education:</strong> {profile.education}
          </p>
        ) : null}
        {profile.bio ? <p>{profile.bio}</p> : null}

        {profile.canViewSensitive ? (
          <>
            {profile.phone ? (
              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>
            ) : null}
            {profile.addressLine ? (
              <p>
                <strong>Address:</strong> {profile.addressLine}
              </p>
            ) : null}
            {!profile.phone && !profile.addressLine ? (
              <p className="muted">
                This member has not shared phone or address.
              </p>
            ) : null}
          </>
        ) : (
          <p className="stub-note">
            Phone and address are only visible to members who have opted into
            the directory.{" "}
            <Link href="/members/directory">Manage your opt-in</Link>.
          </p>
        )}
      </section>
    </>
  );
}
