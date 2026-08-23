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

      {/* ===== TOP HEADER: logo (left) + company (right) ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #1e3a8a", paddingBottom: "15px", marginBottom: "20px" }}>
        <div style={{ width: "120px", flexShrink: 0 }}>
          {c.logoUrl ? (
            <img src={c.logoUrl} alt="Company Logo" style={{ maxWidth: "100px", maxHeight: "60px", objectFit: "contain" }} />
          ) : (
            <div style={{ width: "100px", height: "50px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999", border: "1px dashed #ccc" }}>LOGO</div>
          )}
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "0 15px" }}>
          <div style={{ fontSize: "22px", color: "#A6272C", fontWeight: "bold" }}>{c.nameEn || ""}</div>
          <div dir="rtl" style={{ fontSize: "16px", color: "#1e3a8a", fontWeight: "bold", marginTop: "2px" }}>{c.nameAr || ""}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: "10px" }}>
          <div>VAT No: {c.vatNo || ""}</div>
          <div>CR No: {c.crNo || ""}</div>
          <div>{c.address || ""}</div>
          {c.email ? <div><span style={{ color: "#0563C1", textDecoration: "underline" }}>{c.email}</span></div> : null}
        </div>
      </div>

      {/* ===== META INFO BAR ===== */}
      <div style={{ width: "100%", border: "1px solid #000", marginBottom: "10px", borderCollapse: "collapse" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ width: "15%", fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>Worked Month:</td>
              <td style={{ width: "35%", padding: "5px 8px", border: "0.5px solid #000" }}>{data.workedMonth || "—"}</td>
              <td style={{ width: "15%", fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>Date:</td>
              <td style={{ width: "35%", padding: "5px 8px", border: "0.5px solid #000" }}>{dateStr}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>Invoice. No:</td>
              <td style={{ fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>{data.invoiceNo}</td>
              <td style={{ fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>Time:</td>
              <td style={{ padding: "5px 8px", border: "0.5px solid #000" }}>{timeStr}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>Payment:</td>
              <td style={{ padding: "5px 8px", border: "0.5px solid #000" }}>{data.paymentType || "Credit"}</td>
              <td style={{ fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>Due Date:</td>
              <td style={{ padding: "5px 8px", border: "0.5px solid #000" }}>{data.dueDate || "—"}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>Cashier:</td>
              <td style={{ padding: "5px 8px", border: "0.5px solid #000" }}>{data.cashier || "مدير النظام"}</td>
              <td style={{ fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>PO No:</td>
              <td style={{ padding: "5px 8px", border: "0.5px solid #000" }}>{data.poNumber || "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== LINE ITEMS TABLE ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
        <thead>
          <tr>
            <th style={{ width: "5%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>تسلسل<br/>Sr. No.</th>
            <th style={{ width: "25%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>المسمى الوظيفي<br/>Job Description</th>
            <th style={{ width: "8%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>الوحدة<br/>Unit</th>
            <th style={{ width: "12%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>مجموع الساعات<br/>Total Hour</th>
            <th style={{ width: "12%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>سعر الساعة<br/>Rate/Hour</th>
            <th style={{ width: "13%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>الإجمالي<br/>Total</th>
            <th style={{ width: "10%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>ض القيمة المضافة 15%<br/>VAT 15%</th>
            <th style={{ width: "15%", border: "0.5px solid #000", padding: "6px 4px", textAlign: "center", background: "#E7E7E7", fontWeight: "bold" }}>الاجمالي بالضريبة<br/>Grand Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={8} style={{ border: "0.5px solid #000", padding: "8px", textAlign: "center", color: "#999" }}>—</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.sr}>
              <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center" }}>{r.sr}</td>
              <td style={{ border: "0.5px solid #000", padding: "5px" }}>
                <div dir="rtl" style={{ fontWeight: "bold" }}>{r.descriptionAr || ""}</div>
                <div>{r.descriptionEn || ""}</div>
              </td>
              <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center" }}>{r.unit || "Hour"}</td>
              <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center" }}>{n(r.totalHour).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
              <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center" }}>{formatMoney(n(r.rate))}</td>
              <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center" }}>{formatMoney(r.lineTotal)}</td>
              <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center" }}>{formatMoney(r.vat)}</td>
              <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center", fontWeight: "bold" }}>{formatMoney(r.grand)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ border: "0.5px solid #000", padding: "5px", textAlign: "right", fontWeight: "bold" }}>Total</td>
            <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center", fontWeight: "bold" }}>{totalHours}</td>
            <td style={{ border: "0.5px solid #000" }}></td>
            <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center", fontWeight: "bold" }}>{fmt(subtotal)}</td>
            <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center", fontWeight: "bold" }}>{fmt(vatAmount)}</td>
            <td style={{ border: "0.5px solid #000", padding: "5px", textAlign: "center", fontWeight: "bold" }}>{fmt(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== TOTALS SUMMARY ===== */}
      <table style={{ width: "40%", marginLeft: "auto", marginTop: "10px", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ textAlign: "right", direction: "rtl", fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>
              <strong>الاجمالي بدون الضريبة — Total</strong>
            </td>
            <td style={{ textAlign: "right", fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>{fmt(subtotal)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "right", direction: "rtl", fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>
              <strong>ض. القيمة المضافة {data.vatPercent || 15}% — VAT {data.vatPercent || 15}%</strong>
            </td>
            <td style={{ textAlign: "right", fontWeight: "bold", padding: "5px 8px", border: "0.5px solid #000" }}>{fmt(vatAmount)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "right", direction: "rtl", fontWeight: "bold", padding: "5px 8px", border: "0.75px solid #000" }}>
              <strong>إجمالي المبالغ المستحقة — Due</strong>
            </td>
            <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "12pt", padding: "5px 8px", border: "1.5px double #000" }}>{fmt(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== AMOUNT IN WORDS ===== */}
      <div style={{ marginTop: "10px", borderTop: "0.5px solid #000", paddingTop: "5px", fontSize: "9.5pt" }}>
        <strong>Due:</strong> {grandTotal.toLocaleString("en-US")} {data.currency || "SAR"}
      </div>

      {/* ===== NOTES ===== */}
      {(data.notes || (data as any).notesAr) ? (
        <div style={{ marginTop: "15px", padding: "12px", background: "#f9f9ff", borderRadius: "5px", border: "1px solid #e5e7eb" }}>
          {(data as any).notesAr ? <div dir="rtl" style={{ textAlign: "right", fontSize: "13px", marginTop: "4px" }}>ملاحظات: {(data as any).notesAr}</div> : null}
          {data.notes ? <div style={{ fontSize: "13px" }}>Notes: {data.notes}</div> : null}
        </div>
      ) : null}

      {/* ===== FOOTER (NO stamp) ===== */}
      <div style={{ background: "#E7E7E7", textAlign: "center", padding: "6px", marginTop: "20px", fontSize: "9.5pt" }}>
        Website: {data.companyWebsite || ""}
      </div>

    </div>
  );
}
