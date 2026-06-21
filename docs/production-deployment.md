# Production Deployment

## Version Identity

All product-owned version labels are `v1.0.0`.

| Area | Label | Source |
|---|---|---|
| Product identity | `v1.0.0` | `assets/router-config.json` |
| Mælaborðsmælingar | `v1.0.0` | `status-dashboard/index.html` |
| UI: Vaktborð | `v1.0.0` | status dashboard and config |
| Vöktunarkjarni: Rekstrarpúls | `v1.0.0` | router core and config |
| Config | `v1.0.0` | config source and generated config |
| Atburðasafnari | `v1.0.0` | Apps Script tracker |
| Gagnasnið | `v1.0.0` | config and tracker public labels |

`package.json` uses npm semver storage (`1.0.0`) so Node tooling can run normally. Public/product labels use `v1.0.0`.

## Generated Assets

`assets/router-config.json` is the source for generated config wrappers. The generated files are:

- `assets/router-config.prod.js`
- `assets/router-config.next.js`
- `assets/router-config.v1.0.0.js`

Use `tools/generate-router-assets.ps1` or `npm run build` to regenerate them. Do not hand-edit generated config files.

`assets/router-core.v1.0.0.js` is synced from `assets/router-core.prod.js`.

## Deployment Sequence

1. Confirm source scope and owner approval.
2. Validate `assets/router-config.json`.
3. Confirm approved Power BI URLs, Apps Script endpoint, dashboard IDs, aliases and route policy.
4. Regenerate generated config wrappers.
5. Publish static files through GitHub Pages.
6. Deploy Apps Script when tracker source is in scope.
7. Confirm registry/control sheet values match `v1.0.0`.
8. Run `setupProductionWorkbook` only for workbook setup scope.
9. Run `aggregateRecent` and confirm `Dashboard_Data`.
10. Smoke test root, dashboard routes and Mælaborðsmælingar.

## Smoke Tests

- Root gateway renders both public cards.
- `bradamottaka` and `thjonustukannanir` open the correct Power BI URL.
- `?debug=1`, `?manual=1`, `?health=1`, `?list=1`, `?force=mobile` and `?force=desktop` behave as expected.
- Apps Script returns `api=health`, `api=dashboard` and JSONP dashboard output.
- Mælaborðsmælingar shows live/source state, generated timestamp, counting gate, route/source, tracker evidence and production warnings.
- Debug/root/bot/diagnostic/manual/list/health rows stay outside counted production visits.

## Restore Path

Keep the static site, Apps Script deployment and registry/control sheet values aligned. If a deployment is not healthy, restore the approved static source, deploy the approved Apps Script source, run aggregation/publish, and confirm the dashboard cache and timestamps.

## Deployment Note

Use a short handover note with: owner, date/time, source scope, version `v1.0.0`, dashboards in scope, validation commands, smoke-test result, Apps Script endpoint health, and any open operational watch item.
