// Shared invoice HTML generator for both View (WYSIWYG) and Print.
// Replicates the official YAFCO invoice design 1:1 (same as the Sahl
// form-returnsale-0060 A4 print): bilingual letterhead blocks + logo,
// gray title band, meta + client grid, 7-column items table
// (SN / Item No. / Job Description / Unit / Qty / Price / Total),
// conditional additions/discount/credit/balance rows, Thank-You band,
// contact footer, floating QR block. Extra params are optional so other
// callers keep working unchanged.

// --- ZATCA simplified e-invoice QR (TLV fields 1-5, base64) --------------
export function zatcaQrPayload(o: { seller: string; vat: string; iso: string; total: string; vatAmt: string }): string {
  const enc = (s: string) => {
    const b = new TextEncoder().encode(s);
    let out = "";
    for (let i = 0; i < b.length; i++) out += String.fromCharCode(b[i]);
    return out;
  };
  const f = (tag: number, val: string) => {
    const v = enc(val);
    return String.fromCharCode(tag, v.length) + v;
  };
  const tlv = f(1, o.seller) + f(2, o.vat) + f(3, o.iso) + f(4, o.total) + f(5, o.vatAmt);
  return btoa(tlv);
}

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
    companyLogo, companyAddress = '', companyAddressAr = '',
    companyPhone = '', companyVat = '300995897900003', companyCr = '4700012896',
    companyEmail = '', companyWebsite = '',
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

  const esc = (x: any) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = (n: number) => (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const docTitle = title || (pType === 'zatca' ? 'TAX INVOICE' : 'SALES INVOICE');
  const docTitleAr = titleAr || (pType === 'zatca' ? 'فاتورة ضريبية' : 'فاتورة مبيعات');

  // Same 12h time as the xlsx (h:mm AM/PM)
  const t12 = (() => {
    const t = String(time || '').trim();
    const m = t.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return t;
    let h = Number(m[1]);
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m[2]} ${ap}`;
  })();

  const qtyTotal = printItems.reduce((s, i) => s + Number(i.qty ?? i.totalHour ?? 0), 0);
  const coAr = companyNameAr || companyName;
  const custLine = pCustNameAr ? `${pCustName} / ${pCustNameAr}` : pCustName;

  const valRow = (label: string, val: string) =>
    `<tr><td colspan="5"></td><td class="lbl">${esc(label)}</td><td class="c bd">${esc(val)}</td></tr>`;

  const itRows = (printItems.length ? printItems : [{ no: 1, name: '', rate: 0, total: 0 }]).map((l, i) =>
    `<tr><td class="sn">${i + 1}</td><td class="c bd">${esc(l.productId ?? l.sku ?? '')}</td>` +
    `<td class="l bd">${esc(l.name)}${l.nameAr ? ` <span dir="rtl">${esc(l.nameAr)}</span>` : ''}</td>` +
    `<td class="c bd">${esc(l.unit ?? '')}</td><td class="c bd">${Number(l.qty ?? l.totalHour ?? 0)}</td>` +
    `<td class="c bd">${fmt(l.rate)}</td><td class="c bd">${fmt(l.total)}</td></tr>`).join('');

  return `<!doctype html><html dir="ltr"><head><meta charset="UTF-8">
<title>${esc(docTitle)}${invoiceNo ? ' - ' + esc(invoiceNo) : ''}</title><style>
  @page { size: A4 portrait; margin: 8mm; }
  html,body { margin:0; padding:0; }
  body { font-family: Vazir, Tahoma, "Segoe UI", Arial, sans-serif; font-size:8pt; color:#000;
         -webkit-print-color-adjust: exact; print-color-adjust: exact;
         background:#e9ecef; padding:10mm 0; }
  /* On screen: white A4 paper on a gray desk (same look as the printed PDF).
     In print: the page itself is the paper — backdrop & shadow are dropped. */
  .sheet { width:210mm; min-height:297mm; margin:0 auto; padding:8mm; background:#fff;
           box-shadow:0 2px 14px rgba(0,0,0,.28); box-sizing:border-box; }
  table { width:100%; border-collapse:collapse; table-layout:fixed; }
  td { vertical-align:middle; padding:1pt 2pt; overflow:hidden; }
  .lh { display:flex; align-items:center; margin-bottom:4pt; }
  .lh-l { width:38%; text-align:center; font-family:Calibri,Arial,sans-serif; font-size:10.5pt; line-height:1.35; }
  .lh-l .t1 { font-size:12pt; font-weight:700; }
  .lh-l .red, .lh-r .red { color:#FF0000; font-weight:700; font-size:11pt; }
  .lh-c { width:24%; text-align:center; }
  .lh-c img { max-height:23mm; max-width:95%; }
  .lh-r { width:38%; text-align:center; font-family:Arial,Tahoma,sans-serif; direction:rtl; font-size:10.5pt; line-height:1.35; }
  .lh-r .t1 { font-weight:700; font-size:11pt; }
  .gray { background:#D9D9D9; }
  .bd { border:1px solid #808080; }
  .c { text-align:center; } .l { text-align:left; }
  .sn { text-align:center; }
  .lbl { font-weight:700; text-align:left; white-space:nowrap; }
  .bold { font-weight:700; }
  @media print {
    body { background:#fff; padding:0; }
    .sheet { width:auto; min-height:0; margin:0; padding:0; box-shadow:none; }
  }
  </style></head><body><div class="sheet">
  <div class="lh">
    <div class="lh-l">
      <div class="t1">Kingdom Saudi Arabia</div>
      <div class="red">${esc(companyName)}</div>
      <div>C . R . No: ${esc(companyCr)}</div>
      <div>Tax No:${esc(companyVat)}</div>
    </div>
    <div class="lh-c">${companyLogo ? `<img src="${esc(companyLogo)}" alt="">` : ''}</div>
    <div class="lh-r">
      <div class="t1">المملكة العربية السعودية</div>
      <div class="red">${esc(companyNameAr || '')}</div>
      <div>س . ت : ${esc(companyCr)}</div>
      <div>الرقم الضريبي : ${esc(companyVat)}</div>
    </div>
  </div>
  <table><colgroup>
    <col style="width:4.3%"><col style="width:10.3%"><col style="width:34%">
    <col style="width:7.7%"><col style="width:7.7%"><col style="width:15.4%"><col style="width:20.6%">
  </colgroup><tbody>
    <tr class="gray" style="height:26.25pt">
      <td></td><td style="font-size:10pt" dir="rtl">${esc(docTitleAr)}</td>
      <td colspan="5" class="c" style="font-size:16pt">${esc(coAr)}</td>
    </tr>
    <tr><td></td><td></td><td></td><td></td><td colspan="3">${companyVat ? `Tax No. ${esc(companyVat)}` : ''}</td></tr>
    <tr><td></td><td class="lbl">Doc. No.</td><td>${esc(invoiceNo || '')}</td><td class="lbl">Client</td><td colspan="3"><b>${esc(custLine)}</b></td></tr>
    <tr><td></td><td class="lbl">Payment</td><td>${esc(paymentType)}</td><td class="lbl">Tax No.</td><td colspan="3">${esc(pCustVat || '')}</td></tr>
    <tr><td></td><td class="lbl">Date</td><td>${esc(date || '')}</td><td></td><td colspan="3">${esc([pCustAddr, pCustAddrAr].filter(Boolean).join(' / '))}</td></tr>
    <tr><td></td><td class="lbl">Time</td><td>${esc(t12)}</td><td></td><td colspan="3">${esc(pCustPhone || '')}</td></tr>
    <tr><td></td><td class="lbl">Due Date</td><td>${esc(dueDate || date || '')}</td><td></td><td colspan="3">${esc(pCustCr ? `CR: ${pCustCr}` : '')}${pCustEmail ? ` ${esc(pCustEmail)}` : ''}</td></tr>
    <tr><td></td><td class="lbl">Cashier</td><td>${esc(cashier)}</td><td class="lbl">PO No</td><td colspan="3">${esc(poNumber || pCustPo || '')}</td></tr>
    ${workedMonth ? `<tr><td></td><td class="lbl">Worked Month</td><td colspan="5">${esc(workedMonth)}</td></tr>` : ''}
    ${(note || noteAr) ? `<tr><td></td><td class="lbl">Remarks</td><td colspan="5">${esc(note || '')}${noteAr ? ` — ${esc(noteAr)}` : ''}</td></tr>` : ''}
    <tr style="height:30pt;font-weight:700" class="c">
      <td></td><td class="bd">Item No.</td><td class="bd">Job Description</td><td class="bd">Unit</td>
      <td class="bd">Qty</td><td class="bd">Price</td><td class="bd">Total</td>
    </tr>
    ${itRows}
    <tr><td></td><td></td><td></td><td></td><td class="c bd">${qtyTotal}</td><td class="lbl">Total</td><td class="c bd">${fmt(pSub)}</td></tr>
    ${pDisc ? valRow('Discount', fmt(pDisc)) : ''}
    <tr><td colspan="5"></td><td class="lbl">VAT ${esc(taxPercent)}%</td><td class="c bd">${fmt(pVat)}</td></tr>
    <tr style="height:17.25pt">
      <td></td><td class="lbl">Due</td><td class="l">${esc(dueInWords || '')}</td><td colspan="2"></td>
      <td class="lbl" style="font-size:10pt">Due</td><td class="c bd bold" style="font-size:10pt">${fmt(pTotal)}</td>
    </tr>
    ${valRow('Paid', fmt(paid))}
    ${creditDue > 0 ? valRow('Credit', fmt(creditDue)) : ''}
    ${hasAccount ? valRow('Bal. Prior', balPrior != null ? fmt(balPrior) : '—') + valRow('Bal. After', balAfter != null ? fmt(balAfter) : '—') : ''}
    <tr style="height:8pt"><td colspan="7"></td></tr>
    <tr class="gray" style="height:26.25pt">
      <td></td><td colspan="6" class="c" style="font-size:16pt">Thank You</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2" style="vertical-align:top;font-size:8pt;line-height:1.4">
        ${companyAddress ? `<div>${esc(companyAddress)}</div>` : ''}
        ${companyPhone ? `<div>${esc(companyPhone)}</div>` : ''}
        ${companyEmail ? `<div>${esc(companyEmail)}</div>` : ''}
        ${companyWebsite ? `<div>${esc(companyWebsite)}</div>` : ''}
      </td>
      <td colspan="3" class="c">${qrBase64 ? `<img src="${esc(qrBase64)}" style="width:26mm;height:26mm" alt="">` : ''}</td>
      <td></td>
    </tr>
  </tbody></table>
  </div>
  <script>(function(){function ready(fn){try{var imgs=Array.prototype.slice.call(document.images||[]);var pending=imgs.filter(function(i){return !i.complete;}).length;if(!pending){fn();return;}var done=false;var to=setTimeout(function(){if(!done){done=true;fn();}},2500);var check=function(){if(done)return;pending--;if(pending<=0){done=true;clearTimeout(to);fn();}};imgs.forEach(function(i){i.addEventListener('load',check);i.addEventListener('error',check);});}catch(e){fn();}}function go(){try{window.print();}catch(e){}}if(document.readyState==='complete'){ready(go);}else{window.addEventListener('load',function(){ready(go);});}})();</script></body></html>`;
}
