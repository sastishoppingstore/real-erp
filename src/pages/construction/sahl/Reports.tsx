import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
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
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  Coins,
  FileText,
  Landmark,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function useReportExport(getSpec: () => ReportSpec, onError: (message: string) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState("");

  const onExcel = async () => {
    setBusy("excel");
    try {
      await exportReportExcel(getSpec());
    } catch (err: any) {
      onError(err?.message ?? String(err));
    } finally {
      setBusy("");
    }
  };

  const onPrint = () => {
    setBusy("print");
    try {
      openReportPrint(getSpec());
    } catch (err: any) {
      onError(err?.message ?? String(err));
    } finally {
      setBusy("");
    }
  };

  return { ref, busy, onExcel, onPdf: onPrint, onPrint };
}

function useCompany(rtl: boolean) {
  const { data } = trpc.settings.companySettingsGet.useQuery();
  const comp: any = data ?? {};
  return {
    name: rtl ? comp.companyNameAr || comp.companyName : comp.companyName || comp.companyNameAr,
    nameAr: comp.companyNameAr,
    tax: comp.taxNumber,
    cr: comp.crNumber,
    phone: comp.phone,
    email: comp.email,
    address: comp.address,
    logo: comp.logo,
  } as ReportCompany;
}

function buildDailySeries(
  invoices: any[],
  from: string,
  to: string,
): Array<{ key: string; label: string; sales: number; paid: number }> {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const map = new Map<string, { key: string; label: string; sales: number; paid: number }>();
  for (let i = 0; i < days; i++) {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    map.set(ymd(dt), {
      key: ymd(dt),
      label: dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      sales: 0,
      paid: 0,
    });
  }
  invoices.forEach((inv) => {
    const key = String(inv?.date ?? inv?.createdAt ?? "").slice(0, 10);
    const point = map.get(key);
    if (!point) return;
    point.sales += Number(inv?.totalAmount || 0);
    point.paid += Number(inv?.paidAmount || 0);
  });
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Daily movement report
// ---------------------------------------------------------------------------

export function SahlDaily() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const company = useCompany(rtl);
  const [date, setDate] = useState(todayYmd());
  const [error, setError] = useState("");

  const { data: invoiceData } = trpc.sales.invoiceList.useQuery();
  const invoices = (invoiceData ?? []) as any[];

  const dayRows = useMemo(
    () => invoices.filter((i) => String(i.date ?? i.createdAt ?? "").slice(0, 10) === date),
    [invoices, date],
  );
  const prevRows = useMemo(
    () => invoices.filter((i) => String(i.date ?? i.createdAt ?? "").slice(0, 10) === addDays(date, -1)),
    [invoices, date],
  );

  const sum = (rows: any[], key: string) => rows.reduce((a, r) => a + Number(r?.[key] || 0), 0);
  const sales = sum(dayRows, "totalAmount");
  const paid = sum(dayRows, "paidAmount");
  const due = sum(dayRows, "balanceDue");
  const prevSales = sum(prevRows, "totalAmount");
  const prevPaid = sum(prevRows, "paidAmount");
  const prevDue = sum(prevRows, "balanceDue");
  const cmpLabel = T("مقارنة باليوم السابق", "vs previous day");

  const series = useMemo(
    () => buildDailySeries(invoices, addDays(date, -13), date),
    [invoices, date],
  );

  const columns: ReportColumn[] = [
    { label: T("الرقم", "No.") },
    { label: T("العميل", "Customer") },
    { label: T("النوع", "Type") },
    { label: T("الإجمالي", "Total"), numeric: true },
    { label: T("المدفوع", "Paid"), numeric: true },
    { label: T("المتبقي", "Due"), numeric: true },
  ];

  const kpis: KpiItem[] = [
    {
      label: T("مبيعات اليوم", "Day sales"),
      value: money(sales),
      sub: `${dayRows.length} ${T("فاتورة", "invoices")}`,
      icon: <TrendingUp className="h-4 w-4" />,
      tone: "emerald",
      change: changePct(sales, prevSales),
      changeLabel: cmpLabel,
    },
    {
      label: T("المحصّل", "Collected"),
      value: money(paid),
      sub: T("تحصيل نقدي", "Cash collected"),
      icon: <Landmark className="h-4 w-4" />,
      tone: "teal",
      change: changePct(paid, prevPaid),
      changeLabel: cmpLabel,
    },
    {
      label: T("المتبقي", "Outstanding"),
      value: money(due),
      sub: T("ذمم اليوم", "Credit today"),
      icon: <Receipt className="h-4 w-4" />,
      tone: "amber",
      change: changePct(due, prevDue),
      changeLabel: cmpLabel,
      invert: true,
    },
    {
      label: T("نسبة التحصيل", "Collection rate"),
      value: `${sales > 0 ? Math.round((paid / sales) * 100) : 0}%`,
      sub: T("المحصّل من إجمالي المبيعات", "Collected of total sales"),
      icon: <Coins className="h-4 w-4" />,
      tone: "blue",
    },
  ];

  const { ref, busy, onExcel, onPdf, onPrint } = useReportExport(
    () => ({
      title: `${T("تقرير الحركة اليومية", "Daily movement report")} ${date}`,
      subtitle: `${company.name ?? ""} · ${date}`,
      fileName: `Daily-Report_${date}`,
      company,
      kpis,
      chart: {
        title: T("مبيعات آخر 14 يوم", "Sales of the last 14 days"),
        labels: series.map((p) => p.label),
        series: [
          { name: T("المبيعات", "Sales"), values: series.map((p) => p.sales), color: "#10b981" },
          { name: T("المحصّل", "Collected"), values: series.map((p) => p.paid), color: "#0f172a" },
        ],
      },
      sheets: [
        {
          name: "Daily Invoices",
          title: T("فواتير اليوم", "Invoices of the day"),
          columns: [
            { label: "No." },
            { label: "Customer" },
            { label: "Type" },
            { label: "Total", numeric: true },
            { label: "Paid", numeric: true },
            { label: "Due", numeric: true },
          ],
          rows: dayRows.map((i) => [
            i.invoiceNumber ?? "",
            i.customerName ?? "",
            i.invoiceType ?? "",
            Number(i.totalAmount || 0),
            Number(i.paidAmount || 0),
            Number(i.balanceDue || 0),
          ]),
          totals: ["Total", "", "", sales, paid, due],
        },
      ],
    }),
    (m) => setError(m),
  );

  return (
    <div className="min-h-full bg-[#eef2f7] p-3 text-slate-900 md:p-5" dir={rtl ? "rtl" : "ltr"}>
      <div ref={ref} className="space-y-4">
        <div data-pdf-section className="space-y-4 rounded-3xl bg-[#eef2f7] p-1">
          <ReportHero
            title={T("تقرير الحركة اليومية", "Daily movement report")}
            subtitle={T("مبيعات وتحصيل يوم محدد", "Sales and collections of a single day")}
            periodText={date}
            from={date}
            to={date}
            singleDate
            onFrom={setDate}
            company={company}
            rtl={rtl}
            badge={T("يومي", "Daily")}
            actions={<ExportActions busy={busy} onExcel={onExcel} onPdf={onPdf} onPrint={onPrint} />}
          />
          <KpiGrid items={kpis} />
          <ChartCard
            title={T("مبيعات آخر 14 يوم", "Sales of the last 14 days")}
            subtitle={T("مقارنة يومية مع المحصل", "Daily sales versus collections")}
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDaySales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#047857" />
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
                <Bar dataKey="sales" name={T("المبيعات", "Sales")} fill="url(#gDaySales)" radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Line type="monotone" dataKey="paid" name={T("المحصّل", "Collected")} stroke="#0f172a" strokeWidth={2.5} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("فواتير اليوم", "Invoices of the day")}
            subtitle={`${dayRows.length} ${T("فاتورة", "invoices")} · ${money(sales)}`}
            columns={columns}
            rows={dayRows.map((i) => [
              i.invoiceNumber ?? "",
              i.customerName || "—",
              i.invoiceType || "—",
              money(i.totalAmount),
              money(i.paidAmount),
              money(i.balanceDue),
            ])}
            totals={[T("الإجمالي", "Total"), "", "", money(sales), money(paid), money(due)]}
            emptyText={T("لا توجد حركة بهذا التاريخ", "No movements on this date")}
          />
        </div>

        <ReportFooter company={company} generatedAt={new Date().toLocaleString()} />
      </div>
      {error ? <div className="mt-2 text-[12px] font-bold text-rose-600">{error}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sales analysis
// ---------------------------------------------------------------------------

export function SahlSalesAnalysis() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const company = useCompany(rtl);
  const [from, setFrom] = useState(() => addDays(todayYmd(), -29));
  const [to, setTo] = useState(() => todayYmd());
  const [error, setError] = useState("");

  const valid = DATE_RE.test(from) && DATE_RE.test(to) && from <= to;
  const span = valid ? daysBetween(from, to) : 0;
  const prevTo = valid ? addDays(from, -1) : "";
  const prevFrom = valid ? addDays(prevTo, -(span - 1)) : "";

  const { data } = trpc.reports.salesReport.useQuery(
    { from, to, groupBy: "month" },
    { enabled: valid },
  );
  const { data: prevData } = trpc.reports.salesReport.useQuery(
    { from: prevFrom, to: prevTo, groupBy: "month" },
    { enabled: valid && span > 0 },
  );

  const rows = ((data as any)?.rows ?? []) as any[];
  const prevSummary = (prevData as any)?.summary ?? {};
  const summary = (data as any)?.summary ?? {};

  const today = todayYmd();
  const presets: HeroPreset[] = [
    { key: "30", label: T("30 يوم", "30 days"), from: addDays(today, -29), to: today },
    { key: "90", label: T("90 يوم", "90 days"), from: addDays(today, -89), to: today },
    { key: "month", label: T("هذا الشهر", "This month"), from: `${today.slice(0, 7)}-01`, to: today },
    { key: "year", label: T("هذه السنة", "This year"), from: `${today.slice(0, 4)}-01-01`, to: today },
  ];
  const activeKey = presets.find((p) => p.from === from && p.to === to)?.key ?? "custom";
  const cmpLabel = T("مقارنة بالفترة السابقة", "vs previous period");

  const kpis: KpiItem[] = [
    {
      label: T("الإيراد", "Revenue"),
      value: money(summary.totalRevenue),
      sub: `${summary.invoiceCount ?? 0} ${T("فاتورة", "invoices")}`,
      icon: <TrendingUp className="h-4 w-4" />,
      tone: "emerald",
      change: changePct(Number(summary.totalRevenue || 0), Number(prevSummary.totalRevenue || 0)),
      changeLabel: cmpLabel,
    },
    {
      label: T("الضريبة", "VAT"),
      value: money(summary.totalTax),
      sub: T("ضريبة القيمة المضافة", "Value added tax"),
      icon: <Coins className="h-4 w-4" />,
      tone: "blue",
      change: changePct(Number(summary.totalTax || 0), Number(prevSummary.totalTax || 0)),
      changeLabel: cmpLabel,
    },
    {
      label: T("المحصّل", "Collected"),
      value: money(summary.totalPaid),
      sub: T("تم تحصيله", "Already collected"),
      icon: <Landmark className="h-4 w-4" />,
      tone: "teal",
      change: changePct(Number(summary.totalPaid || 0), Number(prevSummary.totalPaid || 0)),
      changeLabel: cmpLabel,
    },
    {
      label: T("المتبقي", "Outstanding"),
      value: money(rows.reduce((a: number, r: any) => a + Number(r.balance || 0), 0)),
      sub: T("ذمم لم تُحصّل", "Not collected yet"),
      icon: <Receipt className="h-4 w-4" />,
      tone: "amber",
      change: changePct(
        rows.reduce((a: number, r: any) => a + Number(r.balance || 0), 0),
        ((prevData as any)?.rows ?? []).reduce((a: number, r: any) => a + Number(r.balance || 0), 0),
      ),
      changeLabel: cmpLabel,
      invert: true,
    },
  ];

  const { ref, busy, onExcel, onPdf, onPrint } = useReportExport(
    () => ({
      title: `${T("تقرير تحليل المبيعات", "Sales analysis report")} ${from} — ${to}`,
      subtitle: `${company.name ?? ""} · ${from} — ${to}`,
      fileName: `Sales-Analysis_${from}_${to}`,
      company,
      kpis,
      chart: {
        title: T("الإيراد والمحصّل حسب الفترة", "Revenue and collections per period"),
        labels: rows.map((r: any) => r.period),
        series: [
          { name: T("الإجمالي", "Total"), values: rows.map((r: any) => Number(r.total || 0)), color: "#10b981" },
          { name: T("المحصّل", "Paid"), values: rows.map((r: any) => Number(r.paid || 0)), color: "#0f172a" },
        ],
      },
      sheets: [
        {
          name: "Sales Analysis",
          title: T("تحليل المبيعات", "Sales analysis"),
          columns: [
            { label: "Period" },
            { label: "Count", numeric: true },
            { label: "Subtotal", numeric: true },
            { label: "Tax", numeric: true },
            { label: "Total", numeric: true },
            { label: "Paid", numeric: true },
            { label: "Due", numeric: true },
          ],
          rows: rows.map((r: any) => [
            r.period,
            Number(r.count || 0),
            Number(r.subtotal || 0),
            Number(r.tax || 0),
            Number(r.total || 0),
            Number(r.paid || 0),
            Number(r.balance || 0),
          ]),
          totals: [
            "Total",
            Number(summary.invoiceCount || 0),
            "",
            Number(summary.totalTax || 0),
            Number(summary.totalRevenue || 0),
            Number(summary.totalPaid || 0),
            "",
          ],
        },
      ],
    }),
    (m) => setError(m),
  );

  return (
    <div className="min-h-full bg-[#eef2f7] p-3 text-slate-900 md:p-5" dir={rtl ? "rtl" : "ltr"}>
      <div ref={ref} className="space-y-4">
        <div data-pdf-section className="space-y-4 rounded-3xl bg-[#eef2f7] p-1">
          <ReportHero
            title={T("تقرير تحليل المبيعات", "Sales analysis report")}
            subtitle={T("الإيراد والضريبة والتحصيل حسب الفترة", "Revenue, tax and collections per period")}
            periodText={`${from} — ${to}`}
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
            company={company}
            rtl={rtl}
            badge={T("مبيعات", "Sales")}
            actions={<ExportActions busy={busy} onExcel={onExcel} onPdf={onPdf} onPrint={onPrint} />}
          />
          <KpiGrid items={kpis} />
          <ChartCard
            title={T("الإيراد والمحصّل حسب الفترة", "Revenue and collections per period")}
            subtitle={T("تجميع شهري", "Grouped by month")}
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="period" {...AXIS} />
                <YAxis {...AXIS} width={58} tickFormatter={compactMoney} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#a7f3d0", fontWeight: 700 }}
                  formatter={((value: any, name: any) => [money(value), String(name)]) as any}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" name={T("الإجمالي", "Total")} fill="url(#gRev)" radius={[6, 6, 0, 0]} maxBarSize={34} />
                <Line type="monotone" dataKey="paid" name={T("المحصّل", "Paid")} stroke="#0f172a" strokeWidth={2.5} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("تفاصيل المبيعات", "Sales details")}
            subtitle={`${rows.length} ${T("فترة", "periods")}`}
            columns={[
              { label: T("الفترة", "Period") },
              { label: T("العدد", "Count"), numeric: true },
              { label: T("قبل الضريبة", "Subtotal"), numeric: true },
              { label: T("الضريبة", "Tax"), numeric: true },
              { label: T("الإجمالي", "Total"), numeric: true },
              { label: T("المدفوع", "Paid"), numeric: true },
              { label: T("المتبقي", "Due"), numeric: true },
            ]}
            rows={rows.map((r: any) => [
              r.period,
              num(r.count),
              money(r.subtotal),
              money(r.tax),
              money(r.total),
              money(r.paid),
              money(r.balance),
            ])}
            totals={[
              T("الإجمالي", "Total"),
              num(summary.invoiceCount),
              "",
              money(summary.totalTax),
              money(summary.totalRevenue),
              money(summary.totalPaid),
              money(rows.reduce((a: number, r: any) => a + Number(r.balance || 0), 0)),
            ]}
            emptyText={T("لا توجد بيانات", "No data")}
          />
        </div>

        <ReportFooter company={company} generatedAt={new Date().toLocaleString()} />
      </div>
      {error ? <div className="mt-2 text-[12px] font-bold text-rose-600">{error}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Purchase analysis
// ---------------------------------------------------------------------------

export function SahlPurchaseAnalysis() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const company = useCompany(rtl);
  const [from, setFrom] = useState(() => addDays(todayYmd(), -29));
  const [to, setTo] = useState(() => todayYmd());
  const [error, setError] = useState("");

  const valid = DATE_RE.test(from) && DATE_RE.test(to) && from <= to;
  const span = valid ? daysBetween(from, to) : 0;
  const prevTo = valid ? addDays(from, -1) : "";
  const prevFrom = valid ? addDays(prevTo, -(span - 1)) : "";

  const { data } = trpc.reports.purchaseReport.useQuery({ from, to }, { enabled: valid });
  const { data: prevData } = trpc.reports.purchaseReport.useQuery(
    { from: prevFrom, to: prevTo },
    { enabled: valid && span > 0 },
  );

  const rows = ((data as any)?.rows ?? []) as any[];
  const summary = (data as any)?.summary ?? {};
  const prevSummary = (prevData as any)?.summary ?? {};

  const today = todayYmd();
  const presets: HeroPreset[] = [
    { key: "30", label: T("30 يوم", "30 days"), from: addDays(today, -29), to: today },
    { key: "90", label: T("90 يوم", "90 days"), from: addDays(today, -89), to: today },
    { key: "month", label: T("هذا الشهر", "This month"), from: `${today.slice(0, 7)}-01`, to: today },
    { key: "year", label: T("هذه السنة", "This year"), from: `${today.slice(0, 4)}-01-01`, to: today },
  ];
  const activeKey = presets.find((p) => p.from === from && p.to === to)?.key ?? "custom";
  const cmpLabel = T("مقارنة بالفترة السابقة", "vs previous period");

  const total = Number(summary.totalAmount || 0);
  const count = Number(summary.poCount || 0);

  const kpis: KpiItem[] = [
    {
      label: T("إجمالي المشتريات", "Total purchases"),
      value: money(total),
      sub: `${count} ${T("أمر شراء", "PO")}`,
      icon: <ShoppingCart className="h-4 w-4" />,
      tone: "blue",
      change: changePct(total, Number(prevSummary.totalAmount || 0)),
      changeLabel: cmpLabel,
      invert: true,
    },
    {
      label: T("عدد أوامر الشراء", "Purchase orders"),
      value: num(count),
      sub: T("أوامر شراء مسجلة", "Recorded purchase orders"),
      icon: <FileText className="h-4 w-4" />,
      tone: "slate",
      change: changePct(count, Number(prevSummary.poCount || 0)),
      changeLabel: cmpLabel,
    },
    {
      label: T("متوسط قيمة الطلب", "Average order"),
      value: money(count ? total / count : 0),
      sub: T("لكل أمر شراء", "Per purchase order"),
      icon: <Coins className="h-4 w-4" />,
      tone: "teal",
    },
    {
      label: T("الضريبة المشتراة", "Purchase VAT"),
      value: money(rows.reduce((a: number, r: any) => a + Number(r.tax || 0), 0)),
      sub: T("ضريبة القيمة المضافة على المشتريات", "VAT on purchases"),
      icon: <Receipt className="h-4 w-4" />,
      tone: "amber",
    },
  ];

  const { ref, busy, onExcel, onPdf, onPrint } = useReportExport(
    () => ({
      title: `${T("تقرير تحليل المشتريات", "Purchase analysis report")} ${from} — ${to}`,
      subtitle: `${company.name ?? ""} · ${from} — ${to}`,
      fileName: `Purchase-Analysis_${from}_${to}`,
      company,
      kpis,
      chart: {
        title: T("المشتريات حسب الفترة", "Purchases per period"),
        labels: rows.map((r: any) => r.period),
        series: [
          { name: T("المشتريات", "Purchases"), values: rows.map((r: any) => Number(r.total || 0)), color: "#3b82f6" },
        ],
      },
      sheets: [
        {
          name: "Purchase Analysis",
          title: T("تحليل المشتريات", "Purchase analysis"),
          columns: [
            { label: "Period" },
            { label: "Count", numeric: true },
            { label: "Subtotal", numeric: true },
            { label: "Tax", numeric: true },
            { label: "Total", numeric: true },
          ],
          rows: rows.map((r: any) => [
            r.period,
            Number(r.count || 0),
            Number(r.subtotal || 0),
            Number(r.tax || 0),
            Number(r.total || 0),
          ]),
          totals: ["Total", count, "", rows.reduce((a: number, r: any) => a + Number(r.tax || 0), 0), total],
        },
      ],
    }),
    (m) => setError(m),
  );

  return (
    <div className="min-h-full bg-[#eef2f7] p-3 text-slate-900 md:p-5" dir={rtl ? "rtl" : "ltr"}>
      <div ref={ref} className="space-y-4">
        <div data-pdf-section className="space-y-4 rounded-3xl bg-[#eef2f7] p-1">
          <ReportHero
            title={T("تقرير تحليل المشتريات", "Purchase analysis report")}
            subtitle={T("قيمة المشتريات وأوامر الشراء", "Purchase value and purchase orders")}
            periodText={`${from} — ${to}`}
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
            company={company}
            rtl={rtl}
            badge={T("مشتريات", "Purchases")}
            actions={<ExportActions busy={busy} onExcel={onExcel} onPdf={onPdf} onPrint={onPrint} />}
          />
          <KpiGrid items={kpis} />
          <ChartCard
            title={T("المشتريات حسب الفترة", "Purchases per period")}
            subtitle={T("تجميع شهري", "Grouped by month")}
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="period" {...AXIS} />
                <YAxis {...AXIS} width={58} tickFormatter={compactMoney} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#a7f3d0", fontWeight: 700 }}
                  formatter={((value: any, name: any) => [money(value), String(name)]) as any}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total" name={T("المشتريات", "Purchases")} fill="url(#gPo)" radius={[6, 6, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("تفاصيل المشتريات", "Purchase details")}
            subtitle={`${rows.length} ${T("فترة", "periods")}`}
            columns={[
              { label: T("الفترة", "Period") },
              { label: T("العدد", "Count"), numeric: true },
              { label: T("قبل الضريبة", "Subtotal"), numeric: true },
              { label: T("الضريبة", "Tax"), numeric: true },
              { label: T("الإجمالي", "Total"), numeric: true },
            ]}
            rows={rows.map((r: any) => [
              r.period,
              num(r.count),
              money(r.subtotal),
              money(r.tax),
              money(r.total),
            ])}
            totals={[
              T("الإجمالي", "Total"),
              num(count),
              "",
              money(rows.reduce((a: number, r: any) => a + Number(r.tax || 0), 0)),
              money(total),
            ]}
            emptyText={T("لا توجد بيانات", "No data")}
          />
        </div>

        <ReportFooter company={company} generatedAt={new Date().toLocaleString()} />
      </div>
      {error ? <div className="mt-2 text-[12px] font-bold text-rose-600">{error}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stock valuation
// ---------------------------------------------------------------------------

export function SahlValuation() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const company = useCompany(rtl);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const { data } = trpc.reports.inventoryReport.useQuery({});
  const rows = ((data as any)?.rows ?? []) as any[];
  const summary = (data as any)?.summary ?? {};

  const totalValue = Number(summary.totalValue || 0);
  const totalQty = Number(summary.totalQty || 0);
  const top = useMemo(
    () =>
      [...rows]
        .sort((a, b) => Number(b.totalValue || 0) - Number(a.totalValue || 0))
        .slice(0, 10)
        .map((r) => ({ name: r.name || r.sku || "—", value: Number(r.totalValue || 0) })),
    [rows],
  );

  const kpis: KpiItem[] = [
    {
      label: T("قيمة المخزون", "Stock value"),
      value: money(totalValue),
      sub: T("سعر البيع × الكمية", "Sale price × quantity"),
      icon: <Boxes className="h-4 w-4" />,
      tone: "emerald",
    },
    {
      label: T("عدد الأصناف", "Products"),
      value: num(summary.totalProducts ?? rows.length),
      sub: T("صنف في المخزون", "Items in stock"),
      icon: <Package className="h-4 w-4" />,
      tone: "blue",
    },
    {
      label: T("إجمالي الكمية", "Total quantity"),
      value: num(totalQty),
      sub: T("وحدة في المستودع", "Units in the warehouse"),
      icon: <Boxes className="h-4 w-4" />,
      tone: "teal",
    },
    {
      label: T("متوسط قيمة الصنف", "Average item value"),
      value: money(rows.length ? totalValue / rows.length : 0),
      sub: T("قيمة المخزون ÷ الأصناف", "Stock value ÷ items"),
      icon: <Coins className="h-4 w-4" />,
      tone: "amber",
    },
  ];

  const { ref, busy, onExcel, onPdf, onPrint } = useReportExport(
    () => ({
      title: T("تقييم المخزون", "Stock valuation"),
      subtitle: `${company.name ?? ""} · ${todayYmd()}`,
      fileName: `Stock-Valuation_${todayYmd()}`,
      company,
      kpis,
      chart: {
        title: T("أعلى 10 أصناف بالقيمة", "Top 10 items by value"),
        labels: top.map((t) => t.name),
        series: [{ name: T("القيمة", "Value"), values: top.map((t) => t.value), color: "#10b981" }],
      },
      sheets: [
        {
          name: "Stock Valuation",
          title: T("تقييم المخزون", "Stock valuation"),
          columns: [
            { label: "SKU" },
            { label: "Item" },
            { label: "Qty", numeric: true },
            { label: "Avg cost", numeric: true },
            { label: "Sale price", numeric: true },
            { label: "Value", numeric: true },
            { label: "Share %", numeric: true },
          ],
          rows: rows.map((r: any) => [
            r.sku ?? "",
            r.name ?? "",
            Number(r.quantity || 0),
            Number(r.avgCost ?? r.purchasePrice ?? 0),
            Number(r.salePrice || 0),
            Number(r.totalValue || 0),
            totalValue ? Math.round((Number(r.totalValue || 0) / totalValue) * 100) : 0,
          ]),
          totals: ["Total", "", totalQty, "", "", totalValue, 100],
        },
      ],
    }),
    (m) => setError(m),
  );

  return (
    <div className="min-h-full bg-[#eef2f7] p-3 text-slate-900 md:p-5" dir={rtl ? "rtl" : "ltr"}>
      <div ref={ref} className="space-y-4">
        <div data-pdf-section className="space-y-4 rounded-3xl bg-[#eef2f7] p-1">
          <ReportHero
            title={T("تقييم المخزون", "Stock valuation")}
            subtitle={T("قيمة الأصناف المتاحة في المستودع", "Value of the items available in the warehouse")}
            periodText={todayYmd()}
            company={company}
            rtl={rtl}
            badge={T("مخزون", "Stock")}
            actions={
              <ExportActions
                busy={busy}
                onExcel={onExcel}
                onPdf={onPdf}
                onPrint={onPrint}
                extra={
                  <button
                    type="button"
                    onClick={() => navigate("/app/construction/sahl/products")}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12px] font-black text-slate-700 shadow"
                  >
                    {T("الأصناف", "Products")}
                  </button>
                }
              />
            }
          />
          <KpiGrid items={kpis} />
          <ChartCard
            title={T("أعلى 10 أصناف بالقيمة", "Top 10 items by value")}
            subtitle={T("ترتيب تنازلي حسب قيمة المخزون", "Sorted by stock value")}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" {...AXIS} tickFormatter={compactMoney} />
                <YAxis type="category" dataKey="name" {...AXIS} width={140} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#a7f3d0", fontWeight: 700 }}
                  formatter={((value: any) => [money(value), T("القيمة", "Value")]) as any}
                />
                <Bar dataKey="value" name={T("القيمة", "Value")} radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {top.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#047857" : i < 3 ? "#10b981" : "#6ee7b7"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
          <ReportTable
            title={T("تفاصيل الأصناف", "Item details")}
            subtitle={`${rows.length} ${T("صنف", "items")} · ${money(totalValue)}`}
            columns={[
              { label: T("الكود", "SKU") },
              { label: T("الصنف", "Item") },
              { label: T("الكمية", "Qty"), numeric: true },
              { label: T("متوسط التكلفة", "Avg cost"), numeric: true },
              { label: T("سعر البيع", "Sale price"), numeric: true },
              { label: T("القيمة", "Value"), numeric: true },
              { label: T("النسبة %", "Share %"), numeric: true },
            ]}
            rows={rows.map((r: any) => [
              r.sku ?? "",
              r.name ?? "",
              num(r.quantity),
              money(r.avgCost ?? r.purchasePrice),
              money(r.salePrice),
              money(r.totalValue),
              `${totalValue ? Math.round((Number(r.totalValue || 0) / totalValue) * 100) : 0}%`,
            ])}
            totals={[
              T("الإجمالي", "Total"),
              "",
              num(totalQty),
              "",
              "",
              money(totalValue),
              "100%",
            ]}
            emptyText={T("لا توجد بيانات", "No data")}
          />
        </div>

        <ReportFooter company={company} generatedAt={new Date().toLocaleString()} />
      </div>
      {error ? <div className="mt-2 text-[12px] font-bold text-rose-600">{error}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Extra ledgers: tax (VAT), financial (P&L), aging/credit follow-up
// ---------------------------------------------------------------------------

export function SahlMoreReports() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const company = useCompany(rtl);
  const location = useLocation();
  const [tab, setTab] = useState<"tax" | "pnl" | "aging">(() => {
    const q = new URLSearchParams(location.search).get("tab");
    return q === "aging" || q === "pnl" ? q : "tax";
  });
  const [from, setFrom] = useState(() => addDays(todayYmd(), -29));
  const [to, setTo] = useState(() => todayYmd());
  const [error, setError] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("tab");
    if (q === "aging" || q === "pnl" || q === "tax") setTab(q);
  }, [location.key, location.search]);

  const valid = DATE_RE.test(from) && DATE_RE.test(to) && from <= to;
  const span = valid ? daysBetween(from, to) : 0;
  const prevTo = valid ? addDays(from, -1) : "";
  const prevFrom = valid ? addDays(prevTo, -(span - 1)) : "";

  const { data: tax } = trpc.reports.taxReport.useQuery({ from, to }, { enabled: tab === "tax" && valid });
  const { data: prevTax } = trpc.reports.taxReport.useQuery(
    { from: prevFrom, to: prevTo },
    { enabled: tab === "tax" && valid && span > 0 },
  );
  const { data: pnl } = trpc.reports.financialReport.useQuery({ from, to }, { enabled: tab === "pnl" && valid });
  const { data: prevPnl } = trpc.reports.financialReport.useQuery(
    { from: prevFrom, to: prevTo },
    { enabled: tab === "pnl" && valid && span > 0 },
  );
  const { data: aging } = trpc.reports.agingReport.useQuery(undefined, { enabled: tab === "aging" });

  const taxRows = ((tax as any)?.rows ?? []) as any[];
  const taxSummary = (tax as any)?.summary ?? {};
  const prevTaxSummary = (prevTax as any)?.summary ?? {};
  const pnlSummary = (pnl as any)?.summary ?? {};
  const prevPnlSummary = (prevPnl as any)?.summary ?? {};
  const agingRows = ((aging as any)?.rows ?? []) as any[];
  const agingSummary = (aging as any)?.summary ?? {};

  const today = todayYmd();
  const presets: HeroPreset[] = [
    { key: "30", label: T("30 يوم", "30 days"), from: addDays(today, -29), to: today },
    { key: "90", label: T("90 يوم", "90 days"), from: addDays(today, -89), to: today },
    { key: "month", label: T("هذا الشهر", "This month"), from: `${today.slice(0, 7)}-01`, to: today },
    { key: "year", label: T("هذه السنة", "This year"), from: `${today.slice(0, 4)}-01-01`, to: today },
  ];
  const activeKey = presets.find((p) => p.from === from && p.to === to)?.key ?? "custom";
  const cmpLabel = T("مقارنة بالفترة السابقة", "vs previous period");

  // monthly VAT series
  const taxSeries = useMemo(() => {
    const map = new Map<string, number>();
    taxRows.forEach((r) => {
      const key = String(r.date ?? "").slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + Number(r.taxAmount || 0));
    });
    return Array.from(map.entries()).map(([k, v]) => ({
      label: new Date(`${k}-01T12:00:00`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      tax: v,
    }));
  }, [taxRows]);

  const buckets = useMemo(
    () => [
      { label: "0-30", value: agingRows.reduce((a: number, r: any) => a + Number(r.days1to30 || 0), 0) },
      { label: "31-60", value: agingRows.reduce((a: number, r: any) => a + Number(r.days31to60 || 0), 0) },
      { label: "61-90", value: agingRows.reduce((a: number, r: any) => a + Number(r.days61to90 || 0), 0) },
      { label: "90+", value: agingRows.reduce((a: number, r: any) => a + Number(r.days91plus || 0), 0) },
    ],
    [agingRows],
  );

  const over90 = buckets[3]?.value ?? 0;
  const outstanding = Number(agingSummary.totalOutstanding ?? 0);

  const kpis: KpiItem[] = useMemo(() => {
    if (tab === "tax") {
      return [
        {
          label: T("الضريبة (أساس خاضع)", "Taxable base"),
          value: money(taxSummary.totalSubtotal),
          sub: `${taxSummary.count ?? 0} ${T("فاتورة", "invoices")}`,
          icon: <Receipt className="h-4 w-4" />,
          tone: "slate",
          change: changePct(Number(taxSummary.totalSubtotal || 0), Number(prevTaxSummary.totalSubtotal || 0)),
          changeLabel: cmpLabel,
        },
        {
          label: T("ضريبة القيمة المضافة", "VAT collected"),
          value: money(taxSummary.totalTax),
          sub: T("المحصّل من الفواتير", "Collected from invoices"),
          icon: <Coins className="h-4 w-4" />,
          tone: "emerald",
          change: changePct(Number(taxSummary.totalTax || 0), Number(prevTaxSummary.totalTax || 0)),
          changeLabel: cmpLabel,
        },
        {
          label: T("إجمالي الفواتير", "Invoice total"),
          value: money(taxSummary.totalAmount),
          sub: T("قبل وبعد الضريبة", "With and without tax"),
          icon: <TrendingUp className="h-4 w-4" />,
          tone: "teal",
          change: changePct(Number(taxSummary.totalAmount || 0), Number(prevTaxSummary.totalAmount || 0)),
          changeLabel: cmpLabel,
        },
        {
          label: T("متوسط الفاتورة", "Average invoice"),
          value: money(taxSummary.count ? Number(taxSummary.totalAmount || 0) / Number(taxSummary.count) : 0),
          sub: T("لكل فاتورة", "Per invoice"),
          icon: <Coins className="h-4 w-4" />,
          tone: "blue",
        },
      ];
    }
    if (tab === "pnl") {
      return [
        {
          label: T("الإيراد", "Revenue"),
          value: money(pnlSummary.revenue),
          sub: T("إجمالي الإيرادات", "Total revenue"),
          icon: <TrendingUp className="h-4 w-4" />,
          tone: "emerald",
          change: changePct(Number(pnlSummary.revenue || 0), Number(prevPnlSummary.revenue || 0)),
          changeLabel: cmpLabel,
        },
        {
          label: T("تكلفة المبيعات", "Cost of sales"),
          value: money(pnlSummary.cogs),
          sub: T("محتسبة من الحسابات", "From the ledger"),
          icon: <ShoppingCart className="h-4 w-4" />,
          tone: "blue",
          change: changePct(Number(pnlSummary.cogs || 0), Number(prevPnlSummary.cogs || 0)),
          changeLabel: cmpLabel,
          invert: true,
        },
        {
          label: T("المصروفات", "Expenses"),
          value: money(pnlSummary.expenses),
          sub: T("مصاريف الفترة", "Period expenses"),
          icon: <Wallet className="h-4 w-4" />,
          tone: "rose",
          change: changePct(Number(pnlSummary.expenses || 0), Number(prevPnlSummary.expenses || 0)),
          changeLabel: cmpLabel,
          invert: true,
        },
        {
          label: T("صافي الربح", "Net profit"),
          value: money(pnlSummary.netProfit),
          sub: T("الإيراد − التكلفة − المصروفات", "Revenue − COGS − expenses"),
          icon: <Coins className="h-4 w-4" />,
          tone: Number(pnlSummary.netProfit || 0) >= 0 ? "teal" : "rose",
          change: changePct(Number(pnlSummary.netProfit || 0), Number(prevPnlSummary.netProfit || 0)),
          changeLabel: cmpLabel,
        },
      ];
    }
    return [
      {
        label: T("إجمالي المستحق", "Total outstanding"),
        value: money(outstanding),
        sub: `${agingSummary.customerCount ?? 0} ${T("عميل", "customers")}`,
        icon: <Receipt className="h-4 w-4" />,
        tone: "amber",
      },
      {
        label: T("متأخر 90 يوم فأكثر", "Over 90 days"),
        value: money(over90),
        sub: T("ذمم متأخرة", "Overdue receivables"),
        icon: <Coins className="h-4 w-4" />,
        tone: "rose",
      },
      {
        label: T("0 - 30 يوم", "0 - 30 days"),
        value: money(buckets[0]?.value),
        sub: T("ضمن المهلة", "Within terms"),
        icon: <Landmark className="h-4 w-4" />,
        tone: "emerald",
      },
      {
        label: T("31 - 90 يوم", "31 - 90 days"),
        value: money((buckets[1]?.value ?? 0) + (buckets[2]?.value ?? 0)),
        sub: T("متأخر متوسط", "Moderately overdue"),
        icon: <Users className="h-4 w-4" />,
        tone: "blue",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, taxSummary, prevTaxSummary, pnlSummary, prevPnlSummary, buckets, outstanding, over90]);

  const tabTitle =
    tab === "tax"
      ? T("كشف الضريبة", "VAT report")
      : tab === "pnl"
        ? T("الأرباح والخسائر", "P&L report")
        : T("متابعة الآجل", "Credit follow-up");

  const { ref, busy, onExcel, onPdf, onPrint } = useReportExport(
    () => ({
      title: `${tabTitle} ${from} — ${to}`,
      subtitle: `${company.name ?? ""} · ${from} — ${to}`,
      fileName: `${tab === "tax" ? "VAT" : tab === "pnl" ? "PNL" : "Aging"}-Report_${from}_${to}`,
      company,
      kpis,
      chart:
        tab === "tax"
          ? {
              title: T("الضريبة شهرياً", "VAT per month"),
              labels: taxSeries.map((p) => p.label),
              series: [{ name: T("الضريبة", "VAT"), values: taxSeries.map((p) => p.tax), color: "#10b981" }],
            }
          : tab === "pnl"
            ? {
                title: T("الأرباح والخسائر", "P&L"),
                labels: [
                  T("الإيراد", "Revenue"),
                  T("تكلفة المبيعات", "COGS"),
                  T("المصروفات", "Expenses"),
                  T("صافي الربح", "Net profit"),
                ],
                series: [
                  {
                    name: T("القيمة", "Value"),
                    values: [
                      Number(pnlSummary.revenue || 0),
                      Number(pnlSummary.cogs || 0),
                      Number(pnlSummary.expenses || 0),
                      Number(pnlSummary.netProfit || 0),
                    ],
                    color: "#10b981",
                  },
                ],
              }
            : {
                title: T("توزيع الذمم", "Receivables aging"),
                labels: buckets.map((b) => b.label),
                series: [{ name: T("المبلغ", "Amount"), values: buckets.map((b) => b.value), color: "#e11d48" }],
              },
      sheets:
        tab === "tax"
          ? [
              {
                name: "VAT Report",
                title: T("كشف الضريبة", "VAT report"),
                columns: [
                  { label: "No." },
                  { label: "Date" },
                  { label: "Subtotal", numeric: true },
                  { label: "Tax %", numeric: true },
                  { label: "Tax", numeric: true },
                  { label: "Total", numeric: true },
                  { label: "Status" },
                ],
                rows: taxRows.map((r: any) => [
                  r.invoiceNumber ?? "",
                  String(r.date ?? "").slice(0, 10),
                  Number(r.subtotal || 0),
                  Number(r.taxPercent || 0),
                  Number(r.taxAmount || 0),
                  Number(r.totalAmount || 0),
                  r.status ?? "",
                ]),
                totals: [
                  "Total",
                  "",
                  Number(taxSummary.totalSubtotal || 0),
                  "",
                  Number(taxSummary.totalTax || 0),
                  Number(taxSummary.totalAmount || 0),
                  "",
                ],
              },
            ]
          : tab === "pnl"
            ? [
                {
                  name: "P&L",
                  title: T("الأرباح والخسائر", "P&L report"),
                  columns: [
                    { label: T("البند", "Item") },
                    { label: T("القيمة", "Value"), numeric: true },
                  ],
                  rows: Object.entries(pnlSummary).map(([k, v]) => [k, Number(v || 0)]),
                },
              ]
            : [
                {
                  name: "Aging",
                  title: T("متابعة الآجل", "Credit follow-up"),
                  columns: [
                    { label: "Customer" },
                    { label: "Total", numeric: true },
                    { label: "0-30", numeric: true },
                    { label: "31-60", numeric: true },
                    { label: "61-90", numeric: true },
                    { label: "90+", numeric: true },
                  ],
                  rows: agingRows.map((r: any) => [
                    r.customerName ?? "",
                    Number(r.total || 0),
                    Number(r.days1to30 || 0),
                    Number(r.days31to60 || 0),
                    Number(r.days61to90 || 0),
                    Number(r.days91plus || 0),
                  ]),
                  totals: ["Total", outstanding, buckets[0]?.value ?? 0, buckets[1]?.value ?? 0, buckets[2]?.value ?? 0, buckets[3]?.value ?? 0],
                },
              ],
    }),
    (m) => setError(m),
  );

  return (
    <div className="min-h-full bg-[#eef2f7] p-3 text-slate-900 md:p-5" dir={rtl ? "rtl" : "ltr"}>
      <div ref={ref} className="space-y-4">
        <div data-pdf-section className="space-y-4 rounded-3xl bg-[#eef2f7] p-1">
          <ReportHero
            title={tabTitle}
            subtitle={
              tab === "tax"
                ? T("ضريبة القيمة المضافة على الفواتير", "Value added tax on invoices")
                : tab === "pnl"
                  ? T("ملخص الإيرادات والتكاليف والأرباح", "Revenue, costs and profit summary")
                  : T("ذمم العملاء حسب عمر التأخير", "Customer receivables by age")
            }
            periodText={tab === "aging" ? todayYmd() : `${from} — ${to}`}
            from={from}
            to={to}
            onFrom={tab === "aging" ? undefined : setFrom}
            onTo={tab === "aging" ? undefined : setTo}
            presets={tab === "aging" ? undefined : presets}
            activeKey={activeKey}
            onPreset={(p) => {
              setFrom(p.from);
              setTo(p.to);
            }}
            company={company}
            rtl={rtl}
            badge={tab === "tax" ? T("ضريبة", "VAT") : tab === "pnl" ? T("أرباح", "P&L") : T("آجل", "Aging")}
            actions={
              <ExportActions
                busy={busy}
                onExcel={onExcel}
                onPdf={onPdf}
                onPrint={onPrint}
                extra={
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(["tax", "pnl", "aging"] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setTab(k)}
                        className="rounded-xl border px-3 py-2 text-[12px] font-black transition"
                        style={
                          tab === k
                            ? { background: "linear-gradient(135deg,#047857,#10b981)", borderColor: "#34d399", color: "#04140f" }
                            : { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.25)", color: "#e2e8f0" }
                        }
                      >
                        {k === "tax" ? T("الضريبة", "VAT") : k === "pnl" ? T("الأرباح", "P&L") : T("الآجل", "Aging")}
                      </button>
                    ))}
                  </div>
                }
              />
            }
          />
          <KpiGrid items={kpis} />

          <ChartCard
            title={
              tab === "tax"
                ? T("الضريبة شهرياً", "VAT per month")
                : tab === "pnl"
                  ? T("الإيراد والتكلفة والصافي", "Revenue, cost and net")
                  : T("توزيع الذمم حسب العمر", "Receivables aging")
            }
            subtitle={T("ملخص رسومي للفترة", "Visual summary of the period")}
            height={280}
          >
            {tab === "tax" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxSeries} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gVat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="label" {...AXIS} />
                  <YAxis {...AXIS} width={58} tickFormatter={compactMoney} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: "#a7f3d0", fontWeight: 700 }}
                    formatter={((value: any) => [money(value), T("الضريبة", "VAT")]) as any}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="tax" name={T("الضريبة", "VAT")} fill="url(#gVat)" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            ) : tab === "pnl" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: T("الإيراد", "Revenue"), value: Number(pnlSummary.revenue || 0) },
                    { name: T("تكلفة المبيعات", "COGS"), value: Number(pnlSummary.cogs || 0) },
                    { name: T("المصروفات", "Expenses"), value: Number(pnlSummary.expenses || 0) },
                    { name: T("صافي الربح", "Net profit"), value: Number(pnlSummary.netProfit || 0) },
                  ]}
                  margin={{ top: 6, right: 10, left: -14, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="name" {...AXIS} />
                  <YAxis {...AXIS} width={58} tickFormatter={compactMoney} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: "#a7f3d0", fontWeight: 700 }}
                    formatter={((value: any) => [money(value), T("القيمة", "Value")]) as any}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="value" name={T("القيمة", "Value")} fill="url(#gPnl)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gAge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fda4af" />
                      <stop offset="100%" stopColor="#be123c" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="label" {...AXIS} />
                  <YAxis {...AXIS} width={58} tickFormatter={compactMoney} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: "#a7f3d0", fontWeight: 700 }}
                    formatter={((value: any) => [money(value), T("المبلغ", "Amount")]) as any}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="value" name={T("المبلغ", "Amount")} fill="url(#gAge)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {tab === "tax" && (
          <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
            <ReportTable
              title={T("تفاصيل الضريبة", "VAT details")}
              subtitle={`${taxRows.length} ${T("فاتورة", "invoices")}`}
              columns={[
                { label: T("الرقم", "No.") },
                { label: T("التاريخ", "Date") },
                { label: T("قبل الضريبة", "Subtotal"), numeric: true },
                { label: T("نسبة الضريبة %", "Tax %"), numeric: true },
                { label: T("الضريبة", "Tax"), numeric: true },
                { label: T("الإجمالي", "Total"), numeric: true },
                { label: T("الحالة", "Status") },
              ]}
              rows={taxRows.map((r: any) => [
                r.invoiceNumber ?? "",
                String(r.date ?? "").slice(0, 10),
                money(r.subtotal),
                `${Number(r.taxPercent || 0)}%`,
                money(r.taxAmount),
                money(r.totalAmount),
                r.status ?? "—",
              ])}
              totals={[
                T("الإجمالي", "Total"),
                "",
                money(taxSummary.totalSubtotal),
                "",
                money(taxSummary.totalTax),
                money(taxSummary.totalAmount),
                "",
              ]}
              emptyText={T("لا توجد بيانات", "No data")}
            />
          </div>
        )}

        {tab === "pnl" && (
          <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
            <ReportTable
              title={T("بنود الأرباح والخسائر", "P&L lines")}
              subtitle={T("من دفتر الأستاذ", "From the ledger")}
              columns={[
                { label: T("البند", "Item") },
                { label: T("القيمة", "Value"), numeric: true },
              ]}
              rows={Object.entries(pnlSummary).map(([k, v]) => [k, money(v)])}
              totals={[T("صافي الربح", "Net profit"), money(pnlSummary.netProfit)]}
              emptyText={T("لا توجد بيانات", "No data")}
            />
          </div>
        )}

        {tab === "aging" && (
          <div data-pdf-section className="rounded-3xl bg-[#eef2f7] p-1">
            <ReportTable
              title={T("متابعة آجل العملاء", "Customer credit follow-up")}
              subtitle={`${agingRows.length} ${T("عميل", "customers")} · ${money(outstanding)}`}
              columns={[
                { label: T("العميل", "Customer") },
                { label: T("الإجمالي", "Total"), numeric: true },
                { label: "0-30", numeric: true },
                { label: "31-60", numeric: true },
                { label: "61-90", numeric: true },
                { label: "90+", numeric: true },
              ]}
              rows={agingRows.map((r: any) => [
                r.customerName ?? "",
                money(r.total),
                money(r.days1to30),
                money(r.days31to60),
                money(r.days61to90),
                money(r.days91plus),
              ])}
              totals={[
                T("الإجمالي", "Total"),
                money(outstanding),
                money(buckets[0]?.value),
                money(buckets[1]?.value),
                money(buckets[2]?.value),
                money(buckets[3]?.value),
              ]}
              emptyText={T("لا توجد ذمم", "Nothing outstanding")}
            />
          </div>
        )}

        <ReportFooter company={company} generatedAt={new Date().toLocaleString()} />
      </div>
      {error ? <div className="mt-2 text-[12px] font-bold text-rose-600">{error}</div> : null}
    </div>
  );
}
