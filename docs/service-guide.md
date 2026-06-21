# Service Guide

## Purpose

The service keeps public Power BI route paths stable, sends users to the correct mobile/desktop report view, and gives maintainers operational visibility without personal identification.

## Service Boundary

Inside the system: GitHub Pages root gateway, dashboard router pages, router config/core, Apps Script tracker, Google Sheets aggregate sheets and Mælaborðsmælingar.

Outside the system: Power BI publish-to-web behavior, island.is publishing, Google Apps Script/Sheets platform limits, browser policy and corporate network blockers.

## Roles

- Content owner: confirms public card text, publication state and Power BI report content.
- Technical owner: keeps config, router pages, tracker and status dashboard aligned.
- Deployment owner: confirms version identity, generated files, smoke tests and restore path.
- Incident owner: uses the debug handbook, raw/aggregate sheets and status data before giving a conclusion.

## Regular Checks

Daily and before handoff: open root gateway, open each dashboard normally, test `?health=1`, open Mælaborðsmælingar and confirm aggregation freshness.

Weekly: inspect confirmed warnings, fallback/error share, weak/unknown signal share, route/source coverage and public card registry.

Monthly: confirm Power BI URL roles, config/generated consistency, Apps Script deployment, registry/control sheet and review dates.

## Scope Checks

Public publication scope: confirm island.is card, root gateway card, normal dashboard redirect, Apps Script row, aggregation, Mælaborðsmælingar public card and launch timestamp.

Config scope: confirm valid JSON, generated config JS consistency, dashboard IDs, aliases, route policy and status registry.

Core scope: run router smoke tests on desktop/mobile/tablet, debug/manual/health/list and iPhone Safari transport.

Apps Script scope: run `setupProductionWorkbook`, `validateConfig`, `aggregateRecent`, `publishDashboardData_` when allowed by deployment policy, then confirm `api=health`.

island.is link scope: confirm UTM/source, root gateway click tracking and public card metadata.

Power BI URL scope: test desktop/mobile URL directly, `?force=mobile`, `?force=desktop`, fallback and noscript.

## Incident Triage

1. Reproduce with `?debug=1&manual=1`.
2. Read selected layout, route reason, viewport and target URL role.
3. Check `api=health` and `api=dashboard`.
4. Find the raw row in `Events_Raw`.
5. Confirm `count_as_visit` and `count_exclusion_reason`.
6. Run aggregation when appropriate.
7. Read Mælaborðsmælingar after fresh payload.

Confirmed warning means a production-linked warning with `confirmed_count` or counted non-info signal. Diagnostic signal is technical context, often `severity = info`, and does not automatically mean production failure.

Operational device scenarios: iPhone Safari requires navigation-safe POST transport; Samsung Internet can report forced-dark diagnostics; tablet portrait is mobile; tablet landscape can be desktop; narrow desktop can correctly route to mobile; Smart TV/console/WebView is Power BI viewer compatibility risk, not automatic router failure.

Before service health is stated, confirm that the router opens the correct Power BI URL, Apps Script receives events, aggregation runs, status payload loads, counted visits are separated from debug/root/bot/diagnostic/manual/list/health, and every confirmed production warning is explained.
