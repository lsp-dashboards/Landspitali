# Product Guide

**Landspítali Power BI Router Tracker and Mælaborðsmælingar** er opinber leiðingar- og rekstrarmælingaþjónusta fyrir Power BI mælaborð Landspítala.

> Þetta er leiðing og rekstrarmæling fyrir opinber Power BI mælaborð Landspítala. Kerfið velur rétta mobile/desktop birtingu eftir skjáplássi og birtir aggregate rekstrarmerki. Það er ekki persónugreining.

## Af hverju kerfið er til

Power BI publish-to-web skýrslur hafa aðskildar mobile og desktop útgáfur. Opinberir notendur koma frá island.is kortum, root gateway eða beinum slóðum. Routerinn gefur Landspítala stöðuga opinbera slóð og velur útgáfu eftir raunverulegu skjáplássi, orientation og route policy.

Trackerinn safnar rekstrarmerkjum um leiðingu, ekki persónugreiningu. Mælaborðsmælingar birta aðeins samantektargögn stöðu: taldar heimsóknir, mobile/desktop skiptingu, uppruna, Leiðingarskipting, tæknimerki, confidence bands, viðvaranir, cache/freshness og rekstrarstig.

## Opinber notendaleið

1. Notandi sér public dashboard card á `https://island.is/s/landspitali/maelabord`.
2. Kortið opnar GitHub Pages route undir `/Landspitali/<dashboard>/`.
3. Router les config, viewport, query overrides og route policy.
4. Router velur mobile eða desktop Power BI publish-to-web slóð.
5. Tracker sendir fire-and-forget aggregate rekstrarmerki.
6. Routing bíður ekki eftir tracking og sendir notanda áfram í Power BI.

## Hvað Mælaborðsmælingar mæla

- Taldar dashboard opnanir (`count_as_visit = TRUE`) eftir Talningarhlið.
- Mobile/desktop leiðingu.
- Root gateway views og root dashboard clicks, aðskilin frá heimsóknum.
- Source/UTM merki eins og `island_is_public`, `root_index`, `direct` og internal/referrer flokka.
- Device/browser/display/input/performance merki.
- Confidence bands og weak/unknown signal share.
- Confirmed warnings og diagnostic signals.
- Power BI viewer compatibility risk.
- Cache og freshness.

## Hvað þær mæla ekki

Kerfið mælir ekki nöfn, netföng, kennitölur, raw IP tölur eða persónuauðkenni. Það greinir ekki nákvæma device identity og fullyrðir ekki exact device model. Event ID og request ID eru per event/page load, ekki persistent identity.

Debug, root, bot, diagnostic, manual, test, list og health línur eru ekki production visits.

## Núverandi public dashboards

| Dashboard | Key | ID | Path | Public card | Staða |
|---|---|---|---|---|---|
| Bráðamóttaka í Fossvogi | `bradamottaka` | `bradamottaka-fossvogi` | `bradamottaka` | Bráðamóttaka í Fossvogi | active/published |
| Þjónustukannanir ríkisstofnana | `thjonustukannanir` | `thjonustukannanir-rikisstofnana` | `thjonustukannanir` | Þjónustukannanir | active/published |

### `bradamottaka`

Display name er Bráðamóttaka í Fossvogi. Public card description er „Yfirlit yfir stöðu og þróun á bráðamóttöku“. Icon role er public card/dashboard thumbnail frá `images.ctfassets.net`. Desktop URL role er desktop Power BI publish-to-web report. Mobile URL role er mobile Power BI publish-to-web report. Fallback mobile URL og noscript URL benda á mobile URL. Route policy: phone/large phone/tablet portrait/narrow viewport/narrow desktop => mobile; tablet landscape/small desktop/desktop/bot => desktop. Governance í config: ownerTeam Landspítali, technicalOwner Landspítali mælaborð / vefumsjón, contentOwner Landspítali, created/reviewed `2026-06-07`, next review `2026-09-07`.

### `thjonustukannanir`

Display name er Þjónustukannanir ríkisstofnana. Public card description er „Niðurstöður þjónustukannana ríkisstofnana hjá Landspítala“. Icon role er public card/dashboard thumbnail frá `images.ctfassets.net`. Desktop URL role er desktop Power BI publish-to-web report. Mobile URL role er mobile Power BI publish-to-web report. Fallback mobile URL og noscript URL benda á mobile URL. Route policy er sú sama og hjá Bráðamóttöku. Governance í config: ownerTeam Landspítali, technicalOwner Landspítali mælaborð / vefumsjón, contentOwner Landspítali, created/reviewed `2026-06-07`, next review `2026-09-07`.

Fyrstu tvö public dashboards hafa source-studdan launch timestamp: `14.06.2026 00:57 Atlantic/Reykjavik`. Fyrir framtíðarmælaborð skal skrá raunverulegan birtingartíma þegar það er birt.
