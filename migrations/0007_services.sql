-- Services marketplace — paid listings with admin approval
-- Apply local:  npm run db:migrate:local
-- Apply staging: npm run db:migrate:staging
--
-- Public browse shows only live + unexpired (query-time filter).
-- Payment (Stripe or stub) → pending_approval → admin approve → live for duration_days.

CREATE TABLE IF NOT EXISTS service_categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO service_categories (slug, name, description, sort_order, active) VALUES
  ('babysitter', 'Babysitter', 'Childcare and babysitting services', 1, 1),
  ('plumber', 'Plumber', 'Plumbing repair and installation', 2, 1),
  ('electrician', 'Electrician', 'Electrical repair and installation', 3, 1),
  ('lawyer', 'Lawyer', 'Legal services', 4, 1),
  ('realtor', 'Realtor', 'Real estate agents', 5, 1),
  ('mortgage-agent', 'Mortgage agent', 'Mortgage and lending professionals', 6, 1);

CREATE TABLE IF NOT EXISTS service_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL REFERENCES service_categories (slug),
  business_name TEXT NOT NULL,
  description TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  -- Customer-facing price (what the provider charges clients), USD cents or free-text range
  price_cents INTEGER,
  price_range TEXT,
  -- Discovery / filter fields
  avg_rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  lat REAL,
  lng REAL,
  availability TEXT NOT NULL DEFAULT 'weekdays'
    CHECK (availability IN ('24_7', 'weekdays', 'weekends', 'by_appointment')),
  languages TEXT NOT NULL DEFAULT 'English',
  years_experience INTEGER NOT NULL DEFAULT 0,
  verified_licensed INTEGER NOT NULL DEFAULT 0,
  -- Plan / payment (one-time Checkout for listing period)
  plan_tier TEXT
    CHECK (plan_tier IS NULL OR plan_tier IN ('monthly', 'quarterly', 'annual')),
  amount_cents INTEGER,
  duration_days INTEGER,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN (
      'pending_payment',
      'pending_approval',
      'live',
      'rejected',
      'expired'
    )),
  stripe_session_id TEXT,
  payment_ref TEXT,
  paid_at TEXT,
  approved_at TEXT,
  expires_at TEXT,
  rejected_reason TEXT,
  disabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_service_listings_user ON service_listings (user_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_category ON service_listings (category_slug);
CREATE INDEX IF NOT EXISTS idx_service_listings_status ON service_listings (status);
CREATE INDEX IF NOT EXISTS idx_service_listings_live
  ON service_listings (status, expires_at, disabled);
CREATE INDEX IF NOT EXISTS idx_service_listings_city
  ON service_listings (city, province);
CREATE INDEX IF NOT EXISTS idx_service_listings_pending
  ON service_listings (status, paid_at);

-- Feature flag for Services marketplace
INSERT OR IGNORE INTO feature_flags (key, enabled, label) VALUES
  ('services', 1, 'Services marketplace');

-- Optional sample live listing for demo (owner: member@example.com) if user exists
INSERT INTO service_listings (
  user_id, category_slug, business_name, description,
  contact_phone, contact_email, city, province,
  price_cents, price_range, avg_rating, review_count,
  lat, lng, availability, languages, years_experience, verified_licensed,
  plan_tier, amount_cents, duration_days, status,
  payment_ref, paid_at, approved_at, expires_at
)
SELECT
  u.id,
  'plumber',
  'GTA Reliable Plumbing',
  'Licensed plumber serving Mississauga and the GTA. Emergency and scheduled work.',
  '416-555-0142',
  'plumber@example.com',
  'Mississauga',
  'ON',
  9500,
  '$80–$120/hr',
  4.7,
  23,
  43.5890,
  -79.6441,
  '24_7',
  'English, Punjabi',
  12,
  1,
  'monthly',
  1000,
  30,
  'live',
  'stub_seed_services_plumber',
  datetime('now', '-2 days'),
  datetime('now', '-1 days'),
  datetime('now', '+29 days')
FROM users u
WHERE u.email = 'member@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM service_listings s
    WHERE s.payment_ref = 'stub_seed_services_plumber'
  );

INSERT INTO service_listings (
  user_id, category_slug, business_name, description,
  contact_phone, contact_email, city, province,
  price_cents, price_range, avg_rating, review_count,
  lat, lng, availability, languages, years_experience, verified_licensed,
  plan_tier, amount_cents, duration_days, status,
  payment_ref, paid_at, approved_at, expires_at
)
SELECT
  u.id,
  'electrician',
  'Calgary Sparks Electric',
  'Residential and light commercial electrical work across Calgary.',
  '403-555-0198',
  'sparks@example.com',
  'Calgary',
  'AB',
  11000,
  '$90–$140/hr',
  4.4,
  11,
  51.0447,
  -114.0719,
  'weekdays',
  'English',
  8,
  1,
  'quarterly',
  2500,
  90,
  'live',
  'stub_seed_services_electrician',
  datetime('now', '-5 days'),
  datetime('now', '-4 days'),
  datetime('now', '+86 days')
FROM users u
WHERE u.email = 'member@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM service_listings s
    WHERE s.payment_ref = 'stub_seed_services_electrician'
  );

INSERT INTO service_listings (
  user_id, category_slug, business_name, description,
  contact_phone, contact_email, city, province,
  price_cents, price_range, avg_rating, review_count,
  lat, lng, availability, languages, years_experience, verified_licensed,
  plan_tier, amount_cents, duration_days, status,
  payment_ref, paid_at, approved_at, expires_at
)
SELECT
  u.id,
  'babysitter',
  'Punjabi Kids Care',
  'Experienced babysitter; evenings and weekends. CPR certified.',
  '905-555-0111',
  'kids@example.com',
  'Brampton',
  'ON',
  2500,
  '$20–$30/hr',
  4.9,
  41,
  43.7315,
  -79.7624,
  'weekends',
  'English, Punjabi, Hindi',
  5,
  0,
  'annual',
  9000,
  365,
  'live',
  'stub_seed_services_babysitter',
  datetime('now', '-10 days'),
  datetime('now', '-9 days'),
  datetime('now', '+355 days')
FROM users u
WHERE u.email = 'member@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM service_listings s
    WHERE s.payment_ref = 'stub_seed_services_babysitter'
  );
