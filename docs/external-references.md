# External References

Notaðar skulu official sources fyrir platform constraints.

| Efni | Official reference | Af hverju skiptir máli |
|---|---|---|
| Power BI/Fabric supported browsers | [Microsoft Learn: Supported Browsers for Power BI and Fabric](https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-browsers) | Apps Script warning logic flokkar Edge 120+, Chrome newer than 94, Safari 16.4+, Firefox newer than 93 og iOS 10 eða eldri risk samkvæmt þessari línu. |
| Power BI publish-to-web | [Microsoft Learn: Publish to web from Power BI](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web) | Public publish-to-web reports require public-data governance: no authentication, public access, and underlying model-detail exposure risk. |
| Apps Script quotas | [Google Developers: Quotas for Google Services](https://developers.google.com/apps-script/guides/services/quotas) | Tracker keyrir í Apps Script og þarf að virða runtime/quota limits. |
| Apps Script Web Apps | [Google Developers: Web Apps](https://developers.google.com/apps-script/guides/web) | `doGet(e)` og `doPost(e)` deployment model. |
| Apps Script ContentService | [Google Developers: Content Service](https://developers.google.com/apps-script/guides/content) | JSON/JSONP output frá endpointi. |
| Apps Script CacheService | [Google Developers: CacheService](https://developers.google.com/apps-script/reference/cache/cache-service) og [Cache class](https://developers.google.com/apps-script/reference/cache/cache) | Cache getur skilað `null`; item/key limits skipta máli fyrir dashboard payload og dedupe. |
| Apps Script LockService | [Google Developers: LockService](https://developers.google.com/apps-script/reference/lock/lock-service) | `appendEvent_` notar script lock til að verja concurrent raw row append. |
| Google Sheets API limits | [Google Developers: Sheets API usage limits](https://developers.google.com/workspace/sheets/api/limits) | Viðmið fyrir Sheets API quota ef automation notar API. Apps Script Spreadsheet service limits þarf að staðfesta handvirkt ef rekstur vex. |
| GitHub Mermaid | [GitHub Docs: Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) | Skjölin nota Mermaid diagrams í fenced code blocks. |
| `navigator.sendBeacon` | [MDN: Navigator.sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) | Fyrsta tracking transport. |
| `fetch` keepalive | [MDN: Request.keepalive](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive) | Annað tracking transport. |
| Page lifecycle | [MDN: visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event), [MDN: pagehide](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event), [MDN: unload](https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event), [MDN: beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) | Tracking má ekki reiða sig á unreliable unload/beforeunload behavior, sérstaklega á mobile. |
| Browser and feature detection | [MDN: Browser detection using the user agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent), [MDN: Feature detection](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection) | Route policy á að byggja á viewport/feature signals frekar en fragile UA guesses. |
| UA Client Hints | [MDN: User-Agent Client Hints API](https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API), [MDN: getHighEntropyValues](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues) | Low-entropy UA-CH má nota aggregate; high-entropy hints eru diagnostic-only og mega ekki tefja normal redirect. |
| User-Agent reduction | [Privacy Sandbox: User-Agent reduction](https://privacysandbox.google.com/protections/user-agent) | UA reduction minnkar passive fingerprinting surface; router má ekki treysta á full UA model details. |
| `matchMedia` | [MDN: Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) | Theme/input/display media queries. |
| `VisualViewport` | [MDN: VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) | Router notar visual viewport þegar það er til staðar. |
| WCAG 2.2 | [W3C: Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) | Mælaborðsmælingar og router fallback UI eiga að vera perceivable, operable, understandable og robust. |
| Core Web Vitals | [web.dev: Web Vitals](https://web.dev/articles/vitals) | Router pages eiga að halda LCP/INP/CLS léttum; status dashboard má vera þyngra en þarf stable layout og no overlap. |

Verified for first-production hardening on 2026-06-15.
