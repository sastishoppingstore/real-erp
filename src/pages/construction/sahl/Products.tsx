import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import {
  GreenDialog, SahlField, SahlGrid, inputCls, btnCls, btnGreenCls,
} from "./ui";

// SCR-004 (green product dialog) + SCR-006 (white inventory workspace).
// Persists via inventory.* tRPC (MySQL). Opening stock posts through
// adjustmentCreate so every quantity is an auditable movement.
const empty = {
  sku: "", name: "", nameAr: "", categoryId: "", unitId: "", barcode: "",
  purchasePrice: "", salePrice: "", reorderLevel: 0, description: "",
};

export default function SahlProducts() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [q, setQ] = useState("");
  const [f, setF] = useState<any>({ ...empty });
  const [sel, setSel] = useState(-1);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"stock" | "moves">("stock");
  const [opening, setOpening] = useState({ warehouseId: "", qty: "" });

  const { data: rows } = trpc.inventory.productList.useQuery(q ? { search: q } : undefined);
  const { data: cats } = trpc.inventory.categoryList.useQuery();
  const { data: units } = trpc.inventory.unitList.useQuery();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const { data: balances } = trpc.inventory.inventoryList.useQuery();
  const selProduct = sel >= 0 ? (rows ?? [])[sel] : null;
  const { data: moves } = trpc.inventory.movementList.useQuery(
    selProduct ? { productId: selProduct.id } : undefined,
    { enabled: tab === "moves" && !!selProduct }
  );

  const refresh = () => {
    utils.inventory.productList.invalidate();
    utils.inventory.inventoryList.invalidate();
    utils.inventory.movementList.invalidate();
  };
  const create = trpc.inventory.productCreate.useMutation({
    onSuccess: () => { setF({ ...empty }); setSel(-1); refresh(); },
    onError: (e) => setErr(e.message),
  });
  const update = trpc.inventory.productUpdate.useMutation({
    onSuccess: () => refresh(),
    onError: (e) => setErr(e.message),
  });
  const adjust = trpc.inventory.adjustmentCreate.useMutation({
    onSuccess: () => { setOpening({ warehouseId: "", qty: "" }); refresh(); },
    onError: (e) => setErr(e.message),
  });

  const pick = (i: number) => {
    const r = (rows ?? [])[i];
    setSel(i);
    setErr("");
    setF({
      sku: r.sku ?? "", name: r.name ?? "", nameAr: r.nameAr ?? "",
      categoryId: r.categoryId ?? "", unitId: r.unitId ?? "", barcode: r.barcode ?? "",
      purchasePrice: r.purchasePrice ?? "", salePrice: r.salePrice ?? "",
      reorderLevel: r.reorderLevel ?? 0, description: r.description ?? "",
    });
  };

  const save = () => {
    setErr("");
    if (!f.name?.trim() || !f.sku?.trim() || !String(f.salePrice ?? "").trim()) {
      setErr(rtl ? "اسم الصنف والكود وسعر البيع حقول مطلوبة" : "Name, SKU and sale price are required");
      return;
    }
    const payload = {
      sku: f.sku.trim(), name: f.name.trim(), nameAr: f.nameAr || undefined,
      categoryId: f.categoryId ? Number(f.categoryId) : undefined,
      unitId: f.unitId ? Number(f.unitId) : undefined,
      barcode: f.barcode || undefined,
      purchasePrice: f.purchasePrice === "" ? undefined : String(f.purchasePrice),
      salePrice: f.salePrice === "" ? undefined : String(f.salePrice),
      reorderLevel: Number(f.reorderLevel) || 0,
      description: f.description || undefined,
    };
    if (selProduct) update.mutate({ id: selProduct.id, ...payload });
    else create.mutate(payload as any);
  };

  const postOpening = () => {
    if (!selProduct || !opening.warehouseId || !(Number(opening.qty) > 0)) {
      setErr(rtl ? "اختر المخزن وأدخل كمية افتتاحية" : "Select warehouse and opening qty");
      return;
    }
    const cur = (balances ?? [])
      .filter((b: any) => b.productId === selProduct.id && String(b.warehouseId) === String(opening.warehouseId))
      .reduce((a: number, b: any) => a + Number(b.quantity || 0), 0);
    // adjustmentCreate sets an ABSOLUTE target: from zero post as-is,
    // otherwise add on top after explicit confirmation.
    let target = Number(opening.qty);
    if (cur > 0) {
      const add = confirm(rtl
        ? `الرصيد الحالي ${cur}. هل تريد الإضافة عليه (يصبح ${cur + target})؟ موافق=إضافة / إلغاء=استبدال`
        : `Current stock is ${cur}. Add on top (becomes ${cur + target})? OK=add / Cancel=overwrite`);
      if (add) target = cur + target;
    }
    adjust.mutate({
      adjustmentDate: new Date().toISOString().slice(0, 10),
      adjustmentType: "addition",
      reason: rtl ? "رصيد افتتاحي" : "Opening stock",
      warehouseId: Number(opening.warehouseId),
      items: [{ productId: selProduct.id, quantity: target, unitCost: String(selProduct.purchasePrice ?? 0) }],
    } as any);
  };

  const list = rows ?? [];
  const stockFor = (pid: number) =>
    (balances ?? []).filter((b: any) => b.productId === pid).reduce((a: number, b: any) => a + Number(b.quantity || 0), 0);

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      {/* SCR-006 workspace */}
      <div className="mb-2 flex flex-wrap items-center gap-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{rtl ? "إدارة الأصناف" : "Product management"}</b>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={rtl ? "بحث بالاسم أو الباركود" : "Search name / barcode"}
          className={`${inputCls} max-w-[240px]`} style={{ width: 240 }}
        />
        <button className={btnCls} onClick={() => { setF({ ...empty }); setSel(-1); setErr(""); }}>
          {rtl ? "جديد" : "New"}
        </button>
        <span className="text-[11px] text-white/60">{rtl ? "الأصناف" : "Items"}: {list.length}</span>
      </div>

      <SahlGrid
        columns={[
          rtl ? "الكود" : "SKU", rtl ? "الصنف" : "Name", rtl ? "الوحدة" : "Unit",
          rtl ? "الشراء" : "Cost", rtl ? "البيع" : "Price", rtl ? "الرصيد" : "Stock",
        ]}
        rows={list.map((r: any) => [
          r.sku ?? "", r.nameAr || r.name, r.unitId ?? "",
          r.purchasePrice ?? 0, r.salePrice ?? 0, stockFor(r.id),
        ])}
        onSelect={pick}
        selected={sel}
        emptyText={rtl ? "لا توجد أصناف — أنشئ صنفاً جديداً" : "No products — create one below"}
      />

      {/* SCR-004 green dialog */}
      <div className="mt-2">
        <GreenDialog
          title={rtl ? "إدخال الأصناف" : "Product entry"}
          footer={
            <>
              <button className={btnCls} onClick={() => { setF({ ...empty }); setSel(-1); }}>
                {rtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                className={btnGreenCls} style={{ background: "#0a5c2a" }}
                disabled={create.isPending || update.isPending} onClick={save}
              >
                {rtl ? "حفظ" : "Save"}
              </button>
            </>
          }
        >
          {err && <div className="mb-2 border border-red-800 bg-white px-2 py-1 text-[12px] text-red-700">{err}</div>}
          <div className="grid gap-x-4 lg:grid-cols-2">
            <div className="bg-white/10 p-2">
              <SahlField label={rtl ? "اسم الصنف" : "Name"}>
                <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "كود الصنف" : "SKU"}>
                <input className={inputCls} value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "التصنيف" : "Category"}>
                <select className={inputCls} value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
                  <option value="">—</option>
                  {(cats ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>)}
                </select>
              </SahlField>
              <SahlField label={rtl ? "الباركود" : "Barcode"}>
                <input className={inputCls} value={f.barcode} onChange={(e) => setF({ ...f, barcode: e.target.value })} />
              </SahlField>
            </div>
            <div className="bg-white/10 p-2">
              <SahlField label={rtl ? "سعر الشراء" : "Cost"}>
                <input type="number" min="0" className={inputCls} value={f.purchasePrice} onChange={(e) => setF({ ...f, purchasePrice: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "سعر البيع" : "Price"}>
                <input type="number" min="0" className={inputCls} value={f.salePrice} onChange={(e) => setF({ ...f, salePrice: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "الوحدة" : "Unit"}>
                <select className={inputCls} value={f.unitId} onChange={(e) => setF({ ...f, unitId: e.target.value })}>
                  <option value="">—</option>
                  {(units ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </SahlField>
              <SahlField label={rtl ? "حد الطلب" : "Reorder"}>
                <input type="number" min="0" className={inputCls} value={f.reorderLevel} onChange={(e) => setF({ ...f, reorderLevel: e.target.value })} />
              </SahlField>
            </div>
          </div>
          <div className="mt-2 grid gap-3 lg:grid-cols-2">
            <div className="bg-white p-2 text-black">
              <div className="mb-1 text-[12px] font-bold">{rtl ? "أرصدة المخازن" : "Warehouse stock"}</div>
              <div className="border border-[#888] text-[12px]">
                {(warehouses ?? []).map((w: any) => {
                  const b = (balances ?? []).find((x: any) => x.productId === selProduct?.id && x.warehouseId === w.id);
                  return (
                    <div key={w.id} className="flex justify-between border-b border-[#ddd] px-1 py-0.5">
                      <span>{w.name}</span><b>{b ? Number(b.quantity || 0) : 0}</b>
                    </div>
                  );
                })}
              </div>
              {selProduct && (
                <div className="mt-1 flex gap-1">
                  <select className={inputCls} value={opening.warehouseId} onChange={(e) => setOpening({ ...opening, warehouseId: e.target.value })}>
                    <option value="">—</option>
                    {(warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <input type="number" min="0" className={inputCls} value={opening.qty} onChange={(e) => setOpening({ ...opening, qty: e.target.value })} placeholder={rtl ? "افتتاحي" : "Opening"} />
                  <button className={btnCls} disabled={adjust.isPending} onClick={postOpening}>
                    {rtl ? "ترحيل" : "Post"}
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white p-2 text-black">
              <div className="mb-1 flex gap-2 text-[12px] font-bold">
                <button onClick={() => setTab("stock")} style={{ textDecoration: tab === "stock" ? "underline" : "none" }}>
                  {rtl ? "الأرصدة" : "Stock"}
                </button>
                <button onClick={() => setTab("moves")} style={{ textDecoration: tab === "moves" ? "underline" : "none" }}>
                  {rtl ? "الحركة" : "Movements"}
                </button>
              </div>
              {tab === "stock" ? (
                <div className="max-h-[120px] overflow-auto border border-[#888] text-[11px]">
                  {!selProduct ? "—" : (balances ?? []).filter((b: any) => b.productId === selProduct.id).map((b: any) => (
                    <div key={b.id} className="flex justify-between border-b border-[#eee] px-1 py-0.5">
                      <span>{b.warehouseName ?? b.warehouseId}</span>
                      <b>{Number(b.quantity || 0)}</b>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-[120px] overflow-auto border border-[#888] text-[11px]">
                  {!selProduct ? "—" : (moves ?? []).slice(0, 30).map((m: any) => (
                    <div key={m.id} className="flex justify-between border-b border-[#eee] px-1 py-0.5">
                      <span>{m.movementType} / {m.reference}</span>
                      <b>{Number(m.quantity || 0)}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GreenDialog>
      </div>
    </div>
  );
}
