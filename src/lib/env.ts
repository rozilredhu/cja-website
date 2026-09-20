import { getEnv } from "./db";

export type PublicEnv = {
  turnstileSiteKey: string | null;
  turnstileConfigured: boolean;
  turnstileBypass: boolean;
};

/**
 * Resolve Turnstile-related flags.
 * Bypass when keys missing or TURNSTILE_BYPASS=true (local/dev only).
 */
export async function getTurnstilePublicConfig(): Promise<PublicEnv> {
  const env = await getEnv().catch(() => null);
  const siteKey =
    env?.TURNSTILE_SITE_KEY ||
    process.env.TURNSTILE_SITE_KEY ||
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    "";
  const secret =
    env?.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY || "";
  const bypassFlag =
    env?.TURNSTILE_BYPASS === "true" ||
    process.env.TURNSTILE_BYPASS === "true";
  const configured = Boolean(siteKey && secret);
  return {
    turnstileSiteKey: siteKey || null,
    turnstileConfigured: configured,
    turnstileBypass: bypassFlag || !configured,
  };
}

export async function getTurnstileSecret(): Promise<string | null> {
  const env = await getEnv().catch(() => null);
  return (
    env?.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY || null
  );
}
