import { z } from "zod";
import { createRouter, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, companySettings } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const wordRouter = createRouter({
  generateWord: authedMutation
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      // Get construction invoice using raw SQL
      const invoiceResult = await db.execute(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (`SELECT * FROM construction_invoices WHERE id = ${input.invoiceId} AND tenant_id = ${tenantId}`) as any
      );
      const invoiceRows = (invoiceResult as any)?.[0] || [];
      const inv = Array.isArray(invoiceRows) ? invoiceRows[0] : null;
      if (!inv) throw new Error("Invoice not found");

      // Get items
      const itemResult = await db.execute(
        (`SELECT * FROM construction_invoice_items WHERE invoice_id = ${input.invoiceId} ORDER BY sr`) as any
      );
      const items = ((itemResult as any)?.[0] as any[]) || [];

      // Get customer
      let customer: any = null;
      if (inv.customer_id) {
        const [custRow] = await db.select().from(customers).where(eq(customers.id, inv.customer_id));
        customer = custRow || null;
      }

      // Get company settings
      const [company] = await db.select().from(companySettings).where(eq(companySettings.tenantId, tenantId));

      const companyNameEn = company?.companyName || "YAFCO AL ARABIAH EST.";
      const companyNameAr = company?.companyNameAr || "مؤسسة يافكو العربية";
      const companyLogo = company?.logo || "";
      const companyAddress = "Saudi Arabia - Yanbu Al Bahr - P.O.Box : 2326";
      const companyEmail = "info@yafco.com.sa";
      const companyWebsite = "www.yafco.com.sa";
      const companyVat = "300995897900003";
      const companyCr = "4700012896";

      const custNameEn = customer?.name || inv.customer_name || "";
      const custNameAr = customer?.name_ar || inv.customer_name_ar || "";
      const custVat = customer?.vat_number || customer?.tax_number || inv.customer_vat || "";
      const custCr = customer?.cr_number || customer?.commercial_registration || inv.customer_cr || "";
      const custAddress = customer?.address || inv.customer_address || "";

      const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtVat = (v: number) => Number.isInteger(v) ? String(v) : v.toLocaleString("en-US", { maximumFractionDigits: 2 });

      const totalHours = items.reduce((s: number, r: any) => s + Number(r.total_hour || r.quantity || 0), 0);
      const subtotal = Number(inv.subtotal || inv.sub_total || 0);
      const vatAmount = Number(inv.vat_amount || inv.tax_amount || 0);
      const grandTotal = Number(inv.grand_total || inv.total_amount || 0);
      const vatPercent = Number(inv.vat_percent || 15);

      const created = inv.created_at ? new Date(inv.created_at) : new Date();
      const dateStr = `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, "0")}/${String(created.getDate()).padStart(2, "0")}`;
      const timeStr = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

      // QR code URL
      const qrPayload = JSON.stringify({
        seller: companyNameAr, vat: companyVat,
        total: grandTotal.toFixed(2), tax: vatAmount.toFixed(2),
        date: dateStr,
      });
      const qrData = Buffer.from(qrPayload, "utf-8").toString("base64");
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

      // Build item rows with inline styles (Word-safe)
      const itemRowsHtml = items.length > 0 ? items.map((r: any, i: number) => `
        <tr>
          <td style="border:1px solid #000;padding:4pt;text-align:center;font-size:9.5pt;height:40px;">${i + 1}</td>
          <td style="border:1px solid #000;padding:4pt 6pt;text-align:left;font-size:9.5pt;height:40px;">${r.description_en || ""}${r.description_ar ? `<span dir="rtl"> (${r.description_ar})</span>` : ""}</td>
          <td style="border:1px solid #000;padding:4pt;text-align:center;font-size:9.5pt;height:40px;">${r.unit || ""}</td>
          <td style="border:1px solid #000;padding:4pt;text-align:center;font-size:9.5pt;height:40px;">${fmt(Number(r.total_hour || r.quantity || 0))}</td>
          <td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;height:40px;">${fmt(Number(r.rate || r.unit_price || 0))}</td>
          <td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;height:40px;">${fmt(Number(r.line_total || r.total_amount || 0))}</td>
          <td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;height:40px;">${fmtVat(Number(r.line_total || r.total_amount || 0) * (vatPercent / 100))}</td>
          <td style="border:1px solid #000;padding:4pt 6pt;text-align:right;font-size:9.5pt;font-weight:600;height:40px;">${fmt(Number(r.line_total || r.total_amount || 0) * (1 + vatPercent / 100))}</td>
        </tr>`).join("") : `<tr><td colspan="8" style="border:1px solid #000;text-align:center;color:#999;height:40px;">—</td></tr>`;

      const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>TAX INVOICE - ${inv.invoice_no || ""}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100%</w:Zoom>
</w:WordDocument>
</xml>
<![endif]-->
<style>
@page { size: 215.9mm 279.4mm; margin: 10mm; }
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000000; background: #FFFFFF; margin: 0; padding: 0; }
table { border-collapse: collapse; width: 100%; }
td { vertical-align: top; }
p { margin: 0; padding: 0; }
img { max-width: 130px; max-height: 90px; }
</style>
</head>
<body>

<!-- HEADER ZONE -->
<table style="width:100%;border-collapse:collapse;margin-bottom:5px;">
<tr>
<td style="width:18%;text-align:center;vertical-align:top;">
${companyLogo ? `<img src="${companyLogo}" alt="Logo" style="max-width:130px;max-height:90px;" />` : ""}
</td>
<td style="width:44%;text-align:center;vertical-align:top;">
<div dir="rtl" style="font-size:22pt;font-weight:bold;color:#A6272C;margin-bottom:4pt;">
${companyNameAr}
</div>
<div style="background:#D9D9D9;padding:6pt 15pt;display:inline-block;border:1px solid #999999;">
<span style="font-size:16pt;font-weight:bold;color:#000000;">TAX INVOICE</span>
<span style="font-size:14pt;font-weight:bold;color:#000000;"> - </span>
<span dir="rtl" style="font-size:15pt;font-weight:bold;color:#000000;">فاتورة الضريبية</span>
</div>
</td>
<td style="width:18%;text-align:center;vertical-align:top;">
<img src="${qrUrl}" alt="QR" style="width:110px;height:110px;" />
</td>
</tr>
</table>

<!-- GRAY BAR -->
<table style="width:100%;border-collapse:collapse;">
<tr><td style="background:#D9D9D9;height:20px;font-size:2pt;">&nbsp;</td></tr>
</table>

<!-- META INFO -->
<table style="width:100%;border-collapse:collapse;margin-bottom:12px;border:0.75pt solid #000000;">
<tr>
<td style="width:50%;vertical-align:top;padding:0;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="width:40%;font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;border-right:0.5pt solid #000000;">Worked Month:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;">${inv.worked_month || "&nbsp;"}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;border-right:0.5pt solid #000000;">Invoice. No:</td><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;">${inv.invoice_no || "&nbsp;"}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;border-right:0.5pt solid #000000;">Payment:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;">${inv.payment_type || "Credit"}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-right:0.5pt solid #000000;">Cashier:</td><td dir="rtl" style="text-align:right;font-size:9.5pt;padding:3pt 6pt;">${inv.cashier || "مدير النظام"}</td></tr>
</table>
</td>
<td style="width:50%;vertical-align:bottom;padding:0;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="width:30%;font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;">Date:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;">${dateStr}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;">Time:</td><td style="font-size:9.5pt;padding:3pt 6pt;border-bottom:0.5pt solid #000000;">${timeStr}</td></tr>
<tr><td style="font-weight:bold;font-size:9.5pt;padding:3pt 6pt;">Due Date:</td><td style="font-size:9.5pt;padding:3pt 6pt;">${inv.due_date || "&nbsp;"}</td></tr>
</table>
</td>
</tr>
</table>

<!-- COMPANY / CLIENT AREA -->
<table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
<tr>
<td style="width:48%;vertical-align:top;padding:5pt 8pt;font-size:9.5pt;line-height:1.5;">
<b>Company:</b>&nbsp;${companyNameEn}<br/>
<span dir="rtl">${companyNameAr}</span><br/>
${companyCr}<br/>
<b>VAT No:</b> ${companyVat}&nbsp;<span dir="rtl">:الرقم الضريبي</span><br/>
<b>Address:</b><br/>
Saudi Arabia - Yanbu Al Bahr -<br/>
P.O.Box : 2326<br/>
<span dir="rtl" style="display:block;text-align:left;">المملكة العربية السعودية - ينبع البحر - ص . ب 2326:</span><br/>
<b>Email: </b><span style="color:#0563C1;text-decoration:underline;">${companyEmail}</span><br/>
${inv.po_number ? `<b>PO :</b> ${inv.po_number}<br/>` : ""}
</td>
<td style="width:4px;border-left:4px solid #000000;min-height:120px;"></td>
<td style="width:48%;vertical-align:top;padding:5pt 8pt;font-size:9.5pt;line-height:1.5;">
<b>Client :</b><br/>
${custNameEn}${custNameAr ? `, <span dir="rtl">${custNameAr}</span>` : ""}<br/>
${custVat ? `<b>Tax No.</b> ${custVat}<br/>` : ""}
${custAddress ? `${custAddress}<br/>` : ""}
${custCr ? `<b>CR </b>${custCr}` : ""}
</td>
</tr>
</table>

<!-- MAIN TABLE HEADERS -->
<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
<thead>
<tr>
<th style="width:7%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">تسلسل</th>
<th style="width:24%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">المسمى الوظيفي</th>
<th style="width:6.5%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">الوحدة</th>
<th style="width:7.5%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">مجموع الساعات</th>
<th style="width:11.5%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">سعر الساعة</th>
<th style="width:11.5%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">الإجمالي</th>
<th style="width:9%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">ض القيمة المضافة</th>
<th style="width:19%;border:1px solid #000000;background:#D9D9D9;padding:4pt;text-align:center;font-size:9pt;font-weight:bold;height:34px;" dir="rtl">الاجمالي بالضريبة</th>
</tr>
<tr>
<th style="width:7%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">Sr. No.</th>
<th style="width:24%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">Job Description</th>
<th style="width:6.5%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">Unit</th>
<th style="width:7.5%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">Total Hour</th>
<th style="width:11.5%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">Rate/ Hour</th>
<th style="width:11.5%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">Total</th>
<th style="width:9%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">VAT 15%</th>
<th style="width:19%;border:1px solid #000000;background:#DCE6F1;padding:4pt;text-align:center;font-size:8.5pt;font-weight:bold;height:35px;">Grand Total</th>
</tr>
</thead>
<tbody>
${itemRowsHtml}
<tr>
<td colspan="3" style="border:1px solid #000000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:37.5%;">Total</td>
<td style="border:1px solid #000000;padding:4pt;text-align:center;font-weight:bold;font-size:10pt;width:7.5%;">${fmt(totalHours)}</td>
<td style="border:1px solid #000000;width:11.5%;">&nbsp;</td>
<td style="border:1px solid #000000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:11.5%;">${fmt(subtotal)}</td>
<td style="border:1px solid #000000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:9%;">${fmt(vatAmount)}</td>
<td style="border:1px solid #000000;padding:4pt 6pt;text-align:right;font-weight:bold;font-size:10pt;width:19%;">${fmt(grandTotal)}</td>
</tr>
</tbody>
</table>

<!-- TOTALS SUMMARY -->
<table style="width:195pt;border-collapse:collapse;margin-left:auto;margin-top:8pt;font-size:10pt;">
<tr><td dir="rtl" style="text-align:right;padding:3pt 6pt;"><b>الإجمالي بدون الضريبة</b></td><td style="text-align:right;padding:3pt 6pt;font-weight:600;">${fmt(subtotal)}</td></tr>
<tr><td dir="rtl" style="text-align:right;padding:3pt 6pt;"><b>ض. القيمة المضافة ${vatPercent}%</b></td><td style="text-align:right;padding:3pt 6pt;font-weight:600;">${fmt(vatAmount)}</td></tr>
<tr><td dir="rtl" style="text-align:right;padding:5pt 8pt;border-top:0.75pt double #000000;border-bottom:0.75pt double #000000;font-weight:bold;font-size:12pt;">إجمالي المبالغ المستحقة</td><td style="text-align:right;padding:5pt 8pt;border-top:0.75pt double #000000;border-bottom:0.75pt double #000000;font-weight:bold;font-size:12pt;">${fmt(grandTotal)}</td></tr>
</table>

<!-- AMOUNT IN WORDS -->
<div style="margin-top:6pt;border-top:0.5pt solid #000000;padding-top:4pt;font-size:9.5pt;width:100%;">
<b>Due</b>&nbsp;&nbsp;&nbsp;&nbsp;<b>SAR</b>
</div>

<!-- WEBSITE FOOTER -->
<table style="width:100%;border-collapse:collapse;margin-top:16pt;">
<tr><td style="background:#D9D9D9;text-align:center;padding:14pt 0;">
<span style="font-size:18pt;font-weight:bold;color:#000000;">Website: ${companyWebsite}</span>
</td></tr>
</table>

</body>
</html>`;

      return { html, invoiceNo: inv.invoice_no };
    }),
});
