# Event schema

Schema version: `5`

## Counting rules

| Event | Counts as visit |
|---|---|
| `router_redirect` from real user | true |
| `router_noscript` best-effort fallback | true |
| `fallback_click` | false |
| `router_debug_view` | false |
| `router_manual_view` | false |
| `router_health_view` | false |
| `router_directory_view` | false |
| `router_error` | false |
| known bot or link preview | false by default |
| duplicate event ID | false in aggregation |

## Essential fields

| Field | Purpose |
|---|---|
| `server_time` | Server receive time |
| `client_time` | Client event time |
| `event_id` | Dedupe key |
| `request_id` | Per-page-load grouping, not persistent |
| `event_type` | Event classification |
| `count_as_visit` | Whether the event should count as a real dashboard open |
| `duplicate_event` | Whether recent event ID was already seen |
| `dashboard_key` | Stable registry key |
| `dashboard_id` | Stable dashboard ID |
| `dashboard_name` | Router display name |
| `public_card_title` | island.is visible title |
| `public_entry_page` | Official public page path |
| `selected_layout` | mobile or desktop |
| `auto_selected_layout` | Auto decision before forced override |
| `forced_layout` | auto, mobile, or desktop |
| `forced_layout_applied` | Query override applied |
| `route_reason` | Structured routing reason |
| `route_reason_detail` | Short explanation |
| `device_class` | phone/tablet/desktop/narrow-screen |
| `viewport_width` | Routing quality check |
| `viewport_height` | Routing quality check |
| `browser_family` | Reduced browser family |
| `os_family` | Reduced OS family |
| `referrer_domain` | Domain only, no path or query |
| `entry_source_category` | island.is, QR, direct, internal, preview bot |
| `utm_source` | Allowlisted and truncated |
| `utm_medium` | Allowlisted and truncated |
| `utm_campaign` | Allowlisted and truncated |
| `utm_content` | Stable public card or campaign content |
| `page_path` | Router path only |
| `config_version` | Registry/config version |
| `router_core_version` | Core version |
| `config_source` | central or embedded fallback source |
| `safe_fallback_used` | Router used safe fallback |
| `tracking_method` | sendBeacon, fetchKeepalive, imageGet |

## Optional diagnostics

Blank by default:

```text
user_agent
screen_width
screen_height
device_pixel_ratio
touch
max_touch_points
language
timezone
bot_reason
browser_major_version
os_version_hint
connection_type
```

## Example payload

```json
{
  "schema_version": "5",
  "event_id": "req-abc-1",
  "request_id": "req-abc",
  "event_type": "router_redirect",
  "count_as_visit": true,
  "client_time": "2026-06-07T12:00:00.000Z",
  "dashboard_key": "bradamottaka",
  "dashboard_id": "bradamottakan-fossvogi",
  "dashboard_name": "Bráðamóttakan í Fossvogi",
  "public_card_title": "Bráðamóttaka í Fossvogi",
  "public_entry_page": "/s/landspitali/maelabord",
  "selected_layout": "mobile",
  "auto_selected_layout": "mobile",
  "forced_layout": "auto",
  "forced_layout_applied": false,
  "route_reason": "phone_user_agent",
  "route_reason_detail": "phone user agent selected mobile",
  "device_class": "phone",
  "viewport_width": 390,
  "viewport_height": 844,
  "browser_family": "Safari",
  "os_family": "iOS",
  "referrer_domain": "island.is",
  "entry_source_category": "island_is_public",
  "utm_source": "island.is",
  "utm_medium": "public_dashboard_card",
  "utm_campaign": "landspitali_maelabord",
  "utm_content": "bradamottakan_fossvogi",
  "page_path": "/Landspitali/bradamottaka/",
  "config_version": "2026-06-07-prod-1",
  "router_core_version": "2026-06-07-core-1",
  "config_source": "central-config-js",
  "safe_fallback_used": false,
  "tracking_method": "sendBeacon"
}
```
