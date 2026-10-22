import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { SahlField, SahlGrid, inputCls, btnCls, btnGreenCls } from "./ui";

// Vault: stocktaking, atomic transfers, item movement ledger,
// invoice archive search, cheques, installments, barcode labels, print themes.
type Tab = "stocktake" | "transfer" | "moves" | "archive" | "cheques" | "inst" | "labels" | "prints";

const VALID: Tab[] = ["stocktake", "transfer", "moves", "archive", "cheques", "inst", "labels", "prints"];

export function SahlVaultRoute() {
  const { tab } = useParams();
  return <SahlVault tab={VALID.includes(tab as Tab) ? (tab as Tab) : "stocktake"} />;
}

export default function SahlVault({ tab }: { tab: Tab }) {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const tabs: [Tab, string, string][] = [
    ["stocktake", "جرد المخزن", "Stocktake"],
    ["transfer", "تحويل مخزن", "Transfer"],
    ["moves", "حركة صنف", "Item moves"],
    ["archive", "أرشيف الفواتير", "Archive"],
    ["cheques", "الشيكات", "Cheques"],
    ["inst", "الأقساط", "Installments"],
    ["labels", "الباركود", "Labels"],
    ["prints", "الطباعة", "Prints"],
  ];
  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex flex-wrap gap-1">
        {tabs.map(([k, ar, en]) => (
          <TabBtn key={k} active={tab === k} label={rtl ? ar : en} href={`/app/construction/sahl/vault/${k}`} />
        ))}
      </div>
      {tab === "stocktake" && <Stocktake T={T} />}
      {tab === "transfer" && <Transfer T={T} />}
      {tab === "moves" && <Moves T={T} />}
      {tab === "archive" && <Archive T={T} />}
      {tab === "cheques" && <Cheques T={T} />}
      {tab === "inst" && <Inst T={T} />}
      {tab === "labels" && <Labels T={T} />}
      {tab === "prints" && <Prints T={T} />}
    </div>
  );
}

function TabBtn({ active, label, href }: { active: boolean; label: string; href: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className="border border-[#555] px-3 py-1 text-white"
      style={{ background: active ? "#2fae4e" : "#222" }}
    >
      {label}
    </button>
  );
}

function useMsg() {
  const [msg, setMsg] = useState("");
  return { msg, setMsg };
}

// ---- Stocktake: count session → adjustmentCreate (variance audited) ----
function Stocktake({ T }: { T: (a: string, e: string) => string }) {
  const utils = trpc.useUtils();
  const { msg, setMsg } = useMsg();
  const [wh, setWh] = useState("");
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<{ productId: number; name: string; qty: number; cost: number }[]>([]);
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const { data: products } = trpc.inventory.productList.useQuery(q ? { search: q } : undefined);
  const { data: sessions } = trpc.inventory.adjustmentList.useQuery();
  const { data: bals } = trpc.inventory.inventoryList.useQuery(
    wh ? { warehouseId: Number(wh) } : undefined, { enabled: !!wh });
  const sysQty = (pid: number) =>
    (bals ?? []).filter((b: any) => b.productId === pid)
      .reduce((a: number, b: any) => a + Number(b.quantity || 0), 0);
  // Default the warehouse so the "post" button is never dead.
  useEffect(() => {
    if (!wh && warehouses && warehouses.length) setWh(String(warehouses[0].id));
  }, [warehouses, wh]);
  const post = trpc.inventory.adjustmentCreate.useMutation({
    onSuccess: () => { setLines([]); setMsg(T("تم ترحيل الجرد", "Count posted")); utils.inventory.adjustmentList.invalidate(); utils.inventory.inventoryList.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  const counted = (pid: number) => lines.find((l) => l.productId === pid);
  return (
    <div>
      <div className="mb-1 border border-[#333] bg-[#111] p-1.5">
        <b>{T("جرد المخزن — أدخل الكمية المجردة المعتمدة", "Stocktake — enter approved counted qty")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
      </div>
      <div className="mb-1 flex flex-wrap gap-1">
        <select className={inputCls} style={{ width: 180 }} value={wh} onChange={(e) => setWh(e.target.value)}>
          <option value="">—</option>
          {(warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <input className={inputCls} style={{ width: 220 }} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={T("بحث صنف", "Search item")} />
        <span className="self-center text-[11px] text-white/60">
          {T("اترك الحقل فارغاً لعدم الاحتساب", "Leave a row empty to skip it")}
        </span>
      </div>
      <div className="max-h-[320px] overflow-auto">
      {(products ?? []).slice(0, 50).map((p: any) => {
        const cur = counted(p.id);
        return (
          <div key={p.id} className="flex items-center gap-1 border-b border-[#333] px-1 py-0.5">
            <span className="flex-1">{p.sku} — {p.nameAr || p.name}</span>
            <span className="text-[11px] text-white/60">{T("الدفتري", "System")}: {wh ? sysQty(p.id) : "—"}</span>
            <input type="number" min="0" step="1" className={inputCls} style={{ width: 90 }}
              placeholder={T("المجرد", "Counted")}
              value={cur ? String(cur.qty) : ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw.trim() === "") {
                  // empty = "not counted" (it used to post 0 and wipe the stock)
                  setLines((ls) => ls.filter((l) => l.productId !== p.id));
                  return;
                }
                const v = Number(raw);
                if (!Number.isFinite(v) || v < 0) return;
                setLines((ls) => [
                  ...ls.filter((l) => l.productId !== p.id),
                  { productId: p.id, name: p.nameAr || p.name, qty: Math.round(v), cost: Number(p.purchasePrice ?? 0) },
                ]);
              }} />
          </div>
        );
      })}
      </div>
      <div className="mt-1 flex gap-1">
        <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={post.isPending || !wh || !lines.length}
          onClick={() => post.mutate({
            adjustmentDate: new Date().toISOString().slice(0, 10), adjustmentType: "count",
            reason: T("جرد", "Count"), warehouseId: Number(wh),
            items: lines.map((l) => ({
              productId: l.productId, productName: l.name,
              quantity: Math.round(l.qty), unitCost: String(l.cost ?? 0),
            })),
          })}>
          {T("ترحيل الجرد", "Post count")}
        </button>
        <span className="self-center text-[11px] text-white/70">
          {T("الأسطر المحسوبة", "Counted lines")}: {lines.length}
        </span>
      </div>
      <div className="mt-2 text-[11px] text-white/60">{T("الجلسات السابقة", "Past sessions")}</div>
      <SahlGrid
        columns={[T("الرقم", "No."), T("التاريخ", "Date"), T("النوع", "Type")]}
        rows={(sessions ?? []).slice(0, 20).map((s: any) => [s.adjustmentNumber ?? s.id, String(s.date ?? "").slice(0, 10), s.adjustmentType ?? ""])}
        emptyText={T("لا توجد جلسات", "No sessions")}
      />
    </div>
  );
}

// ---- Atomic transfer ----
function Transfer({ T }: { T: (a: string, e: string) => string }) {
  const utils = trpc.useUtils();
  const { msg, setMsg } = useMsg();
  const [f, setF] = useState({ from: "", to: "", q: "", lines: [] as { productId: number; name: string; qty: number }[] });
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const { data: products } = trpc.inventory.productList.useQuery(f.q ? { search: f.q } : undefined);
  const { data: list } = trpc.inventory.transferList.useQuery();
  const { data: fromBals } = trpc.inventory.inventoryList.useQuery(
    f.from ? { warehouseId: Number(f.from) } : undefined, { enabled: !!f.from });
  const availFor = (pid: number) =>
    (fromBals ?? []).filter((b: any) => b.productId === pid)
      .reduce((a: number, b: any) => a + Number(b.quantity || 0), 0);
  const post = trpc.sahl.transferAtomic.useMutation({
    onSuccess: () => { setF({ from: "", to: "", q: "", lines: [] }); setMsg(T("تم التحويل", "Transferred")); utils.inventory.transferList.invalidate(); utils.inventory.inventoryList.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  return (
    <div>
      <div className="mb-1 border border-[#333] bg-[#111] p-1.5">
        <b>{T("تحويل البضاعة بين المخازن (ذري)", "Atomic warehouse transfer")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
      </div>
      <div className="mb-1 flex flex-wrap gap-1">
        <select className={inputCls} style={{ width: 160 }} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })}>
          <option value="">{T("من", "From")} —</option>
          {(warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select className={inputCls} style={{ width: 160 }} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })}>
          <option value="">{T("إلى", "To")} —</option>
          {(warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <input className={inputCls} style={{ width: 200 }} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })}
          placeholder={T("بحث صنف", "Search item")} />
      </div>
      {(products ?? []).slice(0, 6).map((p: any) => (
        <div key={p.id} className="flex items-center gap-1 border-b border-[#333] px-1 py-0.5">
          <span className="flex-1">{p.sku} — {p.nameAr || p.name}</span>
          <span className="text-[11px] text-white/60">{T("المتاح", "Avail")}: {f.from ? availFor(p.id) : "—"}</span>
          <input type="number" min="1" className={inputCls} style={{ width: 80 }}
            onChange={(e) => {
              const v = Number(e.target.value);
              setF((s) => ({ ...s, lines: [...s.lines.filter((l) => l.productId !== p.id), ...(v > 0 ? [{ productId: p.id, name: p.nameAr || p.name, qty: v }] : [])] }));
            }} />
        </div>
      ))}
      <div className="mt-1 text-[11px]">{T("الأسطر", "Lines")}: {f.lines.length}</div>
      <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={post.isPending || !f.from || !f.to || !f.lines.length}
        onClick={() => post.mutate({
          transferNumber: `TR-${Date.now()}`, fromWarehouseId: Number(f.from), toWarehouseId: Number(f.to),
          date: new Date().toISOString().slice(0, 10),
          items: f.lines.map((l) => ({ productId: l.productId, quantity: l.qty })),
        })}>
        {T("ترحيل التحويل", "Post transfer")}
      </button>
      <div className="mt-2 text-[11px] text-white/60">{T("التحويلات", "Transfers")}</div>
      <SahlGrid
        columns={[T("الرقم", "No."), T("من", "From"), T("إلى", "To"), T("التاريخ", "Date")]}
        rows={(list ?? []).slice(0, 20).map((t: any) => [t.transferNumber ?? t.id, t.fromWarehouseId, t.toWarehouseId, String(t.date ?? "").slice(0, 10)])}
        emptyText={T("لا توجد تحويلات", "No transfers")}
      />
    </div>
  );
}

// ---- Item movement ledger ----
function Moves({ T }: { T: (a: string, e: string) => string }) {
  const [q, setQ] = useState("");
  const [pid, setPid] = useState("");
  const [serial, setSerial] = useState("");
  const { data: products } = trpc.inventory.productList.useQuery(q ? { search: q } : undefined);
  const { data: moves } = trpc.inventory.movementList.useQuery(
    pid ? { productId: Number(pid) } : undefined, { enabled: !!pid });
  const { data: serials } = trpc.sahl.serialHistory.useQuery(
    serial.trim() ? { q: serial.trim() } : undefined, { enabled: serial.trim().length > 0 });
  return (
    <div>
      <div className="mb-1 flex flex-wrap gap-1">
        <input className={inputCls} style={{ width: 200 }} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={T("بحث صنف", "Search item")} />
        <select className={inputCls} style={{ width: 260 }} value={pid} onChange={(e) => setPid(e.target.value)}>
          <option value="">—</option>
          {(products ?? []).slice(0, 20).map((p: any) => <option key={p.id} value={p.id}>{p.sku} — {p.nameAr || p.name}</option>)}
        </select>
        <input className={inputCls} style={{ width: 180 }} value={serial} onChange={(e) => setSerial(e.target.value)}
          placeholder={T("بحث سيريال", "Serial search")} />
      </div>
      {serial.trim() ? (
        <SahlGrid
          columns={[T("السيريال", "Serial"), T("الصنف", "Item"), T("الحالة", "Status"), T("الفاتورة", "Invoice"), T("العميل", "Customer")]}
          rows={(serials ?? []).map((s: any) => [s.serial, s.productName ?? "", s.status, s.invoiceNumber ?? "", s.customerName ?? ""])}
          emptyText={T("لا نتائج", "No results")}
        />
      ) : (
        <SahlGrid
          columns={[T("التاريخ", "Date"), T("النوع", "Type"), T("المرجع", "Ref"), T("الكمية", "Qty")]}
          rows={(moves ?? []).slice(0, 100).map((m: any) => [String(m.createdAt ?? "").slice(0, 10), m.movementType, `${m.reference ?? ""}#${m.referenceId ?? ""}`, Number(m.quantity || 0)])}
          emptyText={T("اختر صنفاً", "Pick a product")}
        />
      )}
    </div>
  );
}

// ---- Invoices hub: tabs, filters, master-detail, totals, Excel ----
type DocTab = "sales" | "purchase" | "sales-return" | "quotations";
function Archive({ T }: { T: (a: string, e: string) => string }) {
  const [tab, setTab] = useState<DocTab>("sales");
  const [f, setF] = useState({ q: "", from: "", to: "" });
  const [selId, setSelId] = useState<number | null>(null);
  const { data: invoices } = trpc.sales.invoiceList.useQuery();
  const { data: pos } = trpc.purchase.poList.useQuery();
  const { data: quotes } = trpc.sales.quotationList.useQuery();
  const { data: credits } = trpc.sales.creditNoteList.useQuery();
  const { data: saleView } = trpc.sales.invoiceGet.useQuery(
    { id: selId ?? 0 }, { enabled: tab === "sales" && selId !== null });
  const { data: poView } = trpc.sahl.poDetail.useQuery(
    { id: selId ?? 0 }, { enabled: tab === "purchase" && selId !== null });
  const { data: qView } = trpc.sahl.quoteDetail.useQuery(
    { id: selId ?? 0 }, { enabled: tab === "quotations" && selId !== null });

  const inRange = (d: any) =>
    (!f.from || String(d ?? "") >= f.from) && (!f.to || String(d ?? "").slice(0, 10) <= f.to);
  const matchQ = (s: string) => !f.q.trim() || s.toLowerCase().includes(f.q.trim().toLowerCase());

  let headers: any[] = [];
  if (tab === "sales") headers = (invoices ?? []).filter((i: any) => inRange(i.date) && (matchQ(i.invoiceNumber ?? "") || matchQ(i.customerName ?? "") || matchQ(i.notes ?? "")));
  if (tab === "purchase") headers = (pos ?? []).filter((p: any) => inRange(p.date) && (matchQ(p.poNumber ?? "") || matchQ(p.notes ?? "")));
  if (tab === "sales-return") headers = (credits ?? []).filter((c: any) => inRange(c.date) && (matchQ(c.creditNoteNumber ?? "") || matchQ(c.reason ?? "")));
  if (tab === "quotations") headers = (quotes ?? []).filter((x: any) => inRange(x.date) && (matchQ(x.quotationNumber ?? "") || matchQ(x.notes ?? "")));

  const numOf = (h: any) => h.invoiceNumber ?? h.poNumber ?? h.creditNoteNumber ?? h.quotationNumber ?? h.id;
  const totalOf = (h: any) => Number(h.totalAmount ?? h.amount ?? 0);
  const sum = headers.reduce((a: number, h: any) => a + totalOf(h), 0);

  const detailLines: any[] =
    tab === "sales" ? ((saleView as any)?.items ?? []).map((it: any) => ({ name: it.description, qty: it.quantity, price: it.unitPrice, total: it.totalAmount }))
    : tab === "purchase" ? ((poView as any)?.items ?? []).map((it: any) => ({ name: it.productName || it.description, qty: it.quantity, price: it.unitPrice, total: it.totalAmount }))
    : tab === "quotations" ? ((qView as any)?.items ?? []).map((it: any) => ({ name: it.productName || it.description, qty: it.quantity, price: it.unitPrice, total: it.totalAmount }))
    : [];

  const exportExcel = () => {
    const rows = [
      ["#", T("الرقم", "No."), T("التاريخ", "Date"), T("الإجمالي", "Total")],
      ...headers.map((h: any, i: number) => [i + 1, numOf(h), String(h.date ?? "").slice(0, 10), totalOf(h).toFixed(2)]),
      ["", "", T("المجموع", "Sum"), sum.toFixed(2)],
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `archive-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tabs: [DocTab, string][] = [    ["sales", T("فواتير البيع", "Sales")], ["purchase", T("فواتير الشراء", "Purchases")],
    ["sales-return", T("مرتجع البيع", "Sales returns")], ["quotations", T("عروض الأسعار", "Quotations")],
  ];
  return (
    <div>
      <div className="mb-1 flex flex-wrap gap-1">
        {tabs.map(([k, lbl]) => (
          <button key={k} className="border border-[#555] px-3 py-1 text-white"
            style={{ background: tab === k ? "#2fae4e" : "#222" }}
            onClick={() => { setTab(k); setSelId(null); }}>
            {lbl}
          </button>
        ))}
      </div>
      <div className="mb-1 flex flex-wrap gap-1">
        <input className={inputCls} style={{ width: 220 }} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })}
          placeholder={T("رقم / عميل / ملحوظة", "No. / customer / memo")} />
        <input type="date" className={inputCls} style={{ width: 150 }} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
        <input type="date" className={inputCls} style={{ width: 150 }} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
        <button className={btnCls} onClick={exportExcel}>{T("تصدير إكسل", "Export Excel")}</button>
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة", "Print")}</button>
        <span className="border border-[#555] px-2 py-1">{T("المجموع", "Sum")}: <b>{sum.toFixed(2)}</b> ({headers.length})</span>
      </div>
      <SahlGrid
        columns={[T("الرقم", "No."), T("التاريخ", "Date"), T("الإجمالي", "Total"), T("الحالة", "Status")]}
        rows={headers.slice(0, 200).map((h: any) => [numOf(h), String(h.date ?? "").slice(0, 10), totalOf(h).toFixed(2), h.status ?? ""])}
        onSelect={(i) => setSelId(headers[i]?.id ?? null)}
        selected={selId !== null ? headers.findIndex((h: any) => h.id === selId) : -1}
        emptyText={T("لا توجد مستندات", "No documents")}
      />
      {selId !== null && detailLines.length > 0 && (
        <div className="mt-1 border border-[#888] bg-white p-1 text-[12px] text-black">
          <b>{T("عرض الأصناف", "Line items")}</b>
          {detailLines.map((l: any, i: number) => (
            <div key={i} className="flex justify-between border-b border-[#eee] px-1 py-0.5">
              <span>{l.name}</span>
              <span>{Number(l.qty || 0)} × {Number(l.price || 0)} = {Number(l.total || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Cheques ----
function Cheques({ T }: { T: (a: string, e: string) => string }) {
  const utils = trpc.useUtils();
  const { msg, setMsg } = useMsg();
  const [f, setF] = useState({ number: "", bank: "", amount: "", dueDate: "", notes: "", partyType: "customer", partyId: "" });
  const [st, setSt] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { data: rows } = trpc.sahl.chequeList.useQuery(st ? { status: st } : undefined);
  const { data: customers } = trpc.sales.customerList.useQuery();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const parties = f.partyType === "supplier" ? (suppliers ?? []) : (customers ?? []);
  const create = trpc.sahl.chequeCreate.useMutation({
    onSuccess: () => {
      setF({ number: "", bank: "", amount: "", dueDate: "", notes: "", partyType: f.partyType, partyId: "" });
      setSt(""); // drop the status filter so the new cheque is visible at once
      utils.sahl.chequeList.invalidate();
      setMsg(T("تم تسجيل الشيك", "Cheque registered"));
    },
    onError: (e) => setMsg(`${T("فشل تسجيل الشيك", "Cheque failed")}: ${e.message}`),
  });
  const setStatus = trpc.sahl.chequeSetStatus.useMutation({
    onSuccess: () => { utils.sahl.chequeList.invalidate(); setMsg(T("تم تحديث حالة الشيك", "Cheque status updated")); },
    onError: (e) => setMsg(e.message),
  });
  const dueText = (value: any) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    return d.toISOString().slice(0, 10);
  };
  const partyName = (c: any) => {
    if (!c.partyId) return "";
    const list = c.partyType === "supplier" ? (suppliers ?? []) : (customers ?? []);
    const hit = (list as any[]).find((x: any) => String(x.id) === String(c.partyId));
    return hit ? (hit.nameAr || hit.name) : String(c.partyId);
  };
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 border border-[#333] bg-[#111] p-1.5">
        <b>{T("تسجيل الشيكات ومتابعة تحصيلها", "Cheques & collection")}</b>
        <select className={inputCls} style={{ width: 130 }} value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">{T("الكل", "All")}</option>
          {["registered", "collected", "returned"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {msg && <span className="bg-white px-1 text-black">{msg}</span>}
      </div>
      <div className="mb-1 flex flex-wrap gap-1">
        <input className={inputCls} style={{ width: 120 }} value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} placeholder={T("الرقم", "No.")} />
        <input className={inputCls} style={{ width: 140 }} value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} placeholder={T("البنك", "Bank")} />
        <input type="number" min="0" step="any" className={inputCls} style={{ width: 110 }} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder={T("المبلغ", "Amount")} />
        <input type="date" className={inputCls} style={{ width: 150 }} value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
        <select className={inputCls} style={{ width: 120 }} value={f.partyType}
          onChange={(e) => setF({ ...f, partyType: e.target.value, partyId: "" })}>
          <option value="customer">{T("عميل", "Customer")}</option>
          <option value="supplier">{T("مورد", "Supplier")}</option>
        </select>
        <select className={inputCls} style={{ width: 170 }} value={f.partyId} onChange={(e) => setF({ ...f, partyId: e.target.value })}>
          <option value="">—</option>
          {(parties as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.nameAr || p.name}</option>)}
        </select>
        <input className={inputCls} style={{ width: 180 }} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder={T("ملاحظات", "Notes")} />
        <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={create.isPending}
          onClick={() => f.number.trim() && Number(f.amount) > 0
            ? create.mutate({
                number: f.number.trim(), bank: f.bank || undefined,
                partyType: f.partyType as "customer" | "supplier",
                partyId: f.partyId ? Number(f.partyId) : undefined,
                amount: Number(f.amount), dueDate: f.dueDate || undefined, notes: f.notes || undefined,
              })
            : setMsg(T("الرقم والمبلغ مطلوبان", "Number and amount required"))}>
          {create.isPending ? T("جارٍ الحفظ...", "Saving...") : T("تسجيل", "Register")}
        </button>
      </div>
      <SahlGrid
        columns={[T("الرقم", "No."), T("البنك", "Bank"), T("المبلغ", "Amount"), T("الاستحقاق", "Due"), T("الجهة", "Party"), T("الحالة", "Status"), T("ملاحظات", "Notes"), ""]}
        rows={(rows ?? []).map((c: any) => [
          c.number, c.bank ?? "", Number(c.amount || 0).toFixed(2), dueText(c.dueDate),
          partyName(c), c.status, c.notes ?? "", "",
        ])}
        emptyText={T("لا توجد شيكات", "No cheques")}
      />
      <div className="mt-1 flex flex-wrap gap-1">
        {(rows ?? []).filter((c: any) => c.status === "registered").slice(0, showAll ? 200 : 10).map((c: any) => (
          <span key={c.id} className="flex gap-1 border border-[#333] px-1 py-0.5">
            {c.number}
            <button className={btnCls} onClick={() => setStatus.mutate({ id: c.id, status: "collected" })}>{T("حُصل", "Collect")}</button>
            <button className={btnCls} onClick={() => setStatus.mutate({ id: c.id, status: "returned" })}>{T("رُجع", "Return")}</button>
          </span>
        ))}
        {(rows ?? []).filter((c: any) => c.status === "registered").length > 10 && !showAll && (
          <button className={btnCls} onClick={() => setShowAll(true)}>{T("المزيد", "More")}</button>
        )}
      </div>
    </div>
  );
}

// ---- Installments (uses existing installments router) ----
function Inst({ T }: { T: (a: string, e: string) => string }) {
  const utils = trpc.useUtils();
  const { msg, setMsg } = useMsg();
  const [f, setF] = useState({ customerId: "", totalAmount: "", count: "3", startDate: new Date().toISOString().slice(0, 10), profit: "0" });
  const [sel, setSel] = useState("");
  const { data: list } = trpc.installments.list.useQuery({ limit: 20 });
  const { data: customers } = trpc.sales.customerList.useQuery();
  const { data: detail } = trpc.installments.get.useQuery({ id: Number(sel) }, { enabled: !!sel });
  const create = trpc.installments.create.useMutation({
    onSuccess: () => { utils.installments.list.invalidate(); setMsg(T("تم إنشاء التقسيط", "Plan created")); },
    onError: (e) => setMsg(e.message),
  });
  const collect = trpc.installments.recordPayment.useMutation({
    onSuccess: () => { utils.installments.list.invalidate(); utils.installments.get.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  const { data: overdue } = trpc.installments.overdue.useQuery();
  return (
    <div>
      <div className="mb-1 border border-[#333] bg-[#111] p-1.5">
        <b>{T("تقسيط فاتورة ومتابعة تحصيل الأقساط", "Installments & collection")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
        <span className="ms-2 text-[11px] text-red-400">{T("متأخر", "Overdue")}: {(overdue as any)?.length ?? 0}</span>
      </div>
      <div className="mb-1 flex flex-wrap gap-1">
        <select className={inputCls} style={{ width: 170 }} value={f.customerId} onChange={(e) => setF({ ...f, customerId: e.target.value })}>
          <option value="">—</option>
          {(customers ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>)}
        </select>
        <input type="number" min="0" className={inputCls} style={{ width: 110 }} value={f.totalAmount} onChange={(e) => setF({ ...f, totalAmount: e.target.value })} placeholder={T("الإجمالي", "Total")} />
        <input type="number" min="1" className={inputCls} style={{ width: 70 }} value={f.count} onChange={(e) => setF({ ...f, count: e.target.value })} placeholder={T("العدد", "#")} />
        <input type="number" min="0" className={inputCls} style={{ width: 80 }} value={f.profit} onChange={(e) => setF({ ...f, profit: e.target.value })} placeholder={T("الربح %", "Profit %")} />
        <input type="date" className={inputCls} style={{ width: 150 }} value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} />
        <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={create.isPending}
          onClick={() => f.customerId && Number(f.totalAmount) > 0 && Number(f.count) > 0
            ? create.mutate({ customerId: Number(f.customerId), totalAmount: String(f.totalAmount), numberOfInstallments: Number(f.count), profitPercent: Number(f.profit) || 0, startDate: f.startDate })
            : setMsg(T("أكمل الحقول", "Fill fields"))}>
          {T("إنشاء", "Create")}
        </button>
      </div>
      <SahlGrid
        columns={[T("الرقم", "No."), T("العميل", "Customer"), T("الإجمالي", "Total"), T("المتبقي", "Left"), T("الحالة", "Status")]}
        rows={((list as any)?.data ?? []).map((p: any) => [p.installmentNumber, p.customerName ?? "", Number(p.totalAmount || 0).toFixed(2), Number(p.remainingAmount || 0).toFixed(2), p.status])}
        emptyText={T("لا توجد أقساط", "No plans")}
      />
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <select className={inputCls} style={{ width: 170 }} value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="">{T("اختر خطة للتحصيل", "Pick plan")}</option>
          {((list as any)?.data ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.installmentNumber}</option>)}
        </select>
      </div>
      {detail && (
        <div className="mt-1 border border-[#888] bg-white p-1 text-black">
          {((detail as any).payments ?? []).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between border-b border-[#eee] px-1 py-0.5 text-[12px]">
              <span>{p.paymentNumber} · {String(p.dueDate ?? "").slice(0, 10)} · {Number(p.amount || 0).toFixed(2)} · {p.status}</span>
              {p.status !== "paid" && (
                <button className={btnCls} onClick={() => collect.mutate({ installmentPaymentId: p.id, paidAmount: String(p.amount) })}>
                  {T("تحصيل", "Collect")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Barcode labels ----
function Labels({ T }: { T: (a: string, e: string) => string }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState("");
  const { data: products } = trpc.inventory.productList.useQuery(q ? { search: q } : undefined);
  const { data: label } = trpc.sahl.labelData.useQuery({ productId: Number(sel) }, { enabled: !!sel });
  return (
    <div>
      <div className="mb-1 flex gap-1">
        <input className={inputCls} style={{ width: 220 }} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={T("بحث بالباركود / الاسم", "Search barcode / name")} />
        <select className={inputCls} style={{ width: 260 }} value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="">—</option>
          {(products ?? []).slice(0, 20).map((p: any) => <option key={p.id} value={p.id}>{p.barcode || p.sku} — {p.nameAr || p.name}</option>)}
        </select>
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة الملصق", "Print label")}</button>
      </div>
      {label && (
        <div className="inline-block border-2 border-black bg-white p-3 text-center text-black">
          <div className="text-[16px] font-bold">{(label as any).name}</div>
          <div className="font-mono text-[22px] tracking-widest">*{(label as any).barcode}*</div>
          <div className="text-[14px] font-bold">{Number((label as any).price || 0).toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}

// ---- Print themes (existing invoiceTheme backend) ----
function Prints({ T }: { T: (a: string, e: string) => string }) {
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const { msg, setMsg } = useMsg();
  const { data: themesQ } = trpc.invoiceTheme.list.useQuery();
  const themes: any[] = Array.isArray(themesQ) ? themesQ : [];
  const setDefault = trpc.invoiceTheme.setDefault.useMutation({
    onSuccess: () => { utils.invoiceTheme.list.invalidate(); setMsg(T("تم", "Done")); },
    onError: (e) => setMsg(e.message),
  });
  return (
    <div>
      <div className="mb-1 border border-[#333] bg-[#111] p-1.5">
        <b>{T("تصميم نماذج الطباعة", "Print templates")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
        <button className="ms-2 border border-[#555] bg-[#2fae4e] px-2 py-0.5 text-white" onClick={() => navigate("/app/construction/sahl/prints")}>
          {T("المصمم الكامل", "Full designer")}
        </button>
      </div>
      <SahlGrid
        columns={[T("الاسم", "Name"), T("النوع", "Kind"), T("افتراضي", "Default"), ""]}
        rows={themes.map((t: any) => [t.name ?? t.themeKey ?? t.id, t.kind ?? t.type ?? "", t.isDefault ? "✓" : "", ""])}
        emptyText={T("لا توجد قوالب", "No templates")}
      />
      <div className="mt-1 flex flex-wrap gap-1">
        {themes.map((t: any) => (
          typeof t.id === "number" ? (
            <button key={t.id} className={btnCls} onClick={() => setDefault.mutate({ themeId: t.id })}>
              {T("افتراضي", "Default")}: {t.name ?? t.id}
            </button>
          ) : (
            <span key={t.themeKey ?? t.name} className="border border-[#555] px-3 py-1 text-[12px] text-white/60" title={T("قالب جاهز", "Built-in theme")}>
              {t.name ?? t.themeKey}
            </span>
          )
        ))}
      </div>
      <div className="mt-1 text-[11px] text-white/60">
        {T("التصميم الكامل (شعار/ألوان/أعمدة/توقيع) من صفحة قوالب الفواتير — excelRouter يصدّر الفواتير لإكسل",
          "Full design (logo/colors/columns/signature) lives in the invoice-theme page — excelRouter exports invoices to Excel")}
      </div>
    </div>
  );
}
