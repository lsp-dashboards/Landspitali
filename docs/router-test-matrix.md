# Router test matrix

| test | url | expected_layout | expected_event_type | expected_count_as_visit | expected_dashboard_key | expected_entry_source_category | expected_utm_fields | expected_warning | expected_user_behavior |
|---|---|---|---|---|---|---|---|---|---|
| island.is public click phone | /bradamottaka/?utm_source=island.is&utm_medium=public_dashboard_card&utm_campaign=landspitali_maelabord&utm_content=bradamottakan_fossvogi | mobile | router_redirect | true | bradamottaka | island_is_public | all island.is UTM fields present | none | Redirects to mobile Power BI |
| island.is public click desktop | /bradamottaka/?utm_source=island.is&utm_medium=public_dashboard_card&utm_campaign=landspitali_maelabord&utm_content=bradamottakan_fossvogi | desktop | router_redirect | true | bradamottaka | island_is_public | all island.is UTM fields present | none | Redirects to desktop Power BI |
| direct router visit | /bradamottaka/ | auto | router_redirect | true | bradamottaka | direct | blank UTM | none | Redirects based on device |
| QR campaign | /bradamottaka/?utm_source=qr&utm_medium=poster&utm_campaign=waiting_room&utm_content=bradamottakan_fossvogi | auto | router_redirect | true | bradamottaka | qr_code | qr/poster fields | none | Redirects based on device |
| Teams internal user link | /bradamottaka/?utm_source=teams&utm_medium=internal_share&utm_campaign=staff&utm_content=bradamottakan_fossvogi | auto | router_redirect | true | bradamottaka | internal_teams | teams/internal fields | none | Redirects for real user |
| Teams preview bot | same URL with SkypeUriPreview or TeamsExternalLinkPreview UA | desktop | router_redirect or diagnostic | false | bradamottaka | link_preview_bot | teams/internal fields | bot not counted | Does not inflate visits |
| Outlook preview | URL shared through Outlook preview UA | desktop | router_redirect or diagnostic | false | bradamottaka | link_preview_bot | email/outlook fields if present | bot not counted | Does not inflate visits |
| Facebook preview | URL inspected by facebookexternalhit | desktop | router_redirect or diagnostic | false | bradamottaka | link_preview_bot | source from UA/referrer | bot not counted | Does not inflate visits |
| LinkedIn preview | URL inspected by LinkedInBot | desktop | router_redirect or diagnostic | false | bradamottaka | link_preview_bot | source from UA/referrer | bot not counted | Does not inflate visits |
| iPhone Safari | /bradamottaka/ | mobile | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects mobile |
| Android Chrome | /bradamottaka/ | mobile | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects mobile |
| Samsung Internet | /bradamottaka/ | mobile | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects mobile |
| Edge desktop | /bradamottaka/ | desktop | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects desktop |
| Chrome desktop | /bradamottaka/ | desktop | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects desktop |
| Firefox desktop | /bradamottaka/ | desktop | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects desktop |
| Safari desktop | /bradamottaka/ | desktop | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects desktop |
| narrow desktop below breakpoint | /bradamottaka/ at 700px viewport | mobile | router_redirect | true | bradamottaka | direct or referrer | as provided | route_reason=narrow_viewport | Redirects mobile |
| desktop above breakpoint | /bradamottaka/ at 1200px viewport | desktop | router_redirect | true | bradamottaka | direct or referrer | as provided | none | Redirects desktop |
| tablet portrait | /bradamottaka/ | mobile | router_redirect | true | bradamottaka | direct or referrer | as provided | route_reason=tablet_portrait | Redirects mobile |
| tablet landscape | /bradamottaka/ | desktop | router_redirect | true | bradamottaka | direct or referrer | as provided | route_reason=tablet_landscape | Redirects desktop |
| debug | /bradamottaka/?debug=1 | auto shown | router_debug_view | false | bradamottaka | direct | debug flag | debug not counted | No redirect, debug visible |
| force mobile debug | /bradamottaka/?force=mobile&debug=1 | mobile | router_debug_view | false | bradamottaka | direct | force=mobile/debug | debug not counted | No redirect |
| force desktop debug | /bradamottaka/?force=desktop&debug=1 | desktop | router_debug_view | false | bradamottaka | direct | force=desktop/debug | debug not counted | No redirect |
| force mobile real | /bradamottaka/?force=mobile | mobile | router_redirect | true | bradamottaka | direct | force=mobile | forced_layout_applied=true | Redirects mobile |
| force desktop real | /bradamottaka/?force=desktop | desktop | router_redirect | true | bradamottaka | direct | force=desktop | forced_layout_applied=true | Redirects desktop |
| manual no redirect | /bradamottaka/?noredirect=1 | auto shown | router_manual_view | false | bradamottaka | direct | noredirect=1 | manual not counted | Manual links shown |
| health mode | /bradamottaka/?health=1 | none | router_health_view | false | bradamottaka | direct | health=1 | health not counted | Health panel shown |
| directory mode | /?list=1 | none | router_directory_view optional | false |  | direct | list=1 | directory not counted | Directory shown |
| no JavaScript | /bradamottaka/ with JS disabled | mobile | router_noscript if fallback image is configured otherwise none | true or none | bradamottaka | limited | none | none | Noscript meta refresh to mobile |
| blocked tracking endpoint | /bradamottaka/ with endpoint blocked | auto | none or failed | n/a | bradamottaka | n/a | n/a | tracking warning only | User still redirects |
| Apps Script error | /bradamottaka/ while Apps Script throws | auto | attempted | n/a | bradamottaka | as provided | as provided | collector error | User still redirects |
| central config unavailable | /bradamottaka/ with router-config blocked | auto via embedded | router_redirect | true | bradamottaka | as provided | as provided | config_source=embedded-bootstrap | Redirects using embedded config |
| router-core unavailable | /bradamottaka/ with core blocked | mobile fallback | none | n/a | bradamottaka | n/a | n/a | core-load fallback | Emergency redirect to mobile |
| malformed config | /bradamottaka/ with broken config object | auto via embedded | router_redirect + possible router_error | true | bradamottaka | as provided | as provided | embedded fallback warning | Redirects safely |
| disabled dashboard | /bradamottaka/ after status=disabled | none or maintenance | router_maintenance_view | false | bradamottaka | as provided | as provided | maintenance warning | Maintenance view, no normal redirect |
| maintenance mode | /bradamottaka/ after status=maintenance | none or maintenance URL | router_maintenance_view | false | bradamottaka | as provided | as provided | maintenance warning | Maintenance view |
| invalid dashboard key root | /?dashboard=bad&debug=1 | none | router_error | false |  | direct | dashboard=bad | dashboard_not_found | Error/list view |
| dashboard alias root | /?dashboard=brada | auto | router_redirect | true | bradamottaka | direct | dashboard=brada | none | Alias resolves |
| dashboard override locked | /bradamottaka/?dashboard=thjonustukannanir&debug=1 | bradamottaka auto | router_debug_view | false | bradamottaka | direct | override ignored | lockDashboard enforced | Shows Bráðamóttaka decision |
| duplicate event | same event_id submitted twice | n/a | second raw duplicate | false on duplicate aggregate | same | same | same | duplicate_event=true | Aggregate counts once |
| high traffic burst | load test with many GET/POST events | auto | router_redirect | true where valid | mixed | mixed | mixed | lock/quota watch | Users still redirect |
| fallback click | Click visible fallback button in manual/debug scenario | selected target | fallback_click | false | bradamottaka | as provided | as provided | fallback panel shows count | Opens selected Power BI |
| old Edge IE mode | IE/Trident UA if available | auto | router_redirect | true | bradamottaka | as provided | as provided | IE mode fallback | Attempts microsoft-edge protocol |
