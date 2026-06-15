# Release and Deployment

## Version fields

| Field | Current source value | Lives in |
|---|---|---|
| Package version | `1.0.0` | `assets/router-config.json` release |
| Config version | `2026-06-15-prod-v1.0.0` | `assets/router-config.json`, generated config, Apps Script registry snapshot |
| Config version | `Config v1` / `config-v1.0.0` | `assets/router-config.json`, generated config, Apps Script registry snapshot |
| Core version | `v1.0.0` | `assets/router-core.prod.js` |
| Mælaborðsmælingar version | `Mælaborðsmælingar · v1.0.0` | `status-dashboard/index.html` |
| Apps Script version | `atburdasafnari-v1.0.0` | tracker source |
| Schema version | `Gagnasnið 1` / `1` | config/tracker |

Production v1 sync: Apps Script registry snapshot, router config and generated config now report the same config version.

## Generated files

`assets/router-config.prod.js`, `assets/router-config.next.js` og `assets/router-config.v1.0.0.js` eru generated from `router-config.json`. Ekki handbreyta. Keyra `tools/generate-router-assets.ps1` til að endurgera config og samstilla `assets/router-core.v1.0.0.js`.

## Release preparation

1. Document scope.
2. Validate JSON and source map.
3. Confirm URLs/endpoints/IDs unchanged unless intended.
4. Regenerate generated config by approved process.
5. Deploy GitHub Pages changes.
6. Deploy Apps Script if tracker changed.
7. Update registry/control sheets if config/dashboard metadata changed.
8. Run `setupProductionWorkbook` only when schema/setup refresh is intended.
9. Run `aggregateRecent` and confirm `Dashboard_Data`.
10. Smoke test.

## Smoke tests

Root, both dashboards, debug/manual/health/list, force mobile/desktop, Apps Script `api=health`, `api=dashboard`, status JSONP, Mælaborðsmælingar warning split og Talningarhlið.

## Rollback plan

Revert GitHub Pages commit for static files. Roll back Apps Script deployment version. Regenerate/publish dashboard payload after rollback if metadata changed. Verify cache freshness.

## Release notes template

```text
Release:
Date/time:
Scope:
Config version:
Core version:
Apps Script version:
Schema:
Dashboards affected:
Power BI URLs changed: yes/no
Endpoint changed: yes/no
Counting logic changed: yes/no
Tests:
Open handover notes:
Rollback:
```

Launch timestamp rule: first two current dashboards use `14.06.2026 00:57 Atlantic/Reykjavik`; future dashboards get their actual publication timestamp.
