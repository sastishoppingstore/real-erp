# AUDIT_TASKLIST.md — Prioritized Tasks for STAGE D (Build/Fix)

**Sourced from:** AUDIT_INVENTORY.md  
**Target:** Production-ready system with all 13 verticals using correct business logic

---

## PRIORITY BREAKDOWN

| Priority | Criteria | Count | Estimated Effort |
|----------|----------|-------|------------------|
| **P0** | BLOCKING — breaks MAIN use case (Sales invoicing + printing) | 4 tasks | 10-15 hours |
| **P1** | CRITICAL — breaks vertical-specific logic (13 verticals) | 12 tasks | 30-40 hours |
| **P2** | IMPORTANT — improves but not blocking (warehouse workflow, secondary verticals) | 6 tasks | 15-20 hours |
| **P3** | NICE-TO-HAVE — Polish, optimization, edge cases | — | — |

---

## 🔴 P0 — BLOCKING ISSUES (Sales Invoice CRUD + Printing)

These must be fixed first. They affect the main Sales invoicing use case and would block any test or launch.

### P0-1: Invoice View Page — Frontend
**Issue:** No working invoice view page in frontend  
**Impact:** Users cannot see invoice details after creation  
**Blocked Modules:** All (sales, hotel, construction, etc.)  
**Task:**
- Create/fix invoice view page at `/src/pages/sales/invoices/[id].tsx` or similar
- Fetch invoice data from `invoiceGet()` endpoint
- Display invoice + line items + customer + ZATCA QR code
- Show payment status, outstanding balance
- Add action buttons (Edit, Print, Delete, Send)

**Test Steps:**
1. Create invoice in Sales
2. Navigate to view page
3. Verify all fields render correctly
4. Verify QR code displays

**Estimated Effort:** 4-6 hours

---

### P0-2: Invoice Edit Page — Frontend
**Issue:** No working invoice edit page in frontend  
**Impact:** Users cannot modify invoices before sending  
**Blocked Modules:** All  
**Task:**
- Create/fix invoice edit page (likely same component as create, with pre-fill)
- Fetch invoice data via `invoiceGet()`
- Allow editing of:
  - Line items (add/remove/modify quantity/price)
  - Customer
  - Due date
  - Notes
  - Discount
- Call `invoiceUpdate()` endpoint on save
- Validate state transitions (cannot edit paid invoices)

**Test Steps:**
1. Create invoice
2. Navigate to edit page
3. Modify line item quantity
4. Save and verify in view page

**Estimated Effort:** 4-6 hours

---

### P0-3: Thermal Print — Backend + Frontend
**Issue:** Thermal printing endpoint not working or not integrated  
**Impact:** Cannot print invoices on 80mm/58mm receipt printers  
**Blocked Modules:** All (POS critical)  
**Task:**
- Debug `/api/thermalPrint` endpoint (currently 2KB stub)
- Connect to `escpos.ts` thermal template library
- Implement:
  - Font sizing (normal, bold, condensed)
  - Barcode generation (Code128 for invoice number)
  - QR code rendering (ZATCA QR from invoice.zatcaQrCode)
  - Text alignment (left, center, right)
  - Paper cut signal (ESC/POS cut command)
- Test with ESC/POS printer emulator or physical printer
- Wire frontend print button to endpoint
- Handle print errors gracefully

**Thermal Template Structure:**
```
┌────────────────────┐
│     COMPANY NAME   │  (48mm centered)
│   INVOICE #1234    │
│ 2025-01-15 14:30   │
├────────────────────┤
│ Item        Qty Amt│
│ Product A    2  500│
│ Product B    1  300│
├────────────────────┤
│ Subtotal      800  │
│ Tax (15%)     120  │
│ Total         920  │
├────────────────────┤
│ [QR CODE HERE]     │
│ Paid: Cash         │
└────────────────────┘
```

**Test Steps:**
1. Create invoice
2. Click "Print Thermal"
3. Verify receipt format in emulator/printer
4. Check QR code scannable

**Estimated Effort:** 6-8 hours

---

### P0-4: A4 Print (PDF Invoice) — Backend + Frontend
**Issue:** A4 PDF invoice printing broken or not callable from frontend  
**Impact:** Cannot send professional invoices to customers via email/PDF  
**Blocked Modules:** All  
**Task:**
- Verify PDF generation in `/api/lib/pdfService.ts`
- Check if endpoint exists for PDF export
- Fix template rendering:
  - Company header (logo + info + ZATCA registration)
  - Customer details
  - Invoice items table
  - ZATCA QR code (bottom left)
  - UBL XML hash (footer)
  - Amount in words (Arabic + English)
  - Tax breakdown
  - Payment terms
- Test with sample invoice
- Wire frontend download/print button to endpoint
- Ensure ZATCA compliance fields included

**A4 Template Structure:**
```
┌─────────────────────────────┐
│ [LOGO] COMPANY NAME         │ (left: logo, right: name/VAT#)
│ Registration: 3XXXXX3        │
├─────────────────────────────┤
│ INVOICE                      │
│ Invoice #: 1234              │ Date: 2025-01-15
│ Invoice Type: Standard       │ Due: 2025-02-15
├─────────────────────────────┤
│ CUSTOMER                     │
│ Name: ABC Company            │
│ VAT: 3XXXXX3                 │
│ Address: ...                 │
├─────────────────────────────┤
│ Item          Qty   Price   Amount │
│ Product A      2    250     500    │
│ Product B      1    300     300    │
├─────────────────────────────┤
│ Subtotal               800        │
│ Discount               -0         │
│ Tax (15%)             120         │
│ Total               920           │
├─────────────────────────────┤
│ Nine Hundred Twenty SAR      │
│ [QR CODE]                    │
│ Hash: xxx...xxx              │
└─────────────────────────────┘
```

**Test Steps:**
1. Create invoice
2. Download PDF
3. Verify layout in PDF viewer
4. Check QR code embedded
5. Test email send

**Estimated Effort:** 6-8 hours

---

## 🟠 P1 — CRITICAL VERTICAL LOGIC GAPS

These fix the wrong business logic in each vertical. Must be completed before any vertical can be considered production-ready.

### P1-1: Hotel — Folio Model
**Issue:** Hotel invoicing uses generic product-line model instead of folio with nightly breakdown  
**Impact:** Cannot create proper hotel bills (should be: Night 1: $100 + minibar $20, Night 2: $100 + room service $30, etc.)  
**Blocked Modules:** Hotel  
**Task:**
1. Create `Folio` model in schema:
   ```
   folio {
     id, tenantId, guestStayId, customerId, roomId, 
     checkInDate, checkOutDate, numberOfNights,
     roomRate, totalRoomCharge, extras, taxes, totalAmount
   }
   folioLineItems {
     id, folioId, date, description (room charge/extra), 
     amount, type (room/minibar/room_service/etc)
   }
   ```
2. Create `GuestStay` model if not exists (link guest → room → folio)
3. Implement Folio CRUD in `hotelRouter.ts`:
   - `folioCreate(guestStayId, roomId, checkInDate, checkOutDate)`
   - `folioGet(folioId)` — returns folio + line items by date
   - `folioAddLineItem(folioId, date, description, amount)` — add extra charge
   - `folioCheckout(folioId)` — finalize folio → invoice
4. Update Hotel module frontend to use Folio instead of generic invoice
5. Test: Guest check-in → add nightly extras → checkout → invoice

**Test Flow:**
```
Guest Check-in (Room 101, 2 nights)
→ Folio created with room rate = $100/night
→ Night 1: Add minibar charge $20 (folioLineItem)
→ Night 2: Add room service $30 (folioLineItem)
→ Checkout: Create invoice from folio
   Invoice shows: Room Night 1 ($100), Minibar ($20), Room Night 2 ($100), Room Service ($30)
```

**Estimated Effort:** 8-12 hours

---

### P1-2: Construction — Progress Billing
**Issue:** Construction invoicing uses generic product-line model instead of progress invoice with phases and retainage  
**Impact:** Cannot bill by project milestone or calculate retainage holds  
**Blocked Modules:** Construction  
**Task:**
1. Create `ProgressInvoice` model:
   ```
   progressInvoice {
     id, tenantId, projectId, invoiceNumber, invoiceDate,
     phaseName, completionPercent, scheduleOfValuesId,
     laborAmount, materialAmount, subtotal, 
     retainagePercent, retainageAmount, taxAmount, totalAmount
   }
   progressInvoiceItems {
     id, progressInvoiceId, description, category (labor/material/equipment),
     quantity, unitPrice, amount, phase
   }
   retentionAccount {
     id, tenantId, projectId, progressInvoiceId, 
     retainageAmount, retainagePercent, releasedAmount, status
   }
   ```
2. Implement Progress Invoice CRUD in `constructionRouter.ts`:
   - `progressInvoiceCreate(projectId, phaseName, scheduleOfValuesId)`
   - `progressInvoiceGet(id)` — returns invoice + items + retention
   - `progressInvoiceAddItem(progressInvoiceId, description, category, qty, price)`
   - `progressInvoiceFinalize(progressInvoiceId)` — calculate retainage, freeze
   - `retentionRelease(projectId, amount)` — release held amounts
3. Implement retainage calculation (5-10% hold by project settings)
4. Update Construction module frontend
5. Test: Project → Phase 1 (40% complete) → Progress Invoice #1 with retainage

**Test Flow:**
```
Project "Office Building" created with Schedule of Values = $100K
Phase 1: Foundation (Budget $10K, 100% complete)
→ Create Progress Invoice #1:
   Labor: $5K, Materials: $4K, Subtotal: $9K
   Retainage (10%): $900 held
   Total Invoice: $8.1K
→ Verify: Retention Account shows $900 held
```

**Estimated Effort:** 10-14 hours

---

### P1-3: Salon — Service + Appointment Billing
**Issue:** Salon invoicing uses generic product-line model instead of service/appointment model  
**Impact:** Cannot book appointments, assign stylists, or track service duration  
**Blocked Modules:** Salon  
**Task:**
1. Create/verify models:
   ```
   service {
     id, tenantId, name, duration (minutes), basePrice, category (haircut/color/etc)
   }
   stylist {
     id, tenantId, name, specialties, commissionPercent, hourlyRate
   }
   appointment {
     id, tenantId, customerId, stylistId, serviceId, 
     scheduledDate, startTime, endTime, status, notes
   }
   appointmentInvoice {
     id, tenantId, appointmentId, customerId, invoiceDate,
     services (itemized), stylistId, duration, tipAmount, totalAmount
   }
   ```
2. Implement Appointment CRUD:
   - `appointmentCreate(customerId, serviceId, stylistId, dateTime)` — book
   - `appointmentGet(id)` — retrieve appointment details
   - `appointmentCancel(id)`
   - `appointmentCheckout(id)` — create invoice from appointment
3. Implement AppointmentInvoice:
   - Auto-populate services from appointment
   - Calculate stylist commission
   - Allow tip entry
   - Generate invoice
4. Update Salon module frontend (calendar view, appointment form, checkout)
5. Test: Customer books haircut with Stylist A → checkout → invoice with service + tip

**Test Flow:**
```
Customer Books: Haircut (60 min, $50) with Stylist A (9am tomorrow)
→ Appointment created
→ Stylist A: Appointment shows on calendar
→ Appointment time: Complete service, checkout
→ AppointmentInvoice created:
   Haircut (60 min): $50
   Tip: $10
   Total: $60
   (Stylist A commission: $10 tracked separately)
```

**Estimated Effort:** 8-12 hours

---

### P1-4: Restaurant — Table Order + Bill Splitting
**Issue:** Restaurant has table/order model but no bill-splitting or proper table bill (not invoice)  
**Impact:** Cannot split bills between multiple customers at same table  
**Blocked Modules:** Restaurant  
**Task:**
1. Verify models exist (Table, TableOrder, OrderItem, OrderCourse)
2. Create `RestaurantBill` model:
   ```
   restaurantBill {
     id, tenantId, tableId, billNumber, billDate, 
     orderIds (linked), subtotal, taxAmount, totalAmount, 
     status (open/closed)
   }
   billPayment {
     id, billId, paymentMethod, amount, customerName, 
     timestamp, reference
   }
   ```
3. Implement Bill CRUD:
   - `billCreate(tableId, orderIds)` — combine table orders into bill
   - `billSplit(billId, [amounts])` — split into multiple payments
   - `billPayment(billId, amount, method)` — record payment
   - `billClose(billId)` — finalize
4. Update Restaurant POS frontend:
   - Table → Orders → Bill view (not invoice)
   - Bill splitting UI
   - Payment split UI
5. Test: Order 4 items on Table 5 → Split bill between 2 customers → Each pays $X

**Test Flow:**
```
Table 5: Orders placed (total $100)
→ Customer 1 pays $50 (cash)
→ Customer 2 pays $50 (card)
→ Bill closed with 2 payment records
```

**Estimated Effort:** 6-8 hours

---

### P1-5: Workshop — Job Bill (Labor + Parts)
**Issue:** Workshop has job model but not connected to billing  
**Impact:** Cannot generate job bills with labor hours + parts  
**Blocked Modules:** Workshop  
**Task:**
1. Create `JobBill` model:
   ```
   jobBill {
     id, tenantId, jobId, billNumber, billDate,
     technicianId, laborHours, laborRate, laborAmount,
     parts (itemized), partsAmount, subtotal, taxAmount, totalAmount
   }
   jobBillPart {
     id, jobBillId, partId, description, quantity, unitPrice, amount
   }
   ```
2. Implement Job → Bill conversion:
   - `jobBillCreate(jobId)` — create bill from completed job
   - `jobBillAddPart(jobBillId, partId, qty)` — add part to bill
   - `jobBillFinalize(jobBillId)` — calculate labor + parts + tax
3. Update Workshop module frontend:
   - Completed job → "Create Bill" button
   - Bill form shows technician + hours + parts
   - Bill preview before finalization
4. Test: Job completed → Technician: John (8 hours @ $50/hr) + Parts: Oil $20, Filter $15 → Bill

**Test Flow:**
```
Job "Car Engine Overhaul" marked complete
→ Technician: John
→ Labor: 8 hours @ $50/hr = $400
→ Add parts: Oil ($20), Filter ($15)
→ Subtotal: $435, Tax: $65, Total: $500
```

**Estimated Effort:** 6-8 hours

---

### P1-6: Pharmacy — Prescription → Invoice Flow
**Issue:** Pharmacy has prescription model but connection to invoicing unclear  
**Impact:** Cannot track prescription fulfillment → billing → insurance co-pay  
**Blocked Modules:** Pharmacy  
**Task:**
1. Verify `Prescription` and `PrescriptionItem` models exist
2. Create `PrescriptionInvoice` model:
   ```
   prescriptionInvoice {
     id, tenantId, prescriptionId, customerId, invoiceDate,
     status (draft/dispensed/paid)
   }
   prescriptionInvoiceItem {
     id, prescriptionInvoiceId, medicationId, quantity, 
     unitPrice, insuranceCoPayAmount, patientPayAmount, totalAmount
   }
   ```
3. Implement Pharmacy CRUD:
   - `prescriptionGet(prescriptionId)` — retrieve prescription
   - `prescriptionInvoiceCreate(prescriptionId)` — convert prescription to invoice
     - Auto-populate medications from prescription
     - Calculate insurance co-pay if customer has insurance
     - Calculate patient pay portion
   - `prescriptionFulfill(prescriptionInvoiceId)` — mark as dispensed
4. Update Pharmacy module frontend:
   - Prescription list
   - Prescription detail (medications)
   - "Create Invoice" button
   - Invoice with co-pay breakdown
5. Test: Rx received → Create invoice (co-pay $10, patient pays $10, insurance pays $30 out of $50 total)

**Test Flow:**
```
Rx received: Medication A ($50)
Patient insurance: Covers 60%, co-pay $10
→ Create PrescriptionInvoice:
   Medication A: $50
   Insurance coverage: $30
   Patient co-pay: $10
   Patient additional: $10
   Total: $50
```

**Estimated Effort:** 6-8 hours

---

### P1-7: School — Tuition Bill
**Issue:** School invoicing uses generic product-line model  
**Impact:** Cannot generate tuition bills with itemized fees + discounts  
**Blocked Modules:** Education  
**Task:**
1. Create models:
   ```
   student {
     id, tenantId, name, enrollmentNumber, class, 
     academicYear, status (active/graduated/inactive)
   }
   term {
     id, tenantId, academicYear, termName, startDate, endDate
   }
   tuitionBill {
     id, tenantId, studentId, termId, billNumber, billDate,
     tuitionAmount, feeItems, discountAmount, totalAmount
   }
   tuitionBillItem {
     id, billId, description (tuition/exam/sports/etc), amount
   }
   ```
2. Implement Tuition Bill CRUD:
   - `tuitionBillCreate(studentId, termId)` — generate term bill
   - `tuitionBillAddFee(billId, description, amount)` — add fee item
   - `tuitionBillApplyDiscount(billId, reason, amount)`
   - `tuitionBillFinalize(billId)` — calculate total
3. Update Education module frontend
4. Test: Student → Term → Bill with tuition ($5K) + exam fee ($500) - scholarship ($1K)

**Estimated Effort:** 4-6 hours

---

### P1-8: Real Estate — Rental Bill
**Issue:** Real Estate invoicing uses generic model  
**Impact:** Cannot generate rental bills with utilities + fees breakdown  
**Blocked Modules:** Real Estate  
**Task:**
1. Create models:
   ```
   rentalProperty {
     id, tenantId, address, bedrooms, rentalRate
   }
   rentalLease {
     id, tenantId, propertyId, tenantName, startDate, endDate, 
     monthlyRate, securityDeposit, status
   }
   rentalBill {
     id, tenantId, leaseId, billNumber, billDate, 
     rentAmount, utilities, fees, totalAmount, dueDate
   }
   ```
2. Implement Rental Bill CRUD (similar to Tuition)
3. Update Real Estate module frontend
4. Test: Property → Lease → Monthly bill with rent ($1K) + utilities ($200) + maintenance fee ($100)

**Estimated Effort:** 4-6 hours

---

### P1-9-13: Transportation, Travel, Gym, Laundry, Hostel
**Issue:** All 5 use generic invoice model  
**Impact:** Cannot generate industry-correct bills  
**Blocked Modules:** Transportation, Travel, Gym, Laundry, Hostel  

Similar pattern for each (refer to VERTICAL_BUSINESS_LOGIC_SPEC.md for details):
- **Transportation:** Shipment bill with freight + distance + fuel + handling
- **Travel:** Package bill with accommodations + activities + meals (itemized by category)
- **Gym:** Membership bill with base fee + personal training + classes (recurring)
- **Laundry:** Service job with garment itemization + service type
- **Hostel:** Booking bill with bed rate (nightly) + facility fees

Each requires custom model + CRUD + frontend.

**Combined Estimated Effort:** 15-20 hours

---

## 🟡 P1-14: Warehouse — Auto-Generate Putaway/Picking Tasks

**Issue:** GRN and Sales Orders exist but do NOT automatically create Putaway/Picking tasks  
**Impact:** Manual task creation required; WMS workflow incomplete  
**Blocked Modules:** Warehouse Management  
**Task:**
1. Create triggers/hooks in `wmsRouter.ts`:
   - On GRN creation → auto-create Putaway tasks for each received item
   - On Sales Order → auto-create Picking tasks
2. Implement:
   - `grnCreate()` should call internal `_createPutawayTasks(grnId, items)`
   - `salesOrderCreate()` should call internal `_createPickingTasks(orderId, items)`
3. Verify `putawayTaskComplete()` and `pickingTaskComplete()` update `inventory_balances`
4. Test GRN → Putaway → Stock location (verify balance updated)

**Test Flow:**
```
GRN received: 100 units of Product A
→ Putaway task auto-created: "Place 100x Product A in Zone A, Location A-1"
→ Warehouse operator: Complete putaway task
→ Verify: inventory_balances[Product A] += 100
```

**Estimated Effort:** 4-6 hours

---

## 🟡 P2 — IMPORTANT BUT NOT BLOCKING

These improve robustness but aren't required for core functionality.

### P2-1: Invoice Delete Cleanup
Verify `invoiceDelete()` properly cascades to `invoice_items` and ZATCA records.

**Estimated Effort:** 1-2 hours

---

### P2-2: Offline/Sync Queue
Test invoice queuing when offline; verify sync on reconnect.

**Estimated Effort:** 4-6 hours

---

### P2-3: Bill Printing — Receipt Formatting
Optimize receipt layout (margins, spacing, barcode positioning).

**Estimated Effort:** 2-4 hours

---

### P2-4: Multi-Language Support
Ensure invoices can render in Arabic + English (ZATCA compliance).

**Estimated Effort:** 3-5 hours

---

### P2-5: Audit Trail
Add invoice modification history (who changed what, when).

**Estimated Effort:** 3-5 hours

---

### P2-6: ZATCA Compliance Reporting
Implement monthly ZATCA invoice reporting + compliance checks.

**Estimated Effort:** 4-6 hours

---

## SUMMARY TABLE

| Priority | Task ID | Module | Status | Est. Hours | Blocker |
|----------|---------|--------|--------|-----------|---------|
| **P0** | P0-1 | Sales | Frontend | 4-6 | All View operations |
| **P0** | P0-2 | Sales | Frontend | 4-6 | All Edit operations |
| **P0** | P0-3 | Printing | Backend | 6-8 | POS thermal printing |
| **P0** | P0-4 | Printing | Backend | 6-8 | A4 invoice download |
| **P1** | P1-1 | Hotel | Schema + Backend + Frontend | 8-12 | Hotel billing |
| **P1** | P1-2 | Construction | Schema + Backend + Frontend | 10-14 | Progress billing |
| **P1** | P1-3 | Salon | Schema + Backend + Frontend | 8-12 | Appointment billing |
| **P1** | P1-4 | Restaurant | Backend + Frontend | 6-8 | Table bill splitting |
| **P1** | P1-5 | Workshop | Backend + Frontend | 6-8 | Job bill generation |
| **P1** | P1-6 | Pharmacy | Backend + Frontend | 6-8 | Rx-to-invoice flow |
| **P1** | P1-7 | School | Schema + Backend + Frontend | 4-6 | Tuition billing |
| **P1** | P1-8 | Real Estate | Schema + Backend + Frontend | 4-6 | Rental billing |
| **P1** | P1-9-13 | Trans, Travel, Gym, Laundry, Hostel | Schema + Backend + Frontend | 15-20 | 5-vertical billing |
| **P1** | P1-14 | Warehouse | Backend | 4-6 | WMS auto-workflow |
| **P2** | P2-1-6 | Various | Mixed | 18-32 | Polish items |

**Total P0 Effort:** 20-28 hours  
**Total P1 Effort:** 72-100 hours  
**Total P2 Effort:** 18-32 hours  
**Grand Total:** ~110-160 hours

---

## NEXT STEP

**Proceed to STAGE D:** Implement tasks in priority order.
- Start with P0 (critical path blocker)
- Then P1 (core vertical logic)
- Then P2 (polish)

Each task should be:
1. Code changes committed with meaningful message
2. Tested in live app (manual or automated)
3. Verified in task completion checklist

See `/home/ubuntu/real-erp/PRODUCTION_LAUNCH_REPORT.md` (to be created after STAGE D) for final verification sign-off.
