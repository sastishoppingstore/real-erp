import {
  LayoutDashboard, BookOpen, Package, ShoppingCart, ShoppingBag,
  Users, Briefcase, Factory, FolderKanban, HeadphonesIcon, Truck,
  Settings, BarChart3, Receipt, Landmark, Building2, Warehouse,
  Store, Wallet, CalendarCheck, CreditCard, FileText, Globe,
  ShieldCheck, Wrench, HardHat, Stethoscope, GraduationCap, Hotel,
  Home, Plane, Shirt, Scissors, Dumbbell, UtensilsCrossed, Pill,
  Workflow, Rocket, Compass, Car, ParkingCircle, ClipboardList,
  Grid, FileWarning, Sparkles, type LucideIcon,
} from "lucide-react";

export type LauncherLayoutTheme = "launcher_theme";

export interface LauncherTile {
  key: string;
  label: string;
  labelAr: string;
  icon: LucideIcon;
  path: string;
  gradient: string;
  shadowColor: string;
}

export interface LauncherGroup {
  key: string;
  label: string;
  labelAr: string;
  icon: LucideIcon;
  gradient: string;
  shadowColor: string;
  children: LauncherTile[];
}

export const LAUNCHER_THEME_NAME = "launcher_theme";
export const LAUNCHER_THEME_LABEL = "Launcher Theme";
export const LAUNCHER_THEME_LABEL_AR = "ثيم اللانشر";

export const LAUNCHER_GRID_COLS = "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
export const LAUNCHER_TILE_RADIUS = "rounded-2xl";
export const LAUNCHER_SHELF_PAGE_SIZE = 6;

export const LAUNCHER_SHELL = "from-emerald-950 via-green-900 to-emerald-900";

export const LAUNCHER_BACKGROUND = "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900";

const gradients = [
  { gradient: "linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)", shadow: "rgba(4,120,87,0.45)" },
  { gradient: "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)", shadow: "rgba(180,83,9,0.45)" },
  { gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)", shadow: "rgba(15,118,110,0.45)" },
  { gradient: "linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)", shadow: "rgba(6,95,70,0.45)" },
  { gradient: "linear-gradient(135deg, #a16207 0%, #eab308 50%, #fde047 100%)", shadow: "rgba(161,98,7,0.45)" },
  { gradient: "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #5eead4 100%)", shadow: "rgba(19,78,74,0.45)" },
  { gradient: "linear-gradient(135deg, #166534 0%, #22c55e 50%, #86efac 100%)", shadow: "rgba(22,101,52,0.45)" },
  { gradient: "linear-gradient(135deg, #92400e 0%, #d97706 50%, #f59e0b 100%)", shadow: "rgba(146,64,14,0.42)" },
  { gradient: "linear-gradient(135deg, #0e7490 0%, #06b6d4 50%, #67e8f9 100%)", shadow: "rgba(14,116,144,0.45)" },
  { gradient: "linear-gradient(135deg, #065f46 0%, #059669 50%, #6ee7b7 100%)", shadow: "rgba(6,95,70,0.42)" },
  { gradient: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #fbbf24 100%)", shadow: "rgba(120,53,15,0.42)" },
  { gradient: "linear-gradient(135deg, #155e75 0%, #0891b2 50%, #22d3ee 100%)", shadow: "rgba(21,94,117,0.45)" },
];

export function pickGradient(idx: number) {
  return gradients[idx % gradients.length];
}

export const LAUNCHER_GROUPS: LauncherGroup[] = [
  {
    key: "MAIN", label: "Dashboard", labelAr: "الرئيسية", icon: LayoutDashboard, ...pickGradient(0),
    children: [
      { key: "dashboard", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard, path: "/app", ...pickGradient(0) },
      { key: "pos", label: "POS", labelAr: "نقطة البيع", icon: Store, path: "/app/pos", ...pickGradient(1) },
      { key: "cashbox", label: "Cashbox", labelAr: "الصندوق", icon: Wallet, path: "/app/cashbox", ...pickGradient(2) },
      { key: "installments", label: "Installments", labelAr: "التقسيط", icon: CalendarCheck, path: "/app/installments", ...pickGradient(3) },
    ],
  },
  {
    key: "FINANCE", label: "Finance", labelAr: "المالية", icon: BookOpen, ...pickGradient(1),
    children: [
      { key: "accounting", label: "Accounting", labelAr: "المحاسبة", icon: BookOpen, path: "/app/accounting", ...pickGradient(0) },
      { key: "coa", label: "Chart of Accounts", labelAr: "دليل الحسابات", icon: Landmark, path: "/app/accounting/coa", ...pickGradient(1) },
      { key: "journal", label: "Journal Entries", labelAr: "القيود اليومية", icon: Receipt, path: "/app/accounting/journal-entries", ...pickGradient(2) },
      { key: "ledger", label: "General Ledger", labelAr: "الأستاذ العام", icon: BookOpen, path: "/app/accounting/ledger", ...pickGradient(3) },
      { key: "fin-reports", label: "Financial Reports", labelAr: "التقارير المالية", icon: BarChart3, path: "/app/accounting/reports", ...pickGradient(4) },
    ],
  },
  {
    key: "INVENTORY", label: "Inventory", labelAr: "المخزون", icon: Package, ...pickGradient(2),
    children: [
      { key: "products", label: "Products", labelAr: "الأصناف", icon: Package, path: "/app/inventory/products", ...pickGradient(0) },
      { key: "warehouses", label: "Warehouses", labelAr: "المستودعات", icon: Warehouse, path: "/app/inventory/warehouses", ...pickGradient(1) },
      { key: "stock", label: "Stock Levels", labelAr: "أرصدة المخزون", icon: Package, path: "/app/inventory/stock", ...pickGradient(2) },
      { key: "movements", label: "Movements", labelAr: "حركات المخزون", icon: ShoppingCart, path: "/app/inventory/movements", ...pickGradient(3) },
      { key: "transfers", label: "Transfers", labelAr: "تحويلات المخزون", icon: Truck, path: "/app/inventory/transfers", ...pickGradient(4) },
    ],
  },
  {
    key: "SALES", label: "Sales", labelAr: "المبيعات", icon: ShoppingCart, ...pickGradient(3),
    children: [
      { key: "customers", label: "Customers", labelAr: "العملاء", icon: Users, path: "/app/sales/customers", ...pickGradient(0) },
      { key: "quotations", label: "Quotations", labelAr: "عروض الأسعار", icon: Receipt, path: "/app/sales/quotations", ...pickGradient(1) },
      { key: "orders", label: "Sales Orders", labelAr: "أوامر البيع", icon: ShoppingCart, path: "/app/sales/orders", ...pickGradient(2) },
      { key: "invoices", label: "Invoices", labelAr: "الفواتير", icon: Receipt, path: "/app/sales/invoices", ...pickGradient(3) },
      { key: "credit-notes", label: "Credit Notes", labelAr: "إشعارات دائنة", icon: Receipt, path: "/app/sales/credit-notes", ...pickGradient(4) },
      { key: "payments", label: "Customer Payments", labelAr: "مدفوعات العملاء", icon: Landmark, path: "/app/sales/payments", ...pickGradient(5) },
    ],
  },
  {
    key: "PURCHASE", label: "Purchase", labelAr: "المشتريات", icon: ShoppingBag, ...pickGradient(4),
    children: [
      { key: "suppliers", label: "Suppliers", labelAr: "الموردون", icon: Building2, path: "/app/purchase/suppliers", ...pickGradient(0) },
      { key: "po", label: "Purchase Orders", labelAr: "أوامر الشراء", icon: ShoppingBag, path: "/app/purchase/orders", ...pickGradient(1) },
      { key: "grn", label: "Goods Receipt", labelAr: "استلام البضاعة", icon: Package, path: "/app/purchase/grn", ...pickGradient(2) },
      { key: "sup-pay", label: "Supplier Payments", labelAr: "مدفوعات الموردين", icon: Landmark, path: "/app/purchase/payments", ...pickGradient(3) },
    ],
  },
  {
    key: "CRM", label: "CRM", labelAr: "إدارة العملاء", icon: Users, ...pickGradient(5),
    children: [
      { key: "leads", label: "Leads", labelAr: "العملاء المحتملون", icon: Users, path: "/app/crm/leads", ...pickGradient(0) },
      { key: "opportunities", label: "Opportunities", labelAr: "الفرص", icon: Briefcase, path: "/app/crm/opportunities", ...pickGradient(1) },
      { key: "activities", label: "Activities", labelAr: "الأنشطة", icon: BarChart3, path: "/app/crm/activities", ...pickGradient(2) },
    ],
  },
  {
    key: "HRM", label: "HR & Payroll", labelAr: "الموارد البشرية", icon: Briefcase, ...pickGradient(6),
    children: [
      { key: "employees", label: "Employees", labelAr: "الموظفون", icon: Users, path: "/app/hrm/employees", ...pickGradient(0) },
      { key: "attendance", label: "Attendance", labelAr: "الحضور", icon: Briefcase, path: "/app/hrm/attendance", ...pickGradient(1) },
      { key: "leave", label: "Leave Management", labelAr: "إدارة الإجازات", icon: Briefcase, path: "/app/hrm/leave", ...pickGradient(2) },
      { key: "payroll", label: "Payroll", labelAr: "الرواتب", icon: Landmark, path: "/app/hrm/payroll", ...pickGradient(3) },
      { key: "gosi", label: "Saudi GOSI", labelAr: "الرواتب والتأمينات", icon: ShieldCheck, path: "/app/hrm/saudi-payroll", ...pickGradient(4) },
    ],
  },
  {
    key: "WORKSHOP", label: "Workshop", labelAr: "الورشة", icon: Wrench, ...pickGradient(7),
    children: [
      { key: "ws-dash", label: "Workshop Dashboard", labelAr: "لوحة الورشة", icon: Wrench, path: "/app/verticals/workshop", ...pickGradient(0) },
      { key: "job-cards", label: "Job Cards", labelAr: "بطاقات العمل", icon: ClipboardList, path: "/app/verticals/workshop/job-cards", ...pickGradient(1) },
      { key: "vehicles", label: "Vehicles", labelAr: "المركبات", icon: Car, path: "/app/verticals/workshop/vehicles", ...pickGradient(2) },
      { key: "estimates", label: "Estimates", labelAr: "التقديرات", icon: FileText, path: "/app/verticals/workshop/estimates", ...pickGradient(3) },
      { key: "technicians", label: "Technicians", labelAr: "الفنيين", icon: Users, path: "/app/verticals/workshop/technicians", ...pickGradient(4) },
    ],
  },
  {
    key: "CONSTRUCTION", label: "Construction", labelAr: "المقاولات", icon: HardHat, ...pickGradient(8),
    children: [
      { key: "const-panel", label: "Construction Panel", labelAr: "لوحة المقاولات", icon: HardHat, path: "/app/construction", ...pickGradient(0) },
      { key: "wbs", label: "WBS Structure", labelAr: "هيكل العمل", icon: Workflow, path: "/app/construction/wbs", ...pickGradient(1) },
      { key: "boq", label: "BOQ / Quantities", labelAr: "جدول الكميات", icon: ClipboardList, path: "/app/construction/boq", ...pickGradient(2) },
      { key: "contracts", label: "Contracts", labelAr: "العقود والمشاريع", icon: FileText, path: "/app/construction/contracts", ...pickGradient(3) },
      { key: "hse", label: "HSE Safety", labelAr: "الصحة والسلامة", icon: ShieldCheck, path: "/app/construction/hse", ...pickGradient(4) },
    ],
  },
  {
    key: "HEALTHCARE", label: "Healthcare", labelAr: "الرعاية الصحية", icon: Stethoscope, ...pickGradient(9),
    children: [
      { key: "patients", label: "Patients", labelAr: "المرضى", icon: Stethoscope, path: "/app/verticals/healthcare/patients", ...pickGradient(0) },
      { key: "appts", label: "Appointments", labelAr: "المواعيد", icon: CalendarCheck, path: "/app/verticals/healthcare/appointments", ...pickGradient(1) },
      { key: "roster", label: "Doctor Roster", labelAr: "جدول الأطباء", icon: Users, path: "/app/verticals/healthcare/roster", ...pickGradient(2) },
      { key: "claims", label: "Insurance Claims", labelAr: "مطالبات التأمين", icon: ShieldCheck, path: "/app/verticals/healthcare/insurance-claims", ...pickGradient(3) },
    ],
  },
  {
    key: "EDUCATION", label: "Education", labelAr: "التعليم", icon: GraduationCap, ...pickGradient(10),
    children: [
      { key: "students", label: "Students", labelAr: "الطلاب", icon: GraduationCap, path: "/app/verticals/education/students", ...pickGradient(0) },
      { key: "admissions", label: "Admissions", labelAr: "القبول والتسجيل", icon: Users, path: "/app/verticals/education/admissions", ...pickGradient(1) },
      { key: "fees", label: "Fee Invoicing", labelAr: "فاتورة الرسوم", icon: Receipt, path: "/app/verticals/education/fee-invoicing", ...pickGradient(2) },
      { key: "schedule", label: "Class Schedule", labelAr: "جدول الحصص", icon: CalendarCheck, path: "/app/verticals/education/schedule", ...pickGradient(3) },
    ],
  },
  {
    key: "HOTEL", label: "Hotel", labelAr: "الفنادق", icon: Hotel, ...pickGradient(11),
    children: [
      { key: "rooms", label: "Room Status", labelAr: "حالة الغرف", icon: Hotel, path: "/app/verticals/hotel/rooms", ...pickGradient(0) },
      { key: "bookings", label: "Bookings", labelAr: "الحجوزات", icon: CalendarCheck, path: "/app/verticals/hotel/bookings", ...pickGradient(1) },
      { key: "housekeeping", label: "Housekeeping", labelAr: "تنظيف الغرف", icon: Wrench, path: "/app/verticals/hotel/housekeeping", ...pickGradient(2) },
      { key: "folio", label: "Folio Billing", labelAr: "فوترة النزلاء", icon: Receipt, path: "/app/verticals/hotel/folio-billing", ...pickGradient(3) },
    ],
  },
  {
    key: "RESTAURANT", label: "Restaurant", labelAr: "المطعم", icon: UtensilsCrossed, ...pickGradient(0),
    children: [
      { key: "rest-pos", label: "Restaurant POS", labelAr: "نقطة بيع المطعم", icon: UtensilsCrossed, path: "/app/pos/restaurant", ...pickGradient(0) },
      { key: "menu", label: "Menu Management", labelAr: "إدارة القائمة", icon: FileText, path: "/app/verticals/restaurant/menu", ...pickGradient(1) },
      { key: "tables", label: "Tables Floor", labelAr: "خريطة الطاولات", icon: Grid, path: "/app/verticals/restaurant/tables", ...pickGradient(2) },
      { key: "kitchen", label: "Kitchen KDS", labelAr: "شاشة المطبخ", icon: ClipboardList, path: "/app/verticals/restaurant/kitchen", ...pickGradient(3) },
    ],
  },
  {
    key: "SALON", label: "Salon", labelAr: "الصالون", icon: Scissors, ...pickGradient(7),
    children: [
      { key: "salon-dash", label: "Salon Dashboard", labelAr: "لوحة الصالون", icon: Scissors, path: "/app/verticals/salon", ...pickGradient(0) },
      { key: "salon-appts", label: "Appointments", labelAr: "المواعيد", icon: CalendarCheck, path: "/app/verticals/salon/appointments", ...pickGradient(1) },
      { key: "salon-staff", label: "Staff & Commissions", labelAr: "الموظفين والعمولات", icon: Users, path: "/app/verticals/salon/staff", ...pickGradient(2) },
    ],
  },
  {
    key: "GYM", label: "Gym", labelAr: "النادي الرياضي", icon: Dumbbell, ...pickGradient(5),
    children: [
      { key: "gym-dash", label: "Gym Dashboard", labelAr: "لوحة النادي", icon: Dumbbell, path: "/app/verticals/gym", ...pickGradient(0) },
      { key: "memberships", label: "Memberships", labelAr: "العضويات", icon: CreditCard, path: "/app/verticals/gym/memberships", ...pickGradient(1) },
      { key: "checkins", label: "Check-ins", labelAr: "تسجيل الدخول", icon: ClipboardList, path: "/app/verticals/gym/checkins", ...pickGradient(2) },
    ],
  },
  {
    key: "LAUNDRY", label: "Laundry", labelAr: "المغسلة", icon: Shirt, ...pickGradient(6),
    children: [
      { key: "laundry-dash", label: "Laundry Dashboard", labelAr: "لوحة المغسلة", icon: Shirt, path: "/app/verticals/laundry", ...pickGradient(0) },
      { key: "laundry-orders", label: "Orders", labelAr: "الطلبات", icon: ClipboardList, path: "/app/verticals/laundry/orders", ...pickGradient(1) },
      { key: "laundry-delivery", label: "Delivery", labelAr: "التوصيل", icon: Truck, path: "/app/verticals/laundry/delivery", ...pickGradient(2) },
    ],
  },
  {
    key: "ECOMMERCE", label: "E-Commerce", labelAr: "التجارة الإلكترونية", icon: Globe, ...pickGradient(4),
    children: [
      { key: "ecom-dash", label: "E-Commerce Dashboard", labelAr: "لوحة التجارة الإلكترونية", icon: Globe, path: "/app/verticals/ecommerce", ...pickGradient(0) },
      { key: "ecom-orders", label: "Orders", labelAr: "الطلبات", icon: ShoppingCart, path: "/app/verticals/ecommerce/orders", ...pickGradient(1) },
      { key: "ecom-sync", label: "Channel Sync", labelAr: "مزامنة القنوات", icon: Workflow, path: "/app/verticals/ecommerce/sync", ...pickGradient(2) },
    ],
  },
  {
    key: "PHARMACY", label: "Pharmacy", labelAr: "الصيدلية", icon: Pill, ...pickGradient(9),
    children: [
      { key: "pharm-pos", label: "Pharmacy POS", labelAr: "نقطة بيع الصيدلية", icon: Store, path: "/app/pos/pharmacy", ...pickGradient(0) },
      { key: "prescriptions", label: "Prescriptions", labelAr: "الوصفات الطبية", icon: ClipboardList, path: "/app/verticals/pharmacy/prescriptions", ...pickGradient(1) },
      { key: "pharm-stock", label: "Medication Stock", labelAr: "مخزون الأدوية", icon: Package, path: "/app/verticals/pharmacy/stock", ...pickGradient(2) },
      { key: "pharm-expiry", label: "Near Expiry Alerts", labelAr: "تنبيهات انتهاء الصلاحية", icon: FileWarning, path: "/app/verticals/pharmacy/expiry", ...pickGradient(3) },
    ],
  },
  {
    key: "SYSTEM", label: "System", labelAr: "النظام", icon: Settings, ...pickGradient(10),
    children: [
      { key: "reports", label: "Reports", labelAr: "التقارير", icon: BarChart3, path: "/app/reports", ...pickGradient(0) },
      { key: "zatca-dash", label: "ZATCA Dashboard", labelAr: "لوحة الزكاة والضريبة", icon: ShieldCheck, path: "/app/reports/zatca-dashboard", ...pickGradient(1) },
      { key: "settings", label: "Settings", labelAr: "الإعدادات", icon: Settings, path: "/app/settings", ...pickGradient(2) },
      { key: "branches", label: "Branches", labelAr: "الفروع", icon: Building2, path: "/app/branches", ...pickGradient(3) },
      { key: "company", label: "Company Profile", labelAr: "ملف الشركة", icon: Building2, path: "/app/settings/company-profile", ...pickGradient(4) },
    ],
  },
];
