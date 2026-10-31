# ATLAS-9 Beta Pilot — Multimodal Workspace Delivery Plan

Status: implementation branch opened; Preview/staging only.
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
- No paid plan, billing activation, paid resource, or quota upgrade without explicit approval.
- Rate-limit by authenticated user and IP where appropriate; add file-specific limits to prevent abuse.

## Release control

- This branch is for code and Preview/staging validation only.
- No Production Worker deployment, Production D1 writes/migrations, secrets changes, merge to `main`, or public Beta announcement is included.
- Each gate requires test evidence and review before the next gate is enabled.
- Keep the Beta V0.1 production baseline unchanged until release approval.

## Evidence references

- Cloudflare Workers AI Gemma 4 model page: https://developers.cloudflare.com/ai/models/@cf/google/gemma-4-26b-a4b-it/
- Cloudflare Workers AI supported rich-content formats: https://developers.cloudflare.com/workers-ai/features/markdown-conversion/supported-formats/
- Cloudflare Workers AI model changelog: https://developers.cloudflare.com/changelog/post/2026-04-04-gemma-4-26b-a4b-workers-ai/
