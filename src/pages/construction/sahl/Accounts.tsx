import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import {
  GreenDialog, SahlField, SahlGrid, inputCls, btnCls, btnGreenCls,
} from "./ui";

// SCR-005: green account dialog over workspace. Customers via sales.*,
// suppliers via purchase.*. Statement = invoices + payments (real ledgers).
export default function SahlAccounts() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [kind, setKind] = useState<"customer" | "supplier">("customer");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(-1);
  const [err, setErr] = useState("");
  const [f, setF] = useState<any>({
    name: "", nameAr: "", phone: "", email: "", address: "", addressAr: "",
    taxNumber: "", crNumber: "", openingBalance: "", notes: "",
  });

  const { data: customers } = trpc.sales.customerList.useQuery(q && kind === "customer" ? { search: q } : undefined);
  const { data: suppliers } = trpc.purchase.supplierList.useQuery(q && kind === "supplier" ? { search: q } : undefined);
  const list = (kind === "customer" ? customers : suppliers) ?? [];
  const selRow: any = sel >= 0 ? list[sel] : null;

  const { data: custInvoices } = trpc.sales.invoiceList.useQuery(
    selRow && kind === "customer" ? { customerId: selRow.id } : undefined,
    { enabled: !!selRow && kind === "customer" }
  );
  const { data: custPayments } = trpc.sales.paymentList.useQuery(
    selRow && kind === "customer" ? { customerId: selRow.id } : undefined,
    { enabled: !!selRow && kind === "customer" }
  );

  const refresh = () => {
    utils.sales.customerList.invalidate();
    utils.purchase.supplierList.invalidate();
    utils.sales.invoiceList.invalidate();
    utils.sales.paymentList.invalidate();
  };
  const createCustomer = trpc.sales.customerCreate.useMutation({
    onSuccess: () => { reset(); refresh(); }, onError: (e) => setErr(e.message),
  });
  const updateCustomer = trpc.sales.customerUpdate.useMutation({
    onSuccess: () => refresh(), onError: (e) => setErr(e.message),
  });
  const createSupplier = trpc.purchase.supplierCreate.useMutation({
    onSuccess: () => { reset(); refresh(); }, onError: (e) => setErr(e.message),
  });
  const updateSupplier = trpc.purchase.supplierUpdate.useMutation({
    onSuccess: () => refresh(), onError: (e) => setErr(e.message),
  });

  const reset = () => {
    setF({
      name: "", nameAr: "", phone: "", email: "", address: "", addressAr: "",
      taxNumber: "", crNumber: "", openingBalance: "", notes: "",
    });
    setSel(-1);
    setErr("");
  };

  const pick = (i: number) => {
    const r: any = list[i];
    setSel(i);
    setErr("");
    setF({
      name: r.name ?? "", nameAr: r.nameAr ?? "", phone: r.phone ?? r.mobile ?? "",
      email: r.email ?? "", address: r.address ?? "", addressAr: r.addressAr ?? "",
      taxNumber: r.taxNumber ?? r.vatNumber ?? "", crNumber: r.crNumber ?? "",
      openingBalance: r.openingBalance ?? r.creditLimit ?? "", notes: r.notes ?? "",
    });
  };

  const save = () => {
    setErr("");
    if (!f.name?.trim()) { setErr(rtl ? "اسم الحساب مطلوب" : "Account name required"); return; }
    if (kind === "customer") {
      const p = {
        name: f.name.trim(), nameAr: f.nameAr || undefined, phone: f.phone || undefined,
        email: f.email || undefined, address: f.address || undefined, addressAr: f.addressAr || undefined,
        taxNumber: f.taxNumber || undefined, crNumber: f.crNumber || undefined,
        openingBalance: f.openingBalance === "" ? undefined : String(f.openingBalance),
        notes: f.notes || undefined,
      };
      if (selRow) updateCustomer.mutate({ id: selRow.id, ...p });
      else createCustomer.mutate(p as any);
    } else {
      const p = {
        name: f.name.trim(), nameAr: f.nameAr || undefined, phone: f.phone || undefined,
        email: f.email || undefined, address: f.address || undefined,
        taxNumber: f.taxNumber || undefined, notes: f.notes || undefined,
      };
      if (selRow) updateSupplier.mutate({ id: selRow.id, ...p });
      else createSupplier.mutate(p as any);
    }
  };

  const balance = kind === "customer" && selRow
    ? Number(selRow.openingBalance || 0) +
      (custInvoices ?? []).reduce((a: number, i: any) => a + Number(i.balanceDue || 0), 0)
    : null;

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex flex-wrap items-center gap-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{rtl ? "إدخال العملاء والموردين" : "Customers & suppliers"}</b>
        <button className={btnCls} onClick={() => { setKind("customer"); reset(); }}
          style={kind === "customer" ? { background: "#2fae4e", color: "#fff" } : undefined}>
          {rtl ? "عميل" : "Customer"}
        </button>
        <button className={btnCls} onClick={() => { setKind("supplier"); reset(); }}
          style={kind === "supplier" ? { background: "#2fae4e", color: "#fff" } : undefined}>
          {rtl ? "مورد" : "Supplier"}
        </button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={rtl ? "بحث" : "Search"}
          className={inputCls} style={{ width: 200 }} />
        <button className={btnCls} onClick={reset}>{rtl ? "جديد" : "New"}</button>
        {balance !== null && (
          <span className="text-[11px] text-white/70">{rtl ? "الرصيد" : "Balance"}: <b className="text-white">{balance.toFixed(2)}</b></span>
        )}
      </div>

      <SahlGrid
        columns={[rtl ? "الاسم" : "Name", rtl ? "الهاتف" : "Phone", rtl ? "الضريبي" : "Tax No"]}
        rows={list.map((r: any) => [r.nameAr || r.name, r.phone ?? r.mobile ?? "", r.taxNumber ?? r.vatNumber ?? ""])}
        onSelect={pick}
        selected={sel}
        emptyText={rtl ? "لا توجد حسابات" : "No accounts"}
      />

      <div className="mt-2">
        <GreenDialog
          title={kind === "customer"
            ? rtl ? "بطاقة عميل" : "Customer card"
            : rtl ? "بطاقة مورد" : "Supplier card"}
          footer={
            <>
              <button className={btnCls} onClick={reset}>{rtl ? "إلغاء" : "Cancel"}</button>
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }}
                disabled={createCustomer.isPending || updateCustomer.isPending || createSupplier.isPending || updateSupplier.isPending}
                onClick={save}>
                {rtl ? "حفظ" : "Save"}
              </button>
            </>
          }
        >
          {err && <div className="mb-2 border border-red-800 bg-white px-2 py-1 text-[12px] text-red-700">{err}</div>}
          <div className="grid gap-x-4 lg:grid-cols-2">
            <div className="bg-white/10 p-2">
              <SahlField label={rtl ? "الاسم" : "Name"}>
                <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "الاسم عربي" : "Arabic"}>
                <input className={inputCls} value={f.nameAr} onChange={(e) => setF({ ...f, nameAr: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "الهاتف" : "Phone"}>
                <input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "البريد" : "Email"}>
                <input className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              </SahlField>
            </div>
            <div className="bg-white/10 p-2">
              <SahlField label={rtl ? "العنوان" : "Address"}>
                <input className={inputCls} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "الرقم الضريبي" : "Tax No"}>
                <input className={inputCls} value={f.taxNumber} onChange={(e) => setF({ ...f, taxNumber: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "السجل التجاري" : "CR"}>
                <input className={inputCls} value={f.crNumber} onChange={(e) => setF({ ...f, crNumber: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "الرصيد الافتتاحي" : "Opening"}>
                <input type="number" className={inputCls} value={f.openingBalance} onChange={(e) => setF({ ...f, openingBalance: e.target.value })} />
              </SahlField>
            </div>
          </div>
          <div className="mt-2 bg-white/10 p-2">
            <SahlField label={rtl ? "ملاحظات" : "Notes"}>
              <input className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
            </SahlField>
          </div>
          {kind === "customer" && selRow && (
            <div className="mt-2 bg-white p-2 text-[12px] text-black">
              <b>{rtl ? "كشف حساب" : "Statement"} — {(custInvoices ?? []).length} {rtl ? "فواتير" : "invoices"} · {(custPayments ?? []).length} {rtl ? "مدفوعات" : "payments"}</b>
              <div className="mt-1 max-h-[120px] overflow-auto border border-[#888]">
                {(custInvoices ?? []).slice(0, 20).map((i: any) => (
                  <div key={i.id} className="flex justify-between border-b border-[#eee] px-1 py-0.5">
                    <span>{i.invoiceNumber} · {String(i.date ?? "").slice(0, 10)}</span>
                    <span>{Number(i.totalAmount || 0).toFixed(2)} / {rtl ? "المتبقي" : "due"} {Number(i.balanceDue || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GreenDialog>
      </div>
    </div>
  );
}
