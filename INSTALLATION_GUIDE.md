# Production installation guide

This guide installs the Landspítali Power BI router and tracker production v1 package.

The older `router_virtuoso` package was a test package. The locked Bráðamóttakan master template remains a reference file and must not be edited during this installation.

## 0. What you are installing

Public user journey:

```text
island.is Landspítali mælaborð page
  -> GitHub Pages router path
    -> mobile or desktop Power BI publish-to-web report

Tracking path, best effort only:
router event
  -> Google Apps Script Web App
    -> Google Sheets raw events
      -> scheduled aggregate tables
        -> external status dashboard
```

The router must redirect the user even when tracking fails. Tracking is useful fog-lantern data, not a gate.

## 1. Required accounts and permissions

Before starting, choose the operational owners.

| Item | Recommended owner | Notes |
|---|---|---|
| GitHub Pages repository | Landspítali technical owner/team | Repository contents are public once published through GitHub Pages. |
| Google Sheet tracker workbook | Operational service account or durable team-owned account | Avoid personal ownership where possible. |
| Apps Script Web App deployment | Same durable operational account | The web app should execute as the deployment owner. |
| island.is page/card updates | island.is/Landspítali content owner | The island.is page is the official public front door. |
| Power BI publish-to-web links | Power BI/Fabric admin or approved report owner | Keep mobile and desktop URLs under governance. |

## 2. Local prerequisites

For a full validated install, use:

```text
Node.js 18 or later
npm
Git
A browser where you are signed in to the approved Google and GitHub accounts
```

No npm package install is required. The package uses only Node built-in modules.

A no-terminal install is possible because the ZIP already contains generated files, but the terminal validation is strongly recommended before production switch.

## 3. Unpack the ZIP

1. Download and unzip:

   ```text
   landspitali_powerbi_router_production_v1_install_ready.zip
   ```

2. Open the folder:

   ```text
   landspitali_router_production_v1/
   ```

3. Confirm these files are present:

   ```text
   INSTALLATION_GUIDE.md
   README.md
   package.json
   .nojekyll
   index.html
   assets/router-core.v20260607-1.js
   assets/router-config.prod.js
   bradamottaka/index.html
   thjonustukannanir/index.html
   config/dashboard-registry.json
   tracker/powerbi_router_tracker_apps_script_v1.js
   status-dashboard/index.html
   docs/installation-worksheet.md
   docs/troubleshooting.md
   ```

4. Keep a copy of the ZIP unchanged as the release archive.

## 4. Validate the package locally

From inside `landspitali_router_production_v1/`, run:

```bash
npm run build
```

Expected result:

```text
Registry OK: 2 dashboards, version 2026-06-07-prod-1
Generated router assets for 2 dashboards.
Smoke tests OK.
```

Expected warnings:

```text
Bráðamóttaka í Fossvogi differs from Bráðamóttakan í Fossvogi
Þjónustukannanir differs from Þjónustukannanir ríkisstofnana
```

Those two warnings are intentional. They warn that the public island.is card title and the router/report display name are not identical.

Do not continue if there are validation errors.

## 5. Create the tracker Google Sheet

Recommended method: create a Sheet-bound Apps Script. This is the simplest and safest install path for this package.

1. In Google Drive, create a new Google Sheet.
2. Name it:

   ```text
   Landspítali Power BI Router Tracker Production
   ```

3. Put it in the approved team Drive/folder.
4. Share it only with approved operators.
5. Copy the Sheet URL and paste it into `docs/installation-worksheet.md`.
6. In the Google Sheet, click:

   ```text
   Extensions > Apps Script
   ```

This creates a container-bound Apps Script project. In this mode, leave `TRACKER_SPREADSHEET_ID` empty in the tracker script.

### Standalone Apps Script alternative

Use this only when a container-bound script is not allowed.

1. Create the Google Sheet.
2. Copy the Spreadsheet ID from the URL:

   ```text
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

3. Create a standalone Apps Script project.
4. In `tracker/powerbi_router_tracker_apps_script_v1.js`, set:

   ```javascript
   var TRACKER_SPREADSHEET_ID = "SPREADSHEET_ID_HERE";
   ```

Do not put this Spreadsheet ID in GitHub Pages files. It belongs only in Apps Script.

## 6. Install the Apps Script tracker code

In the Apps Script editor:

1. Rename the project:

   ```text
   Landspítali Power BI Router Tracker Production
   ```

2. Open the default `Code.gs` file.
3. Delete all default code.
4. Paste the full contents of:

   ```text
   tracker/powerbi_router_tracker_apps_script_v1.js
   ```

5. Save the project.
6. Confirm the top of the file has:

   ```javascript
   var SCRIPT_VERSION = "2026-06-09-tracker-v1.0.1";
   var DEFAULT_TIMEZONE = "Atlantic/Reykjavik";
   var TRACKER_SPREADSHEET_ID = "";
   ```

7. For a Sheet-bound script, keep `TRACKER_SPREADSHEET_ID` empty.
8. For a standalone script, paste the Spreadsheet ID as described above.

## 7. Authorize and initialize the tracker workbook

Run these Apps Script functions from the editor, one at a time.

### 7.1 Verify spreadsheet binding

Select and run:

```text
verifySpreadsheetSetup
```

Expected behavior:

```text
Returns ok: true, spreadsheet name, spreadsheet ID, script version, timezone.
```

If it fails with “No active spreadsheet,” either the script was not created from the Google Sheet or `TRACKER_SPREADSHEET_ID` is missing.

### 7.2 Create sheets and headers

Run:

```text
setupProductionWorkbook
```

Approve permissions when prompted.

Expected result:

```text
Production workbook setup complete
```

The Google Sheet should now contain:

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

### 7.3 Install scheduled aggregation

Run:

```text
installProductionTriggers
```

Expected result:

```text
Installed aggregateRecent trigger every 15 minutes
```

This creates a time-driven trigger for `aggregateRecent`.

### 7.4 Write a test event

Run:

```text
testWrite
```

Expected result:

```text
A test event ID is returned.
```

Open `Events_Raw` and confirm a row with event type `router_test_write` exists.

### 7.5 Build initial aggregates

Run:

```text
testAggregation
```

Expected result:

```text
Aggregation test complete at <timestamp>
```

Confirm aggregate sheets contain rows.

### 7.6 Validate tracker config

Run:

```text
validateConfig
```

Expected result:

```text
ok: true
```

## 8. Deploy the Apps Script Web App

In Apps Script:

1. Click:

   ```text
   Deploy > New deployment
   ```

2. Click the gear/settings icon next to “Select type.”
3. Select:

   ```text
   Web app
   ```

4. Description:

   ```text
   Production v1.0.1 tracker collector and aggregate API
   ```

5. Execute as:

   ```text
   Me
   ```

   Use the approved operational account. Public users should not be asked to authorize Google access.

6. Who has access:

   ```text
   Anyone
   ```

   Public anonymous router events need to reach the collector. If Workspace policy blocks this, tracking will not work from island.is users and a different collector must be approved.

7. Click:

   ```text
   Deploy
   ```

8. Copy the Web App URL ending in:

   ```text
   /exec
   ```

9. Paste it into `docs/installation-worksheet.md`.

Use the `/exec` deployment URL for production. Do not use the `/dev` test URL for island.is or GitHub Pages.

## 9. Test the Apps Script endpoint

Open these URLs in a browser, replacing `<APPS_SCRIPT_EXEC_URL>`.

### Health endpoint

```text
<APPS_SCRIPT_EXEC_URL>?api=health
```

Expected:

```json
{"ok":true,...}
```

It must not expose the Spreadsheet ID.

### Dashboard aggregate endpoint

```text
<APPS_SCRIPT_EXEC_URL>?api=dashboard&format=js&callback=TestCallback
```

Expected:

```javascript
TestCallback({...});
```

### Public-safe registry endpoint

```text
<APPS_SCRIPT_EXEC_URL>?api=registry&format=js&callback=TestCallback
```

Expected:

```javascript
TestCallback({...});
```

## 10. Put the Apps Script URL into the router package

Edit only these files.

### 10.1 Canonical dashboard registry

Open:

```text
config/dashboard-registry.json
```

Find:

```json
"tracking": {
  "enabled": true,
  "endpoint": "..."
}
```

Replace `endpoint` with the new Apps Script `/exec` URL.

Do not edit generated files under `assets/` directly.

### 10.2 Status dashboard config

Open:

```text
status-dashboard/assets/status-config.js
```

Replace:

```javascript
dataEndpoint: "..."
```

with the same Apps Script `/exec` URL.

### 10.3 Optional: base path

The package default is:

```json
"basePath": "/Landspitali/"
```

Use this unchanged when the public GitHub Pages URL is shaped like:

```text
https://<github-owner>.github.io/Landspitali/
```

Then dashboard URLs become:

```text
https://<github-owner>.github.io/Landspitali/bradamottaka/
https://<github-owner>.github.io/Landspitali/thjonustukannanir/
```

If the site is published at a custom domain root, change `basePath` to:

```json
"basePath": "/"
```

If the site is published under another repository or folder name, set `basePath` to that path, for example:

```json
"basePath": "/powerbi-router/"
```

## 11. Regenerate router assets

After editing `config/dashboard-registry.json`, run:

```bash
npm run build
```

This regenerates:

```text
assets/router-config.v20260607-1.js
assets/router-config.prod.js
assets/router-config.next.js
assets/router-config.json
bradamottaka/index.html
thjonustukannanir/index.html
index.html
```

Expected result:

```text
Smoke tests OK.
```

## 12. Publish to GitHub Pages

### 12.1 Prepare repository contents

Copy the package contents into the GitHub Pages publishing source.

For a repository named `Landspitali` published from the repository root, copy these to the root of the repository:

```text
.nojekyll
404.html
index.html
assets/
bradamottaka/
thjonustukannanir/
status-dashboard/
config/
docs/
reference/
tests/
tools/
tracker/
README.md
INSTALLATION_GUIDE.md
package.json
```

The public router only needs the static web files, but keeping docs/tools in the repository is useful for maintenance. Do not publish any Google Sheet raw-data links or private credentials.

### 12.2 Commit and push

Example:

```bash
git status
git add .
git commit -m "Install Landspítali Power BI router production v1.0.1"
git push
```

### 12.3 Enable GitHub Pages

In GitHub:

1. Open the repository.
2. Go to:

   ```text
   Settings > Pages
   ```

3. Under “Build and deployment,” choose:

   ```text
   Deploy from a branch
   ```

4. Select the publishing branch, usually:

   ```text
   main
   ```

5. Select folder:

   ```text
   /root
   ```

6. Save.
7. Wait for the Pages deployment to finish.
8. Visit the site URL shown by GitHub.

The `.nojekyll` file is included so GitHub Pages serves the static package without Jekyll processing.

## 13. Test GitHub Pages routes before island.is changes

Replace `<BASE_URL>` with the published GitHub Pages base URL, including trailing slash.

Example base URL:

```text
https://<github-owner>.github.io/Landspitali/
```

### 13.1 Directory and health-style checks

```text
<BASE_URL>?list=1
<BASE_URL>?health=1
<BASE_URL>status-dashboard/
```

### 13.2 Bráðamóttaka debug checks

```text
<BASE_URL>bradamottaka/?debug=1
<BASE_URL>bradamottaka/?force=mobile&debug=1
<BASE_URL>bradamottaka/?force=desktop&debug=1
<BASE_URL>bradamottaka/?noredirect=1
```

Expected:

```text
No automatic redirect in debug/manual mode.
Selected layout and tracking status are visible.
Debug views do not count as visits.
```

### 13.3 Þjónustukannanir debug checks

```text
<BASE_URL>thjonustukannanir/?debug=1
<BASE_URL>thjonustukannanir/?force=mobile&debug=1
<BASE_URL>thjonustukannanir/?force=desktop&debug=1
<BASE_URL>thjonustukannanir/?noredirect=1
```

### 13.4 Real redirect checks

Open these only when ready to leave the router page:

```text
<BASE_URL>bradamottaka/
<BASE_URL>thjonustukannanir/
```

Expected:

```text
Phone or narrow viewport -> mobile Power BI URL
Wide desktop viewport -> desktop Power BI URL
Tracking failure does not block redirect
```

### 13.5 No JavaScript check

In a test browser/profile:

1. Disable JavaScript.
2. Open:

   ```text
   <BASE_URL>bradamottaka/
   ```

3. Expected:

   ```text
   Noscript meta refresh sends the user to the mobile Power BI report.
   ```

Repeat for `thjonustukannanir`.

## 14. Confirm live tracking

1. Open:

   ```text
   <BASE_URL>bradamottaka/?utm_source=island.is&utm_medium=public_dashboard_card&utm_campaign=landspitali_maelabord&utm_content=bradamottakan_fossvogi
   ```

2. Let it redirect.
3. In Apps Script, run:

   ```text
   aggregateRecent
   ```

4. Open the Google Sheet.
5. Confirm `Events_Raw` has a `router_redirect` event.
6. Confirm aggregate sheets updated.
7. Open:

   ```text
   <BASE_URL>status-dashboard/
   ```

8. Confirm the status dashboard shows live aggregate data and a current freshness timestamp.

If the status dashboard shows sample data, check `status-dashboard/assets/status-config.js` and the Apps Script dashboard API URL.

## 15. Update island.is public dashboard card links

The island.is page is the official public entry surface. The router is infrastructure.

Use these router links, replacing `<BASE_URL>`.

### Bráðamóttaka í Fossvogi

```text
<BASE_URL>bradamottaka/?utm_source=island.is&utm_medium=public_dashboard_card&utm_campaign=landspitali_maelabord&utm_content=bradamottakan_fossvogi
```

### Þjónustukannanir

```text
<BASE_URL>thjonustukannanir/?utm_source=island.is&utm_medium=public_dashboard_card&utm_campaign=landspitali_maelabord&utm_content=thjonustukannanir
```

Content checks:

| Dashboard | Public card title | Button text |
|---|---|---|
| Bráðamóttaka | Bráðamóttaka í Fossvogi | Skoða mælaborð |
| Þjónustukannanir | Þjónustukannanir | Skoða mælaborð |

Do not link island.is directly to Power BI unless there is an approved incident workaround.

## 16. Go-live checklist

Before switching the public island.is links, confirm:

```text
[ ] Apps Script Web App /exec URL is deployed and tested.
[ ] Apps Script is versioned deployment, not /dev test deployment.
[ ] Apps Script executes as approved operational account.
[ ] Apps Script access permits anonymous public router events, or an approved alternate collector is used.
[ ] Tracker Google Sheet has all expected tabs.
[ ] installProductionTriggers installed aggregateRecent every 15 minutes.
[ ] testWrite created a test event.
[ ] testAggregation created aggregates.
[ ] config/dashboard-registry.json has the production endpoint.
[ ] status-dashboard/assets/status-config.js has the production endpoint.
[ ] npm run build passes.
[ ] GitHub Pages published successfully.
[ ] .nojekyll is present at the publishing root.
[ ] /bradamottaka/?debug=1 works.
[ ] /thjonustukannanir/?debug=1 works.
[ ] forced mobile and forced desktop debug tests work.
[ ] normal router URLs redirect to Power BI.
[ ] noscript fallback goes to mobile.
[ ] status dashboard shows live aggregate data or clearly marked sample data before first aggregation.
[ ] island.is links use UTM-tagged router URLs.
[ ] Raw event sheet is not public.
[ ] Status dashboard exposes aggregates only.
[ ] Rollback path is documented.
```

## 17. Rollback

Fastest safe rollback:

1. Revert the GitHub repository to the previous known-good commit.
2. Confirm GitHub Pages redeploys.
3. If the new Apps Script deployment is bad, open:

   ```text
   Apps Script > Deploy > Manage deployments
   ```

4. Edit the active deployment to point to the previous known-good version.
5. If island.is links are broken and GitHub rollback cannot be completed quickly, temporarily point island.is buttons to the approved mobile Power BI URLs as an incident workaround.
6. Record the incident in the operator runbook.

## 18. Updating the tracker later without changing the public endpoint

For normal Apps Script updates:

1. Edit and save the script.
2. Create a new Apps Script version.
3. Go to:

   ```text
   Deploy > Manage deployments
   ```

4. Edit the existing Web App deployment.
5. Select the new version.
6. Deploy.
7. Keep the same `/exec` URL.
8. Run:

   ```text
   validateConfig
   testWrite
   testAggregation
   ```

This keeps the public router endpoint stable.

## 19. Adding a dashboard later

1. Add the new dashboard entry only in:

   ```text
   config/dashboard-registry.json
   ```

2. Include:

   ```text
   dashboardKey
   dashboardId
   displayName
   routerDisplayTitle
   powerBiReportTitle
   publicCard title/description/button/icon/page
   desktopUrl
   mobileUrl
   fallbackLayout
   routePolicy
   utmContent
   owner/governance fields
   ```

3. Run:

   ```bash
   npm run build
   ```

4. Test the new dashboard path with:

   ```text
   ?debug=1
   ?force=mobile&debug=1
   ?force=desktop&debug=1
   ?noredirect=1
   normal redirect
   ```

5. Add the UTM-tagged router URL to island.is only after the route is tested.

## 20. Do not do these things

```text
Do not edit the locked master template.
Do not hand-edit generated router wrappers for normal changes.
Do not paste Google Sheet IDs or private sheet URLs into public GitHub Pages files.
Do not make island.is link directly to Power BI except during an approved incident workaround.
Do not expose Events_Raw publicly.
Do not collect cookies, localStorage IDs, names, emails, kennitölur, or raw IP addresses.
Do not rely on tracking for routing.
Do not use the Apps Script /dev URL in production.
Do not count debug, health, directory, bot, or preview events as real public use.
```

## 21. Reference docs checked for this installation guide

These official docs were used to align the deployment steps:

```text
Google Apps Script Web Apps
https://developers.google.com/apps-script/guides/web

Google Apps Script deployments
https://developers.google.com/apps-script/concepts/deployments

Google Apps Script installable triggers
https://developers.google.com/apps-script/guides/triggers/installable

GitHub Pages publishing source
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub Pages site creation and .nojekyll guidance
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
```
