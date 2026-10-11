import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { useNavigate } from "react-router";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  Building2, HardHat, FileText, Receipt, Users, Wrench, CalendarCheck,
  FileSpreadsheet, ClipboardList, ShieldCheck, Briefcase, FileBarChart,
  Handshake, Plus, ArrowRight, Wallet, Boxes, Package, ArrowLeftRight,
  Truck, Calculator, ClipboardCheck, ListOrdered, FolderKanban,
} from "lucide-react";

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });

// Sahl palette (from the desktop app): one flat bright color per tile.
const C = {
  green: "bg-[#2fae4e]",
  blue: "bg-[#1b9bd7]",
  yellow: "bg-[#f5c518]",
  navy: "bg-[#1b3a5f]",
  red: "bg-[#e05242]",
  salmon: "bg-[#ef6a5a]",
  teal: "bg-[#1a9e8f]",
  maroon: "bg-[#7b2d4e]",
  emerald: "bg-[#0d8a5f]",
  lime: "bg-[#65a30d]",
};

interface Tile {
  label: string;
  labelAr: string;
  icon: any;
  path: string;
  color: string;
  dark?: boolean;
}

export default function ConstructionDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const { data: stats, isLoading: statsLoading } = trpc.construction.constructionStats.useQuery(undefined);
  const { data: projects, isLoading: projectsLoading } = trpc.construction.projectList.useQuery(undefined);
  const { data: invoices, isLoading: invLoading } = trpc.constructionInvoices.invoiceList.useQuery(undefined);

  const activeProjects = projects?.filter((p) => p.status === "active") || [];
  const totalContractValue = projects?.reduce((sum, p) => sum + Number(p.contractValue || 0), 0) || 0;
  const totalInvoiced = (invoices || []).reduce((s: number, i: any) => s + Number(i.grandTotal || 0), 0);
  const outstanding = Math.max(0, totalContractValue - totalInvoiced);
  const recentInvoices = [...(invoices || [])]
    .sort((a: any, b: any) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 5);

  const monthlySales = (() => {
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
    }
    (invoices || []).forEach((inv: any) => {
      const key = String(inv.createdAt || "").slice(0, 7);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + Number(inv.grandTotal || 0));
    });
    return [...buckets.entries()].map(([m, v]) => ({ month: m.slice(5), total: Math.round(v) }));
  })();

  // Sahl row 1: hero + 5 green tiles (all open real pages).
  const heroTiles: Tile[] = [
    { label: "Goods", labelAr: "البضاعة", icon: Package, path: "/app/construction/products", color: C.green },
    { label: "Accounts", labelAr: "الحسابات", icon: Users, path: "/app/construction/subcontractors", color: C.green },
    { label: "Treasury", labelAr: "الخزينة", icon: Wallet, path: "/app/construction/advance-payments", color: C.green },
    { label: "Invoices", labelAr: "الفواتير", icon: FolderKanban, path: "/app/construction/invoices", color: C.green },
    { label: "Reports", labelAr: "التقارير", icon: FileBarChart, path: "/app/construction/cvr", color: C.green },
  ];
  // Sahl row 2: quick tour (blue / yellow / navy).
  const tourTiles: Tile[] = [
    { label: "Enter Items", labelAr: "إدخال الأصناف", icon: ListOrdered, path: "/app/construction/products", color: C.blue },
    { label: "New Contract", labelAr: "إعداد العقود", icon: FileText, path: "/app/construction/contracts/new", color: C.blue },
    { label: "Projects", labelAr: "المشاريع", icon: Building2, path: "/app/construction/contracts", color: C.blue },
    { label: "Enter Accounts", labelAr: "إدخال الحسابات", icon: ClipboardCheck, path: "/app/construction/subcontractors", color: C.yellow, dark: true },
    { label: "Daily Movement", labelAr: "الحركة اليومية", icon: ClipboardList, path: "/app/construction/daily-reports", color: C.navy },
    { label: "Sales Analysis", labelAr: "تحليل المبيعات", icon: FileBarChart, path: "/app/construction/cvr", color: C.navy },
  ];
  // Sahl row 3: document types (4 big + warehouse ops).
  const docTiles: Tile[] = [
    { label: "New Invoice", labelAr: "فاتورة جديدة", icon: Receipt, path: "/app/construction/invoices", color: C.green },
    { label: "New Contract", labelAr: "عقد جديد", icon: HardHat, path: "/app/construction/contracts/new", color: C.red },
    { label: "Advance Payments", labelAr: "الدفعات المقدمة", icon: Handshake, path: "/app/construction/advance-payments", color: C.salmon },
    { label: "Daily Report", labelAr: "التقرير اليومي", icon: CalendarCheck, path: "/app/construction/daily-reports/new", color: C.teal },
  ];
  const opsTiles: Tile[] = [
    { label: "Warehouses", labelAr: "المخازن", icon: Building2, path: "/app/construction/warehouses", color: C.green },
    { label: "Materials", labelAr: "المواد", icon: Boxes, path: "/app/construction/materials", color: C.green },
    { label: "Transfers", labelAr: "التحويلات المخزنية", icon: Truck, path: "/app/construction/transfers", color: C.teal },
    { label: "Subcontractors", labelAr: "المقاولون", icon: Users, path: "/app/construction/subcontractors", color: C.maroon },
    { label: "Payments", labelAr: "المدفوعات", icon: Wallet, path: "/app/construction/sub-payments", color: C.emerald },
    { label: "Equipment", labelAr: "المعدات", icon: Wrench, path: "/app/construction/equipment-schedule", color: C.teal },
  ];
  // Warehouse section (dedicated strip).
  const warehouseTiles: Tile[] = [
    { label: "Warehouses", labelAr: "المخازن", icon: Building2, path: "/app/construction/warehouses", color: C.teal },
    { label: "Stock Levels", labelAr: "مستويات المخزون", icon: Boxes, path: "/app/construction/stock", color: C.emerald },
    { label: "Products", labelAr: "الأصناف", icon: Package, path: "/app/construction/products", color: C.green },
    { label: "Transfers", labelAr: "التحويلات المخزنية", icon: ArrowLeftRight, path: "/app/construction/transfers", color: C.blue },
    { label: "BOQ", labelAr: "جداول الكميات", icon: FileSpreadsheet, path: "/app/construction/boq", color: C.lime },
  ];
  // Setup / compliance strip.
  const setupTiles: Tile[] = [
    { label: "WBS", labelAr: "هيكل العمل", icon: ClipboardList, path: "/app/construction/wbs", color: C.blue },
    { label: "Variations", labelAr: "التغييرات", icon: FileText, path: "/app/construction/variations", color: C.emerald },
    { label: "Compliance", labelAr: "المطابقة", icon: ShieldCheck, path: "/app/construction/compliance/sbc", color: C.green },
    { label: "Saudization", labelAr: "السعودة", icon: Briefcase, path: "/app/construction/saudization", color: C.lime },
    { label: "HSE & Safety", labelAr: "السلامة", icon: HardHat, path: "/app/construction/hse", color: C.yellow, dark: true },
    { label: "Decennial", labelAr: "الضمان العشري", icon: Calculator, path: "/app/construction/decennial", color: C.navy },
  ];

  if (statsLoading || projectsLoading || invLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-2 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-32 rounded-md bg-white/10" />)}
        </div>
      </div>
    );
  }

  const Tile = ({ t, big }: { t: Tile; big?: boolean }) => (
    <button
      key={t.path + t.label}
      onClick={() => navigate(t.path)}
      className={`group flex flex-col items-center justify-center gap-1.5 px-2 text-center shadow transition-all hover:shadow-xl hover:brightness-110 ${t.color} ${t.dark ? "text-slate-800" : "text-white"} ${big ? "min-h-[150px] py-5" : "min-h-[128px] py-4"}`}
    >
      <t.icon className={big ? "h-11 w-11" : "h-9 w-9"} strokeWidth={1.6} />
      <span className={`font-bold leading-tight ${big ? "text-lg" : "text-[15px]"}`}>{t.labelAr}</span>
      <span className={`text-[11px] leading-tight ${t.dark ? "opacity-70" : "opacity-85"}`}>{t.label}</span>
    </button>
  );

  const SectionTitle = ({ ar, en }: { ar: string; en: string }) => (
    <div className="flex items-baseline justify-between px-1 pt-1">
      <h3 className="text-sm font-bold text-white/90">{ar} <span className="font-normal text-white/50">· {en}</span></h3>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {/* ===== Sahl row 1: hero + 5 green tiles ===== */}
      <div className="grid gap-2 lg:grid-cols-6">
        <div className={`flex flex-col justify-between gap-2 p-4 text-white shadow ${C.green}`}>
          <div className="flex items-center gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20">
              <HardHat className="h-8 w-8" strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="text-xl font-bold leading-tight">{rtl ? "المقاولات" : "Construction"}</h2>
              <p className="text-[11px] opacity-90">{rtl ? "لإدارة المشاريع والمخازن" : "Projects & warehouse management"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { ar: "إجمالي المبيعات", en: "Sales", v: `${fmt(totalInvoiced)}` },
              { ar: "قيمة العقود", en: "Contracts", v: `${fmt(totalContractValue)}` },
              { ar: "المتبقي", en: "Outstanding", v: `${fmt(outstanding)}` },
              { ar: "المشاريع النشطة", en: "Active", v: String(stats?.activeProjects ?? activeProjects.length) },
            ].map((k) => (
              <div key={k.en} className="rounded bg-black/20 px-2 py-1.5">
                <p className="text-[10px] opacity-85">{k.ar}</p>
                <p className="text-sm font-bold leading-tight tabular-nums">{k.v}</p>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="w-full font-bold" onClick={() => navigate("/app/construction/invoices")}>
            <Plus className="size-4" />{rtl ? "فاتورة جديدة" : "New Invoice"}
          </Button>
        </div>
        {heroTiles.map((t) => <Tile key={t.label} t={t} />)}
      </div>

      {/* ===== Sahl row 2: quick tour ===== */}
      <SectionTitle ar="ابدا بمشاهدة الجولة السريعة" en="Quick tour" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {tourTiles.map((t) => <Tile key={t.label} t={t} />)}
      </div>

      {/* ===== Sahl row 3: document types ===== */}
      <SectionTitle ar="حدد نوع المستند" en="Documents" />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {docTiles.map((t) => <Tile key={t.label} t={t} big />)}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {opsTiles.map((t) => <Tile key={t.label} t={t} />)}
      </div>

      {/* ===== Warehouse section ===== */}
      <SectionTitle ar="المخازن" en="Warehouse" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {warehouseTiles.map((t) => <Tile key={t.label} t={t} />)}
      </div>

      {/* ===== Setup & compliance ===== */}
      <SectionTitle ar="الإعداد والمطابقة" en="Setup & compliance" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {setupTiles.map((t) => <Tile key={t.label} t={t} />)}
      </div>

      {/* ===== Sales analysis + follow-up (below the fold) ===== */}
      <div className="grid gap-2 pt-1 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="py-3">
            <CardTitle className="text-base">{rtl ? "تحليل المبيعات — آخر 6 أشهر" : "Sales Analysis — Last 6 Months"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) => [`${fmt(Number(v))} SAR`, rtl ? "المبيعات" : "Sales"]} />
                <Bar dataKey="total" fill="#2fae4e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">{rtl ? "أحدث الفواتير" : "Recent Invoices"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/construction/invoices")}>
              {rtl ? "عرض الكل" : "View all"}<ArrowRight className="ml-1 size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{rtl ? "لا توجد فواتير بعد" : "No invoices yet"}</p>
            ) : (
              <div className="space-y-2">
                {recentInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold">{inv.invoiceNo}</p>
                      <p className="truncate text-xs text-muted-foreground">{inv.customerName || ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{fmt(Number(inv.grandTotal || 0))}</p>
                      <Badge variant="outline" className="text-[10px]">{inv.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">{rtl ? "المشاريع النشطة" : "Active Projects"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/construction/contracts")}>
              {rtl ? "عرض الكل" : "View all"}<ArrowRight className="ml-1 size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Building2 className="mb-2 h-10 w-10 opacity-50" />
                <p className="text-sm font-medium">{rtl ? "لا توجد مشاريع نشطة" : "No active projects"}</p>
                <Button className="mt-3" size="sm" onClick={() => navigate("/app/construction/contracts/new")}>
                  <Plus className="mr-1 size-4" />{rtl ? "مشروع جديد" : "New Project"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeProjects.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-accent/50" onClick={() => navigate(`/app/construction/contracts/${p.id}`)}>
                    <div className="flex min-w-0 items-center gap-2">
                      <HardHat className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">{p.name}</span>
                    </div>
                    <span className="font-mono text-sm">{fmt(Number(p.contractValue || 0))} SAR</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 content-start gap-2">
          {[
            { l: "Invoices", ar: "الفواتير", v: (invoices || []).length },
            { l: "Subcontractors", ar: "المقاولون", v: stats?.totalSubcontractors ?? 0 },
            { l: "Projects", ar: "المشاريع", v: projects?.length ?? 0 },
            { l: "Contracts Value", ar: "قيمة العقود", v: `${fmt(totalContractValue)}` },
          ].map((k) => (
            <Card key={k.l}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{k.ar}</p>
                <p className="mt-1 text-2xl font-bold">{k.v}</p>
                <p className="text-[11px] text-muted-foreground/70">{k.l}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
