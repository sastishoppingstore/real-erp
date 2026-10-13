import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard, Menu, Building2, FileText, ClipboardList, FileSpreadsheet,
  FileEdit, Handshake, FileBarChart, ScrollText, CalendarCheck,
  Users, ShieldCheck, HardHat, Thermometer, GraduationCap, Eye,
  Wrench, Package, ChevronDown, ChevronRight, Briefcase, Landmark,
  Receipt, ShoppingCart, Warehouse, Boxes, ArrowLeftRight,
  LogOut, Globe, Plus,
} from "lucide-react";

const navSections = [
  {
    label: "Planning",
    items: [
      { label: "WBS", path: "/app/construction/wbs", icon: ClipboardList },
      { label: "BOQ", path: "/app/construction/boq", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Contracts",
    items: [
      { label: "Contracts", path: "/app/construction/contracts", icon: FileText },
      { label: "Variations", path: "/app/construction/variations", icon: FileEdit },
      { label: "Advance Payments", path: "/app/construction/advance-payments", icon: Handshake },
    ],
  },
  {
    label: "Financial",
    items: [
      { label: "CVR Reports", path: "/app/construction/cvr", icon: FileBarChart },
      { label: "Subcontractors", path: "/app/construction/subcontractors", icon: Users },
      { label: "Sub Payments", path: "/app/construction/sub-payments", icon: Users },
      { label: "Tax Invoices", path: "/app/construction/invoices", icon: Receipt },
      { label: "Sales Invoices", path: "/app/construction/sales-invoices", icon: ShoppingCart },
    ],
  },
  {
    label: "Warehouse",
    items: [
      { label: "Warehouses", path: "/app/construction/warehouses", icon: Warehouse },
      { label: "Stock Levels", path: "/app/construction/stock", icon: Boxes },
      { label: "Products", path: "/app/construction/products", icon: Package },
      { label: "Transfers", path: "/app/construction/transfers", icon: ArrowLeftRight },
      { label: "Site Materials", path: "/app/construction/materials", icon: Building2 },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "SBC", path: "/app/construction/compliance/sbc", icon: ShieldCheck },
      { label: "SCA", path: "/app/construction/compliance/sca", icon: ShieldCheck },
      { label: "GTPL", path: "/app/construction/compliance/gtpl", icon: ShieldCheck },
    ],
  },
  {
    label: "HSE & Safety",
    items: [
      { label: "HSE Committee", path: "/app/construction/hse", icon: HardHat },
      { label: "Heat Stress", path: "/app/construction/hse/heat-stress", icon: Thermometer },
      { label: "Safety Training", path: "/app/construction/hse/safety-training", icon: GraduationCap },
      { label: "PPE Issuance", path: "/app/construction/hse/ppe", icon: Eye },
    ],
  },
  {
    label: "Saudization",
    items: [
      { label: "Engineering Saudization", path: "/app/construction/saudization", icon: Briefcase },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Equipment Schedule", path: "/app/construction/equipment-schedule", icon: Wrench },
      { label: "Materials", path: "/app/construction/materials", icon: Package },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Daily Reports", path: "/app/construction/daily-reports", icon: CalendarCheck },
      { label: "Decennial", path: "/app/construction/decennial", icon: ScrollText },
    ],
  },
];

// Sahl top menu strip — direct links, always visible like the desktop app.
const quickMenu = [
  { label: "Dashboard", labelAr: "الرئيسية", path: "/app/construction" },
  { label: "Goods", labelAr: "البضاعة", path: "/app/construction/materials" },
  { label: "Accounts", labelAr: "الحسابات", path: "/app/construction/subcontractors" },
  { label: "Treasury", labelAr: "الخزينة", path: "/app/construction/advance-payments" },
  { label: "Invoices", labelAr: "الفواتير", path: "/app/construction/sales-invoices" },
  { label: "Reports", labelAr: "التقارير", path: "/app/construction/cvr" },
  { label: "Warehouse", labelAr: "المخازن", path: "/app/construction/warehouses" },
];

// Sahl dropdown menu bar (desktop menus, all items open real sahl routes)
const dropMenus: { label: string; labelAr: string; items: { label: string; labelAr: string; path: string }[] }[] = [
  {
    label: "System", labelAr: "البرنامج",
    items: [
      { label: "Program settings", labelAr: "إعداد البرنامج", path: "/app/construction/sahl/settings" },
      { label: "Print designer", labelAr: "تصميم نماذج الطباعة", path: "/app/construction/sahl/prints" },
      { label: "Backup", labelAr: "نسخ احتياطي", path: "/app/construction/sahl/admin" },
      { label: "Year summary", labelAr: "ملخص السنة", path: "/app/construction/sahl/admin" },
      { label: "Exit", labelAr: "خروج", path: "/app/construction" },
    ],
  },
  {
    label: "Warehouse", labelAr: "المخزن",
    items: [
      { label: "Products", labelAr: "الأصناف", path: "/app/construction/sahl/products" },
      { label: "Stocktake", labelAr: "جرد المخزن", path: "/app/construction/sahl/vault/stocktake" },
      { label: "Transfer", labelAr: "تحويل بين المخازن", path: "/app/construction/sahl/vault/transfer" },
      { label: "Item moves", labelAr: "حركة صنف", path: "/app/construction/sahl/vault/moves" },
      { label: "Edit prices", labelAr: "تعديل أسعار البيع", path: "/app/construction/sahl/prices" },
      { label: "Barcode labels", labelAr: "طباعة باركود", path: "/app/construction/sahl/vault/labels" },
    ],
  },
  {
    label: "Accounts", labelAr: "الحسابات",
    items: [
      { label: "Customers & suppliers", labelAr: "العملاء والموردين", path: "/app/construction/sahl/accounts" },
      { label: "Credit follow-up", labelAr: "متابعة الفواتير الآجلة", path: "/app/construction/sahl/reports/more" },
      { label: "Cheques & installments", labelAr: "متابعة الشيكات والأقساط", path: "/app/construction/sahl/vault/cheques" },
      { label: "Salesmen", labelAr: "مندوبي المبيعات", path: "/app/construction/sahl/salesmen" },
    ],
  },
  {
    label: "Treasury", labelAr: "الخزينة",
    items: [
      { label: "Treasury hub", labelAr: "الخزائن والبنوك", path: "/app/construction/sahl/treasury" },
      { label: "Treasury moves", labelAr: "حركة الخزينة", path: "/app/construction/sahl/treasury" },
      { label: "Payment voucher", labelAr: "سند صرف", path: "/app/construction/sahl/cash" },
      { label: "Receipt voucher", labelAr: "سند قبض", path: "/app/construction/sahl/receipts" },
      { label: "Expense analysis", labelAr: "تحليل المصروفات", path: "/app/construction/sahl/treasury" },
    ],
  },
  {
    label: "Lists", labelAr: "القوائم",
    items: [
      { label: "Sales invoices", labelAr: "فواتير البيع", path: "/app/construction/sahl/sales" },
      { label: "Purchase invoices", labelAr: "فواتير الشراء", path: "/app/construction/sahl/purchase" },
      { label: "Sales returns", labelAr: "مرتجع بيع", path: "/app/construction/sahl/sales-return" },
      { label: "Purchase returns", labelAr: "مرتجع شراء", path: "/app/construction/sahl/purchase-return" },
      { label: "Quotations", labelAr: "عروض الأسعار", path: "/app/construction/sahl/quotation" },
      { label: "Archive", labelAr: "الأرشيف", path: "/app/construction/sahl/vault/archive" },
    ],
  },
  {
    label: "Installments", labelAr: "تقسيط",
    items: [
      { label: "Installment plans", labelAr: "تقسيط فاتورة", path: "/app/construction/sahl/vault/inst" },
      { label: "Cheques", labelAr: "الشيكات", path: "/app/construction/sahl/vault/cheques" },
    ],
  },
  {
    label: "Reports", labelAr: "تقارير",
    items: [
      { label: "Daily movement", labelAr: "تقرير الحركة اليومية", path: "/app/construction/sahl/reports/daily" },
      { label: "Sales analysis", labelAr: "تحليل المبيعات", path: "/app/construction/sahl/reports/sales" },
      { label: "Purchase analysis", labelAr: "تحليل المشتريات", path: "/app/construction/sahl/reports/purchase" },
      { label: "Item profits", labelAr: "أرباح الأصناف", path: "/app/construction/sahl/reports/stock" },
      { label: "VAT report", labelAr: "كشف ضريبة القيمة المضافة", path: "/app/construction/sahl/reports/more" },
    ],
  },
  {
    label: "Help", labelAr: "مساعدة",
    items: [
      { label: "Quick tour", labelAr: "جولة سريعة", path: "/app/construction" },
      { label: "Support", labelAr: "الدعم الفني", path: "/app/construction/sahl/users" },
    ],
  },
  {
    label: "Profile", labelAr: "حسابي",
    items: [
      { label: "Admin & password", labelAr: "الإدارة وكلمة السر", path: "/app/construction/sahl/admin" },
      { label: "Users", labelAr: "المستخدمون", path: "/app/construction/sahl/users" },
    ],
  },
];

function DropMenu({ m, rtl }: { m: (typeof dropMenus)[number]; rtl: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen((o) => !o)}
        className="whitespace-nowrap px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-200">
        {rtl ? m.labelAr : m.label}
      </button>
      {open && (
        <div className="absolute start-0 top-full z-50 min-w-[190px] border border-[#888] bg-white py-1 shadow-lg">
          {m.items.map((it) => (
            <button key={it.path + it.label}
              onClick={() => { setOpen(false); navigate(it.path); }}
              className="block w-full px-3 py-1.5 text-start text-[12px] text-black hover:bg-[#e8f5e9]">
              {rtl ? it.labelAr : it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DrawerNav({ onNavigate }: { onNavigate: () => void }) {
  const [expanded, setExpanded] = useState<string[]>(navSections.map(s => s.label));

  const toggle = (label: string) => {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  return (
    <div className="flex h-[100dvh] flex-col gap-1 py-3 text-white">
      <NavLink to="/app/construction" end onClick={onNavigate} className="mx-3 mb-2 shrink-0">
        <div className="flex items-center gap-2 rounded-lg bg-[#2fae4e] px-3 py-2 text-sm font-bold text-white">
          <Building2 className="h-4 w-4" />
          Construction
        </div>
      </NavLink>
      {/* Native scroll (min-h-0 + overflow-y-auto) — always scrolls, any screen height */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        <nav className="flex flex-col gap-1 pb-4">
          <NavLink
            to="/app/construction"
            end
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          {navSections.map(section => (
            <div key={section.label}>
              <button
                onClick={() => toggle(section.label)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white"
              >
                {expanded.includes(section.label) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {section.label}
              </button>
              {expanded.includes(section.label) && section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 pl-8 text-sm transition-colors",
                    isActive ? "bg-white/15 font-medium text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Open-tabs bar: permanent إبدأ مع YASCO root + closable visited screens.
// Txn drafts persist in localStorage per document kind, so switching tabs
// keeps uncommitted lines (see SahlTxn draft effect).
const TAB_TITLES: [string, string, string][] = [
  ["/app/construction", "إبدأ مع YASCO", "Start"],
  ["/app/construction/sahl/sales", "بيع", "Sale"],
  ["/app/construction/sahl/purchase", "شراء", "Purchase"],
  ["/app/construction/sahl/products", "البضاعة", "Goods"],
  ["/app/construction/sahl/accounts", "الحسابات", "Accounts"],
  ["/app/construction/sahl/settings", "إعداد البرنامج", "Setup"],
  ["/app/construction/sahl/prints", "الطباعة", "Prints"],
];
function tabTitle(path: string, rtl: boolean) {
  const hit = TAB_TITLES.find(([p]) => path === p || (p !== "/app/construction" && path.startsWith(p)));
  if (hit) return rtl ? hit[1] : hit[2];
  const seg = path.split("/").filter(Boolean).pop() ?? "";
  return decodeURIComponent(seg).slice(0, 18) || (rtl ? "شاشة" : "Screen");
}

function SahlTabs({ rtl }: { rtl: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("sahl-tabs") || '["/app/construction"]');
    } catch {
      return ["/app/construction"];
    }
  });
  useEffect(() => {
    const p = location.pathname;
    if (!p.startsWith("/app/construction")) return;
    setTabs((prev) => {
      if (prev.includes(p)) return prev;
      const next = [...prev.slice(-7), p].filter((x, i, a) => a.indexOf(x) === i);
      try { sessionStorage.setItem("sahl-tabs", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [location.pathname]);
  const close = (p: string) => {
    setTabs((prev) => {
      const next = prev.filter((x) => x !== p);
      const final = next.length ? next : ["/app/construction"];
      try { sessionStorage.setItem("sahl-tabs", JSON.stringify(final)); } catch { /* ignore */ }
      if (location.pathname === p) navigate(final[final.length - 1]);
      return final;
    });
  };
  if (tabs.length <= 1) return null;
  return (
    <div className="flex items-stretch gap-0.5 overflow-x-auto border-b border-[#999] bg-[#e8e8e8] px-1 pt-1">
      {tabs.map((p) => {
        const active = location.pathname === p;
        const root = p === "/app/construction";
        return (
          <span key={p}
            className={`flex shrink-0 items-center gap-1 border border-b-0 border-[#999] px-2 py-1 text-[12px] ${active ? "bg-white font-bold text-black" : "bg-[#d5d5d5] text-[#333] hover:bg-white"}`}>
            <button onClick={() => navigate(p)}>{tabTitle(p, rtl)}</button>
            {!root && (
              <button onClick={() => close(p)} title="X" className="px-0.5 text-[11px] text-[#888] hover:text-red-700">X</button>
            )}
          </span>
        );
      })}
    </div>
  );
}

function CashBalance({ rtl }: { rtl: boolean }) {  const bal = trpc.cashbox.currentBalance.useQuery(undefined, {
    refetchInterval: 60000,
    retry: false,
  });
  const v = Number((bal.data as any)?.balance ?? 0);
  return (
    <span className="whitespace-nowrap tabular-nums">
      {rtl ? "الخزينة" : "Cash"}: <b className="text-white">{v.toFixed(2)}</b>
    </span>
  );
}

export default function ConstructionLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Standalone Sahl shell: expired sessions bounce to login, and the
  // login landing sends construction tenants straight back here.
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const { language, setLang } = useLanguage();
  const navigate = useNavigate();
  const rtl = language === "ar";
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const userName = user?.name || (user as any)?.email || "";

  return (
    <div
      className="flex min-h-screen flex-col bg-[#141414] text-white"
      dir={rtl ? "rtl" : "ltr"}
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      {/* ===== Sahl title bar ===== */}
      <header className="flex items-center gap-2 bg-[#0d0d0d] px-3 py-2">
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/10 hover:text-white" title={rtl ? "القائمة" : "Menu"}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={rtl ? "right" : "left"} className="w-72 border-white/10 bg-[#1a1a1a] p-0">
            <DrawerNav onNavigate={() => setDrawerOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-xs text-white/85">
          <span className="font-bold">YASCO ERP</span>
          <span className="text-white/30">||</span>
          <span className="truncate">{rtl ? "المقاولات" : "Construction"}</span>
          <span className="text-white/30">||</span>
          <span className="truncate">{rtl ? "المستخدم" : "User"}: {userName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(language === "en" ? "ar" : "en")}
          className="shrink-0 gap-1 text-white/85 hover:bg-white/10 hover:text-white"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-bold">{rtl ? "EN" : "عربي"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="shrink-0 gap-1 text-white/85 hover:bg-rose-500/25 hover:text-white"
          title={rtl ? "تسجيل الخروج" : "Logout"}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden text-xs font-bold md:inline">{rtl ? "خروج" : "Logout"}</span>
        </Button>
      </header>

      {/* ===== Sahl dropdown menu bar (desktop menus) ===== */}
      <div className="flex items-stretch overflow-x-auto border-b border-[#999] bg-white">
        {dropMenus.map((m) => <DropMenu key={m.label} m={m} rtl={rtl} />)}
      </div>

      {/* ===== Sahl menu strip ===== */}
      <div className="flex items-stretch gap-0 overflow-x-auto bg-[#f4f4f4] text-slate-800 shadow">
        <div className="flex flex-1 items-stretch">
          {quickMenu.map((m) => (
            <NavLink
              key={m.path + m.label}
              to={m.path}
              end={m.path === "/app/construction"}
              className={({ isActive }) => cn(
                "flex items-center whitespace-nowrap border-e border-slate-300/70 px-3 py-2 text-[13px] font-semibold transition-colors lg:px-4",
                isActive ? "bg-[#2fae4e] text-white" : "text-slate-700 hover:bg-slate-200"
              )}
            >
              {rtl ? m.labelAr : m.label}
            </NavLink>
          ))}
        </div>
        <button
          onClick={() => navigate("/app/construction/sales-invoices")}
          className="flex shrink-0 items-center gap-1 bg-[#2fae4e] px-3 py-2 text-[13px] font-bold text-white hover:brightness-110 lg:px-5"
        >
          <Plus className="h-4 w-4" />
          {rtl ? "فاتورة جديدة" : "New Invoice"}
        </button>
      </div>

      {/* ===== Open-tabs bar (إبدأ مع YASCO root + closable screens) ===== */}
      <SahlTabs rtl={rtl} />

      {/* ===== Full-screen content (no permanent sidebar — Sahl style) ===== */}
      <main className="min-w-0 flex-1 p-2 pb-14 text-slate-900 lg:p-3">
        <Outlet />
      </main>

      {/* ===== Sahl status bar ===== */}
      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-[#0d0d0d] px-3 py-1.5 text-xs text-white/85">
        <span className="font-mono font-bold tabular-nums">
          {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="text-white/30">|</span>
        <span className="tabular-nums">{now.toLocaleDateString("en-GB")}</span>
        <span className="text-white/30">|</span>
        <CashBalance rtl={rtl} />
        <div className="flex-1" />
        <span className="hidden truncate sm:inline">{rtl ? "المقاولات للمقاولات وإدارة المشاريع" : "Construction & project management"}</span>
        <span className="text-white/30">|</span>
        <span className="max-w-28 truncate font-semibold">{userName}</span>
        <span className="text-white/30">|</span>
        <span className="text-white/50">Powered by YASCO</span>
      </footer>
    </div>
  );
}
