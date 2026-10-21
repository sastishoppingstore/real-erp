import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import {
  GreenDialog, WhiteDialog, SectionHead, SahlGrid, SahlField, inputCls, btnCls, btnGreenCls,
} from "./ui";

// Sahl contractors screen. Reads and writes the same `subcontractors` and
// `subcontractor_payments` tables as the classic subcontractor pages, so the
// data is shared with the old module (no separate store).
const today = () => new Date().toISOString().slice(0, 10);

const emptyContractor = {
  code: "",
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  trade: "",
  licenseNumber: "",
  contractAmount: "",
  paidAmount: "",
  retentionPercent: "10",
  isActive: true,
  notes: "",
};

const emptyPayment = {
  subcontractorId: "",
  projectId: "",
  paymentNumber: "",
  paymentDate: today(),
  invoiceReference: "",
  grossAmount: "",
  retentionDeducted: "",
  advanceRecovery: "",
  penalties: "",
  otherDeductions: "",
  netAmount: "",
  paidAmount: "",
  paymentMethod: "bank_transfer",
  bankReference: "",
  status: "pending",
  notes: "",
};

const money = (v: unknown) =>
  Number(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SahlContractors() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const utils = trpc.useUtils();

  const [tab, setTab] = useState<"contractors" | "payments">("contractors");
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<number | null>(null);
  const [f, setF] = useState<any>({ ...emptyContractor });
  const [pay, setPay] = useState<any>({ ...emptyPayment });
  const [err, setErr] = useState("");

  const { data: subs } = trpc.construction.subcontractorList.useQuery();
  const { data: projects } = trpc.construction.projectList.useQuery(undefined, {
    enabled: tab === "payments",
  });
  const { data: payments } = trpc.construction.subcontractorPaymentList.useQuery(undefined, {
    enabled: tab === "payments",
  });

  const list = (subs ?? []) as any[];
  const selRow = list.find((r) => r.id === selId) ?? null;
  const term = q.trim().toLowerCase();
  const visible = term
    ? list.filter((r) =>
        [r.code, r.name, r.trade, r.contactPerson, r.phone]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term)))
    : list;

  const refresh = () => {
    utils.construction.subcontractorList.invalidate();
    utils.construction.subcontractorPaymentList.invalidate();
  };

  const createM = trpc.construction.subcontractorCreate.useMutation({ onSuccess: refresh });
  const updateM = trpc.construction.subcontractorUpdate.useMutation({
    onSuccess: refresh,
    onError: (e) => setErr(e.message),
  });
  const payCreateM = trpc.construction.subcontractorPaymentCreate.useMutation({ onSuccess: refresh });

  const reset = () => {
    setF({ ...emptyContractor });
    setSelId(null);
    setErr("");
  };

  const pick = (r: any) => {
    setSelId(r.id);
    setErr("");
    setF({
      code: r.code ?? "",
      name: r.name ?? "",
      contactPerson: r.contactPerson ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      trade: r.trade ?? "",
      licenseNumber: r.licenseNumber ?? "",
      contractAmount: r.contractAmount != null ? String(r.contractAmount) : "",
      paidAmount: r.paidAmount != null ? String(r.paidAmount) : "",
      retentionPercent: r.retentionPercent != null ? String(r.retentionPercent) : "",
      isActive: r.isActive !== false,
      notes: r.notes ?? "",
    });
  };

  const save = async () => {
    setErr("");
    if (!f.name.trim()) {
      setErr(T("اسم المقاول مطلوب", "Contractor name is required"));
      return;
    }
    const payload = {
      code: f.code.trim() || undefined,
      name: f.name.trim(),
      contactPerson: f.contactPerson.trim() || undefined,
      email: f.email.trim() || undefined,
      phone: f.phone.trim() || undefined,
      trade: f.trade.trim() || undefined,
      licenseNumber: f.licenseNumber.trim() || undefined,
      contractAmount: f.contractAmount === "" ? undefined : String(f.contractAmount),
      retentionPercent: f.retentionPercent === "" ? undefined : String(f.retentionPercent),
      notes: f.notes.trim() || undefined,
    };
    const paidAmount = f.paidAmount === "" ? undefined : String(f.paidAmount);
    try {
      if (selRow) {
        await updateM.mutateAsync({
          id: selRow.id,
          ...payload,
          paidAmount,
          isActive: !!f.isActive,
        });
      } else {
        const res: any = await createM.mutateAsync(payload);
        // subcontractorCreate has no paid/active columns in its input, so the
        // extra two values go through the tenant-scoped update right after.
        if (res?.id && ((paidAmount !== undefined && Number(paidAmount) !== 0) || !f.isActive)) {
          await updateM.mutateAsync({
            id: res.id,
            paidAmount,
            isActive: !!f.isActive,
          });
        }
        reset();
      }
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  };

  const toggleActive = () => {
    if (!selRow) return;
    updateM.mutate({ id: selRow.id, isActive: selRow.isActive === false });
  };

  const savePayment = async () => {
    setErr("");
    if (!pay.subcontractorId || !pay.projectId || !pay.paymentNumber.trim()) {
      setErr(T("اختر المقاول والمشروع وأدخل رقم السند", "Select contractor and project, then enter the payment number"));
      return;
    }
    if (pay.grossAmount === "" || pay.netAmount === "") {
      setErr(T("أدخل إجمالي المبلغ والصافي", "Enter the gross and net amounts"));
      return;
    }
    try {
      await payCreateM.mutateAsync({
        subcontractorId: Number(pay.subcontractorId),
        projectId: Number(pay.projectId),
        paymentNumber: pay.paymentNumber.trim(),
        paymentDate: pay.paymentDate || undefined,
        invoiceReference: pay.invoiceReference.trim() || undefined,
        grossAmount: String(pay.grossAmount),
        retentionDeducted: pay.retentionDeducted === "" ? undefined : String(pay.retentionDeducted),
        advanceRecovery: pay.advanceRecovery === "" ? undefined : String(pay.advanceRecovery),
        penalties: pay.penalties === "" ? undefined : String(pay.penalties),
        otherDeductions: pay.otherDeductions === "" ? undefined : String(pay.otherDeductions),
        netAmount: String(pay.netAmount),
        paidAmount: pay.paidAmount === "" ? undefined : String(pay.paidAmount),
        paymentMethod: pay.paymentMethod as "bank_transfer" | "cheque" | "cash",
        bankReference: pay.bankReference.trim() || undefined,
        status: pay.status as "pending" | "approved" | "paid" | "cancelled",
        notes: pay.notes.trim() || undefined,
      });
      setPay({ ...emptyPayment, paymentDate: today() });
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  };

  const calcNet = () => {
    const net = Number(pay.grossAmount || 0)
      - Number(pay.retentionDeducted || 0)
      - Number(pay.advanceRecovery || 0)
      - Number(pay.penalties || 0)
      - Number(pay.otherDeductions || 0);
    setPay({ ...pay, netAmount: net.toFixed(2) });
  };

  const subName = (id: number) => list.find((r) => r.id === id)?.name ?? `#${id}`;
  const payList = (payments ?? []) as any[];
  const totalContract = list.reduce((a, r) => a + Number(r.contractAmount || 0), 0);
  const totalPaid = list.reduce((a, r) => a + Number(r.paidAmount || 0), 0);

  return (
    <div className="min-h-full bg-[#f4f4f4] p-2 text-[12px] text-black">
      <div className="mb-2 flex flex-wrap items-center gap-2 border border-[#999] bg-white p-1.5">
        <b className="text-[13px]">{T("المقاولون", "Contractors")}</b>
        <button
          className={btnCls}
          style={tab === "contractors" ? { background: "#2fae4e", color: "#fff" } : undefined}
          onClick={() => { setTab("contractors"); setErr(""); }}
        >
          {T("المقاولون", "Contractors")}
        </button>
        <button
          className={btnCls}
          style={tab === "payments" ? { background: "#2fae4e", color: "#fff" } : undefined}
          onClick={() => { setTab("payments"); setErr(""); }}
        >
          {T("المدفوعات", "Payments")}
        </button>
        {tab === "contractors" ? (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={T("بحث بالاسم أو الكود أو المهنة", "Search name, code or trade")}
              className={inputCls}
              style={{ width: 240 }}
            />
            <button className={btnCls} onClick={reset}>{T("جديد", "New")}</button>
            <button className={btnCls} disabled={!selRow} onClick={toggleActive}>
              {selRow?.isActive === false ? T("تفعيل", "Activate") : T("إيقاف", "Deactivate")}
            </button>
            <span className="text-[11px] text-[#444]">
              {T("العدد", "Count")}: <b>{list.length}</b> · {T("إجمالي العقود", "Contract total")}: <b>{money(totalContract)}</b>
            </span>
          </>
        ) : (
          <span className="text-[11px] text-[#444]">
            {T("عدد السندات", "Payments")}: <b>{payList.length}</b>
          </span>
        )}
      </div>

      {err && (
        <div className="mb-2 border border-red-800 bg-white px-2 py-1 text-[12px] text-red-700">{err}</div>
      )}

      {tab === "contractors" ? (
        <>
          <SahlGrid
            columns={[
              T("الكود", "Code"),
              T("الاسم", "Name"),
              T("المهنة", "Trade"),
              T("جهة الاتصال", "Contact"),
              T("الهاتف", "Phone"),
              T("قيمة العقد", "Contract amount"),
              T("المدفوع", "Paid"),
              T("الاحتفاظ %", "Retention %"),
              T("الرصيد", "Balance"),
              T("نشط", "Active"),
            ]}
            rows={visible.map((r) => [
              r.code ?? "",
              r.name ?? "",
              r.trade ?? "",
              r.contactPerson ?? "",
              r.phone ?? "",
              money(r.contractAmount),
              money(r.paidAmount),
              `${Number(r.retentionPercent || 0).toFixed(2)}%`,
              money(Number(r.contractAmount || 0) - Number(r.paidAmount || 0)),
              r.isActive === false ? T("لا", "No") : T("نعم", "Yes"),
            ])}
            onSelect={(i) => pick(visible[i])}
            selected={selRow ? visible.findIndex((r) => r.id === selRow.id) : -1}
            emptyText={T("لا يوجد مقاولون — أضف مقاولاً جديداً", "No contractors — add a new one")}
          />

          <div className="mt-2">
            <GreenDialog
              title={selRow ? T("بطاقة مقاول", "Contractor card") : T("مقاول جديد", "New contractor")}
              footer={
                <>
                  <button className={btnCls} onClick={reset}>{T("إلغاء", "Cancel")}</button>
                  <button
                    className={btnGreenCls}
                    style={{ background: "#0a5c2a" }}
                    disabled={createM.isPending || updateM.isPending}
                    onClick={save}
                  >
                    {T("حفظ", "Save")}
                  </button>
                </>
              }
            >
              <div className="text-white">
              <SectionHead>{T("بيانات المقاول", "Contractor details")}</SectionHead>
              <div className="grid gap-x-4 lg:grid-cols-2">
                <div>
                  <SahlField label={T("الكود", "Code")}>
                    <input className={inputCls} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("الاسم", "Name")}>
                    <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("جهة الاتصال", "Contact")}>
                    <input className={inputCls} value={f.contactPerson} onChange={(e) => setF({ ...f, contactPerson: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("البريد", "Email")}>
                    <input className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("الهاتف", "Phone")}>
                    <input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("المهنة", "Trade")}>
                    <input className={inputCls} value={f.trade} onChange={(e) => setF({ ...f, trade: e.target.value })} />
                  </SahlField>
                </div>
                <div>
                  <SahlField label={T("رقم الترخيص", "License No")}>
                    <input className={inputCls} value={f.licenseNumber} onChange={(e) => setF({ ...f, licenseNumber: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("قيمة العقد", "Contract amount")}>
                    <input type="number" min="0" className={inputCls} value={f.contractAmount} onChange={(e) => setF({ ...f, contractAmount: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("المدفوع", "Paid")}>
                    <input type="number" min="0" className={inputCls} value={f.paidAmount} onChange={(e) => setF({ ...f, paidAmount: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("الاحتفاظ %", "Retention %")}>
                    <input type="number" min="0" max="100" className={inputCls} value={f.retentionPercent} onChange={(e) => setF({ ...f, retentionPercent: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("الملاحظات", "Notes")}>
                    <input className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
                  </SahlField>
                  <label className="mb-1.5 flex items-center gap-2 text-[12px]">
                    <input type="checkbox" checked={!!f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} />
                    {T("مقاول نشط", "Active contractor")}
                  </label>
                </div>
              </div>

              <SectionHead>{T("ملخص الحساب", "Account summary")}</SectionHead>
              <div className="flex flex-wrap items-center gap-4 px-1 py-1">
                <span>{T("قيمة العقد", "Contract")}: <b>{money(f.contractAmount)}</b></span>
                <span>{T("المدفوع", "Paid")}: <b>{money(f.paidAmount)}</b></span>
                <span>{T("الرصيد", "Balance")}: <b>{money(Number(f.contractAmount || 0) - Number(f.paidAmount || 0))}</b></span>
                <span>{T("المحتفظ به", "Retention")}: <b>{money(Number(f.contractAmount || 0) * Number(f.retentionPercent || 0) / 100)}</b></span>
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/40 pt-2">
                <span className="text-[11px] text-white/80">
                  {T("تُحفظ البيانات في نفس جدول المقاولين", "Saved to the shared contractors table")}
                </span>
              </div>
              </div>
            </GreenDialog>
          </div>

          <div className="mt-2 border border-[#999] bg-white p-1.5 text-[11px] text-[#333]">
            {T("إجمالي المدفوعات المسجلة", "Total recorded paid")}: <b>{money(totalPaid)}</b>
          </div>
        </>
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          <div>
            <SectionHead>{T("سجل مدفوعات المقاولين", "Contractor payments")}</SectionHead>
            <SahlGrid
              columns={[
                T("التاريخ", "Date"),
                T("المقاول", "Contractor"),
                T("المبلغ", "Amount"),
                T("المرجع / الملاحظات", "Reference / notes"),
              ]}
              rows={payList.map((p) => [
                String(p.paymentDate ?? "").slice(0, 10),
                subName(p.subcontractorId),
                money(p.netAmount),
                [p.invoiceReference, p.notes].filter(Boolean).join(" / ") || p.paymentNumber || "",
              ])}
              emptyText={T("لا توجد مدفوعات مسجلة", "No payments recorded")}
            />
          </div>

          <div>
            <WhiteDialog title={T("سند دفع مقاول", "Contractor payment")}>
              <SectionHead>{T("بيانات السند", "Payment details")}</SectionHead>
              <div className="grid gap-x-4 lg:grid-cols-2">
                <div>
                  <SahlField label={T("المقاول", "Contractor")}>
                    <select className={inputCls} value={pay.subcontractorId} onChange={(e) => setPay({ ...pay, subcontractorId: e.target.value })}>
                      <option value="">—</option>
                      {list.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </SahlField>
                  <SahlField label={T("المشروع", "Project")}>
                    <select className={inputCls} value={pay.projectId} onChange={(e) => setPay({ ...pay, projectId: e.target.value })}>
                      <option value="">—</option>
                      {((projects ?? []) as any[]).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </SahlField>
                  <SahlField label={T("رقم السند", "Payment No")}>
                    <input className={inputCls} value={pay.paymentNumber} onChange={(e) => setPay({ ...pay, paymentNumber: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("التاريخ", "Date")}>
                    <input type="date" className={inputCls} value={pay.paymentDate} onChange={(e) => setPay({ ...pay, paymentDate: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("مرجع الفاتورة", "Invoice ref")}>
                    <input className={inputCls} value={pay.invoiceReference} onChange={(e) => setPay({ ...pay, invoiceReference: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("طريقة الدفع", "Method")}>
                    <select className={inputCls} value={pay.paymentMethod} onChange={(e) => setPay({ ...pay, paymentMethod: e.target.value })}>
                      <option value="bank_transfer">{T("تحويل بنكي", "Bank transfer")}</option>
                      <option value="cheque">{T("شيك", "Cheque")}</option>
                      <option value="cash">{T("نقداً", "Cash")}</option>
                    </select>
                  </SahlField>
                </div>
                <div>
                  <SahlField label={T("الإجمالي", "Gross")}>
                    <input type="number" min="0" className={inputCls} value={pay.grossAmount} onChange={(e) => setPay({ ...pay, grossAmount: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("الاحتفاظ", "Retention")}>
                    <input type="number" min="0" className={inputCls} value={pay.retentionDeducted} onChange={(e) => setPay({ ...pay, retentionDeducted: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("استرداد مقدمة", "Advance rec.")}>
                    <input type="number" min="0" className={inputCls} value={pay.advanceRecovery} onChange={(e) => setPay({ ...pay, advanceRecovery: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("غرامات", "Penalties")}>
                    <input type="number" min="0" className={inputCls} value={pay.penalties} onChange={(e) => setPay({ ...pay, penalties: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("خصومات أخرى", "Other deductions")}>
                    <input type="number" min="0" className={inputCls} value={pay.otherDeductions} onChange={(e) => setPay({ ...pay, otherDeductions: e.target.value })} />
                  </SahlField>
                  <SahlField label={T("الصافي", "Net")}>
                    <span className="flex gap-1">
                      <input type="number" min="0" className={inputCls} value={pay.netAmount} onChange={(e) => setPay({ ...pay, netAmount: e.target.value })} />
                      <button type="button" className={btnCls} onClick={calcNet} title={T("احسب الصافي", "Calculate net")}>
                        {T("حساب", "Calc")}
                      </button>
                    </span>
                  </SahlField>
                </div>
              </div>

              <SectionHead>{T("المتابعة", "Follow-up")}</SectionHead>
              <div className="grid gap-x-4 lg:grid-cols-2">
                <SahlField label={T("المدفوع", "Paid amount")}>
                  <input type="number" min="0" className={inputCls} value={pay.paidAmount} onChange={(e) => setPay({ ...pay, paidAmount: e.target.value })} />
                </SahlField>
                <SahlField label={T("مرجع البنك", "Bank ref")}>
                  <input className={inputCls} value={pay.bankReference} onChange={(e) => setPay({ ...pay, bankReference: e.target.value })} />
                </SahlField>
                <SahlField label={T("الحالة", "Status")}>
                  <select className={inputCls} value={pay.status} onChange={(e) => setPay({ ...pay, status: e.target.value })}>
                    <option value="pending">{T("معلق", "Pending")}</option>
                    <option value="approved">{T("معتمد", "Approved")}</option>
                    <option value="paid">{T("مدفوع", "Paid")}</option>
                    <option value="cancelled">{T("ملغي", "Cancelled")}</option>
                  </select>
                </SahlField>
                <SahlField label={T("ملاحظات", "Notes")}>
                  <input className={inputCls} value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })} />
                </SahlField>
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-[#ddd] pt-2">
                <button className={btnCls} onClick={() => setPay({ ...emptyPayment, paymentDate: today() })}>
                  {T("إلغاء", "Cancel")}
                </button>
                <button
                  className={btnGreenCls}
                  style={{ background: "#0a5c2a" }}
                  disabled={payCreateM.isPending}
                  onClick={savePayment}
                >
                  {T("حفظ السند", "Save payment")}
                </button>
              </div>
            </WhiteDialog>
          </div>
        </div>
      )}
    </div>
  );
}
