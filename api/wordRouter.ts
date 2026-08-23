import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { invoices, invoiceItems, customers, companySettings } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const wordRouter = createRouter({
  generateWord: authedQuery
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const [invoice] = await db.select().from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.tenantId, tenantId)));
      if (!invoice) throw new Error("Invoice not found");

      const items = await db.select().from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, input.invoiceId));

      const [customer] = invoice.customerId
        ? await db.select().from(customers).where(eq(customers.id, invoice.customerId))
        : [null];

      const [company] = await db.select().from(companySettings)
        .where(eq(companySettings.tenantId, tenantId));

      // Build HTML for Word (Word can open HTML with inline styles)
      const companyName = company?.companyName || "YAFCO AL ARABIAH EST.";
      const companyNameAr = company?.companyNameAr || "مؤسسة يافكو العربية";
      const companyLogo = company?.logo || "";
      const companyAddress = company?.address || "Saudi Arabia - Yanbu Al Bahr - P.O.Box: 2326";
      const companyPhone = company?.phone || "";
      const companyEmail = company?.email || "info@yafco.com.sa";
      const companyWebsite = company?.website || "www.yafco.com.sa";
      const companyVat = company?.taxNumber || "300995897900003";
      const companyCr = company?.crNumber || "4700012896";
      const currency = company?.defaultCurrency || "SAR";

      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const totalHours = items.reduce((s: number, r: any) => s + Number(r.quantity || 1), 0);
      const subtotal = Number(invoice.subTotal || 0);
      const vatTotal = Number(invoice.taxAmount || 0);
      const grandTotal = Number(invoice.totalAmount || 0);

      const printItems = items.map((it: any, i: number) => ({
        no: i + 1,
        name: it.description || "",
        nameAr: it.descriptionAr || "",
        unit: it.unit || "Hour",
        totalHour: Number(it.quantity || 1),
        rate: Number(it.unitPrice || 0),
        total: Number(it.totalAmount || 0),
      }));

      const qrPayload = JSON.stringify({
        seller: companyNameAr || companyName, vat: companyVat,
        total: grandTotal.toFixed(2), tax: vatTotal.toFixed(2),
        date: invoice.date || new Date().toISOString(),
      });
      const qrData = btoa(unescape(encodeURIComponent(qrPayload)));
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

      // Generate HTML that Word can render properly
      const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Invoice ${invoice.invoiceNumber}</title>
<style>
body{font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0;padding:20px}
table{border-collapse:collapse;width:100%}
td,th{border:0.5pt solid #000;padding:5pt 8pt}
.header{display:table;width:100%;margin-bottom:15px}
.logo-cell{display:table-cell;width:120px;text-align:center;vertical-align:middle}
.company-cell{display:table-cell;text-align:center;vertical-align:middle;padding:0 15px}
.qr-cell{display:table-cell;width:120px;text-align:center;vertical-align:middle}
.title-bar{background:#E7E7E7;text-align:center;padding:8pt;font-size:13pt;font-weight:bold;border-top:1pt solid #000;border-bottom:1pt solid #000;margin:10pt 0}
.meta-table{width:100%;border:0.75pt solid #000;margin:10pt 0}
.meta-table td{border:0.5pt solid #000;font-size:9.5pt;padding:5pt 8pt}
.client-table{width:100%;margin:10pt 0}
.client-table td{border:0.5pt solid #000;font-size:9.5pt;padding:5pt 8pt;vertical-align:top}
.client-table .label{font-weight:bold;background:#f9f9ff}
.items-table{width:100%;margin:10pt 0}
.items-table th{background:#E7E7E7;font-size:9pt;font-weight:bold;text-align:center;padding:6pt 4pt;border:0.5pt solid #000}
.items-table td{font-size:9.5pt;text-align:center;padding:5pt 4pt;border:0.5pt solid #000}
.totals-table{width:40%;margin-left:auto;margin-top:10pt}
.totals-table td{font-size:10pt;padding:5pt 8pt;border:0.5pt solid #000}
.totals-table .due{font-size:12pt;font-weight:bold;border:1.5pt double #000}
.footer-band{background:#E7E7E7;text-align:center;padding:6pt;margin-top:20pt;font-size:9.5pt}
@media print{@-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body>
<div class="header">
  <div class="logo-cell">${companyLogo ? `<img src="${companyLogo}" width="100" height="100" style="object-fit:contain"/>` : ''}</div>
  <div class="company-cell">
    <div style="font-size:18pt;color:#A6272C;font-weight:bold">${companyName}</div>
    <div style="font-size:14pt;color:#1e3a8a;font-weight:bold" dir="rtl">${companyNameAr}</div>
    <div style="font-size:9.5pt">${companyAddress}</div>
    <div style="font-size:9.5pt;color:#0563C1;text-decoration:underline">${companyEmail}</div>
    <div style="font-size:9pt"><strong>VAT No:</strong> ${companyVat} &nbsp; <strong>CR No:</strong> ${companyCr}</div>
  </div>
  <div class="qr-cell"><img src="${qrUrl}" width="100" height="100" style="object-fit:contain"/></div>
</div>

<div class="title-bar">فاتورة ضريبية - TAX INVOICE</div>

<table class="meta-table">
  <tr><td style="width:15%"><strong>Worked Month:</strong></td><td style="width:35%">${invoice.workedMonth || '—'}</td><td style="width:15%"><strong>Date:</strong></td><td style="width:35%">${invoice.date || '—'}</td></tr>
  <tr><td><strong>Invoice. No:</strong></td><td>${invoice.invoiceNumber || '—'}</td><td><strong>Time:</strong></td><td>${invoice.time || '—'}</td></tr>
  <tr><td><strong>Payment:</strong></td><td>${invoice.paymentType || 'Credit'}</td><td><strong>Due Date:</strong></td><td>${invoice.dueDate || '—'}</td></tr>
  <tr><td><strong>Cashier:</strong></td><td>${invoice.cashier || 'مدير النظام'}</td><td><strong>PO No:</strong></td><td>${invoice.poNumber || '—'}</td></tr>
</table>

<table class="client-table">
  <tr>
    <td class="label" style="width:15%">Client Name</td>
    <td style="width:35%"><strong>${customer?.name || (invoice as any).customerName || 'Walk-in Customer'}${customer?.nameAr ? ' / ' + customer.nameAr : ''}</strong></td>
    <td class="label" style="width:15%">اسم العميل</td>
    <td style="width:35%">${customer?.nameAr || (invoice as any).customerNameAr || customer?.name || '—'}</td>
  </tr>
  <tr>
    <td class="label">Tax No (VAT)</td>
    <td>${customer?.vatNumber || (invoice as any).customerVat || '—'}</td>
    <td class="label">الرقم الضريبي</td>
    <td>${customer?.vatNumber || (invoice as any).customerVat || '—'}</td>
  </tr>
  <tr>
    <td class="label">CR No</td>
    <td>${customer?.crNumber || (invoice as any).customerCr || '—'}</td>
    <td class="label">رقم السجل</td>
    <td>${customer?.crNumber || (invoice as any).customerCr || '—'}</td>
  </tr>
  <tr>
    <td class="label">Address</td>
    <td>${customer?.address || (invoice as any).customerAddress || '—'}${customer?.addressAr ? ' / ' + customer.addressAr : ''}</td>
    <td class="label">العنوان</td>
    <td>${customer?.addressAr || (invoice as any).customerAddressAr || customer?.address || '—'}</td>
  </tr>
  <tr>
    <td class="label">Email</td>
    <td>${customer?.email || (invoice as any).customerEmail || '—'}</td>
    <td class="label">البريد الإلكتروني</td>
    <td>${customer?.email || (invoice as any).customerEmail || '—'}</td>
  </tr>
  <tr>
    <td class="label">Phone</td>
    <td>${customer?.phone || (invoice as any).customerPhone || '—'}</td>
    <td class="label">الجوال</td>
    <td>${customer?.phone || (invoice as any).customerPhone || '—'}</td>
  </tr>
  <tr>
    <td class="label">PO No</td>
    <td>${invoice.poNumber || customer?.crNumber || '—'}</td>
    <td class="label">رقم طلب الشراء</td>
    <td>${invoice.poNumber || customer?.crNumber || '—'}</td>
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
      <td style="text-align:left">${i.name}${i.nameAr ? `<br/><span dir="rtl" style="font-size:9pt;color:#555">${i.nameAr}</span>` : ''}</td>
      <td>Hour</td>
      <td>${i.totalHour}</td>
      <td>${fmt(i.rate)}</td>
      <td>${fmt(i.total)}</td>
      <td>${fmt(i.total * 0.15)}</td>
      <td>${fmt(i.total * 1.15)}</td>
    </tr>`).join('')}
    <tr>
      <td colspan="3" style="font-weight:bold;text-align:right">Total</td>
      <td style="font-weight:bold">${totalHours}</td>
      <td></td>
      <td style="font-weight:bold">${fmt(subtotal)}</td>
      <td style="font-weight:bold">${fmt(vatTotal)}</td>
      <td style="font-weight:bold">${fmt(grandTotal)}</td>
    </tr>
  </tbody>
</table>

<table class="totals-table">
  <tr><td style="text-align:right;direction:rtl"><strong>الاجمالي بدون الضريبة — Total</strong></td><td>${fmt(subtotal)}</td></tr>
  <tr><td style="text-align:right;direction:rtl"><strong>ض. القيمة المضافة ${invoice.taxPercent || 15}% — VAT ${invoice.taxPercent || 15}%</strong></td><td>${fmt(vatTotal)}</td></tr>
  <tr><td class="due" style="text-align:right;direction:rtl"><strong>إجمالي المبالغ المستحقة — Due</strong></td><td class="due">${fmt(grandTotal)}</td></tr>
</table>

<div style="margin-top:10pt;border-top:0.5pt solid #000;padding-top:5pt">
  <table style="width:100%"><tr>
    <td><strong>Due:</strong> ${grandTotal.toLocaleString('en-US')} ${currency}</td>
    <td style="text-align:right;direction:rtl"><strong>إجمالي المبالغ المستحقة:</strong> ${grandTotal.toLocaleString('en-US')} ريال</td>
  </tr></table>
</div>

${invoice.notes || (invoice as any).notesAr ? `<div style="margin-top:15pt;padding:12pt;background:#f9f9ff;border-radius:5pt;border:1pt solid #e5e7eb">
  ${(invoice as any).notesAr ? `<div dir="rtl" style="text-align:right;font-size:13pt;margin-top:4pt">ملاحظات: ${(invoice as any).notesAr}</div>` : ''}
  ${invoice.notes ? `<div style="font-size:13pt">Notes: ${invoice.notes}</div>` : ''}
</div>` : ''}

<div class="footer-band">Website: ${companyWebsite}</div>
</body></html>`;

      return { html, invoiceNo: invoice.invoiceNumber };
    }),
});
