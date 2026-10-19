import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, SahlGrid } from "./ui";

// SCR-008: sparse right-aligned white form, red heading.
// Receipts→cashbox.cashIn, payments/expenses→cashOut/addExpense.
// Balance computed from ledger (currentBalance), never hand-entered.
export default function SahlCash({ mode }: { mode: "receipt" | "payment" }) {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [params] = useSearchParams();
  const [f, setF] = useState({
    amount: "", description: "", category: "", method: "cash", ref: "", project: "",
    accountId: params.get("accountId") ?? "",
    accountKind: params.get("kind") === "supplier" ? "supplier" : "customer",
  });
  const [msg, setMsg] = useState("");
  const [autoPrint, setAutoPrint] = useState(false);
  const lastStay = useRef(false);

  const { data: bal } = trpc.cashbox.currentBalance.useQuery();
  const { data: txns } = trpc.cashbox.transactionList.useQuery({ limit: 20 });
  const { data: today } = trpc.cashbox.todaySummary.useQuery();

  const refresh = () => {
    utils.cashbox.currentBalance.invalidate();
    utils.cashbox.transactionList.invalidate();
    utils.cashbox.todaySummary.invalidate();
  };
  const showSaved = (stay: boolean) => {
    setMsg(rtl ? "✓ تم الحفظ" : "✓ Saved");
    if (!stay) setF({ amount: "", description: "", category: "", method: "cash", ref: "", project: "", accountId: f.accountId, accountKind: f.accountKind });
    if (autoPrint) window.print();
    refresh();
  };
  const showErr = (e: any) => setMsg(e.message ?? String(e));
  const cashIn = trpc.cashbox.cashIn.useMutation({ onSuccess: () => showSaved(lastStay.current), onError: showErr });
  const cashOut = trpc.cashbox.cashOut.useMutation({ onSuccess: () => showSaved(lastStay.current), onError: showErr });
  const addExpense = trpc.cashbox.addExpense.useMutation({ onSuccess: () => showSaved(lastStay.current), onError: showErr });
  const payCreate = trpc.sales.paymentCreate.useMutation({ onSuccess: () => showSaved(lastStay.current), onError: showErr });

  const { data: customers } = trpc.sales.customerList.useQuery();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const parties: any[] = f.accountKind === "customer" ? customers ?? [] : suppliers ?? [];
  const partyName = parties.find((a: any) => String(a.id) === String(f.accountId))?.name ?? "";

  const save = (stay: boolean, expense: boolean) => {
    setMsg("");
    if (!(Number(f.amount) > 0)) { setMsg(rtl ? "أدخل مبلغاً صحيحاً" : "Enter a valid amount"); return; }
    if (!f.description.trim()) { setMsg(rtl ? "أدخل البيان" : "Enter description"); return; }
    lastStay.current = stay;
    const extras = [
      partyName ? `${rtl ? "الحساب" : "Account"}: ${partyName}` : "",
      f.project.trim() ? `${rtl ? "المشروع" : "Project"}: ${f.project.trim()}` : "",
      f.ref || "",
    ].filter(Boolean).join(" — ");
    const base = {
      amount: String(f.amount), description: f.description.trim(),
      paymentMethod: f.method as any, notes: extras || undefined,
    };
    if (mode === "receipt") {
      // A receipt from a customer must also settle their open invoice and show
      // up in the account statement — otherwise the due never goes down.
      if (f.accountKind === "customer" && f.accountId) {
        const custId = Number(f.accountId);
        (async () => {
          try {
            let invId: number | undefined;
            try {
              const invs: any[] = ((await utils.sales.invoiceList.fetch({ customerId: custId })) as any[]) ?? [];
              const open = invs.filter((i: any) => Number(i.balanceDue || 0) > 0.001)
                .sort((a: any, b: any) => String(a.date || "").localeCompare(String(b.date || "")))[0];
              invId = open ? Number(open.id) : undefined;
            } catch { /* no open invoice — record the receipt anyway */ }
            await payCreate.mutateAsync({
              paymentNumber: `RC-${String(Date.now()).slice(-9)}`,
              customerId: custId,
              ...(invId ? { invoiceId: invId } : {}),
              date: new Date().toISOString().slice(0, 10),
              amount: String(f.amount),
              paymentMethod: (f.method === "card" ? "card" : f.method === "cash" ? "cash"
                : f.method === "cheque" ? "cheque" : "bank_transfer") as any,
              notes: [base.description, extras].filter(Boolean).join(" — ") || undefined,
            });
            utils.sales.paymentList.invalidate();
            utils.sales.invoiceList.invalidate();
          } catch (e: any) { showErr(e); }
        })();
        return;
      }
      cashIn.mutate({
        ...base,
        ...(f.accountId ? { referenceType: f.accountKind, referenceId: Number(f.accountId) } : {}),
      });
    }
    else if (expense) addExpense.mutate({ ...base, category: f.category || undefined });
    else {
      cashOut.mutate({
        ...base,
        ...(f.accountId ? { referenceType: f.accountKind, referenceId: Number(f.accountId) } : {}),
      });
    }
  };

  const title = mode === "receipt" ? (rtl ? "المقبوضات" : "Receipts") : (rtl ? "المدفوعات والمصروفات" : "Payments & expenses");
  const T = (ar: string, en: string) => (rtl ? ar : en);

  return (
    <div className="min-h-full bg-black p-2">
      <div className="ms-auto w-full max-w-[560px] border border-[#999] bg-white text-[12px] text-black">
        <div className="border-b px-3 py-1.5 text-[14px] font-bold text-red-700">{title}</div>
        <div className="space-y-2 p-3">
          <div className="border border-[#888] bg-[#ffeb3b] px-2 py-1 font-bold">
            {T("الرصيد الحالي", "Current balance")}: {Number((bal as any)?.balance ?? 0).toFixed(2)}
            {today ? <span className="font-normal"> · {T("اليوم", "today")}: +{Number((today as any)?.cashIn?.total ?? 0).toFixed(0)} / −{(Number((today as any)?.cashOut?.total ?? 0) + Number((today as any)?.expenses?.total ?? 0)).toFixed(0)}</span> : null}
          </div>
          {msg && <div className="border border-[#888] bg-[#f5f5f5] px-2 py-1">{msg}</div>}
          <label className="flex items-center gap-2"><span className="w-24 shrink-0">{T("المبلغ", "Amount")}</span>
            <input type="number" min="0" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></label>
          <label className="flex items-center gap-2"><span className="w-24 shrink-0">{T("البيان", "Description")}</span>
            <input className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
          <label className="flex items-center gap-2"><span className="w-24 shrink-0">{T("الحساب", "Account")}</span>
            <span className="flex flex-1 gap-1">
              <select className={inputCls} style={{ width: 90 }} value={f.accountKind} onChange={(e) => setF({ ...f, accountKind: e.target.value, accountId: "" })}>
                <option value="customer">{T("عميل", "Cust")}</option>
                <option value="supplier">{T("مورد", "Supp")}</option>
              </select>
              <select className={inputCls} value={f.accountId} onChange={(e) => setF({ ...f, accountId: e.target.value })}>
                <option value="">—</option>
                {parties.map((a: any) => <option key={a.id} value={a.id}>{a.nameAr || a.name}</option>)}
              </select>
            </span></label>
          <label className="flex items-center gap-2"><span className="w-24 shrink-0">{T("المشروع", "Project")}</span>
            <input className={inputCls} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })}
              placeholder={T("تسجيل مصروف للمشروع", "Project expense")} /></label>
          {mode === "payment" && (
            <label className="flex items-center gap-2"><span className="w-24 shrink-0">{T("بند المصروف", "Item")}</span>
              <input className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></label>
          )}
          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-2"><span className="w-24 shrink-0">{T("الطريقة", "Method")}</span>
              <select className={inputCls} value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
                {["cash", "card", "transfer", "cheque", "wallet", "other"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select></label>
            <label className="flex flex-1 items-center gap-2"><span className="w-24 shrink-0">{T("مرجع", "Ref")}</span>
              <input className={inputCls} value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value })} /></label>
          </div>
          <label className="flex items-center gap-2"><span className="w-24 shrink-0">{T("التاريخ", "Date")}</span>
            <input type="date" className={inputCls} defaultValue={new Date().toISOString().slice(0, 10)} disabled
              title={T("يُستخدم تاريخ الخادم حفاظاً على ترتيب الأرصدة", "Server date is used to keep balances ordered")} /></label>
          <div className="flex flex-wrap gap-1">
            <button className={btnCls} disabled={cashIn.isPending || cashOut.isPending || addExpense.isPending}
              onClick={() => save(false, false)}>{T("حفظ", "Save")}</button>
            <button className={btnCls} onClick={() => save(true, false)}>{T("حفظ + جديد", "Save + new")}</button>
            {mode === "payment" && (
              <button className={btnCls} onClick={() => save(false, true)}>{T("حفظ كمصروف", "Save as expense")}</button>
            )}
            <label className="flex items-center gap-1 text-[12px]">
              <input type="checkbox" checked={autoPrint} onChange={(e) => setAutoPrint(e.target.checked)} />
              {T("طباعة", "Print")}
            </label>
            <button className={btnCls} onClick={() => setF({ amount: "", description: "", category: "", method: "cash", ref: "", project: "", accountId: "", accountKind: "customer" })}>
              {T("إلغاء", "Cancel")}
            </button>
          </div>
        </div>
        <SahlGrid
          columns={[T("التاريخ", "Date"), T("النوع", "Type"), T("المبلغ", "Amount"), T("البيان", "Description")]}
          rows={((txns as any)?.data ?? []).filter((t: any) => mode === "receipt" ? t.transactionType === "cash_in" : t.transactionType !== "cash_in")
            .map((t: any) => [String(t.createdAt ?? "").slice(0, 10), t.transactionType, Number(t.amount || 0).toFixed(2), t.description ?? ""])}
          emptyText={T("لا توجد حركات", "No movements")}
        />
      </div>
    </div>
  );
}
