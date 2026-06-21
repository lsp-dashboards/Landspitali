# Testing and QA

## Static Checks

- Validate `assets/router-config.json` as JSON.
- Confirm generated config JS starts with the generated header and matches source config `v1.0.0`.
- Confirm referenced source files exist.
- Confirm approved Power BI URLs, endpoint, dashboard IDs and route policy.
- Run HTML/JS syntax checks where available.
- For local scripts run `npm run validate`.

## Router Tests

Root gateway:

- Normal load.
- Cards render.
- Fallback cards render if config fails.
- Each card shows automatic routing plus desktop/mobile options.
- Forced buttons include `force=desktop` or `force=mobile`.
- `?debug=1`, `?list=1`, `?dashboards=1`, `?health=1`, `?status=1`, `?dashboard=bradamottaka`, `?id=thjonustukannanir`.

Each dashboard:

- Normal redirect.
- `?debug=1`.
- `?manual=1`.
- `?noredirect=1`.
- `?force=mobile`.
- `?force=desktop`.
- `?view=mobile`.
- `?view=desktop`.
- Fallback link.
- Noscript fallback.

Review Edge/IE fallback if present: source `isIeMode()` uses `microsoft-edge:` redirect for Trident/IE mode.

## Device/Browser Matrix

Test iPhone Safari, Android Chrome, Samsung Internet, desktop Edge/Chrome/Safari/Firefox, tablet portrait/landscape, narrow desktop under 1024px and Smart TV/console risk when a device is available.

## Apps Script Tests

- `api=health`.
- `api=status`.
- `api=dashboard`.
- `api=dashboard&format=js&callback=LandspitaliRouterStatusData`.
- `api=registry`.
- Normal POST from router.
- GET fallback when needed.
- `aggregateRecent`.
- `publishDashboardData_`.

## Status Dashboard Tests

- Real mode calls Apps Script `api=dashboard` JSONP on initial load, manual refresh and every 5 minutes.
- Static JSON fallback works if Apps Script is unavailable, and stale static JSON is clearly warned.
- Sample mode tries the public sample sheet and falls back to `status-sample.json`.
- Refresh button reloads the current mode.
- 22-second timeout and one retry remain in JSONP paths.
- Health, generated timestamp and source chips render after data load.
- Section-level `safeRender` shows a section error without blanking the page.
- Counting integrity appears near the top and separates counted, raw, diagnostic, excluded and fallback/error signals.
- Source/flow appears as one coherent section.
- Portfolio rows remain scannable with 2 dashboards and synthetic 8+ dashboard data.
- Gæðavakt displays confirmed production warnings above diagnostic context.
- Sönnunargögn exposes only aggregate timestamps, route audit and dashboard passport evidence.

## Responsive/Accessibility Smoke

- Mobile 360px, tablet 768px, desktop 1366px and wide 1720px.
- Browser zoom 125%.
- `prefers-reduced-motion`.
- Keyboard focus on toggles, refresh and links.
- Sufficient contrast and no hover-only essential information.
- No horizontal page scrollbar; audit tables may scroll internally.
- Text does not overlap or overflow buttons/cards at narrow widths.

## Count Validation

Confirm debug/root/bot/diagnostic/manual/test/list/health rows are not counted visits. Inspect `count_as_visit`, `count_exclusion_reason`, `event_type`, `duplicate_event` and aggregate totals.

## Production Handoff

- `npm run validate` passes.
- Generated files match source.
- Product-owned labels are `v1.0.0`.
- Apps Script health and dashboard endpoints respond.
- Mælaborðsmælingar loads live data.
- Restore path is documented in [production-deployment.md](production-deployment.md).
