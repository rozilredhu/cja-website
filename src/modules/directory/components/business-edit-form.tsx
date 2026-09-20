"use client";

import { useActionState } from "react";
import { saveBusinessListingAction } from "../actions";
import { CA_PROVINCES, type DirectoryFormState } from "../types";

type BizFields = {
  id?: number;
  name: string;
  description: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website: string;
  address_line: string;
  photo_url: string;
  opted_in: boolean;
};

type Props = {
  initial?: BizFields;
  mediaReady: boolean;
};

const empty: DirectoryFormState = {};

export function BusinessEditForm({ initial, mediaReady }: Props) {
  const [state, action, pending] = useActionState(
    saveBusinessListingAction,
    empty,
  );

  const i = initial ?? {
    name: "",
    description: "",
    city: "",
    province: "",
    phone: "",
    email: "",
    website: "",
    address_line: "",
    photo_url: "",
    opted_in: true,
  };

  return (
    <form action={action} className="stack-form" encType="multipart/form-data">
      {i.id ? <input type="hidden" name="id" value={i.id} /> : null}

      <label className="checkbox-row">
        <input type="checkbox" name="opted_in" defaultChecked={i.opted_in} />
        List this business in the members-only directory
      </label>

      <label>
        Business name
        <input name="name" type="text" required defaultValue={i.name} />
      </label>

      <label>
        Description
        <textarea name="description" rows={3} defaultValue={i.description} />
      </label>

      <label>
        City
        <input name="city" type="text" defaultValue={i.city} />
      </label>

      <label>
        Province
        <select name="province" defaultValue={i.province}>
          <option value="">—</option>
          {CA_PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.code} — {p.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Phone
        <input name="phone" type="tel" defaultValue={i.phone} />
      </label>

      <label>
        Email
        <input name="email" type="email" defaultValue={i.email} />
      </label>

      <label>
        Website
        <input name="website" type="url" defaultValue={i.website} />
      </label>

      <label>
        Address
        <input name="address_line" type="text" defaultValue={i.address_line} />
      </label>

      <label>
        Photo URL (placeholder)
        <input
          name="photo_url"
          type="url"
          placeholder="https://…"
          defaultValue={i.photo_url}
        />
      </label>
      {mediaReady ? (
        <label>
          Or upload photo (R2 MEDIA)
          <input name="photo" type="file" accept="image/*" />
        </label>
      ) : (
        <p className="form-hint stub-note">
          R2 not configured — photo URL only for now.
        </p>
      )}

      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-success">{state.message}</p> : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : i.id ? "Update business" : "Add business"}
      </button>
    </form>
  );
}
