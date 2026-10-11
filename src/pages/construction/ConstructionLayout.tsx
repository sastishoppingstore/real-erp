import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLayoutTheme } from "@/providers/layoutTheme";
import {
  LayoutDashboard, Menu, Building2, FileText, ClipboardList, FileSpreadsheet,
  FileEdit, Handshake, FileBarChart, ScrollText, FileClock, CalendarCheck,
  Users, ShieldCheck, HardHat, Thermometer, GraduationCap, Eye,
  Wrench, Package, ChevronDown, ChevronRight, Briefcase, Landmark,
  AlertTriangle, Receipt, Activity, ShoppingCart, Warehouse, Boxes, ArrowLeftRight,
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
      { label: "Warehouses", path: "/app/inventory/warehouses", icon: Warehouse },
      { label: "Stock Levels", path: "/app/inventory/stock", icon: Boxes },
      { label: "Products", path: "/app/inventory/products", icon: Package },
      { label: "Transfers", path: "/app/inventory/transfers", icon: ArrowLeftRight },
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

function Sidebar() {
  const [expanded, setExpanded] = useState<string[]>(navSections.map(s => s.label));

  const toggle = (label: string) => {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  return (
    <div className="flex h-full flex-col gap-1 py-2">
      <NavLink to="/app/construction" end className="mx-3 mb-2">
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          <Building2 className="h-4 w-4" />
          Construction
        </div>
      </NavLink>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/app/construction"
            end
            className={({ isActive }) => cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          {navSections.map(section => (
            <div key={section.label}>
              <button
                onClick={() => toggle(section.label)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {expanded.includes(section.label) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {section.label}
              </button>
              {expanded.includes(section.label) && section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 pl-8 text-sm transition-colors",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { layoutTheme } = useLayoutTheme();
  const isLauncher = layoutTheme === "launcher_theme";

  return (
    <div className={cn(
      "flex rounded-xl overflow-hidden border",
      isLauncher
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-emerald-400/20"
        : "bg-background border-border",
    )}>
      <aside className={cn(
        "hidden w-64 shrink-0 border-r lg:block",
        isLauncher ? "border-emerald-400/20 bg-emerald-950/60" : "bg-card",
      )}>
        <Sidebar />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-2 top-2 z-50 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <main className="flex-1 min-w-0 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
