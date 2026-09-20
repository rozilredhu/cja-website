/**
 * Email stub for Phase 1C.
 * Writes to notification_outbox and console.log — no real SMTP.
 * Later: drain outbox with Resend or Cloudflare Email Routing / Mailchannels.
 */

import { getDb } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export type OutboundEmail = {
  to: string;
  subject: string;
  body: string;
  meta?: Record<string, unknown>;
};

export async function enqueueEmailStub(
  mail: OutboundEmail,
): Promise<{ outboxId: number | null; stubbed: true }> {
  const meta = mail.meta ? JSON.stringify(mail.meta) : null;
  console.info(
    "[cja-email-stub]",
    JSON.stringify({
      to: mail.to,
      subject: mail.subject,
      body: mail.body,
      meta: mail.meta ?? null,
    }),
  );

  try {
    const db = await getDb();
    const result = await db
      .prepare(
        `INSERT INTO notification_outbox
           (channel, to_address, subject, body, meta_json, status, sent_at)
         VALUES ('email', ?, ?, ?, ?, 'stubbed', datetime('now'))`,
      )
      .bind(mail.to, mail.subject, mail.body, meta)
      .run();
    const outboxId =
      typeof result.meta.last_row_id === "number"
        ? result.meta.last_row_id
        : null;
    return { outboxId, stubbed: true };
  } catch (err) {
    console.warn("[cja-email-stub] outbox write failed:", err);
    return { outboxId: null, stubbed: true };
  }
}

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function sendVerificationEmailStub(opts: {
  to: string;
  name: string;
  token: string;
}): Promise<{ sampleUrl: string }> {
  const sampleUrl = absoluteUrl(`/members/verify?token=${encodeURIComponent(opts.token)}`);
  await enqueueEmailStub({
    to: opts.to,
    subject: "Verify your CJA member account",
    body: `Hi ${opts.name || "there"},\n\nVerify your email:\n${sampleUrl}\n\nThis link expires in 48 hours.\n\n— ${siteConfig.name}`,
    meta: { kind: "email_verification", token: opts.token },
  });
  return { sampleUrl };
}

export async function sendPasswordResetEmailStub(opts: {
  to: string;
  name: string;
  token: string;
}): Promise<{ sampleUrl: string }> {
  const sampleUrl = absoluteUrl(
    `/members/reset-password?token=${encodeURIComponent(opts.token)}`,
  );
  await enqueueEmailStub({
    to: opts.to,
    subject: "Reset your CJA password",
    body: `Hi ${opts.name || "there"},\n\nReset your password:\n${sampleUrl}\n\nThis link expires in 2 hours. If you did not request this, ignore this message.\n\n— ${siteConfig.name}`,
    meta: { kind: "password_reset", token: opts.token },
  });
  return { sampleUrl };
}

/**
 * Production hook notes (not wired yet):
 * - Resend: POST https://api.resend.com/emails with RESEND_API_KEY
 * - Mailchannels (Workers): https://api.mailchannels.net/tx/v1/send
 * Drain notification_outbox where status='pending' after flipping stub → pending.
 */
