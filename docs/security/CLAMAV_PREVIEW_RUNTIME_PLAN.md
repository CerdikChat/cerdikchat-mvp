# CerdikGo Antivirus Gateway — Private ClamAV Runtime Plan

**Status:** DESIGN + MOCK-CONTRACT TESTS ONLY. No scanner engine is provisioned or active.
**Environment:** Preview only. Production configuration, D1, routes, secrets, and billing remain unchanged.
**Decision owner:** Dr. Steven (Human Team Leader).

## 1. Objective and security boundary

All uploaded files must pass a real malware scan before document conversion, image processing, or AI inference. The existing upload handler calls `scanUploadedFile()` before `env.AI.toMarkdown()` and `env.AI.run()`. A file is accepted only when the private scanner returns a bounded, valid JSON verdict with all of these properties:

- `engine === "clamav"`
- `status === "clean"`
- non-empty `signatureVersion` (maximum 128 characters)

An infected verdict is rejected as `MALWARE_DETECTED`. Missing binding, transport failure, non-2xx response, timeout, invalid content type, oversized or malformed response, wrong engine, missing signature version, and unknown verdict all reject the file. Do not convert a failure into a clean verdict.

The upload handler's MIME, extension, size, and file-signature checks are supplementary controls. They are **not antivirus scanning** and must never be represented as such.

## 2. Target architecture (private service binding)

```text
Android / Browser
      |
      | authenticated multipart upload
      v
CerdikGo Preview Worker
      |
      | FILE_SCANNER Service Binding (private, no public scanner URL)
      v
Private ClamAV Scanner Runtime
      |-- ClamAV daemon / clamd
      |-- current virus-signature database
      |-- bounded scan request + bounded JSON verdict
      |
      +--> { engine, status, signatureVersion }
      |
      v
Preview Worker validates verdict
      |
      +-- clean + valid --> document conversion --> Workers AI
      |
      +-- infected ------> reject (422), no AI
      |
      +-- unavailable / malformed / timeout --> reject (503), no AI
```

The scanner must not write to Production D1, access application secrets, invoke AI, or call arbitrary external URLs. It receives only the uploaded bytes and MIME hint; filenames are not trusted. Keep scanner networking private and restrict inbound calls to the dedicated Preview Worker identity/binding.

## 3. Runtime provisioning decision

The current Cloudflare API check for the connected Primary account returned HTTP 401 with the explicit message that deploying Cloudflare Containers requires the Workers Paid plan. Therefore, Containers cannot currently be provisioned through the connected account context.

**No plan upgrade, payment, or billing change is authorized by this implementation task.** Do not attempt a paid deployment, create a paid external host, or use a public malware-scanning API. If the account owner later explicitly authorizes a paid runtime, use a private Cloudflare Container running a pinned ClamAV image with a maintained signature-update process and a private service interface. If a separately operated private host is evaluated instead, treat it as a new vendor/data-processing decision requiring separate approval and threat-model review.

Do not expose ClamAV's TCP daemon port to the public Internet. Do not place a scanner API key or service token in browser code, repository files, logs, or client-visible responses.

## 4. Binding and contract

The application expects a private Worker Service Binding named `FILE_SCANNER`. The binding must target the scanner Worker/service in the **Preview environment only**. The scanner endpoint contract is:

### Request

- Method: `POST`
- Content-Type: `application/octet-stream`
- Body: raw file bytes
- Header: `x-file-mime-type` (untrusted hint only)
- Cache-Control: `no-store`
- No user filename, cookies, bearer credentials, or application secrets.

### Successful clean response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{"engine":"clamav","status":"clean","signatureVersion":"<actual-db-version>"}
```

### Infected response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{"engine":"clamav","status":"infected","signatureVersion":"<actual-db-version>"}
```

The scanner must report the actual loaded signature database version, not a hardcoded placeholder. A stale or unavailable signature database must not produce a clean verdict. The scanner should cap input size, execution time, concurrency, and response size; record only minimal security telemetry (request ID, duration, verdict category, engine/database version), never file contents.

## 5. Preview test plan and release gates

Run in a disposable Preview environment with a dedicated staging scanner and non-production test files. The following are required before marking the gateway operational:

| Test | Expected outcome | Required evidence |
|---|---|---|
| EICAR standard anti-malware test string in a permitted test file | Reject as infected; no AI invocation | Scanner log identifies EICAR; Worker returns `MALWARE_DETECTED` |
| Known benign test file | Clean verdict; downstream analysis may proceed | Actual ClamAV response and current signature version |
| Scanner binding absent | Reject 503 | Worker response; AI invocation count remains zero |
| Scanner service unavailable / 5xx | Reject 503 | Worker response and no downstream processing |
| Scanner timeout | Reject 503 | Bounded timeout evidence and no downstream processing |
| Malformed JSON / wrong content type / oversized response | Reject 503 | Contract test result |
| Unknown verdict / wrong engine / missing database version | Reject 503 | Contract test result |
| Android Chrome upload | Same policy as API tests | Screen recording plus request ID and server-side trace |
| Production isolation | No Production resource touched | Deployment metadata and resource audit |

**EICAR is a test signature, not malware.** Use only the official standard EICAR test file/string in an isolated Preview test. Do not upload real malware samples.

A mock binding or unit test can validate application behavior but cannot prove that ClamAV is installed, signatures are current, or files are genuinely scanned. Do not count mock tests as runtime verification.

## 6. Existing implementation and local checks

- `multimodal/file-scanner.js`: scanner boundary and strict fail-closed response validation.
- `multimodal/file-analysis.js`: invokes the scanner before document conversion and AI inference.
- `multimodal/file-scanner.test.js`: mock-contract regression tests for clean, infected, absent binding, transport error, malformed response, oversized response, unknown verdict, and invalid input.
- `wrangler.toml`: Preview D1 points to `cerdikchat-staging`; Production D1 remains `cerdikchat-db`. Do not edit Production bindings as part of this work.

Run:

```sh
npm test
npx wrangler deploy --dry-run
```

A successful local/CI run proves only application contract behavior and bundle validity. It does not prove live ClamAV scanning.

## 7. Change-control rules

1. Keep the implementation on a dedicated feature branch and Draft PR until reviewed.
2. Do not merge, promote, or deploy to Production.
3. Do not modify Production Worker settings, bindings, secrets, routes, D1, DNS, or billing.
4. Do not create D1 migrations or write application data for scanner tests.
5. Do not set a green/active badge until EICAR is rejected and a benign file is accepted by a real Preview ClamAV engine, with traceable evidence.
6. Preserve fail-closed behavior throughout the rollout.

## 8. Acceptance criteria

The gateway can be marked **VERIFIED IN PREVIEW** only when all of the following are evidenced:

- A private ClamAV runtime is actually provisioned and reachable through the Preview-only binding.
- The scanner reports a real, current signature database version.
- EICAR is rejected; benign test file is accepted.
- Scanner unavailable, timeout, malformed response, and unknown verdict all fail closed.
- The upload path demonstrates no AI invocation for infected or indeterminate files.
- Android end-to-end test succeeds.
- Production isolation is independently confirmed.

Until every criterion passes, the truthful status is:

**ANTIVIRUS GATEWAY: FAIL-CLOSED / SCANNER RUNTIME NOT PROVISIONED / PREVIEW RUNTIME VERIFICATION PENDING.**


## 9. WPS Office Premium — document workflow integration boundary

The project owner supplied Android screenshots showing an active WPS Premium membership through 2027-12-13, 20 GB WPS Cloud allocation, and document/PDF productivity features. The screenshots do not show a malware scanner, ClamAV engine, malware-scanning API, or server-side scanner endpoint.

Permitted use:
- Author, edit, convert, watermark, merge, recover, and store project documents using the owner's WPS Premium account.
- Use WPS Cloud as an optional human-managed document workspace or backup destination only after reviewing sharing permissions, retention, and data sensitivity.
- Keep WPS credentials, account identifiers, and cloud access tokens out of the repository, Worker client code, logs, and public issue/PR comments.

Not permitted / not evidenced:
- Treat WPS Premium membership, PDF conversion, document encryption, camera scanning, or Android storage permission as antivirus protection.
- Claim that WPS scans CerdikGo uploads or supplies a ClamAV-compatible verdict.
- Integrate WPS Cloud as an automated CerdikGo backend without a documented, authorized API and a separate privacy/security review.
- Upload confidential user files to a third-party service merely to obtain a malware verdict.

Security decision: WPS Premium is a document productivity and optional human-operated storage adjunct. It does not satisfy the `FILE_SCANNER` contract and does not change the fail-closed gate. ClamAV remains NOT PROVISIONED until a real scanner runtime passes the Preview acceptance tests in this plan.
