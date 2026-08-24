// Construction Invoice Print — Pixel-Perfect YAFCO Tax Invoice (US Letter)
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
    const totalHour = n(it.totalHour);
    const rate = n(it.rate);
    const lineTotal = it.lineTotal != null && n(it.lineTotal) > 0 ? n(it.lineTotal) : totalHour * rate;
    const vat = lineTotal * pct;
    return { ...it, sr: i + 1, totalHour, rate, lineTotal, vat, grandTotal: lineTotal + vat };
  });
  const subtotal = data.subtotal != null ? n(data.subtotal) : rows.reduce((s, r) => s + r.lineTotal, 0);
  const vatAmount = data.vatAmount != null ? n(data.vatAmount) : subtotal * pct;
  const grandTotal = data.grandTotal != null ? n(data.grandTotal) : subtotal + vatAmount;
  const totalHours = rows.reduce((s, r) => s + r.totalHour, 0);
  const c = data.company || {};
  const cust = data.customer || {};
  const created = data.createdAt ? new Date(data.createdAt) : new Date();
  const dateStr = `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, "0")}/${String(created.getDate()).padStart(2, "0")}`;
  const timeStr = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // QR payload
  const qrPayload = JSON.stringify({
    seller: c.nameAr || c.nameEn || "YAFCO",
    vat: c.vatNo || "300995897900003",
    total: grandTotal.toFixed(2),
    tax: vatAmount.toFixed(2),
    date: dateStr,
  });
  const qrData = btoa(unescape(encodeURIComponent(qrPayload)));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="cinv-print bg-white text-black" style={{ width: "215.9mm", minHeight: "279.4mm", margin: "0 auto", padding: "8mm", fontFamily: "Arial, Tahoma, sans-serif", position: "relative", direction: "ltr" }}>
      <style>{`
        @page { size: Letter; margin: 0; }
        @media print {
          body * { visibility: hidden !important; }
          .cinv-print, .cinv-print * { visibility: visible !important; }
          .cinv-print { position: absolute !important; inset: 0 auto auto 0 !important; width: 194mm !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ===== HEADER: logo (left) + company info (right) ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #1e3a8a", paddingBottom: "15px", marginBottom: "20px" }}>
        <div style={{ width: "120px", flexShrink: 0 }}>
          {c.logoUrl ? (
            <img src={c.logoUrl} alt="Logo" style={{ maxWidth: "100px", maxHeight: "60px", objectFit: "contain" }} />
          ) : (
            <div style={{ width: "100px", height: "50px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#999", border: "1px dashed #ccc" }}>LOGO</div>
          )}
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", color: "#A6272C", fontWeight: 900, margin: "0 0 2px 0" }}>{c.nameEn || "YAFCO AL ARABIAH EST."}</h1>
          {c.nameAr ? <h2 dir="rtl" style={{ fontSize: "16px", color: "#1e3a8a", fontWeight: 700, margin: "0 0 6px 0" }}>{c.nameAr}</h2> : null}
        </div>
        <div style={{ width: "140px", flexShrink: 0 }}>
          <img src={qrUrl} alt="QR" style={{ width: "110px", height: "110px", objectFit: "contain" }} />
        </div>
      </div>

      {/* ===== META INFO BAR ===== */}
      <div style={{ width: "100%", border: "0.75pt solid #000", marginBottom: "10px", borderCollapse: "collapse" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5pt" }}>
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

      {/* ===== COMPANY / CLIENT BLOCK ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ width: "48%" }}>
          <div style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "4px" }}>Company / الشركة</div>
          <div style={{ fontSize: "9.5pt", lineHeight: 1.4 }}>
            <div>{c.nameEn || "YAFCO AL ARABIAH EST."}</div>
            {c.nameAr ? <div dir="rtl">{c.nameAr}</div> : null}
            {c.vatNo ? <div>VAT No: {c.vatNo}</div> : null}
            {c.crNo ? <div>CR No: {c.crNo}</div> : null}
            <div>{c.address || "Saudi Arabia - Yanbu Al Bahr - P.O.Box: 2326"}</div>
            {c.email ? <div>Email: <span style={{ color: "#0563C1", textDecoration: "underline" }}>{c.email}</span></div> : null}
            {data.poNumber ? <div>PO: {data.poNumber}</div> : null}
          </div>
        </div>
        <div style={{ width: "48%" }}>
          <div style={{ fontSize: "10pt", fontWeight: "bold", marginBottom: "4px" }}>Client / العميل</div>
          <div style={{ fontSize: "9.5pt", lineHeight: 1.4 }}>
            <div><strong>{cust.name}</strong>{cust.nameAr ? ` / ${cust.nameAr}` : ""}</div>
            {cust.vatNo ? <div>Tax No. {cust.vatNo}</div> : null}
            {cust.address ? <div>{cust.address}</div> : null}
            {cust.crNo ? <div>CR {cust.crNo}</div> : null}
            {cust.phone ? <div>Phone: {cust.phone}</div> : null}
            {cust.email ? <div>Email: <span style={{ color: "#0563C1", textDecoration: "underline" }}>{cust.email}</span></div> : null}
          </div>
        </div>
      </div>

      {/* ===== LINE ITEMS TABLE ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "9pt" }}>
        <thead>
          <tr>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>تسلسل<br/>Sr. No.</th>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>المسمى الوظيفي<br/>Job Description</th>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>الوحدة<br/>Unit</th>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>مجموع الساعات<br/>Total Hour</th>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>سعر الساعة<br/>Rate/Hour</th>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>الإجمالي<br/>Total</th>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>ض القيمة المضافة 15%<br/>VAT 15%</th>
            <th style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", background: "#E7E7E7" }}>الاجمالي بالضريبة<br/>Grand Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center" }}>{r.sr}</td>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "left" }}>{r.descriptionEn || ""}</td>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center" }}>{r.unit || "Hour"}</td>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center" }}>{fmt(r.totalHour)}</td>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right" }}>{fmt(r.rate)}</td>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right" }}>{fmt(r.lineTotal)}</td>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right" }}>{fmt(r.vat)}</td>
              <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right", fontWeight: "bold" }}>{fmt(r.grandTotal)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right", fontWeight: "bold" }}>Total</td>
            <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "center", fontWeight: "bold" }}>{fmt(totalHours)}</td>
            <td style={{ border: "0.5pt solid #000" }}></td>
            <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right", fontWeight: "bold" }}>{fmt(subtotal)}</td>
            <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right", fontWeight: "bold" }}>{fmt(vatAmount)}</td>
            <td style={{ border: "0.5pt solid #000", padding: "4pt", textAlign: "right", fontWeight: "bold" }}>{fmt(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* NOTES */}
      {(data.notes || data.notesAr) && (
        <div style={{ marginTop: "10pt", padding: "8pt", background: "#f9faff", borderRadius: "4pt", border: "1pt solid #e5e7eb", fontSize: "9pt" }}>
          {data.notesAr && <div dir="rtl" style={{ marginBottom: "4px" }}>ملاحظات: {data.notesAr}</div>}
          {data.notes && <div>Notes: {data.notes}</div>}
        </div>
      )}

      {/* FOOTER (NO stamp) */}
      <div style={{ background: "#E7E7E7", textAlign: "center", padding: "6px", marginTop: "20px", fontSize: "9.5pt" }}>
        Website: {data.companyWebsite || ""}
      </div>
    </div>
  );
}
