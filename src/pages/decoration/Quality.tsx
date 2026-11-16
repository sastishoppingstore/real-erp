import { AlertTriangle, ShieldCheck, ClipboardCheck, Siren, Users2, HardHat } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, num, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, printReport, type Column,
} from "./shared";

export default function DecorationQuality() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("snags");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const labourQ = trpc.decoration.labourList.useQuery();
  const snagsQ = trpc.decoration.snagList.useQuery();
  const ncrQ = trpc.decoration.ncrList.useQuery();
  const inspQ = trpc.decoration.inspectionList.useQuery();
  const incidentsQ = trpc.decoration.incidentList.useQuery();
  const toolboxQ = trpc.decoration.toolboxTalkList.useQuery();
  const ppeQ = trpc.decoration.ppeList.useQuery();

  const snagCreate = trpc.decoration.snagCreate.useMutation({ onSuccess: () => snagsQ.refetch() });
  const ncrCreate = trpc.decoration.ncrCreate.useMutation({ onSuccess: () => ncrQ.refetch() });
  const inspCreate = trpc.decoration.inspectionCreate.useMutation({ onSuccess: () => inspQ.refetch() });
  const incidentCreate = trpc.decoration.incidentCreate.useMutation({ onSuccess: () => incidentsQ.refetch() });
  const toolboxCreate = trpc.decoration.toolboxTalkCreate.useMutation({ onSuccess: () => toolboxQ.refetch() });
  const ppeCreate = trpc.decoration.ppeCreate.useMutation({ onSuccess: () => ppeQ.refetch() });

  const projects = projectsQ.data ?? [];
  const labour = labourQ.data ?? [];
  const snags = snagsQ.data ?? [];
  const ncrs = ncrQ.data ?? [];
  const inspections = inspQ.data ?? [];
  const incidents = incidentsQ.data ?? [];
  const toolbox = toolboxQ.data ?? [];
  const ppe = ppeQ.data ?? [];

  const projectOptions = projects.map((p: any) => ({ value: String(p.id), label: `${p.projectCode} — ${p.nameEn}` }));
  const labourOptions = labour.map((l: any) => ({ value: String(l.id), label: `${l.code ?? l.id} — ${l.nameEn}` }));
  const projectCode = (id: any) => projects.find((p: any) => p.id === Number(id))?.projectCode ?? "—";
  const labourName = (id: any) => labour.find((l: any) => l.id === Number(id))?.nameEn ?? "—";

  const today = new Date().toISOString().slice(0, 10);
  const openSnags = snags.filter((s: any) => s.status === "open" || s.status === "in_progress").length;
  const openIncidents = incidents.filter((i: any) => i.status !== "closed").length;
  const avgAttendance = toolbox.length
    ? toolbox.reduce((s: number, t: any) => s + Number(t.attendeesCount ?? 0), 0) / toolbox.length
    : 0;

  const snagCols: Column[] = [
    { key: "titleEn", en: "Snag", ar: "الملاحظة", render: (r) => <span className="font-medium">{r.titleEn}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "severity", en: "Severity", ar: "الأهمية", render: (r) => <StatusPill status={r.severity} /> },
    { key: "location", en: "Location", ar: "الموقع", render: (r) => r.location ?? "—" },
    { key: "dueDate", en: "Due", ar: "الاستحقاق", render: (r) => r.dueDate ?? "—" },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const ncrCols: Column[] = [
    { key: "ncrNo", en: "NCR no.", ar: "رقم التقرير", render: (r) => <span className="font-mono text-xs">{r.ncrNo ?? `#${r.id}`}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "title", en: "Title", ar: "العنوان", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "severity", en: "Severity", ar: "الأهمية", render: (r) => <StatusPill status={r.severity} /> },
    { key: "dueDate", en: "Due", ar: "الاستحقاق", render: (r) => r.dueDate ?? "—" },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const inspCols: Column[] = [
    { key: "irNo", en: "IR no.", ar: "رقم الطلب", render: (r) => <span className="font-mono text-xs">{r.irNo ?? `#${r.id}`}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "activity", en: "Activity", ar: "النشاط", render: (r) => <span className="font-medium">{r.activity}</span> },
    { key: "inspectionDate", en: "Date", ar: "التاريخ", render: (r) => r.inspectionDate ?? "—" },
    { key: "result", en: "Result", ar: "النتيجة", render: (r) => <StatusPill status={r.result} /> },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const incidentCols: Column[] = [
    { key: "incidentDate", en: "Date", ar: "التاريخ", render: (r) => r.incidentDate ?? "—" },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "incidentType", en: "Type", ar: "النوع", render: (r) => <StatusPill status={r.incidentType} /> },
    { key: "severity", en: "Severity", ar: "الأهمية", render: (r) => <StatusPill status={r.severity} /> },
    { key: "description", en: "Description", ar: "الوصف", render: (r) => <span className="line-clamp-2 text-xs text-slate-600">{r.description ?? "—"}</span> },
    { key: "lostDays", en: "Lost days", ar: "أيام الفقد", render: (r) => num(r.lostDays) },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const toolboxCols: Column[] = [
    { key: "talkDate", en: "Date", ar: "التاريخ", render: (r) => r.talkDate ?? "—" },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "topic", en: "Topic", ar: "الموضوع", render: (r) => <span className="font-medium">{r.topic ?? "—"}</span> },
    { key: "attendeesCount", en: "Attendees", ar: "الحضور", render: (r) => num(r.attendeesCount) },
    { key: "photoUrl", en: "Photo", ar: "الصورة", render: (r) => (r.photoUrl ? "✓" : "—") },
  ];

  const ppeCols: Column[] = [
    { key: "issueDate", en: "Date", ar: "التاريخ", render: (r) => r.issueDate ?? "—" },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "labourId", en: "Worker", ar: "العامل", render: (r) => labourName(r.labourId) },
    { key: "itemName", en: "PPE item", ar: "الصنف", render: (r) => <span className="font-medium">{r.itemName}</span> },
    { key: "quantity", en: "Qty", ar: "الكمية", render: (r) => num(r.quantity) },
    { key: "expiryDate", en: "Expiry", ar: "الانتهاء", render: (r) => r.expiryDate ?? "—" },
  ];

  const exportCurrent = () => {
    if (tab === "snags") exportCsv("decoration-snags", ["Snag", "Project", "Severity", "Location", "Due", "Status"],
      snags.map((r: any) => [r.titleEn, projectCode(r.projectId), r.severity, r.location ?? "", r.dueDate ?? "", r.status]));
    else if (tab === "ncr") exportCsv("decoration-ncr", ["NCR", "Project", "Title", "Severity", "Status"],
      ncrs.map((r: any) => [r.ncrNo ?? `#${r.id}`, projectCode(r.projectId), r.title, r.severity, r.status]));
    else if (tab === "inspections") exportCsv("decoration-inspections", ["IR", "Project", "Activity", "Date", "Result", "Status"],
      inspections.map((r: any) => [r.irNo ?? `#${r.id}`, projectCode(r.projectId), r.activity, r.inspectionDate ?? "", r.result, r.status]));
    else if (tab === "incidents") exportCsv("decoration-incidents", ["Date", "Project", "Type", "Severity", "Lost days", "Status"],
      incidents.map((r: any) => [r.incidentDate ?? "", projectCode(r.projectId), r.incidentType, r.severity, r.lostDays ?? 0, r.status]));
    else if (tab === "toolbox") exportCsv("decoration-toolbox-talks", ["Date", "Project", "Topic", "Attendees"],
      toolbox.map((r: any) => [r.talkDate ?? "", projectCode(r.projectId), r.topic ?? "", r.attendeesCount ?? 0]));
    else exportCsv("decoration-ppe-issue", ["Date", "Project", "Worker", "Item", "Qty", "Expiry"],
      ppe.map((r: any) => [r.issueDate ?? "", projectCode(r.projectId), labourName(r.labourId), r.itemName, r.quantity ?? 1, r.expiryDate ?? ""]));
  };

  const printCurrent = () => {
    const map: Record<string, { en: string; ar: string; head: string[]; rows: (string | number)[][] }> = {
      snags: { en: "Snag / Punch List", ar: "قائمة الملاحظات", head: ["Snag", "Project", "Severity", "Location", "Due", "Status"], rows: snags.map((r: any) => [r.titleEn, projectCode(r.projectId), r.severity, r.location ?? "", r.dueDate ?? "", r.status]) },
      ncr: { en: "Non-conformance Reports", ar: "تقارير عدم المطابقة", head: ["NCR", "Project", "Title", "Severity", "Status"], rows: ncrs.map((r: any) => [r.ncrNo ?? `#${r.id}`, projectCode(r.projectId), r.title, r.severity, r.status]) },
      inspections: { en: "Inspection Requests", ar: "طلبات الفحص", head: ["IR", "Project", "Activity", "Date", "Result"], rows: inspections.map((r: any) => [r.irNo ?? `#${r.id}`, projectCode(r.projectId), r.activity, r.inspectionDate ?? "", r.result]) },
      incidents: { en: "Safety Incident Register", ar: "سجل حوادث السلامة", head: ["Date", "Project", "Type", "Severity", "Lost days", "Status"], rows: incidents.map((r: any) => [r.incidentDate ?? "", projectCode(r.projectId), r.incidentType ?? "", r.severity ?? "", r.lostDays ?? 0, r.status]) },
      toolbox: { en: "Toolbox Talks Register", ar: "سجل الاجتماعات التوعوية", head: ["Date", "Project", "Topic", "Attendees"], rows: toolbox.map((r: any) => [r.talkDate ?? "", projectCode(r.projectId), r.topic ?? "", r.attendeesCount ?? 0]) },
      ppe: { en: "PPE Issue Register", ar: "سجل صرف معدات السلامة", head: ["Date", "Project", "Worker", "Item", "Qty"], rows: ppe.map((r: any) => [r.issueDate ?? "", projectCode(r.projectId), labourName(r.labourId), r.itemName, r.quantity ?? 1]) },
    };
    const m = map[tab] ?? map.snags;
    printReport({ titleEn: m.en, titleAr: m.ar, rtl: isAr, head: m.head, rows: m.rows, footerNote: L("Decoration & Construction — Quality & HSE", "الديكور والإنشاءات — الجودة والسلامة") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Quality, Safety & Compliance", "الجودة والسلامة والامتثال")}
        subtitle={L(
          "Snag/punch lists, non-conformance reports, inspection requests, safety incidents, toolbox talks and PPE issuance — the full QA/QC and HSE record.",
          "قوائم الملاحظات وتقارير عدم المطابقة وطلبات الفحص وحوادث السلامة والاجتماعات التوعوية وصرف معدات الوقاية — سجل الجودة والسلامة الكامل.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Open snags", "ملاحظات مفتوحة")} value={openSnags} icon={<AlertTriangle className="h-5 w-5" />} tone="rose" sub={`${snags.length} ${L("raised", "مسجلة")}`} />
        <Kpi label={L("Open NCRs", "تقارير مفتوحة")} value={ncrs.filter((n: any) => n.status !== "closed").length} icon={<ShieldCheck className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Open incidents", "حوادث مفتوحة")} value={openIncidents} icon={<Siren className="h-5 w-5" />} tone="violet" sub={`${incidents.length} ${L("reported", "مسجّل")}`} />
        <Kpi label={L("Avg. toolbox attendance", "متوسط حضور التوعية")} value={num(avgAttendance)} icon={<Users2 className="h-5 w-5" />} tone="teal" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "snags", label: L("Snags", "الملاحظات"), badge: snags.length },
            { key: "ncr", label: L("NCR", "عدم المطابقة"), badge: ncrs.length },
            { key: "inspections", label: L("Inspections", "الفحوصات"), badge: inspections.length },
            { key: "incidents", label: L("Incidents", "الحوادث"), badge: incidents.length },
            { key: "toolbox", label: L("Toolbox talks", "التوعية"), badge: toolbox.length },
            { key: "ppe", label: L("PPE issue", "معدات السلامة"), badge: ppe.length },
          ]}
        />
        <div className="flex gap-2">
          <button type="button" onClick={exportCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">Excel</button>
          <button type="button" onClick={printCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">PDF</button>
        </div>
      </div>

      {tab === "snags" ? (
        <RecordPanel
          title={L("Snag / punch list", "قائمة الملاحظات")}
          subtitle={L("Defects with severity, location and due date", "العيوب بالأهمية والموقع وتاريخ الاستحقاق")}
          createLabel={L("New snag", "ملاحظة جديدة")}
          columns={snagCols}
          rows={snags}
          loading={snagsQ.isLoading}
          empty={L("No snags yet.", "لا ملاحظات بعد.")}
          pending={snagCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "titleEn", en: "Title", ar: "العنوان", required: true },
            { name: "severity", en: "Severity", ar: "الأهمية", type: "select", defaultValue: "medium", options: ["low", "medium", "high", "critical"].map((s) => ({ value: s, label: s })) },
            { name: "location", en: "Location", ar: "الموقع" },
            { name: "dueDate", en: "Due date", ar: "تاريخ الاستحقاق", type: "date" },
          ]}
          onCreate={(v) => snagCreate.mutate({
            projectId: Number(v.projectId),
            titleEn: v.titleEn,
            severity: v.severity as any,
            location: v.location,
            dueDate: v.dueDate || undefined,
          })}
        />
      ) : tab === "ncr" ? (
        <RecordPanel
          title={L("Non-conformance reports", "تقارير عدم المطابقة")}
          subtitle={L("Non-conformance, root cause and corrective action", "عدم المطابقة والسبب الجذري والإجراء التصحيحي")}
          createLabel={L("New NCR", "تقرير جديد")}
          columns={ncrCols}
          rows={ncrs}
          loading={ncrQ.isLoading}
          empty={L("No NCRs yet.", "لا تقارير بعد.")}
          pending={ncrCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "title", en: "Title", ar: "العنوان", required: true },
            { name: "severity", en: "Severity", ar: "الأهمية", type: "select", defaultValue: "minor", options: ["minor", "major", "critical"].map((s) => ({ value: s, label: s })) },
            { name: "description", en: "Description", ar: "الوصف", type: "textarea", span: 2 },
            { name: "dueDate", en: "Due date", ar: "تاريخ الاستحقاق", type: "date" },
          ]}
          onCreate={(v) => ncrCreate.mutate({
            projectId: Number(v.projectId),
            title: v.title,
            severity: v.severity as any,
            description: v.description,
            dueDate: v.dueDate || undefined,
          })}
        />
      ) : tab === "inspections" ? (
        <RecordPanel
          title={L("Inspection requests (IR)", "طلبات الفحص")}
          subtitle={L("Activity inspections and results", "فحوصات الأنشطة والنتائج")}
          createLabel={L("New inspection", "طلب فحص")}
          columns={inspCols}
          rows={inspections}
          loading={inspQ.isLoading}
          empty={L("No inspections yet.", "لا فحوصات بعد.")}
          pending={inspCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "activity", en: "Activity", ar: "النشاط", required: true, placeholder: L("Ceiling framing, jointing...", "تأطير السقف، المعالجة...") },
            { name: "inspectionDate", en: "Date", ar: "التاريخ", type: "date", defaultValue: today },
            { name: "result", en: "Result", ar: "النتيجة", type: "select", defaultValue: "pending", options: ["pending", "pass", "fail", "conditional"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => inspCreate.mutate({
            projectId: Number(v.projectId),
            activity: v.activity,
            inspectionDate: v.inspectionDate || undefined,
            result: v.result as any,
          })}
        />
      ) : tab === "incidents" ? (
        <RecordPanel
          title={L("Safety incidents", "حوادث السلامة")}
          subtitle={L("Incident type, root cause, corrective action and lost days", "نوع الحادث والسبب الجذري والإجراء التصحيحي وأيام الفقد")}
          createLabel={L("Report incident", "تسجيل حادث")}
          columns={incidentCols}
          rows={incidents}
          loading={incidentsQ.isLoading}
          empty={L("No incidents reported — good.", "لا حوادث مسجلة — جيد.")}
          pending={incidentCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "incidentDate", en: "Incident date", ar: "تاريخ الحادث", type: "date", defaultValue: today, required: true },
            { name: "incidentType", en: "Type", ar: "النوع", type: "select", defaultValue: "near_miss", options: ["near_miss", "first_aid", "medical", "lost_time", "fatality", "property"].map((s) => ({ value: s, label: s.replace(/_/g, " ") })) },
            { name: "severity", en: "Severity", ar: "الأهمية", type: "select", defaultValue: "low", options: ["low", "medium", "high", "critical"].map((s) => ({ value: s, label: s })) },
            { name: "lostDays", en: "Lost days", ar: "أيام الفقد", type: "number", defaultValue: "0" },
            { name: "description", en: "Description", ar: "الوصف", type: "textarea", span: 2 },
            { name: "rootCause", en: "Root cause", ar: "السبب الجذري", type: "textarea", span: 2 },
            { name: "correctiveAction", en: "Corrective action", ar: "الإجراء التصحيحي", type: "textarea", span: 2 },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "open", options: ["open", "investigating", "closed"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => incidentCreate.mutate({
            projectId: Number(v.projectId),
            incidentDate: v.incidentDate,
            incidentType: v.incidentType as any,
            severity: v.severity as any,
            lostDays: v.lostDays ? Number(v.lostDays) : undefined,
            description: v.description,
            rootCause: v.rootCause,
            correctiveAction: v.correctiveAction,
            status: v.status as any,
          })}
        />
      ) : tab === "toolbox" ? (
        <RecordPanel
          title={L("Toolbox talks", "الاجتماعات التوعوية")}
          subtitle={L("Daily safety briefings and attendance", "الإحاطات اليومية للسلامة والحضور")}
          createLabel={L("New talk", "اجتماع جديد")}
          columns={toolboxCols}
          rows={toolbox}
          loading={toolboxQ.isLoading}
          empty={L("No toolbox talks yet.", "لا اجتماعات بعد.")}
          pending={toolboxCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "talkDate", en: "Date", ar: "التاريخ", type: "date", defaultValue: today, required: true },
            { name: "topic", en: "Topic", ar: "الموضوع", span: 2 },
            { name: "attendeesCount", en: "Attendees", ar: "عدد الحضور", type: "number" },
            { name: "photoUrl", en: "Photo URL", ar: "رابط الصورة" },
          ]}
          onCreate={(v) => toolboxCreate.mutate({
            projectId: Number(v.projectId),
            talkDate: v.talkDate,
            topic: v.topic,
            attendeesCount: v.attendeesCount ? Number(v.attendeesCount) : undefined,
            photoUrl: v.photoUrl,
          })}
        />
      ) : (
        <RecordPanel
          title={L("PPE issuance", "صرف معدات الوقاية")}
          subtitle={L("Helmets, gloves, harnesses and expiry tracking", "الخوذ والقفازات والأحزمة وتتبع الانتهاء")}
          createLabel={L("Issue PPE", "صرف معدات")}
          columns={ppeCols}
          rows={ppe}
          loading={ppeQ.isLoading}
          empty={L("No PPE issued yet.", "لا معدات مصروفة بعد.")}
          pending={ppeCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "labourId", en: "Worker", ar: "العامل", type: "select", options: labourOptions, required: true },
            { name: "itemName", en: "PPE item", ar: "الصنف", required: true, placeholder: "Helmet / gloves / harness" },
            { name: "issueDate", en: "Issue date", ar: "تاريخ الصرف", type: "date", defaultValue: today, required: true },
            { name: "quantity", en: "Quantity", ar: "الكمية", type: "number", defaultValue: "1" },
            { name: "expiryDate", en: "Expiry date", ar: "تاريخ الانتهاء", type: "date" },
          ]}
          onCreate={(v) => ppeCreate.mutate({
            projectId: Number(v.projectId),
            labourId: Number(v.labourId),
            itemName: v.itemName,
            issueDate: v.issueDate,
            quantity: v.quantity ? Number(v.quantity) : undefined,
            expiryDate: v.expiryDate || undefined,
          })}
        />
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <HardHat className="h-3.5 w-3.5" />
        {L(
          "Inspections gate every activity payment; incidents and toolbox talks build the HSE file required by clients and insurers.",
          "تُشترط الفحوصات لاعتماد كل نشاط؛ وتُكوّن الحوادث والاجتماعات التوعوية ملف السلامة المطلوب من العملاء وشركات التأمين.",
        )}
      </p>
    </div>
  );
}
