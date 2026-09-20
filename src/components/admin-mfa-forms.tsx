"use client";

import { useActionState, useState } from "react";
import {
  adminMfaChallengeAction,
  adminMfaConfirmAction,
  adminMfaDisableAction,
  adminMfaStartAction,
  type LoginState,
} from "@/modules/auth/actions";

const initial: LoginState = {};

export function AdminMfaChallengeForm() {
  const [state, action, pending] = useActionState(
    adminMfaChallengeAction,
    initial,
  );

  return (
    <form action={action} className="stack-form">
      <label>
        Authenticator code
        <input
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="123456"
        />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Verifying…" : "Verify and continue"}
      </button>
    </form>
  );
}

type SetupProps = { enabled: boolean };

export function AdminMfaSetupPanel({ enabled }: SetupProps) {
  const [setup, setSetup] = useState<{
    secret?: string;
    otpauthUrl?: string;
    message?: string;
    error?: string;
  }>({});
  const [confirmState, confirmAction, confirmPending] = useActionState(
    adminMfaConfirmAction,
    initial,
  );
  const [disableState, disableAction, disablePending] = useActionState(
    adminMfaDisableAction,
    initial,
  );
  const [starting, setStarting] = useState(false);

  async function startEnable() {
    setStarting(true);
    try {
      const result = await adminMfaStartAction();
      setSetup({
        secret: result.secret,
        otpauthUrl: result.otpauthUrl,
        message: result.message,
        error: result.error,
      });
    } finally {
      setStarting(false);
    }
  }

  if (enabled) {
    return (
      <div className="stack-form">
        <p className="form-success">MFA is enabled for this admin account.</p>
        {(disableState.message || confirmState.message) && (
          <p className="form-success">
            {disableState.message || confirmState.message}
          </p>
        )}
        {disableState.error ? (
          <p className="form-error">{disableState.error}</p>
        ) : null}
        <form action={disableAction} className="stack-form">
          <label>
            Code to disable MFA
            <input
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
            />
          </label>
          <button type="submit" className="btn-secondary" disabled={disablePending}>
            {disablePending ? "Disabling…" : "Disable MFA"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="stack-form">
      <p className="muted">
        Protect admin login with a TOTP authenticator (Google Authenticator,
        1Password, etc.).
      </p>
      {!setup.secret ? (
        <button
          type="button"
          className="btn-primary"
          disabled={starting}
          onClick={() => void startEnable()}
        >
          {starting ? "Generating…" : "Enable MFA"}
        </button>
      ) : (
        <>
          <p className="form-hint">
            Add this account in your authenticator app using the otpauth URL
            (or enter the secret manually):
          </p>
          <p>
            <code style={{ wordBreak: "break-all" }}>{setup.otpauthUrl}</code>
          </p>
          <p className="form-hint">
            Secret: <code>{setup.secret}</code>
          </p>
          <form action={confirmAction} className="stack-form">
            <label>
              Confirm with a 6-digit code
              <input
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
            </label>
            {confirmState.error ? (
              <p className="form-error">{confirmState.error}</p>
            ) : null}
            {confirmState.ok ? (
              <p className="form-success">{confirmState.message}</p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={confirmPending}>
              {confirmPending ? "Confirming…" : "Confirm and enable"}
            </button>
          </form>
        </>
      )}
      {setup.error ? <p className="form-error">{setup.error}</p> : null}
    </div>
  );
}
