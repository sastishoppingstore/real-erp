import { CalendarDays, TrendingUp, MessageSquare, ClipboardCheck, Camera } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, num, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, printReport, type Column,
} from "./shared";

export default function DecorationExecution() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("diary");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const diaryQ = trpc.decoration.siteDiaryList.useQuery();
  const progressQ = trpc.decoration.progressList.useQuery();
  const rfiQ = trpc.decoration.rfiList.useQuery();
  const marQ = trpc.decoration.marList.useQuery();

  const diaryCreate = trpc.decoration.siteDiaryCreate.useMutation({ onSuccess: () => diaryQ.refetch() });
  const progressCreate = trpc.decoration.progressCreate.useMutation({ onSuccess: () => progressQ.refetch() });
  const rfiCreate = trpc.decoration.rfiCreate.useMutation({ onSuccess: () => rfiQ.refetch() });
  const marCreate = trpc.decoration.marCreate.useMutation({ onSuccess: () => marQ.refetch() });

  const projectOptions = (projectsQ.data ?? []).map((p: any) => ({
    value: String(p.id), label: `${p.projectCode} — ${p.nameEn}`,
  }));
  const projectCode = (id: any) => (projectsQ.data ?? []).find((p: any) => p.id === Number(id))?.projectCode ?? "—";

  const diary = diaryQ.data ?? [];
  const progress = progressQ.data ?? [];
  const rfis = rfiQ.data ?? [];
  const mars = marQ.data ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const todaysManpower = diary
    .filter((d: any) => String(d.reportDate ?? "").slice(0, 10) === today)
    .reduce((s: number, d: any) => s + Number(d.manpowerCount ?? 0), 0);
  const avgProgress = progress.length
    ? progress.reduce((s: number, p: any) => s + Number(p.progressPercent ?? 0), 0) / progress.length
    : 0;

  const diaryCols: Column[] = [
    { key: "reportDate", en: "Date", ar: "التاريخ", render: (r) => r.reportDate ?? "—" },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "weather", en: "Weather", ar: "الطقس", render: (r) => r.weather || "—" },
    { key: "manpowerCount", en: "Manpower", ar: "العمالة", render: (r) => num(r.manpowerCount) },
    { key: "workDoneEn", en: "Work done", ar: "الأعمال المنفذة", render: (r) => <span className="line-clamp-2 text-xs text-slate-600">{r.workDoneEn || r.issues || "—"}</span> },
    { key: "photoUrls", en: "Photos", ar: "الصور", render: (r) => r.photoUrls ? <Camera className="h-4 w-4 text-emerald-600" /> : "—" },
  ];

  const progressCols: Column[] = [
    { key: "activity", en: "Activity", ar: "النشاط", render: (r) => <span className="font-medium">{r.activity}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "progressPercent", en: "Progress", ar: "التقدم", render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Number(r.progressPercent ?? 0))}%` }} />
        </div>
        <span className="text-xs text-slate-500">{num(r.progressPercent)}%</span>
      </div>
    ) },
    { key: "entryDate", en: "Date", ar: "التاريخ", render: (r) => r.entryDate ?? "—" },
  ];

  const rfiCols: Column[] = [
    { key: "rfiNo", en: "RFI no.", ar: "رقم الطلب", render: (r) => <span className="font-mono text-xs">{r.rfiNo ?? "—"}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "subject", en: "Subject", ar: "الموضوع", render: (r) => <span className="line-clamp-2">{r.subject}</span> },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const marCols: Column[] = [
    { key: "marNo", en: "MAR no.", ar: "رقم الطلب", render: (r) => <span className="font-mono text-xs">{r.marNo ?? "—"}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "descriptionEn", en: "Material", ar: "المادة", render: (r) => <span className="line-clamp-2">{r.descriptionEn}</span> },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const exportCurrent = () => {
    if (tab === "diary") {
      exportCsv("decoration-site-diary", ["Date", "Project", "Weather", "Manpower", "Work done"],
        diary.map((r: any) => [r.reportDate ?? "", projectCode(r.projectId), r.weather ?? "", r.manpowerCount, r.workDoneEn ?? ""]));
    } else if (tab === "progress") {
      exportCsv("decoration-progress", ["Activity", "Project", "Progress %"],
        progress.map((r: any) => [r.activity, projectCode(r.projectId), r.progressPercent]));
    } else if (tab === "rfi") {
      exportCsv("decoration-rfi", ["RFI", "Project", "Subject", "Status"],
        rfis.map((r: any) => [r.rfiNo ?? "", projectCode(r.projectId), r.subject, r.status]));
    } else {
      exportCsv("decoration-mar", ["MAR", "Project", "Material", "Status"],
        mars.map((r: any) => [r.marNo ?? "", projectCode(r.projectId), r.descriptionEn, r.status]));
    }
  };

  const printCurrent = () => {
    const map: Record<string, { en: string; ar: string; head: string[]; rows: (string | number)[][] }> = {
      diary: { en: "Site Diary", ar: "يومية الموقع", head: ["Date", "Project", "Manpower", "Work done"], rows: diary.map((r: any) => [r.reportDate ?? "", projectCode(r.projectId), r.manpowerCount, r.workDoneEn ?? ""]) },
      progress: { en: "Progress Report", ar: "تقرير التقدم", head: ["Activity", "Project", "Progress %"], rows: progress.map((r: any) => [r.activity, projectCode(r.projectId), `${num(r.progressPercent)}%`]) },
      rfi: { en: "RFI Register", ar: "سجل طلبات المعلومات", head: ["RFI", "Project", "Subject", "Status"], rows: rfis.map((r: any) => [r.rfiNo ?? "", projectCode(r.projectId), r.subject, r.status]) },
      mar: { en: "Material Approval Requests", ar: "طلبات اعتماد المواد", head: ["MAR", "Project", "Material", "Status"], rows: mars.map((r: any) => [r.marNo ?? "", projectCode(r.projectId), r.descriptionEn, r.status]) },
    };
    const m = map[tab] ?? map.diary;
    printReport({ titleEn: m.en, titleAr: m.ar, rtl: isAr, head: m.head, rows: m.rows, footerNote: L("Decoration & Construction — Execution", "الديكور والإنشاءات — التنفيذ") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Site Diary, Progress & Requests", "يومية الموقع والتقدم والطلبات")}
        subtitle={L(
          "Daily site reports with manpower and photos, activity progress, RFIs and material approval requests — the field record behind every claim.",
          "تقارير يومية للموقع بالعمالة والصور، وتقدم الأنشطة، وطلبات المعلومات واعتماد المواد — السجل الميداني وراء كل مستخلص.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Diary entries", "قيود اليومية")} value={diary.length} icon={<CalendarDays className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Manpower today", "عمالة اليوم")} value={todaysManpower} icon={<TrendingUp className="h-5 w-5" />} tone="sky" />
        <Kpi label={L("Average progress", "متوسط التقدم")} value={`${avgProgress.toFixed(1)}%`} icon={<ClipboardCheck className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Open RFIs", "طلبات مفتوحة")} value={rfis.filter((r: any) => r.status !== "closed").length} icon={<MessageSquare className="h-5 w-5" />} tone="violet" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "diary", label: L("Site diary", "يومية الموقع"), badge: diary.length },
            { key: "progress", label: L("Progress", "التقدم"), badge: progress.length },
            { key: "rfi", label: L("RFI", "طلبات المعلومات"), badge: rfis.length },
            { key: "mar", label: L("MAR", "اعتماد المواد"), badge: mars.length },
          ]}
        />
        <div className="flex gap-2">
          <button type="button" onClick={exportCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">Excel</button>
          <button type="button" onClick={printCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">PDF</button>
        </div>
      </div>

      {tab === "diary" ? (
        <RecordPanel
          title={L("Site diary / daily progress report", "يومية الموقع / التقرير اليومي")}
          subtitle={L("Weather, manpower, work done and photos", "الطقس والعمالة والأعمال المنفذة والصور")}
          createLabel={L("New diary entry", "قيد يومي جديد")}
          columns={diaryCols}
          rows={diary}
          loading={diaryQ.isLoading}
          empty={L("No site diary entries yet.", "لا قيود يومية بعد.")}
          pending={diaryCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "reportDate", en: "Date", ar: "التاريخ", type: "date", defaultValue: today, required: true },
            { name: "weather", en: "Weather", ar: "الطقس" },
            { name: "manpowerCount", en: "Manpower count", ar: "عدد العمالة", type: "number" },
            { name: "workDoneEn", en: "Work done (EN)", ar: "الأعمال المنفذة (إنجليزي)", type: "textarea", span: 2 },
            { name: "workDoneAr", en: "Work done (AR)", ar: "الأعمال المنفذة (عربي)", type: "textarea", span: 2 },
            { name: "issues", en: "Issues / delays", ar: "المشكلات / التأخير", type: "textarea", span: 2 },
            { name: "photoUrls", en: "Photo URLs (comma separated)", ar: "روابط الصور (مفصولة بفاصلة)", span: 2 },
          ]}
          onCreate={(v) => diaryCreate.mutate({
            projectId: Number(v.projectId),
            reportDate: v.reportDate,
            weather: v.weather,
            manpowerCount: v.manpowerCount ? Number(v.manpowerCount) : undefined,
            workDoneEn: v.workDoneEn,
            workDoneAr: v.workDoneAr,
            issues: v.issues,
            photoUrls: v.photoUrls,
          } as any)}
        />
      ) : tab === "progress" ? (
        <RecordPanel
          title={L("Activity progress", "تقدم الأنشطة")}
          subtitle={L("Track completion per activity, room and floor", "تتبع الإنجاز لكل نشاط وغرفة وطابق")}
          createLabel={L("Update progress", "تحديث التقدم")}
          columns={progressCols}
          rows={progress}
          loading={progressQ.isLoading}
          empty={L("No progress records yet.", "لا سجلات تقدم بعد.")}
          pending={progressCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "activity", en: "Activity", ar: "النشاط", required: true, placeholder: "False ceiling / painting / sealing" },
            { name: "entryDate", en: "Date", ar: "التاريخ", type: "date", defaultValue: today, required: true },
            { name: "plannedQty", en: "Planned qty", ar: "الكمية المخططة", type: "number" },
            { name: "completedQty", en: "Completed qty", ar: "الكمية المنفذة", type: "number" },
            { name: "uom", en: "UOM", ar: "الوحدة", defaultValue: "m2" },
            { name: "progressPercent", en: "Progress %", ar: "التقدم %", type: "number", required: true },
          ]}
          onCreate={(v) => progressCreate.mutate({
            projectId: Number(v.projectId),
            activity: v.activity,
            entryDate: v.entryDate,
            plannedQty: v.plannedQty,
            completedQty: v.completedQty,
            uom: v.uom,
            progressPercent: v.progressPercent,
          } as any)}
        />
      ) : tab === "rfi" ? (
        <RecordPanel
          title={L("Requests for information (RFI)", "طلبات المعلومات")}
          subtitle={L("Raise questions to consultants and track answers", "رفع الاستفسارات للاستشاريين ومتابعة الردود")}
          createLabel={L("New RFI", "طلب معلومات جديد")}
          columns={rfiCols}
          rows={rfis}
          loading={rfiQ.isLoading}
          empty={L("No RFIs yet.", "لا طلبات معلومات بعد.")}
          pending={rfiCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "subject", en: "Subject", ar: "الموضوع", required: true, span: 2 },
            { name: "question", en: "Question / details", ar: "الاستفسار / التفاصيل", type: "textarea", span: 2 },
            { name: "dueDate", en: "Response due", ar: "الرد المطلوب قبل", type: "date" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "open", options: ["open", "answered", "closed"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => rfiCreate.mutate({ projectId: Number(v.projectId), subject: v.subject, question: v.question, dueDate: v.dueDate || undefined, status: v.status as any } as any)}
        />
      ) : (
        <RecordPanel
          title={L("Material approval requests (MAR)", "طلبات اعتماد المواد")}
          subtitle={L("Submit material samples and specifications for approval", "تقديم عينات المواد والمواصفات للاعتماد")}
          createLabel={L("New MAR", "طلب اعتماد جديد")}
          columns={marCols}
          rows={mars}
          loading={marQ.isLoading}
          empty={L("No MARs yet.", "لا طلبات اعتماد بعد.")}
          pending={marCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "descriptionEn", en: "Material / specification", ar: "المادة / المواصفة", required: true, span: 2 },
            { name: "manufacturer", en: "Manufacturer", ar: "المصنّع" },
            { name: "brand", en: "Brand", ar: "العلامة التجارية" },
            { name: "submittalUrl", en: "Submittal URL", ar: "رابط المستند", span: 2 },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "submitted", "approved", "rejected"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => marCreate.mutate({ projectId: Number(v.projectId), descriptionEn: v.descriptionEn, manufacturer: v.manufacturer, brand: v.brand, submittalUrl: v.submittalUrl, status: v.status as any })}
        />
      )}
    </div>
  );
}