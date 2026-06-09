# Code plan and generated files

## Hand-edited source

```text
config/dashboard-registry.json
assets/router-core.v20260607-1.js
tracker/powerbi_router_tracker_apps_script_v1.js
status-dashboard/assets/status-dashboard.js
status-dashboard/assets/status-dashboard.css
status-dashboard/assets/status-config.js
docs/
tools/
tests/
```

## Generated source

```text
assets/router-config.v20260607-1.js
assets/router-config.prod.js
assets/router-config.next.js
assets/router-config.json
bradamottaka/index.html
thjonustukannanir/index.html
index.html
```

Generated files are created by:

```bash
node tools/generate-router-assets.mjs .
```

## What changed from test package

- Canonical registry now includes technical router data and public island.is presentation data.
- Generated JS config prevents JSON/JS drift.
- Router core honors transport order and sampling.
- Dashboard query override is locked on dashboard wrappers.
- Events use a reduced privacy-safe schema by default.
- Apps Script collection path is append-only and fast.
- Aggregation is scheduled.
- Status dashboard reads aggregate-only data.
- Emergency core-load fallback sends normal users to mobile.
- Test matrix, runbook, privacy notes, deployment checklist, and rollback plan are included.

## What stayed

- GitHub Pages router.
- Mobile/desktop Power BI publish-to-web routing.
- Mobile safe fallback.
- Noscript fallback.
- Debug mode.
- Forced mobile/desktop testing.
- Health/list/manual modes.
- Error tracking.
- Apps Script and Google Sheets v1 backend.
