"use client";

import { useActionState } from "react";
import { saveMatrimonialProfileAction } from "../actions";
import {
  CA_PROVINCES,
  DIET_OPTIONS,
  MARITAL_STATUSES,
  type MatrimonialFormState,
  type MatrimonialGender,
} from "../types";
import { cmToFtIn } from "../utils";

type ProfileFields = {
  gender: MatrimonialGender | "";
  date_of_birth: string;
  height_cm: number | null;
  marital_status: string;
  city: string;
  province: string;
  education: string;
  occupation: string;
  gotra: string;
  mother_gotra: string;
  native_place: string;
  mother_tongue: string;
  diet: string;
  willing_to_relocate: boolean;
  partner_preferences: string;
  short_bio: string;
  photo_url: string;
  photo_key: string | null;
  status: string | null;
};

type Props = {
  initial: ProfileFields;
  mediaReady: boolean;
};

const empty: MatrimonialFormState = {};

export function MatrimonialProfileEditForm({ initial, mediaReady }: Props) {
  const [state, action, pending] = useActionState(
    saveMatrimonialProfileAction,
    empty,
  );
  const ht =
    initial.height_cm != null ? cmToFtIn(initial.height_cm) : { feet: 5, inches: 6 };

  return (
    <form action={action} className="stack-form" encType="multipart/form-data">
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-ok">{state.message}</p> : null}

      {initial.status ? (
        <p className="stub-note">
          Current status: <strong>{initial.status}</strong>
          {initial.status === "pending"
            ? " — waiting for admin review (overdue if pending > 24 hours)."
            : null}
          {initial.status === "approved"
            ? " — edits will resubmit for review."
            : null}
        </p>
      ) : null}

      <fieldset>
        <legend>Basics</legend>
        <label>
          Gender
          <select name="gender" required defaultValue={initial.gender}>
            <option value="">—</option>
            <option value="man">Man</option>
            <option value="woman">Woman</option>
          </select>
        </label>
        <label>
          Date of birth
          <input
            name="date_of_birth"
            type="date"
            required
            defaultValue={initial.date_of_birth}
          />
          <span className="form-hint">
            We store DOB and display age only — never type your age.
          </span>
        </label>
        <div className="height-row">
          <label>
            Height (ft)
            <input
              name="height_ft"
              type="number"
              min={3}
              max={8}
              defaultValue={ht.feet}
            />
          </label>
          <label>
            Height (in)
            <input
              name="height_in"
              type="number"
              min={0}
              max={11}
              defaultValue={ht.inches}
            />
          </label>
        </div>
        <p className="form-hint">
          Converted to centimetres for storage
          {initial.height_cm != null ? ` (currently ${initial.height_cm} cm)` : ""}.
        </p>
        <label>
          Marital status
          <select name="marital_status" defaultValue={initial.marital_status}>
            <option value="">—</option>
            {MARITAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Location &amp; work</legend>
        <label>
          City
          <input name="city" type="text" defaultValue={initial.city} />
        </label>
        <label>
          Province
          <select name="province" defaultValue={initial.province}>
            <option value="">—</option>
            {CA_PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Education
          <input name="education" type="text" defaultValue={initial.education} />
        </label>
        <label>
          Occupation
          <input
            name="occupation"
            type="text"
            defaultValue={initial.occupation}
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="willing_to_relocate"
            defaultChecked={initial.willing_to_relocate}
          />
          Willing to relocate
        </label>
      </fieldset>

      <fieldset>
        <legend>Cultural</legend>
        <label>
          Gotra
          <input name="gotra" type="text" defaultValue={initial.gotra} />
        </label>
        <label>
          Mother&apos;s gotra
          <input
            name="mother_gotra"
            type="text"
            defaultValue={initial.mother_gotra}
          />
        </label>
        <label>
          Native place
          <input
            name="native_place"
            type="text"
            defaultValue={initial.native_place}
          />
        </label>
        <label>
          Mother tongue
          <input
            name="mother_tongue"
            type="text"
            defaultValue={initial.mother_tongue}
          />
        </label>
        <label>
          Diet
          <select name="diet" defaultValue={initial.diet}>
            <option value="">—</option>
            {DIET_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>About</legend>
        <label>
          Partner preferences
          <textarea
            name="partner_preferences"
            rows={3}
            defaultValue={initial.partner_preferences}
          />
        </label>
        <label>
          Short bio
          <textarea name="short_bio" rows={3} defaultValue={initial.short_bio} />
        </label>
        <label>
          Profile photo URL (stub / optional)
          <input
            name="photo_url"
            type="url"
            placeholder="https://…"
            defaultValue={initial.photo_url}
          />
        </label>
        {mediaReady ? (
          <label>
            Or upload photo (R2, max 2 MB)
            <input name="photo" type="file" accept="image/*" />
          </label>
        ) : (
          <p className="form-hint">
            R2 media binding not available locally — use a photo URL stub.
            {initial.photo_key ? ` Existing key: ${initial.photo_key}` : ""}
          </p>
        )}
      </fieldset>

      <p className="stub-note">
        We do <strong>not</strong> collect exact home address, income, or full
        family names. Phone and email never appear on matrimonial cards — contact
        is via the platform message form only.
      </p>

      <button type="submit" className="btn-saffron" disabled={pending}>
        {pending ? "Saving…" : "Save & submit for review"}
      </button>
    </form>
  );
}
