import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls } from "./ui";
import {
  DOC_TITLES, downloadBlob, printInvoice060, render060, zatcaQrTlv,
  type DocData, type PrintConfig,
} from "./printEngine";

// Invoice History & Audit — one filterable screen for every document
// (sales, sales returns, purchase, purchase returns, quotations) with
// per-row view / print / excel / return. Read-only: it reuses the same
// print engine (form-returnsale-0060) and never touches the sale workspace.
type RowKind = "sale" | "sale-return" | "purchase" | "purchase-return" | "quotation";

interface HRow {
  key: string;
  kind: RowKind;
  id: number;
  no: string;
  date: string;
  time?: string;
  clientEn: string;
  clientAr: string;
  phone: string;
  taxNo: string;
  payment: "cash" | "credit" | "";
  total: number;
  discount: number;
  vat: number;
  grand: number;
  paid: number;
  balance: number;
  cashier: string;
}

const money = (v: number) => (Number(v) || 0).toFixed(2);

// yyyy-mm-dd -> yyyy/mm/dd (Sahl style) and 24h "23:11" -> "11:11 PM".
const fmtDate = (ds: string) => (ds ? ds.slice(0, 10).replace(/-/g, "/") : "");
const fmtTime = (ts?: string) => {
  if (!ts) return "";
  const m = String(ts).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return String(ts);
  let h = Number(m[1]);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m[2]} ${ap}`;
};

const BADGE: Record<RowKind, { ar: string; en: string; bg: string }> = {
  "sale": { ar: "بيع", en: "Sale", bg: "#2fae4e" },
  "sale-return": { ar: "مرتجع بيع", en: "S. Return", bg: "#d81b60" },
  "purchase": { ar: "شراء", en: "Purchase", bg: "#e05242" },
  "purchase-return": { ar: "مرتجع شراء", en: "P. Return", bg: "#7b2d4e" },
  "quotation": { ar: "عرض سعر", en: "Quote", bg: "#1da1f2" },
};

const DEFAULT_CFG: PrintConfig = {
  kind: "sahl-xlsx", docType: "sale", paper: "A4",
  titleAr: "", titleEn: "", headerLines: ["", "", ""], contactLines: [],
  showSignatures: true, showTax: true, showBalances: true,
  columns: [
    { key: "code", ar: "الكود", en: "Code", visible: true },
    { key: "name", ar: "الصنف", en: "Item", visible: true },
    { key: "unit", ar: "الوحدة", en: "Unit", visible: true },
    { key: "qty", ar: "الكمية", en: "Qty", visible: true },
    { key: "price", ar: "السعر", en: "Price", visible: true },
    { key: "total", ar: "الإجمالي", en: "Total", visible: true },
  ],
  footerText: "", accent: "#2fae4e",
};

export default function SahlInvoiceHistory() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const utils = trpc.useUtils();

  const { data: invoices } = trpc.sales.invoiceList.useQuery(undefined);
  const { data: credits } = trpc.sales.creditNoteList.useQuery(undefined);
  const { data: quotes } = trpc.sales.quotationList.useQuery(undefined);
  const { data: pos } = trpc.purchase.poList.useQuery(undefined);
  const { data: adjs } = trpc.inventory.adjustmentList.useQuery(undefined);
  const { data: customers } = trpc.sales.customerList.useQuery(undefined);
  const { data: suppliers } = trpc.purchase.supplierList.useQuery(undefined);
  const { data: company } = trpc.settings.companySettingsGet.useQuery();

  const custMap = useMemo(() => {
    const m = new Map<number, any>();
    for (const c of (customers ?? []) as any[]) m.set(Number(c.id), c);
    return m;
  }, [customers]);
  const supMap = useMemo(() => {
    const m = new Map<number, any>();
    for (const s of (suppliers ?? []) as any[]) m.set(Number(s.id), s);
    return m;
  }, [suppliers]);

  // ---- filters ----
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"all" | RowKind>("all");
  const [pay, setPay] = useState<"all" | "cash" | "credit">("all");
  const [cashier, setCashier] = useState("all");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  // ---- merge every document type into one row list ----
  const rows: HRow[] = useMemo(() => {
    const out: HRow[] = [];
    for (const inv of (invoices ?? []) as any[]) {
      const pm = String(inv.paymentMethod ?? "").toLowerCase();
      const payment: HRow["payment"] = pm === "credit" ? "credit" : pm ? "cash" : (Number(inv.balanceDue || 0) > 0 ? "credit" : "cash");
      out.push({
        key: `inv-${inv.id}`, kind: "sale", id: Number(inv.id),
        no: String(inv.invoiceNumber ?? inv.id),
        date: String(inv.date ?? "").slice(0, 10), time: String(inv.time ?? "").slice(0, 5) || undefined,
        clientEn: String(inv.customerName ?? "").trim(), clientAr: String(inv.customerNameAr ?? "").trim(),
        phone: String(inv.customerPhone ?? ""), taxNo: String(inv.customerVat ?? ""),
        payment,
        total: Number(inv.subTotal || 0), discount: Number(inv.discountAmount || 0), vat: Number(inv.taxAmount || 0),
        grand: Number(inv.totalAmount || 0), paid: Number(inv.paidAmount || 0), balance: Number(inv.balanceDue || 0),
        cashier: String(inv.cashier ?? ""),
      });
    }
    for (const cn of (credits ?? []) as any[]) {
      const c = custMap.get(Number(cn.customerId));
      out.push({
        key: `cn-${cn.id}`, kind: "sale-return", id: Number(cn.id),
        no: String(cn.creditNoteNumber ?? `CN-${cn.id}`),
        date: String(cn.date ?? "").slice(0, 10),
        clientEn: String(c?.name ?? ""), clientAr: String(c?.nameAr ?? ""),
        phone: String(c?.phone ?? c?.mobile ?? ""), taxNo: String(c?.vatNumber ?? c?.taxNumber ?? ""),
        payment: "", total: 0, discount: 0, vat: 0,
        grand: Number(cn.amount || 0), paid: 0, balance: Number(cn.amount || 0),
        cashier: "",
      });
    }
    for (const qt of (quotes ?? []) as any[]) {
      const c = custMap.get(Number(qt.customerId));
      out.push({
        key: `q-${qt.id}`, kind: "quotation", id: Number(qt.id),
        no: String(qt.quotationNumber ?? `QT-${qt.id}`),
        date: String(qt.date ?? "").slice(0, 10),
        clientEn: String(c?.name ?? ""), clientAr: String(c?.nameAr ?? ""),
        phone: String(c?.phone ?? c?.mobile ?? ""), taxNo: String(c?.vatNumber ?? c?.taxNumber ?? ""),
        payment: "", total: Number(qt.subTotal || 0), discount: 0, vat: Number(qt.taxAmount || 0),
        grand: Number(qt.totalAmount || 0), paid: 0, balance: 0,
        cashier: "",
      });
    }
    for (const po of (pos ?? []) as any[]) {
      const s = supMap.get(Number(po.supplierId));
      out.push({
        key: `po-${po.id}`, kind: "purchase", id: Number(po.id),
        no: String(po.poNumber ?? `PO-${po.id}`),
        date: String(po.date ?? "").slice(0, 10),
        clientEn: String(s?.name ?? ""), clientAr: String(s?.nameAr ?? ""),
        phone: String(s?.phone ?? ""), taxNo: String(s?.vatNumber ?? s?.taxNumber ?? ""),
        payment: "", total: Number(po.subTotal || 0), discount: 0, vat: Number(po.taxAmount || 0),
        grand: Number(po.totalAmount || 0), paid: 0, balance: 0,
        cashier: "",
      });
    }
    for (const a of (adjs ?? []) as any[]) {
      const reason = String(a.notes ?? "");
      if (!/return|مرتجع/i.test(reason)) continue;
      // A purchase return is stored as a stock adjustment — link it back to the
      // original PO so the row shows the supplier and the PO number.
      const poMatch = reason.match(/PO#(\d+)/);
      const po: any = poMatch ? (pos ?? []).find((p: any) => String(p.id) === String(poMatch[1])) : null;
      const sup: any = po ? supMap.get(Number(po.supplierId)) : null;
      out.push({
        key: `adj-${a.id}`, kind: "purchase-return", id: Number(a.id),
        no: po ? String(po.poNumber ?? `ADJ-${a.id}`) : String(a.adjustmentNumber ?? `ADJ-${a.id}`),
        date: String(a.date ?? "").slice(0, 10),
        clientEn: sup?.name ?? reason, clientAr: sup ? (sup.nameAr || sup.name) : reason, phone: "", taxNo: "",
        payment: "", total: 0, discount: 0, vat: 0,
        grand: Number(a.totalValue || 0), paid: 0, balance: 0,
        cashier: "",
      });
    }
    out.sort((a, b) => (a.date + (a.time ?? "") + a.no).localeCompare(b.date + (b.time ?? "") + b.no, "en"));
    return out.reverse();
  }, [invoices, credits, quotes, pos, adjs, custMap, supMap]);

  const cashiers = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) if (r.cashier) s.add(r.cashier);
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (type !== "all" && r.kind !== type) return false;
      if (pay !== "all" && r.payment !== pay) return false;
      if (cashier !== "all" && r.cashier !== cashier) return false;
      if (from && r.date && r.date < from) return false;
      if (to && r.date && r.date > to) return false;
      if (qq) {
        const hay = [r.no, r.clientEn, r.clientAr, r.phone, r.taxNo].join(" ").toLowerCase();
        if (!hay.includes(qq)) return false;
      }
      return true;
    });
  }, [rows, type, pay, cashier, from, to, q]);

  const sum = useMemo(() => {
    let grand = 0, paid = 0, bal = 0;
    for (const r of filtered) { grand += r.grand; paid += r.paid; bal += r.balance; }
    return { count: filtered.length, grand, paid, bal };
  }, [filtered]);

  // ---- row actions ----
  const payLabel = (p: HRow["payment"]) => p === "credit" ? T("آجل", "Credit") : p === "cash" ? T("نقدي", "Cash") : "—";

  const openRow = (r: HRow) => {
    if (r.kind === "sale") navigate(`/app/construction/sahl/sales?view=${r.id}`);
    else if (r.kind === "purchase") navigate(`/app/construction/sahl/purchase?view=${r.id}`);
    else if (r.kind === "quotation") navigate(`/app/construction/sahl/quotation?view=${r.id}`);
    else if (r.kind === "sale-return") navigate(`/app/construction/sahl/sales-return?view=${r.id}`);
  };

  // Open the saved sales invoice directly in edit mode (form unlocked).
  const editRow = (r: HRow) => navigate(`/app/construction/sahl/sales?view=${r.id}&edit=1`);

  const startReturn = (r: HRow) => navigate(`/app/construction/sahl/sales-return?orig=${r.id}`);

  const compContacts = (comp: any) => [comp.print1, comp.print2, comp.print3].filter((x: any) => x && String(x).trim());

  const docFromInvoice = (data: any): DocData => {
    const inv: any = data?.invoice ?? {};
    const items: any[] = data?.items ?? [];
    const cust: any = data?.customer;
    const comp: any = company ?? {};
    const joinTwo = (a: string, b: string) => (a && b && a !== b ? `${a} / ${b}` : a || b);
    const nameEn = String(inv?.customerName ?? cust?.name ?? "").trim();
    const nameAr = String(inv?.customerNameAr ?? cust?.nameAr ?? "").trim();
    const addrEn = String(inv?.customerAddress ?? cust?.address ?? "").trim();
    const addrAr = String(inv?.customerAddressAr ?? cust?.addressAr ?? "").trim();
    const pm = String(inv?.paymentMethod ?? "").toLowerCase();
    const pay = pm === "card" ? T("شبكة", "Card") : pm === "credit" ? T("آجل", "Credit") : T("نقدي", "Cash");
    const contacts = compContacts(comp);
    // Older documents (created before the Sahl invoice screen) can have line
    // rows but zero header totals. Rebuild the money fields from the lines so
    // history print / Excel never shows an empty zero-value invoice.
    const lineSub = items.reduce((a: number, it: any) => {
      const t = Number(it.totalAmount || 0);
      return a + (t || Number(it.quantity || 0) * Number(it.unitPrice || 0));
    }, 0);
    const subTotal = Number(inv?.subTotal || 0) || lineSub;
    const discount = Number(inv?.discountAmount || 0);
    const taxPct = Number(inv?.taxPercent || 15) || 0;
    const tax = Number(inv?.taxAmount || 0) || Math.max(0, subTotal - discount) * taxPct / 100;
    const net = Number(inv?.totalAmount || 0) || (subTotal - discount + tax);
    return {
      no: inv?.invoiceNumber ?? `#${inv?.id}`,
      date: String(inv?.date ?? "").slice(0, 10),
      time: String(inv?.time ?? "").slice(0, 5) || undefined,
      party: joinTwo(nameEn, nameAr),
      partyAr: nameAr && nameAr !== nameEn ? nameAr : undefined,
      partyTax: inv?.customerVat ?? cust?.vatNumber ?? cust?.taxNumber,
      partyPhone: inv?.customerPhone ?? cust?.phone ?? cust?.mobile,
      partyEmail: inv?.customerEmail ?? cust?.email,
      partyCr: inv?.customerCr ?? cust?.crNumber,
      branch: "",
      lines: items.map((it: any) => ({
        code: it.sku ?? "", name: it.description ?? "", nameAr: it.descriptionAr || undefined,
        unit: it.unit ?? "", qty: Number(it.quantity || 0), price: Number(it.unitPrice || 0),
        disc: 0, total: Number(it.totalAmount || 0) || Number(it.quantity || 0) * Number(it.unitPrice || 0),
      })),
      subtotal: subTotal, discount,
      tax, net,
      paid: Number(inv?.paidAmount || 0),
      notes: [inv?.notes, inv?.notesAr].map((x: any) => String(x ?? "").trim()).filter(Boolean).join(" / ") || undefined,
      qrText: inv?.zatcaQrCode || undefined,
      dueDate: String(inv?.dueDate ?? "").slice(0, 10) || undefined,
      cashier: inv?.cashier || undefined,
      paymentType: pay,
      taxPct,
      qtyTotal: items.reduce((a: number, it: any) => a + Number(it.quantity || 0), 0),
      companyTax: comp.taxNumber ?? undefined,
      companyContacts: contacts.length ? contacts : undefined,
      accountAddress: joinTwo(addrEn, addrAr) || undefined,
      docType: "sale",
    } as DocData;
  };

  const docFromPo = (po: any): DocData => {
    const comp: any = company ?? {};
    const items: any[] = po?.items ?? [];
    const s = supMap.get(Number(po?.supplierId));
    const contacts = compContacts(comp);
    return {
      no: po?.poNumber ?? `#${po?.id}`,
      date: String(po?.date ?? "").slice(0, 10),
      party: String(s?.name ?? ""), partyAr: s?.nameAr || undefined,
      partyTax: s?.vatNumber ?? s?.taxNumber, partyPhone: s?.phone ?? undefined,
      branch: "",
      lines: items.map((it: any) => ({
        code: "", name: it.productName || it.description || "", unit: "",
        qty: Number(it.quantity || 0), price: Number(it.unitPrice || 0),
        disc: 0, total: Number(it.totalAmount || 0),
      })),
      subtotal: Number(po?.subTotal || 0), discount: 0, tax: Number(po?.taxAmount || 0),
      net: Number(po?.totalAmount || 0),
      notes: String(po?.notes ?? "").trim() || undefined,
      qtyTotal: items.reduce((a: number, it: any) => a + Number(it.quantity || 0), 0),
      companyTax: comp.taxNumber ?? undefined,
      companyContacts: contacts.length ? contacts : undefined,
    } as DocData;
  };

  const docFromQuote = (qt: any): DocData => {
    const comp: any = company ?? {};
    const items: any[] = qt?.items ?? [];
    const c = custMap.get(Number(qt?.customerId));
    const contacts = compContacts(comp);
    return {
      no: qt?.quotationNumber ?? `#${qt?.id}`,
      date: String(qt?.date ?? "").slice(0, 10),
      party: String(c?.name ?? ""), partyAr: c?.nameAr || undefined,
      partyTax: c?.vatNumber ?? c?.taxNumber, partyPhone: c?.phone ?? c?.mobile ?? undefined,
      branch: "",
      lines: items.map((it: any) => ({
        code: "", name: it.productName || it.description || "", unit: "",
        qty: Number(it.quantity || 0), price: Number(it.unitPrice || 0),
        disc: 0, total: Number(it.totalAmount || 0),
      })),
      subtotal: Number(qt?.subTotal || 0), discount: 0, tax: Number(qt?.taxAmount || 0),
      net: Number(qt?.totalAmount || 0),
      dueDate: String(qt?.expiryDate ?? "").slice(0, 10) || undefined,
      notes: String(qt?.notes ?? "").trim() || undefined,
      qtyTotal: items.reduce((a: number, it: any) => a + Number(it.quantity || 0), 0),
      companyTax: comp.taxNumber ?? undefined,
      companyContacts: contacts.length ? contacts : undefined,
    } as DocData;
  };

  const printRow = async (r: HRow, mode: "html" | "xlsx") => {
    if (busy) return;
    setMsg(""); setBusy(r.key);
    try {
      let d: DocData;
      let docType: "sale" | "purchase" | "quotation";
      if (r.kind === "sale") {
        const data = await utils.sales.invoiceGet.fetch({ id: r.id });
        if (!data || !(data as any).invoice) { setMsg(T("لم يتم العثور على الفاتورة", "Invoice not found")); return; }
        d = docFromInvoice(data);
        docType = "sale";
      } else if (r.kind === "purchase") {
        const po = await utils.sahl.poDetail.fetch({ id: r.id });
        if (!po) { setMsg(T("لم يتم العثور على أمر الشراء", "Purchase order not found")); return; }
        d = docFromPo(po);
        docType = "purchase";
      } else if (r.kind === "quotation") {
        const qt = await utils.sahl.quoteDetail.fetch({ id: r.id });
        if (!qt) { setMsg(T("لم يتم العثور على عرض السعر", "Quotation not found")); return; }
        d = docFromQuote(qt);
        docType = "quotation";
      } else {
        setMsg(T("هذا النوع لا يدعم الطباعة من السجل", "This type has no printable document"));
        return;
      }
      const comp: any = company ?? {};
      const [tar] = DOC_TITLES[docType];
      // ZATCA QR: keep the stored code, else build a valid TLV for sales.
      if (docType === "sale" && !d.qrText && comp.taxNumber) {
        try {
          d.qrText = zatcaQrTlv({
            seller: comp.companyNameAr || comp.companyName || "",
            vat: comp.taxNumber,
            timestamp: `${d.date}T${d.time || "00:00"}:00`,
            total: d.net, tax: d.tax,
          });
        } catch { /* qr optional */ }
      }
      if (mode === "html") {
        await printInvoice060(
          d,
          {
            nameAr: comp.companyNameAr, name: comp.companyName, tax: comp.taxNumber,
            taxNumber: comp.taxNumber, crNumber: comp.crNumber ?? comp.commercialRegistration,
            logoBase64: comp.logo || undefined,
          },
          tar,
        );
      } else {
        const cfg: PrintConfig = { ...DEFAULT_CFG, docType, titleAr: tar, titleEn: DOC_TITLES[docType][1] };
        const blob = await render060(cfg, d, {
          nameAr: comp.companyNameAr, name: comp.companyName, tax: comp.taxNumber,
          logoBase64: comp.logo || undefined,
        });
        downloadBlob(blob, `${d.no}-0060.xlsx`);
      }
    } catch (e: any) {
      setMsg(String(e?.message ?? e));
    } finally {
      setBusy("");
    }
  };

  // Table zoom: the action column must stay visible on small screens, so the
  // user can shrink the grid (and scroll sideways) instead of losing buttons.
  const [zoom, setZoom] = useState<1 | 2 | 3>(2); // 3 = smallest
  const zoomTx = zoom === 3 ? "text-[9px]" : zoom === 2 ? "text-[10px]" : "text-[11px]";
  const zoomPad = zoom === 3 ? "px-1 py-0" : zoom === 2 ? "px-1.5 py-0.5" : "px-2 py-1";
  const zoomMin = zoom === 3 ? "min-w-[900px]" : zoom === 2 ? "min-w-[1060px]" : "min-w-[1200px]";

  const th = `whitespace-nowrap border border-[#1d7a37] ${zoomPad} font-normal ${zoomTx}`;
  const td = `whitespace-nowrap border border-[#ddd] ${zoomPad} ${zoomTx}`;
  const tdNum = `${td} text-end tabular-nums`;
  const miniBtn = `border border-[#888] bg-white px-1.5 py-0.5 ${zoomTx} leading-none hover:bg-[#e8f5e9] disabled:opacity-40`;

  return (
    <div className="flex min-h-full flex-col gap-2 text-[12px] text-black">
      {/* Title + Filter & Search bar */}
      <div className="border border-[#bbb] bg-white">
        <div className="flex items-center justify-between px-2 py-1 text-white" style={{ background: "#006d34" }}>
          <b className="text-[13px]">{T("سجل الفواتير والتدقيق", "Invoice History & Audit")}</b>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">{T("كل المستندات — عرض / طباعة / إكسل / مرتجع", "All documents — view / print / excel / return")}</span>
            <span className="flex items-center gap-1 border border-white/50 px-1 py-0.5 text-[10px]">
              <button title={T("تكبير", "Zoom in")} className="px-1" onClick={() => setZoom((z) => (z > 1 ? ((z - 1) as 1 | 2 | 3) : 1))}>＋</button>
              <span className="min-w-[34px] text-center">{zoom === 3 ? "80%" : zoom === 2 ? "90%" : "100%"}</span>
              <button title={T("تصغير", "Zoom out")} className="px-1" onClick={() => setZoom((z) => (z < 3 ? ((z + 1) as 1 | 2 | 3) : 3))}>－</button>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-1.5 border-t border-[#ddd] bg-[#f4f4f4] p-2">
          <label className="flex min-w-[220px] flex-1 flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#555]">{T("بحث (رقم المستند / العميل / الهاتف / الرقم الضريبي)", "Search (Doc No / Client / Phone / Tax No)")}</span>
            <input className={`${inputCls} h-8`} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={T("اكتب للبحث…", "Type to search…")} />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#555]">{T("من تاريخ", "From Date")}</span>
            <input type="date" className={`${inputCls} h-8 w-[130px]`} value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#555]">{T("إلى تاريخ", "To Date")}</span>
            <input type="date" className={`${inputCls} h-8 w-[130px]`} value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#555]">{T("النوع", "Type")}</span>
            <select className={`${inputCls} h-8 w-[145px]`} value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="all">{T("الكل", "All")}</option>
              <option value="sale">{T("فاتورة بيع", "Sales Invoice")}</option>
              <option value="sale-return">{T("مرتجع بيع", "Sales Return")}</option>
              <option value="purchase">{T("شراء", "Purchase")}</option>
              <option value="purchase-return">{T("مرتجع شراء", "Purchase Return")}</option>
              <option value="quotation">{T("عرض سعر", "Quotation")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#555]">{T("الدفع", "Payment")}</span>
            <select className={`${inputCls} h-8 w-[110px]`} value={pay} onChange={(e) => setPay(e.target.value as any)}>
              <option value="all">{T("الكل", "All")}</option>
              <option value="cash">{T("نقدي", "Cash")}</option>
              <option value="credit">{T("آجل", "Credit")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#555]">{T("أمين الصندوق", "Cashier")}</span>
            <select className={`${inputCls} h-8 w-[130px]`} value={cashier} onChange={(e) => setCashier(e.target.value)}>
              <option value="all">{T("الكل", "All")}</option>
              {cashiers.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button className={btnCls} onClick={() => { setQ(""); setFrom(""); setTo(""); setType("all"); setPay("all"); setCashier("all"); }}>
            {T("مسح", "Clear")}
          </button>
        </div>
      </div>

      {msg && (
        <div className="border border-[#c8a419] bg-[#fff8e1] px-2 py-1 text-[11px] font-bold text-[#7a6100]">{msg}</div>
      )}

      {/* Invoice History table — the action buttons must always be reachable:
          the table keeps a readable min-width and scrolls sideways, and the
          Actions column is pinned to the right edge. */}
      <div className="w-full min-w-0 overflow-x-auto border border-[#888] bg-white">
        <table className={`w-full ${zoomMin} border-collapse ${zoomTx}`}>
          <thead>
            <tr style={{ background: "#2fae4e", color: "#fff" }}>
              <th className={th}>#</th>
              <th className={th}>{T("رقم المستند", "Doc. No.")}</th>
              <th className={th}>{T("النوع", "Type")}</th>
              <th className={th}>{T("التاريخ والوقت", "Date & Time")}</th>
              <th className={th}>{T("العميل (عربي / إنجليزي)", "Client (AR / EN)")}</th>
              <th className={th}>{T("الدفع", "Payment")}</th>
              <th className={th}>{T("الإجمالي", "Total")}</th>
              <th className={th}>{T("الخصم", "Discount")}</th>
              <th className={th}>{T("الضريبة", "VAT")}</th>
              <th className={th}>{T("الإجمالي النهائي", "Grand Total")}</th>
              <th className={th}>{T("المدفوع", "Paid")}</th>
              <th className={th}>{T("الآجل / الرصيد", "Balance / Credit")}</th>
              <th className={th}>{T("أمين الصندوق", "Cashier")}</th>
              <th className={`${th} sticky right-0 z-20 shadow-[-3px_0_5px_rgba(0,0,0,0.12)]`} style={{ background: "#2fae4e" }}>
                {T("إجراءات", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={14} className="py-6 text-center text-[#777]">{T("لا توجد مستندات مطابقة", "No documents match")}</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.key} className={i % 2 ? "bg-[#f7f7f7]" : "bg-white"}>
                <td className={td}>{i + 1}</td>
                <td className={`${td} font-bold`}>{r.no}</td>
                <td className={td}>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: BADGE[r.kind].bg }}>
                    {rtl ? BADGE[r.kind].ar : BADGE[r.kind].en}
                  </span>
                </td>
                <td className={td}>{fmtDate(r.date)}{fmtTime(r.time) ? ` ${fmtTime(r.time)}` : ""}</td>
                <td className={td}>
                  <div>{r.clientAr || r.clientEn || "—"}</div>
                  {r.clientEn && r.clientAr && r.clientEn !== r.clientAr && (
                    <div className="text-[10px] text-[#666]">{r.clientEn}</div>
                  )}
                </td>
                <td className={td}>{payLabel(r.payment)}</td>
                <td className={tdNum}>{money(r.total)}</td>
                <td className={tdNum}>{money(r.discount)}</td>
                <td className={tdNum}>{money(r.vat)}</td>
                <td className={`${tdNum} font-bold`}>{money(r.grand)}</td>
                <td className={tdNum}>{money(r.paid)}</td>
                <td className={tdNum}>{money(r.balance)}</td>
                <td className={td}>{r.cashier || "—"}</td>
                <td className={`${td} sticky right-0 z-10 bg-inherit shadow-[-3px_0_5px_rgba(0,0,0,0.12)]`}>
                  <div className="flex flex-nowrap gap-1">
                    {(r.kind === "sale" || r.kind === "purchase" || r.kind === "quotation" || r.kind === "sale-return") && (
                      <button className={miniBtn} title={T("عرض الفاتورة", "View invoice")} onClick={() => openRow(r)}>👁</button>
                    )}
                    {r.kind === "sale" && (
                      <button className={miniBtn} title={T("تعديل الفاتورة", "Edit invoice")} onClick={() => editRow(r)}>✎ Edit</button>
                    )}
                    {(r.kind === "sale" || r.kind === "purchase" || r.kind === "quotation") && (
                      <button className={miniBtn} disabled={!!busy} title={T("طباعة / PDF", "Print / PDF")} onClick={() => printRow(r, "html")}>PDF</button>
                    )}
                    {(r.kind === "sale" || r.kind === "purchase" || r.kind === "quotation") && (
                      <button className={miniBtn} disabled={!!busy} title={T("تصدير إكسل 0060", "Excel 0060 export")} onClick={() => printRow(r, "xlsx")}>Excel ↓</button>
                    )}
                    {r.kind === "sale" && (
                      <button className={miniBtn} title={T("إنشاء مرتجع بيع", "Create sales return")} onClick={() => startReturn(r)}>↩</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom summary strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-[#1d7a37] px-2 py-1.5 font-bold text-black" style={{ background: "#c8e6c9" }}>
        <span>{T("عدد المستندات", "Documents")}: <b className="tabular-nums">{sum.count}</b></span>
        <span>{T("مجموع الإجمالي", "Σ Grand Total")}: <b className="tabular-nums">{money(sum.grand)}</b></span>
        <span>{T("مجموع المدفوع", "Σ Paid")}: <b className="tabular-nums">{money(sum.paid)}</b></span>
        <span>{T("مجموع الآجل / الرصيد", "Σ Credit Due")}: <b className="tabular-nums">{money(sum.bal)}</b></span>
      </div>
    </div>
  );
}
