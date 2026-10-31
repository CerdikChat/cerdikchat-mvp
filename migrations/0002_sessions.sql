-- CerdikChat Phase 2: opaque server-side sessions.
-- Apply only to an isolated test D1 database first.
CREATE TABLE IF NOT EXISTS sessions (
  session_hash TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  FOREIGN KEY (google_sub) REFERENCES users(google_sub)
);
CREATE INDEX IF NOT EXISTS idx_sessions_google_sub ON sessions(google_sub);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
