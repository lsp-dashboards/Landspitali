(function (window, document) {
  "use strict";

  var CORE_VERSION = "2026-06-13-core-1.4.0-relaunch.1";
  var started = false;
  var sequence = 0;
  var requestId = makeRequestId();
  var scriptErrorCount = 0;

  try {
    window.addEventListener("error", function () { scriptErrorCount += 1; });
    window.addEventListener("unhandledrejection", function () { scriptErrorCount += 1; });
  } catch (error) {}

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
    if (/EdgA?\/|EdgiOS|Edg\//i.test(ua)) return "Edge";
    if (/OPR\/|Opera/i.test(ua)) return "Opera";
    if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
    if (/Chrome\/|CriOS|Chromium/i.test(ua)) return "Chrome";
    if (/Firefox\/|FxiOS/i.test(ua)) return "Firefox";
    if (/Safari\//i.test(ua) && !/Chrome\/|CriOS|Chromium|SamsungBrowser|EdgA?\/|OPR\//i.test(ua)) return "Safari";
    if (/MSIE|Trident/i.test(ua)) return "Internet Explorer";
    return "Other";
  }

  function getBrowserMajorVersion() {
    var ua = getUserAgent();
    var match = /SamsungBrowser\/(\d+)/i.exec(ua) ||
      /EdgA?\/(\d+)/i.exec(ua) ||
      /EdgiOS\/(\d+)/i.exec(ua) ||
      /Chrome\/(\d+)/i.exec(ua) ||
      /CriOS\/(\d+)/i.exec(ua) ||
      /Firefox\/(\d+)/i.exec(ua) ||
      /FxiOS\/(\d+)/i.exec(ua) ||
      /Version\/(\d+)/i.exec(ua);
    return match ? match[1] : "";
  }

  function getBrowserBrand() {
    return getBrowserFamily();
  }

  function getBrowserEngine() {
    var ua = getUserAgent();
    if (/MSIE|Trident/i.test(ua)) return "Trident";
    if (/Firefox\/|FxiOS/i.test(ua)) return "Gecko";
    if (/EdgA?\/|EdgiOS|OPR\/|Opera|SamsungBrowser|Chrome\/|CriOS|Chromium/i.test(ua)) return "Blink";
    if (/AppleWebKit|Safari\//i.test(ua)) return "WebKit";
    return "unknown";
  }

  function mediaValue(query, yesValue, noValue) {
    try {
      if (window.matchMedia && window.matchMedia(query).matches) return yesValue;
      if (window.matchMedia) return noValue;
    } catch (error) {}
    return "unknown";
  }

  function getReportedColorScheme() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    } catch (error) {}
    return "unknown";
  }

  function getColorScheme() {
    return getReportedColorScheme();
  }

  function getForcedColors() {
    return mediaValue("(forced-colors: active)", "active", "none");
  }

  function getPrefersContrast() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-contrast: more)").matches) return "more";
      if (window.matchMedia && window.matchMedia("(prefers-contrast: less)").matches) return "less";
      if (window.matchMedia && window.matchMedia("(prefers-contrast: custom)").matches) return "custom";
      if (window.matchMedia && window.matchMedia("(prefers-contrast: no-preference)").matches) return "no-preference";
    } catch (error) {}
    return "unknown";
  }

  function getInvertedColors() {
    return mediaValue("(inverted-colors: inverted)", "inverted", "none");
  }

  function isSamsungInternetAndroid() {
    var ua = getUserAgent();
    return /SamsungBrowser/i.test(ua) && /Android/i.test(ua);
  }

  function detectForcedDarkRendering() {
    var el = null;
    var color = "";

    try {
      if (!document || !document.documentElement || !window.getComputedStyle) return "unknown";

      el = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = [
        "position:absolute",
        "left:-9999px",
        "top:-9999px",
        "width:1px",
        "height:1px",
        "overflow:hidden",
        "background-color:Canvas",
        "color-scheme:light",
        "pointer-events:none"
      ].join(";");

      document.documentElement.appendChild(el);
      color = window.getComputedStyle(el).backgroundColor || "";
      document.documentElement.removeChild(el);
      el = null;

      if (!color) return "unknown";
      if (color !== "rgb(255, 255, 255)" && color !== "rgba(255, 255, 255, 1)") {
        return "detected";
      }

      return "not_detected";
    } catch (error) {
      try {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      } catch (ignored) {}
      return "unknown";
    }
  }

  function getThemeSignal() {
    var reported = getReportedColorScheme();
    var forcedDark = detectForcedDarkRendering();
    var samsungAndroid = isSamsungInternetAndroid();
    var samsungStatus = samsungAndroid ? "samsung_android" : "not_samsung_android";
    var quality = reported === "unknown" ? "unknown" : "reported";

    if (reported === "dark") {
      samsungStatus = samsungAndroid ? "samsung_android_reported_dark" : samsungStatus;
      quality = "reported";
    } else if (forcedDark === "detected") {
      samsungStatus = samsungAndroid ? "samsung_android_forced_dark_detected" : samsungStatus;
      quality = "detected";
    } else if (samsungAndroid && reported !== "dark") {
      samsungStatus = "samsung_forced_dark_possible";
      quality = "possible_only";
    }

    return {
      colorScheme: reported,
      forcedDarkDetection: forcedDark,
      samsungDarkModeStatus: samsungStatus,
      themeSignalQuality: quality
    };
  }



  function roundNumber(value, decimals) {
    var number = Number(value);
    var factor = Math.pow(10, decimals || 0);
    if (!isFinite(number)) return "";
    return Math.round(number * factor) / factor;
  }

  function safeJson(value, max) {
    var text = "";
    try {
      text = JSON.stringify(value || {});
    } catch (error) {
      text = "{}";
    }
    return limit(text, max || 500);
  }

  function matches(query) {
    try {
      return !!(window.matchMedia && window.matchMedia(query).matches);
    } catch (error) {}
    return false;
  }

  function mediaState(query, yesValue, noValue) {
    try {
      if (!window.matchMedia) return "unknown";
      return window.matchMedia(query).matches ? yesValue : noValue;
    } catch (error) {}
    return "unknown";
  }

  function getVisualViewportInfo() {
    var vv = window.visualViewport;
    if (!vv) {
      return { available: false, width: "", height: "", scale: "" };
    }
    return {
      available: true,
      width: roundNumber(vv.width || 0, 0),
      height: roundNumber(vv.height || 0, 0),
      scale: roundNumber(vv.scale || 1, 2)
    };
  }

  function getOrientationInfo() {
    var orientation = (window.screen && window.screen.orientation) || {};
    var type = orientation.type || (getViewportWidth() >= getViewportHeight() ? "landscape" : "portrait");
    var angle = orientation.angle;
    if (angle === undefined || angle === null || angle === "") {
      angle = window.orientation;
    }
    return {
      type: limit(type || "unknown", 40),
      angle: numberOrEmpty(angle),
      isLandscape: getViewportWidth() >= getViewportHeight()
    };
  }

  function numberOrEmpty(value) {
    var number = Number(value);
    return isFinite(number) ? number : "";
  }

  function getAspectRatio() {
    var width = getViewportWidth();
    var height = getViewportHeight();
    if (!width || !height) return "";
    return roundNumber(width / height, 2);
  }

  function getViewportBucket(width) {
    width = Number(width || getViewportWidth());
    if (width < 360) return "xs_lt_360";
    if (width < 480) return "phone_360_479";
    if (width < 768) return "phone_480_767";
    if (width < 1024) return "tablet_768_1023";
    if (width < 1280) return "desktop_1024_1279";
    if (width < 1536) return "desktop_1280_1535";
    return "wide_1536_plus";
  }

  function getBreakpointBucket(config, dashboard) {
    var width = getViewportWidth();
    var mobile = Number(dashboard && dashboard.mobileBreakpoint) || Number(config.routing && config.routing.mobileBreakpoint) || 768;
    var tablet = Number(config.routing && config.routing.tabletBreakpoint) || 1024;
    if (width <= mobile) return "mobile_breakpoint";
    if (width <= tablet) return "tablet_breakpoint";
    return "desktop_breakpoint";
  }

  function getDisplayClass(config, dashboard) {
    var width = getViewportWidth();
    var height = getViewportHeight();
    var mobile = Number(dashboard && dashboard.mobileBreakpoint) || Number(config.routing && config.routing.mobileBreakpoint) || 768;
    var tablet = Number(config.routing && config.routing.tabletBreakpoint) || 1024;
    if (width <= mobile) return hasTouch() ? "small_touch_viewport" : "narrow_viewport";
    if (width <= tablet && hasTouch()) return height > width ? "tablet_portrait_viewport" : "tablet_landscape_viewport";
    if (width <= tablet) return "narrow_desktop_viewport";
    if (width >= 1920) return "large_desktop_or_display";
    return "desktop_viewport";
  }

  function getNavigationType() {
    try {
      if (window.performance && performance.getEntriesByType) {
        var entries = performance.getEntriesByType("navigation");
        if (entries && entries[0] && entries[0].type) return limit(entries[0].type, 40);
      }
      if (window.performance && performance.navigation) {
        if (performance.navigation.type === 1) return "reload";
        if (performance.navigation.type === 2) return "back_forward";
        return "navigate";
      }
    } catch (error) {}
    return "unknown";
  }

  function getPerformanceTimings() {
    var result = { supported: false, domContentLoadedMs: "", loadEventMs: "" };
    try {
      if (window.performance && performance.getEntriesByType) {
        var entries = performance.getEntriesByType("navigation");
        var nav = entries && entries[0];
        if (nav) {
          result.supported = true;
          result.domContentLoadedMs = roundNumber(nav.domContentLoadedEventEnd || nav.domContentLoadedEventStart || 0, 0);
          result.loadEventMs = roundNumber(nav.loadEventEnd || 0, 0);
          return result;
        }
      }
      if (window.performance && performance.timing) {
        var t = performance.timing;
        result.supported = true;
        if (t.domContentLoadedEventEnd && t.navigationStart) result.domContentLoadedMs = Math.max(0, t.domContentLoadedEventEnd - t.navigationStart);
        if (t.loadEventEnd && t.navigationStart) result.loadEventMs = Math.max(0, t.loadEventEnd - t.navigationStart);
      }
    } catch (error) {}
    return result;
  }

  function getConnectionStats() {
    var c;
    try {
      c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c) return { effectiveType: "unknown", downlink: "", rtt: "", saveData: false, signalQuality: "unsupported" };
      return {
        effectiveType: limit(c.effectiveType || c.type || "unknown", 40),
        downlink: numberOrEmpty(c.downlink),
        rtt: numberOrEmpty(c.rtt),
        saveData: !!c.saveData,
        signalQuality: c.effectiveType || c.type ? "reported" : "partial"
      };
    } catch (error) {}
    return { effectiveType: "unknown", downlink: "", rtt: "", saveData: false, signalQuality: "error" };
  }

  function getInputSignals() {
    var primaryPointer = matches("(pointer: coarse)") ? "coarse" : (matches("(pointer: fine)") ? "fine" : (matches("(pointer: none)") ? "none" : "unknown"));
    var anyCoarse = matches("(any-pointer: coarse)");
    var anyFine = matches("(any-pointer: fine)");
    var hoverPrimary = matches("(hover: hover)") ? "hover" : (matches("(hover: none)") ? "none" : "unknown");
    var anyHover = matches("(any-hover: hover)") ? "hover" : (matches("(any-hover: none)") ? "none" : "unknown");
    var maxTouch = navigator.maxTouchPoints || 0;
    var touch = hasTouch();
    var hybrid = !!(touch && anyFine);
    var keyboardMouse = !!(!touch && anyFine && anyHover === "hover");
    var remote = !!(primaryPointer === "coarse" && anyHover === "none" && !touch && getViewportWidth() >= 1024);
    return {
      hasTouch: touch,
      maxTouchPoints: maxTouch,
      pointerPrimary: primaryPointer,
      anyPointerCoarse: anyCoarse,
      anyPointerFine: anyFine,
      hoverPrimary: hoverPrimary,
      anyHover: anyHover,
      touchClass: touch ? (hybrid ? "hybrid_touch_mouse" : "touch") : (remote ? "remote_or_coarse" : "keyboard_mouse"),
      hybridTouchMouseLikely: hybrid,
      keyboardMouseLikely: keyboardMouse,
      remoteControlLikely: remote,
      stylusPossible: !!(touch && anyFine && maxTouch > 0)
    };
  }

  function getPrefersReducedMotion() {
    return mediaState("(prefers-reduced-motion: reduce)", "reduce", "no-preference");
  }

  function getPrefersReducedData() {
    return mediaState("(prefers-reduced-data: reduce)", "reduce", "no-preference");
  }

  function getColorGamut() {
    if (matches("(color-gamut: rec2020)")) return "rec2020";
    if (matches("(color-gamut: p3)")) return "p3";
    if (matches("(color-gamut: srgb)")) return "srgb";
    return window.matchMedia ? "unknown" : "unsupported";
  }

  function getDynamicRange() {
    if (matches("(dynamic-range: high)")) return "high";
    if (matches("(dynamic-range: standard)")) return "standard";
    return window.matchMedia ? "unknown" : "unsupported";
  }

  function getThemeEvidence(themeSignal) {
    return {
      prefers_color_scheme: themeSignal.colorScheme,
      forced_dark_detection: themeSignal.forcedDarkDetection,
      samsung_dark_mode_status: themeSignal.samsungDarkModeStatus,
      forced_colors: getForcedColors(),
      prefers_contrast: getPrefersContrast(),
      inverted_colors: getInvertedColors(),
      reduced_motion: getPrefersReducedMotion(),
      reduced_data: getPrefersReducedData(),
      color_gamut: getColorGamut(),
      dynamic_range: getDynamicRange()
    };
  }

  function getThemeConfidenceBand(themeSignal) {
    if (themeSignal.themeSignalQuality === "reported" || themeSignal.themeSignalQuality === "detected") return "high";
    if (themeSignal.themeSignalQuality === "possible_only") return "weak inference";
    return "unknown";
  }

  function getBrowserFullVersion() {
    var ua = getUserAgent();
    var match = /SamsungBrowser\/([0-9.]+)/i.exec(ua) ||
      /EdgA?\/([0-9.]+)/i.exec(ua) ||
      /EdgiOS\/([0-9.]+)/i.exec(ua) ||
      /Chrome\/([0-9.]+)/i.exec(ua) ||
      /CriOS\/([0-9.]+)/i.exec(ua) ||
      /Firefox\/([0-9.]+)/i.exec(ua) ||
      /FxiOS\/([0-9.]+)/i.exec(ua) ||
      /Version\/([0-9.]+)/i.exec(ua);
    return match && match[1] ? limit(match[1], 80) : "";
  }

  function getBrowserVersionSource() {
    return getBrowserFullVersion() ? "user_agent" : "unknown";
  }

  function getNavigatorPlatform() {
    try { return limit(navigator.platform || "", 80); } catch (error) {}
    return "";
  }

  function getNavigatorVendor() {
    try { return limit(navigator.vendor || "", 120); } catch (error) {}
    return "";
  }

  function uaReducedLikely() {
    var ua = getUserAgent();
    if (/Chrome\/[0-9]+\.0\.0\.0/i.test(ua)) return true;
    if (/Edg\/[0-9]+\.0\.0\.0/i.test(ua)) return true;
    return false;
  }

  function isWebView() {
    var ua = getUserAgent();
    if (/; wv\)|\bwv\b|Version\/4\.0 Chrome/i.test(ua)) return true;
    if (/iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua)) return true;
    return false;
  }

  function getInAppBrowserFamily() {
    var ua = getUserAgent();
    if (/Teams\//i.test(ua) || /TeamsMobile/i.test(ua)) return "Teams";
    if (/Outlook-iOS|Outlook-Android|Microsoft Outlook/i.test(ua)) return "Outlook";
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
    if (/Instagram/i.test(ua)) return "Instagram";
    if (/LinkedInApp|LinkedIn/i.test(ua)) return "LinkedIn";
    if (/Slack/i.test(ua)) return "Slack";
    if (isWebView()) return "Generic WebView";
    return "none";
  }

  function getFeatureSupport() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      user_agent_data: !!navigator.userAgentData,
      high_entropy_uach: !!(navigator.userAgentData && navigator.userAgentData.getHighEntropyValues),
      visual_viewport: !!window.visualViewport,
      send_beacon: !!navigator.sendBeacon,
      fetch_keepalive: !!window.fetch,
      match_media: !!window.matchMedia,
      performance_navigation: !!(window.performance && performance.getEntriesByType),
      network_information: !!c,
      device_posture_api: !!(window.DevicePosture || (navigator && navigator.devicePosture)),
      gamepad_api: !!(navigator && navigator.getGamepads),
      device_memory: navigator.deviceMemory !== undefined,
      hardware_concurrency: navigator.hardwareConcurrency !== undefined,
      css_supports: !!(window.CSS && CSS.supports)
    };
  }

  function confidenceBand(score) {
    score = Number(score) || 0;
    if (score >= 90) return "very high confidence";
    if (score >= 70) return "high confidence";
    if (score >= 50) return "medium confidence";
    if (score >= 30) return "weak inference";
    return "unknown or insufficient evidence";
  }

  function compactBand(score) {
    score = Number(score) || 0;
    if (score >= 90) return "very_high";
    if (score >= 70) return "high";
    if (score >= 50) return "medium";
    if (score >= 30) return "weak";
    return "unknown";
  }

  function payloadSizeBucket(bytes) {
    bytes = Number(bytes) || 0;
    if (bytes <= 0) return "unknown";
    if (bytes < 1500) return "lt_1_5kb";
    if (bytes < 3000) return "1_5kb_3kb";
    if (bytes < 5000) return "3kb_5kb";
    if (bytes < 6200) return "5kb_6_2kb";
    return "gte_6_2kb";
  }

  function inferDeviceConfidence(config) {
    var ua = getUserAgent();
    var width = getViewportWidth();
    var height = getViewportHeight();
    var touch = hasTouch();
    var maxTouch = navigator.maxTouchPoints || 0;
    var platform = getNavigatorPlatform();
    var vendorNav = getNavigatorVendor();
    var browser = getBrowserFamily();
    var os = getOsFamily();
    var input = getInputSignals();
    var evidence = [];
    var flags = [];
    var contradictions = [];
    var score = 20;
    var cls = "unknown";
    var subclass = "";
    var vendor = "";
    var model = "";
    var family = "";
    var ecosystem = "unknown";
    var formFactor = "unknown";
    var screenContext = "unknown";
    var inputContext = input.touchClass || "unknown";
    var browserContext = getInAppBrowserFamily() !== "none" ? "in_app_browser" : (isWebView() ? "webview" : "browser");
    var consoleFamily = "";
    var tvOs = "";
    var detectionVersion = config.deviceDetection && config.deviceDetection.version ? config.deviceDetection.version : "2026-06-13-device-taxonomy-2";
    var aspect = getAspectRatio();
    var uaStrong = false;

    function addEvidence(text, points) {
      evidence.push(text);
      if (points) score += points;
    }
    function setClass(nextClass, nextSubclass, nextVendor, points, text) {
      cls = nextClass || cls;
      subclass = nextSubclass || subclass;
      vendor = nextVendor || vendor;
      uaStrong = points >= 50 || uaStrong;
      addEvidence(text, points || 0);
    }

    if (width < 480) screenContext = "compact_phone_viewport";
    else if (width < 768) screenContext = "wide_phone_viewport";
    else if (width < 900) screenContext = height >= width ? "tablet_portrait_viewport" : "small_landscape_viewport";
    else if (width < 1024) screenContext = "policy_zone_900_1023";
    else if (width < 1280) screenContext = "small_desktop_or_tablet_landscape";
    else if (width < 1920) screenContext = "desktop_viewport";
    else screenContext = "large_desktop_or_public_display";

    if (/PlayStation|PS4|PS5|PlayStation 4|PlayStation 5/i.test(ua)) {
      setClass("game_console", "playstation", "Sony", 78, "explicit PlayStation UA token");
      consoleFamily = "PlayStation";
      ecosystem = "sony_playstation";
      formFactor = "living_room_console";
    } else if (/Xbox|Xbox One|Xbox Series X|Xbox Series S/i.test(ua)) {
      setClass("game_console", "xbox", "Microsoft", 78, "explicit Xbox UA token");
      consoleFamily = "Xbox";
      ecosystem = "microsoft_xbox";
      formFactor = "living_room_console";
    } else if (/NintendoBrowser|Nintendo Switch|WiiU|Wii/i.test(ua)) {
      setClass("game_console", "nintendo", "Nintendo", 78, "explicit Nintendo UA token");
      consoleFamily = /Switch/i.test(ua) ? "Nintendo Switch" : "Nintendo";
      ecosystem = "nintendo";
      formFactor = "living_room_console_or_handheld";
    } else if (/AppleTV|Apple TV/i.test(ua)) {
      setClass("smart_tv", "apple_tv_like", "Apple", 78, "explicit Apple TV UA token");
      tvOs = "Apple TV";
      ecosystem = "apple_tv";
      formFactor = "living_room_tv";
    } else if (/Tizen/i.test(ua)) {
      setClass("smart_tv", "samsung_tizen_tv", "Samsung", 78, "explicit Tizen TV UA token");
      tvOs = "Tizen";
      ecosystem = "samsung_tizen";
      formFactor = "living_room_tv";
    } else if (/Web0S|webOS|NetCast/i.test(ua)) {
      setClass("smart_tv", "lg_webos_tv", "LG", 78, "explicit webOS/NetCast TV UA token");
      tvOs = "webOS";
      ecosystem = "lg_webos";
      formFactor = "living_room_tv";
    } else if (/Roku|RokuBrowser|DIAL/i.test(ua)) {
      setClass("smart_tv", "roku", "Roku", 78, "explicit Roku UA token");
      tvOs = "Roku";
      ecosystem = "roku";
      formFactor = "living_room_tv";
    } else if (/AFT[A-Z0-9]*|Fire TV/i.test(ua)) {
      setClass("smart_tv", "fire_tv_like", "Amazon", 78, "explicit Fire TV/AFT UA token");
      tvOs = "Fire TV";
      ecosystem = "amazon_fire_tv";
      formFactor = "living_room_tv";
    } else if (/Android TV|GoogleTV|Google TV/i.test(ua)) {
      setClass("smart_tv", /GoogleTV|Google TV/i.test(ua) ? "google_tv_like" : "android_tv", "Google", 78, "explicit Android TV / Google TV UA token");
      tvOs = /GoogleTV|Google TV/i.test(ua) ? "Google TV" : "Android TV";
      ecosystem = "android_tv";
      formFactor = "living_room_tv";
    } else if (/CrKey|Chromecast/i.test(ua)) {
      setClass("set_top_box", "chromecast_like", "Google", 68, "explicit Chromecast/CrKey UA token");
      tvOs = "Chromecast";
      ecosystem = "google_cast";
      formFactor = "living_room_tv";
    } else if (/HbbTV|SmartTV|SMART-TV|BRAVIA|VIERA|AquosBrowser|Hisense|NetTV|DTV/i.test(ua)) {
      setClass("smart_tv", "generic_tv_browser", "", 68, "explicit smart TV/browser UA token");
      tvOs = /BRAVIA/i.test(ua) ? "Sony TV" : (/VIERA/i.test(ua) ? "Panasonic TV" : "generic TV");
      ecosystem = "living_room_tv";
      formFactor = "living_room_tv";
    } else if (/SHIELD|MiBOX|MIBOX|Mi Box/i.test(ua)) {
      setClass("set_top_box", "android_tv_box_like", /SHIELD/i.test(ua) ? "NVIDIA" : "Xiaomi", 72, "explicit Android TV box UA token");
      ecosystem = "android_tv_box";
      formFactor = "set_top_box";
    } else if (/iPhone|iPod/i.test(ua)) {
      setClass("phone", "iphone", "Apple", 76, "explicit iPhone/iPod UA token");
      ecosystem = "apple_ios";
      formFactor = "phone";
    } else if (/iPad/i.test(ua)) {
      setClass("tablet", "ipad", "Apple", 76, "explicit iPad UA token");
      ecosystem = "apple_ipados";
      formFactor = "tablet";
    } else if (/Macintosh/i.test(ua) && /Safari|AppleWebKit/i.test(ua) && touch && maxTouch > 1) {
      setClass("tablet", "ipad_like_desktop_mode", "Apple", 56, "Macintosh UA plus WebKit and touch points suggests iPadOS desktop mode");
      ecosystem = "apple_ipados";
      formFactor = "tablet";
    } else if (/Android/i.test(ua) && /Mobile/i.test(ua)) {
      setClass("phone", "android_phone", "", 66, "Android Mobile UA token");
      ecosystem = "android";
      formFactor = "phone";
    } else if (/Android/i.test(ua) && !/Mobile/i.test(ua)) {
      if (!touch && width >= 1024 && Number(aspect) >= 1.55) {
        setClass("set_top_box", "android_box_or_tablet_ambiguous", "", 45, "Android UA without Mobile, no touch and TV-like viewport");
        ecosystem = "android_ambiguous_living_room";
        formFactor = "set_top_box_or_tablet";
        flags.push("Android without Mobile can mean tablet, desktop-mode browser or TV box");
      } else {
        setClass("tablet", "android_tablet_like", "", 52, "Android UA without Mobile token");
        ecosystem = "android";
        formFactor = "tablet";
      }
    } else if (/CrOS/i.test(ua) && touch) {
      setClass("desktop_or_tablet", "chromeos_tablet_like", "Google", 40, "ChromeOS plus touch");
      ecosystem = "chromeos";
      formFactor = "chromeos_tablet_or_laptop";
    } else if (/Windows/i.test(ua) && touch) {
      setClass("desktop_or_hybrid", "windows_touch_hybrid_possible", "Microsoft", 28, "Windows plus touch");
      ecosystem = "windows";
      formFactor = "hybrid_or_desktop";
      flags.push("Surface/hybrid is weak inference unless explicit model token is present");
    } else if (isPhoneUserAgent()) {
      setClass("phone", "phone_ua_parser_match", "", 60, "phone UA parser match");
      formFactor = "phone";
    } else if (isTabletUserAgent()) {
      setClass("tablet", "tablet_ua_parser_match", "", 54, "tablet UA parser match");
      formFactor = "tablet";
    } else if (width <= 480 && touch) {
      setClass("phone", "viewport_phone_touch", "", 35, "phone-sized viewport plus touch");
      formFactor = "phone";
    } else if (width <= 1024 && touch) {
      setClass("tablet_or_touch_laptop", "touch_viewport_ambiguous", "", 25, "tablet-sized viewport plus touch without strong UA token");
      formFactor = "tablet_or_touch_laptop";
    } else if (width >= 1920 && !touch) {
      setClass("desktop", "desktop_or_public_display", "", 42, "large viewport and no touch");
      formFactor = "desktop_or_public_display";
      flags.push("large non-touch viewport is weak kiosk/public display evidence, not TV by itself");
    } else if (width >= 1024) {
      setClass("desktop", "desktop_sized_browser", "", 42, "desktop-sized viewport");
      formFactor = "desktop";
    }

    var modelMatch = /(SM-[A-Z0-9]+|Pixel\s?[A-Z0-9 ]+|Nexus\s?[A-Z0-9 ]+|AFT[A-Z0-9]+|SHIELD|MiBOX|MIBOX)/i.exec(ua);
    if (modelMatch && modelMatch[1]) model = limit(modelMatch[1], 80);
    if (/SM-X/i.test(model || ua)) {
      vendor = "Samsung";
      family = "Galaxy Tab";
      cls = "tablet";
      subclass = "samsung_galaxy_tab";
      ecosystem = "android_samsung";
      formFactor = "tablet";
      score = Math.max(score, 95);
      evidence.push("Samsung SM-X model prefix indicates Galaxy Tab family");
    } else if (/Samsung|SM-/i.test(ua)) {
      vendor = vendor || "Samsung";
      family = family || "Galaxy";
      ecosystem = ecosystem === "unknown" ? "android_samsung" : ecosystem;
    }

    if (navigator.userAgentData && navigator.userAgentData.mobile === true && cls === "unknown") {
      cls = "phone";
      formFactor = "phone";
      score = Math.max(score, 70);
      evidence.push("UA-CH mobile=true");
    }
    if (touch && input.anyPointerFine && /phone|smart_tv|game_console/i.test(cls)) {
      contradictions.push("fine pointer plus touch may indicate hybrid/browser emulation");
      if (!uaStrong) score -= 10;
    }
    if (!touch && /phone|tablet/i.test(cls) && !/AppleTV|SmartTV|Tizen|Roku|AFT|Android TV/i.test(ua)) {
      contradictions.push("mobile/tablet class without touch support");
      score -= 12;
    }
    if (/Mobile/i.test(ua) && /smart_tv|set_top_box|game_console/i.test(cls)) {
      contradictions.push("Mobile token on living-room class; user agent may be spoofed");
      score -= 8;
    }
    if (uaReducedLikely()) flags.push("reduced UA likely; exact browser/platform inference limited");
    if (getInAppBrowserFamily() !== "none") evidence.push("in-app browser family: " + getInAppBrowserFamily());

    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      inferredDeviceClass: cls,
      inferredDeviceSubclass: subclass,
      inferredDeviceVendor: vendor,
      inferredDeviceModel: model,
      inferredModelFamily: family,
      inferredDeviceEcosystem: ecosystem,
      inferredFormFactor: formFactor,
      inferredScreenContext: screenContext,
      inferredInputContext: inputContext,
      inferredBrowserContext: browserContext,
      inferredIsPhone: cls === "phone",
      inferredIsLargePhone: cls === "phone" && width >= 390,
      inferredIsSmallPhone: cls === "phone" && width < 390,
      inferredIsTablet: cls === "tablet" || cls === "tablet_or_touch_laptop" || cls === "desktop_or_tablet",
      inferredIsLargeTablet: (cls === "tablet" || cls === "tablet_or_touch_laptop") && width >= 900,
      inferredIsIpadLike: subclass === "ipad" || subclass === "ipad_like_desktop_mode",
      inferredIsIpadDesktopMode: subclass === "ipad_like_desktop_mode",
      inferredIsAndroidTabletLike: /Android/i.test(ua) && cls === "tablet",
      inferredIsSamsungGalaxyTabLike: family === "Galaxy Tab",
      inferredIsChromeosTabletLike: subclass === "chromeos_tablet_like",
      inferredIsWindowsTouchHybrid: subclass === "windows_touch_hybrid_possible",
      inferredIsSurfaceLike: subclass === "windows_touch_hybrid_possible",
      inferredIsFoldablePossible: !!((window.DevicePosture || (navigator && navigator.devicePosture)) || (navigator.userAgentData && navigator.userAgentData.mobile && width >= 600 && touch)),
      inferredDevicePosture: (window.DevicePosture || (navigator && navigator.devicePosture)) ? "api_available" : "unknown",
      inferredIsDesktopLike: cls === "desktop" || cls === "desktop_or_hybrid" || cls === "desktop_or_tablet",
      inferredIsLaptopLike: /Macintosh|Windows|CrOS/i.test(ua) && width >= 1024 && width < 1920 && input.keyboardMouseLikely,
      inferredIsKioskOrPublicDisplayPossible: width >= 1920 && !touch,
      inferredIsSmartTv: cls === "smart_tv",
      inferredTvOs: tvOs,
      inferredIsAppleTvLike: subclass === "apple_tv_like",
      inferredIsAndroidTv: subclass === "android_tv",
      inferredIsGoogleTvLike: subclass === "google_tv_like",
      inferredIsFireTvLike: subclass === "fire_tv_like",
      inferredIsTizenTv: subclass === "samsung_tizen_tv",
      inferredIsWebosTv: subclass === "lg_webos_tv",
      inferredIsRoku: subclass === "roku",
      inferredIsAndroidTvBoxLike: subclass === "android_tv_box_like" || subclass === "chromecast_like",
      inferredIsSetTopBoxLike: cls === "set_top_box" || /box|chromecast/i.test(subclass),
      inferredIsGameConsole: cls === "game_console",
      inferredConsoleFamily: consoleFamily,
      inferredIsPlaystation: consoleFamily === "PlayStation",
      inferredIsXbox: consoleFamily === "Xbox",
      inferredIsNintendo: /^Nintendo/i.test(consoleFamily),
      inferredIsVrHeadsetLike: /Quest|Oculus|Meta Quest|VR/i.test(ua),
      inferredIsCarBrowserLike: /CarPlay|Android Auto|Automotive/i.test(ua),
      inferredIsEReaderLike: /Kindle|Kobo|Nook|Silk/i.test(ua) && !/AFT/i.test(ua),
      inferredIsWebview: isWebView(),
      inferredInAppBrowserFamily: getInAppBrowserFamily(),
      inferredIsBot: false,
      inferredIsLinkPreview: false,
      inferredConfidenceScore: score,
      inferredConfidenceBand: confidenceBand(score),
      inferredConfidenceBandCompact: compactBand(score),
      inferredConfidenceReason: limit(evidence.join("; ") || "insufficient evidence", 260),
      inferredPrimaryEvidence: limit(evidence[0] || "insufficient evidence", 180),
      inferredEvidenceJson: safeJson({ evidence: evidence, width: width, height: height, touch: touch, maxTouchPoints: maxTouch, platform: platform, vendor: vendorNav, browser: browser, os: os, aspectRatio: aspect }, 900),
      inferredWarningFlagsJson: safeJson({ flags: flags }, 500),
      inferredContradictionFlagsJson: safeJson({ contradictions: contradictions }, 500),
      inferredDetectionVersion: detectionVersion
    };
  }

  function hashString(value) {
    var hash = 0;
    var i;
    value = String(value || "");
    for (i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash = hash & hash;
    }
    return "h" + Math.abs(hash).toString(16);
  }

  function getRoutePolicyResult(routeDecision) {
    if (!routeDecision) return "unknown";
    if (routeDecision.forcedLayoutApplied) return "forced_override";
    if (routeDecision.safeFallbackUsed) return "safe_fallback";
    if (routeDecision.bot && routeDecision.bot.isBot) return routeDecision.bot.isPreview ? "link_preview_policy" : "bot_policy";
    return "policy_auto";
  }

  function getCountExclusionReason(eventType, mode, routeDecision, config, counted) {
    if (counted) return "";
    eventType = String(eventType || "");
    if (mode && mode.debug) return "debug_mode";
    if (mode && mode.noRedirect) return "no_redirect_mode";
    if (mode && mode.health) return "health_mode";
    if (mode && mode.list) return "list_mode";
    if (/diagnostic/i.test(eventType)) return "diagnostic_event";
    if (/manual/i.test(eventType)) return "manual_event";
    if (/debug/i.test(eventType)) return "debug_event";
    if (/test/i.test(eventType)) return "test_event";
    if (routeDecision && routeDecision.bot && routeDecision.bot.isBot) return routeDecision.bot.isPreview ? "link_preview_bot" : "known_bot";
    if (eventType !== "router_redirect" && eventType !== "router_noscript") return "non_visit_event";
    return "count_as_visit_false";
  }

  function getUachBasic() {
    var result = { available: false, brandsJson: "", mobile: "", platform: "", signalQuality: "unsupported" };
    try {
      if (!navigator.userAgentData) return result;
      result.available = true;
      result.brandsJson = safeJson(navigator.userAgentData.brands || [], 300);
      result.mobile = navigator.userAgentData.mobile === true ? "true" : (navigator.userAgentData.mobile === false ? "false" : "");
      result.platform = limit(navigator.userAgentData.platform || "", 80);
      result.signalQuality = "low_entropy";
    } catch (error) {
      result.signalQuality = "error";
    }
    return result;
  }

  function collectUachHighEntropy(callback) {
    var basic = getUachBasic();
    var hints = ["architecture", "bitness", "model", "platformVersion", "fullVersionList", "formFactors", "wow64"];
    if (!navigator.userAgentData || !navigator.userAgentData.getHighEntropyValues) {
      callback(basic);
      return;
    }
    try {
      navigator.userAgentData.getHighEntropyValues(hints).then(function (values) {
        basic.architecture = limit(values.architecture || "", 80);
        basic.bitness = limit(values.bitness || "", 20);
        basic.model = limit(values.model || "", 120);
        basic.platformVersion = limit(values.platformVersion || "", 120);
        basic.fullVersionListJson = safeJson(values.fullVersionList || [], 500);
        basic.formFactorsJson = safeJson(values.formFactors || [], 300);
        basic.wow64 = values.wow64 === true ? "true" : (values.wow64 === false ? "false" : "");
        basic.signalQuality = "high_entropy_returned";
        callback(basic);
      }).catch(function (error) {
        basic.error = limit(error && error.message ? error.message : String(error), 160);
        basic.signalQuality = "high_entropy_error";
        callback(basic);
      });
    } catch (error) {
      basic.error = limit(error && error.message ? error.message : String(error), 160);
      basic.signalQuality = "high_entropy_error";
      callback(basic);
    }
  }

  function getLanguages() {
    try {
      if (navigator.languages && navigator.languages.length) {
        return navigator.languages.slice(0, 5).join(",");
      }
    } catch (error) {}
    return navigator.language || "";
  }

  function getConnectionType() {
    try {
      var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!connection) return "unknown";
      return connection.effectiveType || connection.type || "unknown";
    } catch (error) {}
    return "unknown";
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

  function getOsVersionHint() {
    var ua = getUserAgent();
    var match = /Android\s+([0-9.]+)/i.exec(ua) ||
      /CPU(?: iPhone)? OS\s+([0-9_]+)/i.exec(ua) ||
      /Windows NT\s+([0-9.]+)/i.exec(ua) ||
      /Mac OS X\s+([0-9_]+)/i.exec(ua);

    return match && match[1] ? limit(match[1].replace(/_/g, "."), 80) : "";
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
    var confidence = "medium confidence";
    var reason = "no referrer or UTM source";
    var inApp = getInAppBrowserFamily();

    if (utmSource) {
      confidence = "high confidence";
      if (/^island\.is$/i.test(utmSource) || /^islandis$/i.test(utmSource)) {
        source = "island_is_public";
        reason = "utm_source indicates island.is";
      } else if (/^root_index$/i.test(utmSource) || /^public_gateway$/i.test(utmSource)) {
        source = "root_index";
        reason = "utm_source indicates root index gateway";
      } else if (/^qr$/i.test(utmSource) || /^qrcode$/i.test(utmSource)) {
        source = "qr_code";
        reason = "utm_source indicates QR";
      } else if (/teams/i.test(utmSource)) {
        source = "internal_teams";
        reason = "utm_source indicates Teams";
      } else if (/outlook|email|mail/i.test(utmSource) || /email/i.test(utmMedium)) {
        source = "internal_email";
        reason = "utm source/medium indicates email";
      } else if (/sharepoint|intranet/i.test(utmSource)) {
        source = "internal_intranet";
        reason = "utm_source indicates intranet/sharepoint";
      } else {
        source = "campaign_or_other_utm";
        reason = "utm_source present but not recognized as public/internal predefined source";
      }
    } else if (sameDomainOrSubdomain(referrerDomain, rules.islandDomains || [])) {
      source = "island_is_public";
      confidence = "high confidence";
      reason = "referrer domain matches island.is";
    } else if (sameDomainOrSubdomain(referrerDomain, rules.internalDomains || [])) {
      source = "internal_referrer";
      confidence = "medium confidence";
      reason = "referrer domain matches configured internal domain";
    } else if (/teams/i.test(inApp)) {
      source = "internal_teams";
      confidence = "medium confidence";
      reason = "Teams in-app browser detected";
    } else if (/outlook/i.test(inApp)) {
      source = "internal_email";
      confidence = "medium confidence";
      reason = "Outlook in-app browser detected";
    } else if (referrerDomain) {
      source = "external_referrer";
      confidence = "medium confidence";
      reason = "external referrer domain present";
    }

    return {
      entrySourceCategory: source,
      referrerDomain: referrerDomain,
      utmSource: utmSource,
      utmMedium: limit(params.utm_medium || "", 80),
      utmCampaign: limit(params.utm_campaign || "", 120),
      utmContent: limit(params.utm_content || "", 120),
      utmTerm: limit(params.utm_term || "", 120),
      utmId: limit(params.utm_id || "", 120),
      sourceConfidenceBand: confidence,
      sourceReason: reason
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
    var visual = getVisualViewportInfo();
    var usableWidth = visual.available && visual.width ? Math.min(width, Number(visual.width) || width) : width;
    var usableHeight = visual.available && visual.height ? Math.min(height, Number(visual.height) || height) : height;
    var mobileBreakpoint = Number(dashboard && dashboard.mobileBreakpoint) || Number(routing.mobileBreakpoint) || 768;
    var tabletLandscapeDesktopMinWidth = Number(dashboardPolicy.tabletLandscapeDesktopMinWidth) || Number(routing.tabletLandscapeDesktopMinWidth) || 1024;
    var tabletLandscapeMinHeight = Number(dashboardPolicy.tabletLandscapeMinHeight) || Number(routing.tabletLandscapeMinHeight) || 600;
    var desktopMinWidth = Number(dashboardPolicy.desktopMinWidth) || Number(routing.desktopMinWidth) || 1280;
    var narrowDesktopMaxWidth = Number(dashboardPolicy.narrowDesktopMaxWidth) || Number(routing.narrowDesktopMaxWidth) || 1023;
    var isTablet = isTabletUserAgent();
    var isPhone = isPhoneUserAgent();
    var landscape = usableWidth >= usableHeight;
    var layout;
    var reason;
    var detail;
    var inferred = inferDeviceConfidence(config);

    if (bot.isBot) {
      layout = dashboardPolicy.bot || routing.previewBotLayout || "desktop";
      return { layout: layout, reason: bot.isPreview ? "link_preview_bot" : "known_bot", detail: bot.reason || "bot or preview user agent" };
    }

    if (isPhone || inferred.inferredIsPhone || usableWidth < 768) {
      layout = dashboardPolicy.phone || dashboardPolicy.largePhone || "mobile";
      return { layout: layout, reason: isPhone ? "phone_user_agent" : "phone_or_narrow_viewport", detail: "usable viewport " + usableWidth + " px selected " + layout };
    }

    if (inferred.inferredIsSmartTv || inferred.inferredIsGameConsole || inferred.inferredIsSetTopBoxLike) {
      if (usableWidth >= tabletLandscapeDesktopMinWidth) {
        layout = inferred.inferredIsGameConsole ? (dashboardPolicy.console || dashboardPolicy.desktop || "desktop") : (dashboardPolicy.smartTv || dashboardPolicy.desktop || "desktop");
        return { layout: layout, reason: inferred.inferredIsGameConsole ? "console_policy" : "living_room_policy", detail: "living-room class with usable width " + usableWidth + " px selected " + layout };
      }
      layout = dashboardPolicy.narrowViewport || dashboardPolicy.fallback || routing.fallbackLayout || "mobile";
      return { layout: layout, reason: "living_room_narrow_fallback", detail: "living-room class but usable width below " + tabletLandscapeDesktopMinWidth + " px" };
    }

    if (isTablet || inferred.inferredIsTablet) {
      if (!landscape) {
        layout = dashboardPolicy.tabletPortrait || routing.tabletPortraitLayout || "mobile";
        return { layout: layout, reason: "tablet_portrait", detail: "tablet portrait usable viewport " + usableWidth + "×" + usableHeight + " selected " + layout };
      }
      if (usableWidth >= tabletLandscapeDesktopMinWidth && usableHeight >= tabletLandscapeMinHeight) {
        layout = String(dashboardPolicy.tabletLandscape || "").indexOf("desktop") === 0 ? "desktop" : (dashboardPolicy.tabletLandscape || routing.tabletLandscapeLayout || "desktop");
        return { layout: layout, reason: "tablet_landscape_policy_desktop", detail: "tablet landscape usable width " + usableWidth + " >= " + tabletLandscapeDesktopMinWidth + " and height " + usableHeight + " >= " + tabletLandscapeMinHeight };
      }
      layout = dashboardPolicy.tabletPortrait || dashboardPolicy.narrowViewport || routing.narrowDesktopStrategy || "mobile";
      return { layout: layout, reason: "tablet_landscape_policy_mobile", detail: "tablet landscape usable viewport below desktop policy threshold" };
    }

    if (usableWidth <= mobileBreakpoint) {
      layout = dashboardPolicy.narrowViewport || routing.narrowDesktopStrategy || "mobile";
      return { layout: layout, reason: "narrow_viewport", detail: "usable viewport width " + usableWidth + " <= " + mobileBreakpoint };
    }

    if (usableWidth <= narrowDesktopMaxWidth) {
      layout = dashboardPolicy.narrowDesktop || dashboardPolicy.narrowViewport || routing.narrowDesktopStrategy || "mobile";
      return { layout: layout, reason: "narrow_desktop_policy", detail: "usable viewport width " + usableWidth + " <= narrow desktop max " + narrowDesktopMaxWidth };
    }

    if (usableWidth < desktopMinWidth) {
      layout = dashboardPolicy.desktopPolicyZone || dashboardPolicy.desktop || "desktop";
      return { layout: layout, reason: "desktop_policy_zone", detail: "usable viewport width " + usableWidth + " is policy zone below desktopMinWidth " + desktopMinWidth };
    }

    layout = dashboardPolicy.desktop || "desktop";
    return { layout: layout, reason: "desktop_viewport", detail: "desktop usable width " + usableWidth + " selected " + layout };
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
    var themeSignal = getThemeSignal();
    var diagnostics = !!(config.tracking && config.tracking.diagnosticsEnabled) || !!(mode && (mode.debug || mode.noRedirect)) || hasQueryFlag("diagnostics");
    var visualViewport = getVisualViewportInfo();
    var orientationInfo = getOrientationInfo();
    var performanceTimings = getPerformanceTimings();
    var connection = getConnectionStats();
    var input = getInputSignals();
    var inferred = inferDeviceConfidence(config);
    var uach = getUachBasic();
    var counted;
    var payload;

    if (routeDecision && routeDecision.bot) {
      inferred.inferredIsBot = !!routeDecision.bot.isBot;
      inferred.inferredIsLinkPreview = !!routeDecision.bot.isPreview;
    }

    counted = countForEvent(eventType, mode || {}, routeDecision, config);
    payload = {
      schema_version: (config.tracking && config.tracking.schemaVersion) || config.schemaVersion || "5",
      event_id: nextEventId(),
      request_id: requestId,
      event_type: eventType,
      count_as_visit: counted,
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
      screen_width: window.screen ? screen.width : "",
      screen_height: window.screen ? screen.height : "",
      device_pixel_ratio: window.devicePixelRatio || 1,
      touch: hasTouch(),
      max_touch_points: navigator.maxTouchPoints || 0,
      browser_family: getBrowserFamily(),
      browser_brand: getBrowserBrand(),
      browser_engine: getBrowserEngine(),
      browser_major_version: getBrowserMajorVersion(),
      os_family: getOsFamily(),
      os_version_hint: getOsVersionHint(),
      user_agent: limit(getUserAgent(), 500),
      language: limit(navigator.language || "", 40),
      languages: limit(getLanguages(), 160),
      timezone: limit(getTimezone(), 80),
      color_scheme: themeSignal.colorScheme,
      forced_colors: getForcedColors(),
      prefers_contrast: getPrefersContrast(),
      inverted_colors: getInvertedColors(),
      forced_dark_detection: themeSignal.forcedDarkDetection,
      samsung_dark_mode_status: themeSignal.samsungDarkModeStatus,
      theme_signal_quality: themeSignal.themeSignalQuality,
      connection_type: limit(getConnectionType(), 80),
      page_host: window.location.host || "",
      referrer_domain: source.referrerDomain,
      entry_source_category: routeDecision && routeDecision.bot && routeDecision.bot.isBot ? (routeDecision.bot.isPreview ? "link_preview_bot" : "known_bot") : source.entrySourceCategory,
      utm_source: source.utmSource,
      utm_medium: source.utmMedium,
      utm_campaign: source.utmCampaign,
      utm_content: source.utmContent || (dashboard ? dashboard.utmContent || (dashboard.publicCard && dashboard.publicCard.stableUtmContent) || "" : ""),
      utm_term: source.utmTerm,
      utm_id: source.utmId,
      source_confidence_band: source.sourceConfidenceBand,
      source_reason: source.sourceReason,
      page_path: window.location.pathname || "",
      config_version: config.configVersion || "",
      router_core_version: CORE_VERSION,
      config_source: config.__source || "",
      safe_fallback_used: routeDecision ? !!routeDecision.safeFallbackUsed : false,
      tracking_method: "pending",
      error_message: extra && extra.error_message ? limit(extra.error_message, 400) : "",
      count_exclusion_reason: getCountExclusionReason(eventType, mode || {}, routeDecision, config, counted),
      event_tier: diagnostics ? "debug_or_diagnostic" : "core_production",
      layout_source: routeDecision ? routeDecision.layoutSource || "auto" : "unknown",
      would_auto_use_mobile: routeDecision ? routeDecision.autoSelectedLayout === "mobile" : false,
      route_policy_result: getRoutePolicyResult(routeDecision),
      tablet_strategy_result: routeDecision && /tablet/i.test(routeDecision.routeReason || "") ? routeDecision.routeReason : "not_tablet_route",
      narrow_desktop_strategy_result: routeDecision && /narrow/i.test(routeDecision.routeReason || "") ? routeDecision.routeReason : "not_narrow_route",
      target_url_type: routeDecision && isPowerBiPublishUrl(routeDecision.targetUrl) ? "powerbi_publish_to_web" : "unknown",
      target_url_key_or_hash: routeDecision ? hashString(routeDecision.targetUrl) : "",
      fallback_reason: routeDecision && routeDecision.safeFallbackUsed ? routeDecision.routeReasonDetail || routeDecision.routeReason : "",
      debug_mode: !!(mode && mode.debug),
      no_redirect_mode: !!(mode && mode.noRedirect),
      bot_reason: routeDecision && routeDecision.bot ? limit(routeDecision.bot.reason || "", 100) : "",
      link_preview_reason: routeDecision && routeDecision.bot && routeDecision.bot.isPreview ? limit(routeDecision.bot.reason || "", 100) : "",
      layout_viewport_width: getViewportWidth(),
      layout_viewport_height: getViewportHeight(),
      visual_viewport_available: visualViewport.available,
      visual_viewport_width: visualViewport.width,
      visual_viewport_height: visualViewport.height,
      visual_viewport_scale: visualViewport.scale,
      screen_avail_width: window.screen ? numberOrEmpty(screen.availWidth) : "",
      screen_avail_height: window.screen ? numberOrEmpty(screen.availHeight) : "",
      orientation_type: orientationInfo.type,
      orientation_angle: orientationInfo.angle,
      is_landscape: orientationInfo.isLandscape,
      aspect_ratio: getAspectRatio(),
      viewport_bucket: getViewportBucket(),
      breakpoint_bucket: getBreakpointBucket(config, dashboard),
      display_class: getDisplayClass(config, dashboard),
      page_visibility_state: document.visibilityState || "unknown",
      navigation_type: getNavigationType(),
      dom_content_loaded_ms: performanceTimings.domContentLoadedMs,
      load_event_ms: performanceTimings.loadEventMs,
      redirect_delay_ms: Number(config.routing && config.routing.redirectDelayMs) || 0,
      script_error_count: scriptErrorCount,
      browser_zoom_or_scale_hint: visualViewport.scale && Number(visualViewport.scale) !== 1 ? "visual_viewport_scale_" + visualViewport.scale : "none_detected",
      has_touch: input.hasTouch,
      pointer_primary: input.pointerPrimary,
      any_pointer_coarse: input.anyPointerCoarse,
      any_pointer_fine: input.anyPointerFine,
      hover_primary: input.hoverPrimary,
      any_hover: input.anyHover,
      touch_class: input.touchClass,
      hybrid_touch_mouse_likely: input.hybridTouchMouseLikely,
      keyboard_mouse_likely: input.keyboardMouseLikely,
      remote_control_likely: input.remoteControlLikely,
      stylus_possible: input.stylusPossible,
      prefers_color_scheme: themeSignal.colorScheme,
      prefers_reduced_motion: getPrefersReducedMotion(),
      prefers_reduced_data: getPrefersReducedData(),
      color_gamut: getColorGamut(),
      dynamic_range: getDynamicRange(),
      theme_confidence_band: getThemeConfidenceBand(themeSignal),
      uach_available: uach.available,
      uach_brands_json: uach.brandsJson,
      uach_mobile: uach.mobile,
      uach_platform: uach.platform,
      uach_signal_quality: uach.signalQuality,
      browser_full_version: getBrowserFullVersion(),
      browser_version_source: getBrowserVersionSource(),
      os_version: getOsVersionHint(),
      os_version_source: getOsVersionHint() ? "user_agent" : "unknown",
      navigator_platform_raw: getNavigatorPlatform(),
      navigator_vendor: getNavigatorVendor(),
      ua_reduced_likely: uaReducedLikely(),
      is_webview: isWebView(),
      in_app_browser_family: getInAppBrowserFamily(),
      hardware_concurrency: navigator.hardwareConcurrency || "",
      device_memory_gb: navigator.deviceMemory || "",
      connection_effective_type: connection.effectiveType,
      connection_downlink: connection.downlink,
      connection_rtt: connection.rtt,
      connection_save_data: connection.saveData,
      connection_signal_quality: connection.signalQuality,
      performance_supported: performanceTimings.supported,
      device_posture_api_available: getFeatureSupport().device_posture_api,
      gamepad_api_available: getFeatureSupport().gamepad_api,
      tracker_send_method: "pending",
      tracker_send_status: "pending",
      endpoint_result_known: false,
      endpoint_slow_possible: false,
      inferred_device_class: inferred.inferredDeviceClass,
      inferred_device_subclass: inferred.inferredDeviceSubclass,
      inferred_device_vendor: inferred.inferredDeviceVendor,
      inferred_device_model: inferred.inferredDeviceModel,
      inferred_model_family: inferred.inferredModelFamily,
      inferred_is_phone: inferred.inferredIsPhone,
      inferred_is_tablet: inferred.inferredIsTablet,
      inferred_is_ipad_like: inferred.inferredIsIpadLike,
      inferred_is_android_tablet_like: inferred.inferredIsAndroidTabletLike,
      inferred_is_samsung_galaxy_tab_like: inferred.inferredIsSamsungGalaxyTabLike,
      inferred_is_surface_like: inferred.inferredIsSurfaceLike,
      inferred_is_chromeos_tablet_like: inferred.inferredIsChromeosTabletLike,
      inferred_is_smart_tv: inferred.inferredIsSmartTv,
      inferred_tv_os: inferred.inferredTvOs,
      inferred_is_console: inferred.inferredIsConsole,
      inferred_is_foldable_possible: inferred.inferredIsFoldablePossible,
      inferred_device_posture: inferred.inferredDevicePosture,
      inferred_is_kiosk_or_public_display_possible: inferred.inferredIsKioskOrPublicDisplayPossible,
      inferred_device_ecosystem: inferred.inferredDeviceEcosystem,
      inferred_form_factor: inferred.inferredFormFactor,
      inferred_screen_context: inferred.inferredScreenContext,
      inferred_input_context: inferred.inferredInputContext,
      inferred_browser_context: inferred.inferredBrowserContext,
      inferred_is_large_phone: inferred.inferredIsLargePhone,
      inferred_is_small_phone: inferred.inferredIsSmallPhone,
      inferred_is_large_tablet: inferred.inferredIsLargeTablet,
      inferred_is_ipad_desktop_mode: inferred.inferredIsIpadDesktopMode,
      inferred_is_windows_touch_hybrid: inferred.inferredIsWindowsTouchHybrid,
      inferred_is_desktop_like: inferred.inferredIsDesktopLike,
      inferred_is_laptop_like: inferred.inferredIsLaptopLike,
      inferred_is_apple_tv_like: inferred.inferredIsAppleTvLike,
      inferred_is_android_tv: inferred.inferredIsAndroidTv,
      inferred_is_google_tv_like: inferred.inferredIsGoogleTvLike,
      inferred_is_fire_tv_like: inferred.inferredIsFireTvLike,
      inferred_is_tizen_tv: inferred.inferredIsTizenTv,
      inferred_is_webos_tv: inferred.inferredIsWebosTv,
      inferred_is_roku: inferred.inferredIsRoku,
      inferred_is_android_tv_box_like: inferred.inferredIsAndroidTvBoxLike,
      inferred_is_set_top_box_like: inferred.inferredIsSetTopBoxLike,
      inferred_is_game_console: inferred.inferredIsGameConsole,
      inferred_console_family: inferred.inferredConsoleFamily,
      inferred_is_playstation: inferred.inferredIsPlaystation,
      inferred_is_xbox: inferred.inferredIsXbox,
      inferred_is_nintendo: inferred.inferredIsNintendo,
      inferred_is_vr_headset_like: inferred.inferredIsVrHeadsetLike,
      inferred_is_car_browser_like: inferred.inferredIsCarBrowserLike,
      inferred_is_e_reader_like: inferred.inferredIsEReaderLike,
      inferred_is_webview: inferred.inferredIsWebview,
      inferred_in_app_browser_family: inferred.inferredInAppBrowserFamily,
      inferred_is_bot: inferred.inferredIsBot,
      inferred_is_link_preview: inferred.inferredIsLinkPreview,
      inferred_confidence_score: inferred.inferredConfidenceScore,
      inferred_confidence_band: inferred.inferredConfidenceBand,
      inferred_confidence_band_compact: inferred.inferredConfidenceBandCompact,
      inferred_confidence_reason: inferred.inferredConfidenceReason,
      inferred_primary_evidence: inferred.inferredPrimaryEvidence,
      inferred_detection_version: inferred.inferredDetectionVersion
    };

    if (extra) {
      if (extra.warning_code) payload.warning_code = limit(extra.warning_code, 120);
      if (extra.warning_detail) payload.warning_detail = limit(extra.warning_detail, 300);
    }

    if (!payload.warning_code && themeSignal.forcedDarkDetection === "detected") {
      payload.warning_code = "forced_dark_detected";
      payload.warning_detail = "Auto/forced dark rendering detected with Canvas system-color probe. color_scheme remains reported preference.";
    } else if (!payload.warning_code && themeSignal.samsungDarkModeStatus === "samsung_forced_dark_possible") {
      payload.warning_code = "samsung_forced_dark_possible";
      payload.warning_detail = "Samsung Internet on Android; reported color-scheme is " + themeSignal.colorScheme + "; browser forced dark may be visually active but is not exposed as a reliable signal.";
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
      payload.theme_evidence_json = safeJson(getThemeEvidence(themeSignal), 700);
      payload.browser_feature_support_json = safeJson(getFeatureSupport(), 700);
      payload.inferred_evidence_json = inferred.inferredEvidenceJson;
      payload.inferred_warning_flags_json = inferred.inferredWarningFlagsJson;
      payload.inferred_contradiction_flags_json = inferred.inferredContradictionFlagsJson;
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
    // imageGet is the primary mobile-safe tracking transport.
    // Hotfix 8: diagnostic fields are intentionally in the compact GET payload.
    // Do not remove screen_width, screen_height, device_pixel_ratio or user_agent;
    // Android/Samsung tests depend on these fields arriving through imageGet.
    var keys = [
      "schema_version", "event_id", "request_id", "event_type", "count_as_visit",
      "dashboard_key", "dashboard_id", "dashboard_name", "public_card_title", "public_entry_page",
      "selected_layout", "auto_selected_layout", "forced_layout", "forced_layout_applied",
      "route_reason", "route_reason_detail", "device_class",
      "viewport_width", "viewport_height", "screen_width", "screen_height",
      "device_pixel_ratio", "touch", "max_touch_points",
      "browser_family", "browser_brand", "browser_engine", "browser_major_version",
      "os_family", "os_version_hint", "user_agent",
      "language", "languages", "timezone",
      "color_scheme", "forced_colors", "prefers_contrast", "inverted_colors",
      "forced_dark_detection", "samsung_dark_mode_status", "theme_signal_quality",
      "connection_type", "page_host", "entry_source_category", "referrer_domain",
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id",
      "source_confidence_band", "source_reason",
      "page_path", "config_version", "router_core_version", "config_source",
      "safe_fallback_used", "tracking_method",
      "warning_code", "warning_detail", "bot_reason", "count_exclusion_reason", "event_tier",
      "layout_source", "would_auto_use_mobile", "route_policy_result", "tablet_strategy_result",
      "narrow_desktop_strategy_result", "target_url_type", "target_url_key_or_hash", "fallback_reason",
      "debug_mode", "no_redirect_mode", "link_preview_reason",
      "layout_viewport_width", "layout_viewport_height", "visual_viewport_available", "visual_viewport_width",
      "visual_viewport_height", "visual_viewport_scale", "screen_avail_width", "screen_avail_height",
      "orientation_type", "orientation_angle", "is_landscape", "aspect_ratio", "viewport_bucket",
      "breakpoint_bucket", "display_class", "page_visibility_state", "navigation_type",
      "dom_content_loaded_ms", "load_event_ms", "redirect_delay_ms", "script_error_count",
      "browser_zoom_or_scale_hint", "has_touch", "pointer_primary", "any_pointer_coarse", "any_pointer_fine",
      "hover_primary", "any_hover", "touch_class", "hybrid_touch_mouse_likely", "keyboard_mouse_likely",
      "remote_control_likely", "stylus_possible", "prefers_color_scheme", "prefers_reduced_motion",
      "prefers_reduced_data", "color_gamut", "dynamic_range", "theme_confidence_band",
      "uach_available", "uach_mobile", "uach_platform", "uach_signal_quality",
      "browser_full_version", "browser_version_source", "os_version", "os_version_source",
      "navigator_platform_raw", "navigator_vendor", "ua_reduced_likely", "is_webview", "in_app_browser_family",
      "hardware_concurrency", "device_memory_gb", "connection_effective_type", "connection_downlink",
      "connection_rtt", "connection_save_data", "connection_signal_quality", "performance_supported",
      "device_posture_api_available", "gamepad_api_available",
      "tracker_send_method", "tracker_send_status", "tracker_send_start_ms", "tracker_send_ms",
      "tracker_payload_size_bytes", "payload_size_bytes", "payload_size_bucket", "imageget_url_length", "imageget_payload_near_limit", "endpoint_result_known",
      "endpoint_slow_possible", "inferred_device_class", "inferred_device_subclass", "inferred_device_vendor",
      "inferred_model_family", "inferred_device_ecosystem", "inferred_form_factor", "inferred_screen_context",
      "inferred_input_context", "inferred_browser_context", "inferred_is_phone", "inferred_is_large_phone", "inferred_is_tablet", "inferred_is_large_tablet", "inferred_is_ipad_like", "inferred_is_ipad_desktop_mode",
      "inferred_is_android_tablet_like", "inferred_is_samsung_galaxy_tab_like", "inferred_is_surface_like", "inferred_is_windows_touch_hybrid",
      "inferred_is_chromeos_tablet_like", "inferred_is_smart_tv", "inferred_tv_os", "inferred_is_apple_tv_like", "inferred_is_android_tv", "inferred_is_google_tv_like", "inferred_is_fire_tv_like", "inferred_is_tizen_tv", "inferred_is_webos_tv", "inferred_is_roku", "inferred_is_console", "inferred_is_game_console", "inferred_console_family",
      "inferred_is_android_tv_box_like", "inferred_is_set_top_box_like", "inferred_is_foldable_possible", "inferred_device_posture", "inferred_is_kiosk_or_public_display_possible",
      "inferred_is_webview", "inferred_in_app_browser_family", "inferred_is_bot", "inferred_is_link_preview", "inferred_confidence_score", "inferred_confidence_band", "inferred_confidence_band_compact", "inferred_primary_evidence", "inferred_detection_version",
      "inferred_confidence_reason"
    ];
    var result = {};
    var i;
    var key;
    var value;

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      value = payload[key];
      if (value !== undefined && value !== null && value !== "") {
        result[key] = String(value);
      }
    }

    return result;
  }


  function encodedQueryLength(params) {
    var length = 0;
    var key;
    for (key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        length += encodeURIComponent(key).length + 1 + encodeURIComponent(params[key]).length + 1;
      }
    }
    return length;
  }

  function pruneImagePayload(config, endpoint, params) {
    var maxLength = Number(config.tracking && config.tracking.maxImageGetUrlLength) || 6500;
    var removable = ["user_agent", "languages", "route_reason_detail", "warning_detail", "navigator_vendor", "navigator_platform_raw", "browser_full_version", "inferred_confidence_reason"];
    var i;
    while (endpoint.length + encodedQueryLength(params) > maxLength && removable.length) {
      delete params[removable.shift()];
    }
    params.tracker_payload_size_bytes = String(encodedQueryLength(params));
    params.payload_size_bytes = params.tracker_payload_size_bytes;
    params.payload_size_bucket = payloadSizeBucket(params.payload_size_bytes);
    params.imageget_url_length = String(endpoint.length + encodedQueryLength(params));
    params.imageget_payload_near_limit = endpoint.length + encodedQueryLength(params) > Math.round(maxLength * (Number(config.tracking && config.tracking.imageGetNearLimitRatio) || 0.82));
    return params;
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
          payload.tracker_send_method = "sendBeacon";
          payload.tracker_send_start_ms = Date.now();
          body = JSON.stringify(payload);
          payload.tracker_payload_size_bytes = body.length;
          payload.payload_size_bytes = body.length;
          blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
          queued = navigator.sendBeacon(endpoint, blob);
          payload.tracker_send_ms = Math.max(0, Date.now() - Number(payload.tracker_send_start_ms || Date.now()));
          payload.tracker_send_status = queued ? "queued" : "not_queued";
          if (queued) return "sendBeacon";
        }

        if (method === "fetchKeepalive" && window.fetch) {
          payload.tracking_method = "fetchKeepalive";
          payload.tracker_send_method = "fetchKeepalive";
          payload.tracker_send_start_ms = Date.now();
          body = JSON.stringify(payload);
          payload.tracker_payload_size_bytes = body.length;
          payload.payload_size_bytes = body.length;
          window.fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            keepalive: true,
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
            body: body
          }).catch(function () {});
          payload.tracker_send_ms = Math.max(0, Date.now() - Number(payload.tracker_send_start_ms || Date.now()));
          payload.tracker_send_status = "queued";
          return "fetchKeepalive";
        }

        if (method === "imageGet") {
          payload.tracking_method = "imageGet";
          payload.tracker_send_method = "imageGet";
          payload.tracker_send_start_ms = Date.now();
          imagePayload = compactForImage(payload);
          imagePayload.cb = String(Date.now()) + String(Math.random()).slice(2);
          imagePayload = pruneImagePayload(config, endpoint, imagePayload);
          payload.tracker_payload_size_bytes = imagePayload.tracker_payload_size_bytes;
          payload.payload_size_bytes = imagePayload.payload_size_bytes;
          payload.imageget_url_length = imagePayload.imageget_url_length;
          payload.payload_size_bucket = imagePayload.payload_size_bucket;
          payload.imageget_payload_near_limit = imagePayload.imageget_payload_near_limit;
          image = new Image(1, 1);
          image.alt = "";
          image.referrerPolicy = "no-referrer-when-downgrade";
          image.src = appendQuery(endpoint, imagePayload);
          window.__lspTrackingPixels = window.__lspTrackingPixels || [];
          payload.tracker_send_ms = Math.max(0, Date.now() - Number(payload.tracker_send_start_ms || Date.now()));
          payload.tracker_send_status = "queued";
          window.__lspTrackingPixels.push(image);
          if (window.__lspTrackingPixels.length > 30) {
            window.__lspTrackingPixels.shift();
          }
          return "imageGet";
        }
      } catch (error) {}
    }

    return "not_sent";
  }



  function sendDiagnosticEnrichment(config, basePayload, mode) {
    var endpoint = config.tracking && config.tracking.endpoint;
    var enabled = !!(config.tracking && config.tracking.diagnosticEnrichmentEnabled);
    var shouldSend = enabled && endpoint && (hasQueryFlag("diagnostics") || (mode && (mode.debug || mode.noRedirect)));
    if (!shouldSend) return;
    if (!(navigator.sendBeacon || window.fetch)) return;

    collectUachHighEntropy(function (uach) {
      var payload = clone(basePayload) || {};
      var body;
      var blob;
      payload.event_id = nextEventId();
      payload.event_type = "router_diagnostic_enrichment";
      payload.count_as_visit = false;
      payload.count_exclusion_reason = "diagnostic_enrichment";
      payload.event_tier = "diagnostic_enrichment";
      payload.tracking_method = navigator.sendBeacon ? "sendBeacon" : "fetchKeepalive";
      payload.tracker_send_method = payload.tracking_method;
      payload.tracker_send_start_ms = Date.now();
      payload.uach_available = uach.available;
      payload.uach_brands_json = uach.brandsJson || "";
      payload.uach_mobile = uach.mobile || "";
      payload.uach_platform = uach.platform || "";
      payload.uach_architecture = uach.architecture || "";
      payload.uach_bitness = uach.bitness || "";
      payload.uach_model = uach.model || "";
      payload.uach_platform_version = uach.platformVersion || "";
      payload.uach_full_version_list_json = uach.fullVersionListJson || "";
      payload.uach_form_factors_json = uach.formFactorsJson || "";
      payload.uach_wow64 = uach.wow64 || "";
      payload.uach_error = uach.error || "";
      payload.uach_signal_quality = uach.signalQuality || "unknown";
      payload.theme_evidence_json = payload.theme_evidence_json || safeJson(getThemeEvidence(getThemeSignal()), 700);
      payload.browser_feature_support_json = payload.browser_feature_support_json || safeJson(getFeatureSupport(), 700);
      body = JSON.stringify(payload);
      if (body.length > (Number(config.tracking && config.tracking.diagnosticEnrichmentMaxBytes) || 16000)) {
        payload.diagnostic_payload_too_large = true;
        payload.uach_full_version_list_json = "";
        payload.browser_feature_support_json = "";
        payload.theme_evidence_json = "";
        payload.inferred_evidence_json = "";
        payload.inferred_warning_flags_json = "";
        payload.inferred_contradiction_flags_json = "";
        body = JSON.stringify(payload);
      }
      payload.tracker_payload_size_bytes = body.length;
      payload.payload_size_bytes = body.length;
      payload.payload_size_bucket = payloadSizeBucket(body.length);
      try {
        if (navigator.sendBeacon) {
          blob = new Blob([JSON.stringify(payload)], { type: "text/plain;charset=UTF-8" });
          navigator.sendBeacon(endpoint, blob);
        } else if (window.fetch) {
          window.fetch(endpoint, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(payload) }).catch(function () {});
        }
      } catch (error) {}
    });
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
    html += "<dt>Vafri</dt><dd>" + escapeHtml(getBrowserBrand()) + " / " + escapeHtml(getBrowserEngine()) + "</dd>";
    html += "<dt>Stýrikerfi</dt><dd>" + escapeHtml(getOsFamily()) + "</dd>";
    html += "<dt>Tungumál</dt><dd>" + escapeHtml(navigator.language || "") + "</dd>";
    html += "<dt>Tímabelti</dt><dd>" + escapeHtml(getTimezone()) + "</dd>";
    var themeSignal = getThemeSignal();
    html += "<dt>Birting</dt><dd>" + escapeHtml(themeSignal.colorScheme) + " / forced-colors: " + escapeHtml(getForcedColors()) + "</dd>";
    html += "<dt>Forced dark</dt><dd>" + escapeHtml(themeSignal.forcedDarkDetection) + "</dd>";
    html += "<dt>Samsung dark</dt><dd>" + escapeHtml(themeSignal.samsungDarkModeStatus) + "</dd>";
    html += "<dt>Theme signal</dt><dd>" + escapeHtml(themeSignal.themeSignalQuality) + "</dd>";
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
          sendDiagnosticEnrichment(config, payload, mode);
        }
        return;
      }

      payload = buildEvent(config, dashboard, routeDecision, "router_redirect", mode, {});
      sendTracking(config, payload);
      sendDiagnosticEnrichment(config, payload, mode);

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
