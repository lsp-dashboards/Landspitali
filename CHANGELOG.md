# Changelog

## 1.0.1 - 2026-06-09

### Added

- Added `INSTALLATION_GUIDE.md` with full first-install steps.
- Added `docs/installation-worksheet.md` for recording deployment values and signoff.
- Added `docs/troubleshooting.md` for common installation and live-route problems.
- Added `.nojekyll` for GitHub Pages static publishing.
- Added `404.html` with a noindex route-not-found page.

### Changed

- Updated tracker script to support both Sheet-bound Apps Script installs and standalone installs with `TRACKER_SPREADSHEET_ID`.
- Added `verifySpreadsheetSetup` to test workbook binding before setup.
- Removed accidental literal control characters from the tracker script regex source.

## 1.0.0 - 2026-06-07

Official first production version.

### Added

- Canonical dashboard registry with public island.is metadata.
- Generated router config JS from canonical JSON.
- Versioned router core pinned by dashboard wrappers.
- Generated Bráðamóttaka and Þjónustukannanir wrappers.
- Embedded safe dashboard config in every wrapper.
- Emergency core-load mobile fallback guard.
- Apps Script production tracker v1.
- Append-only raw event collection.
- Scheduled aggregation model.
- Aggregate-only dashboard API/JSONP output.
- External static status dashboard.
- Public card metadata tables.
- Data dictionary.
- Operator runbook.
- Privacy and retention documentation.
- island.is publication checklist.
- Deployment and rollback checklist.
- Router test matrix.
- Registry validation and generation tools.
- Smoke tests.

### Changed from test package

- `router-config.json` is canonical.
- `router-config.js` is generated.
- Summary/Daily/CrossTabs style sheets are replaced with explicit aggregate tabs.
- Tracking schema is reduced by default.
- Diagnostics are optional.
- Dashboard query override is locked on dashboard wrappers.
- Link preview/bot events are visible but not counted by default.

### Preserved

- GitHub Pages router model.
- Mobile/desktop routing.
- Mobile safe fallback.
- Noscript fallback.
- Debug mode.
- Forced mobile/desktop testing.
- Health/manual/list modes.
- Error tracking.
- Apps Script/Sheets as the v1 low-cost backend.
