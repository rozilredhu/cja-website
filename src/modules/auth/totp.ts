/**
 * Minimal TOTP (RFC 6238) via Web Crypto — Workers-safe, no npm deps.
 * HMAC-SHA1, 30s step, 6 digits. Admin MFA only.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

export function generateTotpSecret(bytes = 20): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return base32Encode(arr);
}

export function base32Encode(data: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i]!;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Uint8Array {
  const cleaned = input.replace(/=+$/, "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]!);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

function counterToBytes(counter: number): Uint8Array {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  // high 32 bits unused for typical TOTP windows
  view.setUint32(0, 0, false);
  view.setUint32(4, counter >>> 0, false);
  return new Uint8Array(buf);
}

async function hotp(secret: Uint8Array, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    secret.buffer.slice(
      secret.byteOffset,
      secret.byteOffset + secret.byteLength,
    ) as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const counterBytes = counterToBytes(counter);
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      counterBytes.buffer.slice(
        counterBytes.byteOffset,
        counterBytes.byteOffset + counterBytes.byteLength,
      ) as ArrayBuffer,
    ),
  );
  const offset = sig[sig.length - 1]! & 0x0f;
  const code =
    ((sig[offset]! & 0x7f) << 24) |
    ((sig[offset + 1]! & 0xff) << 16) |
    ((sig[offset + 2]! & 0xff) << 8) |
    (sig[offset + 3]! & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

export async function generateTotpCode(
  secretBase32: string,
  atMs = Date.now(),
  stepSec = 30,
): Promise<string> {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(atMs / 1000 / stepSec);
  return hotp(secret, counter);
}

/** Accept current ±1 window. */
export async function verifyTotp(
  secretBase32: string,
  code: string,
  atMs = Date.now(),
  stepSec = 30,
  window = 1,
): Promise<boolean> {
  const trimmed = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(trimmed)) return false;
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(atMs / 1000 / stepSec);
  for (let w = -window; w <= window; w++) {
    const expected = await hotp(secret, counter + w);
    if (timingSafeEqual(expected, trimmed)) return true;
  }
  return false;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let ok = 0;
  for (let i = 0; i < a.length; i++) {
    ok |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return ok === 0;
}

export function totpOtpauthUri(opts: {
  secret: string;
  accountName: string;
  issuer?: string;
}): string {
  const issuer = opts.issuer ?? "CJA Admin";
  const label = encodeURIComponent(`${issuer}:${opts.accountName}`);
  const params = new URLSearchParams({
    secret: opts.secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Debug helper — not used in prod paths. */
export function debugTotpFingerprint(secret: string): string {
  return bufToB64(base32Decode(secret)).slice(0, 8);
}
