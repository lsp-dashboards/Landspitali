# Status Dashboard Guide: Mælaborðsmælingar

Source: `status-dashboard/index.html`, `status-dashboard/status.css`, `status-dashboard/status.js`.

`Mælaborðsmælingar` er public heiti stöðuyfirlitsins. Síðan er local-first static GitHub Pages dashboard án bundler, framework eða npm dependency. Hún birtir aðeins samantektargögn fyrir opinber Power BI mælaborð Landspítala.

Raunhamur sækir lifandi Apps Script JSONP gögn á fyrstu hleðslu, refresh og sjálfvirkt á 5 mínútna fresti:

```text
DATA_ENDPOINT + ?api=dashboard&format=js&callback=<callback>&v=<timestamp>
```

Ef Apps Script svarar ekki notar síðan local static snapshot sem fallback. Ef snapshot vantar timestamp eða er eldra en 24 klst. er það samt birt sem úrelt fallback með viðvörun:

```text
../assets/data/status-latest.json
```

Sample hamur reynir fyrst public sample sheet JSONP og fellur síðan í `../assets/data/status-sample.json`.

Timeout fyrir JSONP er 22 sekúndur með einni endurtilraun. Refresh hnappur endurhleður virkan gagnaham. `safeRender` vefur allar aðalsections svo ein render villa felli ekki allt dashboard.

## Information architecture

Nýja dashboardið er skipulagt sem operational cockpit í þessari röð:

1. Command rail: Landspítali merki, `Mælaborðsmælingar`, real/sample toggle, refresh, health chip, generated timestamp, source og component/version strip.
2. Staða núna: operational score, taldar opnanir, virk mælaborð, staðfest production merki, síðasta talda opnun, aggregation freshness, island.is hlutdeild og ein rekstrarsetning.
3. Talning og traust: raw merki, production candidates, taldar opnanir, útilokuð merki og fallback/error hliðarrás ásamt reconciliation töflu.
4. Flæði og uppruni: ein signature flow mynd frá uppruna/gateway/router í mobile eða desktop og talda Power BI opnun.
5. Mælaborðasafn: ranked card/table hybrid með hlutdeildarbar, tímabilum, source mix, mobile/desktop split, warning chip, confidence og freshness.
6. Leiðingarskipting: route reason x layout matrix, device x layout matrix, sjálfvirkt/þvingað split og compact anomaly list.
7. Umhverfi og afhending: tvær rekstrarlanes fyrir tæki/vafra/skjá og sending/payload/netmerki.
8. Gæðavakt: staðfest production merki fyrst, diagnostic samhengi neðar og rólegra.
9. Sönnunargögn: timestamps, schema/config/script/core source, route audit og compact dashboard passport evidence.

## Hvernig á að lesa tölur

Taldar opnanir koma aðeins úr production dashboard opnunum. Raw, root/gateway og diagnostic eru aðskilin rekstrarmerki. `count_as_visit = FALSE` raðir hækka ekki notkun.

Diagnostic merki, til dæmis forced-dark eða Samsung forced-dark possible, eru ekki staðfest production failure nema aggregate warning staðfesti counted impact.

Power BI viewer/browser risk er operational context vegna mismunandi browser stuðnings, en það er áfram lesið í gegnum aggregate warnings og counted/diagnostic skiptingu.

Lítil sample size getur skekkt prósentur. Lesa skal totals, freshness, source mix og warning confidence saman.

## Visual policy

ECharts var fjarlægt úr active dashboard path. Núverandi myndræn framsetning notar HTML/CSS bars, stacks, matrices og compact tables með textalegri fallback merkingu. Ástæðan er að núverandi payload er bucketed aggregate data og þarf skýr labels frekar en þung chart runtime.

Dashboardið notar einn dark token system í `status.css`, reusable primitives (`.shell`, `.command-rail`, `.section`, `.grid-12`, `.card`, `.kpi`, `.metric-row`, `.matrix`, `.bar`, `.stack`, `.queue`, `.audit-table`, `.chip`, `.badge`) og dynamic inline styles aðeins fyrir CSS variables á gagnadrifnum bars/score.

## Implementation notes

- Active render path í `status.js`: constants, DOM/format/safety helpers, data derivation, primitive render helpers, section renderers, data loading og bootstrap.
- Derivation helpers: `deriveStatusNow`, `deriveCountingIntegrity`, `deriveFlowSource`, `derivePortfolio`, `deriveRouting`, `deriveEnvironment`, `deriveQualityQueue`, `deriveAuditEvidence`.
- Apps Script live-first load, 5-minute live refresh, stale/static JSON fallback, sample mode, refresh, health/status pills og section-level safeRender eru varðveitt.
- No aggregate payload fields were added. `docs/data-dictionary.md` þarf ekki breytingu fyrir þessa UI-only endurskipulagningu.

## Metric inventory

| Metric | Source field | Primary section | Secondary section | Visual form | Reason |
|---|---|---|---|---|---|
| Total counted visits | `kpis.total_visits`, `dashboards[].total_visits` | Staða núna | Mælaborðasafn | KPI, ranked bars | Headline usage and per-dashboard share |
| Raw events | `kpis.raw_events`, `kpis.total_events` | Talning og traust | Sönnunargögn | Process rail, timestamp evidence | Explain why raw is not usage |
| Diagnostic events | `kpis.diagnostic_events`, `quality_warnings[].diagnostic_count` | Talning og traust | Gæðavakt | Process rail, queue context | Separate diagnostic context from production |
| Active dashboards | `kpis.active_dashboards`, `dashboards[]` | Staða núna | Mælaborðasafn | KPI, portfolio rows | Current portfolio size and scan context |
| Confirmed production warnings | `kpis.confirmed_warnings`, `quality_warnings[].is_confirmed` | Gæðavakt | Staða núna | Action queue, KPI | Action priority and executive status |
| Warning count | `dashboards[].warning_count` | Mælaborðasafn | Gæðavakt | Chip, queue item | Show affected dashboard before detailed action |
| Mobile visits/share | `kpis.mobile_visits`, `dashboards[].mobile_visits`, `routes[].selected_layout` | Leiðingarskipting | Mælaborðasafn | Matrix, chip | Explain selected layout and per-dashboard context |
| Desktop visits/share | `kpis.desktop_visits`, `dashboards[].desktop_visits`, `routes[].selected_layout` | Leiðingarskipting | Mælaborðasafn | Matrix, chip | Pair with mobile split without duplicate donuts |
| island.is visits/share | `kpis.island_is_visits`, `sources[].entry_source_category` | Flæði og uppruni | Staða núna | Source bars, KPI | Public source trust and headline provenance |
| Direct/other source share | `sources[]` | Flæði og uppruni | Mælaborðasafn | Source bars, stack | Explain non-island.is source mix |
| Fallback clicks | `kpis.fallback_error_count`, `dashboards[].fallback_clicks` | Umhverfi og afhending | Talning og traust | Delivery chip, process side channel | Delivery risk without treating it as usage |
| Safe fallback events | `dashboards[].safe_fallback_events` | Talning og traust | Umhverfi og afhending | Samræmingarlína, merki | Route safety signal |
| Unsupported browser events | `kpis.powerbi_viewer_unsupported_browser_events` | Umhverfi og afhending | Gæðavakt | Delivery chip, queue item | Viewer risk is operational context |
| Weak/unknown signal share | `kpis.weak_unknown_signal_share`, `kpis.weak_unknown_signal_count` | Staða núna | Sönnunargögn | Score input, version/evidence context | Affects operational score and trust |
| Latest counted event | `health.last_counted_event_time`, `dashboards[].last_counted_event_time` | Staða núna | Sönnunargögn | KPI, evidence row | Current tracker life signal |
| Latest raw event | `health.last_raw_event_time`, `dashboards[].last_raw_event_time` | Sönnunargögn | Talning og traust | Evidence row | Trace raw signal freshness without headline duplication |
| Aggregation freshness | `aggregation_generated_at`, `dashboard_data_generated_at`, `generated_at` | Staða núna | Sönnunargögn | KPI, evidence row | Shows aggregate age and score freshness penalty |
| Operational score | Derived in `opsModel()` | Staða núna | None | Score ring | Single summary of health, not popularity |

## Privacy

Footer og render path halda aggregate-only reglu: engin nöfn, netföng, kennitölur, raw IP, raw user-agent texti, request/event auðkenni eða Power BI innri gögn eru birt. Route audit og dashboard passport sections nota aðeins aggregate fields.
