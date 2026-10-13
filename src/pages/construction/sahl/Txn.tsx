import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, FuncKey } from "./ui";

// SCR-007: dense white transaction workspace, green header/footer,
// right action panel with F-keys. One component, five modes:
// sales | purchase | sales-return | purchase-return | quotation.
// Every save hits a real MySQL-backed tRPC mutation:
// sales→invoiceCreate, purchase→poCreate+grnCreate (posts stock),
// sales-return→creditNoteCreate (references original invoice),
// purchase-return→adjustmentCreate subtraction (references PO, auditable),
// quotation→quotationCreate (no stock movement).
export type TxnKind = "sales" | "purchase" | "sales-return" | "purchase-return" | "quotation";

interface Line { productId?: number; code: string; name: string; unit: string; qty: number; price: number; }

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
  const utils = trpc.useUtils();
  const TT = TITLES[kind];
  const isSales = kind === "sales" || kind === "sales-return" || kind === "quotation";
  const isReturn = kind.endsWith("return");

  const [q, setQ] = useState("");
  const [qty, setQty] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [sel, setSel] = useState(0);
  const [partyId, setPartyId] = useState("");
  const [partyQ, setPartyQ] = useState("");
  const [wh, setWh] = useState("");
  const [discount, setDiscount] = useState(0);
  const [origId, setOrigId] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products } = trpc.inventory.productList.useQuery(q ? { search: q } : undefined);
  const { data: customers } = trpc.sales.customerList.useQuery(
    isSales && partyQ ? { search: partyQ } : undefined
  );
  const { data: suppliers } = trpc.purchase.supplierList.useQuery(
    !isSales && partyQ ? { search: partyQ } : undefined
  );
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const { data: balances } = trpc.inventory.inventoryList.useQuery(
    wh && kind === "purchase-return" ? { warehouseId: Number(wh) } : undefined,
    { enabled: kind === "purchase-return" && !!wh }
  );
  const { data: invoices } = trpc.sales.invoiceList.useQuery(undefined, { enabled: kind === "sales" || kind === "sales-return" });
  const { data: company } = trpc.settings.companySettingsGet.useQuery();
  const brandAr = (company as any)?.companyNameAr || (company as any)?.companyName || "سهل";
  const { data: pos } = trpc.purchase.poList.useQuery(undefined, { enabled: kind === "purchase" || kind === "purchase-return" });
  const { data: quotes } = trpc.sales.quotationList.useQuery(undefined, { enabled: kind === "quotation" });
  const { data: credits } = trpc.sales.creditNoteList.useQuery(undefined, { enabled: kind === "sales-return" });
  const [priceListId, setPriceListId] = useState("");
  const { data: priceLists } = trpc.sahl.priceListList.useQuery(undefined, { enabled: kind === "sales" });

  const parties: any[] = (isSales ? customers : suppliers) ?? [];
  const history: any[] = kind === "sales" ? invoices ?? [] : kind === "purchase" ? pos ?? [] : kind === "quotation" ? quotes ?? [] : kind === "sales-return" ? credits ?? [] : pos ?? [];

  const results = useMemo(() => (products ?? []).slice(0, 8), [products]);

  useEffect(() => {
    setLines([]); setMsg(""); setOrigId(""); setReason(""); setPartyId(""); setPartyQ(""); setDiscount(0);
  }, [kind]);

  const addLine = async (p: any) => {
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
      unit: "", qty: Number(qty) || 1, price,
    }]);
    setQ("");
    searchRef.current?.focus();
  };

  const subtotal = lines.reduce((a, l) => a + l.qty * l.price, 0);
  const net = Math.max(0, subtotal - Number(discount));

  const invCreate = trpc.sales.invoiceCreate.useMutation();
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

  const save = async () => {
    setMsg("");
    if (saving) { setMsg(rtl ? "جاري الحفظ — تم منع التكرار" : "Saving — duplicate blocked"); return; }
    if (!lines.length && kind !== "sales-return") { setMsg(rtl ? "أضف سطراً واحداً على الأقل" : "Add at least one line"); return; }
    if ((kind === "sales" || kind === "quotation" || kind === "sales-return") && !partyId) {
      setMsg(rtl ? "اختر العميل" : "Select customer"); return;
    }
    if ((kind === "purchase" || kind === "purchase-return") && !partyId) {
      setMsg(rtl ? "اختر المورد" : "Select supplier"); return;
    }
    if (isReturn && !origId) { setMsg(rtl ? "اختر المستند الأصلي" : "Select original document"); return; }
    if ((kind === "purchase" || kind === "purchase-return") && !wh) {
      setMsg(rtl ? "اختر المخزن" : "Select warehouse"); return;
    }
    setSaving(true);
    try {
      const stamp = Date.now();
      if (kind === "sales") {
        await invCreate.mutateAsync({
          invoiceNumber: `INV-${stamp}`, customerId: Number(partyId), date: today(),
          subTotal: String(subtotal), discountAmount: String(discount),
          totalAmount: String(net),
          items: lines.map((l) => ({
            productId: l.productId, description: l.name, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(l.qty * l.price),
          })),
        });
        setMsg(`${rtl ? "تم حفظ الفاتورة" : "Invoice saved"} — INV-${stamp}`);
      } else if (kind === "quotation") {
        await quoteCreate.mutateAsync({
          quotationNumber: `Q-${stamp}`, customerId: Number(partyId), date: today(),
          subTotal: String(subtotal), totalAmount: String(net),
          items: lines.map((l) => ({
            productId: l.productId, description: l.name, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(l.qty * l.price),
          })),
        });
        setMsg(`${rtl ? "تم حفظ العرض" : "Quotation saved"} — Q-${stamp}`);
      } else if (kind === "purchase") {
        const po = await poCreate.mutateAsync({
          poNumber: `PO-${stamp}`, supplierId: Number(partyId), date: today(),
          subTotal: String(subtotal), totalAmount: String(net),
          items: lines.map((l) => ({
            productId: l.productId, description: l.name, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(l.qty * l.price),
          })),
        });
        await grnCreate.mutateAsync({
          grnNumber: `GRN-${stamp}`, poId: po.id, supplierId: Number(partyId),
          warehouseId: Number(wh), date: today(),
          items: lines.map((l) => ({
            productId: l.productId!, quantity: l.qty,
            unitPrice: String(l.price), totalAmount: String(l.qty * l.price),
          })),
        });
        setMsg(`${rtl ? "تم حفظ أمر الشراء والاستلام وترحيل المخزون" : "PO + GRN saved, stock posted"} — PO-${stamp}`);
      } else if (kind === "sales-return") {
        const c = await creditCreate.mutateAsync({
          creditNoteNumber: `CN-${stamp}`, customerId: Number(partyId),
          invoiceId: Number(origId), date: today(), amount: String(net || subtotal),
          reason: reason || undefined,
        });
        setMsg(`${rtl ? "تم حفظ المرتجع مرتبطاً بالفاتورة" : "Return saved against invoice"} — ${c.id}`);
      } else {
        const bals: any[] = balances ?? [];
        const items = lines.map((l) => {
          const cur = bals.filter((b: any) => b.productId === l.productId)
            .reduce((a: number, b: any) => a + Number(b.quantity || 0), 0);
          return { productId: l.productId!, quantity: Math.max(0, cur - l.qty), unitCost: String(l.price) };
        });
        await adjustCreate.mutateAsync({
          adjustmentDate: today(), adjustmentType: "subtraction",
          reason: `${rtl ? "مرتجع شراء" : "Purchase return"} PO#${origId}${reason ? " — " + reason : ""}`,
          warehouseId: Number(wh), items,
        } as any);
        setMsg(rtl ? "تم ترحيل مرتجع الشراء (إنقاص الكمية)" : "Purchase return posted (qty subtracted)");
      }
      setLines([]); setDiscount(0); setOrigId("");
      refreshAll();
    } catch (e: any) {
      setMsg(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "F5") { e.preventDefault(); save(); }
      else if (e.key === "F6") { e.preventDefault(); window.print(); }
      else if (e.key === "F7" || e.key === "F12") { e.preventDefault(); searchRef.current?.focus(); }
      else if (e.key === "F8") { e.preventDefault(); setLines(lines.filter((_, i) => i !== sel)); }
      else if (e.key === "F10") {
        e.preventDefault();
        const v = prompt(rtl ? "الكمية" : "Qty");
        if (v && Number(v) > 0) setLines(lines.map((l, i) => (i === sel ? { ...l, qty: Number(v) } : l)));
      } else if (e.key === "F11") {
        e.preventDefault();
        const v = prompt(rtl ? "السعر" : "Price");
        if (v && Number(v) >= 0) setLines(lines.map((l, i) => (i === sel ? { ...l, price: Number(v) } : l)));
      } else if (e.key === "Escape") { setLines([]); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const T = (ar: string, en: string) => (rtl ? ar : en);

  return (
    <div className="flex min-h-full text-[12px] text-black">
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#bbb] p-1.5">
          <label>{T("رقم المستند", "Doc no.")}
            <input className={`${inputCls} w-[90px]`} value={history.length + 1} readOnly />
          </label>
          <div className="border border-[#888] px-2 py-1 font-bold" style={{ background: "#ffeb3b" }}>
            {T("الإجمالي", "Total")}: {net.toFixed(2)}
          </div>
          <label>{T("التاريخ", "Date")}<input type="date" className={inputCls} defaultValue={today()} /></label>
          <span className="border px-1">{T("الأصناف", "Lines")}: {lines.length}</span>
          <span className="border px-1">{T("الكمية", "Qty")}: {lines.reduce((a, l) => a + Number(l.qty), 0)}</span>
          <label>{isSales ? T("العميل", "Customer") : T("المورد", "Supplier")}  <span className="flex gap-1">
              <input value={partyQ} onChange={(e) => setPartyQ(e.target.value)}
                placeholder={T("بحث", "Search")} className={`${inputCls} w-[110px]`} />
              <select className={`${inputCls} w-[130px]`} value={partyId} onChange={(e) => setPartyId(e.target.value)}>
                <option value="">—</option>
                {parties.map((a: any) => <option key={a.id} value={a.id}>{a.nameAr || a.name}</option>)}
              </select>
            </span>
          </label>
          {(kind === "purchase" || kind === "purchase-return") && (
            <label>{T("المخزن", "Warehouse")}
              <select className={inputCls} value={wh} onChange={(e) => setWh(e.target.value)}>
                <option value="">—</option>
                {(warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </label>
          )}
          {kind === "sales" && (
            <label>{T("قائمة الأسعار", "Price list")}
              <select className={`${inputCls} w-[110px]`} value={priceListId} onChange={(e) => setPriceListId(e.target.value)}>
                <option value="">{T("الأساسي", "Base")}</option>
                {((priceLists ?? []) as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.nameAr || l.name}</option>)}
              </select>
            </label>
          )}
          {isReturn && (
            <label>{T("الأصلي", "Original")}
              <select className={`${inputCls} w-[120px]`} value={origId} onChange={(e) => setOrigId(e.target.value)}>
                <option value="">—</option>
                {history.map((h: any) => (
                  <option key={h.id} value={h.id}>{h.invoiceNumber ?? h.poNumber ?? h.creditNoteNumber ?? h.id}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {kind !== "sales-return" && (
          <div className="relative flex gap-1 border-b border-[#bbb] p-1.5">
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={T("بحث صنف / باركود", "Search item / barcode")} className={`${inputCls} flex-1`} />
            <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className={`${inputCls} w-[70px]`} />
            {results.length > 0 && (
              <div className="absolute start-0 top-full z-10 w-[320px] border border-black bg-white">
                {results.map((p: any) => (
                  <div key={p.id} onClick={() => addLine(p)}
                    className="flex cursor-pointer justify-between px-2 py-1 hover:bg-[#e8f5e9]">
                    <span>{p.sku} — {p.nameAr || p.name}</span>
                    <b>{Number(p.salePrice ?? 0)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {kind === "sales-return" && (
          <div className="flex gap-1 border-b border-[#bbb] p-1.5">
            <input value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder={T("سبب المرتجع", "Return reason")} className={`${inputCls} flex-1`} />
          </div>
        )}
        {kind === "purchase-return" && (
          <div className="flex gap-1 border-b border-[#bbb] p-1.5">
            <input value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder={T("ملاحظة المرتجع", "Return note")} className={`${inputCls} flex-1`} />
          </div>
        )}

        <div className="min-h-[140px] flex-1 overflow-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr style={{ background: "#2fae4e", color: "#fff" }}>
                {[T("الكود", "Code"), T("الصنف", "Item"), T("الكمية", "Qty"), T("السعر", "Price"), T("الإجمالي", "Total")].map((c, i) => (
                  <th key={i} className="border border-[#1d7a37] px-1 py-1 font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-[#888]">
                  {kind === "sales-return" ? T("اختر المستند الأصلي ثم احفظ", "Select original, then save") : T("فاتورة فارغة — ابحث وأضف صنفاً", "Empty — search and add items")}
                </td></tr>
              ) : lines.map((l, i) => (
                <tr key={i} onClick={() => setSel(i)} className="cursor-pointer"
                  style={i === sel ? { background: "#a5d6a7" } : undefined}>
                  {[l.code, l.name, l.qty, l.price, (l.qty * l.price).toFixed(2)].map((c, j) => (
                    <td key={j} className="border border-[#ccc] px-1 py-0.5 text-center">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="h-[60px] border-t border-[#bbb] bg-[#e0e0e0] p-1 text-[11px] text-[#555]">
            {T("الأرشيف", "Archive")}: {history.length}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-1.5 text-white" style={{ background: "#1d7a37" }}>
          {kind !== "sales-return" && (
            <label>{T("الخصم", "Discount")}
              <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-[70px] px-1 text-black" />
            </label>
          )}
          <b>{T("الصافي", "Net")}: {net.toFixed(2)}</b>
          <button className={btnCls} onClick={save} disabled={saving}>{T("حفظ (F5)", "Save (F5)")}</button>
          <button className={btnCls} onClick={() => window.print()}>{T("طباعة (F6)", "Print (F6)")}</button>
          <button className={btnCls} onClick={() => setLines([])}>{T("خروج (Esc)", "Exit (Esc)")}</button>
          {msg && <span className="bg-white px-1 text-black">{msg}</span>}
        </div>
      </div>

      <div className="flex w-[120px] shrink-0 flex-col gap-1 border-s border-[#888] bg-[#f7f7f7] p-1">
        <div className="py-1 text-center font-bold text-white" style={{ background: TT.color }}>
          {brandAr} • {rtl ? TT.ar : TT.en}
        </div>
        <button className="bg-[#0d47a1] py-1 text-[28px] text-white" onClick={save} title="save">💾</button>
        <FuncKey k="F5" label={T("حفظ", "Save")} onClick={save} color="#1d7a37" />
        <FuncKey k="F6" label={T("طباعة", "Print")} onClick={() => window.print()} color="#455a64" />
        <FuncKey k="F7" label={T("صنف", "Item")} onClick={() => searchRef.current?.focus()} color="#00838f" />
        <FuncKey k="F8" label={T("حذف سطر", "Del line")} onClick={() => setLines(lines.filter((_, i) => i !== sel))} color="#6a1b9a" />
        <FuncKey k="F10" label={T("الكمية", "Qty")} color="#ef6c00" />
        <FuncKey k="F11" label={T("السعر", "Price")} color="#1565c0" />
        <FuncKey k="F12" label={T("بحث", "Lookup")} onClick={() => searchRef.current?.focus()} color="#37474f" />
      </div>
    </div>
  );
}
