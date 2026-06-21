# Dashboard Router Guide

Use this guide when adding a public dashboard route to the production router.

## Required Inputs

```text
Dashboard display name:
Dashboard ID:
Desktop Power BI publish-to-web URL:
Mobile Power BI publish-to-web URL:
Public card title:
Public card description:
Icon URL:
Owner:
Publication timestamp:
```

## Build Path

1. Copy the locked router reference from `templates/bradamottaka-locked-master-reference.html`.
2. Edit only dashboard-specific values: display name, dashboard ID, desktop URL, mobile URL, fallback mobile URL, noscript mobile URL and router comment.
3. Create the dashboard folder/path.
4. Add the dashboard entry to `assets/router-config.json`.
5. Add aliases, public card metadata, action text, route label, chips and governance metadata.
6. Confirm the icon URL host is approved.
7. Confirm Apps Script registry/control rows or registry snapshot.
8. Validate Power BI URLs.
9. Regenerate generated config wrappers.
10. Test `?debug=1`, `?manual=1`, `?force=mobile`, `?force=desktop`, normal redirect, fallback and noscript.
11. Confirm Apps Script event intake.
12. Run aggregation and confirm Mælaborðsmælingar.
13. Record the real publication timestamp.

The locked router machinery is controlled substitution only. Keep route, tracking, counting and privacy behavior aligned with production `v1.0.0`.
