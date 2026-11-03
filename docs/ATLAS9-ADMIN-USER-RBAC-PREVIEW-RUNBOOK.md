# ATLAS-9 Administrator and User Portal RBAC

## Security model

- Google ID tokens are verified server-side (RS256, issuer, audience, nonce, expiry, and verified email).
- The immutable Google `sub` is the account key. Email is used only for the initial, exact-match bootstrap allowlist check.
- `users.role` is read from D1 for each authenticated request. A browser-selected portal is intent only and never grants a role.
- Existing users receive `role='user'` through the role migration default.
- Only the two owner-designated, verified Google identities in the bootstrap allowlist can be bootstrapped as administrator accounts. If an email is already attached to a different Google `sub`, bootstrap is denied.
- The bootstrap flow creates an ordinary `admin` role. It does not automatically grant `super_admin`.
- The project owner has designated both allowlisted identities as Super Administrators. Each must authenticate first, then receive a separately authorized Preview-only role promotion to `super_admin`.
- The administrator API gate fails closed for missing or unknown roles.

## Canonical migration sequence

The canonical files are:
- `0001_users.sql`
- `0002_sessions.sql`
- `0003_user_roles_and_admin_audit.sql`
- `0004_admin_bootstrap_allowlist.sql`
- `0005_user_approval_index.sql`

Do not use the deleted/alternate migration identity `0003_roles_admin_bootstrap.sql`. It duplicates the role and audit schema. The latest repository runbook records the canonical migrations as applied in staging, but the current Preview D1 migration ledger must be checked read-only before any operation. If all canonical migrations are present, do not rerun them.

## Preview provisioning sequence

1. Confirm the Preview database name and ID match the isolated staging binding in `wrangler.toml` and `wrangler.preview-migrations.toml`.
2. Read the migration ledger and schema. Confirm `users.role`, `sessions.revoked_at`, `admin_bootstrap_allowlist`, and `admin_audit_log`.
3. Verify both owner-designated Google identities against the allowlist and confirm each has exactly one active `users` row linked to its immutable Google `sub`.
4. Confirm both rows are ordinary `admin` or already `super_admin`; stop if missing, disabled, ambiguous, or mismatched.
5. Present the exact two-row Preview promotion and audit SQL for separate authorization. Do not execute based on a general “proceed” instruction.
6. After separately authorized provisioning, verify exactly two active `super_admin` rows and two attributable bootstrap audit events.

The prepared SQL template is maintained in `ATLAS9-USER-APPROVAL-PREVIEW-RUNBOOK.md`. It is not authorization to execute.

## Preview verification checklist

1. Sign in through Administrator Portal with each designated account.
2. Verify `/api/auth/me` reports `super_admin` for both after authorized provisioning.
3. Verify each account can list pending requests and approve/reject/suspend a synthetic standard user.
4. Verify an ordinary `admin` receives HTTP 403 `SUPER_ADMIN_REQUIRED` for user decisions.
5. Verify a standard user receives HTTP 403 `ADMIN_REQUIRED` from `/api/admin/session`.
6. Verify wrong-portal selection returns `ROLE_MISMATCH` and does not issue a session.
7. Verify logout revokes the opaque session and both portals return to the sign-in gate.
8. Re-run the complete Node test suite and Android browser smoke tests.

## Change-control boundary

This branch and its PR are code/documentation only until separately approved. Do not apply D1 migrations, promote roles in Preview, deploy to Preview or Production, merge, alter secrets, enable billing, or copy user data without the required separate authorization.
