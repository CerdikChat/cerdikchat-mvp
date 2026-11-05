# CerdikGo Observability Privacy Hardening

## Finding
The PR #52 Preview deployment at commit 9be9a8c3f6df416d66452c3d8c69c5112c853207 reported query-string redaction disabled while invocation logs were persisted at 100% sampling.

## Change proposed
- Enable redact_query_string in the top-level Wrangler observability configuration.
- Configure Preview observability independently and enable query-string redaction there as well.
- Retain existing 100% sampling and persisted logs so the change does not silently reduce diagnostic coverage.
- Keep Preview D1 explicitly bound to cerdikchat-staging.

## Evidence and limits
Cloudflare's Wrangler configuration reference documents query-string redaction as disabled by default. This setting removes query strings from request URLs in logs and traces; it does not sanitize application log messages, request bodies, headers, or other personal data. Structured application logs still require data minimization and review.

## Validation
tests/observability-config.test.mjs checks both configuration scopes and the isolated Preview D1 binding. CI must run against the exact PR head. No deployment, secret change, database operation, or billing action is included.
