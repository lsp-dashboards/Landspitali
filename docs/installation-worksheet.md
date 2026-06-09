# Installation worksheet

Use this worksheet during the first production install. Do not publish values here if they contain private admin information.

## Release

| Field | Value |
|---|---|
| Package ZIP | landspitali_powerbi_router_production_v1_install_ready.zip |
| Package folder | landspitali_router_production_v1 |
| Package version | 1.0.1 |
| Router core version | 2026-06-07-core-1 |
| Tracker version | 2026-06-09-tracker-v1.0.1 |
| Config version | 2026-06-07-prod-1 |
| Install date |  |
| Installed by |  |
| Reviewed by |  |

## GitHub Pages

| Field | Value |
|---|---|
| GitHub owner/org |  |
| Repository name |  |
| Publishing branch |  |
| Publishing folder |  |
| GitHub Pages base URL |  |
| Registry `basePath` | `/Landspitali/` |
| Deployment commit SHA |  |
| Pages deployment time |  |

## Google tracker Sheet

| Field | Value |
|---|---|
| Spreadsheet name | Landspítali Power BI Router Tracker Production |
| Spreadsheet URL |  |
| Spreadsheet ID |  |
| Drive folder |  |
| Owner account |  |
| Editors |  |
| Viewer access | Restricted |

## Apps Script Web App

| Field | Value |
|---|---|
| Apps Script project name | Landspítali Power BI Router Tracker Production |
| Bound to Sheet? | Yes / No |
| `TRACKER_SPREADSHEET_ID` used? | Yes / No |
| Deployment type | Web app |
| Execute as | Me / operational account |
| Who has access | Anyone |
| Web App `/exec` URL |  |
| Deployment ID |  |
| Script version description | Production v1.0.1 tracker collector and aggregate API |

## island.is links

### Bráðamóttaka í Fossvogi

| Field | Value |
|---|---|
| Public title | Bráðamóttaka í Fossvogi |
| Button text | Skoða mælaborð |
| Router URL with UTM |  |
| Mobile Power BI URL tested | Yes / No |
| Desktop Power BI URL tested | Yes / No |

### Þjónustukannanir

| Field | Value |
|---|---|
| Public title | Þjónustukannanir |
| Button text | Skoða mælaborð |
| Router URL with UTM |  |
| Mobile Power BI URL tested | Yes / No |
| Desktop Power BI URL tested | Yes / No |

## Required Apps Script function results

| Function | Expected | Actual |
|---|---|---|
| verifySpreadsheetSetup | ok: true |  |
| setupProductionWorkbook | Production workbook setup complete |  |
| installProductionTriggers | aggregateRecent every 15 minutes |  |
| testWrite | Event ID returned |  |
| testAggregation | Aggregation complete |  |
| validateConfig | ok: true |  |

## Route tests

| URL | Expected | Result |
|---|---|---|
| `/bradamottaka/?debug=1` | Debug page, no redirect |  |
| `/bradamottaka/?force=mobile&debug=1` | Mobile selected |  |
| `/bradamottaka/?force=desktop&debug=1` | Desktop selected |  |
| `/bradamottaka/` | Real redirect |  |
| `/thjonustukannanir/?debug=1` | Debug page, no redirect |  |
| `/thjonustukannanir/?force=mobile&debug=1` | Mobile selected |  |
| `/thjonustukannanir/?force=desktop&debug=1` | Desktop selected |  |
| `/thjonustukannanir/` | Real redirect |  |
| `/status-dashboard/` | Status console loads |  |

## Signoff

| Check | Yes/No | Notes |
|---|---|---|
| Raw event sheet restricted |  |  |
| Status dashboard aggregate-only |  |  |
| Apps Script endpoint tested |  |  |
| GitHub Pages published |  |  |
| island.is links updated |  |  |
| Rollback commit identified |  |  |
