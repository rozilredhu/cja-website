"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  LANGUAGE_SUGGESTIONS,
  SERVICE_AVAILABILITY_OPTIONS,
  type ServiceCategoryRow,
} from "../types";

type Props = {
  categories: ServiceCategoryRow[];
  cities: string[];
  /** When set, category select is locked / hidden (category page). */
  fixedCategory?: string;
};

export function ServicesBrowseFilters({
  categories,
  cities,
  fixedCategory,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router, sp],
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    push({
      q: get("q") || null,
      category: fixedCategory ? null : get("category") || null,
      city: get("city") || null,
      province: get("province") || null,
      price_min: get("price_min") || null,
      price_max: get("price_max") || null,
      min_rating: get("min_rating") || null,
      availability: get("availability") || null,
      language: get("language") || null,
      min_experience: get("min_experience") || null,
      verified: fd.get("verified") ? "1" : null,
      sort: get("sort") || null,
      // keep lat/lng if already set
      lat: sp.get("lat"),
      lng: sp.get("lng"),
    });
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setGeoMsg("Geolocation not supported in this browser.");
      return;
    }
    setGeoMsg("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoMsg("Location set — sorting by distance.");
        push({
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
          sort: "distance",
        });
      },
      () => setGeoMsg("Location permission denied or unavailable."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  return (
    <form className="stack-form" onSubmit={onSubmit}>
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        }}
      >
        <label>
          Search
          <input
            name="q"
            type="search"
            placeholder="e.g. plumber, Punjabi…"
            defaultValue={sp.get("q") ?? ""}
          />
        </label>

        {!fixedCategory ? (
          <label>
            Category
            <select name="category" defaultValue={sp.get("category") ?? ""}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label>
          City / area
          <input
            name="city"
            type="text"
            list="svc-cities"
            placeholder="Mississauga, Calgary…"
            defaultValue={sp.get("city") ?? ""}
          />
          <datalist id="svc-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label>
          Province
          <input
            name="province"
            type="text"
            maxLength={2}
            placeholder="ON"
            defaultValue={sp.get("province") ?? ""}
          />
        </label>

        <label>
          Min price (USD)
          <input
            name="price_min"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            defaultValue={sp.get("price_min") ?? ""}
          />
        </label>

        <label>
          Max price (USD)
          <input
            name="price_max"
            type="number"
            min={0}
            step={1}
            placeholder="200"
            defaultValue={sp.get("price_max") ?? ""}
          />
        </label>

        <label>
          Min rating
          <select name="min_rating" defaultValue={sp.get("min_rating") ?? ""}>
            <option value="">Any</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>

        <label>
          Availability
          <select
            name="availability"
            defaultValue={sp.get("availability") ?? ""}
          >
            <option value="">Any</option>
            {SERVICE_AVAILABILITY_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Language
          <input
            name="language"
            type="text"
            list="svc-langs"
            placeholder="Punjabi"
            defaultValue={sp.get("language") ?? ""}
          />
          <datalist id="svc-langs">
            {LANGUAGE_SUGGESTIONS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </label>

        <label>
          Min years experience
          <input
            name="min_experience"
            type="number"
            min={0}
            defaultValue={sp.get("min_experience") ?? ""}
          />
        </label>

        <label>
          Sort
          <select name="sort" defaultValue={sp.get("sort") ?? "rating"}>
            <option value="rating">Highest rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="experience">Most experience</option>
            <option value="distance">Distance (needs location)</option>
            <option value="relevance">Relevance</option>
          </select>
        </label>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          name="verified"
          defaultChecked={sp.get("verified") === "1"}
        />
        Verified / licensed only
      </label>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button type="submit" className="btn-saffron" disabled={pending}>
          {pending ? "Filtering…" : "Apply filters"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={requestLocation}
        >
          Use my location
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setGeoMsg(null);
            startTransition(() => router.push(pathname));
          }}
        >
          Clear
        </button>
      </div>
      {geoMsg ? <p className="muted">{geoMsg}</p> : null}
      {sp.get("lat") && sp.get("lng") ? (
        <p className="stub-note">
          Distance sort uses your browser location (
          {Number(sp.get("lat")).toFixed(3)}, {Number(sp.get("lng")).toFixed(3)}
          ). Listings without coordinates sort last.
        </p>
      ) : null}
    </form>
  );
}
