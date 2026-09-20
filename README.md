# Canadian Jats Association (CJA) Website

**Phase 1 — Foundation (§3A)** on top of the Next.js + Cloudflare Workers skeleton.

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **D1** (`DB`) — users + sessions
- **R2** (`MEDIA`) — placeholder (enable R2 in the Cloudflare dashboard before using)
- **Turnstile** — env placeholders; bypass when keys are missing

## What’s in Foundation

- Public site shell (header / nav / footer), mobile-first, navy + saffron branding
- Thin stub pages for About, Contact, Officials, News, Events, Gallery, Heritage, Documents, Social, Privacy, Terms, Volunteer, Past Executives
- PWA basics: web manifest, icons, minimal service worker (`public/sw.js`)
- SEO: per-page metadata, `sitemap.xml`, `robots.txt`, Open Graph, Organization JSON-LD on home
- Turnstile client widget + server verify; wired to Contact + Volunteer stubs
- Admin login separate from members (`/admin/login`), D1 sessions, server checks on `/admin`
- Modular folders: `src/modules/auth`, `src/modules/admin`, `src/modules/turnstile`, `src/lib`
- SQL migration: `migrations/0001_foundation.sql`

## Sample admin (sample data only)

| Field | Value |
|-------|--------|
| Email | `admin@example.com` |
| Password | `SampleAdmin123!` |

Change or disable this account before any real use. Never use real member data until CJA provides it.

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

Do **not** commit real Turnstile keys or PATs.

## D1 migrations

Migrations live in `migrations/` and are referenced from `wrangler.jsonc` (`migrations_dir`).

**Local (Miniflare / wrangler persist):**

```bash
npx wrangler d1 migrations apply cja-db --local
```

**Staging (remote):**

```bash
npx wrangler d1 migrations apply cja-website-db-staging --remote --env staging
```

After migrate, local preview / `next dev` (with OpenNext Cloudflare for Dev) can authenticate the sample admin.

## Local development

```bash
npm run dev
```

Workers-style preview:

```bash
npm run preview
```

## Build

```bash
npm run build
npm run build:worker
```

## Turnstile behaviour

- Set `TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (Wrangler secrets or `.dev.vars`) to enable.
- If keys are empty **or** `TURNSTILE_BYPASS=true`, forms accept submissions with a clear “not configured” notice (local/dev).
- Never set bypass on production.

## Deploy staging only

1. Ensure staging D1 exists and migrations are applied (see above).
2. R2: enable R2 in the Cloudflare dashboard, then create `cja-website-media-staging` (or remove the R2 block from `env.staging` until ready).
3. Optional Turnstile secrets:

```bash
npx wrangler secret put TURNSTILE_SITE_KEY --env staging
npx wrangler secret put TURNSTILE_SECRET_KEY --env staging
```

4. Deploy:

```bash
npm run deploy:staging
```

**Do not deploy to production until explicitly approved.** Production Worker name / D1 IDs remain placeholders.

### Staging deploy blocker (current Cloudflare account)

Deploy build succeeds, but Wrangler cannot publish until a **workers.dev subdomain** is registered (or a custom route is configured):

1. Open https://dash.cloudflare.com/982ff1b360633bdb369edc994c3ea4dd/workers/onboarding and register a workers.dev subdomain **or**
2. Add a staging route / custom domain (e.g. `draft.cjacanada.ca`) in `wrangler.jsonc` for `env.staging` after DNS is ready.

Then:

```bash
npm run db:migrate:staging   # already applied once for cja-website-db-staging
npm run deploy:staging
```

R2 remains disabled on this account — MEDIA binding is omitted from wrangler until R2 is enabled in the dashboard.


Staging Worker name: `cja-website-staging`  
Intended staging host (later): `draft.cjacanada.ca`

## Out of scope (this module)

- Full public CMS content, directory, matrimonial, Stripe, news editor, officials CRUD
- Member register/login (stubs only under `/members/*`)
- Production deploy / DNS changes
- Real member data

## Module layout

```
src/
  app/                 # routes (public stubs + admin)
  components/          # shell, forms, Turnstile, PWA register
  lib/                 # db, env, site-config
  modules/
    auth/              # password, session, roles, actions
    admin/             # contact/volunteer stubs
    turnstile/         # server verify
migrations/            # D1 SQL
public/icons/          # PWA icons
public/sw.js           # offline shell cache
```

## License / ownership

Code is owned by the Canadian Jats Association (CJA).
