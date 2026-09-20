import Link from "next/link";
import type { MatrimonialProfilePublic } from "../types";

export function MatrimonialProfileCard({
  profile,
}: {
  profile: MatrimonialProfilePublic;
}) {
  const loc = [profile.city, profile.province].filter(Boolean).join(", ");
  return (
    <article
      className={`directory-card content-card${profile.promoted ? " directory-card-promoted" : ""}`}
    >
      {profile.promoted ? (
        <span className="promo-badge" title={profile.promotedUntil ?? undefined}>
          Promoted
        </span>
      ) : null}
      <h3>
        <Link href={`/members/matrimonial/browse/${profile.id}`}>
          {profile.displayName}, {profile.age}
        </Link>
      </h3>
      {loc ? <p className="muted">{loc}</p> : null}
      {profile.heightLabel ? (
        <p className="directory-meta">{profile.heightLabel}</p>
      ) : null}
      {profile.occupation ? (
        <p className="directory-meta">{profile.occupation}</p>
      ) : null}
      {profile.education ? (
        <p className="directory-meta">{profile.education}</p>
      ) : null}
      {profile.gotra ? (
        <p className="directory-meta">Gotra: {profile.gotra}</p>
      ) : null}
      <p>
        <Link href={`/members/matrimonial/browse/${profile.id}`}>
          View profile
        </Link>
      </p>
    </article>
  );
}
