# YASCO ERP — Phase 1–3 Test & Bug Report

**Date:** 2026-08-10
**Environment:** http://56.228.18.170 (VM `ubuntu@56.228.18.170`, `/home/ubuntu/real-erp`)
**Method:** Direct tRPC API testing as Super Admin (tenant 1) and as a normal tenant admin (tenant 5 "Al-Noor Workshop LLC"), plus DB inspection.

---

## Critical / Security

### BUG-S1 (CRITICAL) — `superAdmin` router grants super-admin powers to ANY tenant admin
- **Location:** `api/superAdminRouter.ts` (imports `adminQuery` instead of `superAdminQuery`; every endpoint uses `adminQuery`).
- **Root cause:** Role middleware `requireRole("admin")` passes for any user whose role is `admin` (see hierarchy in `api/middleware.ts:20`), regardless of tenant. Super-admin APIs should use `superAdminQuery` (`requireRole("super_admin")`).
- **Impact (all verified with tenant 5 cookie):**
  - `superAdmin.companies.list` → returns **all companies on the platform** (tenant 5 can read tenant 1, 2, 3... company data).
  - `superAdmin.plans.list` / pricing data → exposed.
  - `superAdmin.modules.listForTenant` / `setTenantModule` → read AND toggle modules for **any tenant**.
  - `superAdmin.subscriptions.updateLimits` → tenant 5 successfully modified tenant 1's `userLimit` to 999. **Write access to other tenants.**
  - `superAdmin.impersonate.start` → tenant 5 impersonated tenant 1 successfully.
  - `superAdmin.stats.dashboard` → global platform stats (total companies, revenue, signups).
- **Fix:** Replace `adminQuery` with `superAdminQuery` throughout `api/superAdminRouter.ts`.

### BUG-S2 (HIGH) — No row in `company_settings` after tenant registration
- **Location:** `api/registrationRouter.ts` (tenant signup flow).
- **Impact:** `settings.companySettingsGet` returns `null` for a newly registered tenant (verified for tenant 5). The app UI that reads company settings (name, VAT, invoice prefixes, theme, etc.) will crash or misbehave on fresh signups. Also `enabledModules` (below) has nowhere to live.
- **Fix:** Insert a default `company_settings` row during `registration.register`.

---

## Functional Bugs Found & Fixed (backend patched, rebuilt, verified)

### BUG-F1 (FIXED) — Invoice creation 500 on empty `dueDate`
- **Symptom:** `POST sales.invoiceCreate` → HTTP 500. MySQL: `ERROR 1292: Incorrect date value: '' for column 'due_date'`.
- **Root cause:** `invoiceData.dueDate` empty string `""` written to a DATE column.
- **Fix (`api/salesRouter.ts`):**
  - `invoiceCreate`: `dueDate: invoiceData.dueDate || null` (line 378).
  - `invoiceUpdate`: copy to `invoiceUpdateData` with empty `dueDate` → `null`.
- **Verify:** `BILL-777001` / `BILL-777002` created, HTTP 200.

### BUG-F2 (FIXED) — POS `createSaleInvoice` 500 on missing item description
- **Symptom:** `pos.createSaleInvoice` → HTTP 500, `description NOT NULL` insert failure.
- **Root cause:** `invoice_items.description` is NOT NULL in DB but optional in the API schema; insert used raw `item.description`.
- **Fix (`api/posRouter.ts:181`):** fallback `(item.description && item.description.trim()) ? item.description : (item.productId ? \`Item #${item.productId}\` : "POS Sale")`.
- **Verify:** invoice `POS-1786305444923` (id 13) created, HTTP 200.

### BUG-F3 (FIXED) — Wholesale `createBulkInvoice` 500 on missing item description
- **Symptom:** `posWholesale.createBulkInvoice` → HTTP 500, same `description NOT NULL` insert failure.
- **Fix (`api/posWholesaleRouter.ts:170`):** same fallback pattern as POS.
- **Verify:** invoice `WS-1786306243445` (id 16) created, HTTP 200.

### BUG-F4 (FIXED) — Aviation `flightCreate` 500 "value.toISOString is not a function"
- **Symptom:** `aviation.flightCreate` → HTTP 500 when sending `datetime-local` string.
- **Root cause:** passed raw string where a `Date` was required.
- **Fix (`api/aviationRouter.ts`):** wrap `departureTime`/`arrivalTime` in `new Date(...)`.
- **Verify:** flight id 1 created, HTTP 200.

---

## Functional Bugs — NOT YET FIXED

### BUG-O1 (HIGH) — GRN does not increase stock
- **Location:** `api/purchaseRouter.ts` `grnCreate` (line 103).
- **Symptom (verified):** `purchase.grnCreate` succeeds (HTTP 200) but no `inventory_balances` row is created/updated. Stock received via GRN never appears in inventory levels.
- **Fix:** After inserting GRN items, upsert `inventory_balances` (productId+warehouseId+tenantId) increasing quantity; also record `inventory_movements`.

### BUG-O2 (HIGH) — Stock transfer does not move stock
- **Location:** `api/inventoryRouter.ts` `transferCreate` (line 202).
- **Symptom (verified):** `inventory.transferCreate` succeeds but quantities in `inventory_balances` are unchanged (only `stock_transfers` + `stock_transfer_items` rows written).
- **Fix:** Decrement from-warehouse balance, increment to-warehouse balance, insert `inventory_movements`.

### BUG-O3 (HIGH) — Module selection disconnect: DB vs localStorage vs companySettings
- **Symptom (verified):**
  - Signup stores selected modules in `tenant_modules` table AND frontend `localStorage` (see `src/config/businessCatalog.ts` `getStoredBusinessProfile` / `getEnabledModuleIds`).
  - Dashboard launcher (`src/components/themes/AppLauncher/AppLauncherHome.tsx`) filters modules from `companySettings.enabledModules` via `settings.companySettingsGet`.
  - But `company_settings` table has **no `enabled_modules` column** and the API returns no such field (verified: key absent from response).
  - Therefore the module→dashboard filtering only works from `localStorage` of the enrolling browser; it does not survive logout/new device, and server-side logic cannot see enabled modules.
  - Additionally `module_registry` table is **empty (0 rows)** so `superAdmin.modules.listForTenant` returns `[]` for every tenant — module catalogs are never seeded.
- **Fix:** (a) seed `module_registry`; (b) add `enabled_modules` (JSON) to `company_settings` schema + `companySettingsGet/Update`; (c) have `AppLauncherHome` read from the server response (fallback to localStorage), and write selection server-side at registration.

### BUG-O4 (MEDIUM) — `module_registry` table never seeded
- **Symptom:** `superAdmin.modules.listForTenant` always returns `[]`; `master.systemSnapshot` reports `publicModules: 0`.
- **Fix:** Seed registry (all modules: core + verticals) at app bootstrap/migration.

### BUG-O5 (MEDIUM) — Dead router code: 7 AI routers never imported; 2 routers imported but never mounted
- **Symptom (verified):**
  - `api/aiAssistantRouter.ts`, `aiAutomationRouter.ts`, `aiChatbotRouter.ts`, `aiConstructionRouter.ts`, `aiForecastingRouter.ts`, `aiReportsRouter.ts`, `aiVoiceRouter.ts` — 7 files exist but are **never imported** in `api/router.ts`; all their endpoints 404 (`aiForecasting.demand`, `aiChatbot.faq`, `aiAssistant.ask`, etc.). Advertised AI features are unreachable.
  - `healthcareCompleteRouter` & `workshopCompleteRouter` are **imported but not mounted** → all `healthcareComplete.*` / `workshopComplete.*` endpoints 404. Patients/warranties etc. under these routers unreachable.
- **Fix:** Mount the routers that should ship (`ai*`, `healthcareComplete`, `workshopComplete`) or remove the dead code.

### BUG-O7 (HIGH) — No server-side module entitlement enforcement
- **Symptom (verified):** Tenant 5 signed up with ONLY `workshop, inventory, sales, purchasing` modules, but could successfully call `inventory.productCreate`, `hrm.employeeCreate`, `accounting.coaCreate`, `healthcare.patientCreate` — all succeeded (HTTP 200) despite those modules not being assigned. Module selection affects only UI visibility, never enforces API access.
- **Note:** Data isolation IS working (tenant 5's `productList` returns only its own rows; `superAdmin.companies.list` leak aside, in-tenant data is tenantId-scoped).
- **Fix:** Enforce entitlement per-request (e.g., middleware checks `tenant_modules`/`tenant_module_controls` for the called module before executing; or plan-based feature gating at router mount time).

---

## API Contract / Schema Notes (not 500s, but callers must match)

- `accounting.coaCreate` requires BOTH `accountType` and `accountCategory` enums (6 each) — passing only `type` returns 400.
- `accounting.trialBalance` and `inventory.movementList` have optional-object inputs; passing `null` returns 400 — callers must send `{}`.
- `posRestaurant.tableCreate` requires `floorPlanId` (number). `posPharmacy.prescriptionCreate` requires `dateIssued` + `items[]`.
- `workshop.vehicleCreate` requires `year`; `workshop.jobCardCreate` requires `jobNumber` + `serviceType`.
- `posWholesale.createBulkInvoice` requires `date`, `paymentAmount`, `subtotal`, `totalAmount`, and per-item `quantity`, `unitPrice`, `totalAmount`.
- `helpdesk.ticketCreate` requires `description`.
- `crm.leadCreate` requires `firstName`; `projects.projectCreate` requires `name`; `hotel.bookingCreate` requires `roomTypeId`, `nightlyRate`, `totalNights`; `travel.bookingCreate` requires `bookingType` + `bookingDate`; `realEstate.propertyCreate` requires `name`.
- `inventory.warehouseCreate` requires `code`.
- `inventory.productCreate` uses `salePrice`/`purchasePrice` (NOT `price`). Frontend `src/pages/inventory/products.tsx` already uses `salePrice`, so OK — but any caller sending `price` silently stores `sale_price = 0.00` (verified). Consider aliasing `price`→`salePrice`.
- `cashbox.cashIn` requires `description`.
- `wms.zoneCreate` requires `warehouseId`, `zoneCode`, `zoneName`, `zoneType`.
- Queries must be issued as GET with `input={"0":{"json":{}}}`; POST to a `.query` returns 405. Some list endpoints require `{}` (not `null`) — passing `null` returns 400.

---

## Data/Entitlement Notes

- `sales.invoiceCreate` on a Saudi company (tenant 1) forces `invoiceType = "zatca"` even when caller sends `"standard"` — driven by company settings `zatcaEnabled`/valid VAT number. Intentional, but worth confirming with product owner.
- Invoice `customer_id` auto-resolves to the "WALK-IN" customer (id 12) when `customerId` is 0/undefined.
- ZATCA pipeline works end-to-end: `zatca.generateXml` produced UBL XML + hash + QR for invoice 11; `zatca.dashboard` returns invoice stats; `zatca.companyLegalGet` returns legal/vat fields.
- Reports (`reports.salesReport`) work and aggregate by day/month/year.

---

## Ops / Hygiene

### BUG-O6 (HIGH) — GitHub token committed in git remote URL
- The remote URL for the repo contains a plaintext personal access token:
  `https://github.com/sastishoppingstore/real-erp.git` with embedded `ghp_...` token.
- **Action:** Rotate the token immediately (it is exposed in local git config/history) and switch the remote to SSH or a read-only deploy key.

### OPS-1 — Build artifacts committed
- `dist/boot.js` is tracked in git (`b54c1a23 "Add dist and node_modules"`). This causes noisy diffs (179 lines) on every backend rebuild and bloats the repo. Prefer ignoring `dist/` and building on deploy.

### OPS-2 — Rebuild/deploy steps used during testing
- `npm run build:backend` then `pm2 restart erp-local` (process runs `dist/boot.js` on port 3000 behind nginx). PM2 restart counter was 35→37 during this session.

---

## Test Coverage Matrix (Phase 3)

| Module / endpoint | Result |
|---|---|
| auth.passwordLogin / auth.me | PASS |
| registration.register + verifyOtp (OTP HMAC `saas-secret-key`) | PASS |
| licenseAdmin.generate | PASS |
| inventory category/warehouse/brand/unit/product CRUD | PASS |
| inventory.transferCreate | PASS (but BUG-O2: no stock move) |
| inventory.movementList / transferList / adjustmentList | PASS |
| purchase supplier/PO/GRN | PASS (GRN: BUG-O1) |
| sales customer/quotation/invoice/payment/credit-note | PASS |
| pos.createSaleInvoice | PASS (BUG-F2 fixed) |
| posWholesale.createBulkInvoice / priceTier | PASS (BUG-F3 fixed) |
| posRestaurant floorPlan/table | PASS |
| posPharmacy prescription | PASS |
| posShared loyalty/gift-card | PASS |
| crm lead/opportunity | PASS |
| hrm employee | PASS |
| workshop vehicle/jobCard | PASS |
| healthcare.patientCreate | PASS (healthcareComplete.* dead — BUG-O5) |
| construction project | PASS |
| hotel booking | PASS |
| realEstate property | PASS |
| education student | PASS |
| transport route | PASS |
| travel booking | PASS |
| aviation flight | PASS (BUG-F4 fixed) |
| manufacturing bom | PASS |
| projects project | PASS |
| helpdesk ticket | PASS |
| assets asset | PASS |
| accounting coa/journalEntry | PASS |
| accounting.trialBalance | PASS (input `{}` required) |
| installments create/list | PASS |
| cashbox cashIn/transactionList | PASS |
| reports.salesReport / inventoryReport | PASS |
| zatca companyLegalGet/generateXml/dashboard | PASS |
| sync.status / registerDevice | PASS |
| settings.companySettingsGet / themeGet | PASS (returns no enabledModules — BUG-O3) |
| superAdmin.companies/plans/modules/subscriptions/stats | **PASS but SECURITY BUG-S1** |
| saudiCompliance / qiwa / gosi / wps | PASS (registrationUpsert, exceptionCreate) |
| ifrs15.obligationCreate / ifrs16.leaseContractCreate | PASS |
| consolidation group | PASS |
| scm evaluationCreate | PASS |
| wms zoneCreate | PASS |
| master.systemSnapshot / competitionCoverage | PASS |
| nphies.checkEligibility | PASS |
| saas.plans.list | PASS |
| ai* (all 7 routers) | **DEAD CODE (BUG-O5)** |
| portalCustomer / portalEmployee / portalVendor | not exercised (public, token-based) |
| Tenant 5 (workshop) own-module CRUD | PASS (workshop, inventory) |
| Tenant 5 cross-module access | **PASSES but SHOULD FAIL (BUG-O7)** |
| Tenant 5 data isolation | PASS (tenantId-scoped) |

## Suggested Priority Order
1. **BUG-S1** superAdmin privilege escalation (immediate, security).
2. **BUG-O1 / BUG-O2** stock never moves (inventory integrity).
3. **BUG-S2 + BUG-O3 + BUG-O4** onboarding/module-select end-to-end.
4. **BUG-O7** module entitlement enforcement (license integrity).
5. **BUG-O5** mount or delete dead routers.
6. **BUG-O6** rotate leaked GitHub token.
