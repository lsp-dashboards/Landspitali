# First-Production Hardening Review

Date: 2026-06-15  
Package: `1.0.0`  
Config: `2026-06-15-prod-v1.0.0`  
Scope: Landspitali static router, root gateway, Apps Script tracker, Google Sheets aggregate model, `Mælaborðsmælingar`, docs and generated assets.

## 1. Executive Summary

The package is architecturally sound for first production publication: static GitHub Pages routes choose a validated Power BI publish-to-web URL, queue telemetry fire-and-forget, and navigate without waiting for Apps Script. Public status output is aðeins samantektargögn, root/debug/bot/manual/diagnostic events are excluded from production visits, and locked public labels remain on `v1.0.0`.

Safe hardening changes were implemented: `routing.redirectDelayMs` is now `0`, generated config files were rebuilt, fallback-click telemetry is one-shot, raw Sheets strings are neutralized against spreadsheet formula injection, schema version aliases are persisted as canonical `schema_version`, first-production wording was normalized, official references were updated, and a status-dashboard header overflow bug was fixed.

Final recommendation: publish-ready after deployment smoke tests on GitHub Pages, Apps Script deployment, Power BI open tests, and the manual device/source matrix below.

## 2. Package Map

| File path | Purpose | Runtime role | Type | Safe to change? | Approval guard |
|---|---|---|---|---|---|
| `README.md` | Repository overview, path map, locked version map | Operator/developer entry | Docs | Yes | Do not change locked labels without explicit approval |
| `index.html` | Root gateway and public dashboard choice page | Live GitHub Pages route `/Landspitali/` | Live page | Yes, carefully | Do not break paths, launch choices, or root non-visit rules |
| `bradamottaka/index.html` | Bráðamóttaka router page | Live route `/Landspitali/bradamottaka/` | Live page | Only surgical | Do not change dashboard key or Power BI URLs without proof |
| `thjonustukannanir/index.html` | Þjónustukannanir router page | Live route `/Landspitali/thjonustukannanir/` | Live page | Only surgical | Do not change dashboard key or Power BI URLs without proof |
| `templates/bradamottaka-locked-master-reference.html` | Independent locked Bráðamóttakan master reference | Template/governance | Locked template | No casual edits | Treat as master reference |
| `assets/router-config.json` | Central router, tracking, path, dashboard and release config | Source loaded by generated JS | Source | Yes, via governance | Must regenerate derived config |
| `assets/router-config.prod.js` | Runtime config wrapper | Browser asset | Generated derivative | No hand edits | Regenerate from JSON |
| `assets/router-config.next.js` | Aligned config wrapper | Browser asset | Generated derivative | No hand edits | Regenerate from JSON |
| `assets/router-config.v1.0.0.js` | Versioned config wrapper | Browser asset | Generated derivative | No hand edits | Regenerate from JSON |
| `assets/router-core.prod.js` | Router core, layout decision, tracking payloads, diagnostics | Browser asset | Source/runtime core | Yes, carefully | Keep fast path small and version locked |
| `assets/router-core.v1.0.0.js` | Versioned core copy | Browser asset | Generated/synced derivative | No hand edits | Sync from production core |
| `tracker/powerbi_router_tracker_apps_script_v1.0.0.js` | Apps Script collector, normalization, Sheets aggregation, public JSONP | Apps Script Web App source | Tracker source | Yes, carefully | Deploy Apps Script after changes |
| `status-dashboard/index.html` | Aðeins samantektargögn operational dashboard | Live route `/Landspitali/status-dashboard/` | Status UI | Yes, surgically | Avoid duplicate panels and style drift |
| `tools/generate-router-assets.ps1` | Generates config wrappers and syncs versioned core | Release tooling | Tooling | Yes, carefully | Keep source-to-derivative faithful |
| `docs/README.md` | Documentation index | Docs | Docs | Yes | Keep path map accurate |
| `docs/product-guide.md` | Product overview and public dashboards | Docs | Docs | Yes | Keep public names locked |
| `docs/leidbeiningar.md` | User/operator instructions | Docs | Docs | Yes | Keep query-mode behavior accurate |
| `docs/service-guide.md` | Service ownership and routines | Docs | Docs | Yes | Keep deployment responsibilities clear |
| `docs/technical-guide.md` | Architecture and data-flow guide | Docs | Docs | Yes | Keep aligned with code |
| `docs/production-guide.md` | Production deployment guide | Docs | Docs | Yes | Keep release checklist accurate |
| `docs/logic-and-decisions.md` | Design decisions | Docs | Docs | Yes | Keep first-production framing |
| `docs/score-and-confidence-guide.md` | Score/confidence interpretation | Docs | Docs | Yes | Do not imply personal accuracy |
| `docs/data-dictionary.md` | Sheet/header/data definitions | Docs | Docs | Yes | Keep schema fields aligned |
| `docs/routing-guide.md` | Routing policy and breakpoints | Docs | Docs | Yes | Do not drift from config |
| `docs/tracking-and-privacy.md` | Privacy and counting model | Docs | Docs | Yes | Preserve privacy guardrails |
| `docs/status-dashboard-guide.md` | Status UI reading guide | Docs | Docs | Yes | Keep section map aligned |
| `docs/debug-handbook.md` | Debug protocols and incident table | Docs | Docs | Yes | Do not count debug rows |
| `docs/testing-and-qa.md` | Static, router, tracker and UI tests | Docs | Docs | Yes | Keep matrix current |
| `docs/troubleshooting.md` | Symptom table | Docs | Docs | Yes | Keep operationally precise |
| `docs/release-and-deployment.md` | Release and deployment procedure | Docs | Docs | Yes | Do not imply another release line |
| `docs/new-dashboard-router-guide.md` | Adding a dashboard router | Docs | Docs | Yes | Respect locked template policy |
| `docs/known-issues-and-limits.md` | Limits and resolved discrepancies | Docs | Docs | Yes | Keep first-production wording |
| `docs/glossary.md` | Terms | Docs | Docs | Yes | Preserve Icelandic terminology |
| `docs/external-references.md` | Official reference links | Docs | Docs | Yes | Use official sources |
| `docs/first-production-hardening-review.md` | This review | Docs | Docs | Yes | Keep tied to `1.0.0` facts |

## 3. Architecture Review

The architecture is intentionally static-first. island.is and direct links enter GitHub Pages under `/Landspitali/`; the root gateway renders public dashboard choices; per-dashboard pages load central config and router core; the core validates dashboard metadata, chooses mobile/desktop by forced layout, bot policy, viewport, orientation and route policy, queues telemetry, and navigates to Power BI.

The central config process is confirmed: `assets/router-config.json` is the source, `tools/generate-router-assets.ps1` writes `router-config.prod.js`, `router-config.next.js`, and `router-config.v1.0.0.js`, and syncs `router-core.v1.0.0.js` from `router-core.prod.js`.

Apps Script receives POST and GET fallback events, writes raw rows internally, aggregates to Sheets, and publishes a chunked aggregate JSON payload. `Mælaborðsmælingar` loads aðeins samantektargögn JSONP from `api=dashboard` with a 10-second timeout and section-level safe rendering.

Official references used: [Microsoft Power BI/Fabric browser support](https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-browsers), [Power BI publish-to-web](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web), [MDN sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon), [MDN Request.keepalive](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive), [MDN feature detection](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection), [Google Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas), [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web), [ContentService](https://developers.google.com/apps-script/guides/content), [LockService](https://developers.google.com/apps-script/reference/lock/lock-service), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), and [Core Web Vitals](https://web.dev/articles/vitals).

## 4. Routing-Speed Review

Normal router flow is fast: config/core are static assets, the route decision is local, fallback link exists in the HTML, tracking is queued without awaiting the tracker, diagnostic enrichment only runs for `diagnostics`, debug or no-redirect, and navigation is scheduled in the same critical path.

`routing.redirectDelayMs` was an artificial 80 ms delay. It is now `0`, so normal navigation starts as soon as the target URL is known. `tracking.redirectTimeoutMs` remains present in config but is not used by the current core. It should be treated as compatibility metadata or clarified in a governed config cleanup; it does not block routing.

`sendBeacon` is treated as queued, not delivered. `fetch keepalive` is used as a queueing fallback, not a success guarantee. `imageGet` is bounded by `maxImageGetUrlLength` and pruned when needed.

## 5. Tracking Reliability Review

Tracked paths are present for router redirect, root gateway view, root dashboard click, fallback click, router error, debug/manual/no-redirect, health/list diagnostics when enabled, diagnostic enrichment, POST, and GET image fallback.

The transport order is privacy-safe and navigation-safe: `sendBeacon`, `fetchKeepalive`, then `imageGet`. Router failure or tracker outage cannot trap users because no Apps Script response is awaited. Fallback-click tracking is now one-shot per page load to avoid double counting repeated clicks on the same fallback link.

Count terminology should stay strict: queued/attempted/unknown are safe words; delivered/successful should be reserved for server-side raw rows or aggregate evidence.

## 6. Device, OS, Browser, Viewport, and Setup Inference Review

The package uses privacy-safe signals: viewport, visual viewport, screen dimensions, DPR, orientation, pointer/hover/touch, media preferences, color/dynamic range, reduced motion/data/transparency, monochrome, update frequency, overflow, scripting, display mode, connection hints, bounded hardware hints, UA with caution, low-entropy UA-CH, and diagnostic-only high-entropy UA-CH.

Routing remains based on robust layout signals and forced layout, not fragile hardware guesses. `routeByDeviceInference` stays `false`, which is the right first-production posture.

The taxonomy is broad enough for production operations: phone, tablet, iPad-like, Android tablet-like, narrow desktop, touch hybrid, ChromeOS-like, kiosk/public display possible, TV, set-top, console, VR/headset, e-reader, car browser, WebView, in-app browser, bot, link preview, and unknown. Exact hardware model claims are avoided unless explicit evidence exists.

## 7. Gateway/Source Split Review

Root gateway views and root dashboard clicks are separate funnel signals and are not production dashboard visits. The root now offers auto, desktop, and mobile launch choices for each dashboard, preserving `utm_source=root_index`, `utm_medium=gateway_card`, launch-specific `utm_term`, and forced layout query parameters for explicit desktop/mobile launches.

Source categories cover island.is, root index, direct, QR, Teams, email/Outlook, external referrers, bots/link previews, and unknown. Referrer loss is expected under browser policy and must be shown as source uncertainty, not as a data failure.

## 8. Apps Script and Google Sheets Review

`doPost` and GET fallback normalize payloads, dedupe by event ID, apply registry metadata, classify Power BI viewer risk, and append to `Events_Raw`. `isRealVisit_` correctly requires `count_as_visit`, non-duplicate, non-bot, non-debug/manual, and `router_redirect` or `router_noscript`.

Implemented hardening:

- `clean_()` now neutralizes string values beginning with `=`, `+`, `-`, or `@` before writing to Sheets.
- `EVENT_HEADERS` now includes canonical `schema_version`.
- `copyEventFields_()` maps router `schema_version`, root `event_schema_version`, camelCase alias, and `schemaVersion`.
- Missing schema version defaults to `EVENT_SCHEMA_VERSION`.

The public endpoint remains aðeins samantektargögn. JSONP callback sanitization is strict, and JSON output replaces `<` with `\u003c` in JSONP mode.

Operational note: `setupWorkbook_()` still runs on collector entry paths. That preserves self-healing headers but has quota cost. A setup-health cache is a P2 improvement because changing it now could weaken self-healing semantics.

## 9. Status Dashboard UI/UX Review

The status UI has a coherent control-room structure: hero/header, chips, freshness/cache, start panel, signal panorama, public dashboard master, layout/source, insights, technical environment, delivery signals, route list, and quality warnings.

The page uses existing CSS variables and grammar. It has loading/error handling, JSONP timeout messaging, section-level `safeRender`, aðeins samantektargögn labels, and Icelandic operational wording. The live smoke test confirmed the public labels:

- `Mælaborðsmælingar` as the public dashboard name
- `UI: Vaktborð · Talningarhlið · Leiðingarskipting · Aðeins samantektargögn · Vöktunarkjarni: Rekstrarpúls · Config v1 · Atburðasafnari v1 · Gagnasnið 1`
- Dev versions remain locked in source metadata: status UI `v1.0.0`, UI component `v1.0.0`, core `v1.0.0`, config `config-v1.0.0`, tracker `atburdasafnari-v1.0.0`, schema `1`

Implemented UI hardening: the header no longer uses a `100vw` full-bleed width that caused horizontal overflow on desktop scrollbar layouts. Browser checks confirmed no horizontal overflow at desktop width and at a phone-width viewport.

## 10. Status Dashboard De-Duplication and Design-Fit Review

No new repeated panel was added. The existing render tree still contains older helper variants that are not all used by the final `render()` path; visible sections are not duplicated. P2 cleanup can remove dead helper variants only after screenshot comparison.

The new overflow media signals were added to the existing delivery/settings chip flow, not as a separate panel. Each repeated metric keeps a different role: executive summary, diagnostic detail, audit trail, or action playbook.

## 11. Operational Signals: Rekstur og Merki úr Gögnunum

Safe public aggregates can show total counted visits, raw-event totals, diagnostic-event totals, active dashboards, dashboard visits, today/7-day/30-day visits, mobile/desktop split, phone/tablet/desktop split, large/narrow devices, tablet portrait/landscape, narrow desktop, desktop touch hybrid, iPadOS desktop-mode signals, Android tablet signals, Smart TV/console/WebView/in-app risks, forced layout usage, debug/manual modes, fallback clicks, safe fallback use, island.is share, root views, root clicks, root click-to-router and click-to-counted-open funnel, direct/QR/Teams/email/external/no-referrer traffic, link previews, bot rows, transport distribution, payload size buckets, config/core mismatch, script errors, route reasons, Power BI support risk, display/accessibility media settings, network hints, performance timing support, freshness, cache age, warning counts, confidence band, and weak/unknown share.

Internal-only data should remain raw user agents, exact event IDs, raw diagnostic JSON blobs, raw query keys if sensitive, spreadsheet IDs, Apps Script logs, raw error contexts, and any accidental personal values if they appear.

Safe public data is aggregate counts, ratios, dashboard status, aggregate device/browser/source/route splits, warning summaries, freshness, public labels, and public registry metadata.

## 12. Rekstrarstaða, Score, and Confidence Review

The score is a mixed operational pulse, not a personal accuracy score and not proof that Power BI itself worked for every user. It combines confirmed warnings, fallback/error signals, freshness, and weak/unknown shares.

The score can recover automatically when fresh aggregate data arrives and transient warnings age out through aggregation. Confirmed structural warnings should persist until fixed. Diagnostic-only signals, low-confidence inference, unknown source, and WebView/TV risk should be visible but not overstate production failure.

Low traffic should lower confidence in ratios, not create false alarms. Stale data should affect freshness. Actual router errors and confirmed fallback patterns should affect main operational state.

## 13. Privacy and Security Review

The privacy model remains strong: no cookies, no persistent visitor IDs, no localStorage tracking IDs, no raw IP storage, no names, no emails, no geolocation, no canvas/WebGL/audio/font fingerprinting, and no individual profiling.

Open redirect risk is controlled by Power BI publish URL validation and HTTPS checks. Fallback URLs are known Power BI URLs. JSONP callback names are sanitized. Status dashboard rendering uses escaping for dynamic content and section-level failure handling.

Power BI publish-to-web remains a governance risk outside the router: Microsoft documents that publish-to-web is public. Only data approved for public viewing should use these URLs.

## 14. Documentation Review

Docs now align with first-production framing, generated-config process, status path `status-dashboard/`, Apps Script registry/config version sync, versioned config/core assets, the locked Bráðamóttakan master reference, source/counting semantics, and official external references.

Stale wording implying post-release lineage was neutralized. The retained legacy iOS Safari config key name is left intact for compatibility, but its value is first-production framed.

## 15. Generated Asset and Config Consistency Review

Confirmed:

- `router-config.prod.js`, `router-config.next.js`, and `router-config.v1.0.0.js` match `router-config.json`.
- All generated config files show `redirectDelayMs: 0`.
- `router-core.prod.js` and `router-core.v1.0.0.js` have identical SHA-256 hashes.
- `assets/router-config.json` references existing versioned asset files.
- `tools/generate-router-assets.ps1` is present and was used.

## 16. Risk Register

| Risk | Severity | Current state | Mitigation |
|---|---:|---|---|
| Apps Script not deployed after tracker source edits | P0 operational | Local source changed | Deploy Apps Script Web App and run `api=health` |
| Power BI publish-to-web public exposure | P0 governance | External platform behavior | Confirm reports contain public-safe data only |
| Broken redirect/fallback | P0 | Static/browser checks pass | Manual Power BI open smoke tests |
| Tracker quota or lock contention | P1/P2 | Self-healing but setup-heavy | Monitor quotas, consider setup cache |
| Source/referrer loss | P2 | Expected browser behavior | Show uncertainty, use UTM where possible |
| TV/WebView Power BI loading risk | P2 | Classified as compatibility risk | Test supported browser before declaring router issue |
| Status dashboard data endpoint slow | P2 | JSONP timeout/error state exists | Monitor endpoint, cache and aggregation freshness |

## 17. P0/P1/P2/P3 Prioritized Recommendations

P0: deploy the Apps Script source that matches this repository before publication; verify publish-to-web data is public-safe; smoke test both Power BI URLs for each dashboard.

P1 completed: reduce redirect delay to zero; one-shot fallback-click tracking; Sheets formula neutralization; canonical schema-version persistence; generated asset regeneration; status dashboard overflow fix; first-production wording/reference alignment.

P2: clarify or remove unused `tracking.redirectTimeoutMs` in a governed config cleanup; add setup-cache guard for `setupWorkbook_()` after measuring quota behavior; add automated browser smoke scripts; prune unused status render helper variants with screenshot comparison; enrich source classification examples in docs.

P3: optional synthetic monitoring, BigQuery/export path, long-term trends, and scheduled visual snapshots.

## 18. Exact Implementation Plan

Completed:

1. Read package files and map architecture.
2. Verify official current guidance from Microsoft, MDN, Google, W3C and web.dev.
3. Reduce `routing.redirectDelayMs` to `0`.
4. Regenerate generated config and sync versioned core.
5. Make fallback-click tracking one-shot.
6. Neutralize formula-like strings before Sheets writes.
7. Persist canonical `schema_version` from router/root aliases.
8. Surface overflow media signals in the existing status delivery panel.
9. Fix status dashboard horizontal overflow.
10. Update external references and first-production wording.
11. Run static, syntax, drift and live browser checks.

Remaining operational plan:

1. Deploy Apps Script Web App from `tracker/powerbi_router_tracker_apps_script_v1.0.0.js`.
2. Run `setupProductionWorkbook`, `validateWorkbookSetup`, `aggregateRecent`, and publish dashboard data if allowed by deployment policy.
3. Deploy static files to GitHub Pages.
4. Run manual device/source matrix.

## 19. Test Plan

Static checks: JSON parse, generated config equality, core hash equality, JS syntax, inline script syntax, locked label grep, stale wording grep, schema/header coverage, Power BI URL validation, public path validation.

Router matrix: root load, two dashboard cards, auto/desktop/mobile launch links, `?force=mobile`, `?force=desktop`, `?view=mobile`, `?view=desktop`, `?debug=1`, `?noredirect=1`, `?manual=1`, `?health=1`, `?list=1`, unknown dashboard, missing config, invalid config, tracker down, tracker slow, sendBeacon unavailable, fetch unavailable, image fallback, noscript, bot/link-preview UA, no referrer, island.is UTM.

Devices: iPhone Safari/CriOS/Edge/FxiOS, Android Chrome/Samsung Internet/Firefox/Edge/WebView, iPad portrait/landscape/desktop-mode Safari/CriOS, Android tablet Chrome/Samsung Internet, ChromeOS tablet-like, Windows Edge/Chrome/Firefox/touch laptop/Surface-like, Mac Safari/Chrome/Firefox, Linux Chrome/Firefox, narrow desktop, zoomed desktop, 1024px desktop, 1280px+ desktop, ultra-wide.

Unusual devices: Samsung Tizen TV, LG webOS TV, Android TV, Google TV, Fire TV, Apple TV-like, Roku, HbbTV, PlayStation, Xbox, Nintendo, kiosk/public display, VR/headset, e-reader, car/infotainment UA simulations.

Status dashboard matrix: endpoint OK, slow, timeout, invalid JSONP, `ok:false`, missing optional arrays, missing KPIs, empty arrays, old rows, large warning arrays, long labels, unknown dashboard, 360/390/768/1024/1280/1720 widths, high zoom, reduced motion, forced colors, keyboard navigation, screen-reader landmarks smoke test, loading/error/stale/no-data states.

## 20. Acceptance Criteria

Met locally:

- Normal router redirect does not wait for tracker response.
- Tracking failure cannot block redirect.
- Forced mobile/desktop links exist on root gateway.
- Debug/no-redirect/list/health paths exist.
- Generated config assets are aligned.
- Core versioned asset is aligned.
- Public status path is `status-dashboard/`.
- Status dashboard handles aggregate JSONP and section errors.
- Locked labels remain unchanged.
- Privacy model remains unchanged.
- Docs match actual behavior.

Must still be confirmed in deployment:

- GitHub Pages serves all public paths.
- Apps Script accepts POST and GET fallback from the deployed endpoint.
- Apps Script public dashboard output is aðeins samantektargögn after deployment.
- Google Sheets workbook headers update safely.
- Real Power BI mobile/desktop URLs open on supported browsers.
- Noscript fallback is manually verified.

## 21. Files That Should Change

Changed as part of this hardening:

- `assets/router-config.json`
- `assets/router-config.prod.js`
- `assets/router-config.next.js`
- `assets/router-config.v1.0.0.js`
- `assets/router-core.prod.js`
- `assets/router-core.v1.0.0.js`
- `tracker/powerbi_router_tracker_apps_script_v1.0.0.js`
- `status-dashboard/index.html`
- `docs/data-dictionary.md`
- `docs/debug-handbook.md`
- `docs/external-references.md`
- `docs/logic-and-decisions.md`
- `docs/release-and-deployment.md`
- `docs/technical-guide.md`
- `docs/troubleshooting.md`
- `docs/first-production-hardening-review.md`

Additional files from the broader first-production work remain relevant: `README.md`, `tools/generate-router-assets.ps1`, `templates/bradamottaka-locked-master-reference.html`, and the aligned docs set.

## 22. Files That Should Not Change

Do not casually change:

- Power BI publish-to-web URLs in `assets/router-config.json` and router pages.
- Dashboard IDs, keys, aliases, and public paths.
- `templates/bradamottaka-locked-master-reference.html` except by explicit template governance.
- Generated config JS by hand.
- `assets/router-core.v1.0.0.js` by hand.
- Locked labels and `1.0.0` identity values.

## 23. Changed Files, Validation Run, and Diff Summary

Validation run:

- `tools/generate-router-assets.ps1`: wrote `router-config.prod.js`, `router-config.v1.0.0.js`, `router-config.next.js`, and synced `router-core.v1.0.0.js`.
- Node syntax checks passed for router core, generated config JS, and Apps Script tracker.
- Inline script checks passed for `index.html`, both dashboard routers, status dashboard, and locked template.
- Generated config files matched `assets/router-config.json`.
- Core production/versioned hashes matched.
- Header coverage confirmed for schema, root launch choice, settings/display fields, tracking status, and payload buckets.
- Browser smoke test: root rendered six launch links with `auto,desktop,mobile` choices; desktop/mobile forced links contained `force=desktop` and `force=mobile`.
- Browser smoke test: status dashboard loaded at `/Landspitali/status-dashboard/`, showed 9 panels, correct locked labels, no console errors, and no horizontal overflow at desktop or phone viewport.

Diff summary:

- Redirect delay reduced from 80 ms to 0 ms.
- First-production value used for the retained legacy iOS Safari config marker.
- Fallback-click tracking guarded against repeat sends.
- Spreadsheet string cleaning neutralizes formula-like cell starts.
- Canonical `schema_version` raw field added and aliases normalized.
- Status dashboard existing settings chip logic now includes overflow media signals.
- Header CSS changed from `100vw` to container width to remove horizontal overflow.
- Official reference docs expanded and stale wording removed.

## 24. Final Recommendation

Publish-ready after deployment smoke tests.

No local P0 code blocker remains. The required remaining work is operational: deploy the updated Apps Script, publish the static files, run the device/source/manual test matrix, verify Power BI opens on supported browsers, and confirm the aggregate dashboard payload is fresh.
