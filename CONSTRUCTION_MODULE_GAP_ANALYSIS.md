# CONSTRUCTION MODULE — STAGE A GAP ANALYSIS

**Date:** August 9, 2026  
**Scope:** Comparing current implementation against SPEC (Section 1 of construction brief)  
**Status:** Detailed gaps identified; ready for tasklist creation

---

## EXECUTIVE SUMMARY

**What EXISTS and WORKS:**
- ✅ Database schema: Projects, BOQ, Contracts, Variations, Retention, Subcontractors, Equipment are all defined
- ✅ Backend routers: constructionRouter + constructionPaymentRouter with full CRUD endpoints for most entities
- ✅ Frontend structure: Construction pages organized with BOQ, Contracts, Equipment, etc.
- ✅ Payment Certificate Manager: UI for generating certificates exists
- ✅ WBS (Work Breakdown Structure): Core WBS entities and management implemented
- ✅ Variation Orders: Schema and basic CRUD exist
- ✅ Advanced Payments: Schema and tracking defined
- ✅ ZATCA integration: QR code and UBL XML generation already in salesRouter (exists but NOT wired into construction invoices)

**What's BROKEN or INCOMPLETE:**
- ❌ **Progress Invoice View/Edit:** No functioning page to view/edit progress billing records (critical blocker)
- ❌ **Progress Invoice ZATCA Fields:** invoiceNumber/UUID/ICV/PIH/QR not generated for progress invoices (critical blocker for Saudi compliance)
- ❌ **BOQ-to-Invoice Link:** Progress invoices created but NOT tied to BOQ items; claims don't validate against BOQ
- ❌ **Multi-tier Approval Workflow:** Status exists (draft→submitted→approved→paid) but no UI for approval flow
- ❌ **Retention Release Workflow:** retentionAccounts table exists but no UI/logic to release retention at milestones
- ❌ **Variation Order Invoicing:** Variation orders exist but no invoice generation from variations
- ❌ **Advance Payment Invoicing:** advancePayments table exists but no invoice generation/tracking
- ❌ **Printing (Thermal/A4):** No construction-specific print templates for progress certificates or BOQ summaries
- ❌ **Multi-branch Scoping:** No branch field in construction_projects, progressBilling, or contracts; no branch-level filtering/reporting
- ❌ **Central vs. Site Warehouse:** No distinction between central warehouse and per-project site stock (same warehouse bug as app-wide BUG-O1/O2)
- ❌ **Budget vs. Actual Reporting:** No real-time cost tracking dashboard showing budget vs. actual per project/BOQ line
- ❌ **Subcontractor Payments:** Table exists but no invoice generation or payment tracking UI
- ❌ **Client/Customer Structure:** No distinction between project owner, main contractor, and subcontractor client types
- ❌ **Accounts Receivable by Client/Project:** No AR aging or outstanding balance tracking per client/project
- ❌ **Document Attachments:** No UI/logic to attach BOQs, contracts, variation approvals, site photos to invoices
- ❌ **Payment Terms Enforcement:** Contract payment terms defined but not enforced on invoice generation

---

## SECTION-BY-SECTION GAP ANALYSIS

### 1.1 CLIENT / CUSTOMER STRUCTURE

**SPEC Requirement:**
- Explicit client relationship types: Project owner, Main contractor, Subcontractor
- Each with VAT/CR tracking, project links, contract links, payment terms, outstanding balance

**Current State:**
- ❌ `subcontractors` table exists but is flat (no relationship type distinction)
- ❌ `constructionProjects` has no `clientId` or `projectOwnerId` field — no link to project owner
- ❌ `constructionContracts` has `clientId` field but no distinction between owner/contractor/sub
- ❌ No AR aging or outstanding balance tracking
- ❌ No payment terms enforcement logic

**Gap:** Projects don't know who owns them; subcontractors aren't properly modeled as a distinct client type; no AR system.

**Fix Needed:** Add clientId to constructionProjects; add `clientType` enum (owner/contractor/subcontractor) to a clients table; implement AR tracking.

---

### 1.2 PROJECT & CONTRACT STRUCTURE

**SPEC Requirement:**
- Every invoice traces to Project → Contract
- Contract has: value, type, dates, retention %, payment terms, branch ownership
- BOQ is first-class entity with breakdown per line item
- Milestones trigger independent billing

**Current State:**
- ✅ constructionProjects table: Has code, name, dates, contractValue, budget, actualCost, status, projectType
- ✅ constructionContracts table: Has contractNumber, type (lump_sum, cost_plus, unit_price, design_build, turnkey), value, currency, retentionPercent, advancePaymentPercent, paymentTerms, warrantyPeriodMonths
- ✅ boqItems table: Comprehensive — itemCode, description, unit, quantity, unitRate, totalAmount, cost breakdowns (material/labor/equipment), taxRate
- ⚠️ **Milestone linking:** wbsItems supports milestone-like structures but not explicitly linked to billing triggers
- ❌ **Branch ownership:** NO branchId field in projects or contracts
- ❌ **BOQ approval workflow:** Status exists (estimated→approved→revised→completed) but no approval UI
- ❌ **BOQ to progress invoice link:** No field linking progressBilling items to specific boqItems

**Gap:** Milestones exist structurally but don't trigger billing; no branch scoping; BOQ not linked to progress claims.

**Fix Needed:** Add branchId to projects/contracts; add progressBillingItems table to link each claim line to a boqItem; build milestone→billing trigger logic.

---

### 1.3 INVOICE / BILLING TYPES

**SPEC Requirement:** 5 distinct invoice types:
1. Advance/mobilization invoice
2. Progress/interim invoice (Payment Certificate format)
3. Variation order billing
4. Retention invoice/release
5. Final/arrears invoice

**Current State:**
- ✅ `advancePayments` table exists: advancePaymentAmount, advancePaymentPercent, status (draft, approved, paid, adjustment)
- ✅ `progressBilling` table exists: invoiceNumber, percentageComplete, billedAmount, paidAmount, retentionPercent, retentionAmount, status (draft→submitted→approved→paid→partial→disputed)
- ✅ `retentionAccounts` table exists: totalRetention, releasedAmount, remainingAmount, expectedReleaseDate, status (held→partial_release→released)
- ✅ `variationOrders` table exists: voNumber, changeType (addition/deduction/omission), status (draft→submitted→approved→rejected→implemented), originalValue, changedValue, approvalDate
- ❌ **NO separate final invoice entity** — final is just another progressBilling
- ❌ **NO link from variationOrders to actual invoices** — VOs exist but don't auto-generate line items in invoices
- ❌ **NO B2B vs. B2C invoice distinction** (ZATCA compliance risk)
- ❌ **NO ZATCA fields on any construction invoice:** UUID, ICV, PIH, cryptographic stamp, QR code not generated
- ❌ **NO Payment Certificate UI:** PaymentCertificateManager.tsx exists but doesn't actually create/view invoices; just form shell
- ❌ **NO approval workflow UI:** Statuses defined but no page to move invoice from draft→submitted→approved
- ❌ **NO retention release UI:** Retention accounts exist but no page to release at milestones
- ❌ **NO invoice view/edit pages:** No page equivalent to sales→invoices for construction

**Gap:** Schema defines invoice types but UI and ZATCA generation completely missing; no approval workflow implemented.

**Fix Needed:** Build constructionProgressInvoice entities (similar to generic invoices but with BOQ breakdown); add ZATCA fields (UUID, ICV, PIH, QR); build payment certificate generation; build approval workflow UI; build retention release workflow.

---

### 1.4 ZATCA E-INVOICING COMPLIANCE

**SPEC Requirement:**
- Every B2B construction invoice cleared by ZATCA before sharing
- Every B2C invoice reported within 24 hours
- All invoices: UUID, ICV, PIH, cryptographic stamp (X.509/CSID), QR code
- UBL 2.1 XML format, Fatoora portal submission
- VAT (15%) calculated on each line and invoice total

**Current State:**
- ✅ ZATCA QR, XML, signing logic EXISTS in salesRouter.ts, zatcaRouter.ts (buildZatcaQrPayload, buildSaudiInvoiceXml, signInvoice, clearanceInvoice, reportInvoice)
- ✅ Company CSID, cryptographic key storage implemented
- ✅ Invoice counter (ICV) and hash chain (PIH) logic exists
- ❌ **NONE OF THIS IS WIRED INTO CONSTRUCTION INVOICES** — progressBilling table has NO UUID, ICV, PIH, zatcaXml, zatcaStatus, or zatcaQr fields
- ❌ **No B2B/B2C distinction** on construction invoices
- ❌ **No invoice signing/clearance endpoint** for construction progress invoices
- ❌ **No Fatoora submission** logic for construction invoices

**Gap:** Entire ZATCA compliance layer built elsewhere but not integrated into construction module.

**Fix Needed:** Add ZATCA fields to progressBilling; build constructionProgressInvoiceCreate that calls ZATCA signing/clearing logic; ensure every invoice type (advance, progress, variation, retention, final) goes through ZATCA workflow.

---

### 1.5 ACCOUNTS & COST TRACKING

**SPEC Requirement:**
- Project-level cost tracking: labor, material, subcontractor, equipment, overhead
- Budget vs. actual per project and per BOQ line
- AR per client/project, AP per subcontractor
- Withholding tax (WHT) handling

**Current State:**
- ✅ `boqItems` table: Has material/labor/equipment cost breakdowns, taxRate
- ✅ `constructionProjects` table: Has budget, actualCost, contractValue
- ✅ `equipmentTracking` table: Has hourlyRate, dailyRate, hoursUsed
- ✅ `subcontractorPayments` table exists (tracks payments to subs)
- ⚠️ **Labor cost tracking:** No dedicated labor tracking table; only equipment has hoursUsed
- ⚠️ **Actual cost rollup:** actualCost on projects exists but no logic to auto-calculate from BOQ line actuals or timesheets
- ❌ **No budget-vs-actual dashboard:** No real-time view comparing budget to actual spend
- ❌ **No AR by client/project:** No AR aging report
- ❌ **No AP by subcontractor:** Payments table exists but no aging/outstanding tracking
- ❌ **No WHT calculation/deduction:** No fields for withholding tax on subcontractor payments

**Gap:** Cost entities exist but no real-time reporting; no A/R-A/P systems; no WHT.

**Fix Needed:** Build budget-vs-actual dashboard; implement AR/AP aging reports; add labor tracking if not handled elsewhere; add WHT calculation to subcontractor payment logic.

---

### 1.6 MATERIALS, HARDWARE & WAREHOUSE

**SPEC Requirement:**
- Central warehouse + per-site stock
- Material requests raised, approved, fulfilled from central
- Cost flows to project cost tracking

**Current State:**
- ❌ **NO distinction between central and site warehouse** — Same app-wide warehouse bug (BUG-O1, BUG-O2)
- ❌ **NO project-site warehouse/stock records** — inventory_balances and warehouse zones don't have projectId field
- ❌ **NO material request workflow** — No table for material requests, approvals, fulfillment
- ❌ **NO material cost allocation to projects** — Materials bought but not traceable to projects

**Gap:** Warehouse structure doesn't support construction's central+site model; no material request workflow.

**Fix Needed:** (Blocked by app-wide warehouse refactor). Once app-wide warehouse fix done (BUG-O1/O2), extend with projectId scoping and material request workflow.

---

### 1.7 LABOR / WORKFORCE

**SPEC Requirement:**
- Site-based attendance/timesheets per project
- Labor cost feeds into project costing
- Subcontractor labor tracked separately from employees

**Current State:**
- ❌ **NO labor/timesheet table** — No equivalent to equipment's hoursUsed for labor
- ❌ **NO attendance tracking** — No site-based daily attendance
- ❌ **NO labor cost rollup to projects** — boqItems has laborCost field but nothing populates it from actuals
- ❌ **NO subcontractor labor distinction** — No sub vs. employee labor tracking

**Gap:** Labor entirely missing from construction module.

**Fix Needed:** Build laborTracking table (worker, project, date, hours, rate, isSubcontractor flag); build timesheet entry UI; auto-calculate labor cost contributions to BOQ lines and project totals.

---

### 1.8 DOCUMENTS & APPROVALS

**SPEC Requirement:**
- Document management: contracts, BOQs, drawings, change orders with version control
- Multi-tier approval on invoices: draft→submitted→approved→cleared→sent
- Attach supporting docs to claims

**Current State:**
- ❌ **NO document storage** — No documentStorage or fileAttachment table
- ⚠️ **Multi-tier approval defined but no UI:** progressBilling.status supports draft→submitted→approved→paid but no page to move invoice through workflow
- ❌ **NO approval queue/dashboard** — No page showing "invoices pending your approval"
- ❌ **NO attachment UI** — No file upload to invoices or variations
- ❌ **NO version control** — Contracts/BOQs can be updated but no version history

**Gap:** Approval workflow half-built (DB schema only); document management completely missing.

**Fix Needed:** Build approval workflow UI (page showing pending invoices, buttons to approve/reject); add fileAttachments table; build multi-file upload UI for invoices; add audit trail of approvals.

---

### 1.9 MULTI-BRANCH

**SPEC Requirement:**
- Every project, client, invoice, stock, staff belongs to a branch
- Branch-level dashboards and consolidated company view
- Branch is a level within tenant, not a replacement

**Current State:**
- ❌ **NO branchId field** in constructionProjects, constructionContracts, progressBilling, subcontractors, boqItems
- ❌ **NO branches table** (or it exists elsewhere in app but not linked to construction)
- ❌ **NO branch-level scoping** in any construction query
- ❌ **NO branch-level dashboards**
- ❌ **NO consolidated multi-branch reporting**

**Gap:** Zero multi-branch support in construction module.

**Fix Needed:** Add branchId to all construction tables; add branches table if not exists; add branch-level filtering to all queries; build branch selector UI; build branch-level and company-wide dashboards.

---

## CROSS-APP GAPS AFFECTING CONSTRUCTION

### Invoice View/Edit (Critical)
- ❌ **Status:** Not working for construction progress invoices (same issue as generic invoices in AUDIT_INVENTORY P0-001, P0-002)
- **Impact:** Can't view or edit progress claims after creation
- **Fix Dependency:** P0-001, P0-002 from main audit

### Printing (Critical)
- ❌ **Status:** No construction-specific print templates for progress certificates or BOQ summaries
- ✅ A4 template exists but not for construction payment certificates (different layout, shows BOQ breakdown + retention/advance)
- ❌ No thermal print for construction receipts
- **Impact:** Progress claims can't be printed for client distribution
- **Fix Dependency:** Build construction-specific print templates; integrate with thermal/A4 printing (P0-006)

### Warehouse Stock Management (Critical)
- ❌ **Status:** BUG-O1, BUG-O2 prevent material cost tracking
- **Impact:** Can't track material costs to projects
- **Fix Dependency:** P0-004, P0-005 from main audit (prerequisite for construction material costing)

---

## SUMMARY TABLE: CONSTRUCTION MODULE READINESS

| Capability | Spec Requirement | Current State | Gap | Priority |
|------------|------------------|---------------|-----|----------|
| **Projects** | Project with contract, BOQ, dates | ✅ Exists | No branch scoping | P1 |
| **BOQ** | First-class entity, line breakdown | ✅ Exists | No link to invoices, no approval UI | P0 |
| **Contracts** | Type, value, retention %, terms | ✅ Exists | No branch scoping | P1 |
| **Advance Invoices** | Mobilization billing | Schema only | No invoice generation, no ZATCA | P1 |
| **Progress Invoices** | Payment certificate format | Schema only | No invoice view/edit/approval/ZATCA | **P0** |
| **Variation Invoices** | Change order billing | Schema exists | No invoice generation | P1 |
| **Retention Billing** | Release at milestones | Schema only | No release workflow UI | P1 |
| **Final Invoices** | Project completion billing | Not separate | Not implemented | P1 |
| **ZATCA Compliance** | UUID/ICV/PIH/QR/stamp | Code exists elsewhere | Not wired into construction | **P0** |
| **Multi-tier Approvals** | draft→submitted→approved workflow | Status defined | No approval UI/dashboard | P1 |
| **Cost Tracking** | Budget vs. actual per BOQ | Partial | No real-time dashboard | P1 |
| **AR/AP Tracking** | Aging, outstanding per client/sub | Not implemented | Complete gap | P2 |
| **Labor Tracking** | Timesheet, site attendance | Not implemented | Complete gap | P1 |
| **Warehouse (Central+Site)** | Material requests, per-site stock | Blocked | App-wide bug (BUG-O1/O2) | Blocked |
| **Documents** | Contracts, BOQs, variations, photos | Not implemented | Complete gap | P2 |
| **Multi-branch** | Branch scoping, branch dashboards | Not implemented | Complete gap | P1 |
| **Printing** | Payment certificates, BOQ summaries | Not implemented | Complete gap | P1 |
| **Subcontractor Mgmt** | Payment tracking, invoicing | Partial | No invoice UI, no payment tracking | P1 |

---

## READINESS VERDICT

**Current Construction Module Status:** ~40% ready for production

**What prevents shipping today:**
1. **CRITICAL (P0):** No progress invoice view/edit/ZATCA integration — clients can't see what they're paying for
2. **CRITICAL (P0):** Invoice approval workflow non-functional — can't move invoice through approval chain
3. **HIGH (P1):** No distinction between invoice types (advance/progress/variation/retention) — all billing collapsed into one
4. **HIGH (P1):** Multi-branch not implemented — company can't manage multiple locations

**What makes it competitive vs. FirstBit/ePROMIS:**
- ✅ Database schema is comprehensive (BOQ, contracts, retention, variations, equipment are all there)
- ✅ Backend router endpoints exist (mostly CRUD, needs business logic)
- ✅ ZATCA integration code exists but needs wiring
- ✅ Frontend page structure in place
- ❌ But: End-to-end workflows (invoice creation through ZATCA clearance through payment) not connected
- ❌ Missing: Real-time dashboards (budget-vs-actual, cash flow, AR/AP aging)
- ❌ Missing: Multi-branch support (single-branch only)

