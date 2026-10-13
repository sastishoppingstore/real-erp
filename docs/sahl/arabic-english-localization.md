# AR/EN Localization — construction dashboard

- Source: `useLanguage()` provider (`src/providers/language.tsx`); `rtl = language === "ar"`.
- Every tile carries `{ label, labelAr }`; render picks by `rtl`. Data strip, tour steps, table headers all dual-string.
- Verified official terms used: إعداد البرنامج، إدخال الأصناف (إدارة الأصناف), العملاء/الحسابات، فواتير البيع، جرد مخزن، تحويل البضاعة (تحويل مخزن)، المدفوعات والمصروفات (المصروفات)، عرض الأسعار، مرتجع البيع/الشراء، الحركة اليومية، تحليل المبيعات، المقبوضات n/a (receipts live in sub-payments).
- Numbers/dates: `toLocaleString("en-US")` tabular-nums (matches existing app convention); Arabic text renders in Tahoma stack via app CSS.
- No scattered strings: all labels co-located in tile arrays + `TOUR_STEPS` in `index.tsx`.
