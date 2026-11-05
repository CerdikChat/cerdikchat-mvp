# CerdikGo Validation Gate UX

## Purpose
Make feature and service outcomes understandable without interpreting icons or colors. The gate is visible directly below the system status deck.

## Decision vocabulary
- **ACCEPTED** — the specific check returned a successful result; show the evidence.
- **REJECTED** — the specific check failed; show the rejection reason and next action.
- **PENDING** — no evidence has been reported in the current page session; never imply success.
- **NOT AVAILABLE** — a required service/dependency is unavailable; explain the known cause.
- **NOT APPLICABLE** — the check does not apply to the item.

## Current implementation
- Adds an accessible, expandable Validation Gate panel.
- Lists AI Core, document analysis/malware scan, WPS Office Android, Hybrid Connectivity and Protection Mode.
- Defaults to PENDING with an explicit explanation. This is intentional: the browser cannot infer a successful server, scanner, WPS app, or physical mesh test from a static label.
- Exposes `window.CerdikGoValidationGate.report(id, status, reason)` for feature modules to publish evidence-based outcomes.
- Rejects REJECTED and NOT AVAILABLE reports without a reason.
- WPS AI text analysis reports ACCEPTED only after a successful HTTP response from `/api/chat`, or REJECTED with the request error.
- This gate is a session-level UX display; it does not claim to be a signed audit ledger or persistent governance record.

## Remaining gates
- Instrument existing chat, file scan, voice, authentication, connectors and admin actions with their own real outcomes and precise rejection reasons.
- Add server-origin evidence where a client-side result alone is insufficient.
- Verify language switching (ID/EN/ZH), Android screen reader, small viewport and keyboard behavior.
- Test the WPS share flow on a physical Android device.
- Do not mark WPS app launch ACCEPTED merely because the Android share sheet opened.
- No Production deployment, merge, D1 migration/write, secret/OAuth/DNS change or billing action is included.
