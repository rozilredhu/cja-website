"use client";

import { useActionState } from "react";
import {
  blockMatrimonialUserAction,
  reportMatrimonialProfileAction,
} from "../actions";
import type { MatrimonialFormState } from "../types";

const empty: MatrimonialFormState = {};

export function ReportMatrimonialForm({ profileId }: { profileId: number }) {
  const [state, action, pending] = useActionState(
    reportMatrimonialProfileAction,
    empty,
  );

  return (
    <form action={action} className="stack-form">
      <input type="hidden" name="profile_id" value={profileId} />
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-ok">{state.message}</p> : null}
      <label>
        Reason
        <select name="reason" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          <option value="spam">Spam / fake</option>
          <option value="harassment">Harassment</option>
          <option value="inappropriate">Inappropriate content</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        Details (optional)
        <textarea name="details" rows={2} maxLength={2000} />
      </label>
      <button type="submit" className="btn-secondary" disabled={pending}>
        {pending ? "Reporting…" : "Report profile"}
      </button>
    </form>
  );
}

export function BlockMatrimonialButton({
  blockedUserId,
}: {
  blockedUserId: number;
}) {
  return (
    <form action={blockMatrimonialUserAction}>
      <input type="hidden" name="blocked_user_id" value={blockedUserId} />
      <button type="submit" className="btn-secondary btn-small">
        Block member
      </button>
    </form>
  );
}
