# Logic and Decisions

Mobile fallback er safe default vegna þess að mobile Power BI layout er almennt læsilegra á þröngum skjá og fallback/noscript eiga að gefa notanda opnanlega útgáfu jafnvel þegar JavaScript eða config bregst.

Noscript fallback bendir á mobile URL í router HTML. Það ver notendur sem hafa slökkt á JavaScript eða lenda í asset failure.

Usable viewport width skiptir meira máli en device-name guessing. Source notar visual/layout viewport, orientation, touch/pointer/hover og route policy. Device inference er diagnostic og á ekki að vera persónu- eða model-auðkenning.

Tablet portrait er mobile vegna readability. Tablet landscape getur verið desktop þegar usable viewport nær desktop-capable zone. Narrow desktop getur farið á mobile ef viewport er undir policy mörkum.

Root gateway/card events eru aðskilin frá counted dashboard visits vegna þess að root view/click sýna funnel, ekki að Power BI dashboard hafi opnast.

Debug, bot, diagnostic, health, list, manual og test events eru ekki production visits. Þau eru gagnleg til rekstrar en mega ekki hækka notkun.

Tracking er fire-and-forget vegna þess að notandinn á ekki að bíða eftir Apps Script. Router sendir merki og redirect heldur áfram.

Transport order er `sendBeacon`, `fetchKeepalive`, `imageGet`. `sendBeacon` er hentugt fyrir litlar asynchronous POST sendingar; `fetch keepalive` er varaleið fyrir navigation-safe POST; `imageGet` er síðasta fallback þegar POST er ekki tiltækt eða queue tekst ekki.

iOS Safari fékk sérstaka athygli vegna þess að löng `imageGet` URL fyrir redirect getur verið óáreiðanleg. First-production hardening setur POST transports á undan GET fallback.

Diagnostic enrichment er optional. Það getur safnað UA-CH og evidence í debug/noRedirect/diagnostics án þess að teljast heimsókn.

Public status data er aðeins samantektargögn til að minnka privacy áhættu og gera Mælaborðsmælingar birtingarhæfar.

Power BI viewer compatibility risk er ekki sönnun um router failure. Router getur valið rétta slóð en app.powerbi.com getur samt verið óáreiðanlegt á óstuddum Smart TV, WebView eða gömlum vafra.

Rekstrarstig er penalty-based en ekki traffic-volume-based. Meiri umferð hækkar ekki stig sjálfkrafa; staðfestar viðvaranir, fallback/errors, veik merki og gömul gögn lækka það.
