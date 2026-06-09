# Operator runbook

## Daily checks

Open the status dashboard and confirm:

- `Staða: í lagi` or a known warning.
- `Síðasta mæling` is recent after normal traffic periods.
- `Síðasta samantekt` is recent.
- `Config útgáfa` matches the intended production version.
- No dashboard has unexpected fallback, error, or safe-fallback warnings.

## Add a new dashboard

1. Add a new dashboard object to `config/dashboard-registry.json`.
2. Include technical fields:
   - `dashboardKey`
   - `dashboardId`
   - `displayName`
   - `path`
   - `aliases`
   - `desktopUrl`
   - `mobileUrl`
   - `fallbackLayout`
   - `routePolicy`
3. Include public island.is fields:
   - `publicCard.title`
   - `publicCard.description`
   - `publicCard.buttonText`
   - `publicCard.iconUrl`
   - `publicCard.pageUrl`
   - `publicCard.stableUtmContent`
   - `publicCard.lastVerifiedDate`
4. Include governance fields:
   - `ownerTeam`
   - `technicalOwner`
   - `contentOwner`
   - `createdDate`
   - `lastReviewedDate`
   - `nextReviewDue`
5. Run:

   ```bash
   npm run build
   ```

6. Commit generated files.
7. Deploy to staging path or test branch first.
8. Test with:
   - `?debug=1`
   - `?force=mobile&debug=1`
   - `?force=desktop&debug=1`
   - normal mobile browser
   - normal desktop browser
9. Update island.is card link only after router tests pass.

## Update a Power BI URL

1. Edit only `desktopUrl` and/or `mobileUrl` in `config/dashboard-registry.json`.
2. Run validation and generation.
3. Test both forced layouts.
4. Commit and deploy.
5. Confirm status dashboard receives `router_redirect` events with the new config version.

## Disable or put a dashboard in maintenance

Preferred maintenance behavior:

```json
"status": "maintenance",
"maintenanceMessage": "Mælaborðið er tímabundið óaðgengilegt."
```

Do not silently route a disabled public dashboard to an unrelated report. If a dashboard is live on island.is, coordinate the public card change at the same time.

## Debug modes

```text
?debug=1
  Shows routing decision without redirect. Does not count as visit.

?force=mobile&debug=1
  Shows what mobile route would do.

?force=desktop&debug=1
  Shows what desktop route would do.

?noredirect=1
  Manual mode. Does not count as visit.

?health=1
  Router health mode. Does not count as visit.

?list=1
  Router directory mode. Does not count as visit by default.
```

## Apps Script operations

Run manually when needed:

```text
setupProductionWorkbook
validateConfig
testWrite
testAggregation
aggregateRecent
archiveOldEvents
```

`doPost` must remain fast. Do not add summary rebuilding, formatting, auto-resize, full-sheet scans, or heavy calculations to the event collection path.

## Known warning meanings

| Warning | Meaning | First action |
|---|---|---|
| `no_events_received_yet` | No raw events are present | Run `testWrite`, then test router |
| `aggregation_never_run` | Scheduled summary has not run | Run `testAggregation`, check trigger |
| `high_fallback_click_rate` | Users are clicking fallback too often | Test redirect timing and blockers |
| `router_errors_seen` | Router sent error events | Check core/config version and debug route |
| `safe_fallback_used` | Router fell back to embedded/safe behavior | Check central config, Power BI URLs, and config validation |
| `many_preview_or_bot_events` | Link previews or bots are visible | Confirm they are not counted as visits |

## The Monday morning rule

Before public changes, verify that one island.is button opens one GitHub Pages route, the route opens one Power BI report, and a dead tracker does not strand the user. Everything else is commentary from the machinery room.
