-- Paid promotions — Stripe stub (§3E)
-- CAD only. Never store card numbers.
-- Apply local:  npm run db:migrate:local
-- Apply staging: npm run db:migrate:staging
--
-- Packages live in typed constants (src/modules/payments/packages.ts) for Phase 1;
-- this optional seed table documents codes for admin/reporting and future CMS edits.
-- Query-time filter drops expired promotions (ends_at in the past). Optional cron
-- can later mark status='expired' for housekeeping.

CREATE TABLE IF NOT EXISTS promotion_packages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('directory_profile', 'business_listing')),
  amount_cad_cents INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO promotion_packages
  (code, name, description, target_type, amount_cad_cents, duration_days, active)
VALUES
  (
    'directory_highlight_30d',
    'Directory profile highlight',
    'Boost your opted-in member directory profile for 30 days (CAD).',
    'directory_profile',
    1000,
    30,
    1
  ),
  (
    'business_highlight_30d',
    'Business listing highlight',
    'Boost your opted-in business listing for 30 days (CAD).',
    'business_listing',
    1500,
    30,
    1
  );

CREATE TABLE IF NOT EXISTS promotion_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('directory_profile', 'business_listing')),
  target_id INTEGER NOT NULL,
  package_code TEXT NOT NULL,
  amount_cad_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  provider TEXT NOT NULL DEFAULT 'stripe_stub',
  provider_ref TEXT,
  paid_at TEXT,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_promo_orders_user ON promotion_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_promo_orders_status ON promotion_orders (status);
CREATE INDEX IF NOT EXISTS idx_promo_orders_target
  ON promotion_orders (target_type, target_id, status);
CREATE INDEX IF NOT EXISTS idx_promo_orders_active
  ON promotion_orders (status, ends_at);

-- Optional sample paid order: boost Sample Member profile for ~30 days (demo)
INSERT INTO promotion_orders (
  user_id, target_type, target_id, package_code, amount_cad_cents,
  status, provider, provider_ref, paid_at, starts_at, ends_at
)
SELECT
  u.id,
  'directory_profile',
  dp.id,
  'directory_highlight_30d',
  1000,
  'paid',
  'stripe_stub',
  'stub_seed_sample_member',
  datetime('now'),
  datetime('now'),
  datetime('now', '+30 days')
FROM users u
JOIN directory_profiles dp ON dp.user_id = u.id
WHERE u.email = 'member@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM promotion_orders o
    WHERE o.provider_ref = 'stub_seed_sample_member'
  );
