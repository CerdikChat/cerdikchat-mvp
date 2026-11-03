# CerdikGo Feature-Preserving Dashboard Migration

## Objective
Migrate the existing, working dashboard capabilities from `atlas9/voice-to-ai-full-interaction` into the conversation-first CerdikGo dashboard without replacing the new visual design or weakening authentication/security.

## Source and target
- Feature source: `atlas9/voice-to-ai-full-interaction`
- Supporting sources: `atlas9/secure-upload-ui`, `atlas9/beta-pilot-multimodal-workspace`
- Target UI: `atlas9/cerdikgo-workspace-redesign`
- Migration branch: `atlas9/cerdikgo-feature-preserving-migration`

## Verified legacy feature inventory
The legacy `src/index.html` contains these feature controls and implementation functions:

| Capability | Legacy DOM anchors | Legacy implementation |
|---|---|---|
| Light/dark theme | `themeToggle`, `settingsDialog` | `readThemePreference`, `applyTheme` |
| Voice recording and review | `voiceRecord`, `voiceState`, `voiceReview`, `voiceTranscript` | `startVoiceRecording`, `transcribeVoice`, `setVoiceState`, `stopVoiceTracks` |
| Voice-to-AI handoff | `voiceSendToAI`, `voiceUseTranscript`, `voiceDiscard` | `sendMessage`, voice review handlers |
| Secure file analysis UI | `analysisFile`, `chooseUpload`, `analyzeUpload`, `uploadPanel` | `updateUploadControls`, `analyzeSelectedFile` |
| Feature requests | `requestFeatureOpen`, `requestFeatureDialog`, `requestFeatureForm` | feature request form handlers |
| Workspace feature catalogue | `featureToggle`, `featureWorkspace`, `featureGrid` | feature workspace handlers |
| User/admin portal | `portalGate`, `chooseAdminPortal`, `chooseUserPortal` | `loadPendingUsers`, `approvePendingUser` |
| Navigation | `navToggle`, `navBackdrop`, `sideNavigation` | `closeNavigation`, mobile navigation handlers |
| Conversation utilities | `feed`, `jumpLatest`, `expandComposer` | `scrollToLatest`, `updateLatestAnswerControl` |

## Migration rules
1. Keep the conversation-first dashboard layout, branding, responsive behavior, and accessible navigation from the target branch.
2. Port the legacy feature UI components and their matching JavaScript as complete units; do not copy buttons without their handlers.
3. Preserve shared auth/session/CSRF APIs and server-side allowlist/RBAC enforcement. Never move authorization decisions to client-side code.
4. File analysis must continue to use the existing authenticated server endpoint and server-side validation. Do not add public object storage or persist uploads unless separately approved.
5. Voice recording must remain user-initiated, permission-gated, bounded by size/duration, and release microphone tracks on stop/error/navigation.
6. Theme preference should remain accessible and persist locally without changing auth/session state.
7. Feature requests must clearly disclose their submission destination. The legacy implementation copies a request summary for the user; do not represent that as a server-side ticket submission.
8. Keep all changes on this migration branch and Preview. No Production Worker, D1, OAuth client, secrets, or billing changes.

## Acceptance tests
- [ ] Existing Google Sign-In and authorized session remain functional.
- [ ] Existing unauthorized-user rejection remains fail-closed.
- [ ] Mobile navigation opens/closes with Escape, backdrop, and focus restoration.
- [ ] Theme toggles light/dark and survives reload.
- [ ] Microphone permission denial is handled; successful recording can be reviewed, edited, and sent to AI.
- [ ] Microphone tracks stop after recording, cancel, and error.
- [ ] PDF/image upload validates allowed type and size and uses authenticated analysis endpoint.
- [ ] Upload error, timeout, and oversized-file states are clear.
- [ ] Feature request form validates fields and accurately reports copy/submission behavior.
- [ ] Chat send, history/session behavior, logout, and CSRF protections remain intact.
- [ ] Android viewport, touch targets, keyboard, and reduced-motion behavior pass.

## Source references
- Feature implementation: `src/index.html` on `atlas9/voice-to-ai-full-interaction`
- Current redesigned target: `src/index.html` on `atlas9/cerdikgo-workspace-redesign`


## Expanded cross-layer inventory (verified against legacy branch)

### Frontend capabilities and controls
- [ ] Google account panel, sign-in, current-user state, logout, auth unavailable/error states.
- [ ] Portal selection: User Portal and Admin Portal; UI visibility is not authorization.
- [ ] Admin user approval queue: refresh pending users, status, approve/reject decisions, admin identity and logout.
- [ ] Feature catalogue drawer/section and feature request dialog/form. Legacy request handler copies a structured request summary; no server ticket endpoint was found in this UI.
- [ ] Light/dark theme with persisted preference and system-preference fallback.
- [ ] Mobile navigation drawer, backdrop, Escape handling, focus restoration and viewport sizing.
- [ ] Chat composer, character count, send state, expand composer, prompt suggestions, latest-answer jump control.
- [ ] Markdown/basic response rendering, math cleanup, inline rendering, answer acceptance control, and speech playback control where supported.
- [ ] Voice recording, microphone permission/error state, recording duration/bounds, transcript review/edit, send-to-AI, use-in-composer, discard, and microphone-track cleanup.
- [ ] File selection and analysis panel; PDF and supported image formats; filename/status, choose, analyze, disabled/loading/error states.
- [ ] Network status indication and PWA/offline shell behavior.

### Backend routes found in legacy Worker
- `GET /api/auth/config` — public OAuth configuration and CSRF bootstrap metadata.
- `POST /api/auth/request-access` — user access request.
- `GET /api/admin/users/pending` — administrator pending-user queue.
- `POST /api/admin/users/decision` — administrator approval/rejection.
- `POST /api/auth/google` — Google credential exchange.
- `GET /api/auth/me` — current authenticated session.
- `POST /api/auth/logout` — session logout.
- `GET /api/admin/session` — admin-role session gate.
- `POST /api/analyze` — authenticated PDF/image analysis.
- `POST /api/voice/transcribe` — authenticated audio transcription.

### Backend modules and controls
- `auth/google-auth.js`: Google ID-token signature/audience/nonce validation, session lifecycle, CSRF, same-origin checks, role and allowlist enforcement, access requests and admin approval.
- `multimodal/file-analysis.js`: 10 MiB file limit, bounded multipart/text extraction, explicit PDF/JPEG/PNG/WEBP/GIF allowlist, signature validation, encrypted-PDF rejection, CSRF/session checks, non-persistent analysis, sanitized provider errors.
- `multimodal/voice-assistance.js`: Cloudflare Whisper transcription, 3 MiB audio limit, 60-second duration limit, explicit WebM/OGG/WAV allowlist/signature checks, authenticated session, User role, CSRF/origin validation and rate limiting.
- Worker chat: bounded message/history, same-origin and Fetch Metadata checks, rate limiting, deterministic calculator, sanitized errors, AI binding, no persistent conversation storage.
- PWA: manifest, icon assets, service worker shell cache and offline fallback. API/auth requests are excluded from offline caching.

### Tests and documentation found
- `tests/worker.test.mjs`: chat, auth, CSRF, same-origin, rate-limit, file analysis, PDF validation and admin-session boundary coverage.
- `tests/voice-assistance.test.mjs`: voice endpoint auth, CSRF, type/signature, duration/size and transcription behavior.
- `tests/user-approval.test.mjs`, `tests/rbac-migration-reconciliation.test.mjs`, `tests/google-auth-bootstrap-race.test.mjs`, `tests/pwa.test.mjs`.
- `docs/VOICE_ASSISTANCE_DESIGN.md`, `docs/BETA-PILOT-MULTIMODAL-WORKSPACE-PLAN.md`, admin/user approval runbooks and auth implementation/design docs.

## Delta check: legacy UI versus redesigned UI
The following legacy DOM IDs were found in the source and are absent from the redesigned `src/index.html` at commit `e72ce401`:
`networkState`, `featureToggle`, `requestFeatureOpen`, `themeToggle`, `portalGate`, `portalTitle`, `chooseAdminPortal`, `chooseUserPortal`, `portalGoogleSignIn`, `adminSettingsSection`, `adminPlaceholder`, `adminDashboardTitle`, `adminLogout`, `adminDisplayName`, `adminEmail`, `userApprovalModule`, `refreshPendingUsers`, `pendingUsersStatus`, `pendingUsersList`, `requestFeatureDialog`, `requestFeatureTitle`, `requestFeatureClose`, `requestFeatureForm`, `requestFeatureName`, `requestFeatureCategory`, `requestFeatureDetails`, `requestFeatureCancel`, `requestFeatureFeedback`, `featureWorkspace`, `featureGrid`, `uploadPanel`, `uploadFileName`, `analysisFile`, `chooseUpload`, `analyzeUpload`, `uploadHelp`, `jumpLatest`, `jumpLatestButton`, `authGate`, `authGateOpen`, `voiceRecord`, `voiceState`, `voiceReview`, `voiceTranscript`, `voiceSendToAI`, `voiceUseTranscript`, `voiceDiscard`, `expandComposer`.

This is a structural delta, not proof every listed ID is independently a user-facing feature. Each corresponding capability must be mapped to a new component or explicitly documented as intentionally retired.

## Important gaps / decisions before calling migration complete
1. Legacy Admin Portal and user-approval UI is absent from the redesign. Confirm whether the new admin workflow replaces it; otherwise restore it with server-enforced admin role.
2. Feature request is clipboard-based in legacy UI, not a persisted backend ticket. Do not claim a request is submitted to a team inbox without a real endpoint/integration.
3. Legacy Worker advertises no persistent conversation storage. Do not promise cross-device/history persistence unless a separate persistence feature is implemented and tested.
4. Voice input is Whisper-backed transcription; browser speech synthesis is a separate optional output capability. Verify both distinctly.
5. PWA offline mode caches only the shell/navigation fallback, not offline AI chat or API operations.
6. Verify all static assets and service-worker registration in the actual deployment; the redesign tree still contains PWA files, but runtime registration/behavior needs test confirmation.
7. Ensure the redesigned Worker retains the file-analysis and voice-transcription imports/routes. UI migration alone is insufficient.
8. Confirm all rate-limit bindings and staging environment configuration exist before Preview acceptance. Do not change Production bindings as part of this migration.

## Inventory completion criteria
- Every legacy user-facing capability has a target component, event handler, backend route (where required), and regression test.
- Every legacy backend route is accounted for as preserved, replaced with an equivalent, or intentionally retired with a documented reason.
- Every test suite and security boundary relevant to the migrated capability is run against the migration branch.
- Preview Android acceptance is completed before Production consideration.
