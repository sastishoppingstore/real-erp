// Construction Tax Invoice — Excel replica (A4 portrait).
// Matches the official YAFCO Excel invoice 1:1: header art zone, meta box,
// company/client split, bilingual items table, totals, amount-in-words,
// website footer. Data interface kept identical to the old template so all
// callers keep working.
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
    currency?: string | null;
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

export interface ConstructionInvoiceExcelHandle {
  downloadPdf: () => Promise<void>;
}

const n = (v: unknown) => Number(v ?? 0) || 0;

const DESIGN_W = 794; // A4 @96dpi
const GRAY = "#D9D9D9";
const LBLUE = "#DCE6F1";
const RED = "#A6272C";
const BORDER = "0.5pt solid #000000";

const thBlue: React.CSSProperties = {
  border: BORDER, padding: "4px 4px", fontSize: "9pt", fontWeight: "bold",
  textAlign: "center", verticalAlign: "middle", background: LBLUE,
};
const thGray: React.CSSProperties = {
  border: BORDER, padding: "3px 4px", fontSize: "9pt", fontWeight: "bold",
  textAlign: "center", verticalAlign: "middle", background: GRAY,
};
const tdC: React.CSSProperties = {
  border: BORDER, padding: "4px 4px", fontSize: "9.5pt", textAlign: "center", verticalAlign: "middle",
};
const tdL: React.CSSProperties = {
  border: BORDER, padding: "4px 6px", fontSize: "9.5pt", textAlign: "left", verticalAlign: "middle",
};
const tdR: React.CSSProperties = {
  border: BORDER, padding: "4px 6px", fontSize: "9.5pt", textAlign: "right", verticalAlign: "middle",
};
const fmtNum = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });
const fmtVat = (v: number) => (Number.isInteger(v) ? String(v) : v.toLocaleString("en-US", { maximumFractionDigits: 2 }));

function Sheet({ data }: { data: CInvPrintData }) {
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
  const pad = (v: number) => String(v).padStart(2, "0");
  const dateStr = `${created.getFullYear()}/${pad(created.getMonth() + 1)}/${pad(created.getDate())}`;
  const timeStr = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const qrPayload = JSON.stringify({
    seller: c.nameAr || c.nameEn || "YAFCO",
    vat: c.vatNo || "300995897900003",
    total: grandTotal.toFixed(2),
    tax: vatAmount.toFixed(2),
    date: dateStr,
  });
  const qrData = btoa(unescape(encodeURIComponent(qrPayload)));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
  const logoSrc = c.logoUrl || "/yafco-logo.png";

  return (
    <div style={{ width: `${DESIGN_W}px`, margin: "0 auto", padding: "28px", fontFamily: "Calibri, Arial, sans-serif", backgroundColor: "#FFFFFF", color: "#000000" }}>
      {/* ===== HEADER: logo | title | QR ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
        <tbody>
          <tr>
            <td style={{ width: "15%", textAlign: "center", verticalAlign: "top" }}>
              <img src={logoSrc} alt="Logo" style={{ maxWidth: "120px", maxHeight: "92px", objectFit: "contain" }} />
            </td>
            <td style={{ width: "62%", textAlign: "center", verticalAlign: "top" }}>
              <div dir="rtl" style={{ fontSize: "21px", fontWeight: "bold", color: RED, marginBottom: "2px" }}>
                {c.nameAr || ""}
              </div>
              <div style={{ fontSize: "17px", fontWeight: "bold", color: "#000", marginBottom: "6px" }}>
                {c.nameEn || ""}
              </div>
              <div style={{ background: GRAY, padding: "6px 22px", display: "inline-block", border: "1px solid #555" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#000" }}>TAX INVOICE</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#000" }}> - </span>
                <span dir="rtl" style={{ fontSize: "15px", fontWeight: "bold", color: "#000" }}>فاتورة ضريبية</span>
              </div>
            </td>
            <td style={{ width: "15%", textAlign: "center", verticalAlign: "top" }}>
              <img src={qrUrl} alt="QR" style={{ width: "104px", height: "104px", objectFit: "contain" }} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== META BOX ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", border: "0.75pt solid #000" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", padding: "0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "35%", fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER, borderRight: BORDER }}>Worked Month:</td>
                    <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>{data.workedMonth || ""}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER, borderRight: BORDER }}>Invoice. No:</td>
                    <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>{data.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER, borderRight: BORDER }}>Payment:</td>
                    <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>{data.paymentType || "Credit"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderRight: BORDER }}>Cashier:</td>
                    <td dir="rtl" style={{ textAlign: "right", fontSize: "9.5pt", padding: "3px 8px" }}>{data.cashier || ""}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={{ width: "50%", verticalAlign: "top", padding: "0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "30%", fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>Date:</td>
                    <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>{dateStr}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>Time:</td>
                    <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>{timeStr}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>Due Date:</td>
                    <td style={{ fontSize: "9.5pt", padding: "3px 8px", borderBottom: BORDER }}>{data.dueDate || ""}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold", fontSize: "9.5pt", padding: "3px 8px" }}>PO No:</td>
                    <td style={{ fontSize: "9.5pt", padding: "3px 8px" }}>{data.poNumber || ""}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== COMPANY / CLIENT ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
        <tbody>
          <tr>
            <td style={{ width: "48%", verticalAlign: "top", padding: "4px 8px", fontSize: "9.5pt", lineHeight: 1.5 }}>
              <div><strong>Company: </strong>{c.nameEn || ""}</div>
              {c.nameAr && <div dir="rtl" style={{ textAlign: "left", marginTop: "2px" }}>{c.nameAr}</div>}
              {c.crNo && <div style={{ marginTop: "3px" }}>{c.crNo}</div>}
              <div><strong>VAT No: </strong>{c.vatNo || ""} <span dir="rtl"> :الرقم الضريبي</span></div>
              <div style={{ marginTop: "3px" }}><strong>Address:</strong></div>
              {c.address ? <div>{c.address}</div> : (<><div>Saudi Arabia - Yanbu Al Bahr -</div><div>P.O.Box : 2326</div><div dir="rtl" style={{ textAlign: "right", marginTop: "2px" }}>المملكة العربية السعودية - ينبع البحر - ص . ب 2326:</div></>)}
              {c.email && <div style={{ marginTop: "3px" }}><strong>Email: </strong><span style={{ color: "#0563C1", textDecoration: "underline" }}>{c.email}</span></div>}
              {data.poNumber && <div style={{ marginTop: "3px" }}><strong>PO : </strong>{data.poNumber}</div>}
            </td>
            <td style={{ width: "4px", borderLeft: "4px solid #000000" }}></td>
            <td style={{ width: "48%", verticalAlign: "top", padding: "4px 8px", fontSize: "9.5pt", lineHeight: 1.5 }}>
              <div><strong>Client : </strong></div>
              <div>{cust.name || ""}{cust.nameAr ? `, ${cust.nameAr}` : ""}</div>
              {cust.vatNo && <div style={{ marginTop: "3px" }}><strong>Tax No. </strong>{cust.vatNo}</div>}
              {cust.address && <div style={{ marginTop: "3px" }}>{cust.address}</div>}
              {cust.crNo && <div style={{ marginTop: "3px" }}><strong>CR </strong>{cust.crNo}</div>}
              {cust.phone && <div style={{ marginTop: "3px" }}>{cust.phone}</div>}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== ITEMS (bilingual double header, Excel order) ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th style={{ ...thGray, width: "7%" }} dir="rtl">تسلسل</th>
            <th style={{ ...thGray, width: "24%" }} dir="rtl">المسمى الوظيفي</th>
            <th style={{ ...thGray, width: "6.5%" }} dir="rtl">الوحدة</th>
            <th style={{ ...thGray, width: "7.5%" }} dir="rtl">مجموع الساعات</th>
            <th style={{ ...thGray, width: "11.5%" }} dir="rtl">سعر الساعة</th>
            <th style={{ ...thGray, width: "11.5%" }} dir="rtl">الإجمالي</th>
            <th style={{ ...thGray, width: "9%" }} dir="rtl">ض القيمة المضافة</th>
            <th style={{ ...thGray, width: "19%" }} dir="rtl">الاجمالي بالضريبة</th>
          </tr>
          <tr>
            <th style={{ ...thBlue, width: "7%" }}>Sr. No.</th>
            <th style={{ ...thBlue, width: "24%" }}>Job Description</th>
            <th style={{ ...thBlue, width: "6.5%" }}>Unit</th>
            <th style={{ ...thBlue, width: "7.5%" }}>Total<br />Hour</th>
            <th style={{ ...thBlue, width: "11.5%" }}>Rate/ Hour</th>
            <th style={{ ...thBlue, width: "11.5%" }}>Total</th>
            <th style={{ ...thBlue, width: "9%" }}>VAT<br />15%</th>
            <th style={{ ...thBlue, width: "19%" }}>Grand Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sr}>
              <td style={{ ...tdC, height: "34px" }}>{r.sr}</td>
              <td style={{ ...tdL, height: "34px" }}>{r.descriptionEn || ""}{r.descriptionAr && <span dir="rtl"> ({r.descriptionAr})</span>}</td>
              <td style={{ ...tdC, height: "34px" }}>{r.unit || ""}</td>
              <td style={{ ...tdC, height: "34px" }}>{fmtNum(r.totalHour)}</td>
              <td style={{ ...tdR, height: "34px" }}>{formatMoney(r.rate)}</td>
              <td style={{ ...tdR, height: "34px" }}>{formatMoney(r.lineTotal)}</td>
              <td style={{ ...tdR, height: "34px" }}>{fmtVat(r.vat)}</td>
              <td style={{ ...tdR, height: "34px", fontWeight: 600 }}>{formatMoney(r.grand)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={8} style={{ ...tdC, height: "34px", color: "#999" }}>—</td></tr>
          )}
          <tr>
            <td colSpan={3} style={{ border: BORDER, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt" }}>Total</td>
            <td style={{ border: BORDER, padding: "4px 6px", textAlign: "center", fontWeight: "bold", fontSize: "10pt" }}>{fmtNum(totalHours)}</td>
            <td style={{ border: BORDER }}></td>
            <td style={{ border: BORDER, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt" }}>{formatMoney(subtotal)}</td>
            <td style={{ border: BORDER, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt" }}>{fmtVat(vatAmount)}</td>
            <td style={{ border: BORDER, padding: "4px 6px", textAlign: "right", fontWeight: "bold", fontSize: "10pt" }}>{formatMoney(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== TOTALS ===== */}
      <table style={{ width: "230px", marginLeft: "auto", marginTop: "8px", borderCollapse: "collapse", fontSize: "10pt" }}>
        <tbody>
          <tr>
            <td style={{ textAlign: "right", padding: "4px 6px" }} dir="rtl"><b>الإجمالي بدون الضريبة</b></td>
            <td style={{ textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>{formatMoney(subtotal)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "right", padding: "4px 6px" }} dir="rtl"><b>ض. القيمة المضافة 15%</b></td>
            <td style={{ textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>{formatMoney(vatAmount)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "right", padding: "5px 8px", border: "0.75pt double #000", fontWeight: "bold" }} dir="rtl">إجمالي المبالغ المستحقة</td>
            <td style={{ textAlign: "right", padding: "5px 8px", border: "0.75pt double #000", fontWeight: "bold", fontSize: "12pt" }}>{formatMoney(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ===== WORDS ===== */}
      <div style={{ marginTop: "8px", borderTop: "0.5pt solid #000", paddingTop: "5px", fontSize: "9.5pt" }}>
        <strong>Due</strong>&nbsp;&nbsp;{numberToEnglishWords(grandTotal)}&nbsp;&nbsp;<strong>{c.currency || "SAR"}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;<span dir="rtl"><strong>إجمالي المبالغ المستحقة</strong></span>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ width: "100%", background: GRAY, textAlign: "center", padding: "10px 0", marginTop: "16px" }}>
        <span style={{ fontSize: "15px", fontWeight: "bold", color: "#000" }}>Website: {c.website || "www.yafco.com.sa"}</span>
      </div>
    </div>
  );
}

const ConstructionInvoiceExcel = forwardRef<ConstructionInvoiceExcelHandle, { data: CInvPrintData }>(
  function ConstructionInvoiceExcel({ data }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Fit the whole sheet inside the available screen area (any screen size).
    const fit = useCallback(() => {
      const wrap = wrapRef.current;
      const sheet = sheetRef.current;
      if (!wrap || !sheet) return;
      const availW = Math.max(200, wrap.clientWidth - 16);
      const availH = Math.max(200, wrap.clientHeight - 16 || window.innerHeight - 260);
      const needW = sheet.scrollWidth || DESIGN_W;
      const needH = sheet.scrollHeight || 1000;
      setScale(Math.min(1, availW / needW, availH / needH));
    }, []);

    useLayoutEffect(() => {
      fit();
      window.addEventListener("resize", fit);
      const t = setTimeout(fit, 500);
      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined" && wrapRef.current) {
        ro = new ResizeObserver(fit);
        ro.observe(wrapRef.current);
      }
      return () => {
        window.removeEventListener("resize", fit);
        clearTimeout(t);
        ro?.disconnect();
      };
    }, [fit, data]);

    const downloadPdf = useCallback(async () => {
      const node = pdfRef.current;
      if (!node) throw new Error("Print view not ready");
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const img = canvas.toDataURL("image/png");
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = 210;
      const pageH = 297;
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;
      let rendered = 0;
      let first = true;
      while (rendered < imgH) {
        if (!first) pdf.addPage();
        first = false;
        pdf.addImage(img, "PNG", 0, -rendered, imgW, imgH);
        rendered += pageH;
      }
      pdf.save(`Invoice-${data.invoiceNo || "draft"}.pdf`);
    }, [data.invoiceNo]);

    useImperativeHandle(ref, () => ({ downloadPdf }), [downloadPdf]);

    useEffect(() => {
      document.title = `Invoice ${data.invoiceNo}`;
      return () => { document.title = "YASCO - Enterprise Resource Planning System"; };
    }, [data.invoiceNo]);

    return (
      <>
        <style>{`
          @page { size: A4 portrait; margin: 0; }
          @media print {
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { margin: 0 !important; }
            body > *:not(#invoice-excel-print) { display: none !important; }
            #invoice-excel-print { display: block !important; }
            .excel-sheet-print { position: static !important; width: 210mm !important; margin: 0 auto !important; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}</style>
        {/* Screen: fitted to viewport */}
        <div ref={wrapRef} style={{ width: "100%", height: "100%", minHeight: "320px", display: "flex", alignItems: "flex-start", justifyContent: "center", overflow: "auto", background: "#fff" }}>
          <div ref={sheetRef} style={{ width: `${DESIGN_W}px`, flex: "0 0 auto", transform: `scale(${scale})`, transformOrigin: "top center", boxShadow: "0 0 12px rgba(0,0,0,.12)" }}>
            <Sheet data={data} />
          </div>
        </div>
        {/* Off-screen full-size render: PDF capture + Ctrl+P source */}
        <div id="invoice-excel-print" ref={pdfRef} className="excel-sheet-print" style={{ position: "fixed", left: "-12000px", top: 0, width: `${DESIGN_W}px`, background: "#fff" }}>
          <Sheet data={data} />
        </div>
      </>
    );
  },
);

export default ConstructionInvoiceExcel;
