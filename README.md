# Landspítali Power BI Router and Tracker, production v1.0.1

This package is the official first production version, patched with installation-ready documentation and tracker setup hardening of the centralized router/tracker platform for public Landspítali Power BI publish-to-web dashboards.

The older `router_virtuoso` package is treated as a test package. The locked Bráðamóttakan master template remains a reference and is not modified by this package.


## Detailed installation

Start here for the first production install:

```text
INSTALLATION_GUIDE.md
```

Use this worksheet while installing:

```text
docs/installation-worksheet.md
```

For common install problems, use:

```text
docs/troubleshooting.md
```

## What this package does

Public journey:

1. User opens the Landspítali mælaborð page on island.is.
2. User clicks `Skoða mælaborð` on a public dashboard card.
3. The card link opens a GitHub Pages dashboard router path.
4. The dashboard wrapper has a static mobile fallback and noscript fallback.
5. The versioned router core decides mobile or desktop.
6. The router sends a fire-and-forget event when possible.
7. The user is redirected to the public Power BI publish-to-web report.
8. Apps Script appends the raw event quickly.
9. Scheduled aggregation updates aggregate sheets and dashboard data.
10. The external status dashboard reads aggregate-only data.

Tracking must never block routing. If tracking fails, the user still reaches Power BI.

## Package layout

```text
.nojekyll
404.html
INSTALLATION_GUIDE.md
assets/
  router-core.v20260607-1.js
  router-core.prod.js
  router-config.v20260607-1.js
  router-config.prod.js
  router-config.next.js
  router-config.json
bradamottaka/index.html
thjonustukannanir/index.html
config/
  dashboard-registry.json
  dashboard-registry.schema.json
docs/
  installation-worksheet.md
  troubleshooting.md
  operator-runbook.md
  privacy-and-retention.md
  islandis-publication-checklist.md
  router-test-matrix.md
  deployment-checklist.md
  rollback-plan.md
status-dashboard/
  index.html
  assets/status-config.js
  assets/status-dashboard.css
  assets/status-dashboard.js
  assets/status-sample-data.js
tracker/
  powerbi_router_tracker_apps_script_v1.js
tools/
  validate-registry.mjs
  generate-router-assets.mjs
tests/
  smoke-test.mjs
```

## Production choices

- island.is remains the official public entry page.
- GitHub Pages remains the static public router host.
- Each dashboard has a generated thin wrapper with an embedded safe config.
- Mobile Power BI URL is the safe static fallback.
- No-JavaScript users are sent to mobile with noscript meta refresh.
- Router core is versioned and pinned in wrappers.
- The dashboard registry is canonical.
- `router-config*.js` is generated from the registry.
- Apps Script is the collector and aggregate API for v1.
- Raw events are internal and append-only.
- Aggregation is scheduled, not rebuilt on every click.
- The status dashboard reads aggregate-only data.
- No cookies, no localStorage IDs, no raw IPs, no names, no emails, no kennitölur.

## First deployment checklist

For detailed step-by-step installation, use `INSTALLATION_GUIDE.md`.

1. Run local validation:

   ```bash
   npm run build
   ```

2. Upload this package to the GitHub Pages repository path used for `/Landspitali/`.

3. In Apps Script, create or open the tracker project.

4. Replace the test tracker code with:

   ```text
   tracker/powerbi_router_tracker_apps_script_v1.js
   ```

5. Deploy Apps Script as a Web App.

6. Update `config/dashboard-registry.json` and `status-dashboard/assets/status-config.js` with the deployed Web App URL if it differs from the current endpoint.

7. Run:

   ```bash
   npm run generate
   npm run build
   ```

8. Upload regenerated files.

9. In Apps Script, run:

   ```text
   setupProductionWorkbook
   installProductionTriggers
   testWrite
   testAggregation
   ```

10. Test dashboard routes with `?debug=1`, `?force=mobile`, `?force=desktop`, and normal redirects.

11. Update island.is card links to use UTM-tagged router URLs.

## island.is router links

Use the public page as the official front door. Router URLs should include stable UTM fields.

Bráðamóttaka:

```text
<GITHUB_PAGES_BASE_URL>/Landspitali/bradamottaka/?utm_source=island.is&utm_medium=public_dashboard_card&utm_campaign=landspitali_maelabord&utm_content=bradamottakan_fossvogi
```

Þjónustukannanir:

```text
<GITHUB_PAGES_BASE_URL>/Landspitali/thjonustukannanir/?utm_source=island.is&utm_medium=public_dashboard_card&utm_campaign=landspitali_maelabord&utm_content=thjonustukannanir
```

## Local commands

```bash
npm run validate
npm run generate
npm run smoke
npm run build
```

No npm dependencies are required.

## Safe edit rule

For normal dashboard updates, edit only:

```text
config/dashboard-registry.json
```

Then regenerate assets. Do not hand-edit generated wrappers or generated router config unless performing an emergency hotfix with explicit approval.

## Status dashboard

Open:

```text
/status-dashboard/index.html
```

It reads aggregate dashboard data from the Apps Script Web App through JSONP-style JavaScript output. If live aggregate data is unavailable, it shows clearly marked sample data instead of raw events.

## Upgrade triggers

Stay on this v1 stack until one or more of these is true:

- Events regularly exceed 5,000 to 10,000 per day.
- Aggregation takes more than 60 seconds.
- Google Sheet approaches operational capacity.
- Apps Script lock or quota errors become visible.
- Governance requires stronger database access control or audit logging.
- Public campaign volume is expected to create large spikes.

At that point, move the event store or collector to Cloudflare Worker, Supabase, BigQuery, Cloud Run, or another approved backend. Keep the public router behavior unchanged.
