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

      // Build HTML for Word
      const companyName = company?.companyName || "Company";
      const companyNameAr = company?.companyNameAr || "";
      const companyLogo = company?.logo || "";
      const companyAddress = company?.address || "";
      const companyEmail = company?.email || "";
      const companyWebsite = company?.website || "";
      const companyVat = company?.taxNumber || "";
      const companyCr = company?.crNumber || "";
      const companyStamp = company?.stamp || "";
      const currency = company?.defaultCurrency || "SAR";
      const taxPercent = invoice.taxPercent || "15";

      const printItems = items.map((it: any, i: number) => ({
        no: i + 1,
        name: it.description || "",
        nameAr: "",
        qty: Number(it.quantity || 1),
        rate: Number(it.unitPrice || 0),
        total: Number(it.totalAmount || 0),
      }));

      const qrPayload = JSON.stringify({
        seller: companyNameAr || companyName,
        vat: companyVat,
        total: Number(invoice.totalAmount || 0).toFixed(2),
        tax: Number(invoice.taxAmount || 0).toFixed(2),
        date: invoice.date || new Date().toISOString(),
      });
      const qrData = btoa(unescape(encodeURIComponent(qrPayload)));
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

      const subtotal = Number(invoice.subTotal || 0);
      const vatTotal = Number(invoice.taxAmount || 0);
      const grandTotal = Number(invoice.totalAmount || 0);
      const totalHours = items.reduce((s: number, r: any) => s + Number(r.quantity || 1), 0);

      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Invoice ${invoice.invoiceNumber}</title>
<style>
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 0; padding: 0; }
table { border-collapse: collapse; width: 100%; }
td, th { border: 0.5pt solid #000; padding: 4pt 6pt; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10pt; }
.logo-box { width: 128px; height: 128px; text-align: center; }
.logo-box img { max-width: 128px; max-height: 128px; object-fit: contain; }
.company-center { flex: 1; text-align: center; padding: 0 15px; }
.company-center h1 { font-size: 20pt; color: #A6272C; margin: 0; font-weight: bold; }
.company-center h2 { font-size: 14pt; color: #1e3a8a; margin: 2pt 0; font-weight: bold; }
.company-center p { font-size: 9.5pt; margin: 1pt 0; }
.qr-box { width: 128px; height: 128px; text-align: center; }
.qr-box img { width: 110px; height: 110px; }
.title-bar { background: #E7E7E7; text-align: center; padding: 8pt; margin: 10pt 0; border-top: 1pt solid #000; border-bottom: 1pt solid #000; }
.title-bar h3 { font-size: 13pt; margin: 0; font-weight: bold; }
.meta-table { width: 100%; border: 0.75pt solid #000; margin: 10pt 0; }
.meta-table td { font-size: 9.5pt; padding: 5pt 8pt; border: 0.5pt solid #000; }
.client-table { width: 100%; margin: 10pt 0; }
.client-table td { font-size: 9.5pt; padding: 4pt 6pt; vertical-align: top; }
.items-table { width: 100%; margin: 10pt 0; }
.items-table th { background: #E7E7E7; font-size: 9pt; font-weight: bold; text-align: center; padding: 6pt 4pt; border: 0.5pt solid #000; }
.items-table td { font-size: 9.5pt; text-align: center; padding: 5pt 4pt; border: 0.5pt solid #000; }
.items-table td.text-left { text-align: left; }
.totals-table { width: 40%; margin-left: auto; margin-top: 10pt; }
.totals-table td { font-size: 10pt; padding: 5pt 8pt; border: 0.5pt solid #000; }
.totals-table .due { font-size: 12pt; font-weight: bold; border: 1.5pt double #000; }
.footer { background: #E7E7E7; text-align: center; padding: 6pt; margin-top: 20pt; font-size: 9.5pt; }
.stamp-box { text-align: center; margin-top: 15pt; }
.stamp-box img { width: 130px; height: 130px; }
</style>
</head>
<body>
<div class="header">
  <div class="logo-box">${companyLogo ? `<img src="${companyLogo}" alt="Logo">` : ""}</div>
  <div class="company-center">
    <div dir="rtl" style="font-size:20pt;color:#A6272C;font-weight:bold;">${companyNameAr}</div>
    <h2>${companyName}</h2>
    ${companyAddress ? `<p>${companyAddress}</p>` : ""}
    ${companyEmail ? `<p>Email: <span style="color:#0563C1;text-decoration:underline;">${companyEmail}</span></p>` : ""}
    ${companyVat ? `<p><strong>VAT No:</strong> ${companyVat}</p>` : ""}
    ${companyCr ? `<p><strong>CR No:</strong> ${companyCr}</p>` : ""}
  </div>
  <div class="qr-box"><img src="${qrUrl}" alt="QR"></div>
</div>

<div class="title-bar">
  <h3>فاتورة ضريبية - TAX INVOICE</h3>
</div>

<table class="meta-table">
  <tr>
    <td style="width:15%;"><strong>Worked Month:</strong></td>
    <td style="width:35%;">${invoice.workedMonth || "—"}</td>
    <td style="width:15%;"><strong>Date:</strong></td>
    <td style="width:35%;">${invoice.date || "—"}</td>
  </tr>
  <tr>
    <td><strong>Invoice. No:</strong></td>
    <td>${invoice.invoiceNumber}</td>
    <td><strong>Time:</strong></td>
    <td>${invoice.time || new Date().toLocaleTimeString()}</td>
  </tr>
  <tr>
    <td><strong>Payment:</strong></td>
    <td>${invoice.paymentType || "Credit"}</td>
    <td><strong>Due Date:</strong></td>
    <td>${invoice.dueDate || "—"}</td>
  </tr>
  <tr>
    <td><strong>Cashier:</strong></td>
    <td>${invoice.cashier || "مدير النظام"}</td>
    <td><strong>PO No:</strong></td>
    <td>${invoice.poNumber || "—"}</td>
  </tr>
</table>

<table class="client-table">
  <tr>
    <td style="width:8%;"><strong>Company:</strong></td>
    <td style="width:32%;"><strong>${companyName}</strong></td>
    <td style="width:10%;text-align:right;direction:rtl;"><strong>: الشركة</strong></td>
    <td style="width:30%;"><strong>Client:</strong></td>
    <td style="width:20%;">${customer?.name || (invoice as any).customerName || "Walk-in Customer"}${customer?.nameAr ? " - " + customer.nameAr : ""}</td>
  </tr>
  <tr>
    <td><strong>VAT No:</strong></td>
    <td>${companyVat}</td>
    <td style="text-align:right;direction:rtl;"><strong>: الرقم الضريبي</strong></td>
    <td><strong>Tax No:</strong></td>
    <td>${customer?.vatNumber || "—"}</td>
  </tr>
  <tr>
    <td><strong>Address:</strong></td>
    <td>${companyAddress}</td>
    <td style="text-align:right;direction:rtl;"><strong>: العنوان</strong></td>
    <td><strong>Address:</strong></td>
    <td>${customer?.address || "—"}</td>
  </tr>
  <tr>
    <td><strong>CR No:</strong></td>
    <td>${companyCr || "—"}</td>
    <td style="text-align:right;direction:rtl;"><strong>: رقم السجل</strong></td>
    <td><strong>CR:</strong></td>
    <td>${customer?.crNumber || "—"}</td>
  </tr>
  <tr>
    <td><strong>Email:</strong></td>
    <td>${companyEmail ? `<span style="color:#0563C1;text-decoration:underline;">${companyEmail}</span>` : "—"}</td>
    <td></td>
    <td><strong>Phone:</strong></td>
    <td>${customer?.phone || "—"}</td>
  </tr>
</table>

<table class="items-table">
  <thead>
    <tr>
      <th style="width:5%;">تسلسل<br/>Sr. No.</th>
      <th style="width:25%;">المسمى الوظيفي<br/>Job Description</th>
      <th style="width:8%;">الوحدة<br/>Unit</th>
      <th style="width:12%;">مجموع الساعات<br/>Total Hour</th>
      <th style="width:12%;">سعر الساعة<br/>Rate/Hour</th>
      <th style="width:13%;">الإجمالي<br/>Total</th>
      <th style="width:10%;">ض القيمة المضافة 15%<br/>VAT 15%</th>
      <th style="width:15%;">الاجمالي بالضريبة<br/>Grand Total</th>
    </tr>
  </thead>
  <tbody>
    ${printItems.map((i: any) => `
    <tr>
      <td>${i.no}</td>
      <td class="text-left">${i.name}</td>
      <td>Hour</td>
      <td>${i.qty}</td>
      <td>${fmt(i.rate)}</td>
      <td>${fmt(i.total)}</td>
      <td>${fmt(i.total * 0.15)}</td>
      <td>${fmt(i.total * 1.15)}</td>
    </tr>`).join("")}
    <tr>
      <td colspan="3" style="font-weight:bold;text-align:right;">Total</td>
      <td style="font-weight:bold;">${totalHours}</td>
      <td></td>
      <td style="font-weight:bold;">${fmt(subtotal)}</td>
      <td style="font-weight:bold;">${fmt(vatTotal)}</td>
      <td style="font-weight:bold;">${fmt(grandTotal)}</td>
    </tr>
  </tbody>
</table>

<table class="totals-table">
  <tr>
    <td style="text-align:right;direction:rtl;"><strong>الاجمالي بدون الضريبة — Total</strong></td>
    <td>${fmt(subtotal)}</td>
  </tr>
  <tr>
    <td style="text-align:right;direction:rtl;"><strong>ض. القيمة المضافة 15% — VAT 15%</strong></td>
    <td>${fmt(vatTotal)}</td>
  </tr>
  <tr>
    <td class="due" style="text-align:right;direction:rtl;"><strong>إجمالي المبالغ المستحقة — Due</strong></td>
    <td class="due">${fmt(grandTotal)}</td>
  </tr>
</table>

<div style="margin-top: 10pt; border-top: 0.5pt solid #000; padding-top: 5pt;">
  <table style="width:100%;">
    <tr>
      <td><strong>Due:</strong> ${grandTotal.toLocaleString('en-US')} ${currency}</td>
      <td style="text-align:right;direction:rtl;"><strong>إجمالي المبالغ المستحقة:</strong> ${grandTotal.toLocaleString('en-US')} ريال</td>
    </tr>
  </table>
</div>

<div class="footer">
  Website: ${companyWebsite}
</div>

${companyStamp ? `<div class="stamp-box"><img src="${companyStamp}" alt="Stamp"></div>` : ""}

</body>
</html>`;

      return { html, invoiceNo: invoice.invoiceNumber };
    }),
});
