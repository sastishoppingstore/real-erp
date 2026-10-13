import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, FuncKey } from "./ui";

// SCR-007 — verified against video frames (inv700 + right/bottom zooms):
// yellow total under doc-number box, green grid header, gray panel, right
// toolbar (mode, Q/K/navigate, big F12 checkmark, print checkbox,
// F5 qty / F6 price / F8 del-line / F7 options), green footer inputs,
// dark strip (close, item list, barcode, prices, delete-doc, new F10,
// Excel, print F11, save F9). Modes: sales|purchase|sales-return|
// purchase-return|quotation. All saves hit real MySQL tRPC mutations.
export type TxnKind = "sales" | "purchase" | "sales-return" | "purchase-return" | "quotation";

interface Line { productId?: number; code: string; name: string; unit: string; qty: number; price: number; disc: number; }

const TITLES: Record<TxnKind, { ar: string; en: string; color: string }> = {
  sales: { ar: "فاتورة بيع", en: "Sales invoice", color: "#2fae4e" },
  purchase: { ar: "فاتورة شراء", en: "Purchase invoice", color: "#e05242" },
  "sales-return": { ar: "مرتجع بيع", en: "Sales return", color: "#2fae4e" },
  "purchase-return": { ar: "مرتجع شراء", en: "Purchase return", color: "#7b2d4e" },
  quotation: { ar: "عرض سعر", en: "Quotation", color: "#1b9bd7" },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function SahlTxn({ kind }: { kind: TxnKind }) {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const TT = TITLES[kind];
  const isSales = kind === "sales" || kind === "sales-return" || kind === "quotation";
  const T = (ar: string, en: string) => (rtl ? ar : en);

  const [q, setQ] = useState("");
  const [qty, setQty] = useState(1);
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
  // view mode: loaded read-only invoice via « »
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewNav, setViewNav] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products } = trpc.inventory.productList.useQuery(q ? { search: q } : undefined);
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
    { id: viewId ?? 0 }, { enabled: kind === "sales" && viewId !== null });

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
  const results = useMemo(() => (products ?? []).slice(0, 8), [products]);

  useEffect(() => {
    setLines([]); setMsg(""); setOrigId(""); setReason(""); setPartyId("");
    setPartyQ(""); setDiscount(0); setDocDate(today()); setViewId(null); setViewNav(0); resetCd();
  }, [kind]);

  // « » navigation loads invoice read-only (view mode disables save)
  const loadView = (idx: number) => {
    const h = history[idx];
    if (!h) return;
    setViewNav(idx);
    setViewId(h.id);
  };
  useEffect(() => {
    if (viewData && viewId !== null) {
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
    setLines([]); setDiscount(0); setOrigId(""); setReason(""); setViewId(null); setMsg("");
    setPartyId(""); setPartyQ(""); resetCd();
  };

  const addLine = async (p: any) => {
    if (viewId !== null) return;
    let price = Number(p.salePrice ?? p.purchasePrice ?? 0);
    if (priceListId && kind === "sales") {
      try {
        const rows: any = await utils.sahl.priceFor.fetch({ productId: p.id });
        const hit = (rows ?? []).find((r: any) => String(r.id) === String(priceListId));
        if (hit && hit.price !== null && Number(hit.price) >= 0) price = Number(hit.price);
      } catch { /* keep base price */ }
    }
    setLines([...lines, {
      productId: p.id, code: p.sku ?? "", name: p.nameAr || p.name,
      unit: "", qty: Number(qty) || 1, price, disc: 0,
    }]);
    setQ("");
    searchRef.current?.focus();
  };

  const lineTotal = (l: Line) => l.qty * l.price - (l.disc || 0);
  const subtotal = lines.reduce((a, l) => a + lineTotal(l), 0);
  const net = Math.max(0, subtotal - Number(discount));
  const taxAmt = net * (Number(taxPct) || 0) / 100;
  const grand = net + taxAmt;
  const origDoc: any = kind.endsWith("return") ? history.find((h: any) => String(h.id) === String(origId)) : null;
  const origTotal = origDoc ? Number(origDoc.totalAmount ?? origDoc.total ?? 0) : 0;
  const returnAmount = lines.length ? net : origTotal;

  const editQty = () => {
    if (viewId !== null) return;
    const v = prompt(T("تعديل الكمية (F5)", "Edit qty (F5)"));
    if (v && Number(v) > 0) setLines(lines.map((l, i) => (i === sel ? { ...l, qty: Number(v) } : l)));
  };
  const editPrice = () => {
    if (viewId !== null) return;
    const v = prompt(T("تعديل السعر (F6)", "Edit price (F6)"));
    if (v && Number(v) >= 0) setLines(lines.map((l, i) => (i === sel ? { ...l, price: Number(v) } : l)));
  };
  const delLine = () => { if (viewId === null) setLines(lines.filter((_, i) => i !== sel)); };
  const moreOpts = () => setShowOpts((s) => !s);
  const applyLineDisc = () => {
    const v = prompt(T("خصم السطر المحدد", "Selected line discount"));
    if (v && Number(v) >= 0) setLines(lines.map((l, i) => (i === sel ? { ...l, disc: Number(v) } : l)));
    setShowOpts(false);
  };

  const invCreate = trpc.sales.invoiceCreate.useMutation();
  const invDelete = trpc.sales.invoiceDelete.useMutation();
  const poCreate = trpc.purchase.poCreate.useMutation();
  const grnCreate = trpc.purchase.grnCreate.useMutation();
  const creditCreate = trpc.sales.creditNoteCreate.useMutation();
  const quoteCreate = trpc.sales.quotationCreate.useMutation();
  const adjustCreate = trpc.inventory.adjustmentCreate.useMutation();

  const refreshAll = () => {
    utils.sales.invoiceList.invalidate();
    utils.sales.quotationList.invalidate();
    utils.sales.creditNoteList.invalidate();
    utils.purchase.poList.invalidate();
    utils.inventory.inventoryList.invalidate();
    utils.inventory.movementList.invalidate();
  };

  const doPrint = () => window.print();

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
    if (viewId !== null) { setMsg(T("وضع العرض — أنشئ مستنداً جديداً", "View mode — create a new document")); return; }
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
    if (kind.endsWith("return") && !origId) { setMsg(T("اختر المستند الأصلي", "Select original document")); return; }
    if (kind === "sales-return" && returnAmount <= 0) {
      setMsg(T("لا يوجد مبلغ للمرتجع", "Nothing to return")); return;
    }
    if ((kind === "purchase" || kind === "purchase-return") && !wh) {
      setMsg(T("اختر المخزن", "Select warehouse")); return;
    }
    setSaving(true);
    try {
      const stamp = Date.now();
      const note = [reason || undefined, salesmanSuffix()].filter(Boolean).join(" — ") || undefined;
      if (kind === "sales") {
        const custName = cd.name.trim() || parties.find((a: any) => String(a.id) === String(partyId))?.name;
        await invCreate.mutateAsync({
          invoiceNumber: `INV-${stamp}`,
          ...(partyId ? { customerId: Number(partyId) } : {}),
          date: docDate,
          subTotal: String(subtotal), discountAmount: String(discount),
          taxPercent: String(taxPct), taxAmount: taxAmt.toFixed(2),
          totalAmount: String(grand), notes: note,
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
        setMsg(`${T("تم حفظ أمر الشراء والاستلام", "PO + GRN saved")} — PO-${stamp}`);
      } else if (kind === "sales-return") {
        const c = await creditCreate.mutateAsync({
          creditNoteNumber: `CN-${stamp}`, customerId: Number(partyId),
          invoiceId: Number(origId), date: docDate, amount: String(returnAmount),
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
      else if (e.key === "F11") { e.preventDefault(); doPrint(); }
      else if (e.key === "F12") { e.preventDefault(); save(true, true); }
      else if (e.key === "Escape") { newDoc(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  return (
    <div className="flex min-h-full text-[12px] text-black">
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
            <input type="date" className={inputCls} value={docDate} onChange={(e) => setDocDate(e.target.value)} disabled={viewId !== null} />
          </label>
          <span className="border px-1">{T("الأصناف", "Lines")}: {lines.length}</span>
          <span className="border px-1">{T("الكمية", "Qty")}: {lines.reduce((a, l) => a + Number(l.qty), 0)}</span>
          <label>{isSales ? T("العميل", "Customer") : T("المورد", "Supplier")}
            <span className="flex gap-1">
              <input value={partyQ} onChange={(e) => { setPartyQ(e.target.value); if (kind === "sales" && e.target.value.length >= 2 && !partyId) setCd((c) => ({ ...c, name: c.name || e.target.value })); }}
                placeholder={T("بحث (حرفان للتعبئة)", "Search (2 letters)")} className={`${inputCls} w-[110px]`} disabled={viewId !== null} />
              <select className={`${inputCls} w-[130px]`} value={partyId} onChange={(e) => pickParty(e.target.value)} disabled={viewId !== null}>
                <option value="">—</option>
                {parties.map((a: any) => <option key={a.id} value={a.id}>{a.nameAr || a.name}</option>)}
              </select>
            </span>
          </label>
          {kind === "sales" && (
            <label>{T("قائمة الأسعار", "Price list")}
              <select className={`${inputCls} w-[110px]`} value={priceListId} onChange={(e) => setPriceListId(e.target.value)} disabled={viewId !== null}>
                <option value="">{T("الأساسي", "Base")}</option>
                {((priceLists ?? []) as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.nameAr || l.name}</option>)}
              </select>
            </label>
          )}
          {(kind === "purchase" || kind === "purchase-return") && (
            <label>{T("المخزن", "Warehouse")}
              <select className={inputCls} value={wh} onChange={(e) => setWh(e.target.value)} disabled={viewId !== null}>
                <option value="">—</option>
                {(warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </label>
          )}
          {kind.endsWith("return") && (
            <label>{T("الأصلي", "Original")}
              <select className={`${inputCls} w-[120px]`} value={origId} onChange={(e) => setOrigId(e.target.value)} disabled={viewId !== null}>
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
          <div className="relative flex gap-1 border-b border-[#bbb] p-1.5">
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={T("ابحث عن الصنف (كود/اسم/باركود)", "Find item (code/name/barcode)")} className={`${inputCls} flex-1`} />
            <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className={`${inputCls} w-[70px]`} />
            {results.length > 0 && (
              <div className="absolute start-0 top-full z-10 w-[320px] border border-black bg-white">
                {results.map((p: any) => (
                  <div key={p.id} onClick={() => addLine(p)}
                    className="flex cursor-pointer justify-between px-2 py-1 hover:bg-[#e8f5e9]">
                    <span>{p.code ?? p.sku} — {p.nameAr || p.name}</span>
                    <b>{Number(p.salePrice ?? 0)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {(kind === "sales-return" || kind === "purchase-return") && (
          <div className="flex gap-1 border-b border-[#bbb] p-1.5">
            <input value={reason} onChange={(e) => setReason(e.target.value)} disabled={viewId !== null}
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
                {[T("رقم الصنف", "Code"), T("اسم الصنف", "Item"), T("الكمية", "Qty"), T("السعر", "Price"), T("الخصم", "Disc"), T("الإجمالي", "Total")].map((c, i) => (
                  <th key={i} className="border border-[#1d7a37] px-1 py-1 font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-[#888]">
                  {viewId !== null ? T("عرض", "Viewing") : kind === "sales-return"
                    ? T("اختر المستند الأصلي ثم احفظ", "Select original, then save")
                    : T("فاتورة فارغة — ابحث وأضف صنفاً", "Empty — search and add items")}
                </td></tr>
              ) : lines.map((l, i) => (
                <tr key={i} onClick={() => setSel(i)} className="cursor-pointer"
                  style={i === sel ? { background: "#a5d6a7" } : undefined}>
                  {[l.code, l.name, l.qty, l.price, l.disc || 0, lineTotal(l).toFixed(2)].map((c, j) => (
                    <td key={j} className="border border-[#ccc] px-1 py-0.5 text-center">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-[#bbb] bg-[#e0e0e0] p-1 text-[11px] text-[#555]">
            {viewId !== null
              ? T("وضع العرض — الحفظ معطل، الطباعة والحذف متاحان حسب الصلاحية", "View mode — save disabled; print/delete per permission")
              : T("ملاحظة: الحفظ يرحّل المخزون والحسابات", "Note: saving posts stock and accounts")}
            {" · "}{T("الأرشيف", "Archive")}: {history.length}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1.5 text-white" style={{ background: "#1d7a37" }}>
          {kind === "sales" && (
            <label>{T("المندوب", "Rep")}
              <select className="px-1 text-black" value={salesman} onChange={(e) => setSalesman(e.target.value)} disabled={viewId !== null}>
                <option value="">—</option>
                {(salesmen ?? []).filter((s: any) => s.isActive).map((s: any) => <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>)}
              </select>
            </label>
          )}
          {kind !== "sales-return" && (
            <label>{T("الخصم", "Discount")}
              <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-[70px] px-1 text-black" disabled={viewId !== null} />
            </label>
          )}
          {(kind === "sales" || kind === "purchase") && (
            <label>{T("الضريبة %", "Tax %")}
              <input type="number" min="0" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))}
                className="w-[60px] px-1 text-black" disabled={viewId !== null} />
            </label>
          )}
          <b>{T("الصافي", "Net")}: {grand.toFixed(2)}</b>
          <button className={btnCls} onClick={() => save(false, false)} disabled={saving || viewId !== null}>{T("حفظ (F9)", "Save (F9)")}</button>
          <button className={btnCls} onClick={doPrint}>{T("طباعة (F11)", "Print (F11)")}</button>
          <button className={btnCls} onClick={newDoc}>{T("جديد (F10)", "New (F10)")}</button>
          {msg && <span className="bg-white px-1 text-black">{msg}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[#222] px-1.5 py-1 text-[11px] text-white">
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => navigate("/app/construction")}>{T("إغلاق", "Close")}</button>
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => setShowLookup(true)}>{T("قائمة الأصناف", "Item list")}</button>
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => searchRef.current?.focus()}>{T("شاشة الباركود", "Barcode")}</button>
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={() => navigate("/app/construction/sahl/prices")}>{T("تعديل الأسعار", "Edit prices")}</button>
          {kind === "sales" && <button className="border border-[#555] bg-[#5c1010] px-2 py-1 hover:bg-[#722]" onClick={deleteDoc}>{T("حذف الفاتورة", "Delete invoice")}</button>}
          <button className="border border-[#555] bg-[#333] px-2 py-1 hover:bg-[#444]" onClick={exportExcel}>Excel</button>
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
            onClick={() => kind === "sales" && history.length && loadView((viewNav - 1 + history.length) % history.length)}>«</button>
          <button className="flex-1 border border-[#888] bg-white py-0.5" title={T("التالي", "Next")}
            onClick={() => kind === "sales" && history.length && loadView((viewNav + 1) % history.length)}>»</button>
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
        </div>
        {showOpts && (
          <div className="flex flex-col gap-1 border border-[#888] bg-white p-1 text-[11px]">
            <button className={btnCls} onClick={applyLineDisc}>{T("خصم سطر", "Line discount")}</button>
            <button className={btnCls} onClick={() => { setLines([]); setShowOpts(false); }}>{T("مسح الكل", "Clear all")}</button>
            <button className={btnCls} onClick={() => setShowOpts(false)}>{T("إغلاق", "Close")}</button>
          </div>
        )}
      </div>

      {showLookup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLookup(false)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto border border-black bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-between">
              <b className="text-[13px]">{T("قائمة الأصناف", "Item list")}</b>
              <button className={btnCls} onClick={() => setShowLookup(false)}>×</button>
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("بحث", "Search")} className={`${inputCls} mb-1`} />
            {(products ?? []).slice(0, 50).map((p: any) => (
              <div key={p.id} onClick={() => { addLine(p); setShowLookup(false); }}
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
