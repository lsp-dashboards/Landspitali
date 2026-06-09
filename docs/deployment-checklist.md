# Deployment checklist

## Freeze

- Save a copy of the previous test package.
- Save a copy of the current Apps Script code.
- Save a copy of the current Google Sheet.
- Record current Apps Script deployment URL.
- Record current GitHub Pages commit.
- Confirm the locked master template remains unchanged.

## Build

```bash
npm run build
```

Expected output:

- Registry warnings for intentional public title/display name differences.
- No validation errors.
- Smoke tests OK.

## Apps Script

1. Paste `tracker/powerbi_router_tracker_apps_script_v1.js` into Apps Script.
2. Run `setupProductionWorkbook`.
3. Run `installProductionTriggers`.
4. Run `testWrite`.
5. Run `testAggregation`.
6. Deploy as Web App.
7. Copy deployment URL.
8. Update registry and status config if the URL changed.
9. Regenerate assets.

## GitHub Pages

Upload or commit:

```text
index.html
assets/
bradamottaka/
thjonustukannanir/
status-dashboard/
```

Do not publish raw Google Sheet links in public HTML.

## island.is

Use UTM-tagged router URLs. Do not link directly to Power BI unless there is an approved incident workaround.

## Post-deploy verification

- `/bradamottaka/?debug=1`
- `/bradamottaka/?force=mobile&debug=1`
- `/bradamottaka/?force=desktop&debug=1`
- `/thjonustukannanir/?debug=1`
- `/thjonustukannanir/?force=mobile&debug=1`
- `/thjonustukannanir/?force=desktop&debug=1`
- `/status-dashboard/`
- Apps Script `api=health`
- Apps Script `api=dashboard&format=js&callback=TestCallback`

## Success criteria

- Normal router URL redirects to Power BI.
- Tracking endpoint failure does not block redirect.
- Debug mode does not redirect.
- Debug mode does not count as a visit.
- No-JavaScript fallback goes to mobile.
- Status dashboard shows live aggregate data after aggregation.
- Link previews or bots are visible but not counted as visits.
