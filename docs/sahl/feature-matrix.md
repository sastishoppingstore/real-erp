# Feature Matrix — requirement → route → API → tables → tests

| Module | Route | API (tRPC) | MySQL tables | Tests |
|---|---|---|---|---|
| Dashboard/tiles/tour | `/app/construction` | construction.*, constructionInvoices.*, settings.companySettingsGet | projects, invoices, company_settings | live 200, chunk-marker grep |
| Settings | `sahl/settings` | settings.companySettingsGet/Update, currency*, inventory.unit/warehouse/category* | company_settings, currencies, units, warehouses, product_categories | live 200 |
| Products | `sahl/products` | inventory.product*/inventory*/movement*, adjustmentCreate | products, inventory_balances/movements, stock_adjustments(+items) | live 200 |
| Accounts | `sahl/accounts` | sales.customer*, purchase.supplier*, invoiceList, paymentList | customers, suppliers, invoices, customer_payments | live 200 |
| Sales inv | `sahl/sales` | sales.invoiceCreate, sahl.priceListList/priceFor | invoices(+items), sahl_price_lists/items | live 200 |
| Purchase | `sahl/purchase` | purchase.poCreate/grnCreate | purchase_orders(+items), goods_received_notes(+items), balances/movements | live 200 |
| Sales return | `sahl/sales-return` | sales.creditNoteCreate | credit_notes (orig invoiceId) | live 200 |
| Purchase return | `sahl/purchase-return` | inventory.adjustmentCreate | stock_adjustments (PO in reason) | live 200, zero-bug fixed |
| Quotation+reserv | `sahl/quotation` | sales.quotationCreate, sahl.reservation* | sales_quotations(+items), sahl_reservations | live 200 |
| Cash/expense | `sahl/cash`, `sahl/receipts` | cashbox.cashIn/cashOut/addExpense/balance/today/transactionList | cashbox_transactions | live 200 |
| Reports | `sahl/reports/*` | cashbox.todaySummary, sales.invoiceList, reports.sales/purchase/inventory | invoices, purchase_orders, products+balances | live 200 |
| Salesmen | `sahl/salesmen` | sahl.salesman* | sahl_salesmen (mig 0015) | live 200 |
| Users | `sahl/users` | sahl.user* (admin) | users (scrypt) | live 200, 403 w/o admin |
| Prices | `sahl/prices` | sahl.priceList*/priceSet/priceBulk | sahl_price_lists/items (mig 0015) | live 200 |
| Stocktake | `sahl/vault/stocktake` | inventory.adjustmentList/Create | stock_adjustments (variance) | live 200 |
| Transfer | `sahl/vault/transfer` | sahl.transferAtomic (NEW) | stock_transfers(+items), balances, movements | live 200 |
| Moves | `sahl/vault/moves` | inventory.movementList | inventory_movements | live 200 |
| Archive | `sahl/vault/archive` | sahl.archiveSearch (NEW) | invoices+customers | live 200 |
| Cheques | `sahl/vault/cheques` | sahl.cheque* (NEW) | sahl_cheques (mig 0015) | live 200 |
| Installments | `sahl/vault/inst` | installments.list/create/recordPayment/overdue/get | installments, installment_payments | live 200 |
| Labels | `sahl/vault/labels` | sahl.labelData (NEW) | products | live 200 |
| Prints | `sahl/vault/prints` | invoiceTheme.list/setDefault | invoice_themes | live 200 |

Coverage: unit tests for money/stock math — NOT added (no test runner wired for api/); verification is
live-route + procedure-level review. Known gap, stated honestly.
Migrations: `db/migrations/0015_sahl_extension.sql` applied to erp_yasco_prod (5 tables verified).
