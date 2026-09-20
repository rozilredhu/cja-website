export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { getBusinessById } from "@/modules/directory/queries";

export const metadata: Metadata = {
  title: "Business listing — Directory",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function BusinessDetailPage({ params }: Props) {
  const user = await requireMemberUser();
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();

  const biz = await getBusinessById(user, id);
  if (!biz) notFound();

  const loc = [biz.city, biz.province].filter(Boolean).join(", ");

  return (
    <>
      <PageHero
        title={biz.name}
        description={loc || "Business listing"}
        eyebrow="Directory"
      />

      <section className="card">
        <p>
          <Link href="/members/directory/businesses">← Back to businesses</Link>
        </p>

        {biz.promoted ? (
          <p>
            <span className="promo-badge" title={biz.promotedUntil ?? undefined}>
              Promoted
            </span>
            {biz.promotedUntil ? (
              <span className="muted"> until {biz.promotedUntil}</span>
            ) : null}
          </p>
        ) : null}

        {biz.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={biz.photoUrl}
            alt=""
            className="directory-photo"
            width={200}
            height={150}
          />
        ) : null}

        {biz.description ? <p>{biz.description}</p> : null}
        {biz.website ? (
          <p>
            <strong>Website:</strong>{" "}
            <a href={biz.website} rel="noopener noreferrer" target="_blank">
              {biz.website}
            </a>
          </p>
        ) : null}

        {biz.canViewSensitive ? (
          <>
            {biz.phone ? (
              <p>
                <strong>Phone:</strong> {biz.phone}
              </p>
            ) : null}
            {biz.email ? (
              <p>
                <strong>Email:</strong> {biz.email}
              </p>
            ) : null}
            {biz.addressLine ? (
              <p>
                <strong>Address:</strong> {biz.addressLine}
              </p>
            ) : null}
          </>
        ) : (
          <p className="stub-note">
            Contact details are only visible to members who have opted into the
            directory.{" "}
            <Link href="/members/directory">Manage your opt-in</Link>.
          </p>
        )}
      </section>
    </>
  );
}
