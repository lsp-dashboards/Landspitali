# Known Issues and Limits

## Production v1 alignment

Fyrri source misræmi var lagað í production v1: status path er `status-dashboard/`, generated asset process er `tools/generate-router-assets.ps1`, Apps Script registry snapshot og router config nota sömu config útgáfu, og versioned assets eru til.

## Technical limits

Device detection er inference. UA reduction og UA-CH availability breytist milli vafra. iOS/iPad desktop mode, Android tablet og Windows touch hybrid eru ambiguous.

Smart TV/console compatibility er óviss. Power BI publish-to-web browser support er external dependency.

Dark mode/forced dark detection er diagnostic. Samsung Internet getur breytt birtingu án þess að reliable browser signal sé til.

Apps Script/Sheets hafa kvóta, runtime og storage limits. Source notar 45,000 character cell budget og chunked JSON til að minnka áhættu. Cache getur verið stale í 300 sekúndur eða skilað engu samkvæmt CacheService eðli.

Link previews og bots geta birst í raw rows en eru ekki counted visits. Smá sample size getur skekkt prósentur. Referrer/UTM geta vantað. Network blockers, corporate browser policies, blocked JavaScript og noscript takmarka telemetry og routing.
