# Mandatory upload malware scanning

## Current state

The upload-analysis route now requires a private `FILE_SCANNER` service binding and fails closed when it is missing, unavailable, times out, returns an invalid verdict, or reports an indeterminate result. No uploaded file reaches PDF conversion or Workers AI inference before a clean scanner verdict.

## Required scanner service

The binding must target a separately operated, private ClamAV-backed service. The service must:
- accept raw file bytes over an internal Service Binding request;
- scan the complete byte stream using ClamAV;
- maintain and update malware signature databases;
- return JSON with `engine: "clamav"`, `status: "clean" | "infected"`, and a non-empty `signatureVersion`;
- return a non-success HTTP response on scanner errors, timeout, unsupported input, or incomplete scanning;
- never persist uploads, or have a documented short-lived quarantine/deletion policy;
- enforce request size, concurrency, timeout, and memory limits.

Do not expose the scanner as a public unauthenticated endpoint. The Worker-to-scanner Service Binding is the trust boundary.

## Deployment gate

The repository does not currently contain a ClamAV runtime, and a Cloudflare Worker alone is not an antivirus engine. Do not claim antivirus is active until a real scanner service is provisioned, bound only in Preview, and validated with clean files plus the EICAR test file. Do not send user files to public scanning websites or third-party APIs without explicit privacy and data-transfer approval.

No scanner binding is configured yet. Therefore file analysis intentionally returns `FILE_SCAN_UNAVAILABLE` until the Preview scanner service is available. This is the required fail-closed behavior.

## Validation

- clean ClamAV verdict: allow subsequent processing;
- infected verdict: reject before conversion/inference;
- missing binding, scanner error, timeout, malformed verdict, unknown engine/status: reject;
- scanner failure must never fall back to MIME/signature-only validation.

## Operations

Scanner signature freshness, engine version, resource limits, alerting, and retention/deletion controls must be monitored. Do not log file bytes, filenames, user prompts, credentials, or scanner payloads.
