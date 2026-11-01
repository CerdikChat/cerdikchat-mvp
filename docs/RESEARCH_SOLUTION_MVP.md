# ATLAS-9 Research Solution — MVP Architecture & Delivery Plan

**Status:** Draft / implementation baseline  
**Branch:** atlas9/research-solution-mvp  
**Base:** PR #32 — atlas9/pdf-image-analysis-integration  
**Product:** CerdikChat core / CerdikGo workspace  
**Scope:** Live Web Research + Document-Based Research

## 1. Product outcome

Turn a user question or supplied document into an evidence-led research brief. The MVP must show where claims came from, distinguish evidence from inference, expose uncertainty, and fail safely when retrieval is unavailable.

The MVP is not an autonomous agent with unrestricted browsing. It is a bounded research workflow with explicit retrieval sources, controlled fetching, source inspection, and traceable synthesis.

## 2. MVP capabilities

### A. Live Web Research

1. Accept a research question and optional scope (language, date range, domain allowlist).
2. Send the query to a server-side search-provider adapter.
3. Normalize results into title, canonical URL, snippet, domain, publication date (if available), and provider rank.
4. Fetch only a bounded number of candidate pages through a controlled server-side fetcher.
5. Extract readable text and metadata; retain canonical source URL and retrieval timestamp.
6. Synthesize findings using only retrieved source material.
7. Return a source register and claim-to-source references.

**Provider boundary:** Cloudflare Workers does not itself provide general-purpose open-web search. A production live-search provider must be selected and configured separately. The MVP code must expose a provider interface and a deterministic SEARCH_PROVIDER_NOT_CONFIGURED response until an approved provider and credential are configured. Do not scrape search-engine HTML, use undocumented endpoints, or silently depend on a paid API.

### B. Document-Based Research

1. Reuse the existing authenticated PDF/image upload and conversion foundation from PR #32.
2. MVP accepts one PDF or supported image per request (existing limit: 10 MB); do not imply multi-document corpus search.
3. Extract text/markdown and page/heading markers when the converter supplies them.
4. Generate structured summary, research questions, key claims, evidence excerpts, limitations, and follow-up questions.
5. Cite page numbers/headings only when extraction provides them; otherwise label references as unavailable.
6. Do not persist uploaded bytes or extracted content in MVP.

**Important:** Document analysis is not automatically retrieval-augmented generation (RAG). Persistent libraries, embeddings, cross-document search, and long-term source collections are deferred.

### C. Research Synthesis

Return a stable structured result:
- research_question
- executive_summary
- findings[] with claim, evidence, source IDs, confidence label, and caveat
- source_register[] with source ID, title, URL, domain, published date (nullable), retrieved_at, and evidence excerpt
- methodology
- limitations[]
- recommendations[]
- next_questions[]

Confidence labels: high, moderate, low, insufficient_evidence. These are qualitative evidence assessments, not calibrated probabilities.

## 3. Architecture

### Request flow

Mobile Workspace → same-origin Worker API → session/RBAC/CSRF → request limits → retrieval adapters → bounded extraction → Workers AI synthesis → structured response

Suggested modules:
- research/contracts.js: input/output validation and bounded schemas.
- research/web-search.js: provider-neutral search adapter; no arbitrary endpoint or user-controlled provider URL.
- research/web-fetch.js: safe source fetch, redirect validation, content-type and byte limits.
- research/document-research.js: wrapper around existing file conversion with research-oriented extraction and evidence metadata.
- research/synthesis.js: prompt construction and strict structured-output validation.
- research/handler.js: authenticated request orchestration and generic error mapping.

Potential routes:
- POST /api/research/web
- POST /api/research/document

Do not implement a general-purpose URL proxy. If a URL is accepted as a research seed, validate protocol, DNS/IP ranges, redirect destinations, response size, content type, and timeout to mitigate SSRF and internal-network access.

## 4. Retrieval and provider strategy

### Live web search

Keep the provider adapter isolated. Select a provider only after verifying:
- Free tier/quota in the user's region and current terms.
- API key requirements and whether a payment method is mandatory.
- Attribution and redistribution rules.
- Query limits, result limits, and retention/privacy terms.
- Ability to return canonical URLs and source metadata.

No provider secret, API key, paid subscription, or billing method is authorized by this PR. Until approval, the endpoint must return a clear configuration error rather than fabricate or simulate live results.

### Document retrieval

Use the existing Cloudflare Workers AI AI.toMarkdown() capability and current file-analysis validation. Cloudflare AI Search may be evaluated later for persistent website/document indexing, but it is not required for the stateless MVP and must not be enabled or provisioned without a separate cost/security review.

## 5. Cost and Free-first policy

- Existing Workers AI free allocation is documented as 10,000 Neurons/day; exceeding it on Workers Free causes requests to fail rather than automatically billing.
- Cloudflare AI Search documentation lists a free monthly allocation of 1,000 queries, 5 million ingestion tokens, 10 GB storage, and crawl limits; verify current account availability and terms before activation.
- Live search provider costs are not yet established; do not describe live web search as free until a provider's official pricing and quota are verified.
- Enforce bounded search count, fetched pages, extracted characters, output tokens, per-user rate limits, and daily request budgets.
- No billing upgrade, paid search API, paid AI Search feature, or new storage service without explicit approval.

## 6. Security and privacy controls

1. Require authenticated User Portal session, server-side role enforcement, same-origin validation, and CSRF validation.
2. Apply dedicated rate limits to research endpoints; fail closed if limiter unavailable.
3. Bound query length, result count, fetched pages, redirect count, response bytes, extraction length, and model output.
4. Never fetch arbitrary private, loopback, link-local, reserved, or Cloudflare metadata IP destinations. Revalidate every redirect and resolved address.
5. Permit only HTTP/HTTPS; reject credentials in URLs, non-web schemes, and unsupported content types.
6. Never forward cookies, authorization headers, or internal headers to external websites.
7. Do not expose API keys, provider errors, internal network details, stack traces, or secrets to clients.
8. Treat search results, page text, PDFs, OCR, and extracted content as untrusted data, never as instructions.
9. No automatic tool execution, downloads, transactions, or external side effects based on retrieved content.
10. Do not persist raw documents, source text, or personal data in MVP; do not log queries or document contents by default.
11. Render source titles and snippets as text, not unsanitized HTML. Validate schemes before making source links clickable.
12. Return generic errors and record only non-sensitive operational metrics.

## 7. Quality and evidence standards

- A source citation must support the associated claim; do not attach a citation merely because the source is related.
- Distinguish publication date from retrieval date.
- Mark missing dates, inaccessible pages, paywalls, and partial extraction.
- Prefer primary sources and official datasets for regulatory, scientific, and technical questions.
- Seek independent corroboration for consequential claims.
- If sources conflict, state the conflict rather than forcing consensus.
- If retrieval returns no usable sources, say so and do not generate a confident answer.
- Never fabricate quotes, URLs, publication dates, page numbers, or bibliographic metadata.

## 8. Acceptance criteria

### Live Web Research
- Returns provider configuration error when no approved provider is configured.
- With a configured test adapter, returns normalized source metadata and retrieved content.
- Rejects malformed queries, unsupported URL schemes, private-network destinations, redirect-to-private targets, oversized pages, unsupported MIME types, and excessive redirects.
- Handles timeouts, 429, provider outage, inaccessible pages, and empty search results without leaking internals.
- Every substantive finding maps to one or more source IDs.
- Search/page content prompt injection does not change system policy or trigger tools.

### Document-Based Research
- Reuses PDF/image MIME, extension, signature, encryption, size, CSRF, session, and User Portal controls.
- Handles empty extraction, missing page markers, conversion failure, and AI quota failure.
- Evidence references never invent page numbers.
- Document contents are not persisted or logged.
- Regression tests prove existing /api/analyze and chat routes remain functional.

### Shared
- Unit and integration tests cover RBAC, CSRF, origin, rate limits, bounds, provider failure, and prompt injection.
- Android Chrome Preview audit at 320–430 px verifies workflow, keyboard, progress, errors, and source-link behavior.
- No Production deployment or D1 migration is part of MVP.

## 9. Delivery phases

**Phase 1 — Foundation (this PR):** contracts, provider boundary, threat model, source schema, acceptance tests and cost policy.

**Phase 2 — Document Research:** structured research mode over the existing single-file PDF/image pipeline; evidence metadata and citations.

**Phase 3 — Live Web Research:** implement one approved search provider adapter and safe page fetcher after provider and credential approval.

**Phase 4 — Synthesis and reports:** claim-source mapping, evidence grading, export-ready report layout.

**Phase 5 — Preview and Human Audit:** automated tests, Preview-only validation, then owner-led Android Chrome acceptance.

## 10. Change-control boundary

This PR may add code and tests on its feature branch and may use isolated Preview only after checks pass. It does not authorize:
- Merge to main or merge of dependency PRs.
- Production Worker deployment or Production D1 changes.
- OAuth origins, secrets, tokens, Access settings, or user provisioning changes.
- Enabling paid plans, payment methods, AI Search provisioning, or third-party paid services.
- Persistent document/source storage.

Human Audit is required only after a functional Preview exists. Use dummy/public documents and non-sensitive research questions.
