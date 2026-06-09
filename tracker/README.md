Tracker deployment
Use `powerbi_router_tracker_apps_script_v1.js` as the Apps Script Web App code.
First setup in Apps Script
Run these functions from the Apps Script editor:
`setupProductionWorkbook`
`installProductionTriggers`
`testWrite`
`testAggregation`
`validateConfig`
Then deploy as a Web App and copy the deployment URL into:
`config/dashboard-registry.json` under `tracking.endpoint`
`status-dashboard/assets/status-config.js` under `dataEndpoint`
Regenerate router assets after updating the registry.
Web App endpoints
```text
POST /exec
  Collects router events. Fire-and-forget.

GET /exec?api=health
  Safe health response. Does not expose Spreadsheet ID or raw events.

GET /exec?api=dashboard&format=js&callback=CallbackName
  Aggregate-only dashboard data for the static status console.

GET /exec?api=registry&format=js&callback=CallbackName
  Public-safe registry data.

GET /exec?...event fields...
  Image fallback tracking. Stores only allowed normalized fields.
```
Sheets created
```text
Events_Raw
Errors
Aggregates_Daily
Aggregates_Hourly
Aggregates_Dashboard
Aggregates_Device
Aggregates_Source
Aggregates_Route
Aggregates_Quality
Dashboard_Registry
Public_Page_Registry
Data_Dictionary
Control
Archive_Log
Dashboard_Data
```
Legacy `Summary`, `Daily`, and `CrossTabs` from the test package are replaced by explicit aggregate tabs.
