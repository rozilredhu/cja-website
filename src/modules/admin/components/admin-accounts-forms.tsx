"use client";

import { useActionState } from "react";
import {
  createAdminAccountAction,
  resetAdminPasswordAction,
  type CreateAdminResult,
  type ResetAdminPasswordResult,
} from "@/modules/admin/admin-users";

const createInitial: CreateAdminResult = {};
const resetInitial: ResetAdminPasswordResult = {};

export function CreateAdminForm() {
  const [state, action, pending] = useActionState(
    createAdminAccountAction,
    createInitial,
  );

  return (
    <form action={action} className="stack-form">
      <h2>Create admin account</h2>
      <label>
        Email
        <input name="email" type="email" required autoComplete="off" />
      </label>
      <label>
        Name
        <input name="name" type="text" autoComplete="off" />
      </label>
      <label>
        Role
        <select name="role" defaultValue="admin">
          <option value="admin">Admin (limited)</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </label>
      <label>
        Password (optional — leave blank to auto-generate)
        <input
          name="password"
          type="text"
          autoComplete="new-password"
          minLength={10}
          placeholder="Auto-generate if empty"
        />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? (
        <div className="form-success">
          <p>{state.success}</p>
          {state.tempPassword ? (
            <p>
              <strong>{state.email}</strong> temporary password:{" "}
              <code className="admin-code">{state.tempPassword}</code>
              <br />
              <span className="muted">Copy now — it will not be shown again.</span>
            </p>
          ) : null}
        </div>
      ) : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}

export function ResetAdminPasswordForm({
  adminId,
  email,
}: {
  adminId: number;
  email: string;
}) {
  const [state, action, pending] = useActionState(
    resetAdminPasswordAction,
    resetInitial,
  );

  return (
    <form action={action} className="inline-admin-form">
      <input type="hidden" name="id" value={adminId} />
      <input type="hidden" name="generate_password" value="1" />
      <button type="submit" className="btn-secondary btn-small" disabled={pending}>
        {pending ? "Resetting…" : "Reset password"}
      </button>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.tempPassword ? (
        <p className="form-success" style={{ marginTop: "0.35rem" }}>
          New temp password for <strong>{email}</strong>:{" "}
          <code className="admin-code">{state.tempPassword}</code>
        </p>
      ) : null}
    </form>
  );
}
