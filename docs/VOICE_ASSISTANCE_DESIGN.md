# ATLAS-9 Voice Assistance — Engineering Design

Status: Draft design / implementation gate  
Branch: `atlas9/voice-assistance-foundation`  
Parent: PR #32 (`atlas9/pdf-image-analysis-integration`)  
Product: CerdikChat core / CerdikGo workspace

## 1. Objective

Add practical, mobile-first voice input and spoken responses without disrupting the existing chat and PDF/image-analysis workstream. Keep the first release compatible with the current single-Worker, Workers AI architecture and the Cloudflare Free-first cost policy.

## 2. Release scope (MVP)

### Voice input (speech-to-text)

- Capture audio only after an explicit user tap and browser microphone permission.
- Use `MediaRecorder` with a browser-supported recording format; inspect `MediaRecorder.isTypeSupported()` rather than assuming a codec.
- Submit one bounded audio recording to a same-origin Worker endpoint.
- Authenticate with the existing session, require User Portal role, validate same-origin and CSRF, and apply a dedicated per-user rate limit.
- Transcribe with Cloudflare Workers AI `@cf/openai/whisper` (multilingual ASR). Pass a validated, bounded audio payload to the model and return only the transcript.
- Insert the transcript into the existing composer for user review/editing; do not silently submit it as a chat message.
- Do not persist raw audio or transcript beyond the normal chat submission flow.

### Voice output (text-to-speech)

- MVP uses the device/browser Web Speech API (`speechSynthesis`) to read assistant responses aloud when the user taps “Bacakan”.
- Provide play/stop controls and graceful fallback when the browser has no speech synthesis or Indonesian voice.
- Do not autoplay speech, capture microphone audio while speaking, or read sensitive/authentication UI.
- Keep response text in the existing conversation; audio playback is client-side and is not stored.

### Deferred (not in MVP)

- Full-duplex / real-time conversational audio, WebSocket streaming, interruption/barge-in, speaker diarization, voice cloning, and persistent audio storage.
- Server-side TTS until Indonesian voice quality, supported language, model access, and quota/cost are explicitly verified.

## 3. Model and cost decision

- Initial STT candidate: `@cf/openai/whisper`; Cloudflare documents it as multilingual ASR and lists unit pricing at approximately 41.14 Neurons per audio minute.
- Workers AI Free allocation is documented as 10,000 Neurons/day; usage beyond this requires Workers Paid. No billing upgrade is authorized.
- Estimated model consumption for a 60-second sample: approximately 41.14 Neurons, subject to actual audio duration and model accounting. This is an estimate, not a guarantee of availability or free-tier capacity.
- TTS MVP: browser/device speech synthesis (no Workers AI inference). Cloudflare's `@cf/myshell-ai/melotts` is listed as multilingual, but its current model page does not establish Indonesian support; do not enable it for Indonesian until verified.
- Official references:
  - https://developers.cloudflare.com/workers-ai/models/%40cf/openai/whisper/
  - https://developers.cloudflare.com/workers-ai/models/melotts/
  - https://developers.cloudflare.com/workers-ai/platform/pricing/
  - https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
  - https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

## 4. Security and privacy requirements

1. User Portal only; enforce role authorization in the Worker, not only in browser UI.
2. Require an authenticated session, same-origin request, and existing CSRF validation.
3. Use a dedicated voice rate-limit binding/namespace; do not silently reuse chat capacity.
4. Set conservative audio byte and duration limits; reject empty, malformed, unsupported, or oversized uploads before model inference.
5. Allow only an explicit audio MIME/codec allowlist; validate file signature/container where practical. Never trust browser MIME alone.
6. Do not accept remote audio URLs, arbitrary callback URLs, or client-selected model IDs.
7. Never log raw audio, transcript content, cookies, CSRF tokens, or credentials.
8. Return generic errors; do not expose provider internals or stack traces.
9. Treat transcription as untrusted user input; it must not bypass chat policy, authorization, or tool confirmation.
10. No audio persistence, R2 bucket, D1 schema change, third-party key, or paid plan in MVP.

## 5. UX acceptance criteria

- Microphone control is visible in the composer and clearly indicates idle, recording, processing, success, and error states.
- Browser permission is requested only after a deliberate tap.
- User can stop/cancel recording; recording has a hard maximum duration.
- Transcript appears in the composer and can be edited before sending.
- Assistant responses have an explicit “Bacakan” control; playback can be stopped.
- No automatic recording or autoplay.
- Layout remains usable on Android Chrome at narrow viewport widths and with keyboard open.
- If microphone or speech synthesis is unsupported/denied, normal text chat remains fully functional.

## 6. Test matrix

- Valid short Indonesian recording; mixed Indonesian/English; quiet and noisy samples.
- Unsupported browser codec; permission denied; no microphone; empty recording; user cancellation.
- Oversized payload; duration limit; spoofed MIME/signature; malformed audio.
- Missing/expired session; admin and super_admin role rejection; missing/invalid CSRF; cross-origin request.
- Rate limit exceeded; Workers AI binding unavailable; model/quota failure; empty transcript.
- Transcript review/edit before submission; no accidental auto-send.
- TTS supported Indonesian voice, no Indonesian voice, unsupported API, stop during playback, no autoplay.
- Regression: chat and PDF/image analysis continue to work.

## 7. Implementation sequence

1. Add a standalone `multimodal/voice-assistance.js` handler and focused unit tests.
2. Add same-origin `/api/voice/transcribe` route in `worker.js`.
3. Add dedicated voice rate-limit configuration for Preview only; no Production configuration changes.
4. Add progressive-enhancement microphone and “Bacakan” controls to the mobile workspace.
5. Run CI and security review; deploy only to isolated Preview.
6. Request owner Human Audit on Android Chrome with non-sensitive sample audio.
7. Keep PR Draft until CI, Preview inference, quota behavior, and Human Audit pass.

## 8. Explicit release gates

This document is a design baseline, not evidence that Voice Assistance is implemented or operational. No merge, Production deployment, Production D1 migration, secret/OAuth change, billing change, or user provisioning is authorized by this workstream. PR #32 remains a dependency and must retain its own validation gates.
