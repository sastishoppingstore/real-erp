import { useState } from "react";
import { Banknote, Clock, Coins, IdCard, Gauge, Users } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, num, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, printReport, type Column,
} from "./shared";

const RUN_STATUS = ["draft", "calculated", "approved", "paid", "cancelled"] as const;

export default function DecorationPayroll() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("runs");
  const [prodProject, setProdProject] = useState("");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const labourQ = trpc.decoration.labourList.useQuery();
  const runsQ = trpc.decoration.payrollRunList.useQuery();
  const timesheetsQ = trpc.decoration.timesheetList.useQuery();
  const advancesQ = trpc.decoration.advanceList.useQuery();
  const expiryQ = trpc.decoration.documentExpiryList.useQuery();
  const productivityQ = trpc.decoration.productivityList.useQuery(
    { projectId: Number(prodProject) },
    { enabled: !!prodProject },
  );

  const runCreate = trpc.decoration.payrollRunCreate.useMutation({ onSuccess: () => runsQ.refetch() });
  const timeCreate = trpc.decoration.timesheetCreate.useMutation({ onSuccess: () => timesheetsQ.refetch() });
  const advanceCreate = trpc.decoration.advanceCreate.useMutation({ onSuccess: () => advancesQ.refetch() });
  const expiryCreate = trpc.decoration.documentExpiryCreate.useMutation({ onSuccess: () => expiryQ.refetch() });
  const prodCreate = trpc.decoration.productivityCreate.useMutation({ onSuccess: () => productivityQ.refetch() });

  const projects = projectsQ.data ?? [];
  const labour = labourQ.data ?? [];
  const runs = runsQ.data ?? [];
  const timesheets = timesheetsQ.data ?? [];
  const advances = advancesQ.data ?? [];
  const expiry = expiryQ.data ?? [];
  const productivity = productivityQ.data ?? [];

  const projectOptions = projects.map((p: any) => ({ value: String(p.id), label: `${p.projectCode} — ${p.nameEn}` }));
  const labourOptions = labour.map((l: any) => ({ value: String(l.id), label: `${l.code ?? l.id} — ${l.nameEn}` }));
  const projectCode = (id: any) => projects.find((p: any) => p.id === Number(id))?.projectCode ?? "—";
  const labourName = (id: any) => labour.find((l: any) => l.id === Number(id))?.nameEn ?? "—";

  const today = new Date().toISOString().slice(0, 10);
  const totalNet = runs.reduce((s: number, r: any) => s + Number(r.totalNet ?? 0), 0);
  const totalHours = timesheets.reduce((s: number, t: any) => s + Number(t.hours ?? 0), 0);
  const advanceBalance = advances.filter((a: any) => a.status === "active").reduce((s: number, a: any) => s + Number(a.balance ?? 0), 0);
  const expiringSoon = expiry.filter((e: any) => {
    const d = new Date(e.expiryDate);
    const diff = (d.getTime() - Date.now()) / 86400000;
    return diff <= 30;
  }).length;

  const runCols: Column[] = [
    { key: "periodMonth", en: "Period", ar: "الفترة", render: (r) => `${String(r.periodMonth).padStart(2, "0")}/${r.periodYear ?? ""}` },
    { key: "runNo", en: "Run no.", ar: "رقم المسير", render: (r) => <span className="font-mono text-xs">{r.runNo ?? "—"}</span> },
    { key: "totalGross", en: "Gross", ar: "الإجمالي", render: (r) => money(r.totalGross) },
    { key: "totalDeductions", en: "Deductions", ar: "الخصومات", render: (r) => money(r.totalDeductions) },
    { key: "totalNet", en: "Net payable", ar: "الصافي المستحق", render: (r) => <span className="font-semibold">{money(r.totalNet)}</span> },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const timeCols: Column[] = [
    { key: "workDate", en: "Date", ar: "التاريخ", render: (r) => r.workDate ?? "—" },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "labourId", en: "Worker", ar: "العامل", render: (r) => labourName(r.labourId) },
    { key: "hours", en: "Hours", ar: "الساعات", render: (r) => num(r.hours) },
    { key: "overtimeHours", en: "Overtime", ar: "إضافي", render: (r) => num(r.overtimeHours) },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const advanceCols: Column[] = [
    { key: "advanceDate", en: "Date", ar: "التاريخ", render: (r) => r.advanceDate ?? "—" },
    { key: "labourId", en: "Worker", ar: "العامل", render: (r) => labourName(r.labourId) },
    { key: "amount", en: "Advance", ar: "السلفة", render: (r) => money(r.amount) },
    { key: "recoveredAmount", en: "Recovered", ar: "المسترد", render: (r) => money(r.recoveredAmount) },
    { key: "balance", en: "Balance", ar: "الرصيد", render: (r) => <span className="text-rose-700">{money(r.balance)}</span> },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const expiryCols: Column[] = [
    { key: "entityType", en: "Entity", ar: "الجهة", render: (r) => String(r.entityType) },
    { key: "docType", en: "Document", ar: "المستند", render: (r) => <span className="font-medium">{r.docType}</span> },
    { key: "docNumber", en: "Number", ar: "الرقم", render: (r) => <span className="font-mono text-xs">{r.docNumber ?? "—"}</span> },
    { key: "expiryDate", en: "Expiry", ar: "الانتهاء", render: (r) => {
      const diff = (new Date(r.expiryDate).getTime() - Date.now()) / 86400000;
      const tone = diff < 0 ? "text-rose-700 font-semibold" : diff <= 30 ? "text-amber-700 font-semibold" : "text-slate-600";
      return <span className={tone}>{r.expiryDate}{diff < 0 ? ` · ${L("expired", "منتهي")}` : diff <= 30 ? ` · ${Math.ceil(diff)}d` : ""}</span>;
    } },
    { key: "reminderDays", en: "Reminder", ar: "التنبيه", render: (r) => `${r.reminderDays ?? 30} d` },
  ];

  const prodCols: Column[] = [
    { key: "workDate", en: "Date", ar: "التاريخ", render: (r) => r.workDate ?? "—" },
    { key: "labourId", en: "Worker", ar: "العامل", render: (r) => labourName(r.labourId) },
    { key: "completedQty", en: "Completed qty", ar: "الكمية المنفذة", render: (r) => `${num(r.completedQty)} ${r.uom ?? ""}` },
    { key: "hoursWorked", en: "Hours", ar: "الساعات", render: (r) => num(r.hoursWorked) },
    { key: "qtyPerHour", en: "m² / hour", ar: "م² / ساعة", render: (r) => num(r.qtyPerHour) },
    { key: "pieceAmount", en: "Piece amount", ar: "قيمة القطعة", render: (r) => money(r.pieceAmount) },
  ];

  const exportCurrent = () => {
    if (tab === "runs") exportCsv("decoration-payroll-runs", ["Period", "Run", "Gross", "Deductions", "Net", "Status"],
      runs.map((r: any) => [`${r.periodMonth}/${r.periodYear}`, r.runNo ?? "", r.totalGross, r.totalDeductions, r.totalNet, r.status]));
    else if (tab === "timesheets") exportCsv("decoration-timesheets", ["Date", "Project", "Worker", "Hours", "Overtime", "Status"],
      timesheets.map((r: any) => [r.workDate ?? "", projectCode(r.projectId), labourName(r.labourId), r.hours, r.overtimeHours, r.status]));
    else if (tab === "advances") exportCsv("decoration-advances", ["Date", "Worker", "Advance", "Recovered", "Balance", "Status"],
      advances.map((r: any) => [r.advanceDate ?? "", labourName(r.labourId), r.amount, r.recoveredAmount, r.balance, r.status]));
    else if (tab === "expiry") exportCsv("decoration-document-expiry", ["Entity", "Document", "Number", "Expiry", "Reminder"],
      expiry.map((r: any) => [r.entityType, r.docType, r.docNumber ?? "", r.expiryDate, r.reminderDays]));
    else exportCsv("decoration-productivity", ["Date", "Worker", "Qty", "Hours", "m2/hour", "Amount"],
      productivity.map((r: any) => [r.workDate ?? "", labourName(r.labourId), r.completedQty, r.hoursWorked, r.qtyPerHour, r.pieceAmount]));
  };

  const printCurrent = () => {
    const map: Record<string, { en: string; ar: string; head: string[]; rows: (string | number)[][] }> = {
      runs: { en: "Payroll Runs", ar: "مسيرات الرواتب", head: ["Period", "Run", "Gross", "Deductions", "Net", "Status"], rows: runs.map((r: any) => [`${r.periodMonth}/${r.periodYear}`, r.runNo ?? "", money(r.totalGross), money(r.totalDeductions), money(r.totalNet), r.status]) },
      timesheets: { en: "Timesheets", ar: "كشوف الأوقات", head: ["Date", "Project", "Worker", "Hours", "Status"], rows: timesheets.map((r: any) => [r.workDate ?? "", projectCode(r.projectId), labourName(r.labourId), num(r.hours), r.status]) },
      advances: { en: "Employee Advances", ar: "سلف الموظفين", head: ["Date", "Worker", "Advance", "Recovered", "Balance"], rows: advances.map((r: any) => [r.advanceDate ?? "", labourName(r.labourId), money(r.amount), money(r.recoveredAmount), money(r.balance)]) },
      expiry: { en: "Document Expiry Register", ar: "سجل انتهاء المستندات", head: ["Entity", "Document", "Number", "Expiry"], rows: expiry.map((r: any) => [r.entityType, r.docType, r.docNumber ?? "", r.expiryDate]) },
      productivity: { en: "Labour Productivity", ar: "إنتاجية العمالة", head: ["Date", "Worker", "Qty", "Hours", "Amount"], rows: productivity.map((r: any) => [r.workDate ?? "", labourName(r.labourId), num(r.completedQty), num(r.hoursWorked), money(r.pieceAmount)]) },
    };
    const m = map[tab] ?? map.runs;
    printReport({ titleEn: m.en, titleAr: m.ar, rtl: isAr, head: m.head, rows: m.rows, footerNote: L("Decoration & Construction — Payroll", "الديكور والإنشاءات — الرواتب") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Payroll, Timesheets & WPS", "الرواتب وكشوف الأوقات وحماية الأجور")}
        subtitle={L(
          "Monthly payroll runs, overtime and allowances, advances recovery, GOSI and EOSB, WPS/Mudad export, document expiry and piece-rate productivity.",
          "مسيرات الرواتب الشهرية والإضافي والبدلات واسترداد السلف والتأمينات ومكافأة نهاية الخدمة وتصدير حماية الأجور وانتهاء المستندات والإنتاجية بالقطعة.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Net payroll", "صافي الرواتب")} value={money(totalNet)} icon={<Banknote className="h-5 w-5" />} tone="emerald" sub={`${runs.length} ${L("runs", "مسير")}`} />
        <Kpi label={L("Hours logged", "الساعات المسجلة")} value={num(totalHours)} icon={<Clock className="h-5 w-5" />} tone="sky" />
        <Kpi label={L("Advance balance", "رصيد السلف")} value={money(advanceBalance)} icon={<Coins className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Docs expiring ≤30d", "مستندات تنتهي ≤٣٠ يوم")} value={expiringSoon} icon={<IdCard className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "runs", label: L("Payroll runs", "مسيرات الرواتب"), badge: runs.length },
            { key: "timesheets", label: L("Timesheets", "كشوف الأوقات"), badge: timesheets.length },
            { key: "advances", label: L("Advances", "السلف"), badge: advances.length },
            { key: "expiry", label: L("Expiry", "الانتهاء"), badge: expiringSoon },
            { key: "productivity", label: L("Productivity", "الإنتاجية"), badge: productivity.length },
          ]}
        />
        <div className="flex gap-2">
          <button type="button" onClick={exportCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">Excel</button>
          <button type="button" onClick={printCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">PDF</button>
        </div>
      </div>

      {tab === "runs" ? (
        <RecordPanel
          title={L("Payroll runs", "مسيرات الرواتب")}
          subtitle={L("Gross, deductions and net payable per month", "الإجمالي والخصومات والصافي المستحق شهرياً")}
          createLabel={L("New payroll run", "مسير رواتب جديد")}
          columns={runCols}
          rows={runs}
          loading={runsQ.isLoading}
          empty={L("No payroll runs yet.", "لا مسيرات رواتب بعد.")}
          pending={runCreate.isPending}
          fields={[
            { name: "periodMonth", en: "Month (1–12)", ar: "الشهر (١–١٢)", type: "number", required: true, defaultValue: String(new Date().getMonth() + 1) },
            { name: "periodYear", en: "Year", ar: "السنة", type: "number", required: true, defaultValue: String(new Date().getFullYear()) },
            { name: "totalGross", en: "Gross total", ar: "إجمالي المستحقات", type: "number" },
            { name: "totalDeductions", en: "Deductions", ar: "الخصومات", type: "number" },
            { name: "totalNet", en: "Net payable", ar: "الصافي المستحق", type: "number" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: RUN_STATUS.map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => runCreate.mutate({
            periodMonth: Number(v.periodMonth),
            periodYear: Number(v.periodYear),
            totalGross: v.totalGross,
            totalDeductions: v.totalDeductions,
            totalNet: v.totalNet,
            status: v.status as any,
          })}
        />
      ) : tab === "timesheets" ? (
        <RecordPanel
          title={L("Timesheets", "كشوف الأوقات")}
          subtitle={L("Hours and overtime per worker, project and activity", "الساعات والإضافي لكل عامل ومشروع ونشاط")}
          createLabel={L("New timesheet", "كشف أوقات جديد")}
          columns={timeCols}
          rows={timesheets}
          loading={timesheetsQ.isLoading}
          empty={L("No timesheets yet.", "لا كشوف أوقات بعد.")}
          pending={timeCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "labourId", en: "Worker", ar: "العامل", type: "select", options: labourOptions, required: true },
            { name: "workDate", en: "Work date", ar: "تاريخ العمل", type: "date", defaultValue: today, required: true },
            { name: "hours", en: "Hours", ar: "الساعات", type: "number", required: true, defaultValue: "8" },
            { name: "overtimeHours", en: "Overtime hours", ar: "ساعات إضافية", type: "number", defaultValue: "0" },
            { name: "ratePerHour", en: "Rate / hour", ar: "أجر الساعة", type: "number" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "submitted", "approved", "rejected"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => timeCreate.mutate({
            projectId: Number(v.projectId),
            labourId: Number(v.labourId),
            workDate: v.workDate,
            hours: v.hours,
            overtimeHours: v.overtimeHours,
            ratePerHour: v.ratePerHour,
            status: v.status as any,
          })}
        />
      ) : tab === "advances" ? (
        <RecordPanel
          title={L("Employee advances", "سلف الموظفين")}
          subtitle={L("Advance, recovery and remaining balance", "السلفة والاسترداد والرصيد المتبقي")}
          createLabel={L("New advance", "سلفة جديدة")}
          columns={advanceCols}
          rows={advances}
          loading={advancesQ.isLoading}
          empty={L("No advances yet.", "لا سلف بعد.")}
          pending={advanceCreate.isPending}
          fields={[
            { name: "labourId", en: "Worker", ar: "العامل", type: "select", options: labourOptions, required: true },
            { name: "advanceDate", en: "Date", ar: "التاريخ", type: "date", defaultValue: today, required: true },
            { name: "amount", en: "Advance amount", ar: "مبلغ السلفة", type: "number", required: true },
            { name: "installments", en: "Installments", ar: "عدد الأقساط", type: "number", defaultValue: "1" },
            { name: "recoveredAmount", en: "Recovered", ar: "المسترد", type: "number", defaultValue: "0" },
            { name: "balance", en: "Balance", ar: "الرصيد", type: "number" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "active", options: ["active", "closed", "cancelled"].map((s) => ({ value: s, label: s })) },
            { name: "notes", en: "Notes", ar: "ملاحظات", type: "textarea", span: 2 },
          ]}
          onCreate={(v) => advanceCreate.mutate({
            labourId: Number(v.labourId),
            advanceDate: v.advanceDate,
            amount: v.amount,
            recoveredAmount: v.recoveredAmount,
            balance: v.balance || v.amount,
            installments: v.installments ? Number(v.installments) : undefined,
            status: v.status as any,
            notes: v.notes,
          })}
        />
      ) : tab === "expiry" ? (
        <RecordPanel
          title={L("Document expiry register", "سجل انتهاء المستندات")}
          subtitle={L("Iqama, passport, insurance, work permit and licences", "الإقامة والجواز والتأمين وتصريح العمل والتراخيص")}
          createLabel={L("Add document", "إضافة مستند")}
          columns={expiryCols}
          rows={expiry}
          loading={expiryQ.isLoading}
          empty={L("No documents tracked yet.", "لا مستندات متتبعة بعد.")}
          pending={expiryCreate.isPending}
          fields={[
            { name: "entityType", en: "Entity type", ar: "نوع الجهة", type: "select", defaultValue: "labour", required: true, options: ["labour", "supplier", "subcontractor", "equipment", "vehicle", "company"].map((s) => ({ value: s, label: s })) },
            { name: "entityId", en: "Entity ID", ar: "معرّف الجهة", type: "number", required: true },
            { name: "docType", en: "Document type", ar: "نوع المستند", required: true, placeholder: "Iqama / Passport / Insurance" },
            { name: "docNumber", en: "Document number", ar: "رقم المستند" },
            { name: "issueDate", en: "Issue date", ar: "تاريخ الإصدار", type: "date" },
            { name: "expiryDate", en: "Expiry date", ar: "تاريخ الانتهاء", type: "date", required: true },
            { name: "reminderDays", en: "Remind before (days)", ar: "التنبيه قبل (أيام)", type: "number", defaultValue: "30" },
          ]}
          onCreate={(v) => expiryCreate.mutate({
            entityType: v.entityType as any,
            entityId: Number(v.entityId),
            docType: v.docType,
            docNumber: v.docNumber,
            issueDate: v.issueDate,
            expiryDate: v.expiryDate,
            reminderDays: v.reminderDays ? Number(v.reminderDays) : undefined,
          })}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e6e1d6] bg-white p-3">
            <Users className="h-4 w-4 text-emerald-700" />
            <span className="text-xs font-semibold text-slate-600">{L("Project", "المشروع")}</span>
            <select
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={prodProject}
              onChange={(e) => setProdProject(e.target.value)}
            >
              <option value="">{L("Select a project…", "اختر مشروعاً…")}</option>
              {projectOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="ms-auto text-[11px] text-slate-400">
              {L("Productivity is measured as m² completed per worker per day.", "تُقاس الإنتاجية بالمتر المربع المنفذ لكل عامل يومياً.")}
            </span>
          </div>
          <RecordPanel
            title={L("Productivity & piece-rate", "الإنتاجية والعمل بالقطعة")}
            subtitle={L("Completed quantity, hours and piece amount", "الكمية المنفذة والساعات وقيمة القطعة")}
            createLabel={L("Log productivity", "تسجيل إنتاجية")}
            columns={prodCols}
            rows={productivity}
            loading={productivityQ.isLoading}
            empty={prodProject ? L("No productivity records for this project.", "لا سجلات إنتاجية لهذا المشروع.") : L("Select a project to view productivity.", "اختر مشروعاً لعرض الإنتاجية.")}
            pending={prodCreate.isPending}
            fields={[
              { name: "labourId", en: "Worker", ar: "العامل", type: "select", options: labourOptions },
              { name: "workDate", en: "Date", ar: "التاريخ", type: "date", defaultValue: today, required: true },
              { name: "completedQty", en: "Completed quantity", ar: "الكمية المنفذة", type: "number", required: true },
              { name: "uom", en: "UOM", ar: "الوحدة", defaultValue: "m2" },
              { name: "hoursWorked", en: "Hours worked", ar: "ساعات العمل", type: "number", defaultValue: "8" },
              { name: "pieceRate", en: "Piece rate (SAR / unit)", ar: "سعر القطعة (ريال/وحدة)", type: "number" },
            ]}
            onCreate={(v) => {
              if (!prodProject) return;
              prodCreate.mutate({
                projectId: Number(prodProject),
                labourId: v.labourId ? Number(v.labourId) : undefined,
                workDate: v.workDate,
                completedQty: v.completedQty,
                uom: v.uom,
                hoursWorked: v.hoursWorked,
                pieceRate: v.pieceRate,
              });
            }}
          />
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <Gauge className="h-3.5 w-3.5" />
        {L(
          "WPS/Mudad file generation and GOSI/EOSB calculation are produced from the approved payroll run; register them with HR to keep one employee master.",
          "يتم إنشاء ملف حماية الأجور (مدد) وحساب التأمينات ومكافأة نهاية الخدمة من مسير الرواتب المعتمد؛ وسجّلها في الموارد البشرية للحفاظ على سجل موظفين واحد.",
        )}
      </p>
    </div>
  );
}