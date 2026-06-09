# Architecture

## Production v1 recommendation

Use the boring stack:

```text
island.is public page
  -> GitHub Pages dashboard wrapper
    -> versioned router core
      -> Power BI publish-to-web mobile or desktop report

Router event, non-blocking
  -> Apps Script Web App
    -> Google Sheets Events_Raw
      -> scheduled aggregation
        -> aggregate-only API/JSONP
          -> static external status dashboard
```

## Why this architecture

- The public front door remains island.is.
- The router remains static and fast.
- The tracker is allowed to fail without blocking users.
- Google Sheets remains easy for a small team to inspect.
- Aggregation is moved out of the hot path.
- The status dashboard is outside Fabric and Power BI.
- Upgrade paths are clear if volume or governance requires them.

## Failure behavior

| Failure | User result | Tracking result |
|---|---|---|
| Apps Script down | User still reaches Power BI | Event missing or delayed |
| Google Sheets slow | User still reaches Power BI | Append may fail and error logs show it |
| Central config fails | Embedded dashboard config is used | Event marks embedded config if possible |
| Router core fails | Wrapper emergency guard sends user to mobile | Usually no event |
| JavaScript disabled | Noscript meta refresh sends user to mobile | Best-effort noscript image event |
| Tracking blocked | User still reaches Power BI | No event |
| Link preview bot | Not counted as real visit | Visible as preview/bot signal |
| Power BI URL broken | Router cannot fix broken target | Status and manual health checks should catch it |

## Version model

- `config/dashboard-registry.json` is canonical.
- `assets/router-config*.js` is generated.
- Dashboard wrappers load `router-config.prod.js` and pinned `router-core.v20260607-1.js`.
- `router-config.next.js` is for staging.
- A bad central config should not strand users because wrappers include embedded safe dashboard config.

## Ownership model

| Area | Owner |
|---|---|
| Public card wording | Content owner and island.is publication owner |
| Power BI URLs | Dashboard/report owner |
| Router config | Technical owner |
| Apps Script and Sheet | Tracker owner |
| Status dashboard | Technical owner and operators |
| Privacy review | Data protection/governance owner |

## Upgrade paths

Stay on Apps Script and Sheets until there is evidence of pressure. Upgrade only when volume, governance, or reliability requires it.

Potential next platforms:

- Cloudflare Worker plus durable storage for a faster edge collector.
- Supabase or PostgreSQL for relational event storage and dashboard queries.
- BigQuery for high-volume analytics and long retention.
- Cloud Run for a controlled collector/API service.

The router HTML and island.is links should not need to change during backend migration. Only `tracking.endpoint` and dashboard API configuration should change.
