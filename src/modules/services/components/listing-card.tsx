import Link from "next/link";
import {
  formatServicePrice,
  formatCadCents,
} from "../pricing";
import {
  SERVICE_AVAILABILITY_OPTIONS,
  type ServiceListingPublic,
} from "../types";

type Props = {
  listing: ServiceListingPublic;
  distanceKm?: number | null;
};

export function ServiceListingCard({ listing, distanceKm }: Props) {
  const availLabel =
    SERVICE_AVAILABILITY_OPTIONS.find((a) => a.value === listing.availability)
      ?.label ?? listing.availability;

  return (
    <article className="card preview-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <h3 style={{ margin: 0 }}>{listing.business_name}</h3>
        {listing.verified_licensed ? (
          <span className="promo-badge" title="Verified / licensed">
            Verified
          </span>
        ) : null}
      </div>
      <p className="muted" style={{ marginTop: "0.35rem" }}>
        {listing.category_name ?? listing.category_slug}
        {" · "}
        {[listing.city, listing.province].filter(Boolean).join(", ")}
        {distanceKm != null && Number.isFinite(distanceKm) ? (
          <> · ~{distanceKm.toFixed(1)} km</>
        ) : null}
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        <strong>{formatServicePrice(listing.price_cents, listing.price_range)}</strong>
        {" · "}
        <span aria-label={`${listing.avg_rating} stars`}>
          ★ {listing.avg_rating.toFixed(1)}
        </span>
        <span className="muted"> ({listing.review_count} reviews)</span>
      </p>
      {listing.description ? (
        <p style={{ marginTop: "0.5rem" }}>
          {listing.description.length > 160
            ? listing.description.slice(0, 157) + "…"
            : listing.description}
        </p>
      ) : null}
      <ul className="muted" style={{ marginTop: "0.65rem", paddingLeft: "1.1rem" }}>
        <li>Availability: {availLabel}</li>
        <li>Experience: {listing.years_experience} years</li>
        {listing.expires_at ? (
          <li>Listed until {listing.expires_at.slice(0, 10)}</li>
        ) : null}
      </ul>
      <p style={{ marginTop: "0.75rem" }}>
        {listing.contact_phone ? (
          <>
            <a href={`tel:${listing.contact_phone}`}>{listing.contact_phone}</a>
            {" · "}
          </>
        ) : null}
        {listing.contact_email ? (
          <a href={`mailto:${listing.contact_email}`}>{listing.contact_email}</a>
        ) : null}
      </p>
      <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
        Plan: {listing.plan_tier ?? "—"}
        {listing.amount_cents != null
          ? ` (${formatCadCents(listing.amount_cents)} listing fee)`
          : ""}
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        <Link
          className="text-link"
          href={`/services/${listing.category_slug}`}
        >
          More in this category →
        </Link>
      </p>
    </article>
  );
}
