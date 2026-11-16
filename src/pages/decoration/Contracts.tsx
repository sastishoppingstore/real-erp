import { FileSignature, FilePlus2, BadgeCheck, Percent, Landmark } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, num, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, printReport, type Column,
} from "./shared";

export default function DecorationContracts() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("contracts");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const contractsQ = trpc.decoration.contractList.useQuery();
  const variationsQ = trpc.decoration.variationList.useQuery();
  const handoversQ = trpc.decoration.handoverList.useQuery();

  const contractCreate = trpc.decoration.contractCreate.useMutation({ onSuccess: () => contractsQ.refetch() });
  const variationCreate = trpc.decoration.variationCreate.useMutation({ onSuccess: () => variationsQ.refetch() });
  const handoverCreate = trpc.decoration.handoverCreate.useMutation({ onSuccess: () => handoversQ.refetch() });

  const projectOptions = (projectsQ.data ?? []).map((p: any) => ({
    value: String(p.id), label: `${p.projectCode} — ${p.nameEn}`,
  }));
  const projectCode = (id: any) => (projectsQ.data ?? []).find((p: any) => p.id === Number(id))?.projectCode ?? "—";

  const contracts = contractsQ.data ?? [];
  const variations = variationsQ.data ?? [];
  const handovers = handoversQ.data ?? [];

  const activeValue = contracts.filter((c: any) => c.status === "active")
    .reduce((s: number, c: any) => s + Number(c.contractValue ?? 0), 0);
  const voValue = variations.reduce((s: number, v: any) => s + Number(v.amount ?? 0), 0);
  const pendingHandover = handovers.filter((h: any) => h.status === "pending").length;

  const contractCols: Column[] = [
    { key: "contractNo", en: "Contract no.", ar: "رقم العقد", render: (r) => <span className="font-mono text-xs">{r.contractNo}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "contractValue", en: "Value", ar: "القيمة", render: (r) => money(r.contractValue) },
    { key: "advancePercent", en: "Advance %", ar: "الدفعة المقدمة %", render: (r) => `${num(r.advancePercent)}%` },
    { key: "retentionPercent", en: "Retention %", ar: "المحتجز %", render: (r) => `${num(r.retentionPercent)}%` },
    { key: "performanceBond", en: "Performance bond", ar: "ضمان الأداء", render: (r) => money(r.performanceBond) },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const variationCols: Column[] = [
    { key: "voNo", en: "VO no.", ar: "رقم الأمر", render: (r) => <span className="font-mono text-xs">{r.voNo ?? "—"}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "titleEn", en: "Title", ar: "العنوان", render: (r) => <span className="font-medium">{r.titleEn}</span> },
    { key: "variationType", en: "Type", ar: "النوع", render: (r) => String(r.variationType).replace(/_/g, " ") },
    { key: "amount", en: "Amount", ar: "المبلغ", render: (r) => money(r.amount) },
    { key: "timeImpactDays", en: "Time impact", ar: "أثر المدة", render: (r) => `${r.timeImpactDays ?? 0} d` },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const handoverCols: Column[] = [
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "handoverDate", en: "Handover", ar: "التسليم", render: (r) => r.handoverDate ?? "—" },
    { key: "dlpStartDate", en: "DLP start", ar: "بداية الضمان", render: (r) => r.dlpStartDate ?? "—" },
    { key: "dlpEndDate", en: "DLP end", ar: "نهاية الضمان", render: (r) => r.dlpEndDate ?? "—" },
    { key: "warrantyMonths", en: "Warranty (months)", ar: "الضمان (شهر)", render: (r) => r.warrantyMonths },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const exportCurrent = () => {
    if (tab === "contracts") {
      exportCsv("decoration-contracts", ["Contract", "Project", "Value", "Advance %", "Retention %", "Status"],
        contracts.map((r: any) => [r.contractNo, projectCode(r.projectId), r.contractValue, r.advancePercent, r.retentionPercent, r.status]));
    } else if (tab === "variations") {
      exportCsv("decoration-variations", ["VO", "Project", "Title", "Type", "Amount", "Status"],
        variations.map((r: any) => [r.voNo ?? "", projectCode(r.projectId), r.titleEn, r.variationType, r.amount, r.status]));
    } else {
      exportCsv("decoration-handover", ["Project", "Handover", "DLP start", "DLP end", "Warranty", "Status"],
        handovers.map((r: any) => [projectCode(r.projectId), r.handoverDate ?? "", r.dlpStartDate ?? "", r.dlpEndDate ?? "", r.warrantyMonths, r.status]));
    }
  };

  const printCurrent = () => {
    const isC = tab === "contracts";
    const isV = tab === "variations";
    printReport({
      titleEn: isC ? "Contract Register" : isV ? "Variation Orders" : "Handover & DLP Register",
      titleAr: isC ? "سجل العقود" : isV ? "الأوامر التغييرية" : "سجل التسليم وفترة الضمان",
      rtl: isAr,
      head: isC ? ["Contract", "Project", "Value", "Advance %", "Retention %", "Status"]
        : isV ? ["VO", "Project", "Title", "Type", "Amount", "Status"]
          : ["Project", "Handover", "DLP end", "Warranty", "Status"],
      rows: isC
        ? contracts.map((r: any) => [r.contractNo, projectCode(r.projectId), money(r.contractValue), num(r.advancePercent), num(r.retentionPercent), r.status])
        : isV
          ? variations.map((r: any) => [r.voNo ?? "", projectCode(r.projectId), r.titleEn, r.variationType, money(r.amount), r.status])
          : handovers.map((r: any) => [projectCode(r.projectId), r.handoverDate ?? "", r.dlpEndDate ?? "", r.warrantyMonths, r.status]),
      footerNote: L("Decoration & Construction — Contracts", "الديكور والإنشاءات — العقود"),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Contracts, Variations & Handover", "العقود والأوامر التغييرية والتسليم")}
        subtitle={L(
          "Contract terms, advance, retention, performance bond, liquidated damages, variation orders, completion certificate, DLP and warranty.",
          "شروط العقد والدفعة المقدمة والمحتجز وضمان الأداء والغرامات والأوامر التغييرية وشهادة الإنجاز وفترة العيوب والضمان.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Active contracts", "عقود سارية")} value={contracts.filter((c: any) => c.status === "active").length} icon={<FileSignature className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Active contract value", "قيمة العقود السارية")} value={money(activeValue)} icon={<Landmark className="h-5 w-5" />} tone="sky" />
        <Kpi label={L("Variation value", "قيمة الأوامر التغييرية")} value={money(voValue)} icon={<FilePlus2 className="h-5 w-5" />} tone="brass" sub={`${variations.length} ${L("orders", "أمر")}`} />
        <Kpi label={L("Awaiting handover", "بانتظار التسليم")} value={pendingHandover} icon={<BadgeCheck className="h-5 w-5" />} tone="violet" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "contracts", label: L("Contracts", "العقود"), badge: contracts.length },
            { key: "variations", label: L("Variations", "الأوامر التغييرية"), badge: variations.length },
            { key: "handover", label: L("Handover & DLP", "التسليم والضمان"), badge: handovers.length },
          ]}
        />
        <div className="flex gap-2">
          <button type="button" onClick={exportCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">Excel</button>
          <button type="button" onClick={printCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">PDF</button>
        </div>
      </div>

      {tab === "contracts" ? (
        <RecordPanel
          title={L("Contract register", "سجل العقود")}
          subtitle={L("Advance, retention and performance bond", "الدفعة المقدمة والمحتجز وضمان الأداء")}
          createLabel={L("New contract", "عقد جديد")}
          columns={contractCols}
          rows={contracts}
          loading={contractsQ.isLoading}
          empty={L("No contracts yet.", "لا عقود بعد.")}
          pending={contractCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "contractNo", en: "Contract no.", ar: "رقم العقد", required: true, defaultValue: `CT-${new Date().getFullYear()}-` },
            { name: "contractValue", en: "Contract value (SAR)", ar: "قيمة العقد (ريال)", type: "number" },
            { name: "advancePercent", en: "Advance %", ar: "الدفعة المقدمة %", type: "number", defaultValue: "10" },
            { name: "retentionPercent", en: "Retention %", ar: "المحتجز %", type: "number", defaultValue: "10" },
            { name: "performanceBond", en: "Performance bond (SAR)", ar: "ضمان الأداء (ريال)", type: "number" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "active", "completed", "terminated"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => contractCreate.mutate({
            projectId: Number(v.projectId),
            contractNo: v.contractNo,
            contractValue: v.contractValue,
            advancePercent: v.advancePercent,
            retentionPercent: v.retentionPercent,
            performanceBond: v.performanceBond,
            status: v.status as any,
          })}
        />
      ) : tab === "variations" ? (
        <RecordPanel
          title={L("Variation orders", "الأوامر التغييرية")}
          subtitle={L("Additions, omissions and time extensions", "الإضافات والحذف وتمديد المدة")}
          createLabel={L("New variation", "أمر تغييري جديد")}
          columns={variationCols}
          rows={variations}
          loading={variationsQ.isLoading}
          empty={L("No variation orders yet.", "لا أوامر تغييرية بعد.")}
          pending={variationCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "titleEn", en: "Title", ar: "العنوان", required: true },
            { name: "variationType", en: "Type", ar: "النوع", type: "select", defaultValue: "addition", options: ["addition", "omission", "time_extension"].map((s) => ({ value: s, label: s.replace(/_/g, " ") })) },
            { name: "amount", en: "Amount (SAR)", ar: "المبلغ (ريال)", type: "number" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "submitted", "approved", "rejected", "cancelled"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => variationCreate.mutate({
            projectId: Number(v.projectId),
            titleEn: v.titleEn,
            variationType: v.variationType as any,
            amount: v.amount,
            status: v.status as any,
          })}
        />
      ) : (
        <RecordPanel
          title={L("Handover, completion & DLP", "التسليم والإنجاز وفترة الضمان")}
          subtitle={L("Completion certificate, defects liability period and warranty", "شهادة الإنجاز وفترة العيوب والضمان")}
          createLabel={L("New handover", "تسليم جديد")}
          columns={handoverCols}
          rows={handovers}
          loading={handoversQ.isLoading}
          empty={L("No handover records yet.", "لا سجلات تسليم بعد.")}
          pending={handoverCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "completionCertificateUrl", en: "Completion certificate URL", ar: "رابط شهادة الإنجاز", span: 2 },
            { name: "warrantyMonths", en: "Warranty (months)", ar: "الضمان (شهر)", type: "number", defaultValue: "12" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "pending", options: ["pending", "handed_over", "dlp", "closed"].map((s) => ({ value: s, label: s.replace(/_/g, " ") })) },
          ]}
          onCreate={(v) => handoverCreate.mutate({
            projectId: Number(v.projectId),
            completionCertificateUrl: v.completionCertificateUrl,
            warrantyMonths: v.warrantyMonths ? Number(v.warrantyMonths) : undefined,
            status: v.status as any,
          })}
        />
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <Percent className="h-3.5 w-3.5" />
        {L(
          "Retention is held on each invoice and released from the retention register; LDs are deducted on the progress bill.",
          "يُحتجز المبلغ في كل فاتورة ويُفرج عنه من سجل المحتجزات؛ وتُخصم الغرامات من المستخلص.",
        )}
      </p>
    </div>
  );
}