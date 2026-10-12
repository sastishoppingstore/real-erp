import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";
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

function DrawerNav({ onNavigate }: { onNavigate: () => void }) {
  const [expanded, setExpanded] = useState<string[]>(navSections.map(s => s.label));

  const toggle = (label: string) => {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  return (
    <div className="flex h-full flex-col gap-1 py-3 text-white">
      <NavLink to="/app/construction" end onClick={onNavigate} className="mx-3 mb-2">
        <div className="flex items-center gap-2 rounded-lg bg-[#2fae4e] px-3 py-2 text-sm font-bold text-white">
          <Building2 className="h-4 w-4" />
          Construction
        </div>
      </NavLink>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
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
      </ScrollArea>
    </div>
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

      {/* ===== Full-screen content (no permanent sidebar — Sahl style) ===== */}
      <main className="min-w-0 flex-1 p-2 pb-14 lg:p-3">
        <Outlet />
      </main>

      {/* ===== Sahl status bar ===== */}
      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-[#0d0d0d] px-3 py-1.5 text-xs text-white/85">
        <span className="font-mono font-bold tabular-nums">
          {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="text-white/30">|</span>
        <span className="tabular-nums">{now.toLocaleDateString("en-GB")}</span>
        <div className="flex-1" />
        <span className="hidden truncate sm:inline">{rtl ? "المقاولات للمقاولات وإدارة المشاريع" : "Construction & project management"}</span>
        <span className="text-white/30">|</span>
        <span className="max-w-28 truncate font-semibold">{userName}</span>
      </footer>
    </div>
  );
}
