"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import {
  memberRegisterAction,
  type AuthFormState,
} from "@/modules/auth/actions";

type Props = {
  siteKey: string | null;
  bypass: boolean;
};

const initial: AuthFormState = {};

export function MemberRegisterForm({ siteKey, bypass }: Props) {
  const [state, action, pending] = useActionState(memberRegisterAction, initial);

  if (state.ok) {
    return (
      <div className="stack-form">
        <p className="form-success">{state.message}</p>
        {state.sampleUrl ? (
          <p className="form-hint">
            <strong>Sample verification link</strong> (email stub — also logged
            to the server console / <code>notification_outbox</code>):
            <br />
            <a href={state.sampleUrl}>{state.sampleUrl}</a>
          </p>
        ) : null}
        <p>
          <Link className="btn-primary" href="/members">
            Continue to member area
          </Link>
        </p>
      </div>
    );
  }

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
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label>
        Confirm password
        <input
          name="password_confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <TurnstileWidget siteKey={siteKey} bypass={bypass} />
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="form-hint">
        Already registered? <Link href="/members/login">Sign in</Link>
      </p>
    </form>
  );
}
