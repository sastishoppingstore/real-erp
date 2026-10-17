// Sahl Excel print-tag engine: template configs <-> .xlsx rendering.
// Tags (header): <Data:id|reference|date|time> <Account:title|tax_id|phone>
// <Branch:name> | rows: <Items:title|user_qty|unit|price|total_price|discount|net_price>
// cleaner: <<delete:row>> (blank rows removed) | totals: <Data:total_price|discount|
// <Data:tax_amount|net_price|paid|remaining> <AmountString> | QR: <ZATCA:QR_TLV>

import { FORM0060_B64 } from "./form0060";

export type DocType =
  | "sale" | "quotation" | "purchase" | "sales-return"
  | "payment" | "receipt" | "stocktake" | "transfer";

export interface ColDef { key: string; ar: string; en: string; visible: boolean }
export interface PrintConfig {
  kind: "sahl-xlsx";
  docType: DocType;
  paper: "A4" | "thermal80" | "thermal58";
  titleAr: string;
  titleEn: string;
  headerLines: string[];
  contactLines: string[];
  showSignatures: boolean;
  showTax: boolean;
  showBalances: boolean;
  columns: ColDef[];
  footerText: string;
  accent: string;
}

export const ALL_COLUMNS: ColDef[] = [
  { key: "code", ar: "الكود", en: "Code", visible: true },
  { key: "name", ar: "الصنف", en: "Item", visible: true },
  { key: "unit", ar: "الوحدة", en: "Unit", visible: true },
  { key: "qty", ar: "الكمية", en: "Qty", visible: true },
  { key: "price", ar: "السعر", en: "Price", visible: true },
  { key: "disc", ar: "الخصم", en: "Disc", visible: true },
  { key: "total", ar: "الإجمالي", en: "Total", visible: true },
];

export interface DocLine { code?: string; name: string; unit?: string; qty: number; price: number; disc?: number; total: number }
export interface DocData {
  no: string; date: string; time?: string;
  party?: string; partyTax?: string; partyPhone?: string; branch?: string;
  lines: DocLine[];
  subtotal: number; discount: number; tax: number; net: number;
  paid?: number; notes?: string;
  qrText?: string;
  // 0060-form extras (all optional; missing values hide their rows like <#if>)
  dueDate?: string; cashier?: string; paymentType?: string;
  additions?: number; additionType?: string;
  qtyTotal?: number; taxPct?: number;
  balBefore?: number; balAfter?: number; hasAccount?: boolean;
  companyTax?: string; companyContacts?: string[];
  accountAddress?: string;
}

export const DOC_TITLES: Record<DocType, [string, string]> = {
  sale: ["فاتورة بيع", "Sales invoice"],
  quotation: ["عرض سعر", "Quotation"],
  purchase: ["فاتورة شراء", "Purchase invoice"],
  "sales-return": ["مرتجع بيع", "Sales return"],
  payment: ["سند صرف", "Payment voucher"],
  receipt: ["سند قبض", "Receipt voucher"],
  stocktake: ["جرد مخزن", "Stocktake"],
  transfer: ["تحويل مخزن", "Transfer"],
};

function baseCols(visible: string[]): ColDef[] {
  return ALL_COLUMNS.map((c) => ({ ...c, visible: visible.includes(c.key) }));
}

function stdCfg(p: Partial<PrintConfig> & { docType: DocType }): PrintConfig {
  return {
    kind: "sahl-xlsx", paper: "A4",
    titleAr: "", titleEn: "",
    headerLines: ["", "", ""], contactLines: ["", "", ""],
    showSignatures: true, showTax: true, showBalances: true,
    columns: baseCols(["code", "name", "unit", "qty", "price", "disc", "total"]),
    footerText: "", accent: "#2fae4e",
    ...p,
  };
}

export const BUILTINS: { key: string; name: string; nameAr: string; config: PrintConfig }[] = [
  {
    key: "sales-0060", name: "Sales 0060 (default)", nameAr: "الافتراضي 0060",
    config: stdCfg({
      docType: "sale",
      titleAr: "فاتورة بيع", titleEn: "Sales invoice",
      columns: baseCols(["code", "name", "unit", "qty", "price", "total"]),
    }),
  },
  {
    key: "basic-a4", name: "Basic", nameAr: "أساسي A4",
    config: stdCfg({
      docType: "sale",
      titleAr: "فاتورة بيع", titleEn: "Sales invoice",
    }),
  },
  {
    key: "thermal-80", name: "Small Receipt", nameAr: "حراري 80مم",
    config: stdCfg({
      docType: "sale", paper: "thermal80",
      titleAr: "فاتورة بيع", titleEn: "Sales invoice",
      showSignatures: false,
      columns: baseCols(["name", "qty", "price", "total"]),
      accent: "#111111",
    }),
  },
  {
    key: "corp-01", name: "Template 01", nameAr: "قالب 01",
    config: stdCfg({
      docType: "sale",
      titleAr: "فاتورة ضريبية", titleEn: "Tax invoice",
      columns: baseCols(["code", "name", "qty", "price", "disc", "total"]),
      accent: "#1e40af",
    }),
  },
  {
    key: "indust-02", name: "Template 02", nameAr: "قالب 02",
    config: stdCfg({
      docType: "sale",
      titleAr: "فاتورة بيع", titleEn: "Sales invoice",
      showTax: false,
      columns: baseCols(["code", "name", "unit", "qty", "price", "total"]),
      accent: "#7b2d4e",
    }),
  },
];

// Arabic tafqeet for <AmountString>: e.g. "مائة وخمسة ريال وثمانون هللة فقط لا غير"
const AR_ONES = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة",
  "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
const AR_TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
function arTwo(x: number): string {
  if (x < 20) return AR_ONES[x];
  const t = Math.floor(x / 10), o = x % 10;
  return o ? `${AR_ONES[o]} و${AR_TENS[t]}` : AR_TENS[t];
}
function arThree(x: number): string {
  const h = Math.floor(x / 100), r = x % 100;
  let hStr = "";
  if (h === 1) hStr = r ? "مائة و" : "مائة";
  else if (h === 2) hStr = r ? "مائتان و" : "مائتان";
  else if (h > 2) hStr = `${AR_ONES[h]}مائة` + (r ? " و" : "");
  const tail = r ? arTwo(r) : "";
  return `${hStr}${tail}`.replace(/ و$/, "");
}
function arGroup(n: number, one: string, two: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n <= 10) return `${arThree(n)} ${many}`;
  return `${arThree(n)} ${one}`;
}
function arInt(n: number): string {
  if (n === 0) return "صفر";
  const parts: string[] = [];
  const mil = Math.floor(n / 1e6), tho = Math.floor((n % 1e6) / 1e3), rest = n % 1e3;
  if (mil) parts.push(arGroup(mil, "مليون", "مليونان", "ملايين"));
  if (tho) parts.push(arGroup(tho, "ألف", "ألفان", "آلاف"));
  if (rest) parts.push(arThree(rest));
  return parts.join(" و");
}
export function amountWordsAr(n: number, currency = "ريال", fraction = "هللة"): string {
  if (!Number.isFinite(n)) return "";
  const neg = n < 0 ? "سالب " : "";
  n = Math.abs(Math.round(n * 100) / 100);
  const int = Math.floor(n), dec = Math.round((n - int) * 100);
  let s = `${neg}${arInt(int)} ${currency}`;
  if (dec) s += ` و${arInt(dec)} ${fraction}`;
  return `${s} فقط لا غير`;
}
export function amountWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number): string => {
    if (x < 20) return ones[x];
    return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
  };
  const three = (x: number): string => {
    const h = Math.floor(x / 100), r = x % 100;
    return (h ? ones[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : "");
  };
  if (!Number.isFinite(n)) return "";
  const neg = n < 0 ? "Minus " : "";
  n = Math.abs(Math.round(n * 100) / 100);
  const int = Math.floor(n), dec = Math.round((n - int) * 100);
  const parts: string[] = [];
  const mil = Math.floor(int / 1e6), tho = Math.floor((int % 1e6) / 1e3), rest = int % 1e3;
  if (mil) parts.push(three(mil) + " Million");
  if (tho) parts.push(three(tho) + " Thousand");
  if (rest || !parts.length) parts.push(three(rest));
  let s = neg + parts.join(" ");
  if (dec) s += ` and ${dec}/100`;
  return s + " only";
}

export function resolveTags(cfg: PrintConfig, d: DocData): { rows: string[][]; tags: Record<string, string> } {
  const cols = cfg.columns.filter((c) => c.visible);
  const head = cols.map((c) => c.ar);
  const rows: string[][] = [head];
  for (const l of d.lines) {
    const map: Record<string, string> = {
      code: l.code ?? "", name: l.name, unit: l.unit ?? "",
      qty: String(l.qty), price: Number(l.price).toFixed(2),
      disc: Number(l.disc || 0).toFixed(2), total: Number(l.total).toFixed(2),
    };
    rows.push(cols.map((c) => map[c.key] ?? ""));
  }
  // <<delete:row>> cleaner: drop fully-blank data rows (never header)
  const clean = [rows[0], ...rows.slice(1).filter((r) => r.some((c) => c.trim() !== ""))];
  return {
    rows: clean,
    tags: {
      "<Data:id>": d.no, "<Data:reference>": d.no, "<Data:date>": d.date, "<Data:time>": d.time ?? "",
      "<Account:title>": d.party ?? "", "<Account:tax_id>": d.partyTax ?? "",
      "<Account:phone>": d.partyPhone ?? "", "<Branch:name>": d.branch ?? "",
      "<Data:total_price>": d.subtotal.toFixed(2), "<Data:discount>": d.discount.toFixed(2),
      "<Data:tax_amount>": d.tax.toFixed(2), "<Data:net_price>": d.net.toFixed(2),
      "<Data:paid>": Number(d.paid || 0).toFixed(2),
      "<Data:remaining>": (d.net - Number(d.paid || 0)).toFixed(2),
      "<AmountString>": amountWordsAr(d.net),
    },
  };
}

export async function renderXlsx(cfg: PrintConfig, d: DocData, company: { nameAr?: string; name?: string }): Promise<Blob> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("invoice", { views: [{ rightToLeft: true }] });
  const narrow = cfg.paper !== "A4";
  ws.columns = [{ width: narrow ? 22 : 18 }, { width: narrow ? 22 : 42 }, { width: 14 }, { width: 14 }, { width: 16 }];
  const accent = cfg.accent || "#2fae4e";

  const title = `${cfg.titleAr} — ${d.no}`;
  const trow = ws.addRow([title]);
  trow.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  trow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + accent.replace("#", "") } };
  ws.mergeCells(`A${trow.number}:E${trow.number}`);
  trow.alignment = { horizontal: "center" };

  ws.addRow([company.nameAr || company.name || ""]);
  ws.addRow([`${d.date}${d.time ? " " + d.time : ""}`, d.party ?? "", d.partyPhone ?? "", d.partyTax ?? ""]);
  for (const h of cfg.headerLines) if (h.trim()) ws.addRow([h]);

  const { rows } = resolveTags(cfg, d);
  const hrow = ws.addRow(rows[0]);
  hrow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  hrow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + accent.replace("#", "") } };
  for (const r of rows.slice(1)) ws.addRow(r);

  ws.addRow([]);
  const tot = (k: string, v: string) => {
    const r = ws.addRow(["", "", "", k, v]);
    r.font = { bold: true };
  };
  tot("Subtotal / الإجمالي", d.subtotal.toFixed(2));
  tot("Discount / الخصم", d.discount.toFixed(2));
  if (cfg.showTax) tot("VAT / الضريبة", d.tax.toFixed(2));
  const net = ws.addRow(["", "", "", "NET / الصافي", d.net.toFixed(2)]);
  net.font = { bold: true, size: 14 };
  ws.addRow(["", "", "", "Words", amountWords(d.net)]);
  if (d.notes) ws.addRow([d.notes]);
  if (cfg.footerText.trim()) ws.addRow([cfg.footerText]);
  if (cfg.showSignatures) {
    ws.addRow([]);
    ws.addRow(["التوقيع / Signature", "", "", "الختم / Stamp", ""]);
  }
  if (d.qrText) {
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(d.qrText, { width: 110, margin: 1 });
      const imgId = wb.addImage({ base64: url.split(",")[1], extension: "png" });
      const anchorRow = ws.rowCount + 1;
      ws.addImage(imgId, { tl: { col: 3, row: anchorRow }, ext: { width: 110, height: 110 } });
      ws.addRow(["QR"]);
    } catch { /* QR optional */ }
  }
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// render060: 1:1 replica of form-returnsale-0060 geometry.
// Grid B7:G31 (+I conditionals): title/company header, Doc/Client/Payment/Date/
// Time/Due/Cashier/Remarks rows, item table (sn/code/desc/unit/qty/price/total),
// qty+total row, additions/discount/VAT rows (hidden when zero, like <#if>),
// Due+amount-words, Paid, Credit (hidden when zero), Bal Prior/After (hidden
// without account), Thank You + 3 contact lines.
// render060: loads the ORIGINAL form-returnsale-0060 template (embedded base64)
// and patches the data cells -> 100% layout fidelity (styles, merges, images,
// config sheet, printer ranges all preserved as-is). Falls back to the scratch
// builder below if the template fails to load.
const toDate = (s?: string): Date | undefined => {
  if (!s) return undefined;
  const dt = new Date(String(s).slice(0, 10) + "T00:00:00");
  return isNaN(dt.getTime()) ? undefined : dt;
};

export async function render060(
  cfg: PrintConfig, d: DocData,
  company: { nameAr?: string; name?: string; tax?: string; logoBase64?: string },
): Promise<Blob> {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const bin = atob(FORM0060_B64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(bytes.buffer as any);
    const ws: any = wb.worksheets[0];
    const put = (addr: string, v: any) => {
      const c = ws.getCell(addr);
      if (v === undefined || v === null || v === "" || (typeof v === "number" && Number.isNaN(v))) { c.value = null; return; }
      c.value = v;
    };
    const hide = (r: number) => { try { ws.getRow(r).hidden = true; } catch { /* ignore */ } };

    // --- header block (rows 7..15) ---
    put("B7", cfg.titleAr || "");
    put("C7", company.nameAr || company.name || "");
    put("B8", null);
    put("C9", d.no);
    put("C10", d.paymentType ?? "");
    put("D10", d.party ?? "");
    put("C11", toDate(d.date) ?? d.date);
    put("D11", d.partyTax ? `Tax No. ${d.partyTax}` : null);
    put("C12", d.time ?? "");
    put("D12", d.accountAddress ?? "");
    put("C13", toDate(d.dueDate ?? d.date) ?? (d.dueDate ?? d.date));
    put("D13", d.partyPhone ?? "");
    put("C14", d.cashier ?? "");
    put("C15", d.notes ?? "");

    // --- items (template row 17 is the item row) ---
    const lines = d.lines ?? [];
    if (lines.length > 1) ws.duplicateRow(17, lines.length - 1, true);
    for (let i = 0; i < lines.length; i++) {
      const r = 17 + i, l = lines[i];
      put(`A${r}`, i + 1);
      put(`B${r}`, l.code ?? "");
      put(`C${r}`, l.name);
      put(`D${r}`, l.unit ?? "");
      put(`E${r}`, Number(l.qty || 0));
      put(`F${r}`, Number(l.price || 0));
      put(`G${r}`, Number(l.total || 0));
    }
    if (!lines.length) ["A", "B", "C", "D", "E", "F", "G"].forEach((c) => put(`${c}17`, null));

    // --- summary block (template rows 18..26, shifted by item count) ---
    const n = Math.max(1, lines.length);
    const base = 18 + (n - 1);
    put(`B${base}`, d.qtyTotal ?? lines.reduce((a, l) => a + Number(l.qty || 0), 0));
    put(`G${base}`, Number(d.subtotal || 0));
    const addl = Number(d.additions ?? 0);
    if (addl !== 0) { put(`F${base + 1}`, d.additionType || "إضافات"); put(`G${base + 1}`, addl); }
    else hide(base + 1);
    if (Number(d.discount || 0) !== 0) put(`G${base + 2}`, Number(d.discount));
    else hide(base + 2);
    put(`F${base + 3}`, `VAT ${d.taxPct ?? 15}%`);
    put(`G${base + 3}`, Number(d.tax || 0));
    put(`C${base + 4}`, amountWordsAr(d.net));
    put(`G${base + 4}`, Number(d.net || 0));
    const isCreditType = /آجل|credit|deferred|ذمم/i.test(String(d.paymentType || ""));
    const paid = d.paid != null ? Number(d.paid) : (isCreditType ? 0 : Number(d.net || 0));
    put(`G${base + 5}`, paid);
    const creditDue = d.net - paid;
    if (creditDue !== 0) put(`G${base + 6}`, creditDue);
    else hide(base + 6);
    if (d.hasAccount) {
      put(`G${base + 7}`, Number(d.balBefore ?? 0));
      put(`G${base + 8}`, Number(d.balAfter ?? d.balBefore ?? 0));
    } else { hide(base + 7); hide(base + 8); }

    // --- thank-you + contacts (template rows 28..31) ---
    const contacts = (d.companyContacts?.length ? d.companyContacts : (cfg.contactLines ?? []))
      .filter((x) => x && String(x).trim());
    for (let i = 0; i < 3; i++) put(`B${base + 11 + i}`, contacts[i] ?? null);

    // Re-apply the Thank-You merge (row inserts drop it) and clean stray copies.
    const tyRow = base + 10;
    try { ws.unMergeCells("B28:G28"); } catch { /* may not exist */ }
    try { ws.unMergeCells(`B${tyRow}:G${tyRow}`); } catch { /* may not exist */ }
    ["C", "D", "E", "F", "G"].forEach((c) => put(`${c}${tyRow}`, null));
    put(`B${tyRow}`, "Thank You");
    try {
      ws.mergeCells(`B${tyRow}:G${tyRow}`);
      ws.getCell(`B${tyRow}`).alignment = { horizontal: "center", vertical: "middle" };
    } catch { /* keep text if merge fails */ }

    // --- wipe any leftover template directives (<#...>) ---
    ws.eachRow({ includeEmpty: true }, (row: any) => {
      row.eachCell({ includeEmpty: true }, (cell: any) => {
        if (typeof cell.value === "string" && cell.value.includes("<#")) cell.value = null;
      });
    });

    const buf = await wb.xlsx.writeBuffer();
    return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  } catch {
    return render060Scratch(cfg, d, company as any);
  }
}

// render060Scratch: original from-scratch builder (kept as fallback).
async function render060Scratch(
  cfg: PrintConfig, d: DocData,
  company: { nameAr?: string; name?: string; tax?: string; logoBase64?: string },
): Promise<Blob> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("invoice", { views: [{ rightToLeft: true }] });
  ws.columns = [
    { width: 6 }, { width: 14 }, { width: 34 }, { width: 12 },
    { width: 10 }, { width: 12 }, { width: 14 }, { width: 4 }, { width: 14 },
  ];
  const accent = (cfg.accent || "#2fae4e").replace("#", "");
  const acc = "FF" + accent;
  const head = (txt: string) => {
    const r = ws.addRow(["", txt]);
    r.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
    r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: acc } };
    ws.mergeCells(`B${r.number}:G${r.number}`);
    r.alignment = { horizontal: "center" };
    return r;
  };
  const kv = (label: string, value: string, label2 = "", value2 = "") => {
    const r = ws.addRow(["", label, value, label2, value2]);
    r.getCell(2).font = { bold: true };
    return r;
  };

  head(`${cfg.titleAr} — ${cfg.titleEn}`);
  const co = company.nameAr || company.name || "";
  ws.addRow(["", "", co]);
  if (company.tax) ws.addRow(["", "", "", "", `Tax No. ${company.tax}`]);
  kv("Doc. No.", d.no, "Client", d.party ?? "");
  kv("Payment", d.paymentType ?? "", "", "");
  kv("Date", d.date, d.partyTax ? `Tax No. ${d.partyTax}` : "", "");
  kv("Time", d.time ?? "", "", d.accountAddress ?? "");
  kv("Due Date", d.dueDate ?? d.date, "", d.partyPhone ?? "");
  kv("Cashier", d.cashier ?? "", "", "");
  kv("Remarks", d.notes ?? "", "", "");
  const itemHead = ws.addRow(["", "Item No.", "Job Description", "Unit", "Qty", "Price", "Total"]);
  itemHead.font = { bold: true, color: { argb: "FFFFFFFF" } };
  itemHead.fill = { type: "pattern", pattern: "solid", fgColor: { argb: acc } };
  let sn = 0;
  for (const l of d.lines) {
    sn++;
    ws.addRow([sn, l.code ?? "", l.name, l.unit ?? "", l.qty,
      Number(l.price).toFixed(2), Number(l.total).toFixed(2)]);
  }
  const qtyTot = d.qtyTotal ?? d.lines.reduce((a, l) => a + Number(l.qty || 0), 0);
  ws.addRow(["", "", "", "", qtyTot, "Total", d.subtotal.toFixed(2)]);
  if ((d.additions ?? 0) !== 0)
    ws.addRow(["", "", "", "", "", d.additionType ?? "Additions", Number(d.additions).toFixed(2)]);
  if (d.discount !== 0)
    ws.addRow(["", "", "", "", "", "Discount", d.discount.toFixed(2)]);
  if (cfg.showTax)
    ws.addRow(["", "", "", "", "", `VAT ${d.taxPct ?? 15}%`, d.tax.toFixed(2)]);
  const due = ws.addRow(["", "Due", amountWordsAr(d.net), "", "", "Due", d.net.toFixed(2)]);
  due.font = { bold: true };
  ws.addRow(["", "", "", "", "", "Paid", Number(d.paid || 0).toFixed(2)]);
  const remaining = d.net - Number(d.paid || 0);
  if (remaining !== 0)
    ws.addRow(["", "", "", "", "", "Credit", remaining.toFixed(2)]);
  if (cfg.showBalances !== false && d.hasAccount) {
    ws.addRow(["", "", "", "", "", "Bal. Prior", Number(d.balBefore ?? 0).toFixed(2)]);
    ws.addRow(["", "", "", "", "", "Bal. After", Number(d.balAfter ?? d.balBefore ?? 0).toFixed(2)]);
  }
  const th = ws.addRow(["", "Thank You"]);
  th.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  th.fill = { type: "pattern", pattern: "solid", fgColor: { argb: acc } };
  ws.mergeCells(`B${th.number}:G${th.number}`);
  th.alignment = { horizontal: "center" };
  const contacts = d.companyContacts?.length ? d.companyContacts : (cfg.contactLines ?? []);
  for (const c of contacts) if (c && c.trim()) ws.addRow(["", c]);
  if (cfg.footerText.trim()) ws.addRow(["", cfg.footerText]);
  if (company.logoBase64) {
    try {
      const imgId = wb.addImage({ base64: company.logoBase64, extension: "png" });
      ws.addImage(imgId, { tl: { col: 6, row: 0 }, ext: { width: 90, height: 60 } });
    } catch { /* logo optional */ }
  }
  if (d.qrText) {
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(d.qrText, { width: 100, margin: 1 });
      const imgId = wb.addImage({ base64: url.split(",")[1], extension: "png" });
      const anchorRow = ws.rowCount + 1;
      ws.addImage(imgId, { tl: { col: 0, row: anchorRow }, ext: { width: 100, height: 100 } });
      ws.addRow(["QR"]);
    } catch { /* QR optional */ }
  }
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export function downloadBlob(blob: Blob, name: string) {  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// Import: parse an .xlsx file back into a template config (tags detected).
export async function importXlsx(file: File, docType: DocType): Promise<Partial<PrintConfig>> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const grid: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
  const found = new Set<string>();
  const tags = ["code", "name", "unit", "qty", "price", "disc", "total"];
  const colTag: Record<string, RegExp> = {
    name: /<Items:\s*title\s*>/,
    qty: /<Items:\s*user_qty\s*>/,
    unit: /<Items:\s*unit\s*>/,
    price: /<Items:\s*price\s*>/,
    disc: /<Items:\s*discount\s*>/,
    total: /<Items:\s*(total_price|net_price)\s*>/,
    code: /<Data:\s*id\s*>|<Items:\s*code\s*>/,
  };
  for (const row of grid) {
    for (const cell of row) {
      for (const k of tags) if (colTag[k].test(cell)) found.add(k);
    }
  }
  const title = grid.flat().find((c) => c && !c.startsWith("<") && c.trim().length > 1) ?? "";
  return {
    kind: "sahl-xlsx",
    docType,
    paper: "A4",
    titleAr: title.slice(0, 60),
    titleEn: "",
    headerLines: ["", "", ""],
    showSignatures: true,
    showTax: true,
    columns: ALL_COLUMNS.map((c) => ({ ...c, visible: found.size ? found.has(c.key) : c.visible })),
    footerText: "",
    accent: "#2fae4e",
  };
}

export function printHtml(title: string, bodyHtml: string) {
  const f = document.createElement("iframe");
  f.style.display = "none";
  document.body.appendChild(f);
  const doc = f.contentDocument!;
  doc.open();
  doc.write(`<html dir="rtl"><head><title>${title}</title><style>
    body{font-family:Tahoma,Arial;font-size:12px;color:#000}
    table{width:100%;border-collapse:collapse}th,td{border:1px solid #555;padding:4px;text-align:center}
    th{background:#2fae4e;color:#fff}h1{text-align:center;font-size:18px}
    .tot{text-align:left;font-weight:bold;margin-top:8px}
  </style></head><body>${bodyHtml}</body></html>`);
  doc.close();
  setTimeout(() => { f.contentWindow!.print(); setTimeout(() => f.remove(), 2000); }, 300);
}
