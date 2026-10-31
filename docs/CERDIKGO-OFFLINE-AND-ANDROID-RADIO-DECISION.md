# CerdikGo — Offline PWA and Android Radio Capability Decision

Status: Phase 1 scope — offline app shell only.

## Verified product boundary
- PWA installability does not imply offline chat, offline AI inference, local message persistence, or radio connectivity.
- This phase adds a cached app shell and explicit offline fallback only.
- Chat, Google authentication, file analysis, and all /api/* endpoints remain network-only and are never cached.
- No messages, credentials, tokens, uploads, AI responses, or personal records are persisted by this phase.

## Android FM/AM distinction
- FM receiver availability varies by device model, chipset, regional firmware, antenna path and vendor software; a wired headset may be required as antenna.
- AM reception is not a universal Android handset feature and must not be assumed.
- A PWA has no standard browser API to reliably discover or control a phone's proprietary FM/AM tuner. Native integration requires device-specific support and real-device validation.
- Broadcast FM/AM is receive-only in this context. It is not bidirectional mesh networking or an internet replacement.
- Do not show a working FM/AM tuner control until a supported device/API and physical test are established.

## Separate connectivity tracks
1. Offline app shell: service worker and non-sensitive static shell cache.
2. Offline work/data: future explicit user-consented local drafts/outbox with retention, encryption and conflict rules.
3. Local AI: separate model/runtime and device capability assessment.
4. FM/AM broadcast: optional native receiver integration on verified compatible Android hardware.
5. Radio mesh: separate certified gateway/radio hardware, protocol, spectrum authorization and field testing.

## Security invariants
- Never cache /api/*, authentication endpoints, session responses, chat, AI output, uploaded files, or user-specific content.
- Do not store auth tokens or credentials in Cache Storage or IndexedDB.
- Restrict service worker to same-origin navigation fallback; no cross-origin caching.
- Version and clean only this application's own cache namespace.
- Offline status must never be represented as AI online or connected.
- FM/AM receiver must not be described as two-way communication or mesh.

## Acceptance tests
- First online visit installs the service worker and precaches the app shell.
- Subsequent airplane-mode reload displays the cached CerdikGo shell.
- A navigation without cached shell displays offline fallback.
- /api/chat, /api/analyze and /api/auth/* are never intercepted or cached.
- No session/chat content appears in Cache Storage.
- Reconnect restores normal online requests without stale API data.
- Test Android Chrome in browser tab and installed-PWA launch.
- Verify logout/session expiry after reconnect.

## Not delivered
Offline messaging, offline chat history, local AI inference, FM/AM tuning, audio capture, radio transmission, mesh networking, background sync or data replication.
