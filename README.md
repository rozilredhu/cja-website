# Canadian Jats Association (CJA) Website

**Phase 1 — Public pages (§3B)** on top of Foundation (§3A).

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **D1** (`DB`) — users + sessions (Foundation only; no new tables in Public pages)
- **R2** (`MEDIA`) — placeholder (enable R2 before using)
- **Turnstile** — Contact + Volunteer forms
- **File-based content** in `src/content/` (typed TS) until Admin CMS (§3G)

## What’s in this module (Public pages)

- **Home** — hero, upcoming event banner, featured officials, latest news, social strip
- **About CJA** — mission, vision, values, what we do
- **Contact** — Turnstile form (Foundation) + contact aside
- **Officials / Leadership** — data-driven responsive grid by category (sample Executives / Directors / Corporate Secretary; counts not hard-coded)
- **Past Executives** — archived tenures grouped (e.g. 2022–2025, 2019–2022)
- **Past Functions / Events** — list + `/events/[slug]` detail; optional Google Drive link field
- **News & Announcements** — list + `/news/[slug]` articles (sample MD-style content in TS)
- **Photo & Video Gallery** — sample photo grid + YouTube embed placeholders
- **Jats Heritage** — landing, articles, timeline, gallery stubs
- **Document Centre** — public documents only (sample links)
- **Social** — X / Facebook placeholders + YouTube embed (**no Instagram**)
- **Privacy Policy** & **Terms of Use** — readable drafts clearly marked for CJA counsel
- **Volunteer** — Turnstile interest form retained

## Schema changes

**None — file-based content.** No new D1 migrations in this module. Foundation migration `0001_foundation.sql` unchanged.

Content lives under `src/content/` and is read via `src/modules/public/`. A later Admin CMS can replace these modules with D1-backed editors without changing page routes.

## Sample admin (from Foundation)

| Field | Value |
|-------|--------|
| Email | `admin@example.com` |
| Password | `SampleAdmin123!` |

Sample officials / news / events use fictional names only. Never use real private member data until CJA provides it.

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

## Local development

```bash
npm run db:migrate:local   # Foundation tables for admin login
npm run dev
```

## Build

```bash
npm run build
npm run build:worker
```

## Deploy staging only

Staging Worker name: `cja-website-staging`  
Intended host (later): `draft.cjacanada.ca`

**Current blocker:** Cloudflare account still needs a **workers.dev subdomain** registered (or a custom staging route). Deploy build succeeds; publish fails until that is fixed. See Foundation README notes.

```bash
npm run db:migrate:staging
npm run deploy:staging
```

**Do not deploy to production until explicitly approved.**

## Module layout

```
src/
  app/                      # routes (public pages + admin + member stubs)
  content/                  # typed sample content (officials, news, events, …)
  components/               # shell, forms, Turnstile, PWA
  lib/                      # db, env, site-config
  modules/
    auth/                   # Foundation admin sessions
    admin/                  # contact/volunteer actions
    turnstile/              # server verify
    public/                 # content helpers + public UI cards
migrations/                 # D1 SQL (Foundation only so far)
```

## Out of scope (do not build here)

- Member directory, matrimonial, Stripe
- Full admin CMS editors / officials CRUD UI
- Member auth beyond existing stubs
- Instagram
- Production deploy / real member data

## License / ownership

Code is owned by the Canadian Jats Association (CJA).
