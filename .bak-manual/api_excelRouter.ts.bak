import { z } from "zod";
import { createRouter, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, companySettings } from "@db/schema";
import { eq } from "drizzle-orm";
import ExcelJS from "exceljs";
import crypto from "node:crypto";

// Style constants
const BORDER_THIN = { style: "thin" as const, color: { argb: "FF000000" } };
const BORDER_ALL = { top: BORDER_THIN, bottom: BORDER_THIN, left: BORDER_THIN, right: BORDER_THIN };
const GRAY_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD9D9D9" } };
const BLUE_GRAY_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFDCE6F1" } };
const FONT_ARABIC = { name: "Calibri", size: 10 };
const FONT_AR_BOLD = { name: "Calibri", size: 10, bold: true };
const FONT_AR = { name: "Calibri", size: 10 };


// ===== English amount-in-words (for the Due row of the sales form) =====
function amountToWords(n: number): string {
  const ONES = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const two = (v: number): string => {
    if (v < 20) return ONES[v];
    const t = Math.floor(v / 10), o = v % 10;
    return TENS[t] + (o ? "-" + ONES[o] : "");
  };
  const three = (v: number): string => {
    const h = Math.floor(v / 100), r = v % 100;
    return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : "");
  };
  const intWords = (v: number): string => {
    if (v === 0) return "Zero";
    const parts: string[] = [];
    const units: Array<[number, string]> = [[1e9, "Billion"], [1e6, "Million"], [1e3, "Thousand"]];
    let rest = v;
    for (const [val, name] of units) {
      const c = Math.floor(rest / val);
      if (c > 0) { parts.push(three(c) + " " + name); rest = rest % val; }
    }
    if (rest > 0) parts.push(three(rest));
    return parts.join(" ");
  };
  const neg = n < 0;
  const abs = Math.abs(n);
  const intPart = Math.floor(abs);
  const decPart = Math.round((abs - intPart) * 100);
  let out = intWords(intPart) + " Riyals";
  if (decPart > 0) out += " and " + two(decPart) + " Halalas";
  else out += " Only";
  return (neg ? "Minus " : "") + out;
}

// ===== Official sales form replica (form-returnsale): A5 narrow receipt =====
// Bilingual header, title band, Doc/Client meta card, 7-column items table
// (SN/Item No./Job Description/Unit/Qty/Price/Total), conditional totals rows,
// Thank-You band, contact footer, QR image. Mirrors the template 1:1.
async function buildSalesReturnForm(data: {
  inv: any; items: any[]; customer: any; co: any;
}): Promise<{ buffer_base64: string; invoiceNo: string }> {
  const { inv, items, customer, co } = data;
  const F8 = { name: "Calibri", size: 8 };
  const F8B = { name: "Calibri", size: 8, bold: true };
  const F10B = { name: "Calibri", size: 10, bold: true };
  const F16 = { name: "Calibri", size: 16 };
  const CTR = { horizontal: "center", vertical: "middle" } as const;
  const LFT = { horizontal: "left", vertical: "middle" } as const;
  const RGT = { horizontal: "right", vertical: "middle" } as const;
  const HAIR = { style: "hair" as const, color: { argb: "FF000000" } };
  const HB = { top: HAIR, bottom: HAIR, left: HAIR, right: HAIR };
  const BAND = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD9D9D9" } };
  const MONEY = "#,##0.00";

  const coNameEn = co?.companyName || "YAFCO AL ARABIAH EST.";
  const coNameAr = co?.companyNameAr || "\u0645\u0624\u0633\u0633\u0629 \u064a\u0627\u0641\u0643\u0648 \u0627\u0644\u0639\u0631\u0628\u064a\u0629";
  const coVat = co?.taxNumber || "300995897900003";
  const coCr = co?.crNumber || "4700012896";
  const coAddrEn = co?.address || "Saudi Arabia - Yanbu Al Bahr - P.O.Box : 2326";
  const coPhone = co?.phone || "";
  const coEmail = co?.email || "info@yafco.com.sa";
  const coWeb = co?.website || "www.yafco.com.sa";

  const custName = customer?.name || inv.customer_name || inv.customerName || "Walk-in Customer";
  const custVat = customer?.vatNumber || customer?.taxNumber || inv.customer_vat || inv.customerVat || "";
  const custAddr = customer?.address || inv.customer_address || inv.customerAddress || "";
  const custPhone = customer?.phone || inv.customer_phone || inv.customerPhone || "";

  const invoiceNo = inv.invoice_number || inv.invoiceNumber || inv.invoice_no || "";
  const payType = inv.payment_method || inv.payment_type || inv.paymentType || "Credit";
  const cashier = inv.cashier || inv.cashier_name || "\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645";
  const poNum = inv.po_number || inv.poNumber || "";
  const dueRaw = inv.due_date || inv.dueDate || "";
  const notes = inv.notes || "";
  const titleEn = (inv.invoice_type === "zatca" || inv.invoiceType === "zatca") ? "TAX INVOICE" : "SALES INVOICE";

  const dt = inv.date ? new Date(inv.date) : (inv.created_at ? new Date(inv.created_at) : new Date());
  const dateStr = isNaN(dt.getTime()) ? "" : `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
  const tmRaw = inv.time || "";
  let timeStr = "";
  const tm = String(tmRaw).match(/^(\d{1,2}):(\d{2})/);
  if (tm) {
    let h = parseInt(tm[1], 10);
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    timeStr = `${h}:${tm[2]} ${ap}`;
  }
  const dd = dueRaw ? new Date(dueRaw) : null;
  const dueStr = dd && !isNaN(dd.getTime()) ? `${dd.getFullYear()}/${String(dd.getMonth() + 1).padStart(2, "0")}/${String(dd.getDate()).padStart(2, "0")}` : "";

  const subT = Number(inv.sub_total ?? inv.subtotal ?? 0);
  const discT = Number(inv.discount_amount ?? inv.discountAmount ?? 0);
  const vatT = Number(inv.vat_amount ?? inv.vatAmount ?? inv.tax_amount ?? inv.taxAmount ?? 0);
  const grandT = Number(inv.grand_total ?? inv.grandTotal ?? inv.total_amount ?? inv.totalAmount ?? 0);
  const vatPct = Number(inv.vat_percent ?? inv.taxPercent ?? 15);
  const paidT = Number(inv.paid_amount ?? inv.paidAmount ?? 0);
  const creditT = Number(inv.balance_due ?? inv.balanceDue ?? 0);
  const totalQty = items.reduce((x: number, r: any) => x + Number(r.quantity ?? 0), 0);
  const balAfter = customer?.currentBalance != null ? Number(customer.currentBalance) : null;
  const balPrior = balAfter !== null ? balAfter - grandT : null;
  const hasAccount = !!(customer && customer.id && customer.code !== "WALK-IN");

  const wb = new ExcelJS.Workbook();
  wb.creator = "YASCO ERP";
  const ws = wb.addWorksheet("Invoice", {
    pageSetup: { paperSize: 11, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 1 },
    views: [{ showGridLines: false }],
  });
  ws.columns = [
    { width: 3 }, { width: 7.29 }, { width: 24 }, { width: 5.43 },
    { width: 5.43 }, { width: 10.86 }, { width: 14.57 }, { width: 11.57 },
  ];
  for (let i = 1; i <= 6; i++) ws.getRow(i).height = 15;

  const dataUriToBuffer = (dataUri: string): Buffer | null => {
    try {
      const m = dataUri.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!m) return null;
      return Buffer.from(m[2], "base64");
    } catch { return null; }
  };
  const logoBuf = co?.logo ? dataUriToBuffer(co.logo) : null;
  const QRCode = require("qrcode");
  const qrPayload = JSON.stringify({ seller: coNameAr || coNameEn, vat: coVat, total: grandT.toFixed(2), tax: vatT.toFixed(2), date: dateStr });
  const qrBuf: Buffer = await QRCode.toBuffer(qrPayload, { width: 200, margin: 1 });

  // ===== Rows 1-6: EN block | logo | AR block =====
  ws.mergeCells("A1:B6");
  ws.getCell("A1").value = {
    richText: [
      { font: { name: "Calibri", size: 11, bold: true }, text: "Kingdom Saudi Arabia\n" },
      { font: { name: "Calibri", size: 11, bold: true }, text: coNameEn + "\n" },
      { font: { name: "Calibri", size: 10 }, text: `C.R. No: ${coCr}\nTax No:${coVat}` },
    ],
  };
  ws.getCell("A1").alignment = { ...LFT, wrapText: true };
  ws.mergeCells("C1:E6");
  if (logoBuf) {
    const logoId = wb.addImage({ buffer: logoBuf, extension: "png" });
    ws.addImage(logoId, { tl: { col: 2.15, row: 1.15 }, ext: { width: 150, height: 95 } });
  }
  ws.mergeCells("F1:G6");
  ws.getCell("F1").value = {
    richText: [
      { font: { name: "Calibri", size: 11, bold: true }, text: coNameAr + "\n" },
      { font: { name: "Calibri", size: 10 }, text: `\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u062d\u062f : ${coCr}\n\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0636\u0631\u064a\u0628\u064a : ${coVat}` },
    ],
  };
  ws.getCell("F1").alignment = { ...RGT, wrapText: true };

  let row = 7;
  // ===== Row 7: title band =====
  ws.getCell(`B${row}`).value = titleEn;
  ws.getCell(`B${row}`).font = { name: "Calibri", size: 10 };
  ws.getCell(`B${row}`).fill = BAND;
  ws.mergeCells(`C${row}:G${row}`);
  ws.getCell(`C${row}`).value = `${coNameAr} / ${coNameEn}`;
  ws.getCell(`C${row}`).font = F16;
  ws.getCell(`C${row}`).alignment = CTR;
  ws.getCell(`C${row}`).fill = BAND;
  ws.getRow(row).height = 26.25;
  row++;
  // ===== Row 8: company tax =====
  ws.getCell(`E${row}`).value = `Tax No. ${coVat}`;
  ws.getCell(`E${row}`).font = F8;
  row++;
  // ===== Meta + client card =====
  const lab = (c: string, v: string) => { ws.getCell(c).value = v; ws.getCell(c).font = F8B; };
  const val = (c: string, v: string) => { ws.getCell(c).value = v; ws.getCell(c).font = F8; };
  lab(`B${row}`, "Doc. No."); val(`C${row}`, invoiceNo); lab(`D${row}`, "Client"); row++;
  lab(`B${row}`, "Payment"); val(`C${row}`, payType); val(`D${row}`, custName); row++;
  lab(`B${row}`, "Date"); val(`C${row}`, dateStr);
  if (custVat) val(`D${row}`, `Tax No. ${custVat}`); row++;
  lab(`B${row}`, "Time"); val(`C${row}`, timeStr); val(`D${row}`, custAddr); row++;
  lab(`B${row}`, "Due Date"); val(`C${row}`, dueStr); val(`D${row}`, custPhone); row++;
  lab(`B${row}`, "Cashier"); val(`C${row}`, cashier);
  if (poNum) { lab(`D${row}`, "PO No."); val(`E${row}`, poNum); }
  row++;
  if (notes) { lab(`B${row}`, "Remarks"); val(`C${row}`, notes); row++; }
  // ===== Row 16-style header =====
  const heads = ["", "Item No.", "Job Description", "Unit", "Qty", "Price", "Total"];
  ["B", "C", "D", "E", "F", "G"].forEach((col, i) => {
    ws.getCell(`${col}${row}`).value = heads[i + 1];
    ws.getCell(`${col}${row}`).font = F8B;
    ws.getCell(`${col}${row}`).alignment = CTR;
    ws.getCell(`${col}${row}`).border = HB;
  });
  ws.getRow(row).height = 30;
  row++;
  // ===== Items =====
  items.forEach((r: any, i: number) => {
    const qty = Number(r.quantity ?? 0);
    const rate = Number(r.unit_price ?? 0);
    const tot = Number(r.total_amount ?? qty * rate);
    const title = r.description || "";
    const titleAr = r.description_ar || "";
    ws.getCell(`A${row}`).value = i + 1;
    ws.getCell(`A${row}`).font = F8B;
    ws.getCell(`A${row}`).alignment = CTR;
    ws.getCell(`B${row}`).value = r.sku || r.product_id || "";
    ws.getCell(`B${row}`).font = F8;
    ws.getCell(`B${row}`).alignment = CTR;
    ws.getCell(`B${row}`).border = HB;
    ws.getCell(`C${row}`).value = titleAr ? `${title} / ${titleAr}` : title;
    ws.getCell(`C${row}`).font = F8;
    ws.getCell(`C${row}`).alignment = LFT;
    ws.getCell(`C${row}`).border = HB;
    ws.getCell(`D${row}`).value = r.unit || "";
    ws.getCell(`D${row}`).font = F8;
    ws.getCell(`D${row}`).alignment = CTR;
    ws.getCell(`D${row}`).border = HB;
    ws.getCell(`E${row}`).value = qty;
    ws.getCell(`E${row}`).font = F8;
    ws.getCell(`E${row}`).alignment = CTR;
    ws.getCell(`E${row}`).border = HB;
    ws.getCell(`F${row}`).value = rate;
    ws.getCell(`F${row}`).font = F8;
    ws.getCell(`F${row}`).numFmt = MONEY;
    ws.getCell(`F${row}`).alignment = CTR;
    ws.getCell(`F${row}`).border = HB;
    ws.getCell(`G${row}`).value = tot;
    ws.getCell(`G${row}`).font = F8;
    ws.getCell(`G${row}`).numFmt = MONEY;
    ws.getCell(`G${row}`).alignment = CTR;
    ws.getCell(`G${row}`).border = HB;
    row++;
  });
  // ===== Totals =====
  const gval = (c: string, v: number) => {
    ws.getCell(c).value = v; ws.getCell(c).font = F8;
    ws.getCell(c).numFmt = MONEY; ws.getCell(c).alignment = CTR; ws.getCell(c).border = HB;
  };
  ws.getCell(`E${row}`).value = totalQty;
  ws.getCell(`E${row}`).font = F8B; ws.getCell(`E${row}`).alignment = CTR; ws.getCell(`E${row}`).border = HB;
  lab(`F${row}`, "Total"); gval(`G${row}`, subT); row++;
  if (discT > 0) { lab(`F${row}`, "Discount"); gval(`G${row}`, discT); row++; }
  lab(`F${row}`, `VAT ${vatPct}%`); gval(`G${row}`, vatT); row++;
  lab(`B${row}`, "Due"); val(`C${row}`, amountToWords(grandT));
  ws.getCell(`F${row}`).value = "Due"; ws.getCell(`F${row}`).font = F10B;
  ws.getCell(`G${row}`).value = grandT; ws.getCell(`G${row}`).font = F10B;
  ws.getCell(`G${row}`).numFmt = MONEY; ws.getCell(`G${row}`).alignment = CTR; ws.getCell(`G${row}`).border = HB;
  ws.getRow(row).height = 17.25;
  row++;
  lab(`F${row}`, "Paid"); gval(`G${row}`, paidT); row++;
  if (creditT > 0) { lab(`F${row}`, "Credit"); gval(`G${row}`, creditT); row++; }
  if (hasAccount && balAfter !== null) {
    lab(`F${row}`, "Bal. Prior"); gval(`G${row}`, balPrior ?? 0); row++;
    lab(`F${row}`, "Bal. After"); gval(`G${row}`, balAfter); row++;
  }
  // ===== Thank-You band + contacts =====
  ws.mergeCells(`B${row}:G${row}`);
  ws.getCell(`B${row}`).value = "Thank You";
  ws.getCell(`B${row}`).font = F16;
  ws.getCell(`B${row}`).alignment = CTR;
  ws.getCell(`B${row}`).fill = BAND;
  const thanksRow = row;
  ws.getRow(row).height = 26.25;
  row++;
  ws.getCell(`B${row}`).value = coAddrEn; ws.getCell(`B${row}`).font = F8; row++;
  ws.getCell(`B${row}`).value = `${coPhone ? "Phone: " + coPhone + "  " : ""}${coEmail}`;
  ws.getCell(`B${row}`).font = F8; row++;
  ws.getCell(`B${row}`).value = coWeb; ws.getCell(`B${row}`).font = F8; row++;
  // ===== QR (bottom-right like the template) =====
  const qrId = wb.addImage({ buffer: qrBuf, extension: "png" });
  ws.addImage(qrId, { tl: { col: 3.1, row: thanksRow - 1 + 0.15 }, ext: { width: 125, height: 125 } });

  const buffer = await wb.xlsx.writeBuffer();
  return { buffer_base64: Buffer.from(buffer).toString("base64"), invoiceNo };
}

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

      // Sales invoices (invoices table) use the official sales form layout (1:1 replica).
      // Construction invoices keep the existing construction layout below.
      const salesSource = !!(inv && (inv.invoice_number || inv.invoiceNumber) && !inv.invoice_no);
      if (salesSource) {
        return buildSalesReturnForm({ inv, items, customer, co });
      }

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
      const invoiceNo = inv.invoice_no || inv.invoiceNumber || inv.invoice_number || "";
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

      // ===== Prepare Logo & QR Images =====
      const dataUriToBuffer = (dataUri: string): Buffer | null => {
        try {
          const match = dataUri.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!match) return null;
          return Buffer.from(match[2], "base64");
        } catch { return null; }
      };

      const logoDataUri = co?.logo || "";
      let logoBuf: Buffer | null = null;
      if (logoDataUri) logoBuf = dataUriToBuffer(logoDataUri);

      // Generate QR buffer
      const qrPayload = JSON.stringify({ seller: coNameAr || coNameEn, vat: coVat, total: grandT.toFixed(2), tax: vatT.toFixed(2), date: dateStr });
      const QRCode = require("qrcode");
      const qrBuf: Buffer = await QRCode.toBuffer(qrPayload, { width: 200, margin: 1 });

      let row = 1;

      // ===== HEADER ROW: Logo | Company Name | QR =====
      ws.getRow(1).height = 20;
      for (let i = 2; i <= 5; i++) ws.getRow(i).height = 20;

      // Add LOGO natively (top-left, A1:B5)
      ws.mergeCells("A1:B5");
      if (logoBuf) {
        const logoExt = logoDataUri.includes("image/jpeg") ? "jpeg" : "png";
        const logoId = wb.addImage({ buffer: logoBuf, extension: logoExt as "png" | "jpeg" });
        ws.addImage(logoId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 100, height: 80 } });
      }

      // Company Name Arabic + English (rows 1-5, cols C-G)
      ws.mergeCells("C1:G5");
      const companyNameCell = ws.getCell("C1");
      companyNameCell.value = {
        richText: [
          { font: { name: "Calibri", size: 20, bold: true, color: { argb: "FFA6272C" } }, text: coNameEn },
          { font: { name: "Calibri", size: 16, bold: true, color: { argb: "FF1E3A5F" } }, text: "\n" + coNameAr },
        ],
      };
      companyNameCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

      // Add QR CODE natively (top-right, H1:H5)
      ws.mergeCells("H1:H5");
      const qrId = wb.addImage({ buffer: qrBuf, extension: "png" });
      ws.addImage(qrId, { tl: { col: 7.1, row: 0.1 }, ext: { width: 90, height: 90 } });

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
