"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import {
  requestPasswordResetAction,
  type AuthFormState,
} from "@/modules/auth/actions";

type Props = {
  siteKey: string | null;
  bypass: boolean;
};

const initial: AuthFormState = {};

export function ForgotPasswordForm({ siteKey, bypass }: Props) {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initial,
  );

  return (
    <form action={action} className="stack-form">
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <TurnstileWidget siteKey={siteKey} bypass={bypass} />
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-success">{state.message}</p> : null}
      {state.sampleUrl ? (
        <p className="form-hint">
          <strong>Sample reset link</strong> (email stub):
          <br />
          <a href={state.sampleUrl}>{state.sampleUrl}</a>
        </p>
      ) : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Submitting…" : "Send reset link"}
      </button>
      <p className="form-hint">
        <Link href="/members/login">Back to sign in</Link>
      </p>
    </form>
  );
}
