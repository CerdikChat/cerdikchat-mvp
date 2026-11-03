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
