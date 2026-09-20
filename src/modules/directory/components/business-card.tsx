import Link from "next/link";
import type { BusinessListingPublic } from "../types";

export function BusinessCard({
  business,
}: {
  business: BusinessListingPublic;
}) {
  const loc = [business.city, business.province].filter(Boolean).join(", ");
  return (
    <article className="directory-card content-card">
      <h3>
        <Link href={`/members/directory/businesses/${business.id}`}>
          {business.name}
        </Link>
      </h3>
      {loc ? <p className="muted">{loc}</p> : null}
      {business.description ? (
        <p className="directory-meta">
          {business.description.length > 140
            ? `${business.description.slice(0, 140)}…`
            : business.description}
        </p>
      ) : null}
      {business.canViewSensitive && business.phone ? (
        <p className="directory-meta">Phone: {business.phone}</p>
      ) : null}
      <p>
        <Link href={`/members/directory/businesses/${business.id}`}>
          View listing
        </Link>
      </p>
    </article>
  );
}
