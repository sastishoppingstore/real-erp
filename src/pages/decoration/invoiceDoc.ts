/**
 * Decoration & Construction — ZATCA invoice document renderer.
 *
 * The PDF is produced by the browser's own print engine from this HTML:
 * that keeps Arabic shaping perfect (no embedded Arabic font required) and
 * gives a genuine "Save as PDF" result with the letterhead already in place.
 */

export type InvoiceDocLine = {
  descriptionEn: string;
  descriptionAr: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  lineTotal: number;
  vatPercent: number;
};

export type InvoiceDoc = {
  invoice: {
    id: number;
    invoiceNo: string;
    invoiceType: string;
    billingType: string;
    invoiceDate: string;
    dueDate: string;
    status: string;
    zatcaStatus: string | null;
    currency: string;
  };
  lines: InvoiceDocLine[];
  project: { id: number; code: string; nameEn: string; nameAr?: string | null; city?: string | null } | null;
  client: {
    id: number;
    nameEn: string;
    nameAr?: string | null;
    vatNumber?: string | null;
    crNumber?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
  seller: {
    nameEn: string;
    nameAr: string;
    vatNumber: string;
    crNumber: string;
    address: string;
    phone: string;
    email: string;
    logo: string;
  };
  totals: {
    subtotal: number;
    discount: number;
    retention: number;
    advanceRecovery: number;
    penalty: number;
    net: number;
    vatPercent: number;
    vat: number;
    total: number;
    paid: number;
    balance: number;
  };
  zatca: {
    uuid: string;
    hash: string;
    mode: string;
    typeCode: string;
    qrPayload: string;
    qrDataUrl: string;
    xml: string;
  };
};

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

const n2 = (v: number) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const docTitle = (type: string) => {
  switch (type) {
    case "simplified":
      return { en: "SIMPLIFIED TAX INVOICE", ar: "فاتورة ضريبية مبسطة" };
    case "credit_note":
      return { en: "CREDIT NOTE", ar: "إشعار دائن ضريبي" };
    case "debit_note":
      return { en: "DEBIT NOTE", ar: "إشعار مدين ضريبي" };
    default:
      return { en: "TAX INVOICE", ar: "فاتورة ضريبية" };
  }
};

/** Build the complete print-ready HTML for a decoration invoice. */
export function invoiceHtml(doc: InvoiceDoc): string {
  const title = docTitle(doc.invoice.invoiceType);
  const t = doc.totals;
  const rows = doc.lines
    .map(
      (l, i) => `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc(l.descriptionEn)}<div class="ar">${esc(l.descriptionAr)}</div></td>
        <td class="r">${n2(l.quantity)}</td>
        <td class="c">${esc(l.uom)}</td>
        <td class="r">${n2(l.unitPrice)}</td>
        <td class="r">${n2(l.vatPercent)}%</td>
        <td class="r b">${n2(l.lineTotal)}</td>
      </tr>`,
    )
    .join("");

  const totalRow = (labelEn: string, labelAr: string, value: number, strong = false, negative = false) => `
    <tr class="${strong ? "strong" : ""}">
      <td class="lbl">${esc(labelEn)} <span class="ar">${esc(labelAr)}</span></td>
      <td class="r">${negative ? "−" : ""}${n2(Math.abs(value))}</td>
    </tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(doc.invoice.invoiceNo)} — ${esc(title.en)}</title>
<style>
  @page { size: A4; margin: 12mm 12mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: "Inter","Segoe UI",Arial,sans-serif; color:#10231c; margin:0; font-size:11px; }
  .ar { font-family: "Tajawal","Segoe UI",Tahoma,sans-serif; direction: rtl; }
  .head { display:flex; justify-content:space-between; gap:18px; border-bottom:3px solid #0f5132; padding-bottom:10px; }
  .seller { display:flex; gap:10px; align-items:flex-start; }
  .logo { max-height:64px; max-width:110px; object-fit:contain; }
  .seller h1 { font-size:15px; margin:0 0 2px; letter-spacing:-.2px; }
  .seller p { margin:1px 0; font-size:9.5px; color:#4b5a53; }
  .head-ar { text-align:right; }
  .head-ar h1 { font-size:14px; margin:0 0 2px; }
  .head-ar p { margin:1px 0; font-size:9.5px; color:#4b5a53; }
  .band { margin:12px 0 0; background:linear-gradient(90deg,#0f5132,#14794a); color:#fff; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-radius:3px; }
  .band b { font-size:14px; letter-spacing:.04em; }
  .band span { font-size:11px; opacity:.9; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border:1px solid #e6e1d6; border-top:none; }
  .cell { padding:6px 10px; border-bottom:1px solid #eee9df; }
  .cell:nth-child(odd) { border-inline-end:1px solid #eee9df; }
  .cell small { display:block; font-size:8px; text-transform:uppercase; letter-spacing:.09em; color:#8a7a5c; margin-bottom:1px; }
  .cell strong { font-weight:600; font-size:10.5px; }
  table.items { width:100%; border-collapse:collapse; margin-top:12px; }
  table.items thead th { background:#0f5132; color:#fff; font-size:9px; font-weight:600; padding:7px 8px; text-align:left; letter-spacing:.03em; }
  table.items td { padding:6px 8px; border-bottom:1px solid #eee9df; font-size:9.5px; vertical-align:top; }
  table.items tbody tr:nth-child(even) { background:#faf8f4; }
  .c { text-align:center; } .r { text-align:right; } .b { font-weight:700; }
  .bottom { display:flex; gap:14px; margin-top:14px; align-items:flex-start; }
  .totals { flex:1; border:1px solid #e6e1d6; border-radius:3px; overflow:hidden; }
  .totals table { width:100%; border-collapse:collapse; }
  .totals td { padding:5px 10px; border-bottom:1px solid #eee9df; font-size:10px; }
  .totals tr:last-child td { border-bottom:none; }
  .totals tr.strong td { background:#f7f5f0; font-weight:700; color:#0f5132; }
  .totals .lbl { text-align:left; }
  .qrbox { width:150px; text-align:center; border:1px solid #e6e1d6; border-radius:3px; padding:8px; }
  .qrbox img { width:118px; height:118px; image-rendering:pixelated; }
  .qrbox p { margin:4px 0 0; font-size:8px; color:#8a7a5c; }
  .zid { margin-top:12px; border:1px dashed #d9cdb4; background:#fcfaf5; padding:8px 10px; font-size:8px; color:#6b5f47; line-height:1.5; word-break:break-all; }
  .zid b { color:#0f5132; }
  .sign { display:flex; justify-content:space-between; margin-top:26px; gap:20px; }
  .sign div { flex:1; border-top:1px solid #c9bfa9; padding-top:5px; font-size:8.5px; color:#8a7a5c; text-align:center; }
  .foot { margin-top:12px; border-top:1px solid #e6e1d6; padding-top:6px; display:flex; justify-content:space-between; font-size:8px; color:#8a7a5c; }
  @media print { .no-print { display:none !important; } }
</style>
</head>
<body>
  <div class="head">
    <div class="seller">
      ${doc.seller.logo ? `<img class="logo" src="${esc(doc.seller.logo)}" alt="logo" />` : ""}
      <div>
        <h1>${esc(doc.seller.nameEn)}</h1>
        <p>${esc(doc.seller.address)}</p>
        <p>VAT No: <strong>${esc(doc.seller.vatNumber || "—")}</strong> &nbsp;·&nbsp; C.R. No: ${esc(doc.seller.crNumber || "—")}</p>
        <p>${esc(doc.seller.phone)}${doc.seller.email ? " · " + esc(doc.seller.email) : ""}</p>
      </div>
    </div>
    <div class="head-ar ar">
      <h1>${esc(doc.seller.nameAr)}</h1>
      <p>${esc(doc.seller.address)}</p>
      <p>الرقم الضريبي: <strong>${esc(doc.seller.vatNumber || "—")}</strong> &nbsp;·&nbsp; السجل التجاري: ${esc(doc.seller.crNumber || "—")}</p>
      <p>${esc(doc.seller.phone)}${doc.seller.email ? " · " + esc(doc.seller.email) : ""}</p>
    </div>
  </div>

  <div class="band">
    <b>${esc(title.en)}</b>
    <b class="ar">${esc(title.ar)}</b>
    <span># ${esc(doc.invoice.invoiceNo)}</span>
  </div>

  <div class="grid">
    <div class="cell"><small>Invoice No · رقم الفاتورة</small><strong>${esc(doc.invoice.invoiceNo)}</strong></div>
    <div class="cell"><small>Invoice date · تاريخ الفاتورة</small><strong>${esc(doc.invoice.invoiceDate)}</strong></div>
    <div class="cell"><small>Due date · تاريخ الاستحقاق</small><strong>${esc(doc.invoice.dueDate || "—")}</strong></div>
    <div class="cell"><small>Billing type · نوع الفاتورة</small><strong>${esc(doc.invoice.billingType.replace(/_/g, " "))}</strong></div>
    <div class="cell"><small>Project · المشروع</small><strong>${esc(doc.project ? `${doc.project.code} — ${doc.project.nameEn}` : "—")}</strong></div>
    <div class="cell"><small>Client · العميل</small><strong>${esc(doc.client?.nameAr || doc.client?.nameEn || "—")}</strong></div>
    <div class="cell"><small>Client VAT · الرقم الضريبي للعميل</small><strong>${esc(doc.client?.vatNumber || "—")}</strong></div>
    <div class="cell"><small>Status · الحالة</small><strong>${esc(doc.invoice.status)}</strong></div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:26px">#</th>
        <th>Description · الوصف</th>
        <th style="width:54px" class="r">Qty</th>
        <th style="width:40px" class="c">UOM</th>
        <th style="width:70px" class="r">Unit price</th>
        <th style="width:44px" class="r">VAT</th>
        <th style="width:74px" class="r">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="bottom">
    <div class="totals">
      <table>
        ${totalRow("Subtotal", "المجموع الفرعي", t.subtotal)}
        ${t.discount ? totalRow("Discount", "الخصم", t.discount, false, true) : ""}
        ${t.retention ? totalRow("Retention", "المحتجز", t.retention, false, true) : ""}
        ${t.advanceRecovery ? totalRow("Advance recovery", "استرداد الدفعة المقدمة", t.advanceRecovery, false, true) : ""}
        ${t.penalty ? totalRow("Penalty / LD", "الغرامات", t.penalty, false, true) : ""}
        ${totalRow("Taxable amount", "المبلغ الخاضع للضريبة", t.net, true)}
        ${totalRow(`VAT ${t.vatPercent}%`, `ضريبة القيمة المضافة ${t.vatPercent}%`, t.vat)}
        ${totalRow("Total incl. VAT", "الإجمالي شامل الضريبة", t.total, true)}
        ${t.paid ? totalRow("Paid", "المدفوع", t.paid, false, true) : ""}
        ${totalRow("Balance due", "الرصيد المستحق", t.balance, true)}
      </table>
    </div>
    <div class="qrbox">
      <img src="${esc(doc.zatca.qrDataUrl)}" alt="ZATCA QR" />
      <p>ZATCA Phase-2 QR<br/>رمز الاستجابة السريعة</p>
    </div>
  </div>

  <div class="zid">
    <b>UUID:</b> ${esc(doc.zatca.uuid)}<br/>
    <b>Invoice hash (SHA-256):</b> ${esc(doc.zatca.hash)}<br/>
    <b>Mode:</b> ${esc(doc.zatca.mode)} &nbsp;·&nbsp; <b>Type code:</b> ${esc(doc.zatca.typeCode)} &nbsp;·&nbsp; <b>Currency:</b> SAR
  </div>

  <div class="sign">
    <div>Prepared by · أعدّه</div>
    <div>Approved by · اعتمده</div>
    <div>Client signature · توقيع العميل</div>
  </div>

  <div class="foot">
    <span>Generated electronically by YASCO ERP — Decoration &amp; Construction</span>
    <span>${esc(doc.invoice.invoiceNo)}</span>
  </div>
</body>
</html>`;
}

/** Open the invoice in a new tab and trigger the print dialog (Save as PDF). */
export function printInvoiceDoc(doc: InvoiceDoc) {
  const w = window.open("", "_blank", "width=920,height=760");
  if (!w) return;
  w.document.open();
  w.document.write(invoiceHtml(doc));
  w.document.close();
  // Let the QR image decode before the print dialog opens.
  setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch {
      /* user can print manually */
    }
  }, 350);
}

/** Turn a base64 payload returned by the API into a normal browser download. */
export function downloadBase64(filename: string, base64: string, mime = "application/octet-stream") {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download plain text (XML) without the base64 round-trip. */
export function downloadText(filename: string, text: string, mime = "application/xml") {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}