-- CerdikGo feature request intake.
-- Schema only: review and explicitly authorize Preview D1 migration before use.
CREATE TABLE IF NOT EXISTS feature_requests (
  request_id TEXT PRIMARY KEY,
  user_google_sub TEXT NOT NULL,
  user_email TEXT NOT NULL COLLATE NOCASE,
  category TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  description TEXT NOT NULL,
  problem TEXT NOT NULL,
  expected_benefit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'accepted', 'declined', 'completed')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status_created
  ON feature_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_created
  ON feature_requests(user_google_sub, created_at);
