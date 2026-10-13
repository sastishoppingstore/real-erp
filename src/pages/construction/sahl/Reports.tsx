import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, SahlGrid } from "./ui";

// Reports from persisted data only: daily movement (cashbox todaySummary +
// today's sales invoices), sales/purchase analysis (reports.*), stock
// valuation (reports.inventoryReport: avg cost, qty, value).
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
    [T("مقبوضات الخزينة", "Cash in"), Number((today as any)?.cashIn?.total ?? 0).toFixed(2)],
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
