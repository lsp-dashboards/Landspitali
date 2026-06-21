"use strict";

const fs = require("fs");
const path = require("path");
const {
  resolveRepo,
  readJson,
  productVersion,
  isPlainObject,
  assertPublicSafe,
  printResult
} = require("./lib");

const errors = [];
const config = readJson("assets/router-config.json");
const statusFiles = ["assets/data/status-latest.json"];
const historyDir = resolveRepo("assets/data/status-history");
const configDashboards = Object.entries(config.dashboards || {}).map(([key, dashboard]) => ({
  key,
  dashboardKey: dashboard.dashboardKey || key,
  dashboardId: dashboard.dashboardId
}));

if (fs.existsSync(historyDir)) {
  fs.readdirSync(historyDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .forEach((fileName) => statusFiles.push(path.join("assets/data/status-history", fileName)));
}

function requireValue(value, message) {
  if (value === undefined || value === null || value === "") errors.push(message);
}

function requireProductVersion(value, message) {
  if (value !== undefined && value !== null && value !== "" && value !== productVersion) {
    errors.push(`${message}; expected ${productVersion}, received ${value}`);
  }
}

function validateStatusFile(relativePath) {
  const fullPath = resolveRepo(relativePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`${relativePath} is missing; run npm run build:status`);
    return;
  }

  let data;
  try {
    data = readJson(relativePath);
  } catch (error) {
    errors.push(`${relativePath} is not valid JSON: ${error.message}`);
    return;
  }

  if (!isPlainObject(data)) errors.push(`${relativePath} must contain a JSON object`);
  if (data.ok !== true) errors.push(`${relativePath}.ok must be true`);
  requireValue(data.generatedAt || data.generated_at, `${relativePath} must include generatedAt/generated_at`);
  requireProductVersion(data.script_version, `${relativePath}.script_version must use the production product version`);
  requireProductVersion(data.config_version, `${relativePath}.config_version must use the production product version`);
  requireProductVersion(data.core_version, `${relativePath}.core_version must use the production product version`);
  if (!Array.isArray(data.dashboards)) errors.push(`${relativePath}.dashboards must be an array`);
  if (data.publicAggregateOnly !== true && data.aggregate_only !== true) {
    errors.push(`${relativePath} must declare publicAggregateOnly or aggregate_only as true`);
  }

  errors.push(...assertPublicSafe(data, relativePath));

  (data.dashboards || []).forEach((dashboard, index) => {
    const prefix = `${relativePath}.dashboards[${index}]`;
    requireValue(dashboard.dashboardId || dashboard.dashboard_id, `${prefix} must include dashboardId/dashboard_id`);
    requireValue(dashboard.displayName || dashboard.dashboard_name, `${prefix} must include displayName/dashboard_name`);
    requireValue(dashboard.status, `${prefix} must include status`);
    requireProductVersion(dashboard.config_version, `${prefix}.config_version must use the production product version`);
    requireProductVersion(dashboard.core_version, `${prefix}.core_version must use the production product version`);
    if (!isPlainObject(dashboard.reportTypeAvailability || dashboard.report_type_availability || {})) {
      errors.push(`${prefix} must include reportTypeAvailability summary`);
    }
    if (!isPlainObject(dashboard.recentAggregateCounts || dashboard.recent_aggregate_counts || {})) {
      errors.push(`${prefix} must include recentAggregateCounts summary`);
    }
    if (!isPlainObject(dashboard.viewerRiskSummary || dashboard.viewer_risk_summary || {})) {
      errors.push(`${prefix} must include viewerRiskSummary`);
    }
  });

  const statusKeys = new Set((data.dashboards || []).map((dashboard) => dashboard.dashboardKey || dashboard.dashboard_key));
  const statusIds = new Set((data.dashboards || []).map((dashboard) => dashboard.dashboardId || dashboard.dashboard_id));
  configDashboards.forEach((dashboard) => {
    if (!statusKeys.has(dashboard.dashboardKey)) {
      errors.push(`${relativePath} is missing dashboard key "${dashboard.dashboardKey}" from assets/router-config.json`);
    }
    if (!statusIds.has(dashboard.dashboardId)) {
      errors.push(`${relativePath} is missing dashboard id "${dashboard.dashboardId}" from assets/router-config.json`);
    }
  });
}

statusFiles.forEach(validateStatusFile);

printResult("Status validation", errors);
