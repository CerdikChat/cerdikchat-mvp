# ATLAS-9 Security & Governance Register

Append findings and evidence; do not expose secrets, tokens, personal data, or sensitive log contents.

## Initial baseline — 2026-11-05
- Authentication/RBAC: review required; no complete security verdict recorded.
- Session lifecycle, rotation/revocation, CSRF, origin validation, rate limiting, and sensitive-endpoint authorization: NOT TESTED in this register.
- File scanning/document parsing, retention, resource limits, malformed-file handling, and logging: NOT TESTED in this register.
- Observability sampling/privacy and preview/production configuration isolation: review required.
- ATLAS-9 gateway: existing documented contract is `plan_only`; do not activate execution or grant tools/permissions without separate approval.
- Specialist count: exactly nine roles must be preserved; Optimus Prime is coordinator, not a tenth specialist.
- Production deployment, remote D1 writes/migrations, OAuth/secrets, DNS, billing: prohibited absent explicit, separate authorization.

## Finding template
- ID / date / severity:
- Component and affected version/commit:
- Reproduction and evidence:
- Impact and likelihood:
- Mitigation / owner:
- Verification test and result:
- Residual risk / approval:
- Status: VERIFIED / FAILED / BLOCKED / NOT TESTED / PLANNED.
