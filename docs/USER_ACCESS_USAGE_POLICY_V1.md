# CerdikChat & CerdikGo — User Access & Usage Policy v1.0

**Status:** Beta governance baseline  
**Applies to:** User, Administrator, Super Administrator  
**Security principle:** AI capabilities may be shared; system-control privileges are not.

## 1. Role boundaries

| Capability | User | Administrator | Super Administrator |
|---|---|---|---|
| Chat AI | Own workspace | Operational use | Operational use |
| PDF/image analysis | Own uploads only | Per policy | Per policy |
| Voice assistance | When enabled | When enabled | When enabled |
| Conversation history | Own conversations only | No routine access to private content | No routine access to private content |
| Document research | Own uploads only | Per policy | Per policy |
| Live web research | When provider is approved and enabled | Per policy | Per policy |
| Manage users / approve access | No | Authorized admin actions | Yes |
| Admin dashboard | No | Yes | Yes |
| System configuration | No | Limited, explicitly delegated | Authorized critical control |
| Secrets and credentials | No | No direct disclosure | Protected secret-management process |
| Audit log | No | Scoped operational view | Governance/security view |

Administrator access does not imply unrestricted access to users' private conversations or uploaded documents. Super Administrator actions remain subject to audit and least-privilege controls.

## 2. Beta usage limits

These are the current MVP design/configuration baselines and must be checked against deployed code and Cloudflare configuration before being represented as live product guarantees.

- Chat message: maximum 8,000 characters.
- Conversation context: up to 12 history messages; each history item up to 2,000 characters.
- Model response: configured maximum 1,024 tokens for standard chat.
- File analysis/research: one file per request, maximum 10 MiB.
- Accepted formats: PDF, PNG, JPG/JPEG, WEBP, GIF.
- Chat API rate limit: currently configured as 20 requests per 60 seconds where the binding is present.
- Research and voice quotas: not published as available until their endpoints, provider availability, and per-user limits have been verified.

Limits may be adjusted for safety, reliability, quota protection, and fair use. The application must communicate throttling and unsupported capabilities clearly.

## 3. Mandatory server-side controls

1. Enforce role-based access control on every protected API route. Frontend visibility is not authorization.
2. Require a valid server-side session for protected User Portal and Admin Portal operations.
3. Enforce ownership checks for conversations, files, and other user resources.
4. Deny privilege escalation; users cannot set or promote their own role.
5. Validate same-origin and CSRF protections on state-changing/browser-authenticated routes.
6. Apply per-user rate limits and fail closed if a required limiter is unavailable.
7. Validate upload count, size, MIME type, extension, and file signature.
8. Keep secrets server-side; never return credentials or sensitive provider errors to clients.
9. Avoid logging raw prompts, document content, access tokens, cookies, or private session data.
10. Record security-relevant administrative actions in a tamper-resistant audit trail where supported.

## 4. User data isolation

- A user may access only their own conversations, documents, and account information.
- User-supplied documents and retrieved web content are untrusted data, never system instructions.
- Beta document analysis is stateless: uploaded bytes and extracted text are not intentionally persisted by the application.
- Admins must not inspect private user content as a routine operational function.
- Any future support-access mechanism requires a documented purpose, least privilege, explicit authorization, time bounds, and audit evidence.

## 5. Security acceptance tests

- User receives HTTP 403 for every Admin Portal and administrative API route.
- User cannot read another user's resources by changing an identifier.
- User cannot promote their role by modifying request JSON, headers, cookies, or client state.
- Expired, missing, malformed, or revoked sessions are rejected.
- Missing/invalid CSRF token and foreign Origin are rejected where required.
- Missing rate limiter fails closed; exceeded limit returns HTTP 429.
- File upload rejects multiple files, oversized files, unsupported formats, mismatched signatures, and encrypted PDFs.
- Document research rejects malformed model JSON and never invents page references.
- Prompt injection embedded in documents cannot override system policy or trigger tools.
- Errors do not expose stack traces, secrets, internal network details, or provider credentials.

## 6. Change control

This policy does not authorize merging dependency PRs, deploying Production, migrating Production D1, changing OAuth origins, changing secrets or Cloudflare Access settings, provisioning users, enabling billing, or activating paid providers. Each remains subject to separate explicit authorization.

## 7. Release status language

Use precise labels:
- **Designed:** documented, not yet implemented.
- **Implemented:** code exists on a feature branch.
- **CI verified:** automated checks passed for the exact commit.
- **Preview verified:** isolated Preview behavior confirmed.
- **Human audited:** owner completed device-level acceptance.
- **Production active:** deployed and independently verified in Production.

A CI pass alone is not proof of Preview, Android, or Production functionality.
