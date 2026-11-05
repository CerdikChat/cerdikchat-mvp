# Governance migration 0007 — Preview preflight

This procedure is read-only and applies only to the isolated Preview database
`cerdikchat-staging` (ID `79267e63-e57f-4237-8b88-f1e477397771`).

## Required order

1. Confirm the active branch is `atlas9/admin-governance-control-center`.
2. Confirm migration 0006 is recorded as applied.
3. Run the duplicate-pending-request preflight below.
4. Review every returned request manually. Do not delete, merge, or overwrite pending requests automatically.
5. Apply migration 0007 only when the preflight returns zero rows.
6. Verify the new governance tier and audit-event schema with read-only queries.
7. Keep Production untouched.

## Read-only duplicate preflight

Run:

```sh
npx wrangler d1 execute cerdikchat-staging --remote --config wrangler.preview-migrations.toml --file scripts/governance-migration-preflight.sql
```

Expected result: zero rows. Migration 0007 intentionally creates a unique partial
index for one pending request per normalized email. If duplicates exist, SQLite
will reject the index creation and the migration must remain unapplied until an
administrator resolves the duplicate records with an explicit, reviewed decision.
The preflight itself makes no data changes.

## Post-migration verification

```sql
SELECT name, type FROM sqlite_master
WHERE name IN ('governance_tier','admin_audit_events',
               'idx_access_requests_one_pending_email');
```

For the column, use:

```sql
PRAGMA table_info(users);
```

Do not treat a successful schema check as approval to promote accounts or deploy
Production. Account decisions remain subject to the Admin Console's authenticated
approval flow and a separate Production authorization.
