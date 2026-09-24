"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { ServiceCategoryRow } from "../types";

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

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      // Drop removed filter params if still in the URL
      for (const k of [
        "min_rating",
        "language",
        "min_experience",
        "availability",
        "verified",
        "lat",
        "lng",
        "q",
      ]) {
        next.delete(k);
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
      category: fixedCategory ? null : get("category") || null,
      city: get("city") || null,
      province: get("province") || null,
      price_min: get("price_min") || null,
      price_max: get("price_max") || null,
      sort: get("sort") || "price_asc",
    });
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
          Min price (CAD)
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
          Max price (CAD)
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
          Sort
          <select name="sort" defaultValue={sp.get("sort") ?? "price_asc"}>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button type="submit" className="btn-saffron" disabled={pending}>
          {pending ? "Filtering…" : "Apply filters"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            startTransition(() => router.push(pathname));
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
