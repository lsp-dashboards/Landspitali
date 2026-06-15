# Glossary

| Hugtak | Skýring |
|---|---|
| Mælaborð | Power BI dashboard/report sem birt er opinberlega. |
| Mælaborðsmælingar | Status dashboard fyrir aggregate rekstrarmerki. |
| Router | Static HTML/JS síða sem velur mobile/desktop Power BI URL. |
| Root gateway | `/Landspitali/` síða með public dashboard cards. |
| Public card | Kort á root eða island.is sem opnar dashboard route. |
| Publish-to-web | Power BI opinber birtingarslóð á `app.powerbi.com/view`. |
| Mobile layout | Mobile Power BI publish URL. |
| Desktop layout | Desktop Power BI publish URL. |
| Fallback | Örugg varaleið ef auto redirect/URL validation bregst. |
| Noscript | Fallback þegar JavaScript er óvirkt. |
| Debug | Query mode sem sýnir routing info og telur ekki visit. |
| Manual/no redirect | Mode sem stoppar redirect og sýnir manual links. |
| Health mode | Router/API health check, ekki visit. |
| Directory/list mode | Listi yfir registered dashboards, ekki visit. |
| Production visit | Raunveruleg dashboard opnun sem stenst Talningarhlið. |
| Counted visit | Event með `count_as_visit = TRUE` sem er ekki útilokað. |
| Raw event | Internal row í `Events_Raw`. |
| Diagnostic event | Debug/diagnostic/non-visit event. |
| Gateway signal | Root view/click/router arrival merki. |
| Bot/link preview | Crawler eða preview sem er útilokað frá visits. |
| Confidence band | Gæðaflokkur inference eða aggregate merkja. |
| Rekstrarstig | Penalty-based operational health score 0-100. |
| Gæðaviðvörun | Warning/diagnostic quality signal. |
| Confirmed warning | Warning með production eða aggregate confirmation. |
| Diagnostic signal | Óstaðfest/info tæknimerki. |
| Apps Script | Google Apps Script Web App tracker. |
| Google Sheets aggregate | Samantektarblöð sem status payload byggir á. |
| JSONP | JavaScript callback wrapper til að hlaða cross-origin data. |
| Cache | Tímabundin geymsla í Apps Script CacheService. |
| Chunked JSON | JSON payload skipt í marga `Dashboard_Data` chunks. |
| UA | User-Agent string. |
| UA-CH | User-Agent Client Hints. |
| Viewport | Notanlegt browser skjápláss. |
| Visual viewport | Raunverulegt sýnilegt viewport, t.d. við zoom. |
| Breakpoint | Skjábreiddarmörk route policy. |
| In-app browser | Vafri inni í Teams/Outlook/Facebook o.s.frv. |
| WebView | Embedded browser view, ekki fullur standalone vafri. |
| Smart TV compatibility risk | Tæknimerki um að Power BI viewer sé líklega óstuddur/óáreiðanlegur á TV browser. |

