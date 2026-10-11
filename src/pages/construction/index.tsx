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
} from "lucide-react";

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });

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
  // Monthly invoiced totals (last 6 months) — Sahl-style sales analysis.
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
  const recentInvoices = [...(invoices || [])]
    .sort((a: any, b: any) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 5);

  // Sahl-style main category tiles (every tile opens a real module page)
  const mainTiles = [
    { label: "Contracts", labelAr: "العقود", icon: FileText, path: "/app/construction/contracts", gradient: "from-emerald-600 to-green-500" },
    { label: "BOQ", labelAr: "جداول الكميات", icon: FileSpreadsheet, path: "/app/construction/boq", gradient: "from-teal-600 to-emerald-500" },
    { label: "Tax Invoices", labelAr: "الفواتير الضريبية", icon: Receipt, path: "/app/construction/invoices", gradient: "from-green-600 to-lime-500" },
    { label: "Sales", labelAr: "المبيعات", icon: TrendingUp, path: "/app/construction/sales-invoices", gradient: "from-lime-600 to-green-500" },
    { label: "Reports", labelAr: "التقارير", icon: FileBarChart, path: "/app/construction/cvr", gradient: "from-emerald-700 to-teal-600" },
  ];
  // Setup / master-data tour tiles
  const setupTiles = [
    { label: "WBS", labelAr: "هيكل العمل", icon: ClipboardList, path: "/app/construction/wbs", gradient: "from-sky-600 to-blue-500" },
    { label: "BOQ Import", labelAr: "استيراد الكميات", icon: FileSpreadsheet, path: "/app/construction/boq/import", gradient: "from-blue-600 to-indigo-500" },
    { label: "Materials", labelAr: "المواد", icon: Building2, path: "/app/construction/materials", gradient: "from-cyan-600 to-sky-500" },
    { label: "Subcontractors", labelAr: "المقاولون", icon: Users, path: "/app/construction/subcontractors", gradient: "from-indigo-600 to-blue-500" },
    { label: "Equipment", labelAr: "المعدات", icon: Wrench, path: "/app/construction/equipment-schedule", gradient: "from-slate-600 to-slate-500" },
    { label: "HSE & Safety", labelAr: "السلامة", icon: ShieldCheck, path: "/app/construction/hse", gradient: "from-amber-500 to-yellow-500" },
  ];
  // Big daily-action tiles (Sahl sale/purchase/expense/stock-take row)
  const actionTiles = [
    { label: "New Tax Invoice", labelAr: "فاتورة جديدة", icon: Receipt, path: "/app/construction/invoices", gradient: "from-green-500 to-emerald-600" },
    { label: "New Contract", labelAr: "عقد جديد", icon: HardHat, path: "/app/construction/contracts/new", gradient: "from-orange-500 to-red-500" },
    { label: "Advance Payments", labelAr: "الدفعات المقدمة", icon: Handshake, path: "/app/construction/advance-payments", gradient: "from-rose-500 to-red-500" },
    { label: "Daily Report", labelAr: "التقرير اليومي", icon: CalendarCheck, path: "/app/construction/daily-reports/new", gradient: "from-teal-500 to-emerald-600" },
  ];
  // Operations row
  const opsTiles = [
    { label: "Variations", labelAr: "التغييرات", icon: FileText, path: "/app/construction/variations", gradient: "from-emerald-600 to-green-500" },
    { label: "Sub Payments", labelAr: "مدفوعات المقاولين", icon: Wallet, path: "/app/construction/sub-payments", gradient: "from-teal-600 to-cyan-600" },
    { label: "Compliance", labelAr: "المطابقة", icon: ShieldCheck, path: "/app/construction/compliance/sbc", gradient: "from-green-600 to-emerald-500" },
    { label: "Saudization", labelAr: "السعودة", icon: Briefcase, path: "/app/construction/saudization", gradient: "from-lime-600 to-green-500" },
    { label: "Daily Reports", labelAr: "التقارير اليومية", icon: Eye, path: "/app/construction/daily-reports", gradient: "from-cyan-600 to-teal-500" },
    { label: "Decennial", labelAr: "الضمان العشري", icon: Landmark, path: "/app/construction/decennial", gradient: "from-emerald-700 to-green-600" },
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

  const Tile = ({ t, big }: { t: (typeof mainTiles)[number]; big?: boolean }) => (
    <button
      key={t.path + t.label}
      onClick={() => navigate(t.path)}
      className={`group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${t.gradient} text-white shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 ${big ? "p-6 min-h-[128px]" : "p-4 min-h-[104px]"}`}
    >
      <t.icon className={`${big ? "h-9 w-9" : "h-7 w-7"} drop-shadow`} />
      <span className={`font-bold leading-tight ${big ? "text-base" : "text-sm"}`}>{rtl ? t.labelAr : t.label}</span>
      <span className="text-[11px] opacity-80 leading-tight">{rtl ? t.label : t.labelAr}</span>
    </button>
  );

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      {/* ===== Hero totals strip (Sahl-style) ===== */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-950 via-green-900 to-emerald-900 p-5 text-white shadow-xl">
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
              <p className="text-xs text-emerald-200">{rtl ? k.ar : k.l}</p>
              <p className="mt-1 text-xl font-bold">{k.v}</p>
              <p className="text-[11px] text-emerald-200/70">{rtl ? k.l : k.ar}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Main modules ===== */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">{rtl ? "الأقسام الرئيسية" : "Main Modules"}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {mainTiles.map((t) => <Tile key={t.label} t={t} />)}
        </div>
      </div>

      {/* ===== Big daily actions ===== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actionTiles.map((t) => <Tile key={t.label} t={t} big />)}
      </div>

      {/* ===== Setup tour ===== */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">{rtl ? "جولة سريعة للإعداد" : "Quick Setup Tour"}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {setupTiles.map((t) => <Tile key={t.label} t={t} />)}
        </div>
      </div>

      {/* ===== Operations ===== */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">{rtl ? "العمليات" : "Operations"}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {opsTiles.map((t) => <Tile key={t.label} t={t} />)}
        </div>
      </div>

      {/* ===== Sales analysis (Sahl reports row) ===== */}
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
              <p className="text-xs text-muted-foreground">{rtl ? k.ar : k.l}</p>
              <p className="mt-1 text-2xl font-bold">{k.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
