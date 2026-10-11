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
  Handshake, Plus, ArrowRight, Wallet, TrendingUp, Landmark, Eye,
  Warehouse, Boxes, Package, ArrowLeftRight,
} from "lucide-react";

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });

interface Tile {
  label: string;
  labelAr: string;
  icon: any;
  path: string;
  color: string;
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

  // Sahl-style flat bright tiles — every tile opens a real module page.
  const mainTiles: Tile[] = [
    { label: "Contracts", labelAr: "العقود", icon: FileText, path: "/app/construction/contracts", color: "bg-green-500" },
    { label: "BOQ", labelAr: "جداول الكميات", icon: FileSpreadsheet, path: "/app/construction/boq", color: "bg-emerald-600" },
    { label: "Tax Invoices", labelAr: "الفواتير الضريبية", icon: Receipt, path: "/app/construction/invoices", color: "bg-lime-600" },
    { label: "Sales", labelAr: "المبيعات", icon: TrendingUp, path: "/app/construction/sales-invoices", color: "bg-teal-500" },
    { label: "Reports", labelAr: "التقارير", icon: FileBarChart, path: "/app/construction/cvr", color: "bg-cyan-700" },
  ];
  const warehouseTiles: Tile[] = [
    { label: "Warehouses", labelAr: "المخازن", icon: Warehouse, path: "/app/inventory/warehouses", color: "bg-teal-600" },
    { label: "Stock Levels", labelAr: "مستويات المخزون", icon: Boxes, path: "/app/inventory/stock", color: "bg-emerald-500" },
    { label: "Products", labelAr: "الأصناف", icon: Package, path: "/app/inventory/products", color: "bg-green-600" },
    { label: "Transfers", labelAr: "التحويلات المخزنية", icon: ArrowLeftRight, path: "/app/inventory/transfers", color: "bg-cyan-600" },
    { label: "Materials", labelAr: "مواد الموقع", icon: Building2, path: "/app/construction/materials", color: "bg-lime-600" },
  ];
  const setupTiles: Tile[] = [
    { label: "WBS", labelAr: "هيكل العمل", icon: ClipboardList, path: "/app/construction/wbs", color: "bg-sky-600" },
    { label: "BOQ Import", labelAr: "استيراد الكميات", icon: FileSpreadsheet, path: "/app/construction/boq/import", color: "bg-blue-600" },
    { label: "Subcontractors", labelAr: "المقاولون", icon: Users, path: "/app/construction/subcontractors", color: "bg-indigo-500" },
    { label: "Equipment", labelAr: "المعدات", icon: Wrench, path: "/app/construction/equipment-schedule", color: "bg-slate-500" },
    { label: "HSE & Safety", labelAr: "السلامة", icon: ShieldCheck, path: "/app/construction/hse", color: "bg-amber-500" },
    { label: "Daily Reports", labelAr: "التقارير اليومية", icon: Eye, path: "/app/construction/daily-reports", color: "bg-cyan-500" },
  ];
  const actionTiles: Tile[] = [
    { label: "New Tax Invoice", labelAr: "فاتورة جديدة", icon: Receipt, path: "/app/construction/invoices", color: "bg-green-500" },
    { label: "New Contract", labelAr: "عقد جديد", icon: HardHat, path: "/app/construction/contracts/new", color: "bg-orange-600" },
    { label: "Advance Payments", labelAr: "الدفعات المقدمة", icon: Handshake, path: "/app/construction/advance-payments", color: "bg-rose-500" },
    { label: "Daily Report", labelAr: "التقرير اليومي", icon: CalendarCheck, path: "/app/construction/daily-reports/new", color: "bg-teal-500" },
  ];
  const opsTiles: Tile[] = [
    { label: "Variations", labelAr: "التغييرات", icon: FileText, path: "/app/construction/variations", color: "bg-emerald-600" },
    { label: "Sub Payments", labelAr: "مدفوعات المقاولين", icon: Wallet, path: "/app/construction/sub-payments", color: "bg-teal-600" },
    { label: "Compliance", labelAr: "المطابقة", icon: ShieldCheck, path: "/app/construction/compliance/sbc", color: "bg-green-600" },
    { label: "Saudization", labelAr: "السعودة", icon: Briefcase, path: "/app/construction/saudization", color: "bg-lime-600" },
    { label: "Decennial", labelAr: "الضمان العشري", icon: Landmark, path: "/app/construction/decennial", color: "bg-emerald-700" },
    { label: "Progress Billing", labelAr: "فوترة المراحل", icon: FileBarChart, path: "/app/verticals/construction/progress-billing", color: "bg-cyan-700" },
  ];

  if (statsLoading || projectsLoading || invLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-1" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const Tile = ({ t, big }: { t: Tile; big?: boolean }) => (
    <button
      key={t.path + t.label}
      onClick={() => navigate(t.path)}
      className={`group flex flex-col items-center justify-center gap-1.5 rounded-xl ${t.color} px-2 text-white shadow transition-all hover:shadow-xl hover:brightness-110 ${big ? "py-6 min-h-[128px]" : "py-4 min-h-[120px] w-full max-w-[180px] justify-self-center"}`}
    >
      <t.icon className={`${big ? "h-9 w-9" : "h-7 w-7"}`} strokeWidth={1.8} />
      <span className={`font-bold leading-tight ${big ? "text-base" : "text-sm"}`}>{t.labelAr}</span>
      <span className="text-[11px] leading-tight opacity-85">{t.label}</span>
    </button>
  );

  const Section = ({ title, titleAr, children }: { title: string; titleAr: string; children: React.ReactNode }) => (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {titleAr} <span className="opacity-60">· {title}</span>
      </h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-stone-900 to-neutral-900 p-4 lg:p-5" dir={rtl ? "rtl" : "ltr"}>
      {/* ===== Hero totals strip ===== */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-950 via-green-900 to-emerald-900 p-5 text-white shadow-xl ring-1 ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{rtl ? "لوحة تحكم المقاولات" : "Construction Dashboard"}</h2>
            <p className="text-sm text-emerald-200">{rtl ? "نظرة شاملة على المشاريع والمبيعات" : "Projects, contracts & sales at a glance"}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/app/construction/invoices")}>
            <Plus className="mr-1 size-4" />{rtl ? "فاتورة جديدة" : "New Tax Invoice"}
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: "Total Sales", ar: "إجمالي المبيعات", v: `${fmt(totalInvoiced)} SAR` },
            { l: "Contracts Value", ar: "قيمة العقود", v: `${fmt(totalContractValue)} SAR` },
            { l: "Outstanding", ar: "المتبقي", v: `${fmt(outstanding)} SAR` },
            { l: "Active Projects", ar: "المشاريع النشطة", v: String(stats?.activeProjects ?? activeProjects.length) },
          ].map((k) => (
            <div key={k.l} className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs text-emerald-200">{k.ar}</p>
              <p className="mt-1 text-xl font-bold">{k.v}</p>
              <p className="text-[11px] text-emerald-200/70">{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      <Section title="Main Modules" titleAr="الأقسام الرئيسية">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {mainTiles.map((t) => <Tile key={t.label} t={t} />)}
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actionTiles.map((t) => <Tile key={t.label} t={t} big />)}
      </div>

      <Section title="Warehouse" titleAr="المخزن">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {warehouseTiles.map((t) => <Tile key={t.label} t={t} />)}
        </div>
      </Section>

      <Section title="Quick Setup Tour" titleAr="جولة سريعة للإعداد">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {setupTiles.map((t) => <Tile key={t.label} t={t} />)}
        </div>
      </Section>

      <Section title="Operations" titleAr="العمليات">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {opsTiles.map((t) => <Tile key={t.label} t={t} />)}
        </div>
      </Section>

      {/* ===== Sales analysis ===== */}
      <Card>
        <CardHeader>
          <CardTitle>{rtl ? "تحليل المبيعات — آخر 6 أشهر" : "Sales Analysis — Last 6 Months"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: any) => [`${fmt(Number(v))} SAR`, rtl ? "المبيعات" : "Sales"]} />
              <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== Recent invoices + active projects ===== */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{rtl ? "أحدث الفواتير" : "Recent Invoices"}</CardTitle>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{rtl ? "المشاريع النشطة" : "Active Projects"}</CardTitle>
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
      </div>

      {/* ===== Bottom counters strip ===== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
  );
}
