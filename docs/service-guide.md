# Service Guide

## Tilgangur

Þjónustan á að halda opinberum Power BI route-slóðum stöðugum, leiða notendur á rétta mobile/desktop útgáfu og gefa viðhaldsaðilum rekstrarsýn án persónugreiningar.

## Mörk þjónustu

Innan kerfis: GitHub Pages root gateway, dashboard router pages, router config/core, Apps Script tracker, Google Sheets aggregate sheets og Mælaborðsmælingar.

Utan kerfis: Power BI publish-to-web virkni, island.is birtingarkerfi, Google Apps Script/Sheets platform limits, browser policies og corporate network blockers.

## Hlutverk

- Content owner: staðfestir að public card texti, birting og Power BI skýrsla séu rétt.
- Technical owner: heldur config, router pages, tracker og status dashboard samstilltu.
- Release owner: staðfestir version map, generated files, smoke tests og rollback.
- Incident owner: skoðar debug handbook, raw/aggregate sheets og status data áður en niðurstaða er gefin.

## Reglubundnar athuganir

Daglega eða eftir breytingu: opna root gateway, opna hvert dashboard normal, prófa `?health=1`, prófa status dashboard, staðfesta að aggregation sé fersk.

Vikulega: skoða `Gæðaviðvaranir`, fallback/error hlutfall, weak/unknown signal share, Leiðingarskipting og public card registry.

Mánaðarlega: staðfesta Power BI URL hlutverk, config/generated consistency, Apps Script deployment, registry/control sheet og review dates.

## Eftir breytingar

Eftir public publication: staðfesta island.is kort, root gateway kort, normal dashboard redirect, Apps Script row, aggregation, Mælaborðsmælingar public card og launch timestamp.

Eftir config change: staðfesta JSON valid, generated config JS samræmi, dashboard IDs, aliases, route policy og status registry.

Eftir core change: keyra router smoke tests á desktop/mobile/tablet, debug/manual/health/list og iPhone Safari transport.

Eftir Apps Script change: keyra `setupProductionWorkbook`, `validateConfig`, `aggregateRecent`, `publishDashboardData_` ef deployment policy leyfir og staðfesta `api=health`.

Eftir island.is link change: staðfesta UTM/source, root gateway click tracking og public card metadata.

Eftir Power BI URL change: prófa desktop/mobile URL beint, `?force=mobile`, `?force=desktop`, fallback og noscript.

## Incident triage

1. Endurskapa með `?debug=1&manual=1`.
2. Lesa selected layout, route reason, viewport og target URL role.
3. Athuga `api=health` og `api=dashboard`.
4. Finna raw row í `Events_Raw`.
5. Staðfesta `count_as_visit` og `count_exclusion_reason`.
6. Keyra aggregation ef viðeigandi.
7. Lesa Mælaborðsmælingar eftir fresh payload.

Confirmed warning er production-tengt warning með `confirmed_count` eða counted non-info signal. Diagnostic signal er tæknimerki, oft `severity = info`, sem þarf ekki að þýða production bilun.

Known user/device scenarios: iPhone Safari þarf navigation-safe POST transport; Samsung Internet getur haft forced dark diagnostic; tablet portrait er mobile; tablet landscape getur verið desktop; narrow desktop getur réttilega farið á mobile; Smart TV/console/WebView er Power BI viewer compatibility risk en ekki sjálfkrafa router failure.

Áður en sagt er að þjónustan sé heilbrigð þarf að staðfesta: router opnar rétt Power BI URL, Apps Script tekur við, aggregation keyrir, status payload hleðst, taldar heimsóknir eru aðgreindar frá debug/root/bot/diagnostic/manual/list/health, og engin staðfest production warning er óútskýrð.
