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
  purchasePrice: "", salePrice: "", minPrice: "", fixedDiscount: "",
  reorderLevel: 0, description: "",
  isTaxable: true, taxRate: "15", isActive: true, isSerialTracked: false,
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
  const [unitForm, setUnitForm] = useState({ unitName: "", factor: "1", salePrice: "" });
  const [editingUnit, setEditingUnit] = useState<number | null>(null);

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
  const { data: punits } = trpc.sahl.productUnitList.useQuery(
    selProduct ? { productId: selProduct.id } : undefined,
    { enabled: !!selProduct }
  );

  const refresh = () => {
    utils.inventory.productList.invalidate();
    utils.inventory.inventoryList.invalidate();
    utils.inventory.movementList.invalidate();
    utils.sahl.productUnitList.invalidate();
    utils.sahl.barcodeList.invalidate();
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
  const unitAdd = trpc.sahl.productUnitAdd.useMutation({
    onSuccess: () => { setUnitForm({ unitName: "", factor: "1", salePrice: "" }); setEditingUnit(null); refresh(); },
    onError: (e) => setErr(e.message),
  });
  const unitUpdate = trpc.sahl.productUnitUpdate.useMutation({
    onSuccess: () => { setUnitForm({ unitName: "", factor: "1", salePrice: "" }); setEditingUnit(null); refresh(); },
    onError: (e) => setErr(e.message),
  });
  const unitDelete = trpc.sahl.productUnitDelete.useMutation({
    onSuccess: () => refresh(),
    onError: (e) => setErr(e.message),
  });
  // Quick-add: create a Category / Unit straight from the product form when
  // the list is still empty (matches the supplier-style quick entry).
  const [catOpen, setCatOpen] = useState(false);
  const [catNew, setCatNew] = useState("");
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitNew, setUnitNew] = useState("");
  const catAdd = trpc.inventory.categoryCreate.useMutation({
    onSuccess: (res: any) => {
      utils.inventory.categoryList.invalidate();
      if (res?.id) setF((p: any) => ({ ...p, categoryId: String(res.id) }));
      setCatNew(""); setCatOpen(false);
    },
    onError: (e) => setErr(e.message),
  });
  const baseUnitAdd = trpc.inventory.unitCreate.useMutation({
    onSuccess: (res: any) => {
      utils.inventory.unitList.invalidate();
      if (res?.id) setF((p: any) => ({ ...p, unitId: String(res.id) }));
      setUnitNew(""); setUnitOpen(false);
    },
    onError: (e) => setErr(e.message),
  });

  const pick = (i: number) => {
    const r = (rows ?? [])[i];
    setSel(i);
    setErr("");
    setEditingUnit(null);
    setF({
      sku: r.sku ?? "", name: r.name ?? "", nameAr: r.nameAr ?? "",
      categoryId: r.categoryId ?? "", unitId: r.unitId ?? "", barcode: r.barcode ?? "",
      purchasePrice: r.purchasePrice ?? "", salePrice: r.salePrice ?? "",
      minPrice: (r as any).minPrice ?? "", fixedDiscount: (r as any).fixedDiscount ?? "",
      reorderLevel: r.reorderLevel ?? 0, description: r.description ?? "",
      isTaxable: r.isTaxable ?? true, taxRate: r.taxRate ?? "15",
      isActive: r.isActive ?? true, isSerialTracked: r.isSerialTracked ?? false,
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
      minPrice: f.minPrice === "" ? undefined : String(f.minPrice),
      fixedDiscount: f.fixedDiscount === "" ? undefined : String(f.fixedDiscount),
      reorderLevel: Number(f.reorderLevel) || 0,
      description: f.description || undefined,
      isTaxable: !!f.isTaxable, taxRate: String(f.taxRate ?? "15"),
      isActive: !!f.isActive, isSerialTracked: !!f.isSerialTracked,
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

  const [sortKey, setSortKey] = useState<"name" | "stock" | "profit">("name");
  const [showInactive, setShowInactive] = useState(false);
  const [lowOnly, setLowOnly] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const { data: barcodes } = trpc.sahl.barcodeList.useQuery(
    selProduct ? { productId: selProduct.id } : undefined, { enabled: !!selProduct });
  const barcodeAdd = trpc.sahl.barcodeAdd.useMutation({
    onSuccess: () => { setBarcodeInput(""); refresh(); }, onError: (e) => setErr(e.message),
  });
  const barcodeDel = trpc.sahl.barcodeDelete.useMutation({
    onSuccess: () => refresh(), onError: (e) => setErr(e.message),
  });
  const prodDelete = trpc.sahl.productDelete.useMutation({
    onSuccess: () => { setF({ ...empty }); setSel(-1); refresh(); }, onError: (e) => setErr(e.message),
  });

  const visible = list
    .filter((r: any) => (showInactive ? true : r.isActive !== false))
    .filter((r: any) => (!lowOnly || stockFor(r.id) <= Number(r.reorderLevel ?? 0)))
    .sort((a: any, b: any) => {
      if (sortKey === "stock") return stockFor(b.id) - stockFor(a.id);
      if (sortKey === "profit") return (Number(b.salePrice || 0) - Number(b.purchasePrice || 0)) - (Number(a.salePrice || 0) - Number(a.purchasePrice || 0));
      return String(a.nameAr || a.name).localeCompare(String(b.nameAr || b.name));
    });

  const doDelete = () => {
    if (!selProduct) return;
    if (!confirm(rtl ? `حذف الصنف ${selProduct.nameAr || selProduct.name}؟` : `Delete ${selProduct.name}?`)) return;
    prodDelete.mutate({ id: selProduct.id });
  };
  const toggleActive = () => {
    if (!selProduct) return;
    update.mutate({ id: selProduct.id, isActive: !(selProduct.isActive ?? true) });
  };

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
        <button className={btnCls} disabled={!selProduct || prodDelete.isPending} onClick={doDelete}>
          {rtl ? "حذف" : "Delete"}
        </button>
        <button className={btnCls} disabled={!selProduct} onClick={toggleActive}>
          {selProduct && selProduct.isActive === false ? (rtl ? "تفعيل" : "Activate") : (rtl ? "أرشفة" : "Archive")}
        </button>
        <label className="flex items-center gap-1 text-[11px] text-white/70">
          {rtl ? "ترتيب" : "Sort"}
          <select className={inputCls} style={{ width: 110 }} value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
            <option value="name">{rtl ? "الاسم" : "Name"}</option>
            <option value="stock">{rtl ? "الكمية" : "Qty"}</option>
            <option value="profit">{rtl ? "الربح" : "Profit"}</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-[11px] text-white/70">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          {rtl ? "تحت حد الطلب فقط" : "Below reorder only"}
        </label>
        <label className="flex items-center gap-1 text-[11px] text-white/70">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          {rtl ? "غير المستخدمة" : "Inactive too"}
        </label>
        <span className="text-[11px] text-white/60">{rtl ? "الأصناف" : "Items"}: {list.length}</span>
      </div>

      <SahlGrid
        columns={[
          rtl ? "الكود" : "SKU", rtl ? "الصنف" : "Name", rtl ? "الوحدة" : "Unit",
          rtl ? "الشراء" : "Cost", rtl ? "البيع" : "Price", rtl ? "الرصيد" : "Stock",
        ]}
        rows={visible.map((r: any) => [
          r.sku ?? "", r.nameAr || r.name, r.unitId ?? "",
          r.purchasePrice ?? 0, r.salePrice ?? 0, stockFor(r.id),
        ])}
        onSelect={(i) => {
          const r = visible[i];
          pick(list.indexOf(r));
        }}
        selected={selProduct ? visible.indexOf(selProduct) : -1}
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
                <div className="flex gap-1">
                  <select className={inputCls} value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
                    <option value="">—</option>
                    {(cats ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>)}
                  </select>
                  <button type="button" title={rtl ? "تصنيف جديد" : "New category"}
                    className={btnCls} onClick={() => setCatOpen((o) => !o)}>＋</button>
                </div>
                {catOpen && (
                  <div className="mt-1 flex gap-1">
                    <input autoFocus className={inputCls} value={catNew} onChange={(e) => setCatNew(e.target.value)}
                      placeholder={rtl ? "اسم التصنيف" : "Category name"} />
                    <button type="button" className={btnGreenCls} style={{ background: "#0a5c2a" }}
                      disabled={!catNew.trim() || catAdd.isPending}
                      onClick={() => catNew.trim() && catAdd.mutate({ name: catNew.trim() })}>
                      {rtl ? "إضافة" : "Add"}
                    </button>
                  </div>
                )}
              </SahlField>
              <SahlField label={rtl ? "الباركود" : "Barcode"}>
                <input className={inputCls} value={f.barcode} onChange={(e) => setF({ ...f, barcode: e.target.value })} />
              </SahlField>
              <div className="mb-1.5 border border-white/30 p-1">
                <div className="mb-1 text-[11px] font-bold text-white">{rtl ? "باركودات إضافية" : "Extra barcodes"}</div>
                {(barcodes ?? []).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between py-0.5 font-mono text-[12px] text-white">
                    <span>{b.barcode}</span>
                    <button className="border border-white/50 px-1 text-[11px]" onClick={() => barcodeDel.mutate({ id: b.id })}>✕</button>
                  </div>
                ))}
                {selProduct && (
                  <div className="mt-1 flex gap-1">
                    <input className={inputCls} value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder={rtl ? "باركود جديد" : "New barcode"} />
                    <button className={btnCls} disabled={barcodeAdd.isPending}
                      onClick={() => barcodeInput.trim() && selProduct && barcodeAdd.mutate({ productId: selProduct.id, barcode: barcodeInput.trim() })}>
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white/10 p-2">
              <SahlField label={rtl ? "سعر الشراء" : "Cost"}>
                <input type="number" min="0" className={inputCls} value={f.purchasePrice} onChange={(e) => setF({ ...f, purchasePrice: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "سعر البيع" : "Price"}>
                <input type="number" min="0" className={inputCls} value={f.salePrice} onChange={(e) => setF({ ...f, salePrice: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "أقل سعر بيع" : "Floor price"}>
                <input type="number" min="0" className={inputCls} value={f.minPrice} onChange={(e) => setF({ ...f, minPrice: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "خصم ثابت" : "Fixed disc"}>
                <input type="number" min="0" className={inputCls} value={f.fixedDiscount} onChange={(e) => setF({ ...f, fixedDiscount: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "الوحدة" : "Unit"}>
                <div className="flex gap-1">
                  <select className={inputCls} value={f.unitId} onChange={(e) => setF({ ...f, unitId: e.target.value })}>
                    <option value="">—</option>
                    {(units ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button type="button" title={rtl ? "وحدة جديدة" : "New unit"}
                    className={btnCls} onClick={() => setUnitOpen((o) => !o)}>＋</button>
                </div>
                {unitOpen && (
                  <div className="mt-1 flex gap-1">
                    <input autoFocus className={inputCls} value={unitNew} onChange={(e) => setUnitNew(e.target.value)}
                      placeholder={rtl ? "اسم الوحدة" : "Unit name"} />
                    <button type="button" className={btnGreenCls} style={{ background: "#0a5c2a" }}
                      disabled={!unitNew.trim() || baseUnitAdd.isPending}
                      onClick={() => unitNew.trim() && baseUnitAdd.mutate({ name: unitNew.trim() })}>
                      {rtl ? "إضافة" : "Add"}
                    </button>
                  </div>
                )}
              </SahlField>
              <SahlField label={rtl ? "حد الطلب" : "Reorder"}>
                <input type="number" min="0" className={inputCls} value={f.reorderLevel} onChange={(e) => setF({ ...f, reorderLevel: e.target.value })} />
              </SahlField>
            </div>
          </div>
          <div className="mt-2 grid gap-3 lg:grid-cols-2">
            <div className="bg-white p-2 text-black">
              <div className="mb-1 text-[12px] font-bold">
                {rtl ? "وحدات الصنف (الوحدة × المعامل = سعر البيع)" : "Product units (unit × factor = price)"}
              </div>
              <div className="border border-[#888] text-[12px]">
                <div className="flex justify-between border-b border-[#555] bg-[#eee] px-1 py-0.5">
                  <span>{rtl ? "الوحدة" : "Unit"}</span><span>×</span><span>{rtl ? "السعر" : "Price"}</span><span />
                </div>
                {!selProduct ? <div className="px-1 py-1 text-[#777]">{rtl ? "احفظ الصنف أولاً" : "Save the product first"}</div>
                  : (punits ?? []).map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between gap-1 border-b border-[#ddd] px-1 py-0.5">
                      <span>{u.unitName} × {Number(u.factor || 1)} = {Number(u.salePrice || 0)}</span>
                      <span className="flex gap-1">
                        <button className={btnCls} onClick={() => { setEditingUnit(u.id); setUnitForm({ unitName: u.unitName, factor: String(u.factor ?? 1), salePrice: String(u.salePrice ?? 0) }); }}>
                          {rtl ? "تعديل" : "Edit"}
                        </button>
                        <button className={btnCls} onClick={() => { if (confirm(rtl ? "حذف الوحدة؟" : "Delete unit?")) unitDelete.mutate({ id: u.id }); }}>
                          {rtl ? "حذف" : "Del"}
                        </button>
                      </span>
                    </div>
                  ))}
              </div>
              {selProduct && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <input className={inputCls} style={{ width: 90 }} value={unitForm.unitName} onChange={(e) => setUnitForm({ ...unitForm, unitName: e.target.value })} placeholder={rtl ? "وحدة" : "Unit"} />
                  <input type="number" min="0" className={inputCls} style={{ width: 70 }} value={unitForm.factor} onChange={(e) => setUnitForm({ ...unitForm, factor: e.target.value })} placeholder="×" />
                  <input type="number" min="0" className={inputCls} style={{ width: 90 }} value={unitForm.salePrice} onChange={(e) => setUnitForm({ ...unitForm, salePrice: e.target.value })} placeholder={rtl ? "السعر" : "Price"} />
                  <button className={btnCls} disabled={unitAdd.isPending || unitUpdate.isPending}
                    onClick={() => {
                      if (!unitForm.unitName.trim()) { setErr(rtl ? "اسم الوحدة مطلوب" : "Unit name required"); return; }
                      const p = { unitName: unitForm.unitName.trim(), factor: Number(unitForm.factor) || 1, salePrice: Number(unitForm.salePrice) || 0 };
                      if (editingUnit) unitUpdate.mutate({ id: editingUnit, ...p });
                      else unitAdd.mutate({ productId: selProduct.id, ...p });
                    }}>
                    {editingUnit ? (rtl ? "تعديل" : "Update") : (rtl ? "أضف وحدة" : "Add unit")}
                  </button>
                  {editingUnit && <button className={btnCls} onClick={() => { setEditingUnit(null); setUnitForm({ unitName: "", factor: "1", salePrice: "" }); }}>{rtl ? "إلغاء" : "Cancel"}</button>}
                </div>
              )}
            </div>
            <div className="bg-white p-2 text-black">
              <div className="mb-1 text-[12px] font-bold">{rtl ? "خيارات" : "Options"}</div>
              <label className="mb-1 flex items-center gap-2 text-[12px]">
                <input type="checkbox" checked={!!f.isTaxable} onChange={(e) => setF({ ...f, isTaxable: e.target.checked })} />
                {rtl ? "خاضع للضريبة" : "Taxable"}
              </label>
              <SahlField label={rtl ? "نسبة الضريبة %" : "Tax %"}>
                <input type="number" min="0" className={inputCls} value={f.taxRate} onChange={(e) => setF({ ...f, taxRate: e.target.value })} />
              </SahlField>
              <label className="mb-1 flex items-center gap-2 text-[12px]">
                <input type="checkbox" checked={!!f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} />
                {rtl ? "صنف نشط" : "Active"}
              </label>
              <label className="mb-1 flex items-center gap-2 text-[12px]">
                <input type="checkbox" checked={!!f.isSerialTracked} onChange={(e) => setF({ ...f, isSerialTracked: e.target.checked })} />
                {rtl ? "تتبع السيريال (Serial Number)" : "Serial tracking"}
              </label>
              <SahlField label={rtl ? "ملاحظات" : "Notes"}>
                <input className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
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
