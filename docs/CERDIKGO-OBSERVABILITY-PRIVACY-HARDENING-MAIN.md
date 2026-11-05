# Main-based observability query-string redaction

## Finding
Read-only Cloudflare script settings on 2026-11-06 reported `redact_query_string=false` on both existing Workers while invocation logs were enabled, persisted and sampled at 100%. Main `wrangler.toml` did not explicitly enable query-string redaction.

## Change
- Enable `redact_query_string=true` in top-level observability configuration.
- Configure Preview observability independently with query-string redaction enabled.
- Preserve existing Preview sampling, persisted invocation logs and staging D1 binding.
- Add regression assertions for both scopes and Preview D1 isolation.

## Limits
Query-string redaction does not sanitize request bodies, headers or application log messages. The separate `cerdikgo-mcp-preview` script is not managed by this repository candidate. Live Cloudflare settings are unchanged until a separately approved deployment.

## Safety
Draft only. No deployment, D1 read/write/migration, OAuth/secrets/DNS change, billing or data mutation. Human Verification remains gated on exact-head Auto Pilot.
