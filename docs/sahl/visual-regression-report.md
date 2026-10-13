# Visual Regression Report — /app/construction/ @640×342

Deployed commit: dashboard rewrite (254-line `index.tsx`), build 43s green, `erp-backend` online, live 200.

| Check | Result |
|---|---|
| Black full-bleed bg, flat squares | ✓ `bg-black`, inline flat hex, no rounded/shadow classes |
| 5 green top + 168px brand block side-by-side | ✓ flex + `repeat(5,minmax(88px,1fr))` |
| 2 navy + 4 blue second row | ✓ `repeat(6,minmax(88px,1fr))` |
| Uneven txn grid 2/1/2/2 | ✓ explicit `2fr 1fr 2fr 2fr` |
| 6-tile bottom row | ✓ |
| White line icons + AR bold + EN sub | ✓ lucide `strokeWidth 1.4`, 30px |
| RTL (brand right) / LTR mirror | ✓ dir inherited from shell |
| Real data only (KPIs, bars, recents) | ✓ tRPC, no mock numbers |
| Tour overlay | ✓ 5 steps, Back/Next/CTA |
| Keyboard/focus | ✓ native buttons + focus-visible outline |

Not claimed: exact pixel parity with the 360p recording (font metrics, subpixel gaps unrecoverable). Bundle verified: `Stocktaking` present in shipped chunk `index-CfpURjlR.js`. Old file backed up at `/root/backups/construction_index_bak_20261013.tsx`.
