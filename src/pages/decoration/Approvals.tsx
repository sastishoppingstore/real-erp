import { useMemo, useState } from "react";
import { BadgeCheck, ShieldCheck, ScrollText, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, PageHeader, Kpi, TabBar, useTab, StatusPill,
  Panel, DataTable, exportCsv, printReport, type Column,
} from "./shared";

const ENTITY_LABEL: Record<string, { en: string; ar: string }> = {
  dc_material_request: { en: "Material request", ar: "طلب مواد" },
  dc_purchase_order: { en: "Purchase order", ar: "أمر شراء" },
  dc_ipc: { en: "IPC / progress certificate", ar: "مستخلص" },
  dc_variation_order: { en: "Variation order", ar: "أمر تغييري" },
  dc_payment: { en: "Payment voucher", ar: "سند صرف" },
  dc_expense_claim: { en: "Expense claim", ar: "مطالبة مصروفات" },
  dc_invoice: { en: "Invoice", ar: "فاتورة" },
};

export default function DecorationApprovals() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("pending");
  const [q, setQ] = useState("");

  const pendingQ = trpc.decoration.approvalList.useQuery({ status: "pending" });
  const allQ = trpc.decoration.approvalList.useQuery();
  const auditQ = trpc.decoration.auditLogList.useQuery({ limit: 250 });

  const utils = trpc.useUtils();
  const decide = trpc.decoration.approvalDecide.useMutation({
    onSuccess: async () => {
      await utils.decoration.approvalList.invalidate();
      await utils.decoration.decorationDashboard.invalidate();
      await utils.decoration.auditLogList.invalidate();
    },
  });

  const pending = pendingQ.data ?? [];
  const all = allQ.data ?? [];
  const audit = auditQ.data ?? [];

  const entityLabel = (t: string) => {
    const e = ENTITY_LABEL[t];
    return e ? L(e.en, e.ar) : t.replace(/^dc_/, "").replace(/_/g, " ");
  };

  const approvalCols: Column[] = [
    {
      key: "entityType", en: "Request", ar: "الطلب",
      render: (r) => (
        <div>
          <div className="font-medium text-slate-800">{entityLabel(r.entityType)}</div>
          <div className="text-[11px] text-slate-400">{r.title ?? `#${r.entityId}`}</div>
        </div>
      ),
    },
    { key: "amount", en: "Amount", ar: "المبلغ", render: (r) => (Number(r.amount ?? 0) ? money(r.amount) : "—") },
    { key: "currentStep", en: "Step", ar: "الخطوة", render: (r) => `${r.currentStep ?? 1}/${r.totalSteps ?? 1}` },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
    {
      key: "createdAt", en: "Raised", ar: "أُنشئ",
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString(isAr ? "ar-SA" : "en-GB") : "—"),
    },
    ...(tab === "pending"
      ? [{
          key: "actions", en: "Decision", ar: "القرار",
          render: (r: any) => (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-8 bg-emerald-700 px-2 hover:bg-emerald-800"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ requestId: r.id, approved: true, comments: undefined })}
              >
                <Check className="me-1 h-3.5 w-3.5" />{L("Approve", "اعتماد")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-rose-200 px-2 text-rose-700 hover:bg-rose-50"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ requestId: r.id, approved: false, comments: undefined })}
              >
                <X className="me-1 h-3.5 w-3.5" />{L("Reject", "رفض")}
              </Button>
            </div>
          ),
        }]
      : []),
  ];

  const auditCols: Column[] = [
    { key: "createdAt", en: "When", ar: "الوقت", render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString(isAr ? "ar-SA" : "en-GB") : "—") },
    { key: "entityType", en: "Entity", ar: "الكيان", render: (r) => entityLabel(r.entityType) },
    { key: "entityId", en: "ID", ar: "المعرّف", render: (r) => <span className="font-mono text-xs">{r.entityId ?? "—"}</span> },
    { key: "action", en: "Action", ar: "الإجراء", render: (r) => <StatusPill status={r.action} /> },
    { key: "userId", en: "User", ar: "المستخدم", render: (r) => r.userId ?? "—" },
  ];

  const rows = useMemo(() => {
    const base = tab === "pending" ? pending : all;
    if (!q) return base;
    return base.filter((r: any) =>
      `${entityLabel(r.entityType)} ${r.title ?? ""} ${r.status}`.toLowerCase().includes(q.toLowerCase()),
    );
  }, [tab, pending, all, q]);

  const onExport = () => {
    if (tab === "audit") {
      exportCsv("decoration-audit-trail", ["When", "Entity", "ID", "Action", "User"],
        audit.map((r: any) => [r.createdAt ?? "", entityLabel(r.entityType), r.entityId ?? "", r.action, r.userId ?? ""]));
    } else {
      exportCsv("decoration-approvals", ["Entity", "Title", "Amount", "Step", "Status", "Raised"],
        rows.map((r: any) => [entityLabel(r.entityType), r.title ?? "", r.amount ?? 0, `${r.currentStep}/${r.totalSteps}`, r.status, r.createdAt ?? ""]));
    }
  };

  const onPrint = () => {
    if (tab === "audit") {
      printReport({
        titleEn: "Audit Trail", titleAr: "سجل التدقيق", rtl: isAr,
        head: ["When", "Entity", "ID", "Action", "User"],
        rows: audit.map((r: any) => [r.createdAt ? new Date(r.createdAt).toLocaleString(isAr ? "ar-SA" : "en-GB") : "", entityLabel(r.entityType), r.entityId ?? "", r.action, r.userId ?? ""]),
        footerNote: L("Decoration & Construction — Audit trail", "الديكور والإنشاءات — سجل التدقيق"),
      });
    } else {
      printReport({
        titleEn: tab === "pending" ? "Pending Approvals" : "All Approvals", titleAr: tab === "pending" ? "الاعتمادات المعلقة" : "كل الاعتمادات", rtl: isAr,
        head: ["Entity", "Title", "Amount", "Step", "Status"],
        rows: rows.map((r: any) => [entityLabel(r.entityType), r.title ?? "", money(r.amount), `${r.currentStep}/${r.totalSteps}`, r.status]),
        footerNote: L("Decoration & Construction — Approvals", "الديكور والإنشاءات — الاعتمادات"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Approvals & Audit Trail", "الاعتمادات وسجل التدقيق")}
        subtitle={L(
          "Multi-level approvals for material requests, POs, IPCs, variations, payments and claims — plus a complete, tenant-scoped audit trail of every action.",
          "اعتمادات متعددة المستويات لطلبات المواد وأوامر الشراء والمستخلصات والأوامر التغييرية والمدفوعات والمطالبات — مع سجل تدقيق كامل لكل إجراء.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <Kpi label={L("Pending approvals", "اعتمادات معلقة")} value={pending.length} icon={<Clock className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Approved", "معتمدة")} value={all.filter((r: any) => r.status === "approved").length} icon={<BadgeCheck className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Rejected", "مرفوضة")} value={all.filter((r: any) => r.status === "rejected").length} icon={<ShieldCheck className="h-5 w-5" />} tone="rose" />
        <Kpi label={L("Audit entries", "قيود التدقيق")} value={audit.length} icon={<ScrollText className="h-5 w-5" />} tone="slate" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "pending", label: L("Pending", "المعلقة"), badge: pending.length },
            { key: "all", label: L("All approvals", "كل الاعتمادات"), badge: all.length },
            { key: "audit", label: L("Audit trail", "سجل التدقيق"), badge: audit.length },
          ]}
        />
        <div className="flex items-center gap-2">
          {tab !== "audit" ? (
            <Input className="h-9 w-56" placeholder={L("Filter...", "تصفية...")} value={q} onChange={(e) => setQ(e.target.value)} />
          ) : null}
          <button type="button" onClick={onExport} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">Excel</button>
          <button type="button" onClick={onPrint} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">PDF</button>
        </div>
      </div>

      {tab === "audit" ? (
        <Panel>
          <DataTable
            columns={auditCols}
            rows={audit}
            loading={auditQ.isLoading}
            empty={L("No audit entries yet.", "لا قيود تدقيق بعد.")}
          />
        </Panel>
      ) : (
        <Panel>
          <DataTable
            columns={approvalCols}
            rows={rows}
            loading={tab === "pending" ? pendingQ.isLoading : allQ.isLoading}
            empty={tab === "pending" ? L("Nothing awaiting approval — all clear.", "لا شيء بانتظار الاعتماد — كل شيء منجز.") : L("No approvals yet.", "لا اعتمادات بعد.")}
          />
        </Panel>
      )}

      <p className="text-xs text-slate-400">
        {L(
          "Approving here updates the source record status and writes to the audit log; the decision is attributed to the signed-in user.",
          "الاعتماد هنا يحدّث حالة السجل الأصلي ويكتب في سجل التدقيق؛ ويُنسب القرار للمستخدم المسجّل دخوله.",
        )}
      </p>
    </div>
  );
}
