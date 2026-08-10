# STAGE B AUDIT FRAMEWORK — Systematic Scan of All Verticals

## Methodology
For each vertical/module:
1. **Code Scan**: Check router for invoice/billing CRUD operations
2. **Schema Check**: Verify if using generic invoice or vertical-specific model
3. **Live Test**: Create → Read → Update → Delete → Print
4. **Comparison**: Does current implementation match VERTICAL_BUSINESS_LOGIC_SPEC.md?

---

## Module Audit Checklist

### SALES (Generic)
- [ ] invoiceCreate endpoint exists? Yes/No
- [ ] invoiceGet endpoint exists? Yes/No  
- [ ] invoiceUpdate endpoint exists? Yes/No
- [ ] invoiceDelete endpoint exists? Yes/No
- [ ] Thermal print function? Yes/No
- [ ] A4 print function? Yes/No
- [ ] Uses generic invoice table? Yes/No
- [ ] Create → View → Edit → Print works in live app? Yes/No
- **Gap Analysis:**

### HOTEL
- [ ] Folio model exists (separate from generic invoice)? Yes/No
- [ ] Room/RoomType models exist? Yes/No
- [ ] GuestStay model exists? Yes/No
- [ ] Nightly breakdown calculation implemented? Yes/No
- [ ] Extra charges per-night tracking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### CONSTRUCTION
- [ ] ProgressInvoice model exists (separate from generic)? Yes/No
- [ ] Project/Phase/Milestone models exist? Yes/No
- [ ] ScheduleOfValues implemented? Yes/No
- [ ] Labor tracking (hours × rate per tech)? Yes/No
- [ ] Material allocation to phases? Yes/No
- [ ] Retainage calculation (5-10%)? Yes/No
- [ ] Change order handling? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### SALON
- [ ] Service model exists? Yes/No
- [ ] Stylist/Provider models exist? Yes/No
- [ ] Appointment model exists? Yes/No
- [ ] Appointment → AppointmentInvoice flow? Yes/No
- [ ] Service duration tracking? Yes/No
- [ ] Stylist commission calculation? Yes/No
- [ ] Package/membership deduction? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### RESTAURANT (POS Restaurant)
- [ ] Table model exists? Yes/No
- [ ] TableOrder model exists? Yes/No
- [ ] OrderItem with course breakdown (appetizer, main, etc.)? Yes/No
- [ ] Menu integration? Yes/No
- [ ] Table status tracking? Yes/No
- [ ] Bill splitting per table? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### WORKSHOP
- [ ] Job model exists? Yes/No
- [ ] Technician/Labor tracking? Yes/No
- [ ] Parts inventory integration? Yes/No
- [ ] Labor hours × rate calculation? Yes/No
- [ ] Parts cost per job? Yes/No
- [ ] Warranty tracking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### PHARMACY
- [ ] Prescription model exists (separate from invoice)? Yes/No
- [ ] Medication inventory? Yes/No
- [ ] Insurance co-pay handling? Yes/No
- [ ] Drug interaction checking? Yes/No
- [ ] Controlled substance logging? Yes/No
- [ ] Prescription → Bill conversion? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### WAREHOUSE/WMS
- [ ] Zone CRUD works? Yes/No
- [ ] Location CRUD works? Yes/No
- [ ] Stock transfer updates inventory_balances? Yes/No
- [ ] GRN updates inventory_balances? Yes/No
- [ ] Putaway tasks functional? Yes/No
- [ ] Picking tasks functional? Yes/No
- [ ] Wave picking functional? Yes/No
- [ ] Cycle count functional? Yes/No
- **Specific Failures:**

### SCHOOL/EDUCATION
- [ ] Student model exists? Yes/No
- [ ] Term/Semester model exists? Yes/No
- [ ] Tuition bill generation? Yes/No
- [ ] Fee itemization? Yes/No
- [ ] Discount/Scholarship handling? Yes/No
- [ ] Payment plan tracking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### HEALTHCARE
- [ ] Patient model exists? Yes/No
- [ ] Appointment model exists? Yes/No
- [ ] Prescription model? Yes/No
- [ ] Treatment plan model? Yes/No
- [ ] Medical record storage? Yes/No
- [ ] NPHIES compliance? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### REAL ESTATE
- [ ] Property model exists? Yes/No
- [ ] Tenant/Lease models exist? Yes/No
- [ ] Rental bill generation (rent + utilities)? Yes/No
- [ ] Utility tracking per tenant? Yes/No
- [ ] Late fee calculation? Yes/No
- [ ] Deposit tracking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### TRANSPORTATION/LOGISTICS
- [ ] Shipment model exists? Yes/No
- [ ] Carrier/RateCard models exist? Yes/No
- [ ] Freight base + surcharges calculation? Yes/No
- [ ] Distance/weight tracking? Yes/No
- [ ] Fuel surcharge? Yes/No
- [ ] Special handling charges? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### TRAVEL/TOURISM
- [ ] Package/Trip model exists? Yes/No
- [ ] Accommodation + Activities + Meals? Yes/No
- [ ] Bill itemization by category? Yes/No
- [ ] Multi-destination tracking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### GYM/FITNESS
- [ ] Member model exists? Yes/No
- [ ] MembershipType with recurring billing? Yes/No
- [ ] Personal training session tracking? Yes/No
- [ ] Class fee handling? Yes/No
- [ ] Commission tracking? Yes/No
- [ ] Attendance tracking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### LAUNDRY/DRY CLEANING
- [ ] ServiceJob model exists? Yes/No
- [ ] Garment itemization (qty per type)? Yes/No
- [ ] Service type per garment? Yes/No
- [ ] Special requests (rush, stain removal)? Yes/No
- [ ] Pickup date tracking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

### HOSTEL
- [ ] Room/Bed models exist? Yes/No
- [ ] Booking model with nightly rates? Yes/No
- [ ] Facility fee tracking? Yes/No
- [ ] Deposit handling? Yes/No
- [ ] Check-in/out dates per booking? Yes/No
- [ ] Uses generic invoice as fallback? Yes/No
- **Gap Analysis:**

---

## PRINTING AUDIT

- [ ] Thermal 80mm: Template exists? Works in live app?
- [ ] Thermal 58mm: Template exists? Works in live app?
- [ ] A4 Invoice: Template exists? Works in live app?
- [ ] A4 Receipt: Template exists? Works in live app?

---

## DATABASE LAYER AUDIT

- [ ] MySQL or SQLite? Current configuration in code?
- [ ] invoice table: Schema definition?
- [ ] invoice_items table: Schema definition?
- [ ] Vertical-specific tables: Which exist?
- [ ] Relation definitions in schema?

---

## LIVE APP ROUND-TRIP TEST

For each vertical with invoicing:
1. Create record (invoice/folio/bill)
2. View created record
3. Edit record
4. View edited record  
5. Attempt thermal print
6. Attempt A4 print
7. Verify list shows updated record

**Result: [ ] Pass / [ ] Fail — Details:**

---

## P0 ISSUES (IMMEDIATE)

Critical issues found:
- [ ] Invoice view broken
- [ ] Invoice edit broken
- [ ] Invoice delete broken
- [ ] Thermal print broken
- [ ] A4 print broken
- [ ] Stock transfer not updating inventory
- [ ] GRN not updating inventory
- [ ] Warehouse sections non-functional

---

## SUMMARY

**Modules with correct vertical logic:** ___ / 13
**Modules using generic invoice fallback:** ___ / 13
**Modules with broken CRUD:** ___ / 13
**Modules with broken printing:** ___ / 13
**Database layer clarification:** [ ] Needed

