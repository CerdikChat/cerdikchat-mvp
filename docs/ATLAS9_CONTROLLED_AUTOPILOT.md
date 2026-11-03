# ATLAS-9 Controlled Autopilot Operating Contract

**Project:** CerdikChat / CerdikGo  
**Mode:** Controlled Autopilot  
**Scope:** Feature branches only  
**Human authority:** Project leader (Steven, Dr.)  
**Status:** Authorized for setup; release actions remain approval-gated.

## 1. Authorized operating scope

ATLAS-9 automation may:
- Inspect repository files, branches, pull requests, workflow runs and test output.
- Create and update files only on explicitly scoped 'atlas9/**' feature branches.
- Run regression tests and read-only static/security checks.
- Prepare draft pull requests and technical reports.
- Recommend fixes and identify blockers with supporting evidence.

Any code change must be bounded, traceable to a commit, and reported with branch name, commit SHA, changed paths and verification result. Draft PRs are review surfaces, not permission to merge.

## 2. Protected actions — explicit approval required each time

The following actions are outside the autopilot's authority:
- Merge any pull request or write to 'main'.
- Deploy to Production or change Production Worker configuration.
- Execute D1 migrations or write to shared/Production databases.
- Modify OAuth clients, redirect origins, API keys, tokens or secrets.
- Purchase/register a domain or incur any cost.
- Enable billing, paid plans, paid AI or paid third-party services.
- Submit, publish or release an application through Google Play Console.

A separate, explicit approval must identify the specific protected action. General authorization of Controlled Autopilot is not approval for any item in this list.

## 3. Technical guardrails

- Work on feature branches only; do not force-push, reset or rewrite shared branch history.
- Use least-privilege GitHub Actions permissions. The baseline guardrail workflow has 'contents: read' only.
- Do not expose secrets in logs, artifacts, commits or reports.
- Do not weaken, delete or bypass tests to obtain a passing result.
- A failed critical test or security check blocks progression.
- Do not represent CI success as Preview, Production, Android-device or Play Store acceptance.
- Do not claim independent agents are deployed or running unless their runtime is demonstrably provisioned and verified.
- Do not use paid or quota-expanding resources without separate approval.

## 4. Work modes

| Mode | Function | Exit evidence |
|---|---|---|
| BUILD | Bounded feature-branch implementation | Commit, changed-file list and rationale |
| VERIFY | Regression and read-only security checks | Workflow run, test totals, findings and logs |
| RELEASE PREP | Prepare Android/Play evidence and documentation | Checklist and build evidence; stop before protected release actions |

## 5. Initial engineering priorities

1. Reconcile open authentication, approval and role-control work before considering beta access ready.
2. Enforce PENDING onboarding and Super Administrator-only approval server-side.
3. Enforce the 30-active-user cap atomically in the authoritative database; test concurrent approvals.
4. Reconcile D1 migration histories and inspect the live migration ledger before proposing execution.
5. Verify fail-closed Production authentication and configured rate limiting.
6. Complete Android packaging, domain association, privacy, account deletion and Play policy evidence before any submission request.

## 6. Reporting format

Every work cycle reports:
- Status: NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED / AWAITING APPROVAL.
- Repository, branch, commit SHA, PR and changed paths.
- Exact CI workflow/run, test totals, failures and links.
- Security/compliance findings and severity.
- Protected action requested, if any, with impact and rollback considerations.
- Next bounded action.

## 7. Authorization record

The project leader authorized Controlled Autopilot in feature-branch-only mode on 03 November 2026. This authorization covers setup and bounded feature-branch work only. All protected actions in Section 2 remain separately approval-gated.

**Operating doctrine:** LEARNING BY DOING — BUILD • OPERATE • IMPROVE.