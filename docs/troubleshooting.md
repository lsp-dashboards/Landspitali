# Installation troubleshooting

## Router URL returns GitHub 404

Likely causes:

- GitHub Pages has not finished deploying.
- Files were uploaded one folder too deep.
- `basePath` does not match the public URL.
- GitHub Pages is publishing from the wrong branch or folder.

Checks:

```text
Repository root should contain index.html, bradamottaka/, thjonustukannanir/, assets/, status-dashboard/.
GitHub Settings > Pages should show the expected public URL.
```

## Debug page loads but normal route does not redirect

Checks:

```text
Open /bradamottaka/?debug=1 and inspect selected target.
Open /bradamottaka/?noredirect=1 and test the manual links.
Confirm desktopUrl and mobileUrl exist in config/dashboard-registry.json.
Run npm run build after editing the registry.
```

## Apps Script says “No active spreadsheet”

The script is not bound to a Google Sheet, or the Spreadsheet ID was not set.

Fix one of these:

```text
Preferred: create the script from the Google Sheet with Extensions > Apps Script.
Alternative: paste the Spreadsheet ID into TRACKER_SPREADSHEET_ID at the top of the Apps Script file.
```

Then run:

```text
verifySpreadsheetSetup
setupProductionWorkbook
```

## Apps Script authorization fails

Checks:

```text
Use an approved operational account.
Confirm the account can edit the Google Sheet.
Confirm Workspace admin policy permits Apps Script and web app deployment.
For a public collector, deployment access must permit anonymous requests.
```

## Endpoint works in /dev but not /exec

The `/dev` URL uses the latest saved code and is only for editor-access testing. Production uses the versioned `/exec` deployment.

Fix:

```text
Deploy > Manage deployments
Edit the Web App deployment
Select a new version
Deploy
Copy the /exec URL
```

## Events are not written

Checks:

```text
Open <APPS_SCRIPT_EXEC_URL>?api=health.
Run testWrite from Apps Script.
Confirm Events_Raw exists.
Confirm web app executes as the operational account.
Confirm deployment access permits public requests.
Confirm config/dashboard-registry.json tracking.endpoint uses the /exec URL.
Run npm run build and republish GitHub Pages.
```

## Status dashboard shows sample data

This is intentional when live data is unavailable.

Checks:

```text
Open <APPS_SCRIPT_EXEC_URL>?api=dashboard&format=js&callback=TestCallback.
Confirm status-dashboard/assets/status-config.js dataEndpoint uses the /exec URL.
Run aggregateRecent manually.
Wait for the 15-minute trigger.
Confirm Dashboard_Data sheet is populated.
```

## island.is traffic appears as direct traffic

Likely causes:

- island.is card URL does not include UTM parameters.
- URL was copied without query parameters.
- Link preview or redirect stripped query parameters.

Required UTM pattern:

```text
utm_source=island.is
utm_medium=public_dashboard_card
utm_campaign=landspitali_maelabord
utm_content=<stable_dashboard_value>
```

## Debug or test visits are counted as real visits

Expected production behavior:

```text
debug, health, list, noredirect, bot, preview, fallback_click, and test events should not count as real visits.
```

Checks:

```text
config/dashboard-registry.json tracking.countDebugAsVisit should be false.
Apps Script should store count_as_visit=false for diagnostic events.
Aggregates should count only count_as_visit=true.
```

## Mobile users get the desktop report

Checks:

```text
Use /bradamottaka/?debug=1 on the device.
Check device_class, viewport_width, selected_layout, and route_reason.
Check mobileBreakpoint and routePolicy in config/dashboard-registry.json.
Run npm run build after registry changes.
```

## Desktop users get the mobile report

Likely causes:

- Browser width is under 768 px.
- Zoom or side-by-side window makes viewport narrow.
- force=mobile remains in the URL.

Use:

```text
?debug=1
?force=desktop&debug=1
?noredirect=1
```

## Fallback clicks are high

Possible causes:

- Redirect is blocked or slow.
- Router-core file is not loading.
- Browser extension blocks scripts.
- Power BI URL is slow or blocked.
- Users are landing in debug/manual mode from a shared test URL.

Checks:

```text
Open browser developer tools for JavaScript errors.
Confirm assets/router-core.v20260607-1.js is publicly available.
Confirm the generated wrapper points to the correct core file.
Confirm island.is does not use debug or noredirect URLs.
```

## Google Sheet gets slow

First response:

```text
Archive raw events older than the retention period.
Keep aggregation scheduled, not per-event.
Reduce diagnostics.
Review event volume.
```

Upgrade review trigger:

```text
More than 5,000 to 10,000 events per day
Aggregation over 60 seconds
Visible lock/quota errors
Sheet approaching operational capacity
Governance requires database-level controls
```
