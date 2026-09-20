-- Member accounts (§3C): verification / reset tokens, email outbox stub, admin MFA fields
-- Apply local:  npm run db:migrate:local
-- Apply staging: npm run db:migrate:staging

-- Email verification tokens (one-time, expiry-checked in app)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_verify_user ON email_verification_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_email_verify_token ON email_verification_tokens (token);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens (token);

-- Stub email / notification outbox (no SMTP in Phase 1).
-- Hook later: Resend or Cloudflare Email / Mailchannels worker that drains this table.
CREATE TABLE IF NOT EXISTS notification_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'log')),
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  meta_json TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'stubbed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_status ON notification_outbox (status);

-- Admin MFA (TOTP) — optional; enable via /admin/mfa
ALTER TABLE users ADD COLUMN totp_secret TEXT;
ALTER TABLE users ADD COLUMN totp_pending_secret TEXT;
ALTER TABLE users ADD COLUMN totp_enabled_at TEXT;

-- Sample member (documented in README). Password: SampleMember123!
-- PBKDF2-SHA256, 100000 iterations, 32-byte key. Sample only — rotate before real use.
INSERT OR IGNORE INTO users (email, password_hash, salt, name, role, disabled, email_verified_at)
VALUES (
  'member@example.com',
  '8pZhoy40WswUum0U+UGWstorWGcqkjsvf9XS872IYU8=',
  'dBll58SMHYdGUHV4pc1G8A==',
  'Sample Member',
  'member',
  0,
  datetime('now')
);
