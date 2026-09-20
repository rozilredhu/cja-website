# Canadian Jats Association (CJA) Website

**Phase 1 skeleton only** — Next.js (App Router) + TypeScript, targeted at Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare).

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers (OpenNext adapter)
- Planned bindings: **D1** (`DB`), **R2** (`MEDIA`)
- Planned bot protection: Cloudflare **Turnstile** (env placeholders only)

## Prerequisites

- Node.js 22+
- npm 10+
- Cloudflare account + Wrangler (for staging/production deploy later)
- Optional: `wrangler` login for binding create / deploy

## Install

```bash
npm install
```

Copy env placeholders (no real secrets in git):

```bash
cp .env.example .env.local
# Fill TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY when available
```

## Local development

Standard Next.js dev server (with OpenNext Cloudflare binding helpers):

```bash
npm run dev
```

Preview the Workers runtime build locally (no production deploy):

```bash
npm run preview
```

## Build

Next.js production build:

```bash
npm run build
```

OpenNext Worker bundle (used by preview / staging deploy):

```bash
npm run build:worker
```

## Bindings (placeholders)

`wrangler.jsonc` includes:

| Binding | Type | Notes |
|--------|------|--------|
| `DB` | D1 | Placeholder `database_id` — create with `wrangler d1 create cja-website-db` and replace the ID |
| `MEDIA` | R2 | Create with `wrangler r2 bucket create cja-website-media` |
| `ASSETS` | Assets | Filled by OpenNext build output |

`env.staging` and `env.production` stubs mirror these bindings with separate names.

**Do not commit real API tokens or secret keys.** Use Wrangler secrets / dashboard for Turnstile secret and other credentials.

## Deploy to staging (later — not part of Phase 1 push)

1. Create D1 + R2 resources; update `database_id` / bucket names in `wrangler.jsonc` for the `staging` env.
2. Set Turnstile secrets via Wrangler / dashboard (never commit them).
3. Deploy **staging only** after approval:

```bash
npm run deploy:staging
```

**Do not deploy to production until explicitly approved.**

## Out of scope (Phase 1)

This skeleton intentionally does **not** include:

- Member directory / business listings
- Auth (member or admin), MFA, email verification
- Payments / Stripe
- Full public site content (About, News, Gallery, Heritage, etc.)
- Matrimonial module
- Admin CMS tools
- Production Cloudflare deploy

## License / ownership

Code is owned by the Canadian Jats Association (CJA).
