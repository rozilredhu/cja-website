-- Community Directory (§3D): member opt-in profiles + Jat-owned business listings
-- Apply local:  npm run db:migrate:local
-- Apply staging: npm run db:migrate:staging

-- Member directory profiles (one row per user; opt-in required to appear in browse)
CREATE TABLE IF NOT EXISTS directory_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  opted_in INTEGER NOT NULL DEFAULT 0,
  disabled INTEGER NOT NULL DEFAULT 0,
  display_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  address_line TEXT,
  city TEXT,
  province TEXT,
  education TEXT,
  bio TEXT,
  photo_key TEXT,
  photo_url TEXT,
  show_phone INTEGER NOT NULL DEFAULT 0,
  show_address INTEGER NOT NULL DEFAULT 0,
  show_photo INTEGER NOT NULL DEFAULT 1,
  show_education INTEGER NOT NULL DEFAULT 1,
  opted_in_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dir_profiles_opted ON directory_profiles (opted_in, disabled);
CREATE INDEX IF NOT EXISTS idx_dir_profiles_city ON directory_profiles (city);
CREATE INDEX IF NOT EXISTS idx_dir_profiles_province ON directory_profiles (province);

-- Jat-owned businesses in Canada (member-submitted; members-only browse)
CREATE TABLE IF NOT EXISTS business_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  city TEXT,
  province TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address_line TEXT,
  photo_key TEXT,
  photo_url TEXT,
  opted_in INTEGER NOT NULL DEFAULT 0,
  disabled INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'disabled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_biz_listings_user ON business_listings (user_id);
CREATE INDEX IF NOT EXISTS idx_biz_listings_opted ON business_listings (opted_in, disabled, status);
CREATE INDEX IF NOT EXISTS idx_biz_listings_city ON business_listings (city);
CREATE INDEX IF NOT EXISTS idx_biz_listings_province ON business_listings (province);

-- Extra sample members for directory seeding (password: SampleMember123!)
-- PBKDF2-SHA256, 100000 iterations. Sample only — rotate before real use.
INSERT OR IGNORE INTO users (email, password_hash, salt, name, role, disabled, email_verified_at)
VALUES
  (
    'member2@example.com',
    'MiaSFGOpz5LbFEC5B9CuJMpHf10nNVqun00CVqnK+dM=',
    '2AJXWmofGnHXcfKKxPJgHw==',
    'Harpreet Singh',
    'member',
    0,
    datetime('now')
  ),
  (
    'member3@example.com',
    'xzkSR7e9NLYwf9DFA30Tp+f8o8/ocd1Vw+V4U/d41MU=',
    'FqhnXV93T5Iiu8unRp/D4w==',
    'Gurpreet Kaur',
    'member',
    0,
    datetime('now')
  ),
  (
    'member4@example.com',
    'kGKHEMO1tBG4+Fz0tZSZolH87kB0F4/oF/yVYGMkhVo=',
    '7hNgGZbS4s0EE+aB749mVg==',
    'Jaswinder Dhillon',
    'member',
    0,
    datetime('now')
  );

-- Seed opted-in directory profiles (fake Canadian cities; no real private data)
INSERT OR IGNORE INTO directory_profiles (
  user_id, opted_in, disabled, display_name, phone, address_line, city, province,
  education, bio, photo_url, show_phone, show_address, show_photo, show_education, opted_in_at
)
SELECT u.id, 1, 0, 'Sample Member', '416-555-0101', '100 Example St', 'Toronto', 'ON',
  'B.A. Community Studies', 'Sample opted-in member for local/staging demos.',
  NULL, 1, 1, 1, 1, datetime('now')
FROM users u WHERE u.email = 'member@example.com'
  AND NOT EXISTS (SELECT 1 FROM directory_profiles dp WHERE dp.user_id = u.id);

INSERT OR IGNORE INTO directory_profiles (
  user_id, opted_in, disabled, display_name, phone, address_line, city, province,
  education, bio, photo_url, show_phone, show_address, show_photo, show_education, opted_in_at
)
SELECT u.id, 1, 0, 'Harpreet Singh', '604-555-0142', '22 Maple Ave', 'Surrey', 'BC',
  'Diploma, Business Admin', 'Active in Lower Mainland community events.',
  NULL, 1, 0, 1, 1, datetime('now')
FROM users u WHERE u.email = 'member2@example.com'
  AND NOT EXISTS (SELECT 1 FROM directory_profiles dp WHERE dp.user_id = u.id);

INSERT OR IGNORE INTO directory_profiles (
  user_id, opted_in, disabled, display_name, phone, address_line, city, province,
  education, bio, photo_url, show_phone, show_address, show_photo, show_education, opted_in_at
)
SELECT u.id, 1, 0, 'Gurpreet Kaur', '403-555-0199', '8 Prairie Rd', 'Calgary', 'AB',
  'M.Ed.', 'Volunteer coordinator (sample profile).',
  NULL, 0, 0, 1, 1, datetime('now')
FROM users u WHERE u.email = 'member3@example.com'
  AND NOT EXISTS (SELECT 1 FROM directory_profiles dp WHERE dp.user_id = u.id);

INSERT OR IGNORE INTO directory_profiles (
  user_id, opted_in, disabled, display_name, phone, address_line, city, province,
  education, bio, photo_url, show_phone, show_address, show_photo, show_education, opted_in_at
)
SELECT u.id, 1, 0, 'Jaswinder Dhillon', '905-555-0177', '55 Lakeview Blvd', 'Brampton', 'ON',
  'B.Comm.', 'Small business owner (sample).',
  NULL, 1, 1, 1, 1, datetime('now')
FROM users u WHERE u.email = 'member4@example.com'
  AND NOT EXISTS (SELECT 1 FROM directory_profiles dp WHERE dp.user_id = u.id);

-- Sample businesses (1–2 listings)
INSERT INTO business_listings (
  user_id, name, description, city, province, phone, email, website, address_line,
  photo_url, opted_in, disabled, status
)
SELECT u.id,
  'Dhillon Family Farms Co.',
  'Sample Jat-owned produce and agri-services business in the GTA (demo listing).',
  'Brampton', 'ON', '905-555-0200', 'hello@dhillonfarms.example', 'https://example.com/dhillon-farms',
  '200 Country Lane', NULL, 1, 0, 'active'
FROM users u WHERE u.email = 'member4@example.com'
  AND NOT EXISTS (SELECT 1 FROM business_listings b WHERE b.name = 'Dhillon Family Farms Co.');

INSERT INTO business_listings (
  user_id, name, description, city, province, phone, email, website, address_line,
  photo_url, opted_in, disabled, status
)
SELECT u.id,
  'Surrey Spice Kitchen',
  'Sample Punjabi restaurant / catering (demo listing — fake contact details).',
  'Surrey', 'BC', '604-555-0333', 'orders@surreyspice.example', 'https://example.com/surrey-spice',
  '1400 King George Blvd', NULL, 1, 0, 'active'
FROM users u WHERE u.email = 'member2@example.com'
  AND NOT EXISTS (SELECT 1 FROM business_listings b WHERE b.name = 'Surrey Spice Kitchen');
