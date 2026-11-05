# CerdikGo Adaptive Validation Gates (Preview)

Status: implementation baseline for Primary Preview; not a claim of Production readiness.

## Simplified model

CerdikGo uses four gates. Each gate must return a clear pass, deny, or unavailable result. A required security control must never be treated as passed when it is unavailable.

1. **Identity & Session** — verify Google identity, server-issued session, account status, role, session expiry, and revocation.
2. **Request & Document** — validate HTTP method, origin/CSRF where applicable, content type, size limits, and supported file format before processing.
3. **Security & Capability** — enforce server-side authorization, configured rate limits, required scanner availability, and feature/model binding availability. Missing mandatory controls fail closed.
4. **Result & Audit** — return a bounded, safe response; keep facts distinct from unsupported claims; record privileged decisions in the audit log. Audit viewing is read-only and Super Admin-only.

## Human verification workflow

- Sign in through the intended Primary Preview portal.
- Confirm the server-reported role and session state.
- Run one positive and one negative test for each applicable gate.
- Inspect the Super Admin audit feed for the recorded administrative event.
- Record PASS only when the actual Preview response and audit evidence are observed. A code change or CI pass alone is not runtime verification.

## Current implementation evidence

- Google identity verification and opaque server-side sessions are implemented in `auth/google-auth.js`.
- The Worker routes chat, document analysis, voice transcription, authentication, and administration in `worker.js`.
- The Super Admin-only, GET-only audit feed reads the existing `admin_audit_log` and exposes no session IDs or tokens.
- The Preview UI preserves the `super_admin` role and displays the audit feed only for that role.
- Existing file-analysis scanner behavior must be tested against the actual configured scanner. This document does not assert that a scanner is provisioned or that malware scanning is live.
- WPS document analysis remains a separate manual workflow unless a verified, authorized integration is implemented.

## Explicit non-goals

- No attempt to reproduce private ChatGPT internals.
- No bypass of authentication, authorization, CSRF, or security checks to simplify testing.
- No Production deployment, D1 migration/write, secret/OAuth change, DNS change, or billing activation.
- No claim that Preview runtime has been updated until a deployment is observed and smoke tests pass.
