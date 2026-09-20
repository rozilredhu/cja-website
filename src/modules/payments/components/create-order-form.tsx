"use client";

import { useActionState } from "react";
import {
  createPromotionOrderAction,
} from "../actions";
import {
  formatCadCents,
  type PromotionPackage,
} from "../packages";
import type { PromotionFormState } from "../types";

type TargetOption = { id: number; label: string };

export function CreateOrderForm({
  packages,
  profileTargets,
  businessTargets,
}: {
  packages: PromotionPackage[];
  profileTargets: TargetOption[];
  businessTargets: TargetOption[];
}) {
  const [state, action, pending] = useActionState(
    createPromotionOrderAction,
    {} as PromotionFormState,
  );

  const profilePkgs = packages.filter(
    (p) => p.targetType === "directory_profile",
  );
  const businessPkgs = packages.filter(
    (p) => p.targetType === "business_listing",
  );

  return (
    <div className="promo-create">
      {state.error ? <p className="form-error">{state.error}</p> : null}

      {profilePkgs.length > 0 ? (
        <form action={action} className="promo-package-form">
          <h3>Promote your directory profile</h3>
          {profileTargets.length === 0 ? (
            <p className="muted">
              Opt in on your directory profile before purchasing a highlight.
            </p>
          ) : (
            <>
              <label>
                Package
                <select name="package_code" required defaultValue={profilePkgs[0]?.code}>
                  {profilePkgs.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} — {formatCadCents(p.amountCadCents)} / {p.durationDays} days
                    </option>
                  ))}
                </select>
              </label>
              <input type="hidden" name="target_type" value="directory_profile" />
              <label>
                Profile
                <select name="target_id" required>
                  {profileTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="form-hint">
                CAD only. Stub checkout — no card numbers collected.
              </p>
              <button type="submit" className="btn-saffron" disabled={pending}>
                {pending ? "Creating…" : "Continue to checkout"}
              </button>
            </>
          )}
        </form>
      ) : null}

      {businessPkgs.length > 0 ? (
        <form action={action} className="promo-package-form">
          <h3>Promote a business listing</h3>
          {businessTargets.length === 0 ? (
            <p className="muted">
              Add and opt in a business listing before purchasing a highlight.
            </p>
          ) : (
            <>
              <label>
                Package
                <select name="package_code" required defaultValue={businessPkgs[0]?.code}>
                  {businessPkgs.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} — {formatCadCents(p.amountCadCents)} / {p.durationDays} days
                    </option>
                  ))}
                </select>
              </label>
              <input type="hidden" name="target_type" value="business_listing" />
              <label>
                Business
                <select name="target_id" required>
                  {businessTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="form-hint">
                CAD only. Stub checkout — no card numbers collected.
              </p>
              <button type="submit" className="btn-saffron" disabled={pending}>
                {pending ? "Creating…" : "Continue to checkout"}
              </button>
            </>
          )}
        </form>
      ) : null}
    </div>
  );
}
