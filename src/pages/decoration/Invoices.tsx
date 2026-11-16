import { useMemo, useState } from "react";
import { Receipt, Plus, Search, CircleDollarSign, AlertTriangle, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, StatusPill, PageHeader, Panel, DataTable, Kpi, exportCsv, type Column,
} from "./shared";
import { QuickInvoiceDialog, InvoiceActions } from "./QuickInvoice";

const ZATCA_TONE: Record<string, string> = {
  cleared: "text-emerald-700",
  reported: "text-sky-700",
  rejected: "text-rose-700",
  warning: "text-amber-700",
  pending: "text-slate-500",
};

export default function DecorationInvoices() {
  const { L } = useDeco();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const invoicesQ = trpc.decoration.invoiceList.useQuery(undefined);
  const dashQ = trpc.decoration.decorationDashboard.useQuery(undefined);

  const rows = useMemo(() => {
    const list = (invoicesQ.data ?? []) as any[];
    return list.filter((inv) => {
      const okQ = !q || `${inv.invoiceNo} ${inv.billingType} ${inv.status}`.toLowerCase().includes(q.toLowerCase());
      const okS = !status || inv.status === status;
      return okQ && okS;
    });
  }, [invoicesQ.data, q, status]);

  const columns: Column[] = [
    {
      key: "invoiceNo", en: "Invoice", ar: "الفاتورة",
      render: (r) => (
        <div>
          <div className="font-mono text-xs font-semibold text-slate-800">{r.invoiceNo}</div>
          <div className="text-[11px] text-slate-400">{String(r.billingType).replace(/_/g, " ")}</div>
        </div>
      ),
    },
    {
      key: "invoiceDate", en: "Date", ar: "التاريخ",
      render: (r) => (
        <div>
          <div>{r.invoiceDate}</div>
          <div className="text-[11px] text-slate-400">{L("due", "الاستحقاق")} {r.dueDate ?? "—"}</div>
        </div>
      ),
    },
    { key: "subtotal", en: "Subtotal", ar: "المجموع", render: (r) => money(r.subtotal) },
    { key: "vatAmount", en: "VAT", ar: "الضريبة", render: (r) => money(r.vatAmount) },
    { key: "totalAmount", en: "Total", ar: "الإجمالي", render: (r) => <span className="font-semibold">{money(r.totalAmount)}</span> },
    { key: "balanceDue", en: "Balance", ar: "الرصيد", render: (r) => <span className="text-rose-700">{money(r.balanceDue)}</span> },
    {
      key: "zatcaStatus", en: "ZATCA", ar: "زاتكا",
      render: (r) => (
        <span className={`inline-flex items-center gap-1 text-xs ${ZATCA_TONE[String(r.zatcaStatus)] ?? "text-slate-500"}`}>
          <BadgeCheck className="h-3.5 w-3.5" />{r.zatcaStatus}
        </span>
      ),
    },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
    {
      key: "actions", en: "PDF / Excel / XML", ar: "PDF / Excel / XML",
      render: (r) => <InvoiceActions invoiceId={r.id} compact />,
    },
  ];

  const onExport = () => {
    exportCsv(
      `decoration-invoices-${new Date().toISOString().slice(0, 10)}`,
      ["Invoice", "Type", "Date", "Due", "Subtotal", "VAT", "Total", "Paid", "Balance", "Status", "ZATCA"],
      rows.map((r) => [
        r.invoiceNo, r.billingType, r.invoiceDate, r.dueDate ?? "", r.subtotal, r.vatAmount,
        r.totalAmount, r.paidAmount, r.balanceDue, r.status, r.zatcaStatus ?? "",
      ]),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Billing & Invoices", "الفوترة والفواتير")}
        subtitle={L(
          "ZATCA Phase-2 tax & simplified invoices with PDF, Excel and UBL XML output — retention, advance recovery and penalties included.",
          "فواتير ضريبية ومبسطة متوافقة مع زاتكا (المرحلة الثانية) مع تصدير PDF وExcel وXML — مع المحتجزات واسترداد الدفعات المقدمة والغرامات.",
        )}
        action={
          <QuickInvoiceDialog
            trigger={
              <Button className="bg-emerald-700 hover:bg-emerald-800">
                <Plus className="me-2 h-4 w-4" />{L("New invoice", "فاتورة جديدة")}
              </Button>
            }
            onCreated={() => invoicesQ.refetch()}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Invoiced", "المفوتر")} value={money(dashQ.data?.invoiced)} icon={<Receipt className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Collected", "المحصّل")} value={money(dashQ.data?.collected)} icon={<CircleDollarSign className="h-5 w-5" />} tone="sky" />
        <Kpi label={L("Receivables", "المستحقات")} value={money(dashQ.data?.receivables)} icon={<CircleDollarSign className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Overdue invoices", "فواتير متأخرة")} value={dashQ.data?.overdueInvoices ?? 0} icon={<AlertTriangle className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input className="ps-9 sm:w-72" placeholder={L("Search invoices…", "بحث في الفواتير…")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{L("All statuses", "كل الحالات")}</option>
          {["draft", "submitted", "cleared", "reported", "approved", "partially_paid", "paid", "overdue", "cancelled"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500">{rows.length} {L("invoices", "فاتورة")}</span>
        <Button variant="outline" size="sm" className="ms-auto" onClick={onExport}>
          {L("Export Excel", "تصدير Excel")}
        </Button>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          loading={invoicesQ.isLoading}
          empty={L("No invoices yet — create the first one from the button above.", "لا توجد فواتير بعد — أنشئ الأولى من الزر أعلاه.")}
        />
      </Panel>

      <p className="text-xs text-slate-400">
        {L(
          "PDF is generated through the browser print engine (letterhead, ZATCA QR, UUID and SHA-256 hash are embedded). Excel embeds the same QR. XML is UBL 2.1 ready for the ZATCA portal or middleware.",
          "يتم إنشاء PDF عبر محرك الطباعة في المتصفح (ترويسة رسمية ورمز QR ومعرّف UUID وبصمة SHA-256). ويحتوي ملف Excel على نفس الرمز. أما XML فهو UBL 2.1 جاهز لبوابة زاتكا أو الوسيط.",
        )}
      </p>
    </div>
  );
}