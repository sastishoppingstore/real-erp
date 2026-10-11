// Word (.docx) Export Service using html-to-docx (no external docx lib needed)
// This generates a Word-compatible HTML file that opens correctly in MS Word

export interface WordExportData {
  companyName: string;
  companyNameAr?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyVat?: string;
  companyCr?: string;
  companyEmail?: string;
  companyWebsite?: string;
  customerName?: string;
  customerNameAr?: string;
  customerVat?: string;
  customerCr?: string;
  customerAddress?: string;
  customerAddressAr?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPo?: string;
  items: Array<{ no: number; name: string; nameAr?: string; unit?: string; totalHour?: number; rate?: number; total?: number }>;
  subtotal?: number;
  vatTotal?: number;
  grandTotal?: number;
  dueInWords?: string;
  notes?: string;
  notesAr?: string;
  currency?: string;
  vatPercent?: string;
}

export function generateInvoiceHtmlForWord(data: WordExportData): string {
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = data.items.map(i => `
    <tr>
      <td style="text-align:center">${i.no}</td>
      <td style="text-align:left">${i.name}${i.nameAr ? `<br/><span dir="rtl">${i.nameAr}</span>` : ''}</td>
      <td style="text-align:center">${i.unit || 'Hour'}</td>
      <td style="text-align:center">${i.totalHour || 0}</td>
      <td style="text-align:right">${fmt(i.rate || 0)}</td>
      <td style="text-align:right">${fmt(i.total || 0)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<style>
body{font-family:Calibri,Arial,sans-serif;font-size:11pt}
table{border-collapse:collapse;width:100%;margin:10px 0}
td,th{border:0.5pt solid #000;padding:4pt 6pt}
.center{text-align:center}
.right{text-align:right}
.left{text-align:left}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2pt solid #1e3a8a;padding-bottom:12px;margin-bottom:15px}
.company-name{font-size:20pt;color:#A6272C;font-weight:bold}
.company-name-ar{font-size:14pt;color:#1e3a8a;font-weight:bold;text-align:right;direction:rtl}
.address{font-size:9.5pt;color:#333}
.title-bar{background:#E7E7E7;text-align:center;padding:8pt;font-size:13pt;font-weight:bold;border-top:1pt solid #000;border-bottom:1pt solid #000}
</style>
</head>
<body>
<div class="header">
  <div style="width:100px">${data.companyLogo ? `<img src="${data.companyLogo}" width="90" height="90"/>` : ''}</div>
  <div style="flex:1;text-align:center">
    <div class="company-name">${data.companyName}</div>
    <div class="company-name-ar">${data.companyNameAr}</div>
    <div class="address">${data.companyAddress || ''}</div>
    <div class="address">${data.companyEmail || ''}</div>
    <div class="address">VAT: ${data.companyVat || ''} | CR: ${data.companyCr || ''}</div>
  </div>
  <div style="width:100px;text-align:right"><img src="${qrUrl}" width="90" height="90" style="float:right"/></div>
</div>

<div class="title-bar">فاتورة ضريبية - TAX INVOICE</div>

<table>
  <tr><td style="width:15%"><strong>Worked Month / الشهر:</strong></td><td>${data.items[0] ? '2026-May' : ''}</td><td style="width:15%"><strong>Date / التاريخ:</strong></td><td>${new Date().toISOString().slice(0,10)}</td></tr>
</table>

<table style="margin-top:10px">
  <tr>
    <td class="center" style="width:5%"><strong>تسلسل<br/>Sr. No.</strong></td>
    <td style="width:25%"><strong>المسمى الوظيفي<br/>Job Description</strong></td>
    <td class="center" style="width:8%"><strong>الوحدة<br/>Unit</strong></td>
    <td class="center" style="width:12%"><strong>مجموع الساعات<br/>Total Hour</strong></td>
    <td class="center" style="width:13%"><strong>سعر الساعة<br/>Rate/Hour</strong></td>
    <td style="width:13%"><strong>الإجمالي<br/>Total</strong></td>
  </tr>
  ${rows}
</table>

<div style="text-align:right;margin-top:10px">
  <strong>الاجمالي بدون الضريبة — Total: ${fmt(data.subtotal || 0)}</strong><br/>
  <strong>ض. القيمة المضافة ${data.vatPercent}% — VAT ${data.vatPercent}%: ${fmt(data.vatTotal || 0)}</strong><br/>
  <strong style="font-size:12pt;border:1.5pt double #000;padding:3pt;display:inline-block;margin-top:5pt">إجمالي المبالغ المستحقة — Due: ${fmt(data.grandTotal || 0)}</strong><br/>
  <strong>المبلغ بالكلمات — Amount in Words: ${data.dueInWords || ''}</strong>
</div>

<div class="footer-band">Website: ${data.companyWebsite || ''}</div>

</body></html>`;
}

export function downloadWordDoc(data: WordExportData) {
  const html = generateInvoiceHtmlForWord(data);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-${data.invoiceNo}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
