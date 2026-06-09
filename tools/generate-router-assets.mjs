#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const registryPath = path.join(root, 'config', 'dashboard-registry.json');
const config = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const coreFile = config.release.coreAssetFile || 'router-core.v20260607-1.js';
const versionedConfigFile = config.release.configAssetFile || 'router-config.v20260607-1.js';

function safeJsonForScript(value) {
  return JSON.stringify(value, null, 2).replace(/<\//g, '<\\/').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function routerConfigJs() {
  return `// Generated from config/dashboard-registry.json. Do not hand-edit.\n// Config version: ${config.configVersion}\nwindow.LSP_ROUTER_CONFIG = ${safeJsonForScript(config)};\n`;
}

function minimalDashboard(dashboard) {
  return JSON.parse(JSON.stringify(dashboard));
}


function noscriptTrackerUrl(dashboard) {
  if (!config.tracking || !config.tracking.enabled || !config.tracking.endpoint) return '';
  const params = new URLSearchParams({
    event_type: 'router_noscript',
    count_as_visit: 'true',
    dashboard_key: dashboard.dashboardKey,
    dashboard_id: dashboard.dashboardId,
    dashboard_name: dashboard.displayName,
    public_card_title: dashboard.publicCard?.title || '',
    public_entry_page: dashboard.publicCard?.pageUrl || config.publicEntry?.pageUrl || '',
    selected_layout: 'mobile',
    auto_selected_layout: 'mobile',
    forced_layout: 'auto',
    forced_layout_applied: 'false',
    route_reason: 'noscript_mobile_fallback',
    route_reason_detail: 'noscript meta refresh uses static mobile fallback',
    device_class: 'noscript',
    entry_source_category: 'noscript_unknown',
    utm_content: dashboard.utmContent || dashboard.publicCard?.stableUtmContent || '',
    page_path: `${config.basePath || '/'}${dashboard.path}/`,
    config_version: config.configVersion,
    router_core_version: config.release.coreVersion,
    config_source: 'noscript_static',
    safe_fallback_used: 'true',
    tracking_method: 'imageGet'
  });
  return `${config.tracking.endpoint}${config.tracking.endpoint.includes('?') ? '&' : '?'}${params.toString()}`;
}

function wrapperHtml(dashboard) {
  const mobileUrl = dashboard.mobileUrl;
  const noscriptUrl = noscriptTrackerUrl(dashboard);
  const bootstrap = {
    dashboardKey: dashboard.dashboardKey,
    lockDashboard: true,
    trackingEndpoint: config.tracking.endpoint,
    publicEntry: config.publicEntry,
    dashboard: minimalDashboard(dashboard)
  };
  const emergencyDelay = Number(config.routing.emergencyFallbackDelayMs || 2500);
  return `<!doctype html>
<html lang="is">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(dashboard.pageTitle)} | ${escapeHtml(dashboard.displayName)}</title>

  <style>
    html,
    body {
      margin: 0;
      min-height: 100%;
      font-family: Arial, Helvetica, sans-serif;
      color: #102033;
      background: #f4f7fa;
    }

    * {
      box-sizing: border-box;
    }

    .page {
      min-height: 100vh;
      display: table;
      width: 100%;
      padding: 24px;
    }

    .page-inner {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
    }

    .card {
      max-width: 640px;
      margin: 0 auto;
      padding: 30px 24px;
      background: #ffffff;
      border: 1px solid #d9e1e8;
      border-radius: 18px;
      box-shadow: 0 16px 45px rgba(16, 32, 51, 0.10);
    }

    .eyebrow {
      margin: 0 0 10px 0;
      color: #4F6F8F;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.15;
    }

    .text {
      margin: 14px 0 0 0;
      color: #5f6f82;
      font-size: 16px;
      line-height: 1.55;
    }

    .button,
    .secondary-button {
      display: inline-block;
      margin-top: 22px;
      padding: 15px 22px;
      border-radius: 14px;
      color: #ffffff;
      background: #4F6F8F;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 10px 24px rgba(79, 111, 143, 0.25);
    }

    .button:hover,
    .button:focus,
    .secondary-button:hover,
    .secondary-button:focus {
      background: #435F7A;
    }

    .secondary-button {
      margin: 10px 6px 0 6px;
      padding: 11px 14px;
      color: #22384f;
      background: #e9eff5;
      box-shadow: none;
    }

    .secondary-button:hover,
    .secondary-button:focus {
      background: #dce7f0;
    }

    .small,
    #route-note {
      margin-top: 16px;
      color: #7a8795;
      font-size: 13px;
      line-height: 1.45;
    }

    .debug-list {
      margin: 20px auto 0 auto;
      max-width: 520px;
      display: grid;
      grid-template-columns: minmax(120px, 190px) 1fr;
      gap: 8px 12px;
      text-align: left;
      color: #34495f;
      font-size: 14px;
    }

    .debug-list dt {
      font-weight: 700;
      color: #102033;
    }

    .debug-list dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    .manual-links {
      margin-top: 12px;
    }

    .dashboard-list {
      margin-top: 20px;
      display: grid;
      gap: 10px;
      text-align: left;
    }

    .dashboard-row {
      display: grid;
      grid-template-columns: 54px 1fr;
      gap: 12px;
      align-items: center;
      padding: 12px;
      border: 1px solid #d9e1e8;
      border-radius: 14px;
      color: #102033;
      text-decoration: none;
      background: #fbfdff;
    }

    .dashboard-row img {
      width: 54px;
      height: 54px;
      object-fit: cover;
      border-radius: 12px;
    }

    .dashboard-row small {
      display: block;
      margin-top: 4px;
      color: #6b7c8f;
    }
  </style>
</head>

<body>
  <main class="page">
    <div class="page-inner">
      <section class="card" aria-labelledby="page-title">
        <p class="eyebrow">${escapeHtml(config.ui.eyebrow)}</p>
        <h1 id="page-title">${escapeHtml(dashboard.pageTitle)}</h1>
        <p class="text">
          ${escapeHtml(config.ui.defaultText)}
        </p>

        <!-- Mobile URL is the safe fallback. If JavaScript fails, users still get the mobile version. -->
        <a id="fallback-link" class="button" href="${escapeHtml(mobileUrl)}">
          ${escapeHtml(config.ui.buttonText)}
        </a>

        <p id="route-note" class="small">
          ${escapeHtml(config.ui.fallbackNote)}
        </p>

        <div id="router-extra" hidden></div>
      </section>
    </div>
  </main>

  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(mobileUrl)}">
    ${noscriptUrl ? `<img src="${escapeHtml(noscriptUrl)}" alt="" width="1" height="1" style="position:absolute;left:-9999px;width:1px;height:1px;">` : ``}
  </noscript>

  <script>
    window.LSP_ROUTER_BOOTSTRAP = ${safeJsonForScript(bootstrap)};
  </script>
  <script defer src="../assets/router-config.prod.js"></script>
  <script defer src="../assets/${coreFile}"></script>
  <script>
    (function () {
      // ${dashboard.commentName}: generated production wrapper. The locked master template is not modified.
      var fallbackUrl = ${JSON.stringify(mobileUrl)};
      function hasSafeMode() {
        return /[?&](debug|health|status|list|dashboards|noredirect|manual)(=1|=true|&|$)/i.test(window.location.search || "");
      }
      window.setTimeout(function () {
        if (!window.LSP_ROUTER_STARTED && !hasSafeMode()) {
          window.location.replace(fallbackUrl);
        }
      }, ${emergencyDelay});
    }());
  </script>
</body>
</html>
`;
}

function rootIndexHtml() {
  const bootstrap = {
    dashboardKey: '',
    lockDashboard: false,
    trackingEndpoint: config.tracking.endpoint,
    publicEntry: config.publicEntry
  };
  return `<!doctype html>
<html lang="is">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <title>Landspítali mælaborð | Router</title>
  <style>
    html, body { margin: 0; min-height: 100%; font-family: Arial, Helvetica, sans-serif; color: #102033; background: #f4f7fa; }
    * { box-sizing: border-box; }
    .page { min-height: 100vh; display: table; width: 100%; padding: 24px; }
    .page-inner { display: table-cell; vertical-align: middle; text-align: center; }
    .card { max-width: 720px; margin: 0 auto; padding: 30px 24px; background: #ffffff; border: 1px solid #d9e1e8; border-radius: 18px; box-shadow: 0 16px 45px rgba(16, 32, 51, 0.10); }
    .eyebrow { margin: 0 0 10px 0; color: #4F6F8F; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }
    h1 { margin: 0; font-size: 28px; line-height: 1.15; }
    .text, #route-note { margin: 14px 0 0 0; color: #5f6f82; font-size: 16px; line-height: 1.55; }
    .button { display: none; }
    .dashboard-list { margin-top: 20px; display: grid; gap: 10px; text-align: left; }
    .dashboard-row { display: grid; grid-template-columns: 54px 1fr; gap: 12px; align-items: center; padding: 12px; border: 1px solid #d9e1e8; border-radius: 14px; color: #102033; text-decoration: none; background: #fbfdff; }
    .dashboard-row img { width: 54px; height: 54px; object-fit: cover; border-radius: 12px; }
    .dashboard-row small { display: block; margin-top: 4px; color: #6b7c8f; }
    .debug-list { margin: 20px auto 0 auto; max-width: 520px; display: grid; grid-template-columns: minmax(120px, 190px) 1fr; gap: 8px 12px; text-align: left; color: #34495f; font-size: 14px; }
    .debug-list dt { font-weight: 700; color: #102033; }
    .debug-list dd { margin: 0; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <main class="page">
    <div class="page-inner">
      <section class="card" aria-labelledby="page-title">
        <p class="eyebrow">Landspítali</p>
        <h1 id="page-title">Veldu mælaborð</h1>
        <p id="route-note" class="text">Þessi rótarsíða er innri router-skrá. Opinber inngangur er island.is.</p>
        <a id="fallback-link" class="button" href="#">Opna mælaborð</a>
        <div id="router-extra"></div>
      </section>
    </div>
  </main>
  <script>window.LSP_ROUTER_BOOTSTRAP = ${safeJsonForScript(bootstrap)};</script>
  <script defer src="assets/router-config.prod.js"></script>
  <script defer src="assets/${coreFile}"></script>
</body>
</html>
`;
}

write(path.join(root, 'assets', versionedConfigFile), routerConfigJs());
write(path.join(root, 'assets', 'router-config.prod.js'), routerConfigJs());
write(path.join(root, 'assets', 'router-config.next.js'), routerConfigJs());
write(path.join(root, 'assets', 'router-core.prod.js'), `// Stable alias for the pinned production router core.\n// Prefer versioned filenames in dashboard wrappers.\n` + fs.readFileSync(path.join(root, 'assets', 'router-core.v20260607-1.js'), 'utf8'));
write(path.join(root, 'assets', 'router-config.json'), JSON.stringify(config, null, 2) + '\n');

for (const dashboard of Object.values(config.dashboards)) {
  write(path.join(root, dashboard.path, 'index.html'), wrapperHtml(dashboard));
}
write(path.join(root, 'index.html'), rootIndexHtml());
console.log(`Generated router assets for ${Object.keys(config.dashboards).length} dashboards.`);
