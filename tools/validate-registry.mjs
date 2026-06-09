#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2] || path.join(process.cwd(), 'config', 'dashboard-registry.json');
const errors = [];
const warnings = [];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`Cannot read or parse ${filePath}: ${error.message}`);
    return null;
  }
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function isPowerBiPublishToWeb(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'app.powerbi.com' && url.pathname.toLowerCase() === '/view' && url.searchParams.has('r');
  } catch (_) {
    return false;
  }
}

function hostOf(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch (_) { return ''; }
}

function requireString(obj, key, where) {
  if (typeof obj[key] !== 'string' || !obj[key].trim()) {
    errors.push(`${where}.${key} is required`);
  }
}

function checkDashboard(config, key, dashboard, aliasOwners, pathOwners) {
  const where = `dashboards.${key}`;
  ['dashboardId', 'dashboardKey', 'displayName', 'path', 'desktopUrl', 'mobileUrl'].forEach((field) => requireString(dashboard, field, where));

  if (dashboard.dashboardKey !== key) {
    errors.push(`${where}.dashboardKey must match object key '${key}'`);
  }
  if (!/^[a-z0-9-]+$/.test(dashboard.dashboardKey || '')) {
    errors.push(`${where}.dashboardKey must use lowercase ascii letters, numbers, and hyphens only`);
  }
  if (!/^[a-z0-9-]+$/.test(dashboard.path || '')) {
    errors.push(`${where}.path must use lowercase ascii letters, numbers, and hyphens only`);
  }
  if (!isPowerBiPublishToWeb(dashboard.desktopUrl)) {
    errors.push(`${where}.desktopUrl is not a valid Power BI publish-to-web URL`);
  }
  if (!isPowerBiPublishToWeb(dashboard.mobileUrl)) {
    errors.push(`${where}.mobileUrl is not a valid Power BI publish-to-web URL`);
  }

  const publicCard = dashboard.publicCard || {};
  ['title', 'description', 'buttonText', 'iconUrl', 'pageUrl', 'stableUtmContent', 'lastVerifiedDate'].forEach((field) => requireString(publicCard, field, `${where}.publicCard`));
  if (publicCard.buttonText && publicCard.buttonText !== (config.publicEntry?.defaultButtonText || 'Skoða mælaborð')) {
    warnings.push(`${where}.publicCard.buttonText differs from publicEntry.defaultButtonText`);
  }
  if (!isHttpsUrl(publicCard.pageUrl)) {
    errors.push(`${where}.publicCard.pageUrl must be an HTTPS URL`);
  }
  if (!isHttpsUrl(publicCard.iconUrl)) {
    errors.push(`${where}.publicCard.iconUrl must be an HTTPS URL`);
  }
  const allowedImageHosts = new Set(config.publicEntry?.allowedImageHosts || []);
  if (publicCard.iconUrl && !allowedImageHosts.has(hostOf(publicCard.iconUrl))) {
    errors.push(`${where}.publicCard.iconUrl host is not allowed: ${hostOf(publicCard.iconUrl)}`);
  }

  const governance = dashboard.governance || {};
  ['ownerTeam', 'technicalOwner', 'contentOwner', 'createdDate', 'lastReviewedDate', 'nextReviewDue'].forEach((field) => requireString(governance, field, `${where}.governance`));

  const aliases = [dashboard.dashboardKey, dashboard.dashboardId, dashboard.path, ...(dashboard.aliases || [])];
  aliases.forEach((alias) => {
    const normalized = String(alias || '').trim().toLowerCase();
    if (!normalized) return;
    if (aliasOwners.has(normalized) && aliasOwners.get(normalized) !== key) {
      errors.push(`${where}.aliases contains '${alias}', already used by dashboards.${aliasOwners.get(normalized)}`);
    }
    aliasOwners.set(normalized, key);
  });

  const pathKey = String(dashboard.path || '').trim().toLowerCase();
  if (pathOwners.has(pathKey) && pathOwners.get(pathKey) !== key) {
    errors.push(`${where}.path '${dashboard.path}' already used by dashboards.${pathOwners.get(pathKey)}`);
  }
  pathOwners.set(pathKey, key);

  if (publicCard.title && dashboard.displayName && publicCard.title !== dashboard.displayName) {
    warnings.push(`${where}: public card title '${publicCard.title}' differs from router display name '${dashboard.displayName}'. This can be valid but should be intentional.`);
  }
}

const config = readJson(file);
if (config) {
  ['schemaVersion', 'configVersion', 'routerName', 'environment', 'basePath'].forEach((field) => requireString(config, field, 'registry'));
  if (!config.publicEntry || typeof config.publicEntry !== 'object') errors.push('registry.publicEntry is required');
  if (!config.tracking || typeof config.tracking !== 'object') errors.push('registry.tracking is required');
  if (!config.routing || typeof config.routing !== 'object') errors.push('registry.routing is required');
  if (!config.dashboards || typeof config.dashboards !== 'object') errors.push('registry.dashboards is required');

  if (config.publicEntry) {
    ['site', 'pageUrl', 'pagePath', 'defaultButtonText', 'logoUrl'].forEach((field) => requireString(config.publicEntry, field, 'publicEntry'));
    if (!isHttpsUrl(config.publicEntry.pageUrl)) errors.push('publicEntry.pageUrl must be an HTTPS URL');
    if (!isHttpsUrl(config.publicEntry.logoUrl)) errors.push('publicEntry.logoUrl must be an HTTPS URL');
  }
  if (config.tracking) {
    if (config.tracking.enabled && !isHttpsUrl(config.tracking.endpoint)) {
      errors.push('tracking.endpoint must be an HTTPS URL when tracking.enabled is true');
    }
    if (!Array.isArray(config.tracking.transportOrder) || config.tracking.transportOrder.length === 0) {
      errors.push('tracking.transportOrder must be a non-empty array');
    }
    const validTransports = new Set(['sendBeacon', 'fetchKeepalive', 'imageGet']);
    (config.tracking.transportOrder || []).forEach((transport) => {
      if (!validTransports.has(transport)) errors.push(`tracking.transportOrder contains unsupported transport '${transport}'`);
    });
  }

  const aliasOwners = new Map();
  const pathOwners = new Map();
  Object.entries(config.dashboards || {}).forEach(([key, dashboard]) => checkDashboard(config, key, dashboard, aliasOwners, pathOwners));
}

if (warnings.length) {
  console.warn('Warnings:');
  warnings.forEach((warning) => console.warn(`  - ${warning}`));
}

if (errors.length) {
  console.error('Validation failed:');
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`Registry OK: ${Object.keys(config.dashboards || {}).length} dashboards, version ${config.configVersion}`);
