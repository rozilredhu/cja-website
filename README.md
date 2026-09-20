# Canadian Jats Association (CJA) Website

**Phase 1 — Community Directory (§3D)** on top of Foundation (§3A) + Public pages (§3B) + Member accounts (§3C).

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **D1** (`DB`) — users, sessions, verification/reset tokens, notification outbox, **directory profiles & businesses**
- **R2** (`MEDIA`) — optional photo upload; URL placeholder when R2 not configured
- **Turnstile** — Contact, Volunteer, Register, Forgot password
- **File-based content** in `src/content/` until Admin CMS (§3G)

## What’s in this module (Community Directory §3D)

- **Member directory opt-in** — `/members/directory` manage display name, phone, address, photo, education, city, province, bio; opt-out supported
- **Members-only browse** — `/members/directory/browse` (+ detail); login wall via `requireMemberUser`
- **Text search + filters** — query params `q`, `city`, `province` (SQL `LIKE` / equality on D1); searches name/city/province/education (members) and name/city/province/description (businesses)
- **Privacy (server-side every request)**:
  - Phone + address visible **only** when the viewer has themselves opted into the directory
  - Directory pages use `robots: { index: false }`; `/members/` already disallowed in `robots.ts`; not in sitemap
  - Logged-out users redirected to `/members/login` (no private fields in public HTML)
- **Business list** — member-submitted Jat-owned businesses; same members-only browse + peer opt-in for sensitive contact fields
- **Opted-in counts** — shown on directory home
- **Photo** — `photo_key` (R2 `MEDIA` when bound) + `photo_url` placeholder when R2 not ready
- **Admin (light)** — `/admin/directory` list + disable flag for profiles/businesses
- Link from `/members` dashboard

## Schema changes

New migration: `migrations/0003_community_directory.sql`

| Object | Purpose |
|--------|---------|
| `directory_profiles` | One row per user; opt-in, fields, photo_key/url, visibility flags, disabled |
| `business_listings` | Member business listings; opt-in, status, disabled, contact fields |
| Seed members `member2–4@example.com` | Extra sample accounts for directory demos |
| Seed profiles + 2 businesses | Fake Canadian cities (Toronto, Surrey, Calgary, Brampton) |

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

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | `admin@example.com` | `SampleAdmin123!` | MFA optional |
| Member | `member@example.com` | `SampleMember123!` | Opted into directory (Toronto, ON) |
| Member | `member2@example.com` | `SampleMember123!` | Surrey, BC + Surrey Spice Kitchen |
| Member | `member3@example.com` | `SampleMember123!` | Calgary, AB |
| Member | `member4@example.com` | `SampleMember123!` | Brampton, ON + Dhillon Family Farms |

All sample phone/address data is fake.

## Privacy enforcement summary

| Rule | How |
|------|-----|
| Members-only browse | `requireMemberUser()` on every directory page/action |
| Phone/address peer gate | `viewerCanSeeSensitive()` checks viewer’s own `directory_profiles.opted_in`; `toPublicProfile` / `toPublicBusiness` strip fields otherwise |
| Noindex | `metadata.robots = { index: false }` on directory routes; `robots.ts` disallows `/members/` |
| Not in sitemap | Directory paths under `/members/` — never added to `sitemap.ts` |
| Admin disable | `disabled` flag hides listing from browse queries |

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
npm run db:migrate:local   # Foundation + Member accounts + Community Directory
npm run dev
```

### Quick test checklist

1. Login as `member@example.com` → `/members` → **Community Directory**
2. Confirm opted-in count ≥ 4; browse members; search `q=Toronto` / filter province `ON`
3. Login as a non-opted-in new member → browse → phone/address hidden; opt in → sensitive fields appear for peers who shared them
4. Businesses browse + search `q=Spice`
5. Admin → `/admin/directory` → Disable a listing → confirm it disappears from browse
6. Logged out → `/members/directory/browse` → redirect to login

## Build

```bash
npm run build
npm run build:worker
```

## Deploy staging only

Staging Worker name: `cja-website-staging`  
Intended host (later): `draft.cjacanada.ca`

```bash
npm run db:migrate:staging
npm run deploy:staging
```

**Do not deploy to production until explicitly approved.**

## Module layout

```
src/
  app/
    members/directory/          # manage profile + businesses
    members/directory/browse/   # member list + detail (?q,&city,&province)
    members/directory/businesses/
    admin/directory/            # light moderation
  modules/
    directory/                  # queries, privacy, actions, components
migrations/
  0001_foundation.sql
  0002_member_accounts.sql
  0003_community_directory.sql
```

## Out of scope (do not build here)

- Matrimonial, Stripe promotions, public yellow pages without login
- Full CMS / production deploy
- Real email sending (stub/outbox only from §3C)

## License / ownership

Code is owned by the Canadian Jats Association (CJA).
