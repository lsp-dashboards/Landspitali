"use strict";

const path = require("path");
const {
  readJson,
  writeJson,
  dashboardsFromConfig
} = require("./lib");

function zeroDashboard(config, key, dashboard) {
  const card = dashboard.publicCard || {};
  return {
    dashboardId: dashboard.dashboardId,
    dashboard_id: dashboard.dashboardId,
    dashboardKey: dashboard.dashboardKey || key,
    dashboard_key: dashboard.dashboardKey || key,
    displayName: dashboard.displayName,
    dashboard_name: dashboard.displayName,
    public_card_title: card.title || dashboard.displayName,
    status: dashboard.status || "active",
    confidenceScore: 1,
    confidence_score: 1,
    confidence_band: "seed",
    reportTypeAvailability: {
      desktop: true,
      mobile: true,
      fallback: "mobile"
    },
    recentAggregateCounts: {
      visitsToday: 0,
      visits7d: 0,
      visits30d: 0,
      events: 0,
      errors: 0,
      fallbackClicks: 0
    },
    trend7d: { visits: 0, direction: "flat" },
    trend30d: { visits: 0, direction: "flat" },
    viewerRiskSummary: { status: "unknown", unsupportedBrowserEvents: 0 },
    aggregateSummaries: {
      device: [],
      browser: [],
      os: []
    },
    visits_today: 0,
    visits_7d: 0,
    visits_30d: 0,
    total_visits: 0,
    total_events: 0,
    raw_events: 0,
    diagnostic_events: 0,
    mobile_visits: 0,
    desktop_visits: 0,
    tablet_visits: 0,
    narrow_visits: 0,
    island_is_visits: 0,
    fallback_clicks: 0,
    error_events: 0,
    debug_events: 0,
    bot_events: 0,
    safe_fallback_events: 0,
    last_event_time: "",
    last_raw_event_time: "",
    last_counted_event_time: "",
    last_diagnostic_event_time: "",
    last_error_event_time: "",
    warning_count: 0,
    confirmed_warning_count: 0,
    diagnostic_signal_count: 0,
    weak_unknown_signal_count: 0,
    source_mix_summary: "",
    route_mix_summary: "",
    config_version: config.configVersion,
    core_version: config.release && config.release.coreVersion || ""
  };
}

function publicCardFromConfig(config, key, dashboard) {
  const card = dashboard.publicCard || {};
  return {
    dashboard_key: dashboard.dashboardKey || key,
    public_page_url: card.pageUrl || config.publicEntry && config.publicEntry.pageUrl || "",
    public_page_path: config.publicEntry && config.publicEntry.pagePath || "",
    public_card_title: card.title || dashboard.displayName,
    public_description: card.description || "",
    button_text: card.buttonText || card.actionText || config.publicEntry && config.publicEntry.defaultButtonText || "",
    icon_url: card.iconUrl || "",
    published: card.published !== false,
    stable_utm_content: card.stableUtmContent || dashboard.utmContent || "",
    last_verified_date: card.lastVerifiedDate || "",
    route_path: dashboard.path || key
  };
}

function buildSeedStatusSnapshot(config) {
  const generatedAt = process.env.STATUS_GENERATED_AT ||
    `${config.release && config.release.releasedAt || "2026-06-15"}T00:00:00.000Z`;
  const dashboards = dashboardsFromConfig(config).map(({ key, dashboard }) => zeroDashboard(config, key, dashboard));
  const publicCards = dashboardsFromConfig(config).map(({ key, dashboard }) => publicCardFromConfig(config, key, dashboard));

  const snapshot = {
    ok: true,
    schemaVersion: "1",
    generatedAt,
    generated_at: generatedAt,
    dashboard_data_generated_at: generatedAt,
    aggregation_generated_at: "",
    data_source: "static_seed",
    publicAggregateOnly: true,
    aggregate_only: true,
    script_version: "static-status-snapshot",
    schema_version: "1",
    config_version: config.configVersion,
    core_version: config.release && config.release.coreVersion || "",
    public_entry: config.publicEntry || {},
    health: {
      status: "seed",
      last_event_time: "",
      last_raw_event_time: "",
      last_counted_event_time: "",
      last_diagnostic_event_time: "",
      last_error_event_time: "",
      last_aggregation_time: "",
      dashboard_data_generated_at: generatedAt,
      raw_event_rows: 0,
      warnings: ["static_seed_no_live_aggregates"]
    },
    kpis: {
      active_dashboards: dashboards.filter((dashboard) => dashboard.status === "active").length,
      visits_today: 0,
      visits_7d: 0,
      visits_30d: 0,
      total_visits: 0,
      total_events: 0,
      raw_events: 0,
      diagnostic_events: 0,
      mobile_visits: 0,
      desktop_visits: 0,
      tablet_visits: 0,
      narrow_visits: 0,
      island_is_visits: 0,
      fallback_error_count: 0,
      bot_debug_test_count: 0,
      warning_count: 0,
      confirmed_warnings: 0,
      diagnostic_signals: 0,
      weak_unknown_signal_count: 0,
      mobile_share: 0,
      desktop_share: 0,
      weak_unknown_signal_share: 0,
      confidence_health: "seed",
      powerbi_viewer_unsupported_browser_events: 0,
      powerbi_viewer_not_officially_supported_events: 0,
      in_app_browser_visits: 0
    },
    dashboards,
    public_cards: publicCards,
    daily: [],
    hourly: [],
    device: [],
    device_confidence: [],
    browsers: [],
    os: [],
    display: [],
    input: [],
    performance: [],
    root_index_funnel: {
      views: 0,
      clicks: 0,
      router_arrivals: 0,
      counted_opens: 0
    },
    root_index: {
      views: 0,
      clicks: 0,
      router_arrivals: 0,
      counted_opens: 0
    },
    sources: [],
    routes: [],
    quality_warnings: [],
    insight_cards: [
      { code: "traffic_total", title: "Total traffic", value: "0", detail: "Static seed snapshot; live aggregates are not embedded." },
      { code: "mobile_share", title: "Mobile share", value: "0%", detail: "Static seed snapshot." },
      { code: "fallback_error_rate", title: "Fallback/error rate", value: "0%", detail: "Static seed snapshot." }
    ],
    history: [
      {
        date: generatedAt.slice(0, 10),
        total_visits: 0,
        mobile_visits: 0,
        desktop_visits: 0,
        warnings: 0
      }
    ],
    questions: [
      "Static seed snapshot. Apps Script live API remains the fallback data source."
    ]
  };

  return snapshot;
}

function addDashboardSummaries(snapshot, config) {
  const configMap = new Map(dashboardsFromConfig(config).map(({ key, dashboard }) => [dashboard.dashboardKey || key, dashboard]));
  snapshot.dashboards = (snapshot.dashboards || []).map((row) => {
    const dashboardKey = row.dashboardKey || row.dashboard_key;
    const configDashboard = configMap.get(dashboardKey) || {};
    return Object.assign({}, row, {
      dashboardId: row.dashboardId || row.dashboard_id || configDashboard.dashboardId || "",
      dashboard_id: row.dashboard_id || row.dashboardId || configDashboard.dashboardId || "",
      dashboardKey: dashboardKey || configDashboard.dashboardKey || "",
      dashboard_key: row.dashboard_key || row.dashboardKey || configDashboard.dashboardKey || "",
      displayName: row.displayName || row.dashboard_name || configDashboard.displayName || "",
      dashboard_name: row.dashboard_name || row.displayName || configDashboard.displayName || "",
      confidenceScore: row.confidenceScore === undefined ? 1 : row.confidenceScore,
      confidence_score: row.confidence_score === undefined ? 1 : row.confidence_score,
      reportTypeAvailability: row.reportTypeAvailability || {
        desktop: !!(configDashboard.desktopUrl),
        mobile: !!(configDashboard.mobileUrl),
        fallback: configDashboard.fallbackLayout || "mobile"
      },
      recentAggregateCounts: row.recentAggregateCounts || {
        visitsToday: Number(row.visits_today || 0),
        visits7d: Number(row.visits_7d || 0),
        visits30d: Number(row.visits_30d || 0),
        events: Number(row.total_events || 0),
        errors: Number(row.error_events || 0),
        fallbackClicks: Number(row.fallback_clicks || 0)
      },
      trend7d: row.trend7d || { visits: Number(row.visits_7d || 0), direction: "flat" },
      trend30d: row.trend30d || { visits: Number(row.visits_30d || 0), direction: "flat" },
      viewerRiskSummary: row.viewerRiskSummary || {
        status: Number(row.warning_count || row.confirmed_warning_count || 0) ? "watch" : "ok",
        unsupportedBrowserEvents: 0
      },
      aggregateSummaries: row.aggregateSummaries || {
        device: [],
        browser: [],
        os: []
      }
    });
  });
  return snapshot;
}

function addHistorySummary(snapshot) {
  if (Array.isArray(snapshot.history) && snapshot.history.length) return snapshot;
  const daily = snapshot.daily || [];
  const byDate = new Map();
  daily.forEach((row) => {
    const date = row.date || "";
    if (!date) return;
    const current = byDate.get(date) || { date, total_visits: 0, mobile_visits: 0, desktop_visits: 0, warnings: 0 };
    current.total_visits += Number(row.visits || 0);
    if (row.selected_layout === "mobile") current.mobile_visits += Number(row.visits || 0);
    if (row.selected_layout === "desktop") current.desktop_visits += Number(row.visits || 0);
    byDate.set(date, current);
  });
  snapshot.history = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  if (!snapshot.history.length) {
    snapshot.history.push({
      date: (snapshot.generatedAt || snapshot.generated_at || new Date().toISOString()).slice(0, 10),
      total_visits: Number(snapshot.kpis && snapshot.kpis.total_visits || 0),
      mobile_visits: Number(snapshot.kpis && snapshot.kpis.mobile_visits || 0),
      desktop_visits: Number(snapshot.kpis && snapshot.kpis.desktop_visits || 0),
      warnings: Number(snapshot.kpis && (snapshot.kpis.warning_count || snapshot.kpis.confirmed_warnings) || 0)
    });
  }
  return snapshot;
}

function normalizeStatusSnapshot(snapshot, config, source) {
  snapshot = Object.assign({}, snapshot);
  snapshot.ok = true;
  snapshot.schemaVersion = snapshot.schemaVersion || snapshot.schema_version || "1";
  snapshot.generatedAt = snapshot.generatedAt || snapshot.generated_at || new Date().toISOString();
  snapshot.generated_at = snapshot.generated_at || snapshot.generatedAt;
  snapshot.publicAggregateOnly = true;
  snapshot.aggregate_only = true;
  snapshot.data_source = source;
  snapshot.config_version = snapshot.config_version || config.configVersion;
  snapshot.public_entry = snapshot.public_entry || config.publicEntry || {};
  snapshot.kpis = snapshot.kpis || {};
  snapshot.public_cards = snapshot.public_cards || dashboardsFromConfig(config).map(({ key, dashboard }) => publicCardFromConfig(config, key, dashboard));
  snapshot.daily = snapshot.daily || [];
  snapshot.hourly = snapshot.hourly || [];
  snapshot.device = snapshot.device || [];
  snapshot.device_confidence = snapshot.device_confidence || [];
  snapshot.browsers = snapshot.browsers || [];
  snapshot.os = snapshot.os || [];
  snapshot.display = snapshot.display || [];
  snapshot.input = snapshot.input || [];
  snapshot.performance = snapshot.performance || [];
  snapshot.sources = snapshot.sources || [];
  snapshot.routes = snapshot.routes || [];
  snapshot.quality_warnings = snapshot.quality_warnings || [];
  addDashboardSummaries(snapshot, config);
  addHistorySummary(snapshot);
  return snapshot;
}

async function fetchLiveStatusSnapshot(config) {
  if (process.env.STATUS_SNAPSHOT_MODE === "seed") return null;
  const endpoint = process.env.STATUS_SOURCE_URL || config.statusDashboard && config.statusDashboard.endpoint;
  if (!endpoint) return null;
  const url = new URL(endpoint);
  url.searchParams.set("api", "dashboard");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.STATUS_SOURCE_TIMEOUT_MS || 30000));
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Status source HTTP ${response.status}`);
    const data = await response.json();
    if (!data || data.ok === false) throw new Error("Status source payload was not ok");
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function buildStatusSnapshot() {
  const config = readJson("assets/router-config.json");
  try {
    const live = await fetchLiveStatusSnapshot(config);
    if (live) return normalizeStatusSnapshot(live, config, "apps_script_snapshot");
  } catch (error) {
    console.warn(`Live status snapshot unavailable; writing static seed. ${error.message}`);
  }
  return normalizeStatusSnapshot(buildSeedStatusSnapshot(config), config, "static_seed");
}

async function writeStatusSnapshot() {
  const snapshot = await buildStatusSnapshot();
  const date = snapshot.generatedAt.slice(0, 10);
  writeJson("assets/data/status-latest.json", snapshot);
  writeJson(path.join("assets/data/status-history", `${date}.json`), snapshot);
  console.log(`Wrote assets/data/status-latest.json and assets/data/status-history/${date}.json`);
  return snapshot;
}

if (require.main === module) {
  writeStatusSnapshot().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  buildStatusSnapshot,
  writeStatusSnapshot
};
