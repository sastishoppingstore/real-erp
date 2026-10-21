import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import {
  addDays,
  AXIS,
  changePct,
  ChartCard,
  compactMoney,
  daysBetween,
  exportReportExcel,
  ExportActions,
  GRID,
  KpiGrid,
  money,
  num,
  openReportPrint,
  RankList,
  ReportFooter,
  ReportHero,
  ReportTable,
  TOOLTIP_STYLE,
  todayYmd,
  ymd,
  type HeroPreset,
  type KpiItem,
  type ReportCompany,
  type ReportColumn,
  type ReportSpec,
} from "./reportUI";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FileText,
  Landmark,
  Mail,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Undo2,
  Wallet,
} from "lucide-react";

type PeriodSummary = {
  from: string;
  to: string;
  sales: { count: number; total: number; tax: number; paid: number; due: number };
  returns: { count: number; total: number };
  purchases: { count: number; total: number };
  payments: { count: number; total: number };
  expenses: { count: number; total: number };
  contracts: { count: number; value: number; invoiced: number };
  invoices: Array<{ no: string; date: string; customer: string; type: string; total: number; paid: number; due: number }>;
  returnRows: Array<{ no: string; date: string; customer: string; amount: number; reason: string }>;
  purchaseRows: Array<{ no: string; date: string; supplier: string; total: number; status: string }>;
  paymentRows: Array<{ date: string; customer: string; amount: number; method: string }>;
  contractRows: Array<{ no: string; title: string; client: string; date: string; value: number; status: string }>;
  topCustomers: Array<{ name: string; total: number }>;
  topItems: Array<{ name: string; qty: number; total: number }>;
};

type PeriodTotals = {
  from: string;
  to: string;
  sales: { count: number; total: number; tax: number; paid: number; due: number };
  returns: { count: number; total: number };
  purchases: { count: number; total: number };
  payments: { count: number; total: number };
  expenses: { count: number; total: number };
};

type Frequency = "daily" | "weekly" | "monthly";

type Config = {
  enabled: boolean;
  frequency: Frequency;
  sendTime: string;
  periodDays: string;
  recipients: string;
};

type Point = {
  key: string;
  label: string;
  sales: number;
  purchases: number;
  returns: number;
  payments: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function buildSeries(d: PeriodSummary): Point[] {
  const start = new Date(`${d.from}T12:00:00`);
  const end = new Date(`${d.to}T12:00:00`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const monthly = days > 62;
  const map = new Map<string, Point>();

  if (monthly) {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1, 12);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, {
        key,
        label: cursor.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
        sales: 0,
        purchases: 0,
        returns: 0,
        payments: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    for (let i = 0; i < days; i++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      map.set(ymd(dt), {
        key: ymd(dt),
        label: dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        sales: 0,
        purchases: 0,
        returns: 0,
        payments: 0,
      });
    }
  }

  const add = (date: string | undefined, field: "sales" | "purchases" | "returns" | "payments", amount: number) => {
    if (!date) return;
    const key = monthly ? String(date).slice(0, 7) : String(date).slice(0, 10);
    const point = map.get(key);
    if (point) point[field] += Number(amount || 0);
  };

  d.invoices.forEach((r) => add(r.date, "sales", r.total));
  d.purchaseRows.forEach((r) => add(r.date, "purchases", r.total));
  d.returnRows.forEach((r) => add(r.date, "returns", r.amount));
  d.paymentRows.forEach((r) => add(r.date, "payments", r.amount));

  return Array.from(map.values());
}

export default function PeriodReport() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);

  const utils = trpc.useUtils();
  const reportRef = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState(() => addDays(todayYmd(), -6));
  const [to, setTo] = useState(() => todayYmd());
  const [busy, setBusy] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cfgMsg, setCfgMsg] = useState("");

  const valid = DATE_RE.test(from) && DATE_RE.test(to) && from <= to;
  const span = valid ? daysBetween(from, to) : 0;
  const prevTo = valid ? addDays(from, -1) : "";
  const prevFrom = valid ? addDays(prevTo, -(span - 1)) : "";

  const { data: summary, isFetching } = trpc.sahlReports.periodSummary.useQuery(
    { from, to },
    { enabled: valid },
  );
  const { data: prevTotals } = trpc.sahlReports.periodTotals.useQuery(
    { from: prevFrom, to: prevTo },
    { enabled: valid && span > 0 },
  );
  const { data: company } = trpc.settings.companySettingsGet.useQuery();
  const { data: settings } = trpc.sahlReports.settingsGet.useQuery();

  const d = summary as PeriodSummary | undefined;
  const prev = prevTotals as PeriodTotals | undefined;

  const [cfg, setCfg] = useState<Config>({
    enabled: false,
    frequency: "weekly",
    sendTime: "08:00",
    periodDays: "7",
    recipients: "",
  });

  useEffect(() => {
    if (!settings) return;
    const s = settings as any;
    setCfg({
      enabled: !!s.enabled,
      frequency: (s.frequency ?? "weekly") as Frequency,
      sendTime: s.sendTime ?? "08:00",
      periodDays: String(s.periodDays ?? 7),
      recipients: s.recipients ?? "",
    });
  }, [settings]);

  const emailM = trpc.sahlReports.emailPeriod.useMutation({
    onSuccess: (res: any) => {
      setEmailMsg(
        res?.sent
          ? `${T("أُرسل إلى", "Sent to")} ${res.to}`
          : res?.error || T("لم يتم الإرسال", "Email was not sent"),
      );
    },
    onError: (err: any) => setEmailMsg(err?.message || T("فشل الإرسال", "Email failed")),
  });

  const saveM = trpc.sahlReports.settingsSave.useMutation({
    onSuccess: () => {
      setCfgMsg(T("تم حفظ الإعدادات", "Settings saved"));
      utils.sahlReports.settingsGet.invalidate();
    },
    onError: (err: any) => setCfgMsg(err?.message || T("فشل الحفظ", "Save failed")),
  });

  const sendNowM = trpc.sahlReports.sendNow.useMutation({
    onSuccess: (res: any) => {
      setCfgMsg(
        res?.sent
          ? `${T("أُرسل إلى", "Sent to")} ${res.to}`
          : res?.error || T("لم يتم الإرسال", "Email was not sent"),
      );
      utils.sahlReports.settingsGet.invalidate();
    },
    onError: (err: any) => setCfgMsg(err?.message || T("فشل الإرسال", "Email failed")),
  });

  const comp: any = company ?? {};
  const companyInfo: ReportCompany = {
    name: rtl ? comp.companyNameAr || comp.companyName : comp.companyName || comp.companyNameAr,
    nameAr: comp.companyNameAr,
    tax: comp.taxNumber,
    cr: comp.crNumber,
    phone: comp.phone,
    email: comp.email,
    address: comp.address,
    logo: comp.logo,
  };

  const series = useMemo(() => (d ? buildSeries(d) : []), [d]);

  const today = todayYmd();
  const presets: HeroPreset[] = [
    { key: "today", label: T("اليوم", "Today"), from: today, to: today },
    { key: "7", label: T("7 أيام", "7 days"), from: addDays(today, -6), to: today },
    { key: "30", label: T("30 يوم", "30 days"), from: addDays(today, -29), to: today },
    { key: "month", label: T("هذا الشهر", "This month"), from: `${today.slice(0, 7)}-01`, to: today },
    { key: "year", label: T("هذه السنة", "This year"), from: `${today.slice(0, 4)}-01-01`, to: today },
  ];
  const activeKey = presets.find((p) => p.from === from && p.to === to)?.key ?? "custom";

  const typeLabel = (value: string) => {
    if (value === "standard") return T("قياسية", "Standard");
    if (value === "simplified") return T("مبسطة", "Simplified");
    if (value === "zatca") return T("زاتكا", "ZATCA");
    return value || "—";
  };

  const net = (d?.sales.total ?? 0) - (d?.returns.total ?? 0) - (d?.purchases.total ?? 0) - (d?.expenses.total ?? 0);
  const prevNet =
    (prev?.sales.total ?? 0) - (prev?.returns.total ?? 0) - (prev?.purchases.total ?? 0) - (prev?.expenses.total ?? 0);
  const cmpLabel = T("مقارنة بالفترة السابقة", "vs previous period");

  const kpis: KpiItem[] = [
    {
      label: T("إجمالي المبيعات", "Total sales"),
      value: money(d?.sales.total),
      sub: `${T("ضريبة", "VAT")} ${money(d?.sales.tax)} · ${d?.sales.count ?? 0} ${T("فاتورة", "invoices")}`,
      icon: <Wallet className="h-4 w-4" />,
      tone: "emerald",
      change: changePct(d?.sales.total ?? 0, prev?.sales.total),
      changeLabel: cmpLabel,
    },
    {
      label: T("المحصّل", "Collected"),
      value: money(d?.sales.paid),
      sub: T("تحصيل نقدي من العملاء", "Cash collected from customers"),
      icon: <Landmark className="h-4 w-4" />,
      tone: "teal",
      change: changePct(d?.sales.paid ?? 0, prev?.sales.paid),
      changeLabel: cmpLabel,
    },
    {
      label: T("المتبقي (ذمم)", "Outstanding"),
      value: money(d?.sales.due),
      sub: T("مستحق على العملاء", "Receivable from customers"),
      icon: <Receipt className="h-4 w-4" />,
      tone: "amber",
      change: changePct(d?.sales.due ?? 0, prev?.sales.due),
      changeLabel: cmpLabel,
      invert: true,
    },
    {
      label: T("المشتريات", "Purchases"),
      value: money(d?.purchases.total),
      sub: `${d?.purchases.count ?? 0} ${T("أمر شراء", "purchase orders")}`,
      icon: <ShoppingCart className="h-4 w-4" />,
      tone: "blue",
      change: changePct(d?.purchases.total ?? 0, prev?.purchases.total),
      changeLabel: cmpLabel,
      invert: true,
    },
    {
      label: T("المصروفات", "Expenses"),
      value: money(d?.expenses.total),
      sub: `${d?.expenses.count ?? 0} ${T("حركة مصروف", "expense entries")}`,
      icon: <Wallet className="h-4 w-4" />,
      tone: "rose",
      change: changePct(d?.expenses.total ?? 0, prev?.expenses.total),
      changeLabel: cmpLabel,
      invert: true,
    },
    {
      label: T("المرتجعات", "Returns"),
      value: money(d?.returns.total),
      sub: `${d?.returns.count ?? 0} ${T("إشعار دائن", "credit notes")}`,
      icon: <Undo2 className="h-4 w-4" />,
      tone: "violet",
      change: changePct(d?.returns.total ?? 0, prev?.returns.total),
      changeLabel: cmpLabel,
      invert: true,
    },
    {
      label: T("الصافي", "Net"),
      value: money(net),
      sub: T("مبيعات − مرتجعات − مشتريات − مصروفات", "Sales − returns − purchases − expenses"),
      icon: <TrendingUp className="h-4 w-4" />,
      tone: net >= 0 ? "slate" : "rose",
      change: changePct(net, prevNet),
      changeLabel: cmpLabel,
    },
    {
      label: T("عدد الفواتير", "Invoices"),
      value: num(d?.sales.count ?? 0),
      sub: `${T("مقبوضات", "Payments")} ${money(d?.payments.total)}`,
      icon: <FileText className="h-4 w-4" />,
      tone: "teal",
      change: changePct(d?.sales.count ?? 0, prev?.sales.count),
      changeLabel: cmpLabel,
    },
  ];

  const salesColumns: ReportColumn[] = [
    { label: T("الرقم", "No.") },
    { label: T("التاريخ", "Date") },
    { label: T("العميل", "Customer") },
    { label: T("النوع", "Type") },
    { label: T("الإجمالي", "Total"), numeric: true },
    { label: T("المدفوع", "Paid"), numeric: true },
    { label: T("المتبقي", "Due"), numeric: true },
  ];

  // ---- export ------------------------------------------------------------
  // One spec feeds both exports: a real .xlsx workbook and the professional
  // A4 document that is saved as PDF through the browser print engine.
  const reportSpec = (): ReportSpec => ({
    title: T("تقرير الفترة", "Period report"),
    subtitle: `${d?.from ?? from} — ${d?.to ?? to}`,
    period: `${d?.from ?? from} — ${d?.to ?? to}`,
    fileName: `Period-Report_${d?.from ?? from}_${d?.to ?? to}`,
    company: companyInfo,
    footerNote: T("جميع المبالغ شاملة ضريبة القيمة المضافة", "All amounts include VAT"),
    kpis,
    chart: {
      title: T("حركة المبيعات والمشتريات والمقبوضات", "Sales, purchases and collections"),
      labels: series.map((p) => p.label),
      series: [
        { name: T("المبيعات", "Sales"), values: series.map((p) => p.sales), color: "#10b981" },
        { name: T("المشتريات", "Purchases"), values: series.map((p) => p.purchases), color: "#3b82f6" },
        { name: T("المحصّل", "Collected"), values: series.map((p) => p.payments), color: "#0f172a" },
        { name: T("المرتجعات", "Returns"), values: series.map((p) => p.returns), color: "#e11d48" },
      ],
    },
    sheets: [
      {
        name: "Sales Invoices",
        title: T("فواتير البيع (فواتير أعمال)", "Sales invoices (labour)"),
        columns: [
          { label: T("الرقم", "No.") },
          { label: T("التاريخ", "Date") },
          { label: T("العميل", "Customer") },
          { label: T("النوع", "Type") },
          { label: T("الإجمالي", "Total"), numeric: true },
          { label: T("المدفوع", "Paid"), numeric: true },
          { label: T("المتبقي", "Due"), numeric: true },
        ],
        rows: (d?.invoices ?? []).map((r) => [r.no, r.date, r.customer, typeLabel(r.type), r.total, r.paid, r.due]),
        totals: [T("الإجمالي", "Total"), "", "", "", d?.sales.total ?? 0, d?.sales.paid ?? 0, d?.sales.due ?? 0],
      },
      {
        name: "Returns",
        title: T("المرتجعات", "Returns"),
        columns: [
          { label: T("الرقم", "No.") },
          { label: T("التاريخ", "Date") },
          { label: T("العميل", "Customer") },
          { label: T("المبلغ", "Amount"), numeric: true },
          { label: T("السبب", "Reason") },
        ],
        rows: (d?.returnRows ?? []).map((r) => [r.no, r.date, r.customer, r.amount, r.reason]),
        totals: [T("الإجمالي", "Total"), "", "", d?.returns.total ?? 0, ""],
      },
      {
        name: "Purchases",
        title: T("المشتريات", "Purchases"),
        columns: [
          { label: T("رقم أمر الشراء", "PO") },
          { label: T("التاريخ", "Date") },
          { label: T("المورد", "Supplier") },
          { label: T("الإجمالي", "Total"), numeric: true },
          { label: T("الحالة", "Status") },
        ],
        rows: (d?.purchaseRows ?? []).map((r) => [r.no, r.date, r.supplier, r.total, r.status]),
        totals: [T("الإجمالي", "Total"), "", "", d?.purchases.total ?? 0, ""],
      },
      {
        name: "Payments",
        title: T("المقبوضات", "Payments"),
        columns: [
          { label: T("التاريخ", "Date") },
          { label: T("العميل", "Customer") },
          { label: T("المبلغ", "Amount"), numeric: true },
          { label: T("الطريقة", "Method") },
        ],
        rows: (d?.paymentRows ?? []).map((r) => [r.date, r.customer, r.amount, r.method]),
        totals: [T("الإجمالي", "Total"), "", d?.payments.total ?? 0, ""],
      },
      {
        name: "Contracts",
        title: T("العقود", "Contracts"),
        columns: [
          { label: T("الرقم", "No.") },
          { label: T("العنوان", "Title") },
          { label: T("العميل", "Client") },
          { label: T("التاريخ", "Date") },
          { label: T("القيمة", "Value"), numeric: true },
          { label: T("الحالة", "Status") },
        ],
        rows: (d?.contractRows ?? []).map((r) => [r.no, r.title, r.client, r.date, r.value, r.status]),
        totals: [T("الإجمالي", "Total"), "", "", "", d?.contracts.value ?? 0, ""],
      },
      {
        name: "Top Customers",
        title: T("أعلى العملاء", "Top customers"),
        columns: [
          { label: T("العميل", "Customer") },
          { label: T("الإجمالي", "Total"), numeric: true },
        ],
        rows: (d?.topCustomers ?? []).map((r) => [r.name, r.total]),
      },
      {
        name: "Top Items",
        title: T("أعلى الأصناف", "Top items"),
        columns: [
          { label: T("الصنف", "Item") },
          { label: T("الكمية", "Qty"), numeric: true },
          { label: T("الإجمالي", "Total"), numeric: true },
        ],
        rows: (d?.topItems ?? []).map((r) => [r.name, r.qty, r.total]),
      },
    ],
  });

  const buildExcel = async () => {
    if (!d) return;
    setBusy("excel");
    try {
      await exportReportExcel(reportSpec());
    } catch (err: any) {
      window.alert(`${T("تعذر حفظ ملف Excel", "Excel export failed")}: ${err?.message ?? err}`);
    } finally {
      setBusy("");
    }
  };

  const buildPrint = () => {
    if (!d) return;
    setBusy("print");
    try {
      openReportPrint(reportSpec());
    } catch (err: any) {
      window.alert(`${T("تعذر فتح التقرير", "Could not open the report")}: ${err?.message ?? err}`);
    } finally {
      setBusy("");
    }
  };

  const sendEmail = () => {
    if (!valid) return;
    setEmailMsg("");
    emailM.mutate({ from, to, email: emailTo.trim() || undefined });
  };

  const saveSettings = () => {
    setCfgMsg("");
    saveM.mutate({
      enabled: cfg.enabled,
      frequency: cfg.frequency,
      sendTime: cfg.sendTime,
      periodDays: Math.min(365, Math.max(1, Math.round(Number(cfg.periodDays) || 7))),
      recipients: cfg.recipients.trim() || undefined,
    });
  };

  const maxTop = Math.max(1, ...(d?.topCustomers ?? []).map((r) => Number(r.total || 0)));

  return (
    <div className="min-h-full bg-[#eef2f7] p-3 text-slate-900 md:p-5" dir={rtl ? "rtl" : "ltr"}>
      <div ref={reportRef} className="space-y-4">
        {/* ---- page 1: header + KPI boxes + chart ---- */}
        <div data-pdf-section className="space-y-4 rounded-3xl bg-[#eef2f7] p-1">
          <ReportHero
            title={T("تقرير الفترة", "Period report")}
            subtitle={T("تقرير شامل بالمبيعات والمشتريات والمصروفات والمرتجعات", "Sales, purchases, expenses and returns in one report")}
            periodText={d ? `${d.from} — ${d.to}` : `${from} — ${to}`}
            from={from}
            to={to}
            onFrom={setFrom}
            onTo={setTo}
            presets={presets}
            activeKey={activeKey}
            onPreset={(p) => {
              setFrom(p.from);
              setTo(p.to);
            }}
            loading={isFetching}
            company={companyInfo}
            rtl={rtl}
            badge={T("تقرير", "Report")}
            actions={
              <ExportActions
                busy={busy}
                onExcel={buildExcel}
                onPdf={buildPrint}
                onPrint={buildPrint}
                extra={
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMsg("");
                      setEmailOpen((v) => !v);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-black text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ background: "linear-gradient(135deg,#0f766e,#14b8a6)" }}
                  >
                    <Mail className="h-4 w-4" />
                    {T("إرسال بالبريد", "Email")}
                  </button>
                }
              />
            }
          />

          <KpiGrid items={kpis} />

          <ChartCard
            title={T("حركة المبيعات والمشتريات والمقبوضات", "Sales, purchases and collections")}
            subtitle={T("مقارنة يومية داخل الفترة المحددة", "Daily movement inside the selected period")}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="gBuy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" {...AXIS} />
                <YAxis {...AXIS} width={58} tickFormatter={compactMoney} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#a7f3d0", fontWeight: 700 }}
                  formatter={((value: any, name: any) => [money(value), String(name)]) as any}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sales" name={T("المبيعات", "Sales")} fill="url(#gSales)" radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar dataKey="purchases" name={T("المشتريات", "Purchases")} fill="url(#gBuy)" radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Line type="monotone" dataKey="payments" name={T("المحصّل", "Collected")} stroke="#0f172a" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="returns" name={T("المرتجعات", "Returns")} stroke="#e11d48" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ---- highlights ---- */}
        <div data-pdf-section className="grid gap-4 rounded-3xl bg-[#eef2f7] p-1 lg:grid-cols-2">
          <RankList
            title={T("أعلى العملاء", "Top customers")}
            total={d?.topCustomers?.length ? (d.topCustomers ?? []).reduce((a, r) => a + Number(r.total || 0), 0) : 0}
            rows={(d?.topCustomers ?? []).slice(0, 8).map((r) => ({
              name: r.name,
              value: Number(r.total || 0),
              extra: `${Math.round((Number(r.total || 0) / maxTop) * 100)}%`,
            }))}
            emptyText={T("لا يوجد عملاء في هذه الفترة", "No customers in this period")}
          />
          <RankList
            title={T("أعلى الأصناف", "Top items")}
            total={d?.topItems?.length ? (d.topItems ?? []).reduce((a, r) => a + Number(r.total || 0), 0) : 0}
            rows={(d?.topItems ?? []).slice(0, 8).map((r) => ({
              name: r.name,
              value: Number(r.total || 0),
              extra: `${r.qty} ${T("وحدة", "units")}`,
            }))}
            emptyText={T("لا توجد أصناف في هذه الفترة", "No items in this period")}
          />
        </div>

        {/* ---- detail tables ---- */}
        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("فواتير البيع (فواتير أعمال)", "Sales invoices (labour)")}
            subtitle={`${d?.sales.count ?? 0} ${T("فاتورة", "invoices")} · ${money(d?.sales.total)}`}
            columns={salesColumns}
            rows={(d?.invoices ?? []).map((r) => [
              r.no,
              r.date,
              r.customer || "—",
              typeLabel(r.type),
              money(r.total),
              money(r.paid),
              money(r.due),
            ])}
            totals={[
              T("الإجمالي", "Total"),
              "",
              "",
              "",
              money(d?.sales.total),
              money(d?.sales.paid),
              money(d?.sales.due),
            ]}
            emptyText={T("لا توجد فواتير في هذه الفترة", "No invoices in this period")}
          />
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("المرتجعات", "Returns")}
            subtitle={`${d?.returns.count ?? 0} ${T("مرتجع", "credits")} · ${money(d?.returns.total)}`}
            columns={[
              { label: T("الرقم", "No.") },
              { label: T("التاريخ", "Date") },
              { label: T("العميل", "Customer") },
              { label: T("المبلغ", "Amount"), numeric: true },
              { label: T("السبب", "Reason") },
            ]}
            rows={(d?.returnRows ?? []).map((r) => [r.no, r.date, r.customer || "—", money(r.amount), r.reason || "—"])}
            totals={[T("الإجمالي", "Total"), "", "", money(d?.returns.total), ""]}
            emptyText={T("لا توجد مرتجعات", "No returns")}
          />
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("المشتريات", "Purchases")}
            subtitle={`${d?.purchases.count ?? 0} ${T("أمر شراء", "PO")} · ${money(d?.purchases.total)}`}
            columns={[
              { label: T("الرقم", "PO"), },
              { label: T("التاريخ", "Date") },
              { label: T("المورد", "Supplier") },
              { label: T("الإجمالي", "Total"), numeric: true },
              { label: T("الحالة", "Status") },
            ]}
            rows={(d?.purchaseRows ?? []).map((r) => [r.no, r.date, r.supplier || "—", money(r.total), r.status || "—"])}
            totals={[T("الإجمالي", "Total"), "", "", money(d?.purchases.total), ""]}
            emptyText={T("لا توجد مشتريات", "No purchases")}
          />
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("المقبوضات", "Payments")}
            subtitle={`${d?.payments.count ?? 0} ${T("حركة", "entries")} · ${money(d?.payments.total)}`}
            columns={[
              { label: T("التاريخ", "Date") },
              { label: T("العميل", "Customer") },
              { label: T("المبلغ", "Amount"), numeric: true },
              { label: T("الطريقة", "Method") },
            ]}
            rows={(d?.paymentRows ?? []).map((r) => [r.date, r.customer || "—", money(r.amount), r.method || "—"])}
            totals={[T("الإجمالي", "Total"), "", money(d?.payments.total), ""]}
            emptyText={T("لا توجد مقبوضات", "No payments")}
          />
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("العقود", "Contracts")}
            subtitle={`${d?.contracts.count ?? 0} ${T("عقد", "contracts")} · ${money(d?.contracts.value)} · ${T("المفوتر", "invoiced")} ${money(d?.contracts.invoiced)}`}
            columns={[
              { label: T("الرقم", "No.") },
              { label: T("العنوان", "Title") },
              { label: T("العميل", "Client") },
              { label: T("التاريخ", "Date") },
              { label: T("القيمة", "Value"), numeric: true },
              { label: T("الحالة", "Status") },
            ]}
            rows={(d?.contractRows ?? []).map((r) => [r.no, r.title, r.client || "—", r.date, money(r.value), r.status || "—"])}
            totals={[T("الإجمالي", "Total"), "", "", "", money(d?.contracts.value), ""]}
            emptyText={T("لا توجد عقود", "No contracts")}
          />
        </div>

        <ReportFooter
          company={companyInfo}
          note={T("جميع المبالغ شاملة ضريبة القيمة المضافة", "All amounts include VAT")}
          generatedAt={new Date().toLocaleString()}
        />
      </div>

      {/* ---- panels that are not part of the printed report ---- */}
      {emailOpen && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" data-html2canvas-ignore>
          <div className="mb-2 text-[13px] font-black text-slate-800">{T("إرسال التقرير بالبريد", "Email this report")}</div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              className="w-full max-w-xs rounded-xl border border-slate-300 px-3 py-2 text-[12px] text-slate-800 outline-none focus:border-emerald-500"
              placeholder={T("بريد المستلم (اتركه فارغاً للافتراضي)", "Recipient email (blank = default)")}
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendEmail();
              }}
            />
            <button
              type="button"
              className="rounded-xl px-3 py-2 text-[12px] font-black text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#047857,#10b981)" }}
              onClick={sendEmail}
              disabled={emailM.isPending || !valid}
            >
              {emailM.isPending ? T("جارٍ الإرسال...", "Sending...") : T("إرسال", "Send")}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-700"
              onClick={() => setEmailOpen(false)}
            >
              {T("إغلاق", "Close")}
            </button>
          </div>
          {emailMsg ? <div className="mt-1 text-[12px] font-bold text-emerald-700">{emailMsg}</div> : null}
          <div className="mt-1 text-[11px] text-slate-500">
            {T("يُرسل نفس تقرير الفترة المعروض مع الجداول التفصيلية.", "The displayed period is sent with all detail tables.")}
          </div>
        </div>
      )}

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" data-html2canvas-ignore>
        <button
          type="button"
          className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50"
          onClick={() => setSettingsOpen((open) => !open)}
        >
          <span className="text-[12.5px] font-black text-slate-800">
            {T("إعدادات الإرسال التلقائي", "Scheduled email settings")}
          </span>
          <span className="text-slate-400">{settingsOpen ? "−" : "+"}</span>
        </button>

        {settingsOpen && (
          <div className="border-t border-slate-100 p-3">
            <div className="mb-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={cfg.enabled}
                  onChange={(e) => setCfg((c) => ({ ...c, enabled: e.target.checked }))}
                />
                {T("مُفعّل", "Enabled")}
              </label>

              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                <span className="text-slate-500">{T("التكرار", "Frequency")}</span>
                <select
                  className="rounded-xl border border-slate-300 px-2 py-1.5 text-[12px]"
                  value={cfg.frequency}
                  onChange={(e) => setCfg((c) => ({ ...c, frequency: e.target.value as Frequency }))}
                >
                  <option value="daily">{T("يومي", "Daily")}</option>
                  <option value="weekly">{T("أسبوعي", "Weekly")}</option>
                  <option value="monthly">{T("شهري", "Monthly")}</option>
                </select>
              </label>

              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                <span className="text-slate-500">{T("الوقت", "Time")}</span>
                <input
                  type="time"
                  className="rounded-xl border border-slate-300 px-2 py-1.5 text-[12px]"
                  value={cfg.sendTime}
                  onChange={(e) => setCfg((c) => ({ ...c, sendTime: e.target.value }))}
                />
              </label>

              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                <span className="text-slate-500">{T("عدد أيام الفترة", "Period days")}</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  className="w-20 rounded-xl border border-slate-300 px-2 py-1.5 text-[12px]"
                  value={cfg.periodDays}
                  onChange={(e) => setCfg((c) => ({ ...c, periodDays: e.target.value }))}
                />
              </label>
            </div>

            <label className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px]">
              <span className="w-24 text-slate-500">{T("المستلمون", "Recipients")}</span>
              <input
                type="text"
                className="w-full max-w-md rounded-xl border border-slate-300 px-3 py-2 text-[12px]"
                placeholder={T("بريد أو أكثر مفصولاً بفاصلة (فارغ = بريد الشركة)", "One or more emails, comma separated (blank = company email)")}
                value={cfg.recipients}
                onChange={(e) => setCfg((c) => ({ ...c, recipients: e.target.value }))}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl px-3 py-2 text-[12px] font-black text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#047857,#10b981)" }}
                onClick={saveSettings}
                disabled={saveM.isPending}
              >
                {saveM.isPending ? T("جارٍ الحفظ...", "Saving...") : T("حفظ", "Save")}
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-700 disabled:opacity-50"
                onClick={() => {
                  setCfgMsg("");
                  sendNowM.mutate();
                }}
                disabled={sendNowM.isPending}
              >
                {sendNowM.isPending ? T("جارٍ الإرسال...", "Sending...") : T("إرسال الآن", "Send now")}
              </button>
              <span className="text-[11px] text-slate-500">
                {T("الإرسال التلقائي يستخدم آخر إعدادات محفوظة.", "Scheduled sends use the last saved settings.")}
              </span>
            </div>

            {cfgMsg ? <div className="mt-1 text-[12px] font-bold text-emerald-700">{cfgMsg}</div> : null}
            {(settings as any)?.lastSentAt ? (
              <div className="mt-1 text-[11px] text-slate-500">
                {T("آخر إرسال", "Last sent")}:{" "}
                {new Date((settings as any).lastSentAt).toLocaleString(rtl ? "ar-SA" : "en-GB")}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
