# WPS Office + CerdikGo — Integration Phase 1

## Scope
This branch adds an isolated Android document handoff and text-based AI workspace without modifying existing chat, authentication, D1, secrets, or Worker routes.

## Implemented in this phase
- A separate WPS Office entry point injected additively into the existing workspace.
- Accepts DOC/DOCX, XLS/XLSX, PPT/PPTX, PDF and OpenDocument file selection from Android.
- Uses the browser Web Share API to open the Android share sheet with the selected file; the user chooses WPS if installed and offered by Android.
- Falls back to downloading a copy and instructing the user to open it from Android file manager.
- AI workspace accepts text explicitly pasted by the user and sends that text to the existing /api/chat endpoint.
- Original Office binaries remain client-side; no file persistence or upload is added.
- AI output is rendered as text, not HTML.

## Explicit limitations
- This phase does NOT embed WPS editor.
- Browser share sheets vary by Android/browser/WPS version; app availability is not guaranteed.
- DOCX/XLSX/PPTX binary parsing and direct AI document upload are NOT implemented. Users must copy text from WPS and paste it into the AI workspace.
- No Android PWA share_target receiver is included yet.
- No production deployment, D1 write/migration, secret access, billing, or Worker config changes.

## Next engineering gates
1. Verify Android share/open behavior on the user's device with DOCX, XLSX and PPTX.
2. Select and validate a safe server-side parser/conversion path for Office formats (format-specific limits, malware scanning, zip-bomb protection, macros disabled, bounded extraction).
3. Add structured extraction tests and document prompt-injection isolation.
4. Consider inbound Android Share Target only after PWA/service-worker architecture and payload handling are verified.
5. Keep this branch as a draft until human device verification and CI pass.
