# Uncertainties — what could NOT be verified and how resolved

1. **Video frames (critical): no video file, no screenshots, no link supplied.** Resolved with
   written time-map + getsahl.com + YouTube research. `video-frame-index.md` is PROVISIONAL.
2. **Function keys: ONLY F8 (delete line) is source-confirmed** (v16.98 sales video 9:21–9:36).
   F5/F6/F7/F10/F11/F12 in Txn are CONVENTIONAL DEFAULTS, kept working + labeled, configurable.
   Documented here, not claimed as verified.
3. **Field-level schemas** (invoice header/line columns, settings options, voucher fields): site text
   has none; YouTube transcripts gave partial lists (product: name/code/category/warehouse-qty/cost/unit+factor/inactive; account: name/type/opening-debit-credit/code/category/mobile/email/address).
   Implemented superset via existing backend; extra fields are real persistence, not mock.
4. **Tiny tile labels** (coral tile, cutting tile): kept by position/function (المصروفات; materials op
   mapped to quotations vault in final tiling — see dashboard-layout.md).
5. **Colors/fonts/subpixel**: flat hex approximations, Tahoma stack; no pixel-parity claim.
6. **Cheque/installment/serial state machines**: titles verified; field details inferred from existing
   backend tables (installments*) or new minimal tables (sahl_cheques); serial tracking NOT built
   (no backend model) — marked MISSING, not faked.
7. **Posting atomicity**: new sahl.transferAtomic is transactional; legacy sales invoiceCreate is
   non-atomic (pre-existing, untouched to avoid regression) — documented limitation.
8. **Server-side totals**: legacy invoiceCreate trusts client totals (pre-existing); new sahl
   procedures validate quantities/dates; full recompute not retrofitted — documented.
9. **Price lists**: official "3 renameable lists" implemented as sahl_price_lists seeded per tenant.
10. **Print templates**: Excel-redesign workflow maps to existing invoiceTheme (DB themes) +
    excelRouter export; in-app visual designer NOT built — documented.
11. **Brand identity**: design is Sahl-inspired; product name/logo are tenant's (company settings),
    per owner instruction. Not affiliated with the official vendor.
