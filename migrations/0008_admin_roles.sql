-- Admin roles: extend users.role to super_admin | admin | member
-- Plus last_login_at for admin list. Seed staging-oriented owner/volunteer admins.
-- Apply local:  npm run db:migrate:local
-- Apply staging: npm run db:migrate:staging
--
-- SQLite cannot ALTER CHECK constraints; rebuild users (FK children keep name).

PRAGMA foreign_keys = OFF;

CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('super_admin', 'admin', 'member')),
  disabled INTEGER NOT NULL DEFAULT 0,
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  totp_secret TEXT,
  totp_pending_secret TEXT,
  totp_enabled_at TEXT,
  last_login_at TEXT
);

INSERT INTO users_new (
  id, email, password_hash, salt, name, role, disabled, email_verified_at,
  created_at, updated_at, totp_secret, totp_pending_secret, totp_enabled_at
)
SELECT
  id, email, password_hash, salt, name, role, disabled, email_verified_at,
  created_at, updated_at, totp_secret, totp_pending_secret, totp_enabled_at
FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

PRAGMA foreign_keys = ON;

-- Promote legacy sample admin to super_admin (owners retain control)
UPDATE users
SET role = 'super_admin', updated_at = datetime('now')
WHERE email = 'admin@example.com' COLLATE NOCASE AND role = 'admin';

-- Staging seed accounts (PBKDF2-SHA256, 100k iter). Passwords documented for operators only — not in git plaintext.
-- superadmin@cjacanada.ca
INSERT INTO users (email, password_hash, salt, name, role, disabled, email_verified_at)
VALUES (
  'superadmin@cjacanada.ca',
  'F5nlnYixxpSTMfrEZ96t1Zipofs7NEiR8JjJm1+a1ts=',
  'diMDLMk1Cr22KXULCyjvhA==',
  'CJA Super Admin',
  'super_admin',
  0,
  datetime('now')
)
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  salt = excluded.salt,
  name = excluded.name,
  role = 'super_admin',
  disabled = 0,
  email_verified_at = COALESCE(users.email_verified_at, excluded.email_verified_at),
  updated_at = datetime('now');

-- Limited volunteer admins
INSERT INTO users (email, password_hash, salt, name, role, disabled, email_verified_at)
VALUES
  (
    'admin1@cjacanada.ca',
    'AoX1mKHD7axq9MhFsHj+zMD5Trs7fw+h+JxT7W6I2eA=',
    'dfW0ym3NC4U6ioSnca8EEw==',
    'CJA Admin 1',
    'admin',
    0,
    datetime('now')
  ),
  (
    'admin2@cjacanada.ca',
    'O+2BKaAJIo9Q886k3OXdyPpVJPGOCyrLSXUI0bi4UGI=',
    'nwz7stnW+CUmoVRK8Qcs2Q==',
    'CJA Admin 2',
    'admin',
    0,
    datetime('now')
  ),
  (
    'admin3@cjacanada.ca',
    'scGIG7tcdHThpMyeNZlGysyqngwD8aTXSK8beVkB92Y=',
    'HBzg00z+HoO9HbtN5F5mkw==',
    'CJA Admin 3',
    'admin',
    0,
    datetime('now')
  )
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  salt = excluded.salt,
  name = excluded.name,
  role = 'admin',
  disabled = 0,
  email_verified_at = COALESCE(users.email_verified_at, excluded.email_verified_at),
  updated_at = datetime('now');
