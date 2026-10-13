import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { SahlField, SahlGrid, inputCls, btnCls, btnGreenCls } from "./ui";

// تعديل أسعار البيع — 3 renameable lists, per-product set, bulk set.
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

  const rename = trpc.sahl.priceListUpdate.useMutation({
    onSuccess: () => utils.sahl.priceListList.invalidate(),
    onError: (e) => setMsg(e.message),
  });
  const setPrice = trpc.sahl.priceSet.useMutation({
    onSuccess: () => setMsg(rtl ? "✓ تم" : "✓ Done"),
    onError: (e) => setMsg(e.message),
  });
  const bulkSet = trpc.sahl.priceBulk.useMutation({
    onSuccess: (r) => { setMsg(`${rtl ? "تم تحديث" : "Updated"} ${r.count}`); setBulk(""); },
    onError: (e) => setMsg(e.message),
  });

  const T = (ar: string, en: string) => (rtl ? ar : en);
  const L = (lists ?? []) as any[];

  const applyBulk = (listId: number) => {
    // lines: productId=price
    const items = bulk.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [a, b] = l.split("=").map((s) => s.trim());
      return { productId: Number(a), price: Number(b) };
    }).filter((x) => x.productId > 0 && x.price >= 0);
    if (!items.length) { setMsg(T("لا توجد أسطر صالحة", "No valid lines")); return; }
    bulkSet.mutate({ priceListId: listId, items });
  };

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تعديل أسعار البيع", "Edit sale prices")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
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
              onClick={() => names[l.id] && rename.mutate({ id: l.id, ...names[l.id] })}>
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
      </div>
      <SahlGrid
        columns={[T("الكود", "SKU"), T("الصنف", "Item"), T("الأساسي", "Base"), ...L.map((l: any) => l.nameAr || l.name), ""]}
        rows={(products ?? []).slice(0, 50).map((p: any) => [
          p.sku ?? "", p.nameAr || p.name, Number(p.salePrice ?? 0),
          ...L.map((l: any) => vals[`${l.id}:${p.id}`] ?? ""),
          "",
        ])}
        emptyText={T("ابحث عن صنف", "Search a product")}
      />
      <div className="mt-1 border border-[#333] bg-[#111] p-2 text-[11px] text-white/70">
        {T("لتعديل سعر: اختر القائمة وأدخل السعر ثم حفظ — تُكتب فوق سعر الصنف الأساسي عند اختيارها في البيع",
          "To edit: pick list, enter price, save — overrides base price when selected at sale")}
      </div>
      <PriceEditor lists={L} products={(products ?? []).slice(0, 50)} vals={vals} setVals={setVals} setPrice={setPrice} rtl={rtl} />
    </div>
  );
}

function PriceEditor({ lists, products, vals, setVals, setPrice, rtl }: any) {
  const [listId, setListId] = useState("");
  const [pid, setPid] = useState("");
  const T = (ar: string, en: string) => (rtl ? ar : en);
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1 border border-[#333] bg-[#111] p-2">
      <select className={inputCls} style={{ width: 150 }} value={listId} onChange={(e) => setListId(e.target.value)}>
        <option value="">—</option>
        {lists.map((l: any) => <option key={l.id} value={l.id}>{l.nameAr || l.name}</option>)}
      </select>
      <select className={inputCls} style={{ width: 200 }} value={pid} onChange={(e) => setPid(e.target.value)}>
        <option value="">—</option>
        {products.map((p: any) => <option key={p.id} value={p.id}>{p.sku} — {p.nameAr || p.name}</option>)}
      </select>
      <input className={inputCls} style={{ width: 110 }} placeholder={T("السعر", "Price")}
        value={vals[`${listId}:${pid}`] ?? ""}
        onChange={(e) => setVals({ ...vals, [`${listId}:${pid}`]: e.target.value })} />
      <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={setPrice.isPending}
        onClick={() => {
          if (!listId || !pid || !(Number(vals[`${listId}:${pid}`]) >= 0)) return;
          setPrice.mutate({ priceListId: Number(listId), productId: Number(pid), price: Number(vals[`${listId}:${pid}`]) });
        }}>
        {T("حفظ السعر", "Save price")}
      </button>
    </div>
  );
}
