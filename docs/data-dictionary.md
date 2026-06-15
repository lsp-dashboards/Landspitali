# Data Dictionary

Source: `tracker/powerbi_router_tracker_apps_script_v1.0.0.js`, header arrays og `FIELD_DICTIONARY`.

Raw/internal sheets eru aðeins fyrir rekstur. Public/status payload er aðeins samantektargögn.

## Sheet groups

| Header group | Sheet | Hlutverk | Public? |
|---|---|---|---|
| `EVENT_HEADERS` | `Events_Raw` | raw tracker rows | Nei |
| `ERROR_HEADERS` | `Errors` | script/router errors | Nei |
| `DAILY_HEADERS` | `Aggregates_Daily` | dagleg samantekt | Aggregate |
| `HOURLY_HEADERS` | `Aggregates_Hourly` | klukkustundasamantekt | Aggregate |
| `DASHBOARD_HEADERS` | `Aggregates_Dashboard` | dashboard totals, warnings, confidence | Aggregate/public payload |
| `DEVICE_HEADERS` | `Aggregates_Device` | device/browser/display mix | Aggregate |
| `SOURCE_HEADERS` | `Aggregates_Source` | source/UTM mix | Aggregate |
| `ROUTE_HEADERS` | `Aggregates_Route` | route reason/layout mix | Aggregate |
| `QUALITY_HEADERS` | `Aggregates_Quality` | warnings/diagnostic signals | Aggregate |
| `DASHBOARD_REGISTRY_HEADERS` | `Dashboard_Registry` | internal dashboard registry | Internal/aggregate |
| `PUBLIC_REGISTRY_HEADERS` | `Public_Page_Registry` | public card registry | Public metadata |
| `CONTROL_HEADERS` | `Control` | script state/freshness | Internal |
| `ARCHIVE_LOG_HEADERS` | `Archive_Log` | retention archive log | Internal |
| `DASHBOARD_DATA_HEADERS` | `Dashboard_Data` | chunked JSON status payload | Public aggregate source |
| `DEVICE_CONFIDENCE_HEADERS` | `Aggregates_DeviceConfidence` | device inference aggregate | Aggregate |
| `BROWSER_HEADERS` | `Aggregates_Browser` | browser aggregate | Aggregate |
| `OS_HEADERS` | `Aggregates_OS` | OS aggregate | Aggregate |
| `DISPLAY_HEADERS` | `Aggregates_Display` | viewport/theme aggregate | Aggregate |
| `INPUT_HEADERS` | `Aggregates_Input` | touch/pointer/hover aggregate | Aggregate |
| `PERFORMANCE_HEADERS` | `Aggregates_Performance` | transport/performance aggregate | Aggregate |
| `SCHEMA_MIGRATION_LOG_HEADERS` | `Schema_Migration_Log` | migration/setup log | Internal |

## Critical raw fields

| Field | Skýring | Source | Count? | Rekstrarstig/warnings? | Caveat |
|---|---|---|---|---|---|
| `event_type` | Tegund atburðar | Router/Apps Script | Já, aðeins `router_redirect`/`router_noscript` geta talist | Já | Debug/root/fallback/error eru ekki visits |
| `schema_version` | Canonical event schema version | Router/root alias normalized by Apps Script | Nei | Diagnostic | Router notar `schema_version`; root gateway getur sent `event_schema_version` |
| `count_as_visit` | TRUE aðeins fyrir real dashboard opens | Router, normalized server-side | Já | Já | `FALSE` má aldrei lesa sem usage |
| `duplicate_event` | Event ID sést áður í CacheService | Apps Script | Já, útilokar | Já | Cache dedupe er tímabundið |
| `count_exclusion_reason` | Ástæða útilokunar | Router/Apps Script | Já | Já | Skoða alltaf í count debugging |
| `dashboard_key`/`dashboard_id` | Mælaborðs auðkenni | Config/router | Já | Já | Registry mismatch veldur unknown |
| `selected_layout` | Endanlegt mobile/desktop val | Router | Já | Já | Force override getur skýrt frávik |
| `auto_selected_layout` | Auto val áður en force er beitt | Router | Nei | Já | Berið saman við forced layout |
| `forced_layout` | `mobile`, `desktop` eða `auto` | Query/router | Já | Já | Forced normal redirect getur talist visit |
| `route_reason`/`route_reason_detail` | Ástæða routing | Router | Nei | Já | Detail er skorið niður í payload |
| `device_class` | Basic router device class | Router | Nei | Já | Inference, ekki identity |
| `inferred_device_class` | Advanced inference class | Router | Nei | Já | Veik inference er ekki staðfest tæki |
| `inferred_confidence_band` | Confidence band | Router | Nei | Já | Weak/unknown share hefur áhrif á score |
| `entry_source_category` | Source flokkur | Router/Apps Script | Nei | Já | Referrer getur vantað |
| `tracking_method`/`tracker_send_method` | `sendBeacon`, `fetchKeepalive`, `imageGet` | Router | Nei | Diagnostic | `queued` er ekki end-to-end delivery proof |
| `tracker_send_status` | Send status | Router | Nei | Diagnostic | No-cors þýðir response óþekkt |
| `root_launch_choice` | Root gateway val: `auto`, `desktop` eða `mobile` | Root router | Nei | Diagnostic | Root events eru ekki visits |
| `warning_code`/`warning_detail` | Incoming warning | Router | Nei | Já | Severity/confirmed skiptir máli |
| `safe_fallback_used` | Router notaði fallback | Router | Nei | Já | Production warning ef counted eða aggregate staðfest |
| `fallback_link_clicked` | Notandi smellti fallback | Router | Nei | Já | Getur bent á redirect/Power BI vandamál |
| `inferred_is_bot`/`inferred_is_link_preview` | Bot/preview inference | Router | Já, útilokar | Já | Bot events eru raw/diagnostic |
| `prefers_reduced_transparency` | Browser media setting fyrir reduced transparency | Router | Nei | Diagnostic | Aggregate display context, ekki identity |
| `monochrome` | Browser media setting fyrir monochrome/color | Router | Nei | Diagnostic | Fer eftir browser support |
| `update_frequency` | Browser media setting fyrir update frequency | Router | Nei | Diagnostic | Hjálpar að greina low-refresh/e-reader/signage samhengi |
| `overflow_block`/`overflow_inline` | Browser media setting fyrir overflow hegðun | Router | Nei | Diagnostic | Aggregate display context |
| `scripting` | CSS media signal fyrir scripting support | Router | Nei | Diagnostic | Aðskilið frá því að tracker JS hafi keyrt |
| `display_mode` | Browser display-mode (`browser`, `standalone`, `fullscreen`) | Router | Nei | Diagnostic | Hjálpar að greina PWA/fullscreen/kiosk samhengi |

## Aggregate field groups

`DASHBOARD_HEADERS` inniheldur `visits_today`, `visits_7d`, `visits_30d`, `total_visits`, `total_events`, `raw_events`, `diagnostic_events`, layout/source totals, last event timestamps, `warning_count`, `confirmed_warning_count`, `diagnostic_signal_count`, `confidence_band`, `weak_unknown_signal_count`, `config_version`, `core_version`.

`QUALITY_HEADERS` inniheldur `warning_code`, `severity`, `warning_text`, `recommendation`, `count`, `counted_count`, `diagnostic_count`, `confirmed_count`, `is_confirmed`, `signal_quality`, `confidence_band`.

`DASHBOARD_DATA_HEADERS` geymir `generated_at`, `chunk_index`, `chunk_count`, `json_chunk`. Source notar `DASHBOARD_DATA_STORAGE_FORMAT = "chunked_json_v1"` og `DASHBOARD_DATA_CELL_CHAR_BUDGET = 45000`.

## Count effect

Visit count byggist á `isRealVisit_`: `count_as_visit = TRUE`, ekki duplicate, ekki bot/link preview, ekki debug/manual/health/list/test/diagnostic-like, og `event_type` er `router_redirect` eða `router_noscript`.

## Rekstrarstig effect

Rekstrarstig notar aggregate confirmed warnings, fallback/error count, weak/unknown signal share og freshness. Einstök raw fields hafa aðeins áhrif í gegnum aggregate sheets/warning pipeline.
