# Troubleshooting

| Symptom | Líkleg skýring | Athuga | Lausnarleið |
|---|---|---|---|
| iPhone Safari not tracking | POST/image fallback issue | transport order, payload size, Events_Raw | staðfesta first-production config/deployment |
| Missing counted visits | Exclusion gate | `count_as_visit`, duplicate, bot, debug/manual | laga source/transport, ekki telja FALSE rows |
| Root events present but no visits | Gateway only | `root_dashboard_click`, dashboard route | staðfesta public link og router path |
| Debug visits not counted | Expected | `debug_mode`, `count_exclusion_reason` | engin fix |
| Bots/link previews visible | Expected raw/diagnostic | bot fields | ekki telja |
| `imageGet` payload too large | URL budget | `imageget_url_length`, near limit | stytta core payload eða nota diagnostic enrichment |
| Smart TV/browser risk | Power BI viewer external | browser/version/device risk | prófa supported browser |
| Samsung forced dark possible | Theme diagnostic | Samsung fields | staðfesta sjónrænt áður en warning er confirmed |
| No data endpoint configured | Tracking disabled | config endpoint | deploy/confirm Apps Script endpoint |
| Cell/chunk issue | Dashboard_Data JSON | chunk count/order | rerun publishDashboardData_ |
| Stale cache | 300s Apps Script cache | generated/cache timestamps | run aggregation/publish or wait |
| Stale aggregation | Trigger/manual not run | Control times | run `aggregateRecent` |
| Wrong ID/key/path | Registry/config mismatch | dashboard key/id/path/aliases | sync source config/registry |
| Forced layout confusion | Query override | `forced_layout`, `forced_layout_applied` | remove force query for auto test |
| Narrow desktop mobile | Policy | viewport <= 1023 | expected unless policy changes |
| Tablet orientation surprise | Orientation/width | route reason/detail | test portrait/landscape |
| Invalid Power BI URL | Validation fallback | safe fallback fields | correct config source |
| Fallback used | Redirect/URL issue | fallback clicks/errors | validate Power BI and redirect |
| Status JSONP failure | Endpoint/callback/cache | console, API URLs | fix endpoint/publish |
| Health warnings | No events/counts/aggregation | `api=health` warnings | trace source before declaring outage |
