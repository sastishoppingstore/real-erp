import { z } from "zod";
import { createRouter, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, companySettings } from "@db/schema";
import { eq } from "drizzle-orm";
import ExcelJS from "exceljs";

// Style constants
const BORDER_THIN = { style: "thin" as const, color: { argb: "FF000000" } };
const BORDER_ALL = { top: BORDER_THIN, bottom: BORDER_THIN, left: BORDER_THIN, right: BORDER_THIN };
const GRAY_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD9D9D9" } };
const BLUE_GRAY_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFDCE6F1" } };
const FONT_ARABIC = { name: "Calibri", size: 10 };
const FONT_AR_BOLD = { name: "Calibri", size: 10, bold: true };
const FONT_AR = { name: "Calibri", size: 10 };

export const excelRouter = createRouter({
  generateExcel: authedMutation
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      // Fetch invoice from both tables
      let inv: any = null;
      let items: any[] = [];

      try {
        const r1 = await db.execute((`SELECT * FROM construction_invoices WHERE id=${input.invoiceId} AND tenant_id=${tenantId}`) as any);
        inv = ((r1 as any)?.[0])?.[0] || null;
        if (inv) {
          const r2 = await db.execute((`SELECT * FROM construction_invoice_items WHERE invoice_id=${input.invoiceId} ORDER BY sr`) as any);
          items = ((r2 as any)?.[0] as any[]) || [];
        }
      } catch { /* skip */ }

      if (!inv) {
        const r3 = await db.execute((`SELECT * FROM invoices WHERE id=${input.invoiceId} AND tenant_id=${tenantId}`) as any);
        inv = ((r3 as any)?.[0])?.[0] || null;
        if (inv) {
          const r4 = await db.execute((`SELECT * FROM invoice_items WHERE invoice_id=${input.invoiceId}`) as any);
          items = ((r4 as any)?.[0] as any[]) || [];
        }
      }

      if (!inv) throw new Error("Invoice not found");

      // Get customer
      let customer: any = null;
      if (inv.customer_id) {
        const [c] = await db.select().from(customers).where(eq(customers.id, Number(inv.customer_id)));
        customer = c || null;
      }

      // Get company settings
      const [co] = await db.select().from(companySettings).where(eq(companySettings.tenantId, tenantId));

      // Company details
      const coNameEn = co?.companyName || "YAFCO AL ARABIAH EST.";
      const coNameAr = "مؤسسة يافكو العربية";
      const coVat = co?.taxNumber || "300995897900003";
      const coCr = co?.crNumber || "4700012896";
      const coAddrEn = "Saudi Arabia - Yanbu Al Bahr - P.O.Box : 2326";
      const coAddrAr = "المملكة العربية السعودية - ينبع البحر - ص . ب 2326:";
      const coEmail = co?.email || "info@yafco.com.sa";
      const coWeb = co?.website || "www.yafco.com.sa";

      // Customer details
      const custName = customer?.name || inv.customer_name || inv.customerName || "";
      const custNameAr = customer?.name_ar || inv.customer_name_ar || "";
      const custVat = customer?.vat_number || customer?.tax_number || inv.customer_vat || "";
      const custCr = customer?.cr_number || customer?.commercial_registration || inv.customer_cr || "";
      const custAddr = customer?.address || inv.customer_address || "";

      // Invoice details
      const invoiceNo = inv.invoice_no || inv.invoiceNumber || "";
      const workedMonth = inv.worked_month || inv.workedMonth || "";
      const payType = inv.payment_type || inv.paymentType || "Credit";
      const cashier = inv.cashier || inv.cashier_name || "مدير النظام";
      const dueDate = inv.due_date || inv.dueDate || "";
      const poNum = inv.po_number || inv.poNumber || "";

      // Totals
      const fmt = (v: number) => v;
      const totalHrs = items.reduce((s: number, r: any) => s + Number(r.total_hour || r.quantity || 0), 0);
      const subT = Number(inv.subtotal || inv.sub_total || 0);
      const vatT = Number(inv.vat_amount || inv.vatAmount || inv.tax_amount || inv.taxAmount || 0);
      const grandT = Number(inv.grand_total || inv.grandTotal || inv.total_amount || inv.totalAmount || 0);
      const vatPct = Number(inv.vat_percent || inv.taxPercent || 15);
      const notes = inv.notes || "";
      const notesAr = inv.notes_ar || inv.notesAr || "";

      const created = inv.created_at ? new Date(inv.created_at) : new Date();
      const dateStr = `${created.getFullYear()}/${String(created.getMonth() + 1).padStart(2, "0")}/${String(created.getDate()).padStart(2, "0")}`;
      const timeStr = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

      // ===== BUILD WORKBOOK =====
      const wb = new ExcelJS.Workbook();
      wb.creator = "YASCO ERP";
      const ws = wb.addWorksheet("Tax Invoice", {
        pageSetup: { paperSize: 1, orientation: "portrait", fitToWidth: 1, fitToHeight: 1 },
        views: [{ showGridLines: false }],
      });

      // Set column widths
      ws.columns = [
        { width: 8 },   // A - Sr No
        { width: 35 },  // B - Job Description
        { width: 10 },  // C - Unit
        { width: 14 },  // D - Total Hour
        { width: 15 },  // E - Rate/Hour
        { width: 15 },  // F - Total
        { width: 13 },  // G - VAT
        { width: 18 },  // H - Grand Total
      ];

      let row = 1;

      // ===== HEADER ROW: Logo | Company Name | QR =====
      // Logo placeholder (row 1-5)
      ws.mergeCells(`A1:B5`);
      ws.getCell("A1").value = "";
      ws.getCell("A1").border = BORDER_ALL;
      ws.getRow(1).height = 20;
      for (let i = 2; i <= 5; i++) ws.getRow(i).height = 20;

      // Company Name Arabic + English (rows 1-5, cols C-G)
      ws.mergeCells("C1:G5");
      const companyNameCell = ws.getCell("C1");
      companyNameCell.value = [
        { richText: [
          { font: { name: "Calibri", size: 20, bold: true, color: { argb: "FFA6272C" } }, text: coNameEn + "\n" },
          { font: { name: "Calibri", size: 16, bold: true, color: { argb: "FF1E3A5F" } }, text: coNameAr },
        ]},
      ];
      companyNameCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

      // QR code area (rows 1-5, col H)
      ws.mergeCells("H1:H5");
      ws.getCell("H1").border = BORDER_ALL;

      row = 7;

      // ===== TAX INVOICE TITLE BAR =====
      ws.mergeCells(`A${row}:H${row}`);
      const titleCell = ws.getCell(`A${row}`);
      titleCell.value = "TAX INVOICE - فاتورة الضريبية";
      titleCell.font = FONT_AR_BOLD;
      titleCell.fill = GRAY_FILL;
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.border = { top: BORDER_THIN, bottom: BORDER_THIN };
      ws.getRow(row).height = 25;
      row += 1;

      // Gray header strip
      ws.mergeCells(`A${row}:H${row}`);
      ws.getCell(`A${row}`).fill = GRAY_FILL;
      ws.getRow(row).height = 15;
      row += 2;

      // ===== META INFO BAR =====
      const metaStart = row;
      // Left column
      ws.getCell(`A${row}`).value = "Worked Month:";
      ws.getCell(`A${row}`).font = FONT_AR_BOLD;
      ws.getCell(`B${row}`).value = workedMonth || "";
      ws.getCell(`A${row}`).border = BORDER_ALL;
      ws.getCell(`B${row}`).border = BORDER_ALL;
      ws.mergeCells(`D${row}:E${row}`);
      ws.getCell(`D${row}`).value = "Date:";
      ws.getCell(`D${row}`).font = FONT_AR_BOLD;
      ws.getCell(`F${row}`).value = dateStr;
      ws.getCell(`D${row}`).border = BORDER_ALL;
      ws.getCell(`E${row}`).border = BORDER_ALL;
      ws.getCell(`F${row}`).border = BORDER_ALL;
      row++;

      ws.getCell(`A${row}`).value = "Invoice. No:";
      ws.getCell(`A${row}`).font = FONT_AR_BOLD;
      ws.getCell(`B${row}`).value = invoiceNo;
      ws.getCell(`A${row}`).border = BORDER_ALL;
      ws.getCell(`B${row}`).border = BORDER_ALL;
      ws.mergeCells(`D${row}:E${row}`);
      ws.getCell(`D${row}`).value = "Time:";
      ws.getCell(`D${row}`).font = FONT_AR_BOLD;
      ws.getCell(`F${row}`).value = timeStr;
      ws.getCell(`D${row}`).border = BORDER_ALL;
      ws.getCell(`E${row}`).border = BORDER_ALL;
      ws.getCell(`F${row}`).border = BORDER_ALL;
      row++;

      ws.getCell(`A${row}`).value = "Payment:";
      ws.getCell(`A${row}`).font = FONT_AR_BOLD;
      ws.getCell(`B${row}`).value = payType;
      ws.getCell(`A${row}`).border = BORDER_ALL;
      ws.getCell(`B${row}`).border = BORDER_ALL;
      ws.mergeCells(`D${row}:E${row}`);
      ws.getCell(`D${row}).value`).value = "Due Date:";
      ws.getCell(`D${row}`).value = "Due Date:";
      ws.getCell(`D${row}`).font = FONT_AR_BOLD;
      ws.getCell(`F${row}`).value = dueDate || "";
      ws.getCell(`D${row}`).border = BORDER_ALL;
      ws.getCell(`E${row}`).border = BORDER_ALL;
      ws.getCell(`F${row}`).border = BORDER_ALL;
      row++;

      ws.getCell(`A${row}`).value = "Cashier:";
      ws.getCell(`A${row}`).font = FONT_AR_BOLD;
      ws.getCell(`B${row}`).value = cashier;
      ws.getCell(`B${row}`).alignment = { horizontal: "right", vertical: "middle" };
      ws.getCell(`A${row}`).border = BORDER_ALL;
      ws.getCell(`B${row}`).border = BORDER_ALL;
      ws.mergeCells(`D${row}:E${row}`);
      ws.getCell(`D${row}`).value = "PO No:";
      ws.getCell(`D${row}`).font = FONT_AR_BOLD;
      ws.getCell(`F${row}`).value = poNum || "";
      ws.getCell(`D${row}`).border = BORDER_ALL;
      ws.getCell(`E${row}`).border = BORDER_ALL;
      ws.getCell(`F${row}`).border = BORDER_ALL;
      row += 2;

      // ===== COMPANY / CLIENT INFO =====
      // Company (left)
      ws.mergeCells(`A${row}:B${row}`);
      ws.getCell(`A${row}`).value = `Company: ${coNameEn}`;
      ws.getCell(`A${row}`).font = { ...FONT_AR_BOLD, size: 11 };
      ws.mergeCells(`C${row}:D${row}`);
      ws.getCell(`C${row}`).value = `${coCr}`;
      ws.getCell(`C${row}`).font = FONT_AR;
      row++;
      ws.mergeCells(`A${row}:B${row}`);
      ws.getCell(`A${row}`).value = `VAT No: ${coVat}`;
      ws.getCell(`A${row}`).font = FONT_AR;
      row++;
      ws.mergeCells(`A${row}:B${row}`);
      ws.getCell(`A${row}`).value = coAddrEn;
      ws.getCell(`A${row}`).font = FONT_AR;
      row++;
      ws.mergeCells(`A${row}:B${row}`);
      ws.getCell(`A${row}`).value = coAddrAr;
      ws.getCell(`A${row}`).font = { ...FONT_AR, size: 9 };
      ws.getCell(`A${row}`).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      row++;
      ws.mergeCells(`A${row}:B${row}`);
      ws.getCell(`A${row}`).value = `Email: ${coEmail}`;
      ws.getCell(`A${row}`).font = { name: "Calibri", size: 10, color: { argb: "FF0563C1" }, underline: true };
      row++;

      // Client info on the right side
      const clientStartRow = row - 5;
      ws.mergeCells(`E${clientStartRow}:H${clientStartRow}`);
      ws.getCell(`E${clientStartRow}`).value = `Client: ${custName}${custNameAr ? `, ${custNameAr}` : ""}`;
      ws.getCell(`E${clientStartRow}`).font = { ...FONT_AR_BOLD, size: 11 };
      row++;
      ws.mergeCells(`E${row}:H${row}`);
      ws.getCell(`E${row}`).value = `Tax No: ${custVat}`;
      ws.getCell(`E${row}`).font = FONT_AR;
      row++;
      ws.mergeCells(`E${row}:H${row}`);
      ws.getCell(`E${row}`).value = `CR: ${custCr}`;
      ws.getCell(`E${row}`).font = FONT_AR;
      row++;
      ws.mergeCells(`E${row}:H${row}`);
      ws.getCell(`E${row}`).value = `Address: ${custAddr}`;
      ws.getCell(`E${row}`).font = FONT_AR;
      ws.getCell(`E${row}`).alignment = { wrapText: true, vertical: "top" };
      row += 2; // Skip a line after company/client

      // ===== ITEMS TABLE HEADER (2 rows: Arabic + English) =====
      // Arabic header row
      const arHeaders = ["تسلسل", "المسمى الوظيفي", "الوحدة", "مجموع الساعات", "سعر الساعة", "الإجمالي", "ض القيمة المضافة", "الاجمالي بالضريبة"];
      arHeaders.forEach((h, i) => {
        const cell = ws.getCell(row, i + 1);
        cell.value = h;
        cell.font = { ...FONT_AR_BOLD, size: 9 };
        cell.fill = GRAY_FILL;
        cell.border = BORDER_ALL;
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      ws.getRow(row).height = 28;
      row++;

      // English header row
      const enHeaders = ["Sr. No.", "Job Description", "Unit", "Total Hour", "Rate/ Hour", "Total", "VAT 15%", "Grand Total"];
      enHeaders.forEach((h, i) => {
        const cell = ws.getCell(row, i + 1);
        cell.value = h;
        cell.font = { ...FONT_AR_BOLD, size: 8.5 };
        cell.fill = BLUE_GRAY_FILL;
        cell.border = BORDER_ALL;
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      ws.getRow(row).height = 26;
      row++;

      // ===== ITEM ROWS =====
      items.forEach((r: any, i: number) => {
        const qty = Number(r.total_hour || r.quantity || 0);
        const rate = Number(r.rate || r.unit_price || 0);
        const total = Number(r.line_total || r.total_amount || 0);
        const vat = total * (vatPct / 100);
        const grand = total * (1 + vatPct / 100);
        const desc = r.description_en || r.description || "";
        const descAr = r.description_ar || "";

        const vals = [i + 1, desc, r.unit || "", qty, rate, total, vat, grand];
        vals.forEach((v, ci) => {
          const cell = ws.getCell(row, ci + 1);
          cell.value = v;
          cell.font = FONT_AR;
          cell.border = BORDER_ALL;
          if (ci !== 1) cell.alignment = { horizontal: "center", vertical: "middle" };
          else cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
          if ([4, 5, 6, 7, 8].includes(ci)) {
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right", vertical: "middle" };
          }
        });
        if (descAr) {
          ws.getCell(row, 2).value = `${desc}\n${descAr}`;
          ws.getCell(row, 2).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
          ws.getCell(row, 2).font = FONT_AR;
        }
        ws.getRow(row).height = 35;
        row++;
      });

      // ===== TOTALS ROW =====
      const totalsVals = ["", "", "", totalHrs, "", subT, vatT, grandT];
      totalsVals.forEach((v, ci) => {
        const cell = ws.getCell(row, ci + 1);
        cell.value = ci === 0 ? null : v;
        cell.border = BORDER_ALL;
        cell.font = { ...FONT_AR_BOLD, size: 9 };
        if (ci >= 3 && ci !== 4) {
          cell.numFmt = "#,##0.00";
          cell.alignment = { horizontal: "right", vertical: "middle" };
        } else if (ci === 3) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
      });
      ws.mergeCells(row, 1, row, 3);
      ws.getCell(row, 1).value = "Total";
      ws.getCell(row, 1).alignment = { horizontal: "right", vertical: "middle" };
      ws.getCell(row, 1).font = { ...FONT_AR_BOLD, size: 9 };
      ws.getRow(row).height = 22;
      row += 2;

      // ===== TOTALS SUMMARY BLOCK (right aligned) =====
      const summaryStartCol = 5; // Column E

      // Total without VAT
      ws.mergeCells(row, summaryStartCol, row, summaryStartCol + 2);
      ws.getCell(row, summaryStartCol).value = "الإجمالي بدون الضريبة — Total:";
      ws.getCell(row, summaryStartCol).font = FONT_AR_BOLD;
      ws.getCell(row, summaryStartCol).alignment = { horizontal: "right", vertical: "middle" };
      ws.getCell(row, summaryStartCol + 3).value = subT;
      ws.getCell(row, summaryStartCol + 3).numFmt = "#,##0.00";
      ws.getCell(row, summaryStartCol + 3).alignment = { horizontal: "right", vertical: "middle" };
      ws.getCell(row, summaryStartCol + 3).font = { ...FONT_AR_BOLD };
      row++;

      // VAT
      ws.mergeCells(row, summaryStartCol, row, summaryStartCol + 2);
      ws.getCell(row, summaryStartCol).value = `ض. القيمة المضافة 15% — VAT ${vatPct}%:`;
      ws.getCell(row, summaryStartCol).font = FONT_AR_BOLD;
      ws.getCell(row, summaryStartCol).alignment = { horizontal: "right", vertical: "middle" };
      ws.getCell(row, summaryStartCol + 3).value = vatT;
      ws.getCell(row, summaryStartCol + 3).numFmt = "#,##0.00";
      ws.getCell(row, summaryStartCol + 3).alignment = { horizontal: "right", vertical: "middle" };
      ws.getCell(row, summaryStartCol + 3).font = { ...FONT_AR_BOLD };
      row++;

      // Due (bold, double border)
      ws.mergeCells(row, summaryStartCol, row, summaryStartCol + 2);
      ws.getCell(row, summaryStartCol).value = "إجمالي المبالغ المستحقة — Due:";
      ws.getCell(row, summaryStartCol).font = { name: "Calibri", size: 12, bold: true };
      ws.getCell(row, summaryStartCol).alignment = { horizontal: "right", vertical: "middle" };
      ws.getCell(row, summaryStartCol + 3).value = grandT;
      ws.getCell(row, summaryStartCol + 3).numFmt = "#,##0.00";
      ws.getCell(row, summaryStartCol + 3).font = { name: "Calibri", size: 12, bold: true };
      ws.getCell(row, summaryStartCol + 3).border = {
        top: { style: "double", color: { argb: "FF000000" } },
        bottom: { style: "double", color: { argb: "FF000000" } },
        left: { style: "double", color: { argb: "FF000000" } },
        right: { style: "double", color: { argb: "FF000000" } },
      };
      ws.getRow(row).height = 22;
      row += 2;

      // ===== AMOUNT IN WORDS =====
      ws.mergeCells(row, 1, row, 8);
      ws.getCell(row, 1).value = `Due: ${grandT.toLocaleString("en-US")} SAR`;
      ws.getCell(row, 1).font = { ...FONT_AR_BOLD };
      ws.getCell(row, 1).border = { top: BORDER_THIN };
      row += 2;

      // ===== NOTES (if any) =====
      if (notes || notesAr) {
        ws.mergeCells(row, 1, row, 8);
        ws.getCell(row, 1).value = notesAr ? `ملاحظات: ${notesAr}` : "";
        ws.getCell(row, 1).font = { ...FONT_AR, size: 9.5 };
        ws.getCell(row, 1).alignment = { horizontal: "right", vertical: "middle", wrapText: true };
        row++;
        ws.mergeCells(row, 1, row, 8);
        ws.getCell(row, 1).value = notes ? `Notes: ${notes}` : "";
        ws.getCell(row, 1).font = { ...FONT_AR, size: 9.5 };
        row++;
      }

      // ===== WEBSITE FOOTER BAR =====
      ws.mergeCells(row, 1, row, 8);
      const footerCell = ws.getCell(row, 1);
      footerCell.value = `Website: ${coWeb}`;
      footerCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FF000000" } };
      footerCell.fill = GRAY_FILL;
      footerCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(row).height = 30;

      // Generate buffer
      const buffer = await wb.xlsx.writeBuffer();
      const bufferBase64 = Buffer.from(buffer).toString("base64");
      return { buffer_base64: bufferBase64, invoiceNo: invoiceNo };
    }),
});
