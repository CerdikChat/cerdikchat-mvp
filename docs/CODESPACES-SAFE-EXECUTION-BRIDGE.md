# CerdikGo Codespaces Safe Execution Bridge

## What this provides

A narrow command channel between this private repository and the active Codespaces terminal. ChatGPT can enqueue one of four fixed task identifiers as a comment on GitHub issue [#56](https://github.com/CerdikChat/cerdikchat-mvp/issues/56). A process running inside Codespaces polls that issue, validates the requester's repository write permission, runs only the hard-coded task, and posts a bounded result comment.

This is a GitHub-issue-mediated bridge, not a general remote shell and not a background service managed by ChatGPT.

## One-time operator start

In the Codespaces terminal, from the repository root:

```bash
node .devcontainer/cerdikgo-exec-agent.mjs 56
```

Keep this terminal process running. It uses the existing `gh` CLI authentication in Codespaces; it does not ask for or store a token. If `gh` is not authenticated, stop and resolve that through GitHub's own sign-in flow. Never paste credentials into chat or repository files.

## Allowed requests

Add one exact comment to issue #56:

| Comment | Fixed action |
|---|---|
| `/cerdikgo env` | Node/npm versions and Git working-tree status |
| `/cerdikgo install` | `npm install --ignore-scripts --no-audit --no-fund` |
| `/cerdikgo test` | `npm test` |
| `/cerdikgo dry-run` | Wrangler 4.153.0 Worker dry-run only |

The bridge ignores historic comments present at startup. It accepts only new exact command comments from GitHub collaborators whose repository permission is write, maintain, or admin. It does not accept shell text, arguments, file paths, arbitrary scripts, deployment commands, or database commands.

## Stop

Press Ctrl+C in the Codespaces terminal. Closing the Codespace also stops this process.

## Security boundaries

- Preview feature branch and current Codespaces workspace only.
- No normal `wrangler deploy`, Production deployment, D1 migration/write, secrets/OAuth change, merge, or billing action.
- Child processes use argument arrays with `shell: false`.
- Dependency installation disables lifecycle scripts.
- The bridge does not print environment variables and redacts common token patterns from returned output.
- GitHub issue comments and Codespaces logs are retained by GitHub; do not put sensitive data in task output.
- The bridge relies on the Codespaces `gh` CLI session and GitHub's collaborator-permission API.
- This process is not active until an operator starts it in the Codespaces terminal. ChatGPT cannot start the process by itself from the GitHub connector.

## Limitations

The first version polls every 15 seconds and reads the latest 100 issue comments. Keep the queue issue limited to this workflow. If the Codespace sleeps or the process exits, requests wait until the bridge is started again.
