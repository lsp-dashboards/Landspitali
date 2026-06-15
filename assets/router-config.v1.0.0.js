// Generated from router-config.json. Do not hand-edit.
// Config version: 2026-06-15-prod-v1.0.0
window.LSP_ROUTER_CONFIG = {
  "schemaVersion": "1",
  "configVersion": "2026-06-15-prod-v1.0.0",
  "routerName": "Landspítali Power BI Router",
  "routerMode": "central-config-static-github-pages-root-gateway",
  "environment": "prod",
  "owner": "Landspítali",
  "basePath": "/Landspitali/",
  "supportLabel": "Landspítali",
  "release": {
    "packageVersion": "1.0.0",
    "releasedAt": "2026-06-15",
    "coreVersion": "v1.0.0",
    "status": "first-production-version",
    "coreAssetFile": "router-core.prod.js",
    "configAssetFile": "router-config.prod.js",
    "versionedCoreAssetFile": "router-core.v1.0.0.js",
    "versionedConfigAssetFile": "router-config.v1.0.0.js",
    "publicVersionLabel": "UI: Vaktborð · Talningarhlið · Leiðingarskipting · Aðeins samantektargögn · Vöktunarkjarni: Rekstrarpúls · Config v1 · Atburðasafnari v1 · Gagnasnið 1",
    "statusUiPublicName": "Mælaborðsmælingar",
    "uiPublicName": "UI: Vaktborð",
    "countingGatePublicName": "Talningarhlið",
    "routingSplitPublicName": "Leiðingarskipting",
    "aggregateOnlyPublicName": "Aðeins samantektargögn",
    "corePublicName": "Vöktunarkjarni: Rekstrarpúls",
    "configPublicName": "Config v1",
    "configVersionLabel": "config-v1.0.0",
    "collectorPublicName": "Atburðasafnari v1",
    "collectorVersionLabel": "atburdasafnari-v1.0.0",
    "schemaPublicName": "Gagnasnið 1",
    "notes": "First production version. Includes the iOS Safari navigation-safe tracking transport order: sendBeacon, fetchKeepalive, imageGet."
  },
  "publicEntry": {
    "name": "Opinber mælaborð Landspítala",
    "site": "island.is",
    "pageUrl": "https://island.is/s/landspitali/maelabord",
    "pagePath": "/s/landspitali/maelabord",
    "defaultButtonText": "Opna mælaborð",
    "logoUrl": "https://images.ctfassets.net/8k0h54kbe6bj/6PHUWW83ZRNXU0ydxQsipf/6f460fab1a36daf4c6faf4e604b4741a/Logo.png",
    "lastVerifiedDate": "2026-06-07",
    "allowedImageHosts": [
      "images.ctfassets.net"
    ],
    "rootGatewayPath": "/Landspitali/",
    "rootGatewayTitle": "Opinber mælaborð Landspítala",
    "rootGatewaySubtitle": "Veldu mælaborð. Síðan opnar sjálfkrafa rétta útgáfu eftir tæki og skjábreidd.",
    "privacyText": "Engar persónuupplýsingar eru birtar. Leiðing og notkun eru mæld með aggregate tæknimerkjum til að bæta birtingu og notendaupplifun."
  },
  "tracking": {
    "enabled": true,
    "endpoint": "https://script.google.com/macros/s/AKfycbxRoNEQwlxQUpxEMGzYizAB0_lP1MdqksGLu4fD7c94rzqUul3MW2_E9VCqeRzLK3wD/exec",
    "schemaVersion": "1",
    "diagnosticsEnabled": false,
    "diagnosticEnrichmentEnabled": true,
    "maxImageGetUrlLength": 4500,
    "diagnosticEnrichmentMaxBytes": 18000,
    "trackDebugViews": true,
    "trackFallbackClicks": true,
    "trackErrors": true,
    "trackDirectoryViews": false,
    "trackDiagnosticEvents": true,
    "countDebugAsVisit": false,
    "countBotsAsVisit": false,
    "sampleRate": 1,
    "redirectTimeoutMs": 150,
    "transportOrder": [
      "sendBeacon",
      "fetchKeepalive",
      "imageGet"
    ],
    "allowedQueryParams": [
      "dashboard",
      "id",
      "force",
      "view",
      "debug",
      "health",
      "list",
      "dashboards",
      "noredirect",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_id",
      "from",
      "source",
      "cachebust",
      "diagnostics"
    ],
    "utmDefaults": {
      "utm_source": "island.is",
      "utm_medium": "public_dashboard_card",
      "utm_campaign": "landspitali_maelabord"
    },
    "trackRootIndexViews": true,
    "trackRootDashboardClicks": true,
    "countRootIndexAsVisit": false,
    "iosSafariHotfix": "included-in-first-production"
  },
  "routing": {
    "mobileBreakpoint": 767,
    "tabletBreakpoint": 1024,
    "forceParamNames": [
      "force",
      "view"
    ],
    "dashboardParamNames": [
      "dashboard",
      "id"
    ],
    "debugParamNames": [
      "debug"
    ],
    "listParamNames": [
      "list",
      "dashboards"
    ],
    "healthParamNames": [
      "health",
      "status"
    ],
    "noRedirectParamNames": [
      "noredirect",
      "manual"
    ],
    "allowDashboardQueryOverride": false,
    "allowDashboardQueryOverrideOnRoot": true,
    "botStrategy": "desktop-no-visit",
    "previewBotLayout": "desktop",
    "tabletStrategy": "auto-by-orientation-and-width",
    "tabletPortraitLayout": "mobile",
    "tabletLandscapeLayout": "desktop",
    "narrowDesktopStrategy": "mobile",
    "fallbackLayout": "mobile",
    "redirectDelayMs": 0,
    "manualLinksInDebug": true,
    "maintenanceMode": false,
    "maintenanceMessage": "Mælaborðið er tímabundið óaðgengilegt.",
    "emergencyFallbackDelayMs": 2200,
    "phoneMaxWidth": 767,
    "compactPhoneMaxWidth": 480,
    "tabletPortraitMinWidth": 768,
    "tabletPortraitMaxWidth": 899,
    "narrowTabletMaxWidth": 1023,
    "tabletLandscapeDesktopMinWidth": 1024,
    "smallDesktopMinWidth": 1024,
    "smallDesktopMaxWidth": 1279,
    "desktopMinWidth": 1280,
    "validationDesktopWidth": 1410,
    "validationMobileWidth": 360,
    "breakpointBuckets": [
      {
        "key": "compact_phone_0_480",
        "min": 0,
        "max": 480,
        "expectedLayout": "mobile"
      },
      {
        "key": "wide_phone_481_767",
        "min": 481,
        "max": 767,
        "expectedLayout": "mobile"
      },
      {
        "key": "tablet_portrait_768_899",
        "min": 768,
        "max": 899,
        "expectedLayout": "mobile"
      },
      {
        "key": "policy_zone_900_1023",
        "min": 900,
        "max": 1023,
        "expectedLayout": "mobile"
      },
      {
        "key": "small_desktop_1024_1279",
        "min": 1024,
        "max": 1279,
        "expectedLayout": "desktop"
      },
      {
        "key": "desktop_1280_plus",
        "min": 1280,
        "max": 99999,
        "expectedLayout": "desktop"
      }
    ]
  },
  "ui": {
    "eyebrow": "Landspítali",
    "buttonText": "Opna mælaborð",
    "defaultTitle": "Opna mælaborð",
    "defaultText": "Augnablik, þú ert send/ur í rétta útgáfu mælaborðsins eftir tæki og skjábreidd.",
    "debugTitlePrefix": "Debug",
    "noDashboardTitle": "Veldu mælaborð",
    "noDashboardText": "Engin dashboard auðkenning fannst í slóðinni. Veldu mælaborð eða notaðu ?dashboard=...",
    "maintenanceTitle": "Mælaborð tímabundið óaðgengilegt",
    "fallbackNote": "Ef ekkert gerist sjálfkrafa skaltu smella á takkann."
  },
  "sourceRules": {
    "islandDomains": [
      "island.is",
      "www.island.is"
    ],
    "internalDomains": [
      "landspitali.is",
      "www.landspitali.is",
      "spitali.is"
    ],
    "knownPreviewBotPatterns": [
      "facebookexternalhit",
      "Facebot",
      "LinkedInBot",
      "Twitterbot",
      "XBot",
      "Slackbot-LinkExpanding",
      "Discordbot",
      "SkypeUriPreview",
      "TeamsExternalLinkPreview",
      "Microsoft Office",
      "Outlook-iOS",
      "WhatsApp",
      "TelegramBot",
      "Googlebot",
      "bingbot",
      "DuckDuckBot",
      "Baiduspider",
      "YandexBot"
    ],
    "knownBotPatterns": [
      "bot",
      "spider",
      "crawler",
      "preview",
      "linkexpand",
      "embedly",
      "quora link preview",
      "pinterest",
      "vkShare"
    ]
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
      "aliases": [
        "bradamottaka",
        "bradamottaka-fossvogi",
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
        "stableUtmContent": "bradamottaka_fossvogi",
        "lastVerifiedDate": "2026-06-07",
        "actionText": "Opna mælaborð",
        "routeLabel": "Sjálfvirk mobile/desktop leiðing",
        "chips": [
          "Mobile og desktop útgáfur",
          "Sjálfvirk leiðing"
        ]
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
        "lastVerifiedDate": "2026-06-07",
        "actionText": "Opna mælaborð",
        "routeLabel": "Sjálfvirk mobile/desktop leiðing",
        "chips": [
          "Mobile og desktop útgáfur",
          "Sjálfvirk leiðing"
        ]
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
    "cardsChipLabels": [
      "Mobile og desktop útgáfur",
      "Sjálfvirk leiðing"
    ],
    "configFailureTitle": "Ekki tókst að hlaða miðlægri stillingu",
    "configFailureText": "Fallback kortin nota sömu opinberu slóðir og dashboard möppur."
  },
  "statusDashboard": {
    "name": "Mælaborðsmælingar",
    "publicComponentName": "Mælaborðsmælingar",
    "path": "status-dashboard/",
    "version": "v1.0.0",
    "logoUrl": "https://images.ctfassets.net/8k0h54kbe6bj/6PHUWW83ZRNXU0ydxQsipf/6f460fab1a36daf4c6faf4e604b4741a/Logo.png",
    "endpoint": "https://script.google.com/macros/s/AKfycbxRoNEQwlxQUpxEMGzYizAB0_lP1MdqksGLu4fD7c94rzqUul3MW2_E9VCqeRzLK3wD/exec",
    "payloadApi": "api=dashboard",
    "jsonpCompatible": true,
    "aggregateOnly": true
  },
  "deviceDetection": {
    "version": "2026-06-15-device-settings-1",
    "routeByDeviceInference": false,
    "routeInputs": [
      "forced_layout",
      "bot_link_preview",
      "visual_or_layout_viewport_width",
      "visual_or_layout_viewport_height",
      "orientation",
      "dashboard_route_policy",
      "safe_fallback_validation"
    ],
    "diagnosticOnlySignals": [
      "ua_ch_high_entropy",
      "device_model_guess",
      "smart_tv_console_settop_guess",
      "gamepad_api_available",
      "device_posture_api_available",
      "prefers_reduced_transparency",
      "monochrome",
      "update_frequency",
      "overflow_block",
      "overflow_inline",
      "scripting",
      "display_mode"
    ],
    "privacyGuardrails": [
      "no_cookies",
      "no_local_storage_tracking_id",
      "no_canvas_webgl_audio_fingerprinting",
      "no_geolocation",
      "aggregate_public_output_only"
    ]
  }
};
