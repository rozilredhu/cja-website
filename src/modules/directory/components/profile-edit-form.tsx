"use client";

import { useActionState } from "react";
import { saveDirectoryProfileAction } from "../actions";
import { CA_PROVINCES, type DirectoryFormState } from "../types";

type ProfileFields = {
  display_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  education: string;
  bio: string;
  photo_url: string;
  opted_in: boolean;
  show_phone: boolean;
  show_address: boolean;
  show_photo: boolean;
  show_education: boolean;
  photo_key: string | null;
};

type Props = {
  initial: ProfileFields;
  mediaReady: boolean;
};

const empty: DirectoryFormState = {};

export function ProfileEditForm({ initial, mediaReady }: Props) {
  const [state, action, pending] = useActionState(
    saveDirectoryProfileAction,
    empty,
  );

  return (
    <form action={action} className="stack-form" encType="multipart/form-data">
      <label className="checkbox-row">
        <input
          type="checkbox"
          name="opted_in"
          defaultChecked={initial.opted_in}
        />
        Opt in to the member directory (visible to logged-in members)
      </label>

      <label>
        Display name
        <input
          name="display_name"
          type="text"
          required
          defaultValue={initial.display_name}
        />
      </label>

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
        <input
          name="education"
          type="text"
          defaultValue={initial.education}
        />
      </label>

      <label>
        Bio / notes
        <textarea name="bio" rows={3} defaultValue={initial.bio} />
      </label>

      <label>
        Phone
        <input name="phone" type="tel" defaultValue={initial.phone} />
      </label>

      <label>
        Address
        <input
          name="address_line"
          type="text"
          defaultValue={initial.address_line}
        />
      </label>

      <fieldset className="directory-visibility">
        <legend>Visibility of optional fields</legend>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="show_phone"
            defaultChecked={initial.show_phone}
          />
          Show phone (only to peers who also opted in)
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="show_address"
            defaultChecked={initial.show_address}
          />
          Show address (only to peers who also opted in)
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="show_education"
            defaultChecked={initial.show_education}
          />
          Show education
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="show_photo"
            defaultChecked={initial.show_photo}
          />
          Show photo
        </label>
      </fieldset>

      <label>
        Photo URL (placeholder)
        <input
          name="photo_url"
          type="url"
          placeholder="https://…"
          defaultValue={initial.photo_url}
        />
      </label>
      {mediaReady ? (
        <label>
          Or upload photo (R2 MEDIA)
          <input name="photo" type="file" accept="image/*" />
        </label>
      ) : (
        <p className="form-hint stub-note">
          R2 <code>MEDIA</code> binding is not configured — use a photo URL, or
          leave blank. Schema supports <code>photo_key</code> when R2 is enabled.
          {initial.photo_key ? (
            <>
              {" "}
              Current key: <code>{initial.photo_key}</code>
            </>
          ) : null}
        </p>
      )}

      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-success">{state.message}</p> : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save directory profile"}
      </button>
    </form>
  );
}
