# Production Readiness

## Readiness Statement

Landspítali Power BI Router Tracker and Mælaborðsmælingar are aligned for production `v1.0.0`.

The system uses static GitHub Pages routes, central router config, Power BI publish-to-web targets, fire-and-forget Apps Script telemetry, aggregate Google Sheets output and a public status dashboard that exposes only summary data.

## Production Guarantees

- Public/product version labels are `v1.0.0`.
- Root, dashboard, debug, manual, list, health, bot and diagnostic rows are separated from counted production visits.
- Tracking never blocks dashboard navigation.
- Mobile remains the safe fallback.
- Generated config wrappers are derived from `assets/router-config.json`.
- Public status output is aggregate-only.
- Mælaborðsmælingar shows live/source state, freshness, counting integrity, route/source, tracker evidence and operational warnings.

## Source Ownership

| Source | Purpose | Owner Action |
|---|---|---|
| `assets/router-config.json` | Dashboard registry, route policy, public cards and version identity | Edit source, then regenerate wrappers |
| `assets/router-core.prod.js` | Browser router core | Keep synced to `assets/router-core.v1.0.0.js` |
| `tracker/powerbi_router_tracker_apps_script_v1.0.0.js` | Apps Script intake, aggregation and public JSONP | Deploy through Apps Script |
| `status-dashboard/index.html` | Full status dashboard | Validate with live and sample data |
| `tools/generate-router-assets.ps1` | Generated config/core sync | Use for generated assets |
| `scripts/*.js` | Local validation/build tooling | Run before handoff |

## Readiness Checklist

- `npm run validate` passes.
- Generated config files match `assets/router-config.json`.
- Version identity is `v1.0.0` across product-owned labels.
- Apps Script `api=health` and `api=dashboard` respond.
- `Dashboard_Data` is published and cache timestamp is visible.
- Root gateway and dashboard routes pass smoke tests.
- Mælaborðsmælingar has no horizontal overflow at mobile and desktop widths.
- Public output contains no names, emails, raw IP addresses, raw user-agent text, request IDs or row-level event payloads.

## Operational Watch

Watch confirmed production warnings, fallback/error counts, weak/unknown signal share, route/source coverage, source freshness, browser compatibility risk and dashboard-specific count integrity.
