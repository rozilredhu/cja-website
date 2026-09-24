"use client";

import { useActionState } from "react";
import { saveServiceListingAction } from "../actions";
import { SERVICE_PLANS, formatUsdCents } from "../pricing";
import {
  CA_PROVINCES,
  SERVICE_AVAILABILITY_OPTIONS,
  type ServiceCategoryRow,
  type ServiceFormState,
  type ServiceListingRow,
} from "../types";

type Props = {
  categories: ServiceCategoryRow[];
  initial?: ServiceListingRow | null;
};

const empty: ServiceFormState = {};

export function ServiceListingForm({ categories, initial }: Props) {
  const [state, action, pending] = useActionState(
    saveServiceListingAction,
    empty,
  );

  const lockedPlan =
    initial &&
    (initial.status === "live" || initial.status === "pending_approval");

  return (
    <form action={action} className="stack-form">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-success">{state.message}</p> : null}

      <label>
        Category
        <select
          name="category_slug"
          required
          defaultValue={initial?.category_slug ?? ""}
        >
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Business name
        <input
          name="business_name"
          type="text"
          required
          defaultValue={initial?.business_name ?? ""}
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
        />
      </label>

      <label>
        Contact phone
        <input
          name="contact_phone"
          type="tel"
          defaultValue={initial?.contact_phone ?? ""}
        />
      </label>

      <label>
        Contact email
        <input
          name="contact_email"
          type="email"
          defaultValue={initial?.contact_email ?? ""}
        />
      </label>

      <label>
        City
        <input name="city" type="text" required defaultValue={initial?.city ?? ""} />
      </label>

      <label>
        Province
        <select name="province" required defaultValue={initial?.province ?? ""}>
          <option value="">—</option>
          {CA_PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.code} — {p.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Service price (USD, whole dollars — optional)
        <input
          name="price_cents"
          type="number"
          min={0}
          step={1}
          placeholder="e.g. 95 for $95"
          defaultValue={
            initial?.price_cents != null
              ? String(Math.round(initial.price_cents / 100))
              : ""
          }
          onBlur={(e) => {
            // Store as cents via hidden conversion in action — send dollars * 100
            const dollars = Number(e.target.value);
            if (Number.isFinite(dollars) && e.target.value !== "") {
              e.target.value = String(Math.round(dollars));
            }
          }}
        />
      </label>
      <p className="muted" style={{ marginTop: "-0.5rem" }}>
        Enter dollars (e.g. 95). Stored as cents server-side.
      </p>

      <label>
        Price range label (optional)
        <input
          name="price_range"
          type="text"
          placeholder="$80–$120/hr"
          defaultValue={initial?.price_range ?? ""}
        />
      </label>

      <label>
        Availability
        <select
          name="availability"
          defaultValue={initial?.availability ?? "weekdays"}
        >
          {SERVICE_AVAILABILITY_OPTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Years of experience
        <input
          name="years_experience"
          type="number"
          min={0}
          defaultValue={initial?.years_experience ?? 0}
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          name="verified_licensed"
          defaultChecked={Boolean(initial?.verified_licensed)}
        />
        I am verified / licensed in my trade
      </label>

      <label>
        Latitude (optional)
        <input
          name="lat"
          type="number"
          step="any"
          defaultValue={initial?.lat ?? ""}
        />
      </label>
      <label>
        Longitude (optional)
        <input
          name="lng"
          type="number"
          step="any"
          defaultValue={initial?.lng ?? ""}
        />
      </label>

      {!lockedPlan ? (
        <fieldset>
          <legend>Listing plan (USD one-time)</legend>
          <p className="muted">
            Payment moves your listing to <strong>pending approval</strong>. It
            goes live only after an admin approves (within 24h target). Duration
            starts at approval.
          </p>
          {SERVICE_PLANS.map((p) => (
            <label key={p.tier} className="checkbox-row">
              <input
                type="radio"
                name="plan_tier"
                value={p.tier}
                required={!initial}
                defaultChecked={
                  (initial?.plan_tier ?? "monthly") === p.tier
                }
              />
              <span>
                <strong>{p.name}</strong> — {formatUsdCents(p.amountUsdCents)}{" "}
                / {p.durationDays} days after approval
                <br />
                <span className="muted">{p.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="stub-note">
          Plan locked while status is <strong>{initial?.status}</strong> (
          {initial?.plan_tier}, {initial?.duration_days} days). Renew after
          expiry with a new payment.
        </p>
      )}

      <button type="submit" className="btn-saffron" disabled={pending}>
        {pending
          ? "Saving…"
          : lockedPlan
            ? "Update listing details"
            : "Save & continue to payment"}
      </button>
    </form>
  );
}
