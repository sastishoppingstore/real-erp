# VERTICAL_BUSINESS_LOGIC_SPEC.md

**Stage A: Research — What Each Vertical Actually Needs to Run a Real Business**

This document defines the correct business logic, workflows, and data models for each industry vertical in YASCO. This is NOT a generic invoice form with a label change. Each vertical describes what real competitors (Zoho, industry-specific software, etc.) implement and what our system must match or exceed.

---

## 1. HOTEL

### What the "Invoice" Actually Is
A **folio** — a date-based guest account that accumulates charges across a stay (check-in to check-out), not an invoice for line-item products.

**Structure:**
- One folio per guest per stay
- Nightly room charge: room type × length of stay × daily rate
- Each night appears as a separate line with: date, room number, room type, nightly rate, tax per night, subtotal
- Additional charges posted per-night or per-stay: minibar, spa, room service, late checkout fee, extras
- Calculated on checkout or on demand
- Tax is applied per night (not flat-rate on whole stay)

### Core Entities Beyond Generic Invoice
- `RoomType` — define occupancy, base rate, seasonal rates
- `Room` — physical inventory, current guest, next reservation date
- `GuestStay` — check-in date, check-out date, guest ID, room assigned, rate agreed, status (checked-in, checked-out, no-show)
- `Folio` — one per stay, ID-linked to GuestStay
- `FolioLineItem` — date-stamped charges (room rate, extras, service charges) that accumulate per night
- `RoomAvailability` — block-out dates, seasonal pricing, early-bird rates
- `Deposit` — pre-arrival hold, reconciled at checkout or refunded

### What Customers Expect (vs. Generic Invoice + vs. Zoho Hotels PMS)
- **Correct:** Nightly breakdown on folio. Date, room description, rate, tax per night, total per night. Subtotals per date.
- **Wrong (what generic ERP does):** One line "Hotel Stay" for the whole stay, or product-line format "Room Charge | 1 × $150 | $150." No nightly breakdown.
- **Zoho Hotels has:** Real-time occupancy calendar, reservation management from same screen, automatic folio post on check-in, guest portal to view charges, integration to payment gateways, ancillary revenue tracking.

### Workflow
1. Guest books → GuestStay created with check-in/out dates, room assigned, rate agreed.
2. Check-in: system posts first night's room charge to folio automatically.
3. During stay: extras (minibar, room service, spa) auto-post to that guest's folio in real-time.
4. Each day at midnight (or on-demand): nightly charge auto-posts for next night.
5. Check-out: folio finalized, payment collected, reconciliation recorded.
6. Folio is the final bill and ledger entry (no separate "create invoice" step).

---

## 2. CONSTRUCTION

### What the "Invoice" Actually Is
A **progress invoice** — billing for work completed in a specific phase/milestone of a project, per contract and change orders.

**Structure:**
- Tied to a specific project and phase/milestone
- References the original contract value and all approved change orders
- Line items are NOT products: they are tasks/phases with dollar value (e.g., "Foundation" $50k, "Framing" $75k, "Electrical" $40k).
- Calculated as: (Earned to date per schedule of values) − (Prior billings) − (Retainage) = Current invoice amount
- Retainage hold: typically 5–10% of invoice, held until project completion or release milestone
- Each invoice is accompanied by a lien waiver (proof contractor can't lien the owner for that payment)
- Change orders create separate line items or increase the schedule value

### Core Entities Beyond Generic Invoice
- `Project` — contract value, start date, completion date, payment terms, retainage %.
- `Phase` or `Milestone` — named (Foundation, Framing, Electrical, etc.), budgeted cost, start/end dates, status (not started, in-progress, complete).
- `ScheduleOfValues` — frozen breakdown of contract cost into tasks/phases with % of total. Used for all progress invoices.
- `LaborTracking` — worker, hours logged, hourly rate, task/phase assigned, date.
- `MaterialRequisition` — materials purchased for project, cost, quantity, task/phase, date.
- `ProgressInvoice` — tied to phase, includes all labor + materials + overhead allocated to that phase, shows earned amount, retainage, net due.
- `ChangeOrder` — modifies original contract sum, creates new line on schedule of values.
- `RetainageHold` — tracks 5–10% withheld per invoice, released at final completion or on-demand.
- `LienWaiver` — document confirming contractor acknowledges payment received and waives right to lien property.

### What Customers Expect (vs. Generic Invoice + vs. Procore/Jonas)
- **Correct:** Invoice shows project name, phase/milestone being billed, % of phase complete, labor hours + cost, materials used, overhead applied, subtotal earned, retainage held, net due, and prior billings reference.
- **Wrong (what generic ERP does):** One line "General Contractor Services | 1 × $50,000 | $50,000" or item-quantity-price list with no reference to project phase or contract.
- **Procore has:** Labor time capture on-site via mobile, automatic aggregation into progress invoices, retainage tracking and release workflows, AIA G702/G703 form generation, change order control, lien waiver routing (digital approval chain).

### Workflow
1. Project created with ScheduleOfValues frozen (e.g., Foundation $50k, Framing $75k, etc.).
2. Work happens: labor logged, materials received, allocated to phases.
3. Month-end or milestone: ProgressInvoice generated for phase(s) complete.
   - Sums labor hours × rate + materials + overhead for that phase.
   - Calculates retainage (5–10% withheld).
   - Shows earned − prior − retainage = net due.
4. Invoice sent with lien waiver request.
5. Customer approves, makes payment.
6. Retainage released on final completion or per terms.

---

## 3. SALON / BEAUTY

### What the "Invoice" Actually Is
A **service invoice** — listing the services rendered (cut, color, wash, etc.) by the stylist(s) who performed them, with duration, date, and price.

**Structure:**
- One invoice per appointment or per visit
- Line items are services, NOT products (though products may be added as extras)
- Each line shows: service name, duration (minutes), stylist name, price, subtotal
- Price is often stylist-dependent ("haircut with stylist A" costs different than "haircut with stylist B")
- Tip is calculated separately (% of service total) and added
- Package memberships deducted (e.g., "10 haircuts pre-purchased" → deduct from package balance)
- Commission tracking: which stylist earns what from each service

### Core Entities Beyond Generic Invoice
- `Service` — name, base duration (min), base price, category (hair, nails, skincare, wellness)
- `ServiceVariant` — same service, different stylist or tier (e.g., "Haircut - Junior" $25 vs. "Haircut - Senior" $45)
- `Stylist` or `Provider` — name, rate/commission per service, specializations, availability calendar (booked/available slots)
- `Appointment` — date, time, client, stylist(s) assigned, service(s) selected, duration, price (possibly overridden)
- `AppointmentInvoice` — generated from completed appointment; lists services + stylist + duration + price
- `ClientPackage` — "10 haircuts" or "monthly unlimited massages" pre-purchased; deducted from package balance on each use
- `ClientLoyalty` — points earned per visit, redeemable for discounts or free services
- `NoShow` — cancelled appointments without notice; often charged per policy

### What Customers Expect (vs. Generic Invoice + vs. GlossGenius/Vagaro)
- **Correct:** Invoice shows service name, duration, stylist name, price per service, subtotal, tip (calculated as % if desired), total, and possibly package balance remaining.
- **Wrong (what generic ERP does):** Line "Service" | 1 | $50 | $50" with no service name, duration, or stylist; or treating a 30-minute haircut and a 90-minute color as the same "product."
- **GlossGenius has:** Online booking with stylist availability visible, service duration auto-calculated per stylist, commission tracking per stylist, package/membership deduction on invoice, tip collection at checkout, client portal with appointment history and loyalty points.

### Workflow
1. Client books online appointment: selects service(s) and preferred stylist (if available) → date/time confirmed.
2. Appointment happens: stylist performs service(s).
3. Check-out (or on-demand): AppointmentInvoice generated.
   - Lists each service with stylist name, duration, price.
   - Deducts from package if applicable.
   - Adds tip (% or flat).
   - Payment collected.
4. Stylist commission calculated and logged for payroll.

---

## 4. RESTAURANT / BAR

### What the "Invoice" Actually Is
A **table/order bill** — itemized charges for a single table's meal, including food, drinks, dessert, and any add-ons (service charge, gratuity, taxes).

**Structure:**
- One bill per table (or per order if take-out/delivery)
- Organized by course: appetizers, main courses, desserts, drinks, extras
- Each line item is a specific dish or drink offered on the menu, not a generic "meal"
- Price includes per-dish price (not by component)
- Subtotal, taxes, service charge (if auto-added), tip (if line-item vs. calculated), total
- For delivery/to-go: order number, timing, and any special instructions

### Core Entities Beyond Generic Invoice
- `Restaurant` — name, address, hours, menu sections
- `MenuItem` — dish/drink name, category (appetizer, main, dessert, drink), price, description, ingredients (for dietary tracking)
- `MenuSection` — appetizers, mains, desserts, drinks, specials
- `Table` — table number, capacity (seats), status (vacant, occupied, reserved)
- `TableOrder` — table number, start time, end time (duration), server name, guest count, items ordered
- `OrderItem` — menu item, quantity, price, course (appetizer, main, etc.), special instructions
- `RestaurantBill` — generated from TableOrder, itemized by course, includes subtotal, tax, service charge, tip, total, payment method
- `OrderModifier` — customizations (no onions, extra sauce, gluten-free, etc.)

### What Customers Expect (vs. Generic Invoice + vs. Toast/Square/Toast)
- **Correct:** Bill shows date/time, course breakdown (Appetizers, Mains, Desserts, Drinks), each dish with price, subtotal, tax, service charge if added, tip line, total.
- **Wrong (what generic ERP does):** One line "Meal" | 1 | $50 | $50" with no course breakdown, dishes listed, or tax/service calculation.
- **Toast/Square have:** Table management with real-time status, menu with add-ons/modifiers per item, split bills (multiple payments per table), tip collection at terminal, course-based itemization.

---

## 5. WORKSHOP / REPAIR GARAGE

### What the "Invoice" Actually Is
A **job/repair bill** — charges for labor hours + parts/materials used to complete a specific repair or service job.

**Structure:**
- One invoice per job (e.g., "Car engine repair", "Bike tire replacement")
- Labor: technician name, hours spent, hourly rate (possibly with overtime or skill multiplier)
- Parts: itemized cost per part used, with part number/SKU
- Subtotal (labor + parts), tax, total
- May include warranty offered on labor or parts

### Core Entities Beyond Generic Invoice
- `Job` — job number, date received, date completed, vehicle/asset description, customer, status (received, in-progress, completed, ready for pickup)
- `JobLineItem` — labor (tech name, hours, rate) or parts (part name, quantity, cost)
- `TechnicianRate` — technician name, hourly rate, specializations
- `Part` — part number, name, cost, supplier
- `WorkshopBill` — generated from Job, lists labor + parts, subtotal, tax, total
- `Warranty` — labor warranty (e.g., "90 days on this repair"), parts warranty (manufacturer or shop)

### What Customers Expect (vs. Generic Invoice + vs. Repairshopr/Tekmetrics)
- **Correct:** Invoice shows job description, start/end date, each technician's name and hours at their rate, subtotal for labor, each part with quantity and cost, subtotal for parts, tax, total, and warranty terms.
- **Wrong (what generic ERP does):** One line "Auto Repair" | 1 | $500 | $500" with no breakdown of labor vs. parts or tech names.
- **Repairshopr has:** Job queue with status per station, labor time capture per tech (including start/stop buttons), parts inventory, automatic bill generation on job completion, warranty tracking.

---

## 6. PHARMACY

### What the "Invoice" Actually Is
A **prescription fulfillment bill** — medications and supplies dispensed against a valid prescription, including patient name, medications, quantities, insurance co-pay/deductible, and compliance notes.

**Structure:**
- One bill per prescription (or per visit if multiple prescriptions)
- Medication name, strength, quantity dispensed, price (before insurance/co-pay)
- Insurance processing: co-pay amount, deductible applied, insurance payment vs. patient out-of-pocket
- Refill information and next available date
- Pharmacist notes (drug interactions, side effects, storage)

### Core Entities Beyond Generic Invoice
- `Prescription` — prescription number, patient, prescriber (doctor), medication, quantity, refills, date issued, expiration
- `Medication` — drug name, strength, form (tablet, liquid, etc.), manufacturer, cost, insurance code
- `PrescriptionItem` — medication, quantity dispensed, date dispensed, expiration date
- `Insurance` — patient's insurance provider, plan, co-pay amounts, formulary
- `PharmacyBill` — generated from prescription fill, shows medication, price, insurance co-pay, patient out-of-pocket
- `DrugInteraction` — database of known interactions, checked at fill time
- `ControlledSubstance` — tracked separately with serial numbers and compliance logging

### What Customers Expect (vs. Generic Invoice + vs. PioneerRx/ScriptPro)
- **Correct:** Receipt shows patient name, medication name/strength, quantity, price before insurance, co-pay amount, insurance information, and next refill date.
- **Wrong (what generic ERP does):** One line "Medication" | 1 | $50 | $50" with no drug name, strength, quantity, or insurance processing.

---

## 7. SCHOOL / EDUCATION

### What the "Invoice" Actually Is
A **tuition/fees bill** — charges for enrollment, tuition per term/semester, and facility/activity fees, often recurring (monthly, per term).

**Structure:**
- Student name, grade/class, term/semester
- Tuition amount (base rate for the term)
- Fees (activity, lab, sports, meals if applicable)
- Discounts (early payment, sibling, scholarship)
- Subtotal, taxes (if applicable), total
- Payment schedule (due date(s), late fees if applicable)

### Core Entities Beyond Generic Invoice
- `Student` — name, grade, parent/guardian, enrollment status
- `Term` or `Semester` — start date, end date, tuition amount, fees breakdown
- `EnrollmentRecord` — student, term, grade, tuition rate
- `Discount` — sibling, early payment, scholarship (fixed $ or %)
- `Fee` — activity, lab, meal plan, sports, type and amount
- `TuitionBill` — generated per student per term, shows tuition, fees, discounts, total
- `PaymentPlan` — installment schedule (monthly over 10 months, lump sum, etc.)

### What Customers Expect (vs. Generic Invoice + vs. Blackboard/Infinite Campus)
- **Correct:** Invoice shows student name/grade, term, tuition, itemized fees, discounts, total, and payment plan/due dates.
- **Wrong (what generic ERP does):** One line "Tuition" | 1 | $5,000 | $5,000" with no fees breakdown or payment plan.

---

## 8. REAL ESTATE / PROPERTY MANAGEMENT

### What the "Invoice" Actually Is
A **rental/lease bill** — monthly rent + utilities + maintenance fees + tenant-specific charges (late fee, damage, etc.).

**Structure:**
- Tenant name, property address, lease period
- Base rent (monthly or as-agreed)
- Utilities (electric, water, gas) — tenant's portion or passed-through
- Maintenance fees (if common area, shared amenities)
- Additional charges (damage, late rent, pet fees if applicable)
- Subtotal, total, due date, late fee if applicable

### Core Entities Beyond Generic Invoice
- `Property` — address, type (apartment, house, commercial), unit number if applicable, owner
- `Tenant` — name, lease start/end, monthly rent, move-in deposit
- `Lease` — start date, end date, rent amount, renewal terms, special conditions
- `Utility` — electric, water, gas; tenant's usage/share
- `RentalBill` — monthly, shows base rent, utilities, fees, total, due date
- `PaymentRecord` — payment received, late payment tracking

### What Customers Expect (vs. Generic Invoice + vs. Landlord/AppFolio)
- **Correct:** Invoice shows property address, tenant name, lease period, base rent, itemized utilities/fees, total due, due date, late fee policy.
- **Wrong (what generic ERP does):** One line "Rent" | 1 | $1,200 | $1,200" with no utilities, fees, or lease context.

---

## 9. TRANSPORTATION / LOGISTICS

### What the "Invoice" Actually Is
A **shipment/delivery bill** — charges for freight, distance, weight/volume, fuel surcharge, and any special handling (hazmat, temperature control, etc.).

**Structure:**
- Shipment ID, origin/destination, date(s)
- Base freight rate (by weight, volume, or flat rate per shipment)
- Distance surcharge (if applicable)
- Fuel surcharge (% of base)
- Special handling charges (hazmat, temperature, fragile, white-glove, etc.)
- Subtotal, taxes, total

### Core Entities Beyond Generic Invoice
- `Shipment` — tracking number, origin, destination, weight, volume, date sent, date delivered
- `Carrier` — company name (in-house or 3rd-party), rate card
- `RateCard` — base freight rates by zone/distance/weight, fuel surcharge %, special handling fees
- `TransportBill` — shipment, freight base, distance surcharge, fuel surcharge, special handling, subtotal, tax, total
- `DeliveryProof` — signature, timestamp, condition notes

### What Customers Expect (vs. Generic Invoice + vs. Freightview/Roadrunner)
- **Correct:** Invoice shows shipment details (origin, destination, weight), freight base, surcharges, total, tracking number.
- **Wrong (what generic ERP does):** One line "Freight" | 1 | $500 | $500" with no shipment context, distance, or surcharge breakdown.

---

## 10. TRAVEL / TOURISM

### What the "Invoice" Actually Is
A **package/trip bill** — charges for accommodations, activities/tours, meals (if included), transportation, and guide/concierge fees.

**Structure:**
- Traveler(s) name, trip dates, destination(s)
- Accommodations: property name, nightly rate, number of nights
- Activities: tour name, date, participants, price per person
- Meals: number of meals, included or à la carte pricing
- Transportation: flights/transfers, date, cost
- Subtotal per category, total

### Core Entities Beyond Generic Invoice
- `TravelPackage` — package name, destination(s), start/end dates, inclusions
- `Accommodation` — hotel/resort name, check-in/out dates, nightly rate
- `Activity` or `Tour` — name, date, time, participants, price per person
- `Meal` — breakfast, lunch, dinner; included or à la carte
- `Transportation` — flight, transfer, rental car; date, cost
- `TravelBill` — traveler(s), package name, dates, itemized by category (accommodations, activities, meals, transport), total

### What Customers Expect (vs. Generic Invoice + vs. Tourico/Rezdy)
- **Correct:** Invoice shows traveler names, trip dates, accommodation with nightly rate × nights, activities with date/cost, meals, transport, and total.
- **Wrong (what generic ERP does):** One line "Travel Package" | 1 | $2,000 | $2,000" with no breakdown of accommodations, activities, or meals.

---

## 11. GYM / FITNESS

### What the "Invoice" Actually Is
A **membership/session bill** — recurring membership fee (monthly/annual) or per-session charges, plus any personal training, classes, or equipment rental.

**Structure:**
- Member name, membership type (basic, premium, unlimited)
- Membership fee (monthly or annual pro-rated)
- Personal training sessions: trainer name, date, duration, rate per session
- Class fees (if à la carte)
- Equipment rental (locker, towel service, etc.)
- Subtotal, tax, total, next billing date

### Core Entities Beyond Generic Invoice
- `Member` — name, membership start, membership type, status (active, paused, cancelled)
- `MembershipType` — basic, premium, unlimited; monthly/annual cost
- `PersonalTrainer` — name, hourly rate
- `FitnessClass` — class name, instructor, schedule, capacity
- `GymBill` — member, billing period, membership fee, training sessions, class fees, total, next billing date

### What Customers Expect (vs. Generic Invoice + vs. Zen Planner/Mariana Tek)
- **Correct:** Invoice shows member name, membership type and fee, personal training sessions with trainer/date/cost, any class fees, and next billing date.
- **Wrong (what generic ERP does):** One line "Gym Membership" | 1 | $50 | $50" with no breakdown of training or classes.

---

## 12. LAUNDRY / DRY CLEANING

### What the "Invoice" Actually Is
A **service job bill** — itemized by garment type (shirt, pants, coat, dress, etc.), quantity, service type (wash, dry clean, iron, etc.), and any special requests.

**Structure:**
- Customer name, drop-off date, expected pickup date
- Garment type and quantity: "3 shirts", "2 pairs of pants", "1 coat"
- Service per garment: dry clean, wash/fold, iron
- Special requests: urgent (rush fee), stain removal, delicate care
- Per-item charge × quantity, subtotal, taxes, total

### Core Entities Beyond Generic Invoice
- `Customer` — name, phone, address, preferred pickup/delivery
- `ServiceJob` — job number, drop-off date, expected pickup, garment list
- `GarmentItem` — garment type, quantity, service (dry clean, wash, iron, etc.)
- `SpecialRequest` — rush fee, stain removal, delicate, etc.
- `LaundryBill` — job number, date, itemized by garment, special requests, total, pickup date

### What Customers Expect (vs. Generic Invoice + vs. Clothingline/Washos)
- **Correct:** Invoice shows job number, each garment type and quantity, service type, any rush/special fees, total, and pickup date.
- **Wrong (what generic ERP does):** One line "Laundry Service" | 1 | $30 | $30" with no garment list or service breakdown.

---

## 13. HOSTEL / ACCOMMODATION (SHARED)

### What the "Invoice" Actually Is
A **booking bill** — nightly bed rate (private room or shared dorm) + facility fees (linen, lockers, cleaning deposit if applicable).

**Structure:**
- Guest name, check-in/out dates, number of nights
- Room type (private or dorm), bed number (if dorm)
- Nightly rate × number of nights
- Facility fees (linen, locker, WiFi if charged, cleaning deposit if applicable)
- Subtotal, taxes (if applicable), total, deposit refund schedule if applicable

### Core Entities Beyond Generic Invoice
- `Room` — room number, type (private, dorm), bed count
- `Bed` — bed number, room, availability calendar
- `Booking` — guest, check-in/out, room/bed, nightly rate
- `FacilityFee` — linen, locker, WiFi, cleaning deposit
- `HostelBill` — guest name, dates, nightly rate × nights, facility fees, total, deposit refund info

### What Customers Expect (vs. Generic Invoice + vs. Hostaway/Cloudbeds)
- **Correct:** Invoice shows guest name, check-in/out dates, room/bed number, nightly rate × nights, facility fees, total, and deposit terms.
- **Wrong (what generic ERP does):** One line "Hostel Stay" | 1 | $80 | $80" with no nightly breakdown, room/bed context, or facility fees.

---

## SUMMARY: WHAT EVERY VERTICAL NEEDS

| Vertical | Correct "Invoice" | Wrong (Generic Form) | Key Entities |
|----------|------------------|-------------------|--------------|
| **Hotel** | Folio: nightly room charge + date-stamped extras per night | One line "Hotel Stay" | Room, RoomType, GuestStay, Folio, FolioLineItem |
| **Construction** | Progress invoice: project phase + labor + materials + retainage | One line "General Contractor" | Project, Phase, ScheduleOfValues, LaborTracking, ProgressInvoice |
| **Salon** | Service invoice: services + duration + stylist + tip | One line "Service" | Service, Stylist, Appointment, AppointmentInvoice |
| **Restaurant** | Table bill: itemized by course (appetizers, mains, etc.) | One line "Meal" | Table, MenuItem, TableOrder, RestaurantBill |
| **Workshop** | Job bill: labor (tech hours × rate) + parts | One line "Repair" | Job, TechnicianRate, Part, WorkshopBill |
| **Pharmacy** | Rx fulfillment: medication + insurance co-pay | One line "Medication" | Prescription, Medication, Insurance, PharmacyBill |
| **School** | Tuition bill: tuition + itemized fees + discounts | One line "Tuition" | Student, Term, Discount, Fee, TuitionBill |
| **Real Estate** | Rental bill: base rent + utilities + fees | One line "Rent" | Property, Tenant, Lease, Utility, RentalBill |
| **Transportation** | Shipment bill: freight base + distance + fuel + special handling | One line "Freight" | Shipment, Carrier, RateCard, TransportBill |
| **Travel** | Package bill: accommodations + activities + meals + transport | One line "Package" | TravelPackage, Accommodation, Activity, Transportation |
| **Gym** | Membership bill: membership fee + personal training + classes | One line "Membership" | Member, MembershipType, PersonalTrainer, GymBill |
| **Laundry** | Service job bill: itemized by garment type + service | One line "Service" | ServiceJob, GarmentItem, SpecialRequest, LaundryBill |
| **Hostel** | Booking bill: nightly bed rate + facility fees | One line "Stay" | Room, Bed, Booking, FacilityFee, HostelBill |

---

**This spec is the reference for Stage B auditing and Stage D implementation. If the current code shares a generic "invoice" model across all verticals, it is WRONG for all but the most generic use case (generic sales). Each vertical needs its own data model and workflow.**
