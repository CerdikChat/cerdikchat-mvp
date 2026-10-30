CREATE TABLE IF NOT EXISTS pilot_users (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  google_sub TEXT UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER
);
CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  verifier TEXT NOT NULL,
  browser_binding_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expiry ON oauth_states(expires_at);
CREATE TABLE IF NOT EXISTS pilot_sessions (
  session_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL REFERENCES pilot_users(email) ON DELETE CASCADE,
  google_sub TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pilot_sessions_expiry ON pilot_sessions(expires_at);
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  email TEXT,
  created_at INTEGER NOT NULL
);
