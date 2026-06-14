// Generated from config/dashboard-registry.json. Do not hand-edit.
// Config version: 2026-06-13-prod-v1.4.0-relaunch.1
window.LSP_ROUTER_CONFIG = {
  "schemaVersion": "9",
  "configVersion": "2026-06-13-prod-v1.4.0-relaunch.1",
  "routerName": "Landspítali Power BI Router og opinber mælaborðsgátt",
  "routerMode": "central-config-static-github-pages",
  "environment": "prod",
  "owner": "Landspítali",
  "basePath": "/Landspitali/",
  "supportLabel": "Landspítali",
  "release": {
    "packageVersion": "1.4.0-relaunch.1",
    "releasedAt": "2026-06-13",
    "coreVersion": "2026-06-13-core-1.4.0-relaunch.1",
    "status": "ready-for-production-candidate-after-validation",
    "coreAssetFile": "router-core.v20260607-1.js",
    "configAssetFile": "router-config.v20260607-1.js",
    "notes": "Pre-official relaunch candidate. No launch-phase telemetry fields are used."
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
    "rootIndexPath": "/Landspitali/",
    "privacyText": "Engar persónuupplýsingar eru birtar. Leiðing og notkun eru mæld með aggregate tæknimerkjum til að bæta birtingu og notendaupplifun.",
    "cardChipText": "Sjálfvirk leiðing",
    "layoutChipText": "Mobile og desktop útgáfur"
  },
  "tracking": {
    "enabled": true,
    "endpoint": "https://script.google.com/macros/s/AKfycbxRoNEQwlxQUpxEMGzYizAB0_lP1MdqksGLu4fD7c94rzqUul3MW2_E9VCqeRzLK3wD/exec",
    "schemaVersion": "9",
    "diagnosticsEnabled": false,
    "diagnosticEnrichmentEnabled": true,
    "maxImageGetUrlLength": 6200,
    "diagnosticEnrichmentMaxBytes": 16000,
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
      "source",
      "from",
      "ref"
    ],
    "utmDefaults": {
      "utm_source": "island.is",
      "utm_medium": "public_dashboard_card",
      "utm_campaign": "landspitali_maelabord"
    },
    "rootIndexTrackingEnabled": true,
    "trackRootIndexViews": true,
    "trackRootDashboardClicks": true,
    "imageGetNearLimitRatio": 0.82,
    "rootIndexUtmDefaults": {
      "utm_source": "root_index",
      "utm_medium": "public_gateway",
      "utm_campaign": "landspitali_maelabord"
    }
  },
  "routing": {
    "mobileBreakpoint": 768,
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
    "tabletStrategy": "policy-zone-by-viewport-and-orientation",
    "tabletPortraitLayout": "mobile",
    "tabletLandscapeLayout": "desktop",
    "narrowDesktopStrategy": "mobile",
    "fallbackLayout": "mobile",
    "redirectDelayMs": 80,
    "manualLinksInDebug": true,
    "maintenanceMode": false,
    "maintenanceMessage": "Mælaborðið er tímabundið óaðgengilegt.",
    "emergencyFallbackDelayMs": 2000,
    "widePhoneBreakpoint": 480,
    "tabletPortraitMaxWidth": 899,
    "policyZoneStartWidth": 900,
    "tabletLandscapeDesktopMinWidth": 1024,
    "desktopMinWidth": 1280,
    "desktopValidationWidth": 1410,
    "mobileValidationWidth": 360,
    "narrowDesktopMaxWidth": 1023,
    "tabletLandscapeMinHeight": 600
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
      "YandexBot",
      "Slackbot"
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
      "vkShare",
      "crawl",
      "HeadlessChrome"
    ],
    "inAppBrowserPatterns": {
      "teams": [
        "Teams/",
        "TeamsMobile"
      ],
      "outlook": [
        "Outlook-iOS",
        "Outlook-Android",
        "Microsoft Outlook"
      ],
      "facebook": [
        "FBAN",
        "FBAV",
        "FB_IAB"
      ],
      "instagram": [
        "Instagram"
      ],
      "linkedin": [
        "LinkedInApp",
        "LinkedIn"
      ],
      "slack": [
        "Slack"
      ]
    },
    "livingRoomTokens": [
      "SmartTV",
      "SMART-TV",
      "HbbTV",
      "Tizen",
      "Web0S",
      "WebOS",
      "NetCast",
      "Roku",
      "AFT",
      "Android TV",
      "GoogleTV",
      "CrKey",
      "AppleTV",
      "Apple TV",
      "BRAVIA",
      "VIERA",
      "AquosBrowser",
      "Hisense",
      "NetTV",
      "DTV",
      "SHIELD",
      "MiBOX",
      "MIBOX"
    ],
    "consoleTokens": [
      "PlayStation",
      "PS4",
      "PS5",
      "Xbox",
      "Xbox One",
      "Xbox Series",
      "NintendoBrowser",
      "Nintendo Switch",
      "WiiU",
      "Wii"
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
        "description": "Staða, komur, legudeildarflæði og aldursdreifing á bráðamóttöku í Fossvogi.",
        "buttonText": "Opna mælaborð",
        "iconUrl": "https://images.ctfassets.net/8k0h54kbe6bj/68Ef7p57VqG1aYv99GbzB0/3b98fe5c7b3b11c7d01194a7e9caccd6/bradamottaka-linkimage.png?w=774&fm=webp&q=80",
        "pageUrl": "https://island.is/s/landspitali/maelabord",
        "published": true,
        "stableUtmContent": "bradamottaka_fossvogi",
        "lastVerifiedDate": "2026-06-07",
        "chips": [
          "Sjálfvirk leiðing",
          "Mobile og desktop útgáfur"
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
        "tabletLandscape": "desktop_if_width_at_least_1024_and_height_at_least_600",
        "wideTabletPortrait": "mobile",
        "narrowViewport": "mobile",
        "narrowDesktop": "mobile",
        "desktop": "desktop",
        "smartTv": "desktop",
        "console": "desktop",
        "bot": "desktop",
        "fallback": "mobile",
        "tabletLandscapeDesktopMinWidth": 1024,
        "tabletLandscapeMinHeight": 600,
        "desktopMinWidth": 1280,
        "policyZoneStartWidth": 900,
        "narrowDesktopMaxWidth": 1023,
        "mobileValidationWidth": 360,
        "desktopValidationWidth": 1410,
        "expectedBreakpointResults": {
          "360": "mobile",
          "480": "mobile",
          "768": "mobile",
          "1024": "desktop_policy_zone",
          "1280": "desktop",
          "1410": "desktop"
        }
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
      "fallbackMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNGZlODE2N2ItYzkwZS00ZWYzLTg2YzctMjg5NWY5MmU1NTkyIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "noscriptMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNGZlODE2N2ItYzkwZS00ZWYzLTg2YzctMjg5NWY5MmU1NTkyIiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "statusDashboard": {
        "visible": true,
        "displayGroup": "Opinber mælaborð",
        "displayOrder": 10
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
        "description": "Niðurstöður þjónustukannana ríkisstofnana hjá Landspítala eftir árum, mánuðum, aldri og búsetu.",
        "buttonText": "Opna mælaborð",
        "iconUrl": "https://images.ctfassets.net/8k0h54kbe6bj/5eK6Vivq6aUDWj2mnOEsvS/7e5d5e7c03b92370ccee175ad01f8330/survey-linkimage.png?w=774&fm=webp&q=80",
        "pageUrl": "https://island.is/s/landspitali/maelabord",
        "published": true,
        "stableUtmContent": "thjonustukannanir",
        "lastVerifiedDate": "2026-06-07",
        "chips": [
          "Sjálfvirk leiðing",
          "Mobile og desktop útgáfur"
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
        "tabletLandscape": "desktop_if_width_at_least_1024_and_height_at_least_600",
        "wideTabletPortrait": "mobile",
        "narrowViewport": "mobile",
        "narrowDesktop": "mobile",
        "desktop": "desktop",
        "smartTv": "desktop",
        "console": "desktop",
        "bot": "desktop",
        "fallback": "mobile",
        "tabletLandscapeDesktopMinWidth": 1024,
        "tabletLandscapeMinHeight": 600,
        "desktopMinWidth": 1280,
        "policyZoneStartWidth": 900,
        "narrowDesktopMaxWidth": 1023,
        "mobileValidationWidth": 360,
        "desktopValidationWidth": 1410,
        "expectedBreakpointResults": {
          "360": "mobile",
          "480": "mobile",
          "768": "mobile",
          "1024": "desktop_policy_zone",
          "1280": "desktop",
          "1410": "desktop"
        }
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
      "fallbackMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNmMyZGI1ZjktOTIzMS00MjZlLWFmMjEtMzE2ZTRhYjcyYmQ3IiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "noscriptMobileUrl": "https://app.powerbi.com/view?r=eyJrIjoiNmMyZGI1ZjktOTIzMS00MjZlLWFmMjEtMzE2ZTRhYjcyYmQ3IiwidCI6ImUxMDExZTUyLTcyMTAtNDAxNy05NTBmLTQ1ODA3NWY5Zjg0ZSIsImMiOjh9",
      "statusDashboard": {
        "visible": true,
        "displayGroup": "Opinber mælaborð",
        "displayOrder": 20
      }
    }
  },
  "rootIndex": {
    "enabled": true,
    "visible": true,
    "title": "Opinber mælaborð Landspítala",
    "subtitle": "Veldu mælaborð. Síðan opnar sjálfkrafa rétta útgáfu eftir tæki og skjábreidd.",
    "intro": "Mælaborðin eru opinber og sýna samantektargögn. Engar persónuupplýsingar eru birtar í Power BI skýrslunum eða Mælaborðsmælingum.",
    "footer": "Engar persónuupplýsingar eru birtar. Leiðing og notkun eru mæld með aggregate tæknimerkjum til að bæta birtingu og notendaupplifun.",
    "debugEnabled": true,
    "showDisabledInDebug": true,
    "actionText": "Opna mælaborð",
    "fallbackCards": true
  },
  "deviceDetection": {
    "version": "2026-06-13-device-taxonomy-2",
    "routingUse": "analytics-and-debug-only; routing is viewport, orientation and dashboard policy first",
    "confidenceBands": {
      "90-100": "very_high",
      "70-89": "high",
      "50-69": "medium",
      "30-49": "weak",
      "0-29": "unknown"
    },
    "privacyLimits": [
      "no_canvas_fingerprint",
      "no_webgl_fingerprint",
      "no_audio_fingerprint",
      "no_persistent_user_id",
      "no_cookie_id",
      "no_exact_model_without_explicit_token"
    ],
    "diagnosticOnlySignals": [
      "high_entropy_uach",
      "architecture",
      "bitness",
      "fullVersionList",
      "formFactors",
      "evidence_json"
    ]
  }
};
