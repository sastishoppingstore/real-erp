import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, Network, Ruler, ClipboardList, AlertTriangle, FileSignature, ScrollText, FilePlus2,
  BadgeCheck, ClipboardCheck, ShoppingCart, Truck, Warehouse, ArrowLeftRight, Package, ListChecks,
  Boxes, Users, CalendarCheck, Clock, Banknote, Coins, IdCard, Gauge, HardHat, Handshake, Receipt,
  FileText, Wallet, Landmark, FileCheck2, ChartColumn, ShieldCheck, FileWarning, Siren, Users2,
  Wrench, Repeat, Hammer, Fuel, Globe, Settings, Bell, Sparkles, Search, CalendarDays, Plus,
  ArrowUpRight, Activity, CircleAlert, TrendingUp, FolderKanban, Calculator, PaintBucket, Layers,
  Scale, LifeBuoy, Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  useDeco, useToday, LauncherTile, LauncherGroup, QuickAction, AlertChip, Kpi,
  money, num, StatusPill, type Tone,
} from "./shared";
import { QuickInvoiceDialog } from "./QuickInvoice";

type Tile = {
  key: string;
  en: string;
  ar: string;
  descEn: string;
  descAr: string;
  path: string;
  icon: any;
  tone: Tone;
  badge?: number;
};

type Group = {
  key: string;
  en: string;
  ar: string;
  accent: Tone;
  tiles: Tile[];
};

export default function DecorationDashboard() {
  const { L, isAr } = useDeco();
  const today = useToday();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");

  const dashQ = trpc.decoration.decorationDashboard.useQuery(undefined);
  const activityQ = trpc.decoration.auditLogList.useQuery({ limit: 8 });
  const notifQ = trpc.decoration.notificationList.useQuery({ unreadOnly: true });
  const companyQ = trpc.settings.companySettingsGet.useQuery(undefined, { retry: false });

  const d = dashQ.data;
  const loading = dashQ.isLoading;

  const groups: Group[] = useMemo(() => [
    {
      key: "projects", en: "Projects & Site", ar: "المشاريع والموقع", accent: "emerald",
      tiles: [
        { key: "projects", en: "Projects", ar: "المشاريع", descEn: "Project cards, budgets & status", descAr: "بطاقات المشاريع والميزانيات والحالة", path: "/app/decoration/projects", icon: Building2, tone: "emerald", badge: d?.projects },
        { key: "structure", en: "Building Structure", ar: "هيكل المبنى", descEn: "Building → floor → unit → room", descAr: "مبنى ← طابق ← وحدة ← غرفة", path: "/app/decoration/structure", icon: Network, tone: "sky", badge: d?.rooms },
        { key: "takeoff", en: "Area Take-off", ar: "حصر المساحات", descEn: "Room dimensions & opening deductions", descAr: "أبعاد الغرف وخصم الفتحات", path: "/app/decoration/takeoff", icon: Ruler, tone: "brass" },
        { key: "execution", en: "Site Diary & Progress", ar: "يومية الموقع والتقدم", descEn: "Daily reports, progress, RFIs & MARs", descAr: "التقارير اليومية والتقدم وطلبات المعلومات", path: "/app/decoration/execution", icon: ClipboardList, tone: "teal" },
        { key: "snags", en: "Snags & Punch List", ar: "الملاحظات وقائمة الإغلاق", descEn: "Defects, severity & close-out", descAr: "العيوب والخطورة والإغلاق", path: "/app/decoration/quality", icon: AlertTriangle, tone: "rose", badge: d?.openSnags },
        { key: "projectboard", en: "Project Board", ar: "لوحة المشروع", descEn: "Cost vs progress per project", descAr: "التكلفة مقابل التقدم لكل مشروع", path: "/app/decoration/projects", icon: FolderKanban, tone: "indigo" },
      ],
    },
    {
      key: "estimating", en: "Estimating & Contracts", ar: "التسعير والعقود", accent: "brass",
      tiles: [
        { key: "tenders", en: "Tenders", ar: "المناقصات", descEn: "Bid bonds, submission & win/loss", descAr: "ضمانات المناقصات والتقديم والفوز/الخسارة", path: "/app/decoration/estimating?tab=tenders", icon: FileSignature, tone: "brass", badge: d?.tendersOpen },
        { key: "quotations", en: "Quotations", ar: "عروض الأسعار", descEn: "Revisions, approvals & conversion", descAr: "المراجعات والاعتمادات والتحويل", path: "/app/decoration/estimating?tab=quotations", icon: ScrollText, tone: "sky" },
        { key: "boq", en: "BOQ & Costing", ar: "الجدول التقديري والتكلفة", descEn: "Sections, rates, overhead & profit", descAr: "الأقسام والأسعار والمصاريف والربح", path: "/app/decoration/boq", icon: Calculator, tone: "violet" },
        { key: "contracts", en: "Contracts", ar: "العقود", descEn: "Terms, retention, bonds & LDs", descAr: "الشروط والمحتجزات والضمانات والغرامات", path: "/app/decoration/contracts?tab=contracts", icon: FileSignature, tone: "emerald", badge: d?.contractsActive },
        { key: "variations", en: "Variations & Change Orders", ar: "الأوامر التغييرية", descEn: "Scope changes and approvals", descAr: "تغييرات النطاق والاعتمادات", path: "/app/decoration/contracts?tab=variations", icon: FilePlus2, tone: "brass" },
        { key: "handover", en: "Handover & DLP", ar: "التسليم وفترة الضمان", descEn: "Completion, warranty & DLP tracking", descAr: "الإنجاز والضمان وتتبع فترة العيوب", path: "/app/decoration/contracts?tab=handover", icon: BadgeCheck, tone: "teal", badge: d?.handoverPending },
      ],
    },
    {
      key: "procurement", en: "Procurement & Stores", ar: "المشتريات والمخازن", accent: "sky",
      tiles: [
        { key: "mr", en: "Material Requests", ar: "طلبات المواد", descEn: "Site request → approval → fulfillment", descAr: "طلب الموقع ← الاعتماد ← التوريد", path: "/app/decoration/procurement", icon: ClipboardCheck, tone: "sky", badge: d?.materialRequestsPending },
        { key: "po", en: "Purchase Orders", ar: "أوامر الشراء", descEn: "RFQ comparison & supplier POs", descAr: "مقارنة العروض وأوامر الشراء", path: "/app/decoration/procurement", icon: ShoppingCart, tone: "indigo", badge: d?.purchaseOrdersOpen },
        { key: "grn", en: "GRN & Supplier Invoices", ar: "استلام البضائع وفواتير الموردين", descEn: "Three-way match & receipts", descAr: "المطابقة الثلاثية والاستلام", path: "/app/decoration/procurement", icon: Truck, tone: "emerald" },
        { key: "stores", en: "Stores & Warehouses", ar: "المخازن والمستودعات", descEn: "Project stores & transfers", descAr: "مخازن المشاريع والتحويلات", path: "/app/decoration/stores?tab=stores", icon: Warehouse, tone: "brass" },
        { key: "moves", en: "Stock Movements", ar: "حركة المخزون", descEn: "In / out / transfer / scrap", descAr: "إدخال / إخراج / تحويل / تالف", path: "/app/decoration/stores?tab=moves", icon: ArrowLeftRight, tone: "slate" },
        { key: "issues", en: "Material Issues", ar: "صرف المواد", descEn: "Issue to project, room & activity", descAr: "الصرف للمشروع والغرفة والنشاط", path: "/app/decoration/stores?tab=issues", icon: Package, tone: "violet" },
        { key: "counts", en: "Stock Count", ar: "الجرد الفعلي", descEn: "Physical counts & adjustments", descAr: "الجرد الفعلي والتسويات", path: "/app/decoration/stores?tab=counts", icon: ListChecks, tone: "teal" },
        { key: "materials", en: "Materials Master", ar: "دليل المواد", descEn: "Items, units, costs & reorder levels", descAr: "الأصناف والوحدات والتكاليف والحد الأدنى", path: "/app/decoration/masterdata", icon: Boxes, tone: "indigo", badge: d?.lowStockItems },
      ],
    },
    {
      key: "labour", en: "Labour & Payroll", ar: "العمالة والرواتب", accent: "teal",
      tiles: [
        { key: "labour", en: "Labour Register", ar: "سجل العمالة", descEn: "Iqama, profession, GOSI & rates", descAr: "الإقامة والمهنة والتأمينات والأجور", path: "/app/decoration/labour", icon: Users, tone: "teal", badge: d?.activeLabour },
        { key: "attendance", en: "Attendance", ar: "الحضور", descEn: "Manual, mobile & GPS check-in", descAr: "يدوي وجوال وتسجيل بالموقع", path: "/app/decoration/labour", icon: CalendarCheck, tone: "emerald" },
        { key: "timesheets", en: "Timesheets", ar: "كشوف الأوقات", descEn: "Hours per project & activity", descAr: "الساعات لكل مشروع ونشاط", path: "/app/decoration/payroll?tab=timesheets", icon: Clock, tone: "sky" },
        { key: "payroll", en: "Payroll & WPS", ar: "الرواتب وحماية الأجور", descEn: "Salary runs, GOSI & EOSB", descAr: "مسيرات الرواتب والتأمينات والمكافأة", path: "/app/decoration/payroll?tab=runs", icon: Banknote, tone: "violet" },
        { key: "advances", en: "Advances & Loans", ar: "السلف والقروض", descEn: "Employee advances and recovery", descAr: "سلف الموظفين واستردادها", path: "/app/decoration/payroll?tab=advances", icon: Coins, tone: "brass" },
        { key: "expiry", en: "Document Expiry", ar: "انتهاء المستندات", descEn: "Iqama, passport, insurance & permits", descAr: "الإقامة والجواز والتأمين والتصاريح", path: "/app/decoration/payroll?tab=expiry", icon: IdCard, tone: "rose", badge: (d?.expiringDocs ?? 0) + (d?.expiredDocs ?? 0) },
        { key: "productivity", en: "Productivity & Piece-rate", ar: "الإنتاجية والعمل بالقطعة", descEn: "m² per worker per day", descAr: "متر مربع لكل عامل يومياً", path: "/app/decoration/payroll?tab=productivity", icon: Gauge, tone: "indigo" },
      ],
    },
    {
      key: "subcontracts", en: "Subcontractors", ar: "المقاولون الفرعيون", accent: "violet",
      tiles: [
        { key: "subs", en: "Subcontractors", ar: "المقاولون الفرعيون", descEn: "CR, VAT, IBAN & ratings", descAr: "السجل والضريبة والآيبان والتقييم", path: "/app/decoration/subcontracts", icon: HardHat, tone: "violet" },
        { key: "agreements", en: "Subcontract Agreements", ar: "اتفاقيات المقاولة", descEn: "Scope, rates & retention terms", descAr: "النطاق والأسعار وشروط المحتجز", path: "/app/decoration/subcontracts", icon: Handshake, tone: "emerald" },
        { key: "workorders", en: "Work Orders", ar: "أوامر العمل", descEn: "Assign scope and quantities", descAr: "إسناد النطاق والكميات", path: "/app/decoration/subcontracts", icon: ClipboardList, tone: "sky" },
        { key: "ipc", en: "IPCs & Payments", ar: "المستخلصات والمدفوعات", descEn: "Certified progress certificates", descAr: "شهادات التقدم المعتمدة", path: "/app/decoration/subcontracts", icon: Receipt, tone: "rose", badge: d?.ipcPending },
        { key: "ledger", en: "Subcontractor Ledger", ar: "كشف حساب المقاول", descEn: "Balance, back-charges & penalties", descAr: "الرصيد والخصومات والغرامات", path: "/app/decoration/subcontracts", icon: ScrollText, tone: "slate" },
      ],
    },
    {
      key: "billing", en: "Billing & Treasury", ar: "الفوترة والخزينة", accent: "indigo",
      tiles: [
        { key: "invoices", en: "Invoices (ZATCA)", ar: "الفواتير (زاتكا)", descEn: "Tax / simplified + PDF, Excel, XML", descAr: "ضريبية / مبسطة + PDF وExcel وXML", path: "/app/decoration/invoices", icon: Receipt, tone: "emerald", badge: d?.overdueInvoices },
        { key: "progressbill", en: "Progress Bills / IPC", ar: "المستخلصات", descEn: "Running bills by % or quantity", descAr: "المستخلصات الجارية بالنسبة أو الكمية", path: "/app/decoration/invoices", icon: FileText, tone: "sky" },
        { key: "receipts", en: "Receipt Vouchers", ar: "سندات القبض", descEn: "Client collections & allocations", descAr: "تحصيل العملاء وتخصيص المبالغ", path: "/app/decoration/treasury?tab=receipts", icon: Banknote, tone: "teal" },
        { key: "payments", en: "Payment Vouchers", ar: "سندات الصرف", descEn: "Supplier, sub & expense payments", descAr: "مدفوعات الموردين والمقاولين والمصروفات", path: "/app/decoration/treasury?tab=payments", icon: Wallet, tone: "violet" },
        { key: "cheques", en: "PDC Cheques", ar: "الشيكات المؤجلة", descEn: "Post-dated cheques & banks", descAr: "الشيكات المؤجلة والبنوك", path: "/app/decoration/treasury?tab=cheques", icon: Landmark, tone: "brass" },
        { key: "petty", en: "Petty Cash", ar: "النقدية البسيطة", descEn: "Site floats & replenishment", descAr: "عهد الموقع وتغذيتها", path: "/app/decoration/treasury?tab=petty", icon: Coins, tone: "slate" },
        { key: "claims", en: "Expense Claims", ar: "مطالبات المصروفات", descEn: "Employee claims & approvals", descAr: "مطالبات الموظفين والاعتمادات", path: "/app/decoration/treasury?tab=claims", icon: FileCheck2, tone: "rose" },
        { key: "aging", en: "Aging & Statements", ar: "الأعمار والكشوف", descEn: "Receivable / payable ageing", descAr: "أعمار المستحقات والمدفوعات", path: "/app/decoration/reports?tab=finance", icon: ChartColumn, tone: "indigo" },
      ],
    },
    {
      key: "quality", en: "Quality & HSE", ar: "الجودة والسلامة", accent: "rose",
      tiles: [
        { key: "quality", en: "Quality & HSE", ar: "الجودة والسلامة", descEn: "Checklists, NCRs, incidents & PPE", descAr: "قوائم الفحص وتقارير عدم المطابقة والحوادث", path: "/app/decoration/quality", icon: ShieldCheck, tone: "rose" },
        { key: "inspections", en: "Inspections / IR", ar: "التفتيش وطلبات الفحص", descEn: "Activity inspection requests", descAr: "طلبات فحص الأنشطة", path: "/app/decoration/quality", icon: ClipboardCheck, tone: "emerald" },
        { key: "ncr", en: "NCR", ar: "تقارير عدم المطابقة", descEn: "Non-conformance & corrective actions", descAr: "عدم المطابقة والإجراءات التصحيحية", path: "/app/decoration/quality", icon: FileWarning, tone: "brass" },
        { key: "incidents", en: "Safety Incidents", ar: "حوادث السلامة", descEn: "Incident reports & investigation", descAr: "تقارير الحوادث والتحقيق", path: "/app/decoration/quality", icon: Siren, tone: "rose" },
        { key: "toolbox", en: "Toolbox Talks", ar: "الاجتماعات التوعوية", descEn: "Daily safety briefings", descAr: "الإحاطات اليومية للسلامة", path: "/app/decoration/quality", icon: Users2, tone: "teal" },
        { key: "ppe", en: "PPE Issue", ar: "صرف معدات السلامة", descEn: "Helmets, gloves, harnesses", descAr: "الخوذ والقفازات والأحزمة", path: "/app/decoration/quality", icon: HardHat, tone: "sky" },
        { key: "licences", en: "Company Licences", ar: "تراخيص الشركة", descEn: "CR, Balady, Civil Defense & Etimad", descAr: "السجل وبلدي والدفاع المدني واعتماد", path: "/app/decoration/settings?tab=licences", icon: BadgeCheck, tone: "indigo" },
      ],
    },
    {
      key: "equipment", en: "Equipment & Fleet", ar: "المعدات والأسطول", accent: "slate",
      tiles: [
        { key: "equipment", en: "Equipment Register", ar: "سجل المعدات", descEn: "Owned / rented tools & machines", descAr: "المعدات المملوكة والمستأجرة", path: "/app/decoration/equipment", icon: Wrench, tone: "slate" },
        { key: "allocations", en: "Allocations", ar: "التخصيص", descEn: "Equipment to project & operator", descAr: "المعدات للمشروع والمشغل", path: "/app/decoration/equipment", icon: Repeat, tone: "emerald" },
        { key: "maintenance", en: "Maintenance", ar: "الصيانة", descEn: "Schedules, breakdowns & cost", descAr: "الجداول والأعطال والتكلفة", path: "/app/decoration/equipment", icon: Hammer, tone: "brass" },
        { key: "fuel", en: "Fuel Logs", ar: "سجلات الوقود", descEn: "Consumption per machine", descAr: "الاستهلاك لكل معدة", path: "/app/decoration/equipment", icon: Fuel, tone: "sky" },
        { key: "vehicles", en: "Vehicle Documents", ar: "مستندات المركبات", descEn: "Istimara, insurance & Fahas", descAr: "الاستمارة والتأمين والفحص", path: "/app/decoration/equipment", icon: Truck, tone: "rose" },
      ],
    },
    {
      key: "control", en: "Approvals & Control", ar: "الاعتمادات والرقابة", accent: "brass",
      tiles: [
        { key: "approvals", en: "Approvals Inbox", ar: "صندوق الاعتمادات", descEn: "MR, PO, IPC, VO & payment approvals", descAr: "اعتمادات الطلبات والأوامر والمستخلصات", path: "/app/decoration/approvals", icon: BadgeCheck, tone: "brass", badge: d?.pendingApprovals },
        { key: "audit", en: "Audit Trail", ar: "سجل التدقيق", descEn: "Every create, edit, delete & approval", descAr: "كل إنشاء وتعديل وحذف واعتماد", path: "/app/decoration/approvals?tab=audit", icon: ScrollText, tone: "slate" },
        { key: "notifications", en: "Notifications", ar: "الإشعارات", descEn: "Expiry, delay, low stock & overdue", descAr: "الانتهاء والتأخير ونقص المخزون والتأخر", path: "/app/decoration/settings", icon: Bell, tone: "rose", badge: d?.unreadNotifications },
        { key: "reports", en: "Reports Hub", ar: "مركز التقارير", descEn: "90 reports — PDF & Excel, AR/EN", descAr: "٩٠ تقريراً — PDF وExcel، عربي/إنجليزي", path: "/app/decoration/reports", icon: ChartColumn, tone: "indigo" },
        { key: "settings", en: "Module Settings", ar: "إعدادات الوحدة", descEn: "VAT, numbering, roles & branding", descAr: "الضريبة والترقيم والأدوار والهوية", path: "/app/decoration/settings", icon: Settings, tone: "slate" },
      ],
    },
    {
      key: "master", en: "Master Data & Portal", ar: "البيانات الأساسية والبوابة", accent: "emerald",
      tiles: [
        { key: "clients", en: "Clients & Owners", ar: "العملاء والمالكون", descEn: "CR, VAT, address & credit limit", descAr: "السجل والضريبة والعنوان وحد الائتمان", path: "/app/decoration/masterdata", icon: Building2, tone: "emerald" },
        { key: "suppliers", en: "Suppliers", ar: "الموردون", descEn: "Bank, IBAN & documents", descAr: "البنك والآيبان والمستندات", path: "/app/decoration/masterdata", icon: Truck, tone: "sky" },
        { key: "consultants", en: "Consultants & Main Contractors", ar: "الاستشاريون والمقاولون الرئيسيون", descEn: "When we work as subcontractor", descAr: "عند العمل كمقاول فرعي", path: "/app/decoration/masterdata", icon: Briefcase, tone: "brass" },
        { key: "workitems", en: "Work Item Library", ar: "مكتبة بنود الأعمال", descEn: "Material + labour rate per unit", descAr: "تكلفة المواد والعمالة لكل وحدة", path: "/app/decoration/masterdata", icon: ListChecks, tone: "violet" },
        { key: "portal", en: "Client Portal", ar: "بوابة العميل", descEn: "Progress, photos, invoices & approvals", descAr: "التقدم والصور والفواتير والاعتمادات", path: "/app/decoration/portal", icon: Globe, tone: "teal" },
        { key: "help", en: "Setup & Help", ar: "الإعداد والمساعدة", descEn: "Install steps, roles & support", descAr: "خطوات التركيب والأدوار والدعم", path: "/app/decoration/settings?tab=help", icon: LifeBuoy, tone: "slate" },
      ],
    },
  ], [d]);

  const needle = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return groups;
    return groups
      .map((g) => ({
        ...g,
        tiles: g.tiles.filter((t) =>
          `${t.en} ${t.ar} ${t.descEn} ${t.descAr}`.toLowerCase().includes(needle),
        ),
      }))
      .filter((g) => g.tiles.length > 0);
  }, [groups, needle]);

  const totalTiles = groups.reduce((n, g) => n + g.tiles.length, 0);
  const shown = filtered.reduce((n, g) => n + g.tiles.length, 0);

  const company = isAr
    ? (companyQ.data as any)?.companyNameAr || (companyQ.data as any)?.companyName
    : (companyQ.data as any)?.companyName;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return L("Good morning", "صباح الخير");
    if (h < 17) return L("Good afternoon", "مساء الخير");
    return L("Good evening", "مساء الخير");
  })();

  return (
    <div className="space-y-6 pb-6">
      {/* ═══════════════ HERO — blueprint board ═══════════════ */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#0b2f21] text-white shadow-[0_30px_60px_-40px_rgba(11,47,33,0.9)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                <Sparkles className="h-3 w-3" />
                {L("Decoration & Construction", "الديكور والإنشاءات")}
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {greeting}
                {user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="mt-1 text-sm text-emerald-100/90">
                {company || L("YASCO ERP", "ياسكو")} ·{" "}
                {L("False ceiling · Wall sealing · Interior fit-out", "أسقف مستعارة · عزل جدران · تشطيبات داخلية")}
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-200/80">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {today.gregorian}
                </span>
                <span className="opacity-40">|</span>
                <span dir="rtl" className="inline-flex items-center gap-1.5">
                  {isAr ? `${today.hijri} هـ` : today.hijri}
                </span>
              </p>
            </div>

            <div className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute start-3 top-3 h-4 w-4 text-emerald-200/70" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={L("Search all functions… (invoice, material, snag)", "ابحث في كل الوظائف… (فاتورة، مواد، ملاحظة)")}
                  className="h-11 border-white/20 bg-white/10 ps-9 text-white placeholder:text-emerald-200/60 focus-visible:ring-amber-400"
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <QuickInvoiceDialog
                  trigger={
                    <QuickAction primary icon={<Plus className="h-4 w-4" />} label={L("Invoice", "فاتورة")} onClick={() => {}} />
                  }
                />
                <QuickAction icon={<Building2 className="h-4 w-4" />} label={L("Project", "مشروع")} onClick={() => navigate("/app/decoration/projects")} />
                <QuickAction icon={<ClipboardCheck className="h-4 w-4" />} label={L("Material", "مواد")} onClick={() => navigate("/app/decoration/procurement")} />
                <QuickAction icon={<Ruler className="h-4 w-4" />} label={L("Take-off", "حصر")} onClick={() => navigate("/app/decoration/takeoff")} />
                <QuickAction icon={<AlertTriangle className="h-4 w-4" />} label={L("Snag", "ملاحظة")} onClick={() => navigate("/app/decoration/quality")} />
                <QuickAction icon={<Receipt className="h-4 w-4" />} label={L("Reports", "تقارير")} onClick={() => navigate("/app/decoration/reports")} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ ALERT RAIL ═══════════════ */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Activity className="h-3.5 w-3.5" /> {L("Needs attention", "يحتاج انتباه")}
        </span>
        <AlertChip count={d?.pendingApprovals ?? 0} label={L("pending approvals", "اعتماد معلق")} tone="brass" onClick={() => navigate("/app/decoration/approvals")} />
        <AlertChip count={d?.overdueInvoices ?? 0} label={L("overdue invoices", "فاتورة متأخرة")} tone="rose" onClick={() => navigate("/app/decoration/invoices")} />
        <AlertChip count={d?.openSnags ?? 0} label={L("open snags", "ملاحظة مفتوحة")} tone="violet" onClick={() => navigate("/app/decoration/quality")} />
        <AlertChip count={(d?.expiringDocs ?? 0) + (d?.expiredDocs ?? 0)} label={L("documents expiring", "مستند ينتهي")} tone="brass" onClick={() => navigate("/app/decoration/payroll?tab=expiry")} />
        <AlertChip count={d?.lowStockItems ?? 0} label={L("low stock", "مخزون منخفض")} tone="sky" onClick={() => navigate("/app/decoration/stores")} />
        <AlertChip count={d?.unreadNotifications ?? 0} label={L("unread alerts", "تنبيه غير مقروء")} tone="slate" onClick={() => navigate("/app/decoration/settings")} />
        {!loading &&
        !d?.pendingApprovals &&
        !d?.overdueInvoices &&
        !d?.openSnags &&
        !d?.lowStockItems ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" /> {L("All clear today", "كل شيء تحت السيطرة اليوم")}
          </span>
        ) : null}
      </div>

      {/* ═══════════════ KPIs ═══════════════ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label={L("Active projects", "المشاريع النشطة")}
          value={loading ? "—" : num(d?.runningProjects)}
          sub={L(`${d?.projects ?? 0} total projects`, `${d?.projects ?? 0} إجمالي المشاريع`)}
          icon={<Building2 className="h-5 w-5" />}
          tone="emerald"
          onClick={() => navigate("/app/decoration/projects")}
        />
        <Kpi
          label={L("Contract value", "قيمة العقود")}
          value={loading ? "—" : money(d?.contractValue)}
          sub={L(`${d?.rooms ?? 0} rooms tracked`, `${d?.rooms ?? 0} غرفة مسجلة`)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="sky"
        />
        <Kpi
          label={L("Receivables", "المستحقات")}
          value={loading ? "—" : money(d?.receivables)}
          sub={L(`${money(d?.invoiced)} invoiced`, `${money(d?.invoiced)} مفوتر`)}
          icon={<CircleAlert className="h-5 w-5" />}
          tone="brass"
          onClick={() => navigate("/app/decoration/invoices")}
        />
        <Kpi
          label={L("Pending approvals", "الاعتمادات المعلقة")}
          value={loading ? "—" : num(d?.pendingApprovals)}
          sub={L("MR · PO · IPC · VO · payments", "طلبات · أوامر · مستخلصات · تغييرات · مدفوعات")}
          icon={<BadgeCheck className="h-5 w-5" />}
          tone="violet"
          onClick={() => navigate("/app/decoration/approvals")}
        />
      </div>

      {/* ═══════════════ LAUNCHER ═══════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
          <Layers className="h-4 w-4 text-amber-600" />
          {L("All functions", "كل الوظائف")}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            {needle ? `${shown}/${totalTiles}` : totalTiles}
          </span>
        </h2>
        {needle ? (
          <button
            type="button"
            onClick={() => setQ("")}
            className="text-xs font-medium text-amber-700 hover:text-amber-800"
          >
            {L("Clear search", "مسح البحث")}
          </button>
        ) : (
          <p className="text-[11px] text-slate-400">
            {L("Everything you need — one click away.", "كل ما تحتاجه — بنقرة واحدة.")}
          </p>
        )}
      </div>

      <div className="space-y-6 rounded-[26px] border border-[#efeae0] bg-[#f7f5f0] p-4 sm:p-5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <PaintBucket className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">
              {L("No function matches that search.", "لا توجد وظيفة مطابقة لهذا البحث.")}
            </p>
          </div>
        ) : (
          filtered.map((g) => (
            <LauncherGroup key={g.key} title={L(g.en, g.ar)} accent={g.accent}>
              {g.tiles.map((t) => (
                <LauncherTile
                  key={t.key}
                  label={L(t.en, t.ar)}
                  desc={L(t.descEn, t.descAr)}
                  icon={<t.icon className="h-[22px] w-[22px]" />}
                  tone={t.tone}
                  badge={t.badge}
                  onClick={() => navigate(t.path)}
                />
              ))}
            </LauncherGroup>
          ))
        )}
      </div>

      {/* ═══════════════ RECENT ACTIVITY + NOTIFICATIONS ═══════════════ */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#e6e1d6] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#eee9df] px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#10231c]">
              <Activity className="h-4 w-4 text-emerald-700" />
              {L("Recent activity", "آخر النشاطات")}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/decoration/approvals?tab=audit")}>
              {L("Audit trail", "سجل التدقيق")} <ArrowUpRight className="ms-1 h-3.5 w-3.5" />
            </Button>
          </header>
          <ul className="divide-y divide-[#f1ede4]">
            {(activityQ.data ?? []).length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-slate-400">
                {L("No activity yet.", "لا يوجد نشاط بعد.")}
              </li>
            ) : (
              (activityQ.data ?? []).map((a: any) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-bold uppercase text-emerald-700">
                    {String(a.action ?? "?").slice(0, 3)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {String(a.entityType ?? "").replace(/^dc_/, "").replace(/_/g, " ")}
                      {a.entityId ? ` #${a.entityId}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString(isAr ? "ar-SA" : "en-GB") : ""}
                    </p>
                  </div>
                  <StatusPill status={a.action} />
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e6e1d6] bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-[#eee9df] px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#10231c]">
              <Bell className="h-4 w-4 text-rose-600" />
              {L("Notifications", "الإشعارات")}
              {notifQ.data?.length ? (
                <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{notifQ.data.length}</span>
              ) : null}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/decoration/settings")}>
              {L("Manage", "إدارة")} <ArrowUpRight className="ms-1 h-3.5 w-3.5" />
            </Button>
          </header>
          <ul className="divide-y divide-[#f1ede4]">
            {(notifQ.data ?? []).length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-slate-400">
                {L("No unread notifications.", "لا إشعارات غير مقروءة.")}
              </li>
            ) : (
              (notifQ.data ?? []).slice(0, 8).map((n: any) => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{n.title ?? n.category}</p>
                    {n.body ? <p className="line-clamp-2 text-[11px] text-slate-400">{n.body}</p> : null}
                  </div>
                  <span className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {n.category}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
        <Scale className="h-3.5 w-3.5" />
        {L(
          "All figures are tenant-scoped and update live from the decoration tables (dc_*). Accounting, HR and Inventory stay the single source for their own masters.",
          "جميع الأرقام مرتبطة بالمنشأة وتُحدّث مباشرة من جداول الوحدة (dc_*). تبقى المحاسبة والموارد البشرية والمخزون المصدر الوحيد لبياناتها الأساسية.",
        )}
      </p>
    </div>
  );
}
