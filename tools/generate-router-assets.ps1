param(
  [string]$ConfigPath = "assets/router-config.json"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).ProviderPath
$configFullPath = (Resolve-Path (Join-Path $repoRoot $ConfigPath)).ProviderPath
$assetsDir = Split-Path -Parent $configFullPath

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$rawJson = [System.IO.File]::ReadAllText($configFullPath, $utf8NoBom)
$config = $rawJson | ConvertFrom-Json

if (-not $config.configVersion) {
  throw "router-config.json is missing configVersion."
}

if (-not $config.release.configAssetFile) {
  throw "router-config.json is missing release.configAssetFile."
}

$generated = @(
  $config.release.configAssetFile,
  $config.release.nextConfigAssetFile,
  $config.release.versionedConfigAssetFile
) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique

if (-not ($generated -contains "router-config.next.js")) {
  $generated += "router-config.next.js"
}

$body = $rawJson.Trim()
$js = "// Generated from router-config.json. Do not hand-edit.`n" +
      "// Config version: $($config.configVersion)`n" +
      "window.LSP_ROUTER_CONFIG = $body;`n"

foreach ($file in $generated) {
  $target = Join-Path $assetsDir $file
  [System.IO.File]::WriteAllText($target, $js, $utf8NoBom)
  Write-Host "Wrote $file"
}

if ($config.release.coreAssetFile -and $config.release.versionedCoreAssetFile) {
  $coreSource = Join-Path $assetsDir $config.release.coreAssetFile
  $coreTarget = Join-Path $assetsDir $config.release.versionedCoreAssetFile
  if (-not (Test-Path -LiteralPath $coreSource)) {
    throw "Core asset not found: $coreSource"
  }
  Copy-Item -LiteralPath $coreSource -Destination $coreTarget -Force
  Write-Host "Synced $($config.release.versionedCoreAssetFile)"
}
