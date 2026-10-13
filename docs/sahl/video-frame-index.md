# Video Frame Index — FRAME-VERIFIED (video supplied 2026-10-13)

Source: `/tmp/sahl-tour.mp4` on VPS (also at Desktop *.mp4, 22,330,699 bytes).
Verified: 640×342, 24fps, 977.42s = 16:17. Contact sheets at 2s sampling
(`login,dash,settings,products,accounts,sales,expense,end`) + full-res closeups
(dash60, inv700 + right/bottom zooms, set250, prod400, acc500, login20, exp815)
reviewed as images. Browser (getsahl.com/learn) interstitials skipped as non-app.

| Time | Frame-verified screen | Implementation |
|---|---|---|
| 00:00–00:07 | Blue bokeh intro, green cart logo, سهل, برنامج سهل لإدارة الأعمال, أهلا بكم في عالم سهل | Reference styling in login/splash contexts |
| 00:08–00:27 | Dark bokeh login: green header أهلا وسهلا, user dropdown, password, lock دخول النظام, green footer (backup/…/exit) | Main app login (existing); construction requires session |
| 00:28–01:39 | Dashboard (VERIFIED EXACT): white menu strip; 5 green tiles تقارير/الفواتير/الخزينة/الحسابات/البضاعة + brand block + cart logo; navy تحليل المبيعات/الحركة اليومية; blue إدخال الحسابات/إدخال الأصناف/إعداد البرنامج/جولة سريعة; wide teal جرد مخزن; coral صرف (hand-coin); wide red-orange شراء (cart); green بيع (SALE bag); تسوية مخزن (sliders); تحويل لمخزن (truck); قبض (money bag); burgundy مرتجع شراء; عرض أسعار (calculator); مرتجع بيع; red الدعم الفني + 5 theme swatches; hover tooltip اختر نوع المستند | `/app/construction` rewritten 1:1 (labels/icons/geometry/support/swatches/title attr) |
| 01:32–01:40 | Intro card أقسام البرنامج الرئيسية | Tour overlay step 1 |
| 03:20–05:48 | Settings (VERIFIED): white dialog, إغلاق top-left, pink إعداد البرنامج + المبيعات/الفروع/المخازن; left المشروع/project, 3 contact fields, 3 price-name fields, خيارات checkboxes, إعدادات متقدمة; right المخازن/الفروع, الوحدات/العملات, مستخدمو البرنامج each with جديد/تعديل/حذف | `sahl/settings` — company fields, 4 lists, display prefs; price NAMES live in Prices module |
| 06:40–07:20 | Product form (VERIFIED): green dialog, البضاعة + tabs; اسم الصنف wide; بيانات إضافية (barcode…); حد الطلب; checkboxes incl Serial Number; وحدات الصنف table + أضف/تعديل/حذف; الكمية الافتتاحية بالمخازن table (blue selection); خروج/حفظ+جديد/حفظ | `sahl/products` — units CRUD (new sahl_product_units), serial/tax/active flags, opening via adjustment |
| 09:56–10:20 | Account form (VERIFIED): green dialog الحسابات; اسم الحساب; عميل/مورد radios; رصيد سابق مدين/دائن + التاريخ; بيانات إضافية (هاتف/موبايل/…/عنوان/ملاحظات); checkbox; خروج/حفظ+جديد/حفظ | `sahl/accounts` — Dr/Cr toggle, opening date, deactivate (no hard delete) |
| 11:38–13:26 | Sales workspace (VERIFIED EXACT): green doc-box + date + YELLOW total top-left; customer/warehouse row; right panel (logo, بيع mode, Q/K/«/», big blue ✓ حفظ\|طباعة\|جديد F12, طباعة الفاتورة checkbox, F5 تعديل الكمية, F6 تعديل السعر, F8 حذف الصنف, F7 خيارات أخرى); green grid header (رقم/اسم الصنف/المتاح/الوحدة/الكمية/السعر/الإجمالي/الخصم); gray note panel; green footer (warehouse/price/tax/discount inputs); dark strip (إغلاق, قائمة الأصناف, شاشة الباركود, تعديل الأسعار, حذف الفاتورة, جديد F10, Excel, طباعة F11, حفظ F9) | `sahl/sales` rebuilt 1:1 — verified F-key map, view mode (« » + delete w/ guards), tax %, salesman→notes, Excel CSV export, item-list modal |
| 13:26–13:54 | Expense صرف (VERIFIED): red heading, right-aligned المبلغ/الحساب/بند المصروف/…/المشروع/العملة/التاريخ/الوقت; خروج/حفظ+جديد/حفظ + طباعة checkbox | `sahl/cash` — account ref, project→notes, print checkbox, server-date note |
| 15:10–16:17 | Green-top-border white forms + colored icons (reports/settings tails) | Reports/settings modules |

All 2s intervals within these ranges repeat the enclosing verified state.
Remaining inference (not pixel-read): exact tiny label glyphs beyond the verified list; keep configurable.
