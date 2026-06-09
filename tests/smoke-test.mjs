#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, 'config', 'dashboard-registry.json'), 'utf8'));
let failures = 0;

function assert(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${message}`);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function extractGeneratedConfig(rel) {
  const text = read(rel);
  const match = text.match(/window\.LSP_ROUTER_CONFIG\s*=\s*([\s\S]*);\s*$/);
  assert(!!match, `${rel} exposes window.LSP_ROUTER_CONFIG`);
  return match ? JSON.parse(match[1]) : null;
}

const generated = extractGeneratedConfig('assets/router-config.prod.js');
assert(generated && generated.configVersion === config.configVersion, 'generated config version matches canonical registry');
assert(JSON.stringify(generated) === JSON.stringify(config), 'generated config is identical to canonical registry');

for (const dashboard of Object.values(config.dashboards)) {
  const rel = `${dashboard.path}/index.html`;
  const html = read(rel);
  assert(html.includes(dashboard.mobileUrl), `${rel} contains safe mobile fallback URL`);
  assert(html.includes('<noscript>'), `${rel} contains noscript fallback`);
  assert(html.includes('window.LSP_ROUTER_BOOTSTRAP'), `${rel} contains embedded bootstrap config`);
  assert(html.includes('router-config.prod.js'), `${rel} loads production config`);
  assert(html.includes(config.release.coreAssetFile), `${rel} pins production router core`);
  assert(html.includes('LSP_ROUTER_STARTED'), `${rel} contains emergency core-load fallback guard`);
  assert(!html.includes('localStorage'), `${rel} does not use localStorage`);
  assert(!html.includes('document.cookie'), `${rel} does not use cookies`);
}

const core = read('assets/router-core.v20260607-1.js');
assert(core.includes('transportOrder'), 'router core references tracking.transportOrder');
assert(core.includes('sampleRate'), 'router core references tracking.sampleRate');
assert(core.includes('routeReason'), 'router core builds structured route reasons');
assert(!/localStorage|document\.cookie/.test(core), 'router core does not use cookies or localStorage');

const tracker = read('tracker/powerbi_router_tracker_apps_script_v1.js');
assert(tracker.includes('Events_Raw'), 'tracker uses Events_Raw sheet');
assert(tracker.includes('aggregateRecent'), 'tracker includes scheduled aggregation function');
assert(tracker.includes('raw_query_keys'), 'tracker stores query keys without arbitrary query values');
assert(!tracker.includes('raw_json'), 'tracker does not store raw_json by default');

const status = read('status-dashboard/index.html');
assert(status.includes('Mælaborðsmælingar'), 'status dashboard exists');
assert(status.includes('status-dashboard.js'), 'status dashboard loads JS');

if (failures) {
  console.error(`${failures} smoke test failure(s).`);
  process.exit(1);
}
console.log('Smoke tests OK.');
