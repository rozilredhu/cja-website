"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  memberLoginAction,
  type AuthFormState,
} from "@/modules/auth/actions";

const initial: AuthFormState = {};

export function MemberLoginForm() {
  const [state, action, pending] = useActionState(memberLoginAction, initial);

  return (
    <form action={action} className="stack-form">
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue="member@example.com"
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="form-hint">
        <Link href="/members/forgot-password">Forgot password?</Link>
        {" · "}
        <Link href="/members/register">Create an account</Link>
      </p>
    </form>
  );
}
