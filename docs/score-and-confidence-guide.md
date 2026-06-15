# Score and Confidence Guide

Þessi síða aðgreinir sex ólíka hluti sem má ekki rugla saman: rekstrarstig, device inference confidence, dashboard aggregate confidence, theme confidence, source confidence og warning confidence.

## Rekstrarstig / Samsett rekstrarstaða

Source: `status-dashboard/index.html`, function `opsModel`.

```text
freshnessPenalty =
  (eventAge.minutes > 1440 ? 12 :
   eventAge.minutes > 360  ? 6  : 0)
+
  (aggregationAge.minutes > 240 ? 8 :
   aggregationAge.minutes > 75  ? 3 : 0)

score =
  clamp(
    100
    - confirmedWarningCount * 16
    - fallbackErrorCount * 9
    - weakUnknownSignalShare * 38
    - freshnessPenalty,
    0,
    100
  )

tone =
  score >= 86 ? good :
  score >= 70 ? warn :
  bad
```

Rekstrarstig er operational health. Það er ekki popularity score. Meiri traffic hækkar það ekki sjálfkrafa. Staðfestar viðvaranir, fallback/error signals, weak/unknown share og stale data lækka stigið. Það svarar: er rekstrarmyndin traust?

Dæmi:

- `100`: engar staðfestar viðvaranir, engin fallback/error merki, lág weak/unknown share, fersk gögn.
- `84`: eitt vægt frávik eða freshness/fallback penalty setur stöðu í watch/warn.
- `60`: mörg confirmed warnings, fallback/errors eða gömul gögn gera stöðu brýna.

## Device inference confidence

Source: `assets/router-core.prod.js`, functions `inferDeviceConfidence` og `confidenceBand`.

Bands:

| Score | Band |
|---|---|
| `>= 90` | `very high confidence` |
| `>= 70` | `high confidence` |
| `>= 50` | `medium confidence` |
| `>= 30` | `weak inference` |
| `< 30` | `unknown or insufficient evidence` |

Þetta er inference, ekki identity. Það greinir ekki persónu og tryggir ekki nákvæmt device model. Evidence getur verið UA, UA-CH, viewport, visual viewport, touch, pointer, hover, OS, browser, feature support og contradictions.

## Dashboard aggregate confidence

Source: Apps Script `dashboardConfidenceBand_`.

```text
weakShare = weak_unknown_signal_count / max(total_events, 1)
weakShare > 0.35 => warning
weakShare > 0.15 => watch
annars => good
```

Þetta lýsir gæðum aggregate merkja fyrir mælaborð, ekki notenda- eða device identity.

## Theme confidence

Source: `getThemeSignal`, `detectForcedDarkRendering`, `getThemeEvidence`, `getThemeConfidenceBand`.

`reported` eða `detected` => `high`. `possible_only` => `weak inference`. Annars `unknown`.

Samsung Internet/forced dark er diagnostic nema production evidence sýni raunveruleg áhrif. `samsung_forced_dark_possible` er ekki staðfest dark-mode bilun.

## Source confidence

Source: `normalizeSource` í router core og `deriveSourceCategory_` í Apps Script.

Flokkar eru meðal annars `island_is_public`, `root_index`, `qr_code`, `internal_teams`, `internal_email`, `internal_intranet`, `external_referrer`, `campaign_or_other_utm`, `direct`. Referrer getur vantað vegna browser privacy, app contexts eða policy.

UTM defaults í config eru `utm_source = island.is`, `utm_medium = public_dashboard_card`, `utm_campaign = landspitali_maelabord`. Root gateway notar eigin `utm_source = root_index`, `utm_medium = gateway_card`, `utm_campaign = landspitali_maelabord`.

## Warning confidence

Source: `addQualityWarning_`, `warningSeverity_`, `countWarningsForDashboard_`, `countDiagnosticSignalsForDashboard_`.

Confirmed warning hefur `confirmed_count > 0` eða counted non-info signal. Diagnostic signal er oft `severity = info` eða ekki confirmed. Gæðaviðvörun á að lesast með `severity`, `is_confirmed`, `counted_count`, `diagnostic_count`, `signal_quality` og `confidence_band`.
