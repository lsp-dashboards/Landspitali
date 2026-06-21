# Landspítali Power BI Router Tracker and Mælaborðsmælingar

This repository is the production source of truth for public Landspítali Power BI routing pages, Apps Script aggregate telemetry and the **Mælaborðsmælingar** status dashboard.

The system hosts stable GitHub Pages paths under `/Landspitali/`, receives traffic from public island.is cards, selects the mobile or desktop Power BI publish-to-web URL from route policy and viewport evidence, sends aggregate operational signals to Google Apps Script, and publishes only summary/status data.

## Production Paths

| Role | Source | Path |
|---|---|---|
| Root gateway | `index.html` | `/Landspitali/` |
| Bráðamóttaka í Fossvogi | `bradamottaka/index.html` | `/Landspitali/bradamottaka/` |
| Þjónustukannanir ríkisstofnana | `thjonustukannanir/index.html` | `/Landspitali/thjonustukannanir/` |
| Mælaborðsmælingar | `status-dashboard/index.html` | `/Landspitali/status-dashboard/` |
| Config source | `assets/router-config.json` | central router settings |
| Generated config | `assets/router-config.prod.js`, `assets/router-config.next.js`, `assets/router-config.v1.0.0.js` | generated assets |
| Router core | `assets/router-core.prod.js`, `assets/router-core.v1.0.0.js` | production route logic |
| Tracker source | `tracker/powerbi_router_tracker_apps_script_v1.0.0.js` | Google Apps Script Web App |
| Asset generator | `tools/generate-router-assets.ps1` | generated config/core sync |

## Dashboards

| Key | Dashboard ID | Path | Status |
|---|---|---|---|
| `bradamottaka` | `bradamottaka-fossvogi` | `bradamottaka` | active public card |
| `thjonustukannanir` | `thjonustukannanir-rikisstofnana` | `thjonustukannanir` | active public card |

The shared public launch timestamp for these cards is `14.06.2026 00:57 Atlantic/Reykjavik`.

## Version Identity

All product-owned public and source labels use `v1.0.0`.

| Component | Label | Source |
|---|---|---|
| Product identity | `v1.0.0` | `assets/router-config.json` |
| Mælaborðsmælingar | `v1.0.0` | status dashboard/config |
| UI: Vaktborð | `v1.0.0` | status dashboard/config |
| Vöktunarkjarni: Rekstrarpúls | `v1.0.0` | router core/config |
| Config | `v1.0.0` | config source/generated config |
| Atburðasafnari | `v1.0.0` | Apps Script tracker/config |
| Gagnasnið | `v1.0.0` | public schema label |

`package.json` stores npm semver as `1.0.0`; product-facing version labels are `v1.0.0`.

## Maintenance Commands

```powershell
npm run validate
npm run validate:config
npm run validate:status
npm run build
npm run build:status
```

## Documentation

Start with [docs/README.md](docs/README.md). For daily operations use [docs/service-guide.md](docs/service-guide.md), [docs/technical-guide.md](docs/technical-guide.md), [docs/debug-handbook.md](docs/debug-handbook.md), [docs/testing-and-qa.md](docs/testing-and-qa.md), and [docs/production-deployment.md](docs/production-deployment.md).

## Safety Rules

Do not hand-edit generated config files. Do not alter route policy, tracking policy, counting gate, Power BI URLs, Apps Script endpoint, dashboard IDs, warning/scoring logic or locked template machinery without explicit owner scope.

Debug, root, bot, diagnostic, manual, test, list and health rows are not production visits. `count_as_visit = FALSE` is not usage.
