# Leiðbeiningar

Opnaðu root gateway undir `/Landspitali/` og veldu mælaborð, eða farðu beint á `/Landspitali/bradamottaka/` eða `/Landspitali/thjonustukannanir/`.

Routerinn velur mobile eða desktop útgáfu út frá skjáplássi. Sími og þröngur skjár fara venjulega á mobile. Breiður desktop fer á desktop. Spjaldtölva í portrait fer á mobile; spjaldtölva í landscape getur farið á desktop ef skjárinn er nógu breiður.

## Query modes

| Query | Notkun | Telst heimsókn? |
|---|---|---|
| `?debug=1` | Sýnir debug panel og stoppar redirect | Nei |
| `?force=mobile` | Þvingar mobile Power BI URL | Já í normal redirect |
| `?force=desktop` | Þvingar desktop Power BI URL | Já í normal redirect |
| `?view=mobile` | Sama hlutverk og `force=mobile` | Já í normal redirect |
| `?view=desktop` | Sama hlutverk og `force=desktop` | Já í normal redirect |
| `?noredirect=1` | Sýnir manual/debug án redirect | Nei |
| `?manual=1` | Sama og no-redirect mode | Nei |
| `?list=1` | Sýnir directory/list | Nei |
| `?dashboards=1` | Sama og list mode | Nei |
| `?health=1` | Sýnir router health | Nei |
| `?status=1` | Sama og health mode í router | Nei |

Root gateway styður `?dashboard=bradamottaka` og `?id=thjonustukannanir` samkvæmt `allowDashboardQueryOverrideOnRoot = true`. Dashboard router síður eru læstar við sinn dashboard key og leyfa ekki query override.

## Að lesa Mælaborðsmælingar

Rekstrarstig er heilsumat á rekstrarmynd, ekki vinsældamæling. Taldar heimsóknir eru production opens sem standast Talningarhlið. Gateway/root merki sýna flæði að dashboard, en eru ekki heimsóknir. Diagnostic merki, til dæmis Samsung forced-dark possible, eru tæknimerki sem þarf að skoða rólega og staðfesta áður en þau eru kölluð production failure.

Við hagsmunaaðila má segja: Kerfið birtir opinber Power BI mælaborð og mælir aggregate rekstrarmerki til að tryggja rétta leiðingu. Það er ekki persónugreining og debug/test umferð er ekki talin sem notkun.

