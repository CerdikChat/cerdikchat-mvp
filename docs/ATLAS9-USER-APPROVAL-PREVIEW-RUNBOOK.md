# ATLAS-9 Secure User Approval & Onboarding (PR #30)

## Scope
- A Google-verified identity can submit a standard-user access request.
- Pending identities are stored in a separate `user_access_requests` table.
- The existing `users.status` constraint remains unchanged: `active` or `disabled`.
- A pending request does not create a `users` row or a login session.
- An authenticated `admin` or `super_admin` can list pending requests.
- Only an authenticated `super_admin` can approve, reject, or suspend a standard-user account; ordinary `admin` receives HTTP 403 `SUPER_ADMIN_REQUIRED`.
- Approval creates a `users` row with `status='active'` and `role='user'`.
- Suspension changes `users.status` from `active` to `disabled` and revokes all sessions for that Google subject in the same D1 batch.
- Every administrator decision is recorded in `admin_audit_log`.
- Google `sub` remains the immutable identity key; email is used only to locate a request for an administrator's decision.

## API
- `POST /api/auth/request-access`: same-origin + CSRF protected; accepts a Google GIS credential and nonce; returns HTTP 202 with `status: pending`; no session cookie is issued.
- `GET /api/admin/users/pending`: requires an active admin/super_admin session; returns at most 100 pending standard-user requests.
- `POST /api/admin/users/decision`: requires an active `super_admin` session and CSRF; body `{"email":"user@example.com","decision":"approve"}`, `reject`, or `suspend`.
- The approval INSERT enforces the 30-active-standard-user ceiling (`role='user'`) inside the write statement. Administrator and Super Administrator accounts do not consume pilot seats. A full pilot returns HTTP 409 `PILOT_CAP_REACHED`.
- Approval/rejection updates the request queue and audit log in one D1 batch. Approval creates only a standard-user account.

## Owner-approved Super Administrator designation (Preview only)

The project owner has explicitly designated **two** verified administrator identities as Super Administrators:
- Primary Super Admin: owner-designated primary Google account.
- Secondary Super Admin: owner-designated secondary Google account.

Do not copy personal email addresses or Google subject identifiers into source code, public PR descriptions, screenshots, or public logs. Resolve the exact two identities privately from the owner's approved designation and verify each against the authenticated Google identity and the existing bootstrap allowlist.

Important implementation detail: the bootstrap allowlist creates an ordinary `admin` row on first successful administrator sign-in. Allowlisting alone does not grant `super_admin`. Both accounts must first authenticate through the Administrator Portal so their active `users` rows are created with their immutable Google `sub`. Then, after separate explicit authorization for the Preview D1 write, promote exactly those two active `admin` rows to `super_admin`.

### Read-only preflight (no writes)
1. Confirm the target is the isolated `cerdikchat-staging` database and that its ID matches the Preview D1 binding in `wrangler.toml` and `wrangler.preview-migrations.toml`.
2. Inspect `d1_migrations` and confirm the canonical migration identities and statuses.
3. Confirm `users.role`, `sessions.revoked_at`, `admin_bootstrap_allowlist`, and `admin_audit_log` exist.
4. Confirm both owner-designated identities appear in the allowlist and each maps to exactly one active `users` row by immutable Google `sub`.
5. Confirm both target rows currently have `role='admin'` or are already `super_admin'`. Stop if either identity is missing, disabled, ambiguous, or linked to a different Google subject.
6. Record only aggregate counts and migration names in the engineering report; keep emails and Google subjects out of public logs.

### Prepared role-promotion SQL (DO NOT EXECUTE without separate approval)

The following is a preparation template, not an instruction to run now. Replace the two private placeholders only in the authorized Preview D1 console/session. Require the preflight to show exactly two matching active administrator rows before proceeding.

```sql
-- Preview staging only. Both identities must be owner-approved and verified.
UPDATE users
SET role = 'super_admin', updated_at = unixepoch()
WHERE email IN ('<PRIMARY_OWNER_APPROVED_EMAIL>', '<SECONDARY_OWNER_APPROVED_EMAIL>')
  AND status = 'active'
  AND role = 'admin'
  AND (
    SELECT COUNT(*)
    FROM users
    WHERE email IN ('<PRIMARY_OWNER_APPROVED_EMAIL>', '<SECONDARY_OWNER_APPROVED_EMAIL>')
      AND status = 'active'
      AND role = 'admin'
  ) = 2;

-- Check the UPDATE result metadata: exactly 2 rows must have changed.
-- If the result is not exactly 2, STOP; do not run the audit INSERT.

INSERT INTO admin_audit_log
  (actor_google_sub, target_google_sub, action, previous_role, new_role, details_json, created_at)
SELECT google_sub, google_sub, 'SUPER_ADMIN_BOOTSTRAPPED', 'admin', 'super_admin',
       json_object('source', 'owner-approved-preview-bootstrap'), unixepoch()
FROM users AS target
WHERE email IN ('<PRIMARY_OWNER_APPROVED_EMAIL>', '<SECONDARY_OWNER_APPROVED_EMAIL>')
  AND status = 'active'
  AND role = 'super_admin'
  AND NOT EXISTS (
    SELECT 1 FROM admin_audit_log AS audit
    WHERE audit.action = 'SUPER_ADMIN_BOOTSTRAPPED'
      AND audit.target_google_sub = target.google_sub
  );
```

The audit event attributes each controlled self-bootstrap to the corresponding verified Google subject (actor and target are the same subject). Verify privately that exactly two active rows have `role='super_admin'` and that each has one corresponding audit event. Do not expose identities or subjects in public logs.

## Canonical Preview migration sequence

The canonical migration files are:
1. `0001_users.sql`
2. `0002_sessions.sql`
3. `0003_user_roles_and_admin_audit.sql`
4. `0004_admin_bootstrap_allowlist.sql`
5. `0005_user_approval_index.sql`

The latest repository runbook records migrations `0001` through `0005` as applied in `cerdikchat-staging`, with `users.role` and `sessions.revoked_at` present. This is prior documented evidence, not a substitute for a fresh read-only check of the current Preview database ledger.

Do not apply the deleted/alternate migration identity `0003_roles_admin_bootstrap.sql`; it duplicates the role and audit schema and can fail with a duplicate-column error. If the live Preview ledger confirms all five canonical migrations are applied, **no migration is required** for Super Admin designation: only the separately authorized two-row role promotion is needed. If the ledger differs, stop and prepare a reconciliation plan; do not improvise or execute migrations.

The migration-only configuration `wrangler.preview-migrations.toml` points to the staging D1 binding. It must never be used for Production. Confirm its database ID against the Preview binding before any authorized operation.

## Human acceptance checklist
1. Use a dedicated Google identity that is not in the administrator allowlist for standard-user testing.
2. Submit a User Portal access request; expect HTTP 202 and a pending message.
3. Confirm no session cookie is issued and the pending identity cannot access chat or Admin endpoints.
4. Sign in with each of the two owner-designated accounts through the Administrator Portal.
5. Verify each account is active and has the expected immutable Google subject.
6. After separately authorized Preview provisioning, verify both accounts independently return `role='super_admin'` from `/api/auth/me`.
7. Verify both can list pending requests and perform approve/reject/suspend actions.
8. Verify an ordinary `admin` receives HTTP 403 `SUPER_ADMIN_REQUIRED` for decisions.
9. Verify a standard user receives HTTP 403 `ADMIN_REQUIRED` from `/api/admin/session`.
10. Approve a synthetic test user, verify role `user`, then suspend the user and confirm all sessions are revoked.
11. Verify audit records for both Super Admin bootstraps and subsequent user decisions.
12. Verify the 30-active-standard-user cap, including the final-seat/concurrent-approval case.

## Safety boundaries
- Code and documentation changes on feature branches are allowed under Controlled Autopilot.
- Preview D1 migration or role updates require separate, explicit action-specific authorization.
- No Production D1 writes/migrations, Production deployment, OAuth configuration, secrets, billing, or merge changes are authorized by this runbook.
- Do not use either owner's real identity as a standard-user test account.
- The dashboard approval panel consumes real APIs; it must display API errors and must not show mock records or simulated success.
