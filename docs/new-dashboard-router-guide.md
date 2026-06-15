# New Dashboard Router Guide

Required inputs:

```text
Dashboard display name:
Dashboard ID:
Desktop Power BI publish-to-web URL:
Mobile Power BI publish-to-web URL:
```

## Steps

1. Copy locked Bráðamóttakan master reference from `templates/bradamottaka-locked-master-reference.html`.
2. Change only dashboard-specific values: display name, dashboard ID, desktop URL, mobile URL, fallback mobile URL, noscript mobile URL, dashboard name in router comment if present.
3. Create dashboard folder/path.
4. Add config entry in `assets/router-config.json`.
5. Add aliases.
6. Add public card title, description, action text, route label and chips.
7. Add icon URL from approved host.
8. Add governance metadata.
9. Add registry rows in Apps Script/Sheets process.
10. Validate Power BI URLs.
11. Regenerate generated config JS by confirmed generator process.
12. Test `?debug=1`.
13. Test `?manual=1`.
14. Test `?force=mobile`.
15. Test `?force=desktop`.
16. Test normal redirect.
17. Test fallback/noscript.
18. Confirm Apps Script event.
19. Run aggregation.
20. Confirm Mælaborðsmælingar.
21. Record real publish date/time.

Do not refactor, modernize, optimize or redesign the locked template machinery. New dashboard routers are controlled substitution only.
