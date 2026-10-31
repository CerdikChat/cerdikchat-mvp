# ATLAS-9 Secure User Approval & Onboarding (PR #30)

## Scope
- A Google-verified identity can submit a standard-user access request.
- New requests are stored as `users.status='pending'` and `users.role='user'`.
- A pending request does not create a login session.
- Only an authenticated administrator can list pending users and approve or suspend a standard-user account.
- Approval changes only `status` from `pending` to `active`; it never changes a role.
- Suspension changes only `status` from `active` to `suspended`.
- Every administrator decision is recorded in `admin_audit_log`.
- Google `sub` remains the immutable identity key; email is used only to locate the account for an administrator's decision.

## API
- `POST /api/auth/request-access`: same-origin + CSRF protected; accepts a Google GIS credential and nonce; returns HTTP 202 with `status: pending`; no session cookie is issued.
- `GET /api/admin/users/pending`: requires an active admin/super_admin session; returns at most 100 pending standard-user records.
- `POST /api/admin/users/decision`: requires an active admin/super_admin session and CSRF; body `{"email":"user@example.com","decision":"approve"}` or `{"email":"user@example.com","decision":"suspend"}`.

## Preview-only migration
Migration `0005_user_approval_index.sql` adds a lookup index only. Review the D1 binding before applying; do not run against Production. No migration is automatically applied by this PR.

## Human test checklist
1. Use a dedicated Google account that is not in the administrator allowlist.
2. Submit an access request; expect HTTP 202 and a pending message.
3. Confirm the account cannot log in while pending; expect `USER_NOT_ALLOWLISTED` and no session.
4. Sign in as an approved administrator; retrieve pending users.
5. Approve the dedicated test account.
6. Sign in through User Portal; verify `/api/auth/me` reports role `user`.
7. Verify `/api/admin/session` returns HTTP 403 `ADMIN_REQUIRED` for that user.
8. Verify Administrator Portal selection returns `ROLE_MISMATCH` and no session.
9. Suspend the test user and verify existing sessions stop working because session validation checks `users.status='active'`.
10. Verify audit log entries for approval and suspension; never expose Google subject/session identifiers in UI or logs.

## Safety boundaries
- This PR is code-only until separately approved for Preview migration and deployment.
- No Production D1, Production deployment, OAuth configuration, secrets, billing, or merge changes.
- Do not use the project owner's real identity as a standard-user test account.
- The administrator UI may consume these APIs only after explicit frontend integration and Preview validation; do not present mock approval controls.
