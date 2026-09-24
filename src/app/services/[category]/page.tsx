export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { isFeatureEnabled } from "@/modules/admin/feature-flags";
import { FeatureUnavailable } from "@/components/feature-unavailable";
import { ServiceListingCard } from "@/modules/services/components/listing-card";
import { ServicesBrowseFilters } from "@/modules/services/components/browse-filters";
import {
  browseLiveListings,
  getCategoryBySlug,
  listCategories,
  listDistinctCities,
  markExpiredListings,
} from "@/modules/services/queries";
import type {
  ServiceBrowseFilters,
  ServiceSort,
} from "@/modules/services/types";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  return {
    title: cat ? `${cat.name} services` : "Services",
    description: cat?.description ?? "Community service providers",
  };
}

export default async function ServiceCategoryPage({
  params,
  searchParams,
}: Props) {
  if (!(await isFeatureEnabled("services"))) {
    return (
      <FeatureUnavailable title="Services" moduleLabel="Services marketplace" />
    );
  }

  await markExpiredListings().catch(() => 0);

  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const sp = await searchParams;
  const priceMin = one(sp.price_min);
  const priceMax = one(sp.price_max);
  const sortRaw = one(sp.sort) as ServiceSort | undefined;

  const filters: ServiceBrowseFilters = {
    category: cat.slug,
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
    sort: sortRaw === "price_desc" ? "price_desc" : "price_asc",
  };

  const [categories, cities, listings] = await Promise.all([
    listCategories(),
    listDistinctCities(),
    browseLiveListings(filters),
  ]);

  return (
    <>
      <PageHero
        title={`${cat.name} services`}
        description={
          cat.description ??
          `Live ${cat.name.toLowerCase()} providers in the CJA community.`
        }
        eyebrow="Services"
      />

      <section className="card">
        <p>
          <Link href="/services">← All services</Link>
          {" · "}
          <Link href="/members/services">List your service</Link>
        </p>
        <Suspense fallback={<p className="muted">Loading filters…</p>}>
          <ServicesBrowseFilters
            categories={categories}
            cities={cities}
            fixedCategory={cat.slug}
          />
        </Suspense>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>
            {listings.length} live listing{listings.length === 1 ? "" : "s"}
          </h2>
        </div>
        {listings.length === 0 ? (
          <p className="muted">No live {cat.name.toLowerCase()} listings yet.</p>
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
