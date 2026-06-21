"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const transportOrder = ["sendBeacon", "fetchKeepalive", "imageGet"];
const productVersion = "v1.0.0";
const packageSemver = "1.0.0";

const forbiddenPublicKeyPatterns = [
  /(^|_)(user_agent|raw_user_agent|ip|ip_address|email|user_id|user_identifier)($|_)/i,
  /(^|_)(spreadsheet_id|sheet_id|private_key|client_secret|access_token|refresh_token)($|_)/i,
  /(^|_)(credential|credentials|password|token|secret|deployment_id)($|_)/i,
  /(^|_)(row_level_events|events_raw|raw_event_payloads)($|_)/i
];

function resolveRepo(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(resolveRepo(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function writeText(relativePath, value) {
  const target = resolveRepo(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value, "utf8");
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function isPlainObject(value) {
  return !!value && Object.prototype.toString.call(value) === "[object Object]";
}

function walk(value, visitor, trail = []) {
  visitor(value, trail);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, trail.concat(String(index))));
  } else if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => walk(value[key], visitor, trail.concat(key)));
  }
}

function dashboardsFromConfig(config) {
  return Object.entries(config.dashboards || {}).map(([key, dashboard]) => ({ key, dashboard }));
}

function isPowerBiPublishToWebUrl(value) {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname.toLowerCase() === "app.powerbi.com" &&
      url.pathname.toLowerCase() === "/view" &&
      url.searchParams.has("r");
  } catch (error) {
    return false;
  }
}

function assertPublicSafe(value, artifactName) {
  const errors = [];
  walk(value, (node, trail) => {
    const key = trail[trail.length - 1] || "";
    if (key && forbiddenPublicKeyPatterns.some((pattern) => pattern.test(key))) {
      errors.push(`${artifactName}: forbidden public field "${trail.join(".")}"`);
    }
    if (typeof node === "string") {
      if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(node)) {
        errors.push(`${artifactName}: private key material found at "${trail.join(".")}"`);
      }
      if (/AIza[0-9A-Za-z_-]{20,}/.test(node)) {
        errors.push(`${artifactName}: API key-like value found at "${trail.join(".")}"`);
      }
    }
  });
  return errors;
}

function generatedRouterConfigJs(configRaw, config) {
  return `// Generated from router-config.json. Do not hand-edit.\n` +
    `// Config version: ${config.configVersion}\n` +
    `window.LSP_ROUTER_CONFIG = ${configRaw.trim()};\n`;
}

function routerConfigAssetNames(config) {
  const names = [
    config.release && config.release.configAssetFile,
    config.release && config.release.nextConfigAssetFile,
    config.release && config.release.versionedConfigAssetFile,
    "router-config.next.js"
  ].filter(Boolean);
  return Array.from(new Set(names));
}

function writeRouterConfigAssets() {
  const raw = readText("assets/router-config.json");
  const config = JSON.parse(raw);
  const js = generatedRouterConfigJs(raw, config);
  routerConfigAssetNames(config).forEach((fileName) => {
    writeText(path.join("assets", fileName), js);
  });

  if (config.release && config.release.coreAssetFile && config.release.versionedCoreAssetFile) {
    const source = resolveRepo(path.join("assets", config.release.coreAssetFile));
    const target = resolveRepo(path.join("assets", config.release.versionedCoreAssetFile));
    fs.copyFileSync(source, target);
  }
}

function emptyDir(relativePath) {
  const target = resolveRepo(relativePath);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
}

function copyFile(relativeSource, relativeTarget) {
  const source = resolveRepo(relativeSource);
  const target = resolveRepo(relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDir(relativeSource, relativeTarget) {
  const source = resolveRepo(relativeSource);
  const target = resolveRepo(relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function normalizeLineEndings(value) {
  return String(value).replace(/\r\n/g, "\n");
}

function printResult(title, errors) {
  if (errors.length) {
    console.error(`${title} failed:`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return false;
  }
  console.log(`${title} passed.`);
  return true;
}

module.exports = {
  repoRoot,
  transportOrder,
  productVersion,
  packageSemver,
  resolveRepo,
  readText,
  readJson,
  writeText,
  writeJson,
  isPlainObject,
  dashboardsFromConfig,
  isPowerBiPublishToWebUrl,
  assertPublicSafe,
  generatedRouterConfigJs,
  routerConfigAssetNames,
  writeRouterConfigAssets,
  emptyDir,
  copyFile,
  copyDir,
  normalizeLineEndings,
  printResult
};
