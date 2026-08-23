import { numberToEnglishWords, formatMoney } from "@/lib/numberToWords";

export interface CInvPrintData {
  invoiceNo: string;
  poNumber?: string | null;
  workedMonth?: string | null;
  paymentType?: string | null;
  cashier?: string | null;
  dueDate?: string | null;
  createdAt?: string;
  customer: {
    name: string; nameAr?: string | null; vatNo?: string | null;
    crNo?: string | null; address?: string | null; phone?: string | null;
  };
  company: {
    nameEn?: string | null; nameAr?: string | null; vatNo?: string | null; crNo?: string | null;
    address?: string | null; email?: string | null; phone?: string | null;
    logoUrl?: string | null; stampUrl?: string | null; unifiedNationalNo?: string | null;
  };
  items: Array<{
    sr: number; descriptionEn?: string | null; descriptionAr?: string | null;
    unit?: string | null; totalHour?: number | string | null;
    rate?: number | string | null; lineTotal?: number | string | null;
  }>;
  subtotal?: number | string;
  vatPercent?: number | string;
  vatAmount?: number | string;
  grandTotal?: number | string;
}

const n = (v: unknown) => Number(v ?? 0) || 0;

export default function ConstructionInvoicePrint({ data }: { data: CInvPrintData }) {
  const pct = n(data.vatPercent || 15) / 100;
  const rows = data.items.map((it, i) => {
    const lineTotal = it.lineTotal != null && n(it.lineTotal) > 0 ? n(it.lineTotal) : n(it.totalHour) * n(it.rate);
    return { ...it, sr: i + 1, lineTotal, vat: lineTotal * pct, grand: lineTotal * (1 + pct) };
  });
  const subtotal = data.subtotal != null ? n(data.subtotal) : rows.reduce((s, r) => s + r.lineTotal, 0);
  const vatAmount = data.vatAmount != null ? n(data.vatAmount) : subtotal * pct;
  const grandTotal = data.grandTotal != null ? n(data.grandTotal) : subtotal + vatAmount;
  const totalHours = rows.reduce((s, r) => s + n(r.totalHour), 0);
  const c = data.company || {};
  const cust = data.customer || {};
  const created = data.createdAt ? new Date(data.createdAt) : new Date();
  const dateStr = `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, "0")}/${String(created.getDate()).padStart(2, "0")}`;
  const timeStr = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="cinv-print bg-white text-black" style={{ width: "210mm", minHeight: "290mm", margin: "0 auto", padding: "8mm", fontFamily: "Arial, Tahoma, sans-serif", position: "relative", direction: "ltr" }}>
      <style>{`
        @page { size: A4; margin: 8mm; }
        @media print {
          body * { visibility: hidden !important; }
          .cinv-print, .cinv-print * { visibility: visible !important; }
          .cinv-print { position: absolute !important; inset: 0 auto auto 0 !important; width: 194mm !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ===== TOP HEADER: logo (left) + invoice meta (center) + company info (right) ===== */}
      <div className="flex items-start justify-between gap-4">
        <div style={{ width: "110px", flexShrink: 0 }}>
          {c.logoUrl ? (
            <img src={c.logoUrl} alt="Company Logo" style={{ maxWidth: "100px", maxHeight: "60px", objectFit: "contain" }} />
          ) : (
            <div style={{ width: "100px", height: "50px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999", border: "1px dashed #ccc" }}>LOGO</div>
          )}
        </div>
        <table className="text-[11px] leading-5">
          <tbody>
            <tr><td className="pr-1 font-semibold">Worked Month:</td><td>{data.workedMonth || "—"}</td></tr>
            <tr><td className="pr-1 font-semibold">Invoice. No:</td><td className="font-bold">{data.invoiceNo}</td></tr>
            <tr><td className="pr-1 font-semibold">Payment:</td><td>{data.paymentType || "Credit"}</td></tr>
            <tr><td className="pr-1 font-semibold">Cashier:</td><td>{data.cashier || "مدير النظام"}</td></tr>
          </tbody>
        </table>
        <div className="text-right">
          <p className="text-[12px] font-bold">{c.nameEn || ""} / الشركة : {c.nameAr || ""}</p>
          <p className="text-[10px]">رقم السجل / الرقم الضريبي: {[c.vatNo, c.crNo].filter(Boolean).join(" / ")}</p>
          <p className="text-[10px]">Address: {c.address || "—"}</p>
          <p className="text-[10px]">Email: {c.email || "—"}</p>
          <p className="text-[10px]">PO: {data.poNumber || "—"}</p>
        </div>
      </div>

      {/* ===== Center title ===== */}
      <div className="mt-3 text-center">
        <h1 className="text-[17px] font-bold">{c.nameAr || c.nameEn || ""}</h1>
        <h2 className="text-[14px] font-bold">فاتورة الضريبية - TAX INVOICE</h2>
        {data.poNumber && (
          <p className="inline-block mt-1 border border-slate-400 px-3 py-0.5 text-[11px] font-bold">PO No: {data.poNumber}</p>
        )}
      </div>

      {/* ===== Main bordered table (8 columns, bilingual headers) ===== */}
      <table className="w-full border-collapse border border-black mt-3" style={{ fontSize: "10px" }}>
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="border border-black p-1 w-[5%]"><div>نمبر</div><div>Sr. No</div></th>
            <th className="border border-black p-1 w-[24%]"><div>وصف العمل</div><div>Job Description</div></th>
            <th className="border border-black p-1 w-[8%]"><div>وحدة</div><div>Unit</div></th>
            <th className="border border-black p-1 w-[11%]"><div>مجموع الساعات</div><div>Total Hour</div></th>
            <th className="border border-black p-1 w-[13%]"><div>السعر لكل ساعة</div><div>Rate/Hour</div></th>
            <th className="border border-black p-1 w-[13%]"><div>المجموع</div><div>Total</div></th>
            <th className="border border-black p-1 w-[13%]"><div>ضريبة القيمة المضافة 15٪</div><div>VAT 15%</div></th>
            <th className="border border-black p-1 w-[13%]"><div>الإجمالي العام</div><div>Grand Total</div></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={8} className="border border-black p-2 text-center text-slate-500">—</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.sr} className="align-top">
              <td className="border border-black p-1 text-center">{r.sr}</td>
              <td className="border border-black p-1">
                <div dir="rtl" className="font-semibold">{r.descriptionAr || ""}</div>
                <div>{r.descriptionEn || ""}</div>
              </td>
              <td className="border border-black p-1 text-center">{r.unit || "Hour"}</td>
              <td className="border border-black p-1 text-center">{n(r.totalHour).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
              <td className="border border-black p-1 text-right pr-2">{formatMoney(n(r.rate))}</td>
              <td className="border border-black p-1 text-right pr-2">{formatMoney(r.lineTotal)}</td>
              <td className="border border-black p-1 text-right pr-2">{formatMoney(r.vat)}</td>
              <td className="border border-black p-1 text-right pr-2 font-semibold">{formatMoney(r.grand)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Totals split: hours-due left, money box right ===== */}
      <div className="flex items-start justify-between mt-2">
        <div className="text-[12px] font-bold pt-6">
          Due: <span className="underline">{totalHours.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
        </div>
        <table className="border border-black text-[11px]" style={{ minWidth: "62mm" }}>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1"><b>Total</b> <span dir="rtl">(الاجمالي بدون الضريبة)</span></td>
              <td className="border border-black px-2 py-1 text-right">{formatMoney(subtotal)}</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1"><b>VAT {Math.round(pct * 100)}%</b> <span dir="rtl">(القيمة المضافة {Math.round(pct * 100)}%)</span></td>
              <td className="border border-black px-2 py-1 text-right">{formatMoney(vatAmount)}</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1"><b>Grand Total Due</b> <span dir="rtl">(إجمالي المبالغ المستحقة)</span></td>
              <td className="border border-black px-2 py-1 text-right font-bold">{formatMoney(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-2 border-t border-b border-black py-1 text-[10px]">
        <b>Amount in Words:</b> {numberToEnglishWords(grandTotal)} Saudi Riyals only
      </div>

      {/* ===== Bottom: date/time/due + client details box ===== */}
      <div className="mt-4 flex items-start justify-between gap-6">
        <div className="text-[10px] leading-5">
          <p>Date: {dateStr} &nbsp;&nbsp; Time: {timeStr}</p>
          <p>Due Date: {data.dueDate || "—"}</p>
        </div>
        <table className="border border-black text-[10px] leading-5" style={{ minWidth: "95mm" }}>
          <tbody>
            <tr><td colSpan={2} className="border border-black px-2 py-1 font-bold text-center">Client Details <span dir="rtl">(بيانات العميل)</span></td></tr>
            <tr>
              <td className="border border-black px-2 w-[38%] font-semibold">Client Name</td>
              <td className="border border-black px-2">{cust.name || "—"}{cust.nameAr ? ` — ${cust.nameAr}` : ""}</td>
            </tr>
            <tr><td className="border border-black px-2 font-semibold">Tax No</td><td className="border border-black px-2">{cust.vatNo || "—"}</td></tr>
            <tr><td className="border border-black px-2 font-semibold">CR No</td><td className="border border-black px-2">{cust.crNo || "—"}</td></tr>
            <tr><td className="border border-black px-2 font-semibold">Address</td><td className="border border-black px-2">{cust.address || "—"}</td></tr>
            <tr><td className="border border-black px-2 font-semibold">Phone</td><td className="border border-black px-2">{cust.phone || "—"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* ===== FOOTER STAMP with Unified Natl. No. ===== */}
      <div style={{ position: "absolute", right: "18mm", bottom: "12mm", textAlign: "center" }}>
        {c.stampUrl ? (
          <img
            src={c.stampUrl}
            alt="official stamp"
            style={{ width: "32mm", height: "32mm", borderRadius: "50%", objectFit: "contain", opacity: 0.92 }}
          />
        ) : (
          <div style={{ width: "32mm", height: "32mm", borderRadius: "50%", border: "2px dashed #999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#999" }}>STAMP</div>
        )}
        {c.unifiedNationalNo && (
          <p style={{ fontSize: "9px", marginTop: "3px", fontWeight: "600", color: "#333" }}>
            Unified Natl. No. {c.unifiedNationalNo}
          </p>
        )}
      </div>
    </div>
  );
}
