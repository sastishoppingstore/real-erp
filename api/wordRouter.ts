import { z } from "zod";
import { createRouter, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, companySettings } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const wordRouter = createRouter({
  generateWord: authedMutation
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      // Get construction invoice using raw SQL (table not in drizzle schema)
      const [invoiceRows] = await db.execute(sql`
        SELECT * FROM construction_invoices WHERE id = ${input.invoiceId} AND tenant_id = ${tenantId}
      `);
      const invoice = (invoiceRows as any)?.[0];
      if (!invoice) throw new Error("Invoice not found");

      const [itemRows] = await db.execute(sql`
        SELECT * FROM construction_invoice_items WHERE invoice_id = ${input.invoiceId}
      `);
      const items = (itemRows as any) || [];

      const [customerRows] = invoice.customer_id ? await db.execute(sql`
        SELECT * FROM customers WHERE id = ${invoice.customer_id}
      `) : [null];
      const customer = customerRows?.[0] || null;

      const [companyRows] = await db.select().from(companySettings)
        .where(eq(companySettings.tenantId, tenantId));
      const company = companyRows;

      const companyName = company?.companyName || "YAFCO AL ARABIAH EST.";
      const companyNameAr = company?.companyNameAr || "مؤسسة يافكو العربية";
      const companyLogo = company?.logo || "";
      const companyAddress = company?.address || "Saudi Arabia - Yanbu Al Bahr - P.O.Box: 2326";
      const companyPhone = company?.phone || "";
      const companyEmail = company?.email || "info@yafco.com.sa";
      const companyWebsite = company?.website || "www.yafco.com.sa";
      const companyVat = company?.taxNumber || "300995897900003";
      const companyCr = company?.crNumber || "4700012896";
      const currency = company?.currency || "SAR";

      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const totalHours = items.reduce((s: number, r: any) => s + Number(r.total_hour || r.quantity || 0), 0);
      const subtotal = Number(invoice.subtotal || invoice.sub_total || 0);
      const vatTotal = Number(invoice.vat_amount || invoice.taxAmount || 0);
      const grandTotal = Number(invoice.grand_total || invoice.totalAmount || 0);

      const printItems = items.map((it: any, i: number) => ({
        no: i + 1,
        name: it.description_en || it.description || "",
        nameAr: it.description_ar || "",
        unit: it.unit || "Hour",
        totalHour: Number(it.total_hour || it.quantity || 0),
        rate: Number(it.rate || it.unit_price || 0),
        total: Number(it.line_total || it.total_amount || 0),
      }));

      const qrPayload = JSON.stringify({
        seller: companyNameAr || companyName, vat: companyVat,
        total: grandTotal.toFixed(2), tax: vatTotal.toFixed(2),
        date: invoice.date || new Date().toISOString(),
      });
      const qrData = btoa(unescape(encodeURIComponent(qrPayload)));
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

      const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Invoice ${invoice.invoice_no}</title>
<style>
body{font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0;padding:20px;color:#000}
table{border-collapse:collapse;width:100%}
td,th{border:0.5pt solid #000;padding:4pt 6pt}
.header-table{border:none!important;margin-bottom:10px}
.header-table td{border:none!important;padding:5px}
.logo-cell{width:120px;text-align:center;vertical-align:top}
.company-cell{text-align:center;vertical-align:top;padding:0 15px}
.company-name{font-size:20pt;color:#A6272C;font-weight:bold;margin:0}
.company-ar{font-size:14pt;color:#1e3a8a;font-weight:bold;margin:2px 0;direction:rtl}
.qr-cell{width:120px;text-align:center;vertical-align:top}
.title-bar{background:#D9D9D9;text-align:center;padding:8pt;font-size:13pt;font-weight:bold;border-top:1pt solid #000;border-bottom:1pt solid #000;margin:10px 0}
.meta-tbl{margin:10px 0}
.meta-tbl td{font-size:9.5pt;padding:5px 8px}
.client-tbl{margin:10px 0}
.client-tbl td{font-size:9.5pt;padding:5px 8px;vertical-align:top}
.client-tbl .label{font-weight:bold;background:#f9f9ff;width:15%}
.items-tbl th{background:#E7E7E7;font-size:9pt;text-align:center;padding:6px 4px}
.items-tbl td{font-size:9.5pt;text-align:center;padding:5px 4px}
.items-tbl td.left{text-align:left}
.totals-tbl{width:40%;margin-left:auto;margin-top:10px}
.totals-tbl td{font-size:10pt;padding:5px 8px}
.due{font-size:12pt;font-weight:bold;border:1.5pt double #000}
.footer-band{background:#D9D9D9;text-align:center;padding:6px;margin-top:20px;font-size:9.5pt}
</style></head>
<body>
<table class="header-table">
<tr>
<td class="logo-cell">${companyLogo ? `<img src="${companyLogo}" width="90" height="90" style="object-fit:contain"/>` : ''}</td>
<td class="company-cell">
<div style="font-size:20pt;color:#A6272C;font-weight:bold">${companyName}</div>
<div class="company-ar">${companyNameAr}</div>
<div style="font-size:9.5pt">${companyAddress}</div>
<div style="font-size:9.5pt"><span style="color:#0563C1;text-decoration:underline">${companyEmail}</span></div>
<div style="font-size:9.5pt"><strong>VAT No:</strong> ${companyVat} &nbsp;&nbsp;<strong>CR No:</strong> ${companyCr}</div>
</td>
<td class="qr-cell"><img src="${qrUrl}" width="110" height="110"/></td>
</tr>
</table>

<div class="title-bar">فاتورة الضريبية - TAX INVOICE</div>

<table class="meta-tbl">
<tr><td style="width:15%"><b>Worked Month:</b></td><td style="width:35%">${invoice.worked_month || '—'}</td><td style="width:15%"><b>Date:</b></td><td style="width:35%">${invoice.date || ''}</td></tr>
<tr><td><b>Invoice. No:</b></td><td>${invoice.invoice_no}</td><td><b>Time:</b></td><td>—</td></tr>
<tr><td><b>Payment:</b></td><td>${invoice.payment_type || 'Credit'}</td><td><b>Due Date:</b></td><td>${invoice.due_date || '—'}</td></tr>
<tr><td><b>Cashier:</b></td><td>${invoice.cashier || 'مدير النظام'}</td><td><b>PO No:</b></td><td>${invoice.po_number || '—'}</td></tr>
</table>

<table class="client-tbl">
<tr><td class="label">Customer Name / اسم العميل</td><td colspan="3"><b>${customer?.name || invoice.customer_name || ''}${customer?.nameAr || invoice.customer_nameAr ? ' / ' + (customer?.nameAr || invoice.customer_nameAr) : ''}</b></td></tr>
<tr><td class="label">Tax No / الرقم الضريبي</td><td colspan="3">${customer?.vatNumber || customer?.taxNumber || invoice.customer_vat || '—'}</td></tr>
<tr><td class="label">CR No / رقم السجل</td><td colspan="3">${customer?.crNumber || customer?.commercialRegistration || invoice.customer_cr || '—'}</td></tr>
<tr><td class="label">Address / العنوان</td><td colspan="3">${customer?.address || invoice.customer_address || '—'}${customer?.addressAr || invoice.customer_address_ar ? ' / ' + (customer?.addressAr || invoice.customer_address_ar) : ''}</td></tr>
<tr><td class="label">Phone / الجوال</td><td colspan="3">${customer?.phone || invoice.customer_phone || '—'}</td></tr>
<tr><td class="label">PO No / رقم طلب الشراء</td><td colspan="3">${invoice.po_number || '—'}</td></tr>
</table>

<table class="items-tbl">
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
<td class="left">${i.name}${i.nameAr ? `<br/><span dir="rtl">${i.nameAr}</span>` : ''}</td>
<td>${i.unit}</td>
<td>${fmt(i.totalHour)}</td>
<td>${fmt(i.rate)}</td>
<td>${fmt(i.total)}</td>
<td>${fmt(i.total * 0.15)}</td>
<td style="font-weight:bold">${fmt(i.total * 1.15)}</td>
</tr>`).join('')}
<tr>
<td colspan="3" style="text-align:right;font-weight:bold">Total</td>
<td style="font-weight:bold">${fmt(totalHours)}</td>
<td></td>
<td style="font-weight:bold">${fmt(subtotal)}</td>
<td style="font-weight:bold">${fmt(vatTotal)}</td>
<td style="font-weight:bold">${fmt(grandTotal)}</td>
</tr>
</tbody>
</table>

<table class="totals-tbl">
<tr><td dir="rtl" style="text-align:right"><b>الاجمالي بدون الضریبة — Total</b></td><td>${fmt(subtotal)}</td></tr>
<tr><td dir="rtl" style="text-align:right"><b>ض. القیمة المضافة 15% — VAT 15%</b></td><td>${fmt(vatTotal)}</td></tr>
<tr><td dir="rtl" style="text-align:right" class="due"><b>إجمالي المبالغ المستحقة — Due</b></td><td class="due">${fmt(grandTotal)}</td></tr>
</table>

<div style="margin-top:10px;border-top:0.5pt solid #000;padding-top:5px">
<table style="width:100%"><tr>
<td><b>Due:</b> ${grandTotal.toLocaleString()} ${currency}</td>
<td style="text-align:right;direction:rtl"><b>إجمالي المبالغ المستحقة:</b> ${grandTotal.toLocaleString()} ريال</td>
</tr></table>
</div>

${notesHtml(invoice)}

<div class="footer-band">Website: ${companyWebsite}</div>
</body></html>`;

      function notesHtml(inv: any): string {
        if (!inv.notes && !inv.notesAr) return "";
        let h = '<div style="margin-top:10px;padding:10px;background:#f9faff;border:1px solid #e5e7eb">';
        if (inv.notesAr) h += `<div dir="rtl" style="text-align:right;margin-bottom:4px">ملاحظات: ${inv.notesAr}</div>`;
        if (inv.notes) h += `<div>Notes: ${inv.notes}</div>`;
        h += '</div>';
        return h;
      }

      return { html, invoiceNo: invoice.invoice_no };
    }),
});
