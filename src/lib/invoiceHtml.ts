// Shared invoice HTML generator for both View (WYSIWYG) and Print
// This is a .ts file (not .tsx) to avoid JSX parsing of CSS braces

export function generateInvoiceHtml(params: {
  companyName: string;
  companyNameAr?: string;
  companyLogo?: string;
  companyStamp?: string;
  companyAddress?: string;
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
  qrBase64?: string;
  printItems: Array<{ no: number; name: string; nameAr?: string; qty: number; rate: number; total: number }>;
}) {
  const {
    companyName, companyNameAr, companyLogo, companyStamp, companyAddress, companyPhone, companyVat, companyCr, companyEmail, companyWebsite,
    currency, taxPercent, note, noteAr, pSub, pDisc, pVat, pTotal,
    pCustName, pCustNameAr, pCustPhone, pCustAddr, pCustAddrAr, pCustVat, pCustCr, pType, qrBase64, printItems
  } = params;

  const qrSrc = qrBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify({ seller: companyNameAr || companyName, vat: companyVat, total: pTotal.toFixed(2), tax: pVat.toFixed(2), date: new Date().toISOString() })))))}`;

  return `<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>Bill - ${companyName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:10mm}
.invoice{max-width:800px;margin:0 auto;background:#fff;padding:20mm;box-shadow:0 0 10px rgba(0,0,0,.1)}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e3a8a;padding-bottom:15px;margin-bottom:20px;gap:20px}
.logo-box{width:100px;height:100px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.logo-box img{max-width:100px;max-height:100px;object-fit:contain}
.qr-box{width:100px;height:100px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.qr-box img{width:100px;height:100px;object-fit:contain;aspect-ratio:1/1}
.company-center{flex:1;text-align:center;padding:0 15px}
.company-center h1{font-size:22px;color:#1e3a8a;font-weight:900;margin-bottom:2px}
.company-center h2{font-size:16px;color:#1d4ed8;font-weight:700;margin-bottom:6px}
.company-center .info-line{font-size:11px;color:#333;margin:1px 0}
.company-center .info-line strong{color:#1e3a8a}
.title{text-align:center;background:linear-gradient(135deg,#1e3a8a,#1d4ed8);color:#fff;padding:12px;margin:15px 0;font-size:18px;font-weight:700;border-radius:5px}
.badge{display:inline-block;background:#1d4ed8;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px}
.customer{border:1px solid #ddd;padding:15px;margin:15px 0;border-radius:5px}
.customer h3{color:#1e3a8a;margin-bottom:8px}
.customer p{margin:3px 0;font-size:13px}
table{width:100%;border-collapse:collapse;margin:20px 0}
thead{background:#1e3a8a;color:#fff}
th{padding:10px;text-align:center;border:1px solid #fff;font-size:12px}
td{padding:8px;text-align:center;border:1px solid #ddd;font-size:12px}
tr:nth-child(even){background:#f9f9ff}
.totals{margin-top:20px;padding:15px;background:#f5f5ff;border-radius:5px}
.total-row{display:flex;justify-content:space-between;padding:8px 15px;font-size:14px}
.total-row.grand{background:linear-gradient(135deg,#1d4ed8,#1e3a8a);color:#fff;font-weight:900;font-size:18px;border-radius:5px;margin-top:10px}
.notes-section{margin-top:15px;padding:12px;background:#f9f9ff;border-radius:5px;border:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-start;gap:20px}
.notes-text{flex:1}
.notes-ar{direction:rtl;text-align:right;font-size:13px;color:#374151;margin-top:4px}
.notes-en{font-size:13px;color:#374151}
.stamp-box{width:80px;height:80px;flex-shrink:0;display:flex;align-items:center;justify-content:center;opacity:0.85}
.stamp-box img{max-width:80px;max-height:80px;object-fit:contain;border-radius:50%}
.footer{margin-top:20px;text-align:center;padding:15px;border-top:2px solid #ddd;font-size:16px;font-weight:700;color:#1e3a8a}
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
    ${companyAddress ? `<div class="info-line">${companyAddress}</div>` : ''}
    ${companyPhone ? `<div class="info-line">Phone: ${companyPhone}</div>` : ''}
    ${companyEmail ? `<div class="info-line">Email: ${companyEmail}</div>` : ''}
    ${companyWebsite ? `<div class="info-line">Website: ${companyWebsite}</div>` : ''}
    ${companyVat ? `<div class="info-line"><strong>VAT No:</strong> ${companyVat}</div>` : ''}
    ${companyCr ? `<div class="info-line"><strong>CR No:</strong> ${companyCr}</div>` : ''}
  </div>
  <div class="qr-box"><img src="${qrSrc}" alt="QR"></div>
</div>
<div class="title">TAX INVOICE / فاتورة ضريبية<span class="badge">${pType === 'zatca' ? 'ZATCA' : 'Standard'}</span></div>
<div class="customer">
<h3>Customer / العميل</h3>
<p><strong>${pCustName}</strong>${pCustNameAr ? ` / ${pCustNameAr}` : ''}</p>
${pCustPhone ? `<p>Phone: ${pCustPhone}</p>` : ''}
${pCustAddr ? `<p>Address: ${pCustAddr}</p>` : ''}
${pCustAddrAr ? `<p style="direction:rtl;text-align:right">العنوان: ${pCustAddrAr}</p>` : ''}
${pCustVat ? `<p><strong>VAT No / الرقم الضريبي:</strong> ${pCustVat}</p>` : ''}
${pCustCr ? `<p><strong>CR No:</strong> ${pCustCr}</p>` : ''}
</div>
<table><thead><tr><th>#<br/>تسلسل</th><th>Job Description / المسمى الوظيفي</th><th>Qty / الكمية</th><th>Rate/Hour / سعر الساعة</th><th>Total / الإجمالي</th></tr></thead><tbody>
${printItems.map(i => `<tr><td>${i.no}</td><td>${i.name}${i.nameAr ? `<br/><span style="direction:rtl;font-size:11px;color:#555">${i.nameAr}</span>` : ''}</td><td>${i.qty}</td><td>${i.rate.toFixed(2)}</td><td>${i.total.toFixed(2)}</td></tr>`).join('')}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal / الاجمالي بدون الضريبة:</span><span>${currency} ${pSub.toFixed(2)}</span></div>
${pDisc > 0 ? `<div class="total-row"><span>Discount / الخصم:</span><span>-${currency} ${pDisc.toFixed(2)}</span></div>` : ''}
<div class="total-row"><span>VAT ${taxPercent}% / القيمة المضافة:</span><span>${currency} ${pVat.toFixed(2)}</span></div>
<div class="total-row grand"><span>TOTAL / الإجمالي:</span><span>${currency} ${pTotal.toFixed(2)}</span></div>
</div>
${note || noteAr ? `<div class="notes-section"><div class="notes-text">${noteAr ? `<div class="notes-ar">ملاحظات: ${noteAr}</div>` : ''}${note ? `<div class="notes-en">Notes: ${note}</div>` : ''}</div><div class="stamp-box">${companyStamp ? `<img src="${companyStamp}" alt="Stamp">` : ''}</div></div>` : ''}
<div class="footer">شكراً لتعاملكم معنا / Thank You For Your Business!</div>
</div>
<script>window.onload=function(){window.print();}</script></body></html>`;
}
