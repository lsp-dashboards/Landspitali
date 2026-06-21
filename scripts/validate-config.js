"use strict";

const fs = require("fs");
const path = require("path");
const {
  transportOrder,
  resolveRepo,
  readText,
  readJson,
  productVersion,
  packageSemver,
  dashboardsFromConfig,
  isPowerBiPublishToWebUrl,
  assertPublicSafe,
  generatedRouterConfigJs,
  routerConfigAssetNames,
  normalizeLineEndings,
  printResult
} = require("./lib");

const args = new Set(process.argv.slice(2));
const urlsOnly = args.has("--urls-only");
const registryOnly = args.has("--registry-only");
const errors = [];
const raw = readText("assets/router-config.json");
const config = JSON.parse(raw);

function requireValue(value, message) {
  if (value === undefined || value === null || value === "") errors.push(message);
}

function requireEqual(value, expected, message) {
  if (value !== expected) errors.push(`${message}; expected ${expected}, received ${value === undefined || value === null || value === "" ? "<empty>" : value}`);
}

function sameArray(actual, expected) {
  return Array.isArray(actual) &&
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);
}

function validateUrls() {
  dashboardsFromConfig(config).forEach(({ key, dashboard }) => {
    ["desktopUrl", "mobileUrl"].forEach((field) => {
      if (!isPowerBiPublishToWebUrl(dashboard[field])) {
        errors.push(`dashboards.${key}.${field} must be a Power BI publish-to-web URL on app.powerbi.com/view?r=...`);
      }
    });

    if (dashboard.fallbackMobileUrl && dashboard.fallbackMobileUrl !== dashboard.mobileUrl) {
      errors.push(`dashboards.${key}.fallbackMobileUrl must match mobileUrl so mobile remains the safe fallback`);
    }
    if (dashboard.noscriptMobileUrl && dashboard.noscriptMobileUrl !== dashboard.mobileUrl) {
      errors.push(`dashboards.${key}.noscriptMobileUrl must match mobileUrl so noscript remains mobile-safe`);
    }
  });
}

function validateRegistry() {
  const seenIds = new Map();
  const seenPaths = new Map();
  const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  dashboardsFromConfig(config).forEach(({ key, dashboard }) => {
    requireValue(dashboard.displayName, `dashboards.${key}.displayName is required`);
    requireValue(dashboard.dashboardId, `dashboards.${key}.dashboardId is required`);
    requireValue(dashboard.desktopUrl, `dashboards.${key}.desktopUrl is required`);
    requireValue(dashboard.mobileUrl, `dashboards.${key}.mobileUrl is required`);

    if (dashboard.dashboardKey !== key) {
      errors.push(`dashboards.${key}.dashboardKey must match its registry key`);
    }
    if (!idPattern.test(String(dashboard.dashboardId || ""))) {
      errors.push(`dashboards.${key}.dashboardId must be stable, lowercase, URL-safe kebab case`);
    }
    if (!keyPattern.test(String(key || ""))) {
      errors.push(`dashboards.${key} registry key must be lowercase URL-safe kebab case`);
    }
    if (dashboard.path && !keyPattern.test(String(dashboard.path))) {
      errors.push(`dashboards.${key}.path must be lowercase URL-safe kebab case`);
    }
    if (dashboard.fallbackLayout !== "mobile") {
      errors.push(`dashboards.${key}.fallbackLayout must remain "mobile"`);
    }

    if (seenIds.has(dashboard.dashboardId)) {
      errors.push(`dashboardId "${dashboard.dashboardId}" is duplicated by ${seenIds.get(dashboard.dashboardId)} and ${key}`);
    }
    seenIds.set(dashboard.dashboardId, key);

    if (dashboard.path) {
      if (seenPaths.has(dashboard.path)) {
        errors.push(`dashboard path "${dashboard.path}" is duplicated by ${seenPaths.get(dashboard.path)} and ${key}`);
      }
      seenPaths.set(dashboard.path, key);
    }
  });
}

function validateGeneratedAssets() {
  const expected = generatedRouterConfigJs(raw, config);
  routerConfigAssetNames(config).forEach((fileName) => {
    const relativePath = path.join("assets", fileName);
    const fullPath = resolveRepo(relativePath);
    if (!fs.existsSync(fullPath)) {
      errors.push(`${relativePath} is missing; run npm run build`);
      return;
    }
    const actual = fs.readFileSync(fullPath, "utf8");
    if (normalizeLineEndings(actual) !== normalizeLineEndings(expected)) {
      errors.push(`${relativePath} is not in sync with assets/router-config.json; run npm run build`);
    }
  });

  if (config.release && config.release.coreAssetFile && config.release.versionedCoreAssetFile) {
    const core = readText(path.join("assets", config.release.coreAssetFile));
    const versioned = readText(path.join("assets", config.release.versionedCoreAssetFile));
    if (normalizeLineEndings(core) !== normalizeLineEndings(versioned)) {
      errors.push(`assets/${config.release.versionedCoreAssetFile} is not in sync with assets/${config.release.coreAssetFile}`);
    }
  }
}

function validateRouterCoreTransportOrder() {
  const files = [
    config.release && config.release.coreAssetFile,
    config.release && config.release.versionedCoreAssetFile
  ].filter(Boolean);

  Array.from(new Set(files)).forEach((fileName) => {
    const relativePath = path.join("assets", fileName);
    const source = readText(relativePath);
    const start = source.indexOf("function sendTracking");
    const end = source.indexOf("function sendDiagnosticEnrichment", start);
    const body = start >= 0 && end > start ? source.slice(start, end) : "";
    const positions = transportOrder.map((method) => body.indexOf(`method === "${method}"`));
    if (!body || positions.some((position) => position < 0) || !(positions[0] < positions[1] && positions[1] < positions[2])) {
      errors.push(`${relativePath} sendTracking must preserve fallback order ${transportOrder.join(" -> ")}`);
    }
  });
}

function validateProductionVersioning() {
  const pkg = readJson("package.json");
  const release = config.release || {};
  requireEqual(pkg.version, packageSemver, "package.json version must stay npm-semver compatible");
  requireEqual(config.configVersion, productVersion, "configVersion must use the production product version");
  requireEqual(release.packageVersion, productVersion, "release.packageVersion must use the production product version");
  requireEqual(release.coreVersion, productVersion, "release.coreVersion must use the production product version");
  requireEqual(release.status, "production", "release.status must identify production state");
  [
    "statusUiVersionLabel",
    "uiVersionLabel",
    "coreVersionLabel",
    "configVersionLabel",
    "collectorVersionLabel"
  ].forEach((key) => requireEqual(release[key], productVersion, `release.${key} must use the production product version`));
  [
    "publicVersionLabel",
    "configPublicName",
    "collectorPublicName",
    "schemaPublicName"
  ].forEach((key) => {
    if (!String(release[key] || "").includes(productVersion)) {
      errors.push(`release.${key} must include ${productVersion}`);
    }
  });
  if (config.statusDashboard) requireEqual(config.statusDashboard.version, productVersion, "statusDashboard.version must use the production product version");
  if (config.deviceDetection) requireEqual(config.deviceDetection.version, productVersion, "deviceDetection.version must use the production product version");
}

if (!urlsOnly && !registryOnly) {
  requireValue(config.schemaVersion, "schemaVersion is required");
  requireValue(config.configVersion, "configVersion is required");
  requireValue(config.routerName, "routerName is required");
  requireValue(config.release && config.release.configAssetFile, "release.configAssetFile is required");
  requireValue(config.release && config.release.coreAssetFile, "release.coreAssetFile is required");

  if (!sameArray(config.tracking && config.tracking.transportOrder, transportOrder)) {
    errors.push(`tracking.transportOrder must remain exactly ${transportOrder.join(" -> ")}`);
  }
  if (config.routing && config.routing.fallbackLayout !== "mobile") {
    errors.push('routing.fallbackLayout must remain "mobile"');
  }
  if (!config.dashboards || !Object.keys(config.dashboards).length) {
    errors.push("dashboards registry must contain at least one dashboard");
  }

  errors.push(...assertPublicSafe(config, "assets/router-config.json"));
  validateGeneratedAssets();
  validateRouterCoreTransportOrder();
  validateProductionVersioning();
}

if (!registryOnly) validateUrls();
if (!urlsOnly) validateRegistry();

printResult("Config validation", errors);
