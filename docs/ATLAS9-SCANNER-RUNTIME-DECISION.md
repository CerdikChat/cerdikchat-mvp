# ATLAS-9 Scanner Runtime Decision Record

Date: 1 November 2026  
Scope: Preview/staging only; Workers Free; no billing or third-party file transfer.

## Decision

Keep the mandatory FILE_SCANNER gate fail-closed. Do not deploy a JavaScript-only signature matcher and label it antivirus. Do not return a synthetic clean verdict from a production-facing binding.

ClamAV is a native antivirus engine with signature databases and archive/document parsing. A Worker adapter is only a transport and policy boundary; it is not the scanning engine.

## Verified platform constraints

- Workers Free allows 10 ms CPU time per invocation and 128 MB isolate memory.
- Cloudflare Containers are unavailable on Free; Containers are billed as Workers Paid usage (minimum USD 5/month Workers Paid plan).
- ClamAV's documented engine is a shared library/daemon/CLI toolkit; its official documentation does not provide a supported drop-in Cloudflare Workers runtime.

References:
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers pricing and Containers: https://developers.cloudflare.com/workers/platform/pricing/
- ClamAV documentation: https://docs.clamav.net/

## Candidate runtime paths

### A. User-controlled Linux host (preferred zero-new-billing feasibility trial)

Run ClamAV on a Linux host already owned and administered by the project owner. Expose only a narrowly scoped scanner API through a private authenticated tunnel. The application Worker should call a small scanner gateway that validates the request and relays bytes to the engine.

Requirements:
- No public unauthenticated ClamAV daemon or TCP/3310 exposure.
- Tunnel ingress restricted with authentication and source controls.
- No file persistence by default; if temporary buffering is unavoidable, enforce restrictive permissions and deletion on every exit path.
- Enforce 10 MB file cap, concurrency cap, 8-second request deadline, and bounded response.
- Keep signature database freshness observable; reject stale/unknown database state.
- Do not place tunnel credentials in browser code or public vars.
- Verify privacy, physical availability, power, network, and operator maintenance before calling this a reliable service.

This option has no new hosting bill only if suitable hardware, power, and connectivity already exist. It is not yet provisioned or approved.

### B. Cloudflare Containers

Technically relevant for containerized ClamAV, but not compatible with the current Workers Free / no-billing policy. Do not enable.

### C. External scanning API

Not selected. It transfers uploaded documents to a third party and needs explicit privacy/data-transfer approval, terms review, quota review, and cost review.

### D. WASM ClamAV

Research-only. ClamAV's official documentation describes WASM as a proposed/proof-of-concept runtime for executing WASM signatures, not a supported complete ClamAV engine compiled to run inside Workers. Do not treat it as available.

## Integration contract

The current Worker-side adapter requires a private binding named FILE_SCANNER and accepts only:
- HTTP success;
- Content-Type: application/json;
- response body no larger than 2,048 bytes;
- engine: clamav;
- status: clean or infected;
- non-empty signatureVersion.

Any missing binding, error, timeout, oversized/malformed response, unknown engine/status, or stale signature state must fail closed. The current adapter checks format but the future scanner service must additionally enforce signature freshness and actual full-file scan completion.

## Runtime activation gates

1. Scanner engine installed and version recorded.
2. Signature database updated and freshness policy enforced.
3. Private transport/authentication tested.
4. Clean test files return a real clean verdict.
5. EICAR test file is detected and rejected before PDF conversion or AI inference.
6. Timeout, unavailable engine, stale signatures, truncated scan, malformed response, and overload all fail closed.
7. No file bytes, filenames, prompts, tokens, or scanner response payloads written to logs.
8. Preview-only binding confirmed; Production remains untouched.
9. Android Chrome upload test passes with non-sensitive test files.

Until all gates pass, antivirus status remains NOT ACTIVE and file analysis remains blocked when the scanner is unavailable.
