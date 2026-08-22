# CONSTRUCTION MODULE — STAGE B: PRIORITIZED TASKLIST

**Status:** Ready for STAGE C implementation  
**Scope:** Construction-specific work after main audit P0-P2 completion  
**Prerequisite:** Main audit P0-001 through P0-006 must be completed first (invoice view/edit, warehouse fixes, printing)

---

## P0: CRITICAL BLOCKERS — CORE INVOICE FUNCTIONALITY

### P0-C01 | Construction | Progress Invoice view/edit/ZATCA (Foundation)
- **What's needed:** Complete progress invoice lifecycle that construction clients actually use
- **Root cause:** progressBilling table exists but no UI; no ZATCA fields; no integration with BOQ
- **What to build:** 
  1. Add ZATCA fields to progressBilling table: uuid, icv, pih, zatcaXml, zatcaStatus, zatcaQr, customsDeclaration
  2. Build progressInvoiceGet endpoint that fetches: progress invoice + all related BOQ items + approval chain
  3. Build progressInvoiceCreate endpoint that: links to contract/BOQ, calculates value from BOQ %, validates retention % against contract, calls ZATCA signing logic (same as salesRouter), generates UUID/ICV/PIH/QR
  4. Build progressInvoiceUpdate endpoint: allows editing draft invoices only, blocks changes after approval
  5. Build progressInvoiceDelete endpoint: prevents deletion of approved/ZATCA invoices (audit trail)
  6. Frontend: Create /construction/progress-invoices page with: list of all progress invoices per project, view detail page, edit form (pre-populated from progressInvoiceGet), approval workflow buttons (submit/approve/reject), ZATCA status indicator (pending/cleared/reported/failed)
- **Test criteria:**
  - Create progress invoice: select project/contract → auto-populate BOQ breakdown → set % complete → auto-calculate value → save → invoice visible in list
  - View invoice: shows BOQ line breakdown + cumulative values + retention amount + ZATCA QR + status
  - Edit invoice: only if draft; pre-populates all fields; save updates DB
  - ZATCA generation: UUID generated, ICV incremented, PIH calculated, QR code rendered, XML generated
  - Print: A4 template renders invoice correctly (see P1-C10)
- **Estimate:** 6-8 hours (backend + frontend + ZATCA wiring)
- **Files:** 
  - db/schema.ts (add ZATCA fields to progressBilling)
  - api/constructionRouter.ts (or api/constructionPaymentRouter.ts — expand)
  - src/pages/construction/progress-invoices.tsx (create new)
  - api/zatcaRouter.ts (extend to handle construction invoice types)
- **[  ]** COMPLETED

### P0-C02 | Construction | Multi-tier Approval Workflow
- **What's needed:** Invoice can move from draft → submitted → approved → ZATCA cleared → sent
- **Root cause:** Status field exists but no UI or logic to move invoice through workflow; no approval queue
- **What to build:**
  1. Build progressInvoiceChangeStatus endpoint: validates status transitions (draft→submitted, submitted→approved/rejected, approved→cleared/failed), records approver/timestamp/comments, triggers ZATCA clearance when moving to approved
  2. Build progressInvoiceList enhancement: add filters (by status, by approver role required, by project)
  3. Build approval dashboard: Shows all invoices requiring approval by current user's role, buttons to approve/reject with optional comment modal
  4. Add approvalChain tracking: progressBillingApprovals table (invoiceId, approverId, approverRole, status, timestamp, comments) to track who approved when
  5. Build approval history view: shows who approved, when, what comments/changes
- **Test criteria:**
  - Create progress invoice → status = draft
  - PM clicks "Submit" → status = submitted
  - Finance clicks "Approve" → calls ZATCA clearance → if success: status = cleared; if failure: status = failed with error message
  - Rejected invoice: reverts to draft, editable again
  - Approval history shows full chain (who did what when)
- **Estimate:** 4-5 hours
- **Files:**
  - db/schema.ts (add progressBillingApprovals table)
  - api/constructionRouter.ts (add progressInvoiceChangeStatus, approval history queries)
  - src/pages/construction/approval-queue.tsx (create)
- **[  ]** COMPLETED

### P0-C03 | Construction | Variation Order Invoicing
- **What's needed:** Variation orders (change orders) create line items that auto-invoice separately
- **Root cause:** variationOrders table exists but no logic to generate invoices from VOs
- **What to build:**
  1. Build variationOrderCreate enhancement: when VO is approved, option to auto-generate invoice OR mark for manual invoicing
  2. Build variationInvoiceGenerate endpoint: takes approved VO, creates progressBilling record with type="variation", references original VO, calculates value from VO.changedValue + (changedValue * 15% VAT), applies retention if contract specifies
  3. Build VO approval workflow: variationOrderChangeStatus endpoint with draft→submitted→approved transitions, triggered by PM/client
  4. Frontend: /construction/variations page shows VO list, detail view with original scope vs. new scope, invoice button if approved but not yet invoiced
- **Test criteria:**
  - Create VO: deduction of $10k from original SOV → submit → approve
  - Click "Generate Invoice" → invoice created, status="variation", value=$10k, shows VO reference
  - Invoice inherits retention % from contract (e.g., 10% retention = $1k)
  - Net amount due = $9k
- **Estimate:** 4-5 hours
- **Files:**
  - api/constructionRouter.ts (expand variationOrders handling)
  - db/schema.ts (add voInvoiceGenerated boolean to variationOrders)
  - src/pages/construction/variations (expand)
- **[  ]** COMPLETED

### P0-C04 | Construction | Advance Payment Invoicing
- **What's needed:** Mobilization/advance invoices generated at project start, recovered against later progress invoices
- **Root cause:** advancePayments table exists but no invoice generation; no recovery tracking
- **What to build:**
  1. Build advancePaymentInvoiceGenerate endpoint: takes advancePayments record, creates progressBilling record with type="advance", value=advancePaymentAmount, status="submitted" (ready for client payment without approval)
  2. Build advance recovery tracking: when progress invoice created, option to apply advance credit (deduct advance from progress invoice net amount)
  3. Frontend: /construction/advance-payments page shows advance payment list, invoice button, status of whether advance has been recovered
- **Test criteria:**
  - Project with contract value $100k, advance 20% = $20k advance invoice
  - Generate advance invoice → invoice created, shows "Advance $20k, due immediately"
  - Later: progress invoice for $30k claimed → option to apply $20k advance credit → net amount = $30k - $20k = $10k
  - After credit applied: advance marked as "recovered"
- **Estimate:** 3-4 hours
- **Files:**
  - api/constructionRouter.ts (add advancePaymentInvoiceGenerate)
  - db/schema.ts (add recoveredAmount to advancePayments)
- **[  ]** COMPLETED

### P0-C05 | Construction | Retention Release Workflow
- **What's needed:** Withheld retention (typically 5-10%) released at project milestones or completion
- **Root cause:** retentionAccounts table exists but no UI to release; no milestone-triggered release
- **What to build:**
  1. Build retentionReleaseInvoiceGenerate endpoint: creates progressBilling record with type="retention_release", value=releasedAmount, status="submitted"
  2. Build retentionAccountUpdate endpoint: tracks partial/full releases, milestone triggers
  3. Frontend: /construction/retention page shows retention accounts per project/subcontractor, balance held, release buttons with dropdown for release reason (practical_completion, final_inspection, defects_cleared, other)
  4. Integration: when milestone marked complete (in WBS), check if retention should auto-release
- **Test criteria:**
  - Progress invoices with 10% retention: $30k claim → $27k net, $3k retained
  - Accumulate: 3 invoices = $9k retained
  - Mark project "Practical Completion" → retention release UI shows $9k available
  - Click "Release Retention" → retention release invoice created for $9k
  - Retention account updated: held=$0, released=$9k
- **Estimate:** 4-5 hours
- **Files:**
  - api/constructionRouter.ts (add retentionReleaseInvoiceGenerate)
  - src/pages/construction/retention-release.tsx (create)
- **[  ]** COMPLETED

### P0-C06 | Construction | Project-to-Invoice Linking (BOQ Validation)
- **What's needed:** Every progress invoice must validate claimed amounts against BOQ breakdown
- **Root cause:** progressBilling has no link to boqItems; no line-item breakdown in progress invoices
- **What to build:**
  1. Add progressBillingItems table: progressBillingId, boqItemId, quantityCompleted, percentCompleted, valueClaimedThisPeriod, cumulativePercentCompleted, cumulativeValueClaimed
  2. Build progressInvoiceCreate enhancement: require selection of BOQ items + % complete for each → sum across items → auto-calculate total value
  3. Build progressInvoiceDetail enhancement: display BOQ breakdown with cumulative tracking (prevents over-invoicing)
  4. Validation: if user tries to claim >100% of a BOQ item, reject with error "cumulative claim exceeds BOQ quantity"
- **Test criteria:**
  - BOQ item: "Foundation concrete 1000 cubic meters @ $100/m = $100k"
  - Progress invoice 1: claim 40% = 400m @ $100/m = $40k claimed, $36k net (10% retention)
  - Progress invoice 2: claim 35% = 350m @ $100/m = $35k claimed
  - Attempt invoice 3: claim 30% = 300m @ $100/m = $35k (totals 105%) → REJECTED "exceeds BOQ"
- **Estimate:** 5-6 hours
- **Files:**
  - db/schema.ts (add progressBillingItems table)
  - api/constructionRouter.ts (update progressInvoiceCreate logic)
- **[  ]** COMPLETED

---

## P1: HIGH PRIORITY — CORE WORKFLOWS & FEATURES

### P1-C01 | Construction | Multi-branch Scoping & Dashboards
- **What's needed:** Each branch operates independently; company has consolidated view
- **Root cause:** No branchId in construction tables; no branch-level dashboards
- **What to build:**
  1. Add branchId to: constructionProjects, constructionContracts, progressBilling, subcontractors, boqItems, variationOrders
  2. Update all queries to filter by branchId (from ctx.user.branchId)
  3. Build /construction/dashboard: tab switcher (This Branch | All Branches)
  4. Branch dashboard: Shows branch-level projects, active/completed counts, revenue to date, pending invoices, AR/AP summary
  5. Company dashboard: Shows all projects across branches, consolidated revenue, top projects by value, branch comparison
- **Test criteria:**
  - User from Branch A: sees only Branch A projects
  - User with admin role: can toggle to "All Branches" view
  - Branch A dashboard shows revenue = $X, Branch B dashboard shows revenue = $Y, All Branches shows $X+$Y
- **Estimate:** 6-8 hours
- **Files:**
  - db/schema.ts (add branchId columns)
  - api/constructionRouter.ts (update all queries)
  - src/pages/construction/dashboard.tsx (expand with branch view)
- **[  ]** COMPLETED

### P1-C02 | Construction | Budget vs. Actual Real-Time Dashboard
- **What's needed:** Live view of project spend against budget; identify overruns
- **Root cause:** Budget vs. actual calculation not implemented; no dashboard
- **What to build:**
  1. Build projectFinancialsGet endpoint: queries project budget + sums all related invoices (progress + variation - retention) + equipment costs + subcontractor costs + labor → calculates variance
  2. Per-BOQ-line breakdown: queries all progress invoices for that item → calculates % claimed vs. % budgeted for each line
  3. Build /construction/budget-vs-actual page: 
     - Project selector dropdown
     - Summary card: total budget, total claimed to date, total paid, remaining budget, variance %
     - Table: BOQ line items with columns (Line, Budget, Claimed, Variance, % Complete)
     - Charts: pie chart of budget allocation, line chart of cumulative spend over time
- **Test criteria:**
  - Project budget $1M, claimed $600k to date, budget shows "60% claimed"
  - BOQ line over budget: flagged in red, shows overage amount
  - Dashboard updates when new invoice created
- **Estimate:** 4-5 hours
- **Files:**
  - api/constructionRouter.ts (add projectFinancialsGet)
  - src/pages/construction/budget-vs-actual.tsx (create)
- **[  ]** COMPLETED

### P1-C03 | Construction | Client/Subcontractor AR & AP Aging
- **What's needed:** Track outstanding invoices and payments per client/subcontractor
- **Root cause:** Not implemented; no aging reports
- **What to build:**
  1. Build clientARGet endpoint: sums invoices per client, minus payments, calculates days overdue, returns aging buckets (current, 30 days, 60 days, 90+ days)
  2. Build subcontractorAPGet endpoint: sums invoices to subs, minus payments, aging buckets
  3. Build /construction/ar-aging page: table of clients, outstanding balance, days overdue, invoice details, payment entry
  4. Build /construction/ap-aging page: table of subs, outstanding balance, invoice details, payment buttons
  5. AR/AP reconciliation: shows matching between invoices issued and payments received
- **Test criteria:**
  - Client invoice dated 7/01, due 7/31, today is 8/09 → shows in "60+ days overdue"
  - Subcontractor invoice $50k, paid $30k → outstanding $20k shown
  - Click payment button → logs payment, reduces outstanding
- **Estimate:** 5-6 hours
- **Files:**
  - api/constructionRouter.ts (add clientARGet, subcontractorAPGet)
  - src/pages/construction/ar-aging.tsx, ap-aging.tsx (create)
- **[  ]** COMPLETED

### P1-C04 | Construction | Labor Tracking & Timesheets
- **What's needed:** Record daily labor hours per project, feed into cost tracking
- **Root cause:** No labor tracking table or UI; labor costs hardcoded in BOQ
- **What to build:**
  1. Create laborTracking table: laborDate, projectId, workerId, hours, hourlyRate, isSubcontractor, isOvertime, taskDescription
  2. Build timesheetEntryCreate endpoint: batch insert daily entries
  3. Build timesheetList/timesheetGet endpoints for querying
  4. Frontend: /construction/timesheets page with daily entry form (date picker, worker selector, hours input, rate auto-filled), entry grid
  5. Labor cost rollup: Build endpoint to sum laborTracking → allocates to project.actualCost and BOQ line's actualLaborCost
- **Test criteria:**
  - Enter timesheet: 5 workers, 8 hours each, @ $50/hr → total labor = $2000/day
  - At month end: total project labor cost = $2000 * 22 working days = $44k
  - Progress invoice shows cumulative labor costs
- **Estimate:** 5-6 hours
- **Files:**
  - db/schema.ts (create laborTracking)
  - api/constructionRouter.ts (add endpoints)
  - src/pages/construction/timesheets.tsx (create)
- **[  ]** COMPLETED

### P1-C05 | Construction | Subcontractor Invoice & Payment Tracking
- **What's needed:** Generate invoices TO subcontractors, track payments made
- **Root cause:** subcontractorPayments table exists but no invoice generation or payment UI
- **What to build:**
  1. Build subcontractorInvoiceGenerate endpoint: takes subcontractor work items (e.g., electrical work completed), creates invoice to subcontractor, calculates value minus retention
  2. Build subcontractorPaymentRecord endpoint: records payment made to subcontractor, updates balances
  3. Frontend: /construction/subcontractor-invoices page shows invoices issued to each sub, payment status
  4. Payment reconciliation: sum of invoice issued vs. payments made
- **Test criteria:**
  - Subcontractor electrical work on Project A: contract value $50k
  - Generate invoice: $20k completed to date → invoice to sub for $20k
  - Record payment: $10k paid → outstanding = $10k
  - Retention: if 10% held, invoice shows $18k net, $2k retained, payment applies against net
- **Estimate:** 4-5 hours
- **Files:**
  - api/constructionRouter.ts (expand subcontractorPayments handling)
  - src/pages/construction/subcontractor-payments (expand)
- **[  ]** COMPLETED

### P1-C06 | Construction | Printing: Payment Certificates & BOQ Summaries
- **What's needed:** Print construction progress invoices in format construction clients expect (payment certificate style)
- **Root cause:** No construction-specific print templates; generic A4 invoice doesn't show BOQ breakdown
- **What to build:**
  1. Create constructionPaymentCertificatePrintTemplate component: Shows 
     - Project header (name, location, contract value)
     - Billing period
     - BOQ breakdown table: (Line | Description | BOQ Qty | % Complete | Qty This Period | Cumulative % | Value Claimed This Period | Cumulative Value | Retention | Net Amount Due)
     - Summary: cumulative billed, cumulative paid, cumulative retained, balance due, payment terms
     - Approval signature lines
     - ZATCA QR code
  2. Build /construction/invoices/:id/print endpoint that renders this template
  3. Add print button to progress invoice detail page
- **Test criteria:**
  - View progress invoice → click Print → opens PDF with payment certificate format
  - BOQ breakdown shows correctly: 3 line items, each with % complete
  - Total value matches invoice amount
  - ZATCA QR renders
- **Estimate:** 3-4 hours
- **Files:**
  - src/components/construction/PaymentCertificatePrintTemplate.tsx (create)
  - src/pages/construction/progress-invoices.tsx (add print button)
- **[  ]** COMPLETED

### P1-C07 | Construction | Client Structure: Owner vs. Contractor vs. Subcontractor
- **What's needed:** Distinguish between project owners, main contractors, and subcontractors in data model
- **Root cause:** Single "subcontractors" table; no explicit client types
- **What to build:**
  1. Create constructionClients table: clientId, clientType (owner/contractor/subcontractor), name, vatNumber, crNumber, contactPerson, email, phone, address, paymentTerms, notes
  2. Update constructionProjects: add clientId (refers to owner)
  3. Update constructionContracts: add clientId, add contractorType to specify role
  4. Migrate subcontractors → constructionClients (where clientType='subcontractor')
  5. Frontend: /construction/clients page shows all clients by type, can filter by type
- **Test criteria:**
  - Owner: ABC Development Company (VAT registered, B2B)
  - Contractor: This company (that owns this app)
  - Subs: XYZ Electrical (Saudi registered), ABC Labor (Pakistani individual, non-resident)
  - Invoice generated shows B2B for Saudi subs, B2C for non-residents (ZATCA compliance)
- **Estimate:** 4-5 hours
- **Files:**
  - db/schema.ts (add constructionClients)
  - api/constructionRouter.ts (migration + new endpoints)
- **[  ]** COMPLETED

### P1-C08 | Construction | Contract Payment Terms & Cash Flow Projection
- **What's needed:** Enforce payment terms from contracts; project cash flow based on invoice schedule
- **Root cause:** paymentTerms field exists in contracts but not enforced; no cash flow projection
- **What to build:**
  1. Build contractPaymentTermsParse endpoint: parses paymentTerms text (e.g., "30% advance, 70% on completion" or "60 days net"), extracts structured milestones
  2. Build cashFlowProjection endpoint: takes contract, generates projected invoice dates and amounts based on payment terms
  3. Frontend: /construction/cash-flow page shows projected vs. actual cash inflows per project
- **Test criteria:**
  - Contract: "20% advance upon signing, 70% progress monthly, 10% on completion"
  - Projection shows: Advance $20k (today), Progress $7k/month for 10 months, Final $10k (completion)
  - As invoices actually generated, compares projected vs. actual
- **Estimate:** 3-4 hours
- **Files:**
  - api/constructionRouter.ts (add payment terms parsing)
  - src/pages/construction/cash-flow.tsx (create)
- **[  ]** COMPLETED

### P1-C09 | Construction | Withholding Tax (WHT) Calculation on Subcontractor Payments
- **What's needed:** Saudi law requires withholding tax on payments to non-residents; track separately
- **Root cause:** No WHT fields or calculation
- **What to build:**
  1. Add whtApplicable, whtPercent, whtAmount fields to progressBilling (for invoices to non-resident subs)
  2. Build WHT calculation: if subcontractor.isNonResident and invoice is B2C, apply 15% WHT
  3. Build WHT report: shows total WHT withheld, per sub, payment dates (for government reporting)
- **Test criteria:**
  - Subcontractor invoice to Pakistani company: $10k → if non-resident: WHT = $1.5k, net payment = $8.5k
  - WHT report shows cumulative withholding, breakdown by vendor
- **Estimate:** 2-3 hours
- **Files:**
  - db/schema.ts (add WHT fields)
  - api/constructionRouter.ts (add WHT logic)
- **[  ]** COMPLETED

### P1-C10 | Construction | Approval Role-Based Access Control
- **What's needed:** Only appropriate roles can approve invoices; PM submits, Finance approves, Principal signs-off
- **Root cause:** No role-based access on approval actions
- **What to build:**
  1. Extend middleware: check user role before allowing statusChange
  2. Build role matrix: PM can submit, Finance can approve, Principal can authorize, Client can view only
  3. Approval history tracks who took action (already in P0-C02)
- **Test criteria:**
  - PM role: can submit draft invoice, cannot approve
  - Finance role: can approve submitted invoice, cannot view PM-only reports
  - Principal role: can reject/authorize payments
  - Client role: can view invoices only, cannot edit
- **Estimate:** 2-3 hours
- **Files:**
  - api/middleware.ts (add construction-specific role checks)
  - api/constructionRouter.ts (add role validation to approval endpoints)
- **[  ]** COMPLETED

---

## P2: MEDIUM PRIORITY — ENHANCEMENTS & REPORTING

### P2-C01 | Construction | Document Management: Contracts, BOQs, Variations with Version Control
- **What's needed:** Store and version-track contracts, BOQs, drawings for audit trail
- **Root cause:** No document storage; no version history
- **What to build:**
  1. Create constructionDocuments table: projectId, documentType (contract/boq/drawing/variation/inspection), version, fileUrl, uploadedBy, uploadedAt
  2. Frontend: /construction/documents page allows upload, shows version history per document
- **Estimate:** 4-5 hours

### P2-C02 | Construction | Equipment Usage Log & Maintenance Tracking
- **What's needed:** Track equipment allocation to projects, maintenance schedule
- **Root cause:** equipmentTracking table exists but no allocation or maintenance tracking
- **What to build:**
  1. Create equipmentMaintenance table: equipmentId, maintenanceDate, maintenanceCost, nextMaintenanceDate
  2. Build equipment allocation: equipmentTracking records which equipment assigned to which project/site
  3. Equipment cost rollup: feed hourlyRate * hoursUsed into project cost tracking
- **Estimate:** 3-4 hours

### P2-C03 | Construction | Compliance Reports: ZATCA Filing Status & Corrective Invoices
- **What's needed:** Track ZATCA compliance, generate corrective invoices if needed
- **Root cause:** No tracking of ZATCA status per invoice type
- **What to build:**
  1. Build ZATCA compliance dashboard: shows % of invoices successfully cleared, any failures with error codes
  2. Corrective invoice workflow: if ZATCA rejects an invoice (e.g., duplicate ICV), auto-generate corrective invoice with reference to original
- **Estimate:** 4-5 hours

### P2-C04 | Construction | Waste Management Tracking & Cost Impact
- **What's needed:** Track material wastage, feed into actual costs
- **Root cause:** boqItems.wastagePercent exists but not tracked against actual usage
- **What to build:**
  1. Create wasteLog table: projectId, materialId, wastedQuantity, reason, cost
  2. Build waste report: shows total wastage vs. budgeted wastage, cost impact
- **Estimate:** 3 hours

### P2-C05 | Construction | Defects Liability Period Tracking & Final Retention Release
- **What's needed:** Track defects found after project handover, determine when retention can be released
- **Root cause:** No defects tracking
- **What to build:**
  1. Create defectsLog table: projectId, defectDescription, reportedDate, resolvedDate, costtFix, status (open/closed)
  2. Retention release: only when all defects closed
- **Estimate:** 3-4 hours

---

## SUMMARY TABLE

| Task | Component | Estimate | P0 Total | P1 Total |
|------|-----------|----------|----------|----------|
| P0-C01 | Progress Invoice View/Edit/ZATCA | 6-8h | 6-8h | |
| P0-C02 | Multi-tier Approval | 4-5h | 10-13h | |
| P0-C03 | Variation Invoicing | 4-5h | 14-18h | |
| P0-C04 | Advance Invoicing | 3-4h | 17-22h | |
| P0-C05 | Retention Release | 4-5h | 21-27h | |
| P0-C06 | BOQ Validation | 5-6h | **26-33h** | |
| | | | | |
| P1-C01 | Multi-branch Scoping | 6-8h | | 6-8h |
| P1-C02 | Budget vs. Actual | 4-5h | | 10-13h |
| P1-C03 | AR/AP Aging | 5-6h | | 15-19h |
| P1-C04 | Labor Tracking | 5-6h | | 20-25h |
| P1-C05 | Subcontractor Invoicing | 4-5h | | 24-30h |
| P1-C06 | Print Templates | 3-4h | | 27-34h |
| P1-C07 | Client Structure | 4-5h | | 31-39h |
| P1-C08 | Payment Terms & CF | 3-4h | | 34-43h |
| P1-C09 | WHT Calculation | 2-3h | | 36-46h |
| P1-C10 | Role-Based Access | 2-3h | | **38-49h** |

**Total Construction Module Build Effort:**
- **P0 (Critical):** 26-33 hours
- **P1 (High):** 38-49 hours
- **P2 (Medium):** 17-21 hours
- **TOTAL:** 81-103 hours

---

## EXECUTION ORDER (STAGE C)

1. **Day 1 (P0-C01, P0-C02):** Progress invoice view/edit + approval workflow — foundation for everything else
2. **Day 1-2 (P0-C03 through P0-C06):** Remaining P0 items — complete core invoice functionality
3. **Days 3-5 (P1-C01 through P1-C10):** Multi-branch, dashboards, workflows, printing
4. **Days 6 (P2):** Optional enhancements if time permits

**Regression Testing After Each P0:** Create → View → Edit → Approve → ZATCA Clear → Print

