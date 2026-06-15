# Production Guide

## Deployment model

GitHub Pages hýsir static HTML/JS undir `/Landspitali/`. Google Apps Script Web App tekur við telemetry og skilar JSON/JSONP. Google Sheets geymir raw internal rows, aggregate sheets, registry, control og `Dashboard_Data`.

## Nýtt dashboard

1. Afrita locked Bráðamóttakan router reference (`templates/bradamottaka-locked-master-reference.html`) í nýja folder.
2. Breyta aðeins samþykktum dashboard-specific gildum:
   - Dashboard display name.
   - Dashboard ID.
   - Desktop Power BI publish-to-web URL.
   - Mobile Power BI publish-to-web URL.
   - Fallback mobile URL.
   - Noscript mobile URL.
   - Dashboard name í router comment ef comment er til staðar.
3. Bæta entry í `assets/router-config.json`.
4. Bæta aliases, public card metadata, icon URL, route policy og governance.
5. Keyra `tools/generate-router-assets.ps1` til að endurgera generated config JS og versioned assets.
6. Uppfæra Apps Script registry/control sheets eða registry snapshot samkvæmt release ferli.
7. Prófa `?debug=1`, `?manual=1`, `?force=mobile`, `?force=desktop`, normal redirect, fallback og noscript.
8. Staðfesta Apps Script event, keyra aggregation/publish og staðfesta Mælaborðsmælingar.
9. Skrá raunverulegan publish timestamp.

## Uppfærsla á `router-config.json`

`router-config.json` er source config þegar generated JS er samstillt við hann. Uppfæra skal aðeins viðeigandi dashboard entry, aliases, publicCard, governance eða route policy. Eftir breytingu þarf að validate-a JSON, keyra `tools/generate-router-assets.ps1`, bera saman við generated config, staðfesta dashboard IDs og Power BI URL roles og keyra smoke tests.

## Apps Script deployment

Source staðfestir að script er Web App með `doGet` og `doPost`. Deploy skal sem script owner eða rekstrar-service account samkvæmt header comment. Eftir deployment skal prófa:

- `<APPS_SCRIPT_EXEC_URL>?api=health`
- `<APPS_SCRIPT_EXEC_URL>?api=dashboard`
- `<APPS_SCRIPT_EXEC_URL>?api=registry`

Source staðfestir callable setup/aggregation functions: `setupProductionWorkbook`, `setupProductionWorkbook_`, `setupWorkbookPublic`, `migrateSchemaV1`, `migrateGagnasnid1`, historical compatibility wrappers such as `migrateSchemaV8`/`migrateSchemaV9`, `migrateSmartTvPowerBiCompatV122`, `aggregateRecent`, `testAggregation`, `validateConfig`, `archiveOldEvents`.

## Release checklist

- JSON valid: `assets/router-config.json`.
- Generated config JS matches JSON and is not hand-edited.
- Power BI URLs unchanged except intentional release.
- Apps Script endpoint unchanged except intentional release.
- Dashboard IDs unchanged except intentional release.
- Route policy unchanged except intentional release.
- `count_as_visit` logic unchanged.
- Debug/root/bot/diagnostic/manual/test/list/health remain excluded.
- Status dashboard loads JSONP.
- `Dashboard_Data` chunks are regenerated.
- Cache/freshness visible in Mælaborðsmælingar.

## Rollback

Rollback static site by reverting the GitHub Pages commit. Rollback Apps Script through Apps Script deployment version history. If config changed, confirm generated config and Apps Script registry/control sheet are returned to matching values. Clear or refresh dashboard cache by running aggregation/publish where appropriate.

## What not to touch

Ekki refactora locked router template. Ekki handbreyta generated config JS. Ekki breyta route/tracking/counting/warning/scoring behavior sem hluta af documentation eða routine release.
