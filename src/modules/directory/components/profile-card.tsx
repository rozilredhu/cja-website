import Link from "next/link";
import type { DirectoryProfilePublic } from "../types";

export function ProfileCard({ profile }: { profile: DirectoryProfilePublic }) {
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
        <Link href={`/members/directory/browse/${profile.id}`}>
          {profile.displayName}
        </Link>
      </h3>
      {loc ? <p className="muted">{loc}</p> : null}
      {profile.education ? (
        <p className="directory-meta">{profile.education}</p>
      ) : null}
      {profile.canViewSensitive && profile.phone ? (
        <p className="directory-meta">Phone: {profile.phone}</p>
      ) : null}
      <p>
        <Link href={`/members/directory/browse/${profile.id}`}>View profile</Link>
      </p>
    </article>
  );
}
