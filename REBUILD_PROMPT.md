# YASCO ERP - Complete System Rebuild Prompt

## Project Overview

Build a **complete multi-tenant SaaS ERP system** called "YASCO ERP" with the following tech stack:

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Hono.js (HTTP framework) + tRPC v11 (API layer)
- **Database:** PostgreSQL + Drizzle ORM (with SQLite/Dexie for offline)
- **State:** Zustand (global state) + React Query (server state via tRPC)
- **UI:** shadcn/ui components, Lucide icons, Recharts, Three.js for 3D effects
- **Auth:** Cookie-based sessions, OTP email verification, JWT tokens
- **Offline:** IndexedDB (Dexie.js) with sync engine for offline-first capability
- **i18n:** English + Arabic (RTL support) via i18next
- **PWA:** Service worker, offline caching, installable app
- **Email:** Nodemailer with template system
- **PDF:** jsPDF + pdfmake for document generation
- **Deployment:** PM2 process manager, Nginx reverse proxy, Let's Encrypt SSL

---

## ARCHITECTURE

### Multi-Tenancy
- Shared database with `tenantId` on every table
- Row-level security via middleware
- Each tenant has isolated data, settings, and branding
- License key system (Starter/Business/Enterprise tiers)

### Offline-First Sync
- Dexie.js (IndexedDB) local database on client
- Sync queue for pending changes
- Conflict resolution (last-write-wins with server priority)
- Connection detector for online/offline status
- Background sync every 60 seconds when online

### Plugin System
- Hook-based plugin architecture
- Plugin marketplace with install/uninstall
- Runtime hook injection at defined extension points

---

## THEMES & LAYOUTS (Complete Visual System)

### 1. COLOR THEMES (4 Options)
CSS variable-based accent color palettes applied to header, badges, and accent elements.

| Theme | Primary | Gradient | Dark Mode Bg |
|-------|---------|----------|--------------|
| **Blue** | `#3b82f6` | `from-blue-500 to-indigo-600` | `bg-blue-950` |
| **Emerald** | `#10b981` | `from-emerald-500 to-green-600` | `bg-emerald-950` |
| **Purple** | `#8b5cf6` | `from-purple-500 to-violet-600` | `bg-purple-950` |
| **Amber** | `#f59e0b` | `from-amber-500 to-orange-600` | `bg-amber-950` |

**Selector UI:** Row of color circles with gradient fills, active gets checkmark + bottom accent bar. RTL support included.

### 2. LIGHT / DARK / SYSTEM MODE (3 Options)

| Mode | Behavior |
|------|----------|
| **Light** | Forces light mode (default) |
| **Dark** | Forces dark mode |
| **System** | Detects `prefers-color-scheme: dark` from OS |

### 3. LAYOUT THEMES (3 Navigation Modes)

#### 3a. `sidebar` - Classic Sidebar (Default)
- Fixed left sidebar with `bg-slate-900` dark background
- Width: `w-64` expanded, `w-16` collapsed (toggle button)
- Features:
  - Company logo/initials at top
  - Search bar for filtering menu items
  - Grouped navigation with category headers (MAIN, FINANCE, INVENTORY, SALES, etc.)
  - Active item highlighted with `bg-emerald-600/20 text-emerald-400`
  - Admin section at bottom (role-filtered)
  - Language toggle button
  - Mobile: Slide-out Sheet component
  - Header: Country-themed gradient top bar
  - Command+K search dialog overlay
  - User profile dropdown
  - ChatBubble component overlay

#### 3b. `app_launcher` - Icon Grid Home Screen
- iOS/mobile app launcher style grid of module icons
- Sticky header with company branding and "Sidebar View" toggle
- Background: `bg-gradient-to-br from-slate-50 to-blue-50`
- Modules grouped by category: Core Business, POS, Industry Verticals, Additional, System
- 3-6 column responsive grid
- Each icon: white card with gradient icon box, shadow effects
- Backdrop-blurred sticky header: `bg-white/70`

#### 3c. `launcher_theme` - 3D Launcher Dashboard
- Dark slate background with glossy 3D tiles
- Two-panel layout: Main Grid (70%) + Bottom Shelf (20%)
- Framer Motion staggered animations
- `Tile3D` components with glossy highlight overlay
- 12 unique gradient palettes for tiles:

| # | Gradient | Shadow |
|---|----------|--------|
| 0 | `#059669 → #10b981 → #34d399` | `rgba(5,150,105,0.45)` |
| 1 | `#d97706 → #f59e0b → #fbbf24` | `rgba(217,119,6,0.45)` |
| 2 | `#0d9488 → #14b8a6 → #2dd4bf` | `rgba(13,148,136,0.45)` |
| 3 | `#7c3aed → #8b5cf6 → #a78bfa` | `rgba(124,58,237,0.45)` |
| 4 | `#2563eb → #3b82f6 → #60a5fa` | `rgba(37,99,235,0.45)` |
| 5 | `#dc2626 → #ef4444 → #f87171` | `rgba(220,38,38,0.40)` |
| 6 | `#0891b2 → #06b6d4 → #22d3ee` | `rgba(8,145,178,0.45)` |
| 7 | `#c026d3 → #d946ef → #e879f9` | `rgba(192,38,211,0.40)` |
| 8 | `#ea580c → #f97316 → #fb923c` | `rgba(234,88,12,0.45)` |
| 9 | `#4f46e5 → #6366f1 → #818cf8` | `rgba(79,70,229,0.45)` |
| 10 | `#0369a1 → #0284c7 → #38bdf8` | `rgba(3,105,161,0.45)` |
| 11 | `#b91c1c → #dc2626 → #f87171` | `rgba(185,28,28,0.40)` |

- Hover: `y: -6, scale: 1.04`; Tap: `y: 1, scale: 0.97`
- Drill-down: clicking group shows sub-modules with back button
- Bottom shelf: Horizontal scrollable tile strip with scroll arrows + dots

### 4. COUNTRY-SPECIFIC THEMES (Auto-Detected)

| Country | Header Gradient | Badge Style | Tax Label |
|---------|----------------|-------------|-----------|
| **SA** (Saudi) | `from-emerald-950 via-green-900 to-emerald-900` | `border-emerald-300/40 bg-emerald-400/15` | Saudi VAT / ZATCA |
| **PK** (Pakistan) | `from-green-950 via-emerald-900 to-lime-900` | `border-lime-300/40 bg-lime-400/15` | Pakistan Sales Tax / FBR |
| **AE** (UAE) | `from-slate-950 via-emerald-900 to-red-950` | `border-red-200/40 bg-white/15` | UAE VAT / FTA |
| **US** (USA) | `from-blue-950 via-slate-900 to-emerald-900` | `border-blue-300/40 bg-blue-400/15` | US Sales Tax |

Auto-detected via timezone/browser settings. Fallback gradient for unknown countries.

### 5. SUPER ADMIN LAYOUT (Independent Theme Cycle)
Separate from main app, stored in `yasco-admin-theme` localStorage:

| Admin Theme | Description |
|-------------|-------------|
| **Sidebar** | Dark sidebar (`bg-slate-900`), amber accent (`bg-amber-600/20 text-amber-400`) |
| **App Launcher** | Flat white grid cards on `bg-slate-50`, amber gradient icons |
| **3D Launcher** | Glossy 3D tiles, inline CSS gradients, glassmorphism icons (`bg-white/20 backdrop-blur-md`) |

Top bar: Fixed `bg-slate-900` with amber accent links.

### 6. PORTAL LAYOUTS (3 Variants)

| Portal | Header Gradient | Active Accent | Logo Color |
|--------|----------------|---------------|------------|
| **Customer** | `from-blue-700 via-blue-600 to-indigo-700` | `text-blue-600` | `bg-blue-600` |
| **Vendor** | `from-emerald-700 via-emerald-600 to-teal-700` | `text-emerald-600` | `bg-emerald-600` |
| **Employee** | `from-purple-700 via-purple-600 to-violet-700` | `text-purple-600` | `bg-purple-600` |

Features: Collapsible white sidebar (`w-56`/`w-16`), mobile Sheet slide-out, portal-specific navigation, gradient header with search + notifications.

### 7. POS-SPECIFIC LAYOUTS (5 Variants)

#### 7a. Standard POS
- Full-screen interface, no sidebar
- Cart-based with item search, customer selection
- Hold/resume functionality
- Payment modal (cash, card, bank transfer, wallet)
- Receipt generation with print/download

#### 7b. Restaurant POS
- **Table status colors:**
  - `vacant`: green, `occupied`: blue, `ordered`: yellow
  - `served`: purple, `paid`: gray, `reserved`: orange, `cleaning`: red
- Floor plan visualization with table grid
- Course-based ordering (appetizer, main, dessert, drinks)
- Kitchen Display System (KDS) stations
- Tabbed: Floor View, KOT View, Kitchen

#### 7c. Pharmacy POS
- Dark green header: `bg-[#123c2e]`
- Prescription-driven dispensing workflow
- Drug interaction checking
- Insurance claims modal
- Controlled substance logging
- Tabbed: Prescription, OTC, Insurance, Controlled Log

#### 7d. Wholesale POS
- Bulk/wholesale pricing interface
- Volume-based discounts

#### 7e. Shift Management
- Cashier shift open/close
- Cash reconciliation
- Denomination counting

### 8. MOBILE LAYOUTS
All mobile pages: `max-w-lg mx-auto` centered single-column layout.

| Page | Description | Quick Action Colors |
|------|-------------|-------------------|
| **Dashboard** | Stats grid + quick actions | Approvals: blue, Clock: green, Sale: amber, Jobs: purple, Expense: rose, Settings: slate |
| **Attendance** | Clock in/out with GPS | Large circular clock icon, GPS coordinates |
| **QuickSales** | Product grid + cart | 2-column product cards |
| **Approvals** | Pending approval items | Card-based list |
| **SiteExpense** | Field expense entry | Form-based |
| **TechnicianJobs** | Field technician view | Job list with status |

### 9. 3D ANIMATED BACKGROUNDS (2 Variants)

#### 9a. AnimatedBackground (Construction-themed)
- Three.js canvas with cranes, buildings, gears, floating cubes
- 800 particles in 6-color palette (amber, yellow, blue, purple, cyan, red)
- Glowing translucent spheres
- Overlay: `bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80`

#### 9b. ThreeBackground (Abstract network)
- 1500 particles in blue/purple/cyan palette
- 300 connecting line segments
- Floating icosahedrons, tori, octahedrons
- Rotating glowing ring

### 10. VERTICAL WORKSPACES (18 Industry Configs)

| Workspace | Gradient | Accent |
|-----------|----------|--------|
| Facility Management & AMC | `from-sky-600 via-blue-600 to-indigo-700` | `text-sky-600` |
| Events & Entertainment | `from-fuchsia-600 via-purple-600 to-indigo-700` | `text-fuchsia-600` |
| Digital Marketing & Media | `from-rose-600 via-pink-600 to-fuchsia-700` | `text-rose-600` |
| Professional Services | `from-slate-700 via-gray-700 to-zinc-800` | `text-slate-700` |
| Agriculture & Farms | `from-green-600 via-emerald-600 to-teal-700` | `text-green-600` |
| Clean Energy & Solar | `from-yellow-500 via-amber-500 to-orange-600` | `text-amber-600` |
| Mining & Quarrying | `from-stone-600 via-stone-700 to-neutral-800` | `text-stone-600` |
| Marine, Ports & Shipping | `from-blue-700 via-indigo-700 to-blue-900` | `text-blue-700` |
| Veterinary & Pet Care | `from-teal-600 via-emerald-600 to-green-700` | `text-teal-600` |
| Nonprofit & Charity | `from-emerald-600 via-teal-600 to-cyan-700` | `text-emerald-600` |
| Tailoring & Fashion | `from-violet-600 via-purple-600 to-fuchsia-700` | `text-violet-600` |
| Gold, Jewelry & Watches | `from-yellow-600 via-amber-600 to-yellow-800` | `text-yellow-600` |
| Electronics & Mobile Repair | `from-cyan-600 via-sky-600 to-blue-700` | `text-cyan-600` |
| Furniture & Carpentry | `from-orange-700 via-amber-700 to-yellow-800` | `text-orange-700` |
| Printing & Signage | `from-pink-600 via-rose-600 to-red-700` | `text-pink-600` |
| Water Delivery & Waste | `from-sky-500 via-cyan-600 to-teal-700` | `text-sky-600` |
| Insurance & Financial | `from-indigo-600 via-blue-700 to-slate-800` | `text-indigo-600` |
| Import/Export & Distribution | `from-emerald-700 via-green-700 to-teal-800` | `text-emerald-700` |

Each workspace has: 6 custom workflow stages, 4-5 custom fields, quick links, seed data.

### 11. BUSINESS CATEGORY VISIBILITY
Sidebar menu groups controlled per business category (30+ categories):

| Category | Visible Groups |
|----------|---------------|
| Hospital | MAIN, FINANCE, INVENTORY, SALES, PURCHASE, CRM, HRM, HEALTHCARE, OPERATIONS, PLATFORM, SYSTEM |
| Workshop | MAIN, FINANCE, INVENTORY, SALES, PURCHASE, CRM, HRM, WORKSHOP, OPERATIONS, PLATFORM, SYSTEM |
| Construction | MAIN, FINANCE, INVENTORY, SALES, PURCHASE, CRM, HRM, CONSTRUCTION, PROJECTS, OPERATIONS, PLATFORM, SYSTEM |
| Retail | MAIN, FINANCE, INVENTORY, SALES, PURCHASE, CRM, HRM, OPERATIONS, PLATFORM, SYSTEM |
| Restaurant | MAIN, FINANCE, INVENTORY, SALES, PURCHASE, CRM, HRM, RESTAURANT, OPERATIONS, PLATFORM, SYSTEM |
| Hotel | MAIN, FINANCE, INVENTORY, SALES, PURCHASE, CRM, HRM, HOTEL, OPERATIONS, PLATFORM, SYSTEM |
| All | ALL groups visible |

### 12. THEME PERSISTENCE

| Theme Type | Storage | Key |
|------------|---------|-----|
| Color Theme | localStorage | `yasco-theme` |
| Light/Dark | localStorage | `erp-theme` |
| Layout Theme | Server DB (tRPC) | `settings.themeGet/themeUpdate` |
| Admin Layout | localStorage | `yasco-admin-theme` |
| Portal Theme | Route-based | Per-portal detection |
| Country | Auto-detect | Timezone/browser |
| Language | localStorage | `language` |

---

## DATABASE SCHEMA (70+ Tables)

### Core Tables
```
tenants, users, sessions, licenses, license_keys
companies, company_settings, branches
```

### Accounting
```
accounts (Chart of Accounts - asset/liability/equity/revenue/expense)
journal_entries, journal_entry_lines (double-entry)
trial_balance, cost_centers
fiscal_years, currencies
```

### Inventory
```
products (SKU, pricing, cost_method: FIFO/LIFO/WAVG, product_type)
warehouses, stock_levels, stock_movements, stock_adjustments, stock_transfers
```

### Sales
```
customers, quotations, quotation_items
sales_orders, sales_order_items
invoices, invoice_items, credit_notes, credit_note_items
payments (customer payments)
```

### Purchase
```
suppliers, purchase_orders, purchase_order_items
purchase_requisitions, grn (goods receipt notes)
supplier_payments
```

### CRM
```
leads (scoring: hot/warm/cold, source, estimated_value)
opportunities (stages: prospecting/qualification/proposal/negotiation/closed)
activities (calls/emails/meetings/tasks)
```

### HRM
```
employees, departments, designations
attendance (check_in, check_out, status, overtime)
leave_requests, leave_types
payroll, payroll_runs, salary_slips
performance_reviews
```

### Saudi-Specific HRM
```
gosi_contributions, wps_files, wps_records
eosb_calculations (end of service benefits)
saudi_compliance_records (nitaqat/muqeem/qiwa)
biometric_templates, biometric_logs
```

### Manufacturing
```
bom (bill of materials), bom_items
work_orders, production_orders
```

### Projects
```
projects, project_tasks, timesheets
```

### Construction
```
construction_projects, wbs_entries, boq_items
contracts, variations, advance_payments
daily_reports, cvr_entries, decennial_insurances
materials, equipment, subcontractors, subcontractor_payments
hse_committees, safety_trainings, ppe_issues, heat_stress_records
gtpl_compliance, sbc_compliance, sca_classifications
engineering_saudization
```

### Documents
```
documents, document_versions, document_expiry_reminders
signature_requests, signatures
```

### Notifications
```
notification_channels, notification_templates, notification_logs
notification_preferences
```

### Settings
```
invoice_settings, tax_settings, theme_settings
company_legal_information, zatca_settings
```

### Sync & Offline
```
sync_queue, sync_logs, device_registrations
```

### Workflows
```
workflows, workflow_steps, workflow_logs, workflow_executions
```

### Plugins
```
plugins, plugin_configs
```

### Compliance
```
audit_logs, access_logs, security_incidents
data_subject_requests, data_retention_policies
balady_permits
```

### EDI
```
edi_partners, edi_document_types, edi_mappings
edi_transactions, edi_logs
```

### Webhooks
```
webhook_subscriptions, webhook_delivery_logs, webhook_api_keys
```

### OLAP/ETL
```
olap_cubes, olap_dimensions, olap_facts, olap_queries
etl_connectors, etl_jobs, etl_transformations, etl_quality_rules
```

### Collaboration
```
collaboration_sessions, collaboration_participants
collaboration_messages, user_presences
```

### IFRS
```
ifrs16_leases, rou_assets, lease_payment_schedules
ifrs15_obligations, contract_assets, contract_liabilities
recognition_schedules, contract_costs
```

### Installments
```
installment_plans, installment_payments
```

### POS
```
pos_shifts, pos_transactions, pos_transaction_items
```

### Cashbox
```
cash_transactions
```

### Helpdesk
```
tickets
```

### Meetings
```
meetings, meeting_attendees
```

### Tasks
```
tasks
```

### IoT
```
iot_devices, iot_alerts
```

### Portal
```
portal_users (customer/vendor/employee portal access)
```

---

## FRONTEND MODULES & PAGES (387 Files)

### 1. AUTH & ONBOARDING
- **Landing Page** (`/`) - Marketing page with all verticals showcase
- **Login** (`/login`) - Password + OTP tabs, remember me
- **Register Business** (`/register`) - Multi-step: business catalog → modules → plan selection
- **Verify OTP** (`/verify-otp`) - 6-digit email OTP verification
- **Select Plan** (`/select-plan`) - Starter/Business/Enterprise with monthly/yearly pricing
- **Forgot Password** (`/forgot-password`) - Email reset request
- **Reset Password** (`/reset-password`) - OTP-based password reset
- **Company Onboarding** (`/company-onboarding`) - Multi-step wizard: company info → address → tax/legal → business category → branding
- **Setup Wizard** (`/app/setup-wizard`) - Post-login setup: company info → address → branding → bank details → invoice settings → document numbering → warehouse → tax → modules

### 2. MAIN DASHBOARD (`/app`)
- KPI cards (revenue, expenses, profit, customers)
- Quick action buttons
- Charts (bar, pie, line) using Recharts
- Recent activity feed
- Module launcher grid

### 3. ACCOUNTING MODULE (`/app/accounting`)
- **Hub** - Overview with quick links
- **Chart of Accounts** (`/coa`) - Tree view, CRUD, account types (asset/liability/equity/revenue/expense), colors
- **Journal Entries** (`/journal-entries`) - Double-entry with multi-line debit/credit, reference types
- **General Ledger** (`/ledger`) - Account balances, transactions by account, running balance
- **Trial Balance** (`/trial-balance`) - Debit/credit equality verification
- **Cost Centers** (`/cost-centers`) - Code, name, budget amount
- **Settings** (`/settings`) - Fiscal year, currency, accounting method, tax rate

### 4. INVENTORY MODULE (`/app/inventory`)
- **Products** (`/products`) - CRUD, SKU, pricing, cost method (FIFO/LIFO/WAVG), product type, categories
- **Warehouses** (`/warehouses`) - Multi-warehouse management
- **Stock Levels** (`/stock`) - Real-time stock tracking
- **Stock Transfers** (`/transfers`) - Inter-warehouse transfers
- **Stock Movements** (`/movements`) - Audit trail
- **Stock Adjustments** (`/adjustments`) - Physical count adjustments

### 5. SALES MODULE (`/app/sales`)
- **Customers** (`/customers`) - CRUD, credit limits, contact info
- **Quotations** (`/quotations`) - Create, send, convert to invoice
- **Sales Orders** (`/orders`) - Order management
- **Invoices** (`/invoices`) - ZATCA e-invoicing, PDF generation, print templates
- **Credit Notes** (`/credit-notes`) - Return/refund management
- **Payments** (`/payments`) - Customer payment tracking
- **Saudi Invoice Print** - Formatted print template with QR code

### 6. PURCHASE MODULE (`/app/purchase`)
- **Suppliers** (`/suppliers`) - CRUD, contact info, payment terms
- **Purchase Requisitions** (`/requisitions`) - Request/approve workflow
- **Purchase Orders** (`/orders`) - PO creation and tracking
- **GRN** (`/grn`) - Goods receipt note management
- **Supplier Payments** (`/payments`) - Payment tracking

### 7. CRM MODULE (`/app/crm`)
- **Leads** (`/leads`) - CRUD, scoring (hot/warm/cold), source, estimated value
- **Opportunities** (`/opportunities`) - Pipeline stages, probability, expected close
- **Activities** (`/activities`) - Calls, emails, meetings, tasks

### 8. HRM MODULE (`/app/hrm`)
- **Employees** (`/employees`) - CRUD, department, designation, salary
- **Attendance** (`/attendance`) - Check-in/out, status, work hours, overtime
- **Leave** (`/leave`) - Request/approve/reject, leave types
- **Payroll** (`/payroll`) - Period processing, salary slips
- **Performance** (`/performance`) - Multi-dimensional reviews
- **Saudi Payroll** (`/saudi-payroll`) - GOSI, WPS integration, PDF payslips
- **GOSI** (`/gosi`) - Social insurance contributions
- **WPS** (`/wps`) - Wage Protection System (Mudad) file generation
- **EOSB** (`/eosb`) - End of Service Benefits calculations
- **Saudi Compliance** (`/saudi-compliance`) - Nitaqat/Muqeem/Qiwa tracking
- **Biometric Setup** (`/biometric-setup`) - Face/fingerprint, PDPL consent

### 9. MANUFACTURING MODULE (`/app/manufacturing`)
- **BOM** (`/bom`) - Bill of Materials, product recipes
- **Work Orders** (`/work-orders`) - Production work orders
- **Production** (`/production`) - Production tracking

### 10. PROJECTS MODULE (`/app/projects`)
- **Projects** (`/list`) - Project management
- **Tasks** (`/tasks`) - Kanban board, task assignment
- **Timesheets** (`/timesheets`) - Time tracking and billing

### 11. POS MODULE (`/app/pos`)
- **POS Terminal** (`/retail`) - Product grid, cart, payment processing, offline sync
- **POS Dashboard** - Sales overview, shift status
- **Restaurant POS** (`/restaurant`) - Table management, kitchen display
- **Pharmacy POS** (`/pharmacy`) - Prescription handling
- **Wholesale POS** (`/wholesale`) - Bulk pricing
- **Shift Management** (`/shift-management`) - Open/close shifts, cash reconciliation

### 12. CONSTRUCTION MODULE (`/app/construction`)
- **Dashboard** - Project stats, charts, KPIs
- **WBS** - Work Breakdown Structure (list/create/detail)
- **BOQ** - Bill of Quantities (list/create/import)
- **Contracts** - Contract management (list/create/detail)
- **Variations** - Contract variation orders
- **Advance Payments** - Advance payment tracking
- **Daily Reports** - Site daily reports
- **CVR** - Cost Value Reconciliation
- **Materials** - Material requirement planning
- **Equipment** - Equipment scheduling
- **Subcontractors** - Management and payments
- **Decennial** - 10-year insurance tracking
- **HSE** - Safety committees, training, PPE, heat stress
- **Compliance** - GTPL, SBC, SCA classification
- **Saudization** - Engineering Saudization tracking
- **AI Chat** - Construction AI assistant

### 13. WORKSHOP VERTICAL (`/app/workshop`)
- **Dashboard** - Job cards, vehicle tracking, KPIs
- **Job Cards** - Service job management
- **Vehicles** - Vehicle CRUD, status tracking
- **Technicians** - Technician management
- **Bays** - Service bay scheduling
- **Parts** - Parts inventory
- **Estimates** - Repair estimates/quotes
- **Inspections** - Vehicle inspections
- **Payments** - Workshop payments

### 14. SALON VERTICAL (`/app/salon`)
- **Dashboard** - Appointments, stylists, revenue
- **Appointments** - Booking management
- **Stylists** - Stylist profiles and schedules
- **Services** - Service catalog with pricing
- **Walk-ins** - Walk-in customer handling

### 15. GYM VERTICAL (`/app/gym`)
- **Dashboard** - Members, attendance, revenue
- **Members** - Member management
- **Membership Plans** - Plan CRUD
- **Check-in** - Member check-in tracking
- **Attendance** - Workout attendance history

### 16. HOTEL VERTICAL (`/app/hotel`)
- **Rooms** - Room management, status (available/occupied/maintenance)
- **Bookings** - Reservation management
- **Calendar** - Room availability calendar view
- **Housekeeping** - Cleaning schedule and status
- **Events** - Hotel events management
- **Folio Billing** - Guest folio, charges, checkout

### 17. RESTAURANT VERTICAL (`/app/restaurant`)
- **Dashboard** - Orders, tables, revenue
- **Menu** - Menu item management, categories, pricing
- **Kitchen** - Kitchen order display system (KDS)
- **Tables** - Table management, layout
- **Delivery** - Delivery order tracking

### 18. PHARMACY VERTICAL (`/app/pharmacy`)
- **Dashboard** - Medications, low stock, near expiry, prescriptions
- **Prescriptions** - Prescription management
- **Stock** - Pharmacy stock management
- **Expiry** - Expiry date tracking
- **Suppliers** - Pharmaceutical supplier management

### 19. HEALTHCARE VERTICAL (`/app/healthcare`)
- **Patients** - Patient management
- **Appointments** - Appointment scheduling
- **Doctor Roster** - Doctor scheduling
- **Billing** - Medical billing
- **Insurance Claims** - Claims processing
- **Lab** - Laboratory management
- **Nursing** - Nursing management

### 20. EDUCATION VERTICAL (`/app/education`)
- **Students** - Student CRUD, status (active/transferred/graduated/expelled/withdrawn)
- **Admissions** - Admission management
- **Class Schedule** - Timetable management
- **Exams** - Exam scheduling and results
- **Fee Invoicing** - Fee collection
- **Report Cards** - Report card generation
- **Library** - Library management

### 21. TRANSPORT VERTICAL (`/app/transport`)
- **Fleet** - Fleet management
- **Routes** - Route planning
- **Drivers** - Driver management
- **Maintenance** - Vehicle maintenance tracking
- **Shipments** - Shipment tracking
- **Tracking** - GPS tracking
- **Fuel** - Fuel management

### 22. REAL ESTATE VERTICAL (`/app/realestate`)
- **Properties** - Property listings
- **Leases** - Lease management
- **Rent Invoicing** - Rent billing
- **Maintenance** - Maintenance requests
- **Commissions** - Agent commissions
- **Tenants** - Tenant management

### 23. TRAVEL VERTICAL (`/app/travel`)
- **Bookings** - Travel bookings
- **Suppliers** - Travel supplier management
- **Itineraries** - Itinerary builder
- **Reconciliation** - Payment reconciliation

### 24. AVIATION VERTICAL (`/app/aviation`)
- **Flights** - Flight management
- **Crew** - Crew scheduling
- **Maintenance** - Aircraft maintenance
- **Parts** - Aviation parts inventory

### 25. LAUNDRY VERTICAL (`/app/laundry`)
- Orders, pricing, status tracking

### 26. HOSTEL VERTICAL (`/app/hostel`)
- **Rooms** - Room management
- **Bookings** - Hostel bookings
- **Rent Invoicing** - Rent billing
- **Housekeeping** - Cleaning management

### 27. E-COMMERCE VERTICAL (`/app/ecommerce`)
- Online store management

### 28. REPORTS MODULE (`/app/reports`)
- **Financial Reports** - P&L, Balance Sheet, Cash Flow
- **Financial Statements** - Statement generation
- **ZATCA Dashboard** - Compliance overview
- **ZATCA Status** - Submission tracking
- **Export** - Excel/PDF export

### 29. SETTINGS MODULE (`/app/settings`)
- **Company Profile** - Info, logo, bank details, invoice settings
- **Company Legal Information** - Legal/trade names, VAT, CR, licenses
- **Invoice Settings** - 5 themes (Classic/Modern/3D/Elegant/Minimal), logo/stamp
- **Tax Settings** - Multi-country (Saudi ZATCA, Pakistan FBR, UAE, General VAT)
- **ZATCA Integration** - CSR, certificates, CSID, compliance modes
- **ZATCA Phase 2** - 6-step setup wizard
- **Notification Channels** - Email/SMS/WhatsApp/Push configuration
- **Notification Templates** - Template editor with preview
- **Theme Settings** - Sidebar/App Launcher/Launcher Theme

### 30. SUPER ADMIN MODULE (`/admin`)
- **Dashboard** - Platform metrics (companies, revenue, signups, ZATCA compliance)
- **Companies** - Tenant management (search, filter, plan change, trial extend, delete)
- **Plans** - Subscription plan CRUD
- **SMTP** - Platform-wide email configuration
- **Email Templates** - Template editor
- **Master Control** - Activation/suspension, impersonation, compliance, support, audit
- **License Console** - License key management, status, analytics
- **License Approval** - Approval workflow
- **Reseller Keys** - Reseller license generation
- **Super Resellers** - Reseller limit management
- **Impersonate** - User impersonation for support
- **Chat** - Admin support chat
- **Invoice Settings** - Invoice theme management
- **Website** - Website builder/management

### 31. ADMIN COMPLIANCE (`/app/admin/compliance`)
- **Security Dashboard** - SOC2/ISO 27001/GDPR/PDPL overview
- **Data Protection** - GDPR/PDPL compliance, DSARs, DPAs
- **Audit Export** - SOC2-compatible audit log export
- **NPHIES Dashboard** - Saudi healthcare claims
- **Balady Permits** - Municipal permit tracking

### 32. ADMIN WORKFLOWS (`/app/admin/workflows`)
- **Workflow List** - Toggle active/inactive
- **Workflow Editor** - Visual builder (triggers: manual/record created/status change/field update; steps: notification/create record/update field/approval/webhook)
- **Workflow Logs** - Execution history

### 33. ADMIN PLUGINS (`/app/admin/plugins`)
- **Marketplace** - Browse/install plugins
- **Manager** - Enable/disable/uninstall

### 34. PORTAL MODULE (`/portal`)
- **Portal Login** - Separate login for portal users
- **Customer Portal** - Dashboard, invoices, payments, orders, tickets, profile
- **Vendor Portal** - Dashboard, POs, invoices, payments, profile
- **Employee Portal** - Dashboard, payslips, leave, attendance, documents, profile

### 35. SYNC MODULE (`/app/sync`)
- **Sync Queue** - Pending/failed items, retry
- **Sync Logs** - History
- **Conflict Resolution** - Offline sync conflicts
- **Device Management** - Registered devices
- **Offline Settings** - Configuration
- **Local Database Status** - IndexedDB status

### 36. BI MODULE (`/app/bi`)
- **Dashboard Builder** - Custom widgets (line/bar/pie chart, table, KPI card, gauge)
- **Report Builder** - Data sources, columns, filters, sorting, export

### 37. IFRS 16 MODULE (`/app/ifrs16`)
- **Dashboard** - Leases, liability, ROU assets, depreciation
- **Leases** - Lease contracts
- **ROU Assets** - Right-of-use assets
- **Payment Schedules** - Lease payments

### 38. IFRS 15 MODULE (`/app/ifrs15`)
- **Dashboard** - Obligations, contract assets, deferred revenue
- **Obligations** - Performance obligations
- **Contract Assets/Liabilities** - Asset and liability tracking
- **Recognition Schedules** - Revenue recognition
- **Contract Costs** - Cost tracking

### 39. CONSOLIDATION MODULE (`/app/consolidation`)
- **Dashboard** - Groups, pending consolidations
- **Groups** - Company groups with ownership %
- **Intercompany** - Cross-entity transactions
- **Entries** - Elimination, reclassification, adjustment entries

### 40. EDI MODULE (`/app/edi`)
- **Dashboard** - Partners, document types, transactions
- **Partners** - EDI partner management (EDIFACT/X12)
- **Document Types** - Document type management
- **Mappings** - Field mapping configuration
- **Transactions** - Inbound/outbound with detail view
- **Monitor** - EDI log viewer

### 41. WEBHOOKS MODULE (`/app/webhooks`)
- **Dashboard** - Subscription overview
- **Subscriptions** - Create/manage webhook subscriptions
- **Delivery Logs** - Delivery history
- **API Keys** - API key management

### 42. OLAP MODULE (`/app/olap`)
- **Dashboard** - Cubes, dimensions, facts
- **Cubes** - OLAP cube management
- **Designer** - Visual cube designer
- **Dimensions** - Dimension management
- **Fact Tables** - Fact table management
- **Query Builder** - Visual MDX/query builder

### 43. ETL MODULE (`/app/etl`)
- **Dashboard** - Connectors, jobs, transformations
- **Connectors** - Data connector management
- **Jobs** - ETL job management
- **Designer** - Visual job designer
- **Transformations** - Transformation rules
- **Quality** - Data quality rules and logs

### 44. COLLABORATION MODULE (`/app/collaboration`)
- **Dashboard** - Active sessions, online users
- **Sessions** - Create/view collaboration sessions
- **Presence** - Real-time user presence
- **Notifications** - Real-time notification center

### 45. AI MODULE (`/app/ai`)
- **Forecasting** - AI sales/demand forecasting
- **Reports** - Natural language query to chart/table
- **Automation** - AI automation rules
- **Chatbot** - AI assistant with predefined suggestions
- **Voice** - Voice command interface (EN/AR)

### 46. IOT MODULE (`/app/iot`)
- **Dashboard** - Device monitoring, sensor data
- **Devices** - IoT device management
- **Alerts** - Alert configuration

### 47. MOBILE MODULE (`/app/mobile`)
- **Dashboard** - Mobile KPIs, notifications
- **Attendance** - Mobile check-in/out
- **Quick Sales** - Mobile sales entry
- **Site Expense** - Mobile expense capture
- **Technician Jobs** - Mobile job cards
- **Approvals** - Mobile approval workflow

### 48. DOCUMENTS MODULE (`/app/documents`)
- **Repository** - Document search, categories, types
- **Upload** - Document upload with metadata
- **Signatures** - Signature request workflow
- **Signature Pad** - Draw/type/upload signature

### 49. NOTIFICATIONS MODULE (`/app/notifications`)
- **Send** - Manual or template-based notifications
- **Channels** - Email/SMS/WhatsApp/Push config
- **Templates** - Template editor
- **Preferences** - User notification preferences (15 categories)

### 50. INSTALLMENTS MODULE (`/app/installments`)
- Installment plan management, payment tracking

### 51. CASHBOX MODULE (`/app/cashbox`)
- Cash in/out, expenses, balance tracking

### 52. TASKS MODULE (`/app/tasks`)
- Kanban/List/Calendar views, assignment, filtering

### 53. MEETINGS MODULE (`/app/meetings`)
- Schedule meetings, video/in-person, attendees, calendar

### 54. HELPDESK MODULE (`/app/helpdesk`)
- Support tickets, status filtering, priority

### 55. ASSETS MODULE (`/app/assets`)
- Fixed assets management, depreciation
- **Fleet** - Vehicle management, driver assignment

### 56. BRANCHES MODULE (`/app/branches`)
- Multi-branch management, inter-branch transfers

### 57. PLATFORM MODULE (`/app/platform`)
- **Growth Engine** - Features/modules showcase
- **Solution Library** - Browse solutions
- **Solution Page** - Individual solution detail

---

## SHARED UI COMPONENTS

### Layout
- `AppLayout` - Main sidebar layout with navigation, search, notifications
- `AuthLayout` - Authentication pages layout
- `SuperAdminLayout` - Super admin panel layout
- `PortalLayout` - Portal pages layout

### UI Components (shadcn/ui based)
- Button, Badge, Input, Select, Checkbox, Radio
- Dialog, Sheet, Alert Dialog, Command Dialog
- Table, Data Table with sorting/filtering
- Tabs, Accordion, Collapsible
- Card, Separator, Tooltip
- Form components with validation
- Toast/Notification system
- Dropdown Menu, Context Menu
- Avatar, Skeleton, Spinner
- Scroll Area, Resizable panels

### Feature Components
- `SyncStatusBar` - Offline sync status indicator
- `ChatBubble` - Floating chat assistant
- `VoiceCommand` - Voice command interface
- `AiAssistantPanel` - AI assistant panel
- `InvoicePrintPreview` - Invoice print preview
- `InvoicePrintTemplate` - Invoice print template
- `ZatcaQr3D` - ZATCA QR code 3D display
- `SplashScreen` - App loading splash
- `AnimatedBackground` - Background animations
- `ThreeBackground` - Three.js 3D backgrounds
- `ErrorBoundary` - Error catch and display

### Charts (Recharts)
- BarChart, LineChart, PieChart, AreaChart
- Custom KPI cards with sparklines

---

## INTERNATIONALIZATION

### Languages
- **English** (LTR) - Default
- **Arabic** (RTL) - Full translation

### i18n Structure
```json
{
  "app": { "name": "YASCO ERP" },
  "nav": { "dashboard": "Dashboard", "accounting": "Accounting", ... },
  "actions": { "save": "Save", "delete": "Delete", "edit": "Edit", ... },
  "status": { "active": "Active", "inactive": "Inactive", ... },
  "modules": { "inventory": "Inventory", "sales": "Sales", ... }
}
```

### RTL Support
- Automatic direction switching based on language
- Tailwind RTL utilities
- Mirrored layouts for Arabic

---

## KEY FEATURES

### 1. ZATCA E-Invoicing (Saudi Arabia)
- CSR generation, certificate management
- Invoice XML generation (UBL 2.1 format)
- QR code generation with encrypted data
- Phase 1 & Phase 2 compliance
- CSID (Clearance/Reporting)

### 2. FBR Integration (Pakistan)
- NTN/STRN management
- Invoice reporting API

### 3. Multi-Country Tax
- Saudi ZATCA
- Pakistan FBR
- UAE VAT
- General VAT/GST

### 4. Offline-First Architecture
- IndexedDB local storage
- Sync queue with retry
- Conflict resolution
- Background sync
- Connection status detection

### 5. PWA Support
- Service worker for caching
- Installable on mobile/desktop
- Offline page support

### 6. Print Templates
- 5 invoice themes (Classic Box, Modern Clean, 3D Color, Elegant Gold, Minimal Light)
- Custom logo/stamp
- PDF generation
- Saudi-formatted invoices

### 7. Real-Time Features
- WebSocket for live updates
- User presence tracking
- Real-time notifications
- Collaboration sessions

### 8. AI Features
- Sales/demand forecasting
- Natural language reports
- Automation rules
- Chatbot assistant
- Voice commands

### 9. Compliance
- SOC2 audit logs
- GDPR/PDPL data protection
- ISO 27001 security
- Balady permit tracking
- NPHIES healthcare claims

---

## CONFIGURATION FILES

### package.json Dependencies
```
react, react-dom, react-router
@trpc/client, @trpc/react-query, @trpc/server
@tanstack/react-query
hono, @hono/node-server
drizzle-orm, drizzle-kit, postgres
zustand
i18next, react-i18next
tailwindcss, postcss, autoprefixer
vite, @vitejs/plugin-react
recharts
three, @react-three/fiber, @react-three/drei
lucide-react
superjson
nodemailer
jspdf, jspdf-autotable
pdfmake
dexie (IndexedDB)
date-fns, dayjs
zod (validation)
bcryptjs
uuid
```

### Build Commands
```json
{
  "dev": "vite",
  "build": "vite build && esbuild api/boot.ts --platform=node --bundle --format=esm --outdir=dist",
  "build:frontend": "vite build",
  "build:backend": "esbuild api/boot.ts --platform=node --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/boot.js",
  "lint": "eslint ."
}
```

### Vite Config
- React plugin
- Path aliases (@/ → src/)
- Build output to dist/
- Chunk splitting for performance

### Tailwind Config
- shadcn/ui compatible
- Dark mode support
- Custom color scheme
- RTL support

### Drizzle Config
- PostgreSQL connection
- Schema from db/schema.ts
- Migrations in db/migrations/

---

## DEPLOYMENT

### PM2 Ecosystem
```js
module.exports = {
  apps: [{
    name: 'erp-backend',
    script: './dist/boot.js',
    cwd: '/opt/erp',
    env: { NODE_ENV: 'production', PORT: '3000', HOST: '0.0.0.0' },
    max_memory_restart: '1G',
    autorestart: true,
  }]
};
```

### Nginx Config
- SSL termination (Let's Encrypt)
- Proxy to Node.js port 3000
- Static asset caching
- Gzip compression
- Security headers

---

## IMPLEMENTATION ORDER

### Phase 1: Foundation (Weeks 1-4)
1. Project setup (Vite, TypeScript, Tailwind)
2. Database schema (Drizzle ORM)
3. Authentication system (login, register, OTP)
4. Multi-tenancy middleware
5. Main layout (AppLayout with sidebar)
6. Dashboard

### Phase 2: Core Modules (Weeks 5-10)
1. Accounting (COA, Journal, Ledger, Trial Balance)
2. Inventory (Products, Warehouses, Stock)
3. Sales (Customers, Quotations, Invoices, Payments)
4. Purchase (Suppliers, POs, GRN, Payments)
5. CRM (Leads, Opportunities, Activities)
6. HRM (Employees, Attendance, Leave, Payroll)

### Phase 3: Advanced Modules (Weeks 11-16)
1. Manufacturing (BOM, Work Orders, Production)
2. Projects (Tasks, Timesheets)
3. POS (Terminal, Shifts, Multiple modes)
4. Reports (Financial statements, Export)
5. Settings (Company, Tax, Notifications)

### Phase 4: Industry Verticals (Weeks 17-24)
1. Workshop (Job cards, Vehicles, Technicians, Bays, Parts)
2. Salon (Appointments, Stylists, Services)
3. Gym (Members, Plans, Check-in)
4. Hotel (Rooms, Bookings, Calendar, Housekeeping, Events, Billing)
5. Restaurant (Menu, Kitchen, Tables, Delivery)
6. Pharmacy (Prescriptions, Stock, Expiry, Suppliers)
7. Healthcare (Patients, Appointments, Billing, Insurance, Lab)
8. Education (Students, Admissions, Exams, Fees, Library)
9. Construction (WBS, BOQ, Contracts, Daily Reports, HSE)
10. Transport (Fleet, Routes, Drivers, Maintenance, Tracking)
11. Real Estate (Properties, Leases, Rent, Maintenance)
12. Travel (Bookings, Itineraries, Reconciliation)
13. Aviation (Flights, Crew, Maintenance, Parts)
14. Laundry, Hostel, E-commerce

### Phase 5: Enterprise Features (Weeks 25-30)
1. Super Admin panel
2. License system
3. Plugin marketplace
4. Workflow builder
5. BI (Dashboard builder, Report builder)
6. IFRS 15/16
7. Consolidation
8. EDI, Webhooks
9. OLAP, ETL
10. Collaboration

### Phase 6: Advanced Features (Weeks 31-36)
1. AI module (Forecasting, Chatbot, Voice)
2. IoT module
3. Offline sync engine
4. PWA support
5. Portal (Customer, Vendor, Employee)
6. ZATCA Phase 2 compliance
7. Mobile module

### Phase 7: Polish & Deploy (Weeks 37-40)
1. Performance optimization
2. Security audit
3. Testing (unit, integration, E2E)
4. Documentation
5. Deployment setup
6. Monitoring

---

## CRITICAL REQUIREMENTS

1. **Every page must handle loading, error, and empty states**
2. **All data tables must support search, filter, sort, pagination**
3. **All forms must have validation (Zod schemas)**
4. **All API calls must have proper error handling**
5. **RTL support must work correctly for Arabic**
6. **Offline sync must not crash the app on network errors**
7. **All prints/exports must work in both languages**
8. **Multi-currency support throughout**
9. **Role-based access control (admin, manager, user)**
10. **Audit logging for all data changes**
