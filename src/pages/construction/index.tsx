import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import {
  FileText, Receipt, Users, Wallet, Package,
  ArrowLeftRight, FileBarChart, ClipboardList,
  Calculator, Plus, ShoppingCart, ShoppingBag, ClipboardCheck, ListOrdered, Settings,
  Presentation, PackageOpen, Tags, HandCoins, SlidersHorizontal, Headset, X,
} from "lucide-react";

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });

// Sahl desktop palette — flat squares, no gradients/shadows.
const C = {
  green: "#2fae4e",
  blue: "#1b9bd7",
  navy: "#1b3a5f",
  teal: "#1a9e8f",
  tealDark: "#0d7d72",
  redOrange: "#e05242",
  coral: "#ef6a5a",
  burgundy: "#7b2d4e",
  turquoise: "#0fa3b1",
  yellow: "#f5c518",
};

interface Tile {
  label: string;
  labelAr: string;
  icon: any;
  path?: string;
  action?: string;
  color: string;
  dark?: boolean;
  span?: number;
}

const TOUR_STEPS = [
  { ar: "هذه الواجهة الرئيسية — كل مربع يفتح وحدة حقيقية", en: "This is the main dashboard — every tile opens a real module" },
  { ar: "الصف الأخضر: التقارير والفواتير والخزينة والحسابات والبضاعة", en: "Green row: reports, invoices, treasury, accounts, inventory" },
  { ar: "الأزرق: إدخال الحسابات والأصناف وإعداد البرنامج", en: "Blue: product/account entry and program settings" },
  { ar: "مربعات البيع والشراء والمخازن بأسفل الشاشة", en: "Sales, purchase and warehouse tiles at the bottom" },
  { ar: "زر فاتورة جديدة يفتح منشئ الفواتير مباشرة", en: "New Invoice opens the bill creator directly" },
];

export default function ConstructionDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [tour, setTour] = useState(false);
  const [step, setStep] = useState(0);
  const [showSupport, setShowSupport] = useState(false);
  const [dashBg, setDashBg] = useState(() => {
    try { return localStorage.getItem("sahl-dashbg") || "#000000"; } catch { return "#000000"; }
  });
  const changeBg = (bg: string) => {
    setDashBg(bg);
    try { localStorage.setItem("sahl-dashbg", bg); } catch { /* ignore */ }
  };
  // Header Help menu deep links: Quick tour / Support open the real overlays.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("tour") === "1") { setStep(0); setTour(true); }
    if (q.get("support") === "1") setShowSupport(true);
  }, [location.key, location.search]);
  const { data: stats } = trpc.construction.constructionStats.useQuery(undefined);
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const { data: invoices } = trpc.constructionInvoices.invoiceList.useQuery(undefined);
  const { data: company } = trpc.settings.companySettingsGet.useQuery();
  const brandAr = (company as any)?.companyNameAr || (company as any)?.companyName || "سهل";
  const brandEn = (company as any)?.companyName || "SAHL";

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
    const arr = [...buckets.entries()].map(([m, v]) => ({ month: m.slice(5), total: Math.round(v) }));
    const max = Math.max(1, ...arr.map((a) => a.total));
    return { arr, max };
  })();

  const go = (t: Tile) => {
    if (t.action === "tour") { setStep(0); setTour(true); return; }
    if (t.path) navigate(t.path);
  };

  // SCR-002 top row: five green squares.
  const topTiles: Tile[] = [
    { label: "Reports", labelAr: "التقارير", icon: FileBarChart, path: "/app/construction/sahl/reports/daily", color: C.green },
    { label: "Invoices", labelAr: "الفواتير", icon: Receipt, path: "/app/construction/sahl/sales", color: C.green },
    { label: "Treasury", labelAr: "الخزينة", icon: Wallet, path: "/app/construction/sahl/treasury", color: C.green },
    { label: "Accounts", labelAr: "الحسابات", icon: Users, path: "/app/construction/sahl/accounts", color: C.green },
    { label: "Goods", labelAr: "البضاعة", icon: Package, path: "/app/construction/sahl/products", color: C.green },
  ];
  // SCR-002 second row: two dark-blue reports + four blue utilities.
  const reportTiles: Tile[] = [
    { label: "Sales analysis", labelAr: "تحليل المبيعات", icon: FileBarChart, path: "/app/construction/sahl/reports/sales", color: C.navy },
    { label: "Daily movement", labelAr: "الحركة اليومية", icon: ClipboardList, path: "/app/construction/sahl/reports/daily", color: C.navy },
  ];
  const utilTiles: Tile[] = [
    { label: "Enter accounts", labelAr: "إدخال الحسابات", icon: Users, path: "/app/construction/sahl/accounts", color: C.blue },
    { label: "Enter products", labelAr: "إدخال الأصناف", icon: ListOrdered, path: "/app/construction/sahl/products", color: C.blue },
    { label: "Program settings", labelAr: "إعداد البرنامج", icon: Settings, path: "/app/construction/sahl/settings", color: C.blue },
    { label: "Quick tour", labelAr: "جولة سريعة", icon: Presentation, action: "tour", color: C.blue },
  ];
  // SCR-002 main transaction grid (uneven widths preserved).
  const txnTiles: Tile[] = [
    { label: "Stocktaking", labelAr: "جرد مخزن", icon: ClipboardCheck, path: "/app/construction/sahl/reports/stock", color: C.teal, span: 2 },
    { label: "Payment", labelAr: "صرف", icon: HandCoins, path: "/app/construction/sahl/cash", color: C.coral, span: 1 },
    { label: "Purchase", labelAr: "شراء", icon: ShoppingCart, path: "/app/construction/sahl/purchase", color: C.redOrange, span: 2 },
    { label: "Sales", labelAr: "بيع", icon: ShoppingBag, path: "/app/construction/sahl/sales", color: C.green, span: 2 },
  ];
  const txnTiles2: Tile[] = [
    { label: "Warehouse adjustment", labelAr: "تسوية مخزن", icon: SlidersHorizontal, path: "/app/construction/sahl/reports/stock", color: C.turquoise },
    { label: "Warehouse transfer", labelAr: "تحويل لمخزن", icon: ArrowLeftRight, path: "/app/construction/transfers", color: C.tealDark },
    { label: "Quotations", labelAr: "عرض الأسعار", icon: Calculator, path: "/app/construction/sahl/quotation", color: C.green },
    { label: "Purchase return", labelAr: "مرتجع شراء", icon: PackageOpen, path: "/app/construction/sahl/purchase-return", color: C.burgundy },
    { label: "Receipt", labelAr: "قبض", icon: Wallet, path: "/app/construction/sahl/receipts", color: C.green },
    { label: "Sales return", labelAr: "مرتجع بيع", icon: PackageOpen, path: "/app/construction/sahl/sales-return", color: C.green },
  ];

  // Management & follow-up strip (new Sahl modules, all real).
  const mgmtTiles: Tile[] = [
    { label: "Salesmen", labelAr: "المندوبون", icon: Users, path: "/app/construction/sahl/salesmen", color: C.blue },
    { label: "Users", labelAr: "المستخدمون", icon: Settings, path: "/app/construction/sahl/users", color: C.navy },
    { label: "Prices", labelAr: "الأسعار", icon: Tags, path: "/app/construction/sahl/prices", color: C.green },
    { label: "Stocktake", labelAr: "الجرد", icon: ClipboardCheck, path: "/app/construction/sahl/vault/stocktake", color: C.teal },
    { label: "Transfer", labelAr: "التحويل", icon: ArrowLeftRight, path: "/app/construction/sahl/vault/transfer", color: C.tealDark },
    { label: "Item moves", labelAr: "حركة صنف", icon: ClipboardList, path: "/app/construction/sahl/vault/moves", color: C.turquoise },
    { label: "Archive", labelAr: "الأرشيف", icon: FileText, path: "/app/construction/sahl/vault/archive", color: C.navy },
    { label: "Cheques", labelAr: "الشيكات", icon: Receipt, path: "/app/construction/sahl/vault/cheques", color: C.blue },
    { label: "Installments", labelAr: "الأقساط", icon: Calculator, path: "/app/construction/sahl/vault/inst", color: C.burgundy },
    { label: "Barcode", labelAr: "الباركود", icon: Tags, path: "/app/construction/sahl/vault/labels", color: C.green },
    { label: "Prints", labelAr: "الطباعة", icon: FileText, path: "/app/construction/sahl/prints", color: C.blue },
    { label: "Valuation", labelAr: "التقييم", icon: Calculator, path: "/app/construction/sahl/reports/stock", color: C.green },
    { label: "Treasury", labelAr: "الخزينة", icon: Wallet, path: "/app/construction/sahl/treasury", color: C.teal },
    { label: "Admin", labelAr: "الإدارة", icon: Settings, path: "/app/construction/sahl/admin", color: C.navy },
    { label: "More reports", labelAr: "تقارير أخرى", icon: FileBarChart, path: "/app/construction/sahl/reports/more", color: C.blue },
  ];

  const SahlTile = ({ t, h }: { t: Tile; h: number }) => (
    <button
      onClick={() => go(t)}
      title={rtl ? t.labelAr : t.label}
      className="flex flex-col items-center justify-center gap-1 px-1 text-center text-white transition-[filter] hover:brightness-110 active:brightness-90 focus-visible:outline-2 focus-visible:outline-white"
      style={{ background: t.color, height: h, color: t.dark ? "#1e293b" : "#fff" }}
    >
      <t.icon style={{ width: 30, height: 30 }} strokeWidth={1.4} />
      <span className="text-[12px] font-bold leading-tight">{rtl ? t.labelAr : t.label}</span>
      <span className="text-[10px] leading-tight opacity-80">{rtl ? t.label : t.labelAr}</span>
    </button>
  );

  return (
    <div className="min-h-full p-2 text-white" style={{ background: dashBg }}>
      {/* ===== brand + top green row (side-by-side at every width incl. 640×342) ===== */}
      <div className="flex gap-2">
        <div className="grid min-w-0 flex-1 gap-2" style={{ gridTemplateColumns: "repeat(5, minmax(88px, 1fr))" }}>
          {topTiles.map((t) => <SahlTile key={t.label} t={t} h={104} />)}
        </div>
        <div className="flex w-[168px] shrink-0 flex-col items-center justify-center gap-1 px-2 text-center text-white" style={{ background: C.green, minHeight: 104 }}>
          <span className="text-[26px] font-bold leading-tight">{brandAr}</span>
          <span className="text-[10px] font-bold tracking-[0.2em]">{brandEn}</span>
          <span className="text-[12px] font-bold leading-tight">{rtl ? "المقاولات" : "Construction"}</span>
          <span className="text-[10px] leading-tight opacity-90">{rtl ? "المشاريع والمخازن والفواتير" : "Projects, stock & invoices"}</span>
        </div>
      </div>

      {/* ===== second row: 2 dark-blue + 4 blue ===== */}
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "repeat(6, minmax(88px, 1fr))" }}>
        {reportTiles.map((t) => <SahlTile key={t.label} t={t} h={88} />)}
        {utilTiles.map((t) => <SahlTile key={t.label} t={t} h={88} />)}
      </div>

      {/* ===== main transaction grid: uneven widths (2fr 1fr 2fr 2fr) ===== */}
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "2fr 1fr 2fr 2fr" }}>
        {txnTiles.map((t) => <SahlTile key={t.label} t={t} h={96} />)}
      </div>
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "repeat(6, minmax(80px, 1fr))" }}>
        {txnTiles2.map((t) => <SahlTile key={t.label} t={t} h={88} />)}
      </div>

      {/* ===== management & follow-up strip ===== */}
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "repeat(6, minmax(80px, 1fr))" }}>
        {mgmtTiles.map((t) => <SahlTile key={t.label} t={t} h={72} />)}
      </div>

      {/* ===== dense desktop data strip (real persisted data only) ===== */}
      <div className="mt-2 border border-[#333] bg-[#111]">
        <div className="flex items-center justify-between border-b border-[#333] px-2 py-1" style={{ background: C.green }}>
          <span className="text-[12px] font-bold text-white">{rtl ? "تحليل المبيعات — آخر 6 أشهر" : "Sales analysis — last 6 months"}</span>
          <button onClick={() => navigate("/app/construction/sahl/sales")} className="flex items-center gap-1 bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-white/30">
            <Plus style={{ width: 12, height: 12 }} />{rtl ? "فاتورة جديدة" : "New Invoice"}
          </button>
        </div>
        <div className="grid gap-2 p-2 lg:grid-cols-2">
          <div>
            <div className="mb-1 flex gap-2 text-[11px] text-white/70">
              <span>{rtl ? "إجمالي الفواتير" : "Invoiced"}: <b className="text-white tabular-nums">{fmt(totalInvoiced)}</b></span>
              <span>{rtl ? "العقود" : "Contracts"}: <b className="text-white tabular-nums">{fmt(totalContractValue)}</b></span>
              <span>{rtl ? "المتبقي" : "Outstanding"}: <b className="text-white tabular-nums">{fmt(outstanding)}</b></span>
              <span>{rtl ? "النشطة" : "Active"}: <b className="text-white tabular-nums">{stats?.activeProjects ?? activeProjects.length}</b></span>
            </div>
            <div className="flex h-[110px] items-end gap-1 border border-[#333] bg-black p-1" dir="ltr">
              {monthlySales.arr.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center justify-end gap-0.5" title={`${m.month}: ${fmt(m.total)}`}>
                  <span className="text-[9px] text-white/60 tabular-nums">{m.total >= 1000 ? `${Math.round(m.total / 1000)}k` : m.total}</span>
                  <div className="w-full" style={{ height: `${Math.max(3, Math.round((m.total / monthlySales.max) * 78))}px`, background: C.green }} />
                  <span className="text-[9px] text-white/60">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="font-bold">{rtl ? "أحدث الفواتير" : "Recent invoices"}</span>
              <button onClick={() => navigate("/app/construction/sahl/sales")} className="text-[11px] text-white/70 hover:text-white">{rtl ? "عرض الكل" : "View all"}</button>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="border border-[#333] bg-black px-2 py-4 text-center text-[12px] text-white/50">{rtl ? "لا توجد فواتير بعد" : "No invoices yet"}</p>
            ) : (
              <table className="w-full border-collapse text-[11px]">
                <thead><tr style={{ background: C.green }} className="text-white">
                  <th className="border border-[#1d7a37] px-1 py-1 font-normal">{rtl ? "الرقم" : "No."}</th>
                  <th className="border border-[#1d7a37] px-1 py-1 font-normal">{rtl ? "العميل" : "Customer"}</th>
                  <th className="border border-[#1d7a37] px-1 py-1 font-normal">{rtl ? "الإجمالي" : "Total"}</th>
                  <th className="border border-[#1d7a37] px-1 py-1 font-normal">{rtl ? "الحالة" : "Status"}</th>
                </tr></thead>
                <tbody>
                  {recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="odd:bg-[#161616] even:bg-black hover:bg-[#1f1f1f]">
                      <td className="border border-[#333] px-1 py-1 font-mono">{inv.invoiceNo}</td>
                      <td className="max-w-[120px] truncate border border-[#333] px-1 py-1">{inv.customerName || ""}</td>
                      <td className="border border-[#333] px-1 py-1 text-right tabular-nums">{fmt(Number(inv.grandTotal || 0))}</td>
                      <td className="border border-[#333] px-1 py-1">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-1 border border-[#333] bg-black px-2 py-1 text-[11px] text-white/70">
              {rtl ? "المشاريع النشطة" : "Active projects"}: <b className="text-white">{activeProjects.length}</b>
              {" · "}
              <button onClick={() => navigate("/app/construction/contracts")} className="hover:text-white">{rtl ? "العقود" : "Contracts"}</button>
              {" · "}
              <button onClick={() => navigate("/app/construction/daily-reports")} className="hover:text-white">{rtl ? "التقارير اليومية" : "Daily reports"}</button>
              {" · "}
              <button onClick={() => navigate("/app/construction/hse")} className="hover:text-white">{rtl ? "السلامة" : "HSE"}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pt-1 text-[10px]">
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSupport(true)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-white"
            style={{ background: "#e05242" }}>
            <Headset style={{ width: 14, height: 14 }} />
            {rtl ? "الدعم الفني" : "Support"}
          </button>
          {(["#000000", "#141414", "#0d1b2a", "#1b1035"] as string[]).map((bg) => (
            <button key={bg} onClick={() => changeBg(bg)} title={bg}
              className="size-4 border"
              style={{ background: bg, borderColor: dashBg === bg ? "#fff" : "#555" }} />
          ))}
        </div>
        <span className="font-mono text-white/40">640×342 ref</span>
      </div>

      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowSupport(false)}>
          <div className="w-full max-w-xs border border-white/20 bg-[#161616] p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <b className="text-[13px]">{rtl ? "الدعم الفني" : "Technical support"}</b>
              <button onClick={() => setShowSupport(false)} className="text-white/60 hover:text-white"><X style={{ width: 16, height: 16 }} /></button>
            </div>
            <p className="text-[12px] text-white/85">
              {rtl
                ? "للدعم: تواصل مع مدير النظام من صفحة المستخدمين، أو راجع سجل الحركات من التقارير."
                : "For support: contact your system administrator from the Users page, or review Reports."}
            </p>
            <button onClick={() => { setShowSupport(false); navigate("/app/construction/sahl/users"); }}
              className="mt-3 px-3 py-1 text-[12px] font-bold text-white" style={{ background: C.green }}>
              {rtl ? "المستخدمون" : "Users"}
            </button>
          </div>
        </div>
      )}

      {/* ===== guided tour overlay (real behavior for جولة تعريفية) ===== */}
      {tour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setTour(false)}>
          <div className="w-full max-w-sm border border-white/20 bg-[#161616] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <b className="text-[13px]">{rtl ? "جولة تعريفية" : "Guided tour"} ({step + 1}/{TOUR_STEPS.length})</b>
              <button onClick={() => setTour(false)} className="text-white/60 hover:text-white"><X style={{ width: 16, height: 16 }} /></button>
            </div>
            <p className="min-h-[44px] text-[12px] text-white/85">{rtl ? TOUR_STEPS[step].ar : TOUR_STEPS[step].en}</p>
            <div className="mt-3 flex justify-between">
              <button disabled={step === 0} onClick={() => setStep(step - 1)} className="border border-white/30 px-3 py-1 text-[12px] disabled:opacity-40">{rtl ? "السابق" : "Back"}</button>
              {step < TOUR_STEPS.length - 1
                ? <button onClick={() => setStep(step + 1)} className="px-3 py-1 text-[12px] font-bold text-white" style={{ background: C.green }}>{rtl ? "التالي" : "Next"}</button>
                : <button onClick={() => { setTour(false); navigate("/app/construction/sahl/sales"); }} className="px-3 py-1 text-[12px] font-bold text-white" style={{ background: C.green }}>{rtl ? "ابدأ — فاتورة جديدة" : "Start — new invoice"}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
