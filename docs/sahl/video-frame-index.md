# Video Frame Index — PROVISIONAL (video file NOT accessible)

> **Explicit statement per build spec §12:** no video file (`برنامج_سهل___جولة_سريعة_لاستخدام_سهل(360p).mp4`)
> exists in this workspace (checked: no `.mp4`, no screenshots, no link supplied in the request).
> Frame extraction was therefore IMPOSSIBLE. The table below is derived from the written time map
> in the master prompt + official learn-topic catalog (verified via getsahl.com research, Oct 2026),
> at 2-second granularity for the stated 16:17 duration. Every row is marked PROVISIONAL.
> If the video is supplied later, replace this file with a real frame-by-frame index.

| Timestamp | Provisional screen/state (from time map) | Implementation route |
|---|---|---|
| 00:00–00:07 | Blue blurred intro, green logo, Arabic welcome | Reference only — no forced splash (spec §2: do not force long splash) |
| 00:08–00:27 | Green-and-white login over dark bubble bg | Main app `/login` (existing, kept) |
| 00:28–01:39 | Dark dashboard, colorful tile grid, Sahl brand strip | `/app/construction` (rewritten SCR-002) |
| 01:32–01:40 | Intro card “أقسام البرنامج الرئيسية” | Dashboard section grouping + guided tour overlay |
| 03:20–05:48 | White settings screen, blue/red dialogs | `/app/construction/sahl/settings` (SCR-003) |
| 05:48–06:00 | Intro card “إدخال الأصناف” + dashboard | `/app/construction/sahl/products` |
| 06:40–07:20 | Bright green product-entry form | Products GreenDialog (SCR-004) |
| 08:00–08:20 | Account/customer form + list/dialog | `/app/construction/sahl/accounts` (SCR-005) |
| 09:20–09:34 | Intro card “إدخال العملاء والموردين” | Accounts module section |
| 09:56–10:20 | Bright green multi-field form | Account GreenDialog + opening balance |
| 11:00–11:34 | Intro card “تسجيل فاتورة بيع” | `/app/construction/sahl/sales` |
| 11:38–13:26 | White invoice workspace, green headers, yellow total box, line grid, gray panel, right toolbar, F-key bar | SahlTxn sales mode (SCR-007) |
| 13:26–13:40 | Sparse right-aligned white form + list | Cash/receipt voucher (SCR-008) |
| 13:46–13:54 | Intro card “تسجيل مصروف للمشروع” | `/app/construction/sahl/cash` expense |
| 13:56–14:20 | Dashboard + sparse data-entry screen | Dashboard + cash form |
| 15:10–16:17 | White form, green top border, small colored icons | Reports/settings remaining; end of recording |

Two-second rows between landmarks repeat the enclosing screen-state (allowed per spec §2.5).
Research verification: 33 learn-topic videos mapped (see screen-inventory.md); F8=delete is the ONLY
source-confirmed function key (v16.98 sales video transcript 9:21–9:36).
