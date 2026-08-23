// Shared invoice HTML generator for both View (WYSIWYG) and Print
// This is a .ts file (not .tsx) to avoid JSX parsing of CSS braces

export function generateInvoiceHtml(params: {
  companyName: string;
  companyNameAr?: string;
  companyLogo?: string;
  companyStamp?: string;
  companyAddress?: string;
  companyAddressAr?: string;
  companyPhone?: string;
  companyVat?: string;
  companyCr?: string;
  companyEmail?: string;
  companyWebsite?: string;
  currency: string;
  taxPercent: string;
  note?: string;
  noteAr?: string;
  pSub: number;
  pDisc: number;
  pVat: number;
  pTotal: number;
  pCustName: string;
  pCustNameAr?: string;
  pCustPhone: string;
  pCustAddr: string;
  pCustAddrAr?: string;
  pCustVat: string;
  pCustCr?: string;
  pType: string;
  workedMonth?: string;
  invoiceNo?: string;
  paymentType?: string;
  cashier?: string;
  date?: string;
  time?: string;
  dueDate?: string;
  poNumber?: string;
  dueInWords?: string;
  qrBase64?: string;
  printItems: Array<{ no: number; name: string; nameAr?: string; unit?: string; totalHour?: number; rate: number; total: number; vat?: number; grandTotal?: number }>;
}) {
  const {
    companyName, companyNameAr, companyLogo, companyStamp, companyAddress, companyAddressAr, companyPhone, companyVat, companyCr, companyEmail, companyWebsite,
    currency, taxPercent, note, noteAr, pSub, pDisc, pVat, pTotal,
    pCustName, pCustNameAr, pCustPhone, pCustAddr, pCustAddrAr, pCustVat, pCustCr, pType,
    workedMonth, invoiceNo, paymentType, cashier, date, time, dueDate, poNumber, dueInWords, qrBase64, printItems
  } = params;

  const qrSrc = qrBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify({ seller: companyNameAr || companyName, vat: companyVat, total: pTotal.toFixed(2), tax: pVat.toFixed(2), date: new Date().toISOString() })))))}`;

  const totalHours = printItems.reduce((s, i) => s + (i.totalHour || 0), 0);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>Bill - ${companyName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Calibri,Arial,sans-serif;background:#f5f5f5;padding:10mm;font-size:11pt}
.invoice{max-width:800px;margin:0 auto;background:#fff;padding:20mm;box-shadow:0 0 10px rgba(0,0,0,.1)}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e3a8a;padding-bottom:15px;margin-bottom:20px;gap:20px}
.logo-box{width:128px;height:128px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.logo-box img{max-width:128px;max-height:128px;object-fit:contain;aspect-ratio:1/1}
.qr-box{width:128px;height:128px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.qr-box img{width:128px;height:128px;object-fit:contain;aspect-ratio:1/1}
.company-center{flex:1;text-align:center;padding:0 15px}
.company-center h1{font-size:20pt;color:#A6272C;font-weight:bold;margin-bottom:2px}
.company-center h2{font-size:14pt;color:#1e3a8a;font-weight:bold;margin-bottom:6px}
.company-center p{font-size:9.5pt;color:#333;margin:1px 0}
.title-bar{text-align:center;background:#E7E7E7;padding:8pt;margin:10pt 0;border-top:1pt solid #000;border-bottom:1pt solid #000;font-size:13pt;font-weight:bold}
.meta-table{width:100%;border:0.75pt solid #000;margin:10pt 0;border-collapse:collapse}
.meta-table td{font-size:9.5pt;padding:5pt 8pt;border:0.5pt solid #000}
.client-table{width:100%;margin:10pt 0;border-collapse:collapse}
.client-table td{font-size:9.5pt;padding:4pt 6pt;vertical-align:top}
.items-table{width:100%;margin:10pt 0;border-collapse:collapse}
.items-table th{background:#E7E7E7;font-size:9pt;font-weight:bold;text-align:center;padding:6pt 4pt;border:0.5pt solid #000}
.items-table td{font-size:9.5pt;text-align:center;padding:5pt 4pt;border:0.5pt solid #000}
.items-table td.text-left{text-align:left}
.totals-table{width:40%;margin-left:auto;margin-top:10pt;border-collapse:collapse}
.totals-table td{font-size:10pt;padding:5pt 8pt;border:0.5pt solid #000}
.totals-table .due{font-size:12pt;font-weight:bold;border:1.5pt double #000}
.footer-band{background:#6B7280;text-align:center;padding:6pt;margin-top:20pt;font-size:9.5pt;color:#fff}
.stamp-box{text-align:center;margin-top:15pt}
.stamp-box img{width:130px;height:130px}
@media print{
  body{background:#fff;padding:0;margin:0}
  .invoice{box-shadow:none;margin:0;padding:10mm;max-width:none}
  .no-print,.sidebar,.header,.footer,.buttons,button,nav,.dialog-header,.action-bar{display:none!important}
  @page{size:A4;margin:0}
}
</style></head><body>
<div class="invoice">
<div class="header">
  <div class="logo-box">${companyLogo ? `<img src="${companyLogo}" alt="Logo">` : ''}</div>
  <div class="company-center">
    <h1>${companyName}</h1>
    ${companyNameAr ? `<h2>${companyNameAr}</h2>` : ''}
    ${companyAddress ? `<p>${companyAddress}</p>` : ''}
    ${companyPhone ? `<p>Phone: ${companyPhone}</p>` : ''}
    ${companyEmail ? `<p>Email: <span style="color:#0563C1;text-decoration:underline">${companyEmail}</span></p>` : ''}
    ${companyWebsite ? `<p>Website: ${companyWebsite}</p>` : ''}
    ${companyVat ? `<p><strong>VAT No:</strong> ${companyVat}</p>` : ''}
    ${companyCr ? `<p><strong>CR No:</strong> ${companyCr}</p>` : ''}
  </div>
  <div class="qr-box"><img src="${qrSrc}" alt="QR"></div>
</div>
<div class="title-bar">فاتورة ضريبية - TAX INVOICE</div>
<table class="meta-table">
  <tr><td style="width:15%"><strong>Worked Month:</strong></td><td style="width:35%">${workedMonth || '—'}</td><td style="width:15%"><strong>Date:</strong></td><td style="width:35%">${date || '—'}</td></tr>
  <tr><td><strong>Invoice. No:</strong></td><td>${invoiceNo || '—'}</td><td><strong>Time:</strong></td><td>${time || '—'}</td></tr>
  <tr><td><strong>Payment:</strong></td><td>${paymentType || 'Credit'}</td><td><strong>Due Date:</strong></td><td>${dueDate || '—'}</td></tr>
  <tr><td><strong>Cashier:</strong></td><td>${cashier || 'مدير النظام'}</td><td><strong>PO No:</strong></td><td>${poNumber || '—'}</td></tr>
</table>
<table class="client-table">
  <tr>
    <td style="width:8%"><strong>Company:</strong></td>
    <td style="width:32%"><strong>${companyName}</strong></td>
    <td style="width:10%;text-align:right;direction:rtl"><strong>: الشركة</strong></td>
    <td style="width:30%"><strong>Client:</strong></td>
    <td style="width:20%">${pCustName}${pCustNameAr ? ' - ' + pCustNameAr : ''}</td>
  </tr>
  <tr>
    <td><strong>VAT No:</strong></td>
    <td>${companyVat}</td>
    <td style="text-align:right;direction:rtl"><strong>: الرقم الضريبي</strong></td>
    <td><strong>Tax No:</strong></td>
    <td>${pCustVat || '—'}</td>
  </tr>
  <tr>
    <td><strong>Address:</strong></td>
    <td>${companyAddress}</td>
    <td style="text-align:right;direction:rtl"><strong>: العنوان</strong></td>
    <td><strong>Address:</strong></td>
    <td>${pCustAddr || '—'}</td>
  </tr>
  <tr>
    <td><strong>CR No:</strong></td>
    <td>${companyCr || '—'}</td>
    <td style="text-align:right;direction:rtl"><strong>: رقم السجل</strong></td>
    <td><strong>CR:</strong></td>
    <td>${pCustCr || '—'}</td>
  </tr>
</table>
<table class="items-table">
  <thead><tr>
    <th style="width:5%">تسلسل<br/>Sr. No.</th>
    <th style="width:25%">المسمى الوظيفي<br/>Job Description</th>
    <th style="width:8%">الوحدة<br/>Unit</th>
    <th style="width:12%">مجموع الساعات<br/>Total Hour</th>
    <th style="width:12%">سعر الساعة<br/>Rate/Hour</th>
    <th style="width:13%">الإجمالي<br/>Total</th>
    <th style="width:10%">ض القيمة المضافة 15%<br/>VAT 15%</th>
    <th style="width:15%">الاجمالي بالضريبة<br/>Grand Total</th>
  </tr></thead>
  <tbody>
    ${printItems.map(i => `<tr>
      <td>${i.no}</td>
      <td class="text-left">${i.name}${i.nameAr ? `<br/><span style="direction:rtl;font-size:11px;color:#555">${i.nameAr}</span>` : ''}</td>
      <td>${i.unit || 'Hour'}</td>
      <td>${i.totalHour || 0}</td>
      <td>${fmt(i.rate)}</td>
      <td>${fmt(i.total)}</td>
      <td>${fmt(i.vat || i.total * 0.15)}</td>
      <td>${fmt(i.grandTotal || i.total * 1.15)}</td>
    </tr>`).join('')}
    <tr>
      <td colspan="3" style="font-weight:bold;text-align:right">Total</td>
      <td style="font-weight:bold">${totalHours}</td>
      <td></td>
      <td style="font-weight:bold">${fmt(pSub)}</td>
      <td style="font-weight:bold">${fmt(pVat)}</td>
      <td style="font-weight:bold">${fmt(pTotal)}</td>
    </tr>
  </tbody>
</table>
<table class="totals-table">
  <tr><td style="text-align:right;direction:rtl"><strong>الاجمالي بدون الضريبة — Total</strong></td><td>${fmt(pSub)}</td></tr>
  <tr><td style="text-align:right;direction:rtl"><strong>ض. القيمة المضافة ${taxPercent}% — VAT ${taxPercent}%</strong></td><td>${fmt(pVat)}</td></tr>
  <tr><td class="due" style="text-align:right;direction:rtl"><strong>إجمالي المبالغ المستحقة — Due</strong></td><td class="due">${fmt(pTotal)}</td></tr>
</table>
<div style="margin-top:10pt;border-top:0.5pt solid #000;padding-top:5pt">
  <table style="width:100%"><tr>
    <td><strong>Due:</strong> ${dueInWords || ''} ${currency}</td>
    <td style="text-align:right;direction:rtl"><strong>إجمالي المبالغ المستحقة:</strong> ${dueInWords || ''} ريال</td>
  </tr></table>
</div>
${note || noteAr ? `<div style="margin-top:15pt;padding:12pt;background:#f9f9ff;border-radius:5pt;border:1pt solid #e5e7eb">
  ${noteAr ? `<div style="direction:rtl;text-align:right;font-size:13pt;margin-top:4pt">ملاحظات: ${noteAr}</div>` : ''}
  ${note ? `<div style="font-size:13pt">Notes: ${note}</div>` : ''}
</div>` : ''}
<div class="footer-band">Website: ${companyWebsite || ''}</div>
${companyStamp ? `<div class="stamp-box"><img src="${companyStamp}" alt="Stamp"></div>` : ''}
</div>
<script>window.onload=function(){window.print();}</script></body></html>`;
}
