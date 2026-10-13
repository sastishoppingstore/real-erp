import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { SahlField, SahlGrid, inputCls, btnCls, btnGreenCls } from "./ui";

// الإدارة: supervisor passcode, password change, JSON backup export,
// year summary (closing visibility, NO purge), shift open/close.
export default function SahlAdmin() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const [msg, setMsg] = useState("");
  const [pin, setPin] = useState("");
  const [pw, setPw] = useState({ old: "", nw: "", nw2: "" });
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [closeForm, setCloseForm] = useState({ counted: "", sales: "", expenses: "", notes: "" });

  const { data: hasPin } = trpc.sahl.supervisorHas.useQuery();
  const { data: shift } = trpc.sahl.shiftCurrent.useQuery();
  const { data: shifts } = trpc.sahl.shiftList.useQuery({ limit: 10 });
  const { data: yearSum } = trpc.sahl.yearSummary.useQuery({ year });

  const setPinM = trpc.sahl.supervisorSet.useMutation({
    onSuccess: () => { setPin(""); setMsg(T("✓ تم حفظ كلمة المشرف", "✓ Supervisor saved")); utils.sahl.supervisorHas.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  const pwM = trpc.sahl.changePasswordSelf.useMutation({
    onSuccess: () => { setPw({ old: "", nw: "", nw2: "" }); setMsg(T("✓ تم تغيير كلمة السر", "✓ Password changed")); },
    onError: (e) => setMsg(e.message),
  });
  const openM = trpc.sahl.shiftOpen.useMutation({
    onSuccess: () => { setMsg(T("✓ فتحت الوردية", "✓ Shift opened")); utils.sahl.shiftCurrent.invalidate(); utils.sahl.shiftList.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  const closeM = trpc.sahl.shiftClose.useMutation({
    onSuccess: (r: any) => {
      setMsg(`${T("أُغلقت الوردية", "Shift closed")} — ${T("المتوقع", "expected")}: ${r.expected} / ${T("المعدود", "counted")}: ${r.counted} / ${T("الفرق", "diff")}: ${r.diff}`);
      setCloseForm({ counted: "", sales: "", expenses: "", notes: "" });
      utils.sahl.shiftCurrent.invalidate(); utils.sahl.shiftList.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });
  const backupQ = trpc.sahl.backupExport.useQuery(undefined, { enabled: false });

  const doBackup = async () => {
    try {
      const data = await backupQ.refetch();
      const blob = new Blob([JSON.stringify(data.data, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sahl-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setMsg(T("✓ تم تنزيل النسخة", "✓ Backup downloaded"));
    } catch (e: any) {
      setMsg(e.message ?? String(e));
    }
  };

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("الإدارة والورديات", "Admin & shifts")}</b>
        {msg && <span className="ms-2 bg-white px-1 text-black">{msg}</span>}
      </div>
      <div className="grid gap-2 lg:grid-cols-2">
        <div className="border border-[#333] bg-[#111] p-2">
          <b>{T("كلمة سر المشرف", "Supervisor passcode")}</b>
          <div className="text-[11px] text-white/60">
            {T("الحالة", "Status")}: {(hasPin as any)?.set ? T("مضبوطة", "Set") : T("غير مضبوطة", "Not set")}
          </div>
          <div className="mt-1 flex gap-1">
            <input type="password" className={inputCls} style={{ width: 160 }} value={pin}
              onChange={(e) => setPin(e.target.value)} placeholder="••••" />
            <button className={btnGreenCls} style={{ background: "#0a5c2a" }}
              disabled={setPinM.isPending || pin.length < 4} onClick={() => setPinM.mutate({ password: pin })}>
              {T("حفظ", "Save")}
            </button>
          </div>
          <b className="mt-2 block">{T("تغيير كلمة السر", "Change password")}</b>
          <div className="mt-1 space-y-1">
            <SahlField label={T("الحالية", "Current")}>
              <input type="password" className={inputCls} value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} />
            </SahlField>
            <SahlField label={T("الجديدة", "New")}>
              <input type="password" className={inputCls} value={pw.nw} onChange={(e) => setPw({ ...pw, nw: e.target.value })} />
            </SahlField>
            <SahlField label={T("تأكيد", "Confirm")}>
              <input type="password" className={inputCls} value={pw.nw2} onChange={(e) => setPw({ ...pw, nw2: e.target.value })} />
            </SahlField>
            <button className={btnCls} disabled={pwM.isPending}
              onClick={() => {
                if (pw.nw.length < 4) { setMsg(T("الجديدة قصيرة", "New too short")); return; }
                if (pw.nw !== pw.nw2) { setMsg(T("التأكيد غير متطابق", "Mismatch")); return; }
                pwM.mutate({ oldPassword: pw.old, newPassword: pw.nw });
              }}>
              {T("تغيير", "Change")}
            </button>
          </div>
          <b className="mt-2 block">{T("نسخ احتياطي", "Backup")}</b>
          <button className={btnCls} onClick={doBackup}>
            {T("تنزيل نسخة JSON", "Download JSON backup")}
          </button>
          <div className="text-[11px] text-white/60">{T("بيانات المستأجر: أصناف/عملاء/فواتير (2000)/أسعار/سيريال/شيكات", "Tenant data: products/customers/invoices (2000)/prices/serials/cheques")}</div>
        </div>

        <div className="space-y-2">
          <div className="border border-[#333] bg-[#111] p-2">
            <b>{T("الوردية", "Shift")}</b>
            {(shift as any)?.id ? (
              <div className="mt-1 space-y-1">
                <div className="text-[11px] text-white/70">
                  {T("مفتوحة منذ", "Open since")}: {String((shift as any).openedAt ?? "").slice(0, 16).replace("T", " ")}
                  {" · "}{T("افتتاحي", "Opening")}: {Number((shift as any).openingBalance || 0)}
                </div>
                <div className="flex flex-wrap gap-1">
                  <input type="number" min="0" className={inputCls} style={{ width: 110 }} value={closeForm.counted}
                    onChange={(e) => setCloseForm({ ...closeForm, counted: e.target.value })} placeholder={T("المعدود", "Counted")} />
                  <input type="number" min="0" className={inputCls} style={{ width: 110 }} value={closeForm.sales}
                    onChange={(e) => setCloseForm({ ...closeForm, sales: e.target.value })} placeholder={T("المبيعات", "Sales")} />
                  <input type="number" min="0" className={inputCls} style={{ width: 110 }} value={closeForm.expenses}
                    onChange={(e) => setCloseForm({ ...closeForm, expenses: e.target.value })} placeholder={T("المصروفات", "Expenses")} />
                  <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={closeM.isPending}
                    onClick={() => closeForm.counted !== "" && closeM.mutate({
                      counted: Number(closeForm.counted),
                      daySales: Number(closeForm.sales) || 0,
                      dayExpenses: Number(closeForm.expenses) || 0,
                    })}>
                    {T("تقفيل الوردية", "Close shift")}
                  </button>
                </div>
              </div>
            ) : (
              <button className={btnGreenCls} style={{ background: "#0a5c2a" }} disabled={openM.isPending}
                onClick={() => openM.mutate({ openingBalance: 0 })}>
                {T("فتح وردية", "Open shift")}
              </button>
            )}
            <SahlGrid
              columns={[T("فتحت", "Opened"), T("أُغلقت", "Closed"), T("المعدود", "Counted"), T("الحالة", "Status")]}
              rows={((shifts ?? []) as any[]).slice(0, 10).map((s: any) => [
                String(s.openedAt ?? "").slice(0, 16).replace("T", " "),
                s.closedAt ? String(s.closedAt).slice(0, 16).replace("T", " ") : "—",
                s.closingCounted ?? "—", s.status,
              ])}
              emptyText={T("لا ورديات", "No shifts")}
            />
          </div>
          <div className="border border-[#333] bg-[#111] p-2">
            <b>{T("ملخص السنة (إغلاق بدون حذف)", "Year summary (close view, no purge)")}</b>
            <div className="mt-1 flex gap-1">
              <input className={inputCls} style={{ width: 100 }} value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="mt-1 text-[12px]">
              {T("الفواتير", "Invoices")}: <b>{(yearSum as any)?.invoiceCount ?? 0}</b>
              {" · "}{T("المبيعات", "Sales")}: <b>{Number((yearSum as any)?.salesTotal ?? 0).toFixed(2)}</b>
              {" · "}{T("قبض", "In")}: <b>{Number((yearSum as any)?.cashIn ?? 0).toFixed(2)}</b>
              {" · "}{T("صرف", "Out")}: <b>{Number((yearSum as any)?.cashOut ?? 0).toFixed(2)}</b>
            </div>
            <div className="mt-1 text-[11px] text-white/60">
              {T("حذف الفترات السابقة غير متاح حمايةً للسجلات (يتطلب نسخة + صلاحية عليا)",
                "History purge is disabled to protect ledgers (requires backup + top-level authorization)")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
