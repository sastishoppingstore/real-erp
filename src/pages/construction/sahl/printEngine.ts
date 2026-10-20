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

export interface DocLine { code?: string; name: string; nameAr?: string; unit?: string; qty: number; price: number; disc?: number; total: number }
export interface DocData {
  no: string; date: string; time?: string;
  party?: string; partyTax?: string; partyPhone?: string; partyEmail?: string; partyCr?: string; partyAr?: string; branch?: string;
  lines: DocLine[];
  subtotal: number; discount: number; tax: number; net: number;
  paid?: number; notes?: string; notesAr?: string;
  qrText?: string;
  // Which Sahl document this is — lets the print/xlsx gray banner show
  // "Tax Invoice" for sales (مؤسسة name stays on other doc types).
  docType?: DocType;
  // 0060-form extras (all optional; missing values hide their rows like <#if>)
  dueDate?: string; cashier?: string; paymentType?: string;
  additions?: number; additionType?: string;
  qtyTotal?: number; taxPct?: number;
  balBefore?: number; balAfter?: number; hasAccount?: boolean;
  companyTax?: string; companyCr?: string; companyContacts?: string[];
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

// ---------------------------------------------------------------------------
// 0060 ZIP-level patcher — 100% template fidelity.
// The original form-returnsale-0060 file is kept byte-identical EXCEPT:
//  1. sheet1.xml: cell values patched (inline strings / numbers), item row
//     repeated for every line, rows below re-numbered, conditional rows
//     deleted exactly like <#delete row>, merges + dimension updated.
//  2. media/image1.png: the sample QR placeholder is replaced with the real
//     ZATCA QR from the document.
//  3. drawing1.xml: the floating QR anchor follows the Thank-You row.
// Everything else (letterhead text-boxes, YAFCO logo image, fonts, colors,
// A5 page setup, printer settings, sheet2 config) stays untouched — so the
// printed sheet matches the reference file exactly.
// ---------------------------------------------------------------------------
const b64ToBytes = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
};
export const bytesToB64 = (u8: Uint8Array): string => {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk)
    s += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + chunk)) as any);
  return btoa(s);
};
const escX = (s: any): string =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r2 = (x: any): number => Math.round((Number(x) || 0) * 100) / 100;

// Excel 1900 date-system serial (works for dates after 1900-02-28).
const xlSerial = (dateStr?: string): number | undefined => {
  const m = String(dateStr ?? "").slice(0, 10).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return undefined;
  return Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(1899, 11, 30)) / 86400000);
};
const xlTime = (t?: string): number | undefined => {
  const m = String(t ?? "").match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return undefined;
  return (Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] ?? 0)) / 86400;
};

function setCell(rowXml: string, row: number, col: string, val?: string | number | null): string {
  const re = new RegExp(`<c r="${col}${row}"([^>]*?)(?:/>|>([\\s\\S]*?)</c>)`);
  return rowXml.replace(re, (_m, attrs: string) => {
    const sAttr = (String(attrs).match(/\ss="\d+"/) || [""])[0];
    if (val === undefined || val === null || val === "" || (typeof val === "number" && !isFinite(val)))
      return `<c r="${col}${row}"${sAttr}/>`;
    if (typeof val === "number") return `<c r="${col}${row}"${sAttr}><v>${val}</v></c>`;
    return `<c r="${col}${row}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${escX(val)}</t></is></c>`;
  });
}
function renumRow(rowXml: string, oldRow: number, newRow: number): string {
  if (oldRow === newRow) return rowXml;
  return rowXml
    .replace(new RegExp(`<row r="${oldRow}"`), `<row r="${newRow}"`)
    .replace(new RegExp(`(r="[A-I]{1,2})${oldRow}(")`, "g"), `$1${newRow}$2`);
}

function patchSheet060(
  sheet: string, cfg: PrintConfig, d: DocData,
  company: { nameAr?: string; name?: string; tax?: string },
): { xml: string; thankRow: number } {
  const rows = new Map<number, string>();
  const rowRe = /<row r="(\d+)"[^>]*(?:\/>|>[\s\S]*?<\/row>)/g;
  let mm: RegExpExecArray | null;
  while ((mm = rowRe.exec(sheet))) rows.set(Number(mm[1]), mm[0]);

  const note = String(d.notes ?? "").trim();
  const addl = r2(d.additions ?? 0);
  const disc = r2(d.discount ?? 0);
  const net = r2(d.net ?? 0);
  const taxPct = Number(d.taxPct ?? 15);
  const isCreditType = /آجل|credit|deferred|ذمم/i.test(String(d.paymentType || ""));
  const paid = d.paid != null ? r2(d.paid) : (isCreditType ? 0 : net);
  const creditDue = r2(net - paid);
  const lines = d.lines ?? [];
  const qtyTotal = d.qtyTotal ?? lines.reduce((a, l) => a + Number(l.qty || 0), 0);
  const companyName = company.nameAr || company.name || "";
  const contacts = (d.companyContacts?.length ? d.companyContacts : (cfg.contactLines ?? []))
    .map((x) => String(x ?? "")).filter((x) => x.trim());

  // Output row plan (template row numbers, item row repeated per line).
  type Step = { old: number; itemIdx?: number };
  const plan: Step[] = [];
  for (let r = 7; r <= 14; r++) plan.push({ old: r });
  if (note) plan.push({ old: 15 });
  plan.push({ old: 16 });
  const nItems = Math.max(1, lines.length);
  for (let i = 0; i < nItems; i++) plan.push({ old: 17, itemIdx: i });
  plan.push({ old: 18 });
  if (addl !== 0) plan.push({ old: 19 });
  if (disc !== 0) plan.push({ old: 20 });
  plan.push({ old: 21 });
  plan.push({ old: 22 });
  plan.push({ old: 23 });
  if (creditDue !== 0) plan.push({ old: 24 });
  if (d.hasAccount) { plan.push({ old: 25 }); plan.push({ old: 26 }); }
  plan.push({ old: 28 });
  plan.push({ old: 29 }); plan.push({ old: 30 }); plan.push({ old: 31 });

  const out: string[] = [];
  let r = 7;
  let thankRow = 28;
  for (const step of plan) {
    const tpl = rows.get(step.old);
    if (!tpl) continue;
    let xml = renumRow(tpl, step.old, r);
    if (step.itemIdx != null) {
      const l = lines[step.itemIdx];
      if (l) {
        const disp = (() => { const n = String(l.name ?? "").replace(/^\[(?:custom-)?\d+\]\s*/, "").trim(); const a = String(l.nameAr ?? "").trim(); return a && a !== n ? `${n ? n + " / " : ""}${a}` : n || a; })();
        xml = setCell(xml, r, "A", step.itemIdx + 1);
        xml = setCell(xml, r, "B", l.code || null);
        xml = setCell(xml, r, "C", disp || null);
        xml = setCell(xml, r, "D", l.unit || null);
        xml = setCell(xml, r, "E", Number(l.qty || 0));
        xml = setCell(xml, r, "F", r2(l.price));
        xml = setCell(xml, r, "G", r2(l.total));
      } else {
        for (const c of ["A", "B", "C", "D", "E", "F", "G"]) xml = setCell(xml, r, c, null);
      }
    } else {
      switch (step.old) {
        case 7:
          xml = setCell(xml, r, "B", cfg.titleAr || "");
          // The gray merged banner (C7:G7) announces the document: sales invoices
          // carry "Tax Invoice" (as in the original 0060 form), other doc types
          // keep the company name they always had.
          xml = setCell(xml, r, "C", cfg.docType === "sale" ? "Tax Invoice" : companyName);
          break;
        case 8:
          xml = setCell(xml, r, "C", d.partyCr ? `C.R. No. ${d.partyCr}` : null);
          // "Tax No." belongs in the same column as the other right hand
          // labels (Client / Arabic Name / Address / Phone No. / Email) so it
          // starts on the very same left edge as they do.
          xml = setCell(xml, r, "D", d.partyTax ? `Tax No. ${d.partyTax}` : null);
          xml = setCell(xml, r, "E", null);
          break;
        case 9:
          xml = setCell(xml, r, "C", d.no);
          xml = setCell(xml, r, "D", d.party ? `Client: ${d.party}` : null);
          break;
        case 10:
          xml = setCell(xml, r, "C", d.paymentType ?? null);
          xml = setCell(xml, r, "D", d.partyAr ? `Arabic Name: ${d.partyAr}` : null);
          break;
        case 11:
          xml = setCell(xml, r, "C", xlSerial(d.date) ?? null);
          xml = setCell(xml, r, "D", d.accountAddress ? `Address: ${d.accountAddress}` : null);
          break;
        case 12:
          xml = setCell(xml, r, "C", xlTime(d.time) ?? null);
          xml = setCell(xml, r, "D", d.partyPhone ? `Phone No.: ${d.partyPhone}` : null);
          break;
        case 13:
          xml = setCell(xml, r, "C", xlSerial(d.dueDate || d.date) ?? null);
          xml = setCell(xml, r, "D", d.partyEmail ? `Email: ${d.partyEmail}` : null);
          break;
        case 14: xml = setCell(xml, r, "C", d.cashier ?? null); break;
        case 15: xml = setCell(xml, r, "C", note); break;
        case 18:
          xml = setCell(xml, r, "E", qtyTotal);
          xml = setCell(xml, r, "G", r2(d.subtotal));
          break;
        case 19:
          xml = setCell(xml, r, "F", d.additionType || "الإضافات");
          xml = setCell(xml, r, "G", addl);
          break;
        case 20: xml = setCell(xml, r, "G", disc); break;
        case 21:
          xml = setCell(xml, r, "F", `VAT ${taxPct}%`);
          xml = setCell(xml, r, "G", r2(d.tax));
          break;
        case 22:
          xml = setCell(xml, r, "C", amountWordsAr(net));
          xml = setCell(xml, r, "G", net);
          break;
        case 23: xml = setCell(xml, r, "G", paid); break;
        case 24: xml = setCell(xml, r, "G", creditDue); break;
        case 25: xml = setCell(xml, r, "G", r2(d.balBefore ?? 0)); break;
        case 26: xml = setCell(xml, r, "G", r2(d.balAfter ?? d.balBefore ?? 0)); break;
        case 28: thankRow = r; break;
        case 29: case 30: case 31:
          xml = setCell(xml, r, "B", contacts[step.old - 29] ?? null);
          break;
      }
    }
    // strip leftover column-I control cells (<#if ... delete row>)
    xml = xml.replace(/<c r="I\d+"[^>]*(?:\/>|>[\s\S]*?<\/c>)/g, "");
    out.push(xml);
    r++;
  }

  const s0 = sheet.indexOf("<sheetData>");
  const s1 = sheet.indexOf("</sheetData>");
  if (s0 < 0 || s1 < 0) return { xml: sheet, thankRow };
  let xml = sheet.slice(0, s0) + "<sheetData>" + out.join("") + "</sheetData>" + sheet.slice(s1 + "</sheetData>".length);
  xml = xml.replace(/<dimension ref="[^"]*"[^>]*\/>/, `<dimension ref="A7:I${r - 1}"/>`);
  xml = xml.replace(/<mergeCell ref="B28:G28"[^>]*\/>/, `<mergeCell ref="B${thankRow}:G${thankRow}"/>`);
  return { xml, thankRow };
}

export async function render060(
  cfg: PrintConfig, d: DocData,
  company: { nameAr?: string; name?: string; tax?: string; logoBase64?: string },
): Promise<Blob> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(FORM0060_B64, { base64: true });
    const sheetFile = zip.file("xl/worksheets/sheet1.xml");
    if (!sheetFile) throw new Error("0060 template: sheet1 missing");
    const { xml: patchedSheet, thankRow } = patchSheet060(await sheetFile.async("string"), cfg, d, company);
    zip.file("xl/worksheets/sheet1.xml", patchedSheet);

    // real ZATCA QR replaces the sample QR placeholder (media/image1.png)
    if (d.qrText) {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(d.qrText, { width: 260, margin: 0, errorCorrectionLevel: "M" });
        zip.file("xl/media/image1.png", b64ToBytes(url.split(",")[1]));
      } catch { /* keep placeholder */ }
    }
    // Company logo (Settings → Company) replaces the sample letterhead logo
    // (media/image2.jpeg) so the exported sheet carries OUR logo.
    const logoBytes = await logoToJpegBytes(company.logoBase64);
    if (logoBytes) zip.file("xl/media/image2.jpeg", logoBytes);
    // floating QR anchor follows the Thank-You row (template: rows 28..33)
    try {
      const drawFile = zip.file("xl/drawings/drawing1.xml");
      if (drawFile) {
        const drw = await drawFile.async("string");
        const m = drw.match(/<xdr:twoCellAnchor[^>]*>[\s\S]*?<\/xdr:twoCellAnchor>/);
        if (m) {
          let a = m[0];
          a = a.replace(/(<xdr:from>[\s\S]*?<xdr:row>)\d+(<\/xdr:row>)/, `$1${thankRow - 1}$2`);
          a = a.replace(/(<xdr:to>[\s\S]*?<xdr:row>)\d+(<\/xdr:row>)/, `$1${thankRow - 1 + 5}$2`);
          zip.file("xl/drawings/drawing1.xml", drw.replace(m[0], a));
        }
      }
    } catch { /* keep original anchors */ }

    const out = await zip.generateAsync({
      type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 },
    });
    return new Blob([out as any], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  } catch {
    return render060Scratch(cfg, d, company as any);
  }
}

// Turn the company logo (data URL or raw base64) into JPEG bytes so it can
// replace the template's xl/media/image2.jpeg without breaking the file.
async function logoToJpegBytes(logo?: string | null): Promise<Uint8Array | null> {
  if (!logo) return null;
  try {
    const raw = String(logo).trim();
    const m = raw.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/s);
    const mime = m ? m[1] : "";
    const b64 = m ? m[2] : raw;
    if (!b64) return null;
    if (mime === "image/jpeg" || mime === "image/jpg") return b64ToBytes(b64);
    // PNG / SVG / WEBP → draw on a canvas and export as JPEG (keeps the
    // template's .jpeg part name and content type intact).
    const src = mime ? `data:${mime};base64,${b64}` : `data:image/png;base64,${b64}`;
    const img = await new Promise<HTMLImageElement | null>((resolve) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => resolve(null);
      el.src = src;
    });
    if (!img) return null;
    const maxW = 320;
    const scale = Math.min(1, maxW / (img.width || maxW));
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round((img.width || maxW) * scale));
    cv.height = Math.max(1, Math.round((img.height || maxW) * scale));
    const ctx = cv.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    const dataUrl = cv.toDataURL("image/jpeg", 0.92);
    return b64ToBytes(dataUrl.split(",")[1]);
  } catch {
    return null;
  }
}

// ZATCA Phase-2 TLV base64 (fields 1-5) — used when an invoice has no
// stored zatcaQrCode so the QR slot still shows a valid e-invoice QR.
export function zatcaQrTlv(f: { seller: string; vat: string; timestamp: string; total: string | number; tax: string | number }): string {
  const enc = (tag: number, val: string): Uint8Array => {
    const b = new TextEncoder().encode(val);
    const out = new Uint8Array(2 + b.length);
    out[0] = tag; out[1] = b.length; out.set(b, 2);
    return out;
  };
  const parts = [
    enc(1, f.seller), enc(2, f.vat), enc(3, f.timestamp),
    enc(4, Number(f.total || 0).toFixed(2)), enc(5, Number(f.tax || 0).toFixed(2)),
  ];
  const all = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0;
  for (const p of parts) { all.set(p, o); o += p.length; }
  return bytesToB64(all);
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
  kv("Payment", d.paymentType ?? "", "Arabic Name", d.partyAr ?? "");
  kv("C.R. No.", d.partyCr ?? "", "Tax No.", d.partyTax ?? "");
  kv("Date", d.date, "Address", d.accountAddress ?? "");
  kv("Time", d.time ?? "", "Phone No.", d.partyPhone ?? "");
  kv("Due Date", d.dueDate ?? d.date, "Email", d.partyEmail ?? "");
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
      const jpg = await logoToJpegBytes(company.logoBase64);
      if (jpg) {
        const imgId = wb.addImage({ base64: bytesToB64(jpg), extension: "jpeg" });
        ws.addImage(imgId, { tl: { col: 6, row: 0 }, ext: { width: 90, height: 60 } });
      }
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

// ---------------------------------------------------------------------------
// A4 print view of form-returnsale-0060: same design as the .xlsx output
// (letterhead boxes + YAFCO logo, gray title/thanks banners, items grid,
// totals block, contacts + floating ZATCA QR) rendered as a real A4 document
// so "Save as PDF" produces the invoice itself — not a screenshot of the app.
// ---------------------------------------------------------------------------
function invoice060Html(
  d: DocData, company: { nameAr?: string; name?: string; tax?: string; taxNumber?: string; crNumber?: string },
  title: string, logoUrl: string, qrUrl: string,
): string {
  const esc = (x: any) => String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const n2 = (x: any) => (Number(x) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const addl = Number(d.additions ?? 0);
  const disc = Number(d.discount ?? 0);
  const net = Number(d.net || 0);
  const isCreditType = /آجل|credit|deferred|ذمم/i.test(String(d.paymentType || ""));
  const paid = d.paid != null ? Number(d.paid) : (isCreditType ? 0 : net);
  const creditDue = Math.round((net - paid) * 100) / 100;
  const lines = d.lines ?? [];
  const qtyTotal = d.qtyTotal ?? lines.reduce((a, l) => a + Number(l.qty || 0), 0);
  const contacts = (d.companyContacts ?? []).map((x) => String(x ?? "")).filter((x) => x.trim());
  const co = company.nameAr || company.name || "";
  const words = amountWordsAr(net);
  const cleanIt = (s: any) => String(s ?? "").replace(/^\[(?:custom-)?\d+\]\s*/, "").trim();
  const itRows = lines.length
    ? lines.map((l, i) =>
        `<tr><td class="sn">${i + 1}</td><td class="c bd">${esc(l.code ?? "")}</td><td class="l bd">${esc(cleanIt(l.name))}${l.nameAr && cleanIt(l.nameAr) !== cleanIt(l.name) ? ` <span dir="rtl">${esc(l.nameAr)}</span>` : ""}</td>` +
        `<td class="c bd">${esc(l.unit ?? "")}</td><td class="c bd">${Number(l.qty || 0)}</td>` +
        `<td class="c bd">${n2(l.price)}</td><td class="c bd">${n2(l.total)}</td></tr>`).join("")
    : `<tr><td class="sn">1</td><td class="c bd"></td><td class="l bd"></td><td class="c bd"></td><td class="c bd"></td><td class="c bd"></td><td class="c bd"></td></tr>`;

  const valRow = (label: string, val: string, bold = false, size = "") =>
    `<tr><td colspan="5"></td><td class="lbl"${size ? ` style="font-size:${size}"` : ""}>${label}</td>` +
    `<td class="c bd ${bold ? "bold" : ""}"${size ? ` style="font-size:${size}"` : ""}>${val}</td></tr>`;

  // Time shown like the .xlsx does (h:mm AM/PM instead of 24h "18:09").
  const t12 = (() => {
    const t = String(d.time ?? "").trim();
    const m = t.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return t;
    let h = Number(m[1]);
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m[2]} ${ap}`;
  })();

  return `<!doctype html><html dir="ltr"><head><meta charset="utf-8"><title>${esc(title)}${d.no ? " — " + esc(d.no) : ""}</title><style>
  @page { size: A4 portrait; margin: 8mm; }
  html,body { margin:0; padding:0; }
  body { font-family: Vazir, Tahoma, "Segoe UI", Arial, sans-serif; font-size:8pt; color:#000;
         -webkit-print-color-adjust: exact; print-color-adjust: exact;
         background:#e9ecef; padding:10mm 0; }
  /* On screen: white A4 paper on a gray desk (looks exactly like the printed PDF).
     In print: the page itself is the paper — backdrop & shadow are dropped. */
  .sheet { width:210mm; min-height:297mm; margin:0 auto; padding:8mm; background:#fff;
           box-shadow:0 2px 14px rgba(0,0,0,.28); box-sizing:border-box; }
  @media print {
    body { background:#fff; padding:0; }
    .sheet { width:auto; min-height:0; margin:0; padding:0; box-shadow:none; }
  }
  table { width:100%; border-collapse:collapse; table-layout:fixed; }
  td { vertical-align:middle; padding:1pt 2pt; overflow:hidden; }
  .lh { display:flex; align-items:center; margin-bottom:4pt; }
  .lh-l { width:38%; text-align:center; font-family:Calibri,Arial,sans-serif; font-size:10.5pt; line-height:1.35; }
  .lh-l .t1 { font-size:12pt; font-weight:700; }
  .lh-l .red, .lh-r .red { color:#FF0000; font-weight:700; font-size:11pt; }
  .lh-c { width:24%; text-align:center; }
  /* Same picture box the 0060 template uses for the logo image
     (a:ext 1201615x816532 EMU) so print/PDF matches the .xlsx letterhead. */
  .lh-c img { width:33.4mm; height:22.7mm; object-fit:fill; }
  .lh-r { width:38%; text-align:center; font-family:Arial,Tahoma,sans-serif; direction:rtl; font-size:10.5pt; line-height:1.35; }
  .lh-r .t1 { font-weight:700; font-size:11pt; }
  .gray { background:#D9D9D9; }
  .bd { border:1px solid #808080; }
  .c { text-align:center; } .l { text-align:left; }
  .sn { text-align:center; }
  .lbl { font-weight:700; text-align:left; white-space:nowrap; }
  .bold { font-weight:700; }
  </style></head><body><div class="sheet">
  <div class="lh">
    <div class="lh-l">
      <div class="t1">Kingdom Saudi Arabia</div>
      <div class="red">${esc(company.name ?? "Yousef Jameel Al-Juhani")}</div>
      <div class="red">${esc(company.nameAr ?? "Contracting Est.")}</div>
      <div>C . R . No: ${esc(company.crNumber ?? "4700012896")}</div>
      <div>Tax No: ${esc(company.taxNumber ?? company.tax ?? "300995897900003")}</div>
    </div>
    <div class="lh-c">${logoUrl ? `<img src="${logoUrl}" alt="">` : ""}</div>
    <div class="lh-r">
      <div class="t1">المملكة العربية السعودية</div>
      <div class="red">${esc(company.nameAr)}</div>
      <div class="red">${esc(company.name)}</div>
      <div>س . ت : ${esc(company.crNumber ?? "4700012896")}</div>
      <div>الرقم الضريبي : ${esc(company.taxNumber ?? company.tax ?? "300995897900003")}</div>
    </div>
  </div>
  <table><colgroup>
    <col style="width:4.3%"><col style="width:10.3%"><col style="width:34%">
    <col style="width:7.7%"><col style="width:7.7%"><col style="width:15.4%"><col style="width:20.6%">
  </colgroup><tbody>
    <tr class="gray" style="height:26.25pt">
      <td></td><td style="font-size:10pt">${esc(title)}</td>
      <td colspan="5" class="c" style="font-size:16pt">${esc(d.docType === "sale" ? "Tax Invoice" : co)}</td>
    </tr>
    <tr><td></td><td class="lbl">C.R. No</td><td>${esc(d.partyCr ?? "")}</td><td class="lbl">Tax No.</td><td colspan="3">${esc(d.partyTax ?? "")}</td></tr>
    <tr><td></td><td class="lbl">Doc. No.</td><td>${esc(d.no)}</td><td class="lbl">Client</td><td colspan="3">${esc(d.party ?? "")}</td></tr>
    <tr><td></td><td class="lbl">Payment</td><td>${esc(d.paymentType ?? "")}</td><td class="lbl" style="white-space:normal">Arabic Name</td><td colspan="3">${esc(d.partyAr ?? "")}</td></tr>
    <tr><td></td><td class="lbl">Date</td><td>${esc(d.date)}</td><td class="lbl">Address</td><td colspan="3">${esc(d.accountAddress ?? "")}</td></tr>
    <tr><td></td><td class="lbl">Time</td><td>${esc(t12)}</td><td class="lbl">Phone No.</td><td colspan="3">${esc(d.partyPhone ?? "")}</td></tr>
    <tr><td></td><td class="lbl">Due Date</td><td>${esc(d.dueDate ?? d.date)}</td><td class="lbl">Email</td><td colspan="3">${esc(d.partyEmail ?? "")}</td></tr>
    <tr><td></td><td class="lbl">Cashier</td><td>${esc(d.cashier ?? "")}</td><td colspan="4"></td></tr>
    ${d.notes ? `<tr><td></td><td></td><td></td><td class="lbl">Note</td><td colspan="3" style="font-size:9pt;white-space:pre-wrap;word-break:break-word">${esc(d.notes)}</td></tr>` : ""}
    <tr style="height:30pt;font-weight:700" class="c">
      <td></td><td class="bd">Item No.</td><td class="bd">Job Description</td><td class="bd">Unit</td>
      <td class="bd">Qty</td><td class="bd">Price</td><td class="bd">Total</td>
    </tr>
    ${itRows}
    <tr><td></td><td></td><td></td><td></td><td class="c bd">${qtyTotal}</td><td class="lbl">Total</td><td class="c bd">${n2(d.subtotal)}</td></tr>
    ${addl ? valRow(esc(d.additionType || "الإضافات"), n2(addl)) : ""}
    ${disc ? valRow("Discount", n2(disc)) : ""}
    <tr><td colspan="5"></td><td class="lbl">VAT ${Number(d.taxPct ?? 15)}%</td><td class="c bd">${n2(d.tax)}</td></tr>
    <tr style="height:17.25pt">
      <td></td><td class="lbl">Due</td><td class="l">${esc(words)}</td><td colspan="2"></td>
      <td class="lbl" style="font-size:10pt">Due</td><td class="c bd bold" style="font-size:10pt">${n2(net)}</td>
    </tr>
    ${valRow("Paid", n2(paid))}
    ${creditDue ? valRow("Credit", n2(creditDue)) : ""}
    ${d.hasAccount ? valRow("Bal. Prior", n2(d.balBefore)) + valRow("Bal. After", n2(d.balAfter ?? d.balBefore)) : ""}
    <tr style="height:8pt"><td colspan="7"></td></tr>
    <tr class="gray" style="height:26.25pt">
      <td></td><td colspan="6" class="c" style="font-size:16pt">Thank You</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2" style="vertical-align:top;font-size:8pt;line-height:1.4">${contacts.map((c) => `<div>${esc(c)}</div>`).join("")}</td>
      <td colspan="3" class="c">${qrUrl ? `<img src="${qrUrl}" style="width:26mm;height:26mm" alt="">` : ""}</td>
      <td></td>
    </tr>
  </tbody></table>
  </div></body></html>`;
}

// Opens the invoice as a real A4 print document in a new window/tab.
// Printing (or "Save as PDF") yields the invoice document itself.
// ---------------------------------------------------------------------------
// Tenant's own Excel design (uploaded .xlsx).
// The uploaded file IS the invoice form: every Sahl tag inside it
// (<Data:…>, <Account:…>, <Items:…>, <AmountString>) is replaced with the
// document values and the item row is repeated for every invoice line — so
// the exported workbook looks exactly like the design the tenant uploaded.
// ---------------------------------------------------------------------------
function xmlDecode(s: string) {
  return String(s ?? "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, "&");
}
function xmlEncode(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function readSharedStrings(xml: string): string[] {
  const out: string[] = [];
  const re = /<si>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    out.push(xmlDecode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join("")));
  }
  return out;
}
function cellTextOf(cellXml: string, shared: string[]): string {
  const t = (cellXml.match(/\st="([^"]+)"/) || [])[1] || "n";
  if (t === "s") {
    const v = (cellXml.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || "";
    return shared[Number(v)] ?? "";
  }
  if (t === "inlineStr") {
    return xmlDecode([...cellXml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(""));
  }
  return xmlDecode((cellXml.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || "");
}
function tagValue(
  tag: string, d: DocData, company: any, line: DocLine | null,
): string | number | null {
  const t = tag.trim();
  const n = (v: any) => Number(v || 0);
  if (/^<Items:/i.test(t)) {
    if (!line) return ""; // stray item tag outside the item row → clear it
    if (/^<Items:title>/i.test(t)) return line.name ?? "";
    if (/^<Items:code>/i.test(t)) return line.code ?? "";
    if (/^<Items:unit>/i.test(t)) return line.unit ?? "";
    if (/^<Items:user_qty>|^<Items:qty>/i.test(t)) return n(line.qty);
    if (/^<Items:price>/i.test(t)) return n(line.price);
    if (/^<Items:total_price>|^<Items:net_price>/i.test(t)) return n(line.total);
    if (/^<Items:discount>/i.test(t)) return n(line.disc);
    return null;
  }
  if (/^<Data:no>/i.test(t)) return d.no ?? "";
  if (/^<Data:reference>/i.test(t)) return (d as any).reference ?? "";
  if (/^<Data:date>/i.test(t)) return d.date ?? "";
  if (/^<Data:time>/i.test(t)) return d.time ?? "";
  if (/^<Data:total_price>/i.test(t)) return n(d.subtotal);
  if (/^<Data:discount>/i.test(t)) return n(d.discount);
  if (/^<Data:net_price>/i.test(t)) return n(d.net);
  if (/^<Data:tax_amount>/i.test(t)) return n(d.tax);
  if (/^<Data:paid>/i.test(t)) return n(d.paid);
  if (/^<Data:remaining>/i.test(t)) return n(d.net) - n(d.paid);
  if (/^<Account:title>/i.test(t)) return d.party ?? "";
  if (/^<Account:tax_id>/i.test(t)) return d.partyTax ?? "";
  if (/^<Account:phone>/i.test(t)) return d.partyPhone ?? "";
  if (/^<Branch:name>/i.test(t)) return d.branch ?? "";
  if (/^<AmountString>/i.test(t)) return amountWords(d.net);
  if (/^<ZATCA:QR_TLV>/i.test(t)) return d.qrText ?? "";
  if (/^<Company:name>/i.test(t)) return company?.nameAr || company?.name || "";
  return null;
}
function patchTemplateSheet(
  sheet: string, d: DocData, company: any, shared: string[],
): string {
  const rowRe = /<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g;
  const rows: { num: number; attrs: string; inner: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(sheet))) {
    const attrs = m[1] || "";
    rows.push({
      num: Number((attrs.match(/r="(\d+)"/) || [])[1] || 0),
      attrs,
      inner: m[2] ?? "",
    });
  }
  if (!rows.length) return sheet;

  const lines = d.lines ?? [];
  // The tag text inside the XML is escaped (&lt;Items:title&gt;) — the row is
  // detected through the DECODED cell text, otherwise the item row is missed.
  const rowHasItems = (inner: string) => {
    const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(inner))) {
      if (/<Items:/i.test(cellTextOf(cm[0], shared))) return true;
    }
    return false;
  };
  const itemIdx = rows.findIndex((r) => rowHasItems(r.inner));

  const patchInner = (inner: string, rowNum: number, line: DocLine | null): string => {
    const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    return inner.replace(cellRe, (full, attrs: string) => {
      const ref = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
      if (!ref) return full;
      const text = cellTextOf(full, shared);
      const tags = text.match(/<[^<>]+>/g) || [];
      let newText = text;
      let numeric = false;
      for (const tg of tags) {
        const v = tagValue(tg, d, company, line);
        if (v === null) continue;
        newText = newText.replace(tg, typeof v === "number" ? String(v) : String(v));
        if (typeof v === "number" && text.trim() === tg) numeric = true;
      }
      const newRef = `${ref}${rowNum}`;
      const oldRef = (attrs.match(/r="([^"]+)"/) || [])[1] || "";
      if (newText === text && newRef === oldRef) return full;
      const style = (attrs.match(/s="(\d+)"/) || [])[1];
      const keep = style ? ` s="${style}"` : "";
      if (newText === text) {
        // no tag to replace, only the row number moved
        return `<c r="${newRef}"${keep}${attrs.replace(/\st="[^"]*"/, "").replace(/r="[^"]*"/, "").replace(/^\s+/, "")}${full.endsWith("/>") ? "/>" : `>${(full.match(/>([\s\S]*)<\/c>/) || [])[1] || ""}</c>`}`;
      }
      const innerXml = numeric
        ? `<v>${newText}</v>`
        : `<is><t xml:space="preserve">${xmlEncode(newText)}</t></is>`;
      const tAttr = numeric ? "" : ' t="inlineStr"';
      return `<c r="${newRef}"${keep}${tAttr}>${innerXml}</c>`;
    });
  };

  const out: { num: number; attrs: string; inner: string }[] = [];
  const delta = Math.max(0, lines.length - 1);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (i === itemIdx) {
      const list = lines.length ? lines : [null as any];
      list.forEach((ln, li) => {
        const newNum = r.num + li;
        out.push({
          num: newNum,
          attrs: r.attrs.replace(/r="\d+"/, `r="${newNum}"`),
          inner: patchInner(r.inner, newNum, ln),
        });
      });
      continue;
    }
    const newNum = r.num + (itemIdx >= 0 && i > itemIdx ? delta : 0);
    out.push({
      num: newNum,
      attrs: newNum !== r.num ? r.attrs.replace(/r="\d+"/, `r="${newNum}"`) : r.attrs,
      inner: patchInner(r.inner, newNum, null),
    });
  }

  const body = out.map((r) => {
    const attrs = r.attrs.replace(/\s*spans="[^"]*"/, "");
    return r.inner ? `<row${attrs}>${r.inner}</row>` : `<row${attrs}/>`;
  }).join("");
  let outXml = sheet.replace(/<sheetData\b[^>]*>[\s\S]*?<\/sheetData>/, `<sheetData>${body}</sheetData>`);
  const maxRow = out.length ? Math.max(...out.map((r) => r.num)) : 1;
  outXml = outXml.replace(/<dimension ref="([^"]+)"/, (_m, ref) =>
    `<dimension ref="${ref.replace(/(\d+)$/, String(maxRow))}"`);
  return outXml;
}

// Replace the pictures of an uploaded design: the picture named
// "<#invoice_qrcode>" gets the real ZATCA QR, the first other picture gets
// the company logo.
async function applyTemplateImages(
  zip: any, qr: Uint8Array | null, logo: Uint8Array | null,
): Promise<void> {
  try {
    const rels = zip.file("xl/drawings/_rels/drawing1.xml.rels");
    const drw = zip.file("xl/drawings/drawing1.xml");
    if (!rels || !drw) return;
    const relXml = await rels.async("string");
    const drwXml = await drw.async("string");
    const relMap: Record<string, string> = {};
    for (const m of relXml.matchAll(/Id="([^"]+)"[^>]*Target="\.\.\/media\/([^"]+)"/g)) relMap[m[1]] = m[2];
    let logoDone = false;
    for (const pic of drwXml.match(/<xdr:pic>[\s\S]*?<\/xdr:pic>/g) || []) {
      const name = (pic.match(/name="([^"]*)"/) || [])[1] || "";
      const rid = (pic.match(/r:embed="([^"]+)"/) || [])[1] || "";
      const target = relMap[rid];
      if (!target) continue;
      if (/qrcode/i.test(name)) {
        if (qr) zip.file(`xl/media/${target}`, qr);
      } else if (!logoDone && logo) {
        zip.file(`xl/media/${target}`, logo);
        logoDone = true;
      }
    }
  } catch { /* images optional */ }
}

// Is this uploaded file the 0060 tax-invoice form? Then the proven 0060
// patcher is used instead of the tag based one (the 0060 form carries no
// Sahl tags — its cells are at fixed positions).
function looksLike0060(sheetXml: string, shared: string[], drawingXml: string): boolean {
  const texts: string[] = [];
  for (const m of sheetXml.matchAll(/<c\b[^>]*?(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const t = cellTextOf(m[0], shared);
    if (t) texts.push(t);
  }
  const all = texts.join(" | ");
  const hasQrSlot = /invoice_qrcode/i.test(drawingXml);
  const docNo = /Doc\.?\s*No|Doc\.?\s*Number|رقم\s*المستند/i.test(all);
  const client = /Client|العميل/i.test(all);
  return hasQrSlot && docNo && client;
}

// Render an invoice from the tenant's uploaded Excel design.
export async function renderTemplateXlsx(
  templateB64: string, cfg: PrintConfig, d: DocData,
  company: { nameAr?: string; name?: string; tax?: string; logoBase64?: string },
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(templateB64, { base64: true });
  const sheetFile = zip.file("xl/worksheets/sheet1.xml");
  if (!sheetFile) throw new Error("Template: sheet1 missing");
  const sharedFile = zip.file("xl/sharedStrings.xml");
  const shared = sharedFile ? readSharedStrings(await sharedFile.async("string")) : [];
  const sheet = await sheetFile.async("string");
  const drawFile = zip.file("xl/drawings/drawing1.xml");
  const drawing = drawFile ? await drawFile.async("string") : "";

  // real ZATCA QR (png) for the QR slot
  let qrPng: Uint8Array | null = null;
  if (d.qrText) {
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(d.qrText, { width: 260, margin: 0, errorCorrectionLevel: "M" });
      qrPng = b64ToBytes(url.split(",")[1]);
    } catch { /* qr optional */ }
  }
  const logoJpg = await logoToJpegBytes(company.logoBase64);

  if (looksLike0060(sheet, shared, drawing)) {
    // ---- the uploaded file IS the 0060 tax form: patch it the proven way ----
    const { xml: patchedSheet, thankRow } = patchSheet060(sheet, cfg, d, company);
    zip.file("xl/worksheets/sheet1.xml", patchedSheet);
    await applyTemplateImages(zip, qrPng, logoJpg);
    // keep the QR anchor beside the Thank-You row
    try {
      const drwFile = zip.file("xl/drawings/drawing1.xml");
      if (drwFile) {
        const drw = await drwFile.async("string");
        const m = drw.match(/<xdr:twoCellAnchor[^>]*>[\s\S]*?<\/xdr:twoCellAnchor>/);
        if (m) {
          let a = m[0];
          a = a.replace(/(<xdr:from>[\s\S]*?<xdr:row>)\d+(<\/xdr:row>)/, `$1${thankRow - 1}$2`);
          a = a.replace(/(<xdr:to>[\s\S]*?<xdr:row>)\d+(<\/xdr:row>)/, `$1${thankRow - 1 + 5}$2`);
          zip.file("xl/drawings/drawing1.xml", drw.replace(m[0], a));
        }
      }
    } catch { /* keep original anchors */ }
  } else {
    // ---- any other design: replace the Sahl tags inside it ----
    zip.file("xl/worksheets/sheet1.xml", patchTemplateSheet(sheet, d, company, shared));
    await applyTemplateImages(zip, qrPng, logoJpg);
  }

  const out = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new Blob([out as any], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export async function printInvoice060(
  d: DocData,
  company: { nameAr?: string; name?: string; tax?: string; taxNumber?: string; crNumber?: string; logoBase64?: string },
  title?: string,
): Promise<void> {
  const w = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;
  let logoUrl = "";
  try {
    // company logo first, template letterhead logo as fallback
    const jpg = await logoToJpegBytes(company.logoBase64);
    if (jpg) logoUrl = "data:image/jpeg;base64," + bytesToB64(jpg);
    else {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(FORM0060_B64, { base64: true });
      const img = zip.file("xl/media/image2.jpeg");
      if (img) logoUrl = "data:image/jpeg;base64," + bytesToB64(await img.async("uint8array"));
    }
  } catch { /* logo optional */ }
  let qrUrl = "";
  if (d.qrText) {
    try {
      const QRCode = (await import("qrcode")).default;
      qrUrl = await QRCode.toDataURL(d.qrText, { width: 240, margin: 0 });
    } catch { /* qr optional */ }
  }
  const html = invoice060Html(d, company, title ?? "invoice", logoUrl, qrUrl);
  if (w) {
    try {
      w.document.open();
      w.document.write(html);
      w.document.close();
      if (!(window as any).__NO_AUTOPRINT)
        setTimeout(() => { try { w.focus(); w.print(); } catch { /* ignore */ } }, 700);
      return;
    } catch { /* fall through to iframe */ }
  }
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  f.contentDocument!.open();
  f.contentDocument!.write(html);
  f.contentDocument!.close();
  setTimeout(() => { try { f.contentWindow!.print(); } catch { /* ignore */ } setTimeout(() => f.remove(), 1500); }, 700);
}
