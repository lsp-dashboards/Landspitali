"use strict";

const {
  writeRouterConfigAssets,
  emptyDir,
  copyFile,
  copyDir
} = require("./lib");
const { writeStatusSnapshot } = require("./build-status");

async function build() {
  writeRouterConfigAssets();
  await writeStatusSnapshot();

  emptyDir("dist");

  [
    "index.html",
    "README.md"
  ].forEach((fileName) => copyFile(fileName, `dist/${fileName}`));

  [
    "assets",
    "bradamottaka",
    "thjonustukannanir",
    "status-dashboard"
  ].forEach((directory) => copyDir(directory, `dist/${directory}`));

  console.log("Built dist/");
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
