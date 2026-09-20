-- Matrimonial profiles — basic (§3F)
-- Apply local:  npm run db:migrate:local
-- Apply staging: npm run db:migrate:staging
--
-- Designed for ≤ ~1000 profiles. Indexes on gender, status, city, province.
-- Never store exact home address, income, or full family names on these rows.
-- Phone/email are never shown on matrimonial cards (contact via platform messages).

CREATE TABLE IF NOT EXISTS matrimonial_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  gender TEXT NOT NULL CHECK (gender IN ('man', 'woman')),
  date_of_birth TEXT NOT NULL,
  height_cm INTEGER,
  marital_status TEXT,
  city TEXT,
  province TEXT,
  education TEXT,
  occupation TEXT,
  gotra TEXT,
  mother_gotra TEXT,
  native_place TEXT,
  mother_tongue TEXT,
  diet TEXT,
  willing_to_relocate INTEGER NOT NULL DEFAULT 0,
  partner_preferences TEXT,
  short_bio TEXT,
  photo_key TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  reviewed_at TEXT,
  reviewed_by INTEGER REFERENCES users (id),
  submitted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mat_profiles_gender ON matrimonial_profiles (gender);
CREATE INDEX IF NOT EXISTS idx_mat_profiles_status ON matrimonial_profiles (status);
CREATE INDEX IF NOT EXISTS idx_mat_profiles_city ON matrimonial_profiles (city);
CREATE INDEX IF NOT EXISTS idx_mat_profiles_province ON matrimonial_profiles (province);
CREATE INDEX IF NOT EXISTS idx_mat_profiles_status_submitted
  ON matrimonial_profiles (status, submitted_at);

-- Block list (member A blocks member B — hide from each other's browse/detail)
CREATE TABLE IF NOT EXISTS matrimonial_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocker_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  blocked_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_mat_blocks_blocker ON matrimonial_blocks (blocker_user_id);
CREATE INDEX IF NOT EXISTS idx_mat_blocks_blocked ON matrimonial_blocks (blocked_user_id);

-- Abuse reports
CREATE TABLE IF NOT EXISTS matrimonial_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reported_profile_id INTEGER NOT NULL
    REFERENCES matrimonial_profiles (id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mat_reports_status ON matrimonial_reports (status);
CREATE INDEX IF NOT EXISTS idx_mat_reports_profile ON matrimonial_reports (reported_profile_id);

-- Platform contact messages (never expose phone/email on cards)
CREATE TABLE IF NOT EXISTS matrimonial_contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_profile_id INTEGER NOT NULL
    REFERENCES matrimonial_profiles (id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mat_msgs_to ON matrimonial_contact_messages (to_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mat_msgs_from ON matrimonial_contact_messages (from_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mat_msgs_profile ON matrimonial_contact_messages (to_profile_id);

-- Expand promotion target_type CHECK to include matrimonial_profile (SQLite rebuild)
CREATE TABLE promotion_packages_mat_mig (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('directory_profile', 'business_listing', 'matrimonial_profile')),
  amount_cad_cents INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO promotion_packages_mat_mig
  (code, name, description, target_type, amount_cad_cents, duration_days, active, created_at)
SELECT code, name, description, target_type, amount_cad_cents, duration_days, active, created_at
FROM promotion_packages;

DROP TABLE promotion_packages;
ALTER TABLE promotion_packages_mat_mig RENAME TO promotion_packages;

CREATE TABLE promotion_orders_mat_mig (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('directory_profile', 'business_listing', 'matrimonial_profile')),
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

INSERT INTO promotion_orders_mat_mig
  (id, user_id, target_type, target_id, package_code, amount_cad_cents,
   status, provider, provider_ref, paid_at, starts_at, ends_at, created_at)
SELECT id, user_id, target_type, target_id, package_code, amount_cad_cents,
       status, provider, provider_ref, paid_at, starts_at, ends_at, created_at
FROM promotion_orders;

DROP TABLE promotion_orders;
ALTER TABLE promotion_orders_mat_mig RENAME TO promotion_orders;

CREATE INDEX IF NOT EXISTS idx_promo_orders_user ON promotion_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_promo_orders_status ON promotion_orders (status);
CREATE INDEX IF NOT EXISTS idx_promo_orders_target
  ON promotion_orders (target_type, target_id, status);
CREATE INDEX IF NOT EXISTS idx_promo_orders_active
  ON promotion_orders (status, ends_at);

INSERT OR IGNORE INTO promotion_packages
  (code, name, description, target_type, amount_cad_cents, duration_days, active)
VALUES
  (
    'matrimonial_highlight_30d',
    'Matrimonial profile highlight',
    'Boost your approved matrimonial profile for 30 days (CAD). Appears first in browse with a Promoted badge.',
    'matrimonial_profile',
    1200,
    30,
    1
  );

-- Sample approved matrimonial profiles (mixed genders; DOB → age only in UI)
-- Uses existing sample members. Sample data only.
INSERT INTO matrimonial_profiles (
  user_id, gender, date_of_birth, height_cm, marital_status, city, province,
  education, occupation, gotra, mother_gotra, native_place, mother_tongue, diet,
  willing_to_relocate, partner_preferences, short_bio, status, submitted_at, reviewed_at
)
SELECT u.id, 'man', '1990-05-12', 178, 'Never married', 'Toronto', 'ON',
  'B.A.', 'Software analyst', 'Dhillon', 'Sandhu', 'Ludhiana', 'Punjabi', 'Vegetarian',
  1, 'Looking for a kind, family-oriented partner in Canada.',
  'Sample matrimonial profile (demo). Active in GTA community events.',
  'approved', datetime('now'), datetime('now')
FROM users u WHERE u.email = 'member@example.com'
  AND NOT EXISTS (SELECT 1 FROM matrimonial_profiles mp WHERE mp.user_id = u.id);

INSERT INTO matrimonial_profiles (
  user_id, gender, date_of_birth, height_cm, marital_status, city, province,
  education, occupation, gotra, mother_gotra, native_place, mother_tongue, diet,
  willing_to_relocate, partner_preferences, short_bio, status, submitted_at, reviewed_at
)
SELECT u.id, 'man', '1988-11-03', 183, 'Never married', 'Surrey', 'BC',
  'Diploma, Business', 'Operations manager', 'Sidhu', 'Gill', 'Jalandhar', 'Punjabi', 'Eggetarian',
  0, 'Prefers someone settled in BC or willing to relocate West.',
  'Sample matrimonial profile (demo). Enjoys hiking and community seva.',
  'approved', datetime('now'), datetime('now')
FROM users u WHERE u.email = 'member2@example.com'
  AND NOT EXISTS (SELECT 1 FROM matrimonial_profiles mp WHERE mp.user_id = u.id);

INSERT INTO matrimonial_profiles (
  user_id, gender, date_of_birth, height_cm, marital_status, city, province,
  education, occupation, gotra, mother_gotra, native_place, mother_tongue, diet,
  willing_to_relocate, partner_preferences, short_bio, status, submitted_at, reviewed_at
)
SELECT u.id, 'woman', '1992-08-21', 165, 'Never married', 'Calgary', 'AB',
  'M.Ed.', 'Teacher', 'Brar', 'Mann', 'Amritsar', 'Punjabi', 'Vegetarian',
  1, 'Values education, respect, and open communication.',
  'Sample matrimonial profile (demo). Volunteer coordinator (sample).',
  'approved', datetime('now'), datetime('now')
FROM users u WHERE u.email = 'member3@example.com'
  AND NOT EXISTS (SELECT 1 FROM matrimonial_profiles mp WHERE mp.user_id = u.id);

INSERT INTO matrimonial_profiles (
  user_id, gender, date_of_birth, height_cm, marital_status, city, province,
  education, occupation, gotra, mother_gotra, native_place, mother_tongue, diet,
  willing_to_relocate, partner_preferences, short_bio, status, submitted_at, reviewed_at
)
SELECT u.id, 'woman', '1991-02-14', 168, 'Divorced', 'Brampton', 'ON',
  'B.Comm.', 'Small business owner', 'Grewal', 'Dhaliwal', 'Moga', 'Punjabi', 'Non-vegetarian',
  1, 'Looking for a mature, supportive partner.',
  'Sample matrimonial profile (demo). Runs a family business (sample).',
  'approved', datetime('now'), datetime('now')
FROM users u WHERE u.email = 'member4@example.com'
  AND NOT EXISTS (SELECT 1 FROM matrimonial_profiles mp WHERE mp.user_id = u.id);
