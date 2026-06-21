# Documentation Map

These documents describe the production `v1.0.0` Landspítali Power BI Router Tracker and Mælaborðsmælingar system from repository source.

## Reading Path

| Reader | Start Here |
|---|---|
| Stakeholder | [product-guide.md](product-guide.md), [leidbeiningar.md](leidbeiningar.md), [status-dashboard-guide.md](status-dashboard-guide.md) |
| Service owner | [service-guide.md](service-guide.md), [production-deployment.md](production-deployment.md), [production-readiness.md](production-readiness.md) |
| Technical maintainer | [technical-guide.md](technical-guide.md), [routing-guide.md](routing-guide.md), [dashboard-router-guide.md](dashboard-router-guide.md) |
| Debug/incident owner | [debug-handbook.md](debug-handbook.md), [troubleshooting.md](troubleshooting.md), [operational-limits.md](operational-limits.md) |
| QA owner | [testing-and-qa.md](testing-and-qa.md), [score-and-confidence-guide.md](score-and-confidence-guide.md), [data-dictionary.md](data-dictionary.md) |
| Privacy reviewer | [tracking-and-privacy.md](tracking-and-privacy.md), [external-references.md](external-references.md) |

## Documents

- [product-guide.md](product-guide.md): service purpose and user-facing behavior.
- [leidbeiningar.md](leidbeiningar.md): short Icelandic operating instructions.
- [service-guide.md](service-guide.md): ownership, daily checks and incident triage.
- [technical-guide.md](technical-guide.md): architecture, route flow, tracker flow and failure modes.
- [production-deployment.md](production-deployment.md): deployment sequence, smoke tests and restore path.
- [production-readiness.md](production-readiness.md): production guarantees and readiness checklist.
- [logic-and-decisions.md](logic-and-decisions.md): routing/counting design decisions.
- [score-and-confidence-guide.md](score-and-confidence-guide.md): operational score and confidence model.
- [data-dictionary.md](data-dictionary.md): raw, aggregate and public fields.
- [routing-guide.md](routing-guide.md): route model, query modes and breakpoint policy.
- [dashboard-router-guide.md](dashboard-router-guide.md): adding a dashboard route.
- [tracking-and-privacy.md](tracking-and-privacy.md): measured signals and privacy boundaries.
- [status-dashboard-guide.md](status-dashboard-guide.md): how to read Mælaborðsmælingar.
- [debug-handbook.md](debug-handbook.md): practical debugging playbooks.
- [testing-and-qa.md](testing-and-qa.md): production QA plan.
- [troubleshooting.md](troubleshooting.md): short symptom guide.
- [operational-limits.md](operational-limits.md): platform, routing, telemetry and interpretation limits.
- [glossary.md](glossary.md): terms.
- [external-references.md](external-references.md): official external references.

## Source Map

| Area | Source |
|---|---|
| Root gateway | `index.html` |
| Dashboard router pages | `bradamottaka/index.html`, `thjonustukannanir/index.html` |
| Locked router reference | `templates/bradamottaka-locked-master-reference.html` |
| Central config | `assets/router-config.json` |
| Generated config | `assets/router-config.prod.js`, `assets/router-config.next.js`, `assets/router-config.v1.0.0.js` |
| Router core | `assets/router-core.prod.js`, `assets/router-core.v1.0.0.js` |
| Apps Script tracker | `tracker/powerbi_router_tracker_apps_script_v1.0.0.js` |
| Status dashboard | `status-dashboard/index.html` |
| Tracking order | `sendBeacon`, `fetchKeepalive`, `imageGet` |
| Query modes | `debug`, `list`/`dashboards`, `health`/`status`, `noredirect`/`manual`, `force`/`view` |

## Production Alignment

- Product-owned labels are `v1.0.0`.
- Status path is `status-dashboard/`.
- Generated asset process is `tools/generate-router-assets.ps1`.
- Versioned assets are `assets/router-config.v1.0.0.js` and `assets/router-core.v1.0.0.js`.
- Public status output is aggregate-only.
