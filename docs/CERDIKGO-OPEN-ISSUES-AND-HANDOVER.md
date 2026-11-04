# CerdikGo Open Issues & Handover

## Open items — 2026-11-05
1. **PR dependency chain:** #57 → #58 → #59; all recorded open/draft/unmerged. Review and validate in dependency order; do not merge automatically.
2. **CI readiness:** PR #59 candidate `de11d34257005ba72a621312230489a7d161ff53`; runs #41877325687 and #41877325709 were QUEUED at last recorded check. Recheck before any Human Verification.
3. **Benchmark coverage:** seven-dimension reproducible benchmark suite and scoring rubric require implementation and execution.
4. **Security review:** complete authentication/RBAC, session, CSRF, rate-limit, file-scanning, retention, and observability review.
5. **Runtime validation:** Preview runtime and Android acceptance remain separate from CI and are NOT TESTED in this handover.
6. **Scale/recovery:** define SLOs and execute load, backup/restore, and disaster-recovery tests.
7. **Agent execution:** nine roles are specialist profiles/registry; gateway remains `plan_only`, not nine independently executing agents.

## Handover format
- Current branch and full SHA:
- Last known passing CI run (exact commit):
- Current blockers:
- Changes made and links:
- Tests run/results:
- Security/governance risks:
- Decisions/approvals required:
- Next safe actions:
- Explicitly prohibited actions still on hold:
