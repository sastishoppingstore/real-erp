import { Warehouse, ArrowLeftRight, Package, ListChecks, Boxes } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, num, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, printReport, type Column,
} from "./shared";

export default function DecorationStores() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("stores");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const storesQ = trpc.decoration.storeList.useQuery();
  const materialsQ = trpc.decoration.materialList.useQuery();
  const movesQ = trpc.decoration.stockMoveList.useQuery();
  const issuesQ = trpc.decoration.materialIssueList.useQuery();
  const countsQ = trpc.decoration.stockCountList.useQuery();
  const dashQ = trpc.decoration.decorationDashboard.useQuery(undefined);

  const storeCreate = trpc.decoration.storeCreate.useMutation({ onSuccess: () => storesQ.refetch() });
  const moveCreate = trpc.decoration.stockMoveCreate.useMutation({ onSuccess: () => movesQ.refetch() });
  const issueCreate = trpc.decoration.materialIssueCreate.useMutation({ onSuccess: () => issuesQ.refetch() });
  const countCreate = trpc.decoration.stockCountCreate.useMutation({ onSuccess: () => countsQ.refetch() });

  const stores = storesQ.data ?? [];
  const materials = materialsQ.data ?? [];
  const moves = movesQ.data ?? [];
  const issues = issuesQ.data ?? [];
  const counts = countsQ.data ?? [];

  const projectOptions = (projectsQ.data ?? []).map((p: any) => ({ value: String(p.id), label: `${p.projectCode} — ${p.nameEn}` }));
  const storeOptions = stores.map((s: any) => ({ value: String(s.id), label: `${s.code} — ${s.nameEn}` }));
  const materialOptions = materials.map((m: any) => ({ value: String(m.id), label: `${m.code} — ${m.nameEn}` }));

  const projectCode = (id: any) => (projectsQ.data ?? []).find((p: any) => p.id === Number(id))?.projectCode ?? "—";
  const storeCode = (id: any) => stores.find((s: any) => s.id === Number(id))?.code ?? "—";
  const materialName = (id: any) => {
    const m = materials.find((x: any) => x.id === Number(id));
    return m ? `${m.code} — ${m.nameEn}` : "—";
  };

  const today = new Date().toISOString().slice(0, 10);
  const totalIn = moves.filter((m: any) => m.moveType === "in").reduce((s: number, m: any) => s + Number(m.totalCost ?? 0), 0);
  const totalOut = moves.filter((m: any) => m.moveType === "out").reduce((s: number, m: any) => s + Number(m.totalCost ?? 0), 0);

  const storeCols: Column[] = [
    { key: "code", en: "Code", ar: "الرمز", render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: "nameEn", en: "Store", ar: "المخزن", render: (r) => <div><div className="font-medium">{r.nameEn}</div><div className="text-[11px] text-slate-400">{r.nameAr ?? ""}</div></div> },
    { key: "storeType", en: "Type", ar: "النوع", render: (r) => String(r.storeType ?? "main") },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => (r.projectId ? projectCode(r.projectId) : "—") },
  ];

  const moveCols: Column[] = [
    { key: "moveDate", en: "Date", ar: "التاريخ", render: (r) => r.moveDate ?? "—" },
    { key: "storeId", en: "Store", ar: "المخزن", render: (r) => <span className="font-mono text-xs">{storeCode(r.storeId)}</span> },
    { key: "materialId", en: "Material", ar: "المادة", render: (r) => <span className="text-xs">{materialName(r.materialId)}</span> },
    { key: "moveType", en: "Type", ar: "النوع", render: (r) => <StatusPill status={r.moveType} /> },
    { key: "quantity", en: "Qty", ar: "الكمية", render: (r) => `${num(r.quantity)} ${r.uom ?? ""}` },
    { key: "totalCost", en: "Cost", ar: "التكلفة", render: (r) => money(r.totalCost) },
    { key: "batchNo", en: "Batch / expiry", ar: "الدفعة / الانتهاء", render: (r) => <span className="text-xs">{r.batchNo ?? "—"}{r.expiryDate ? ` · ${r.expiryDate}` : ""}</span> },
  ];

  const issueCols: Column[] = [
    { key: "issueNo", en: "Issue no.", ar: "رقم الصرف", render: (r) => <span className="font-mono text-xs">{r.issueNo ?? "—"}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => projectCode(r.projectId) },
    { key: "storeId", en: "Store", ar: "المخزن", render: (r) => storeCode(r.storeId) },
    { key: "issueDate", en: "Date", ar: "التاريخ", render: (r) => r.issueDate ?? "—" },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const countCols: Column[] = [
    { key: "countNo", en: "Count no.", ar: "رقم الجرد", render: (r) => <span className="font-mono text-xs">{r.countNo ?? "—"}</span> },
    { key: "storeId", en: "Store", ar: "المخزن", render: (r) => storeCode(r.storeId) },
    { key: "countDate", en: "Date", ar: "التاريخ", render: (r) => r.countDate ?? "—" },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const exportCurrent = () => {
    if (tab === "stores") {
      exportCsv("decoration-stores", ["Code", "Name", "Type", "Project"], stores.map((r: any) => [r.code, r.nameEn, r.storeType ?? "", r.projectId ? projectCode(r.projectId) : ""]));
    } else if (tab === "moves") {
      exportCsv("decoration-stock-moves", ["Date", "Store", "Material", "Type", "Qty", "Cost"],
        moves.map((r: any) => [r.moveDate ?? "", storeCode(r.storeId), materialName(r.materialId), r.moveType, r.quantity, r.totalCost]));
    } else if (tab === "issues") {
      exportCsv("decoration-material-issues", ["Issue", "Project", "Store", "Date", "Status"],
        issues.map((r: any) => [r.issueNo ?? "", projectCode(r.projectId), storeCode(r.storeId), r.issueDate ?? "", r.status]));
    } else {
      exportCsv("decoration-stock-counts", ["Count", "Store", "Date", "Status"],
        counts.map((r: any) => [r.countNo ?? "", storeCode(r.storeId), r.countDate ?? "", r.status]));
    }
  };

  const printCurrent = () => {
    const map: Record<string, { en: string; ar: string; head: string[]; rows: (string | number)[][] }> = {
      stores: { en: "Stores Register", ar: "سجل المخازن", head: ["Code", "Name", "Type"], rows: stores.map((r: any) => [r.code, r.nameEn, r.storeType ?? ""]) },
      moves: { en: "Stock Movements", ar: "حركة المخزون", head: ["Date", "Store", "Material", "Type", "Qty", "Cost"], rows: moves.map((r: any) => [r.moveDate ?? "", storeCode(r.storeId), materialName(r.materialId), r.moveType, num(r.quantity), money(r.totalCost)]) },
      issues: { en: "Material Issue Vouchers", ar: "سندات صرف المواد", head: ["Issue", "Project", "Store", "Date", "Status"], rows: issues.map((r: any) => [r.issueNo ?? "", projectCode(r.projectId), storeCode(r.storeId), r.issueDate ?? "", r.status]) },
      counts: { en: "Stock Counts", ar: "الجرد الفعلي", head: ["Count", "Store", "Date", "Status"], rows: counts.map((r: any) => [r.countNo ?? "", storeCode(r.storeId), r.countDate ?? "", r.status]) },
    };
    const m = map[tab] ?? map.stores;
    printReport({ titleEn: m.en, titleAr: m.ar, rtl: isAr, head: m.head, rows: m.rows, footerNote: L("Decoration & Construction — Stores", "الديكور والإنشاءات — المخازن") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Stores & Inventory", "المخازن والمخزون")}
        subtitle={L(
          "Main and site stores, transfers, stock in/out per project and room, batch/expiry tracking, physical counts and average-cost valuation.",
          "المخازن الرئيسية ومخازن المواقع والتحويلات والإدخال والإخراج لكل مشروع وغرفة وتتبع الدفعات والانتهاء والجرد والتقييم بالمتوسط المرجح.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Stores", "المخازن")} value={stores.length} icon={<Warehouse className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Stock in value", "قيمة الإدخال")} value={money(totalIn)} icon={<Boxes className="h-5 w-5" />} tone="sky" />
        <Kpi label={L("Issued to site", "المصروف للموقع")} value={money(totalOut)} icon={<ArrowLeftRight className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Low stock items", "أصناف منخفضة")} value={dashQ.data?.lowStockItems ?? 0} icon={<Package className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "stores", label: L("Stores", "المخازن"), badge: stores.length },
            { key: "moves", label: L("Movements", "الحركة"), badge: moves.length },
            { key: "issues", label: L("Issues", "الصرف"), badge: issues.length },
            { key: "counts", label: L("Counts", "الجرد"), badge: counts.length },
          ]}
        />
        <div className="flex gap-2">
          <button type="button" onClick={exportCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">Excel</button>
          <button type="button" onClick={printCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">PDF</button>
        </div>
      </div>

      {tab === "stores" ? (
        <RecordPanel
          title={L("Stores & warehouses", "المخازن والمستودعات")}
          subtitle={L("Main store, project store and site store", "المخزن الرئيسي ومخزن المشروع ومخزن الموقع")}
          createLabel={L("New store", "مخزن جديد")}
          columns={storeCols}
          rows={stores}
          loading={storesQ.isLoading}
          empty={L("No stores yet — create the main store first.", "لا مخازن بعد — أنشئ المخزن الرئيسي أولاً.")}
          pending={storeCreate.isPending}
          fields={[
            { name: "code", en: "Code", ar: "الرمز", required: true },
            { name: "nameEn", en: "Name (EN)", ar: "الاسم (إنجليزي)", required: true },
            { name: "nameAr", en: "Name (AR)", ar: "الاسم (عربي)" },
            { name: "storeType", en: "Type", ar: "النوع", type: "select", defaultValue: "main", options: ["main", "site", "project"].map((s) => ({ value: s, label: s })) },
            { name: "projectId", en: "Project (optional)", ar: "المشروع (اختياري)", type: "select", options: projectOptions },
          ]}
          onCreate={(v) => storeCreate.mutate({
            code: v.code,
            nameEn: v.nameEn,
            nameAr: v.nameAr,
            storeType: v.storeType as any,
            projectId: v.projectId ? Number(v.projectId) : undefined,
          })}
        />
      ) : tab === "moves" ? (
        <RecordPanel
          title={L("Stock movements", "حركة المخزون")}
          subtitle={L("In, out, transfer, return, scrap and adjustment", "إدخال وإخراج وتحويل وإرجاع وتالف وتسوية")}
          createLabel={L("New movement", "حركة جديدة")}
          columns={moveCols}
          rows={moves}
          loading={movesQ.isLoading}
          empty={L("No stock movements yet.", "لا حركة مخزون بعد.")}
          pending={moveCreate.isPending}
          fields={[
            { name: "storeId", en: "Store", ar: "المخزن", type: "select", options: storeOptions, required: true },
            { name: "materialId", en: "Material", ar: "المادة", type: "select", options: materialOptions, required: true },
            { name: "moveType", en: "Movement type", ar: "نوع الحركة", type: "select", defaultValue: "in", options: ["in", "out", "transfer", "return", "scrap", "adjust"].map((s) => ({ value: s, label: s })) },
            { name: "quantity", en: "Quantity", ar: "الكمية", type: "number", required: true },
            { name: "uom", en: "UOM", ar: "الوحدة", defaultValue: "pcs" },
            { name: "unitCost", en: "Unit cost", ar: "تكلفة الوحدة", type: "number" },
            { name: "batchNo", en: "Batch / lot", ar: "الدفعة", },
            { name: "expiryDate", en: "Expiry date", ar: "تاريخ الانتهاء", type: "date" },
            { name: "moveDate", en: "Movement date", ar: "تاريخ الحركة", type: "date", defaultValue: today, required: true },
            { name: "projectId", en: "Project (optional)", ar: "المشروع (اختياري)", type: "select", options: projectOptions },
          ]}
          onCreate={(v) => moveCreate.mutate({
            storeId: Number(v.storeId),
            materialId: Number(v.materialId),
            moveType: v.moveType as any,
            quantity: v.quantity,
            uom: v.uom,
            unitCost: v.unitCost,
            totalCost: v.unitCost ? Number(v.unitCost) * Number(v.quantity || 0) : undefined,
            batchNo: v.batchNo,
            expiryDate: v.expiryDate,
            moveDate: v.moveDate,
            projectId: v.projectId ? Number(v.projectId) : undefined,
          })}
        />
      ) : tab === "issues" ? (
        <RecordPanel
          title={L("Material issue vouchers", "سندات صرف المواد")}
          subtitle={L("Issue to project, room and activity", "الصرف للمشروع والغرفة والنشاط")}
          createLabel={L("New issue voucher", "سند صرف جديد")}
          columns={issueCols}
          rows={issues}
          loading={issuesQ.isLoading}
          empty={L("No material issues yet.", "لا سندات صرف بعد.")}
          pending={issueCreate.isPending}
          fields={[
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
            { name: "storeId", en: "Store", ar: "المخزن", type: "select", options: storeOptions, required: true },
            { name: "issueDate", en: "Issue date", ar: "تاريخ الصرف", type: "date", defaultValue: today, required: true },
            { name: "issueNo", en: "Issue no. (optional)", ar: "رقم الصرف (اختياري)" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "issued", "cancelled"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => issueCreate.mutate({
            projectId: Number(v.projectId),
            storeId: Number(v.storeId),
            issueDate: v.issueDate,
            issueNo: v.issueNo,
            status: v.status as any,
          })}
        />
      ) : (
        <RecordPanel
          title={L("Physical stock counts", "الجرد الفعلي")}
          subtitle={L("Count, reconcile and post adjustments", "الجرد والمطابقة وترحيل التسويات")}
          createLabel={L("New stock count", "جرد جديد")}
          columns={countCols}
          rows={counts}
          loading={countsQ.isLoading}
          empty={L("No stock counts yet.", "لا عمليات جرد بعد.")}
          pending={countCreate.isPending}
          fields={[
            { name: "storeId", en: "Store", ar: "المخزن", type: "select", options: storeOptions, required: true },
            { name: "countDate", en: "Count date", ar: "تاريخ الجرد", type: "date", defaultValue: today, required: true },
            { name: "countNo", en: "Count no. (optional)", ar: "رقم الجرد (اختياري)" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "confirmed", "posted"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => countCreate.mutate({
            storeId: Number(v.storeId),
            countDate: v.countDate,
            countNo: v.countNo,
            status: v.status as any,
          })}
        />
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <ListChecks className="h-3.5 w-3.5" />
        {L(
          "Stock valuation uses the moving average cost held on the material card; batch and expiry are tracked for sealants and chemicals.",
          "يُقيّم المخزون بمتوسط التكلفة المرجح في بطاقة المادة؛ وتُتابع الدفعات وتواريخ الانتهاء للمواد اللاصقة والكيماويات.",
        )}
      </p>
    </div>
  );
}