"use client";

import { useActionState } from "react";
import {
  submitVolunteerAction,
  type ContactState,
} from "@/modules/admin/contact-actions";
import { TurnstileWidget } from "./turnstile-widget";

type Props = {
  siteKey: string | null;
  bypass: boolean;
};

const initial: ContactState = {};

export function VolunteerForm({ siteKey, bypass }: Props) {
  const [state, action, pending] = useActionState(
    submitVolunteerAction,
    initial,
  );

  return (
    <form action={action} className="stack-form">
      <label>
        Full name
        <input name="name" type="text" required autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        How can you help CJA? (what kind of volunteering can you provide)
        <textarea name="interest" rows={5} required />
      </label>
      <TurnstileWidget siteKey={siteKey} bypass={bypass} />
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Submitting…" : "Submit interest"}
      </button>
    </form>
  );
}
