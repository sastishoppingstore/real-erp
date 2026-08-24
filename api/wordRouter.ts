import { z } from "zod";
import { createRouter, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, companySettings } from "@db/schema";
import { eq, sql } from "drizzle-orm";

export const wordRouter = createRouter({
  generateWord: authedMutation
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      // Try construction_invoices first
      let inv: any = null;
      let items: any[] = [];
      let isConstruction = false;

      try {
        const result = await db.execute(
          (`SELECT * FROM construction_invoices WHERE id = ${input.invoiceId} AND tenant_id = ${tenantId}`) as any
        );
        const rows = (result as any)?.[0];
        inv = Array.isArray(rows) ? rows[0] : null;
        if (inv) {
          isConstruction = true;
          const itemResult = await db.execute(
            (`SELECT * FROM construction_invoice_items WHERE invoice_id = ${input.invoiceId} ORDER BY sr`) as any
          );
          items = ((itemResult as any)?.[0] as any[]) || [];
        }
      } catch { /* not a construction invoice */ }

      // If not found, try regular invoices table (sales module)
      if (!inv) {
        const result = await db.execute(
          (`SELECT * FROM invoices WHERE id = ${input.invoiceId} AND tenant_id = ${tenantId}`) as any
        );
        const rows = (result as any)?.[0];
        inv = Array.isArray(rows) ? rows[0] : null;
        if (inv) {
          const itemResult = await db.execute(
            (`SELECT * FROM invoice_items WHERE invoice_id = ${input.invoiceId}`) as any
          );
          items = ((itemResult as any)?.[0] as any[]) || [];
        }
      }

      if (!inv) throw new Error("Invoice not found");

      // Get customer
      let customer: any = null;
      const custId = inv.customer_id;
      if (custId) {
        try {
          const [custRow] = await db.select().from(customers).where(eq(customers.id, custId));
          customer = custRow || null;
        } catch { /* ignore */ }
      }

      // Get company settings
      const [company] = await db.select().from(companySettings).where(eq(companySettings.tenantId, tenantId));

      const companyNameEn = company?.companyName || "YAFCO AL ARABIAH EST.";
      const companyNameAr = company?.companyNameAr || "مؤسسة يافكو العربية";
      const companyLogo = company?.logo || "";
      const companyAddress = "Saudi Arabia - Yanbu Al Bahr - P.O.Box : 2326";
      const companyEmail = company?.email || "info@yafco.com.sa";
      const companyWebsite = company?.website || "www.yafco.com.sa";
      const companyVat = company?.taxNumber || "300995897900003";
      const companyCr = company?.crNumber || "4700012896";

      const custNameEn = customer?.name || inv.customer_name || inv.customerName || "";
      const custNameAr = customer?.name_ar || inv.customer_name_ar || inv.customerNameAr || "";
      const custVat = customer?.vat_number || customer?.tax_number || inv.customer_vat || inv.customerVat || "";
      const custCr = customer?.cr_number || customer?.commercial_registration || inv.customer_cr || inv.customerCr || "";
      const custAddress = customer?.address || inv.customer_address || inv.customerAddress || "";

      const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtVat = (v: number) => Number.isInteger(v) ? String(v) : v.toLocaleString("en-US", { maximumFractionDigits: 2 });

      const totalHours = items.reduce((s: number, r: any) => s + Number(r.total_hour || r.quantity || 0), 0);
      const subtotal = Number(inv.subtotal || inv.sub_total || 0);
      const vatAmount = Number(inv.vat_amount || inv.vatAmount || inv.tax_amount || inv.taxAmount || 0);
      const grandTotal = Number(inv.grand_total || inv.grandTotal || inv.total_amount || inv.totalAmount || 0);
      const vatPercent = Number(inv.vat_percent || inv.taxPercent || 15);

      const created = inv.created_at ? new Date(inv.created_at) : new Date();
      const dateStr = `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, "0")}/${String(created.getDate()).padStart(2, "0")}`;
      const timeStr = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

      const invoiceNo = inv.invoice_no || inv.invoiceNumber || "";
      const workedMonth = inv.worked_month || inv.workedMonth || "";
      const paymentType = inv.payment_type || inv.paymentType || "Credit";
      const cashier = inv.cashier || inv.cashier_name || "مدير النظام";
      const dueDate = inv.due_date || inv.dueDate || "";
      const poNumber = inv.po_number || inv.poNumber || "";
      const notes = inv.notes || "";
      const notesAr = inv.notes_ar || inv.notesAr || "";

      // QR code URL
      const qrPayload = JSON.stringify({
        seller: companyNameAr, vat: companyVat,
        total: grandTotal.toFixed(2), tax: vatAmount.toFixed(2),
        date: dateStr,
      });
      const qrData = Buffer.from(qrPayload, "utf-8").toString("base64");
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

      // Build item rows
      const itemRowsHtml = items.length > 0 ? items.map((r: any, i: number) => {
        const desc = r.description_en || r.description || "";
        const descAr = r.description_ar || "";
        const unit = r.unit || "";
        const qty = Number(r.total_hour || r.quantity || 0);
        const rate = Number(r.rate || r.unit_price || r.unitPrice || 0);
        const total = Number(r.line_total || r.total_amount || r.totalAmount || 0);
        const vat = total * (vatPercent / 100);
        const grand = total + vat;
        return `<tr>
<td style="border:1px solid #000;padding:4pt;text-align:center;font-size:9.5pt;height:40px;">${i + 1}</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:left;font-size:9.5pt;height:40px;">${desc}${descAr ? `<span dir="rtl"> (${descAr})</span>` : ""}</td>
<td style="border:1px solid #000;padding:4pt;text-align:center;font-size:9.5pt;height:40px;">${unit}</td>
<td style="border:1px solid #000;padding:4pt;text-align:center;font-size:9.5pt;height:40px;">${fmt(qty)}</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;height:40px;">${fmt(rate)}</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;height:40px;">${fmt(total)}</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;height:40px;">${fmtVat(vat)}</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;font-weight:600;height:40px;">${fmt(grand)}</td>
</tr>`;
      }).join("") : `<tr><td colspan="8" style="border:1px solid #000;text-align:center;color:#999;height:40px;">—</td></tr>`;

      const totalsRow = `<tr>
<td colspan="3" style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:37.5%;">Total</td>
<td style="border:1px solid #000;padding:4pt;text-align:center;font-weight:bold;font-size:10pt;width:7.5%;">${fmt(totalHours)}</td>
<td style="border:1px solid #000;width:11.5%;">&nbsp;</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:11.5%;">${fmt(subtotal)}</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:9%;">${fmt(vatAmount)}</td>
<td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:19%;">${fmt(grandTotal)}</td>
</tr>`;

      const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>TAX INVOICE - ${invoiceNo}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
@page { size: 215.9mm 279.4mm; margin: 10mm; }
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 0; background: #FFF; }
table { border-collapse: collapse; width: 100%; }
td { vertical-align: top; }
p { margin: 0; padding: 0; }
img { max-width: 130px; max-height: 90px; }
</style>
</head>
<body>

<table style="width:100%;border-collapse:collapse;margin-bottom:5px;">
<tr>
<td style="width:18%;text-align:center;vertical-align:top;">
${companyLogo ? `<img src="${companyLogo}" alt="Logo" style="max-width:130px;max-height:90px;" />` : ""}
</td>
<td style="width:44%;text-align:center;vertical-align:top;">
<div dir="rtl" style="font-size:22pt;font-weight:bold;color:#A6272C;margin-bottom:4pt;">${companyNameAr}</div>
<div style="background:#D9D9D9;padding:6pt 15pt;display:inline-block;border:1px solid #999999;">
<span style="font-size:16pt;font-weight:bold;">TAX INVOICE</span>
<span style="font-size:14pt;font-weight:bold;"> - </span>
<span dir="rtl" style="font-size:15pt;font-weight:bold;">فاتورة الضريبية</span>
</div>
</td>
<td style="width:18%;text-align:center;vertical-align:top;">
<img src="${qrUrl}" alt="QR" style="width:110px;height:110px;" />
</td>
</tr>
</table>

<table style="width:100%;border-collapse:collapse;"><tr><td style="background:#D9D9D9;height:20px;font-size:2pt;">&nbsp;</td></tr></table>

<table style="width:100%;border-collapse:collapse;margin-bottom:12px;border:0.75pt solid #000;">
<tr>
<td style="width:50%;vertical-align:top;padding:0;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="width:40%;font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;border-right:0.5pt solid #000;">Worked Month:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;">${workedMonth || "&nbsp;"}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;border-right:0.5pt solid #000;">Invoice. No:</td><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;">${invoiceNo}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;border-right:0.5pt solid #000;">Payment:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;">${paymentType}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-right:0.5pt solid #000;">Cashier:</td><td dir="rtl" style="text-align:right;font-size:9.5pt;padding:3pt 6pt;">${cashier}</td></tr>
</table>
</td>
<td style="width:50%;vertical-align:bottom;padding:0;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="width:30%;font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;">Date:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;">${dateStr}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;">Time:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000;">${timeStr}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;">Due Date:</td><td style="font-size:9.5pt;padding:3pt 6pt;">${dueDate || "&nbsp;"}</td></tr>
</table>
</td>
</tr>
</table>

<table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
<tr>
<td style="width:48%;vertical-align:top;padding:5pt 8pt;font-size:9.5pt;line-height:1.5;">
<b>Company:</b>&nbsp;${companyNameEn}<br/>
<span dir="rtl">${companyNameAr}</span><br/>
${companyCr}<br/>
<b>VAT No:</b> ${companyVat}&nbsp;<span dir="rtl">:الرقم الضريبي</span><br/>
<b>Address:</b><br/>${companyAddress}<br/>
<b>Email: </b><span style="color:#0563C1;text-decoration:underline;">${companyEmail}</span><br/>
${poNumber ? `<b>PO :</b> ${poNumber}<br/>` : ""}
</td>
<td style="width:4px;border-left:4px solid #000;"></td>
<td style="width:48%;vertical-align:top;padding:5pt 8pt;font-size:9.5pt;line-height:1.5;">
<b>Client :</b><br/>
${custNameEn}${custNameAr ? `, <span dir="rtl">${custNameAr}</span>` : ""}<br/>
${custVat ? `<b>Tax No.</b> ${custVat}<br/>` : ""}
${custAddress ? `${custAddress}<br/>` : ""}
${custCr ? `<b>CR </b>${custCr}` : ""}
</td>
</tr>
</table>

<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
<thead>
<tr>${["تسلسل","المسمى الوظيفي","الوحدة","مجموع الساعات","سعر الساعة","الإجمالي","ض القيمة المضافة","الاجمالي بالضريبة"].map((ar,i)=>`<th style="border:1px solid #000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">${ar}</th>`).join("")}</tr>
<tr>${["Sr. No.","Job Description","Unit","Total Hour","Rate/ Hour","Total","VAT 15%","Grand Total"].map((en,i)=>`<th style="border:1px solid #000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">${en}</th>`).join("")}</tr>
</thead>
<tbody>${itemRowsHtml}${totalsRow}</tbody>
</table>

<table style="width:195pt;border-collapse:collapse;margin-left:auto;margin-top:8pt;font-size:10pt;">
<tr><td dir="rtl" style="text-align:right;padding:3pt 6pt;"><b>الإجمالي بدون الضريبة</b></td><td style="text-align:right;padding:3pt 6pt;font-weight:600;">${fmt(subtotal)}</td></tr>
<tr><td dir="rtl" style="text-align:right;padding:3pt 6pt;"><b>ض. القيمة المضافة ${vatPercent}%</b></td><td style="text-align:right;padding:3pt 6pt;font-weight:600;">${fmt(vatAmount)}</td></tr>
<tr><td dir="rtl" style="text-align:right;padding:5pt 8pt;border-top:0.75pt double #000;border-bottom:0.75pt double #000;font-weight:bold;font-size:12pt;">إجمالي المبالغ المستحقة</td><td style="text-align:right;padding:5pt 8pt;border-top:0.75pt double #000;border-bottom:0.75pt double #000;font-weight:bold;font-size:12pt;">${fmt(grandTotal)}</td></tr>
</table>

<div style="margin-top:6pt;border-top:0.5pt solid #000;padding-top:4pt;font-size:9.5pt;width:100%;">
<b>Due</b>&nbsp;&nbsp;&nbsp;&nbsp;<b>SAR</b>
</div>

${notes || notesAr ? `<div style="margin-top:10px;padding:10px;background:#f9faff;border:1px solid #e5e7eb">
${notesAr ? `<div dir="rtl" style="text-align:right;margin-bottom:4px">ملاحظات: ${notesAr}</div>` : ""}
${notes ? `<div>Notes: ${notes}</div>` : ""}</div>` : ""}

<table style="width:100%;border-collapse:collapse;margin-top:16pt;">
<tr><td style="background:#D9D9D9;text-align:center;padding:14pt 0;">
<span style="font-size:18pt;font-weight:bold;color:#000;">Website: ${companyWebsite}</span>
</td></tr>
</table>

</body></html>`;

      return { html, invoiceNo };
    }),
});
