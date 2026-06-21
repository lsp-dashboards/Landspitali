# Operational Limits

## Platform Limits

Power BI publish-to-web support depends on Microsoft/Fabric viewer behavior, browser support, network policy and embedded-viewer availability. Smart TV, console, WebView and kiosk contexts can be compatibility-limited even when routing is correct.

Google Apps Script and Sheets have quota, runtime and storage ceilings. The tracker uses chunked JSON, a 45,000 character cell budget and a 300 second dashboard cache to keep public status reads stable.

## Routing Limits

Device detection is inference. Viewport width, orientation, touch/pointer signals, UA/UA-CH availability and browser policies can disagree. The production policy routes for usable dashboard layout, not device prestige.

Mobile is the safe fallback when target URL validation fails. Tablet portrait is mobile; tablet landscape and small desktop contexts can be desktop according to route policy.

## Telemetry Limits

No cookies, localStorage identifiers, raw IP addresses, names, emails or Power BI internal data are published. Public endpoints expose only aggregate/status data.

Link previews and bots can appear in raw internal rows but are not counted visits. Debug, root, diagnostic, manual, list, health and test rows stay outside production counts.

Small sample sizes can make percentages swing. Missing referrer/UTM data is expected in some browser and privacy contexts.

## Interpretation Limits

Dark-mode and forced-color signals are diagnostic unless production evidence confirms a user-facing issue. Browser compatibility warnings should be read beside counted usage, route/source evidence and dashboard freshness.

Mælaborðsmælingar is an operational view, not a personally identifiable analytics product.
