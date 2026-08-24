import { z } from "zod";
import { createRouter, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, companySettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const wordRouter = createRouter({
  generateWord: authedMutation
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      // Try construction_invoices first, then regular invoices
      let inv: any = null;
      let items: any[] = [];
      let customer: any = null;

      try {
        const r1 = await db.execute((`SELECT * FROM construction_invoices WHERE id=${input.invoiceId} AND tenant_id=${tenantId}`) as any);
        const rows1 = (r1 as any)?.[0];
        inv = Array.isArray(rows1) ? rows1[0] : null;
        if (inv) {
          const r2 = await db.execute((`SELECT * FROM construction_invoice_items WHERE invoice_id=${input.invoiceId} ORDER BY sr`) as any);
          items = ((r2 as any)?.[0] as any[]) || [];
        }
      } catch { /* skip */ }

      if (!inv) {
        const r3 = await db.execute((`SELECT * FROM invoices WHERE id=${input.invoiceId} AND tenant_id=${tenantId}`) as any);
        const rows2 = (r3 as any)?.[0];
        inv = Array.isArray(rows2) ? rows2[0] : null;
        if (inv) {
          const r4 = await db.execute((`SELECT * FROM invoice_items WHERE invoice_id=${input.invoiceId}`) as any);
          items = ((r4 as any)?.[0] as any[]) || [];
        }
      }

      if (!inv) throw new Error("Invoice not found");

      // Get customer
      const custId = inv.customer_id || inv.customerId;
      if (custId) {
        const [c] = await db.select().from(customers).where(eq(customers.id, Number(custId)));
        customer = c || null;
      }

      // Get company
      const [co] = await db.select().from(companySettings).where(eq(companySettings.tenantId, tenantId));

      const coNameEn = co?.companyName || "YAFCO AL ARABIAH EST.";
      const coNameAr = "مؤسسة يافكو العربية";
      const coVat = co?.taxNumber || "300995897900003";
      const coCr = co?.crNumber || "4700012896";
      const coAddrEn = "Saudi Arabia - Yanbu Al Bahr - P.O.Box : 2326";
      const coAddrAr = "المملكة العربية السعودية - ينبع البحر - ص . ب 2326:";
      const coEmail = co?.email || "info@yafco.com.sa";
      const coWeb = co?.website || "www.yafco.com.sa";
      const logoDataUri = co?.logo || "";

      const custName = customer?.name || inv.customer_name || inv.customerName || "";
      const custNameAr = customer?.name_ar || inv.customer_name_ar || "";
      const custVat = customer?.vat_number || customer?.tax_number || inv.customer_vat || "";
      const custCr = customer?.cr_number || customer?.commercial_registration || inv.customer_cr || "";
      const custAddr = customer?.address || inv.customer_address || "";

      const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const totalHrs = items.reduce((s: number, r: any) => s + Number(r.total_hour || r.quantity || 0), 0);
      const subT = Number(inv.subtotal || inv.sub_total || 0);
      const vatT = Number(inv.vat_amount || inv.vatAmount || inv.tax_amount || inv.taxAmount || 0);
      const grandT = Number(inv.grand_total || inv.grandTotal || inv.total_amount || inv.totalAmount || 0);
      const vatPct = Number(inv.vat_percent || inv.taxPercent || 15);

      const created = inv.created_at ? new Date(inv.created_at) : new Date();
      const dateStr = `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, "0")}/${String(created.getDate()).padStart(2, "0")}`;
      const timeStr = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      const invNo = inv.invoice_no || inv.invoiceNumber || "";
      const workedMonth = inv.worked_month || inv.workedMonth || "";
      const payType = inv.payment_type || inv.paymentType || "Credit";
      const cashier = inv.cashier || inv.cashier_name || "مدير النظام";
      const dueDate = inv.due_date || inv.dueDate || "";
      const poNum = inv.po_number || inv.poNumber || "";
      const notes = inv.notes || "";
      const notesAr = inv.notes_ar || "";

      // QR code
      const qrPayload = JSON.stringify({ seller: coNameAr, vat: coVat, total: grandT.toFixed(2), tax: vatT.toFixed(2), date: dateStr });
      const qrB64 = Buffer.from(qrPayload).toString("base64");
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrB64)}`;

      // Build item rows — ALL inline styles, NO <style> tag
      const itemRows = items.map((r: any, i: number) => {
        const qty = Number(r.total_hour || r.quantity || 0);
        const rate = Number(r.rate || r.unit_price || 0);
        const total = Number(r.line_total || r.total_amount || 0);
        const vat = total * (vatPct / 100);
        const grand = total * (1 + vatPct / 100);
        const desc = r.description_en || r.description || "";
        const descAr = r.description_ar || "";
        return `<tr>
<td style="border:0.75pt solid #000000;padding:3pt;text-align:center;font-size:9pt;width:7%;">${i + 1}</td>
<td style="border:0.75pt solid #000000;padding:3pt 5pt;font-size:9pt;width:24%;">${desc}${descAr ? ` <span dir="rtl" style="font-size:8.5pt;">(${descAr})</span>` : ""}</td>
<td style="border:0.75pt solid #000000;padding:3pt;text-align:center;font-size:9pt;width:6%;">${r.unit || ""}</td>
<td style="border:0.75pt solid #000000;padding:3pt;text-align:center;font-size:9pt;width:11%;">${qty.toLocaleString()}</td>
<td style="border:0.75pt solid #000000;padding:3pt 5pt;text-align:right;font-size:9pt;width:12%;">${fmt(rate)}</td>
<td style="border:0.75pt solid #000000;padding:3pt 5pt;text-align:right;font-size:9pt;width:13%;">${fmt(total)}</td>
<td style="border:0.75pt solid #000000;padding:3pt 5pt;text-align:right;font-size:9pt;width:11%;">${vat.toLocaleString(undefined,{maximumFractionDigits:2})}</td>
<td style="border:0.75pt solid #000000;padding:3pt 5pt;text-align:right;font-size:9pt;font-weight:bold;width:16%;">${fmt(grand)}</td>
</tr>`;
      }).join("");

      // Logo as base64 data URI or empty
      const logoHtml = logoDataUri ? `<img src="${logoDataUri}" width="90" height="60" style="width:90pt;height:60pt;" />` : "&nbsp;";

      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>TAX INVOICE ${invNo}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
</head>
<body style="font-family:Calibri,Arial,sans-serif;font-size:10pt;color:#000000;margin:0;padding:10pt;background:#FFFFFF;">

<!-- HEADER -->
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:6pt;">
<tr>
<td width="20%" align="center" valign="middle">${logoHtml}</td>
<td width="50%" align="center" valign="middle">
<p style="font-size:18pt;font-weight:bold;color:#A6272C;margin:0;text-align:center;" dir="rtl">${coNameAr}</p>
<table width="100%" cellpadding="2" cellspacing="0"><tr><td align="center" style="background-color:#D9D9D9;padding:5pt;">
<span style="font-size:14pt;font-weight:bold;color:#000000;">TAX INVOICE-</span>
<span dir="rtl" style="font-size:13pt;font-weight:bold;color:#000000;">فاتورة الضريبية</span>
</td></tr></table>
</td>
<td width="20%" align="center" valign="middle"><img src="${qrUrl}" width="100" height="100" /></td>
</tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4pt;"><tr><td style="background-color:#D9D9D9;height:15pt;font-size:2pt;">&nbsp;</td></tr></table>

<!-- META LEFT + RIGHT -->
<table width="100%" cellpadding="3" cellspacing="0" style="border-collapse:collapse;border:0.75pt solid #000000;margin-bottom:8pt;">
<tr>
<td width="50%" valign="top">
<table width="100%" cellpadding="2" cellspacing="0">
<tr><td width="35%" style="font-weight:bold;font-size:9pt;border-bottom:0.5pt solid #000000;border-right:0.5pt solid #000000;">Worked Month:</td><td style="font-size:9pt;border-bottom:0.5pt solid #000000;">${workedMonth}&nbsp;</td></tr>
<tr><td style="font-weight:bold;font-size:9pt;border-bottom:0.5pt solid #000000;border-right:0.5pt solid #000000;">Invoice. No:</td><td style="font-weight:bold;font-size:9pt;border-bottom:0.5pt solid #000000;">${invNo}&nbsp;</td></tr>
<tr><td style="font-weight:bold;font-size:9pt;border-bottom:0.5pt solid #000000;border-right:0.5pt solid #000000;">Payment:</td><td style="font-size:9pt;border-bottom:0.5pt solid #000000;">${payType}&nbsp;</td></tr>
<tr><td style="font-weight:bold;font-size:9pt;border-right:0.5pt solid #000000;">Cashier:</td><td dir="rtl" align="right" style="font-size:9pt;">${cashier}&nbsp;</td></tr>
</table>
</td>
<td width="50%" valign="bottom">
<table width="100%" cellpadding="2" cellspacing="0">
<tr><td width="30%" style="font-weight:bold;font-size:9pt;border-bottom:0.5pt solid #000000;">Date:</td><td style="font-size:9pt;border-bottom:0.5pt solid #000000;">${dateStr}&nbsp;</td></tr>
<tr><td style="font-weight:bold;font-size:9pt;border-bottom:0.5pt solid #000000;">Time:</td><td style="font-size:9pt;border-bottom:0.5pt solid #000000;">${timeStr}&nbsp;</td></tr>
<tr><td style="font-weight:bold;font-size:9pt;">Due Date:</td><td style="font-size:9pt;">${dueDate}&nbsp;</td></tr>
</table>
</td>
</tr>
</table>

<!-- COMPANY | CLIENT -->
<table width="100%" cellpadding="3" cellspacing="0" style="border-collapse:collapse;margin-bottom:8pt;">
<tr>
<td width="48%" valign="top" style="font-size:9pt;line-height:150%;padding-right:5pt;">
<b>Company:</b>&nbsp;${coNameEn}<br/>
<p dir="rtl" style="text-align:left;margin:1pt 0;">${coNameAr}</p>
${coCr}<br/>
<b>VAT No:</b> ${coVat}&nbsp;<span dir="rtl">:الرقم الضريبي</span><br/>
<b>Address:</b><br/>${coAddrEn}<br/>
<p dir="rtl" style="text-align:left;margin:1pt 0;">${coAddrAr}</p>
<b>Email: </b><span style="color:#0563C1;text-decoration:underline;">${coEmail}</span><br/>
${poNum ? `<b>PO :</b> ${poNum}` : ""}
</td>
<td width="4" style="border-left:3pt solid #000000;">&nbsp;</td>
<td width="48%" valign="top" style="font-size:9pt;line-height:150%;padding-left:5pt;">
<b>Client :</b>&nbsp;<br/>${custName}${custNameAr ? `, <span dir="rtl">${custNameAr}</span>` : ""}<br/>
${custVat ? `<b>Tax No.</b> ${custVat}<br/>` : ""}
${custAddr ? `${custAddr}<br/>` : ""}
${custCr ? `<b>CR </b>${custCr}` : ""}
</td>
</tr>
</table>

<!-- ITEMS TABLE -->
<table width="100%" cellpadding="2" cellspacing="0" style="border-collapse:collapse;">
<tr align="center">
<td width="7%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">تسلسل<br/><span style="font-size:7.5pt;font-weight:normal;">Sr. No.</span></td>
<td width="24%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">المسمى الوظيفي<br/><span style="font-size:7.5pt;font-weight:normal;">Job Description</span></td>
<td width="6%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">الوحدة<br/><span style="font-size:7.5pt;font-weight:normal;">Unit</span></td>
<td width="11%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">مجموع الساعات<br/><span style="font-size:7.5pt;font-weight:normal;">Total Hour</span></td>
<td width="12%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">سعر الساعة<br/><span style="font-size:7.5pt;font-weight:normal;">Rate/ Hour</span></td>
<td width="12%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">الإجمالي<br/><span style="font-size:7.5pt;font-weight:normal;">Total</span></td>
<td width="11%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">ض القيمة المضافة<br/><span style="font-size:7.5pt;font-weight:normal;">VAT 15%</span></td>
<td width="17%" style="border:0.75pt solid #000000;background-color:#D9D9D9;font-weight:bold;font-size:8.5pt;height:26pt;" dir="rtl">الاجمالي بالضريبة<br/><span style="font-size:7.5pt;font-weight:normal;">Grand Total</span></td>
</tr>
${itemRows}
<tr>
<td colspan="3" style="border:0.75pt solid #000000;text-align:right;font-weight:bold;font-size:9pt;padding:3pt 5pt;">Total</td>
<td style="border:0.75pt solid #000000;text-align:center;font-weight:bold;font-size:9pt;padding:3pt;">${totalHrs.toLocaleString()}</td>
<td style="border:0.75pt solid #000000;">&nbsp;</td>
<td style="border:0.75pt solid #000000;text-align:right;font-weight:bold;font-size:9pt;padding:3pt 5pt;">${fmt(subT)}</td>
<td style="border:0.75pt solid #000000;text-align:right;font-weight:bold;font-size:9pt;padding:3pt 5pt;">${vatT.toLocaleString(undefined,{maximumFractionDigits:2})}</td>
<td style="border:0.75pt solid #000000;text-align:right;font-weight:bold;font-size:9pt;padding:3pt 5pt;">${fmt(grandT)}</td>
</tr>
</table>

<!-- TOTALS -->
<table width="195pt" cellpadding="3" cellspacing="0" align="right" style="border-collapse:collapse;margin-top:6pt;font-size:10pt;">
<tr><td dir="rtl" align="right" style="padding:2pt 5pt;"><b>الإجمالي بدون الضريبة</b></td><td align="right" style="font-weight:600;padding:2pt 5pt;">${fmt(subT)}</td></tr>
<tr><td dir="rtl" align="right" style="padding:2pt 5pt;"><b>ض. القيمة المضافة 15%</b></td><td align="right" style="font-weight:600;padding:2pt 5pt;">${fmt(vatT)}</td></tr>
<tr><td dir="rtl" align="right" style="padding:4pt 6pt;border-top:0.75pt double #000000;border-bottom:0.75pt double #000000;"><b>إجمالي المبالغ المستحقة</b></td><td align="right" style="font-weight:bold;font-size:12pt;padding:4pt 6pt;border-top:0.75pt double #000000;border-bottom:0.75pt double #000000;">${fmt(grandT)}</td></tr>
</table>

<!-- DUE IN WORDS -->
<table width="100%" cellpadding="3" cellspacing="0" style="border-collapse:collapse;margin-top:6pt;border-top:0.5pt solid #000000;">
<tr>
<td width="50%"><b>Due</b>&nbsp;&nbsp;&nbsp;&nbsp;<b>SAR</b></td>
<td width="50%" dir="rtl" align="right"><b>إجمالي المبالغ المستحقة</b></td>
</tr>
</table>

<!-- NOTES -->
${notes || notesAr ? `<table width="100%" cellpadding="5" cellspacing="0" style="margin-top:6pt;"><tr><td style="background-color:#F9FAFF;">
${notesAr ? `<p dir="rtl" style="text-align:right;margin:0 0 3pt 0;font-size:9.5pt;">ملاحظات: ${notesAr}</p>` : ""}
${notes ? `<p style="margin:0;font-size:9.5pt;">Notes: ${notes}</p>` : ""}
</td></tr></table>` : ""}

<!-- WEBSITE FOOTER BAR -->
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12pt;">
<tr><td style="background-color:#D9D9D9;padding:10pt;text-align:center;">
<span style="font-size:16pt;font-weight:bold;color:#000000;">Website: ${coWeb}</span>
</td></tr>
</table>

<!-- LARGE WHITE SPACE -->
<div style="height:200pt;">&nbsp;</div>

</body></html>`;

      return { html, invoiceNo: invNo };
    }),
});
