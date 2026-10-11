// Shared invoice HTML generator for both View (WYSIWYG) and Print.
// Replicates the official sales-return form template 1:1 (narrow A5 receipt):
// bilingual header blocks + logo, title band, meta + client card, 7-column
// items table (SN / Item No. / Job Description / Unit / Qty / Price / Total),
// conditional additions/discount/credit/balance rows, Thank-You band,
// contact footer, QR block. Extra params are optional so Word/email
// callers keep working unchanged.

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
  pCustEmail?: string;
  pCustPo?: string;
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
  title?: string;
  titleAr?: string;
  paid?: number;
  creditDue?: number;
  balPrior?: number | null;
  balAfter?: number | null;
  hasAccount?: boolean;
  printItems: Array<{ no: number; name: string; nameAr?: string; unit?: string; totalHour?: number; rate: number; total: number; vat?: number; grandTotal?: number; productId?: string | number | null; sku?: string | null; qty?: number }>;
}) {
  const {
    companyName = 'YAFCO AL ARABIAH EST.', companyNameAr = 'مؤسسة يافكو العربية',
    companyLogo, companyAddress = 'Saudi Arabia - Yanbu Al Bahr - P.O.Box: 2326',
    companyPhone = '', companyVat = '300995897900003', companyCr = '4700012896',
    companyEmail = 'info@yafco.com.sa', companyWebsite = 'www.yafco.com.sa',
    currency = 'SAR', taxPercent = '15', note, noteAr,
    pSub = 0, pDisc = 0, pVat = 0, pTotal = 0,
    pCustName = 'Walk-in Customer', pCustNameAr = '', pCustPhone = '',
    pCustAddr = '', pCustAddrAr = '', pCustVat = '', pCustCr = '',
    pCustEmail = '', pCustPo = '', pType = 'standard',
    workedMonth = '', invoiceNo = '', paymentType = 'Credit',
    cashier = 'مدير النظام', date = '', time = '', dueDate = '',
    poNumber = '', dueInWords = '', qrBase64,
    title = '', titleAr = '',
    paid = 0, creditDue = 0, balPrior = null, balAfter = null,
    hasAccount = false, printItems = []
  } = params;

  const docTitle = title || (pType === 'zatca' ? 'TAX INVOICE' : 'SALES INVOICE');
  const docTitleAr = titleAr || (pType === 'zatca' ? 'فاتورة ضريبية' : 'فاتورة مبيعات');

  const qrSrc = qrBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify({ seller: companyNameAr || companyName, vat: companyVat, total: pTotal.toFixed(2), tax: pVat.toFixed(2), date: new Date().toISOString() })))))}`;

  const totalQty = printItems.reduce((s, i) => s + (i.qty ?? i.totalHour ?? 0), 0);
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const showDiscount = pDisc > 0;
  const showCredit = creditDue > 0;
  const showBal = hasAccount && Number(balAfter || 0) !== 0;

  return `<!DOCTYPE html>
<html dir="ltr"><head><meta charset="UTF-8"><title>${docTitle} - ${invoiceNo}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Calibri,Arial,sans-serif;background:#f5f5f5;padding:8mm;font-size:10pt}
.invoice{max-width:560px;margin:0 auto;background:#fff;padding:8mm;box-shadow:0 0 10px rgba(0,0,0,.1)}
.hdr{display:table;width:100%;margin-bottom:8px}
.hdr-en{display:table-cell;width:32%;vertical-align:middle;font-size:12pt;font-weight:bold;line-height:1.5}
.hdr-logo{display:table-cell;width:36%;text-align:center;vertical-align:middle}
.hdr-logo img{max-width:190px;max-height:120px;object-fit:contain}
.hdr-ar{display:table-cell;width:32%;vertical-align:middle;font-size:11pt;font-weight:bold;text-align:right;line-height:1.6}
.title-band{text-align:center;background:#E7E7E7;padding:6pt;margin:6pt 0;font-size:16pt;font-weight:bold;border-top:1pt solid #000;border-bottom:1pt solid #000}
.meta{width:100%;border-collapse:collapse;margin:6pt 0}
.meta td{font-size:8.5pt;padding:3pt 6pt;border:0.5pt solid #000}
.meta .lab{font-weight:bold}
.client{width:100%;border-collapse:collapse;margin:0 0 6pt 30%}
.client td{font-size:8.5pt;padding:3pt 6pt;border:0.5pt solid #000;vertical-align:top}
.client .lab{font-weight:bold}
.items{width:100%;margin:6pt 0;border-collapse:collapse}
.items th{font-size:8pt;font-weight:bold;text-align:center;padding:4pt 3pt;border:0.5pt solid #000}
.items td{font-size:8.5pt;text-align:center;padding:3pt 3pt;border:0.5pt solid #000}
.items td.name{text-align:left}
.tots{width:100%;border-collapse:collapse;margin-top:0}
.tots td{font-size:9pt;padding:3pt 6pt;border:0.5pt solid #000;text-align:right}
.tots td.lab{font-weight:bold;text-align:left}
.tots tr.grand td{font-weight:bold;font-size:10pt}
.words{margin-top:6pt;border-top:0.5pt solid #000;padding-top:4pt;font-size:9pt}
.thanks{text-align:center;background:#E7E7E7;padding:5pt;margin:8pt 0 4pt 0;font-size:14pt;font-weight:bold}
.contacts{text-align:center;font-size:8.5pt;color:#333;margin:2pt 0}
.qrrow{display:table;width:100%;margin-top:6pt}
.qrrow .qr{display:table-cell;width:150px;text-align:center;vertical-align:middle}
.qrrow .qr img{width:140px;height:140px;object-fit:contain}
@media print{
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
  body{background:#fff;padding:0;margin:0}
  .invoice{box-shadow:none;margin:0;padding:6mm;max-width:none}
  table,th,td{border:1px solid black!important}
  .title-band,.thanks{background-color:#E7E7E7!important}
  .no-print,.action-buttons,.sidebar,.buttons,button,nav,.dialog-header,.action-bar{display:none!important}
  @page{size:A5 portrait;margin:0}
}
</style></head><body>
<div class="invoice">

<!-- HEADER -->
<div class="hdr">
  <div class="hdr-en">Kingdom Saudi Arabia<br/>${companyName}<br/>C.R. No: ${companyCr}<br/>Tax No:${companyVat}</div>
  <div class="hdr-logo">${companyLogo ? `<img src="${companyLogo}" alt="Logo"/>` : ''}</div>
  <div class="hdr-ar" dir="rtl">${companyNameAr}<br/>الرقم الموحد : ${companyCr}<br/>الرقم الضريبي : ${companyVat}</div>
</div>

<!-- TITLE -->
<div class="title-band" dir="ltr">${docTitle}${docTitleAr ? ` <span dir="rtl">${docTitleAr}</span>` : ''}</div>

<!-- META + CLIENT -->
<table class="meta">
  <tr><td class="lab" style="width:14%">Doc. No.</td><td style="width:30%">${invoiceNo || '—'}</td><td class="lab" style="width:12%">Client</td><td style="width:44%" colspan="3"><strong>${pCustName}${pCustNameAr ? ' / ' + pCustNameAr : ''}</strong></td></tr>
  <tr><td class="lab">Payment</td><td>${paymentType}</td><td class="lab" colspan="4" style="text-align:right" dir="rtl">اسم العميل</td></tr>
  <tr><td class="lab">Date</td><td>${date || '—'}</td>${pCustVat ? `<td class="lab">Tax No.</td><td colspan="3">${pCustVat}</td>` : `<td colspan="4"></td>`}</tr>
  <tr><td class="lab">Time</td><td>${time || '—'}</td><td colspan="4">${pCustAddr}${pCustAddrAr ? ' / ' + pCustAddrAr : ''}</td></tr>
  <tr><td class="lab">Due Date</td><td>${dueDate || '—'}</td><td colspan="4">${pCustPhone}</td></tr>
  <tr><td class="lab">Cashier</td><td>${cashier || 'مدير النظام'}</td><td class="lab">PO No</td><td colspan="3">${poNumber || pCustPo || '—'}</td></tr>
  ${note || noteAr ? `<tr><td class="lab">Remarks</td><td colspan="5">${note || ''}${noteAr ? ' / ' + noteAr : ''}</td></tr>` : ''}
</table>

<!-- ITEMS -->
<table class="items">
  <thead><tr>
    <th style="width:6%">SN</th>
    <th style="width:10%">Item No.</th>
    <th style="width:28%">Job Description</th>
    <th style="width:9%">Unit</th>
    <th style="width:9%">Qty</th>
    <th style="width:12%">Price</th>
    <th style="width:16%">Total</th>
  </tr></thead>
  <tbody>
    ${printItems.map(i => `<tr>
      <td>${i.no}</td>
      <td>${i.productId ?? i.sku ?? '—'}</td>
      <td class="name">${i.name}${i.nameAr ? `<br/><span style="direction:rtl;font-size:10px;color:#555">${i.nameAr}</span>` : ''}</td>
      <td>${i.unit || ''}</td>
      <td>${i.qty ?? i.totalHour ?? 0}</td>
      <td>${fmt(i.rate)}</td>
      <td>${fmt(i.total)}</td>
    </tr>`).join('')}
    <tr>
      <td colspan="4" style="font-weight:bold;text-align:right">Total</td>
      <td style="font-weight:bold">${totalQty}</td>
      <td></td>
      <td style="font-weight:bold">${fmt(pSub)}</td>
    </tr>
  </tbody>
</table>

<!-- TOTALS -->
<table class="tots">
  ${showDiscount ? `<tr><td class="lab">Discount</td><td>${fmt(pDisc)}</td></tr>` : ''}
  <tr><td class="lab">VAT ${taxPercent}%</td><td>${fmt(pVat)}</td></tr>
  <tr class="grand"><td class="lab">Due &nbsp;&nbsp;${dueInWords || ''} ${currency}</td><td>${fmt(pTotal)}</td></tr>
  <tr><td class="lab">Paid</td><td>${fmt(paid)}</td></tr>
  ${showCredit ? `<tr><td class="lab">Credit</td><td>${fmt(creditDue)}</td></tr>` : ''}
  ${showBal ? `<tr><td class="lab">Bal. Prior</td><td>${balPrior !== null ? fmt(balPrior) : '—'}</td></tr><tr><td class="lab">Bal. After</td><td>${balAfter !== null ? fmt(balAfter) : '—'}</td></tr>` : ''}
</table>

<div class="thanks">Thank You</div>
<div class="contacts">${companyAddress}</div>
<div class="contacts">${companyPhone ? 'Phone: ' + companyPhone + ' &nbsp; ' : ''}${companyEmail}</div>
<div class="contacts">${companyWebsite}</div>
<div class="qrrow"><div class="qr"><img src="${qrSrc}" alt="QR"/></div></div>

</div>
<script>(function(){function fit(){try{var h=document.documentElement.scrollHeight||document.body.scrollHeight;var avail=780;if(h>avail){document.body.style.zoom=(avail/h);}}catch(e){}}function go(){fit();setTimeout(function(){fit();try{window.print();}catch(e){}},80);}function ready(fn){try{var imgs=Array.prototype.slice.call(document.images||[]);var pending=imgs.filter(function(i){return !i.complete;}).length;if(!pending){fn();return;}var done=false;var to=setTimeout(function(){if(!done){done=true;fn();}},2500);var check=function(){if(done)return;pending--;if(pending<=0){done=true;clearTimeout(to);fn();}};imgs.forEach(function(i){i.addEventListener('load',check);i.addEventListener('error',check);});}catch(e){fn();}}if(document.readyState==='complete'){ready(go);}else{window.addEventListener('load',function(){ready(go);});}})();</script></body></html>`;
}
