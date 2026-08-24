// Pixel-perfect YAFCO Tax Invoice — US Letter Portrait (8.5 × 11 in)
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
    website?: string | null;
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
    return { ...it, sr: i + 1, totalHour, rate, lineTotal, vat: lineTotal * pct, grand: lineTotal * (1 + pct) };
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

  // QR payload
  const qrPayload = JSON.stringify({
    seller: c.nameAr || c.nameEn || "YAFCO",
    vat: c.vatNo || "300995897900003",
    total: grandTotal.toFixed(2),
    tax: vatAmount.toFixed(2),
    date: dateStr,
  });
  const qrData = btoa(unescape(encodeURIComponent(qrPayload)));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  const border = "0.5pt solid #000000";

  return (
    <div className="cinv-print" style={{ width: "215.9mm", minHeight: "279.4mm", margin: "0 auto", padding: "10mm", fontFamily: "Calibri, Arial, sans-serif", backgroundColor: "#FFFFFF", color: "#000000", position: "relative" }}>
      <style>{`
        @page { size: Letter portrait; margin: 0; }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden !important; }
          .cinv-print, .cinv-print * { visibility: visible !important; }
          .cinv-print { position: absolute !important; inset: 0 auto auto 0 !important; width: 215.9mm !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
        table { border-collapse: collapse; }
        td, th { vertical-align: top; }
      `}</style>

      {/* ===== HEADER ZONE (table layout for Word compat) ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "5px" }}>
        <tr>
          <td style={{ width: "18%", textAlign: "center", verticalAlign: "top" }}>
            {c.logoUrl ? (
              <img src={c.logoUrl} alt="Logo" style={{ maxWidth: "130px", maxHeight: "90px", objectFit: "contain" }} />
            ) : (
              <div style={{ width: "130px", height: "90px", border: "2px dashed #ccc", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#999" }}>LOGO</div>
            )}
          </td>
          <td style={{ width: "44%", textAlign: "center", verticalAlign: "top" }}>
            <div dir="rtl" style={{ fontSize: "22px", fontWeight: "bold", color: "#A6272C", marginBottom: "4px" }}>
              {c.nameAr || ""}
            </div>
            {/* Title box */}
            <div style={{ background: "#D9D9D9", padding: "6px 20px", display: "inline-block", border: "1px solid #999" }}>
              <span style={{ fontSize: "16px", fontWeight: "bold", color: "#000" }}>TAX INVOICE</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#000" }}> - </span>
              <span dir="rtl" style={{ fontSize: "15px", fontWeight: "bold", color: "#000" }}>فاتورة الضريبية</span>
            </div>
          </td>
          <td style={{ width: "18%", textAlign: "center", verticalAlign: "top" }}>
            <img src={qrUrl} alt="QR" style={{ width: "110px", height: "110px", objectFit: "contain" }} />
          </td>
        </tr>
      </table>

      {/* ===== GRAY HEADER BAR ===== */}
      <div style={{ width: "100%", height: "28px", background: "#D9D9D9", marginBottom: "12px" }}></div>

      {/* ===== META INFO BAR ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", border: "0.75pt solid #000" }}>
        <tr>
          <td style={{ width: "50%", verticalAlign: "top", padding: "0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tr>
                <td style={{ width: "35%", fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: border, borderRight: border }}>Worked Month:</td>
                <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: border }}>{data.workedMonth || ""}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: border, borderRight: border }}>Invoice. No:</td>
                <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: border }}>{data.invoiceNo}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: border, borderRight: border }}>Payment:</td>
                <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: border }}>{data.paymentType || "Credit"}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderRight: border }}>Cashier:</td>
                <td dir="rtl" style={{ textAlign: "right", fontSize: "9.5pt", padding: "3px 8px" }}>{data.cashier || "مدير النظام"}</td>
              </tr>
            </table>
          </td>
          <td style={{ width: "50%", verticalAlign: "bottom", padding: "0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tr>
                <td style={{ width: "30%", fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: border }}>Date:</td>
                <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: border }}>{dateStr}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: border }}>Time:</td>
                <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: border }}>{timeStr}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px" }}>Due Date:</td>
                <td style={{ fontSize: "9.5pt", padding: "3px 8px" }}>{data.dueDate || ""}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      {/* ===== COMPANY / CLIENT AREA ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
        <tr>
          {/* Company Column */}
          <td style={{ width: "48%", verticalAlign: "top", padding: "5px 8px", fontSize: "9.5pt", lineHeight: 1.5 }}>
            <div><strong>Company: </strong> {c.nameEn || ""}</div>
            {c.nameAr && <div dir="rtl" style={{ textAlign: "left", marginTop: "2px" }}>{c.nameAr}</div>}
            <div style={{ marginTop: "4px" }}>{c.crNo || ""}</div>
            <div><strong>VAT No: </strong>{c.vatNo || ""} <span dir="rtl"> :الرقم الضريبي</span></div>
            <div style={{ marginTop: "4px" }}><strong>Address:</strong></div>
            <div>Saudi Arabia - Yanbu Al Bahr -</div>
            <div>P.O.Box : 2326</div>
            <div dir="rtl" style={{ textAlign: "right", marginTop: "2px" }}>المملكة العربية السعودية - ينبع البحر - ص . ب 2326:</div>
            {c.email && <div style={{ marginTop: "4px" }}><strong>Email: </strong><span style={{ color: "#0563C1", textDecoration: "underline" }}>{c.email}</span></div>}
            {data.poNumber && <div style={{ marginTop: "4px" }}><strong>PO : </strong>{data.poNumber}</div>}
          </td>
          {/* Center Divider */}
          <td style={{ width: "4px", borderLeft: "4px solid #000000", minHeight: "120px" }}></td>
          {/* Client Column */}
          <td style={{ width: "48%", verticalAlign: "top", padding: "5px 8px", fontSize: "9.5pt", lineHeight: 1.5 }}>
            <div><strong>Client : </strong></div>
            <div>{cust.name || ""}{cust.nameAr ? `, ${cust.nameAr}` : ""}</div>
            {cust.vatNo && <div style={{ marginTop: "4px" }}><strong>Tax No. </strong>{cust.vatNo}</div>}
            {cust.address && <div style={{ marginTop: "4px" }}>{cust.address}</div>}
            {cust.crNo && <div style={{ marginTop: "4px" }}><strong>CR </strong>{cust.crNo}</div>}
          </td>
        </tr>
      </table>

      {/* ===== MAIN TABLE ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginBottom: "0" }}>
        <thead>
          {/* Arabic Header Row */}
          <tr>
            <th style={{ ...thStyle, width: "7%", background: "#D9D9D9", height: "34px" }} dir="rtl">تسلسل</th>
            <th style={{ ...thStyle, width: "24%", background: "#D9D9D9", height: "34px" }} dir="rtl">المسمى الوظيفي</th>
            <th style={{ ...thStyle, width: "6.5%", background: "#D9D9D9", height: "34px" }} dir="rtl">الوحدة</th>
            <th style={{ ...thStyle, width: "7.5%", background: "#D9D9D9", height: "34px" }} dir="rtl">مجموع الساعات</th>
            <th style={{ ...thStyle, width: "11.5%", background: "#D9D9D9", height: "34px" }} dir="rtl">سعر الساعة</th>
            <th style={{ ...thStyle, width: "11.5%", background: "#D9D9D9", height: "34px" }} dir="rtl">الإجمالي</th>
            <th style={{ ...thStyle, width: "9%", background: "#D9D9D9", height: "34px" }} dir="rtl">ض القيمة المضافة</th>
            <th style={{ ...thStyle, width: "19%", background: "#D9D9D9", height: "34px" }} dir="rtl">الاجمالي بالضريبة</th>
          </tr>
          {/* English Header Row */}
          <tr>
            <th style={{ ...thStyle, width: "7%", background: "#DCE6F1", height: "30px" }}>Sr. No.</th>
            <th style={{ ...thStyle, width: "24%", background: "#DCE6F1", height: "30px" }}>Job Description</th>
            <th style={{ ...thStyle, width: "6.5%", background: "#DCE6F1", height: "30px" }}>Unit</th>
            <th style={{ ...thStyle, width: "7.5%", background: "#DCE6F1", height: "30px" }}>Total<br/>Hour</th>
            <th style={{ ...thStyle, width: "11.5%", background: "#DCE6F1", height: "30px" }}>Rate/ Hour</th>
            <th style={{ ...thStyle, width: "11.5%", background: "#DCE6F1", height: "30px" }}>Total</th>
            <th style={{ ...thStyle, width: "9%", background: "#DCE6F1", height: "30px" }}>VAT<br/>15%</th>
            <th style={{ ...thStyle, width: "19%", background: "#DCE6F1", height: "30px" }}>Grand Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sr}>
              <td style={{ ...tdCenter, height: "40px" }}>{r.sr}</td>
              <td style={{ ...tdLeft, height: "40px" }}>{r.descriptionEn || ""}{r.descriptionAr && <span dir="rtl"> ({r.descriptionAr})</span>}</td>
              <td style={{ ...tdCenter, height: "40px" }}>{r.unit || ""}</td>
              <td style={{ ...tdCenter, height: "40px" }}>{fmtNum(r.totalHour)}</td>
              <td style={{ ...tdRight, height: "40px" }}>{formatMoney(r.rate)}</td>
              <td style={{ ...tdRight, height: "40px" }}>{formatMoney(r.lineTotal)}</td>
              <td style={{ ...tdRight, height: "40px" }}>{fmtVat(r.vat)}</td>
              <td style={{ ...tdRight, fontWeight: "600", height: "40px" }}>{formatMoney(r.grand)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={8} style={{ ...tdCenter, height: "40px", color: "#999" }}>—</td></tr>
          )}
        </tbody>
      </table>

      {/* ===== TOTAL HOURS ROW ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tr>
          <td colSpan={3} style={{ border: border, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt", width: "37.5%" }}>Total</td>
          <td style={{ border: border, padding: "4px 6px", textAlign: "center", fontWeight: "bold", fontSize: "10pt", width: "7.5%" }}>{fmtNum(totalHours)}</td>
          <td style={{ border: border, width: "11.5%" }}></td>
          <td style={{ border: border, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt", width: "11.5%" }}>{formatMoney(subtotal)}</td>
          <td style={{ border: border, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt", width: "9%" }}>{fmtVat(vatAmount)}</td>
          <td style={{ border: border, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt", width: "19%" }}>{formatMoney(grandTotal)}</td>
        </tr>
      </table>

      {/* ===== TOTALS SECTION ===== */}
      <table style={{ width: "195px", marginLeft: "auto", marginTop: "10px", borderCollapse: "collapse", fontSize: "10pt" }}>
        <tr>
          <td style={{ textAlign: "right", direction: "rtl", padding: "4px 6px" }} dir="rtl"><b>الإجمالي بدون الضريبة</b></td>
          <td style={{ textAlign: "right", padding: "4px 6px", fontWeight: "600" }}>{formatMoney(subtotal)}</td>
        </tr>
        <tr>
          <td style={{ textAlign: "right", direction: "rtl", padding: "4px 6px" }} dir="rtl"><b>ض. القيمة المضافة 15%</b></td>
          <td style={{ textAlign: "right", padding: "4px 6px", fontWeight: "600" }}>{formatMoney(vatAmount)}</td>
        </tr>
        <tr>
          <td style={{ textAlign: "right", direction: "rtl", padding: "5px 8px", border: "0.75pt double #000", fontWeight: "bold" }} dir="rtl">
            إجمالي المبالغ المستحقة
          </td>
          <td style={{ textAlign: "right", padding: "5px 8px", border: "0.75pt double #000", fontWeight: "bold", fontSize: "12pt" }}>
            {formatMoney(grandTotal)}
          </td>
        </tr>
      </table>

      {/* ===== AMOUNT IN WORDS ===== */}
      <div style={{ marginTop: "8px", borderTop: "0.5pt solid #000", paddingTop: "5px", fontSize: "9.5pt", width: "100%" }}>
        <strong>Due</strong>&nbsp;&nbsp;{numberToEnglishWords(grandTotal)}&nbsp;&nbsp;<strong>{currency || "SAR"}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span dir="rtl"><strong>إجمالي المبالغ المستحقة</strong></span>
      </div>

      {/* ===== WEBSITE FOOTER BAR ===== */}
      <div style={{ width: "100%", background: "#D9D9D9", textAlign: "center", padding: "14px 0", marginTop: "20px", marginBottom: "0" }}>
        <span style={{ fontSize: "18px", fontWeight: "bold", color: "#000" }}>
          Website: {c.website || "www.yafco.com.sa"}
        </span>
      </div>

      {/* ===== COMPANY STAMP ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "60px" }}>
        <tr>
          <td style={{ textAlign: "center" }}>
            {c.stampUrl ? (
              <img src={c.stampUrl} alt="Stamp" style={{ width: "190px", height: "190px", borderRadius: "50%", objectFit: "contain" }} />
            ) : (
              <div style={{
                width: "190px", height: "190px", borderRadius: "50%",
                border: "3px solid #0875C1", margin: "0 auto",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center"
              }}>
                <div dir="rtl" style={{ fontSize: "14px", fontWeight: "bold", color: "#0875C1" }}>مؤسسة يافكو العربية</div>
                <div dir="rtl" style={{ fontSize: "10px", color: "#0875C1", margin: "4px 0" }}>الرقم الوطني الموحد ٧٠١١٧٨٩٥٠٥</div>
                <div style={{ fontSize: "10px", color: "#0875C1" }}>Unified Natl. No.</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#0875C1" }}>7011789505</div>
                <div style={{ fontSize: "9px", color: "#0875C1", marginTop: "2px" }}>Establishment Yafco Alarabiah</div>
              </div>
            )}
          </td>
        </tr>
      </table>

      {/* ===== LARGE WHITE SPACE (part of design) ===== */}
      <div style={{ height: "200px" }}></div>

    </div>
  );
}

// Style helpers
const thStyle: React.CSSProperties = {
  border: "0.5pt solid #000000",
  padding: "4px 4px",
  fontSize: "9pt",
  fontWeight: "bold",
  textAlign: "center",
  verticalAlign: "middle",
};

const tdCenter: React.CSSProperties = {
  border: "0.5pt solid #000000",
  padding: "4px 4px",
  fontSize: "9.5pt",
  textAlign: "center",
};

const tdLeft: React.CSSProperties = {
  border: "0.5pt solid #000000",
  padding: "4px 6px",
  fontSize: "9.5pt",
  textAlign: "left",
};

const tdRight: React.CSSProperties = {
  border: "0.5pt solid #000000",
  padding: "4px 6px",
  fontSize: "9.5pt",
  textAlign: "right",
};

const fmtNum = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });
const fmtVat = (v: number) => {
  if (Number.isInteger(v)) return String(v);
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
};
