# ATLAS-9 Beta Pilot — Multimodal Workspace Delivery Plan

Status: implementation branch open; Preview/staging only.
Base: `atlas9/phase-2-google-auth-implementation`
Production changes: none authorized.
Billing changes: none authorized.

## Release objective

Prepare a controlled Beta Pilot that delivers demonstrably working text chat, PDF/document analysis, image understanding, voice interaction, persistent workspace, and bounded research/agent assistance. A roadmap label is not a release claim: each capability remains disabled or marked experimental until its acceptance tests pass.

## Delivery gates

### Gate 0 — Identity and Preview foundation
- Keep Google Sign-In and D1 session work inherited from Phase 2.
- Complete browser-based allowlisted, unlisted, disabled-user, logout, expiry and revocation tests.
- Do not seed administrator roles as part of this feature branch.
- Keep RBAC PR #21 separate and deferred until the identity baseline is reviewed.
- Keep all migrations and test data isolated to the staging D1 database.

### Gate 1 — PDF, document and image analysis
- Add authenticated upload endpoints; require a valid session and CSRF protection.
- Accept only an explicit allowlist of MIME types and extensions; verify file signatures rather than trusting browser MIME values.
- Initial pilot limits: 10 MiB per file, one file per request, bounded extracted text/image payload, and request timeout handling. Revisit limits only with test evidence.
- Reject encrypted/password-protected PDFs, malformed files, unsupported formats, and files exceeding limits with clear user-facing errors.
- Treat uploaded content as untrusted data. Never follow instructions found inside a document or image; use it only as material to analyze.
- Use the existing Cloudflare Workers AI binding and configured model. The official model catalogue identifies `@cf/google/gemma-4-26b-a4b-it` as vision-capable. Validate the exact image payload schema against the live model before enabling the UI.
- PDF strategy: use a supported extraction/conversion path or bounded page rendering; do not assume a PDF binary can be passed directly as an image. Preserve page references where extraction supports them.
- Do not persist uploaded files in the pilot unless retention, deletion, access control, and storage costs are explicitly designed and approved.

Acceptance:
- Valid image and text-based PDF can be analyzed in Preview with clear output.
- Unsupported, oversized, malformed, and unauthenticated uploads are rejected.
- No secrets, file contents, raw prompts, or personal data are written to routine logs.
- Regression tests cover MIME spoofing, size limits, empty files, malformed files, auth, CSRF, and AI failures.

### Gate 2 — Voice interaction
- Browser microphone capture only after an explicit user gesture and permission.
- Show recording state, elapsed time, cancel, retry, and clear permission errors.
- Separate speech-to-text from text-to-speech providers and verify supported model IDs, quotas, and cost before selecting a provider.
- Do not store raw audio by default.

Acceptance:
- Android Chrome recording, transcription, playback, permission denial, and unsupported-browser tests pass.
- Audio is not sent until the user confirms submission.

### Gate 3 — Persistent conversation workspace
- Define user-scoped conversation and message schema, retention, deletion, and export behavior before implementation.
- Enforce ownership checks server-side on every read/write.
- Avoid storing uploaded source files by default; store only user-approved conversation metadata and content under a documented retention policy.
- Add pagination and per-user quotas.

Acceptance:
- Conversations survive refresh and login on the same account.
- Cross-user access is denied.
- Delete/export and retention behavior are verified.

### Gate 4 — Research and bounded AI tools
- Build on explicit allowlisted tools with schema validation, per-tool authorization, execution limits, and audit events.
- No arbitrary network fetch, shell, code execution, or unrestricted browsing from model-generated tool arguments.
- Multi-step orchestration must have maximum steps, timeouts, budget/usage guardrails, and user-visible confirmation for consequential actions.

Acceptance:
- Tool allowlist, invalid arguments, excessive steps, timeouts, and permission boundaries are tested.
- Tool execution is distinguishable from model-generated claims.

### Gate 5 — Beta Pilot readiness
- Closed cohort, synthetic/non-sensitive test data, support contact, incident rollback plan.
- Measure successful sign-in, task completion, error rate, latency, quota consumption, and user-reported issues.
- Publish only capabilities that have passed acceptance and security review.

## Cost and platform guardrails

- Prefer Cloudflare Free allowances and existing Workers AI allocations.
- Workers AI is usage-priced; verify current account allowance and model pricing before pilot load testing. Do not assume a model is free merely because it is Cloudflare-hosted.
- Current Cloudflare model catalogue lists `@cf/google/gemma-4-26b-a4b-it` at $0.10 per million input tokens and $0.30 per million output tokens. Markdown image conversion also invokes Workers AI processing models. Account-specific Free allocation and actual billable usage must be checked before load testing.
- No paid plan, billing activation, paid resource, or quota upgrade without explicit approval.
- Rate-limit by authenticated user and IP where appropriate; add file-specific limits to prevent abuse.

## Release control

- This branch is for code and Preview/staging validation only.
- No Production Worker deployment, Production D1 writes/migrations, secrets changes, merge to `main`, or public Beta announcement is included.
- Each gate requires test evidence and review before the next gate is enabled.
- Keep the Beta V0.1 production baseline unchanged until release approval.

## Evidence references

- Cloudflare Workers AI Gemma 4 model page: https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/
- Cloudflare Workers AI supported rich-content formats: https://developers.cloudflare.com/workers-ai/features/markdown-conversion/supported-formats/
- Cloudflare Workers AI Markdown Conversion binding: https://developers.cloudflare.com/workers-ai/features/markdown-conversion/usage/binding/
- Cloudflare Workers AI conversion options: https://developers.cloudflare.com/workers-ai/features/markdown-conversion/conversion-options/
- Cloudflare Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/

## Engineering status — 31 October 2026

### Verified
- `POST /api/analyze` implementation is committed on `atlas9/beta-pilot-multimodal-workspace`.
- Endpoint requires a D1 session, same-origin request, and CSRF double-submit validation.
- One-file multipart upload is bounded to 10 MiB plus multipart overhead; MIME, extension, and basic file signatures are checked.
- Cloudflare Workers AI Markdown conversion is followed by Gemma 4 analysis; extracted file content is explicitly treated as untrusted data.
- Uploaded files are processed in memory; this endpoint does not persist source files.
- Regression tests cover successful PNG/PDF paths, authentication, CSRF, cross-origin rejection, spoofed MIME/signature, prompt-injection isolation, file-size limits, and encrypted-PDF rejection before conversion/inference.
- Encrypted-PDF guard returns HTTP 422 (`ENCRYPTED_PDF_UNSUPPORTED`) when an explicit `/Encrypt` entry is detected. This is a conservative first-line signature check, not comprehensive PDF cryptographic validation.
- GitHub Actions run #23 on HEAD `945cae2` completed successfully; the Node.js regression suite job and all workflow steps passed.
- Cloudflare Preview build and deployment for HEAD `945cae2` both succeeded (build UUID `fa69f6be-371f-4404-b3dc-cd2b0430fc44`). Preview URL: https://atlas9-beta-pilot-multimodal-workspace-cerdikchat-mvp.ngyoonseong.workers.dev (deployment-specific URL: https://2a725f2d-cerdikchat-mvp.ngyoonseong.workers.dev).
- CI and Preview evidence validates the code pipeline only; it does not establish live Workers AI conversion/inference or authenticated Android browser acceptance.
- PR #22 remains open and Draft; it is not merged.

### Still pending — Gate 1 is NOT complete
- Live runtime verification of the `env.AI.toMarkdown()` binding and its actual conversion result on the deployed Preview.
- Live Workers AI Gemma 4 inference and account-specific quota/usage verification.
- Authenticated Android Chrome end-to-end tests using a controlled test account and non-sensitive sample files.
- Negative-path live verification for malformed and real password-protected/encrypted PDFs, unsupported format, model quota exhaustion, and conversion failures.
- Confirm that Preview uses the intended isolated staging D1 and rate-limiter bindings; do not test with Production data.

Do not enable upload UI or mark Gate 1 complete until all pending checks pass. No Production deployment, billing activation, secrets change, merge, user-data copy, or public launch is authorized.


### Supplemental security hardening — 31 October 2026
- Extended encrypted-PDF first-line detection to decode PDF name escapes (`#XX`), including the obfuscated `/#45ncrypt` representation of `/Encrypt`.
- Added a regression test proving escaped encryption-name rejection occurs before conversion and inference.
- An initial CI attempt exposed a delimiter-scanner defect; it was corrected before the final validation run.
- Final HEAD `40f954f`: GitHub Actions run #31 passed; all 49 regression tests passed.
- Cloudflare Preview build `e022a388-9c4b-4d9f-a4d7-9ca6b932f9af` completed successfully and deployed to the stable Preview URL; deployment-specific URL: https://775feacc-cerdikchat-mvp.ngyoonseong.workers.dev.
- The PDF detector remains a conservative first-line guard, not a complete PDF parser or cryptographic validator. Real encrypted and malformed PDF acceptance tests remain required.


## OAuth Preview blocker — 31 October 2026

### Observed evidence
- Android Chrome screenshot shows Google Identity Services error: `Error 400: origin_mismatch`.
- The current branch uses the Google Identity Services JavaScript ID-token flow (`google.accounts.id.initialize`) with the configured `GOOGLE_CLIENT_ID`.
- The Worker verifies the returned ID token server-side, including signature, issuer, audience, expiry, nonce, and email verification. The login endpoint additionally enforces same-origin, CSRF, rate limiting, D1 allowlisting, and session creation.
- This error occurs at Google's browser-origin authorization gate, before the credential is posted to `/api/auth/google`. It is not evidence of a D1/session or model-inference failure.

### Required Google Cloud Console configuration
- In the Google Cloud project that owns the exact OAuth 2.0 **Web application** client ID configured for this Preview, add the Preview's exact origin to **Authorized JavaScript origins**:
  `https://atlas9-beta-pilot-multimodal-workspace-cerdikchat-mvp.ngyoonseong.workers.dev`
- Origin means scheme + hostname + optional port only; do not append a path or trailing slash.
- Keep existing Production origins unchanged. Do not replace the Production client configuration with the Preview origin.
- Confirm the Preview Worker receives the same intended Web application client ID after the Console change. Never expose or commit client secrets.
- Save the OAuth client configuration, allow propagation, then retry from the exact Preview hostname.

### Acceptance gate
- Google popup/button must open without `origin_mismatch`.
- Verify an allowlisted test account completes sign-in and `/api/auth/me` reports an authenticated session.
- Verify an unlisted account is rejected without creating a session.
- Verify logout revokes the session and subsequent `/api/auth/me` is unauthenticated.
- Re-run CSRF, same-origin, nonce, token-audience, and session-expiry regression tests.
- Keep upload locked and do not authorize Production, billing, or public Beta changes until these checks pass.

### Change boundary
- No OAuth client configuration could be changed through the connected GitHub/Cloudflare tools; no Google Cloud Console connector is available in this workspace.
- This is an external OAuth client allowlist configuration step, not a code workaround. Do not weaken origin checks, token verification, CSRF, or session controls to bypass it.
