import { numberToEnglishWords } from "@/lib/numberToWords";

export function generateInvoiceHtml(params: {
  companyName: string;
  companyNameAr?: string;
  companyLogo?: string;
  companyStamp?: string;
  companySignature?: string;
  companyAddress?: string;
  companyAddressAr?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyUnifiedNatlNo?: string;
  companyCrNumber?: string;
  companyTaxNumber?: string;
  currency: string;
  taxPercent: string;
  note?: string;
  invoiceNumber?: string;
  invDate?: string;
  dueDate?: string;
  invTime?: string;
  paymentMethod?: string;
  cashier?: string;
  poNumber?: string;
  workedMonth?: string;
  pSub: number;
  pDisc: number;
  pVat: number;
  pTotal: number;
  pCustName: string;
  pCustPhone: string;
  pCustAddr: string;
  pCustVat: string;
  pCustEmail?: string;
  pCustCr?: string;
  pCustWebsite?: string;
  pType: string;
  printItems: Array<{ no: number; name: string; qty: number; rate: number; total: number }>;
}) {
  const {
    companyName, companyNameAr, companyLogo, companyStamp, companySignature,
    companyAddress, companyAddressAr, companyPhone, companyEmail, companyWebsite,
    companyUnifiedNatlNo, companyCrNumber, companyTaxNumber,
    currency, taxPercent, note, invoiceNumber, invDate, dueDate, invTime,
    paymentMethod, cashier, poNumber, workedMonth,
    pSub, pDisc, pVat, pTotal,
    pCustName, pCustPhone, pCustAddr, pCustVat, pCustEmail, pCustCr, pCustWebsite,
    pType, printItems,
  } = params;

  const taxRate = Number(taxPercent && Number(taxPercent) > 0 ? taxPercent : 15);
  const today = new Date();
  const fmtDate = (d?: string) => (d ? new Date(d + "T00:00:00").toISOString().slice(0, 10).replace(/-/g, "/") : "");
  const monthLabel = (d?: string) => {
    if (!d) return "";
    const dd = new Date(d);
    if (isNaN(dd.getTime())) return "";
    return dd.toLocaleString("en-US", { month: "long", year: "numeric" });
  };
  const nowTimeStr = invTime || today.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const arDigits = (s: string) => s.replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
  const fmtMoney = (n: number) => `${currency} ${Number(n || 0).toFixed(2)}`;

  const amountInWords = () => {
    const intPart = Math.floor(pTotal);
    const cents = Math.round((pTotal - intPart) * 100);
    const w = numberToEnglishWords(intPart) || String(intPart);
    return `${w}${cents > 0 ? ` and ${cents}/100` : ""} only.`;
  };

  const rows = (printItems || []).map((i) => {
    const hours = Number(i.qty || 1);
    const rate = Number(i.rate || 0);
    const total = Number(i.total || (hours * rate));
    const vat = Number(((total * taxRate) / 100).toFixed(2));
    const grand = Number((total + vat).toFixed(2));
    return `<tr>
      <td style="text-align:center">${i.no}</td>
      <td>${i.name}</td>
      <td style="text-align:center">${hours % 1 === 0 ? hours : hours.toFixed(2)}</td>
      <td style="text-align:right">${rate.toFixed(2)}</td>
      <td style="text-align:right">${total.toFixed(2)}</td>
      <td style="text-align:right">${vat.toFixed(2)}</td>
      <td style="text-align:right"><strong>${grand.toFixed(2)}</strong></td>
    </tr>`;
  });
  const sumHours = (printItems || []).reduce((s, i) => s + Number(i.qty || 1), 0);
  const grandTotalAll = Number(((pTotal || 0) + 0).toFixed(2));

  return `<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bill - ${companyName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;padding:6mm}
.invoice{max-width:900px;margin:0 auto;background:#fff;padding:18mm;box-shadow:0 0 12px rgba(0,0,0,.10)}
.hdr{display:flex;gap:14px;align-items:flex-start;border-bottom:3px solid #1e3a8a;padding-bottom:14px;margin-bottom:16px}
.col-logo{min-width:150px;text-align:left}
.col-logo img{max-width:140px;height:auto}
.col-meta{font-size:10px;color:#222;margin-top:6px;line-height:1.5}
.col-meta span{font-weight:700}
.col-stamp{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.col-stamp img{max-width:110px;max-height:110px;opacity:0.90}
.col-stamp .stamp-text{font-size:9px;color:#333;margin-top:4px}
.col-co{min-width:210px;text-align:right;font-size:10px;line-height:1.5}
.col-co .co-name{font-size:15px;font-weight:900;color:#1e3a8a;margin-bottom:2px}
.col-co .co-name-ar{font-size:12px;color:#1d4ed8;margin-bottom:4px}
.title{text-align:center;background:linear-gradient(135deg,#1e3a8a,#1d4ed8);color:#fff;padding:9px;margin:16px 0;font-size:16px;font-weight:700;border-radius:5px;letter-spacing:.3px}
.bill-to{background:#f9f9ff;border:1px solid #e3e8ef;padding:10px 12px;margin:12px 0;border-radius:5px;font-size:10px;line-height:1.6}
.bill-to strong{color:#1e3a8a}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:9.5px}
th{background:#1e3a8a;color:#fff;padding:6px 4px;text-align:center;font-weight:700;line-height:1.2}
td{padding:5px 4px;border:1px solid #e0e4ea;font-size:9.5px}
tr:nth-child(even){background:#f9f9ff}
tfoot td{background:#eef3ff}
.totals{margin-top:12px;border:1px solid #e3e8ef;border-radius:5px;overflow:hidden}
.trow{display:flex;justify-content:space-between;padding:7px 14px;font-size:11px;font-weight:600}
.trow.last{background:linear-gradient(135deg,#1d4ed8,#1e3a8a);color:#fff;font-size:14px;font-weight:900}
.trow.gray{background:#f5f5ff;font-weight:600}
.words{margin-top:10px;font-size:10px;color:#222;line-height:1.5;border:1px dashed #ccc;padding:8px;border-radius:4px}
.footer-box{margin-top:16px;padding-top:12px;border-top:2px solid #ddd;font-size:9.5px;color:#222}
.footer-box .fl{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
.foot-left{text-align:left;font-size:9.5px;line-height:1.6}
.foot-right{text-align:right;font-size:9.5px;line-height:1.6}
.foot-right strong{color:#1e3a8a}
.thanks{margin-top:12px;text-align:center;font-weight:700;color:#1e3a8a;font-size:12px}
@media print{body{background:#fff;padding:0}.invoice{box-shadow:none;margin:0;page-break-inside:avoid}}
</style></head><body>
<div class="invoice">

  <div class="hdr">
    <div class="col-logo">
      ${companyLogo ? `<img src="${companyLogo}" alt="Logo">` : ""}
      <div class="col-meta">
        ${workedMonth || monthLabel(invDate) ? `<div><span>Worked Month:</span> ${workedMonth || monthLabel(invDate)}</div>` : ""}
        <div><span>Invoice No:</span> ${invoiceNumber || "-"}</div>
        <div><span>Payment:</span> ${paymentMethod || "Credit"}</div>
        <div><span>Cashier:</span> ${cashier || "مدير النظام"}</div>
      </div>
    </div>
    <div class="col-stamp">
      ${companyStamp ? `<img src="${companyStamp}" alt="Stamp">` : `<div style="width:110px;height:110px;border:2px dashed #bbb;border-radius:50%"></div>`}
      <div class="stamp-text">${companyUnifiedNatlNo ? `Unified Natl. No. ${companyUnifiedNatlNo}` : "Unified Natl. No. 7011789505"}</div>
    </div>
    <div class="col-co">
      <div class="co-name">${companyName || "YAFCO AL ARABIAH EST."}</div>
      ${companyNameAr ? `<div class="co-name-ar">${companyNameAr}</div>` : `<div class="co-name-ar">مؤسسة يافكو العربية</div>`}
      ${companyTaxNumber || companyCrNumber ? `<div><span>VAT No:</span> ${companyTaxNumber || "4700012896"}</div>` : ""}
      ${companyCrNumber ? `<div><span>CR No:</span> ${companyCrNumber}</div>` : ""}
      <div><span>Email:</span> ${companyEmail || "info@yafco.com.sa"}</div>
      <div><span>PO:</span> ${poNumber || "-"}</div>
      ${companyAddress ? `<div>${companyAddress}</div>` : ""}
      ${companyAddressAr ? `<div>${companyAddressAr}</div>` : ""}
    </div>
  </div>

  <div class="title">TAX INVOICE / فاتورة ضريبية</div>

  <div class="bill-to">
    <strong>Bill To / إلى عناوين:</strong>
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:110px"><strong>Client:</strong> ${pCustName || "-"}</div>
      ${pCustVat ? `<div style="flex:1"><strong>Tax No:</strong> ${pCustVat}</div>` : ""}
      ${pCustCr ? `<div style="flex:1"><strong>CR:</strong> ${pCustCr}</div>` : ""}
      <div style="flex:1;min-width:110px"><strong>Website:</strong> ${pCustWebsite || companyWebsite || "-"}</div>
      ${pCustAddr ? `<div style="flex:1"><strong>Address:</strong> ${pCustAddr}</div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sr. No. / تسلسل</th>
        <th>Job Description / المسمى الوظيفي</th>
        <th>Total Hour / مجموع الساعات</th>
        <th>Rate/Hour Unit / سعر الساعة الوحدة</th>
        <th>Total / الإجمالي</th>
        <th>VAT ${taxRate}% / ض القيمة المضافة</th>
        <th>Grand Total / الاجمالي بالضريبة</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join("")}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">Hours Footer / مجموع الساعات</td>
        <td style="text-align:center"><strong>${sumHours % 1 === 0 ? sumHours : sumHours.toFixed(2)}</strong></td>
        <td></td><td></td><td></td><td></td>
      </tr>
    </tfoot>
  </table>

  <div class="totals">
    <div class="trow gray"><span>Subtotal / الاجمالي بدون الضريبة</span><span>${fmtMoney(pSub)}</span></div>
    ${pDisc > 0 ? `<div class="trow gray"><span>Discount / الخصم</span><span>-${fmtMoney(pDisc)}</span></div>` : ""}
    <div class="trow gray"><span>VAT ${taxRate}% / القيمة المضافة ${arDigits(String(taxRate))}%</span><span>${fmtMoney(pVat)}</span></div>
    <div class="trow last"><span>Due / إجمالي المبالغ المستحقة</span><span>${fmtMoney(pTotal)}</span></div>
  </div>

  ${note ? `<div class="words"><strong>Note / ملاحظة:</strong> ${note}</div>` : ""}
  <div class="words">
    <strong>Amount in Words / المبلغ بالكلمات:</strong> ${amountInWords()}
    <div style="margin-top:4px">(${arDigits(fmtMoney(pTotal))})</div>
  </div>

  <div class="footer-box">
    <div class="fl">
      <div class="foot-left">
        <div><strong>Date:</strong> ${fmtDate(invDate || today.toISOString().slice(0,10))}</div>
        <div><strong>Time:</strong> ${nowTimeStr}</div>
        <div><strong>Due Date:</strong> ${fmtDate(dueDate)}</div>
      </div>
      <div class="foot-right">
        ${pCustName ? `<div><strong>Client:</strong> ${pCustName}</div>` : ""}
        ${pCustVat ? `<div><strong>Tax No:</strong> ${pCustVat}</div>` : ""}
        ${pCustCr ? `<div><strong>CR:</strong> ${pCustCr}</div>` : ""}
        ${pCustAddr ? `<div><strong>Address:</strong> ${pCustAddr}</div>` : ""}
        ${pCustEmail ? `<div><strong>Email:</strong> ${pCustEmail}</div>` : ""}
        ${pCustWebsite ? `<div><strong>Website:</strong> ${pCustWebsite}</div>` : ""}
        ${companySignature ? `<div style="margin-top:6px">${`<img src="${companySignature}" alt="Signature" style="max-width:110px;max-height:50px;opacity:0.85">`}</div>` : ""}
      </div>
    </div>
  </div>

  <div class="thanks">شكراً لتعاملكم معنا / Thank You For Your Business!</div>
</div>
<script>window.onload=function(){window.print();}</script></body></html>`;
}
