# Canadian Jats Association (CJA) Website

**Phase 1 — Admin tools module (§3G + Officials §4)** on top of Foundation + Public pages + Member accounts + Community Directory + Paid promotions + Matrimonial.

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **D1** (`DB`) — users, sessions, directory, promotions, matrimonial, **officials, news CMS, feature flags, site settings, admin audit log**
- **R2** (`MEDIA`) — optional photo upload (URL / key stub OK)
- **Turnstile** — public / auth forms
- File-based content in `src/content/` remains as **fallback** when D1 has no rows

## What’s in this module (Admin tools §3G + Officials §4)

1. **Admin dashboard hub** `/admin` — cards to all admin areas with pending counts
2. **Officials manager** — add/edit/reorder/activate/deactivate/archive/restore; categories configurable; not hard-coded to 13 seats; audit log
3. **Members manager** — list/search users, view role, disable/enable
4. **Directory moderation** — existing `/admin/directory` linked from hub
5. **News / CMS** — CRUD (title, slug, meta description, body, published, published_at); public news prefers D1
6. **Matrimonial review inbox** — linked; keeps 24h overdue
7. **Feature switches** — `feature_flags` table; gates directory, matrimonial, promotions, volunteer_form server-side
8. **Maintenance mode** — site-wide; public pages show maintenance page except `/admin/*`

## Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Admin hub with counts |
| `/admin/officials` | Officials manager (+ categories, audit) |
| `/admin/officials/[id]` | Edit official |
| `/admin/members` | Members list / search / disable |
| `/admin/news` | News CMS list |
| `/admin/news/new` | Create article |
| `/admin/news/[id]` | Edit article |
| `/admin/features` | Feature flag toggles |
| `/admin/settings` | Maintenance mode |
| `/admin/directory` | Directory moderation (existing) |
| `/admin/matrimonial` | Matrimonial review (existing) |
| `/admin/promotions` | Promotion orders (existing) |
| `/admin/mfa` | Admin MFA (existing) |

Public Officials + Past Executives + News read from D1 (file fallback).

## Schema

Migration: `migrations/0006_admin_tools.sql`

| Object | Purpose |
|--------|---------|
| `official_categories` | Configurable category labels / order |
| `officials` | Leadership records (active/inactive/archived) |
| `news_articles` | CMS articles |
| `feature_flags` | Module gates |
| `site_settings` | `maintenance_mode` |
| `admin_audit_log` | Important admin changes |

### Feature flag keys

- `directory`
- `matrimonial`
- `promotions`
- `volunteer_form`

Default: all **enabled**; maintenance **off**.

### Apply migrations

```bash
npm run db:migrate:local
npm run db:migrate:staging
```

## Sample accounts (unchanged)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `SampleAdmin123!` |
| Member | `member@example.com` | `SampleMember123!` |

## Prerequisites / install / local

```bash
npm install
npm run db:migrate:local
npm run dev
```

## Out of scope

- Full event ticketing, Stripe live keys, production deploy, native apps

## Services marketplace

Public browse: `/services` (no login). Members manage listings at `/members/services`. Admin moderation: `/admin/services`.

**Plans (USD one-time Checkout):** Monthly $10 (30d) · Quarterly $25 (90d) · Annual $90 (365d). Payment → `pending_approval` → admin approve → live for duration from `approved_at`.

Migration: `migrations/0007_services.sql`. Feature flag: `services`.

Stripe secrets (optional; stub works without): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_SERVICES_MONTHLY`, `STRIPE_PRICE_SERVICES_QUARTERLY`, `STRIPE_PRICE_SERVICES_ANNUAL`. Webhook URL: `/api/payments/services/webhook` (event: `checkout.session.completed`).
