# CerdikGo — Zero-Cost On-Demand ClamAV Design

Status: DESIGN ONLY — not implemented, not connected to a Worker, and not production-ready.

## Mission constraints

- Keep the GitHub repository private.
- Target no user payment and no paid Cloudflare/GitHub upgrade.
- The product currently targets a maximum of 30 users; this is a product constraint, not proof of a hard server-side account cap. Verify enforcement separately.
- Do not store user documents in Git, commits, workflow logs, caches, or long-lived Actions artifacts.
- Do not use self-hosted runners.
- Do not bypass malware scanning. Scanner unavailable, quota exhausted, timeout, invalid response, or missing signature metadata means reject/defer the file (fail closed).
- Preview-only development; no Production deployment, D1 migration/write, secret changes, DNS changes, or merge as part of this design note.

## Important compatibility finding

The current scanner interface is synchronous: `multimodal/file-analysis.js` calls `scanUploadedFile(env, bytes, mime)` and expects a verdict before `AI.toMarkdown()` and `AI.run()`. `multimodal/file-scanner.js` expects a private Cloudflare Service Binding named `FILE_SCANNER`.

GitHub Actions is asynchronous and cannot be substituted for that Service Binding directly. An on-demand Actions design requires a separate job lifecycle:
1. Worker authenticates the user and checks quota/limits.
2. Worker stores the file in a private, short-lived staging location (not GitHub).
3. Worker creates a job ID and dispatches a GitHub Actions workflow using a narrowly scoped GitHub App installation token or equivalent least-privilege credential.
4. An ephemeral GitHub-hosted runner downloads the file via a one-time, short-lived, job-bound URL; runs ClamAV; captures engine and signature database version; and returns only a signed verdict.
5. Worker validates job ID, signature/authentication, expiry, file digest, scanner engine, signature version, and verdict before releasing the file to AI processing.
6. Staging object and runner workspace are deleted; runner exits.
7. The user polls job status or receives a completion response. This flow is asynchronous; it is not an instant synchronous scanner.

The staging service, callback authentication, dispatch credential, and quota accounting are not yet implemented or selected. They must be selected only after their free-tier limits, retention, security, and account billing controls are verified. Do not put user files into workflow inputs, GitHub repository content, logs, or artifacts.

## Zero-cost policy and limits

GitHub Free includes a finite monthly allowance of GitHub-hosted Actions minutes for private repositories (commonly 2,000 minutes, subject to current GitHub policy and account settings). This is not an unlimited perpetual free compute guarantee. GitHub can change plan limits and policies. Do not claim “free forever”.

Before enabling any runner:
- Verify the repository's current plan, remaining Actions minutes, billing settings, and spending controls in GitHub.
- Configure a strict concurrency limit (initially 1), timeout, maximum file size, and monthly scan budget.
- Ensure usage beyond included quota cannot silently create charges; if this cannot be guaranteed in account settings, do not enable dispatch.
- Never use self-hosted runners; they can incur platform charges for private repositories under applicable GitHub billing rules.
- On quota exhaustion or uncertainty, return a clear unavailable/queued response and fail closed. Never fall back to unscanned AI processing.

Thirty registered users do not by themselves guarantee free operation. Cost depends on scan frequency, file size, runner duration, signature update time, and concurrent jobs. Calculate a conservative monthly scan budget after measuring real runner duration.

## Required verification before implementation

- Confirm hard server-side maximum of 30 active users (not just a UI limit).
- Confirm exact GitHub plan and Actions minute allowance for this private repository.
- Confirm billing/spending settings can enforce a hard stop before paid usage.
- Select and verify a private short-lived staging mechanism with a free quota; do not assume it is unlimited.
- Design least-privilege dispatch and signed callback authentication without exposing tokens.
- Define retention, deletion, file digest binding, replay protection, and request idempotency.
- Add queue status and rate limiting per user and globally.
- Add tests for EICAR detection, clean file, oversized file, corrupt file, timeout, missing signature DB version, invalid callback signature, replay, duplicate job, exhausted quota, and staging cleanup.
- Verify no file bytes or secrets appear in Actions logs, artifacts, cache, or repository.
- Perform Preview-only end-to-end tests before any Production proposal.

## Acceptance rule

A file may reach AI parsing only after a valid, authenticated, unexpired, job-bound ClamAV verdict of `clean` with a non-empty signature database version. Every other state blocks processing.

## Current disposition

No workflow, storage, GitHub credential, Worker binding, or application code has been added by this design note. Existing `FILE_SCANNER` Service Binding architecture remains unchanged. This document is a proposal for review, not evidence of a working antivirus service.
