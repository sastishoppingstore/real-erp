# Reference-Derived Screen Map — /app/construction/ (YASCO ERP)

| ID | Screen | Route / file | Status |
|---|---|---|---|
| SCR-001 | Login | `/login` → `src/pages/Login.tsx` (+ `BusinessHomeRedirect`) | existing, kept |
| SCR-002 | Main dashboard (Sahl black tiles) | `/app/construction` → `src/pages/construction/index.tsx` | rewritten to reference layout |
| SCR-003 | Program settings | `/app/settings` → `src/pages/settings.tsx` | existing module, tile-linked |
| SCR-004 | Product entry | `/app/construction/products` | existing module, tile-linked |
| SCR-005 | Accounts entry | `/app/construction/subcontractors` | existing module, tile-linked |
| SCR-006 | Inventory workspace | `/app/construction/stock` + `/warehouses` | existing, tile-linked |
| SCR-007 | Sales transaction (bill creator) | `/app/construction/sales-invoices` → `src/pages/sales/invoices.tsx` | existing bill creator, tile-linked |
| SCR-008 | Cash/expense | `/app/construction/sub-payments` | existing, tile-linked |

Shell: `src/pages/construction/ConstructionLayout.tsx` (title bar, menu strip, drawer, status bar) — kept.
Reference viewport: 640×342. All tiles navigate to real modules; no dead tiles.
