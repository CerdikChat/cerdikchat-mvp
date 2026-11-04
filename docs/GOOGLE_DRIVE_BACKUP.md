# ATLAS-9 — Automated Google Drive Backup

This workflow creates a daily repository backup for CerdikChat and uploads it to a Google Drive folder.

## What is backed up

1. `cerdikchat-full-history.bundle` — all fetched Git refs and commit history.
2. `cerdikchat-source.zip` — source snapshot at the triggering commit.
3. `SHA256SUMS.txt` — SHA-256 checksums for both archives.

The workflow verifies the Git bundle before upload and verifies each uploaded file's Drive ID and byte size. The SHA-256 manifest is uploaded alongside the archives for later integrity checks.

## Schedule and triggers

- Daily at 02:00 Asia/Makassar (WITA / Bali).
- Pushes to `main`.
- Version tags matching `v*`.
- Manual run through GitHub Actions.

GitHub documents timezone-aware scheduled workflows; actual start times can still be delayed during platform load.

## One-time Google Drive setup

Create or select a Google Cloud project, enable Google Drive API, and configure an OAuth client. Generate a refresh token for the Google account that owns the destination folder, using the narrowest practical Drive scope compatible with the folder workflow.

Add these repository Actions secrets under **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|---|---|
| `GDRIVE_CLIENT_ID` | OAuth client ID |
| `GDRIVE_CLIENT_SECRET` | OAuth client secret |
| `GDRIVE_REFRESH_TOKEN` | OAuth refresh token |
| `GDRIVE_FOLDER_ID` | Existing destination folder ID |
| `GITLEAKS_LICENSE` | Gitleaks license key if the repository is owned by a GitHub organization; not required for personal-account repositories |

Do not put credential values in this repository, workflow YAML, issue comments, or backup archives. Never send them in chat. Use a dedicated backup Google account/folder if possible and protect the account with strong authentication.

## Controlled rollout

1. Review and merge this PR only after reviewing the workflow and secret-scanning result.
2. Add the four GitHub Actions secrets.
3. Run **Actions → ATLAS-9 Google Drive Backup → Run workflow** manually.
4. Confirm all three files appear in the intended Drive folder and inspect the Actions log.
5. Perform a restore test from the Git bundle into a temporary directory before relying on scheduled backups.

## Restore test

```bash
git clone cerdikchat-full-history.bundle cerdikchat-restore-test
cd cerdikchat-restore-test
git branch -a
git log --oneline -10
```

For the source snapshot, extract `cerdikchat-source.zip` into a separate temporary directory and compare its files with the expected commit.

## Safety boundaries

- This workflow backs up the Git repository only. It does **not** back up Cloudflare Worker configuration, secrets, D1 production data, OAuth credentials, or other external service state.
- No automatic deletion/retention cleanup is enabled in this first release. Older backups are not deleted.
- No Cloudflare deployment, production database migration, billing activation, or repository-main write is performed by this workflow.
- The workflow stops if the Gitleaks scan detects secrets.
- The Google Drive upload uses the Drive API resumable-upload protocol.

## Known operational dependency

The first run cannot succeed until the four GitHub Actions secrets are configured and the OAuth refresh token has permission to create files in the selected Drive folder.
