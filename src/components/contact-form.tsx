"use client";

import { useActionState } from "react";
import {
  submitContactAction,
  type ContactState,
} from "@/modules/admin/contact-actions";
import { TurnstileWidget } from "./turnstile-widget";

type Props = {
  siteKey: string | null;
  bypass: boolean;
};

const initial: ContactState = {};

export function ContactForm({ siteKey, bypass }: Props) {
  const [state, action, pending] = useActionState(submitContactAction, initial);

  return (
    <form action={action} className="stack-form">
      <label>
        Name
        <input name="name" type="text" required autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Message
        <textarea name="message" rows={5} required />
      </label>
      <TurnstileWidget siteKey={siteKey} bypass={bypass} />
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
