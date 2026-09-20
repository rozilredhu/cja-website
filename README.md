# Canadian Jats Association (CJA) Website

**Phase 1 — Matrimonial module (§3F)** on top of Foundation (§3A) + Public pages (§3B) + Member accounts (§3C) + Community Directory (§3D) + Paid promotions (§3E).

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **D1** (`DB`) — users, sessions, directory, promotions, **matrimonial profiles / blocks / reports / messages**
- **R2** (`MEDIA`) — optional photo upload (URL stub OK)
- **Payments** — Stripe stub + `matrimonial_highlight_30d` package
- **Turnstile** — public / auth forms
- **File-based content** in `src/content/` until Admin CMS (§3G)

## What’s in this module (Matrimonial §3F)

- **Account required** — members-only; `noindex` / robots disallow `/members/`
- **Profile fields** — gender, date_of_birth (store DOB; **display age only**), height_cm (UI ft/in → cm), marital_status, city, province, education, occupation, gotra, mother_gotra, native_place, mother_tongue, diet, willing_to_relocate, partner_preferences, short_bio, profile_photo
- **Not collected** — exact home address, income, full family names
- **Workflow** — create/edit → `pending` → admin approve/reject; **overdue flag if pending > 24 hours**; `notification_outbox` stub on new submission
- **Browse** — after `approved`, opposite-gender only (man→women, woman→men)
- **Filters** — age range, height range, city, province, education, occupation, gotra, marital_status
- **Privacy** — never show phone/email on cards; contact via **platform message form** (DB + email outbox stub)
- **Report** and **Block** from day one
- **Paid promotion hook** — `matrimonial_highlight_30d` (12.00 CAD / 30 days); Promoted badge + sort-first when active
- **Scale** — designed for ≤ ~1000 profiles; D1 indexes on gender, status, city, province

## Routes

| Route | Purpose |
|-------|---------|
| `/members/matrimonial` | Create / edit own profile |
| `/members/matrimonial/browse` | Opposite-gender browse + filters |
| `/members/matrimonial/browse/[id]` | Detail + contact / report / block |
| `/members/matrimonial/messages` | Platform message inbox |
| `/admin/matrimonial` | Review inbox (approve/reject, overdue) |

## Schema

Migration: `migrations/0005_matrimonial.sql`

| Object | Purpose |
|--------|---------|
| `matrimonial_profiles` | One profile per user; status pending/approved/rejected |
| `matrimonial_blocks` | Mutual hide on browse/detail |
| `matrimonial_reports` | Abuse reports |
| `matrimonial_contact_messages` | Platform contact messages |
| `promotion_packages` / `orders` | CHECK expanded for `matrimonial_profile`; seed `matrimonial_highlight_30d` |
| Sample seed | 4 approved profiles (mixed genders) on sample members |

### Apply migrations

```bash
npm run db:migrate:local
npm run db:migrate:staging
```

## Privacy / SEO rules

- Members-only (`requireMemberUser` / `requireAdminUser`)
- `robots: { index: false, follow: false }` on every matrimonial page; `/members/` disallowed in `robots.ts`
- Server-side gender + approval checks on every browse/detail query
- Blocks applied both directions
- Cards never include phone or email

## Admin 24h overdue

- On submit, `submitted_at = datetime('now')` and status → `pending`
- Admin inbox (`/admin/matrimonial`) computes overdue when `now - submitted_at > 24 hours`
- Overdue rows get a red **Overdue** badge and highlighted row; dashboard counts overdue pending

## Sample accounts (unchanged)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `SampleAdmin123!` |
| Member | `member@example.com` | `SampleMember123!` |
| Member | `member2@example.com` | `SampleMember123!` |
| Member | `member3@example.com` | `SampleMember123!` |
| Member | `member4@example.com` | `SampleMember123!` |

Seeded matrimonial: member + member2 = man; member3 + member4 = woman (all `approved`).

## Prerequisites / install / local

```bash
npm install
npm run db:migrate:local
npm run dev
```

### Quick test checklist

1. Sign in as `member3@example.com` → `/members/matrimonial/browse` shows men only.
2. Sign in as `member@example.com` → browse shows women only.
3. Edit profile → status becomes `pending`; admin inbox shows it; outbox stub logs admin email.
4. Leave a profile pending > 24h (or adjust `submitted_at` in D1) → **Overdue** flag.
5. Send a platform message → appears in `/members/matrimonial/messages` + outbox.
6. Report / Block from a detail page.
7. Promote via `/members/promotions` with `matrimonial_highlight_30d` (approved profile required).

## Out of scope (this module)

- Real SMS/push, advanced matchmaking AI, production deploy, real Stripe
