/**
 * Landspítali Power BI Router Tracker, production v1.2.2.
 *
 * Full replacement Code.gs.
 *
 * Deployment model:
 * - Deploy as Google Apps Script Web App.
 * - Execute as the script owner or operational service account.
 * - Router events are fire-and-forget; routing must never wait for this script.
 *
 * Privacy model:
 * - No cookies, no localStorage identifiers, no raw IP addresses, no names, no emails.
 * - Raw event rows are internal only.
 * - Public/status dashboard endpoint returns aggregate-only data.
 *
 * v1.2.2 update:
 * - Treat forced_dark_detected as a diagnostic display/theme signal.
 * - Add Power BI/Fabric browser-support classification for publish-to-web viewer risk.
 * - Flag old Smart TV / HbbTV / legacy Chromium/Opera browsers as Power BI viewer compatibility risk.
 * - Separate warning_count, confirmed_warning_count and diagnostic_signal_count.
 * - Keep schema 9 advanced device/source fields aligned with the current raw tracker sheet.
 */

var SCRIPT_VERSION = "2026-06-14-tracker-v1.2.2-smarttv-powerbi-compat-full";
var EVENT_SCHEMA_VERSION = "9";
var DEFAULT_TIMEZONE = "Atlantic/Reykjavik";

var TRACKER_SPREADSHEET_ID = "1Hb-yl-1nljg1AArY28hBkqDMkJHyAS8qIrfPU5w5N8Y";
var RETENTION_DAYS = 180;
var AGGREGATION_DAYS = 400;

var DASHBOARD_CACHE_KEY = "dashboard_payload_v7_smarttv_powerbi_compat";
var DASHBOARD_CACHE_SECONDS = 300;
var DASHBOARD_DATA_CELL_CHAR_BUDGET = 45000;
var CONTROL_CELL_CHAR_BUDGET = 45000;
var DASHBOARD_DATA_STORAGE_FORMAT = "chunked_json_v1";

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
var SHEET_DEVICE_CONFIDENCE = "Aggregates_DeviceConfidence";
var SHEET_BROWSER = "Aggregates_Browser";
var SHEET_OS = "Aggregates_OS";
var SHEET_DISPLAY = "Aggregates_Display";
var SHEET_INPUT = "Aggregates_Input";
var SHEET_PERFORMANCE = "Aggregates_Performance";
var SHEET_SCHEMA_MIGRATION_LOG = "Schema_Migration_Log";

var REGISTRY_SNAPSHOT = {
  "configVersion": "2026-06-13-prod-v1.4.0-relaunch.1",
  "schemaVersion": "9",
  "publicEntry": {
    "name": "Opinber mælaborð Landspítala",
    "site": "island.is",
    "pageUrl": "https://island.is/s/landspitali/maelabord",
    "pagePath": "/s/landspitali/maelabord",
    "defaultButtonText": "Opna mælaborð",
    "logoUrl": "https://images.ctfassets.net/8k0h54kbe6bj/6PHUWW83ZRNXU0ydxQsipf/6f460fab1a36daf4c6faf4e604b4741a/Logo.png",
    "lastVerifiedDate": "2026-06-07",
    "allowedImageHosts": ["images.ctfassets.net"],
    "rootGatewayPath": "/Landspitali/",
    "rootGatewayTitle": "Opinber mælaborð Landspítala",
    "rootGatewaySubtitle": "Veldu mælaborð. Síðan opnar sjálfkrafa rétta útgáfu eftir tæki og skjábreidd.",
    "privacyText": "Engar persónuupplýsingar eru birtar. Leiðing og notkun eru mæld með aggregate tæknimerkjum til að bæta birtingu og notendaupplifun."
  },
  "rootIndex": {
    "enabled": true,
    "title": "Opinber mælaborð Landspítala",
    "subtitle": "Veldu mælaborð. Síðan opnar sjálfkrafa rétta útgáfu eftir tæki og skjábreidd.",
    "description": "Mælaborðin eru birt með Power BI publish-to-web. Routerinn velur mobile eða desktop útgáfu eftir raunverulegu skjáplássi, ekki veikum tækjagiskum.",
    "buttonText": "Opna mælaborð",
    "fallbackButtonText": "Opna mælaborð",
    "privacyText": "Engar persónuupplýsingar eru birtar. Leiðing og notkun eru mæld með aggregate tæknimerkjum til að bæta birtingu og notendaupplifun.",
    "showDisabledInDebug": true,
    "showTechnicalDebug": false,
    "trackingSource": "root_index",
    "cardsChipLabels": ["Mobile og desktop útgáfur", "Sjálfvirk leiðing"],
    "configFailureTitle": "Ekki tókst að hlaða miðlægri stillingu",
    "configFailureText": "Fallback kortin nota sömu opinberu slóðir og dashboard möppur."
  },
  "statusDashboard": {
    "name": "Mælaborðsmælingar",
    "path": "status-dashboard/maelabordsmalingar_status_dashboard_v1_4_0.html",
    "version": "2026-06-14-status-v1.4.1-smarttv-powerbi-compat",
    "logoUrl": "https://images.ctfassets.net/8k0h54kbe6bj/6PHUWW83ZRNXU0ydxQsipf/6f460fab1a36daf4c6faf4e604b4741a/Logo.png",
    "endpoint": "https://script.google.com/macros/s/AKfycbxRoNEQwlxQUpxEMGzYizAB0_lP1MdqksGLu4fD7c94rzqUul3MW2_E9VCqeRzLK3wD/exec",
    "payloadApi": "api=dashboard",
    "jsonpCompatible": true,
    "aggregateOnly": true
  },
  "dashboards": {
    "bradamottaka": {
      "enabled": true,
      "status": "active",
      "dashboardId": "bradamottaka-fossvogi",
      "dashboardKey": "bradamottaka",
      "displayName": "Bráðamóttaka í Fossvogi",
      "routerDisplayTitle": "Bráðamóttaka í Fossvogi",
      "powerBiReportTitle": "Bráðamóttaka í Fossvogi",
      "pageTitle": "Opna Bráðamóttöku í Fossvogi",
      "commentName": "Bráðamóttaka í Fossvogi",
      "path": "bradamottaka",
      "aliases": ["bradamottaka", "bradamottaka-fossvogi", "brada", "bráða"],
      "publicCard": {
        "title": "Bráðamóttaka í Fossvogi",
        "description": "Yfirlit yfir stöðu og þróun á bráðamóttöku",
        "buttonText": "Skoða mælaborð",
        "iconUrl": "https://images.ctfassets.net/8k0h54kbe6bj/68Ef7p57VqG1aYv99GbzB0/3b98fe5c7b3b11c7d01194a7e9caccd6/bradamottaka-linkimage.png?w=774&fm=webp&q=80",
        "pageUrl": "https://island.is/s/landspitali/maelabord",
        "published": true,
        "stableUtmContent": "bradamottaka_fossvogi",
        "lastVerifiedDate": "2026-06-07",
        "actionText": "Opna mælaborð",
        "routeLabel": "Sjálfvirk mobile/desktop leiðing",
        "chips": ["Mobile og desktop útgáfur", "Sjálfvirk leiðing"]
      },
      "desktopUrl": "https://app.powerbi.com/view?r=eyJrIjoiNDU4MjNhOGYtMGM0NS00NDBkLThiM2MtNTA2MDFjNjNkNTliIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "mobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNGZlODE2N2ItYzkwZS00ZWYzLTg2YzctMjg5NWY5MmU1NTkyIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "fallbackLayout": "mobile",
      "mobileBreakpoint": 768,
      "routePolicy": {
        "phone": "mobile",
        "largePhone": "mobile",
        "tabletPortrait": "mobile",
        "tabletLandscape": "desktop",
        "narrowViewport": "mobile",
        "narrowDesktop": "mobile",
        "smallDesktop": "desktop",
        "desktop": "desktop",
        "bot": "desktop",
        "compactPhoneMaxWidth": 480,
        "phoneMaxWidth": 767,
        "tabletPortraitMaxWidth": 899,
        "narrowDesktopMaxWidth": 1023,
        "tabletLandscapeDesktopMinWidth": 1024,
        "desktopMinWidth": 1280,
        "validationMobileWidth": 360,
        "validationDesktopWidth": 1410
      },
      "utmContent": "bradamottaka_fossvogi",
      "governance": {
        "ownerTeam": "Landspítali",
        "technicalOwner": "Landspítali mælaborð / vefumsjón",
        "contentOwner": "Landspítali",
        "createdDate": "2026-06-07",
        "lastReviewedDate": "2026-06-07",
        "nextReviewDue": "2026-09-07"
      },
      "rootIndexVisible": true,
      "displayOrder": 10,
      "category": "Opinber mælaborð",
      "fallbackMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNGZlODE2N2ItYzkwZS00ZWYzLTg2YzctMjg5NWY5MmU1NTkyIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "noscriptMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNGZlODE2N2ItYzkwZS00ZWYzLTg2YzctMjg5NWY5MmU1NTkyIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9"
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
      "aliases": ["thjonustukannanir", "thjon", "thjonusta", "þjónustukannanir", "þjón"],
      "publicCard": {
        "title": "Þjónustukannanir",
        "description": "Niðurstöður þjónustukannana ríkisstofnana hjá Landspítala",
        "buttonText": "Skoða mælaborð",
        "iconUrl": "https://images.ctfassets.net/8k0h54kbe6bj/5eK6Vivq6aUDWj2mnOEsvS/7e5d5e7c03b92370ccee175ad01f8330/survey-linkimage.png?w=774&fm=webp&q=80",
        "pageUrl": "https://island.is/s/landspitali/maelabord",
        "published": true,
        "stableUtmContent": "thjonustukannanir",
        "lastVerifiedDate": "2026-06-07",
        "actionText": "Opna mælaborð",
        "routeLabel": "Sjálfvirk mobile/desktop leiðing",
        "chips": ["Mobile og desktop útgáfur", "Sjálfvirk leiðing"]
      },
      "desktopUrl": "https://app.powerbi.com/view?r=eyJrIjoiN2VjNTI5YzAtMGNjMC00MWQ1LTkwY2MtZTAzMzg2NWI4YTdlIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "mobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNmMyZGI1ZjktOTIzMS00MjZlLWFmMjEtMzE2ZTRhYjcyYmQ3IiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "fallbackLayout": "mobile",
      "mobileBreakpoint": 768,
      "routePolicy": {
        "phone": "mobile",
        "largePhone": "mobile",
        "tabletPortrait": "mobile",
        "tabletLandscape": "desktop",
        "narrowViewport": "mobile",
        "narrowDesktop": "mobile",
        "smallDesktop": "desktop",
        "desktop": "desktop",
        "bot": "desktop",
        "compactPhoneMaxWidth": 480,
        "phoneMaxWidth": 767,
        "tabletPortraitMaxWidth": 899,
        "narrowDesktopMaxWidth": 1023,
        "tabletLandscapeDesktopMinWidth": 1024,
        "desktopMinWidth": 1280,
        "validationMobileWidth": 360,
        "validationDesktopWidth": 1410
      },
      "utmContent": "thjonustukannanir",
      "governance": {
        "ownerTeam": "Landspítali",
        "technicalOwner": "Landspítali mælaborð / vefumsjón",
        "contentOwner": "Landspítali",
        "createdDate": "2026-06-07",
        "lastReviewedDate": "2026-06-07",
        "nextReviewDue": "2026-09-07"
      },
      "rootIndexVisible": true,
      "displayOrder": 20,
      "category": "Opinber mælaborð",
      "fallbackMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNmMyZGI1ZjktOTIzMS00MjZlLWFmMjEtMzE2ZTRhYjcyYmQ3IiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "noscriptMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNmMyZGI1ZjktOTIzMS00MjZlLWFmMjEtMzE2ZTRhYjcyYmQ3IiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9"
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
  "raw_query_keys",
  "languages",
  "page_host",
  "browser_brand",
  "browser_engine",
  "color_scheme",
  "forced_colors",
  "prefers_contrast",
  "inverted_colors",
  "forced_dark_detection",
  "samsung_dark_mode_status",
  "theme_signal_quality",
  "count_exclusion_reason",
  "event_tier",
  "layout_source",
  "would_auto_use_mobile",
  "route_policy_result",
  "tablet_strategy_result",
  "narrow_desktop_strategy_result",
  "target_url_type",
  "target_url_key_or_hash",
  "safe_fallback_reason",
  "fallback_reason",
  "debug_mode",
  "no_redirect_mode",
  "link_preview_reason",
  "layout_viewport_width",
  "layout_viewport_height",
  "visual_viewport_available",
  "visual_viewport_width",
  "visual_viewport_height",
  "visual_viewport_scale",
  "screen_avail_width",
  "screen_avail_height",
  "orientation_type",
  "orientation_angle",
  "is_landscape",
  "aspect_ratio",
  "viewport_bucket",
  "breakpoint_bucket",
  "display_class",
  "page_visibility_state",
  "navigation_type",
  "dom_content_loaded_ms",
  "load_event_ms",
  "redirect_delay_ms",
  "tracker_send_start_ms",
  "tracker_send_ms",
  "tracker_payload_size_bytes",
  "payload_size_bytes",
  "imageget_url_length",
  "script_error_count",
  "fallback_link_clicked",
  "browser_zoom_or_scale_hint",
  "has_touch",
  "pointer_primary",
  "any_pointer_coarse",
  "any_pointer_fine",
  "hover_primary",
  "any_hover",
  "touch_class",
  "hybrid_touch_mouse_likely",
  "keyboard_mouse_likely",
  "remote_control_likely",
  "stylus_possible",
  "prefers_color_scheme",
  "prefers_reduced_motion",
  "prefers_reduced_data",
  "color_gamut",
  "dynamic_range",
  "theme_evidence_json",
  "theme_confidence_band",
  "uach_available",
  "uach_brands_json",
  "uach_mobile",
  "uach_platform",
  "uach_architecture",
  "uach_bitness",
  "uach_model",
  "uach_platform_version",
  "uach_full_version_list_json",
  "uach_form_factors_json",
  "uach_wow64",
  "uach_error",
  "uach_signal_quality",
  "browser_full_version",
  "browser_version_source",
  "browser_engine_version",
  "os_version",
  "os_version_source",
  "navigator_platform_raw",
  "navigator_vendor",
  "ua_reduced_likely",
  "is_webview",
  "in_app_browser_family",
  "browser_feature_support_json",
  "inferred_device_class",
  "inferred_device_subclass",
  "inferred_device_vendor",
  "inferred_device_model",
  "inferred_model_family",
  "inferred_is_phone",
  "inferred_is_tablet",
  "inferred_is_ipad_like",
  "inferred_is_android_tablet_like",
  "inferred_is_samsung_galaxy_tab_like",
  "inferred_is_surface_like",
  "inferred_is_chromeos_tablet_like",
  "inferred_is_smart_tv",
  "inferred_tv_os",
  "inferred_is_console",
  "inferred_is_foldable_possible",
  "inferred_device_posture",
  "inferred_is_kiosk_or_public_display_possible",
  "inferred_is_bot",
  "inferred_is_link_preview",
  "inferred_confidence_score",
  "inferred_confidence_band",
  "inferred_confidence_reason",
  "inferred_evidence_json",
  "inferred_warning_flags_json",
  "hardware_concurrency",
  "device_memory_gb",
  "connection_effective_type",
  "connection_downlink",
  "connection_rtt",
  "connection_save_data",
  "connection_signal_quality",
  "performance_supported",
  "tracker_send_method",
  "tracker_send_status",
  "endpoint_result_known",
  "endpoint_slow_possible",
  "source_confidence_band",
  "source_reason",
  "utm_term",
  "utm_id",
  "payload_size_bucket",
  "imageget_payload_near_limit",
  "diagnostic_payload_too_large",
  "device_posture_api_available",
  "gamepad_api_available",
  "inferred_device_ecosystem",
  "inferred_form_factor",
  "inferred_screen_context",
  "inferred_input_context",
  "inferred_browser_context",
  "inferred_is_large_phone",
  "inferred_is_small_phone",
  "inferred_is_large_tablet",
  "inferred_is_ipad_desktop_mode",
  "inferred_is_windows_touch_hybrid",
  "inferred_is_desktop_like",
  "inferred_is_laptop_like",
  "inferred_is_apple_tv_like",
  "inferred_is_android_tv",
  "inferred_is_google_tv_like",
  "inferred_is_fire_tv_like",
  "inferred_is_tizen_tv",
  "inferred_is_webos_tv",
  "inferred_is_roku",
  "inferred_is_android_tv_box_like",
  "inferred_is_set_top_box_like",
  "inferred_is_game_console",
  "inferred_console_family",
  "inferred_is_playstation",
  "inferred_is_xbox",
  "inferred_is_nintendo",
  "inferred_is_vr_headset_like",
  "inferred_is_car_browser_like",
  "inferred_is_e_reader_like",
  "inferred_is_webview",
  "inferred_in_app_browser_family",
  "inferred_confidence_band_compact",
  "inferred_primary_evidence",
  "inferred_detection_version",
  "inferred_contradiction_flags_json",
  "root_dashboard_target_path"
];
var ERROR_HEADERS = [
  "error_time",
  "script_version",
  "source",
  "message",
  "context"
];
var DAILY_HEADERS = [
  "date",
  "dashboard_key",
  "entry_source_category",
  "selected_layout",
  "device_class",
  "visits",
  "events",
  "bots",
  "debug_events",
  "diagnostic_events",
  "fallback_clicks",
  "errors",
  "safe_fallbacks"
];
var HOURLY_HEADERS = [
  "hour_utc",
  "dashboard_key",
  "visits",
  "events",
  "errors",
  "diagnostic_events"
];
var DASHBOARD_HEADERS = [
  "dashboard_key",
  "dashboard_id",
  "dashboard_name",
  "public_card_title",
  "status",
  "visits_today",
  "visits_7d",
  "visits_30d",
  "total_visits",
  "total_events",
  "raw_events",
  "diagnostic_events",
  "mobile_visits",
  "desktop_visits",
  "tablet_visits",
  "narrow_visits",
  "island_is_visits",
  "fallback_clicks",
  "error_events",
  "debug_events",
  "bot_events",
  "safe_fallback_events",
  "last_event_time",
  "last_raw_event_time",
  "last_counted_event_time",
  "last_diagnostic_event_time",
  "last_error_event_time",
  "warning_count",
  "confirmed_warning_count",
  "diagnostic_signal_count",
  "confidence_band",
  "weak_unknown_signal_count",
  "source_mix_summary",
  "route_mix_summary",
  "config_version",
  "core_version"
];
var DEVICE_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "device_class",
  "selected_layout",
  "browser_family",
  "browser_brand",
  "browser_engine",
  "os_family",
  "language",
  "timezone",
  "color_scheme",
  "forced_colors",
  "prefers_contrast",
  "inverted_colors",
  "forced_dark_detection",
  "samsung_dark_mode_status",
  "theme_signal_quality",
  "connection_type",
  "inferred_device_class",
  "inferred_confidence_band",
  "in_app_browser_family",
  "display_class",
  "viewport_bucket",
  "visits",
  "events"
];
var SOURCE_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "entry_source_category",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "visits",
  "events"
];
var ROUTE_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "route_reason",
  "route_reason_detail",
  "selected_layout",
  "auto_selected_layout",
  "forced_layout",
  "forced_layout_applied",
  "layout_source",
  "route_policy_result",
  "tablet_strategy_result",
  "narrow_desktop_strategy_result",
  "visits",
  "events"
];
var QUALITY_HEADERS = [
  "warning_code",
  "dashboard_key",
  "severity",
  "warning_text",
  "recommendation",
  "count",
  "counted_count",
  "diagnostic_count",
  "confirmed_count",
  "last_seen",
  "signal_quality",
  "is_confirmed",
  "confidence_band"
];
var DASHBOARD_REGISTRY_HEADERS = [
  "dashboard_key",
  "dashboard_id",
  "dashboard_name",
  "public_card_title",
  "powerbi_report_title",
  "path",
  "status",
  "desktop_url",
  "mobile_url",
  "fallback_layout",
  "owner_team",
  "technical_owner",
  "content_owner",
  "last_reviewed_date",
  "next_review_due",
  "utm_content"
];
var PUBLIC_REGISTRY_HEADERS = [
  "dashboard_key",
  "public_page_url",
  "public_card_title",
  "public_description",
  "button_text",
  "icon_url",
  "published",
  "last_verified_date"
];
var CONTROL_HEADERS = [
  "key",
  "value"
];
var ARCHIVE_LOG_HEADERS = [
  "archive_time",
  "older_than",
  "rows_archived",
  "archive_sheet",
  "status",
  "message"
];
var DASHBOARD_DATA_HEADERS = [
  "generated_at",
  "chunk_index",
  "chunk_count",
  "json_chunk"
];
var DEVICE_CONFIDENCE_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "inferred_device_class",
  "inferred_device_subclass",
  "inferred_confidence_band",
  "inferred_confidence_score",
  "inferred_confidence_reason",
  "inferred_is_ipad_like",
  "inferred_is_android_tablet_like",
  "inferred_is_samsung_galaxy_tab_like",
  "inferred_is_surface_like",
  "inferred_is_chromeos_tablet_like",
  "inferred_is_smart_tv",
  "in_app_browser_family",
  "visits",
  "events"
];
var BROWSER_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "browser_family",
  "browser_brand",
  "browser_engine",
  "browser_major_version",
  "browser_full_version",
  "browser_version_source",
  "is_webview",
  "in_app_browser_family",
  "visits",
  "events"
];
var OS_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "os_family",
  "os_version",
  "os_version_source",
  "navigator_platform_raw",
  "visits",
  "events"
];
var DISPLAY_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "display_class",
  "viewport_bucket",
  "breakpoint_bucket",
  "selected_layout",
  "prefers_color_scheme",
  "color_scheme",
  "forced_dark_detection",
  "samsung_dark_mode_status",
  "theme_signal_quality",
  "theme_confidence_band",
  "forced_colors",
  "prefers_contrast",
  "prefers_reduced_motion",
  "prefers_reduced_data",
  "color_gamut",
  "dynamic_range",
  "visits",
  "events"
];
var INPUT_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "touch_class",
  "has_touch",
  "pointer_primary",
  "any_pointer_coarse",
  "any_pointer_fine",
  "hover_primary",
  "any_hover",
  "hybrid_touch_mouse_likely",
  "keyboard_mouse_likely",
  "remote_control_likely",
  "stylus_possible",
  "visits",
  "events"
];
var PERFORMANCE_HEADERS = [
  "dashboard_key",
  "dashboard_name",
  "tracker_send_method",
  "tracker_send_status",
  "endpoint_result_known",
  "connection_effective_type",
  "connection_save_data",
  "connection_signal_quality",
  "payload_size_bucket",
  "dom_content_loaded_bucket",
  "load_event_bucket",
  "low_capability_device",
  "visits",
  "events"
];
var SCHEMA_MIGRATION_LOG_HEADERS = [
  "migration_time",
  "script_version",
  "schema_version",
  "action",
  "status",
  "message"
];

var FIELD_DICTIONARY = {
  "server_time": "Server-side receive time in ISO format.",
  "client_time": "Client-side event time supplied by the router.",
  "event_id": "Per-event identifier used for dedupe.",
  "request_id": "Per-router-page-load identifier. Not persistent.",
  "event_type": "Event type, for example router_redirect, root_index_view, root_dashboard_click, fallback_click or router_error.",
  "count_as_visit": "TRUE only for events that should count as real dashboard opens.",
  "duplicate_event": "TRUE if event_id was recently seen by CacheService.",
  "dashboard_key": "Tracker field captured by the router or derived during aggregation.",
  "dashboard_id": "Tracker field captured by the router or derived during aggregation.",
  "dashboard_name": "Tracker field captured by the router or derived during aggregation.",
  "public_card_title": "Tracker field captured by the router or derived during aggregation.",
  "public_entry_page": "Tracker field captured by the router or derived during aggregation.",
  "selected_layout": "Tracker field captured by the router or derived during aggregation.",
  "auto_selected_layout": "Tracker field captured by the router or derived during aggregation.",
  "forced_layout": "Tracker field captured by the router or derived during aggregation.",
  "forced_layout_applied": "Tracker field captured by the router or derived during aggregation.",
  "route_reason": "Tracker field captured by the router or derived during aggregation.",
  "route_reason_detail": "Tracker field captured by the router or derived during aggregation.",
  "device_class": "Tracker field captured by the router or derived during aggregation.",
  "viewport_width": "Tracker field captured by the router or derived during aggregation.",
  "viewport_height": "Tracker field captured by the router or derived during aggregation.",
  "browser_family": "Tracker field captured by the router or derived during aggregation.",
  "browser_major_version": "Tracker field captured by the router or derived during aggregation.",
  "os_family": "Tracker field captured by the router or derived during aggregation.",
  "referrer_domain": "Tracker field captured by the router or derived during aggregation.",
  "entry_source_category": "Tracker field captured by the router or derived during aggregation.",
  "utm_source": "Tracker field captured by the router or derived during aggregation.",
  "utm_medium": "Tracker field captured by the router or derived during aggregation.",
  "utm_campaign": "Tracker field captured by the router or derived during aggregation.",
  "utm_content": "Tracker field captured by the router or derived during aggregation.",
  "page_path": "Tracker field captured by the router or derived during aggregation.",
  "config_version": "Tracker field captured by the router or derived during aggregation.",
  "router_core_version": "Tracker field captured by the router or derived during aggregation.",
  "config_source": "Tracker field captured by the router or derived during aggregation.",
  "safe_fallback_used": "Tracker field captured by the router or derived during aggregation.",
  "tracking_method": "Tracker field captured by the router or derived during aggregation.",
  "error_message": "Tracker field captured by the router or derived during aggregation.",
  "warning_code": "Stable machine-readable warning code.",
  "warning_detail": "Short warning detail. Raw user-agent is kept internal only.",
  "bot_reason": "Tracker field captured by the router or derived during aggregation.",
  "user_agent": "Tracker field captured by the router or derived during aggregation.",
  "screen_width": "Tracker field captured by the router or derived during aggregation.",
  "screen_height": "Tracker field captured by the router or derived during aggregation.",
  "device_pixel_ratio": "Tracker field captured by the router or derived during aggregation.",
  "touch": "Tracker field captured by the router or derived during aggregation.",
  "max_touch_points": "Tracker field captured by the router or derived during aggregation.",
  "language": "Tracker field captured by the router or derived during aggregation.",
  "timezone": "Tracker field captured by the router or derived during aggregation.",
  "os_version_hint": "Tracker field captured by the router or derived during aggregation.",
  "connection_type": "Tracker field captured by the router or derived during aggregation.",
  "received_method": "Tracker field captured by the router or derived during aggregation.",
  "raw_query_keys": "Tracker field captured by the router or derived during aggregation.",
  "languages": "Tracker field captured by the router or derived during aggregation.",
  "page_host": "Tracker field captured by the router or derived during aggregation.",
  "browser_brand": "Tracker field captured by the router or derived during aggregation.",
  "browser_engine": "Tracker field captured by the router or derived during aggregation.",
  "color_scheme": "Tracker field captured by the router or derived during aggregation.",
  "forced_colors": "Tracker field captured by the router or derived during aggregation.",
  "prefers_contrast": "Tracker field captured by the router or derived during aggregation.",
  "inverted_colors": "Tracker field captured by the router or derived during aggregation.",
  "forced_dark_detection": "Tracker field captured by the router or derived during aggregation.",
  "samsung_dark_mode_status": "Tracker field captured by the router or derived during aggregation.",
  "theme_signal_quality": "Tracker field captured by the router or derived during aggregation.",
  "count_exclusion_reason": "Tracker field captured by the router or derived during aggregation.",
  "event_tier": "Tracker field captured by the router or derived during aggregation.",
  "layout_source": "Tracker field captured by the router or derived during aggregation.",
  "would_auto_use_mobile": "Tracker field captured by the router or derived during aggregation.",
  "route_policy_result": "Tracker field captured by the router or derived during aggregation.",
  "tablet_strategy_result": "Tracker field captured by the router or derived during aggregation.",
  "narrow_desktop_strategy_result": "Tracker field captured by the router or derived during aggregation.",
  "target_url_type": "Tracker field captured by the router or derived during aggregation.",
  "target_url_key_or_hash": "Tracker field captured by the router or derived during aggregation.",
  "safe_fallback_reason": "Tracker field captured by the router or derived during aggregation.",
  "fallback_reason": "Tracker field captured by the router or derived during aggregation.",
  "debug_mode": "Tracker field captured by the router or derived during aggregation.",
  "no_redirect_mode": "Tracker field captured by the router or derived during aggregation.",
  "link_preview_reason": "Tracker field captured by the router or derived during aggregation.",
  "layout_viewport_width": "Tracker field captured by the router or derived during aggregation.",
  "layout_viewport_height": "Tracker field captured by the router or derived during aggregation.",
  "visual_viewport_available": "Tracker field captured by the router or derived during aggregation.",
  "visual_viewport_width": "Tracker field captured by the router or derived during aggregation.",
  "visual_viewport_height": "Tracker field captured by the router or derived during aggregation.",
  "visual_viewport_scale": "Tracker field captured by the router or derived during aggregation.",
  "screen_avail_width": "Tracker field captured by the router or derived during aggregation.",
  "screen_avail_height": "Tracker field captured by the router or derived during aggregation.",
  "orientation_type": "Tracker field captured by the router or derived during aggregation.",
  "orientation_angle": "Tracker field captured by the router or derived during aggregation.",
  "is_landscape": "Tracker field captured by the router or derived during aggregation.",
  "aspect_ratio": "Tracker field captured by the router or derived during aggregation.",
  "viewport_bucket": "Tracker field captured by the router or derived during aggregation.",
  "breakpoint_bucket": "Tracker field captured by the router or derived during aggregation.",
  "display_class": "Tracker field captured by the router or derived during aggregation.",
  "page_visibility_state": "Tracker field captured by the router or derived during aggregation.",
  "navigation_type": "Tracker field captured by the router or derived during aggregation.",
  "dom_content_loaded_ms": "Tracker field captured by the router or derived during aggregation.",
  "load_event_ms": "Tracker field captured by the router or derived during aggregation.",
  "redirect_delay_ms": "Tracker field captured by the router or derived during aggregation.",
  "tracker_send_start_ms": "Tracker field captured by the router or derived during aggregation.",
  "tracker_send_ms": "Tracker field captured by the router or derived during aggregation.",
  "tracker_payload_size_bytes": "Tracker field captured by the router or derived during aggregation.",
  "payload_size_bytes": "Tracker field captured by the router or derived during aggregation.",
  "imageget_url_length": "Tracker field captured by the router or derived during aggregation.",
  "script_error_count": "Tracker field captured by the router or derived during aggregation.",
  "fallback_link_clicked": "Tracker field captured by the router or derived during aggregation.",
  "browser_zoom_or_scale_hint": "Tracker field captured by the router or derived during aggregation.",
  "has_touch": "Tracker field captured by the router or derived during aggregation.",
  "pointer_primary": "Tracker field captured by the router or derived during aggregation.",
  "any_pointer_coarse": "Tracker field captured by the router or derived during aggregation.",
  "any_pointer_fine": "Tracker field captured by the router or derived during aggregation.",
  "hover_primary": "Tracker field captured by the router or derived during aggregation.",
  "any_hover": "Tracker field captured by the router or derived during aggregation.",
  "touch_class": "Tracker field captured by the router or derived during aggregation.",
  "hybrid_touch_mouse_likely": "Tracker field captured by the router or derived during aggregation.",
  "keyboard_mouse_likely": "Tracker field captured by the router or derived during aggregation.",
  "remote_control_likely": "Tracker field captured by the router or derived during aggregation.",
  "stylus_possible": "Tracker field captured by the router or derived during aggregation.",
  "prefers_color_scheme": "Tracker field captured by the router or derived during aggregation.",
  "prefers_reduced_motion": "Tracker field captured by the router or derived during aggregation.",
  "prefers_reduced_data": "Tracker field captured by the router or derived during aggregation.",
  "color_gamut": "Tracker field captured by the router or derived during aggregation.",
  "dynamic_range": "Tracker field captured by the router or derived during aggregation.",
  "theme_evidence_json": "Tracker field captured by the router or derived during aggregation.",
  "theme_confidence_band": "Tracker field captured by the router or derived during aggregation.",
  "uach_available": "Tracker field captured by the router or derived during aggregation.",
  "uach_brands_json": "Tracker field captured by the router or derived during aggregation.",
  "uach_mobile": "Tracker field captured by the router or derived during aggregation.",
  "uach_platform": "Tracker field captured by the router or derived during aggregation.",
  "uach_architecture": "Tracker field captured by the router or derived during aggregation.",
  "uach_bitness": "Tracker field captured by the router or derived during aggregation.",
  "uach_model": "Tracker field captured by the router or derived during aggregation.",
  "uach_platform_version": "Tracker field captured by the router or derived during aggregation.",
  "uach_full_version_list_json": "Tracker field captured by the router or derived during aggregation.",
  "uach_form_factors_json": "Tracker field captured by the router or derived during aggregation.",
  "uach_wow64": "Tracker field captured by the router or derived during aggregation.",
  "uach_error": "Tracker field captured by the router or derived during aggregation.",
  "uach_signal_quality": "Tracker field captured by the router or derived during aggregation.",
  "browser_full_version": "Tracker field captured by the router or derived during aggregation.",
  "browser_version_source": "Tracker field captured by the router or derived during aggregation.",
  "browser_engine_version": "Tracker field captured by the router or derived during aggregation.",
  "os_version": "Tracker field captured by the router or derived during aggregation.",
  "os_version_source": "Tracker field captured by the router or derived during aggregation.",
  "navigator_platform_raw": "Tracker field captured by the router or derived during aggregation.",
  "navigator_vendor": "Tracker field captured by the router or derived during aggregation.",
  "ua_reduced_likely": "Tracker field captured by the router or derived during aggregation.",
  "is_webview": "Tracker field captured by the router or derived during aggregation.",
  "in_app_browser_family": "Tracker field captured by the router or derived during aggregation.",
  "browser_feature_support_json": "Tracker field captured by the router or derived during aggregation.",
  "inferred_device_class": "Privacy-safe aggregate device class inference.",
  "inferred_device_subclass": "Tracker field captured by the router or derived during aggregation.",
  "inferred_device_vendor": "Tracker field captured by the router or derived during aggregation.",
  "inferred_device_model": "Tracker field captured by the router or derived during aggregation.",
  "inferred_model_family": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_phone": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_tablet": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_ipad_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_android_tablet_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_samsung_galaxy_tab_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_surface_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_chromeos_tablet_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_smart_tv": "TRUE when Smart TV / TV-browser evidence is visible.",
  "inferred_tv_os": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_console": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_foldable_possible": "Tracker field captured by the router or derived during aggregation.",
  "inferred_device_posture": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_kiosk_or_public_display_possible": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_bot": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_link_preview": "Tracker field captured by the router or derived during aggregation.",
  "inferred_confidence_score": "Tracker field captured by the router or derived during aggregation.",
  "inferred_confidence_band": "Tracker field captured by the router or derived during aggregation.",
  "inferred_confidence_reason": "Tracker field captured by the router or derived during aggregation.",
  "inferred_evidence_json": "Tracker field captured by the router or derived during aggregation.",
  "inferred_warning_flags_json": "Tracker field captured by the router or derived during aggregation.",
  "hardware_concurrency": "Tracker field captured by the router or derived during aggregation.",
  "device_memory_gb": "Tracker field captured by the router or derived during aggregation.",
  "connection_effective_type": "Tracker field captured by the router or derived during aggregation.",
  "connection_downlink": "Tracker field captured by the router or derived during aggregation.",
  "connection_rtt": "Tracker field captured by the router or derived during aggregation.",
  "connection_save_data": "Tracker field captured by the router or derived during aggregation.",
  "connection_signal_quality": "Tracker field captured by the router or derived during aggregation.",
  "performance_supported": "Tracker field captured by the router or derived during aggregation.",
  "tracker_send_method": "Tracker field captured by the router or derived during aggregation.",
  "tracker_send_status": "Tracker field captured by the router or derived during aggregation.",
  "endpoint_result_known": "Tracker field captured by the router or derived during aggregation.",
  "endpoint_slow_possible": "Tracker field captured by the router or derived during aggregation.",
  "source_confidence_band": "Confidence bucket for source/public-entry inference.",
  "source_reason": "Short aggregate-safe source inference reason.",
  "utm_term": "Tracker field captured by the router or derived during aggregation.",
  "utm_id": "Tracker field captured by the router or derived during aggregation.",
  "payload_size_bucket": "Compact payload-size bucket used for transport health rollups.",
  "imageget_payload_near_limit": "TRUE when compact imageGet telemetry approaches URL budget.",
  "diagnostic_payload_too_large": "TRUE when optional diagnostic enrichment was trimmed.",
  "device_posture_api_available": "Tracker field captured by the router or derived during aggregation.",
  "gamepad_api_available": "Tracker field captured by the router or derived during aggregation.",
  "inferred_device_ecosystem": "Tracker field captured by the router or derived during aggregation.",
  "inferred_form_factor": "Tracker field captured by the router or derived during aggregation.",
  "inferred_screen_context": "Tracker field captured by the router or derived during aggregation.",
  "inferred_input_context": "Tracker field captured by the router or derived during aggregation.",
  "inferred_browser_context": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_large_phone": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_small_phone": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_large_tablet": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_ipad_desktop_mode": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_windows_touch_hybrid": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_desktop_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_laptop_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_apple_tv_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_android_tv": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_google_tv_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_fire_tv_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_tizen_tv": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_webos_tv": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_roku": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_android_tv_box_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_set_top_box_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_game_console": "Tracker field captured by the router or derived during aggregation.",
  "inferred_console_family": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_playstation": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_xbox": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_nintendo": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_vr_headset_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_car_browser_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_e_reader_like": "Tracker field captured by the router or derived during aggregation.",
  "inferred_is_webview": "Tracker field captured by the router or derived during aggregation.",
  "inferred_in_app_browser_family": "Tracker field captured by the router or derived during aggregation.",
  "inferred_confidence_band_compact": "Tracker field captured by the router or derived during aggregation.",
  "inferred_primary_evidence": "Tracker field captured by the router or derived during aggregation.",
  "inferred_detection_version": "Version of privacy-safe device/browser inference rules used by router-core.",
  "inferred_contradiction_flags_json": "Tracker field captured by the router or derived during aggregation.",
  "root_dashboard_target_path": "Root gateway click target path for funnel analysis.",
  "powerbi_viewer_unsupported_browser": "Quality warning code when a counted Power BI redirect uses a browser outside Microsoft Power BI/Fabric browser guidance.",
  "powerbi_viewer_not_officially_supported": "Quality diagnostic code when a counted Power BI redirect uses Smart TV, in-app or WebView context not listed in Microsoft browser guidance.",
  "forced_dark_detected": "Diagnostic display/theme signal; not a confirmed operational warning by itself."
};

function doPost(e) {
  try {
    setupWorkbook_();
    var payload = parsePostPayload_(e);
    var normalized = normalizeEvent_(payload, "POST");
    appendEvent_(normalized);
    return outputJson_({ ok: true, script_version: SCRIPT_VERSION, schema_version: EVENT_SCHEMA_VERSION, event_id: normalized.event_id });
  } catch (error) {
    logError_("doPost", error, "collector");
    return outputJson_({ ok: false, script_version: SCRIPT_VERSION });
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var api = clean_(params.api || params.mode || "", 40).toLowerCase();

    if (api === "dashboard") {
      return outputData_(getCachedDashboardData_(), params);
    }

    setupWorkbook_();

    if (api === "health" || api === "status") {
      return outputData_(getHealth_(), params);
    }

    if (api === "registry") {
      return outputData_(getPublicRegistry_(), params);
    }

    if (params.event_type || params.eventType || params.fallback || params.dashboard_key || params.dashboardId || params.event_id || params.eventId) {
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
  setControl_("schema_version", EVENT_SCHEMA_VERSION);
  writeSchemaMigrationLog_("setupProductionWorkbook", "ok", "Workbook setup refreshed for observability schema and Power BI viewer compatibility classification.");
  return "Production workbook setup complete";
}

function setupProductionWorkbook_() {
  return setupProductionWorkbook();
}

function setupWorkbookPublic() {
  return setupProductionWorkbook();
}

function migrateSchemaV8() {
  setupWorkbook_();
  seedRegistrySheets_();
  writeDataDictionary_();
  writeSchemaMigrationLog_("schema_v8_setup", "ok", "Observability headers and aggregate sheets refreshed.");
  setControl_("schema_version", EVENT_SCHEMA_VERSION);
  setControl_("script_version", SCRIPT_VERSION);
  return verifySpreadsheetSetup();
}

function migrateSchemaV9() {
  setupWorkbook_();
  seedRegistrySheets_();
  writeDataDictionary_();
  setControl_("schema_version", EVENT_SCHEMA_VERSION);
  setControl_("script_version", SCRIPT_VERSION);
  setControl_("schema_v9_migrated_at", nowIso_());
  clearDashboardDataCache_();
  writeSchemaMigrationLog_("migrateSchemaV9", "ok", "Schema 9 fields, root gateway funnel support and advanced device taxonomy columns prepared.");
  return verifySpreadsheetSetup();
}

function migrateSmartTvPowerBiCompatV122() {
  setupWorkbook_();
  seedRegistrySheets_();
  writeDataDictionary_();
  setControl_("schema_version", EVENT_SCHEMA_VERSION);
  setControl_("script_version", SCRIPT_VERSION);
  setControl_("smarttv_powerbi_compat_patch_at", nowIso_());
  clearDashboardDataCache_();
  repairPowerBiViewerCompatibilityHistory(false);
  aggregateRecent();
  writeSchemaMigrationLog_("migrateSmartTvPowerBiCompatV122", "ok", "Forced-dark theme signals demoted to diagnostics and Power BI/Fabric browser support classification added.");
  return verifySpreadsheetSetup();
}

function validateWorkbookSetup() {
  return verifySpreadsheetSetup();
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
    dashboard_id: "bradamottaka-fossvogi",
    dashboard_name: "Bráðamóttaka í Fossvogi",
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
    browser_brand: "test",
    browser_engine: "test",
    os_family: "test",
    color_scheme: "test",
    forced_colors: "test",
    prefers_contrast: "test",
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
  var values = eventSheet ? eventSheet.getDataRange().getValues() : [];
  var header = values.length ? values[0] : EVENT_HEADERS;
  var rows = [];
  var cutoff = new Date(new Date().getTime() - AGGREGATION_DAYS * 24 * 60 * 60 * 1000);
  var i;
  var obj;

  for (i = 1; i < values.length; i += 1) {
    obj = rowToObject_(header, values[i]);
    if (obj.server_time && new Date(obj.server_time) >= cutoff) rows.push(obj);
  }

  var registry = registryMap_();
  var daily = {};
  var hourly = {};
  var dashboardAgg = {};
  var deviceAgg = {};
  var sourceAgg = {};
  var routeAgg = {};
  var qualityAgg = {};
  var confidenceAgg = {};
  var browserAgg = {};
  var osAgg = {};
  var displayAgg = {};
  var inputAgg = {};
  var performanceAgg = {};
  var now = new Date();
  var today = isoDate_(now);
  var day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  var day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  var globalLastRaw = "";
  var globalLastCounted = "";
  var globalLastDiagnostic = "";
  var globalLastError = "";

  Object.keys(registry).forEach(function (key) {
    dashboardAgg[key] = baseDashboardAgg_(registry[key]);
  });

  rows.forEach(function (row) {
    row = classifyViewerCompatibility_(row || {});
    var eventType = clean_(row.event_type || "", 80);
    var isRootOnly = eventType === "root_index_view" && !row.dashboard_key;
    var eventTime = row.server_time ? new Date(row.server_time) : now;
    var serverTime = String(row.server_time || "");
    var date = isoDate_(eventTime);
    var hour = isoHour_(eventTime);
    var key = clean_(row.dashboard_key || "", 80);
    var registryRow = key && registry[key] ? registry[key] : null;

    if (!key && row.dashboard_id) {
      key = dashboardKeyFromId_(row.dashboard_id) || "";
      registryRow = key && registry[key] ? registry[key] : null;
    }

    if (isRootOnly) {
      globalLastRaw = newestIso_(globalLastRaw, serverTime);
      return;
    }

    if (!key) key = "unknown";

    var dashboardName = clean_(row.dashboard_name || (registryRow && registryRow.dashboard_name) || key, 160) || key;
    var isBot = isBotRow_(row);
    var isDebug = isDebugLikeEvent_(row);
    var isDiagnostic = isDiagnosticEvent_(row);
    var isVisit = isRealVisit_(row);
    var isFallbackClick = eventType === "fallback_click" || asBool_(row.fallback_link_clicked);
    var isError = eventType === "router_error" || !!row.error_message;
    var safeFallback = asBool_(row.safe_fallback_used);
    var browserBrand = row.browser_brand || row.browser_family || "unknown";
    var browserEngine = row.browser_engine || "unknown";
    var language = row.language || "unknown";
    var timezone = row.timezone || "unknown";
    var colorScheme = row.color_scheme || row.prefers_color_scheme || "unknown";
    var forcedColors = row.forced_colors || "unknown";
    var prefersContrast = row.prefers_contrast || "unknown";
    var invertedColors = row.inverted_colors || "unknown";
    var forcedDarkDetection = row.forced_dark_detection || "unknown";
    var samsungDarkModeStatus = row.samsung_dark_mode_status || "unknown";
    var themeSignalQuality = row.theme_signal_quality || "unknown";
    var connectionType = row.connection_type || row.connection_effective_type || "unknown";
    var confidenceBand = row.inferred_confidence_band || row.inferred_confidence_band_compact || "unknown or insufficient evidence";

    if (!dashboardAgg[key]) {
      dashboardAgg[key] = baseDashboardAgg_(registryRow || {
        dashboard_key: key,
        dashboard_id: row.dashboard_id || "",
        dashboard_name: dashboardName,
        public_card_title: row.public_card_title || dashboardName,
        status: "unknown"
      });
    }

    var dailyKey = [date, key, row.entry_source_category || "unknown", row.selected_layout || "unknown", row.device_class || "unknown"].join("|");
    var hourlyKey = [hour, key].join("|");
    var deviceKey = [key, dashboardName, row.device_class || "unknown", row.selected_layout || "unknown", row.browser_family || "unknown", browserBrand, browserEngine, row.os_family || "unknown", language, timezone, colorScheme, forcedColors, prefersContrast, invertedColors, forcedDarkDetection, samsungDarkModeStatus, themeSignalQuality, connectionType, row.inferred_device_class || "unknown", confidenceBand, row.in_app_browser_family || row.inferred_in_app_browser_family || "none", row.display_class || "unknown", row.viewport_bucket || "unknown"].join("|");
    var sourceKey = [key, dashboardName, row.entry_source_category || "unknown", row.utm_source || "", row.utm_medium || "", row.utm_campaign || "", row.utm_content || ""].join("|");
    var routeKey = [key, dashboardName, row.route_reason || "unknown", row.route_reason_detail || "", row.selected_layout || "unknown", row.auto_selected_layout || "unknown", row.forced_layout || "auto", asBool_(row.forced_layout_applied), row.layout_source || "auto", row.route_policy_result || "unknown", row.tablet_strategy_result || "unknown", row.narrow_desktop_strategy_result || "unknown"].join("|");
    var confidenceKey = [key, dashboardName, row.inferred_device_class || "unknown", row.inferred_device_subclass || "", confidenceBand, row.inferred_confidence_score || "", row.inferred_confidence_reason || row.inferred_primary_evidence || "", asBool_(row.inferred_is_ipad_like), asBool_(row.inferred_is_android_tablet_like), asBool_(row.inferred_is_samsung_galaxy_tab_like), asBool_(row.inferred_is_surface_like), asBool_(row.inferred_is_chromeos_tablet_like), asBool_(row.inferred_is_smart_tv), row.in_app_browser_family || row.inferred_in_app_browser_family || "none"].join("|");
    var browserKey = [key, dashboardName, row.browser_family || "unknown", browserBrand, browserEngine, row.browser_major_version || "", row.browser_full_version || "", row.browser_version_source || "unknown", asBool_(row.is_webview), row.in_app_browser_family || row.inferred_in_app_browser_family || "none"].join("|");
    var osKey = [key, dashboardName, row.os_family || "unknown", row.os_version || row.os_version_hint || "", row.os_version_source || "unknown", row.navigator_platform_raw || ""].join("|");
    var displayKey = [key, dashboardName, row.display_class || "unknown", row.viewport_bucket || "unknown", row.breakpoint_bucket || "unknown", row.selected_layout || "unknown", row.prefers_color_scheme || colorScheme, colorScheme, forcedDarkDetection, samsungDarkModeStatus, themeSignalQuality, row.theme_confidence_band || "unknown", forcedColors, prefersContrast, row.prefers_reduced_motion || "unknown", row.prefers_reduced_data || "unknown", row.color_gamut || "unknown", row.dynamic_range || "unknown"].join("|");
    var inputKey = [key, dashboardName, row.touch_class || "unknown", asBool_(row.has_touch), row.pointer_primary || "unknown", asBool_(row.any_pointer_coarse), asBool_(row.any_pointer_fine), row.hover_primary || "unknown", row.any_hover || "unknown", asBool_(row.hybrid_touch_mouse_likely), asBool_(row.keyboard_mouse_likely), asBool_(row.remote_control_likely), asBool_(row.stylus_possible)].join("|");
    var perfKey = [key, dashboardName, row.tracker_send_method || row.tracking_method || "unknown", row.tracker_send_status || "unknown", asBool_(row.endpoint_result_known), row.connection_effective_type || connectionType, asBool_(row.connection_save_data), row.connection_signal_quality || "unknown", row.payload_size_bucket || payloadSizeBucket_(row.payload_size_bytes || row.tracker_payload_size_bytes || row.imageget_url_length), msBucket_(row.dom_content_loaded_ms), msBucket_(row.load_event_ms), lowCapabilityDevice_(row)].join("|");

    daily[dailyKey] = daily[dailyKey] || { date: date, dashboard_key: key, entry_source_category: row.entry_source_category || "unknown", selected_layout: row.selected_layout || "unknown", device_class: row.device_class || "unknown", visits: 0, events: 0, bots: 0, debug_events: 0, diagnostic_events: 0, fallback_clicks: 0, errors: 0, safe_fallbacks: 0 };
    hourly[hourlyKey] = hourly[hourlyKey] || { hour_utc: hour, dashboard_key: key, visits: 0, events: 0, errors: 0, diagnostic_events: 0 };
    deviceAgg[deviceKey] = deviceAgg[deviceKey] || { dashboard_key: key, dashboard_name: dashboardName, device_class: row.device_class || "unknown", selected_layout: row.selected_layout || "unknown", browser_family: row.browser_family || "unknown", browser_brand: browserBrand, browser_engine: browserEngine, os_family: row.os_family || "unknown", language: language, timezone: timezone, color_scheme: colorScheme, forced_colors: forcedColors, prefers_contrast: prefersContrast, inverted_colors: invertedColors, forced_dark_detection: forcedDarkDetection, samsung_dark_mode_status: samsungDarkModeStatus, theme_signal_quality: themeSignalQuality, connection_type: connectionType, inferred_device_class: row.inferred_device_class || "unknown", inferred_confidence_band: confidenceBand, in_app_browser_family: row.in_app_browser_family || row.inferred_in_app_browser_family || "none", display_class: row.display_class || "unknown", viewport_bucket: row.viewport_bucket || "unknown", visits: 0, events: 0 };
    sourceAgg[sourceKey] = sourceAgg[sourceKey] || { dashboard_key: key, dashboard_name: dashboardName, entry_source_category: row.entry_source_category || "unknown", utm_source: row.utm_source || "", utm_medium: row.utm_medium || "", utm_campaign: row.utm_campaign || "", utm_content: row.utm_content || "", visits: 0, events: 0 };
    routeAgg[routeKey] = routeAgg[routeKey] || { dashboard_key: key, dashboard_name: dashboardName, route_reason: row.route_reason || "unknown", route_reason_detail: row.route_reason_detail || "", selected_layout: row.selected_layout || "unknown", auto_selected_layout: row.auto_selected_layout || "unknown", forced_layout: row.forced_layout || "auto", forced_layout_applied: asBool_(row.forced_layout_applied), layout_source: row.layout_source || "auto", route_policy_result: row.route_policy_result || "unknown", tablet_strategy_result: row.tablet_strategy_result || "unknown", narrow_desktop_strategy_result: row.narrow_desktop_strategy_result || "unknown", visits: 0, events: 0 };
    confidenceAgg[confidenceKey] = confidenceAgg[confidenceKey] || { dashboard_key: key, dashboard_name: dashboardName, inferred_device_class: row.inferred_device_class || "unknown", inferred_device_subclass: row.inferred_device_subclass || "", inferred_confidence_band: confidenceBand, inferred_confidence_score: row.inferred_confidence_score || "", inferred_confidence_reason: row.inferred_confidence_reason || row.inferred_primary_evidence || "", inferred_is_ipad_like: asBool_(row.inferred_is_ipad_like), inferred_is_android_tablet_like: asBool_(row.inferred_is_android_tablet_like), inferred_is_samsung_galaxy_tab_like: asBool_(row.inferred_is_samsung_galaxy_tab_like), inferred_is_surface_like: asBool_(row.inferred_is_surface_like), inferred_is_chromeos_tablet_like: asBool_(row.inferred_is_chromeos_tablet_like), inferred_is_smart_tv: asBool_(row.inferred_is_smart_tv), in_app_browser_family: row.in_app_browser_family || row.inferred_in_app_browser_family || "none", visits: 0, events: 0 };
    browserAgg[browserKey] = browserAgg[browserKey] || { dashboard_key: key, dashboard_name: dashboardName, browser_family: row.browser_family || "unknown", browser_brand: browserBrand, browser_engine: browserEngine, browser_major_version: row.browser_major_version || "", browser_full_version: row.browser_full_version || "", browser_version_source: row.browser_version_source || "unknown", is_webview: asBool_(row.is_webview), in_app_browser_family: row.in_app_browser_family || row.inferred_in_app_browser_family || "none", visits: 0, events: 0 };
    osAgg[osKey] = osAgg[osKey] || { dashboard_key: key, dashboard_name: dashboardName, os_family: row.os_family || "unknown", os_version: row.os_version || row.os_version_hint || "", os_version_source: row.os_version_source || "unknown", navigator_platform_raw: row.navigator_platform_raw || "", visits: 0, events: 0 };
    displayAgg[displayKey] = displayAgg[displayKey] || { dashboard_key: key, dashboard_name: dashboardName, display_class: row.display_class || "unknown", viewport_bucket: row.viewport_bucket || "unknown", breakpoint_bucket: row.breakpoint_bucket || "unknown", selected_layout: row.selected_layout || "unknown", prefers_color_scheme: row.prefers_color_scheme || colorScheme, color_scheme: colorScheme, forced_dark_detection: forcedDarkDetection, samsung_dark_mode_status: samsungDarkModeStatus, theme_signal_quality: themeSignalQuality, theme_confidence_band: row.theme_confidence_band || "unknown", forced_colors: forcedColors, prefers_contrast: prefersContrast, prefers_reduced_motion: row.prefers_reduced_motion || "unknown", prefers_reduced_data: row.prefers_reduced_data || "unknown", color_gamut: row.color_gamut || "unknown", dynamic_range: row.dynamic_range || "unknown", visits: 0, events: 0 };
    inputAgg[inputKey] = inputAgg[inputKey] || { dashboard_key: key, dashboard_name: dashboardName, touch_class: row.touch_class || "unknown", has_touch: asBool_(row.has_touch), pointer_primary: row.pointer_primary || "unknown", any_pointer_coarse: asBool_(row.any_pointer_coarse), any_pointer_fine: asBool_(row.any_pointer_fine), hover_primary: row.hover_primary || "unknown", any_hover: row.any_hover || "unknown", hybrid_touch_mouse_likely: asBool_(row.hybrid_touch_mouse_likely), keyboard_mouse_likely: asBool_(row.keyboard_mouse_likely), remote_control_likely: asBool_(row.remote_control_likely), stylus_possible: asBool_(row.stylus_possible), visits: 0, events: 0 };
    performanceAgg[perfKey] = performanceAgg[perfKey] || { dashboard_key: key, dashboard_name: dashboardName, tracker_send_method: row.tracker_send_method || row.tracking_method || "unknown", tracker_send_status: row.tracker_send_status || "unknown", endpoint_result_known: asBool_(row.endpoint_result_known), connection_effective_type: row.connection_effective_type || connectionType, connection_save_data: asBool_(row.connection_save_data), connection_signal_quality: row.connection_signal_quality || "unknown", payload_size_bucket: row.payload_size_bucket || payloadSizeBucket_(row.payload_size_bytes || row.tracker_payload_size_bytes || row.imageget_url_length), dom_content_loaded_bucket: msBucket_(row.dom_content_loaded_ms), load_event_bucket: msBucket_(row.load_event_ms), low_capability_device: lowCapabilityDevice_(row), visits: 0, events: 0 };

    incrementAggEvents_([daily[dailyKey], hourly[hourlyKey], deviceAgg[deviceKey], sourceAgg[sourceKey], routeAgg[routeKey], confidenceAgg[confidenceKey], browserAgg[browserKey], osAgg[osKey], displayAgg[displayKey], inputAgg[inputKey], performanceAgg[perfKey]]);
    dashboardAgg[key].total_events += 1;
    dashboardAgg[key].raw_events += 1;

    if (isDiagnostic) { daily[dailyKey].diagnostic_events += 1; hourly[hourlyKey].diagnostic_events += 1; dashboardAgg[key].diagnostic_events += 1; }
    if (isBot) daily[dailyKey].bots += 1;
    if (isDebug) daily[dailyKey].debug_events += 1;
    if (isFallbackClick) daily[dailyKey].fallback_clicks += 1;
    if (isError) { daily[dailyKey].errors += 1; hourly[hourlyKey].errors += 1; }
    if (safeFallback) daily[dailyKey].safe_fallbacks += 1;

    if (isVisit) {
      incrementAggVisits_([daily[dailyKey], hourly[hourlyKey], deviceAgg[deviceKey], sourceAgg[sourceKey], routeAgg[routeKey], confidenceAgg[confidenceKey], browserAgg[browserKey], osAgg[osKey], displayAgg[displayKey], inputAgg[inputKey], performanceAgg[perfKey]]);
      dashboardAgg[key].total_visits += 1;
      if (date === today) dashboardAgg[key].visits_today += 1;
      if (eventTime >= day7) dashboardAgg[key].visits_7d += 1;
      if (eventTime >= day30) dashboardAgg[key].visits_30d += 1;
      if (row.selected_layout === "mobile") dashboardAgg[key].mobile_visits += 1;
      if (row.selected_layout === "desktop") dashboardAgg[key].desktop_visits += 1;
      if (row.device_class === "tablet" || row.inferred_device_class === "tablet") dashboardAgg[key].tablet_visits += 1;
      if (row.device_class === "narrow-screen" || row.device_class === "small-touch-screen" || row.display_class === "narrow_viewport") dashboardAgg[key].narrow_visits += 1;
      if (row.entry_source_category === "island_is_public") dashboardAgg[key].island_is_visits += 1;
      dashboardAgg[key].last_counted_event_time = newestIso_(dashboardAgg[key].last_counted_event_time, serverTime);
    }

    if (isFallbackClick) dashboardAgg[key].fallback_clicks += 1;
    if (isError) dashboardAgg[key].error_events += 1;
    if (isDebug) dashboardAgg[key].debug_events += 1;
    if (isBot) dashboardAgg[key].bot_events += 1;
    if (safeFallback) dashboardAgg[key].safe_fallback_events += 1;
    if (isWeakConfidence_(confidenceBand)) dashboardAgg[key].weak_unknown_signal_count += 1;

    dashboardAgg[key].last_event_time = newestIso_(dashboardAgg[key].last_event_time, serverTime);
    dashboardAgg[key].last_raw_event_time = newestIso_(dashboardAgg[key].last_raw_event_time, serverTime);
    if (isDiagnostic) dashboardAgg[key].last_diagnostic_event_time = newestIso_(dashboardAgg[key].last_diagnostic_event_time, serverTime);
    if (isError) dashboardAgg[key].last_error_event_time = newestIso_(dashboardAgg[key].last_error_event_time, serverTime);
    globalLastRaw = newestIso_(globalLastRaw, serverTime);
    if (isVisit) globalLastCounted = newestIso_(globalLastCounted, serverTime);
    if (isDiagnostic) globalLastDiagnostic = newestIso_(globalLastDiagnostic, serverTime);
    if (isError) globalLastError = newestIso_(globalLastError, serverTime);

    addIncomingRouterWarning_(qualityAgg, row, key, now, isVisit, isDiagnostic);
    if (forcedDarkDetection === "detected") addQualityWarning_(qualityAgg, "forced_dark_detected", key, "info", "Forced/auto dark rendering greindist. Þetta er birtingarmerki, ekki staðfest Power BI eða router villa.", "Prófa affected browser og Power BI report liti áður en þetta er meðhöndlað sem rekstrarvandamál.", now, false, true, false, themeSignalQuality, row.theme_confidence_band || "medium confidence");
    if (samsungDarkModeStatus === "samsung_forced_dark_possible") addQualityWarning_(qualityAgg, "samsung_forced_dark_possible", key, "info", "Samsung Internet á Android gæti verið með forced dark. Þetta er óvissumerki, ekki staðfest dark mode.", "Nota debug/noRedirect prófun á Samsung Internet og bera saman við reported color-scheme áður en ályktun er dregin.", now, false, true, false, "possible_only", "weak inference");
    addPowerBiViewerCompatibilityWarning_(qualityAgg, row, key, now, isVisit);

    if (isVisit && row.device_class === "phone" && row.selected_layout === "desktop") addQualityWarning_(qualityAgg, "phone_routed_to_desktop", key, "warning", "Sími var leiddur á desktop útgáfu.", "Athuga force/view query, route policy og viewport mælingu fyrir viðkomandi atburði.", now, true, false, true, "reported", row.inferred_confidence_band || "medium confidence");
    if (isVisit && row.device_class === "tablet" && row.selected_layout === "desktop" && /portrait/i.test(row.route_reason || row.orientation_type || "")) addQualityWarning_(qualityAgg, "tablet_portrait_routed_desktop", key, "warning", "Spjaldtölva í portrait virðist hafa farið á desktop útgáfu.", "Staðfesta tabletPortrait route policy og breakpoint fyrir mælaborðið.", now, true, false, true, "reported", row.inferred_confidence_band || "medium confidence");
    if (isVisit && (row.device_class === "desktop" || row.device_class === "narrow-screen") && row.selected_layout === "mobile" && (row.forced_layout || "auto") === "auto") addQualityWarning_(qualityAgg, "desktop_or_narrow_routed_mobile", key, "info", "Desktop/narrow-screen fór sjálfvirkt á mobile útgáfu. Þetta getur verið rétt ef skjábreidd er lág.", "Skoða viewport_bucket áður en route policy er breytt.", now, true, false, false, "reported", row.inferred_confidence_band || "medium confidence");
    if (isError) addQualityWarning_(qualityAgg, "router_errors_seen", key, "warning", "Router villuatburður barst.", "Skoða Errors og raw event context fyrir router_error.", now, isVisit, isDiagnostic, true, "reported", "high confidence");
    if (safeFallback) addQualityWarning_(qualityAgg, "safe_fallback_used", key, "warning", "Router notaði safe fallback config eða URL.", "Staðfesta Power BI publish-to-web URL og config útgáfu.", now, isVisit, isDiagnostic, true, "reported", "high confidence");
    if (toNumber_(row.imageget_url_length) >= 6000 || asBool_(row.imageget_payload_near_limit)) addQualityWarning_(qualityAgg, "imageget_payload_near_limit", key, "warning", "imageGet payload nálgast örugg lengdarmörk.", "Halda core payload stuttum og færa stærri JSON í diagnostic enrichment.", now, isVisit, isDiagnostic, isVisit, "reported", "high confidence");
  });

  addOperationalQualityWarnings_(dashboardAgg, qualityAgg, now);

  Object.keys(dashboardAgg).forEach(function (key) {
    dashboardAgg[key].warning_count = countWarningsForDashboard_(qualityAgg, key, false);
    dashboardAgg[key].confirmed_warning_count = countWarningsForDashboard_(qualityAgg, key, true);
    dashboardAgg[key].diagnostic_signal_count = countDiagnosticSignalsForDashboard_(qualityAgg, key);
    dashboardAgg[key].confidence_band = dashboardConfidenceBand_(dashboardAgg[key]);
    dashboardAgg[key].source_mix_summary = mixSummary_(sourceAgg, key, "entry_source_category");
    dashboardAgg[key].route_mix_summary = mixSummary_(routeAgg, key, "selected_layout");
  });

  writeObjects_(SHEET_DAILY, DAILY_HEADERS, valuesFromObject_(daily, DAILY_HEADERS));
  writeObjects_(SHEET_HOURLY, HOURLY_HEADERS, valuesFromObject_(hourly, HOURLY_HEADERS));
  writeObjects_(SHEET_DASHBOARD, DASHBOARD_HEADERS, valuesFromObject_(dashboardAgg, DASHBOARD_HEADERS));
  writeObjects_(SHEET_DEVICE, DEVICE_HEADERS, valuesFromObject_(deviceAgg, DEVICE_HEADERS));
  writeObjects_(SHEET_SOURCE, SOURCE_HEADERS, valuesFromObject_(sourceAgg, SOURCE_HEADERS));
  writeObjects_(SHEET_ROUTE, ROUTE_HEADERS, valuesFromObject_(routeAgg, ROUTE_HEADERS));
  writeObjects_(SHEET_QUALITY, QUALITY_HEADERS, valuesFromObject_(qualityAgg, QUALITY_HEADERS));
  writeObjects_(SHEET_DEVICE_CONFIDENCE, DEVICE_CONFIDENCE_HEADERS, valuesFromObject_(confidenceAgg, DEVICE_CONFIDENCE_HEADERS));
  writeObjects_(SHEET_BROWSER, BROWSER_HEADERS, valuesFromObject_(browserAgg, BROWSER_HEADERS));
  writeObjects_(SHEET_OS, OS_HEADERS, valuesFromObject_(osAgg, OS_HEADERS));
  writeObjects_(SHEET_DISPLAY, DISPLAY_HEADERS, valuesFromObject_(displayAgg, DISPLAY_HEADERS));
  writeObjects_(SHEET_INPUT, INPUT_HEADERS, valuesFromObject_(inputAgg, INPUT_HEADERS));
  writeObjects_(SHEET_PERFORMANCE, PERFORMANCE_HEADERS, valuesFromObject_(performanceAgg, PERFORMANCE_HEADERS));

  setControl_("last_aggregation_time", nowIso_());
  setControl_("aggregation_generated_at", nowIso_());
  setControl_("last_aggregation_rows", rows.length);
  if (globalLastRaw) setControl_("last_raw_event_time", globalLastRaw);
  if (globalLastCounted) setControl_("last_counted_event_time", globalLastCounted);
  if (globalLastDiagnostic) setControl_("last_diagnostic_event_time", globalLastDiagnostic);
  if (globalLastError) setControl_("last_error_event_time", globalLastError);
  publishDashboardData_();
  return "Aggregated " + rows.length + " rows at " + nowIso_();
}

function incrementAggEvents_(items) {
  (items || []).forEach(function (agg) { if (agg) agg.events += 1; });
}

function incrementAggVisits_(items) {
  (items || []).forEach(function (agg) { if (agg) agg.visits += 1; });
}

function publishDashboardData_() {
  var data = buildDashboardDataFromSheets_();
  var json = JSON.stringify(data);
  var chunks = chunkString_(json, DASHBOARD_DATA_CELL_CHAR_BUDGET);
  var sheet = ensureSheet_(SHEET_DASHBOARD_DATA, DASHBOARD_DATA_HEADERS);
  var rows = chunks.map(function (chunk, index) {
    return [data.generated_at, index + 1, chunks.length, chunk];
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, DASHBOARD_DATA_HEADERS.length).setValues([DASHBOARD_DATA_HEADERS]);
  if (rows.length) sheet.getRange(2, 1, rows.length, DASHBOARD_DATA_HEADERS.length).setValues(rows);

  setControl_("dashboard_data_generated_at", data.generated_at);
  setControl_("dashboard_data_storage_format", DASHBOARD_DATA_STORAGE_FORMAT);
  setControl_("dashboard_data_chunk_count", chunks.length);
  setControl_("dashboard_data_json_chars", json.length);
  setControl_("dashboard_data_cell_budget", DASHBOARD_DATA_CELL_CHAR_BUDGET);
  putDashboardDataCache_(data);
  return data;
}

function archiveOldEvents() {
  setupWorkbook_();
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_EVENTS);
  var values = sheet.getDataRange().getValues();
  var headers = values.length ? values[0] : EVENT_HEADERS;
  if (values.length <= 1) return "No event rows to archive";

  var cutoff = new Date(new Date().getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  var archiveRows = [];
  var keepRows = [headers];
  var i;
  for (i = 1; i < values.length; i += 1) {
    var rowTime = values[i][0] ? new Date(values[i][0]) : null;
    if (rowTime && rowTime < cutoff) archiveRows.push(values[i]);
    else keepRows.push(values[i]);
  }
  if (!archiveRows.length) return "No rows older than retention";

  var archiveName = "Archive_" + Utilities.formatDate(cutoff, DEFAULT_TIMEZONE, "yyyy_MM");
  var archiveSheet = ensureSheet_(archiveName, headers);
  archiveSheet.getRange(archiveSheet.getLastRow() + 1, 1, archiveRows.length, headers.length).setValues(archiveRows);

  sheet.clearContents();
  sheet.getRange(1, 1, keepRows.length, headers.length).setValues(keepRows);
  sheet.setFrozenRows(1);

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
  Object.keys(payload).forEach(function (key) { queryKeys.push(clean_(key, 80)); });

  var normalized = {};
  EVENT_HEADERS.forEach(function (header) {
    normalized[header] = "";
  });

  normalized.server_time = nowIso_();
  normalized.client_time = clean_(first_(payload.client_time, payload.clientTime, payload.eventTimeClient), 40);
  normalized.event_id = clean_(first_(payload.event_id, payload.eventId), 120) || ("srv-" + new Date().getTime() + "-" + Math.random().toString(16).slice(2));
  normalized.request_id = clean_(first_(payload.request_id, payload.requestId), 120);
  normalized.event_type = clean_(first_(payload.event_type, payload.eventType), 80);
  normalized.count_as_visit = asBool_(first_(payload.count_as_visit, payload.countAsVisit));
  normalized.duplicate_event = isDuplicateEvent_(normalized.event_id);
  if (normalized.duplicate_event && normalized.count_as_visit) normalized.count_as_visit = false;

  copyEventFields_(normalized, payload);

  normalized.received_method = method;
  normalized.raw_query_keys = queryKeys.sort().join(",").slice(0, 500);

  if (!normalized.entry_source_category) normalized.entry_source_category = deriveSourceCategory_(normalized);
  if (!normalized.public_entry_page) normalized.public_entry_page = REGISTRY_SNAPSHOT.publicEntry.pagePath || "";
  if (!normalized.config_version) normalized.config_version = REGISTRY_SNAPSHOT.configVersion;
  if (!normalized.count_exclusion_reason) normalized.count_exclusion_reason = countExclusionReasonFromRow_(normalized);
  if (!normalized.event_tier) normalized.event_tier = normalized.count_as_visit ? "core_production" : (isDiagnosticEvent_(normalized) ? "diagnostic_or_debug" : "non_visit_event");
  if (!normalized.prefers_color_scheme) normalized.prefers_color_scheme = normalized.color_scheme || "unknown";
  if (!normalized.layout_viewport_width) normalized.layout_viewport_width = normalized.viewport_width;
  if (!normalized.layout_viewport_height) normalized.layout_viewport_height = normalized.viewport_height;
  if (!normalized.connection_effective_type) normalized.connection_effective_type = normalized.connection_type;
  if (!normalized.tracker_send_method) normalized.tracker_send_method = normalized.tracking_method;
  if (!normalized.payload_size_bucket) normalized.payload_size_bucket = payloadSizeBucket_(normalized.payload_size_bytes || normalized.tracker_payload_size_bytes || normalized.imageget_url_length);

  normalized = applyBradamottakaIdentifierRules_(normalized);
  normalized = applyRegistryMetadataFallback_(normalized);
  normalized = classifyViewerCompatibility_(normalized);

  return normalized;
}

function copyEventFields_(normalized, payload) {
  var boolFields = boolFieldMap_();
  var numberFields = numberFieldMap_();
  var pathFields = { public_entry_page: true, page_path: true, root_dashboard_target_path: true };
  var hostFields = { referrer_domain: true, page_host: true };
  var skip = { server_time: true, client_time: true, event_id: true, request_id: true, event_type: true, count_as_visit: true, duplicate_event: true, received_method: true, raw_query_keys: true };

  EVENT_HEADERS.forEach(function (field) {
    var value;
    if (skip[field]) return;

    value = first_(payload[field], payload[snakeToCamel_(field)]);

    if (field === "utm_source") value = first_(value, getNested_(payload, "query", "utm_source"));
    if (field === "utm_medium") value = first_(value, getNested_(payload, "query", "utm_medium"));
    if (field === "utm_campaign") value = first_(value, getNested_(payload, "query", "utm_campaign"));
    if (field === "utm_content") value = first_(value, getNested_(payload, "query", "utm_content"));
    if (field === "utm_term") value = first_(value, getNested_(payload, "query", "utm_term"));
    if (field === "utm_id") value = first_(value, getNested_(payload, "query", "utm_id"));
    if (field === "device_class") value = first_(value, payload.deviceType);
    if (field === "tracking_method") value = first_(value, payload.trackingMethod);
    if (field === "user_agent") value = first_(value, payload.userAgent, payload.ua);
    if (field === "page_path") value = first_(value, payload.pagePath, payload.pageUrl);
    if (field === "referrer_domain") value = first_(value, payload.referrerDomain, payload.referrer);
    if (field === "screen_width") value = first_(value, payload.screenWidth, payload.sw);
    if (field === "screen_height") value = first_(value, payload.screenHeight, payload.sh);
    if (field === "device_pixel_ratio") value = first_(value, payload.devicePixelRatio, payload.dpr);
    if (field === "forced_dark_detection") value = first_(value, payload.forcedDarkDetection, payload.fdd);
    if (field === "theme_signal_quality") value = first_(value, payload.themeSignalQuality, payload.tsq);

    if (boolFields[field]) normalized[field] = asBool_(value);
    else if (numberFields[field]) normalized[field] = numberOrBlank_(value);
    else if (pathFields[field]) normalized[field] = sanitizePath_(value);
    else if (hostFields[field]) normalized[field] = sanitizeHostname_(value);
    else normalized[field] = clean_(value, field === "user_agent" ? 500 : (/_json$/.test(field) ? 1200 : 300));
  });
}

function boolFieldMap_() {
  var fields = [
    "count_as_visit", "duplicate_event", "forced_layout_applied", "safe_fallback_used", "touch", "would_auto_use_mobile", "debug_mode", "no_redirect_mode", "visual_viewport_available", "is_landscape", "fallback_link_clicked", "has_touch", "any_pointer_coarse", "any_pointer_fine", "hybrid_touch_mouse_likely", "keyboard_mouse_likely", "remote_control_likely", "stylus_possible", "uach_available", "uach_mobile", "uach_wow64", "ua_reduced_likely", "is_webview", "inferred_is_phone", "inferred_is_tablet", "inferred_is_ipad_like", "inferred_is_android_tablet_like", "inferred_is_samsung_galaxy_tab_like", "inferred_is_surface_like", "inferred_is_chromeos_tablet_like", "inferred_is_smart_tv", "inferred_is_console", "inferred_is_foldable_possible", "inferred_is_kiosk_or_public_display_possible", "inferred_is_bot", "inferred_is_link_preview", "connection_save_data", "performance_supported", "endpoint_result_known", "endpoint_slow_possible", "imageget_payload_near_limit", "diagnostic_payload_too_large", "device_posture_api_available", "gamepad_api_available", "inferred_is_large_phone", "inferred_is_small_phone", "inferred_is_large_tablet", "inferred_is_ipad_desktop_mode", "inferred_is_windows_touch_hybrid", "inferred_is_desktop_like", "inferred_is_laptop_like", "inferred_is_apple_tv_like", "inferred_is_android_tv", "inferred_is_google_tv_like", "inferred_is_fire_tv_like", "inferred_is_tizen_tv", "inferred_is_webos_tv", "inferred_is_roku", "inferred_is_android_tv_box_like", "inferred_is_set_top_box_like", "inferred_is_game_console", "inferred_is_playstation", "inferred_is_xbox", "inferred_is_nintendo", "inferred_is_vr_headset_like", "inferred_is_car_browser_like", "inferred_is_e_reader_like", "inferred_is_webview"
  ];
  return arrayToMap_(fields);
}

function numberFieldMap_() {
  var fields = [
    "viewport_width", "viewport_height", "browser_major_version", "screen_width", "screen_height", "device_pixel_ratio", "max_touch_points", "layout_viewport_width", "layout_viewport_height", "visual_viewport_width", "visual_viewport_height", "visual_viewport_scale", "screen_avail_width", "screen_avail_height", "orientation_angle", "aspect_ratio", "dom_content_loaded_ms", "load_event_ms", "redirect_delay_ms", "tracker_send_start_ms", "tracker_send_ms", "tracker_payload_size_bytes", "payload_size_bytes", "imageget_url_length", "script_error_count", "hardware_concurrency", "device_memory_gb", "connection_downlink", "connection_rtt", "inferred_confidence_score"
  ];
  return arrayToMap_(fields);
}

function arrayToMap_(fields) {
  var map = {};
  (fields || []).forEach(function (field) { map[field] = true; });
  return map;
}

function applyBradamottakaIdentifierRules_(row) {
  row = row || {};
  if (row.dashboard_key === "bradamottaka" || row.dashboard_id === "bradamottakan-fossvogi" || row.dashboard_id === "bradamottaka-fossvogi") {
    row.dashboard_key = "bradamottaka";
    row.dashboard_id = "bradamottaka-fossvogi";
    if (row.dashboard_name === "Bráðamóttakan í Fossvogi" || !row.dashboard_name) row.dashboard_name = "Bráðamóttaka í Fossvogi";
    if (row.public_card_title === "Bráðamóttakan í Fossvogi" || !row.public_card_title) row.public_card_title = "Bráðamóttaka í Fossvogi";
    if (row.utm_content === "bradamottakan_fossvogi" || !row.utm_content) row.utm_content = "bradamottaka_fossvogi";
  }
  return row;
}

function applyRegistryMetadataFallback_(row) {
  row = row || {};
  var dashboards = REGISTRY_SNAPSHOT.dashboards || {};
  var key = row.dashboard_key || "";
  var dashboard = key && dashboards[key] ? dashboards[key] : null;
  var dKey;
  var card;

  if (!dashboard && row.dashboard_id) {
    for (dKey in dashboards) {
      if (Object.prototype.hasOwnProperty.call(dashboards, dKey) && dashboards[dKey].dashboardId === row.dashboard_id) {
        dashboard = dashboards[dKey];
        key = dKey;
        break;
      }
    }
  }

  if (!dashboard) return row;

  card = dashboard.publicCard || {};
  row.dashboard_key = row.dashboard_key || dashboard.dashboardKey || key;
  row.dashboard_id = row.dashboard_id || dashboard.dashboardId || "";
  row.dashboard_name = row.dashboard_name || dashboard.displayName || dashboard.routerDisplayTitle || dashboard.powerBiReportTitle || "";
  row.public_card_title = row.public_card_title || card.title || row.dashboard_name || "";
  row.public_entry_page = row.public_entry_page || sanitizePath_(card.pageUrl || (REGISTRY_SNAPSHOT.publicEntry && REGISTRY_SNAPSHOT.publicEntry.pageUrl) || "");
  row.utm_content = row.utm_content || dashboard.utmContent || card.stableUtmContent || "";
  return row;
}

function repairBradamottakaIdentifierHistory() {
  setupWorkbook_();
  var ss = getSpreadsheet_();
  var sheets = [SHEET_EVENTS, SHEET_DAILY, SHEET_HOURLY, SHEET_DASHBOARD, SHEET_DEVICE, SHEET_SOURCE, SHEET_ROUTE, SHEET_QUALITY, SHEET_DASHBOARD_REGISTRY, SHEET_PUBLIC_REGISTRY, SHEET_DASHBOARD_DATA];
  var replacements = [["bradamottakan-fossvogi", "bradamottaka-fossvogi"], ["Bráðamóttakan í Fossvogi", "Bráðamóttaka í Fossvogi"], ["bradamottakan_fossvogi", "bradamottaka_fossvogi"]];
  var changed = 0;

  sheets.forEach(function (sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    replacements.forEach(function (pair) {
      changed += sheet.createTextFinder(pair[0]).matchCase(true).matchEntireCell(false).replaceAllWith(pair[1]);
    });
  });

  seedRegistrySheets_();
  aggregateRecent();
  clearDashboardDataCache_();
  setControl_("bradamottaka_identifier_repair_at", nowIso_());
  setControl_("bradamottaka_identifier_repair_replacements", changed);
  return "Repaired Bráðamóttaka identifiers. Replacements: " + changed;
}

function repairDashboardMetadataHistory() {
  setupWorkbook_();
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_EVENTS);
  if (!sheet || sheet.getLastRow() <= 1) return "No event rows to repair";

  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var changedRows = 0;
  var i;
  var row;
  var repaired;
  var oldSignature;
  var newSignature;

  for (i = 1; i < values.length; i += 1) {
    row = rowToObject_(headers, values[i]);
    oldSignature = [row.dashboard_key, row.dashboard_id, row.dashboard_name, row.public_card_title, row.public_entry_page, row.utm_content].join("|");
    repaired = applyRegistryMetadataFallback_(applyBradamottakaIdentifierRules_(row));
    newSignature = [repaired.dashboard_key, repaired.dashboard_id, repaired.dashboard_name, repaired.public_card_title, repaired.public_entry_page, repaired.utm_content].join("|");
    if (oldSignature !== newSignature) {
      values[i] = headers.map(function (header) { return repaired[header] === undefined ? "" : repaired[header]; });
      changedRows += 1;
    }
  }

  if (changedRows > 0) sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  setControl_("dashboard_metadata_repair_at", nowIso_());
  setControl_("dashboard_metadata_repair_rows", changedRows);
  aggregateRecent();
  clearDashboardDataCache_();
  return "Repaired dashboard metadata rows: " + changedRows;
}

function repairPowerBiViewerCompatibilityHistory(runAggregation) {
  setupWorkbook_();
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_EVENTS);
  if (!sheet || sheet.getLastRow() <= 1) return "No event rows to repair";

  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var changedRows = 0;
  var i;
  var row;
  var repaired;
  var oldSignature;
  var newSignature;

  for (i = 1; i < values.length; i += 1) {
    row = rowToObject_(headers, values[i]);
    oldSignature = [row.warning_code, row.warning_detail, row.source_confidence_band, row.source_reason].join("|");
    repaired = classifyViewerCompatibility_(row);
    newSignature = [repaired.warning_code, repaired.warning_detail, repaired.source_confidence_band, repaired.source_reason].join("|");
    if (oldSignature !== newSignature) {
      values[i] = headers.map(function (header) { return repaired[header] === undefined ? "" : repaired[header]; });
      changedRows += 1;
    }
  }

  if (changedRows > 0) sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  setControl_("powerbi_viewer_compatibility_repair_at", nowIso_());
  setControl_("powerbi_viewer_compatibility_repair_rows", changedRows);
  clearDashboardDataCache_();
  writeSchemaMigrationLog_("repairPowerBiViewerCompatibilityHistory", "ok", "Reclassified Smart TV / legacy browser Power BI viewer compatibility rows: " + changedRows);
  if (runAggregation !== false) aggregateRecent();
  return "Reclassified Power BI viewer compatibility rows: " + changedRows;
}

function appendEvent_(normalized) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    normalized = classifyViewerCompatibility_(normalized || {});
    locked = lock.tryLock(2000);
    if (!locked) throw new Error("Could not acquire script lock for event append");

    var sheet = ensureSheet_(SHEET_EVENTS, EVENT_HEADERS);
    var headers = getSheetHeaders_(sheet, EVENT_HEADERS);
    appendRows_(sheet, headers, [normalized]);

    setControl_("last_event_time", normalized.server_time);
    setControl_("last_raw_event_time", normalized.server_time);
    setControl_("last_event_id", normalized.event_id);
    if (isRealVisit_(normalized)) setControl_("last_counted_event_time", normalized.server_time);
    if (isDiagnosticEvent_(normalized)) setControl_("last_diagnostic_event_time", normalized.server_time);
    if (normalized.event_type === "router_error" || normalized.error_message) setControl_("last_error_event_time", normalized.server_time);
  } finally {
    if (locked) lock.releaseLock();
  }
}

function classifyViewerCompatibility_(row) {
  row = row || {};
  if (!isRealVisit_(row)) return row;
  if (!isPowerBiTarget_(row)) return row;

  var support = powerBiViewerSupport_(row);
  var existing = String(row.warning_code || "").toLowerCase();

  if (support.warning_code === "powerbi_viewer_unsupported_browser") {
    if (!existing || existing === "forced_dark_detected" || existing === "samsung_forced_dark_possible" || existing === "powerbi_viewer_compatibility_risk") {
      row.warning_code = support.warning_code;
      row.warning_detail = support.warning_text;
    }
    if (!row.source_confidence_band) row.source_confidence_band = support.confidence_band;
    if (!row.source_reason) row.source_reason = support.status;
  }

  return row;
}

function addIncomingRouterWarning_(qualityAgg, row, key, now, isVisit, isDiagnostic) {
  var code = clean_(row.warning_code || "", 120);
  var severity;

  if (!code) return;

  if (code === "forced_dark_detected") {
    addQualityWarning_(qualityAgg, "forced_dark_detected", key, "info", "Forced/auto dark rendering greindist. Þetta er birtingarmerki, ekki staðfest Power BI eða router villa.", "Prófa affected browser og Power BI report liti áður en þetta er meðhöndlað sem rekstrarvandamál.", now, false, true, false, row.theme_signal_quality || "detected", row.theme_confidence_band || "medium confidence");
    return;
  }

  if (code === "samsung_forced_dark_possible") {
    addQualityWarning_(qualityAgg, "samsung_forced_dark_possible", key, "info", "Samsung Internet á Android gæti verið með forced dark. Þetta er óvissumerki, ekki staðfest dark mode.", "Nota debug/noRedirect prófun á Samsung Internet og staðfesta sjónrænt áður en ályktun er dregin.", now, false, true, false, "possible_only", "weak inference");
    return;
  }

  severity = warningSeverity_(code, row);
  addQualityWarning_(qualityAgg, code, key, severity, warningText_(code, row), warningRecommendation_(code), now, isVisit, isDiagnostic, isVisit && severity !== "info", row.theme_signal_quality || row.uach_signal_quality || "reported", row.inferred_confidence_band || row.theme_confidence_band || "unknown");
}

function addPowerBiViewerCompatibilityWarning_(qualityAgg, row, key, now, isVisit) {
  var support;
  if (!isVisit) return;
  if (!isPowerBiTarget_(row)) return;

  support = powerBiViewerSupport_(row);
  if (!support.warning_code) return;

  addQualityWarning_(qualityAgg, support.warning_code, key, support.severity, support.warning_text, support.recommendation, now, support.confirmed, !support.confirmed, support.confirmed, support.signal_quality, support.confidence_band);
}

function powerBiViewerSupport_(row) {
  var family = lower_(row.browser_family);
  var brand = lower_(row.browser_brand);
  var engine = lower_(row.browser_engine);
  var ua = lower_(row.user_agent);
  var haystack = [family, brand, engine, ua].join(" ");
  var version = browserVersionNumber_(row);
  var osFamily = lower_(row.os_family);
  var osVersion = parseVersionNumber_(first_(row.os_version, row.os_version_hint, ""));
  var tvLike = isSmartTvLike_(row);
  var inApp = asBool_(row.is_webview) || (row.in_app_browser_family && row.in_app_browser_family !== "none") || (row.inferred_in_app_browser_family && row.inferred_in_app_browser_family !== "none") || asBool_(row.inferred_is_webview);

  if (/msie|trident|internet explorer/.test(haystack)) return powerBiSupportResult_("powerbi_viewer_unsupported_browser", "warning", true, row, "Internet Explorer / Trident er ekki studdur Power BI/Fabric vafri.");
  if (osFamily === "ios" && osVersion && osVersion <= 10) return powerBiSupportResult_("powerbi_viewer_unsupported_browser", "warning", true, row, "Power BI/Fabric keyrir ekki í vöfrum á iOS 10 eða eldri.");
  if (isEdgeLike_(haystack)) {
    if (version && version >= 120) return powerBiSupportOk_("supported_edge_120_plus", row);
    if (version) return powerBiSupportResult_("powerbi_viewer_unsupported_browser", "warning", true, row, "Edge útgáfa er undir opinberu Power BI/Fabric lágmarki 120.");
  }
  if (isFirefoxLike_(haystack)) {
    if (version && version > 93 && !tvLike && !inApp) return powerBiSupportOk_("supported_firefox_desktop_94_plus", row);
    if (version && version <= 93) return powerBiSupportResult_("powerbi_viewer_unsupported_browser", "warning", true, row, "Firefox útgáfa er ekki nýrri en 93 og er því undir opinberu Power BI/Fabric viðmiði.");
  }
  if (isSafariLike_(haystack)) {
    if (version && version >= 16.4 && !tvLike && !inApp) return powerBiSupportOk_("supported_safari_16_4_plus", row);
    if (version && version < 16.4) return powerBiSupportResult_("powerbi_viewer_unsupported_browser", "warning", true, row, "Safari útgáfa er undir opinberu Power BI/Fabric lágmarki 16.4.");
  }
  if (isChromeOrChromiumLike_(haystack, engine)) {
    if (version && version > 94 && !tvLike && !inApp && !/opr|opera|samsung|hbbtv|smarttv|smarttva/.test(haystack)) return powerBiSupportOk_("supported_chrome_desktop_95_plus", row);
    if (version && version <= 94) return powerBiSupportResult_("powerbi_viewer_unsupported_browser", "warning", true, row, "Chromium/Chrome/Opera engine er ekki nýrri en 94 og er því undir opinberu Power BI/Fabric Chrome viðmiði.");
  }
  if (tvLike) return powerBiSupportResult_("powerbi_viewer_not_officially_supported", "info", false, row, "Smart TV/HbbTV/TV browser er ekki í opinberu Power BI/Fabric vafralistanum. Router getur virkað en Power BI viewer getur verið óáreiðanlegur.");
  if (inApp) return powerBiSupportResult_("powerbi_viewer_not_officially_supported", "info", false, row, "In-app/WebView vafri er ekki sjálfstæður studdur Power BI/Fabric vafri. Prófa í nýlegum Edge/Chrome/Safari/Firefox ef hleðsla bregst.");

  return powerBiSupportOk_("support_not_classified_but_no_risk_signal", row);
}

function powerBiSupportOk_(status, row) {
  return { status: status, warning_code: "", severity: "ok", confirmed: false, warning_text: "", recommendation: "", signal_quality: "browser_policy_match", confidence_band: row.inferred_confidence_band || row.inferred_confidence_band_compact || "high confidence" };
}

function powerBiSupportResult_(code, severity, confirmed, row, reason) {
  return { status: code, warning_code: code, severity: severity || "info", confirmed: !!confirmed, warning_text: powerBiViewerSupportText_(row, reason), recommendation: powerBiViewerSupportRecommendation_(row, code), signal_quality: "inferred_from_browser_policy", confidence_band: row.inferred_confidence_band || row.inferred_confidence_band_compact || "high confidence" };
}

function powerBiViewerSupportText_(row, reason) {
  var browser = clean_((row.browser_brand || row.browser_family || "unknown") + " " + (row.browser_full_version || row.browser_major_version || ""), 120);
  var device = clean_(row.inferred_device_class || row.inferred_form_factor || row.device_class || "unknown", 80);
  var os = clean_((row.os_family || "unknown") + " " + (row.os_version || row.os_version_hint || ""), 80);
  var screen = clean_((row.viewport_width || "?") + "x" + (row.viewport_height || "?"), 40);
  return reason + " Greint samhengi: " + browser + ", " + os + ", " + device + ", " + screen + ".";
}

function powerBiViewerSupportRecommendation_(row, code) {
  if (isSmartTvLike_(row)) return "Fyrir skjái/sjónvörp skal nota Windows mini-PC/signage box með nýlegum Edge eða Chrome. Ekki treysta á innbyggðan Smart TV/HbbTV browser fyrir Power BI publish-to-web.";
  if (code === "powerbi_viewer_unsupported_browser") return "Uppfæra eða skipta yfir í studdan nýlegan Edge, Chrome desktop, Safari 16.4+ eða Firefox desktop nýrri en 93 og prófa app.powerbi.com beint.";
  return "Prófa Power BI publish-to-web slóðina beint í studdum nútíma vafra. Athuga einnig third-party cookies fyrir app.powerbi.com ef hleðsla stoppar.";
}

function isPowerBiTarget_(row) {
  var type = lower_(row.target_url_type);
  var eventType = lower_(row.event_type);
  if (type === "powerbi_publish_to_web" || type.indexOf("powerbi") >= 0) return true;
  return (eventType === "router_redirect" || eventType === "router_noscript") && !!(row.dashboard_key || row.dashboard_id);
}

function isSmartTvLike_(row) {
  var ua = String(row.user_agent || "");
  var cls = lower_(row.inferred_device_class || row.device_class || "");
  var form = lower_(row.inferred_form_factor || "");
  var context = lower_(row.inferred_browser_context || "");
  return cls === "smart_tv" || form === "tv" || context === "tv_browser" || asBool_(row.inferred_is_smart_tv) || asBool_(row.inferred_is_tizen_tv) || asBool_(row.inferred_is_webos_tv) || asBool_(row.inferred_is_roku) || asBool_(row.inferred_is_android_tv) || asBool_(row.inferred_is_google_tv_like) || asBool_(row.inferred_is_fire_tv_like) || asBool_(row.inferred_is_apple_tv_like) || asBool_(row.inferred_is_android_tv_box_like) || asBool_(row.inferred_is_set_top_box_like) || /HbbTV|SmartTV|SmartTvA|NETTV|VSTVB|Vestel|FINLUX|Tizen|WebOS|webOS|Roku|AFT|AppleTV|Android TV|GoogleTV|OMI\//i.test(ua);
}

function isEdgeLike_(haystack) {
  return /\bedge\b|\bedg\//.test(haystack);
}

function isFirefoxLike_(haystack) {
  return /firefox|fxios/.test(haystack);
}

function isSafariLike_(haystack) {
  return /safari/.test(haystack) && !/chrome|chromium|crios|opr|opera|edg\//.test(haystack);
}

function isChromeOrChromiumLike_(haystack, engine) {
  return /chrome|chromium|crios|opr|opera/.test(haystack) || engine === "blink";
}

function browserVersionNumber_(row) {
  return parseVersionNumber_(first_(row.browser_full_version, row.browser_major_version, ""));
}

function parseVersionNumber_(value) {
  var match = String(value || "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function lower_(value) {
  return String(value || "").toLowerCase();
}

function getSpreadsheet_() {
  var id = clean_(TRACKER_SPREADSHEET_ID || "", 120);
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.getActive();
  if (!ss) throw new Error("No active spreadsheet. Create this script from the tracker Google Sheet with Extensions > Apps Script, or set TRACKER_SPREADSHEET_ID at the top of the script.");
  return ss;
}

function verifySpreadsheetSetup() {
  var ss = getSpreadsheet_();
  var checks = [];
  var required = [
    [SHEET_EVENTS, EVENT_HEADERS], [SHEET_ERRORS, ERROR_HEADERS], [SHEET_DAILY, DAILY_HEADERS], [SHEET_HOURLY, HOURLY_HEADERS], [SHEET_DASHBOARD, DASHBOARD_HEADERS],
    [SHEET_DEVICE, DEVICE_HEADERS], [SHEET_SOURCE, SOURCE_HEADERS], [SHEET_ROUTE, ROUTE_HEADERS], [SHEET_QUALITY, QUALITY_HEADERS], [SHEET_DEVICE_CONFIDENCE, DEVICE_CONFIDENCE_HEADERS],
    [SHEET_BROWSER, BROWSER_HEADERS], [SHEET_OS, OS_HEADERS], [SHEET_DISPLAY, DISPLAY_HEADERS], [SHEET_INPUT, INPUT_HEADERS], [SHEET_PERFORMANCE, PERFORMANCE_HEADERS],
    [SHEET_DASHBOARD_REGISTRY, DASHBOARD_REGISTRY_HEADERS], [SHEET_PUBLIC_REGISTRY, PUBLIC_REGISTRY_HEADERS], [SHEET_DATA_DICTIONARY, ["field", "description"]], [SHEET_CONTROL, CONTROL_HEADERS], [SHEET_DASHBOARD_DATA, DASHBOARD_DATA_HEADERS], [SHEET_SCHEMA_MIGRATION_LOG, SCHEMA_MIGRATION_LOG_HEADERS]
  ];

  required.forEach(function (item) {
    var sheet = ss.getSheetByName(item[0]);
    var ok = !!sheet;
    var missing = [];
    if (sheet) {
      var actual = sheet.getLastRow() >= 1 ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), item[1].length)).getValues()[0] : [];
      item[1].forEach(function (header) { if (actual.indexOf(header) < 0) missing.push(header); });
      ok = missing.length === 0;
    }
    checks.push({ sheet: item[0], ok: ok, missing_headers: missing });
  });

  return { ok: checks.every(function (c) { return c.ok; }), spreadsheetName: ss.getName(), spreadsheetId: ss.getId(), scriptVersion: SCRIPT_VERSION, schemaVersion: EVENT_SCHEMA_VERSION, timezone: DEFAULT_TIMEZONE, checks: checks };
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
  ensureSheet_(SHEET_DEVICE_CONFIDENCE, DEVICE_CONFIDENCE_HEADERS);
  ensureSheet_(SHEET_BROWSER, BROWSER_HEADERS);
  ensureSheet_(SHEET_OS, OS_HEADERS);
  ensureSheet_(SHEET_DISPLAY, DISPLAY_HEADERS);
  ensureSheet_(SHEET_INPUT, INPUT_HEADERS);
  ensureSheet_(SHEET_PERFORMANCE, PERFORMANCE_HEADERS);
  ensureSheet_(SHEET_SCHEMA_MIGRATION_LOG, SCHEMA_MIGRATION_LOG_HEADERS);
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
  var actual;
  var missing;
  var startCol;

  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  actual = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  if (!actual.length || !String(actual[0] || "")) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  missing = headers.filter(function (header) { return actual.indexOf(header) < 0; });
  if (missing.length) {
    startCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
  }

  sheet.setFrozenRows(1);
  return sheet;
}

function getSheetHeaders_(sheet, fallbackHeaders) {
  if (!sheet || sheet.getLastRow() < 1) return fallbackHeaders;
  var width = Math.max(sheet.getLastColumn(), fallbackHeaders.length);
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  headers = headers.filter(function (header) { return header !== "" && header !== null && header !== undefined; });
  return headers.length ? headers : fallbackHeaders;
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
  var dictionary = mergeDictionaries_();
  var rows = Object.keys(dictionary).sort().map(function (field) { return [field, dictionary[field]]; });
  var sheet = ensureSheet_(SHEET_DATA_DICTIONARY, ["field", "description"]);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([["field", "description"]]);
  if (rows.length) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}

function getCachedDashboardData_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(DASHBOARD_CACHE_KEY);
  if (cached) {
    try {
      return withCacheInfo_(JSON.parse(cached), true);
    } catch (error) {
      clearDashboardDataCache_();
    }
  }

  setupWorkbook_();
  var data = getDashboardData_();
  putDashboardDataCache_(data);
  return withCacheInfo_(data, false);
}

function putDashboardDataCache_(data) {
  try {
    var cleanData = removeCacheInfo_(data);
    CacheService.getScriptCache().put(DASHBOARD_CACHE_KEY, JSON.stringify(cleanData), DASHBOARD_CACHE_SECONDS);
  } catch (error) {
    logError_("putDashboardDataCache_", error, "cache");
  }
}

function clearDashboardDataCache_() {
  try {
    CacheService.getScriptCache().remove(DASHBOARD_CACHE_KEY);
  } catch (error) {}
}

function withCacheInfo_(data, hit) {
  var payload;
  try {
    payload = JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    payload = data || {};
  }
  payload.cache = { hit: !!hit, cache_key: DASHBOARD_CACHE_KEY, cache_seconds: DASHBOARD_CACHE_SECONDS, served_at: nowIso_() };
  return payload;
}

function removeCacheInfo_(data) {
  var payload;
  try {
    payload = JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    payload = data || {};
  }
  try { delete payload.cache; } catch (ignored) {}
  return payload;
}

function getDashboardData_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_DASHBOARD_DATA);
  var json = readDashboardDataJsonFromSheet_(sheet);
  if (json) {
    try { return JSON.parse(json); } catch (error) { logError_("getDashboardData_", error, "dashboard_data_parse"); }
  }
  return buildDashboardDataFromSheets_();
}

function readDashboardDataJsonFromSheet_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return "";
  var values = sheet.getDataRange().getValues();
  var headers = values[0] || [];
  var jsonColumn = headers.indexOf("json");
  var chunkColumn = headers.indexOf("json_chunk");
  var chunkIndexColumn = headers.indexOf("chunk_index");
  var rows;

  if (jsonColumn >= 0) return String(values[1][jsonColumn] || "");
  if (chunkColumn < 0) return "";

  rows = values.slice(1).filter(function (row) { return row[chunkColumn] !== "" && row[chunkColumn] !== null && row[chunkColumn] !== undefined; });
  if (chunkIndexColumn >= 0) rows.sort(function (a, b) { return toNumber_(a[chunkIndexColumn]) - toNumber_(b[chunkIndexColumn]); });
  return rows.map(function (row) { return String(row[chunkColumn] || ""); }).join("");
}

function chunkString_(value, size) {
  var text = String(value || "");
  var chunks = [];
  var i;
  size = Math.max(toNumber_(size) || 45000, 1000);
  if (!text) return [""];
  for (i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

function buildRootIndexFunnel_() {
  var events = sheetObjects_(SHEET_EVENTS, EVENT_HEADERS);
  var funnel = {
    views: 0,
    clicks: 0,
    router_arrivals: 0,
    counted_opens: 0,
    click_to_open_rate: 0,
    last_root_view_time: "",
    last_root_click_time: "",
    last_router_arrival_time: "",
    config_failures: 0,
    fallback_clicks: 0,
    dashboard_clicks: [],
    source_mix: []
  };
  var clicksByDashboard = {};
  var sourceMix = {};

  events.forEach(function (row) {
    var eventType = String(row.event_type || "").toLowerCase();
    var source = String(row.entry_source_category || deriveSourceCategory_(row) || "unknown");
    var dashboardKey = row.dashboard_key || "unknown";
    var isRootSource = source === "root_index" || row.utm_source === "root_index" || /root_index/i.test(row.root_dashboard_target_path || "");

    if (eventType === "root_index_view") {
      funnel.views += 1;
      funnel.last_root_view_time = newestIso_(funnel.last_root_view_time, row.server_time || row.client_time);
      sourceMix[source] = (sourceMix[source] || 0) + 1;
    }

    if (eventType === "root_dashboard_click") {
      funnel.clicks += 1;
      funnel.last_root_click_time = newestIso_(funnel.last_root_click_time, row.server_time || row.client_time);
      clicksByDashboard[dashboardKey] = (clicksByDashboard[dashboardKey] || 0) + 1;
      sourceMix[source] = (sourceMix[source] || 0) + 1;
    }

    if (eventType === "router_redirect" && isRootSource) {
      funnel.router_arrivals += 1;
      funnel.last_router_arrival_time = newestIso_(funnel.last_router_arrival_time, row.server_time || row.client_time);
      if (isRealVisit_(row)) funnel.counted_opens += 1;
    }

    if (eventType === "config_load_failure" || row.warning_code === "root_index_config_failure") funnel.config_failures += 1;
    if (eventType === "fallback_click" && isRootSource) funnel.fallback_clicks += 1;
  });

  funnel.click_to_open_rate = funnel.clicks ? funnel.counted_opens / Math.max(funnel.clicks, 1) : 0;
  funnel.dashboard_clicks = Object.keys(clicksByDashboard).sort().map(function (key) { return { dashboard_key: key, clicks: clicksByDashboard[key] }; });
  funnel.source_mix = Object.keys(sourceMix).sort().map(function (key) { return { source: key, events: sourceMix[key] }; });
  return funnel;
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
  var deviceConfidence = sheetObjects_(SHEET_DEVICE_CONFIDENCE, DEVICE_CONFIDENCE_HEADERS);
  var browsers = sheetObjects_(SHEET_BROWSER, BROWSER_HEADERS);
  var os = sheetObjects_(SHEET_OS, OS_HEADERS);
  var display = sheetObjects_(SHEET_DISPLAY, DISPLAY_HEADERS);
  var input = sheetObjects_(SHEET_INPUT, INPUT_HEADERS);
  var performance = sheetObjects_(SHEET_PERFORMANCE, PERFORMANCE_HEADERS);
  var rootIndexFunnel = buildRootIndexFunnel_();
  var control = controlMap_();
  var totals = {
    visits_today: 0,
    visits_7d: 0,
    visits_30d: 0,
    active_dashboards: 0,
    mobile_visits: 0,
    desktop_visits: 0,
    tablet_visits: 0,
    narrow_visits: 0,
    fallback_error_count: 0,
    bot_debug_test_count: 0,
    island_is_visits: 0,
    total_visits: 0,
    total_events: 0,
    raw_events: 0,
    diagnostic_events: 0,
    confirmed_warnings: 0,
    warning_count: 0,
    diagnostic_signals: 0,
    weak_unknown_signal_count: 0,
    reported_dark_visits: 0,
    reported_light_visits: 0,
    forced_dark_detected_visits: 0,
    samsung_forced_dark_possible_events: 0,
    in_app_browser_visits: 0,
    powerbi_viewer_unsupported_browser_events: 0,
    powerbi_viewer_not_officially_supported_events: 0
  };

  dashboards.forEach(function (d) {
    if (d.status === "active") totals.active_dashboards += 1;
    totals.visits_today += toNumber_(d.visits_today);
    totals.visits_7d += toNumber_(d.visits_7d);
    totals.visits_30d += toNumber_(d.visits_30d);
    totals.mobile_visits += toNumber_(d.mobile_visits);
    totals.desktop_visits += toNumber_(d.desktop_visits);
    totals.tablet_visits += toNumber_(d.tablet_visits);
    totals.narrow_visits += toNumber_(d.narrow_visits);
    totals.island_is_visits += toNumber_(d.island_is_visits);
    totals.fallback_error_count += toNumber_(d.fallback_clicks) + toNumber_(d.error_events);
    totals.bot_debug_test_count += toNumber_(d.bot_events) + toNumber_(d.debug_events);
    totals.total_visits += toNumber_(d.total_visits);
    totals.total_events += toNumber_(d.total_events);
    totals.raw_events += toNumber_(d.raw_events);
    totals.diagnostic_events += toNumber_(d.diagnostic_events);
    totals.warning_count += toNumber_(d.warning_count);
    totals.confirmed_warnings += toNumber_(d.confirmed_warning_count);
    totals.diagnostic_signals += toNumber_(d.diagnostic_signal_count);
    totals.weak_unknown_signal_count += toNumber_(d.weak_unknown_signal_count);
  });

  display.forEach(function (row) {
    if (row.color_scheme === "dark" || row.prefers_color_scheme === "dark") totals.reported_dark_visits += toNumber_(row.visits);
    if (row.color_scheme === "light" || row.prefers_color_scheme === "light") totals.reported_light_visits += toNumber_(row.visits);
    if (row.forced_dark_detection === "detected") totals.forced_dark_detected_visits += toNumber_(row.visits);
    if (row.samsung_dark_mode_status === "samsung_forced_dark_possible") totals.samsung_forced_dark_possible_events += toNumber_(row.events);
  });

  browsers.forEach(function (row) {
    if (row.in_app_browser_family && row.in_app_browser_family !== "none") totals.in_app_browser_visits += toNumber_(row.visits);
  });

  warnings.forEach(function (row) {
    if (row.warning_code === "powerbi_viewer_unsupported_browser") totals.powerbi_viewer_unsupported_browser_events += toNumber_(row.count);
    if (row.warning_code === "powerbi_viewer_not_officially_supported") totals.powerbi_viewer_not_officially_supported_events += toNumber_(row.count);
  });

  totals.mobile_share = totals.total_visits ? totals.mobile_visits / totals.total_visits : 0;
  totals.desktop_share = totals.total_visits ? totals.desktop_visits / totals.total_visits : 0;
  totals.weak_unknown_signal_share = totals.total_events ? totals.weak_unknown_signal_count / totals.total_events : 0;
  totals.confidence_health = totals.weak_unknown_signal_share > 0.35 ? "warning" : "ok";

  return {
    ok: true,
    generated_at: generated,
    dashboard_data_generated_at: generated,
    aggregation_generated_at: control.aggregation_generated_at || control.last_aggregation_time || "",
    script_version: SCRIPT_VERSION,
    schema_version: EVENT_SCHEMA_VERSION,
    config_version: REGISTRY_SNAPSHOT.configVersion,
    core_version: newestNonEmpty_(dashboards.map(function (d) { return d.core_version; })),
    public_entry: REGISTRY_SNAPSHOT.publicEntry,
    health: getHealth_().health,
    kpis: totals,
    dashboards: dashboards,
    public_cards: publicCards,
    daily: daily,
    hourly: hourly,
    device: device,
    device_confidence: deviceConfidence,
    browsers: browsers,
    os: os,
    display: display,
    input: input,
    performance: performance,
    root_index_funnel: rootIndexFunnel,
    root_index: rootIndexFunnel,
    sources: sources,
    routes: routes,
    quality_warnings: warnings,
    insight_cards: buildInsightCards_(totals, dashboards, device, routes, warnings),
    questions: [
      "Eru Teams/Outlook/link previews talin sem raunnotkun?",
      "Er island.is umferð að lækka eftir breytingu á opinberum kortum?",
      "Er fallback að bjarga brotinni leiðingu án þess að við tökum eftir því?",
      "Eru veik tæki, Smart TV vafrar, forced dark eða in-app browsers að hafa áhrif á Power BI upplifun?"
    ]
  };
}

function buildInsightCards_(totals, dashboards, device, routes, warnings) {
  var totalVisits = Math.max(toNumber_(totals.total_visits), 0);
  var mobileShare = totalVisits ? Math.round(toNumber_(totals.mobile_visits) / totalVisits * 1000) / 10 : 0;
  var islandShare = totalVisits ? Math.round(toNumber_(totals.island_is_visits) / totalVisits * 1000) / 10 : 0;
  var fallbackRate = totalVisits ? Math.round(toNumber_(totals.fallback_error_count) / totalVisits * 1000) / 10 : 0;
  var weakShare = toNumber_(totals.total_events) ? Math.round(toNumber_(totals.weak_unknown_signal_count) / Math.max(toNumber_(totals.total_events), 1) * 1000) / 10 : 0;

  return [
    { code: "traffic_total", title: "Heildarumferð", value: String(totalVisits), detail: "Allar taldar heimsóknir yfir virk mælaborð." },
    { code: "mobile_share", title: "Mobile hlutfall", value: mobileShare + "%", detail: "Hlutfall heimsókna sem fóru í mobile útgáfu." },
    { code: "tablet_narrow", title: "Tablet / þröngt", value: String(toNumber_(totals.tablet_visits) + toNumber_(totals.narrow_visits)), detail: "Talin tablet eða þröng skjáhegðun." },
    { code: "confidence_health", title: "Signal gæði", value: weakShare + "%", detail: "Hlutfall veikra/óþekktra tækjamerkja í raw/aggregate gögnum." },
    { code: "island_is_share", title: "island.is uppruni", value: islandShare + "%", detail: "Hlutfall heimsókna sem virðast koma af island.is opinberri síðu." },
    { code: "fallback_error_rate", title: "Fallback/villu hlutfall", value: fallbackRate + "%", detail: "Fallback smellir og router villur sem hlutfall af heimsóknum." },
    { code: "display_theme", title: "Dark/forced signals", value: String(toNumber_(totals.reported_dark_visits) + toNumber_(totals.forced_dark_detected_visits)), detail: "Reported dark og forced-dark merki eru aðgreind." },
    { code: "pbi_viewer_risk", title: "Power BI viewer risk", value: String(toNumber_(totals.powerbi_viewer_unsupported_browser_events)), detail: "Óstuddur eða gamall vafri/tæki eftir Power BI redirect." },
    { code: "in_app_browser", title: "In-app browser", value: String(toNumber_(totals.in_app_browser_visits)), detail: "Teams/Outlook/WebView o.fl. þegar greinanlegt." }
  ];
}

function getHealth_() {
  var control = controlMap_();
  var events = getSpreadsheet_().getSheetByName(SHEET_EVENTS);
  var rawRows = events ? Math.max(events.getLastRow() - 1, 0) : 0;
  var lastRaw = control.last_raw_event_time || control.last_event_time || "";
  var lastCounted = control.last_counted_event_time || "";
  var lastDiagnostic = control.last_diagnostic_event_time || "";
  var lastError = control.last_error_event_time || "";
  var lastAggregation = control.aggregation_generated_at || control.last_aggregation_time || "";
  var warnings = [];
  if (!lastRaw) warnings.push("no_events_received_yet");
  if (!lastCounted) warnings.push("no_recent_counted_visits");
  if (!lastAggregation) warnings.push("aggregation_never_run");
  return {
    ok: true,
    script_version: SCRIPT_VERSION,
    schema_version: EVENT_SCHEMA_VERSION,
    config_version: REGISTRY_SNAPSHOT.configVersion,
    health: {
      status: warnings.length ? "warning" : "ok",
      last_event_time: lastRaw,
      last_raw_event_time: lastRaw,
      last_counted_event_time: lastCounted,
      last_diagnostic_event_time: lastDiagnostic,
      last_error_event_time: lastError,
      last_aggregation_time: lastAggregation,
      aggregation_generated_at: lastAggregation,
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
    var js = callback + "(" + JSON.stringify(data).replace(/</g, "\\u003c") + ");";
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

function addOperationalQualityWarnings_(dashboardAgg, qualityAgg, now) {
  Object.keys(dashboardAgg).forEach(function (key) {
    var d = dashboardAgg[key];
    if (!d.last_raw_event_time) addQualityWarning_(qualityAgg, "no_recent_events", key, "warning", "Engar mælingar hafa borist fyrir mælaborðið.", "Staðfesta að router HTML, config og Apps Script endpoint séu rétt birt.", now, false, false, true, "confirmed_by_aggregate", "high confidence");
    if (!d.last_counted_event_time) addQualityWarning_(qualityAgg, "no_recent_counted_visits", key, "warning", "Engin talin heimsókn er í nýjustu samantekt fyrir mælaborðið.", "Athuga hvort aðeins debug/test/bot atburðir séu að berast eða hvort island.is kortið sé ekki notað.", now, false, false, true, "confirmed_by_aggregate", "high confidence");
    if (d.total_visits > 0 && d.fallback_clicks / Math.max(d.total_visits, 1) > 0.05) addQualityWarning_(qualityAgg, "high_fallback_click_rate", key, "warning", "Fallback smellir eru yfir 5% af heimsóknum.", "Skoða sjálfvirka leiðingu, redirect delay og hvort Power BI URL opnist hjá notendum.", now, true, false, true, "confirmed_by_aggregate", "high confidence");
    if (d.error_events > 0) addQualityWarning_(qualityAgg, "router_errors_seen", key, "warning", "Villuatburðir hafa borist frá router.", "Skoða Errors sheet og raw rows með router_error.", now, false, false, true, "confirmed_by_aggregate", "high confidence");
    if (d.safe_fallback_events > 0) addQualityWarning_(qualityAgg, "safe_fallback_used", key, "warning", "Router notaði safe fallback config eða URL.", "Staðfesta Power BI publish-to-web URL í config og registry.", now, false, false, true, "confirmed_by_aggregate", "high confidence");
    if (d.weak_unknown_signal_count > d.total_events * 0.35 && d.total_events > 10) addQualityWarning_(qualityAgg, "high_weak_confidence_share", key, "warning", "Hátt hlutfall tækja eða browser merkja er veikt/óþekkt.", "Nota diagnostic enrichment í prófunum og skoða UA-CH stuðning án þess að breyta routing.", now, false, false, true, "confirmed_by_aggregate", "medium confidence");
  });
}

function addQualityWarning_(qualityAgg, warningCode, dashboardKey, severity, warningText, recommendation, now, counted, diagnostic, confirmed, signalQuality, confidenceBand) {
  var qualityKey = warningCode + "|" + dashboardKey;
  if (!qualityAgg[qualityKey]) {
    qualityAgg[qualityKey] = {
      warning_code: warningCode,
      dashboard_key: dashboardKey,
      severity: severity || "info",
      warning_text: warningText || warningCode,
      recommendation: recommendation || warningRecommendation_(warningCode),
      count: 0,
      counted_count: 0,
      diagnostic_count: 0,
      confirmed_count: 0,
      last_seen: now.toISOString(),
      signal_quality: signalQuality || "unknown",
      is_confirmed: false,
      confidence_band: confidenceBand || "unknown"
    };
  }
  qualityAgg[qualityKey].count += 1;
  if (counted) qualityAgg[qualityKey].counted_count += 1;
  if (diagnostic) qualityAgg[qualityKey].diagnostic_count += 1;
  if (confirmed) qualityAgg[qualityKey].confirmed_count += 1;
  qualityAgg[qualityKey].is_confirmed = !!(qualityAgg[qualityKey].confirmed_count > 0 || (qualityAgg[qualityKey].counted_count > 0 && String(qualityAgg[qualityKey].severity).toLowerCase() !== "info"));
  qualityAgg[qualityKey].last_seen = now.toISOString();
  qualityAgg[qualityKey].signal_quality = signalQuality || qualityAgg[qualityKey].signal_quality;
  qualityAgg[qualityKey].confidence_band = confidenceBand || qualityAgg[qualityKey].confidence_band;
}

function countWarningsForDashboard_(qualityAgg, dashboardKey, confirmedOnly) {
  var count = 0;
  Object.keys(qualityAgg).forEach(function (key) {
    var row = qualityAgg[key];
    var severity = String(row.severity || "info").toLowerCase();
    var confirmed = asBool_(row.is_confirmed);
    if (row.dashboard_key === dashboardKey && severity !== "info" && (!confirmedOnly || confirmed)) count += 1;
  });
  return count;
}

function countDiagnosticSignalsForDashboard_(qualityAgg, dashboardKey) {
  var count = 0;
  Object.keys(qualityAgg).forEach(function (key) {
    var row = qualityAgg[key];
    var severity = String(row.severity || "info").toLowerCase();
    if (row.dashboard_key === dashboardKey && (severity === "info" || !asBool_(row.is_confirmed))) count += 1;
  });
  return count;
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
    confidence_band: "unknown",
    weak_unknown_signal_count: 0,
    source_mix_summary: "",
    route_mix_summary: "",
    config_version: REGISTRY_SNAPSHOT.configVersion,
    core_version: ""
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

function dashboardKeyFromId_(dashboardId) {
  var dashboards = REGISTRY_SNAPSHOT.dashboards || {};
  var key;
  for (key in dashboards) {
    if (Object.prototype.hasOwnProperty.call(dashboards, key) && dashboards[key].dashboardId === dashboardId) return key;
  }
  return "";
}

function sheetObjects_(sheetName, headers) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var values = sheet.getDataRange().getValues();
  var header = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i += 1) rows.push(rowToObject_(header, values[i]));
  return rows;
}

function rowToObject_(headers, row) {
  var object = {};
  for (var i = 0; i < headers.length; i += 1) object[headers[i]] = row[i];
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
  var safeValue = safeCellString_(value, CONTROL_CELL_CHAR_BUDGET);
  var i;
  for (i = 1; i < values.length; i += 1) {
    if (values[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(safeValue);
      return;
    }
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, 2).setValues([[key, safeValue]]);
}

function safeCellString_(value, budget) {
  var text = String(value === undefined || value === null ? "" : value);
  var max = Math.max(toNumber_(budget) || 45000, 1000);
  if (text.length <= max) return text;
  return text.slice(0, max - 80) + "...[truncated " + text.length + " chars to protect Google Sheets cell limit]";
}

function controlMap_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEET_CONTROL);
  var map = {};
  if (!sheet || sheet.getLastRow() <= 1) return map;
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i += 1) map[values[i][0]] = values[i][1];
  return map;
}

function logError_(source, error, context) {
  try {
    var sheet = ensureSheet_(SHEET_ERRORS, ERROR_HEADERS);
    appendRows_(sheet, ERROR_HEADERS, [{ error_time: nowIso_(), script_version: SCRIPT_VERSION, source: clean_(source, 80), message: clean_(error && error.message ? error.message : String(error), 400), context: clean_(context || "", 300) }]);
  } catch (ignored) {}
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

function isBotRow_(row) {
  return row.entry_source_category === "link_preview_bot" || row.entry_source_category === "known_bot" || asBool_(row.inferred_is_bot) || !!row.bot_reason;
}

function isDebugLikeEvent_(row) {
  var eventType = String(row.event_type || "").toLowerCase();
  return eventType.indexOf("debug") >= 0 || eventType.indexOf("test") >= 0 || eventType.indexOf("health") >= 0 || eventType.indexOf("manual") >= 0 || eventType.indexOf("list") >= 0 || eventType.indexOf("directory") >= 0 || asBool_(row.debug_mode) || asBool_(row.no_redirect_mode);
}

function isDiagnosticEvent_(row) {
  var eventType = String(row.event_type || "").toLowerCase();
  return !asBool_(row.count_as_visit) || eventType.indexOf("diagnostic") >= 0 || isDebugLikeEvent_(row);
}

function isRealVisit_(row) {
  var eventType = String(row.event_type || "").toLowerCase();
  if (!asBool_(row.count_as_visit)) return false;
  if (asBool_(row.duplicate_event)) return false;
  if (isBotRow_(row)) return false;
  if (isDebugLikeEvent_(row)) return false;
  return eventType === "router_redirect" || eventType === "router_noscript";
}

function countExclusionReasonFromRow_(row) {
  var eventType = String(row.event_type || "").toLowerCase();
  if (isRealVisit_(row)) return "";
  if (asBool_(row.duplicate_event)) return "duplicate_event";
  if (isBotRow_(row)) return row.entry_source_category === "link_preview_bot" || asBool_(row.inferred_is_link_preview) ? "link_preview_bot" : "known_bot";
  if (asBool_(row.debug_mode) || eventType.indexOf("debug") >= 0) return "debug_mode";
  if (asBool_(row.no_redirect_mode) || eventType.indexOf("manual") >= 0) return "no_redirect_mode";
  if (eventType.indexOf("health") >= 0) return "health_mode";
  if (eventType.indexOf("diagnostic") >= 0) return "diagnostic_event";
  if (eventType.indexOf("test") >= 0) return "test_event";
  if (eventType !== "router_redirect" && eventType !== "router_noscript") return eventType === "root_index_view" ? "root_index_event_not_visit" : (eventType === "root_dashboard_click" ? "root_dashboard_click_not_visit" : "non_visit_event");
  return "count_as_visit_false";
}

function payloadSizeBucket_(value) {
  var n = toNumber_(value);
  if (!n) return "unknown";
  if (n < 1500) return "lt_1_5kb";
  if (n < 2000) return "lt_2kb";
  if (n < 4000) return "2_4kb";
  if (n < 6000) return "4_6kb";
  if (n < 7500) return "6_7_5kb";
  return "over_7_5kb";
}

function msBucket_(value) {
  var n = toNumber_(value);
  if (!n) return "unknown";
  if (n < 500) return "lt_500ms";
  if (n < 1500) return "500_1500ms";
  if (n < 3000) return "1500_3000ms";
  return "over_3000ms";
}

function lowCapabilityDevice_(row) {
  var memory = toNumber_(row.device_memory_gb);
  var cores = toNumber_(row.hardware_concurrency);
  return !!((memory && memory <= 2) || (cores && cores <= 2) || row.connection_effective_type === "slow-2g" || row.connection_effective_type === "2g" || isSmartTvLike_(row));
}

function newestIso_(a, b) {
  if (!a) return b || "";
  if (!b) return a || "";
  return new Date(String(b)).getTime() > new Date(String(a)).getTime() ? b : a;
}

function newestNonEmpty_(values) {
  var result = "";
  (values || []).forEach(function (value) { if (value) result = value; });
  return result;
}

function isWeakConfidence_(band) {
  band = String(band || "").toLowerCase();
  return band.indexOf("weak") >= 0 || band.indexOf("unknown") >= 0 || band.indexOf("insufficient") >= 0;
}

function dashboardConfidenceBand_(row) {
  var events = Math.max(toNumber_(row.total_events), 1);
  var weakShare = toNumber_(row.weak_unknown_signal_count) / events;
  if (weakShare > 0.35) return "warning";
  if (weakShare > 0.15) return "watch";
  return "good";
}

function mixSummary_(agg, dashboardKey, field) {
  var parts = [];
  Object.keys(agg).forEach(function (key) {
    var row = agg[key];
    if (row.dashboard_key === dashboardKey && toNumber_(row.visits) > 0) parts.push({ label: row[field] || "unknown", visits: toNumber_(row.visits) });
  });
  parts.sort(function (a, b) { return b.visits - a.visits; });
  return parts.slice(0, 3).map(function (item) { return item.label + ":" + item.visits; }).join(", ");
}

function warningSeverity_(code, row) {
  code = String(code || "").toLowerCase();
  if (code === "powerbi_viewer_unsupported_browser" || code === "powerbi_viewer_compatibility_risk") return "warning";
  if (code === "powerbi_viewer_not_officially_supported") return "info";
  if (code === "powerbi_viewer_support_unknown") return "info";
  if (code === "forced_dark_detected") return "info";
  if (code === "samsung_forced_dark_possible") return "info";
  if (/error|schema|invalid|unexpected|mismatch|missing|oversized|fail/.test(code)) return "warning";
  if (/possible|dark|diagnostic|unknown/.test(code)) return "info";
  return row && row.error_message ? "warning" : "info";
}

function warningText_(code, row) {
  code = String(code || "").toLowerCase();
  if (code === "powerbi_viewer_unsupported_browser" || code === "powerbi_viewer_compatibility_risk") return "Óstuddur eða mjög gamall Power BI/Fabric viewer-vafri greindist eftir redirect. Router getur virkað, en app.powerbi.com getur festst á hleðslutákni.";
  if (code === "powerbi_viewer_not_officially_supported") return "Vafra-/tækjasamhengi er ekki í opinberu Power BI/Fabric vafralistanum. Þetta er tæknimerki, ekki staðfest bilun.";
  if (code === "forced_dark_detected") return "Forced/auto dark rendering greindist. Þetta er birtingarmerki, ekki staðfest kerfisvilla.";
  if (row && row.warning_detail) return row.warning_detail;
  return "Merki barst frá router: " + code;
}

function warningRecommendation_(code) {
  code = String(code || "").toLowerCase();
  if (code === "powerbi_viewer_unsupported_browser" || code === "powerbi_viewer_compatibility_risk") return "Nota studdan nýlegan vafra. Fyrir skjái/sjónvörp skal nota mini-PC eða signage box með Edge/Chrome frekar en innbyggðan TV browser.";
  if (code === "powerbi_viewer_not_officially_supported") return "Sýna sem tæknimerki. Prófa í studdum vafra áður en þetta er hækkað í rekstrarvillu.";
  if (code === "powerbi_viewer_support_unknown") return "Halda sem diagnostic merki og staðfesta í studdum Microsoft-vafra ef notandi upplifir hleðsluvanda.";
  if (code === "schema_mismatch") return "Keyra validateWorkbookSetup og staðfesta að router-config schema sé samhæft Apps Script.";
  if (code === "oversized_payload" || code === "imageget_payload_near_limit") return "Færa stærri JSON/evidence í diagnostic enrichment og halda imageGet compact.";
  if (code === "samsung_forced_dark_possible") return "Sýna sem óvissumerki og staðfesta sjónrænt í Samsung Internet áður en viðvörun er hækkuð.";
  if (code === "forced_dark_detected") return "Sýna sem tæknilegt birtingarmerki. Ef sama row er Smart TV / eldri browser, skoða frekar Power BI viewer compatibility risk.";
  if (code === "phone_routed_to_desktop") return "Athuga force/view query og route policy; routing má ekki byggja á veikri device-model ágiskun.";
  return "Skoða aggregate og raw internal rows fyrir samhengi; ekki birta raw user-agent í status dashboard.";
}

function mergeDictionaries_() {
  return FIELD_DICTIONARY || {};
}

function writeSchemaMigrationLog_(action, status, message) {
  var sheet = ensureSheet_(SHEET_SCHEMA_MIGRATION_LOG, SCHEMA_MIGRATION_LOG_HEADERS);
  appendRows_(sheet, SCHEMA_MIGRATION_LOG_HEADERS, [{ migration_time: nowIso_(), script_version: SCRIPT_VERSION, schema_version: EVENT_SCHEMA_VERSION, action: action, status: status, message: message }]);
}

function deriveSourceCategory_(row) {
  if (/root_index|gateway|landspitali_gateway/i.test(row.utm_source || "") || /root_index/i.test(row.entry_source_category || "") || /root_index/i.test(row.page_path || "") || /root_index/i.test(row.root_dashboard_target_path || "")) return "root_index";
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

function snakeToCamel_(value) {
  return String(value || "").replace(/_([a-z])/g, function (_, letter) { return letter.toUpperCase(); });
}

function clean_(value, max) {
  if (value === undefined || value === null) return "";
  value = String(value).replace(/[\0-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim();
  if (max && value.length > max) value = value.slice(0, max);
  return value;
}

function asBool_(value) {
  if (value === true) return true;
  if (value === false) return false;
  value = String(value || "").toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function numberOrBlank_(value) {
  if (value === undefined || value === null || value === "") return "";
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