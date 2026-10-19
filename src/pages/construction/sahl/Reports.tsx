import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, SahlGrid } from "./ui";
export function SahlDaily() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [d, setD] = useState(new Date().toISOString().slice(0, 10));
  const { data: today } = trpc.cashbox.todaySummary.useQuery();
  const { data: invoices } = trpc.sales.invoiceList.useQuery();
  const day = (invoices ?? []).filter((i: any) => String(i.date ?? i.createdAt ?? "").slice(0, 10) === d);
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const kpis: [string, string | number][] = [
    [T("مبيعات اليوم", "Day sales"), day.reduce((a: number, i: any) => a + Number(i.totalAmount || 0), 0).toFixed(2)],
    [T("فواتير", "Invoices"), day.length],
    [T("مقبوضات الخزينة", "Cash in"), (Number((today as any)?.cashIn?.total ?? 0) + Number((today as any)?.sales?.total ?? 0)).toFixed(2)],
    [T("مدفوعات الخزينة", "Cash out"), (Number((today as any)?.cashOut?.total ?? 0) + Number((today as any)?.expenses?.total ?? 0)).toFixed(2)],
  ];
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex items-center gap-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تقرير الحركة اليومية", "Daily movement report")}</b>
        <input type="date" className={inputCls} style={{ width: 150 }} value={d} onChange={(e) => setD(e.target.value)} />
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة", "Print")}</button>
      </div>
      <div className="mb-2 flex gap-2">
        {kpis.map(([k, v]) => (
          <div key={k} className="border border-[#333] bg-[#111] px-2 py-1">
            <span className="text-white/60">{k}: </span><b className="tabular-nums">{v}</b>
          </div>
        ))}
      </div>
      <SahlGrid
        columns={[T("الرقم", "No."), T("العميل", "Customer"), T("الإجمالي", "Total"), T("المدفوع", "Paid"), T("المتبقي", "Due")]}
        rows={day.map((i: any) => [i.invoiceNumber, i.customerName ?? "", Number(i.totalAmount || 0).toFixed(2), Number(i.paidAmount || 0).toFixed(2), Number(i.balanceDue || 0).toFixed(2)])}
        emptyText={T("لا توجد حركة بهذا التاريخ", "No movements on this date")}
      />
    </div>
  );
}

export function SahlSalesAnalysis() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data } = trpc.reports.salesReport.useQuery({ from: from || undefined, to: to || undefined, groupBy: "month" });
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const rows = (data as any)?.rows ?? [];
  const s = (data as any)?.summary ?? {};
  const kpis: [string, string | number][] = [
    [T("الإيراد", "Revenue"), Number(s.totalRevenue || 0).toFixed(2)],
    [T("الضريبة", "Tax"), Number(s.totalTax || 0).toFixed(2)],
    [T("المحصل", "Paid"), Number(s.totalPaid || 0).toFixed(2)],
    [T("الفواتير", "Count"), s.invoiceCount ?? 0],
  ];
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex flex-wrap items-center gap-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تقرير تحليل المبيعات", "Sales analysis report")}</b>
        <input type="date" className={inputCls} style={{ width: 150 }} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className={inputCls} style={{ width: 150 }} value={to} onChange={(e) => setTo(e.target.value)} />
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة", "Print")}</button>
      </div>
      <div className="mb-2 flex gap-2">
        {kpis.map(([k, v]) => (
          <div key={k} className="border border-[#333] bg-[#111] px-2 py-1">
            <span className="text-white/60">{k}: </span><b className="tabular-nums">{v}</b>
          </div>
        ))}
      </div>
      <SahlGrid
        columns={[T("الفترة", "Period"), T("العدد", "Count"), T("الإجمالي", "Total"), T("المدفوع", "Paid"), T("المتبقي", "Due")]}
        rows={rows.map((r: any) => [r.period, r.count, Number(r.total || 0).toFixed(2), Number(r.paid || 0).toFixed(2), Number(r.balance || 0).toFixed(2)])}
        emptyText={T("لا توجد بيانات", "No data")}
      />
    </div>
  );
}

export function SahlPurchaseAnalysis() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const { data } = trpc.reports.purchaseReport.useQuery({} as any);
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const rows = (data as any)?.rows ?? (Array.isArray(data) ? data : []);
  const { data: pos } = trpc.purchase.poList.useQuery();
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex items-center gap-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تقرير تحليل المشتريات", "Purchase analysis report")}</b>
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة", "Print")}</button>
      </div>
      {rows.length > 0 ? (
        <SahlGrid
          columns={[T("الفترة", "Period"), T("العدد", "Count"), T("الإجمالي", "Total")]}
          rows={rows.map((r: any) => [r.period ?? "", r.count ?? "", Number(r.total ?? 0).toFixed(2)])}
          emptyText={T("لا توجد بيانات", "No data")}
        />
      ) : (
        <SahlGrid
          columns={[T("الأمر", "PO"), T("المورد", "Supplier"), T("الإجمالي", "Total"), T("الحالة", "Status")]}
          rows={(pos ?? []).map((p: any) => [p.poNumber, p.supplierId, Number(p.totalAmount || 0).toFixed(2), p.status ?? ""])}
          emptyText={T("لا توجد بيانات", "No data")}
        />
      )}
    </div>
  );
}

export function SahlValuation() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const navigate = useNavigate();
  const { data } = trpc.reports.inventoryReport.useQuery({});
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const rows = (data as any)?.rows ?? [];
  const s = (data as any)?.summary ?? {};
  const kpis: [string, string | number][] = [
    [T("الأصناف", "Products"), s.totalProducts ?? 0],
    [T("الكمية", "Qty"), Number(s.totalQty || 0).toFixed(0)],
    [T("القيمة", "Value"), Number(s.totalValue || 0).toFixed(2)],
  ];
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex items-center gap-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تقييم المخزون", "Stock valuation")}</b>
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة", "Print")}</button>
        <button className={btnCls} onClick={() => navigate("/app/construction/sahl/products")}>{T("الأصناف", "Products")}</button>
      </div>
      <div className="mb-2 flex gap-2">
        {kpis.map(([k, v]) => (
          <div key={k} className="border border-[#333] bg-[#111] px-2 py-1">
            <span className="text-white/60">{k}: </span><b className="tabular-nums">{v}</b>
          </div>
        ))}
      </div>
      <SahlGrid
        columns={[T("الكود", "SKU"), T("الصنف", "Item"), T("الكمية", "Qty"), T("متوسط التكلفة", "Avg cost"), T("القيمة", "Value")]}
        rows={rows.map((r: any) => [r.sku ?? "", r.name ?? "", Number(r.quantity || 0), Number(r.avgCost ?? r.purchasePrice ?? 0).toFixed(2), Number(r.totalValue || 0).toFixed(2)])}
        emptyText={T("لا توجد بيانات", "No data")}
      />
    </div>
  );
}

// Extra ledgers: tax (VAT), financial (P&L), aging/credit follow-up.
export function SahlMoreReports() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [tab, setTab] = useState<"tax" | "pnl" | "aging">("tax");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data: tax } = trpc.reports.taxReport.useQuery(
    { from: from || undefined, to: to || undefined }, { enabled: tab === "tax" });
  const { data: pnl } = trpc.reports.financialReport.useQuery(
    { from: from || undefined, to: to || undefined }, { enabled: tab === "pnl" });
  const { data: aging } = trpc.reports.agingReport.useQuery(undefined, { enabled: tab === "aging" });
  const T = (ar: string, en: string) => (rtl ? ar : en);
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex flex-wrap items-center gap-1 border border-[#333] bg-[#111] p-1.5">
        {(["tax", "pnl", "aging"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className="border border-[#555] px-3 py-1 text-white"
            style={{ background: tab === k ? "#2fae4e" : "#222" }}>
            {k === "tax" ? T("كشف الضريبة", "VAT report") : k === "pnl" ? T("الأرباح والخسائر", "P&L") : T("متابعة الآجل", "Credit follow-up")}
          </button>
        ))}
        <input type="date" className={inputCls} style={{ width: 150 }} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className={inputCls} style={{ width: 150 }} value={to} onChange={(e) => setTo(e.target.value)} />
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة", "Print")}</button>
      </div>
      {tab === "tax" && (
        <>
          <div className="mb-2 flex gap-2">
            {[T("القاعدة", "Base"), Number((tax as any)?.summary?.totalSubtotal ?? 0).toFixed(2),
              T("الضريبة", "Tax"), Number((tax as any)?.summary?.totalTax ?? 0).toFixed(2),
              T("الفواتير", "Count"), (tax as any)?.summary?.count ?? 0,
            ].reduce((a: any[], v, i, arr) => (i % 2 ? a : [...a, [arr[i], arr[i + 1]]]), []).map(([k, v]: any) => (
              <div key={k} className="border border-[#333] bg-[#111] px-2 py-1">
                <span className="text-white/60">{k}: </span><b className="tabular-nums">{v}</b>
              </div>
            ))}
          </div>
          <SahlGrid
            columns={[T("الرقم", "No."), T("التاريخ", "Date"), T("القاعدة", "Base"), T("الضريبة", "Tax"), T("الإجمالي", "Total")]}
            rows={((tax as any)?.rows ?? []).map((r: any) => [r.invoiceNumber, String(r.date ?? "").slice(0, 10), Number(r.subtotal || 0).toFixed(2), Number(r.taxAmount || 0).toFixed(2), Number(r.totalAmount || 0).toFixed(2)])}
            emptyText={T("لا توجد بيانات", "No data")}
          />
        </>
      )}
      {tab === "pnl" && (
        <>
          <div className="mb-2 flex flex-wrap gap-2">
            {[
              [T("الإيراد", "Revenue"), (pnl as any)?.summary?.totalRevenue ?? (pnl as any)?.summary?.revenue ?? 0],
              [T("التكلفة", "COGS"), (pnl as any)?.summary?.totalCogs ?? (pnl as any)?.summary?.cogs ?? 0],
              [T("المصروفات", "Expenses"), (pnl as any)?.summary?.totalExpenses ?? (pnl as any)?.summary?.expenses ?? 0],
              [T("الصافي", "Net"), (pnl as any)?.summary?.netProfit ?? 0],
            ].map(([k, v]: any) => (
              <div key={k} className="border border-[#333] bg-[#111] px-2 py-1">
                <span className="text-white/60">{k}: </span><b className="tabular-nums">{Number(v || 0).toFixed(2)}</b>
              </div>
            ))}
          </div>
          <SahlGrid
            columns={[T("البند", "Item"), T("القيمة", "Value")]}
            rows={Object.entries(((pnl as any)?.summary ?? {}) as Record<string, any>).map(([k, v]) => [k, Number(v || 0).toFixed(2)])}
            emptyText={T("لا توجد بيانات", "No data")}
          />
        </>
      )}
      {tab === "aging" && (
        <>
          <div className="mb-2 flex gap-2">
            <div className="border border-[#333] bg-[#111] px-2 py-1">
              <span className="text-white/60">{T("المستحق", "Outstanding")}: </span>
              <b className="tabular-nums">{Number((aging as any)?.summary?.totalOutstanding ?? 0).toFixed(2)}</b>
              {" · "}{(aging as any)?.summary?.customerCount ?? 0}
            </div>
          </div>
          <SahlGrid
            columns={[T("العميل", "Customer"), T("الإجمالي", "Total"), "0-30", "31-60", "61-90", "90+"]}
            rows={((aging as any)?.rows ?? []).map((r: any) => [
              r.customerName ?? "", Number(r.total || 0).toFixed(2),
              Number(r.days1to30 || 0).toFixed(0), Number(r.days31to60 || 0).toFixed(0),
              Number(r.days61to90 || 0).toFixed(0), Number(r.days91plus || 0).toFixed(0),
            ])}
            emptyText={T("لا مستحقات", "Nothing outstanding")}
          />
        </>
      )}
    </div>
  );
}
