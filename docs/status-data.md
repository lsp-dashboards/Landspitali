# Public Status Data

Static status data lives under:

- `assets/data/status-latest.json`
- `assets/data/status-history/YYYY-MM-DD.json`

In Raun mode, the status dashboard calls the Apps Script `api=dashboard` JSONP endpoint on initial load, manual refresh, and every 5 minutes. `status-latest.json` is the offline/static fallback when the live endpoint cannot be reached.

Public status JSON must stay aggregate-only. It may include dashboard ids, display names, public status, confidence summaries, report availability summaries, recent aggregate counts, trend summaries, viewer risk summaries, and aggregate device/browser/OS summaries.

It must not include raw user agents, IP addresses, emails, user identifiers, row-level event data, private sheet metadata, credentials, secrets, tokens, private keys, spreadsheet ids, or Apps Script deployment credentials.

Use:

```bash
npm run build:status
npm run validate:status
```

`npm run build:status` reads the public Apps Script `api=dashboard` aggregate endpoint from `assets/router-config.json` and writes the result as a static snapshot. If that endpoint is unavailable, the script writes a deterministic aggregate-only seed snapshot so builds remain possible. Set `STATUS_SNAPSHOT_MODE=seed` to force seed generation, or `STATUS_SOURCE_URL` to override the snapshot source.

`npm run build` also regenerates the static status snapshot and copies the public site to `dist`.
