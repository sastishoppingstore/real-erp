import { Globe, Users, BadgeCheck, Link2, ShieldCheck, Bell } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, type Column,
} from "./shared";

export default function DecorationPortal() {
  const { L } = useDeco();
  const [tab, setTab] = useTab("users");

  const clientsQ = trpc.decoration.clientList.useQuery();
  const usersQ = trpc.decoration.portalUserList.useQuery();
  const approvalsQ = trpc.decoration.portalApprovalList.useQuery();

  const userCreate = trpc.decoration.portalUserCreate.useMutation({ onSuccess: () => usersQ.refetch() });

  const clients = clientsQ.data ?? [];
  const users = usersQ.data ?? [];
  const approvals = approvalsQ.data ?? [];

  const clientOptions = clients.map((c: any) => ({ value: String(c.id), label: c.nameEn }));
  const clientName = (id: any) => clients.find((c: any) => c.id === Number(id))?.nameEn ?? "—";

  const activeUsers = users.filter((u: any) => u.isActive !== false).length;
  const pendingApprovals = approvals.filter((a: any) => a.decision === "pending").length;

  const userCols: Column[] = [
    { key: "name", en: "User", ar: "المستخدم", render: (r) => <span className="font-medium">{r.name ?? r.email}</span> },
    { key: "email", en: "Email", ar: "البريد", render: (r) => <span className="text-xs">{r.email}</span> },
    { key: "clientId", en: "Client", ar: "العميل", render: (r) => clientName(r.clientId) },
    { key: "isActive", en: "Active", ar: "نشط", render: (r) => <StatusPill status={r.isActive === false ? "cancelled" : "active"} /> },
    { key: "lastLoginAt", en: "Last login", ar: "آخر دخول", render: (r) => r.lastLoginAt ?? "—" },
  ];

  const approvalCols: Column[] = [
    { key: "entityType", en: "Document", ar: "المستند", render: (r) => String(r.entityType ?? "").replace(/^dc_/, "").replace(/_/g, " ") },
    { key: "entityId", en: "ID", ar: "المعرّف", render: (r) => <span className="font-mono text-xs">{r.entityId ?? "—"}</span> },
    { key: "clientId", en: "Client", ar: "العميل", render: (r) => (r.clientId ? clientName(r.clientId) : "—") },
    { key: "decision", en: "Decision", ar: "القرار", render: (r) => <StatusPill status={r.decision} /> },
    { key: "comments", en: "Comments", ar: "الملاحظات", render: (r) => <span className="line-clamp-1 text-xs text-slate-500">{r.comments ?? "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Client Portal", "بوابة العميل")}
        subtitle={L(
          "Give clients a read-only window into progress, photos, invoices and approvals — without exposing the internal ERP. Users and approvals are managed here.",
          "امنح العملاء نافذة للاطلاع على التقدم والصور والفواتير والاعتمادات — دون الوصول إلى النظام الداخلي. تُدار المستخدمون والاعتمادات من هنا.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Portal users", "مستخدمو البوابة")} value={users.length} icon={<Users className="h-5 w-5" />} tone="teal" sub={`${activeUsers} ${L("active", "نشط")}`} />
        <Kpi label={L("Clients on portal", "عملاء على البوابة")} value={new Set(users.map((u: any) => u.clientId)).size} icon={<Globe className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Pending approvals", "اعتمادات معلقة")} value={pendingApprovals} icon={<BadgeCheck className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Total approval records", "إجمالي الاعتمادات")} value={approvals.length} icon={<ShieldCheck className="h-5 w-5" />} tone="indigo" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: Link2, en: "Share a progress link", ar: "شارك رابط التقدم", dEn: "Each client gets a tokenised link to a live progress page.", dAr: "يحصل كل عميل على رابط مشفّر لصفحة تقدم حية." },
          { icon: Bell, en: "Automatic updates", ar: "تحديثات تلقائية", dEn: "Clients are notified when a bill is certified or a milestone is reached.", dAr: "يُبلّغ العميل عند اعتماد مستخلص أو بلوغ مرحلة إنجاز." },
          { icon: ShieldCheck, en: "Read-only by design", ar: "للاطلاع فقط", dEn: "Portal users see only their own project — never other tenants or modules.", dAr: "يرى مستخدم البوابة مشروعه فقط — لا منشآت أو وحدات أخرى." },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.en} className="rounded-2xl border border-[#e6e1d6] bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="h-4.5 w-4.5" /></span>
              <h3 className="mt-2 text-sm font-bold text-[#10231c]">{L(c.en, c.ar)}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{L(c.dEn, c.dAr)}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "users", label: L("Portal users", "مستخدمو البوابة"), badge: users.length },
            { key: "approvals", label: L("Client approvals", "اعتمادات العملاء"), badge: approvals.length },
          ]}
        />
        <button
          type="button"
          onClick={() =>
            tab === "users"
              ? exportCsv("decoration-portal-users", ["User", "Email", "Client", "Active"], users.map((r: any) => [r.name ?? r.email, r.email, clientName(r.clientId), r.isActive === false ? "no" : "yes"]))
              : exportCsv("decoration-portal-approvals", ["Document", "ID", "Client", "Status", "Comments"], approvals.map((r: any) => [r.entityType, r.entityId ?? "", r.clientId ? clientName(r.clientId) : "", r.decision ?? "", r.comments ?? ""]))
          }
          className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700"
        >
          Excel
        </button>
      </div>

      {tab === "users" ? (
        <RecordPanel
          title={L("Portal users", "مستخدمو البوابة")}
          subtitle={L("Invite a client contact to the portal", "دعوة جهة اتصال من العميل إلى البوابة")}
          createLabel={L("Invite user", "دعوة مستخدم")}
          columns={userCols}
          rows={users}
          loading={usersQ.isLoading}
          empty={L("No portal users yet.", "لا مستخدمي بوابة بعد.")}
          pending={userCreate.isPending}
          fields={[
            { name: "clientId", en: "Client", ar: "العميل", type: "select", options: clientOptions, required: true },
            { name: "name", en: "Contact name", ar: "اسم جهة الاتصال" },
            { name: "email", en: "Email", ar: "البريد الإلكتروني", required: true },
            { name: "userId", en: "Existing user ID (optional)", ar: "معرّف مستخدم موجود (اختياري)", type: "number" },
          ]}
          onCreate={(v) => userCreate.mutate({
            clientId: Number(v.clientId),
            name: v.name,
            email: v.email,
            userId: v.userId ? Number(v.userId) : undefined,
          })}
        />
      ) : (
        <RecordPanel
          title={L("Client approval records", "سجلات اعتماد العميل")}
          subtitle={L("What clients have approved or rejected", "ما اعتمده العملاء أو رفضوه")}
          columns={approvalCols}
          rows={approvals}
          loading={approvalsQ.isLoading}
          empty={L("No client approvals yet.", "لا اعتمادات عملاء بعد.")}
        />
      )}
    </div>
  );
}