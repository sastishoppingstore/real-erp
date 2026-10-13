# Screen Inventory — Sahl clone at /app/construction/

Shell: `ConstructionLayout.tsx` — title bar (YASCO ERP || المقاولات || user), white menu strip
(Goods/Accounts/Treasury/Invoices/Reports/Warehouse), hamburger drawer (native scroll, all sections),
green New-Invoice button, status bar (clock/date/user). Kept, not rewritten.

| Screen | Route | File | Backend (tRPC/MySQL) |
|---|---|---|---|
| Dashboard SCR-002 | `/app/construction` | `construction/index.tsx` | construction.*, constructionInvoices.*, settings.companySettingsGet (brand) |
| Tour overlay | (in dashboard) | index.tsx | — (5 steps, ends at sahl/sales) |
| Settings SCR-003 | `sahl/settings` | `sahl/Settings.tsx` | settings.companySettingsGet/Update, currency*, inventory.unitList/warehouse*/category* |
| Products SCR-004/006 | `sahl/products` | `sahl/Products.tsx` | inventory.product*/category*/unit*/warehouse*/inventory*/movement*, adjustmentCreate (opening) |
| Accounts SCR-005 | `sahl/accounts` | `sahl/Accounts.tsx` | sales.customer*, purchase.supplier*, invoiceList+paymentList (statement) |
| Sales SCR-007 | `sahl/sales` | `sahl/Txn.tsx` | sales.invoiceCreate/customerList, inventory.productList, sahl.priceListList/priceFor |
| Purchase | `sahl/purchase` | Txn | purchase.poCreate/grnCreate/supplierList |
| Sales return | `sahl/sales-return` | Txn | sales.creditNoteCreate (orig invoiceId) |
| Purchase return | `sahl/purchase-return` | Txn | inventory.adjustmentCreate subtraction (PO referenced) |
| Quotation | `sahl/quotation` | Txn | sales.quotationCreate + sahl.reservation* |
| Cash/expense SCR-008 | `sahl/cash` | `sahl/Cash.tsx` | cashbox.cashIn/cashOut/addExpense/currentBalance/todaySummary/transactionList |
| Receipts | `sahl/receipts` | Cash | cashbox.cashIn |
| Daily report | `sahl/reports/daily` | `sahl/Reports.tsx` | cashbox.todaySummary + sales.invoiceList |
| Sales analysis | `sahl/reports/sales` | Reports | reports.salesReport |
| Purchase analysis | `sahl/reports/purchase` | Reports | reports.purchaseReport + purchase.poList |
| Valuation | `sahl/reports/stock` | Reports | reports.inventoryReport |
| Salesmen | `sahl/salesmen` | `sahl/People.tsx` | sahl.salesman* (new tables) |
| Users | `sahl/users` | People | sahl.user* admin-only (scrypt, matches passwordLogin) |
| Prices | `sahl/prices` | `sahl/Prices.tsx` | sahl.priceList*/priceSet/priceBulk |
| Stocktake | `sahl/vault/stocktake` | `sahl/Vault.tsx` | inventory.adjustmentList/Create (count, variance audited) |
| Transfer | `sahl/vault/transfer` | Vault | sahl.transferAtomic (NEW: validated, movement rows) |
| Item moves | `sahl/vault/moves` | Vault | inventory.movementList |
| Archive | `sahl/vault/archive` | Vault | sahl.archiveSearch (number/customer/memo/date) |
| Cheques | `sahl/vault/cheques` | Vault | sahl.cheque* (register/collect/return) |
| Installments | `sahl/vault/inst` | Vault | installments.list/create/recordPayment/overdue/get |
| Barcode labels | `sahl/vault/labels` | Vault | sahl.labelData + print layout |
| Print themes | `sahl/vault/prints` | Vault | invoiceTheme.list/setDefault (+excelRouter export) |

Unchanged legacy modules still live: transfers, materials, boq, stock, invoices, sales-invoices
(bill creator), sub-payments, daily-reports, cvr, contracts, hse, compliance.
