# CerdikGo System Unification & Acceptance Register

**Product:** CerdikGo  
**Shared repository/core lineage:** CerdikChat  
**Engineering program:** ATLAS-9  
**Release target:** controlled beta; Free-first; no billing activation

## 1. Product identity contract

- Use **CerdikGo** for the user-facing product, workspace, navigation, metadata, and product documentation.
- Retain **CerdikChat** where it accurately identifies the repository, shared application core, existing Cloudflare Worker/resource names, database names, or historical implementation.
- Do not rename Cloudflare resources, database identifiers, OAuth clients, DNS records, or secrets as a branding-only operation.
- Attribution remains **Developed by ATLAS-9 (Dr. Steven)** where attribution is displayed.
- The product name does not imply a separate deployment or independent backend unless one is actually provisioned.

## 2. Verified architecture baseline (source-level)

The current beta integration branch contains:
- Static frontend assets under `src/`, served by the Cloudflare Worker.
- `worker.js` as the Worker entry point.
- Cloudflare Workers AI through the `AI` binding; the configured model in the inspected source is `@cf/google/gemma-4-26b-a4b-it`.
- `CHAT_RATE_LIMITER` binding.
- D1 binding `DB`; Preview uses the separately configured `cerdikchat-staging` database.
- Google Identity Services authentication and server-side session code in `auth/google-auth.js`.
- PWA manifest metadata and CerdikGo mark asset references.

These are source/configuration observations. They do not, by themselves, prove current runtime health, deployment parity, successful model inference, database migration state, installability, or offline operation.

## 3. Capability and release-truth register

| Capability | Evidence / implementation boundary | Release status |
|---|---|---|
| Core AI chat | Worker route uses Cloudflare Workers AI and bounded request handling | Implemented in source; validate current Preview runtime |
| Google sign-in/session | GIS flow and server-side session code exist | Human-tested previously; retest only after material auth changes |
| Mobile workspace and themes | Feature-preserving UI work and user-reported Android acceptance exist | Preserve; regression-test changed surfaces |
| Prompt Intelligence | PR #51; uses existing authenticated chat route and Workers AI; local Prompt Vault | Separate PR/dependency; not assumed in integration branch |
| Admin governance | PR #52; governance migration 0007 and compatibility dependency 0006 are committed in feature work | Not operationally enabled until separately authorized Preview migration and runtime verification |
| Voice transcription | Feature work includes authenticated transcription route and Whisper integration | Verify exact branch/Preview runtime before enabling |
| PDF/image analysis | Analysis pipeline is gated on a private scanner service | Not operational until a real scanner binding and clean/EICAR runtime tests pass |
| Document research | PR #35 describes single-file, stateless document research | Not persistent RAG or cross-document search |
| Live web research | Requires an approved provider and safe fetch adapter | Not available until provider, security controls, and quota are approved |
| Hybrid connectivity | UI simulator for Fiber/Cellular/Wi-Fi Mesh/LoRa | Simulation only; no real radio transmission or router control |
| PWA/offline | Manifest and mark asset are present | Installability, service-worker lifecycle, and offline behavior require browser verification |
| Repository backup | PR #53 ports Drive backup workflow | Keep Draft until bundle restore test is evidenced; upload remains opt-in |

Do not promote a capability to “operational” based only on a visible UI, committed code, passing source tests, or a successful deployment job.

## 4. Integration and regression rules

1. Treat `atlas9/beta-pilot-multimodal-workspace` as the integration baseline unless an explicitly approved newer base is selected.
2. Review stacked PR dependencies before transplanting changes. Never merge divergent legacy application trees wholesale.
3. Preserve previously Human Verified behavior. Repeat only tests affected by a material code, configuration, or dependency change.
4. Validate each candidate head SHA in this order:
   - source review and static checks;
   - complete Node test suite / GitHub Actions;
   - isolated Preview deployment and deployed-SHA confirmation;
   - Preview runtime tests for the changed endpoints and bindings;
   - Android Chrome acceptance by the product owner.
5. Record failures with request ID, route, timestamp, sanitized response, and exact commit/deployment SHA. Never expose cookies, tokens, secrets, or personal data in logs.
6. Distinguish CI pass, Preview workflow pass, Preview runtime pass, Android Human Verification, merge, and Production release as separate states.

## 5. Protected operations

Feature-branch and Preview work may proceed within the approved scope. The following require separate, explicit authorization:
- merge to the integration/default branch;
- Production Worker deployment or traffic cutover;
- any remote D1 migration or data write, including Preview D1;
- OAuth client/origin changes or secrets creation/rotation;
- DNS/domain changes;
- enabling paid providers, paid services, or billing;
- Google Drive upload or external data transfer.

A migration file in Git is not evidence that the migration was applied. Before governance migration 0007, run the documented read-only duplicate-pending-email preflight and manually resolve any duplicates; never auto-delete access requests.

## 6. Beta exit criteria

CerdikGo may be described as ready for a controlled beta only when:
- the selected integration branch includes the intended feature set and dependencies;
- all required checks pass on the exact candidate SHA;
- Preview runtime behavior is verified for each enabled capability;
- disabled/gated features are visibly labelled and fail closed;
- Android acceptance covers login/logout, chat, composer/keyboard, navigation, themes, language, and all enabled modules;
- governance migration state and admin authorization are verified without bypassing approval controls;
- backup restore is proven if backups are relied upon;
- no unresolved critical/high security or data-integrity defect remains;
- release owner explicitly approves the release action.

## 7. Current decision

This document is an integration contract and evidence register, not a declaration that all modules are already merged, deployed, or operational. The system remains Preview/feature-branch controlled until each acceptance gate is evidenced and the product owner separately authorizes protected release actions.
