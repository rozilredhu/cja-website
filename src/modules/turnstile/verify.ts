import { getTurnstilePublicConfig, getTurnstileSecret } from "@/lib/env";

export type TurnstileResult =
  | { ok: true; bypassed?: boolean }
  | { ok: false; error: string };

/**
 * Verify a Cloudflare Turnstile token server-side.
 * When keys are missing or TURNSTILE_BYPASS=true, accepts with bypassed=true.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const cfg = await getTurnstilePublicConfig();

  if (cfg.turnstileBypass) {
    return { ok: true, bypassed: true };
  }

  if (!token) {
    return { ok: false, error: "Missing bot-protection token. Please try again." };
  }

  const secret = await getTurnstileSecret();
  if (!secret) {
    return { ok: false, error: "Turnstile is not configured on the server." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      return {
        ok: false,
        error: `Turnstile verification failed${
          data["error-codes"]?.length
            ? `: ${data["error-codes"].join(", ")}`
            : "."
        }`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach Turnstile verification service." };
  }
}
