"use server";

import { verifyTurnstile } from "@/modules/turnstile/verify";

export type ContactState = {
  error?: string;
  success?: string;
};

/**
 * Stub contact handler — verifies Turnstile, does not persist yet
 * (public CMS / inbox comes in later modules).
 */
export async function submitContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const token = String(formData.get("cf-turnstile-response") ?? "");

  if (!name || !email || !message) {
    return { error: "Please fill in name, email, and message." };
  }

  const turnstile = await verifyTurnstile(token);
  if (!turnstile.ok) {
    return { error: turnstile.error };
  }

  // Intentionally not stored yet — Phase 1 public CMS / inbox later.
  return {
    success:
      "Thanks — your message was validated. (Sample stub: not emailed or stored yet.)",
  };
}

export async function submitVolunteerAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const token = String(formData.get("cf-turnstile-response") ?? "");

  if (!name || !email || !interest) {
    return { error: "Please fill in all fields." };
  }

  const turnstile = await verifyTurnstile(token);
  if (!turnstile.ok) {
    return { error: turnstile.error };
  }

  return {
    success:
      "Thanks for your interest in volunteering. (Sample stub: not stored yet.)",
  };
}
