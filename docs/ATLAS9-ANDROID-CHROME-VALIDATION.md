# ATLAS-9 Android Chrome Validation Runbook

Date: 1 November 2026  
Target: CerdikChat/CerdikGo Beta Preview  
Device: Android Chrome; owner-operated manual validation  
Data policy: use synthetic, non-sensitive test files only.

## Safety rules

- Use Preview only. Do not test on Production.
- Never upload identity documents, health records, business confidential files, passwords, or real customer data.
- Do not use a real malware sample. Use the standard harmless EICAR antivirus test string only in the isolated Preview security test, and confirm it is rejected before AI processing.
- Do not share screenshots containing email addresses, OAuth codes, cookies, session identifiers, tokens, or personal data.
- Stop testing if the Preview hostname, login flow, or environment is uncertain.

## Before starting

- [ ] Open the approved Preview URL supplied by the project team.
- [ ] Confirm the address bar shows HTTPS and the expected workers.dev hostname.
- [ ] Confirm this is Preview, not the Production hostname.
- [ ] Sign in with an authorized test account.
- [ ] Confirm the session is valid and the workspace is responsive.
- [ ] Record Android version, Chrome version, date/time, and Preview build/commit (no personal identifiers).

## Functional upload matrix

| ID | Test | Expected result | Evidence |
|---|---|---|---|
| A01 | Open workspace on Android Chrome | Page loads without broken layout | Screenshot with sensitive UI hidden |
| A02 | Open Security Update page | Page clearly says scanner is being validated, not active | Screenshot |
| A03 | Select a small valid PNG | Upload flow accepts file only when scanner returns verified clean | Result and HTTP status |
| A04 | Select a small valid PDF | Same; conversion/inference only after clean scan | Result and HTTP status |
| A05 | Select unsupported file type | Rejected; no AI processing | Error code |
| A06 | Select renamed/spoofed file (e.g. text renamed .png) | Signature mismatch rejected | Error code |
| A07 | Select file above 10 MB | Rejected before scanner/AI | Error code |
| A08 | Scanner binding unavailable | HTTP 503 FILE_SCAN_UNAVAILABLE; no conversion/inference | Result |
| A09 | Scanner timeout / network failure | Fail closed; no AI processing | Result |
| A10 | Scanner returns infected verdict | HTTP 422 MALWARE_DETECTED; no conversion/inference | Result |
| A11 | Scanner returns malformed/oversized/unknown verdict | Fail closed; no AI processing | Result |
| A12 | EICAR test file in Preview | Scanner detects it; file never reaches AI | Scanner test record and API result |
| A13 | Return to workspace after rejection | User can continue normally; no stale loading overlay | Screenshot |
| A14 | Refresh page / reopen session | No unexpected logout or UI corruption | Observation |

## Manual execution on Android

1. Open Chrome and enter the approved Preview URL manually.
2. Verify HTTPS and hostname before entering credentials.
3. Sign in using the approved test account.
4. Open the document/image analysis workspace.
5. For clean-file checks, use a synthetic one-page PDF and a simple sample PNG created specifically for testing.
6. For rejection checks, use a harmless text file renamed to .png, an unsupported .txt, and a file larger than the stated limit if available.
7. Ask the test operator to simulate scanner unavailable, timeout, infected, malformed, and oversized verdicts in Preview. Do not try to create a fake clean verdict from the browser.
8. Capture only status/error code and sanitized screen evidence.
9. Sign out and close the Preview tab when finished.

## Defect severity

- Critical: infected/EICAR file reaches conversion or AI; scanner failure allows processing; Production binding/data touched.
- High: scanner reports clean without real ClamAV scan; signature freshness not enforced; private scanner endpoint is publicly reachable.
- Medium: valid file rejected unexpectedly; timeout/error handling unclear; upload UI remains stuck.
- Low: cosmetic spacing, labels, or non-blocking accessibility issue.

## Result record

For each test, record: Test ID, PASS/FAIL/BLOCKED, build SHA, timestamp, HTTP status/error code, sanitized evidence reference, defect ID, corrective action, retest result.

Do not mark the antivirus feature ACTIVE until A03/A04, A08-A12, Preview binding isolation, and the ClamAV runtime gates have passed.
