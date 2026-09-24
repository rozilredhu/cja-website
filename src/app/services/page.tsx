export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { isFeatureEnabled } from "@/modules/admin/feature-flags";
import { FeatureUnavailable } from "@/components/feature-unavailable";
import { ServiceListingCard } from "@/modules/services/components/listing-card";
import { ServicesBrowseFilters } from "@/modules/services/components/browse-filters";
import {
  browseLiveListings,
  countLiveByCategory,
  listCategories,
  listDistinctCities,
  markExpiredListings,
} from "@/modules/services/queries";
import type {
  ServiceBrowseFilters,
  ServiceSort,
} from "@/modules/services/types";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse community service providers — babysitters, plumbers, electricians, lawyers, realtors, mortgage agents, and more.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): ServiceBrowseFilters {
  const priceMin = one(sp.price_min);
  const priceMax = one(sp.price_max);
  const sort = one(sp.sort) as ServiceSort | undefined;
  return {
    category: one(sp.category),
    city: one(sp.city),
    province: one(sp.province),
    priceMinCents:
      priceMin && Number.isFinite(Number(priceMin))
        ? Math.round(Number(priceMin) * 100)
        : undefined,
    priceMaxCents:
      priceMax && Number.isFinite(Number(priceMax))
        ? Math.round(Number(priceMax) * 100)
        : undefined,
    sort: sort === "price_desc" ? "price_desc" : "price_asc",
  };
}

export default async function ServicesPage({ searchParams }: Props) {
  if (!(await isFeatureEnabled("services"))) {
    return (
      <FeatureUnavailable title="Services" moduleLabel="Services marketplace" />
    );
  }

  await markExpiredListings().catch(() => 0);

  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [categories, cities, counts, listings] = await Promise.all([
    listCategories(),
    listDistinctCities(),
    countLiveByCategory(),
    browseLiveListings(filters),
  ]);

  return (
    <>
      <PageHero
        title="Services marketplace"
        description="Find community providers across Canada. Browse is public — providers need a member account to list ($10 / $25 / $90 USD plans)."
        eyebrow="Community"
      />

      <section className="card">
        <p>
          <Link href="/members/services">List your service (members)</Link>
          {" · "}
          <Link href="/members/register">Register</Link>
        </p>

        <h2>Categories</h2>
        <div className="card-grid home-preview-grid">
          {counts.map((c) => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}`}
              className="card preview-card"
              style={{ textDecoration: "none" }}
            >
              <h3>{c.name}</h3>
              <p className="muted">
                {c.count} live listing{c.count === 1 ? "" : "s"}
              </p>
              <span className="text-link">View {c.name.toLowerCase()}s →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Search &amp; filter</h2>
        <Suspense fallback={<p className="muted">Loading filters…</p>}>
          <ServicesBrowseFilters categories={categories} cities={cities} />
        </Suspense>
      </section>

      <section className="section-block" aria-labelledby="svc-results">
        <div className="section-head">
          <h2 id="svc-results">
            Results ({listings.length}
            {filters.category ? ` in ${filters.category}` : ""})
          </h2>
        </div>
        {listings.length === 0 ? (
          <p className="muted">No live listings match your filters.</p>
        ) : (
          <div className="card-grid">
            {listings.map((l) => (
              <ServiceListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
