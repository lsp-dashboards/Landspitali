/**
 * Landspítali Power BI Router Tracker, production v1.
 *
 * Deployment model:
 * - Deploy as Google Apps Script Web App.
 * - Execute as the script owner or operational service account.
 * - Allow access according to the approved internal/public collector policy.
 * - Router events are fire-and-forget; routing must never wait for this script.
 *
 * Privacy model:
 * - No cookies, no localStorage identifiers, no raw IP addresses, no names, no emails.
 * - Raw event rows are internal only.
 * - Public/status dashboard endpoint returns aggregate-only data.
 */

var SCRIPT_VERSION = "2026-06-09-tracker-v1.0.1";
var EVENT_SCHEMA_VERSION = "5";
var DEFAULT_TIMEZONE = "Atlantic/Reykjavik";

// Optional. Leave empty when this Apps Script project is bound to the tracker Google Sheet.
// If you deploy this as a standalone Apps Script project, paste the tracker Spreadsheet ID here.
var TRACKER_SPREADSHEET_ID = "";
var RETENTION_DAYS = 180;
var AGGREGATION_DAYS = 400;

var SHEET_EVENTS = "Events_Raw";
var SHEET_ERRORS = "Errors";
var SHEET_DAILY = "Aggregates_Daily";
var SHEET_HOURLY = "Aggregates_Hourly";
var SHEET_DASHBOARD = "Aggregates_Dashboard";
var SHEET_DEVICE = "Aggregates_Device";
var SHEET_SOURCE = "Aggregates_Source";
var SHEET_ROUTE = "Aggregates_Route";
var SHEET_QUALITY = "Aggregates_Quality";
var SHEET_DASHBOARD_REGISTRY = "Dashboard_Registry";
var SHEET_PUBLIC_REGISTRY = "Public_Page_Registry";
var SHEET_DATA_DICTIONARY = "Data_Dictionary";
var SHEET_CONTROL = "Control";
var SHEET_ARCHIVE_LOG = "Archive_Log";
var SHEET_DASHBOARD_DATA = "Dashboard_Data";

var REGISTRY_SNAPSHOT = {
  "configVersion": "2026-06-07-prod-1",
  "schemaVersion": "5",
  "publicEntry": {
    "name": "Landspítali mælaborð",
    "site": "island.is",
    "pageUrl": "https://island.is/s/landspitali/maelabord",
    "pagePath": "/s/landspitali/maelabord",
    "defaultButtonText": "Skoða mælaborð",
    "logoUrl": "https://images.ctfassets.net/8k0h54kbe6bj/6PHUWW83ZRNXU0ydxQsipf/6f460fab1a36daf4c6faf4e604b4741a/Logo.png",
    "lastVerifiedDate": "2026-06-07",
    "allowedImageHosts": [
      "images.ctfassets.net"
    ]
  },
  "dashboards": {
    "bradamottaka": {
      "enabled": true,
      "status": "active",
      "dashboardId": "bradamottakan-fossvogi",
      "dashboardKey": "bradamottaka",
      "displayName": "Bráðamóttakan í Fossvogi",
      "routerDisplayTitle": "Bráðamóttakan í Fossvogi",
      "powerBiReportTitle": "Bráðamóttakan í Fossvogi",
      "pageTitle": "Opna Bráðamóttöku í Fossvogi",
      "commentName": "Bráðamóttakan í Fossvogi",
      "path": "bradamottaka",
      "aliases": [
        "bradamottaka",
        "bradamottakan",
        "bradamottakan-fossvogi",
        "brada",
        "bráða"
      ],
      "publicCard": {
        "title": "Bráðamóttaka í Fossvogi",
        "description": "Yfirlit yfir stöðu og þróun á bráðamóttöku",
        "buttonText": "Skoða mælaborð",
        "iconUrl": "https://images.ctfassets.net/8k0h54kbe6bj/68Ef7p57VqG1aYv99GbzB0/3b98fe5c7b3b11c7d01194a7e9caccd6/bradamottaka-linkimage.png?w=774&fm=webp&q=80",
        "pageUrl": "https://island.is/s/landspitali/maelabord",
        "published": true,
        "stableUtmContent": "bradamottakan_fossvogi",
        "lastVerifiedDate": "2026-06-07"
      },
      "desktopUrl": "https://app.powerbi.com/view?r=eyJrIjoiNDU4MjNhOGYtMGM0NS00NDBkLThiM2MtNTA2MDFjNjNkNTliIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "mobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNGZlODE2N2ItYzkwZS00ZWYzLTg2YzctMjg5NWY5MmU1NTkyIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "fallbackLayout": "mobile",
      "mobileBreakpoint": 768,
      "routePolicy": {
        "phone": "mobile",
        "tabletPortrait": "mobile",
        "tabletLandscape": "desktop",
        "narrowViewport": "mobile",
        "desktop": "desktop",
        "bot": "desktop"
      },
      "utmContent": "bradamottakan_fossvogi",
      "governance": {
        "ownerTeam": "Landspítali",
        "technicalOwner": "Landspítali mælaborð / vefumsjón",
        "contentOwner": "Landspítali",
        "createdDate": "2026-06-07",
        "lastReviewedDate": "2026-06-07",
        "nextReviewDue": "2026-09-07"
      }
    },
    "thjonustukannanir": {
      "enabled": true,
      "status": "active",
      "dashboardId": "thjonustukannanir-rikisstofnana",
      "dashboardKey": "thjonustukannanir",
      "displayName": "Þjónustukannanir ríkisstofnana",
      "routerDisplayTitle": "Þjónustukannanir ríkisstofnana",
      "powerBiReportTitle": "Þjónustukannanir ríkisstofnana",
      "pageTitle": "Opna Þjónustukannanir ríkisstofnana",
      "commentName": "Þjónustukannanir ríkisstofnana",
      "path": "thjonustukannanir",
      "aliases": [
        "thjonustukannanir",
        "thjon",
        "thjonusta",
        "þjónustukannanir",
        "þjón"
      ],
      "publicCard": {
        "title": "Þjónustukannanir",
        "description": "Niðurstöður þjónustukannana ríkisstofnana hjá Landspítala",
        "buttonText": "Skoða mælaborð",
        "iconUrl": "https://images.ctfassets.net/8k0h54kbe6bj/5eK6Vivq6aUDWj2mnOEsvS/7e5d5e7c03b92370ccee175ad01f8330/survey-linkimage.png?w=774&fm=webp&q=80",
        "pageUrl": "https://island.is/s/landspitali/maelabord",
        "published": true,
        "stableUtmContent": "thjonustukannanir",
        "lastVerifiedDate": "2026-06-07"
      },
      "desktopUrl": "https://app.powerbi.com/view?r=eyJrIjoiN2VjNTI5YzAtMGNjMC00MWQ1LTkwY2MtZTAzMzg2NWI4YTdlIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "mobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNmMyZGI1ZjktOTIzMS00MjZlLWFmMjEtMzE2ZTRhYjcyYmQ3IiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "fallbackLayout": "mobile",
      "mobileBreakpoint": 768,
      "routePolicy": {
        "phone": "mobile",
        "tabletPortrait": "mobile",
        "tabletLandscape": "desktop",
        "narrowViewport": "mobile",
        "desktop": "desktop",
        "bot": "desktop"
      },
      "utmContent": "thjonustukannanir",
      "governance": {
        "ownerTeam": "Landspítali",
        "technicalOwner": "Landspítali mælaborð / vefumsjón",
        "contentOwner": "Landspítali",
        "createdDate": "2026-06-07",
        "lastReviewedDate": "2026-06-07",
        "nextReviewDue": "2026-09-07"
      }
    }
  }
};

var EVENT_HEADERS = [
  "server_time",
  "client_time",
  "event_id",
  "request_id",
  "event_type",
  "count_as_visit",
  "duplicate_event",
  "dashboard_key",
  "dashboard_id",
  "dashboard_name",
  "public_card_title",
  "public_entry_page",
  "selected_layout",
  "auto_selected_layout",
  "forced_layout",
  "forced_layout_applied",
  "route_reason",
  "route_reason_detail",
  "device_class",
  "viewport_width",
  "viewport_height",
  "browser_family",
  "browser_major_version",
  "os_family",
  "referrer_domain",
  "entry_source_category",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "page_path",
  "config_version",
  "router_core_version",
  "config_source",
  "safe_fallback_used",
  "tracking_method",
  "error_message",
  "warning_code",
  "warning_detail",
  "bot_reason",
  "user_agent",
  "screen_width",
  "screen_height",
  "device_pixel_ratio",
  "touch",
  "max_touch_points",
  "language",
  "timezone",
  "os_version_hint",
  "connection_type",
  "received_method",
  "raw_query_keys"
];

var ERROR_HEADERS = ["error_time", "script_version", "source", "message", "context"];
var DAILY_HEADERS = ["date", "dashboard_key", "entry_source_category", "selected_layout", "device_class", "visits", "events", "bots", "debug_events", "fallback_clicks", "errors", "safe_fallbacks"];
var HOURLY_HEADERS = ["hour_utc", "dashboard_key", "visits", "events", "errors"];
var DASHBOARD_HEADERS = ["dashboard_key", "dashboard_id", "dashboard_name", "public_card_title", "status", "visits_today", "visits_7d", "visits_30d", "total_visits", "total_events", "mobile_visits", "desktop_visits", "island_is_visits", "fallback_clicks", "error_events", "debug_events", "bot_events", "safe_fallback_events", "last_event_time", "warning_count"];
var DEVICE_HEADERS = ["dashboard_key", "device_class", "selected_layout", "browser_family", "os_family", "visits", "events"];
var SOURCE_HEADERS = ["dashboard_key", "entry_source_category", "utm_source", "utm_medium", "utm_campaign", "utm_content", "visits", "events"];
var ROUTE_HEADERS = ["dashboard_key", "route_reason", "selected_layout", "forced_layout", "visits", "events"];
var QUALITY_HEADERS = ["warning_code", "dashboard_key", "severity", "warning_text", "count", "last_seen"];
var DASHBOARD_REGISTRY_HEADERS = ["dashboard_key", "dashboard_id", "dashboard_name", "public_card_title", "powerbi_report_title", "path", "status", "desktop_url", "mobile_url", "fallback_layout", "owner_team", "technical_owner", "content_owner", "last_reviewed_date", "next_review_due", "utm_content"];
var PUBLIC_REGISTRY_HEADERS = ["dashboard_key", "public_page_url", "public_card_title", "public_description", "button_text", "icon_url", "published", "last_verified_date"];
var CONTROL_HEADERS = ["key", "value"];
var ARCHIVE_LOG_HEADERS = ["archive_time", "older_than", "rows_archived", "archive_sheet", "status", "message"];
var DASHBOARD_DATA_HEADERS = ["generated_at", "json"];

var FIELD_DICTIONARY = {
  server_time: "Server-side receive time in ISO format.",
  client_time: "Client-side event time supplied by the router.",
  event_id: "Per-event identifier. Used for dedupe.",
  request_id: "Per-router-page-load identifier. Not persistent.",
  event_type: "router_redirect, fallback_click, router_debug_view, router_error, etc.",
  count_as_visit: "TRUE only for events that should count as real dashboard opens.",
  duplicate_event: "TRUE if event_id was recently seen by CacheService.",
  dashboard_key: "Stable registry key.",
  dashboard_id: "Stable dashboard identifier.",
  dashboard_name: "Router display name.",
  public_card_title: "Visible title on island.is public card.",
  public_entry_page: "Official public page path, without query string.",
  selected_layout: "mobile or desktop selected by router.",
  auto_selected_layout: "Layout selected before forced override.",
  forced_layout: "auto, mobile, or desktop.",
  forced_layout_applied: "TRUE when query forced the layout.",
  route_reason: "Structured routing reason.",
  route_reason_detail: "Short routing explanation.",
  device_class: "phone, tablet, desktop, narrow-screen, small-touch-screen.",
  viewport_width: "Browser viewport width.",
  viewport_height: "Browser viewport height.",
  browser_family: "Reduced browser family.",
  browser_major_version: "Optional diagnostic browser major version.",
  os_family: "Reduced operating system family.",
  referrer_domain: "Referrer hostname only. No referrer path or query string.",
  entry_source_category: "island_is_public, qr_code, direct, internal_teams, link_preview_bot, etc.",
  utm_source: "Sanitized UTM source.",
  utm_medium: "Sanitized UTM medium.",
  utm_campaign: "Sanitized UTM campaign.",
  utm_content: "Sanitized UTM content, usually public card stable ID.",
  page_path: "Router path only. No full query string.",
  config_version: "Router config version.",
  router_core_version: "Router core asset version.",
  config_source: "central-config-js, embedded-bootstrap, or central-plus-embedded-dashboard.",
  safe_fallback_used: "TRUE when router had to fall back to safe layout/URL.",
  tracking_method: "sendBeacon, fetchKeepalive, imageGet, or fallback method.",
  error_message: "Error events only. Truncated.",
  warning_code: "Quality warning code when supplied.",
  warning_detail: "Short warning detail.",
  bot_reason: "Only when bot/preview detection is relevant.",
  user_agent: "Optional diagnostic field. Blank by default.",
  raw_query_keys: "Names of query keys received by GET fallback. Values are not stored here."
};

function doPost(e) {
  try {
    setupWorkbook_();
    var payload = parsePostPayload_(e);
    var normalized = normalizeEvent_(payload, "POST");
    appendEvent_(normalized);
    return outputJson_({ ok: true, script_version: SCRIPT_VERSION, event_id: normalized.event_id });
  } catch (error) {
    logError_("doPost", error, "collector");
    return outputJson_({ ok: false, script_version: SCRIPT_VERSION });
  }
}

function doGet(e) {
  try {
    setupWorkbook_();
    var params = (e && e.parameter) || {};
    var api = clean_(params.api || params.mode || "", 40).toLowerCase();
    if (api === "dashboard") {
      return outputData_(getDashboardData_(), params);
    }
    if (api === "health" || api === "status") {
      return outputData_(getHealth_(), params);
    }
    if (api === "registry") {
      return outputData_(getPublicRegistry_(), params);
    }
    if (params.event_type || params.eventType || params.fallback || params.dashboard_key || params.dashboardId) {
      var normalized = normalizeEvent_(params, "GET");
      if (!normalized.event_type) normalized.event_type = "router_get_fallback";
      if (!normalized.tracking_method) normalized.tracking_method = "imageGet";
      appendEvent_(normalized);
      return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
    }
    return outputData_(getHealth_(), params);
  } catch (error) {
    logError_("doGet", error, "api");
    return outputJson_({ ok: false, script_version: SCRIPT_VERSION });
  }
}

function setupProductionWorkbook() {
  setupWorkbook_();
  seedRegistrySheets_();
  writeDataDictionary_();
  setControl_("setup_completed_at", nowIso_());
  setControl_("script_version", SCRIPT_VERSION);
  return "Production workbook setup complete";
}

function installProductionTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i += 1) {
    if (triggers[i].getHandlerFunction() === "aggregateRecent") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("aggregateRecent").timeBased().everyMinutes(15).create();
  setControl_("aggregation_trigger", "every_15_minutes");
  setControl_("aggregation_trigger_installed_at", nowIso_());
  return "Installed aggregateRecent trigger every 15 minutes";
}

function testWrite() {
  setupWorkbook_();
  var payload = {
    schema_version: EVENT_SCHEMA_VERSION,
    event_id: "test-" + new Date().getTime(),
    request_id: "test-request",
    event_type: "router_test_write",
    count_as_visit: false,
    client_time: nowIso_(),
    dashboard_key: "bradamottaka",
    dashboard_id: "bradamottakan-fossvogi",
    dashboard_name: "Bráðamóttakan í Fossvogi",
    public_card_title: "Bráðamóttaka í Fossvogi",
    public_entry_page: "/s/landspitali/maelabord",
    selected_layout: "mobile",
    auto_selected_layout: "mobile",
    forced_layout: "auto",
    forced_layout_applied: false,
    route_reason: "test_write",
    route_reason_detail: "manual testWrite from Apps Script",
    device_class: "test",
    browser_family: "test",
    os_family: "test",
    entry_source_category: "test",
    config_version: REGISTRY_SNAPSHOT.configVersion,
    router_core_version: "test",
    config_source: "test",
    tracking_method: "testWrite"
  };
  var normalized = normalizeEvent_(payload, "TEST");
  appendEvent_(normalized);
  return normalized.event_id;
}

function testAggregation() {
  aggregateRecent();
  return "Aggregation test complete at " + nowIso_();
}

function aggregateRecent() {
  setupWorkbook_();
  seedRegistrySheets_();
  var ss = getSpreadsheet_();
  var eventSheet = ss.getSheetByName(SHEET_EVENTS);
  var values = eventSheet.getDataRange().getValues();
  var header = values.length ? values[0] : EVENT_HEADERS;
  var rows = [];
  var i;
  var obj;
  var cutoff = new Date(new Date().getTime() - AGGREGATION_DAYS * 24 * 60 * 60 * 1000);

  for (i = 1; i < values.length; i += 1) {
    obj = rowToObject_(header, values[i]);
    if (obj.server_time && new Date(obj.server_time) >= cutoff) {
      rows.push(obj);
    }
  }

  var registry = registryMap_();
  var daily = {};
  var hourly = {};
  var dashboardAgg = {};
  var deviceAgg = {};
  var sourceAgg = {};
  var routeAgg = {};
  var qualityAgg = {};
  var now = new Date();
  var today = isoDate_(now);
  var day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  var day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  Object.keys(registry).forEach(function (key) {
    dashboardAgg[key] = baseDashboardAgg_(registry[key]);
  });

  rows.forEach(function (row) {
    var eventTime = row.server_time ? new Date(row.server_time) : now;
    var date = isoDate_(eventTime);
    var hour = isoHour_(eventTime);
    var key = clean_(row.dashboard_key || "unknown", 80) || "unknown";
    var eventType = clean_(row.event_type || "", 80);
    var isVisit = asBool_(row.count_as_visit) && !asBool_(row.duplicate_event);
    var isBot = row.entry_source_category === "link_preview_bot" || row.entry_source_category === "known_bot";
    var isDebug = eventType.indexOf("debug") >= 0 || eventType.indexOf("test") >= 0 || eventType.indexOf("health") >= 0 || eventType.indexOf("manual") >= 0;
    var isFallbackClick = eventType === "fallback_click";
    var isError = eventType === "router_error" || !!row.error_message;
    var safeFallback = asBool_(row.safe_fallback_used);
    var dailyKey = [date, key, row.entry_source_category || "unknown", row.selected_layout || "unknown", row.device_class || "unknown"].join("|");
    var hourlyKey = [hour, key].join("|");
    var deviceKey = [key, row.device_class || "unknown", row.selected_layout || "unknown", row.browser_family || "unknown", row.os_family || "unknown"].join("|");
    var sourceKey = [key, row.entry_source_category || "unknown", row.utm_source || "", row.utm_medium || "", row.utm_campaign || "", row.utm_content || ""].join("|");
    var routeKey = [key, row.route_reason || "unknown", row.selected_layout || "unknown", row.forced_layout || "auto"].join("|");

    daily[dailyKey] = daily[dailyKey] || { date: date, dashboard_key: key, entry_source_category: row.entry_source_category || "unknown", selected_layout: row.selected_layout || "unknown", device_class: row.device_class || "unknown", visits: 0, events: 0, bots: 0, debug_events: 0, fallback_clicks: 0, errors: 0, safe_fallbacks: 0 };
    hourly[hourlyKey] = hourly[hourlyKey] || { hour_utc: hour, dashboard_key: key, visits: 0, events: 0, errors: 0 };
    deviceAgg[deviceKey] = deviceAgg[deviceKey] || { dashboard_key: key, device_class: row.device_class || "unknown", selected_layout: row.selected_layout || "unknown", browser_family: row.browser_family || "unknown", os_family: row.os_family || "unknown", visits: 0, events: 0 };
    sourceAgg[sourceKey] = sourceAgg[sourceKey] || { dashboard_key: key, entry_source_category: row.entry_source_category || "unknown", utm_source: row.utm_source || "", utm_medium: row.utm_medium || "", utm_campaign: row.utm_campaign || "", utm_content: row.utm_content || "", visits: 0, events: 0 };
    routeAgg[routeKey] = routeAgg[routeKey] || { dashboard_key: key, route_reason: row.route_reason || "unknown", selected_layout: row.selected_layout || "unknown", forced_layout: row.forced_layout || "auto", visits: 0, events: 0 };

    if (!dashboardAgg[key]) dashboardAgg[key] = baseDashboardAgg_(registry[key] || { dashboard_key: key, dashboard_id: row.dashboard_id || "", dashboard_name: row.dashboard_name || key, public_card_title: row.public_card_title || key, status: "unknown" });

    daily[dailyKey].events += 1;
    hourly[hourlyKey].events += 1;
    deviceAgg[deviceKey].events += 1;
    sourceAgg[sourceKey].events += 1;
    routeAgg[routeKey].events += 1;
    dashboardAgg[key].total_events += 1;

    if (isVisit) {
      daily[dailyKey].visits += 1;
      hourly[hourlyKey].visits += 1;
      deviceAgg[deviceKey].visits += 1;
      sourceAgg[sourceKey].visits += 1;
      routeAgg[routeKey].visits += 1;
      dashboardAgg[key].total_visits += 1;
      if (date === today) dashboardAgg[key].visits_today += 1;
      if (eventTime >= day7) dashboardAgg[key].visits_7d += 1;
      if (eventTime >= day30) dashboardAgg[key].visits_30d += 1;
      if (row.selected_layout === "mobile") dashboardAgg[key].mobile_visits += 1;
      if (row.selected_layout === "desktop") dashboardAgg[key].desktop_visits += 1;
      if (row.entry_source_category === "island_is_public") dashboardAgg[key].island_is_visits += 1;
    }

    if (isBot) daily[dailyKey].bots += 1;
    if (isDebug) daily[dailyKey].debug_events += 1;
    if (isFallbackClick) daily[dailyKey].fallback_clicks += 1;
    if (isError) { daily[dailyKey].errors += 1; hourly[hourlyKey].errors += 1; }
    if (safeFallback) daily[dailyKey].safe_fallbacks += 1;

    if (isFallbackClick) dashboardAgg[key].fallback_clicks += 1;
    if (isError) dashboardAgg[key].error_events += 1;
    if (isDebug) dashboardAgg[key].debug_events += 1;
    if (isBot) dashboardAgg[key].bot_events += 1;
    if (safeFallback) dashboardAgg[key].safe_fallback_events += 1;
    if (!dashboardAgg[key].last_event_time || String(row.server_time) > dashboardAgg[key].last_event_time) dashboardAgg[key].last_event_time = String(row.server_time);
  });

  addQualityWarnings_(dashboardAgg, qualityAgg, now);

  writeObjects_(SHEET_DAILY, DAILY_HEADERS, valuesFromObject_(daily, DAILY_HEADERS));
  writeObjects_(SHEET_HOURLY, HOURLY_HEADERS, valuesFromObject_(hourly, HOURLY_HEADERS));
  writeObjects_(SHEET_DASHBOARD, DASHBOARD_HEADERS, valuesFromObject_(dashboardAgg, DASHBOARD_HEADERS));
  writeObjects_(SHEET_DEVICE, DEVICE_HEADERS, valuesFromObject_(deviceAgg, DEVICE_HEADERS));
  writeObjects_(SHEET_SOURCE, SOURCE_HEADERS, valuesFromObject_(sourceAgg, SOURCE_HEADERS));
  writeObjects_(SHEET_ROUTE, ROUTE_HEADERS, valuesFromObject_(routeAgg, ROUTE_HEADERS));
  writeObjects_(SHEET_QUALITY, QUALITY_HEADERS, valuesFromObject_(qualityAgg, QUALITY_HEADERS));

  setControl_("last_aggregation_time", nowIso_());
  setControl_("last_aggregation_rows", rows.length);
  publishDashboardData_();
  return "Aggregated " + rows.length + " rows at " + nowIso_();
}

function publishDashboardData_() {
  var ss = getSpreadsheet_();
  var data = buildDashboardDataFromSheets_();
  var json = JSON.stringify(data);
  var sheet = ensureSheet_(SHEET_DASHBOARD_DATA, DASHBOARD_DATA_HEADERS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, DASHBOARD_DATA_HEADERS.length).setValues([DASHBOARD_DATA_HEADERS]);
  sheet.getRange(2, 1, 1, 2).setValues([[data.generated_at, json]]);
  setControl_("dashboard_data_generated_at", data.generated_at);
  return data;
}

function archiveOldEvents() {
  setupWorkbook_();
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_EVENTS);
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return "No event rows to archive";

  var cutoff = new Date(new Date().getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  var archiveRows = [];
  var deleteRanges = [];
  var start = null;
  var i;
  for (i = 1; i < values.length; i += 1) {
    var rowTime = values[i][0] ? new Date(values[i][0]) : null;
    if (rowTime && rowTime < cutoff) {
      archiveRows.push(values[i]);
      if (start === null) start = i + 1;
    } else if (start !== null) {
      deleteRanges.push([start, i - start + 1]);
      start = null;
    }
  }
  if (start !== null) deleteRanges.push([start, values.length - start + 1]);
  if (!archiveRows.length) return "No rows older than retention";

  var archiveName = "Archive_" + Utilities.formatDate(cutoff, DEFAULT_TIMEZONE, "yyyy_MM");
  var archiveSheet = ensureSheet_(archiveName, EVENT_HEADERS);
  archiveSheet.getRange(archiveSheet.getLastRow() + 1, 1, archiveRows.length, EVENT_HEADERS.length).setValues(archiveRows);

  for (i = deleteRanges.length - 1; i >= 0; i -= 1) {
    sheet.deleteRows(deleteRanges[i][0], deleteRanges[i][1]);
  }

  appendRows_(ensureSheet_(SHEET_ARCHIVE_LOG, ARCHIVE_LOG_HEADERS), ARCHIVE_LOG_HEADERS, [{ archive_time: nowIso_(), older_than: cutoff.toISOString(), rows_archived: archiveRows.length, archive_sheet: archiveName, status: "ok", message: "archived and deleted" }]);
  return "Archived " + archiveRows.length + " rows to " + archiveName;
}

function validateConfig() {
  seedRegistrySheets_();
  var dashboards = REGISTRY_SNAPSHOT.dashboards || {};
  var keys = Object.keys(dashboards);
  var problems = [];
  keys.forEach(function (key) {
    var d = dashboards[key];
    if (!d.desktopUrl || !d.mobileUrl) problems.push(key + ": missing Power BI URL");
    if (!d.publicCard || !d.publicCard.title || !d.publicCard.iconUrl) problems.push(key + ": missing public card metadata");
    if (!d.governance || !d.governance.nextReviewDue) problems.push(key + ": missing governance review date");
  });
  setControl_("last_config_validation", nowIso_());
  setControl_("last_config_validation_problems", problems.join(" | "));
  return { ok: problems.length === 0, problems: problems };
}

function parsePostPayload_(e) {
  var body = e && e.postData && e.postData.contents ? e.postData.contents : "";
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (error) {
    return { event_type: "router_parse_error", error_message: "invalid_json", raw_query_keys: "postData" };
  }
}

function normalizeEvent_(payload, method) {
  payload = payload || {};
  var queryKeys = [];
  Object.keys(payload).forEach(function (key) { queryKeys.push(clean_(key, 40)); });
  var normalized = {};
  normalized.server_time = nowIso_();
  normalized.client_time = clean_(first_(payload.client_time, payload.eventTimeClient), 40);
  normalized.event_id = clean_(first_(payload.event_id, payload.eventId), 120) || ("srv-" + new Date().getTime() + "-" + Math.random().toString(16).slice(2));
  normalized.request_id = clean_(first_(payload.request_id, payload.requestId), 120);
  normalized.event_type = clean_(first_(payload.event_type, payload.eventType), 80);
  normalized.count_as_visit = asBool_(first_(payload.count_as_visit, payload.countAsVisit));
  normalized.duplicate_event = isDuplicateEvent_(normalized.event_id);
  if (normalized.duplicate_event && normalized.count_as_visit) normalized.count_as_visit = false;
  normalized.dashboard_key = clean_(first_(payload.dashboard_key, payload.dashboardKey), 80);
  normalized.dashboard_id = clean_(first_(payload.dashboard_id, payload.dashboardId), 120);
  normalized.dashboard_name = clean_(first_(payload.dashboard_name, payload.dashboardName), 160);
  normalized.public_card_title = clean_(first_(payload.public_card_title, payload.publicCardTitle), 160);
  normalized.public_entry_page = sanitizePath_(first_(payload.public_entry_page, payload.publicEntryPage));
  normalized.selected_layout = clean_(first_(payload.selected_layout, payload.selectedLayout), 20);
  normalized.auto_selected_layout = clean_(first_(payload.auto_selected_layout, payload.autoSelectedLayout), 20);
  normalized.forced_layout = clean_(first_(payload.forced_layout, payload.forcedLayout), 20);
  normalized.forced_layout_applied = asBool_(first_(payload.forced_layout_applied, payload.forcedLayoutApplied));
  normalized.route_reason = clean_(first_(payload.route_reason, payload.routeReason), 120);
  normalized.route_reason_detail = clean_(first_(payload.route_reason_detail, payload.routeReasonDetail), 300);
  normalized.device_class = clean_(first_(payload.device_class, payload.deviceClass, payload.deviceType), 80);
  normalized.viewport_width = numberOrBlank_(first_(payload.viewport_width, payload.viewportWidth));
  normalized.viewport_height = numberOrBlank_(first_(payload.viewport_height, payload.viewportHeight));
  normalized.browser_family = clean_(first_(payload.browser_family, payload.browserFamily), 80);
  normalized.browser_major_version = clean_(first_(payload.browser_major_version, payload.browserMajorVersion), 20);
  normalized.os_family = clean_(first_(payload.os_family, payload.osFamily), 80);
  normalized.referrer_domain = sanitizeHostname_(first_(payload.referrer_domain, payload.referrerDomain, payload.referrer));
  normalized.entry_source_category = clean_(first_(payload.entry_source_category, payload.entrySourceCategory), 80);
  normalized.utm_source = clean_(first_(payload.utm_source, getNested_(payload, "query", "utm_source")), 80);
  normalized.utm_medium = clean_(first_(payload.utm_medium, getNested_(payload, "query", "utm_medium")), 80);
  normalized.utm_campaign = clean_(first_(payload.utm_campaign, getNested_(payload, "query", "utm_campaign")), 120);
  normalized.utm_content = clean_(first_(payload.utm_content, getNested_(payload, "query", "utm_content")), 120);
  normalized.page_path = sanitizePath_(first_(payload.page_path, payload.pagePath, payload.pageUrl));
  normalized.config_version = clean_(first_(payload.config_version, payload.configVersion), 80);
  normalized.router_core_version = clean_(first_(payload.router_core_version, payload.routerCoreVersion), 80);
  normalized.config_source = clean_(first_(payload.config_source, payload.configSource), 80);
  normalized.safe_fallback_used = asBool_(first_(payload.safe_fallback_used, payload.safeFallbackUsed));
  normalized.tracking_method = clean_(first_(payload.tracking_method, payload.trackingMethod), 80);
  normalized.error_message = clean_(first_(payload.error_message, payload.errorMessage), 400);
  normalized.warning_code = clean_(first_(payload.warning_code, payload.warningCode), 120);
  normalized.warning_detail = clean_(first_(payload.warning_detail, payload.warningDetail), 300);
  normalized.bot_reason = clean_(first_(payload.bot_reason, payload.botReason), 100);
  normalized.user_agent = clean_(first_(payload.user_agent, payload.userAgent), 500);
  normalized.screen_width = numberOrBlank_(first_(payload.screen_width, payload.screenWidth));
  normalized.screen_height = numberOrBlank_(first_(payload.screen_height, payload.screenHeight));
  normalized.device_pixel_ratio = numberOrBlank_(first_(payload.device_pixel_ratio, payload.devicePixelRatio));
  normalized.touch = asBool_(payload.touch);
  normalized.max_touch_points = numberOrBlank_(first_(payload.max_touch_points, payload.maxTouchPoints));
  normalized.language = clean_(payload.language, 40);
  normalized.timezone = clean_(payload.timezone, 80);
  normalized.os_version_hint = clean_(first_(payload.os_version_hint, payload.osVersionHint), 80);
  normalized.connection_type = clean_(first_(payload.connection_type, payload.connectionType), 80);
  normalized.received_method = method;
  normalized.raw_query_keys = queryKeys.sort().join(",").slice(0, 500);

  if (!normalized.entry_source_category) normalized.entry_source_category = deriveSourceCategory_(normalized);
  if (!normalized.public_entry_page) normalized.public_entry_page = REGISTRY_SNAPSHOT.publicEntry.pagePath || "";
  if (!normalized.config_version) normalized.config_version = REGISTRY_SNAPSHOT.configVersion;
  return normalized;
}

function appendEvent_(normalized) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    locked = lock.tryLock(2000);
    if (!locked) throw new Error("Could not acquire script lock for event append");
    var sheet = ensureSheet_(SHEET_EVENTS, EVENT_HEADERS);
    appendRows_(sheet, EVENT_HEADERS, [normalized]);
    setControl_("last_event_time", normalized.server_time);
    setControl_("last_event_id", normalized.event_id);
  } finally {
    if (locked) lock.releaseLock();
  }
}

function isDuplicateEvent_(eventId) {
  if (!eventId) return false;
  try {
    var cache = CacheService.getScriptCache();
    var key = "event:" + eventId;
    if (cache.get(key)) return true;
    cache.put(key, "1", 21600);
  } catch (error) {}
  return false;
}

function getSpreadsheet_() {
  var id = clean_(TRACKER_SPREADSHEET_ID || "", 120);

  if (id) {
    return SpreadsheetApp.openById(id);
  }

  var ss = SpreadsheetApp.getActive();

  if (!ss) {
    throw new Error("No active spreadsheet. Create this script from the tracker Google Sheet with Extensions > Apps Script, or set TRACKER_SPREADSHEET_ID at the top of the script.");
  }

  return ss;
}

function verifySpreadsheetSetup() {
  var ss = getSpreadsheet_();
  return {
    ok: true,
    spreadsheetName: ss.getName(),
    spreadsheetId: ss.getId(),
    scriptVersion: SCRIPT_VERSION,
    timezone: DEFAULT_TIMEZONE
  };
}

function setupWorkbook_() {
  ensureSheet_(SHEET_EVENTS, EVENT_HEADERS);
  ensureSheet_(SHEET_ERRORS, ERROR_HEADERS);
  ensureSheet_(SHEET_DAILY, DAILY_HEADERS);
  ensureSheet_(SHEET_HOURLY, HOURLY_HEADERS);
  ensureSheet_(SHEET_DASHBOARD, DASHBOARD_HEADERS);
  ensureSheet_(SHEET_DEVICE, DEVICE_HEADERS);
  ensureSheet_(SHEET_SOURCE, SOURCE_HEADERS);
  ensureSheet_(SHEET_ROUTE, ROUTE_HEADERS);
  ensureSheet_(SHEET_QUALITY, QUALITY_HEADERS);
  ensureSheet_(SHEET_DASHBOARD_REGISTRY, DASHBOARD_REGISTRY_HEADERS);
  ensureSheet_(SHEET_PUBLIC_REGISTRY, PUBLIC_REGISTRY_HEADERS);
  ensureSheet_(SHEET_DATA_DICTIONARY, ["field", "description"]);
  ensureSheet_(SHEET_CONTROL, CONTROL_HEADERS);
  ensureSheet_(SHEET_ARCHIVE_LOG, ARCHIVE_LOG_HEADERS);
  ensureSheet_(SHEET_DASHBOARD_DATA, DASHBOARD_DATA_HEADERS);
}

function ensureSheet_(name, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var current = sheet.getLastRow() >= 1 ? sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn())).getValues()[0] : [];
  var needsHeader = sheet.getLastRow() === 0 || current.slice(0, headers.length).join("|") !== headers.join("|");
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendRows_(sheet, headers, objects) {
  if (!objects.length) return;
  var rows = objects.map(function (object) {
    return headers.map(function (header) {
      var value = object[header];
      if (value === undefined || value === null) return "";
      return value;
    });
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
}

function writeObjects_(sheetName, headers, rows) {
  var sheet = ensureSheet_(sheetName, headers);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.setFrozenRows(1);
}

function seedRegistrySheets_() {
  var dashboardRows = [];
  var publicRows = [];
  var dashboards = REGISTRY_SNAPSHOT.dashboards || {};
  Object.keys(dashboards).forEach(function (key) {
    var d = dashboards[key];
    var card = d.publicCard || {};
    var gov = d.governance || {};
    dashboardRows.push({
      dashboard_key: d.dashboardKey,
      dashboard_id: d.dashboardId,
      dashboard_name: d.displayName,
      public_card_title: card.title || "",
      powerbi_report_title: d.powerBiReportTitle || "",
      path: d.path || "",
      status: d.status || "",
      desktop_url: d.desktopUrl || "",
      mobile_url: d.mobileUrl || "",
      fallback_layout: d.fallbackLayout || "mobile",
      owner_team: gov.ownerTeam || "",
      technical_owner: gov.technicalOwner || "",
      content_owner: gov.contentOwner || "",
      last_reviewed_date: gov.lastReviewedDate || "",
      next_review_due: gov.nextReviewDue || "",
      utm_content: d.utmContent || card.stableUtmContent || ""
    });
    publicRows.push({
      dashboard_key: d.dashboardKey,
      public_page_url: card.pageUrl || REGISTRY_SNAPSHOT.publicEntry.pageUrl || "",
      public_card_title: card.title || "",
      public_description: card.description || "",
      button_text: card.buttonText || "",
      icon_url: card.iconUrl || "",
      published: !!card.published,
      last_verified_date: card.lastVerifiedDate || ""
    });
  });
  writeObjects_(SHEET_DASHBOARD_REGISTRY, DASHBOARD_REGISTRY_HEADERS, rowsForHeaders_(dashboardRows, DASHBOARD_REGISTRY_HEADERS));
  writeObjects_(SHEET_PUBLIC_REGISTRY, PUBLIC_REGISTRY_HEADERS, rowsForHeaders_(publicRows, PUBLIC_REGISTRY_HEADERS));
}

function writeDataDictionary_() {
  var rows = Object.keys(FIELD_DICTIONARY).sort().map(function (field) { return [field, FIELD_DICTIONARY[field]]; });
  var sheet = ensureSheet_(SHEET_DATA_DICTIONARY, ["field", "description"]);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([["field", "description"]]);
  if (rows.length) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}

function getDashboardData_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_DASHBOARD_DATA);
  if (sheet && sheet.getLastRow() >= 2) {
    var json = sheet.getRange(2, 2).getValue();
    if (json) {
      try { return JSON.parse(json); } catch (error) {}
    }
  }
  return buildDashboardDataFromSheets_();
}

function buildDashboardDataFromSheets_() {
  var generated = nowIso_();
  var dashboards = sheetObjects_(SHEET_DASHBOARD, DASHBOARD_HEADERS);
  var publicCards = sheetObjects_(SHEET_PUBLIC_REGISTRY, PUBLIC_REGISTRY_HEADERS);
  var daily = sheetObjects_(SHEET_DAILY, DAILY_HEADERS);
  var hourly = sheetObjects_(SHEET_HOURLY, HOURLY_HEADERS);
  var device = sheetObjects_(SHEET_DEVICE, DEVICE_HEADERS);
  var sources = sheetObjects_(SHEET_SOURCE, SOURCE_HEADERS);
  var routes = sheetObjects_(SHEET_ROUTE, ROUTE_HEADERS);
  var warnings = sheetObjects_(SHEET_QUALITY, QUALITY_HEADERS);
  var totals = { visits_today: 0, visits_7d: 0, visits_30d: 0, active_dashboards: 0, mobile_visits: 0, desktop_visits: 0, fallback_error_count: 0, bot_debug_test_count: 0, island_is_visits: 0, total_visits: 0 };

  dashboards.forEach(function (d) {
    if (d.status === "active") totals.active_dashboards += 1;
    totals.visits_today += toNumber_(d.visits_today);
    totals.visits_7d += toNumber_(d.visits_7d);
    totals.visits_30d += toNumber_(d.visits_30d);
    totals.mobile_visits += toNumber_(d.mobile_visits);
    totals.desktop_visits += toNumber_(d.desktop_visits);
    totals.island_is_visits += toNumber_(d.island_is_visits);
    totals.fallback_error_count += toNumber_(d.fallback_clicks) + toNumber_(d.error_events);
    totals.bot_debug_test_count += toNumber_(d.bot_events) + toNumber_(d.debug_events);
    totals.total_visits += toNumber_(d.total_visits);
  });

  return {
    ok: true,
    generated_at: generated,
    script_version: SCRIPT_VERSION,
    schema_version: EVENT_SCHEMA_VERSION,
    config_version: REGISTRY_SNAPSHOT.configVersion,
    public_entry: REGISTRY_SNAPSHOT.publicEntry,
    health: getHealth_().health,
    kpis: totals,
    dashboards: dashboards,
    public_cards: publicCards,
    daily: daily,
    hourly: hourly,
    device: device,
    sources: sources,
    routes: routes,
    quality_warnings: warnings,
    questions: [
      "Eru Teams/Outlook/link previews talin sem raunnotkun?",
      "Er island.is umferð að lækka eftir breytingu á opinberum kortum?",
      "Er fallback að bjarga brotinni leiðingu án þess að við tökum eftir því?",
      "Eru mælaborð með opinbert kort en enga nýlega heimsókn?"
    ]
  };
}

function getHealth_() {
  var control = controlMap_();
  var events = getSpreadsheet_().getSheetByName(SHEET_EVENTS);
  var rawRows = events ? Math.max(events.getLastRow() - 1, 0) : 0;
  var lastEvent = control.last_event_time || "";
  var lastAggregation = control.last_aggregation_time || "";
  var warnings = [];
  if (!lastEvent) warnings.push("no_events_received_yet");
  if (!lastAggregation) warnings.push("aggregation_never_run");
  return {
    ok: true,
    script_version: SCRIPT_VERSION,
    schema_version: EVENT_SCHEMA_VERSION,
    health: {
      status: warnings.length ? "warning" : "ok",
      last_event_time: lastEvent,
      last_aggregation_time: lastAggregation,
      dashboard_data_generated_at: control.dashboard_data_generated_at || "",
      raw_event_rows: rawRows,
      warnings: warnings
    }
  };
}

function getPublicRegistry_() {
  return {
    ok: true,
    generated_at: nowIso_(),
    config_version: REGISTRY_SNAPSHOT.configVersion,
    public_entry: REGISTRY_SNAPSHOT.publicEntry,
    dashboards: sheetObjects_(SHEET_DASHBOARD_REGISTRY, DASHBOARD_REGISTRY_HEADERS),
    public_cards: sheetObjects_(SHEET_PUBLIC_REGISTRY, PUBLIC_REGISTRY_HEADERS)
  };
}

function outputData_(data, params) {
  params = params || {};
  var callback = clean_(params.callback || "", 100);
  var format = clean_(params.format || "", 20).toLowerCase();
  if (callback || format === "js" || format === "jsonp") {
    callback = sanitizeCallback_(callback || "LandspitaliRouterStatusData");
    var js = callback + "(" + JSON.stringify(data).replace(/</g, "\u003c") + ");";
    return ContentService.createTextOutput(js).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return outputJson_(data);
}

function outputJson_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function sanitizeCallback_(callback) {
  callback = String(callback || "");
  if (/^[A-Za-z_$][0-9A-Za-z_$]{0,99}$/.test(callback)) return callback;
  return "LandspitaliRouterStatusData";
}

function addQualityWarnings_(dashboardAgg, qualityAgg, now) {
  Object.keys(dashboardAgg).forEach(function (key) {
    var d = dashboardAgg[key];
    var warnings = [];
    if (!d.last_event_time) warnings.push(["no_recent_events", "warning", "Engar mælingar hafa borist fyrir mælaborðið."]);
    if (d.total_visits > 0 && d.fallback_clicks / Math.max(d.total_visits, 1) > 0.05) warnings.push(["high_fallback_click_rate", "warning", "Fallback smellir eru yfir 5% af heimsóknum."]);
    if (d.error_events > 0) warnings.push(["router_errors_seen", "warning", "Villuatburðir hafa borist frá router."]);
    if (d.safe_fallback_events > 0) warnings.push(["safe_fallback_used", "warning", "Router notaði safe fallback config eða URL."]);
    if (d.bot_events > d.total_visits) warnings.push(["many_preview_or_bot_events", "info", "Forskoðanir/vélmenni eru fleiri en taldar heimsóknir."]);
    d.warning_count = warnings.length;
    warnings.forEach(function (warning) {
      var qualityKey = warning[0] + "|" + key;
      qualityAgg[qualityKey] = { warning_code: warning[0], dashboard_key: key, severity: warning[1], warning_text: warning[2], count: 1, last_seen: now.toISOString() };
    });
  });
}

function baseDashboardAgg_(registryRow) {
  return {
    dashboard_key: registryRow.dashboard_key || registryRow.dashboardKey || "",
    dashboard_id: registryRow.dashboard_id || registryRow.dashboardId || "",
    dashboard_name: registryRow.dashboard_name || registryRow.displayName || "",
    public_card_title: registryRow.public_card_title || (registryRow.publicCard && registryRow.publicCard.title) || "",
    status: registryRow.status || "active",
    visits_today: 0,
    visits_7d: 0,
    visits_30d: 0,
    total_visits: 0,
    total_events: 0,
    mobile_visits: 0,
    desktop_visits: 0,
    island_is_visits: 0,
    fallback_clicks: 0,
    error_events: 0,
    debug_events: 0,
    bot_events: 0,
    safe_fallback_events: 0,
    last_event_time: "",
    warning_count: 0
  };
}

function registryMap_() {
  var map = {};
  sheetObjects_(SHEET_DASHBOARD_REGISTRY, DASHBOARD_REGISTRY_HEADERS).forEach(function (row) { map[row.dashboard_key] = row; });
  if (!Object.keys(map).length) {
    var dashboards = REGISTRY_SNAPSHOT.dashboards || {};
    Object.keys(dashboards).forEach(function (key) {
      var d = dashboards[key];
      map[key] = { dashboard_key: d.dashboardKey, dashboard_id: d.dashboardId, dashboard_name: d.displayName, public_card_title: d.publicCard && d.publicCard.title, status: d.status };
    });
  }
  return map;
}

function sheetObjects_(sheetName, headers) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var values = sheet.getDataRange().getValues();
  var header = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i += 1) {
    rows.push(rowToObject_(header, values[i]));
  }
  return rows;
}

function rowToObject_(headers, row) {
  var object = {};
  for (var i = 0; i < headers.length; i += 1) {
    object[headers[i]] = row[i];
  }
  return object;
}

function valuesFromObject_(objectMap, headers) {
  return Object.keys(objectMap).sort().map(function (key) {
    return headers.map(function (header) { return objectMap[key][header] === undefined ? "" : objectMap[key][header]; });
  });
}

function rowsForHeaders_(objects, headers) {
  return objects.map(function (object) {
    return headers.map(function (header) { return object[header] === undefined ? "" : object[header]; });
  });
}

function setControl_(key, value) {
  var sheet = ensureSheet_(SHEET_CONTROL, CONTROL_HEADERS);
  var values = sheet.getDataRange().getValues();
  var i;
  for (i = 1; i < values.length; i += 1) {
    if (values[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(String(value));
      return;
    }
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, 2).setValues([[key, String(value)]]);
}

function controlMap_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEET_CONTROL);
  var map = {};
  if (!sheet || sheet.getLastRow() <= 1) return map;
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i += 1) {
    map[values[i][0]] = values[i][1];
  }
  return map;
}

function logError_(source, error, context) {
  try {
    var sheet = ensureSheet_(SHEET_ERRORS, ERROR_HEADERS);
    appendRows_(sheet, ERROR_HEADERS, [{ error_time: nowIso_(), script_version: SCRIPT_VERSION, source: clean_(source, 80), message: clean_(error && error.message ? error.message : String(error), 400), context: clean_(context || "", 300) }]);
  } catch (ignored) {}
}

function deriveSourceCategory_(row) {
  if (row.utm_source === "island.is" || row.referrer_domain === "island.is" || row.referrer_domain === "www.island.is") return "island_is_public";
  if (/^qr$/i.test(row.utm_source || "")) return "qr_code";
  if (/teams/i.test(row.utm_source || "")) return "internal_teams";
  if (/email|outlook/i.test(row.utm_source || "")) return "internal_email";
  if (row.referrer_domain) return "external_referrer";
  return "direct";
}

function first_() {
  for (var i = 0; i < arguments.length; i += 1) {
    if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== "") return arguments[i];
  }
  return "";
}

function getNested_(object, key1, key2) {
  return object && object[key1] && object[key1][key2] ? object[key1][key2] : "";
}

function clean_(value, max) {
  if (value === undefined || value === null) return "";
  value = String(value).replace(/[\0-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim();
  if (value.length > max) value = value.slice(0, max);
  return value;
}

function asBool_(value) {
  if (value === true) return true;
  if (value === false) return false;
  value = String(value || "").toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function numberOrBlank_(value) {
  var number = Number(value);
  return isFinite(number) ? number : "";
}

function toNumber_(value) {
  var number = Number(value);
  return isFinite(number) ? number : 0;
}

function sanitizeHostname_(value) {
  value = clean_(value, 500);
  if (!value) return "";
  var match = /^https?:\/\/([^\/?#]+)/i.exec(value);
  if (match && match[1]) return match[1].toLowerCase().slice(0, 160);
  return value.split("/")[0].split("?")[0].toLowerCase().slice(0, 160);
}

function sanitizePath_(value) {
  value = clean_(value, 500);
  if (!value) return "";
  var match = /^https?:\/\/[^\/?#]+([^?#]*)/i.exec(value);
  if (match) return (match[1] || "/").slice(0, 220);
  return value.split("?")[0].slice(0, 220);
}

function nowIso_() {
  return new Date().toISOString();
}

function isoDate_(date) {
  return Utilities.formatDate(date, DEFAULT_TIMEZONE, "yyyy-MM-dd");
}

function isoHour_(date) {
  return Utilities.formatDate(date, DEFAULT_TIMEZONE, "yyyy-MM-dd'T'HH:00:00'Z'");
}
