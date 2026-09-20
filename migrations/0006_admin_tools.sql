-- Admin tools (§3G) + Officials manager (§4)
-- Apply local:  npm run db:migrate:local
-- Apply staging: npm run db:migrate:staging

-- Configurable official categories (not hard-coded to a seat count)
CREATE TABLE IF NOT EXISTS official_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_official_categories_order
  ON official_categories (display_order);

CREATE TABLE IF NOT EXISTS officials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  category TEXT NOT NULL,
  photo_url TEXT,
  photo_key TEXT,
  join_date TEXT,
  short_bio TEXT,
  term_start TEXT,
  term_end TEXT,
  social_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  tenure_label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_officials_status ON officials (status);
CREATE INDEX IF NOT EXISTS idx_officials_category ON officials (category);
CREATE INDEX IF NOT EXISTS idx_officials_order ON officials (status, category, display_order);

CREATE TABLE IF NOT EXISTS news_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL COLLATE NOCASE UNIQUE,
  meta_description TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  author TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles (published, published_at);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles (slug);

CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1,
  label TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON admin_audit_log (entity_type, entity_id);

-- Default feature flags (all modules enabled; maintenance off)
INSERT OR IGNORE INTO feature_flags (key, enabled, label) VALUES
  ('directory', 1, 'Community Directory'),
  ('matrimonial', 1, 'Matrimonial'),
  ('promotions', 1, 'Paid promotions'),
  ('volunteer_form', 1, 'Volunteer interest form');

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('maintenance_mode', '0');

-- Official categories (configurable)
INSERT OR IGNORE INTO official_categories (name, display_order, active) VALUES
  ('Executives', 1, 1),
  ('Directors', 2, 1),
  ('Corporate Secretary', 3, 1);

-- Seed officials matching prior sample content (src/content/officials.ts)
INSERT OR IGNORE INTO officials (
  id, full_name, designation, category, display_order, status,
  short_bio, term_start, join_date, term_end, tenure_label
) VALUES
  (1, 'Sample President', 'President', 'Executives', 1, 'active',
   'Leads CJA strategic direction and community outreach across Canada.',
   '2025-01-01', '2020-03-15', NULL, NULL),
  (2, 'Sample Vice President', 'Vice President', 'Executives', 2, 'active',
   'Supports programs, events, and member engagement.',
   '2025-01-01', NULL, NULL, NULL),
  (3, 'Sample General Secretary', 'General Secretary', 'Executives', 3, 'active',
   'Coordinates meetings, records, and official correspondence.',
   '2025-01-01', NULL, NULL, NULL),
  (4, 'Sample Treasurer', 'Treasurer', 'Executives', 4, 'active',
   'Oversees association finances and reporting (CAD).',
   '2025-01-01', NULL, NULL, NULL),
  (5, 'Sample Cultural Secretary', 'Cultural Secretary', 'Executives', 5, 'active',
   'Plans festivals, heritage programs, and youth cultural activities.',
   '2025-01-01', NULL, NULL, NULL),
  (6, 'Sample Sports Secretary', 'Sports Secretary', 'Executives', 6, 'active',
   'Organizes kabaddi, volleyball, and community sports meets.',
   '2025-01-01', NULL, NULL, NULL),
  (7, 'Sample Youth Coordinator', 'Youth Coordinator', 'Executives', 7, 'active',
   'Connects next-generation members with mentors and events.',
   '2025-01-01', NULL, NULL, NULL),
  (8, 'Sample Media Secretary', 'Media Secretary', 'Executives', 8, 'active',
   'Manages public communications and social channels.',
   '2025-01-01', NULL, NULL, NULL),
  (9, 'Sample Membership Secretary', 'Membership Secretary', 'Executives', 9, 'active',
   'Supports membership onboarding and renewals.',
   '2025-01-01', NULL, NULL, NULL),
  (10, 'Sample Director (Ontario)', 'Director', 'Directors', 1, 'active',
   'Regional liaison for Ontario chapter activities.',
   '2025-01-01', NULL, NULL, NULL),
  (11, 'Sample Director (Alberta)', 'Director', 'Directors', 2, 'active',
   'Regional liaison for Alberta chapter activities.',
   '2025-01-01', NULL, NULL, NULL),
  (12, 'Sample Director (British Columbia)', 'Director', 'Directors', 3, 'active',
   'Regional liaison for B.C. chapter activities.',
   '2025-01-01', NULL, NULL, NULL),
  (13, 'Sample Corporate Secretary', 'Corporate Secretary', 'Corporate Secretary', 1, 'active',
   'Governance, filings, and board support.',
   '2025-01-01', NULL, NULL, NULL),
  (14, 'Sample Past President A', 'President', 'Executives', 1, 'archived',
   'Led community expansion during the 2022–2025 term.',
   '2022-01-01', NULL, '2024-12-31', '2022–2025'),
  (15, 'Sample Past Vice President A', 'Vice President', 'Executives', 2, 'archived',
   NULL, '2022-01-01', NULL, '2024-12-31', '2022–2025'),
  (16, 'Sample Past Treasurer A', 'Treasurer', 'Executives', 3, 'archived',
   NULL, '2022-01-01', NULL, '2024-12-31', '2022–2025'),
  (17, 'Sample Past President B', 'President', 'Executives', 1, 'archived',
   NULL, '2019-01-01', NULL, '2021-12-31', '2019–2022'),
  (18, 'Sample Past Secretary B', 'General Secretary', 'Executives', 2, 'archived',
   NULL, '2019-01-01', NULL, '2021-12-31', '2019–2022');

-- Seed news from prior sample content (published)
INSERT OR IGNORE INTO news_articles (
  id, title, slug, meta_description, body, published, published_at, author, featured
) VALUES
  (1,
   'Welcome to the new CJA community website',
   'welcome-to-cja-website',
   'We are building a modern home for Canadian Jat families — news, events, leadership, and more.',
   'The Canadian Jats Association is launching a refreshed community website to keep members informed and connected across Canada.

Phase 1 focuses on public pages, member accounts, a community directory, and admin tools. Content on this page is sample data only until CJA publishes live announcements.

Bookmark this site and follow our social channels for upcoming festival dates, AGM notices, and volunteer opportunities.',
   1, '2026-09-01', 'CJA Communications', 1),
  (2,
   'Diwali celebration — save the date (sample)',
   'diwali-celebration-announcement',
   'Join CJA for a community Diwali evening with cultural performances, dinner, and family activities.',
   'CJA invites families to a sample Diwali celebration. Venue and ticket details will be confirmed closer to the date.

Volunteers are welcome for registration, décor, and youth activities — use the Volunteer form to express interest.

This article is sample content for development; replace with real event details before production.',
   1, '2026-08-15', 'Events Team', 1),
  (3,
   'Membership renewal reminder (sample)',
   'membership-renewal-reminder',
   'A friendly reminder that annual membership renewals help fund community programs.',
   'Thank you to everyone who supports CJA through membership. Renewals help sponsor cultural events, youth programs, and community outreach.

Online membership tools arrive in a later Phase 1 module. For now, contact us via the Contact form with membership questions.',
   1, '2026-07-20', 'Membership Secretary', 0);
