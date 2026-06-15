# Landspítali Power BI Router Tracker and Mælaborðsmælingar

Þetta repository er vinnandi source of truth fyrir opinberar Power BI leiðingarsíður Landspítala, Apps Script teljara og stöðuyfirlitið **Mælaborðsmælingar**.

Kerfið hýsir stöðugar GitHub Pages slóðir undir `basePath` `/Landspitali/`, tekur við umferð frá opinberum island.is kortum, velur mobile eða desktop Power BI publish-to-web slóð eftir skjáplássi og route policy, sendir aggregate rekstrarmerki í Google Apps Script og birtir aðeins samantektargögn stöðu í `Mælaborðsmælingar`.

GitHub repository er frumheimild. Engin fyrri viðhengi eða samtalsgögn eru forsenda þessara skjala.

## Helstu slóðir

| Hlutverk | Source | Slóð/path |
|---|---|---|
| Root gateway | `index.html` | `/Landspitali/` |
| Bráðamóttaka í Fossvogi | `bradamottaka/index.html` | `/Landspitali/bradamottaka/` |
| Þjónustukannanir ríkisstofnana | `thjonustukannanir/index.html` | `/Landspitali/thjonustukannanir/` |
| Stöðuyfirlit | `status-dashboard/index.html` | `/Landspitali/status-dashboard/` |
| Config source | `assets/router-config.json` | miðlæg router stilling |
| Generated config | `assets/router-config.prod.js`, `assets/router-config.next.js`, `assets/router-config.v1.0.0.js` | ekki handbreyta |
| Router core | `assets/router-core.prod.js` | production core logic |
| Tracker source | `tracker/powerbi_router_tracker_apps_script_v1.0.0.js` | Google Apps Script Web App |
| Locked router template | `templates/bradamottaka-locked-master-reference.html` | independent Bráðamóttakan master reference |
| Asset generator | `tools/generate-router-assets.ps1` | generated config/versioned asset process |

Stöðuyfirlit er birt undir `status-dashboard/`, sem leysist á GitHub Pages í `status-dashboard/index.html`.

## Núverandi mælaborð

| Lykill | Dashboard ID | Path | Birting |
|---|---|---|---|
| `bradamottaka` | `bradamottaka-fossvogi` | `bradamottaka` | active, public card published |
| `thjonustukannanir` | `thjonustukannanir-rikisstofnana` | `thjonustukannanir` | active, public card published |

Source styður sameiginlegan public launch timestamp fyrstu tveggja korta: `14.06.2026 00:57 Atlantic/Reykjavik`.

## Version map

| Útgáfa | Gildi | Source |
|---|---|---|
| Package version | `1.0.0` | `assets/router-config.json` |
| Config source version | `2026-06-15-prod-v1.0.0` | `assets/router-config.json` |
| Mælaborðsmælingar public name | `Mælaborðsmælingar` | `status-dashboard/index.html`, `assets/router-config.json` |
| Status UI dev version | `v1.0.0` | `status-dashboard/index.html`, `assets/router-config.json` |
| UI component public name | `UI: Vaktborð` | `status-dashboard/index.html`, `assets/router-config.json` |
| UI component dev version | `v1.0.0` | `status-dashboard/index.html`, `assets/router-config.json` |
| Component row | `UI: Vaktborð · Talningarhlið · Leiðingarskipting · Aðeins samantektargögn · Vöktunarkjarni: Rekstrarpúls · Config v1 · Atburðasafnari v1 · Gagnasnið 1` | `status-dashboard/index.html`, `assets/router-config.json` |
| Core public name | `Vöktunarkjarni: Rekstrarpúls` | `assets/router-config.json`, status dashboard |
| Core dev version | `v1.0.0` | `assets/router-core.prod.js`, `assets/router-core.v1.0.0.js`, `assets/router-config.json` |
| Config public name | `Config v1` | `assets/router-config.json` |
| Config dev label | `config-v1.0.0` | `assets/router-config.json` |
| Collector public name | `Atburðasafnari v1` | tracker source, `assets/router-config.json` |
| Collector dev label | `atburdasafnari-v1.0.0` | tracker source, `assets/router-config.json` |
| Schema public name | `Gagnasnið 1` | config og tracker source |
| Schema version | `1` | config og tracker source |

## Quick start fyrir viðhald

1. Lesa [docs/README.md](docs/README.md).
2. Staðfesta að breyting snerti aðeins skjöl nema verkefnið segi annað.
3. Fyrir rekstrarvandamál byrja í [docs/debug-handbook.md](docs/debug-handbook.md).
4. Fyrir nýtt mælaborð fylgja [docs/new-dashboard-router-guide.md](docs/new-dashboard-router-guide.md).
5. Fyrir release fylgja [docs/release-and-deployment.md](docs/release-and-deployment.md).

## Öryggisreglur

Ekki breyta locked router template machinery, router core, routing policy, tracking policy, Power BI URLs, Apps Script endpointi, dashboard IDs, warning/scoring logic eða generated config JS án sérstöku verkefnis.

Ekki handbreyta `router-config.prod.js`, `router-config.next.js` eða `router-config.v1.0.0.js`; þær byrja með `Generated from router-config.json. Do not hand-edit.`

Ekki telja debug/root/bot/diagnostic/manual/test/list/health línur sem production heimsóknir. `count_as_visit = FALSE` er ekki notkun.
