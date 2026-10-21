import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import {
  WhiteDialog, SectionHead, SahlGrid, SahlField, inputCls, btnCls, btnGreenCls,
} from "./ui";

// Sahl contracts screen. Reads and writes `construction_contracts` through
// construction.contractList / contractCreate / contractUpdate, so the same
// rows also appear in the classic contracts module.
type ContractType = "lump_sum" | "cost_plus" | "unit_price" | "design_build" | "turnkey";
type ContractStatus = "draft" | "signed" | "active" | "amended" | "completed" | "terminated";

const TYPE_LABELS: Record<ContractType, [string, string]> = {
  lump_sum: ["مبلغ مقطوع", "Lump sum"],
  cost_plus: ["تكلفة زائد", "Cost plus"],
  unit_price: ["سعر الوحدة", "Unit price"],
  design_build: ["تصميم وتنفيذ", "Design & build"],
  turnkey: ["تسليم مفتاح", "Turnkey"],
};

const STATUS_LABELS: Record<ContractStatus, [string, string]> = {
  draft: ["مسودة", "Draft"],
  signed: ["موقّع", "Signed"],
  active: ["نشط", "Active"],
  amended: ["معدّل", "Amended"],
  completed: ["منجز", "Completed"],
  terminated: ["منتهٍ", "Terminated"],
};

const emptyContract = {
  projectId: "",
  contractNumber: "",
  contractType: "lump_sum" as ContractType,
  title: "",
  description: "",
  clientId: "",
  startDate: "",
  endDate: "",
  contractDate: "",
  contractValue: "",
  currency: "SAR",
  paymentTerms: "",
  retentionPercent: "10",
  advancePaymentPercent: "0",
  status: "draft" as ContractStatus,
  notes: "",
};

const money = (v: unknown) =>
  Number(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SahlContracts() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const utils = trpc.useUtils();

  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<number | null>(null);
  const [f, setF] = useState<any>({ ...emptyContract });
  const [err, setErr] = useState("");

  const { data: rows } = trpc.construction.contractList.useQuery();
  const { data: projects } = trpc.construction.projectList.useQuery();
  const { data: customers } = trpc.sales.customerList.useQuery();

  const list = (rows ?? []) as any[];
  const selRow = list.find((r) => r.id === selId) ?? null;
  const projectName = (id: number) => ((projects ?? []) as any[]).find((p) => p.id === id)?.name ?? `#${id}`;
  const clientName = (id: number | null | undefined) =>
    id == null ? "" : ((customers ?? []) as any[]).find((c) => c.id === id)?.name ?? `#${id}`;
  const typeLabel = (v: string) => {
    const hit = TYPE_LABELS[v as ContractType];
    return hit ? (rtl ? hit[0] : hit[1]) : v;
  };
  const statusLabel = (v: string) => {
    const hit = STATUS_LABELS[v as ContractStatus];
    return hit ? (rtl ? hit[0] : hit[1]) : v;
  };

  const term = q.trim().toLowerCase();
  const visible = term
    ? list.filter((r) =>
        [r.contractNumber, r.title, projectName(r.projectId), clientName(r.clientId)]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term)))
    : list;

  const createM = trpc.construction.contractCreate.useMutation({
    onSuccess: () => utils.construction.contractList.invalidate(),
  });
  const updateM = trpc.construction.contractUpdate.useMutation({
    onSuccess: () => utils.construction.contractList.invalidate(),
  });

  const reset = () => {
    setF({ ...emptyContract });
    setSelId(null);
    setErr("");
  };

  const pick = (r: any) => {
    setSelId(r.id);
    setErr("");
    setF({
      projectId: r.projectId != null ? String(r.projectId) : "",
      contractNumber: r.contractNumber ?? "",
      contractType: (r.contractType ?? "lump_sum") as ContractType,
      title: r.title ?? "",
      description: r.description ?? "",
      clientId: r.clientId != null ? String(r.clientId) : "",
      startDate: r.startDate ?? "",
      endDate: r.endDate ?? "",
      contractDate: r.contractDate ?? "",
      contractValue: r.contractValue != null ? String(r.contractValue) : "",
      currency: r.currency ?? "SAR",
      paymentTerms: r.paymentTerms ?? "",
      retentionPercent: r.retentionPercent != null ? String(r.retentionPercent) : "",
      advancePaymentPercent: r.advancePaymentPercent != null ? String(r.advancePaymentPercent) : "",
      status: (r.status ?? "draft") as ContractStatus,
      notes: r.notes ?? "",
    });
  };

  const save = async () => {
    setErr("");
    if (selRow) {
      if (!f.title.trim()) {
        setErr(T("عنوان العقد مطلوب", "Contract title is required"));
        return;
      }
      try {
        await updateM.mutateAsync({
          id: selRow.id,
          title: f.title.trim(),
          description: f.description || undefined,
          contractValue: f.contractValue === "" ? undefined : String(f.contractValue),
          status: f.status as ContractStatus,
          notes: f.notes || undefined,
        });
      } catch (e: any) {
        setErr(String(e?.message ?? e));
      }
      return;
    }
    if (!f.projectId || !f.contractNumber.trim() || !f.title.trim()) {
      setErr(T("المشروع ورقم العقد والعنوان حقول مطلوبة", "Project, contract number and title are required"));
      return;
    }
    try {
      await createM.mutateAsync({
        projectId: Number(f.projectId),
        contractNumber: f.contractNumber.trim(),
        contractType: f.contractType as ContractType,
        title: f.title.trim(),
        description: f.description || undefined,
        clientId: f.clientId ? Number(f.clientId) : undefined,
        startDate: f.startDate || undefined,
        endDate: f.endDate || undefined,
        contractDate: f.contractDate || undefined,
        contractValue: f.contractValue === "" ? undefined : String(f.contractValue),
        currency: f.currency || undefined,
        paymentTerms: f.paymentTerms || undefined,
        retentionPercent: f.retentionPercent === "" ? undefined : String(f.retentionPercent),
        advancePaymentPercent: f.advancePaymentPercent === "" ? undefined : String(f.advancePaymentPercent),
        status: f.status as ContractStatus,
        notes: f.notes || undefined,
      });
      reset();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  };

  const locked = !!selRow;
  const totalValue = list.reduce((a, r) => a + Number(r.contractValue || 0), 0);

  return (
    <div className="min-h-full bg-[#f4f4f4] p-2 text-[12px] text-black">
      <div className="mb-2 flex flex-wrap items-center gap-2 border border-[#999] bg-white p-1.5">
        <b className="text-[13px]">{T("العقود", "Contracts")}</b>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T("بحث برقم العقد أو المشروع أو العميل", "Search contract, project or client")}
          className={inputCls}
          style={{ width: 280 }}
        />
        <button className={btnCls} onClick={reset}>{T("جديد", "New")}</button>
        <button className={btnCls} disabled={!selRow} onClick={reset}>{T("إلغاء الاختيار", "Clear selection")}</button>
        <span className="text-[11px] text-[#444]">
          {T("العدد", "Count")}: <b>{list.length}</b> · {T("إجمالي القيمة", "Total value")}: <b>{money(totalValue)}</b>
        </span>
      </div>

      {err && (
        <div className="mb-2 border border-red-800 bg-white px-2 py-1 text-[12px] text-red-700">{err}</div>
      )}

      <SahlGrid
        columns={[
          T("رقم العقد", "Contract no"),
          T("المشروع", "Project"),
          T("النوع", "Type"),
          T("العنوان", "Title"),
          T("العميل", "Client"),
          T("البداية", "Start"),
          T("النهاية", "End"),
          T("القيمة", "Value"),
          T("الحالة", "Status"),
        ]}
        rows={visible.map((r) => [
          r.contractNumber ?? "",
          projectName(r.projectId),
          typeLabel(r.contractType ?? ""),
          r.title ?? "",
          clientName(r.clientId),
          String(r.startDate ?? "").slice(0, 10),
          String(r.endDate ?? "").slice(0, 10),
          money(r.contractValue),
          statusLabel(r.status ?? ""),
        ])}
        onSelect={(i) => pick(visible[i])}
        selected={selRow ? visible.findIndex((r) => r.id === selRow.id) : -1}
        emptyText={T("لا توجد عقود — أضف عقداً جديداً", "No contracts — add a new one")}
      />

      <div className="mt-2">
        <WhiteDialog title={selRow ? T("بطاقة عقد", "Contract card") : T("عقد جديد", "New contract")}>
          {locked && (
            <div className="mb-2 border border-[#c8a419] bg-[#fff8e1] px-2 py-1 text-[11px] text-[#6b5500]">
              {T(
                "بعد الإنشاء يمكن تعديل العنوان والوصف والقيمة والحالة والملاحظات فقط.",
                "After creation only title, description, value, status and notes can be edited."
              )}
            </div>
          )}

          <SectionHead>{T("بيانات العقد", "Contract details")}</SectionHead>
          <div className="grid gap-x-4 lg:grid-cols-2">
            <div>
              <SahlField label={T("المشروع", "Project")}>
                <select
                  className={inputCls}
                  disabled={locked}
                  value={f.projectId}
                  onChange={(e) => setF({ ...f, projectId: e.target.value })}
                >
                  <option value="">—</option>
                  {((projects ?? []) as any[]).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </SahlField>
              <SahlField label={T("رقم العقد", "Contract No")}>
                <input
                  className={inputCls}
                  disabled={locked}
                  value={f.contractNumber}
                  onChange={(e) => setF({ ...f, contractNumber: e.target.value })}
                />
              </SahlField>
              <SahlField label={T("النوع", "Type")}>
                <select
                  className={inputCls}
                  disabled={locked}
                  value={f.contractType}
                  onChange={(e) => setF({ ...f, contractType: e.target.value as ContractType })}
                >
                  {(Object.keys(TYPE_LABELS) as ContractType[]).map((k) => (
                    <option key={k} value={k}>{T(TYPE_LABELS[k][0], TYPE_LABELS[k][1])}</option>
                  ))}
                </select>
              </SahlField>
              <SahlField label={T("العنوان", "Title")}>
                <input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
              </SahlField>
              <SahlField label={T("الوصف", "Description")}>
                <textarea
                  className={`${inputCls} h-16`}
                  value={f.description}
                  onChange={(e) => setF({ ...f, description: e.target.value })}
                />
              </SahlField>
            </div>
            <div>
              <SahlField label={T("العميل", "Client")}>
                <select
                  className={inputCls}
                  disabled={locked}
                  value={f.clientId}
                  onChange={(e) => setF({ ...f, clientId: e.target.value })}
                >
                  <option value="">—</option>
                  {((customers ?? []) as any[]).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </SahlField>
              <SahlField label={T("تاريخ العقد", "Contract date")}>
                <input
                  type="date"
                  className={inputCls}
                  disabled={locked}
                  value={f.contractDate}
                  onChange={(e) => setF({ ...f, contractDate: e.target.value })}
                />
              </SahlField>
              <SahlField label={T("البداية", "Start")}>
                <input
                  type="date"
                  className={inputCls}
                  disabled={locked}
                  value={f.startDate}
                  onChange={(e) => setF({ ...f, startDate: e.target.value })}
                />
              </SahlField>
              <SahlField label={T("النهاية", "End")}>
                <input
                  type="date"
                  className={inputCls}
                  disabled={locked}
                  value={f.endDate}
                  onChange={(e) => setF({ ...f, endDate: e.target.value })}
                />
              </SahlField>
              <SahlField label={T("العملة", "Currency")}>
                <input
                  className={inputCls}
                  maxLength={3}
                  disabled={locked}
                  value={f.currency}
                  onChange={(e) => setF({ ...f, currency: e.target.value.toUpperCase() })}
                />
              </SahlField>
            </div>
          </div>

          <SectionHead>{T("الشروط المالية", "Financial terms")}</SectionHead>
          <div className="grid gap-x-4 lg:grid-cols-2">
            <div>
              <SahlField label={T("قيمة العقد", "Contract value")}>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={f.contractValue}
                  onChange={(e) => setF({ ...f, contractValue: e.target.value })}
                />
              </SahlField>
              <SahlField label={T("الاحتفاظ %", "Retention %")}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={inputCls}
                  disabled={locked}
                  value={f.retentionPercent}
                  onChange={(e) => setF({ ...f, retentionPercent: e.target.value })}
                />
              </SahlField>
              <SahlField label={T("الدفعة المقدمة %", "Advance %")}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={inputCls}
                  disabled={locked}
                  value={f.advancePaymentPercent}
                  onChange={(e) => setF({ ...f, advancePaymentPercent: e.target.value })}
                />
              </SahlField>
            </div>
            <div>
              <SahlField label={T("شروط الدفع", "Payment terms")}>
                <textarea
                  className={`${inputCls} h-16`}
                  disabled={locked}
                  value={f.paymentTerms}
                  onChange={(e) => setF({ ...f, paymentTerms: e.target.value })}
                />
              </SahlField>
              <SahlField label={T("الحالة", "Status")}>
                <select
                  className={inputCls}
                  value={f.status}
                  onChange={(e) => setF({ ...f, status: e.target.value as ContractStatus })}
                >
                  {(Object.keys(STATUS_LABELS) as ContractStatus[]).map((k) => (
                    <option key={k} value={k}>{T(STATUS_LABELS[k][0], STATUS_LABELS[k][1])}</option>
                  ))}
                </select>
              </SahlField>
              <SahlField label={T("ملاحظات", "Notes")}>
                <input className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
              </SahlField>
            </div>
          </div>

          <SectionHead>{T("ملخص", "Summary")}</SectionHead>
          <div className="flex flex-wrap items-center gap-4 px-1 py-1">
            <span>{T("قيمة العقد", "Value")}: <b>{money(f.contractValue)}</b></span>
            <span>{T("الاحتفاظ", "Retention")}: <b>{money(Number(f.contractValue || 0) * Number(f.retentionPercent || 0) / 100)}</b></span>
            <span>{T("الدفعة المقدمة", "Advance")}: <b>{money(Number(f.contractValue || 0) * Number(f.advancePaymentPercent || 0) / 100)}</b></span>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-[#ddd] pt-2">
            <button className={btnCls} onClick={reset}>{T("إلغاء", "Cancel")}</button>
            <button
              className={btnGreenCls}
              style={{ background: "#0a5c2a" }}
              disabled={createM.isPending || updateM.isPending}
              onClick={save}
            >
              {T("حفظ", "Save")}
            </button>
          </div>
        </WhiteDialog>
      </div>
    </div>
  );
}
