"use client";

import { useActionState } from "react";
import { sendMatrimonialContactAction } from "../actions";
import type { MatrimonialFormState } from "../types";

const empty: MatrimonialFormState = {};

export function MatrimonialContactForm({ profileId }: { profileId: number }) {
  const [state, action, pending] = useActionState(
    sendMatrimonialContactAction,
    empty,
  );

  return (
    <form action={action} className="stack-form">
      <input type="hidden" name="profile_id" value={profileId} />
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-ok">{state.message}</p> : null}
      <label>
        Subject
        <input
          name="subject"
          type="text"
          defaultValue="Matrimonial interest"
          maxLength={120}
        />
      </label>
      <label>
        Message
        <textarea name="body" rows={4} required minLength={10} maxLength={4000} />
      </label>
      <p className="form-hint">
        Phone and email are never shown on matrimonial cards. This message is
        stored in the database and emailed via the outbox stub.
      </p>
      <button type="submit" className="btn-saffron" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
