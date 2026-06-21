# Production Guide

## Deployment Model

GitHub Pages hosts static HTML/JS under `/Landspitali/`. Google Apps Script Web App receives telemetry and serves JSON/JSONP. Google Sheets stores internal raw rows, aggregate sheets, registry, control values and `Dashboard_Data`.

The public status surface is Mælaborðsmælingar. It displays aggregate/status data only.

## Dashboard Route Setup

For a dashboard route, follow [dashboard-router-guide.md](dashboard-router-guide.md).

Required source values:

- Dashboard display name.
- Dashboard ID.
- Desktop Power BI publish-to-web URL.
- Mobile Power BI publish-to-web URL.
- Fallback mobile URL.
- Noscript mobile URL.
- Public card title, description, icon and route metadata.
- Governance owner and publication timestamp.

## Config Source

`assets/router-config.json` is the source config. Edit dashboard entries, aliases, public card metadata, governance or route policy only when that scope is approved.

After source edits:

1. Validate JSON.
2. Regenerate generated config wrappers.
3. Confirm dashboard IDs and Power BI URL roles.
4. Run router smoke tests.
5. Confirm Mælaborðsmælingar.

## Apps Script Deployment

Apps Script source is `tracker/powerbi_router_tracker_apps_script_v1.0.0.js`. Deploy as the script owner or operational service account.

Health checks:

- `<APPS_SCRIPT_EXEC_URL>?api=health`
- `<APPS_SCRIPT_EXEC_URL>?api=dashboard`
- `<APPS_SCRIPT_EXEC_URL>?api=registry`

Callable setup/aggregation functions include `setupProductionWorkbook`, `setupProductionWorkbook_`, `setupWorkbookPublic`, `migrateSchemaV1`, `migrateGagnasnid1`, `migrateSchemaV8`, `migrateSchemaV9`, `migrateSmartTvPowerBiCompatV122`, `aggregateRecent`, `testAggregation`, `validateConfig` and `archiveOldEvents`.

## Production Checklist

- `assets/router-config.json` is valid JSON.
- Product-owned labels are `v1.0.0`.
- Generated config JS matches `assets/router-config.json`.
- Power BI URLs, Apps Script endpoint, dashboard IDs and route policy match approved source.
- `count_as_visit` logic is intact.
- Debug/root/bot/diagnostic/manual/test/list/health remain excluded from production visits.
- Status dashboard loads Apps Script JSONP.
- `Dashboard_Data` chunks are published.
- Cache/freshness is visible in Mælaborðsmælingar.

## Restore Path

Restore the approved static source, deploy the approved Apps Script source, confirm registry/control values, run aggregation/publish and verify cache freshness in Mælaborðsmælingar.

## Protected Areas

Do not refactor locked router template machinery. Do not hand-edit generated config JS. Do not alter route, tracking, counting, warning or scoring behavior outside approved owner scope.
