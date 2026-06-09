# island.is publication checklist

The official public entry surface is island.is. The GitHub Pages router is infrastructure.

## Required public card fields

For every public card, confirm:

- Public card title.
- Public description.
- Button text is `Skoða mælaborð` unless deliberately changed.
- Icon URL is approved and hosted on an allowed image host.
- Public page URL is `https://island.is/s/landspitali/maelabord`.
- Router URL is the generated dashboard path.
- UTM fields are present.
- Mobile and desktop Power BI URLs are valid.
- Dashboard owner and review date exist.

## Required UTM fields

Bráðamóttaka:

```text
utm_source=island.is
utm_medium=public_dashboard_card
utm_campaign=landspitali_maelabord
utm_content=bradamottakan_fossvogi
```

Þjónustukannanir:

```text
utm_source=island.is
utm_medium=public_dashboard_card
utm_campaign=landspitali_maelabord
utm_content=thjonustukannanir
```

## Source categories

| Source | How it is detected |
|---|---|
| `island_is_public` | `utm_source=island.is` or island.is referrer domain |
| `qr_code` | `utm_source=qr` or `qrcode` |
| `internal_teams` | Teams UTM source |
| `internal_email` | Email or Outlook UTM source |
| `internal_intranet` | SharePoint or intranet UTM source |
| `direct` | No UTM and no referrer |
| `external_referrer` | Non-island.is non-internal referrer |
| `link_preview_bot` | Known social or app preview bot user agent |

## Before publishing or changing a card

1. Test the router path with `?debug=1`.
2. Test forced mobile and forced desktop.
3. Test normal click on a phone.
4. Test normal click on desktop.
5. Confirm the status dashboard receives aggregate data after the scheduled aggregation.
6. Confirm link preview events are not counted as visits.
7. Confirm the public card title and registry title mismatch is intentional if they differ.

## Current public cards in production v1

| Dashboard key | Public card title | UTM content |
|---|---|---|
| `bradamottaka` | `Bráðamóttaka í Fossvogi` | `bradamottakan_fossvogi` |
| `thjonustukannanir` | `Þjónustukannanir` | `thjonustukannanir` |
