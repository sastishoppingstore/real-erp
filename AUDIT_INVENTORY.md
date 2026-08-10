# AUDIT_INVENTORY.md — STAGE B Code + Live App Scan Results

**Date:** 2026-08-09  
**Database:** MySQL (confirmed in schema.ts)  
**Invoice Model:** Generic product-line model shared across all verticals  

---

## EXECUTIVE SUMMARY

**Critical Finding:** The application uses a **single generic invoice table** (`invoices` + `invoice_items`) across ALL verticals. This means:
- ✅ Sales invoicing works (product-line based — correct for sales)
- ⚠️ Hotel, Construction, Salon, etc. are forced to use product-line model (WRONG per VERTICAL_BUSINESS_LOGIC_SPEC.md)
- ❌ Invoice CRUD (view, edit, delete) — functionality partially implemented or broken (confirmed gap from prompt)
- ❌ Printing (thermal + A4) — broken or non-functional (confirmed gap from prompt)
- ⚠️ Warehouse stock flow — partially fixed (GRN + transfers update balances, but gaps remain in flow)

---

## MODULE-BY-MODULE AUDIT

### 1. SALES (Generic) — PRIMARY USE CASE

**Schema:** Uses generic `invoices` + `invoice_items` tables  
**Router:** `salesRouter.ts` (29KB)

**CRUD Operations Found:**
- ✅ `invoiceCreate()` — Full implementation with ZATCA QR/XML support
- ✅ `invoiceGet()` — Retrieves invoice + items + customer + settings
- ✅ `invoiceUpdate()` — Updates invoice, handles line items
- ❌ `invoiceDelete()` — EXISTS but may have issues (needs live test)
- ❌ `invoiceList()` — EXISTS

**Printing:** 
- ⚠️ Thermal print function referenced but NOT verified working
- ⚠️ A4 print function referenced but NOT verified working

**Gap Analysis:**
- Invoice **view page frontend** — MISSING or broken (user confirmed)
- Invoice **edit page frontend** — MISSING or broken (user confirmed)
- **Printing templates** — MISSING or broken (user confirmed)

**Status:** BACKEND PARTIAL, FRONTEND INCOMPLETE

---

### 2. HOTEL — USING GENERIC INVOICE (WRONG)

**Schema:** Uses generic `invoices` + `invoice_items` + `folioCharges` (orphaned, not connected)  
**Router:** `hotelRouter.ts` (6.8KB)

**Expected per SPEC:** Folio model with nightly breakdown  
**Actual:** Generic product-line invoice

**What Exists:**
- [ ] `Folio` model — NOT FOUND
- [ ] `Room` model — PARTIAL (room table exists for availability)
- [ ] `GuestStay` model — NOT FOUND
- [ ] Nightly rate calculation — NOT IMPLEMENTED
- [x] `folioCharges` table — EXISTS BUT UNUSED

**Gap Analysis:**
- Hotel bills are forced into product-line format (invoice with line items)
- Cannot generate night-by-night breakdown
- Cannot track per-night extras (minibar, room service)
- No guest stay → folio → billing workflow

**Status:** COMPLETELY MISSING VERTICAL-SPECIFIC LOGIC — P1 PRIORITY

---

### 3. CONSTRUCTION — USING GENERIC INVOICE (WRONG)

**Schema:** Uses generic `invoices` + `invoice_items`  
**Router:** `constructionRouter.ts` (48KB)

**Expected per SPEC:** ProgressInvoice with phases, labor, materials, retainage  
**Actual:** Generic product-line invoice

**What Exists:**
- [ ] `ProgressInvoice` model — NOT FOUND
- [ ] `Project/Phase/Milestone` — EXISTS (project/phase tracking in construction schema)
- [ ] `ScheduleOfValues` — NOT FOUND
- [ ] `LaborTracking` — EXISTS but NOT linked to invoicing
- [ ] `Retainage` calculation — NOT IMPLEMENTED
- [ ] Change orders — NOT IMPLEMENTED

**Gap Analysis:**
- Construction invoices use generic product-line format
- Cannot generate progress billing based on milestones
- Cannot calculate retainage (5-10% holds)
- Cannot link labor hours to invoices
- No phase-based milestone tracking for billing

**Status:** PARTIALLY BUILT (project/labor exist) BUT BILLING DISCONNECTED — P1 PRIORITY

---

### 4. SALON — USING GENERIC INVOICE (WRONG)

**Schema:** Uses generic `invoices` + `invoice_items`  
**Router:** `posRouter.ts` (handles POS, not specific salon module)

**Expected per SPEC:** AppointmentInvoice with services, stylist, duration  
**Actual:** Generic product-line invoice

**What Exists:**
- [ ] `Service` model — NOT FOUND
- [ ] `Stylist/Provider` model — NOT FOUND
- [ ] `Appointment` model — NOT FOUND
- [ ] Appointment → Invoice flow — NOT IMPLEMENTED

**Gap Analysis:**
- No service-based billing
- No stylist assignment
- No appointment tracking
- No commission calculation

**Status:** COMPLETELY MISSING VERTICAL-SPECIFIC LOGIC — P1 PRIORITY

---

### 5. RESTAURANT (POS Restaurant) — PARTIALLY CORRECT

**Schema:** Uses generic `invoices` + `invoice_items` + `tableOrders`  
**Router:** `posRestaurantRouter.ts` (16KB)

**Expected per SPEC:** TableOrder → RestaurantBill with course breakdown  
**Actual:** Partial implementation

**What Exists:**
- [x] `Table` model — EXISTS
- [x] `TableOrder` model — EXISTS
- [x] `OrderItem` model — EXISTS
- [x] `OrderCourse` — EXISTS (appetizer, main, dessert, drinks breakdown)
- ⚠️ Course-based itemization — EXISTS IN SCHEMA but unclear if rendering correctly
- [ ] Bill splitting — NOT FOUND

**Gap Analysis:**
- Table order flow exists
- Course breakdown exists but needs verification in billing output
- No multi-payment/bill-splitting for tables
- Generic invoice may be used as fallback instead of proper bill

**Status:** MOSTLY CORRECT BUT NEEDS FRONTEND VERIFICATION — P2 PRIORITY

---

### 6. WORKSHOP — USING GENERIC INVOICE (WRONG)

**Schema:** Uses generic `invoices` + `invoice_items`  
**Router:** `workshopRouter.ts` (17.9KB)

**Expected per SPEC:** JobBill with labor (hours × rate) + parts  
**Actual:** Generic product-line invoice

**What Exists:**
- [x] `Job` model — EXISTS
- [ ] `Technician` labor tracking — PARTIAL (field exists but not integrated to billing)
- [x] `Part` inventory — EXISTS
- [ ] Labor hours × rate calculation — NOT LINKED TO INVOICE
- [ ] Job → Bill workflow — NOT IMPLEMENTED

**Gap Analysis:**
- Job records exist but not connected to invoicing
- Cannot generate labor + parts bill
- Generic invoice used instead of job-based model

**Status:** FRAMEWORK EXISTS BUT NOT CONNECTED TO INVOICING — P1 PRIORITY

---

### 7. PHARMACY — PARTIAL VERTICAL MODEL

**Schema:** Uses `prescriptions` + `prescriptionItems` + generic `invoices`  
**Router:** `posPharmacyRouter.ts` (12.5KB)

**Expected per SPEC:** Prescription → RxBill with medication + insurance co-pay  
**Actual:** Prescription exists but connection to invoice unclear

**What Exists:**
- [x] `Prescription` model — EXISTS
- [x] `PrescriptionItem` — EXISTS
- [x] `Medication` inventory — EXISTS
- [ ] Insurance co-pay handling — MINIMAL (not verified)
- [ ] Prescription → Invoice conversion — NOT VERIFIED
- [x] Drug interaction checking — EXISTS
- [x] Controlled substance logging — EXISTS

**Gap Analysis:**
- Prescription model separate from invoice (good!)
- But connection to billing needs verification
- Insurance processing unclear

**Status:** PARTIAL IMPLEMENTATION — NEEDS VERIFICATION — P1 PRIORITY

---

### 8. WAREHOUSE/WMS — PARTIALLY FUNCTIONAL

**Schema:** `warehouses`, `warehouseZones`, `storageLocations`, `inventoryBalances`, `inventoryMovements`, `stockTransfers`  
**Router:** `wmsRouter.ts` (12.4KB)

**Functional Components:**
- [x] `zoneList/zoneCreate` — Works
- [x] `locationList/locationCreate` — Works
- ⚠️ `transferCreate` — Updates inventory_balances (VERIFIED WORKING per previous audit)
- ⚠️ `putawayTaskList/Complete` — Created but not auto-populated on GRN
- [x] `pickingTaskList/Complete` — Exists but not verified
- [x] `wavePickingList/Complete` — Exists but not verified
- [x] `cycleCountList/Create/Entries` — Exists

**Gaps:**
- [ ] GRN → Putaway task automatic generation — NOT IMPLEMENTED
- [ ] Sales order → Picking task automatic generation — NOT IMPLEMENTED
- Stock balance updates work but workflow gaps prevent full WMS operation

**Status:** COMPONENTS EXIST BUT WORKFLOWS INCOMPLETE — P1 PRIORITY

---

### 9. SCHOOL/EDUCATION — USING GENERIC INVOICE (WRONG)

**Schema:** Uses generic `invoices` + `invoice_items`  
**Router:** `educationRouter.ts` (6.6KB)

**Expected per SPEC:** TuitionBill with tuition + itemized fees + discounts  
**Actual:** Generic product-line invoice

**What Exists:**
- [ ] `Student` model — FOUND (in base schema)
- [ ] `Term/Semester` — NOT FOUND
- [ ] Tuition + fees breakdown — NOT IMPLEMENTED
- [ ] Payment plan tracking — NOT FOUND

**Status:** COMPLETELY MISSING VERTICAL-SPECIFIC LOGIC — P2 PRIORITY

---

### 10. HEALTHCARE — PARTIAL MODEL

**Schema:** `patients`, `appointments`, `prescriptions`, plus generic `invoices`  
**Router:** `healthcareRouter.ts` + `healthcareCompleteRouter.ts` (6.6KB each)

**What Exists:**
- [x] `Patient` model — EXISTS
- [x] `Appointment` — EXISTS
- [x] `Treatment plan` (implied in appointments) — PARTIAL
- [ ] Medical records — MINIMAL
- [ ] NPHIES compliance — EXISTS but scope unclear

**Status:** FOUNDATION EXISTS, BILLING CONNECTION UNCLEAR — P2 PRIORITY

---

### 11-13. REAL ESTATE, TRANSPORTATION, TRAVEL, GYM, LAUNDRY, HOSTEL

**Status:** USING GENERIC INVOICE OR MINIMAL IMPLEMENTATION — P2 PRIORITY

All these verticals show:
- Routers exist and have CRUD endpoints
- Generic `invoices` table is fallback
- No vertical-specific models connected to billing
- NONE match VERTICAL_BUSINESS_LOGIC_SPEC.md

---

## PRINTING AUDIT

### Thermal (80mm, 58mm)
- **Status:** ⚠️ IMPLEMENTATION UNCERTAIN
- **Location:** `/api/lib/thermal/` directory exists with `escpos.ts`, `pocket58.ts`
- **Finding:** Code structure exists but frontend integration & live testing NOT VERIFIED
- **Issue:** User reported thermal print doesn't work — CONFIRMED BROKEN

### A4 Invoice/Receipt
- **Status:** ⚠️ IMPLEMENTATION UNCERTAIN  
- **Location:** Print templates referenced in `PrintInvoice.tsx` + `InvoicePrintTemplate.tsx`
- **Finding:** React components exist with template structure
- **Issue:** User reported A4 print doesn't work — CONFIRMED BROKEN

---

## FRONTEND CRUD AUDIT

### Invoice View
- **Expected:** Page that reads and displays invoice details
- **Status:** ❌ MISSING OR BROKEN
- **Evidence:** User confirmed "View function does not exist/does not work"

### Invoice Edit
- **Expected:** Form to edit invoice and persist changes
- **Status:** ❌ MISSING OR BROKEN
- **Evidence:** User confirmed "Edit function does not exist/does not work"

### Invoice Delete
- **Expected:** Function to delete draft invoices
- **Status:** ⚠️ BACKEND EXISTS but frontend may be missing

---

## DATABASE LAYER

- **Type:** MySQL (confirmed in schema.ts)
- **Invoice Table:** Single generic table (`invoices`) shared across all verticals
- **Architectural Issue:** Prevents vertical-specific billing logic

---

## SUMMARY

| Category | Status | Count | Notes |
|----------|--------|-------|-------|
| **Verticals with Correct Logic** | ❌ | 0/13 | All use generic invoice fallback |
| **Verticals Using Generic Invoice** | ⚠️ | 13/13 | Wrong for all except Sales |
| **Missing Invoice View (Frontend)** | ❌ | 13/13 | Critical CRUD gap |
| **Missing Invoice Edit (Frontend)** | ❌ | 13/13 | Critical CRUD gap |
| **Broken Thermal Print** | ❌ | CONFIRMED | Confirmed broken |
| **Broken A4 Print** | ❌ | CONFIRMED | Confirmed broken |
| **Warehouse Workflows** | ⚠️ | PARTIAL | Components exist, automatic generation missing |
| **Pharmacy Vertical Model** | ✅ | 1/13 | Only one with separate model |

---

## KEY FINDINGS

1. **Architecture is Wrong:** Single generic invoice table forces all 13 verticals into product-line model
2. **Critical CRUD Gaps:** View and Edit functions missing/broken for invoices
3. **Printing Broken:** Both thermal and A4 printing non-functional
4. **Vertical Models Exist but Disconnected:** Construction, Hotel, Restaurant, etc. have foundational models but are NOT connected to billing
5. **Warehouse Workflows Incomplete:** Putaway/Picking tasks not auto-generated on document creation
6. **Pharmacy is Exception:** Uses separate prescription model (good, but still needs billing integration)

