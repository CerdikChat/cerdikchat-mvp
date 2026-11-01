# ATLAS-9 Phase 2 — Preview D1 migration runbook

## Scope
This runbook applies schema migrations only to the isolated Cloudflare D1 database
`cerdikchat-staging` (ID: `79267e63-e57f-4237-8b88-f1e477397771`).

It must not be used with `cerdikchat-db` or any Production configuration.

## Current staging status (31 October 2026)
The two numbered migrations have already been applied to the isolated staging database through the Cloudflare D1 API. The standard `d1_migrations` table records `0001_users.sql` and `0002_sessions.sql`. Verification confirmed both application tables, their indexes, and the sessions-to-users foreign key. Both application tables contain zero rows.

For the current staging database, run `migrations list` first; do not manually replay SQL. The `apply` command below is intended for a fresh staging database or any future unapplied migration.

## Preflight
1. Confirm the active branch is `atlas9/phase-2-google-auth-implementation`.
2. Confirm `wrangler.preview-migrations.toml` still points to the staging database ID above.
3. Confirm the staging database contains no pilot user records.
4. Do not add users until their Google immutable `sub` values have been verified.

## Apply migrations
Run the following commands from the repository root:

```bash
npx wrangler d1 migrations list cerdikchat-staging --remote --config wrangler.preview-migrations.toml
npx wrangler d1 migrations apply cerdikchat-staging --remote --config wrangler.preview-migrations.toml
npx wrangler d1 migrations list cerdikchat-staging --remote --config wrangler.preview-migrations.toml
```

The expected applied migrations, in order, are:
1. `0001_users.sql`
2. `0002_sessions.sql`

Wrangler records applied migrations in D1's `d1_migrations` table.

## Add an approved pilot user (separate approval)
Only after the Google account has been verified and the account owner has approved access, insert its verified immutable `google_sub` and email. Do not guess or use an email address alone.

```sql
INSERT INTO users (google_sub, email, display_name, status)
VALUES ('VERIFIED_GOOGLE_SUB', 'pilot@example.com', 'Pilot User', 'active');
```

The login endpoint returns the verified `googleSub` and email only after Google token verification when the account is not yet allowlisted. Treat the subject as a stable personal identifier and share it only with the administrator provisioning the pilot.

## Verify schema
Execute this read-only query against `cerdikchat-staging`:

```sql
SELECT name, type
FROM sqlite_master
WHERE type IN ('table', 'index')
  AND name IN (
    'users',
    'sessions',
    'idx_users_status',
    'idx_sessions_google_sub',
    'idx_sessions_expiry'
  )
ORDER BY type, name;
```

Expected application objects: `users`, `sessions`, and the three indexes above.

## Safety gate
- No Production D1 migration.
- No Production Worker variable or secret changes.
- No seed data or pilot-user inserts in this migration step.
- Keep PR #20 Draft until Preview authentication and session lifecycle tests pass.
