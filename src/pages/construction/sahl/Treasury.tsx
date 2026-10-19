import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, btnGreenCls, SahlGrid } from "./ui";

// قسم الخزينة: live badges, daily running ledger, inter-drawer transfer
// (paired cashOut + cashIn with linked notes), expense analysis.
export default function SahlTreasury() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [msg, setMsg] = useState("");
  const [tr, setTr] = useState({ amount: "", notes: "" });

  const { data: bal } = trpc.cashbox.currentBalance.useQuery();
  const { data: ledger } = trpc.sahl.treasuryLedger.useQuery({ from, to, limit: 200 });
  const { data: exp } = trpc.sahl.expenseAnalysis.useQuery({ from, to });

  const cashOut = trpc.cashbox.cashOut.useMutation({ onError: (e) => setMsg(e.message) });
  const cashIn = trpc.cashbox.cashIn.useMutation({
    onSuccess: () => {
      setTr({ amount: "", notes: "" });
      setMsg(T("تم التحويل بين الخزائن", "Drawer transfer done"));
      utils.cashbox.currentBalance.invalidate();
      utils.sahl.treasuryLedger.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });

  const transferDrawers = async () => {
    const amt = Number(tr.amount);
    if (!(amt > 0)) { setMsg(T("أدخل المبلغ", "Enter amount")); return; }
    setMsg("");
    try {
      const tag = `TR-DRW-${Date.now()}`;
      await cashOut.mutateAsync({
        amount: String(amt), description: `${T("تحويل إلى خزينة", "Transfer to drawer")} ${tr.notes}`,
        paymentMethod: "cash", notes: tag,
      });
      await cashIn.mutateAsync({
        amount: String(amt), description: `${T("تحويل من خزينة", "Transfer from drawer")} ${tr.notes}`,
        paymentMethod: "cash", referenceType: "transfer", notes: tag,
      });
    } catch (e: any) {
      setMsg(e.message ?? String(e));
    }
  };

  const rows: any[] = Array.isArray(ledger) ? ledger : [];
  // Money-IN transaction types (cash sales count as money in) vs money-out.
  const IN_TYPES = ["cash_in", "sale", "customer_payment", "income", "opening_balance"];
  const dayNet = rows.reduce((a: number, r: any) => {
    const v = Number(r.amount || 0);
    return a + (IN_TYPES.includes(String(r.transactionType)) ? v : -v);
  }, 0);

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="border border-[#1d7a37] bg-[#2fae4e] px-3 py-1 font-bold text-white">
          {T("رصيد الخزينة الحالي", "Current cash")}: {Number((bal as any)?.balance ?? 0).toFixed(2)}
        </div>
        <div className="border border-[#888] bg-[#ffeb3b] px-3 py-1 font-bold text-black">
          {T("صافي حركة اليوم", "Day net")}: {dayNet.toFixed(2)}
        </div>
        <input type="date" className={inputCls} style={{ width: 150 }} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className={inputCls} style={{ width: 150 }} value={to} onChange={(e) => setTo(e.target.value)} />
        <button className={btnCls} onClick={() => navigate("/app/construction/sahl/cash")}>{T("صرف", "Pay")}</button>
        <button className={btnCls} onClick={() => navigate("/app/construction/sahl/receipts")}>{T("قبض", "Receive")}</button>
        <button className={btnCls} onClick={() => window.print()}>{T("طباعة", "Print")}</button>
        {msg && <span className="bg-white px-1 text-black">{msg}</span>}
      </div>

      <div className="grid gap-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SahlGrid
            columns={[T("التاريخ", "Date"), T("النوع", "Type"), T("المبلغ", "Amount"), T("الرصيد", "Balance"), T("البيان", "Desc")]}
            rows={rows.map((r: any) => [
              String(r.createdAt ?? "").slice(0, 16).replace("T", " "),
              r.transactionType, Number(r.amount || 0).toFixed(2),
              Number(r.running ?? r.balanceAfter ?? 0).toFixed(2), r.description ?? "",
            ])}
            emptyText={T("لا توجد حركة", "No movements")}
          />
        </div>
        <div className="space-y-2">
          <div className="border border-[#333] bg-[#111] p-2">
            <b>{T("تحويل من خزينة لأخرى", "Drawer-to-drawer transfer")}</b>
            <div className="mt-1 flex gap-1">
              <input type="number" min="0" className={inputCls} value={tr.amount}
                onChange={(e) => setTr({ ...tr, amount: e.target.value })} placeholder={T("المبلغ", "Amount")} />
              <input className={inputCls} value={tr.notes}
                onChange={(e) => setTr({ ...tr, notes: e.target.value })} placeholder={T("ملاحظات", "Notes")} />
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }}
                disabled={cashOut.isPending || cashIn.isPending} onClick={transferDrawers}>
                {T("تحويل", "Transfer")}
              </button>
            </div>
            <div className="mt-1 text-[11px] text-white/60">
              {T("يُنشئ سند صرف + سند قبض مرتبطين", "Creates a linked payment + receipt pair")}
            </div>
          </div>
          <div className="border border-[#333] bg-[#111] p-2">
            <b>{T("تحليل المصروفات", "Expense analysis")}</b>
            <div className="mt-1 text-[11px]">
              {T("الإجمالي", "Total")}: <b>{Number((exp as any)?.total ?? 0).toFixed(2)}</b>
              {" · "}{T("العدد", "Count")}: <b>{(exp as any)?.count ?? 0}</b>
            </div>
            {((exp as any)?.byCategory ?? []).map((c: any) => (
              <div key={c.category} className="flex justify-between border-b border-[#333] py-0.5 text-[12px]">
                <span>{c.category}</span><b>{Number(c.total || 0).toFixed(2)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
