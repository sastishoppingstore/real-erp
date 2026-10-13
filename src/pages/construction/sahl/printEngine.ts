// Sahl Excel print-tag engine: template configs <-> .xlsx rendering.
// Tags (header): <Data:id|reference|date|time> <Account:title|tax_id|phone>
// <Branch:name> | rows: <Items:title|user_qty|unit|price|total_price|discount|net_price>
// cleaner: <<delete:row>> (blank rows removed) | totals: <Data:total_price|discount|
// <Data:tax_amount|net_price|paid|remaining> <AmountString> | QR: <ZATCA:QR_TLV>

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
  showSignatures: boolean;
  showTax: boolean;
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

export const BUILTINS: { key: string; name: string; nameAr: string; config: PrintConfig }[] = [
  {
    key: "basic-a4", name: "Basic", nameAr: "أساسي A4",
    config: {
      kind: "sahl-xlsx", docType: "sale", paper: "A4",
      titleAr: "فاتورة بيع", titleEn: "Sales invoice",
      headerLines: ["", "", ""], showSignatures: true, showTax: true,
      columns: baseCols(["code", "name", "unit", "qty", "price", "disc", "total"]),
      footerText: "", accent: "#2fae4e",
    },
  },
  {
    key: "thermal-80", name: "Small Receipt", nameAr: "حراري 80مم",
    config: {
      kind: "sahl-xlsx", docType: "sale", paper: "thermal80",
      titleAr: "فاتورة بيع", titleEn: "Sales invoice",
      headerLines: ["", "", ""], showSignatures: false, showTax: true,
      columns: baseCols(["name", "qty", "price", "total"]),
      footerText: "", accent: "#111111",
    },
  },
  {
    key: "corp-01", name: "Template 01", nameAr: "قالب 01",
    config: {
      kind: "sahl-xlsx", docType: "sale", paper: "A4",
      titleAr: "فاتورة ضريبية", titleEn: "Tax invoice",
      headerLines: ["", "", ""], showSignatures: true, showTax: true,
      columns: baseCols(["code", "name", "qty", "price", "disc", "total"]),
      footerText: "", accent: "#1e40af",
    },
  },
  {
    key: "indust-02", name: "Template 02", nameAr: "قالب 02",
    config: {
      kind: "sahl-xlsx", docType: "sale", paper: "A4",
      titleAr: "فاتورة بيع", titleEn: "Sales invoice",
      headerLines: ["", "", ""], showSignatures: true, showTax: false,
      columns: baseCols(["code", "name", "unit", "qty", "price", "total"]),
      footerText: "", accent: "#7b2d4e",
    },
  },
];

// English number-to-words for <AmountString> (Arabic tafqeet delegated to
// printed footer text; engine documents this deviation honestly).
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
      "<AmountString>": amountWords(d.net),
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

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
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
