# Implementation Status — full Sahl clone at /app/construction/ (LIVE)

## Sahl module set (`src/pages/construction/sahl/`, all inside Sahl shell)
- [x] `ui.tsx` — kit: GreenDialog / WhiteDialog / SahlGrid / FuncKey / SahlField, desktop classes
- [x] `Settings.tsx` — SCR-003 white dialog, pink-red title, company fields (settings.companySettingsGet/Update, MySQL+audit) + currencies/units/warehouses/categories lists
- [x] `Products.tsx` — SCR-004 green dialog (SKU/name/category/barcode/cost/price/unit/reorder) + SCR-006 workspace grid with search; opening stock via adjustmentCreate (auditable movement, never silent)
- [x] `Accounts.tsx` — SCR-005 green customer/supplier cards (sales.customer*/purchase.supplier*) + live statement (invoices+payments, balance due)
- [x] `Txn.tsx` — SCR-007 dense workspace, 5 modes: sales→invoiceCreate, purchase→poCreate+grnCreate (posts stock), sales-return→creditNoteCreate (references invoiceId), purchase-return→adjustmentCreate subtraction (references PO), quotation→quotationCreate (no stock move). F5/F6/F7/F8/F10/F11/F12/Esc, dup-block, print
- [x] `Cash.tsx` — SCR-008 right-aligned white form, red heading; receipts→cashIn, payments→cashOut/expense; balance from ledger
- [x] `Reports.tsx` — daily (todaySummary+day invoices), sales analysis (reports.salesReport), purchase analysis (reports.purchaseReport+poList), valuation (reports.inventoryReport)
- [x] Dashboard retiled 1:1 to Sahl modules; tour ends at sahl/sales
- [x] Routes: 14 × `/app/construction/sahl/*` — all live 200
- [x] Build green, PM2 restarted, logs clean, no DB migration (all existing routers)

## Preserved
Old construction pages/routes untouched (transfers, materials, boq, invoices drawer pages all still live). Backups in /root/backups (code+DBs+App.tsx+index.tsx).

## Honest limits
No pixel-perfect claim vs 360p recording (fonts/subpixel unrecoverable). Cheque/installment/serial ledgers have no backend routers — not invented; purchase-return posts as audited adjustment (documented). Barcodes print via existing invoice print; Excel via existing excelRouter.
