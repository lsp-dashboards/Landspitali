# Privacy and retention

## Default collection policy

The tracker collects only routing and counting fields needed to understand public dashboard opens and operational health.

It must not collect:

- names
- emails
- kennitölur
- Power BI report data
- row-level dashboard data
- cookies
- localStorage identifiers
- raw IP addresses
- precise geolocation
- persistent user identifiers

## Default schema categories

### Essential fields

```text
server_time
client_time
event_id
request_id
event_type
count_as_visit
duplicate_event
dashboard_key
dashboard_id
dashboard_name
public_card_title
public_entry_page
selected_layout
auto_selected_layout
forced_layout
forced_layout_applied
route_reason
route_reason_detail
device_class
viewport_width
viewport_height
browser_family
os_family
referrer_domain
entry_source_category
utm_source
utm_medium
utm_campaign
utm_content
page_path
config_version
router_core_version
config_source
safe_fallback_used
tracking_method
```

### Error-only fields

```text
error_message
warning_code
warning_detail
```

### Optional diagnostics fields

These are blank unless router diagnostics are explicitly enabled or debug diagnostics are used:

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

### Removed or disabled by default

```text
hardware_concurrency
device_memory_gb
full languages list
detailed visual viewport offsets
color depth
pixel depth
detailed media preference fields
full raw_json
full page_url with uncontrolled query
full referrer with query string
full user_agent outside diagnostics
```

## Query and referrer handling

- Store only allowlisted UTM parameters.
- Store `page_path`, not full page URL.
- Store `referrer_domain`, not full referrer URL.
- Store `public_entry_page` as a known registry path.
- Image GET fallback stores compact fields only.
- `raw_query_keys` records received parameter names, not arbitrary values.

## Event IDs

`request_id` is created per router page load. `event_id` is created per event. Neither is stored in cookies or localStorage. They are not durable user identifiers.

## Bot and preview handling

Known preview bots and crawlers should be visible in operational data but should not count as visits by default. This protects public traffic numbers from Teams, Outlook, Facebook, LinkedIn, and similar link inspectors.

## Retention

Recommended v1 retention:

- Raw `Events_Raw`: 90 to 180 days.
- `Errors`: 180 days or until incident review is complete.
- Aggregates: 24 months or longer if approved.
- Archive raw rows monthly or quarterly if retention requires keeping them outside the hot workbook.

Run `archiveOldEvents` only after retention has been approved. The function copies old rows to an archive sheet and removes them from `Events_Raw`.

## Public/privacy wording

Suggested internal wording:

> The router records aggregate operational information about public dashboard openings, such as selected mobile or desktop layout, dashboard key, source category, and browser family. It does not use cookies, does not create persistent user identifiers, and does not collect names, emails, kennitölur, raw IP addresses, location, or Power BI report data.

Suggested public wording if needed:

> Mælaborðstenglar kunna að skrá tæknilegar samantektir um opnun mælaborða, til dæmis hvort farsíma- eða borðtölvuútgáfa var valin. Engar kökur eða varanleg notendaauðkenni eru notuð í þessari mælingu.
