"use client";

import { useActionState } from "react";
import {
  saveOfficialAction,
  saveOfficialCategoryAction,
} from "@/modules/admin/actions";
import type { AdminFormState, OfficialRow } from "@/modules/admin/types";

const initial: AdminFormState = {};

type Props = {
  official?: OfficialRow | null;
  categories: string[];
};

export function OfficialForm({ official, categories }: Props) {
  const [state, action, pending] = useActionState(saveOfficialAction, initial);

  return (
    <form action={action} className="stack-form" encType="multipart/form-data">
      {official ? <input type="hidden" name="id" value={official.id} /> : null}
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}

      <label>
        Full name *
        <input
          name="full_name"
          required
          defaultValue={official?.full_name ?? ""}
        />
      </label>
      <label>
        Designation *
        <input
          name="designation"
          required
          defaultValue={official?.designation ?? ""}
        />
      </label>
      <label>
        Category *
        <input
          name="category"
          required
          list="official-category-list"
          defaultValue={official?.category ?? categories[0] ?? ""}
        />
        <datalist id="official-category-list">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label>
        Status *
        <select name="status" defaultValue={official?.status ?? "active"}>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="archived">archived</option>
        </select>
      </label>
      <label>
        Display order
        <input
          name="display_order"
          type="number"
          defaultValue={official?.display_order ?? 0}
        />
      </label>
      <label>
        Join date
        <input
          name="join_date"
          type="date"
          defaultValue={official?.join_date ?? ""}
        />
      </label>
      <label>
        Term start
        <input
          name="term_start"
          type="date"
          defaultValue={official?.term_start ?? ""}
        />
      </label>
      <label>
        Term end
        <input
          name="term_end"
          type="date"
          defaultValue={official?.term_end ?? ""}
        />
      </label>
      <label>
        Tenure label (archived)
        <input
          name="tenure_label"
          placeholder="2022–2025"
          defaultValue={official?.tenure_label ?? ""}
        />
      </label>
      <label>
        Short bio
        <textarea
          name="short_bio"
          rows={3}
          defaultValue={official?.short_bio ?? ""}
        />
      </label>
      <label>
        Public social link
        <input
          name="social_url"
          type="url"
          placeholder="https://"
          defaultValue={official?.social_url ?? ""}
        />
      </label>
      <label>
        Photo URL
        <input
          name="photo_url"
          type="url"
          placeholder="https://"
          defaultValue={official?.photo_url ?? ""}
        />
      </label>
      <label>
        Photo R2 key stub
        <input
          name="photo_key"
          placeholder="officials/…"
          defaultValue={official?.photo_key ?? ""}
        />
      </label>
      <label>
        Upload photo (JPEG/PNG/WebP/GIF ≤ 2 MB)
        <input name="photo_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
      </label>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : official ? "Update official" : "Add official"}
      </button>
    </form>
  );
}

export function OfficialCategoryForm() {
  const [state, action, pending] = useActionState(
    saveOfficialCategoryAction,
    initial,
  );
  return (
    <form action={action} className="stack-form inline-admin-form">
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      <label>
        New category name
        <input name="name" required placeholder="e.g. Advisors" />
      </label>
      <label>
        Display order
        <input name="display_order" type="number" defaultValue={10} />
      </label>
      <button type="submit" className="btn-secondary" disabled={pending}>
        {pending ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
