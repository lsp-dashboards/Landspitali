(function () {
  "use strict";

  var config = window.LSP_STATUS_CONFIG || {};
  var sampleData = window.LSP_STATUS_SAMPLE_DATA || null;
  var currentData = null;

  function $(id) {
    return document.getElementById(id);
  }

  function text(id, value) {
    var el = $(id);
    if (el) el.textContent = value == null || value === "" ? "-" : String(value);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function number(value) {
    value = Number(value || 0);
    return isFinite(value) ? value : 0;
  }

  function fmt(value) {
    return number(value).toLocaleString("is-IS");
  }

  function pct(numerator, denominator) {
    numerator = number(numerator);
    denominator = number(denominator);
    if (!denominator) return "0%";
    return Math.round((numerator / denominator) * 100) + "%";
  }

  function safeImageUrl(url) {
    var allowed = config.allowedImageHosts || ["images.ctfassets.net"];
    var parsed;
    try {
      parsed = new URL(url, window.location.href);
      if (parsed.protocol !== "https:") return "";
      if (allowed.indexOf(parsed.hostname) === -1) return "";
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  function addQuery(url, params) {
    var parsed = new URL(url, window.location.href);
    Object.keys(params).forEach(function (key) {
      parsed.searchParams.set(key, params[key]);
    });
    return parsed.href;
  }

  function showNotice(message) {
    var notice = $("notice");
    if (!notice) return;
    if (!message) {
      notice.hidden = true;
      notice.textContent = "";
      return;
    }
    notice.textContent = message;
    notice.hidden = false;
  }

  function setHealth(status) {
    var pill = $("health-pill");
    if (!pill) return;
    status = status || "unknown";
    pill.className = "status-pill " + status;
    if (status === "ok") pill.textContent = "Staða: í lagi";
    else if (status === "sample") pill.textContent = "Sýnidæmi";
    else if (status === "warning") pill.textContent = "Viðvörun";
    else if (status === "error") pill.textContent = "Villa";
    else pill.textContent = "Óþekkt staða";
  }

  function loadJsonp(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var callbackName = "__lspStatusCb" + Date.now() + Math.random().toString(16).slice(2);
      var script = document.createElement("script");
      var timeout = window.setTimeout(function () {
        cleanup();
        reject(new Error("Dashboard data request timed out"));
      }, timeoutMs || 8000);

      function cleanup() {
        window.clearTimeout(timeout);
        try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[callbackName] = function (data) {
        cleanup();
        resolve(data);
      };

      script.onerror = function () {
        cleanup();
        reject(new Error("Dashboard data script failed to load"));
      };

      script.src = addQuery(url, {
        api: config.api || "dashboard",
        format: config.format || "js",
        callback: callbackName,
        cache_bust: String(Date.now())
      });
      document.head.appendChild(script);
    });
  }

  function loadData() {
    setHealth("unknown");
    if (!config.dataEndpoint) {
      return Promise.reject(new Error("No data endpoint configured"));
    }
    return loadJsonp(config.dataEndpoint);
  }

  function renderKpis(data) {
    var kpis = data.kpis || {};
    var total = number(kpis.total_visits || kpis.visits_30d);
    var items = [
      ["Heimsóknir í dag", kpis.visits_today, "Taldar raunheimsóknir"],
      ["Síðustu 7 dagar", kpis.visits_7d, "Á öllum virkum mælaborðum"],
      ["Síðustu 30 dagar", kpis.visits_30d, "Langtímasýn"],
      ["Mælaborð", kpis.active_dashboards, "Virk í registry"],
      ["Valin útgáfa", pct(kpis.mobile_visits, total) + " mobile", "Mobile hlutfall"],
      ["Fallback / villur", kpis.fallback_error_count, "Smellir og villur"],
      ["Prófanir og debug", kpis.bot_debug_test_count, "Telst ekki sem raunnotkun"],
      ["Smellir frá island.is", pct(kpis.island_is_visits, total), "Hlutfall af talinni notkun"]
    ];
    var html = items.map(function (item) {
      return "<article class=\"kpi\"><span>" + escapeHtml(item[0]) + "</span><strong>" + escapeHtml(fmtOrText(item[1])) + "</strong><small>" + escapeHtml(item[2]) + "</small></article>";
    }).join("");
    $("kpi-grid").innerHTML = html;
  }

  function fmtOrText(value) {
    if (typeof value === "string" && /%/.test(value)) return value;
    return fmt(value);
  }

  function table(id, headers, rows) {
    var html = "<thead><tr>" + headers.map(function (h) { return "<th>" + escapeHtml(h[0]) + "</th>"; }).join("") + "</tr></thead><tbody>";
    html += rows.map(function (row) {
      return "<tr>" + headers.map(function (h) {
        var value = typeof h[1] === "function" ? h[1](row) : row[h[1]];
        var cls = h[2] || "";
        return "<td" + (cls ? " class=\"" + cls + "\"" : "") + ">" + value + "</td>";
      }).join("") + "</tr>";
    }).join("");
    html += "</tbody>";
    $(id).innerHTML = html;
  }

  function renderDashboards(data) {
    var publicCards = {};
    (data.public_cards || []).forEach(function (card) { publicCards[card.dashboard_key] = card; });
    var rows = (data.dashboards || []).slice().sort(function (a, b) { return number(b.visits_30d) - number(a.visits_30d); });
    table("dashboard-table", [
      ["Mælaborð", function (row) {
        var card = publicCards[row.dashboard_key] || {};
        var img = safeImageUrl(card.icon_url) ? "<img src=\"" + escapeHtml(safeImageUrl(card.icon_url)) + "\" alt=\"\">" : "";
        return "<div class=\"card-cell\">" + img + "<span><strong>" + escapeHtml(row.public_card_title || row.dashboard_name || row.dashboard_key) + "</strong><small>" + escapeHtml(row.dashboard_id || row.dashboard_key) + "</small></span></div>";
      }],
      ["Í dag", function (row) { return fmt(row.visits_today); }, "number"],
      ["7 dagar", function (row) { return fmt(row.visits_7d); }, "number"],
      ["30 dagar", function (row) { return fmt(row.visits_30d); }, "number"],
      ["Mobile", function (row) { return pct(row.mobile_visits, row.total_visits); }, "number"],
      ["island.is", function (row) { return pct(row.island_is_visits, row.total_visits); }, "number"],
      ["Fallback", function (row) { return fmt(row.fallback_clicks); }, "number"],
      ["Viðvaranir", function (row) { return row.warning_count > 0 ? "<span class=\"badge warning\">" + fmt(row.warning_count) + "</span>" : "<span class=\"badge ok\">0</span>"; }]
    ], rows);
  }

  function renderPublicCards(data) {
    var rows = data.public_cards || [];
    table("public-card-table", [
      ["Kort", function (row) {
        var img = safeImageUrl(row.icon_url) ? "<img src=\"" + escapeHtml(safeImageUrl(row.icon_url)) + "\" alt=\"\">" : "";
        return "<div class=\"card-cell\">" + img + "<span><strong>" + escapeHtml(row.public_card_title) + "</strong><small>" + escapeHtml(row.public_description) + "</small></span></div>";
      }],
      ["Takki", function (row) { return escapeHtml(row.button_text); }],
      ["Staða", function (row) { return row.published ? "<span class=\"badge ok\">birt</span>" : "<span class=\"badge warning\">ekki birt</span>"; }],
      ["Síðast staðfest", function (row) { return escapeHtml(row.last_verified_date || "-"); }]
    ], rows);
  }

  function groupSum(rows, keyField, valueField) {
    var result = {};
    rows.forEach(function (row) {
      var key = row[keyField] || "unknown";
      result[key] = (result[key] || 0) + number(row[valueField]);
    });
    return Object.keys(result).map(function (key) { return { key: key, value: result[key] }; }).sort(function (a, b) { return a.key.localeCompare(b.key); });
  }

  function renderBars(id, rows, keyField, valueField, limit) {
    rows = groupSum(rows || [], keyField, valueField).slice(-limit);
    var max = rows.reduce(function (m, row) { return Math.max(m, row.value); }, 0) || 1;
    $(id).innerHTML = rows.map(function (row) {
      var width = Math.round((row.value / max) * 100);
      return "<div class=\"bar-row\"><span>" + escapeHtml(row.key) + "</span><div class=\"bar-track\"><div class=\"bar-fill\" style=\"width:" + width + "%\"></div></div><strong>" + fmt(row.value) + "</strong></div>";
    }).join("") || "<p class=\"muted\">Engin gögn.</p>";
  }

  function renderDeviceSourceRoute(data) {
    table("device-table", [
      ["Tæki", function (row) { return escapeHtml(row.device_class); }],
      ["Útgáfa", function (row) { return escapeHtml(row.selected_layout); }],
      ["Vafri", function (row) { return escapeHtml(row.browser_family); }],
      ["Stýrikerfi", function (row) { return escapeHtml(row.os_family); }],
      ["Heimsóknir", function (row) { return fmt(row.visits); }, "number"]
    ], (data.device || []).slice().sort(function (a, b) { return number(b.visits) - number(a.visits); }).slice(0, 12));

    table("source-table", [
      ["Uppruni", function (row) { return escapeHtml(row.entry_source_category); }],
      ["UTM source", function (row) { return escapeHtml(row.utm_source || "-"); }],
      ["Herferð", function (row) { return escapeHtml(row.utm_campaign || "-"); }],
      ["Content", function (row) { return escapeHtml(row.utm_content || "-"); }],
      ["Heimsóknir", function (row) { return fmt(row.visits); }, "number"]
    ], (data.sources || []).slice().sort(function (a, b) { return number(b.visits) - number(a.visits); }).slice(0, 12));

    table("route-table", [
      ["Ástæða", function (row) { return escapeHtml(row.route_reason); }],
      ["Útgáfa", function (row) { return escapeHtml(row.selected_layout); }],
      ["Þvingun", function (row) { return escapeHtml(row.forced_layout); }],
      ["Heimsóknir", function (row) { return fmt(row.visits); }, "number"],
      ["Atburðir", function (row) { return fmt(row.events); }, "number"]
    ], (data.routes || []).slice().sort(function (a, b) { return number(b.events) - number(a.events); }).slice(0, 12));
  }

  function renderWarnings(data) {
    var warnings = data.quality_warnings || [];
    var html = warnings.map(function (warning) {
      return "<div class=\"warning-item\"><strong>" + escapeHtml(warning.warning_code || "warning") + "</strong><span>" + escapeHtml(warning.warning_text || "") + "</span><small> " + escapeHtml(warning.dashboard_key || "") + " · " + escapeHtml(warning.last_seen || "") + "</small></div>";
    }).join("");
    if (!html) html = "<div class=\"warning-item\"><strong>Engar virkar viðvaranir</strong><span>Kerfið sér engin frávik í síðustu samantekt.</span></div>";
    $("warnings-panel").innerHTML = html;
  }

  function renderQuestions(data) {
    var questions = data.questions || [];
    $("questions-list").innerHTML = questions.map(function (q) { return "<li>" + escapeHtml(q) + "</li>"; }).join("");
  }

  function render(data, source) {
    currentData = data;
    text("generated-at", data.generated_at);
    text("last-event-time", data.health && data.health.last_event_time);
    text("last-aggregation-time", data.health && data.health.last_aggregation_time);
    text("config-version", data.config_version);
    setHealth(source === "sample" ? "sample" : ((data.health && data.health.status) || "ok"));
    if (source === "sample") showNotice("Sýnidæmi er birt vegna þess að lifandi aggregate gögn náðust ekki. Þetta er ekki raunnotkun.");
    else showNotice("");
    renderKpis(data);
    renderDashboards(data);
    renderPublicCards(data);
    renderBars("daily-bars", data.daily, "date", "visits", 14);
    renderBars("hourly-bars", data.hourly, "hour_utc", "visits", 12);
    renderDeviceSourceRoute(data);
    renderWarnings(data);
    renderQuestions(data);
  }

  function refresh() {
    loadData().then(function (data) {
      render(data, "live");
    }).catch(function (error) {
      if (config.allowSampleDataFallback && sampleData) {
        render(sampleData, "sample");
      } else {
        setHealth("error");
        showNotice("Náði ekki að sækja aggregate gögn: " + error.message);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = $("refresh-button");
    if (button) button.addEventListener("click", refresh);
    refresh();
    if (config.refreshMinutes) {
      window.setInterval(refresh, Number(config.refreshMinutes) * 60 * 1000);
    }
  });
}());
