import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, FuncKey } from "./ui";
import {
  DOC_TITLES, downloadBlob, printHtml, renderXlsx,
  type DocData, type PrintConfig,
} from "./printEngine";

// SCR-007 — verified against video frames (inv700 + right/bottom zooms):
// yellow total under doc-number box, green grid header, gray panel, right
// toolbar (mode, Q/K/navigate, big F12 checkmark, print checkbox,
// F5 qty / F6 price / F8 del-line / F7 options), green footer inputs,
// dark strip (close, item list, barcode, prices, delete-doc, new F10,
// Excel, print F11, save F9). Modes: sales|purchase|sales-return|
// purchase-return|quotation. All saves hit real MySQL tRPC mutations.
export type TxnKind = "sales" | "purchase" | "sales-return" | "purchase-return" | "quotation";

interface Line { productId?: number; code: string; name: string; unit: string; qty: number; price: number; disc: number; cost: number; serials: string[]; tracked: boolean; }

const TITLES: Record<TxnKind, { ar: string; en: string; color: string }> = {
  sales: { ar: "فاتورة بيع", en: "Sales invoice", color: "#2fae4e" },
  purchase: { ar: "فاتورة شراء", en: "Purchase invoice", color: "#e05242" },
  "sales-return": { ar: "مرتجع بيع", en: "Sales return", color: "#2fae4e" },
  "purchase-return": { ar: "مرتجع شراء", en: "Purchase return", color: "#7b2d4e" },
  quotation: { ar: "عرض سعر", en: "Quotation", color: "#1b9bd7" },
};

const today = () => new Date().toISOString().slice(0, 10);

// F11 settlement: tendered cash -> change calculator. Enter commits.
function SettlementModal({ T, total, tendered, setTendered, onClose, onCommit }: {
  T: (a: string, e: string) => string; total: number; tendered: string;
  setTendered: (v: string) => void; onClose: () => void; onCommit: () => void;
}) {
  const change = (Number(tendered) || 0) - total;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm border border-black bg-white p-3" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 bg-[#2fae4e] px-2 py-1 text-center text-[14px] font-bold text-white">
          {T("صفحة السداد (F11)", "Settlement (F11)")}
        </div>
        <div className="mb-2 border border-[#2fae4e] bg-[#e8f5e9] px-2 py-2 text-center">
          <div className="text-[12px] text-[#555]">{T("إجمالي الفاتورة", "Invoice total")}</div>
          <div className="text-[26px] font-bold tabular-nums">{total.toFixed(2)}</div>
        </div>
        <label className="mb-2 block border border-red-600 bg-[#fff5f5] px-2 py-2 text-center">
          <div className="text-[12px] font-bold text-red-700">{T("المبلغ المستلم من العميل", "Tendered cash")}</div>
          <input
            autoFocus value={tendered} onChange={(e) => setTendered(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCommit(); } }}
            type="number" min="0" className="w-full bg-transparent text-center text-[24px] font-bold outline-none" />
        </label>
        <div className="mb-2 border border-[#1d7a37] bg-[#e8f5e9] px-2 py-2 text-center">
          <div className="text-[12px] text-[#555]">{T("الفكة / الباقي للعميل", "Change due")}</div>
          <div className="text-[26px] font-bold tabular-nums" style={{ color: change < 0 ? "#b71c1c" : "#1b5e20" }}>
            {change.toFixed(2)}
          </div>
        </div>
        <div className="flex justify-between">
          <button className="border border-[#555] bg-[#f5f5f5] px-3 py-1 text-[12px] text-black" onClick={onClose}>
            {T("إلغاء", "Cancel")}
          </button>
          <button className="border border-[#0a5c2a] px-3 py-1 text-[12px] font-bold text-white"
            style={{ background: "#0a5c2a" }} onClick={onCommit}>
            {T("ترحيل (Enter)", "Commit (Enter)")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SahlTxn({ kind }: { kind: TxnKind }) {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = (user as any)?.role ?? "";
  const needsPin = role === "cashier";
  const utils = trpc.useUtils();
  const TT = TITLES[kind];
  const isSales = kind === "sales" || kind === "sales-return" || kind === "quotation";
  const T = (ar: string, en: string) => (rtl ? ar : en);

  const [q, setQ] = useState("");
  const [qty, setQty] = useState(1);
  // 4-step keyboard chain: search -> qty -> price -> add (Enter each step)
  const [qtyInput, setQtyInput] = useState("1");
  const [priceInput, setPriceInput] = useState("");
  const [activeItem, setActiveItem] = useState<any>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  // Payment mode (sales): cash / credit / card + pin default (الدبوس)
  const [payMode, setPayMode] = useState<"cash" | "credit" | "card">(() => {
    try {
      const p = localStorage.getItem("sahl-paymode");
      return p === "credit" || p === "card" ? p : "cash";
    } catch { return "cash"; }
  });
  const pinPay = () => {
    try { localStorage.setItem("sahl-paymode", payMode); } catch { /* ignore */ }
    setMsg(T("تم تثبيت طريقة السداد", "Payment mode pinned"));
  };
  // F11 settlement modal (tendered -> change)
  const [settleOpen, setSettleOpen] = useState(false);
  const [tendered, setTendered] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [sel, setSel] = useState(0);
  const [partyId, setPartyId] = useState("");
  const [partyQ, setPartyQ] = useState("");
  // Customer snapshot details: auto-filled from selected record (2+ letters),
  // editable, sent with the invoice; backend refreshes the saved record and
  // auto-creates walk-in when nothing is selected.
  const [cd, setCd] = useState({ name: "", nameAr: "", phone: "", email: "", address: "", addressAr: "", vat: "", cr: "" });
  const [wh, setWh] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxPct, setTaxPct] = useState(15);
  const [salesman, setSalesman] = useState("");
  const [origId, setOrigId] = useState("");
  const [reason, setReason] = useState("");
  const [docDate, setDocDate] = useState(today());
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [priceListId, setPriceListId] = useState("");
  const [autoPrint, setAutoPrint] = useState(() => {
    try { return localStorage.getItem("sahl-autoPrint") === "1"; } catch { return false; }
  });
  const [showLookup, setShowLookup] = useState(false);
  const [showOpts, setShowOpts] = useState(false);
  const [discPct, setDiscPct] = useState("");
  // In-screen POS settings (yellow box): supermarket auto-add + duplicate rows
  const [autoAdd, setAutoAdd] = useState(() => {
    try { return localStorage.getItem("sahl-autoad") === "1"; } catch { return false; }
  });
  const [allowDup, setAllowDup] = useState(() => {
    try { return localStorage.getItem("sahl-allowdup") !== "0"; } catch { return true; }
  });
  const setAuto = (v: boolean) => {
    setAutoAdd(v);
    try { localStorage.setItem("sahl-autoad", v ? "1" : "0"); } catch { /* ignore */ }
  };
  const setDup = (v: boolean) => {
    setAllowDup(v);
    try { localStorage.setItem("sahl-allowdup", v ? "1" : "0"); } catch { /* ignore */ }
  };
  // Supervisor PIN gate (cashiers): single-action authorization, verified server-side
  const [pinOpen, setPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const pinAction = useRef<(() => void) | null>(null);
  const pinVerify = trpc.sahl.supervisorVerify.useMutation({
    onSuccess: () => {
      setPinOpen(false); setPinInput("");
      const fn = pinAction.current; pinAction.current = null;
      fn?.();
    },
    onError: (e) => setMsg(e.message),
  });
  const gate = (fn: () => void) => {
    if (!needsPin) { fn(); return; }
    pinAction.current = fn;
    setPinInput("");
    setPinOpen(true);
  };
  // Touch mode (large targets) + serial capture modal
  const [touch, setTouch] = useState(() => {
    try { return localStorage.getItem("sahl-touch") === "1"; } catch { return false; }
  });
  const toggleTouch = () => {
    const v = !touch;
    setTouch(v);
    try { localStorage.setItem("sahl-touch", v ? "1" : "0"); } catch { /* ignore */ }
  };
  const [serialOpen, setSerialOpen] = useState(false);
  const [serialInputs, setSerialInputs] = useState<Record<number, string>>({});
  // view mode: loaded read-only invoice via « »
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewNav, setViewNav] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: lookup } = trpc.sahl.lookup.useQuery(
    { q, limit: 8 }, { enabled: q.trim().length > 0 && viewId === null && kind !== "sales-return" });
  const { data: customers } = trpc.sales.customerList.useQuery(isSales && partyQ ? { search: partyQ } : undefined);
  const { data: suppliers } = trpc.purchase.supplierList.useQuery(!isSales && partyQ ? { search: partyQ } : undefined);
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const { data: salesmen } = trpc.sahl.salesmanList.useQuery(undefined, { enabled: kind === "sales" });
  const { data: invoices } = trpc.sales.invoiceList.useQuery(undefined, { enabled: kind === "sales" || kind === "sales-return" });
  const { data: pos } = trpc.purchase.poList.useQuery(undefined, { enabled: kind === "purchase" || kind === "purchase-return" });
  const { data: quotes } = trpc.sales.quotationList.useQuery(undefined, { enabled: kind === "quotation" });
  const { data: credits } = trpc.sales.creditNoteList.useQuery(undefined, { enabled: kind === "sales-return" });
  const { data: company } = trpc.settings.companySettingsGet.useQuery();
  const brandAr = (company as any)?.companyNameAr || (company as any)?.companyName || "سهل";
  const { data: priceLists } = trpc.sahl.priceListList.useQuery(undefined, { enabled: kind === "sales" });
  const { data: viewData } = trpc.sales.invoiceGet.useQuery(
    { id: viewId ?? 0 }, { enabled: kind === "sales" && isViewing });
  const [poViewId, setPoViewId] = useState<number | null>(null);
  const { data: poViewData } = trpc.sahl.poDetail.useQuery(
    { id: poViewId ?? 0 }, { enabled: kind === "purchase" && poViewId !== null });

  const parties: any[] = (isSales ? customers : suppliers) ?? [];
  const pickParty = (id: string) => {
    setPartyId(id);
    const c: any = parties.find((a: any) => String(a.id) === String(id));
    if (c) {
      setPartyQ(c.nameAr || c.name);
      setCd({
        name: c.name ?? "", nameAr: c.nameAr ?? "", phone: c.phone ?? c.mobile ?? "",
        email: c.email ?? "", address: c.address ?? "", addressAr: c.addressAr ?? "",
        vat: c.vatNumber ?? c.taxNumber ?? "", cr: c.crNumber ?? c.commercialRegistration ?? "",
      });
    }
  };

  const resetCd = () => setCd({ name: "", nameAr: "", phone: "", email: "", address: "", addressAr: "", vat: "", cr: "" });
  const history: any[] = kind === "sales" ? invoices ?? [] : kind === "purchase" ? pos ?? [] : kind === "quotation" ? quotes ?? [] : kind === "sales-return" ? credits ?? [] : pos ?? [];
  const results = useMemo(() => (lookup ?? []) as any[], [lookup]);
  const { data: balances } = trpc.inventory.inventoryList.useQuery(
    (kind === "purchase" || kind === "sales") && wh ? { warehouseId: Number(wh) } : undefined,
    { enabled: (kind === "purchase" || kind === "sales") && !!wh });
  const { data: allBalances } = trpc.inventory.inventoryList.useQuery(undefined, { enabled: kind === "sales" });
  const stockFor = (pid: number) =>
    (allBalances ?? []).filter((b: any) => b.productId === pid)
      .reduce((a: number, b: any) => a + Number(b.quantity || 0), 0);

  useEffect(() => {
    setLines([]); setMsg(""); setOrigId(""); setReason(""); setPartyId("");
    setPartyQ(""); setDiscount(0); setDocDate(today()); setViewId(null); setPoViewId(null); setViewNav(0); resetCd();
  }, [kind]);

  const isViewing = viewId !== null || poViewId !== null;
  // Draft persistence per document kind: switching tabs keeps uncommitted lines
  useEffect(() => {
    if (viewId !== null || poViewId !== null) return;
    try {
      const raw = localStorage.getItem(`sahl-draft-${kind}`);
      if (raw && lines.length === 0) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.lines) && d.lines.length) {
          setLines(d.lines);
          setPartyId(d.partyId ?? ""); setPartyQ(d.partyQ ?? "");
          if (d.cd) setCd(d.cd);
          setDiscount(d.discount ?? 0);
          setMsg(T("تمت استعادة مسودة", "Draft restored"));
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      if (viewId === null && poViewId === null) {
        localStorage.setItem(`sahl-draft-${kind}`, JSON.stringify({ lines, partyId, partyQ, cd, discount }));
      }
    } catch { /* ignore */ }
  }, [lines, partyId, partyQ, cd, discount]);
  const loadView = (idx: number) => {
    const h = history[idx];
    if (!h) return;
    setViewNav(idx);
    if (kind === "purchase") { setPoViewId(h.id); setViewId(null); }
    else { setViewId(h.id); setPoViewId(null); }
  };
  useEffect(() => {
    if (!poViewData || poViewId === null) return;
    const po: any = poViewData as any;
    const items: any[] = po.items ?? [];
    setLines(items.map((it: any) => ({
      productId: undefined, code: "", name: it.productName || it.description,
      unit: "", qty: Number(it.quantity || 0), price: Number(it.unitPrice || 0),
      disc: 0, cost: Number(it.unitPrice || 0), serials: [], tracked: false,
    })));
    if (po.supplierId) {
      setPartyId(String(po.supplierId));
      const s: any = (suppliers ?? []).find((x: any) => String(x.id) === String(po.supplierId));
      if (s) setPartyQ(s.nameAr || s.name);
    }
    setDocDate(String(po.date ?? today()).slice(0, 10));
    setMsg(T("وضع العرض — الحفظ معطل", "View mode — saving disabled"));
  }, [poViewData]);
  useEffect(() => {
    if (!viewData || viewId === null) return;
    {
      const inv: any = (viewData as any).invoice;
      const items: any[] = (viewData as any).items ?? [];
      const cust: any = (viewData as any).customer;
      setLines(items.map((it: any) => ({
        productId: it.productId, code: it.sku ?? "", name: it.descriptionAr || it.description,
        unit: it.unit ?? "", qty: Number(it.quantity || 0), price: Number(it.unitPrice || 0), disc: 0,
      })));
      if (cust) {
        setPartyId(String(cust.id)); setPartyQ(cust.nameAr || cust.name);
        setCd({
          name: cust.name ?? "", nameAr: cust.nameAr ?? "",
          phone: cust.phone ?? cust.mobile ?? "", email: cust.email ?? "",
          address: cust.address ?? "", addressAr: cust.addressAr ?? "",
          vat: cust.vatNumber ?? cust.taxNumber ?? "",
          cr: cust.crNumber ?? cust.commercialRegistration ?? "",
        });
      } else if (inv) {
        setPartyId(""); setPartyQ(inv.customerNameAr || inv.customerName || "");
        setCd({
          name: inv.customerName ?? "", nameAr: inv.customerNameAr ?? "",
          phone: inv.customerPhone ?? "", email: inv.customerEmail ?? "",
          address: inv.customerAddress ?? "", addressAr: inv.customerAddressAr ?? "",
          vat: inv.customerVat ?? "", cr: inv.customerCr ?? "",
        });
      }
      setDiscount(Number(inv?.discountAmount || 0));
      setDocDate(String(inv?.date ?? today()).slice(0, 10));
      setMsg(T("وضع العرض — الحفظ معطل", "View mode — saving disabled"));
    }
  }, [viewData]);

  const newDoc = () => {
    setLines([]); setDiscount(0); setOrigId(""); setReason(""); setViewId(null); setPoViewId(null); setMsg("");
    setPartyId(""); setPartyQ(""); resetCd();
  };

  // Step 1 -> 2: pick item, default qty/price, focus qty.
  // Supermarket mode: choosing adds immediately with qty 1 (rescan increments).
  const chooseItem = (p: any) => {
    if (autoAdd && viewId === null && (kind === "sales" || kind === "purchase")) {
      fastAdd(p, 1);
      return;
    }
    setActiveItem(p);
    setQ(p.nameAr || p.name);
    setQtyInput("1");
    setPriceInput("");
    setTimeout(() => { qtyRef.current?.focus(); qtyRef.current?.select(); }, 0);
  };

  const fastAdd = async (p: any, qn: number) => {
    if (!allowDup) {
      const idx = lines.findIndex((l) => l.productId === p.id && l.price === Number(p.salePrice ?? p.purchasePrice ?? 0));
      if (idx >= 0) {
        setLines(lines.map((l, i) => (i === idx ? { ...l, qty: l.qty + qn } : l)));
        setQ("");
        searchRef.current?.focus();
        return;
      }
    }
    let price = Number(p.salePrice ?? p.purchasePrice ?? 0);
    if (priceListId && kind === "sales") {
      try {
        const rows: any = await utils.sahl.priceFor.fetch({ productId: p.id });
        const hit = (rows ?? []).find((r: any) => String(r.id) === String(priceListId));
        if (hit && hit.price !== null && Number(hit.price) >= 0) price = Number(hit.price);
      } catch { /* keep base price */ }
    }
    const autoDisc = Number(p.fixedDiscount ?? 0);
    setLines([...lines, {
      productId: p.id, code: p.sku ?? "", name: p.nameAr || p.name,
      unit: p.unitName ?? "", qty: qn, price, disc: autoDisc > 0 ? autoDisc * qn : 0,
      cost: Number(p.purchasePrice ?? 0),
      serials: [], tracked: !!p.isSerialTracked,
    }]);
    setQ("");
    searchRef.current?.focus();
  };

  // Step 2 -> 3 (Enter in qty) and Step 3 -> add (Enter in price)
  const commitLine = async () => {
    const p = activeItem;
    if (!p || isViewing) return;
    const qn = Number(qtyInput) || 1;
    let price = priceInput.trim() === "" ? Number(p.salePrice ?? p.purchasePrice ?? 0) : Number(priceInput);
    if (priceListId && kind === "sales" && priceInput.trim() === "") {
      try {
        const rows: any = await utils.sahl.priceFor.fetch({ productId: p.id });
        const hit = (rows ?? []).find((r: any) => String(r.id) === String(priceListId));
        if (hit && hit.price !== null && Number(hit.price) >= 0) price = Number(hit.price);
      } catch { /* keep base price */ }
    }
    const floor = Number(p.minPrice ?? 0);
    if (floor > 0 && price < floor) {
      const go = () => {
        const ok = confirm(T(
          `السعر ${price} أقل من أقل سعر بيع ${floor} — متابعة؟`,
          `Price ${price} is below floor ${floor} — continue?`));
        if (!ok) { priceRef.current?.focus(); priceRef.current?.select(); return; }
        pushLine(p, qn, price);
      };
      gate(go);
      return;
    }
    pushLine(p, qn, price);
  };

  const pushLine = (p: any, qn: number, price: number) => {
    const autoDisc = Number(p.fixedDiscount ?? 0);
    setLines([...lines, {
      productId: p.id, code: p.sku ?? "", name: p.nameAr || p.name,
      unit: p.unitName ?? "", qty: qn, price, disc: autoDisc > 0 ? autoDisc * qn : 0,
      cost: Number(p.purchasePrice ?? 0),
      serials: [], tracked: !!p.isSerialTracked,
    }]);
    setQ(""); setQtyInput("1"); setPriceInput(""); setActiveItem(null);
    searchRef.current?.focus();
  };

  const totalCost = lines.reduce((a, l) => a + l.qty * (l.cost || 0), 0);
  const profit = net - totalCost;

  const addLine = async (p: any) => {
    if (isViewing) return;
    chooseItem(p);
  };

  const lineTotal = (l: Line) => l.qty * l.price - (l.disc || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);
  const net = Math.max(0, subtotal - Number(discount));
  const taxAmt = net * (Number(taxPct) || 0) / 100;
  const grand = net + taxAmt;
  const origDoc: any = kind.endsWith("return") ? history.find((h: any) => String(h.id) === String(origId)) : null;
  const origTotal = origDoc ? Number(origDoc.totalAmount ?? origDoc.total ?? 0) : 0;
  const returnAmount = lines.length ? net : origTotal;

  const moveRow = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= lines.length || isViewing) return;
    const next = [...lines];
    [next[i], next[j]] = [next[j], next[i]];
    setLines(next);
    setSel(j);
  };

  const editQty = () => {
    if (isViewing) return;
    const v = prompt(T("تعديل الكمية (F5)", "Edit qty (F5)"));
    if (v && Number(v) > 0) setLines(lines.map((l, i) => (i === sel ? { ...l, qty: Number(v) } : l)));
  };
  const editPrice = () => {
    if (isViewing) return;
    const v = prompt(T("تعديل السعر (F6)", "Edit price (F6)"));
    if (v && Number(v) >= 0) setLines(lines.map((l, i) => (i === sel ? { ...l, price: Number(v) } : l)));
  };
  const delLine = () => { if (viewId === null) gate(() => setLines(lines.filter((_, i) => i !== sel))); };
  const moreOpts = () => setShowOpts((s) => !s);
  const applyLineDisc = () => {
    gate(() => {
      const v = prompt(T("خصم السطر المحدد", "Selected line discount"));
      if (v && Number(v) >= 0) setLines(lines.map((l, i) => (i === sel ? { ...l, disc: Number(v) } : l)));
      setShowOpts(false);
    });
  };

  const invCreate = trpc.sales.invoiceCreate.useMutation();
  const invDelete = trpc.sales.invoiceDelete.useMutation();
  const payCreate = trpc.sales.paymentCreate.useMutation();
  const prodUpdate = trpc.inventory.productUpdate.useMutation();
  const poCreate = trpc.purchase.poCreate.useMutation();
  const grnCreate = trpc.purchase.grnCreate.useMutation();
  const creditCreate = trpc.sales.creditNoteCreate.useMutation();
  const quoteCreate = trpc.sales.quotationCreate.useMutation();
  const adjustCreate = trpc.inventory.adjustmentCreate.useMutation();
  const serialIssueM = trpc.sahl.serialIssue.useMutation();
  const serialReceiveM = trpc.sahl.serialReceive.useMutation();

  const refreshAll = () => {
    utils.sales.invoiceList.invalidate();
    utils.sales.quotationList.invalidate();
    utils.sales.creditNoteList.invalidate();
    utils.purchase.poList.invalidate();
    utils.inventory.inventoryList.invalidate();
    utils.inventory.movementList.invalidate();
  };

  const doPrint = () => setPrintOpen(true);
  const [printOpen, setPrintOpen] = useState(false);
  const [printTpl, setPrintTpl] = useState("");
  const { data: themesQ } = trpc.invoiceTheme.list.useQuery();
  const myTpls: any[] = (Array.isArray(themesQ) ? themesQ : [])
    .filter((t: any) => t.config?.kind === "sahl-xlsx");

  const docTypeFor = (): "sale" | "quotation" | "purchase" | "sales-return" =>
    kind === "sales" ? "sale" : kind === "quotation" ? "quotation"
    : kind === "purchase" ? "purchase" : "sales-return";

  const buildDoc = (): DocData => {
    if (isViewing && viewData) {
      const inv: any = (viewData as any).invoice;
      const items: any[] = (viewData as any).items ?? [];
      const cust: any = (viewData as any).customer;
      return {
        no: inv?.invoiceNumber ?? `#${viewId}`,
        date: String(inv?.date ?? docDate).slice(0, 10),
        party: cust?.nameAr || cust?.name || inv?.customerName || cd.name,
        partyTax: cust?.vatNumber ?? cust?.taxNumber ?? cd.vat,
        partyPhone: cust?.phone ?? cd.phone,
        branch: "",
        lines: items.map((it: any) => ({
          code: it.sku ?? "", name: it.descriptionAr || it.description,
          unit: it.unit ?? "", qty: Number(it.quantity || 0),
          price: Number(it.unitPrice || 0), disc: 0,
          total: Number(it.totalAmount || 0),
        })),
        subtotal: Number(inv?.subTotal || subtotal),
        discount: Number(inv?.discountAmount || discount),
        tax: Number(inv?.taxAmount || taxAmt),
        net: Number(inv?.totalAmount || grand),
        notes: inv?.notes ?? reason ?? undefined,
        qrText: inv?.zatcaQrCode || inv?.invoiceNumber,
      };
    }
    return {
      no: `INV-${Date.now()}`, date: docDate,
      party: cd.name || parties.find((a: any) => String(a.id) === String(partyId))?.name || "",
      partyTax: cd.vat, partyPhone: cd.phone, branch: "",
      lines: lines.map((l) => ({
        code: l.code, name: l.name, unit: l.unit, qty: l.qty,
        price: l.price, disc: l.disc || 0, total: lineTotal(l),
      })),
      subtotal, discount: Number(discount), tax: taxAmt, net: grand,
      notes: reason || undefined, qrText: undefined,
    };
  };

  const tplConfig = (): PrintConfig | null => {
    const t = myTpls.find((x: any) => String(x.id) === String(printTpl) || x.themeKey === printTpl);
    if (t?.config) return { ...(t.config as PrintConfig), docType: docTypeFor() };
    return null;
  };

  const printDoc = async (mode: "html" | "xlsx" | "both") => {
    const d = buildDoc();
    const comp: any = company ?? {};
    const cfg = tplConfig();
    const [tar, ten] = DOC_TITLES[docTypeFor()];
    const body =
      `<h1>${cfg?.titleAr ?? tar} — ${d.no}</h1>` +
      `<p>${d.date} · ${d.party ?? ""} · ${d.partyPhone ?? ""}</p>` +
      `<table><tr>${["الكود", "الصنف", "الكمية", "السعر", "الإجمالي"].map((c) => `<th>${c}</th>`).join("")}</tr>` +
      d.lines.map((l) => `<tr><td>${l.code ?? ""}</td><td>${l.name}</td><td>${l.qty}</td><td>${l.price}</td><td>${l.total.toFixed(2)}</td></tr>`).join("") +
      `</table><div class="tot">الصافي: ${d.net.toFixed(2)}</div>`;
    if (mode === "html" || mode === "both") printHtml(`${tar}-${d.no}`, body);
    if (mode === "xlsx" || mode === "both") {
      const mkCfg = (paper: "A4" | "thermal80", narrow: boolean): PrintConfig => {
        const base: PrintConfig = cfg ?? {
          kind: "sahl-xlsx", docType: docTypeFor(), paper: "A4",
          titleAr: tar, titleEn: ten, headerLines: ["", "", ""],
          showSignatures: true, showTax: true,
          columns: [
            { key: "code", ar: "الكود", en: "Code", visible: true },
            { key: "name", ar: "الصنف", en: "Item", visible: true },
            { key: "qty", ar: "الكمية", en: "Qty", visible: true },
            { key: "price", ar: "السعر", en: "Price", visible: true },
            { key: "total", ar: "الإجمالي", en: "Total", visible: true },
          ],
          footerText: "", accent: "#2fae4e",
        };
        if (!narrow) return { ...base, paper };
        return {
          ...base, paper,
          showSignatures: false,
          columns: base.columns.map((c) => ({
            ...c, visible: ["name", "qty", "price", "total"].includes(c.key),
          })),
        };
      };
      const full = mkCfg("A4", false);
      const blob = await renderXlsx(full, d, { nameAr: comp.companyNameAr, name: comp.companyName });
      downloadBlob(blob, `${d.no}.xlsx`);
      if (mode === "both") {
        const therm = await renderXlsx(mkCfg("thermal80", true), d, { nameAr: comp.companyNameAr, name: comp.companyName });
        downloadBlob(therm, `${d.no}-thermal.xlsx`);
      }
    }
    setPrintOpen(false);
  };

  const exportExcel = () => {
    const rows = [
      ["#", T("الكود", "Code"), T("الصنف", "Item"), T("الكمية", "Qty"), T("السعر", "Price"), T("الإجمالي", "Total")],
      ...lines.map((l, i) => [i + 1, l.code, l.name, l.qty, l.price, lineTotal(l).toFixed(2)]),
      ["", "", "", "", T("الصافي", "Net"), grand.toFixed(2)],
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `${kind}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const salesmanSuffix = () => {
    if (kind !== "sales" || !salesman) return undefined;
    const s: any = (salesmen ?? []).find((x: any) => String(x.id) === String(salesman));
    return s ? `${T("مندوب", "Salesman")}: ${s.nameAr || s.name}` : undefined;
  };

  const save = async (andPrint: boolean, andNew: boolean) => {
    setMsg("");
    if (isViewing) { setMsg(T("وضع العرض — أنشئ مستنداً جديداً", "View mode — create a new document")); return; }
    if (saving) { setMsg(T("جاري الحفظ — تم منع التكرار", "Saving — duplicate blocked")); return; }
    if (!lines.length && kind !== "sales-return") { setMsg(T("أضف سطراً واحداً على الأقل", "Add at least one line")); return; }
    // Sales works WITHOUT a selected customer: backend resolves walk-in or
    // auto-creates from the typed snapshot (autofill next time).
    if ((kind === "quotation" || kind === "sales-return") && !partyId) {
      setMsg(T("اختر العميل", "Select customer")); return;
    }
    if ((kind === "purchase" || kind === "purchase-return") && !partyId) {
      setMsg(T("اختر المورد", "Select supplier")); return;
    }
    // Sales return works WITH original (linked credit note) or WITHOUT
    // (freestanding/direct return, مرتجع مباشر — backend stores invoiceId 0).
    if (kind === "purchase-return" && !origId) { setMsg(T("اختر المستند الأصلي", "Select original document")); return; }
    if (kind === "sales-return" && returnAmount <= 0) {
      setMsg(T("لا يوجد مبلغ للمرتجع", "Nothing to return")); return;
    }
    if ((kind === "purchase" || kind === "purchase-return") && !wh) {
      setMsg(T("اختر المخزن", "Select warehouse")); return;
    }
    // Tracked products require serials == qty before posting
    if (kind === "sales" || kind === "purchase") {
      const missing = lines.filter((l) => l.tracked && (l.serials ?? []).length !== l.qty);
      if (missing.length) {
        const prefill: Record<number, string> = {};
        lines.forEach((l, i) => { if (l.tracked) prefill[i] = (l.serials ?? []).join("\n"); });
        setSerialInputs(prefill);
        setSerialOpen(true);
        setMsg(T("أدخل أرقام السيريال للأصناف المتتبعة", "Enter serials for tracked items"));
        return;
      }
    }
    setSaving(true);
    try {
      const stamp = Date.now();
      const note = [reason || undefined, salesmanSuffix()].filter(Boolean).join(" — ") || undefined;
      if (kind === "sales") {
        const custName = cd.name.trim() || parties.find((a: any) => String(a.id) === String(partyId))?.name;
        const inv = await invCreate.mutateAsync({
          invoiceNumber: `INV-${stamp}`,
          ...(partyId ? { customerId: Number(partyId) } : {}),
          date: docDate,
          subTotal: String(subtotal), discountAmount: String(discount),
          taxPercent: String(taxPct), taxAmount: taxAmt.toFixed(2),
          totalAmount: String(grand), notes: note,
          paymentType: payMode === "card" ? "card" : payMode === "credit" ? "credit" : "cash",
          customerName: custName || undefined,
          customerNameAr: cd.nameAr.trim() || undefined,
          customerPhone: cd.phone.trim() || undefined,
          customerEmail: cd.email.trim() || undefined,
          customerAddress: cd.address.trim() || undefined,
          customerAddressAr: cd.addressAr.trim() || undefined,
          customerVat: cd.vat.trim() || undefined,
          customerCr: cd.cr.trim() || undefined,
          items: lines.map((l) => ({
            productId: l.productId, description: l.name, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(lineTotal(l)),
          })),
        });
        setMsg(`${T("تم حفظ الفاتورة", "Invoice saved")} — INV-${stamp}`);
        // Issue serials for tracked lines
        try {
          for (const l of lines.filter((x) => x.tracked && (x.serials ?? []).length)) {
            await serialIssueM.mutateAsync({
              productId: l.productId!, serials: l.serials,
              invoiceId: (inv as any)?.id, customerId: partyId ? Number(partyId) : undefined,
            });
          }
        } catch (e: any) {
          setMsg(`${T("حُفظت الفاتورة وفشل السيريال", "Invoice saved, serials failed")}: ${e.message ?? e}`);
        }
        // Credit invoice down-payment prompt (هل دفع العميل دفعة؟)
        if (payMode === "credit" && partyId) {
          const v = prompt(T(
            `الإجمالي ${grand.toFixed(2)} — هل دفع العميل دفعة الآن؟ أدخل المبلغ (فارغ = لا)`,
            `Total ${grand.toFixed(2)} — did the customer pay a down payment? Enter amount (empty = no)`));
          const dp = Number(v);
          if (v && dp > 0) {
            try {
              await payCreate.mutateAsync({
                paymentNumber: `PAY-${stamp}`, customerId: Number(partyId),
                invoiceId: (inv as any)?.id, date: docDate, amount: String(Math.min(dp, grand)),
                paymentMethod: "cash", notes: `INV-${stamp}`,
              });
              setMsg(`${T("تم حفظ الفاتورة والدفعة", "Invoice + down payment saved")} — INV-${stamp}`);
            } catch (e: any) {
              setMsg(`${T("حُفظت الفاتورة وفشلت الدفعة", "Invoice saved, payment failed")}: ${e.message ?? e}`);
            }
          }
        }
      } else if (kind === "quotation") {
        await quoteCreate.mutateAsync({
          quotationNumber: `Q-${stamp}`, customerId: Number(partyId), date: docDate,
          subTotal: String(subtotal), totalAmount: String(net), notes: note,
          items: lines.map((l) => ({
            productId: l.productId, description: l.name, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(lineTotal(l)),
          })),
        });
        setMsg(`${T("تم حفظ العرض", "Quotation saved")} — Q-${stamp}`);
      } else if (kind === "purchase") {
        const po = await poCreate.mutateAsync({
          poNumber: `PO-${stamp}`, supplierId: Number(partyId), date: docDate,
          subTotal: String(subtotal), taxAmount: taxAmt.toFixed(2), totalAmount: String(grand), notes: note,
          items: lines.map((l) => ({
            productId: l.productId, description: l.name, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(lineTotal(l)),
          })),
        });
        await grnCreate.mutateAsync({
          grnNumber: `GRN-${stamp}`, poId: po.id, supplierId: Number(partyId),
          warehouseId: Number(wh), date: docDate,
          items: lines.map((l) => ({
            productId: l.productId!, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(lineTotal(l)),
          })),
        });
        // Weighted-average cost update per product (client-side WAC):
        // newAvg = (curQty*curCost + qty*price) / (curQty+qty)
        try {
          const bals: any = await utils.inventory.inventoryList.fetch({ warehouseId: Number(wh) });
          for (const l of lines) {
            if (!l.productId) continue;
            const cur = (bals ?? []).filter((x: any) => x.productId === l.productId)
              .reduce((a: number, x: any) => a + Number(x.quantity || 0), 0);
            const prod: any = await utils.inventory.productGet.fetch({ id: l.productId });
            const curCost = Number(prod?.product?.purchasePrice ?? l.price);
            const denom = cur + l.qty;
            if (denom > 0) {
              const avg = (cur * curCost + l.qty * l.price) / denom;
              await prodUpdate.mutateAsync({ id: l.productId, purchasePrice: String(avg) });
            }
          }
        } catch { /* stock posted by GRN; cost avg best-effort */ }
        setMsg(`${T("تم حفظ أمر الشراء والاستلام", "PO + GRN saved")} — PO-${stamp}`);
        try {
          for (const l of lines.filter((x) => x.tracked && (x.serials ?? []).length)) {
            await serialReceiveM.mutateAsync({
              productId: l.productId!, serials: l.serials, purchaseRef: `GRN-${stamp}`,
            });
          }
        } catch (e: any) {
          setMsg(`${T("حُفظ الاستلام وفشل السيريال", "GRN saved, serials failed")}: ${e.message ?? e}`);
        }
        if (confirm(T(
          "هل تريد طباعة ملصقات الباركود لهذه البضاعة؟",
          "Print barcode labels for these goods?"))) {
          navigate("/app/construction/sahl/vault/labels");
        }
      } else if (kind === "sales-return") {
        const c = await creditCreate.mutateAsync({
          creditNoteNumber: `CN-${stamp}`, customerId: Number(partyId),
          ...(origId ? { invoiceId: Number(origId) } : {}),
          date: docDate, amount: String(returnAmount),
          reason: note,
        });
        setMsg(`${T("تم حفظ المرتجع", "Return saved")} — ${c.id}`);
      } else {
        const bals: any[] = [];
        try {
          const b: any = await utils.inventory.inventoryList.fetch({ warehouseId: Number(wh) });
          bals.push(...(b ?? []));
        } catch { /* proceed without */ }
        const items = lines.map((l) => {
          const cur = bals.filter((x: any) => x.productId === l.productId)
            .reduce((a: number, x: any) => a + Number(x.quantity || 0), 0);
          return { productId: l.productId!, quantity: Math.max(0, cur - l.qty), unitCost: String(l.price) };
        });
        await adjustCreate.mutateAsync({
          adjustmentDate: docDate, adjustmentType: "subtraction",
          reason: `${T("مرتجع شراء", "Purchase return")} PO#${origId}${reason ? " — " + reason : ""}`,
          warehouseId: Number(wh), items,
        } as any);
        setMsg(T("تم ترحيل مرتجع الشراء", "Purchase return posted"));
      }
      if (andPrint || autoPrint) doPrint();
      if (andNew) newDoc(); else refreshAll();
      if (andNew) refreshAll();
    } catch (e: any) {
      setMsg(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async () => {
    if (kind !== "sales" || viewId === null) { newDoc(); return; }
    if (!confirm(T("حذف الفاتورة المعروضة؟", "Delete viewed invoice?"))) return;
    try {
      await invDelete.mutateAsync({ id: viewId });
      setMsg(T("تم الحذف", "Deleted"));
      newDoc();
      refreshAll();
    } catch (e: any) {
      setMsg(e.message ?? String(e));
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "F5") { e.preventDefault(); editQty(); }
      else if (e.key === "F6") { e.preventDefault(); editPrice(); }
      else if (e.key === "F7") { e.preventDefault(); moreOpts(); }
      else if (e.key === "F8") { e.preventDefault(); delLine(); }
      else if (e.key === "F9") { e.preventDefault(); save(false, false); }
      else if (e.key === "F10") { e.preventDefault(); newDoc(); }
      else if (e.key === "F11") { e.preventDefault(); setTendered(""); setSettleOpen(true); }
      else if (e.key === "F12") { e.preventDefault(); save(true, true); }
      else if (e.key === "F2") { e.preventDefault(); navigate("/app/construction/sahl/vault/archive"); }
      else if (e.key === "Escape") { if (settleOpen) setSettleOpen(false); else newDoc(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  return (
    <div className={`flex min-h-full text-black ${touch ? "text-[15px]" : "text-[12px]"}`}>
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#bbb] p-1.5">
          <div className="border border-[#2f7a3d] p-1 text-center" style={{ background: "#2fae4e", color: "#fff" }}>
            <div className="font-mono text-[13px] font-bold">#{history.length + 1}</div>
            <div className="text-[10px]">{docDate}</div>
            <div className="mt-0.5 px-2 py-0.5 font-bold text-black tabular-nums" style={{ background: "#ffeb3b" }}>
              {grand.toFixed(2)}
            </div>
          </div>
          <label>{T("التاريخ", "Date")}
            <input type="date" className={inputCls} value={docDate} onChange={(e) => setDocDate(e.target.value)} disabled={isViewing} />
          </label>
          <span className="border px-1">{T("الأصناف", "Lines")}: {lines.length}</span>
          <span className="border px-1">{T("الكمية", "Qty")}: {lines.reduce((a, l) => a + Number(l.qty), 0)}</span>
          <label>{isSales ? T("العميل", "Customer") : T("المورد", "Supplier")}
            <span className="flex gap-1">
              <input value={partyQ} onChange={(e) => { setPartyQ(e.target.value); if (kind === "sales" && e.target.value.length >= 2 && !partyId) setCd((c) => ({ ...c, name: c.name || e.target.value })); }}
                placeholder={T("بحث (حرفان للتعبئة)", "Search (2 letters)")} className={`${inputCls} w-[110px]`} disabled={isViewing} />
              <select className={`${inputCls} w-[130px]`} value={partyId} onChange={(e) => pickParty(e.target.value)} disabled={isViewing}>
                <option value="">—</option>
                {parties.map((a: any) => <option key={a.id} value={a.id}>{a.nameAr || a.name}</option>)}
              </select>
            </span>
          </label>
          {kind === "sales" && (
            <label>{T("قائمة الأسعار", "Price list")}
              <select className={`${inputCls} w-[110px]`} value={priceListId} onChange={(e) => setPriceListId(e.target.value)} disabled={isViewing}>
                <option value="">{T("الأساسي", "Base")}</option>
                {((priceLists ?? []) as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.nameAr || l.name}</option>)}
              </select>
            </label>
          )}
          {(kind === "purchase" || kind === "purchase-return") && (
            <label>{T("المخزن", "Warehouse")}
              <select className={inputCls} value={wh} onChange={(e) => setWh(e.target.value)} disabled={isViewing}>
                <option value="">—</option>
                {(warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </label>
          )}
          {kind.endsWith("return") && (
            <label>{T("الأصلي", "Original")}
              <select className={`${inputCls} w-[120px]`} value={origId} onChange={(e) => setOrigId(e.target.value)} disabled={isViewing}>
                <option value="">—</option>
                {history.map((hh: any) => (
                  <option key={hh.id} value={hh.id}>{hh.invoiceNumber ?? hh.poNumber ?? hh.creditNoteNumber ?? hh.id}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {kind === "sales" && viewId === null && (
          <details className="border-b border-[#bbb] bg-[#f7f7f7] px-1.5 py-1" open={!!partyId}>
            <summary className="cursor-pointer text-[11px] text-[#555]">
              {T("بيانات العميل (تُعبأ تلقائياً — قابلة للتعديل)", "Customer details (auto-filled — editable)")}
            </summary>
            <div className="grid grid-cols-2 gap-1 py-1 lg:grid-cols-4">
              {([
                ["name", T("الاسم", "Name")], ["nameAr", T("عربي", "Arabic")],
                ["phone", T("الهاتف", "Phone")], ["email", T("البريد", "Email")],
                ["address", T("العنوان", "Address")], ["addressAr", T("عنوان عربي", "Addr AR")],
                ["vat", T("الضريبي", "VAT")], ["cr", T("السجل", "CR")],
              ] as [string, string][]).map(([k, lbl]) => (
                <label key={k} className="flex items-center gap-1 text-[11px]">{lbl}
                  <input className={inputCls} value={(cd as any)[k]} onChange={(e) => setCd({ ...cd, [k]: e.target.value })} />
                </label>
              ))}
            </div>
          </details>
        )}

        {viewId === null && kind !== "sales-return" && (
          <div className="relative flex flex-wrap items-end gap-1 border-b border-[#bbb] p-1.5">
            <label className="flex min-w-[180px] flex-1 flex-col">{T("1. ابحث عن الصنف", "1. Find item")}
              <input ref={searchRef} value={q}
                onChange={(e) => { setQ(e.target.value); setActiveItem(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (results.length === 1) chooseItem(results[0]);
                    else if (results.length > 1) chooseItem(results[0]);
                    else qtyRef.current?.focus();
                  }
                }}
                placeholder={T("باركود / كود / اسم — Enter", "Barcode / code / name — Enter")} className={inputCls} />
            </label>
            <label className="flex w-[80px] flex-col">{T("2. الكمية", "2. Qty")}
              <input ref={qtyRef} value={qtyInput} onChange={(e) => setQtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); priceRef.current?.focus(); priceRef.current?.select(); }
                }}
                className={`${inputCls} text-center font-bold`} />
            </label>
            <label className="flex w-[100px] flex-col">{T("3. السعر", "3. Price")}
              <input ref={priceRef} value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitLine(); } }}
                placeholder={activeItem ? String(Number(activeItem.salePrice ?? activeItem.purchasePrice ?? 0)) : ""}
                className={`${inputCls} text-center font-bold`} />
            </label>
            <button className={btnCls} onClick={commitLine}>{T("4. أضف", "4. Add")}</button>
            <label className="flex items-center gap-1 border border-yellow-600 bg-[#fff8e1] px-1 py-0.5 text-[11px] text-black" title={T("إعدادات", "Settings")}>
              ⚙
              <input type="checkbox" checked={autoAdd} onChange={(e) => setAuto(e.target.checked)} />
              {T("إضافة تلقائية", "Auto-add")}
              <input type="checkbox" checked={allowDup} onChange={(e) => setDup(e.target.checked)} />
              {T("تكرار الصنف", "Dup rows")}
            </label>
            {results.length > 0 && !activeItem && (
              <div className="absolute start-0 top-full z-10 w-[340px] border border-black bg-white">
                {results.map((p: any) => (
                  <div key={p.id} onClick={() => chooseItem(p)}
                    className="flex cursor-pointer justify-between px-2 py-1 hover:bg-[#e8f5e9]">
                    <span>{p.barcode ?? p.code ?? p.sku} — {p.nameAr || p.name}</span>
                    <b>{Number(p.salePrice ?? 0)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {(kind === "sales-return" || kind === "purchase-return") && (
          <div className="flex gap-1 border-b border-[#bbb] p-1.5">
            <input value={reason} onChange={(e) => setReason(e.target.value)} disabled={isViewing}
              placeholder={kind === "sales-return" ? T("سبب المرتجع", "Return reason") : T("ملاحظة المرتجع", "Return note")}
              className={`${inputCls} flex-1`} />
            {kind === "sales-return" && origDoc && (
              <span className="border px-1">{T("الأصلية", "Original")}: {Number(origTotal).toFixed(2)}</span>
            )}
          </div>
        )}

        <div className="min-h-[140px] flex-1 overflow-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr style={{ background: "#2fae4e", color: "#fff" }}>
                {[
                  "#",
                  T("رقم الصنف", "Code"), T("اسم الصنف", "Item"), T("الوحدة", "Unit"),
                  ...(kind === "sales" ? [T("المتاح", "Avail")] : []),
                  T("الكمية", "Qty"), T("السعر", "Price"), T("الخصم", "Disc"), T("الإجمالي", "Total"),
                  T("إجراءات", "Actions"),
                ].map((c, i) => (
                  <th key={i} className="border border-[#1d7a37] px-1 py-1 font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={10} className="py-6 text-center text-[#888]">
                  {isViewing ? T("عرض", "Viewing") : kind === "sales-return"
                    ? T("مرتجع مرتبط أو مباشر — احفظ", "Linked or direct return — save")
                    : T("فاتورة فارغة — ابحث وأضف صنفاً", "Empty — search and add items")}
                </td></tr>
              ) : lines.map((l, i) => (
                <tr key={i} onClick={() => setSel(i)} className="cursor-pointer"
                  style={i === sel ? { background: "#a5d6a7" } : undefined}>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{i + 1}</td>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{l.code}</td>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{l.name}</td>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{l.unit}</td>
                  {kind === "sales" && (
                    <td className="border border-[#ccc] px-1 py-0.5 text-center font-bold tabular-nums"
                      style={{ color: stockFor(l.productId ?? 0) - l.qty < 0 ? "#b71c1c" : "#1b5e20" }}>
                      {stockFor(l.productId ?? 0) - l.qty}
                    </td>
                  )}
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{l.qty}</td>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{l.price}</td>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{l.disc || 0}</td>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center">{lineTotal(l).toFixed(2)}</td>
                  <td className="border border-[#ccc] px-1 py-0.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <span className="flex items-center justify-center gap-0.5">
                      <button className="border border-[#999] bg-white px-1" title={T("أعلى", "Up")}
                        onClick={() => moveRow(i, -1)}>▲</button>
                      <button className="border border-[#999] bg-white px-1" title={T("أسفل", "Down")}
                        onClick={() => moveRow(i, 1)}>▼</button>
                      <button className="border border-[#999] bg-white px-1 text-red-700" title={T("حذف", "Delete")}
                        onClick={() => { setSel(i); setLines(lines.filter((_, j) => j !== i)); }}>✕</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-[#bbb] bg-[#e0e0e0] p-1 text-[11px] text-[#555]">
            {isViewing
              ? T("وضع العرض — الحفظ معطل، الطباعة والحذف متاحان حسب الصلاحية", "View mode — save disabled; print/delete per permission")
              : T("ملاحظة: الحفظ يرحّل المخزون والحسابات", "Note: saving posts stock and accounts")}
            {" · "}{T("الأرشيف", "Archive")}: {history.length}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1.5 text-white" style={{ background: "#1d7a37" }}>
          {kind === "sales" && (
            <span className="flex items-center gap-1 border border-white/40 px-1 py-0.5">
              {(["cash", "credit", "card"] as const).map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-0.5 text-[12px]">
                  <input type="radio" checked={payMode === m} onChange={() => setPayMode(m)} disabled={isViewing} />
                  {m === "cash" ? T("نقدي", "Cash") : m === "credit" ? T("آجل", "Credit") : T("شبكة", "Card")}
                </label>
              ))}
              <button title={T("تثبيت طريقة السداد (الدبوس)", "Pin payment mode")} onClick={pinPay}
                className="px-1 text-[14px]" style={{ color: "#ffeb3b" }}>📌</button>
            </span>
          )}
          {kind === "sales" && (
            <label>{T("المندوب", "Rep")}
              <select className="px-1 text-black" value={salesman} onChange={(e) => setSalesman(e.target.value)} disabled={isViewing}>
                <option value="">—</option>
                {(salesmen ?? []).filter((s: any) => s.isActive).map((s: any) => <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>)}
              </select>
            </label>
          )}
          {kind !== "sales-return" && (
            <label>{T("الخصم", "Discount")}
              <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-[70px] px-1 text-black" disabled={isViewing} />
            </label>
          )}
          {(kind === "sales" || kind === "purchase") && (
            <label>{T("الضريبة %", "Tax %")}
              <input type="number" min="0" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))}
                className="w-[60px] px-1 text-black" disabled={isViewing} />
            </label>
          )}
          <b>{T("الصافي", "Net")}: {grand.toFixed(2)}</b>
          {kind === "sales" && (
            <span className="border border-white/40 px-1" title={T("مكسب الفاتورة = الصافي − التكلفة", "Invoice profit = net − COGS")}>
              {T("مكسب", "Profit")}: <b className="tabular-nums">{profit.toFixed(2)}</b>
            </span>
          )}
          <button className={btnCls} onClick={() => save(false, false)} disabled={saving || isViewing}>{T("حفظ (F9)", "Save (F9)")}</button>
          <button className={btnCls} onClick={() => setSettleOpen(true)} disabled={!lines.length}>{T("سداد (F11)", "Settle (F11)")}</button>
          <button className={btnCls} onClick={doPrint}>{T("طباعة", "Print")}</button>
          <button className={btnCls} onClick={newDoc}>{T("جديد (F10)", "New (F10)")}</button>
          {msg && <span className="bg-white px-1 text-black">{msg}</span>}
        </div>

        {settleOpen && (
          <SettlementModal
            T={T} total={grand} tendered={tendered} setTendered={setTendered}
            onClose={() => setSettleOpen(false)}
            onCommit={() => { setSettleOpen(false); save(autoPrint, true); }}
          />
        )}

        <div className="flex flex-wrap items-center gap-1 bg-[#222] px-1.5 py-1 text-[11px] text-white">
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => navigate("/app/construction")}>{T("إغلاق", "Close")}</button>
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => setShowLookup(true)}>{T("قائمة الأصناف", "Item list")}</button>
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => searchRef.current?.focus()}>{T("شاشة الباركود", "Barcode")}</button>
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => navigate("/app/construction/sahl/prices")}>{T("تعديل الأسعار", "Edit prices")}</button>
          {kind === "sales" && <button className="border border-[#555] bg-[#5c1010] px-2 py-1 hover:bg-[#722]" onClick={deleteDoc}>{T("حذف الفاتورة", "Delete invoice")}</button>}
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={exportExcel}>Excel</button>
          <button className="border border-[#555] px-2 py-1 hover:bg-[#444]" style={{ background: touch ? "#2fae4e" : "#333" }} onClick={toggleTouch} title={T("وضع اللمس", "Touch mode")}>👆</button>
        </div>
      </div>

      <div className="flex w-[132px] shrink-0 flex-col gap-1 border-s border-[#888] bg-[#f7f7f7] p-1">
        <div className="py-1 text-center text-[13px] font-bold text-white" style={{ background: TT.color }}>
          {brandAr}
        </div>
        <div className="py-0.5 text-center text-[12px] font-bold text-white" style={{ background: TT.color }}>
          {kind === "sales" ? T("بيع", "Sale") : kind === "purchase" ? T("شراء", "Purchase") : rtl ? TT.ar : TT.en}
        </div>
        <div className="flex gap-1">
          <button className="flex-1 border border-[#888] bg-white py-0.5" title={T("بحث", "Search")} onClick={() => searchRef.current?.focus()}>Q</button>
          <button className="flex-1 border border-[#888] bg-white py-0.5" title={T("باركود", "Barcode")} onClick={() => searchRef.current?.focus()}>K</button>
          <button className="flex-1 border border-[#888] bg-white py-0.5" title={T("السابق", "Previous")}
            onClick={() => (kind === "sales" || kind === "purchase") && history.length && loadView((viewNav - 1 + history.length) % history.length)}>«</button>
          <button className="flex-1 border border-[#888] bg-white py-0.5" title={T("التالي", "Next")}
            onClick={() => (kind === "sales" || kind === "purchase") && history.length && loadView((viewNav + 1) % history.length)}>»</button>
        </div>
        <button className="bg-[#0d47a1] py-2 text-[26px] text-white" onClick={() => save(true, true)} title={T("حفظ | طباعة | جديد (F12)", "Save | print | new (F12)")}>✓</button>
        <div className="text-center text-[10px] font-bold">{T("حفظ | طباعة | جديد", "Save | print | new")} F12</div>
        <label className="flex items-center gap-1 text-[11px]">
          <input type="checkbox" checked={autoPrint} onChange={(e) => setAutoPrint(e.target.checked)} />
          {T("طباعة الفاتورة", "Print invoice")}
        </label>
        <div className="flex flex-col gap-1 border-t border-[#bbb] pt-1">
          <FuncKey k="F5" label={T("تعديل الكمية", "Edit qty")} onClick={editQty} color="#1d7a37" />
          <FuncKey k="F6" label={T("تعديل السعر", "Edit price")} onClick={editPrice} color="#455a64" />
          <FuncKey k="F8" label={T("حذف الصنف", "Delete item")} onClick={delLine} color="#6a1b9a" />
          <FuncKey k="F7" label={T("خيارات أخرى", "More options")} onClick={moreOpts} color="#00838f" />
          <FuncKey k="F9" label={T("حفظ", "Save")} onClick={() => save(false, false)} color="#2fae4e" />
          <FuncKey k="F10" label={T("جديد", "New")} onClick={newDoc} color="#546e7a" />
          <FuncKey k="F11" label={T("سداد", "Settle")} onClick={() => { setTendered(""); setSettleOpen(true); }} color="#1565c0" />
          <FuncKey k="F12" label={T("حفظ+طباعة", "Save+print")} onClick={() => save(true, true)} color="#0d47a1" />
        </div>
        {showOpts && (
          <div className="flex flex-col gap-1 border border-[#888] bg-white p-1 text-[11px]">
            <button className={btnCls} onClick={applyLineDisc}>{T("خصم سطر (قيمة)", "Line disc (value)")}</button>
            <span className="flex gap-1">
              <input className={inputCls} style={{ width: 70 }} value={discPct}
                onChange={(e) => setDiscPct(e.target.value)} placeholder="%" />
              <button className={btnCls} onClick={() => {
                const pc = Number(discPct);
                if (pc >= 0 && pc <= 100) {
                  setLines(lines.map((l, i) => (i === sel ? { ...l, disc: (l.qty * l.price * pc) / 100 } : l)));
                }
                setDiscPct(""); setShowOpts(false);
              }}>{T("خصم %", "Disc %")}</button>
            </span>
            <button className={btnCls} onClick={() => { setLines([]); setShowOpts(false); }}>{T("مسح الكل", "Clear all")}</button>
            <button className={btnCls} onClick={() => setShowOpts(false)}>{T("إغلاق", "Close")}</button>
          </div>
        )}
      </div>

      {printOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPrintOpen(false)}>
          <div className="w-full max-w-sm border border-black bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <b className="text-[13px]">{T("الطباعة — اختر القالب", "Print — pick template")}</b>
            <select className={`${inputCls} mt-2`} value={printTpl} onChange={(e) => setPrintTpl(e.target.value)}>
              <option value="">{T("الافتراضي", "Default")}</option>
              {myTpls.map((t: any) => <option key={t.id ?? t.themeKey} value={t.id ?? t.themeKey}>{t.name}</option>)}
            </select>
            <div className="mt-1 text-[11px]">
              <button className={btnCls} onClick={() => navigate("/app/construction/sahl/prints")}>
                {T("مصمم القوالب", "Template designer")}
              </button>
            </div>
            <div className="mt-2 flex justify-between gap-1">
              <button className={btnCls} onClick={() => printDoc("html")}>🖨 HTML</button>
              <button className={btnCls} onClick={() => printDoc("xlsx")}>xlsx ↓</button>
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }} onClick={() => printDoc("both")}>
                {T("الاثنان (A4 + حراري)", "Both")}
              </button>
            </div>
            <div className="mt-1 text-[11px] text-[#666]">
              {T("الاثنان: A4 مفصلة + إيصال حراري", "Both: detailed A4 + thermal receipt")}
            </div>
          </div>
        </div>
      )}

      {pinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs border border-black bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <b className="text-[13px] text-red-700">{T("صلاحية محدودة — أدخل كلمة سر المشرف", "Restricted — enter supervisor passcode")}</b>
            <input type="password" autoFocus className={`${inputCls} mt-2`} value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); pinVerify.mutate({ password: pinInput }); } }} />
            <div className="mt-2 flex justify-between">
              <button className={btnCls} onClick={() => { setPinOpen(false); pinAction.current = null; }}>{T("إلغاء", "Cancel")}</button>
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }}
                disabled={pinVerify.isPending || !pinInput}
                onClick={() => pinVerify.mutate({ password: pinInput })}>
                {T("تأكيد", "Authorize")}
              </button>
            </div>
          </div>
        </div>
      )}

      {serialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-auto border border-black bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <b className="text-[13px]">{T("أرقام السيريال (سطر لكل رقم)", "Serial numbers (one per line)")}</b>
            {lines.map((l, i) => l.tracked ? (
              <div key={i} className="mt-2 border border-[#888] p-1">
                <div className="text-[12px] font-bold">{l.name} × {l.qty}</div>
                <textarea rows={Math.min(6, Math.max(2, l.qty))} className={inputCls}
                  value={serialInputs[i] ?? ""}
                  onChange={(e) => setSerialInputs({ ...serialInputs, [i]: e.target.value })}
                  placeholder="SN001&#10;SN002" dir="ltr" />
              </div>
            ) : null)}
            <div className="mt-2 flex justify-between">
              <button className={btnCls} onClick={() => setSerialOpen(false)}>{T("إغلاق", "Close")}</button>
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }}
                onClick={() => {
                  const bad = lines.findIndex((l, i) => l.tracked &&
                    (serialInputs[i] ?? "").split("\n").map((s) => s.trim()).filter(Boolean).length !== l.qty);
                  if (bad >= 0) {
                    setMsg(T(`السطر ${bad + 1}: عدد السيريال يجب أن يساوي الكمية`, `Line ${bad + 1}: serial count must equal qty`));
                    return;
                  }
                  setLines(lines.map((l, i) => l.tracked
                    ? { ...l, serials: (serialInputs[i] ?? "").split("\n").map((s) => s.trim()).filter(Boolean) }
                    : l));
                  setSerialOpen(false);
                  setMsg(T("تم تسجيل السيريال — احفظ الآن", "Serials recorded — save now"));
                }}>
                {T("تأكيد السيريال", "Confirm serials")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLookup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLookup(false)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto border border-black bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-between">
              <b className="text-[13px]">{T("قائمة الأصناف", "Item list")}</b>
              <button className={btnCls} onClick={() => setShowLookup(false)}>×</button>
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("بحث", "Search")} className={`${inputCls} mb-1`} />
            {(results ?? []).slice(0, 50).map((p: any) => (
              <div key={p.id} onClick={() => { chooseItem(p); setShowLookup(false); }}
                className="flex cursor-pointer justify-between border-b border-[#eee] px-1 py-1 text-[12px] hover:bg-[#e8f5e9]">
                <span>{p.code ?? p.sku} — {p.nameAr || p.name}</span>
                <b>{Number(p.salePrice ?? 0)}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
