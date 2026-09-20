# Canadian Jats Association (CJA) Website

**Phase 1 — Paid promotions / Stripe stub (§3E)** on top of Foundation (§3A) + Public pages (§3B) + Member accounts (§3C) + Community Directory (§3D).

Repo: https://github.com/rozilredhu/cja-website

## Stack

- Next.js App Router + TypeScript
- Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **D1** (`DB`) — users, sessions, directory, **promotion packages & orders**
- **R2** (`MEDIA`) — optional photo upload
- **Payments** — `PaymentAdapter` + **`StripeStubAdapter`** (no Stripe keys required)
- **Turnstile** — public / auth forms
- **File-based content** in `src/content/` until Admin CMS (§3G)

## What’s in this module (Paid promotions §3E)

- **Promotion packages (CAD)** — typed constants in `src/modules/payments/packages.ts` (+ mirrored `promotion_packages` table for reporting / future admin edits):
  - Directory profile highlight — **10.00 CAD / 30 days** (`directory_highlight_30d`)
  - Business listing highlight — **15.00 CAD / 30 days** (`business_highlight_30d`)
- **Orders** — `promotion_orders` with status `pending|paid|failed|expired|cancelled`, provider `stripe_stub`, amounts in **CAD cents**
- **Payment adapter** — `src/modules/payments/` with `PaymentAdapter` + `StripeStubAdapter` (no-ops / simulates success). Documented where real Stripe keys go later. **Does not require Stripe keys to run.**
- **Checkout UI** — `/members/promotions` (create order) + `/members/promotions/checkout/[orderId]` stub **Pay** marks paid and sets `starts_at` / `ends_at`
- **Directory integration** — browse lists sort boosted items first and show a **Promoted** badge while `status = paid` and `ends_at > now` (query-time filter; optional cron note for later)
- **Admin** — `/admin/promotions` list + mark expired / cancelled
- **Webhook stub** — `POST|GET /api/payments/webhook` accepts events; safe no-op for stub (webhooks become source of truth later)
- **Never store card numbers**

## Schema changes

New migration: `migrations/0004_paid_promotions.sql`

| Object | Purpose |
|--------|---------|
| `promotion_packages` | Optional mirror of package codes (CAD cents, duration, target_type) |
| `promotion_orders` | Orders: user, target, package, amount_cad_cents, status, provider, dates |
| Seed order | Sample paid boost for `member@example.com` directory profile (~30 days) |

### Apply migrations

```bash
npm run db:migrate:local
npm run db:migrate:staging
```

## How stub pay works

1. Logged-in member opens `/members/promotions`, picks a package + opted-in target → creates a **pending** order.
2. `StripeStubAdapter.createCheckout` returns an on-site checkout URL + `provider_ref` (`stub_sess_…`). No Stripe API.
3. On checkout, **Pay (stub)** calls `confirmPayment` (always succeeds) and sets `status=paid`, `paid_at`, `starts_at`, `ends_at` (+duration days; stacks on an existing active end if present).
4. No card form, no secrets required. Real Stripe later: put `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` in Workers secrets / `.dev.vars`, implement `StripeAdapter`, and treat `/api/payments/webhook` as source of truth.

## How promotions appear in the directory

- Browse queries load an active-promotion map (`status = paid` AND `ends_at > datetime('now')`).
- Results are sorted **promoted first**, then by name; cards/detail show a **Promoted** badge.
- After `ends_at`, the row drops out of the map automatically (query-time). Admin can also mark `expired`/`cancelled`. Optional cron can flip status later for housekeeping.

## Sample accounts (unchanged)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `SampleAdmin123!` |
| Member | `member@example.com` | `SampleMember123!` |
| Member | `member2@example.com` | `SampleMember123!` |
| Member | `member3@example.com` | `SampleMember123!` |
| Member | `member4@example.com` | `SampleMember123!` |

## Prerequisites / install / local

Same as prior modules. After pull:

```bash
npm install
npm run db:migrate:local
npm run dev
```

### Quick test checklist

1. Login as `member@example.com` → `/members/promotions` → create directory highlight → stub Pay → see paid + ends_at
2. Browse `/members/directory/browse` → Sample Member first with **Promoted** badge
3. Create business boost as `member2@example.com` / `member4@example.com` → businesses browse shows promoted first
4. Admin → `/admin/promotions` → Mark expired → badge disappears on next browse
5. `curl -X POST http://localhost:3000/api/payments/webhook` → `{ ok: true, … no-op }`

## Build

```bash
npm run build
npm run build:worker
```

## Module layout

```
src/
  app/
    members/promotions/           # create order + order list
    members/promotions/checkout/[orderId]/  # stub Pay
    admin/promotions/             # order list + expire/cancel
    api/payments/webhook/         # stub webhook
  modules/
    payments/                     # packages, adapter, stub, queries, actions
migrations/
  0004_paid_promotions.sql
```

## Out of scope

- Real Stripe keys / card storage / production charge flow
- Matrimonial, production deploy, full CMS

## License / ownership

Code is owned by the Canadian Jats Association (CJA).
