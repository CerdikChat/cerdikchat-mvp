# CerdikGo — Second AI Document Analysis Protocol

**Status:** Preview design / human-assisted workflow  
**Primary orchestrator:** CerdikGo  
**Secondary analysis surface:** WPS AI (official user-operated application)  
**Access policy:** Selected-document read-only; no source-document mutation  
**Billing policy:** No paid upgrade, card authorization, subscription, or billing activation  
**Automation status:** Manual handoff only until an authorized, verified read-only API is available

## 1. Mission

Use WPS AI as an independent second-opinion analysis surface for a document explicitly selected by the user. CerdikGo remains the primary orchestrator and final synthesis layer.

WPS AI must analyze only the selected document and return its findings as an AI conversation response. It must not edit, overwrite, modify, delete, annotate, or create a replacement of the source document.

## 2. Canonical analysis instruction

The following instruction is the canonical prompt to submit to WPS AI:

> **CERDIKGO — SECOND AI DOCUMENT ANALYSIS PROTOCOL**
>
> Read and analyze the selected document only. Do not edit, overwrite, modify, delete, or create a replacement document.
>
> Provide:
> 1. Document title and type.
> 2. Executive summary.
> 3. Key facts, figures, dates, and findings.
> 4. Important evidence and page references, where available.
> 5. Risks, inconsistencies, and missing information.
> 6. Regulatory, technical, or operational issues identified in the document.
> 7. Questions that cannot be answered from the document.
> 8. Conclusions clearly separated into documented facts and interpretations.
>
> Do not invent missing information. Quote or reference the relevant document sections when possible.
>
> Return the analysis as a response in the AI conversation. Do not modify the source document.

## 3. Operating workflow

1. The user explicitly selects one document in WPS.
2. The user opens WPS AI / Chat PDF using the official WPS application or official WPS service.
3. The user submits the canonical analysis instruction above.
4. WPS AI returns analysis in its conversation. The user does not request document editing or export-overwrite operations.
5. The user reviews the response and manually shares the analysis text with CerdikGo.
6. CerdikGo independently checks the response against the supplied source text/pages when available, identifies unsupported claims and discrepancies, and produces a consolidated result.
7. The original document remains unchanged.

This is a human-assisted workflow. It is not an automated WPS API connection, account link, file synchronization, or background agent.

## 4. Output contract

The WPS AI response should use these headings:

1. **Document identification** — title, file type, and page count only when observable.
2. **Executive summary** — concise account of the document's purpose and content.
3. **Key facts and findings** — preserve original units, dates, names, terminology, and numerical precision.
4. **Evidence references** — page, section, heading, table, or quoted excerpt when available. Never invent page references.
5. **Risks and inconsistencies** — distinguish explicit document statements from detected conflicts or omissions.
6. **Regulatory / technical / operational issues** — identify only issues supported by document content; label external legal or technical validation as not performed unless separately researched.
7. **Unanswered questions** — list information the source does not provide.
8. **Conclusions** — split into:
   - Documented facts
   - Interpretations / analysis
   - Limitations and confidence

## 5. Evidence and integrity rules

- Treat the selected document as the sole evidence base unless the user separately authorizes external research.
- Preserve the document's framing, terminology, structure, and level of detail.
- Do not silently correct, reconcile, modernize, or supplement the source.
- Separate verbatim evidence, paraphrase, inference, and external knowledge.
- A quotation must be traceable to the document text.
- Page references must come from the actual document rendering or extracted page metadata.
- If page location cannot be determined, state "page reference unavailable".
- If the source does not support a requested fact, state "not stated in the document".
- If OCR is unclear, mark the passage uncertain; do not guess.
- Conflicting values must be reported side by side with their respective locations, not silently reconciled.
- Regulatory conclusions must not be presented as legal certification or compliance approval based solely on an unverified AI reading.

## 6. Read-only and privacy controls

- The user selects and authorizes the document for analysis.
- Do not change the source file or its metadata.
- Do not invoke WPS editing, conversion, annotation, overwrite, merge, or save-back functions as part of this workflow.
- Do not upload confidential, personal, regulated, or commercially sensitive documents to WPS AI unless the user has reviewed the service's applicable privacy terms and explicitly approved that transfer.
- Do not put WPS passwords, access tokens, app secrets, private account identifiers, or document contents into repository code, issue comments, logs, or public artifacts.
- Do not scrape WPS web/app interfaces or automate undocumented endpoints.
- The user may stop the workflow and revoke document sharing at any time.

## 7. CerdikGo second-opinion review

When the user supplies WPS AI's response and the source document or relevant pages, CerdikGo should:

1. Map each material claim to a source passage/page.
2. Classify each claim as supported, partially supported, unsupported, or contradicted.
3. Check dates, amounts, units, arithmetic, names, and internal consistency.
4. Identify missing qualifications, caveats, and limitations.
5. Compare WPS AI's interpretations with source wording without replacing the source's position.
6. Produce a consolidated report that preserves uncertainty and flags unresolved differences.

CerdikGo must not claim independent verification if the source document was not supplied or the cited passage cannot be inspected.

## 8. API integration gate — NOT AUTHORIZED / NOT VERIFIED

No automatic WPS AI connector may be implemented or enabled until all of the following are evidenced:

- An official WPS API/SDK explicitly supports the intended AI document-analysis operation.
- The account/tenant is eligible under WPS's published requirements.
- A genuinely read-only permission model is available and technically enforced for the selected documents.
- API terms permit the intended CerdikGo integration and data processing.
- Costs, quotas, rate limits, retention, data residency, and privacy obligations are documented.
- A no-billing test path is confirmed.
- Security review approves authentication, token storage, logging, data minimization, and revocation.
- Preview tests demonstrate that the integration cannot modify source documents.

An OAuth scope or permission name containing "readwrite" is not accepted as proof of read-only access. If WPS cannot technically constrain that permission to read-only behavior, do not integrate it.

## 9. Truthful capability labels

Allowed:
- "WPS AI — manual second-opinion analysis"
- "Human-assisted document analysis"
- "CerdikGo cross-check pending source verification"

Not allowed until separately evidenced:
- "WPS AI connected to CerdikGo"
- "Automatic WPS document sync"
- "Read-only API verified"
- "Enterprise AI access active"
- "WPS AI runtime operational"

## 10. Acceptance checklist

- [ ] User explicitly selects and authorizes a non-sensitive test document.
- [ ] WPS AI opens and analyzes the selected document.
- [ ] Response covers all eight required analysis areas.
- [ ] Page/section references are traceable or explicitly marked unavailable.
- [ ] Unsupported claims and missing facts are disclosed.
- [ ] Source document remains unchanged.
- [ ] User manually transfers the response to CerdikGo.
- [ ] CerdikGo checks claims against the supplied source.
- [ ] No paid upgrade, card authorization, subscription, or billing activation occurs.

**Current status:** Protocol defined for human-assisted operation. WPS AI account access, actual feature availability, free quota, source-file immutability, and API eligibility require user-side verification. No automatic integration is claimed.
