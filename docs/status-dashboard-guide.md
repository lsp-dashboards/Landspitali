# Status Dashboard Guide: Mælaborðsmælingar

Source: `status-dashboard/index.html`.

`Mælaborðsmælingar` er public heiti stöðuyfirlitsins og birtir aðeins samantektargögn rekstrarsýn fyrir opinber Power BI mælaborð. Status UI dev version er `v1.0.0`. Síðan hleður Apps Script payload með JSONP:

```text
DATA_ENDPOINT + ?api=dashboard&format=js&callback=<callback>&v=<timestamp>
```

Ef endpoint svarar ekki innan 10 sekúndna birtist error message sem bendir á `api=health` og `api=dashboard`.

## Sections

- Header: sýnir public heitið `Mælaborðsmælingar`, refresh/control stöðu og component band.
- Component band: sýnir `UI: Vaktborð`, `Talningarhlið`, `Leiðingarskipting`, `Aðeins samantektargögn`, `Vöktunarkjarni: Rekstrarpúls`, `Config v1`, `Atburðasafnari v1` og `Gagnasnið 1`.
- Dev version labels eru í source metadata: status UI `v1.0.0`, UI component `v1.0.0`, core `v1.0.0`, config `config-v1.0.0`, tracker `atburdasafnari-v1.0.0` og schema `1`.
- Refresh/cache/health: `health-dot`, `generated-pill`, `cache-pill`.
- Stjórnstöð / Fresh start: samantekt, actions og rekstrarstig.
- Rekstrarstig / Samsett rekstrarstaða: penalty-based score 0-100.
- Talningarhlið: aðgreinir counted visits frá raw/gateway/diagnostic og sýnir hvers vegna FALSE rows hækka ekki notkun.
- Leiðingarskipting: root index, clicks, router arrivals og counted opens.
- Signal panorama: heatmap-yfirlit yfir dashboard/source/route signal.
- Dashboard/public card master view: public cards, published status, usage/freshness.
- Leiðing og uppruni: mobile/desktop og source/UTM.
- Sjálfvirk leiðing: route reason table.
- Rekstrarinnsýn: operational KPIs.
- Tæki og vafraumhverfi: device/browser/display/input aggregate, þar á meðal accessibility/display media settings eins og reduced transparency, update frequency, scripting og display-mode þegar browser gefur þau upp.
- Tæknimerki til skoðunar: diagnostics, delivery, performance.
- Gæðaviðvaranir: confirmed warnings og diagnostic/info signals aðskilin.
- Publication cards: public launch/published status.
- Footer/privacy: aðeins samantektargögn, safe rendering og no personal data.

## Hvernig á að lesa tölur

Taldar heimsóknir koma aðeins úr production dashboard opnunum. Gateway/raw/diagnostic eru aðskilin. `count_as_visit = FALSE` raðir hækka ekki notkun.

Samsung Internet getur birst sem diagnostic forced-dark possible án þess að vera counted usage eða production failure.

„Engin staðfest production warning“ þýðir ekki að ekkert þurfi að skoða; diagnostic signals geta enn verið gagnleg.

Lítil sample size getur skekkt prósentur. Lesa skal totals, freshness og warning context saman.

## Safe rendering

`safeRender` vefur hverja section renderingu. Ef ein section bilar birtist section-level villa í stað þess að allt dashboard falli.
