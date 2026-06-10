(function (window, document) {
  "use strict";

  var CORE_VERSION = "2026-06-07-core-1-hotfix-1.2.2";
  var started = false;
  var sequence = 0;
  var requestId = makeRequestId();

  window.LSP_ROUTER_STARTED = false;
  window.LSP_ROUTER_CORE_VERSION = CORE_VERSION;

  function isObject(value) {
    return !!value && Object.prototype.toString.call(value) === "[object Object]";
  }

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return null;
    }
  }

  function trim(value) {
    return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
  }

  function limit(value, max) {
    value = trim(value).replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ");
    if (value.length > max) {
      return value.slice(0, max);
    }
    return value;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function makeRequestId() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "req-" + String(Date.now()) + "-" + Math.random().toString(16).slice(2);
  }

  function nextEventId() {
    sequence += 1;
    return requestId + "-" + String(sequence);
  }

  function getUserAgent() {
    return navigator.userAgent || navigator.vendor || window.opera || "";
  }

  function getViewportWidth() {
    var width = window.innerWidth || 0;
    var docWidth = 0;
    if (document.documentElement && document.documentElement.clientWidth) {
      docWidth = document.documentElement.clientWidth;
    }
    if (width && docWidth) {
      return Math.min(width, docWidth);
    }
    return width || docWidth || (window.screen ? screen.width : 1024) || 1024;
  }

  function getViewportHeight() {
    var height = window.innerHeight || 0;
    var docHeight = 0;
    if (document.documentElement && document.documentElement.clientHeight) {
      docHeight = document.documentElement.clientHeight;
    }
    if (height && docHeight) {
      return Math.min(height, docHeight);
    }
    return height || docHeight || (window.screen ? screen.height : 768) || 768;
  }

  function hasTouch() {
    return !!("ontouchstart" in window) || ((navigator.maxTouchPoints || 0) > 0);
  }

  function getQuery() {
    return window.location.search || "";
  }

  function getParams() {
    var query = getQuery();
    var params = {};
    var parts;
    var i;
    var pair;
    var key;
    var value;

    if (window.URLSearchParams) {
      new URLSearchParams(query).forEach(function (paramValue, paramKey) {
        params[paramKey.toLowerCase()] = paramValue;
      });
      return params;
    }

    if (query.charAt(0) === "?") {
      query = query.slice(1);
    }
    if (!query) {
      return params;
    }

    parts = query.split("&");
    for (i = 0; i < parts.length; i += 1) {
      pair = parts[i].split("=");
      key = decodeURIComponent((pair[0] || "").replace(/\+/g, " ")).toLowerCase();
      value = decodeURIComponent((pair[1] || "").replace(/\+/g, " "));
      if (key) {
        params[key] = value;
      }
    }
    return params;
  }

  function getQueryValue(names) {
    var params = getParams();
    var list = Array.isArray(names) ? names : [names];
    var i;
    var key;
    for (i = 0; i < list.length; i += 1) {
      key = String(list[i]).toLowerCase();
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        return trim(params[key]);
      }
    }
    return "";
  }

  function hasQueryFlag(names) {
    var params = getParams();
    var list = Array.isArray(names) ? names : [names];
    var i;
    var key;
    var value;
    for (i = 0; i < list.length; i += 1) {
      key = String(list[i]).toLowerCase();
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        value = trim(params[key]).toLowerCase();
        return value === "" || value === "1" || value === "true" || value === "yes";
      }
    }
    return false;
  }

  function getAllowedQueryParams(config) {
    var params = getParams();
    var allowed = (config.tracking && config.tracking.allowedQueryParams) || [];
    var result = {};
    var i;
    var key;
    var value;
    for (i = 0; i < allowed.length; i += 1) {
      key = String(allowed[i]).toLowerCase();
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        value = limit(params[key], 120);
        if (value) {
          result[key] = value;
        }
      }
    }
    return result;
  }

  function getHostname(url) {
    var anchor;
    if (!url) {
      return "";
    }
    try {
      anchor = document.createElement("a");
      anchor.href = url;
      return (anchor.hostname || "").toLowerCase();
    } catch (error) {
      return "";
    }
  }

  function getPathFromUrl(url) {
    var anchor;
    if (!url) {
      return "";
    }
    try {
      anchor = document.createElement("a");
      anchor.href = url;
      return anchor.pathname || "/";
    } catch (error) {
      return "";
    }
  }

  function sameDomainOrSubdomain(hostname, domains) {
    var i;
    var domain;
    hostname = String(hostname || "").toLowerCase();
    for (i = 0; i < (domains || []).length; i += 1) {
      domain = String(domains[i] || "").toLowerCase();
      if (hostname === domain || hostname.slice(-(domain.length + 1)) === "." + domain) {
        return true;
      }
    }
    return false;
  }

  function isPowerBiPublishUrl(url) {
    var host = getHostname(url);
    return /^https:\/\//i.test(url || "") && host === "app.powerbi.com" && /\/view\?/i.test(url || "");
  }

  function isHttpsUrl(url) {
    return /^https:\/\//i.test(url || "");
  }

  function getBrowserFamily() {
    var ua = getUserAgent();
    if (/Edg\//i.test(ua)) return "Edge";
    if (/OPR\/|Opera/i.test(ua)) return "Opera";
    if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
    if (/Chrome\/|CriOS/i.test(ua)) return "Chrome";
    if (/Firefox\/|FxiOS/i.test(ua)) return "Firefox";
    if (/Safari\//i.test(ua) && !/Chrome\/|CriOS|Chromium/i.test(ua)) return "Safari";
    if (/MSIE|Trident/i.test(ua)) return "Internet Explorer";
    return "Other";
  }

  function getBrowserMajorVersion() {
    var ua = getUserAgent();
    var match = /(Edg|Chrome|CriOS|Firefox|FxiOS|Version|SamsungBrowser)\/(\d+)/i.exec(ua);
    return match ? match[2] : "";
  }

  function getOsFamily() {
    var ua = getUserAgent();
    if (/Windows/i.test(ua)) return "Windows";
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
    if (/Linux/i.test(ua)) return "Linux";
    return "Other";
  }

  function getTimezone() {
    try {
      if (window.Intl && Intl.DateTimeFormat) {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      }
    } catch (error) {}
    return "";
  }

  function isPhoneUserAgent() {
    var ua = getUserAgent();
    return /iPhone|iPod|Windows Phone|IEMobile|BlackBerry|Opera Mini/i.test(ua) ||
      /Android.*Mobile/i.test(ua) ||
      (/Mobile/i.test(ua) && !/iPad|Tablet/i.test(ua));
  }

  function isTabletUserAgent() {
    var ua = getUserAgent();
    return /iPad|Tablet|Android(?!.*Mobile)|Silk/i.test(ua) ||
      (/Macintosh/i.test(ua) && hasTouch() && (navigator.maxTouchPoints || 0) > 1);
  }

  function detectBot(config) {
    var ua = getUserAgent();
    var rules = config.sourceRules || {};
    var previewPatterns = rules.knownPreviewBotPatterns || [];
    var botPatterns = rules.knownBotPatterns || [];
    var i;
    var pattern;

    for (i = 0; i < previewPatterns.length; i += 1) {
      pattern = String(previewPatterns[i] || "");
      if (pattern && new RegExp(pattern, "i").test(ua)) {
        return { isBot: true, isPreview: true, reason: pattern };
      }
    }

    for (i = 0; i < botPatterns.length; i += 1) {
      pattern = String(botPatterns[i] || "");
      if (pattern && new RegExp(pattern, "i").test(ua)) {
        return { isBot: true, isPreview: false, reason: pattern };
      }
    }

    return { isBot: false, isPreview: false, reason: "" };
  }

  function getDeviceClass(config) {
    var width = getViewportWidth();
    var mobileBreakpoint = Number(config.routing && config.routing.mobileBreakpoint) || 768;
    if (isPhoneUserAgent()) return "phone";
    if (isTabletUserAgent()) return "tablet";
    if (hasTouch() && width <= mobileBreakpoint) return "small-touch-screen";
    if (width <= mobileBreakpoint) return "narrow-screen";
    return "desktop";
  }

  function normalizeSource(config) {
    var params = getParams();
    var utmSource = limit(params.utm_source || "", 80);
    var utmMedium = limit(params.utm_medium || "", 80);
    var referrerDomain = getHostname(document.referrer || "");
    var rules = config.sourceRules || {};
    var source = "direct";

    if (utmSource) {
      if (/^island\.is$/i.test(utmSource) || /^islandis$/i.test(utmSource)) {
        source = "island_is_public";
      } else if (/^qr$/i.test(utmSource) || /^qrcode$/i.test(utmSource)) {
        source = "qr_code";
      } else if (/teams/i.test(utmSource)) {
        source = "internal_teams";
      } else if (/outlook|email|mail/i.test(utmSource) || /email/i.test(utmMedium)) {
        source = "internal_email";
      } else if (/sharepoint|intranet/i.test(utmSource)) {
        source = "internal_intranet";
      } else {
        source = "campaign_or_other_utm";
      }
    } else if (sameDomainOrSubdomain(referrerDomain, rules.islandDomains || [])) {
      source = "island_is_public";
    } else if (sameDomainOrSubdomain(referrerDomain, rules.internalDomains || [])) {
      source = "internal_referrer";
    } else if (referrerDomain) {
      source = "external_referrer";
    }

    return {
      entrySourceCategory: source,
      referrerDomain: referrerDomain,
      utmSource: utmSource,
      utmMedium: limit(params.utm_medium || "", 80),
      utmCampaign: limit(params.utm_campaign || "", 120),
      utmContent: limit(params.utm_content || "", 120),
      utmTerm: limit(params.utm_term || "", 120),
      utmId: limit(params.utm_id || "", 120)
    };
  }

  function makeBootstrapConfig(bootstrap) {
    var dashboard = bootstrap && bootstrap.dashboard ? clone(bootstrap.dashboard) : null;
    var key = (bootstrap && bootstrap.dashboardKey) || (dashboard && dashboard.dashboardKey) || "dashboard";
    var fallbackEndpoint = bootstrap && bootstrap.trackingEndpoint ? bootstrap.trackingEndpoint : "";
    var base = {
      schemaVersion: "5",
      configVersion: "embedded-bootstrap",
      routerName: "Landspítali Power BI Router",
      environment: "prod",
      basePath: "/Landspitali/",
      owner: "Landspítali",
      publicEntry: bootstrap && bootstrap.publicEntry ? bootstrap.publicEntry : {},
      tracking: {
        enabled: !!fallbackEndpoint,
        endpoint: fallbackEndpoint,
        schemaVersion: "5",
        diagnosticsEnabled: false,
        trackDebugViews: true,
        trackFallbackClicks: true,
        trackErrors: true,
        trackDirectoryViews: false,
        trackDiagnosticEvents: true,
        countDebugAsVisit: false,
        countBotsAsVisit: false,
        sampleRate: 1,
        transportOrder: ["sendBeacon", "fetchKeepalive", "imageGet"],
        allowedQueryParams: ["dashboard", "id", "force", "view", "debug", "health", "list", "dashboards", "noredirect", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"]
      },
      routing: {
        mobileBreakpoint: 768,
        tabletBreakpoint: 1024,
        forceParamNames: ["force", "view"],
        dashboardParamNames: ["dashboard", "id"],
        debugParamNames: ["debug"],
        listParamNames: ["list", "dashboards"],
        healthParamNames: ["health", "status"],
        noRedirectParamNames: ["noredirect", "manual"],
        allowDashboardQueryOverride: false,
        allowDashboardQueryOverrideOnRoot: true,
        botStrategy: "desktop-no-visit",
        previewBotLayout: "desktop",
        tabletStrategy: "auto-by-orientation",
        tabletPortraitLayout: "mobile",
        tabletLandscapeLayout: "desktop",
        narrowDesktopStrategy: "mobile",
        fallbackLayout: "mobile",
        redirectDelayMs: 0,
        manualLinksInDebug: true,
        maintenanceMode: false,
        maintenanceMessage: "Mælaborðið er tímabundið óaðgengilegt."
      },
      ui: {
        eyebrow: "Landspítali",
        buttonText: "Opna mælaborð",
        defaultTitle: "Opna mælaborð",
        defaultText: "Augnablik, þú ert send/ur í rétta útgáfu mælaborðsins eftir tæki og skjábreidd.",
        noDashboardTitle: "Veldu mælaborð",
        noDashboardText: "Engin dashboard auðkenning fannst í slóðinni.",
        fallbackNote: "Ef ekkert gerist sjálfkrafa skaltu smella á takkann."
      },
      sourceRules: {
        islandDomains: ["island.is", "www.island.is"],
        internalDomains: ["landspitali.is", "www.landspitali.is", "spitali.is"],
        knownPreviewBotPatterns: ["facebookexternalhit", "Facebot", "LinkedInBot", "Twitterbot", "Slackbot-LinkExpanding", "Discordbot", "SkypeUriPreview", "TeamsExternalLinkPreview", "Microsoft Office", "WhatsApp", "TelegramBot"],
        knownBotPatterns: ["bot", "spider", "crawler", "preview", "linkexpand"]
      },
      dashboards: {}
    };

    if (dashboard) {
      base.dashboards[key] = dashboard;
    }
    return base;
  }

  function validateDashboard(dashboard) {
    return isObject(dashboard) && !!dashboard.dashboardKey && !!dashboard.dashboardId &&
      isPowerBiPublishUrl(dashboard.mobileUrl || "") && isPowerBiPublishUrl(dashboard.desktopUrl || "");
  }

  function validateConfig(config) {
    var key;
    var found = false;
    if (!isObject(config) || !isObject(config.dashboards) || !isObject(config.tracking) || !isObject(config.routing)) {
      return false;
    }
    for (key in config.dashboards) {
      if (Object.prototype.hasOwnProperty.call(config.dashboards, key) && validateDashboard(config.dashboards[key])) {
        found = true;
      }
    }
    return found;
  }

  function getConfigAndSource() {
    var bootstrap = window.LSP_ROUTER_BOOTSTRAP || {};
    var central = clone(window.LSP_ROUTER_CONFIG || null);
    var config;
    var source;
    var key;

    if (validateConfig(central)) {
      config = central;
      source = "central-config-js";
    } else {
      config = makeBootstrapConfig(bootstrap);
      source = "embedded-bootstrap";
    }

    if (bootstrap && bootstrap.dashboard && bootstrap.dashboardKey) {
      key = bootstrap.dashboardKey;
      if (!config.dashboards[key] || !validateDashboard(config.dashboards[key])) {
        config.dashboards[key] = clone(bootstrap.dashboard);
        source = source === "central-config-js" ? "central-plus-embedded-dashboard" : source;
      }
    }

    return { config: config, configSource: source, bootstrap: bootstrap };
  }

  function normalizeKey(value) {
    return trim(value).toLowerCase();
  }

  function buildAliasMap(config) {
    var map = {};
    var key;
    var dashboard;
    var aliases;
    var i;
    for (key in config.dashboards) {
      if (Object.prototype.hasOwnProperty.call(config.dashboards, key)) {
        dashboard = config.dashboards[key];
        map[normalizeKey(key)] = key;
        map[normalizeKey(dashboard.dashboardKey)] = key;
        map[normalizeKey(dashboard.dashboardId)] = key;
        aliases = dashboard.aliases || [];
        for (i = 0; i < aliases.length; i += 1) {
          map[normalizeKey(aliases[i])] = key;
        }
      }
    }
    return map;
  }

  function getPathSegments() {
    var path = window.location.pathname || "/";
    return path.split("/").filter(function (part) { return !!part; });
  }

  function getDashboardKeyFromPath(config) {
    var segments = getPathSegments();
    var key;
    var dashboard;
    var i;
    var segment;

    for (i = segments.length - 1; i >= 0; i -= 1) {
      segment = normalizeKey(segments[i]);
      for (key in config.dashboards) {
        if (Object.prototype.hasOwnProperty.call(config.dashboards, key)) {
          dashboard = config.dashboards[key];
          if (segment === normalizeKey(dashboard.path || "") || segment === normalizeKey(dashboard.dashboardKey || "")) {
            return key;
          }
        }
      }
    }
    return "";
  }

  function isRootRouterPath(config) {
    var pathKey = getDashboardKeyFromPath(config);
    return !pathKey;
  }

  function resolveDashboard(config, bootstrap) {
    var routing = config.routing || {};
    var aliasMap = buildAliasMap(config);
    var lockedKey = bootstrap && bootstrap.lockDashboard ? normalizeKey(bootstrap.dashboardKey || "") : "";
    var pathKey = getDashboardKeyFromPath(config);
    var queryValue = getQueryValue(routing.dashboardParamNames || ["dashboard", "id"]);
    var queryKey = aliasMap[normalizeKey(queryValue)] || "";
    var candidateKey = "";

    if (lockedKey && aliasMap[lockedKey]) {
      candidateKey = aliasMap[lockedKey];
    } else if (pathKey) {
      candidateKey = pathKey;
    } else if (queryKey && (routing.allowDashboardQueryOverrideOnRoot || routing.allowDashboardQueryOverride)) {
      candidateKey = queryKey;
    }

    if (candidateKey && config.dashboards[candidateKey]) {
      return config.dashboards[candidateKey];
    }
    return null;
  }

  function forcedLayout(config) {
    var value = getQueryValue((config.routing && config.routing.forceParamNames) || ["force", "view"]).toLowerCase();
    if (value === "mobile") return "mobile";
    if (value === "desktop") return "desktop";
    return "auto";
  }

  function decideAutoLayout(config, dashboard, bot) {
    var routing = config.routing || {};
    var dashboardPolicy = (dashboard && dashboard.routePolicy) || {};
    var width = getViewportWidth();
    var height = getViewportHeight();
    var mobileBreakpoint = Number(dashboard && dashboard.mobileBreakpoint) || Number(routing.mobileBreakpoint) || 768;
    var isTablet = isTabletUserAgent();
    var isPhone = isPhoneUserAgent();
    var layout;
    var reason;
    var detail;

    if (bot.isBot) {
      layout = dashboardPolicy.bot || routing.previewBotLayout || "desktop";
      return { layout: layout, reason: bot.isPreview ? "link_preview_bot" : "known_bot", detail: bot.reason || "bot or preview user agent" };
    }

    if (isPhone) {
      layout = dashboardPolicy.phone || "mobile";
      return { layout: layout, reason: "phone_user_agent", detail: "phone user agent selected " + layout };
    }

    if (isTablet) {
      if ((routing.tabletStrategy || "auto-by-orientation") === "desktop") {
        return { layout: "desktop", reason: "tablet_policy_desktop", detail: "tablet strategy desktop" };
      }
      if ((routing.tabletStrategy || "auto-by-orientation") === "mobile") {
        return { layout: "mobile", reason: "tablet_policy_mobile", detail: "tablet strategy mobile" };
      }
      if (height > width) {
        layout = dashboardPolicy.tabletPortrait || routing.tabletPortraitLayout || "mobile";
        return { layout: layout, reason: "tablet_portrait", detail: "tablet portrait selected " + layout };
      }
      layout = dashboardPolicy.tabletLandscape || routing.tabletLandscapeLayout || "desktop";
      return { layout: layout, reason: "tablet_landscape", detail: "tablet landscape selected " + layout };
    }

    if (width <= mobileBreakpoint) {
      layout = dashboardPolicy.narrowViewport || routing.narrowDesktopStrategy || "mobile";
      return { layout: layout, reason: "narrow_viewport", detail: "viewport width " + width + " <= " + mobileBreakpoint };
    }

    layout = dashboardPolicy.desktop || "desktop";
    return { layout: layout, reason: "desktop_viewport", detail: "desktop width " + width + " selected " + layout };
  }

  function decideRoute(config, dashboard) {
    var bot = detectBot(config);
    var auto = decideAutoLayout(config, dashboard, bot);
    var force = forcedLayout(config);
    var selectedLayout = auto.layout;
    var reason = auto.reason;
    var detail = auto.detail;
    var forcedApplied = false;
    var targetUrl;
    var safeFallbackUsed = false;
    var layoutSource = "auto";

    if (force === "mobile" || force === "desktop") {
      selectedLayout = force;
      reason = "forced_" + force;
      detail = "layout forced by query parameter";
      forcedApplied = true;
      layoutSource = "forced";
    }

    targetUrl = selectedLayout === "desktop" ? dashboard.desktopUrl : dashboard.mobileUrl;
    if (!isPowerBiPublishUrl(targetUrl)) {
      safeFallbackUsed = true;
      selectedLayout = dashboard.fallbackLayout || (config.routing && config.routing.fallbackLayout) || "mobile";
      targetUrl = selectedLayout === "desktop" ? dashboard.desktopUrl : dashboard.mobileUrl;
      reason = "safe_fallback_layout";
      detail = "selected URL failed validation; fallback layout used";
      layoutSource = "fallback";
    }

    if (!isPowerBiPublishUrl(targetUrl)) {
      targetUrl = isPowerBiPublishUrl(dashboard.mobileUrl) ? dashboard.mobileUrl : dashboard.desktopUrl;
      selectedLayout = targetUrl === dashboard.desktopUrl ? "desktop" : "mobile";
      safeFallbackUsed = true;
      reason = "safe_fallback_url";
      detail = "fallback selected the only valid Power BI URL";
      layoutSource = "fallback";
    }

    return {
      targetUrl: targetUrl,
      selectedLayout: selectedLayout,
      autoSelectedLayout: auto.layout,
      forcedLayout: force,
      forcedLayoutApplied: forcedApplied,
      routeReason: reason,
      routeReasonDetail: detail,
      deviceClass: getDeviceClass(config),
      bot: bot,
      countAsVisit: !bot.isBot || !!(config.tracking && config.tracking.countBotsAsVisit),
      safeFallbackUsed: safeFallbackUsed,
      layoutSource: layoutSource
    };
  }

  function getPublicEntryPage(dashboard, config) {
    var url = (dashboard.publicCard && dashboard.publicCard.pageUrl) || (config.publicEntry && config.publicEntry.pageUrl) || "";
    return getPathFromUrl(url) || url;
  }

  function countForEvent(eventType, mode, routeDecision, config) {
    if (eventType !== "router_redirect" && eventType !== "router_noscript") {
      return false;
    }
    if (mode.debug && !(config.tracking && config.tracking.countDebugAsVisit)) {
      return false;
    }
    if (mode.health || mode.list || mode.noRedirect) {
      return false;
    }
    if (routeDecision && routeDecision.bot && routeDecision.bot.isBot && !(config.tracking && config.tracking.countBotsAsVisit)) {
      return false;
    }
    return true;
  }

  function buildEvent(config, dashboard, routeDecision, eventType, mode, extra) {
    var source = normalizeSource(config);
    var diagnostics = !!(config.tracking && config.tracking.diagnosticsEnabled) || (mode && mode.debug && hasQueryFlag("diagnostics"));
    var payload = {
      schema_version: (config.tracking && config.tracking.schemaVersion) || config.schemaVersion || "5",
      event_id: nextEventId(),
      request_id: requestId,
      event_type: eventType,
      count_as_visit: countForEvent(eventType, mode || {}, routeDecision, config),
      client_time: new Date().toISOString(),
      dashboard_key: dashboard ? dashboard.dashboardKey || "" : "",
      dashboard_id: dashboard ? dashboard.dashboardId || "" : "",
      dashboard_name: dashboard ? dashboard.displayName || "" : "",
      public_card_title: dashboard && dashboard.publicCard ? dashboard.publicCard.title || "" : "",
      public_entry_page: dashboard ? getPublicEntryPage(dashboard, config) : (config.publicEntry ? config.publicEntry.pagePath || "" : ""),
      selected_layout: routeDecision ? routeDecision.selectedLayout || "" : "",
      auto_selected_layout: routeDecision ? routeDecision.autoSelectedLayout || "" : "",
      forced_layout: routeDecision ? routeDecision.forcedLayout || "auto" : forcedLayout(config),
      forced_layout_applied: routeDecision ? !!routeDecision.forcedLayoutApplied : false,
      route_reason: routeDecision ? routeDecision.routeReason || "" : "",
      route_reason_detail: routeDecision ? limit(routeDecision.routeReasonDetail || "", 200) : "",
      device_class: routeDecision ? routeDecision.deviceClass || getDeviceClass(config) : getDeviceClass(config),
      viewport_width: getViewportWidth(),
      viewport_height: getViewportHeight(),
      browser_family: getBrowserFamily(),
      os_family: getOsFamily(),
      referrer_domain: source.referrerDomain,
      entry_source_category: routeDecision && routeDecision.bot && routeDecision.bot.isBot ? (routeDecision.bot.isPreview ? "link_preview_bot" : "known_bot") : source.entrySourceCategory,
      utm_source: source.utmSource,
      utm_medium: source.utmMedium,
      utm_campaign: source.utmCampaign,
      utm_content: source.utmContent || (dashboard ? dashboard.utmContent || (dashboard.publicCard && dashboard.publicCard.stableUtmContent) || "" : ""),
      page_path: window.location.pathname || "",
      config_version: config.configVersion || "",
      router_core_version: CORE_VERSION,
      config_source: config.__source || "",
      safe_fallback_used: routeDecision ? !!routeDecision.safeFallbackUsed : false,
      tracking_method: "pending",
      error_message: extra && extra.error_message ? limit(extra.error_message, 400) : ""
    };

    if (extra) {
      if (extra.warning_code) payload.warning_code = limit(extra.warning_code, 120);
      if (extra.warning_detail) payload.warning_detail = limit(extra.warning_detail, 300);
    }

    if (diagnostics) {
      payload.user_agent = limit(getUserAgent(), 500);
      payload.screen_width = window.screen ? screen.width : "";
      payload.screen_height = window.screen ? screen.height : "";
      payload.device_pixel_ratio = window.devicePixelRatio || 1;
      payload.touch = hasTouch();
      payload.max_touch_points = navigator.maxTouchPoints || 0;
      payload.language = limit(navigator.language || "", 40);
      payload.timezone = limit(getTimezone(), 80);
      payload.browser_major_version = getBrowserMajorVersion();
      payload.bot_reason = routeDecision && routeDecision.bot ? limit(routeDecision.bot.reason || "", 100) : "";
    }

    return payload;
  }

  function shouldSendBySampleRate(config, payload) {
    var sampleRate = Number(config.tracking && config.tracking.sampleRate);
    if (!isFinite(sampleRate)) sampleRate = 1;
    if (sampleRate >= 1) return true;
    if (sampleRate <= 0 && payload.event_type === "router_redirect" && payload.count_as_visit) return false;
    if (payload.event_type === "router_redirect" && payload.count_as_visit) {
      return Math.random() <= sampleRate;
    }
    return true;
  }

  function compactForImage(payload) {
    var keys = [
      "schema_version", "event_id", "request_id", "event_type", "count_as_visit",
      "dashboard_key", "dashboard_id", "dashboard_name", "public_card_title", "public_entry_page", "selected_layout", "auto_selected_layout",
      "forced_layout", "forced_layout_applied", "route_reason", "device_class",
      "viewport_width", "viewport_height", "browser_family", "os_family",
      "entry_source_category", "referrer_domain", "utm_source", "utm_medium", "utm_campaign", "utm_content",
      "page_path", "config_version", "router_core_version", "config_source", "safe_fallback_used", "tracking_method"
    ];
    var result = {};
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (payload[keys[i]] !== undefined && payload[keys[i]] !== null && payload[keys[i]] !== "") {
        result[keys[i]] = String(payload[keys[i]]);
      }
    }
    return result;
  }

  function appendQuery(url, params) {
    var parts = [];
    var key;
    for (key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
      }
    }
    if (!parts.length) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + parts.join("&");
  }

  function sendTracking(config, payload) {
    var endpoint = config.tracking && config.tracking.endpoint;
    var order = (config.tracking && config.tracking.transportOrder) || [];
    var i;
    var method;
    var body;
    var blob;
    var queued;
    var image;
    var imagePayload;

    if (!(config.tracking && config.tracking.enabled) || !endpoint) {
      return "disabled";
    }
    if (!shouldSendBySampleRate(config, payload)) {
      return "sampled_out";
    }

    for (i = 0; i < order.length; i += 1) {
      method = order[i];
      try {
        if (method === "sendBeacon" && navigator.sendBeacon) {
          payload.tracking_method = "sendBeacon";
          body = JSON.stringify(payload);
          blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
          queued = navigator.sendBeacon(endpoint, blob);
          if (queued) return "sendBeacon";
        }

        if (method === "fetchKeepalive" && window.fetch) {
          payload.tracking_method = "fetchKeepalive";
          body = JSON.stringify(payload);
          window.fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            keepalive: true,
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
            body: body
          }).catch(function () {});
          return "fetchKeepalive";
        }

        if (method === "imageGet") {
          payload.tracking_method = "imageGet";
          imagePayload = compactForImage(payload);
          imagePayload.cb = String(Date.now()) + String(Math.random()).slice(2);
          image = new Image(1, 1);
          image.alt = "";
          image.src = appendQuery(endpoint, imagePayload);
          return "imageGet";
        }
      } catch (error) {}
    }

    return "not_sent";
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function updateText(id, value) {
    var el = getElement(id);
    if (el) {
      el.textContent = value;
    }
  }

  function updateFallback(targetUrl) {
    var fallbackLink = getElement("fallback-link");
    if (fallbackLink && isHttpsUrl(targetUrl)) {
      fallbackLink.href = targetUrl;
    }
  }

  function showExtra(html) {
    var extra = getElement("router-extra");
    if (extra) {
      extra.innerHTML = html;
      extra.hidden = false;
    }
  }

  function attachFallbackClick(config, dashboard, routeDecision, mode) {
    var fallbackLink = getElement("fallback-link");
    if (!fallbackLink || !config.tracking || !config.tracking.trackFallbackClicks) {
      return;
    }
    fallbackLink.addEventListener("click", function () {
      var payload = buildEvent(config, dashboard, routeDecision, "fallback_click", mode, {});
      payload.count_as_visit = false;
      sendTracking(config, payload);
    });
  }

  function renderDebug(config, dashboard, routeDecision, mode) {
    var source = normalizeSource(config);
    var html = "";
    updateText("page-title", ((config.ui && config.ui.debugTitlePrefix) || "Debug") + ": " + (dashboard ? dashboard.displayName : "Router"));
    updateText("route-note", "Sjálfvirk leiðing er stöðvuð í debug/manual ham.");
    html += "<dl class=\"debug-list\">";
    html += "<dt>Mælaborð</dt><dd>" + escapeHtml(dashboard ? dashboard.dashboardKey : "ekkert") + "</dd>";
    html += "<dt>Valin útgáfa</dt><dd>" + escapeHtml(routeDecision ? routeDecision.selectedLayout : "") + "</dd>";
    html += "<dt>Sjálfvirk útgáfa</dt><dd>" + escapeHtml(routeDecision ? routeDecision.autoSelectedLayout : "") + "</dd>";
    html += "<dt>Ástæða</dt><dd>" + escapeHtml(routeDecision ? routeDecision.routeReasonDetail : "") + "</dd>";
    html += "<dt>Tæki</dt><dd>" + escapeHtml(routeDecision ? routeDecision.deviceClass : getDeviceClass(config)) + "</dd>";
    html += "<dt>Skjábreidd</dt><dd>" + escapeHtml(getViewportWidth()) + " px</dd>";
    html += "<dt>Vafri</dt><dd>" + escapeHtml(getBrowserFamily()) + "</dd>";
    html += "<dt>Stýrikerfi</dt><dd>" + escapeHtml(getOsFamily()) + "</dd>";
    html += "<dt>Uppruni</dt><dd>" + escapeHtml(source.entrySourceCategory) + "</dd>";
    html += "<dt>Config</dt><dd>" + escapeHtml(config.configVersion || "") + " / " + escapeHtml(config.__source || "") + "</dd>";
    html += "<dt>Router core</dt><dd>" + escapeHtml(CORE_VERSION) + "</dd>";
    html += "</dl>";
    if (dashboard && routeDecision) {
      html += "<div class=\"manual-links\">";
      html += "<a class=\"secondary-button\" href=\"" + escapeHtml(dashboard.mobileUrl) + "\">Opna mobile</a>";
      html += "<a class=\"secondary-button\" href=\"" + escapeHtml(dashboard.desktopUrl) + "\">Opna desktop</a>";
      html += "<a class=\"secondary-button\" href=\"" + escapeHtml(routeDecision.targetUrl) + "\">Opna valda útgáfu</a>";
      html += "</div>";
    }
    showExtra(html);
  }

  function renderHealth(config, dashboard) {
    var html = "";
    updateText("page-title", "Router health");
    updateText("route-note", "Þessi síða er fyrir rekstrarprófanir og telur ekki sem heimsókn.");
    html += "<dl class=\"debug-list\">";
    html += "<dt>Status</dt><dd>ok</dd>";
    html += "<dt>Config version</dt><dd>" + escapeHtml(config.configVersion || "") + "</dd>";
    html += "<dt>Config source</dt><dd>" + escapeHtml(config.__source || "") + "</dd>";
    html += "<dt>Core version</dt><dd>" + escapeHtml(CORE_VERSION) + "</dd>";
    html += "<dt>Tracking</dt><dd>" + escapeHtml(config.tracking && config.tracking.enabled ? "enabled" : "disabled") + "</dd>";
    html += "<dt>Dashboard</dt><dd>" + escapeHtml(dashboard ? dashboard.dashboardKey : "none") + "</dd>";
    html += "<dt>Path</dt><dd>" + escapeHtml(window.location.pathname || "") + "</dd>";
    html += "</dl>";
    showExtra(html);
  }

  function renderDirectory(config) {
    var html = "<div class=\"dashboard-list\">";
    var key;
    var dashboard;
    updateText("page-title", (config.ui && config.ui.noDashboardTitle) || "Veldu mælaborð");
    updateText("route-note", (config.ui && config.ui.noDashboardText) || "Veldu mælaborð.");
    for (key in config.dashboards) {
      if (Object.prototype.hasOwnProperty.call(config.dashboards, key)) {
        dashboard = config.dashboards[key];
        html += "<a class=\"dashboard-row\" href=\"" + escapeHtml((config.basePath || "/") + dashboard.path + "/") + "\">";
        if (dashboard.publicCard && dashboard.publicCard.iconUrl) {
          html += "<img src=\"" + escapeHtml(dashboard.publicCard.iconUrl) + "\" alt=\"\">";
        }
        html += "<span><strong>" + escapeHtml(dashboard.publicCard && dashboard.publicCard.title ? dashboard.publicCard.title : dashboard.displayName) + "</strong>";
        html += "<small>" + escapeHtml(dashboard.dashboardId) + "</small></span></a>";
      }
    }
    html += "</div>";
    showExtra(html);
  }

  function renderMaintenance(config, dashboard, routeDecision, mode) {
    var message = dashboard.maintenanceMessage || (config.routing && config.routing.maintenanceMessage) || "Mælaborðið er tímabundið óaðgengilegt.";
    updateText("page-title", (config.ui && config.ui.maintenanceTitle) || "Mælaborð tímabundið óaðgengilegt");
    updateText("route-note", message);
    if (dashboard.maintenanceUrl && isHttpsUrl(dashboard.maintenanceUrl)) {
      updateFallback(dashboard.maintenanceUrl);
      showExtra("<p class=\"small\">Hægt er að opna viðhaldsslóð með hnappnum.</p>");
    } else {
      showExtra("<p class=\"small\">Engin sjálfvirk leiðing er virk í viðhaldsham.</p>");
    }
    if (config.tracking && config.tracking.trackDiagnosticEvents) {
      sendTracking(config, buildEvent(config, dashboard, routeDecision, "router_maintenance_view", mode, { warning_code: "maintenance" }));
    }
  }

  function isIeMode() {
    var ua = getUserAgent();
    return !!document.documentMode || /MSIE|Trident/i.test(ua);
  }

  function redirectToTarget(targetUrl) {
    if (!isHttpsUrl(targetUrl)) {
      return;
    }
    if (isIeMode() && /^https:\/\//i.test(targetUrl)) {
      window.location.href = "microsoft-edge:" + targetUrl;
      return;
    }
    window.location.replace(targetUrl);
  }

  function getMode(config) {
    var routing = config.routing || {};
    return {
      debug: hasQueryFlag(routing.debugParamNames || ["debug"]),
      list: hasQueryFlag(routing.listParamNames || ["list", "dashboards"]),
      health: hasQueryFlag(routing.healthParamNames || ["health", "status"]),
      noRedirect: hasQueryFlag(routing.noRedirectParamNames || ["noredirect", "manual"])
    };
  }

  function recordError(config, dashboard, routeDecision, mode, error) {
    var message = error && (error.message || String(error)) || "unknown error";
    if (config && config.tracking && config.tracking.trackErrors) {
      sendTracking(config, buildEvent(config, dashboard, routeDecision, "router_error", mode || {}, { error_message: message }));
    }
  }

  function startRouter() {
    var packed;
    var config;
    var bootstrap;
    var dashboard;
    var mode;
    var routeDecision;
    var payload;

    if (started) {
      return;
    }
    started = true;
    window.LSP_ROUTER_STARTED = true;

    packed = getConfigAndSource();
    config = packed.config;
    bootstrap = packed.bootstrap || {};
    config.__source = packed.configSource;
    mode = getMode(config);
    dashboard = resolveDashboard(config, bootstrap);

    try {
      if (mode.list || (!dashboard && isRootRouterPath(config))) {
        renderDirectory(config);
        if (config.tracking && config.tracking.trackDirectoryViews) {
          sendTracking(config, buildEvent(config, null, null, "router_directory_view", mode, {}));
        }
        return;
      }

      if (!dashboard) {
        updateText("page-title", (config.ui && config.ui.noDashboardTitle) || "Veldu mælaborð");
        updateText("route-note", "Mælaborð fannst ekki fyrir þessa slóð.");
        showExtra("<p class=\"small\">Notaðu rótarsíðuna eða gildan dashboard lykil.</p>");
        sendTracking(config, buildEvent(config, null, null, "router_error", mode, { error_message: "dashboard_not_found" }));
        return;
      }

      routeDecision = decideRoute(config, dashboard);
      updateFallback(routeDecision.targetUrl);
      attachFallbackClick(config, dashboard, routeDecision, mode);

      if (mode.health) {
        renderHealth(config, dashboard);
        if (config.tracking && config.tracking.trackDiagnosticEvents) {
          sendTracking(config, buildEvent(config, dashboard, routeDecision, "router_health_view", mode, {}));
        }
        return;
      }

      if ((config.routing && config.routing.maintenanceMode) || dashboard.status === "maintenance" || dashboard.status === "disabled" || dashboard.enabled === false) {
        renderMaintenance(config, dashboard, routeDecision, mode);
        return;
      }

      if (mode.debug || mode.noRedirect) {
        renderDebug(config, dashboard, routeDecision, mode);
        if ((mode.debug && config.tracking && config.tracking.trackDebugViews) || (mode.noRedirect && config.tracking && config.tracking.trackDiagnosticEvents)) {
          payload = buildEvent(config, dashboard, routeDecision, mode.debug ? "router_debug_view" : "router_manual_view", mode, {});
          payload.count_as_visit = false;
          sendTracking(config, payload);
        }
        return;
      }

      payload = buildEvent(config, dashboard, routeDecision, "router_redirect", mode, {});
      sendTracking(config, payload);

      window.setTimeout(function () {
        redirectToTarget(routeDecision.targetUrl);
      }, Number(config.routing && config.routing.redirectDelayMs) || 0);
    } catch (error) {
      recordError(config, dashboard, routeDecision, mode, error);
      if (dashboard && isPowerBiPublishUrl(dashboard.mobileUrl)) {
        redirectToTarget(dashboard.mobileUrl);
      }
    }
  }

  window.LSP_startRouter = startRouter;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startRouter);
  } else {
    startRouter();
  }
}(window, document));
