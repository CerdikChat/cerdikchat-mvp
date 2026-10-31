# CerdikGo — Product Derivative and Fork-Readiness Architecture

Status: strategic architecture baseline; no second repository or deployment created.
Parent product: CerdikChat
Implementation track: `atlas9/beta-pilot-multimodal-workspace`
Scope: Preview/staging planning only.

## 1. Product direction

CerdikChat remains the primary product and canonical source for shared application capabilities. CerdikGo is a planned derivative product that should reuse the stable CerdikChat core while maintaining independent product identity and operational boundaries.

Working principle: **Shared Core, Separate Product Identity**.

This document records product direction only. It does not rename CerdikChat, create a CerdikGo repository, copy user data, provision infrastructure, or authorize a production launch.

## 2. Target architecture

Separate reusable application logic from product-specific configuration.

### Shared core
- Chat orchestration and model adapter interfaces.
- Authentication/session middleware abstractions.
- Upload validation and multimodal processing pipeline.
- Conversation/workspace services.
- Bounded tool registry and execution policy.
- Rate limiting, observability, error handling, and automated tests.

### Product configuration
Keep brand-specific values in a typed, validated configuration layer:
- product name and short description;
- logo, theme tokens, and static assets;
- public origin and allowed origins;
- feature flags and pilot cohort policy;
- model selection and usage limits;
- support/privacy links and release metadata.

Do not scatter product-name checks throughout business logic. Avoid runtime tenant switching until a proper multi-tenant security model is designed.

## 3. Infrastructure isolation

CerdikGo must receive independent resources before any real-user pilot:
- separate Worker/service name and Preview/Production environments;
- separate D1 database and migrations;
- separate session-signing and OAuth configuration;
- separate Google OAuth client and exact redirect URI;
- separate rate-limit namespace and quotas;
- separate observability labels and incident/rollback procedures;
- independent secrets, domains, access policies, and backup/retention decisions.

Never reuse CerdikChat production session secrets, user tables, OAuth callbacks, or production data in CerdikGo. Never point a derivative Worker at the parent's Production D1 database.

## 4. Duplication strategy

Preferred approach:
1. Stabilize shared core capabilities in CerdikChat.
2. Extract product configuration and environment bindings from hard-coded values.
3. Add automated tests proving product configuration cannot cross data or session boundaries.
4. Create a dedicated CerdikGo repository from an approved stable baseline, or use a controlled template once repository governance is agreed.
5. Provision isolated CerdikGo Preview resources.
6. Validate authentication, migrations, AI usage, file handling, and rollback independently.
7. Approve a separate closed pilot before any production launch.

Do not continuously copy commits by hand. Use a documented upstream synchronization strategy (versioned shared package, template updates, or reviewed cherry-picks) after the codebase and release process are stable.

## 5. Release gates

### Gate A — CerdikChat core stability
- Authentication and authorization regression tests pass.
- Image and PDF analysis pass security and functional tests.
- Usage, rate limits, privacy, and retention behavior are documented.
- CI and Preview evidence are available.

### Gate B — Product configuration separation
- Brand and product settings are configuration-driven.
- No secrets, domains, database IDs, OAuth identifiers, or product labels are hard-coded across shared modules.
- Tests cover missing/invalid configuration and origin isolation.

### Gate C — CerdikGo isolated Preview
- Dedicated repository or approved template exists.
- Dedicated Worker, Preview bindings, D1 staging database, OAuth client, and secrets are configured by the account owner.
- No CerdikChat user data is copied.
- Security and smoke tests pass.

### Gate D — Independent pilot approval
- Separate user cohort, support path, privacy/retention notice, quota limits, incident response, and rollback plan.
- Explicit approval before production resources, billing changes, or public launch.

## 6. Non-negotiable guardrails

- CerdikChat remains the canonical product until a deliberate product decision changes that.
- CerdikGo remains a planned derivative until its isolated Preview is approved and verified.
- No production deployment, production D1 mutation, secret rotation, billing activation, or repository fork is implied by this document.
- No user records, conversations, uploads, OAuth credentials, or session material may be copied between products by default.
- Prefer Cloudflare Free allowances, but verify actual quotas and usage charges; hosted Workers AI is not automatically free.

## 7. Immediate engineering priorities

1. Deliver authenticated image analysis and PDF/document extraction in the existing CerdikChat Phase 3 branch.
2. Add functional and security regression tests.
3. Establish Preview evidence and Android Chrome validation.
4. Refactor product-specific configuration only where it reduces real duplication risk without destabilizing the current pilot.
5. Revisit a CerdikGo repository fork after CerdikChat's core and release gates are stable.
