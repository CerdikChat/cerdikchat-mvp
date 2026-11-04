# CerdikGo Android TWA preparation

Status: preparation only. This directory is not a generated or buildable Android project.

## Package identity

- Requested candidate: `id.cerdikgo.app`
- Candidate format: syntactically valid reverse-DNS Android application ID.
- Google Play availability/registration: **NOT VERIFIED**.
- Lock status: **PROVISIONAL — DO NOT REGISTER OR PUBLISH YET**.

Package names are unique and permanent in Google Play. The repository cannot establish availability or registration eligibility. The owner must check Play Console > Android developer verification > Package names (or the Create app flow) while signed in to the intended verified developer account. For a never-seen package, Play Console may register it when creating the app, subject to developer identity verification and the public signing-certificate step. Existing/previously seen package names may require eligible-key proof or a request to Google. Do not create a Play Console app merely to test availability.

Indonesia is included in the Android developer verification rollout: package registration has been required since 30 September 2026. Confirm the developer account's identity verification and package registration status before release.

## Chosen distribution route

Use a Trusted Web Activity (TWA) generated with Bubblewrap, reusing the existing CerdikGo PWA. Do not introduce Capacitor or a second native frontend unless a required native capability proves TWA insufficient.

## Preconditions before Bubblewrap generation

1. Confirm the exact approved **Preview** HTTPS hostname and that it serves the intended candidate PWA. Do not use a Production hostname for this preparation.
2. Verify the deployed `/manifest.webmanifest`, `/service-worker.js`, icon assets, and offline behavior on Android Chrome.
3. The current web manifest references only an SVG icon. Bubblewrap needs a suitable raster icon (minimum 512 px); add/validate a PNG icon and a separately designed maskable icon before generating the final Android project.
4. Confirm domain ownership and ability to serve `/.well-known/assetlinks.json` on the exact host.
5. Decide signing-key custody. Keep private keystore files and passwords outside GitHub and outside CI logs. Do not generate or upload a release key in this preparation phase.
6. Review TWA's generated Gradle configuration and explicitly verify `targetSdkVersion >= 36` before any Play upload.

## Planned generation (not executed)

On a trusted build workstation with Node.js, JDK and Android SDK installed:

```sh
npx @bubblewrap/cli init --manifest="https://<APPROVED-PREVIEW-HOST>/manifest.webmanifest" --directory=android-twa
```

Review the generated `twa-manifest.json`, then set:

- `packageId`: `id.cerdikgo.app` only after Play Console confirms eligibility/registration.
- `host`: exact approved Preview hostname during Preview validation.
- `startUrl`: `/` (or the approved app entry route).
- `appVersion`: `0.1.0`; `appVersionCode`: `1` for the first internal candidate.
- `signingKey.path` and `signingKey.alias`: local protected keystore only; never commit credentials.

Bubblewrap build is deliberately not run here. A signed AAB, Play upload, asset-link publication, OAuth changes, DNS changes, Worker deployment, D1 writes/migrations, billing, external tester invitations and Production release are outside this mission.

## Required gates

- [ ] Play Console package availability and registration eligibility confirmed by account owner.
- [ ] Developer identity verified in the intended Play Console account.
- [ ] Canonical Preview host confirmed; not Production.
- [ ] PWA manifest has suitable 192 px and 512 px PNG icons plus a separately validated maskable icon.
- [ ] TWA project generated from the approved Preview manifest.
- [ ] Gradle target SDK verified as API 36 or higher.
- [ ] Upload-key custody and Play App Signing plan approved.
- [ ] Digital Asset Links configured using the correct signing-certificate fingerprint (including Play app-signing fingerprint where applicable).
- [ ] AAB built and inspected on a feature branch/isolated build environment.
- [ ] Android Chrome and device-level TWA validation completed.
- [ ] Human Team Leader approves next release stage.

## Safety boundary

This preparation does not authorize Production deployment, D1 writes/migrations, OAuth/secrets changes, DNS/domain changes, billing activation, Play Console app creation/registration, external beta invitations, or public release.