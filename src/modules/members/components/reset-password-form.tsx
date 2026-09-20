"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resetPasswordAction,
  type AuthFormState,
} from "@/modules/auth/actions";

type Props = { token: string };

const initial: AuthFormState = {};

export function ResetPasswordForm({ token }: Props) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  if (state.ok) {
    return (
      <div className="stack-form">
        <p className="form-success">{state.message}</p>
        <p>
          <Link className="btn-primary" href="/members/login">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="stack-form">
      <input type="hidden" name="token" value={token} />
      <label>
        New password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label>
        Confirm new password
        <input
          name="password_confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
