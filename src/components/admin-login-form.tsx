"use client";

import { useActionState } from "react";
import {
  adminLoginAction,
  type LoginState,
} from "@/modules/auth/actions";

const initial: LoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, initial);

  return (
    <form action={action} className="stack-form admin-login-form">
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue="admin@example.com"
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
    </form>
  );
}
