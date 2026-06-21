(function () {
  "use strict";

  var DATA_ENDPOINT = "https://script.google.com/macros/s/AKfycbxRoNEQwlxQUpxEMGzYizAB0_lP1MdqksGLu4fD7c94rzqUul3MW2_E9VCqeRzLK3wD/exec";
  var STATIC_STATUS_URL = "../assets/data/status-latest.json";
  var SAMPLE_STATUS_URL = "../assets/data/status-sample.json";
  var SAMPLE_SHEET_JSONP_URL = "https://docs.google.com/spreadsheets/d/1ORKOx4_oT7b6x52aGr4JzvotLCcuquLY_VyppfXOvu4/gviz/tq?sheet=Dashboard_Data&tqx=out:json;responseHandler:";
  var STATUS_DATA_TIMEOUT_MS = 22000;
  var STATUS_DATA_RETRY_DELAY_MS = 1500;
  var STATUS_DATA_MAX_ATTEMPTS = 2;
  var STATUS_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
  var STATIC_STATUS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
  var STATUS_LOCALE = "is-IS";
  var STATUS_COLLATOR = new Intl.Collator(STATUS_LOCALE, { sensitivity: "base", numeric: true });
  var STATUS_COMPONENTS = [
    "UI: Vaktborð",
    "Vöktunarkjarni: Rekstrarpúls",
    "Config v1.0.0",
    "Atburðasafnari v1.0.0",
    "Gagnasnið v1.0.0",
    "Talningarhlið",
    "Leiðingarskipting",
    "Aðeins samantektargögn"
  ];

  var statusDataMode = readDataModeFromUrl();
  var statusLoadSequence = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function number(value) {
    var n = Number(value);
    return isFinite(n) ? n : 0;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, number(value)));
  }

  function firstValue(row, keys) {
    row = row || {};
    for (var i = 0; i < keys.length; i += 1) {
      if (row[keys[i]] !== undefined && row[keys[i]] !== null && row[keys[i]] !== "") return row[keys[i]];
    }
    return "";
  }

  function safe(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatIcelandicNumber(value, maximumFractionDigits) {
    var n = number(value);
    var sign = n < 0 ? "-" : "";
    n = Math.abs(n);
    var fixed = maximumFractionDigits > 0 ? n.toFixed(maximumFractionDigits) : String(Math.round(n));
    if (maximumFractionDigits > 0) fixed = fixed.replace(/0+$/, "").replace(/\.$/, "");
    var parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return sign + parts[0] + (parts[1] ? "," + parts[1] : "");
  }

  function fmt(value) {
    return formatIcelandicNumber(Math.round(number(value)), 0);
  }

  function pct(part, whole) {
    whole = number(whole);
    return formatIcelandicNumber((whole ? number(part) / whole : 0) * 100, 1) + "%";
  }

  function cssPct(part, whole) {
    whole = number(whole);
    if (!whole) return "0%";
    return clamp(number(part) / whole * 100, number(part) > 0 ? 2 : 0, 100).toFixed(1) + "%";
  }

  function setText(id, value) {
    var el = byId(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, html) {
    var el = byId(id);
    if (el) el.innerHTML = html;
  }

  function rowsFrom(data, key) {
    return data && Array.isArray(data[key]) ? data[key] : [];
  }

  function rowVisits(row) {
    return number(firstValue(row, ["visits", "total_visits", "counted_count", "count"]));
  }

  function rowEvents(row) {
    return number(firstValue(row, ["events", "raw_events", "total_events", "count"]));
  }

  function sum(rows, valueFn) {
    return (rows || []).reduce(function (acc, row) {
      return acc + number(valueFn ? valueFn(row) : rowVisits(row));
    }, 0);
  }

  function groupRows(rows, keyFn, valueFn) {
    var map = {};
    (rows || []).forEach(function (row) {
      var key = keyFn(row) || "unknown";
      map[key] = (map[key] || 0) + number(valueFn ? valueFn(row) : rowVisits(row));
    });
    return Object.keys(map).map(function (key) {
      return { key: key, value: map[key] };
    }).sort(function (a, b) {
      return b.value - a.value || STATUS_COLLATOR.compare(a.key, b.key);
    });
  }

  function topRows(rows, limit) {
    return (rows || []).slice().sort(function (a, b) {
      return rowVisits(b) - rowVisits(a);
    }).slice(0, limit);
  }

  function cleanName(value) {
    return String(value || "").replace(/Bráðamóttakan í Fossvogi/g, "Bráðamóttaka í Fossvogi");
  }

  function dashboardKey(row) {
    return row && (row.dashboard_key || row.dashboardKey || row.key || row.dashboard_id || row.dashboardId) || "";
  }

  function dashboardTitle(row, cards) {
    var key = dashboardKey(row);
    var card = cards && cards[key] || {};
    return cleanName(card.public_card_title || row.public_card_title || row.dashboard_name || row.displayName || row.dashboardKey || key || "Mælaborð");
  }

  function publicMap(data) {
    var map = {};
    rowsFrom(data, "public_cards").forEach(function (card) {
      if (card.dashboard_key) map[card.dashboard_key] = card;
    });
    return map;
  }

  function dateValue(iso) {
    if (!iso) return null;
    var date = new Date(iso);
    return isNaN(date.getTime()) ? null : date;
  }

  function dateShort(iso) {
    var date = dateValue(iso);
    if (!date) return "-";
    return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + ", " + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function ageInfo(iso) {
    var date = dateValue(iso);
    if (!date) return { minutes: Infinity, label: "-", tone: "diagnostic" };
    var minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (minutes < 60) return { minutes: minutes, label: minutes + " mín", tone: "good" };
    if (minutes < 1440) return { minutes: minutes, label: Math.round(minutes / 60) + " klst", tone: minutes > 360 ? "warn" : "good" };
    return { minutes: minutes, label: Math.round(minutes / 1440) + " d", tone: "warn" };
  }

  function statusGeneratedAt(data) {
    var health = data && data.health ? data.health : {};
    return data && (
      data.generated_at ||
      data.generatedAt ||
      data.dashboard_data_generated_at ||
      data.aggregation_generated_at ||
      health.dashboard_data_generated_at ||
      health.aggregation_generated_at ||
      health.last_aggregation_time
    ) || "";
  }

  function staleStaticStatusMessage(data) {
    var timestamp = statusGeneratedAt(data);
    var date = dateValue(timestamp);
    if (!timestamp) return "Static status JSON has no generated timestamp; using Apps Script fallback.";
    if (!date) return "Static status JSON generated timestamp is invalid; using Apps Script fallback.";
    if (Date.now() - date.getTime() > STATIC_STATUS_MAX_AGE_MS) {
      return "Static status JSON is older than 24 hours (" + dateShort(timestamp) + "); using Apps Script fallback.";
    }
    return "";
  }

  function labelSource(value) {
    var key = String(value || "").toLowerCase();
    if (key === "island_is_public" || key === "island.is") return "island.is";
    if (key === "root_index") return "Root gateway";
    if (key === "direct") return "Beint";
    if (key === "test") return "Test";
    if (!key || key === "unknown") return "Óþekkt";
    return String(value).replace(/_/g, " ");
  }

  function sourceTone(value) {
    var key = String(value || "").toLowerCase();
    if (key === "island_is_public" || key === "island.is") return "source";
    if (key === "root_index") return "route";
    if (key === "direct") return "diagnostic";
    return "info";
  }

  function labelLayout(value) {
    var key = String(value || "").toLowerCase();
    if (key === "mobile") return "Mobile";
    if (key === "desktop") return "Desktop";
    if (key === "auto") return "Sjálfvirkt";
    return value ? String(value).replace(/_/g, " ") : "Óþekkt";
  }

  function labelReason(value) {
    return String(value || "unknown").replace(/_/g, " ");
  }

  function labelViewport(value) {
    return String(value || "unknown").replace(/_/g, " ");
  }

  function labelTransport(value) {
    if (!value) return "Óþekkt";
    return String(value).replace(/fetchKeepalive/g, "fetch keepalive").replace(/imageGet/g, "image GET");
  }

  function labelPayload(value) {
    return String(value || "unknown").replace(/_/g, " ");
  }

  function chip(label, tone) {
    return '<span class="chip ' + safe(tone || "") + '">' + safe(label) + '</span>';
  }

  function metricRow(label, value, detail) {
    return '<div class="metric-row"><div><strong>' + safe(label) + '</strong>' + (detail ? '<span>' + safe(detail) + '</span>' : '') + '</div><strong>' + safe(value) + '</strong></div>';
  }

  function kpi(label, value, detail, tone) {
    return '<article class="kpi ' + safe(tone || "") + '"><span>' + safe(label) + '</span><strong>' + safe(value) + '</strong><small>' + safe(detail || "") + '</small></article>';
  }

  function barRow(label, value, total, tone, right) {
    return '<div class="bar-row"><div class="bar-label"><strong>' + safe(label) + '</strong><span>' + safe(right || pct(value, total)) + '</span></div><div class="bar-track" aria-hidden="true"><span class="bar-fill ' + safe(tone || "") + '" style="--value:' + safe(cssPct(value, total)) + '"></span></div><strong>' + fmt(value) + '</strong></div>';
  }

  function stackedBar(segments, total) {
    var html = '<div class="stack" role="img" aria-label="' + safe(segments.map(function (seg) { return seg.label + " " + pct(seg.value, total); }).join(", ")) + '">';
    segments.forEach(function (seg) {
      html += '<span class="stack-segment ' + safe(seg.tone || "") + '" style="--value:' + safe(cssPct(seg.value, total)) + '" title="' + safe(seg.label + ": " + pct(seg.value, total)) + '"></span>';
    });
    html += '</div><div class="stack-legend">' + segments.map(function (seg) {
      return chip(seg.label + " " + pct(seg.value, total), seg.tone);
    }).join("") + '</div>';
    return html;
  }

  function card(kicker, title, body, meta) {
    return '<article class="card"><div class="card-body"><p class="card-kicker">' + safe(kicker || "") + '</p><h3>' + safe(title || "") + '</h3>' + body + (meta ? '<div class="chip-row offset">' + meta + '</div>' : '') + '</div></article>';
  }

  function emptyState(text) {
    return '<div class="empty-state">' + safe(text) + '</div>';
  }

  function splitWarnings(data) {
    var confirmed = [];
    var diagnostic = [];
    rowsFrom(data, "quality_warnings").forEach(function (row) {
      var isConfirmed = row.is_confirmed === true || String(row.is_confirmed).toLowerCase() === "true" || number(row.confirmed_count) > 0 || (String(row.severity || "").toLowerCase() !== "info" && number(row.counted_count) > 0);
      (isConfirmed ? confirmed : diagnostic).push(row);
    });
    confirmed.sort(warningSort);
    diagnostic.sort(warningSort);
    return { confirmed: confirmed, diagnostic: diagnostic };
  }

  function warningSort(a, b) {
    return severityWeight(b) - severityWeight(a) || number(b.counted_count) - number(a.counted_count) || number(b.count) - number(a.count);
  }

  function severityWeight(row) {
    var severity = String(row.severity || "").toLowerCase();
    if (severity === "critical") return 4;
    if (severity === "error") return 3;
    if (severity === "warning") return 2;
    if (severity === "watch") return 1;
    return 0;
  }

  function latestCountedEventTime(data) {
    var values = [];
    if (data && data.health) values.push(data.health.last_counted_event_time, data.health.last_event_time);
    rowsFrom(data, "dashboards").forEach(function (row) {
      values.push(row.last_counted_event_time, row.last_event_time);
    });
    return values.filter(Boolean).sort().pop() || "";
  }

  function latestRawEventTime(data) {
    var values = [];
    if (data && data.health) values.push(data.health.last_raw_event_time);
    rowsFrom(data, "dashboards").forEach(function (row) {
      values.push(row.last_raw_event_time);
    });
    return values.filter(Boolean).sort().pop() || "";
  }

  function latestDiagnosticEventTime(data) {
    var values = [];
    if (data && data.health) values.push(data.health.last_diagnostic_event_time);
    rowsFrom(data, "dashboards").forEach(function (row) {
      values.push(row.last_diagnostic_event_time);
    });
    return values.filter(Boolean).sort().pop() || "";
  }

  function latestErrorEventTime(data) {
    var values = [];
    if (data && data.health) values.push(data.health.last_error_event_time);
    rowsFrom(data, "dashboards").forEach(function (row) {
      values.push(row.last_error_event_time);
    });
    return values.filter(Boolean).sort().pop() || "";
  }

  function aggregationTime(data) {
    return data.aggregation_generated_at || data.dashboard_data_generated_at || data.generated_at || data.generatedAt || data.health && data.health.last_aggregation_time || "";
  }

  function dashboardFallbackClicks(data) {
    return sum(rowsFrom(data, "dashboards"), function (row) {
      return number(row.fallback_clicks);
    });
  }

  function dashboardSafeFallbackEvents(data) {
    return sum(rowsFrom(data, "dashboards"), function (row) {
      return number(row.safe_fallback_events);
    });
  }

  function opsModel(data) {
    var kpis = data.kpis || {};
    var warnings = splitWarnings(data).confirmed.length || number(kpis.confirmed_warnings);
    var fallbackErrors = number(kpis.fallback_error_count) || dashboardFallbackClicks(data);
    var weakShare = kpis.weak_unknown_signal_share !== undefined ? number(kpis.weak_unknown_signal_share) : (number(kpis.weak_unknown_signal_count) / Math.max(number(kpis.total_events), 1));
    var eventAge = ageInfo(latestCountedEventTime(data));
    var aggAge = ageInfo(aggregationTime(data));
    var freshnessPenalty = (eventAge.minutes > 1440 ? 12 : eventAge.minutes > 360 ? 6 : 0) + (aggAge.minutes > 240 ? 8 : aggAge.minutes > 75 ? 3 : 0);
    var score = clamp(100 - warnings * 16 - fallbackErrors * 9 - weakShare * 38 - freshnessPenalty, 0, 100);
    return {
      score: score,
      tone: score >= 86 ? "good" : score >= 70 ? "warn" : "bad",
      confirmedWarnings: warnings,
      fallbackErrors: fallbackErrors,
      weakShare: weakShare,
      eventAge: eventAge,
      aggregationAge: aggAge
    };
  }

  function deriveStatusNow(data) {
    var kpis = data.kpis || {};
    var model = opsModel(data);
    var counted = number(kpis.total_visits);
    var island = number(kpis.island_is_visits);
    var sentence;
    if (model.confirmedWarnings) {
      sentence = "Talin production notkun er " + (model.eventAge.minutes <= 360 ? "fersk" : "orðin gömul") + ", en " + fmt(model.confirmedWarnings) + " staðfest production merki þurfa skoðun.";
    } else if (model.fallbackErrors) {
      sentence = "Taldar opnanir eru að skila sér, en fallback/error hliðarrás þarf athygli.";
    } else {
      sentence = "Taldar opnanir, ferskleiki og afhending líta stöðug út í núverandi aggregate mynd.";
    }
    return {
      score: model.score,
      tone: model.tone,
      sentence: sentence,
      kpis: [
        { label: "Taldar opnanir", value: fmt(counted), detail: fmt(number(kpis.visits_today)) + " í dag · " + fmt(number(kpis.visits_7d)) + " síðustu 7 daga", tone: "good" },
        { label: "Virk mælaborð", value: fmt(number(kpis.active_dashboards) || rowsFrom(data, "dashboards").length), detail: "Public dashboard kort í payload", tone: "info" },
        { label: "Staðfest production merki", value: fmt(model.confirmedWarnings), detail: model.confirmedWarnings ? "Skoða í Gæðavakt" : "Engin staðfest queue", tone: model.confirmedWarnings ? "warn" : "good" },
        { label: "Síðasta talda opnun", value: model.eventAge.label, detail: dateShort(latestCountedEventTime(data)), tone: model.eventAge.tone },
        { label: "Ferskleiki samantektar", value: model.aggregationAge.label, detail: dateShort(aggregationTime(data)), tone: model.aggregationAge.tone },
        { label: "island.is hlutdeild", value: pct(island, counted), detail: fmt(island) + " taldar opnanir", tone: "source" }
      ]
    };
  }

  function deriveCountingIntegrity(data) {
    var kpis = data.kpis || {};
    var raw = number(kpis.raw_events || kpis.total_events);
    var counted = number(kpis.total_visits);
    var diagnostic = number(kpis.diagnostic_events || kpis.diagnostic_signals);
    var botDebug = number(kpis.bot_debug_test_count);
    var excluded = Math.max(raw - counted - diagnostic, botDebug, 0);
    var fallback = number(kpis.fallback_error_count) || dashboardFallbackClicks(data);
    return {
      total: Math.max(raw, counted + diagnostic + excluded + fallback),
      stages: [
        { label: "Hrá merki", value: raw, detail: "Öll samantektarmerki úr teljara", tone: "info" },
        { label: "Mögulegar opnanir", value: Math.max(counted, raw - diagnostic - excluded), detail: "Framleiðsluopnanir eftir síun", tone: "route" },
        { label: "Taldar opnanir", value: counted, detail: "count_as_visit TRUE og framleiðsluatvik", tone: "counted" },
        { label: "Útilokað frá talningu", value: excluded, detail: "debug, test, bot, root/list/health eða dedupe", tone: "diagnostic" },
        { label: "Fallback/error hliðarrás", value: fallback, detail: "Merki til skoðunar, ekki auka notkun", tone: fallback ? "warn" : "good" }
      ],
      rows: [
        ["count_as_visit = TRUE", fmt(counted), "Aðeins raunverulegar mælaborðsopnanir teljast."],
        ["Diagnostic merki", fmt(diagnostic), "Rekstrarsamhengi án þess að hækka notkun."],
        ["Debug/test/bot", fmt(botDebug), "Útilokað frá production talningu."],
        ["Safe fallback", fmt(dashboardSafeFallbackEvents(data)), "Hliðarrás ef router þurfti örugga slóð."],
        ["Raw - counted", fmt(Math.max(raw - counted, 0)), "Munur má vera root, diagnostic eða útilokað."],
        ["Traust merkja", pct(counted, raw || counted), "Hlutfall raw merkja sem urðu taldar opnanir."]
      ]
    };
  }

  function deriveFlowSource(data) {
    var kpis = data.kpis || {};
    var sourceGroups = groupRows(rowsFrom(data, "sources"), function (row) {
      return row.entry_source_category || row.utm_source || "unknown";
    }, function (row) {
      return number(row.visits);
    }).filter(function (row) {
      return row.value > 0;
    });
    var total = number(kpis.total_visits) || sum(sourceGroups, function (row) { return row.value; });
    var root = data.root_index_funnel || data.root_index || {};
    var routes = rowsFrom(data, "routes");
    var mobile = number(kpis.mobile_visits) || sum(routes.filter(function (row) { return row.selected_layout === "mobile"; }));
    var desktop = number(kpis.desktop_visits) || sum(routes.filter(function (row) { return row.selected_layout === "desktop"; }));
    return {
      total: total,
      sourceGroups: sourceGroups,
      root: {
        views: number(root.views),
        clicks: number(root.clicks),
        arrivals: number(root.router_arrivals),
        counted: number(root.counted_opens)
      },
      layout: [
        { label: "Mobile", value: mobile, tone: "counted" },
        { label: "Desktop", value: desktop, tone: "route" }
      ],
      fallback: number(kpis.fallback_error_count) || dashboardFallbackClicks(data)
    };
  }

  function derivePortfolio(data) {
    var cards = publicMap(data);
    var total = number(data.kpis && data.kpis.total_visits) || sum(rowsFrom(data, "dashboards"), function (row) { return number(row.total_visits); });
    return rowsFrom(data, "dashboards").map(function (row) {
      var key = dashboardKey(row);
      var sourceRows = rowsFrom(data, "sources").filter(function (item) { return dashboardKey(item) === key && number(item.visits) > 0; });
      var sourceTotal = sum(sourceRows, function (item) { return number(item.visits); });
      var routeRows = rowsFrom(data, "routes").filter(function (item) { return dashboardKey(item) === key && number(item.visits) > 0; });
      var routeTotal = sum(routeRows);
      var counted = number(row.total_visits);
      var cardInfo = cards[key] || {};
      return {
        key: key,
        title: dashboardTitle(row, cards),
        id: row.dashboard_id || row.dashboardId || key,
        counted: counted,
        total: total,
        today: number(row.visits_today),
        visits7d: number(row.visits_7d),
        visits30d: number(row.visits_30d),
        mobile: number(row.mobile_visits) || sum(routeRows.filter(function (item) { return item.selected_layout === "mobile"; })),
        desktop: number(row.desktop_visits) || sum(routeRows.filter(function (item) { return item.selected_layout === "desktop"; })),
        sourceRows: sourceRows,
        sourceTotal: sourceTotal || counted,
        routeTotal: routeTotal || counted,
        warnings: number(row.confirmed_warning_count || row.warning_count),
        confidence: row.confidence_band || row.confidenceHealth || "unknown",
        freshness: ageInfo(row.last_counted_event_time || row.last_event_time),
        published: cardInfo.published !== false,
        publicStatus: cardInfo.published === false ? "Ekki birt" : "Birt"
      };
    }).sort(function (a, b) {
      return b.counted - a.counted;
    });
  }

  function deriveRouting(data) {
    var routeRows = rowsFrom(data, "routes").filter(function (row) { return rowVisits(row) > 0 || rowEvents(row) > 0; });
    var deviceRows = rowsFrom(data, "device").filter(function (row) { return rowVisits(row) > 0; });
    var reasonGroups = groupRows(routeRows, function (row) { return row.route_reason || "unknown"; });
    var forced = sum(routeRows.filter(function (row) { return String(row.forced_layout || "auto").toLowerCase() !== "auto" || row.forced_layout_applied === true; }));
    var automatic = Math.max(sum(routeRows) - forced, 0);
    return {
      reasonMatrix: buildMatrix(routeRows, function (row) { return labelReason(row.route_reason); }, function (row) { return labelLayout(row.selected_layout); }, rowVisits, 6, ["Mobile", "Desktop"]),
      deviceMatrix: buildMatrix(deviceRows, function (row) { return labelLayout(row.device_class || row.inferred_device_class); }, function (row) { return labelLayout(row.selected_layout); }, rowVisits, 6, ["Mobile", "Desktop"]),
      reasonGroups: reasonGroups.slice(0, 8),
      decisionSplit: [
        { label: "Sjálfvirkt val", value: automatic, tone: "counted" },
        { label: "Þvingað val", value: forced, tone: forced ? "warn" : "diagnostic" }
      ],
      anomalies: routeRows.filter(function (row) {
        return /narrow|forced|fallback|unsupported|unknown|tablet/i.test(row.route_reason || row.route_reason_detail || "");
      }).slice(0, 5)
    };
  }

  function deriveEnvironment(data) {
    var deviceRows = rowsFrom(data, "device").filter(function (row) { return rowVisits(row) > 0; });
    var displayRows = rowsFrom(data, "display").filter(function (row) { return rowVisits(row) > 0; });
    var performanceRows = rowsFrom(data, "performance").filter(function (row) { return rowVisits(row) > 0 || rowEvents(row) > 0; });
    return {
      browserOsMatrix: buildMatrix(deviceRows, function (row) { return row.browser_family || "unknown"; }, function (row) { return row.os_family || "unknown"; }, rowVisits, 6, null, 5),
      deviceLayoutMatrix: buildMatrix(deviceRows, function (row) { return labelLayout(row.device_class || row.inferred_device_class); }, function (row) { return labelLayout(row.selected_layout); }, rowVisits, 6, ["Mobile", "Desktop"]),
      viewportBars: groupRows(displayRows.length ? displayRows : deviceRows, function (row) { return labelViewport(row.viewport_bucket || row.display_class); }).slice(0, 8),
      topCombos: topRows(deviceRows, 5),
      transport: groupRows(performanceRows, function (row) { return labelTransport(row.tracker_send_method); }, function (row) { return rowEvents(row) || rowVisits(row); }).slice(0, 5),
      payload: groupRows(performanceRows, function (row) { return labelPayload(row.payload_size_bucket); }, function (row) { return rowEvents(row) || rowVisits(row); }).slice(0, 5),
      connection: groupRows(performanceRows, function (row) { return row.connection_effective_type || row.connection_type || "unknown"; }, function (row) { return rowEvents(row) || rowVisits(row); }).slice(0, 5),
      unsupported: number(data.kpis && data.kpis.powerbi_viewer_unsupported_browser_events),
      inApp: number(data.kpis && data.kpis.in_app_browser_visits),
      forcedDark: number(data.kpis && data.kpis.forced_dark_detected_visits),
      samsung: number(data.kpis && data.kpis.samsung_forced_dark_possible_events),
      fallback: number(data.kpis && data.kpis.fallback_error_count) || dashboardFallbackClicks(data),
      safeFallback: dashboardSafeFallbackEvents(data),
      lastError: latestErrorEventTime(data)
    };
  }

  function deriveQualityQueue(data) {
    var split = splitWarnings(data);
    return {
      confirmed: split.confirmed,
      diagnostic: split.diagnostic
    };
  }

  function deriveAuditEvidence(data) {
    return {
      generated: data.generated_at || data.generatedAt || "",
      dashboardGenerated: data.dashboard_data_generated_at || "",
      aggregationGenerated: aggregationTime(data),
      latestCounted: latestCountedEventTime(data),
      latestRaw: latestRawEventTime(data),
      latestDiagnostic: latestDiagnosticEventTime(data),
      latestError: latestErrorEventTime(data),
      dataSource: data.status_data_source || data.data_source || "static_json",
      mode: data.status_data_mode || statusDataMode,
      script: "v1.0.0",
      schema: data.schema_version || data.schemaVersion || "",
      config: "v1.0.0",
      core: "v1.0.0",
      routes: rowsFrom(data, "routes").filter(function (row) { return rowVisits(row) > 0 || rowEvents(row) > 0; }).slice(0, 18),
      dashboards: derivePortfolio(data)
    };
  }

  function buildMatrix(rows, rowFn, colFn, valueFn, rowLimit, preferredCols, colLimit) {
    var rowTotals = {};
    var colTotals = {};
    var cells = {};
    (rows || []).forEach(function (row) {
      var rowKey = rowFn(row) || "unknown";
      var colKey = colFn(row) || "unknown";
      var value = number(valueFn(row));
      if (!value) return;
      rowTotals[rowKey] = (rowTotals[rowKey] || 0) + value;
      colTotals[colKey] = (colTotals[colKey] || 0) + value;
      cells[rowKey + "\u0000" + colKey] = (cells[rowKey + "\u0000" + colKey] || 0) + value;
    });
    var rowLabels = Object.keys(rowTotals).sort(function (a, b) { return rowTotals[b] - rowTotals[a]; }).slice(0, rowLimit || 8);
    var colLabels = preferredCols || Object.keys(colTotals).sort(function (a, b) { return colTotals[b] - colTotals[a]; }).slice(0, colLimit || 6);
    return { rows: rowLabels, cols: colLabels, cells: cells, rowTotals: rowTotals, total: sum(Object.keys(rowTotals).map(function (key) { return { visits: rowTotals[key] }; })) };
  }

  function renderMatrix(model) {
    if (!model.rows.length || !model.cols.length) return emptyState("Engin matrix gögn í payload.");
    var max = 1;
    model.rows.forEach(function (row) {
      model.cols.forEach(function (col) {
        max = Math.max(max, number(model.cells[row + "\u0000" + col]));
      });
    });
    var html = '<div class="matrix"><table class="matrix-table"><thead><tr><th>Vídd</th>' + model.cols.map(function (col) { return '<th>' + safe(col) + '</th>'; }).join("") + '</tr></thead><tbody>';
    model.rows.forEach(function (row) {
      html += '<tr><th scope="row">' + safe(row) + '<br><small>' + fmt(model.rowTotals[row]) + ' alls</small></th>';
      model.cols.forEach(function (col) {
        var value = number(model.cells[row + "\u0000" + col]);
        html += '<td class="matrix-cell"><i style="--value:' + safe(cssPct(value, max)) + '"></i><strong>' + fmt(value) + '</strong><br><small>' + safe(pct(value, model.rowTotals[row])) + '</small></td>';
      });
      html += '</tr>';
    });
    return html + '</tbody></table></div>';
  }

  function renderStatusNow(model) {
    var html = '<div class="grid-12"><article class="card verdict"><div class="card-body score-ring ' + safe(model.tone) + '" style="--score:' + safe(model.score.toFixed(0)) + '"><div><strong>' + fmt(model.score) + '</strong><span>stig</span></div></div><div class="card-body"><p class="card-kicker">Samsett rekstrarstaða</p><h3>' + safe(model.tone === "good" ? "Tracker lifir og gögn eru læsileg" : model.tone === "warn" ? "Tracker lifir með atriðum til skoðunar" : "Rekstrarmynd þarf athygli") + '</h3><p>' + safe(model.sentence) + '</p></div></article><div class="kpi-grid">';
    html += model.kpis.map(function (item) {
      return kpi(item.label, item.value, item.detail, item.tone);
    }).join("");
    html += '</div><div class="operational-line">' + safe(model.sentence) + '</div></div>';
    setHtml("status-now", html);
  }

  function renderCountingIntegrity(model) {
    var html = '<div class="process-rail">' + model.stages.map(function (stage) {
      return '<article class="process-step"><span>' + safe(stage.label) + '</span><strong>' + fmt(stage.value) + '</strong><div class="bar-track" aria-hidden="true"><span class="bar-fill ' + safe(stage.tone) + '" style="--value:' + safe(cssPct(stage.value, model.total)) + '"></span></div><small>' + safe(stage.detail) + '</small></article>';
    }).join("") + '</div><div class="reconcile-grid">';
    html += card("Samræming", "Hvað hækkar notkun", model.rows.slice(0, 3).map(function (row) { return metricRow(row[0], row[1], row[2]); }).join(""), chip("Hrá merki eru ekki notkun", "diagnostic"));
    html += card("Útilokun", "Hvað helst sér", model.rows.slice(3).map(function (row) { return metricRow(row[0], row[1], row[2]); }).join(""), chip("count_as_visit = FALSE er rekstrarmerki", "info"));
    html += '</div>';
    setHtml("counting-integrity", html);
  }

  function renderFlowSource(model) {
    var sourceBars = model.sourceGroups.slice(0, 5).map(function (row) {
      return barRow(labelSource(row.key), row.value, model.total, sourceTone(row.key));
    }).join("") || emptyState("Engin talin source gögn enn.");
    var layoutTotal = Math.max(sum(model.layout, function (row) { return row.value; }), model.total);
    var html = '<div class="flow-map">';
    html += '<article class="flow-stage"><h3>Uppruni</h3><strong>' + fmt(model.total) + '</strong><small class="subtle">Taldar opnanir eftir upprunarás.</small><div class="bar-list">' + sourceBars + '</div></article>';
    html += '<article class="flow-stage"><h3>Gátt</h3><strong>' + fmt(model.root.views || model.root.clicks || model.total) + '</strong><small class="subtle">Rótarsýn og smellir eru flæðimerki, ekki heimsóknir.</small>' + metricRow("Rótarsmellir", fmt(model.root.clicks), "Opinber inngangur") + '</article>';
    html += '<article class="flow-stage"><h3>Leiðing</h3><strong>' + fmt(model.root.arrivals || model.total) + '</strong><small class="subtle">Leiðing velur síma- eða tölvuútgáfu.</small>' + metricRow("Leiðingarkomur", fmt(model.root.arrivals), "Ef payload hefur rótargátt") + '</article>';
    html += '<article class="flow-stage"><h3>Útgáfuval</h3>' + stackedBar(model.layout, layoutTotal) + '</article>';
    html += '<article class="flow-stage"><h3>Talin Power BI opnun</h3><strong>' + fmt(model.total) + '</strong><small class="subtle">Production talning eftir síun.</small>' + metricRow("Fallback/error", fmt(model.fallback), "Hliðarrás til skoðunar") + '</article>';
    html += '</div>';
    setHtml("flow-source", html);
  }

  function renderPortfolio(rows) {
    if (!rows.length) {
      setHtml("portfolio", emptyState("Engin mælaborðsgögn í payload."));
      return;
    }
    var html = '<div class="portfolio-list">';
    rows.forEach(function (row, index) {
      var initials = row.title.split(/\s+/).map(function (part) { return part.charAt(0); }).join("").slice(0, 2).toUpperCase();
      var sourceStack = row.sourceRows.slice(0, 4).map(function (source) {
        return { label: labelSource(source.entry_source_category || source.utm_source), value: number(source.visits), tone: sourceTone(source.entry_source_category || source.utm_source) };
      });
      if (!sourceStack.length) sourceStack = [{ label: "Óþekkt", value: row.counted, tone: "diagnostic" }];
      html += '<article class="portfolio-row">';
      html += '<div class="portfolio-title"><span class="dashboard-mark">' + safe(initials || String(index + 1)) + '</span><div><strong>' + safe(row.title) + '</strong><small>' + safe(row.id) + '</small><div class="chip-row">' + chip(row.publicStatus, row.published ? "good" : "warn") + chip("Traust: " + row.confidence, "diagnostic") + '</div></div></div>';
      html += '<div>' + barRow("Hlutdeild", row.counted, row.total, "counted", pct(row.counted, row.total)) + metricRow("Í dag", fmt(row.today), "7d " + fmt(row.visits7d) + " · 30d " + fmt(row.visits30d)) + '</div>';
      html += '<div>' + stackedBar(sourceStack, row.sourceTotal || row.counted) + '<div class="chip-row offset">' + chip("Mobile " + pct(row.mobile, row.routeTotal), "counted") + chip("Desktop " + pct(row.desktop, row.routeTotal), "route") + '</div></div>';
      html += '<div class="portfolio-meta">' + chip(row.warnings + " viðv.", row.warnings ? "warn" : "good") + chip("Ferskleiki " + row.freshness.label, row.freshness.tone) + '</div>';
      html += '</article>';
    });
    html += '</div>';
    setHtml("portfolio", html);
  }

  function renderRouting(model) {
    var reasonBars = model.reasonGroups.map(function (row) {
      return barRow(labelReason(row.key), row.value, sum(model.reasonGroups, function (item) { return item.value; }), "route");
    }).join("") || emptyState("Engar leiðingarástæður í payload.");
    var anomalyHtml = model.anomalies.length ? model.anomalies.map(function (row) {
      return metricRow(labelReason(row.route_reason), fmt(rowVisits(row)), (row.route_reason_detail || row.selected_layout || "").slice(0, 120));
    }).join("") : metricRow("Engin sterk frávik", "0", "Þvingað val og diagnostic leiðingar eru róleg.");
    var html = '<div class="two-lane">';
    html += card("Fylki", "Mælaborð: leiðingarástæður x útgáfa", renderMatrix(model.reasonMatrix));
    html += card("Fylki", "Tæki x valin útgáfa", renderMatrix(model.deviceMatrix));
    html += card("Sjálfvirkt / þvingað", "Útgáfuval eftir leiðingu", stackedBar(model.decisionSplit, sum(model.decisionSplit, function (row) { return row.value; }) || 1), chip("Þvingað val er merki, ekki sjálfkrafa bilun", "info"));
    html += card("Leiðingarástæður", "Sterkustu leiðingarreglur", '<div class="bar-list">' + reasonBars + '</div>');
    html += card("Athuganir", "Þéttur frávikalisti", anomalyHtml);
    html += '</div>';
    setHtml("routing", html);
  }

  function renderEnvironmentDelivery(model) {
    var viewportTotal = sum(model.viewportBars, function (row) { return row.value; }) || 1;
    var transportTotal = sum(model.transport, function (row) { return row.value; }) || 1;
    var payloadTotal = sum(model.payload, function (row) { return row.value; }) || 1;
    var connectionTotal = sum(model.connection, function (row) { return row.value; }) || 1;
    var comboHtml = model.topCombos.map(function (row) {
      var label = [row.device_class || row.inferred_device_class, row.browser_family, row.os_family, row.viewport_bucket].filter(Boolean).join(" · ");
      return metricRow(dashboardTitle(row, {}), fmt(rowVisits(row)), label);
    }).join("") || emptyState("Engar samsetningar í payload.");
    var html = '<div class="two-lane">';
    html += '<div class="card"><div class="card-body"><p class="card-kicker">Tæki, vafri og skjár</p><h3>Umhverfismynstur</h3><p>Browser x OS, tæki x layout og viewport bucket eru lesin sem aggregate rekstrarsamhengi.</p>' + renderMatrix(model.browserOsMatrix) + '</div></div>';
    html += '<div class="card"><div class="card-body"><p class="card-kicker">Layout</p><h3>Tæki x valin útgáfa</h3>' + renderMatrix(model.deviceLayoutMatrix) + '<div class="chip-row offset">' + chip("Unsupported browser " + fmt(model.unsupported), model.unsupported ? "warn" : "good") + chip("In-app " + fmt(model.inApp), model.inApp ? "info" : "diagnostic") + chip("Forced-dark diagnostic " + fmt(model.forcedDark + model.samsung), model.forcedDark + model.samsung ? "info" : "diagnostic") + '</div></div></div>';
    html += '<div class="card"><div class="card-body"><p class="card-kicker">Viewport</p><h3>Skjábucketar</h3><div class="bar-list">' + model.viewportBars.map(function (row) { return barRow(row.key, row.value, viewportTotal, "info"); }).join("") + '</div></div></div>';
    html += '<div class="card"><div class="card-body"><p class="card-kicker">Samsetningar</p><h3>Top tæknilínur</h3>' + comboHtml + '</div></div>';
    html += '<div class="card"><div class="card-body"><p class="card-kicker">Sending</p><h3>Transport og payload</h3><div class="bar-list">' + model.transport.map(function (row) { return barRow(row.key, row.value, transportTotal, "counted"); }).join("") + '</div><div class="bar-list offset-large">' + model.payload.map(function (row) { return barRow(row.key, row.value, payloadTotal, "route"); }).join("") + '</div></div></div>';
    html += '<div class="card"><div class="card-body"><p class="card-kicker">Netmerki</p><h3>Afhendingarheilsa</h3><div class="bar-list">' + model.connection.map(function (row) { return barRow(row.key, row.value, connectionTotal, "info"); }).join("") + '</div><div class="chip-row offset">' + chip("Fallback " + fmt(model.fallback), model.fallback ? "warn" : "good") + chip("Safe fallback " + fmt(model.safeFallback), model.safeFallback ? "warn" : "good") + chip("Síðasta villa " + dateShort(model.lastError), model.lastError ? "warn" : "diagnostic") + '</div></div></div>';
    html += '</div>';
    setHtml("environment-delivery", html);
  }

  function renderQualityQueue(model) {
    var html = '<div class="queue">';
    html += '<div class="grid-12"><div class="card span-6"><div class="card-body"><p class="card-kicker">Framleiðsluröð</p><h3>' + safe(model.confirmed.length ? fmt(model.confirmed.length) + " staðfest merki" : "Engin staðfest framleiðslumerki") + '</h3><p>' + safe(model.confirmed.length ? "Raðað eftir alvarleika, töldum áhrifum og trausti." : "Greiningarmerki eru samt sýnd neðar sem samhengi.") + '</p></div></div><div class="card span-6"><div class="card-body"><p class="card-kicker">Greiningarsamhengi</p><h3>' + fmt(model.diagnostic.length) + ' merki</h3><p>Óstaðfest merki líta ekki út eins og staðfest framleiðsluvilla.</p></div></div></div>';
    html += '<div class="queue-list offset-large">';
    if (!model.confirmed.length && !model.diagnostic.length) {
      html += emptyState("Engin gæðamerki í payload.");
    }
    model.confirmed.forEach(function (row) {
      html += warningItem(row, "confirmed");
    });
    model.diagnostic.forEach(function (row) {
      html += warningItem(row, "diagnostic");
    });
    html += '</div></div>';
    setHtml("quality-queue", html);
  }

  function warningItem(row, group) {
    var counted = number(row.counted_count || row.confirmed_count);
    var diagnostic = number(row.diagnostic_count);
    var tone = group === "confirmed" ? (severityWeight(row) >= 3 ? "bad" : "confirmed") : "diagnostic";
    var target = row.dashboard_key || row.dashboard_id || "all";
    return '<article class="queue-item ' + safe(tone) + '"><span class="queue-rail" aria-hidden="true"></span><div><small>' + safe(group === "confirmed" ? "Staðfest framleiðslumerki" : "Greiningarsamhengi") + '</small><h3>' + safe(String(row.warning_code || row.code || "warning").replace(/_/g, " ")) + '</h3><p>' + safe(row.warning_text || row.message || "-") + '</p><div class="queue-action"><strong>Næsta skref:</strong> ' + safe(row.recommendation || (group === "confirmed" ? "Staðfesta áhrif í viðkomandi vafra/tæki og prófa studdan Power BI vafra." : "Halda sem greiningarmerki þar til talningargrunnur staðfestir framleiðsluáhrif.")) + '</div><div class="chip-row offset">' + chip(target, "diagnostic") + chip("Traust: " + (row.confidence_band || "unknown"), "diagnostic") + chip(row.signal_quality || "signal", "info") + '</div></div><div class="queue-count"><strong>' + fmt(counted) + '</strong><span>Talið</span><small>grein. ' + fmt(diagnostic) + '</small></div></article>';
  }

  function renderAuditEvidence(model) {
    var evidence = [
      ["Birting", dateShort(model.generated), "generated_at"],
      ["Mælaborðsgögn", dateShort(model.dashboardGenerated), "dashboard_data_generated_at"],
      ["Samantekt", dateShort(model.aggregationGenerated), "aggregation_generated_at"],
      ["Síðast talið", dateShort(model.latestCounted), "last counted event"],
      ["Síðasta hrámerki", dateShort(model.latestRaw), "last raw event"],
      ["Síðasta greining", dateShort(model.latestDiagnostic), "last diagnostic event"],
      ["Síðasta villa", dateShort(model.latestError), "last error event"]
    ];
    var html = '<div class="audit-grid">';
    html += card("Ferskleiki", "Tímalína gagna", evidence.map(function (row) { return metricRow(row[0], row[1], row[2]); }).join(""));
    html += card("Útgáfur", "Source og schema", [
      metricRow("Gagnahamur", model.mode, "raun/prufa val"),
      metricRow("Gagnaheimild", model.dataSource, "static JSON eða JSONP varaleið"),
      metricRow("Script", model.script || "-", "Atburðasafnari"),
      metricRow("Schema", model.schema || "-", "Gagnasnið"),
      metricRow("Config", model.config || "-", "router config"),
      metricRow("Core", model.core || "-", "router core")
    ].join(""));
    html += '</div>';
    html += '<div class="audit-grid">';
    html += '<div>' + routeAuditTable(model.routes) + '</div>';
    html += '<div>' + dashboardPassportEvidence(model.dashboards) + '</div>';
    html += '</div>';
    setHtml("audit-evidence", html);
  }

  function routeAuditTable(rows) {
    if (!rows.length) return card("Leiðingarskoðun", "Engin leiðingargögn", emptyState("Engar leiðingarlínur í samantekt."));
    var html = '<div class="audit-table-wrap"><table class="audit-table"><thead><tr><th>Mælaborð</th><th>Leiðingarregla</th><th>Layout</th><th>Forced</th><th>Taldar</th></tr></thead><tbody>';
    rows.forEach(function (row) {
      html += '<tr><td>' + safe(cleanName(row.dashboard_name || dashboardKey(row))) + '</td><td>' + safe(labelReason(row.route_reason)) + '<br><small>' + safe(row.route_reason_detail || "") + '</small></td><td>' + safe(labelLayout(row.selected_layout)) + '</td><td>' + safe(labelLayout(row.forced_layout || "auto")) + '</td><td>' + fmt(rowVisits(row)) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    return card("Leiðingarskoðun", "Leiðingarskrá", html, chip("Aðeins samantekt", "good"));
  }

  function dashboardPassportEvidence(rows) {
    if (!rows.length) return card("Mælaborðspassi", "Engin passport gögn", emptyState("Engin dashboard evidence."));
    var html = '<div class="bar-list">';
    rows.forEach(function (row) {
      html += metricRow(row.title, fmt(row.counted), "Ferskleiki " + row.freshness.label + " · " + row.publicStatus + " · " + row.confidence);
    });
    html += '</div>';
    return card("Mælaborðspassi", "Compact evidence", html, chip("Nánari evidence neðar en rekstrarsaga", "diagnostic"));
  }

  function sectionError(id, title, error) {
    setHtml(id, '<div class="empty-state"><strong>' + safe(title) + ' birtist ekki.</strong><br>' + safe(error && error.message ? error.message : error) + '</div>');
  }

  function safeRender(id, title, fn) {
    try {
      fn();
    } catch (error) {
      sectionError(id, title, error);
    }
  }

  function render(data) {
    updateCommandRail(data);
    safeRender("status-now", "Staða núna", function () { renderStatusNow(deriveStatusNow(data)); });
    safeRender("counting-integrity", "Talning og traust", function () { renderCountingIntegrity(deriveCountingIntegrity(data)); });
    safeRender("flow-source", "Flæði og uppruni", function () { renderFlowSource(deriveFlowSource(data)); });
    safeRender("portfolio", "Mælaborðasafn", function () { renderPortfolio(derivePortfolio(data)); });
    safeRender("routing", "Leiðingarskipting", function () { renderRouting(deriveRouting(data)); });
    safeRender("environment-delivery", "Umhverfi og afhending", function () { renderEnvironmentDelivery(deriveEnvironment(data)); });
    safeRender("quality-queue", "Gæðavakt", function () { renderQualityQueue(deriveQualityQueue(data)); });
    safeRender("audit-evidence", "Sönnunargögn", function () { renderAuditEvidence(deriveAuditEvidence(data)); });
  }

  function updateCommandRail(data) {
    var model = data ? opsModel(data) : null;
    var dot = byId("health-dot");
    var badge = byId("health-badge");
    if (dot) dot.className = "dot " + (!data || model && model.tone === "bad" ? "bad" : model && model.tone === "warn" ? "warn" : "");
    if (badge) badge.className = "badge " + (!data || model && model.tone === "bad" ? "bad" : model && model.tone === "warn" ? "warn" : "good");
    setText("health-text", data ? (data.sample_data || data.status_data_mode === "sample" ? "Prufugögn" : model && model.confirmedWarnings ? "Staðfest merki" : "Staða í lagi") : "Villa");
    setText("generated-pill", "Uppfært: " + (data ? dateShort(data.generated_at || data.generatedAt) : "-"));
    setText("source-pill", "Gögn: " + (data ? (data.status_data_source || data.data_source || "static_json") : "-"));
    setHtml("version-strip", STATUS_COMPONENTS.map(function (item) { return chip(item, item === "Aðeins samantektargögn" ? "good" : "diagnostic"); }).join(""));
    if (data) {
      document.documentElement.setAttribute("data-status-source", data.status_data_source || data.data_source || "");
      document.documentElement.setAttribute("data-status-mode", data.status_data_mode || statusDataMode);
      document.documentElement.setAttribute("data-status-generated-at", data.generated_at || data.generatedAt || "");
    }
  }

  function setStatusError(message) {
    updateCommandRail(null);
    showNotice(message, "bad");
  }

  function readDataModeFromUrl() {
    try {
      return new URL(window.location.href).searchParams.get("data") === "sample" ? "sample" : "real";
    } catch (error) {
      return "real";
    }
  }

  function updateDataSourceToggle() {
    var controls = document.querySelectorAll("[data-source-mode]");
    controls.forEach(function (control) {
      var active = control.getAttribute("data-source-mode") === statusDataMode;
      control.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setDataMode(mode, updateUrl) {
    statusDataMode = mode === "sample" ? "sample" : "real";
    if (updateUrl && window.history && window.history.replaceState) {
      try {
        var url = new URL(window.location.href);
        if (statusDataMode === "sample") url.searchParams.set("data", "sample");
        else url.searchParams.delete("data");
        window.history.replaceState(null, "", url.toString());
      } catch (error) {}
    }
    updateDataSourceToggle();
  }

  function setupDataSourceToggle() {
    document.querySelectorAll("[data-source-mode]").forEach(function (control) {
      control.addEventListener("click", function () {
        setDataMode(control.getAttribute("data-source-mode"), true);
        loadData();
      });
    });
    updateDataSourceToggle();
  }

  function showNotice(message, tone) {
    var notice = byId("notice");
    if (!notice) return;
    if (!message) {
      notice.className = "notice";
      notice.textContent = "";
      return;
    }
    notice.textContent = message;
    notice.className = "notice show " + (tone || "info");
  }

  function loadStaticJson(url) {
    if (!window.fetch) return Promise.reject(new Error("fetch unavailable"));
    return window.fetch(url + "?v=" + Date.now(), {
      cache: "no-store",
      credentials: "omit"
    }).then(function (response) {
      if (!response.ok) throw new Error("Static status HTTP " + response.status);
      return response.json();
    }).then(function (data) {
      if (!data || data.ok === false) throw new Error("Static status payload invalid");
      return data;
    });
  }

  function sheetCellValue(cells, index) {
    var cell = cells && cells[index];
    if (!cell) return "";
    return cell.v != null ? cell.v : (cell.f != null ? cell.f : "");
  }

  function extractSampleSheetPayload(response) {
    if (!response || response.status !== "ok" || !response.table || !Array.isArray(response.table.rows)) {
      throw new Error("Sample sheet response invalid");
    }
    var chunks = response.table.rows.map(function (row) {
      var cells = row.c || [];
      return {
        index: Number(sheetCellValue(cells, 1)),
        count: Number(sheetCellValue(cells, 2)),
        text: String(sheetCellValue(cells, 3) || "")
      };
    }).filter(function (chunk) {
      return chunk.index > 0 && chunk.text;
    }).sort(function (a, b) {
      return a.index - b.index;
    });
    if (!chunks.length) throw new Error("Sample sheet has no JSON chunks");
    var expected = chunks[0].count || chunks.length;
    if (chunks.length < expected) throw new Error("Sample sheet JSON chunks incomplete");
    var data = JSON.parse(chunks.slice(0, expected).map(function (chunk) { return chunk.text; }).join(""));
    if (!data || data.ok === false) throw new Error("Sample sheet payload invalid");
    data.sample_data = true;
    return data;
  }

  function loadPublicSampleSheet() {
    return new Promise(function (resolve, reject) {
      var callbackName = "__LSP_SAMPLE_" + Date.now() + "_" + Math.random().toString(16).slice(2);
      var script = document.createElement("script");
      var timeout;
      script.async = true;
      function cleanup() {
        window.clearTimeout(timeout);
        try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      timeout = window.setTimeout(function () {
        cleanup();
        reject(new Error("Sample sheet timed out"));
      }, STATUS_DATA_TIMEOUT_MS);
      window[callbackName] = function (response) {
        try {
          var data = extractSampleSheetPayload(response);
          cleanup();
          resolve(data);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
      script.onerror = function () {
        cleanup();
        reject(new Error("Sample sheet JSONP failed"));
      };
      script.src = SAMPLE_SHEET_JSONP_URL + encodeURIComponent(callbackName) + "&v=" + Date.now();
      document.body.appendChild(script);
    });
  }

  function loadSampleData() {
    return loadPublicSampleSheet().then(function (data) {
      return { data: data, source: "sample_sheet", message: "" };
    }).catch(function () {
      return loadStaticJson(SAMPLE_STATUS_URL).then(function (data) {
        data.sample_data = true;
        return { data: data, source: "sample_json", message: "Sample sheet svaraði ekki; sýni staðbundið sample snapshot." };
      });
    });
  }

  function loadAppsScriptFallback(staticError) {
    return new Promise(function (resolve, reject) {
      var attempt = 1;
      function request() {
        var callbackName = "__LSP_STATUS_" + Date.now() + "_" + Math.random().toString(16).slice(2);
        var script = document.createElement("script");
        var timeout;
        script.async = true;
        function cleanup(keepLateCallback) {
          window.clearTimeout(timeout);
          if (keepLateCallback) {
            window[callbackName] = function () {};
            window.setTimeout(function () {
              try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
            }, 60000);
          } else {
            try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
          }
          if (script.parentNode) script.parentNode.removeChild(script);
        }
        function retryOrFail(message) {
          cleanup(true);
          if (attempt < STATUS_DATA_MAX_ATTEMPTS) {
            showNotice("Apps Script svaraði hægt. Reyni aftur " + (attempt + 1) + "/" + STATUS_DATA_MAX_ATTEMPTS + ".", "warn");
            attempt += 1;
            window.setTimeout(request, STATUS_DATA_RETRY_DELAY_MS);
            return;
          }
          reject(new Error(message + (staticError ? " Static JSON: " + staticError : "")));
        }
        timeout = window.setTimeout(function () {
          retryOrFail("Apps Script endpoint svaraði ekki innan " + Math.round(STATUS_DATA_TIMEOUT_MS / 1000) + " sekúndna eftir " + STATUS_DATA_MAX_ATTEMPTS + " tilraunir.");
        }, STATUS_DATA_TIMEOUT_MS);
        window[callbackName] = function (data) {
          cleanup(false);
          resolve(data);
        };
        script.onerror = function () {
          retryOrFail("Náði ekki að hlaða JSONP frá Apps Script endpointi eftir " + STATUS_DATA_MAX_ATTEMPTS + " tilraunir.");
        };
        script.src = DATA_ENDPOINT + (DATA_ENDPOINT.indexOf("?") >= 0 ? "&" : "?") + "api=dashboard&format=js&callback=" + encodeURIComponent(callbackName) + "&v=" + Date.now();
        document.body.appendChild(script);
      }
      request();
    });
  }

  function acceptData(data, source, mode, fallbackMessage) {
    if (!data || data.ok === false) throw new Error("Invalid status payload");
    data.status_data_source = source;
    data.status_data_mode = mode;
    window.LSP_STATUS_DATA_SOURCE = source;
    window.LSP_STATUS_DATA_MODE = mode;
    window.LSP_STATUS_GENERATED_AT = data.generatedAt || data.generated_at || "";
    updateDataSourceToggle();
    if (fallbackMessage) showNotice(fallbackMessage, "warn");
    else showNotice("", "info");
    render(data);
  }

  function loadData() {
    var btn = byId("refresh-button");
    var sequence = ++statusLoadSequence;
    var mode = statusDataMode;
    if (btn) btn.classList.add("loading");
    function finishLoading() {
      if (btn) btn.classList.remove("loading");
    }
    function current() {
      return sequence === statusLoadSequence;
    }
    function useStaticSnapshotFallback(liveError) {
      loadStaticJson(STATIC_STATUS_URL).then(function (data) {
        if (!current()) return;
        var staleMessage = staleStaticStatusMessage(data);
        var message = staleMessage
          ? "Apps Script svaraði ekki; sýni úrelt static snapshot. " + staleMessage
          : "Apps Script svaraði ekki; sýni síðasta static snapshot.";
        finishLoading();
        acceptData(data, staleMessage ? "static_json_stale" : "static_json", mode, message);
      }).catch(function (staticError) {
        if (!current()) return;
        finishLoading();
        setStatusError("Náði ekki að hlaða Raun gögnum úr Apps Script né static snapshot: Apps Script: " + liveError + ". Static: " + (staticError && staticError.message ? staticError.message : "unknown error"));
      });
    }
    if (mode === "sample") {
      showNotice("Sæki sample gögn úr opinberu Google Sheet.", "info");
      loadSampleData().then(function (result) {
        if (!current()) return;
        finishLoading();
        acceptData(result.data, result.source, mode, result.message);
      }).catch(function (error) {
        if (!current()) return;
        finishLoading();
        setStatusError("Náði ekki að hlaða sample gögnum: " + (error && error.message ? error.message : "unknown error"));
      });
      return;
    }
    showNotice("Sæki Raun gögn úr Apps Script.", "info");
    loadAppsScriptFallback("").then(function (data) {
      if (!current()) return;
      finishLoading();
      acceptData(data, "apps_script_live", mode, "");
    }).catch(function (error) {
      if (!current()) return;
      useStaticSnapshotFallback(error && error.message ? error.message : "apps_script_failed");
    });
  }

  setupDataSourceToggle();
  updateCommandRail(null);
  var refresh = byId("refresh-button");
  if (refresh) refresh.addEventListener("click", loadData);
  loadData();
  window.setInterval(loadData, STATUS_REFRESH_INTERVAL_MS);
}());
