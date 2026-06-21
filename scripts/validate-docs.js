"use strict";

const fs = require("fs");
const path = require("path");
const {
  resolveRepo,
  productVersion,
  readText,
  printResult
} = require("./lib");

const errors = [];
const docsDir = resolveRepo("docs");
const markdownFiles = ["README.md"]
  .concat(fs.readdirSync(docsDir)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort()
    .map((fileName) => path.join("docs", fileName)));

const forbiddenHistoryLanguage = [
  /\bchangelog\b/i,
  /\bchange log\b/i,
  /\bprevious\b/i,
  /\bpreviouse\b/i,
  /\bprior\b/i,
  /\bold(?:er)?\b/i,
  /\bupgrade\b/i,
  /\brollback\b/i,
  /\brelease notes?\b/i,
  /\bfirst-production-hardening-review\b/i,
  /\brelease-and-deployment\b/i,
  /\bnew-dashboard-router-guide\b/i,
  /\bknown-issues-and-limits\b/i
];

const staleVersionText = [
  "2026-06-15-prod-v1.0.0",
  "v1.2.2",
  "config-v1.0.0",
  "atburdasafnari-v1.0.0",
  "Config v1`",
  "Atburðasafnari v1`",
  "Gagnasnið 1`"
];

function checkLinks(relativePath, source) {
  const linkPattern = /\[[^\]]+\]\(([^)#][^)]+\.md)(?:#[^)]+)?\)/g;
  let match;
  while ((match = linkPattern.exec(source))) {
    const target = match[1];
    if (/^[a-z]+:\/\//i.test(target)) continue;
    const base = path.dirname(resolveRepo(relativePath));
    const absolute = path.resolve(base, target);
    if (!fs.existsSync(absolute)) {
      errors.push(`${relativePath}: missing markdown link target ${target}`);
    }
  }
}

markdownFiles.forEach((relativePath) => {
  const source = readText(relativePath);
  forbiddenHistoryLanguage.forEach((pattern) => {
    if (pattern.test(source)) errors.push(`${relativePath}: remove history/version-lineage language matching ${pattern}`);
  });
  staleVersionText.forEach((text) => {
    if (source.includes(text)) errors.push(`${relativePath}: stale version text "${text}" must be ${productVersion}`);
  });
  checkLinks(relativePath, source);
});

printResult("Docs validation", errors);
