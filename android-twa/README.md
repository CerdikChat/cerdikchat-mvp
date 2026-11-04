# CerdikGo Android TWA preparation

Status: preparation only. This directory is not a generated or buildable Android project.

## Identity and approved Preview origin

- Approved Preview hostname (Human Team Leader): `id.cerdikgo.app`
- HTTPS origin candidate: `https://id.cerdikgo.app`
- Preferred Android package candidate: `id.cerdikgo.app`
- These are separate concepts even though their strings match.
- Package candidate format: syntactically valid reverse-DNS Android application ID.
- Google Play package availability/registration: **NOT VERIFIED**.
- Package lock status: **PROVISIONAL — DO NOT REGISTER OR PUBLISH YET**.
- Preview hostname approval does not prove DNS, TLS/HTTPS, Worker routing, deployed assets, or endpoint health.

Package names are unique and permanent in Google Play. The repository cannot establish availability or registration eligibility. The owner must check Play Console > Android developer verification > Package names (or the Create app flow) while signed in to the intended verified developer account. For a never-seen package, Play Console may register it when creating the app, subject to developer identity verification and the public signing-certificate step. Existing/previously seen package names may require eligible-key proof or a request to Google. Do not create a Play Console app merely to test availability.

Indonesia is included in the Android developer verification rollout: package registration has been required since 30 September 2026. Confirm the developer account's identity verification and package registration status before release.

## Chosen distribution route

Use a Trusted Web Activity (TWA) generated with Bubblewrap, reusing the existing CerdikGo PWA. Do not introduce Capacitor or a second native frontend unless a required native capability proves TWA insufficient.

## PWA assets — repository inspection

- The PWA repository contains `src/icons/icon-192.png` and `src/icons/icon-512.png`, plus `src/cerdikgo-mark.svg`.
- The web manifest declares the two PNG assets and retains the SVG mark.
- The repository does **not** yet contain a separately validated maskable icon. Do not mark the ordinary app icon as `maskable` without checking its safe zone and visual crop.
- File names alone do not prove image dimensions, alpha treatment, or visual suitability. Verify the actual image files and Android launcher rendering before TWA build.

## Preconditions before Bubblewrap generation

1. Verify that `https://id.cerdikgo.app` resolves to the intended Preview Worker with a valid TLS certificate; confirm it is not Production.
2. Verify the deployed `/manifest.webmanifest`, `/service-worker.js`, `/icons/icon-192.png`, `/icons/icon-512.png`, and offline behavior on Android Chrome.
3. Verify PNG pixel dimensions and visual quality; create and validate a separate maskable icon with safe-zone padding.
4. Confirm domain ownership and ability to serve `/.well-known/assetlinks.json` on this exact host.
5. Decide signing-key custody. Keep private keystore files and passwords outside GitHub and outside CI logs. Do not generate or upload a release key in this preparation phase.
6. Review the generated TWA Gradle configuration and explicitly verify `targetSdkVersion >= 36` before any Play upload.

## Planned generation (not executed)

On a trusted build workstation with Node.js, JDK and Android SDK installed:

```sh
npx @bubblewrap/cli init --manifest="https://id.cerdikgo.app/manifest.webmanifest" --directory=android-twa
```

Review the generated `twa-manifest.json`, then set:

- `packageId`: `id.cerdikgo.app` only after Play Console confirms eligibility/registration.
- `host`: `id.cerdikgo.app` (approved Preview hostname; verify live endpoint first).
- `startUrl`: `/` (or the approved app entry route).
- `appVersion`: `0.1.0`; `appVersionCode`: `1` for the first internal candidate.
- `iconUrl`: verified 512 px PNG at `https://id.cerdikgo.app/icons/icon-512.png`.
- `signingKey.path` and `signingKey.alias`: local protected keystore only; never commit credentials.

Bubblewrap build is deliberately not run here. A signed AAB, Play upload, asset-link publication, OAuth changes, DNS changes, Worker deployment, D1 writes/migrations, billing, external tester invitations and Production release are outside this mission.

## Required gates

- [ ] Play Console package availability and registration eligibility confirmed by account owner.
- [ ] Developer identity verified in the intended Play Console account.
- [x] Preview hostname selected and approved: `id.cerdikgo.app`.
- [ ] HTTPS, DNS, Worker route and deployed Preview endpoint verified.
- [ ] PWA PNG icon files dimension-checked and Android launcher rendering reviewed.
- [ ] Separate maskable icon designed and validated.
- [ ] TWA project generated from the approved Preview manifest.
- [ ] Gradle target SDK verified as API 36 or higher.
- [ ] Upload-key custody and Play App Signing plan approved.
- [ ] Digital Asset Links configured using the correct signing-certificate fingerprint (including Play app-signing fingerprint where applicable).
- [ ] AAB built and inspected on a feature branch/isolated build environment.
- [ ] Android Chrome and device-level TWA validation completed.
- [ ] Human Team Leader approves next release stage.

## Safety boundary

This preparation does not authorize Production deployment, D1 writes/migrations, OAuth/secrets changes, DNS/domain changes, billing activation, Play Console app creation/registration, external beta invitations, or public release.
