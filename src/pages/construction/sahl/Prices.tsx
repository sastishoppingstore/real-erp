import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { SahlField, SahlGrid, inputCls, btnCls, btnGreenCls } from "./ui";

// تعديل أسعار البيع — 3 renameable lists, per-product set, bulk set.
// Clicking a product selects it (highlighted row) and loads it straight into
// the editor: base price (products.sale_price) + every price list.
export default function SahlPrices() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [bulk, setBulk] = useState("");
  const { data: lists } = trpc.sahl.priceListList.useQuery();
  const { data: products } = trpc.inventory.productList.useQuery(q ? { search: q } : undefined);
  const [names, setNames] = useState<Record<number, { name: string; nameAr: string }>>({});
  const [vals, setVals] = useState<Record<string, string>>({});
  // selection (row index in the visible grid) + editor state
  const [selIdx, setSelIdx] = useState(-1);
  const [listId, setListId] = useState("");
  const [pid, setPid] = useState("");
  const [basePrice, setBasePrice] = useState("");

  const rename = trpc.sahl.priceListUpdate.useMutation({
    onSuccess: () => utils.sahl.priceListList.invalidate(),
    onError: (e) => setMsg(e.message),
  });
  const setPrice = trpc.sahl.priceSet.useMutation({
    onSuccess: () => {
      setMsg(rtl ? "✓ تم حفظ السعر" : "✓ Price saved");
      utils.sahl.priceItemsFor.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });
  const bulkSet = trpc.sahl.priceBulk.useMutation({
    onSuccess: (r) => {
      setMsg(`${rtl ? "تم تحديث" : "Updated"} ${r.count}`);
      setBulk("");
      utils.sahl.priceItemsFor.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });
  const setBase = trpc.inventory.productUpdate.useMutation({
    onSuccess: () => {
      setMsg(rtl ? "✓ تم حفظ السعر الأساسي" : "✓ Base price saved");
      utils.inventory.productList.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });

  const T = (ar: string, en: string) => (rtl ? ar : en);
  const L = (lists ?? []) as any[];
  const prods = (products ?? []) as any[];
  const gridRows = prods.slice(0, 50);
  const selProduct = selIdx >= 0 ? gridRows[selIdx] : null;

  // real saved prices for the visible products (one round trip)
  const { data: priceItems } = trpc.sahl.priceItemsFor.useQuery(
    { productIds: gridRows.map((p: any) => p.id) },
    { enabled: gridRows.length > 0 },
  );
  const priceMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const it of (priceItems ?? []) as any[]) {
      map[`${it.priceListId}:${it.productId}`] = String(it.price);
    }
    return map;
  }, [priceItems]);

  // when the selection changes, load its prices into the editor
  useEffect(() => {
    if (!pid) return;
    const next: Record<string, string> = { ...vals };
    for (const l of L) {
      const key = `${l.id}:${pid}`;
      if (priceMap[key] !== undefined) next[key] = priceMap[key];
    }
    setVals(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, priceMap]);

  const [marginList, setMarginList] = useState("");
  const [marginPct, setMarginPct] = useState("25");
  const [marginCat, setMarginCat] = useState("");
  const [preview, setPreview] = useState<any[] | null>(null);
  const { data: cats } = trpc.inventory.categoryList.useQuery();

  const calcMargin = () => {
    const rows = prods
      .filter((p: any) => !marginCat || String(p.categoryId) === String(marginCat))
      .map((p: any) => {
        const cost = Number(p.purchasePrice || 0);
        const price = cost * (1 + (Number(marginPct) || 0) / 100);
        return { productId: p.id, sku: p.sku, name: p.nameAr || p.name, cost, price: Math.round(price * 100) / 100 };
      });
    setPreview(rows);
  };
  const commitMargin = () => {
    if (!marginList || !preview?.length) { setMsg(T("اختر القائمة واحسب أولاً", "Pick list and preview first")); return; }
    bulkSet.mutate({
      priceListId: Number(marginList),
      items: preview.map((r) => ({ productId: r.productId, price: r.price })),
    });
    setPreview(null);
  };

  const applyBulk = (listId: number) => {
    // lines: productId=price
    const items = bulk.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [a, b] = l.split("=").map((s) => s.trim());
      return { productId: Number(a), price: Number(b) };
    }).filter((x) => x.productId > 0 && x.price >= 0);
    if (!items.length) { setMsg(T("لا توجد أسطر صالحة", "No valid lines")); return; }
    bulkSet.mutate({ priceListId: listId, items });
  };

  const selectProduct = (i: number) => {
    const p = gridRows[i];
    setSelIdx(i);
    setMsg("");
    if (!p) return;
    setPid(String(p.id));
    setBasePrice(String(Number(p.salePrice ?? 0)));
    // keep the price list selection (default = first list)
    if (!listId) {
      const def = L.find((l: any) => l.isDefault) ?? L[0];
      if (def) setListId(String(def.id));
    }
  };

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تعديل أسعار البيع", "Edit sale prices")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
        {selProduct && (
          <span className="ms-2 text-emerald-300">
            {T("المحدد", "Selected")}: <b>{selProduct.sku} — {selProduct.nameAr || selProduct.name}</b>
          </span>
        )}
      </div>
      <div className="mb-2 grid gap-2 lg:grid-cols-3">
        {L.map((l: any) => (
          <div key={l.id} className="border border-[#333] bg-[#111] p-2">
            <div className="mb-1 font-bold" style={{ color: "#2fae4e" }}>{l.nameAr || l.name} ({l.code})</div>
            <SahlField label={T("الاسم", "Name")}>
              <input className={inputCls} defaultValue={l.name}
                onChange={(e) => setNames({ ...names, [l.id]: { name: e.target.value, nameAr: names[l.id]?.nameAr ?? l.nameAr ?? "" } })} />
            </SahlField>
            <SahlField label={T("عربي", "Arabic")}>
              <input className={inputCls} defaultValue={l.nameAr ?? ""}
                onChange={(e) => setNames({ ...names, [l.id]: { name: names[l.id]?.name ?? l.name, nameAr: e.target.value } })} />
            </SahlField>
            <button className={btnCls}
              onClick={() => names[l.id]
                ? rename.mutate({ id: l.id, ...names[l.id] })
                : setMsg(T("عدّل الاسم أولاً ثم أعد التسمية", "Edit a name first, then rename"))}>
              {T("إعادة تسمية", "Rename")}
            </button>
            <div className="mt-1">
              <div className="text-[11px] text-white/60">{T("تحديث جماعي (سطر: productId=price)", "Bulk (line: productId=price)")}</div>
              <textarea className={inputCls} rows={3} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"12=35.5\n15=40"} />
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={bulkSet.isPending}
                onClick={() => applyBulk(l.id)}>
                {T("تطبيق", "Apply")}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-1 flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("بحث صنف", "Search product")}
          className={inputCls} style={{ width: 240 }} />
        <span className="text-[11px] text-white/60">
          {T("اضغط على الصنف لتحديده وتعديل سعره", "Click a product to select it and edit its price")}
        </span>
      </div>
      <SahlGrid
        columns={[T("الكود", "SKU"), T("الصنف", "Item"), T("الأساسي", "Base"), ...L.map((l: any) => l.nameAr || l.name), ""]}
        rows={gridRows.map((p: any) => [
          p.sku ?? "", p.nameAr || p.name, Number(p.salePrice ?? 0),
          ...L.map((l: any) => priceMap[`${l.id}:${p.id}`] ?? vals[`${l.id}:${p.id}`] ?? ""),
          "",
        ])}
        onSelect={selectProduct}
        selected={selIdx}
        emptyText={T("ابحث عن صنف", "Search a product")}
      />
      <div className="mt-1 border border-[#333] bg-[#111] p-2 text-[11px] text-white/70">
        {T("لتعديل سعر: اضغط على الصنف ثم اختر القائمة وأدخل السعر ثم حفظ — تُكتب فوق سعر الصنف الأساسي عند اختيارها في البيع",
          "To edit: click the product, pick the list, enter the price and save — it overrides the base price at sale time")}
      </div>
      <PriceEditor
        lists={L}
        products={gridRows}
        vals={vals}
        setVals={setVals}
        setPrice={setPrice}
        rtl={rtl}
        listId={listId}
        setListId={setListId}
        pid={pid}
        setPid={setPid}
        basePrice={basePrice}
        setBasePrice={setBasePrice}
        setBase={setBase}
      />
      <div className="mt-2 border border-[#333] bg-[#111] p-2">
        <b>{T("حساب أسعار البيع: التكلفة + هامش %", "Compute prices: cost + margin %")}</b>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <select className={inputCls} style={{ width: 150 }} value={marginList} onChange={(e) => setMarginList(e.target.value)}>
            <option value="">—</option>
            {L.map((l: any) => <option key={l.id} value={l.id}>{l.nameAr || l.name}</option>)}
          </select>
          <select className={inputCls} style={{ width: 150 }} value={marginCat} onChange={(e) => setMarginCat(e.target.value)}>
            <option value="">{T("كل التصنيفات", "All categories")}</option>
            {(cats ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>)}
          </select>
          <input className={inputCls} style={{ width: 80 }} value={marginPct} onChange={(e) => setMarginPct(e.target.value)} placeholder="%" />
          <button className={btnCls} onClick={calcMargin}>{T("حساب (معاينة)", "Preview")}</button>
          <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={bulkSet.isPending || !preview} onClick={commitMargin}>
            {T("حفظ", "Commit")}
          </button>
        </div>
        {preview && (
          <div className="mt-1 max-h-[140px] overflow-auto border border-[#888] text-[12px]">
            {preview.slice(0, 100).map((r) => (
              <div key={r.productId} className="flex justify-between border-b border-[#333] px-1 py-0.5">
                <span>{r.sku} — {r.name}</span>
                <span>{r.cost} → <b>{r.price}</b></span>
              </div>
            ))}
            {preview.length > 100 && <div className="px-1 text-white/60">+{preview.length - 100}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function PriceEditor({
  lists, products, vals, setVals, setPrice, rtl,
  listId, setListId, pid, setPid,
  basePrice, setBasePrice, setBase,
}: any) {
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const priceKey = `${listId}:${pid}`;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 border border-[#333] bg-[#111] p-2">
      <label className="flex items-center gap-1 text-[11px]">
        <span className="text-white/60">{T("الصنف", "Product")}</span>
        <select className={inputCls} style={{ width: 220 }} value={pid} onChange={(e) => setPid(e.target.value)}>
          <option value="">—</option>
          {products.map((p: any) => <option key={p.id} value={p.id}>{p.sku} — {p.nameAr || p.name}</option>)}
        </select>
      </label>

      <label className="flex items-center gap-1 text-[11px]">
        <span className="text-white/60">{T("السعر الأساسي", "Base price")}</span>
        <input type="number" min="0" step="any" className={inputCls} style={{ width: 110 }} value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)} disabled={!pid} />
        <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={setBase.isPending || !pid}
          onClick={() => {
            const n = Number(basePrice);
            if (!isFinite(n) || n < 0) return;
            setBase.mutate({ id: Number(pid), salePrice: String(n) });
          }}>
          {T("حفظ الأساسي", "Save base")}
        </button>
      </label>

      <label className="flex items-center gap-1 text-[11px]">
        <span className="text-white/60">{T("قائمة الأسعار", "Price list")}</span>
        <select className={inputCls} style={{ width: 150 }} value={listId} onChange={(e) => setListId(e.target.value)}>
          <option value="">—</option>
          {lists.map((l: any) => <option key={l.id} value={l.id}>{l.nameAr || l.name}</option>)}
        </select>
      </label>

      <label className="flex items-center gap-1 text-[11px]">
        <span className="text-white/60">{T("السعر", "Price")}</span>
        <input type="number" min="0" step="any" className={inputCls} style={{ width: 110 }} placeholder={T("السعر", "Price")}
          value={vals[priceKey] ?? ""} disabled={!pid || !listId}
          onChange={(e) => setVals({ ...vals, [priceKey]: e.target.value })} />
        <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={setPrice.isPending || !pid || !listId}
          onClick={() => {
            const v = Number(vals[priceKey]);
            if (!isFinite(v) || v < 0) return;
            setPrice.mutate({ priceListId: Number(listId), productId: Number(pid), price: v });
          }}>
          {T("حفظ السعر", "Save price")}
        </button>
      </label>
    </div>
  );
}
