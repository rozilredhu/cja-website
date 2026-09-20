# Canadian Jats Association (CJA) Website

**Phase 1 — Member accounts (§3C)** on top of Foundation (§3A) + Public pages (§3B).

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **D1** (`DB`) — users, sessions, verification/reset tokens, notification outbox
- **R2** (`MEDIA`) — placeholder (enable R2 before using)
- **Turnstile** — Contact, Volunteer, **Register**, **Forgot password**
- **File-based content** in `src/content/` until Admin CMS (§3G)

## What’s in this module (Member accounts §3C)

- **Register** — `/members/register` (name, email, password + Turnstile); creates `member` role user
- **Login / Logout** — `/members/login` + session cookies (same `cja_session` as Foundation); admins stay on `/admin/login`
- **Email verification** — token table + `/members/verify?token=…`; staging/dev stubs email (console + `notification_outbox` + sample link on success). Does **not** require real SMTP
- **Password reset** — `/members/forgot-password` → token → `/members/reset-password?token=…` (same email stub)
- **One central `users` table** — roles `member` / `admin`; `email_verified_at` from Foundation
- **Member area shell** — `/members` dashboard after login (placeholder links for directory / matrimonial)
- **Server-side guards** — `/members` requires logged-in member (admins may also enter)
- **Admin MFA** — minimal TOTP (Web Crypto, no extra deps): enable/confirm/disable at `/admin/mfa`; login challenge at `/admin/mfa/challenge` when enabled

## Schema changes

New migration: `migrations/0002_member_accounts.sql`

| Object | Purpose |
|--------|---------|
| `email_verification_tokens` | One-time email verify tokens |
| `password_reset_tokens` | One-time password reset tokens |
| `notification_outbox` | Stub email outbox (`status=stubbed`); later drain via Resend / Mailchannels |
| `users.totp_secret` | Admin TOTP secret (enabled) |
| `users.totp_pending_secret` | Admin TOTP secret while enrolling |
| `users.totp_enabled_at` | When admin MFA was confirmed |
| Seed `member@example.com` | Sample member (see below) |

### Apply migrations

```bash
# Local D1 (Miniflare)
npm run db:migrate:local

# Staging remote D1
npm run db:migrate:staging
```

Equivalent Wrangler:

```bash
npx wrangler d1 migrations apply cja-db --local
npx wrangler d1 migrations apply cja-website-db-staging --remote --env staging
```

## Sample accounts (sample only — rotate before real use)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `SampleAdmin123!` |
| Member | `member@example.com` | `SampleMember123!` |

## Email stub (no SMTP yet)

Outbound mail goes through `src/modules/auth/email.ts`:

1. `console.info("[cja-email-stub]", …)` on the server
2. Row inserted into `notification_outbox` with `status='stubbed'`
3. Sample absolute URL returned to the UI after register / forgot-password / resend

**Later hook (documented, not wired):**

- **Resend** — `POST https://api.resend.com/emails` with `RESEND_API_KEY`; set outbox rows to `pending` then mark `sent`
- **Mailchannels** (Workers) — `https://api.mailchannels.net/tx/v1/send`

Do not block Phase 1 on a real provider.

## Prerequisites

- Node.js 22+
- npm 10+
- Cloudflare account + Wrangler (for migrations / staging deploy)

## Install

```bash
npm install
cp .env.example .env.local
cp .dev.vars.example .dev.vars
```

Do **not** commit real Turnstile keys or PATs. Turnstile bypasses when keys are unset or `TURNSTILE_BYPASS=true` (existing pattern).

## Local development

```bash
npm run db:migrate:local   # Foundation + Member accounts
npm run dev
```

### Quick test checklist

1. **Register** — `/members/register` → account created → sample verify link shown → land in `/members`
2. **Login / Logout** — `/members/login` with sample member → dashboard → Sign out
3. **Verify stub** — open sample link → `/members/verify?token=…` → verified banner clears after resend/verify
4. **Reset stub** — `/members/forgot-password` → sample reset link → set new password → login
5. **Guards** — hit `/members` logged out → redirect to login; admin can open `/members` after admin login
6. **Admin MFA (optional)** — `/admin/mfa` → Enable → confirm code → next `/admin/login` asks for TOTP

## Build

```bash
npm run build
npm run build:worker
```

## Deploy staging only

Staging Worker name: `cja-website-staging`  
Intended host (later): `draft.cjacanada.ca`

**Current blocker:** Cloudflare account may still need a **workers.dev subdomain** (or custom staging route). Deploy build can succeed while publish fails until that is fixed.

```bash
npm run db:migrate:staging
npm run deploy:staging
```

**Do not deploy to production until explicitly approved.**

## Module layout

```
src/
  app/
    members/                # register, login, dashboard, verify, reset
    admin/mfa/              # TOTP setup + login challenge
  modules/
    auth/                   # sessions, passwords, member+admin actions, email stub, totp
    members/components/     # member forms
    public/                 # Public pages content helpers
migrations/
  0001_foundation.sql
  0002_member_accounts.sql
```

## Out of scope (do not build here)

- Directory opt-in, matrimonial, Stripe, CMS editors
- Real email sending (stub/outbox only)
- Production deploy / real member data

## License / ownership

Code is owned by the Canadian Jats Association (CJA).
