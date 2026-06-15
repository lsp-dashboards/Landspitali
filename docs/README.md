# Skjalayfirlit

Þessi skjöl lýsa **Landspítali Power BI Router Tracker and Mælaborðsmælingar** út frá repository source. GitHub repository er frumheimild; skjölin gera ekki ráð fyrir fyrri viðhengjum.

## Hver á að lesa hvað?

| Lesandi | Byrja hér |
|---|---|
| Hagsmunaaðili | [product-guide.md](product-guide.md), [leidbeiningar.md](leidbeiningar.md) |
| Nýr viðhaldsaðili | [service-guide.md](service-guide.md), [technical-guide.md](technical-guide.md), [routing-guide.md](routing-guide.md) |
| Debug/incident | [debug-handbook.md](debug-handbook.md), [troubleshooting.md](troubleshooting.md) |
| Production release | [production-guide.md](production-guide.md), [release-and-deployment.md](release-and-deployment.md), [testing-and-qa.md](testing-and-qa.md) |
| Tæknileg dýpkun | [score-and-confidence-guide.md](score-and-confidence-guide.md), [data-dictionary.md](data-dictionary.md), [tracking-and-privacy.md](tracking-and-privacy.md) |

## Kort af skjölum

- [product-guide.md](product-guide.md): þjónustulýsing og notendaleið.
- [leidbeiningar.md](leidbeiningar.md): einfaldar íslenskar leiðbeiningar.
- [service-guide.md](service-guide.md): rekstrarferlar og ábyrgð.
- [technical-guide.md](technical-guide.md): architecture og data flow.
- [production-guide.md](production-guide.md): deployment og breytingar.
- [logic-and-decisions.md](logic-and-decisions.md): hönnunarákvarðanir.
- [score-and-confidence-guide.md](score-and-confidence-guide.md): rekstrarstig og confidence.
- [data-dictionary.md](data-dictionary.md): raw, aggregate og public fields.
- [routing-guide.md](routing-guide.md): route model, query modes og breakpoint policy.
- [tracking-and-privacy.md](tracking-and-privacy.md): hvað er mælt og hvað ekki.
- [status-dashboard-guide.md](status-dashboard-guide.md): hvernig lesa á Mælaborðsmælingar.
- [debug-handbook.md](debug-handbook.md): flagship debug handbók.
- [testing-and-qa.md](testing-and-qa.md): QA plan.
- [troubleshooting.md](troubleshooting.md): stutt symptom guide.
- [release-and-deployment.md](release-and-deployment.md): release ferli.
- [new-dashboard-router-guide.md](new-dashboard-router-guide.md): nýtt mælaborð.
- [known-issues-and-limits.md](known-issues-and-limits.md): þekkt mörk.
- [glossary.md](glossary.md): hugtök.
- [external-references.md](external-references.md): official external references.

## Source map

| Spurning | Niðurstaða |
|---|---|
| Root gateway | `index.html` |
| Dashboard router pages | `bradamottaka/index.html`, `thjonustukannanir/index.html` |
| Locked Bráðamóttakan template | `templates/bradamottaka-locked-master-reference.html` |
| Central config | `assets/router-config.json` |
| Generated config | `assets/router-config.prod.js`, `assets/router-config.next.js`, `assets/router-config.v1.0.0.js` |
| Router core | `assets/router-core.prod.js` |
| Versioned router core | `assets/router-core.v1.0.0.js` |
| Apps Script tracker | `tracker/powerbi_router_tracker_apps_script_v1.0.0.js` |
| Status dashboard | `status-dashboard/index.html` |
| Icons/assets | icon URLs í config/root/router HTML, hýst á `images.ctfassets.net` |
| Tracking order | `sendBeacon`, `fetchKeepalive`, `imageGet` |
| Query modes | `debug`, `list`/`dashboards`, `health`/`status`, `noredirect`/`manual`, `force`/`view` |

## Production v1 alignment

- Status path er `status-dashboard/` og root footer/config vísa á sömu leið.
- `assets/router-config.json`, generated config JS og Apps Script registry snapshot nota `2026-06-15-prod-v1.0.0`.
- Versioned assets eru til: `assets/router-config.v1.0.0.js` og `assets/router-core.v1.0.0.js`.
- Generated asset process er `tools/generate-router-assets.ps1`.
