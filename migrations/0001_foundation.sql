-- Foundation (§3A): users with roles + sessions
-- Apply: npx wrangler d1 migrations apply <database_name> --local
-- Remote staging: npx wrangler d1 migrations apply cja-website-db-staging --remote --env staging

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  disabled INTEGER NOT NULL DEFAULT 0,
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- Sample admin only (documented in README). Password: SampleAdmin123!
-- PBKDF2-SHA256, 100000 iterations, 32-byte key. Rotate before any real use.
INSERT OR IGNORE INTO users (email, password_hash, salt, name, role, disabled, email_verified_at)
VALUES (
  'admin@example.com',
  'G7olvGLnN/dzj0HqBqik9tCX7FivVpmgAKu5Rzcs9HI=',
  'd276/5/dA2UWHJpUY3Oc4A==',
  'Sample Admin',
  'admin',
  0,
  datetime('now')
);
