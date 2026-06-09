# Rollback plan

## Fast rollback options

### GitHub Pages router rollback

1. Revert to the previous Git commit.
2. Wait for GitHub Pages deployment.
3. Test one mobile and one desktop route.
4. Check that island.is links still point to working router paths.

### Config-only rollback

1. Restore previous `config/dashboard-registry.json`.
2. Run:

   ```bash
   npm run generate
   npm run build
   ```

3. Commit generated config/wrappers.
4. Test with `?debug=1` before normal traffic.

### Apps Script rollback

1. Open Apps Script deployments.
2. Redeploy previous known-good version, or switch Web App deployment to previous version.
3. Keep the same Web App URL if possible.
4. Run `testWrite` and `testAggregation`.
5. Confirm status dashboard recovers.

## Incident behavior

If Apps Script or Google Sheets fails, do not rush to change island.is links. The router should still send users to Power BI. Treat tracker failure as an operational warning, not a public outage, unless routing also fails.

If a Power BI URL fails, use one of these approved temporary actions:

- Put the dashboard in maintenance mode.
- Replace the affected Power BI URL in the registry and regenerate.
- Temporarily remove or disable the island.is public card after coordination.

Do not route users to an unrelated dashboard.

## Emergency static fallback

Each generated dashboard wrapper contains:

- static mobile fallback button
- noscript mobile meta refresh
- embedded dashboard config
- core-load emergency fallback guard

If `router-core` fails to load, normal users are redirected to the mobile Power BI URL after the configured guard delay. Debug/manual/health modes are not emergency redirected.
