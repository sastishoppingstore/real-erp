import { useState } from "react";
import {
  ChartColumn, FileText, Receipt, Building2, Package, Users, ShieldCheck,
  Download, Printer, TrendingUp, Wallet, Boxes, AlertTriangle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, num, PageHeader, Kpi, TabBar, useTab,
  exportCsv, printReport, type Tone,
} from "./shared";

type Card = {
  key: string;
  en: string;
  ar: string;
  descEn: string;
  descAr: string;
  icon: any;
  tone: Tone;
  run: "csv" | "pdf";
  build: () => { head: string[]; rows: (string | number)[] } | null;
  pdfTitles?: { en: string; ar: string };
};

export default function DecorationReports() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("finance");
  const [note, setNote] = useState<string>("");

  const invoicesQ = trpc.decoration.invoiceList.useQuery();
  const contractsQ = trpc.decoration.contractList.useQuery();
  const variationsQ = trpc.decoration.variationList.useQuery();
  const receiptsQ = trpc.decoration.receiptList.useQuery();
  const paymentsQ = trpc.decoration.paymentList.useQuery();
  const projectsQ = trpc.decoration.projectList.useQuery();
  const poQ = trpc.decoration.purchaseOrderList.useQuery();
  const mrQ = trpc.decoration.materialRequestList.useQuery();
  const movesQ = trpc.decoration.stockMoveList.useQuery();
  const materialsQ = trpc.decoration.materialList.useQuery();
  const timesheetsQ = trpc.decoration.timesheetList.useQuery();
  const labourQ = trpc.decoration.labourList.useQuery();
  const payrollQ = trpc.decoration.payrollRunList.useQuery();
  const snagsQ = trpc.decoration.snagList.useQuery();
  const incidentsQ = trpc.decoration.incidentList.useQuery();
  const ipcQ = trpc.decoration.ipcList.useQuery();
  const retentionQ = trpc.decoration.retentionList.useQuery();

  const invoices = invoicesQ.data ?? [];
  const contracts = contractsQ.data ?? [];
  const variations = variationsQ.data ?? [];
  const receipts = receiptsQ.data ?? [];
  const payments = paymentsQ.data ?? [];
  const projects = projectsQ.data ?? [];
  const pos = poQ.data ?? [];
  const mrs = mrQ.data ?? [];
  const moves = movesQ.data ?? [];
  const materials = materialsQ.data ?? [];
  const timesheets = timesheetsQ.data ?? [];
  const labour = labourQ.data ?? [];
  const payroll = payrollQ.data ?? [];
  const snags = snagsQ.data ?? [];
  const incidents = incidentsQ.data ?? [];
  const ipcs = ipcQ.data ?? [];
  const retentions = retentionQ.data ?? [];

  const projectCode = (id: any) => projects.find((p: any) => p.id === Number(id))?.projectCode ?? "—";

  const finance: Card[] = [
    {
      key: "invoice-register", en: "Invoice register", ar: "سجل الفواتير",
      descEn: "All invoices with VAT, paid and balance", descAr: "كل الفواتير مع الضريبة والمدفوع والرصيد",
      icon: Receipt, tone: "emerald", run: "csv",
      build: () => ({
        head: ["Invoice", "Date", "Project", "Net", "VAT", "Total", "Paid", "Balance", "Status"],
        rows: invoices.map((r: any) => [r.invoiceNo, r.invoiceDate, projectCode(r.projectId), r.subtotal, r.vatAmount, r.totalAmount, r.paidAmount, r.balanceDue, r.status]),
      }),
      pdfTitles: { en: "Invoice Register", ar: "سجل الفواتير" },
    },
    {
      key: "receivables-aging", en: "Receivables ageing", ar: "أعمار المستحقات",
      descEn: "Outstanding balance per invoice", descAr: "الرصيد المستحق لكل فاتورة",
      icon: TrendingUp, tone: "brass", run: "pdf",
      build: () => ({
        head: ["Invoice", "Date", "Due date", "Total", "Balance", "Status"],
        rows: invoices.filter((r: any) => Number(r.balanceDue ?? 0) > 0).map((r: any) => [r.invoiceNo, r.invoiceDate, r.dueDate ?? "", money(r.totalAmount), money(r.balanceDue), r.status]),
      }),
      pdfTitles: { en: "Receivables Ageing", ar: "أعمار المستحقات" },
    },
    {
      key: "contract-register", en: "Contract register", ar: "سجل العقود",
      descEn: "Contract value, advance and retention", descAr: "قيمة العقد والدفعة المقدمة والمحتجز",
      icon: FileText, tone: "sky", run: "pdf",
      build: () => ({
        head: ["Contract", "Project", "Value", "Advance %", "Retention %", "Status"],
        rows: contracts.map((r: any) => [r.contractNo, projectCode(r.projectId), money(r.contractValue), num(r.advancePercent), num(r.retentionPercent), r.status]),
      }),
      pdfTitles: { en: "Contract Register", ar: "سجل العقود" },
    },
    {
      key: "variation-register", en: "Variation orders", ar: "الأوامر التغييرية",
      descEn: "Additions, omissions and amounts", descAr: "الإضافات والحذف والمبالغ",
      icon: FileText, tone: "violet", run: "csv",
      build: () => ({
        head: ["VO", "Project", "Type", "Amount", "Status"],
        rows: variations.map((r: any) => [r.voNo ?? "", projectCode(r.projectId), r.variationType, r.amount, r.status]),
      }),
      pdfTitles: { en: "Variation Orders", ar: "الأوامر التغييرية" },
    },
    {
      key: "retention", en: "Retention register", ar: "سجل المحتجزات",
      descEn: "Retention withheld and released", descAr: "المحتجز والمنفرج عنه",
      icon: Wallet, tone: "indigo", run: "csv",
      build: () => ({
        head: ["Project", "Invoice", "Held", "Released", "Status"],
        rows: retentions.map((r: any) => [projectCode(r.projectId), r.invoiceId ?? "", money(r.amount), money(r.releasedAmount), r.status]),
      }),
      pdfTitles: { en: "Retention Register", ar: "سجل المحتجزات" },
    },
    {
      key: "ipc-register", en: "IPC / progress certificates", ar: "المستخلصات",
      descEn: "Certified progress per period", descAr: "التقدم المعتمد لكل فترة",
      icon: Receipt, tone: "teal", run: "csv",
      build: () => ({
        head: ["IPC", "Project", "Period", "Work done", "Retention", "Net", "Status"],
        rows: ipcs.map((r: any) => [r.ipcNo ?? "", projectCode(r.projectId), `${r.periodFrom ?? ""} → ${r.periodTo ?? ""}`, money(r.workDoneValue), money(r.retentionAmount), money(r.netPayable), r.status]),
      }),
      pdfTitles: { en: "IPC Register", ar: "سجل المستخلصات" },
    },
    {
      key: "cash-flow", en: "Cash receipts & payments", ar: "المقبوضات والمدفوعات",
      descEn: "Collections vs payments", descAr: "التحصيلات مقابل المدفوعات",
      icon: Wallet, tone: "emerald", run: "pdf",
      build: () => ({
        head: ["Type", "Date", "Reference", "Amount", "Status"],
        rows: [
          ...receipts.map((r: any) => ["Receipt", r.receiptDate ?? "", r.receiptNo ?? "", money(r.amount), r.status]),
          ...payments.map((r: any) => ["Payment", r.paymentDate ?? "", r.paymentNo ?? "", money(r.amount), r.status]),
        ],
      }),
      pdfTitles: { en: "Cash Receipts & Payments", ar: "المقبوضات والمدفوعات" },
    },
  ];

  const projectReports: Card[] = [
    {
      key: "project-register", en: "Project register", ar: "سجل المشاريع",
      descEn: "Status, contract value and progress", descAr: "الحالة وقيمة العقد والتقدم",
      icon: Building2, tone: "emerald", run: "csv",
      build: () => ({
        head: ["Code", "Name", "Client", "Contract value", "Progress %", "Status"],
        rows: projects.map((r: any) => [r.projectCode, r.nameEn, r.clientId ?? "", money(r.contractValue), num(r.progress), r.status]),
      }),
      pdfTitles: { en: "Project Register", ar: "سجل المشاريع" },
    },
    {
      key: "project-cost", en: "Project cost report", ar: "تقرير تكلفة المشروع",
      descEn: "Material, labour and invoiced per project", descAr: "المواد والعمالة والمفوتر لكل مشروع",
      icon: ChartColumn, tone: "brass", run: "pdf",
      build: () => {
        const rows = projects.map((p: any) => {
          const mat = moves.filter((m: any) => Number(m.projectId) === p.id).reduce((s: number, m: any) => s + Number(m.totalCost ?? 0), 0);
          const lab = timesheets.filter((t: any) => Number(t.projectId) === p.id).reduce((s: number, t: any) => s + Number(t.hours ?? 0) * Number(t.ratePerHour ?? 0), 0);
          const inv = invoices.filter((i: any) => Number(i.projectId) === p.id).reduce((s: number, i: any) => s + Number(i.totalAmount ?? 0), 0);
          return [p.projectCode, money(mat), money(lab), money(mat + lab), money(inv), money(inv - (mat + lab))];
        });
        return { head: ["Project", "Material", "Labour", "Total cost", "Invoiced", "Margin"], rows };
      },
      pdfTitles: { en: "Project Cost Report", ar: "تقرير تكلفة المشروع" },
    },
    {
      key: "progress", en: "Progress summary", ar: "ملخص التقدم",
      descEn: "Completion percentage per project", descAr: "نسبة الإنجاز لكل مشروع",
      icon: TrendingUp, tone: "sky", run: "csv",
      build: () => ({
        head: ["Project", "Progress %", "Status"],
        rows: projects.map((r: any) => [r.projectCode, num(r.progress), r.status]),
      }),
      pdfTitles: { en: "Progress Summary", ar: "ملخص التقدم" },
    },
  ];

  const procurement: Card[] = [
    {
      key: "mr-register", en: "Material requests", ar: "طلبات المواد",
      descEn: "Requested, approved and pending", descAr: "المطلوب والمعتمد والمعلق",
      icon: Package, tone: "sky", run: "csv",
      build: () => ({
        head: ["MR", "Project", "Date", "Status"],
        rows: mrs.map((r: any) => [r.mrNo ?? "", projectCode(r.projectId), r.requestDate ?? "", r.status]),
      }),
      pdfTitles: { en: "Material Requests", ar: "طلبات المواد" },
    },
    {
      key: "po-register", en: "Purchase orders", ar: "أوامر الشراء",
      descEn: "Supplier, value and status", descAr: "المورد والقيمة والحالة",
      icon: Package, tone: "indigo", run: "csv",
      build: () => ({
        head: ["PO", "Project", "Supplier", "Value", "Status"],
        rows: pos.map((r: any) => [r.poNo ?? "", projectCode(r.projectId), r.supplierId ?? "", money(r.totalAmount), r.status]),
      }),
      pdfTitles: { en: "Purchase Orders", ar: "أوامر الشراء" },
    },
    {
      key: "stock-valuation", en: "Stock valuation", ar: "تقييم المخزون",
      descEn: "Quantity and average cost per material", descAr: "الكمية ومتوسط التكلفة لكل مادة",
      icon: Boxes, tone: "teal", run: "pdf",
      build: () => ({
        head: ["Code", "Material", "UOM", "Stock qty", "Unit cost", "Value"],
        rows: materials.map((m: any) => {
          const qty = moves
            .filter((x: any) => Number(x.materialId) === m.id)
            .reduce((s: number, x: any) => {
              const q = Number(x.quantity ?? 0);
              return ["in", "return", "adjust"].includes(x.moveType) ? s + q : ["out", "scrap"].includes(x.moveType) ? s - q : s;
            }, 0);
          return [m.code, m.nameEn, m.uom ?? "", num(qty), money(m.avgCost), money(qty * Number(m.avgCost ?? 0))];
        }),
      }),
      pdfTitles: { en: "Stock Valuation", ar: "تقييم المخزون" },
    },
    {
      key: "stock-moves", en: "Stock movements", ar: "حركة المخزون",
      descEn: "In / out / transfer history", descAr: "سجل الإدخال والإخراج والتحويل",
      icon: Boxes, tone: "slate", run: "csv",
      build: () => ({
        head: ["Date", "Project", "Type", "Qty", "Cost"],
        rows: moves.map((r: any) => [r.moveDate ?? "", projectCode(r.projectId), r.moveType, num(r.quantity), money(r.totalCost)]),
      }),
      pdfTitles: { en: "Stock Movements", ar: "حركة المخزون" },
    },
  ];

  const labourReports: Card[] = [
    {
      key: "labour-register", en: "Labour register", ar: "سجل العمالة",
      descEn: "Workers, profession and rates", descAr: "العمال والمهن والأجور",
      icon: Users, tone: "teal", run: "csv",
      build: () => ({
        head: ["Code", "Name", "Profession", "Basic salary", "Status"],
        rows: labour.map((r: any) => [r.code ?? r.id, r.nameEn, r.profession ?? "", money(r.dailyRate), r.isActive === false ? "inactive" : "active"]),
      }),
      pdfTitles: { en: "Labour Register", ar: "سجل العمالة" },
    },
    {
      key: "timesheet-summary", en: "Timesheet summary", ar: "ملخص كشوف الأوقات",
      descEn: "Hours and overtime per project", descAr: "الساعات والإضافي لكل مشروع",
      icon: Users, tone: "emerald", run: "pdf",
      build: () => ({
        head: ["Project", "Hours", "Overtime", "Cost"],
        rows: projects.map((p: any) => {
          const rows = timesheets.filter((t: any) => Number(t.projectId) === p.id);
          return [p.projectCode, num(rows.reduce((s: number, t: any) => s + Number(t.hours ?? 0), 0)), num(rows.reduce((s: number, t: any) => s + Number(t.overtimeHours ?? 0), 0)), money(rows.reduce((s: number, t: any) => s + Number(t.hours ?? 0) * Number(t.ratePerHour ?? 0), 0))];
        }),
      }),
      pdfTitles: { en: "Timesheet Summary", ar: "ملخص كشوف الأوقات" },
    },
    {
      key: "payroll-summary", en: "Payroll summary", ar: "ملخص الرواتب",
      descEn: "Gross, deductions and net per run", descAr: "الإجمالي والخصومات والصافي لكل مسير",
      icon: Wallet, tone: "brass", run: "csv",
      build: () => ({
        head: ["Period", "Run", "Gross", "Deductions", "Net", "Status"],
        rows: payroll.map((r: any) => [`${r.periodMonth}/${r.periodYear}`, r.runNo ?? "", money(r.totalGross), money(r.totalDeductions), money(r.totalNet), r.status]),
      }),
      pdfTitles: { en: "Payroll Summary", ar: "ملخص الرواتب" },
    },
  ];

  const qualityReports: Card[] = [
    {
      key: "snag-register", en: "Snag register", ar: "سجل الملاحظات",
      descEn: "Open and closed snags by severity", descAr: "الملاحظات المفتوحة والمغلقة حسب الأهمية",
      icon: AlertTriangle, tone: "rose", run: "csv",
      build: () => ({
        head: ["Snag", "Project", "Severity", "Status"],
        rows: snags.map((r: any) => [r.titleEn, projectCode(r.projectId), r.severity, r.status]),
      }),
      pdfTitles: { en: "Snag Register", ar: "سجل الملاحظات" },
    },
    {
      key: "hse-register", en: "HSE incident register", ar: "سجل حوادث السلامة",
      descEn: "Incidents, severity and lost days", descAr: "الحوادث والأهمية وأيام الفقد",
      icon: ShieldCheck, tone: "violet", run: "pdf",
      build: () => ({
        head: ["Date", "Project", "Type", "Severity", "Lost days", "Status"],
        rows: incidents.map((r: any) => [r.incidentDate ?? "", projectCode(r.projectId), r.incidentType ?? "", r.severity ?? "", num(r.lostDays), r.status]),
      }),
      pdfTitles: { en: "HSE Incident Register", ar: "سجل حوادث السلامة" },
    },
  ];

  const tabCards: Record<string, Card[]> = {
    finance, projects: projectReports, procurement, labour: labourReports, quality: qualityReports,
  };
  const cards = tabCards[tab] ?? finance;

  const run = (c: Card) => {
    const built = c.build();
    if (!built) return;
    if (c.run === "csv") {
      exportCsv(`decoration-${c.key}`, built.head, built.rows);
      setNote(`${L("Downloaded", "تم تنزيل")} ${L(c.en, c.ar)}.csv`);
    } else {
      printReport({
        titleEn: c.pdfTitles?.en ?? c.en,
        titleAr: c.pdfTitles?.ar ?? c.ar,
        rtl: isAr,
        head: built.head,
        rows: built.rows,
        footerNote: L("Decoration & Construction — Reports", "الديكور والإنشاءات — التقارير"),
      });
      setNote(`${L("Print dialog opened for", "تم فتح الطباعة لـ")} ${L(c.en, c.ar)}`);
    }
  };

  const totalCards = Object.values(tabCards).reduce((n, a) => n + a.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Reports Hub", "مركز التقارير")}
        subtitle={L(
          "Every operational and financial report in one place — export to Excel (CSV) or print-ready AR/EN PDF with the company letterhead.",
          "كل التقارير التشغيلية والمالية في مكان واحد — تصدير إلى Excel (CSV) أو PDF جاهز للطباعة بالعربي والإنجليزي مع ترويسة الشركة.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Report library", "مكتبة التقارير")} value={totalCards} icon={<ChartColumn className="h-5 w-5" />} tone="indigo" />
        <Kpi label={L("Invoices", "الفواتير")} value={invoices.length} icon={<Receipt className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Projects", "المشاريع")} value={projects.length} icon={<Building2 className="h-5 w-5" />} tone="sky" />
        <Kpi label={L("Snags open", "ملاحظات مفتوحة")} value={snags.filter((s: any) => s.status === "open").length} icon={<AlertTriangle className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "finance", label: L("Finance", "المالية"), badge: finance.length },
            { key: "projects", label: L("Projects", "المشاريع"), badge: projectReports.length },
            { key: "procurement", label: L("Procurement & stores", "المشتريات والمخازن"), badge: procurement.length },
            { key: "labour", label: L("Labour", "العمالة"), badge: labourReports.length },
            { key: "quality", label: L("Quality & HSE", "الجودة والسلامة"), badge: qualityReports.length },
          ]}
        />
        {note ? <span className="text-xs font-medium text-emerald-700">{note}</span> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="group flex flex-col rounded-2xl border border-[#e6e1d6] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                  c.tone === "brass" ? "from-amber-500 to-amber-700"
                    : c.tone === "sky" ? "from-sky-500 to-sky-700"
                      : c.tone === "violet" ? "from-violet-500 to-violet-700"
                        : c.tone === "rose" ? "from-rose-500 to-rose-700"
                          : c.tone === "teal" ? "from-teal-500 to-teal-700"
                            : c.tone === "indigo" ? "from-indigo-500 to-indigo-700"
                              : c.tone === "slate" ? "from-slate-500 to-slate-700"
                                : "from-emerald-600 to-emerald-800"
                } text-white shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#10231c]">{L(c.en, c.ar)}</h3>
                  <p className="text-[11px] text-slate-500">{L(c.descEn, c.descAr)}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => run(c)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e6e1d6] bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-500 hover:text-amber-700"
                >
                  {c.run === "csv" ? <Download className="h-3.5 w-3.5" /> : <Printer className="h-3.5 w-3.5" />}
                  {c.run === "csv" ? "Excel" : "PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const built = c.build();
                    if (!built) return;
                    printReport({
                      titleEn: c.pdfTitles?.en ?? c.en,
                      titleAr: c.pdfTitles?.ar ?? c.ar,
                      rtl: isAr,
                      head: built.head,
                      rows: built.rows,
                      footerNote: L("Decoration & Construction — Reports", "الديكور والإنشاءات — التقارير"),
                    });
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e6e1d6] bg-[#fbfaf7] px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-amber-700"
                  title={L("Print as PDF", "طباعة PDF")}
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        {L(
          "Column widths, VAT totals and Hijri/Gregorian dates are resolved at print time, so the same report prints cleanly in Arabic and English.",
          "تُحدد عروض الأعمدة وإجماليات الضريبة والتواريخ الهجرية/الميلادية عند الطباعة، لذا يُطبع التقرير نفسه بوضوح بالعربية والإنجليزية.",
        )}
      </p>
    </div>
  );
}