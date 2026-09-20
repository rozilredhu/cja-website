"use client";

import { useActionState } from "react";
import {
  resendVerificationAction,
  type AuthFormState,
} from "@/modules/auth/actions";

const initial: AuthFormState = {};

export function ResendVerificationForm() {
  const [state, action, pending] = useActionState(
    resendVerificationAction,
    initial,
  );

  return (
    <form action={action} className="stack-form" style={{ marginTop: "0.75rem" }}>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.ok ? <p className="form-success">{state.message}</p> : null}
      {state.sampleUrl ? (
        <p className="form-hint">
          <strong>Sample verification link:</strong>
          <br />
          <a href={state.sampleUrl}>{state.sampleUrl}</a>
        </p>
      ) : null}
      <button type="submit" className="btn-secondary" disabled={pending}>
        {pending ? "Sending…" : "Resend verification (stub)"}
      </button>
    </form>
  );
}
