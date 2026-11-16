import { Banknote, Wallet, Landmark, Coins, FileCheck2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, printReport, type Column,
} from "./shared";

export default function DecorationTreasury() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("receipts");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const clientsQ = trpc.decoration.clientList.useQuery();
  const receiptsQ = trpc.decoration.receiptList.useQuery();
  const paymentsQ = trpc.decoration.paymentList.useQuery();
  const chequesQ = trpc.decoration.chequeList.useQuery();
  const pettyQ = trpc.decoration.pettyCashList.useQuery();
  const claimsQ = trpc.decoration.expenseClaimList.useQuery();

  const receiptCreate = trpc.decoration.receiptCreate.useMutation({ onSuccess: () => receiptsQ.refetch() });
  const paymentCreate = trpc.decoration.paymentCreate.useMutation({ onSuccess: () => paymentsQ.refetch() });
  const chequeCreate = trpc.decoration.chequeCreate.useMutation({ onSuccess: () => chequesQ.refetch() });
  const pettyCreate = trpc.decoration.pettyCashCreate.useMutation({ onSuccess: () => pettyQ.refetch() });
  const claimCreate = trpc.decoration.expenseClaimCreate.useMutation({ onSuccess: () => claimsQ.refetch() });

  const projects = projectsQ.data ?? [];
  const receipts = receiptsQ.data ?? [];
  const payments = paymentsQ.data ?? [];
  const cheques = chequesQ.data ?? [];
  const petty = pettyQ.data ?? [];
  const claims = claimsQ.data ?? [];

  const projectOptions = projects.map((p: any) => ({ value: String(p.id), label: `${p.projectCode} — ${p.nameEn}` }));
  const clientOptions = (clientsQ.data ?? []).map((c: any) => ({ value: String(c.id), label: c.nameEn }));
  const projectCode = (id: any) => projects.find((p: any) => p.id === Number(id))?.projectCode ?? "—";

  const today = new Date().toISOString().slice(0, 10);
  const receiptTotal = receipts.reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  const paymentTotal = payments.reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  const pendingCheques = cheques.filter((c: any) => c.status === "pending")
    .reduce((s: number, c: any) => s + Number(c.amount ?? 0), 0);
  const pettyBalance = petty.reduce((s: number, r: any) => s + (r.entryType === "top_up" ? Number(r.amount ?? 0) : -Number(r.amount ?? 0)), 0);

  const receiptCols: Column[] = [
    { key: "receiptDate", en: "Date", ar: "التاريخ", render: (r) => r.receiptDate ?? "—" },
    { key: "receiptNo", en: "Receipt no.", ar: "رقم السند", render: (r) => <span className="font-mono text-xs">{r.receiptNo ?? "—"}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => (r.projectId ? projectCode(r.projectId) : "—") },
    { key: "amount", en: "Amount", ar: "المبلغ", render: (r) => <span className="font-semibold text-emerald-700">{money(r.amount)}</span> },
    { key: "paymentMethod", en: "Method", ar: "الطريقة", render: (r) => String(r.paymentMethod ?? "").replace(/_/g, " ") },
    { key: "reference", en: "Reference", ar: "المرجع", render: (r) => r.reference ?? "—" },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const paymentCols: Column[] = [
    { key: "paymentDate", en: "Date", ar: "التاريخ", render: (r) => r.paymentDate ?? "—" },
    { key: "paymentNo", en: "Payment no.", ar: "رقم السند", render: (r) => <span className="font-mono text-xs">{r.paymentNo ?? "—"}</span> },
    { key: "payeeType", en: "Payee", ar: "المستفيد", render: (r) => String(r.payeeType ?? "") },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => (r.projectId ? projectCode(r.projectId) : "—") },
    { key: "amount", en: "Amount", ar: "المبلغ", render: (r) => <span className="font-semibold text-rose-700">{money(r.amount)}</span> },
    { key: "paymentMethod", en: "Method", ar: "الطريقة", render: (r) => String(r.paymentMethod ?? "").replace(/_/g, " ") },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const chequeCols: Column[] = [
    { key: "chequeNo", en: "Cheque no.", ar: "رقم الشيك", render: (r) => <span className="font-mono text-xs">{r.chequeNo ?? "—"}</span> },
    { key: "direction", en: "Direction", ar: "الاتجاه", render: (r) => (
      <span className={`inline-flex items-center gap-1 text-xs ${r.direction === "received" ? "text-emerald-700" : "text-rose-700"}`}>
        {r.direction === "received" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
        {r.direction}
      </span>
    ) },
    { key: "partyType", en: "Party", ar: "الطرف", render: (r) => String(r.partyType) },
    { key: "bankName", en: "Bank", ar: "البنك", render: (r) => r.bankName ?? "—" },
    { key: "amount", en: "Amount", ar: "المبلغ", render: (r) => money(r.amount) },
    { key: "chequeDate", en: "Cheque date", ar: "تاريخ الشيك", render: (r) => r.chequeDate ?? "—" },
    { key: "dueDate", en: "Due date", ar: "تاريخ الاستحقاق", render: (r) => r.dueDate ?? "—" },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const pettyCols: Column[] = [
    { key: "entryDate", en: "Date", ar: "التاريخ", render: (r) => r.entryDate ?? "—" },
    { key: "entryType", en: "Type", ar: "النوع", render: (r) => <StatusPill status={r.entryType} /> },
    { key: "description", en: "Description", ar: "الوصف", render: (r) => r.description ?? "—" },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => (r.projectId ? projectCode(r.projectId) : "—") },
    { key: "amount", en: "Amount", ar: "المبلغ", render: (r) => money(r.amount) },
  ];

  const claimCols: Column[] = [
    { key: "claimDate", en: "Date", ar: "التاريخ", render: (r) => r.claimDate ?? "—" },
    { key: "claimNo", en: "Claim no.", ar: "رقم المطالبة", render: (r) => <span className="font-mono text-xs">{r.claimNo ?? "—"}</span> },
    { key: "description", en: "Description", ar: "الوصف", render: (r) => <span className="line-clamp-2">{r.description ?? "—"}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => (r.projectId ? projectCode(r.projectId) : "—") },
    { key: "amount", en: "Amount", ar: "المبلغ", render: (r) => money(r.amount) },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  const exportCurrent = () => {
    if (tab === "receipts") exportCsv("decoration-receipts", ["Date", "Receipt", "Project", "Amount", "Method", "Status"],
      receipts.map((r: any) => [r.receiptDate ?? "", r.receiptNo ?? "", r.projectId ? projectCode(r.projectId) : "", r.amount, r.paymentMethod, r.status]));
    else if (tab === "payments") exportCsv("decoration-payments", ["Date", "Payment", "Payee", "Project", "Amount", "Status"],
      payments.map((r: any) => [r.paymentDate ?? "", r.paymentNo ?? "", r.payeeType, r.projectId ? projectCode(r.projectId) : "", r.amount, r.status]));
    else if (tab === "cheques") exportCsv("decoration-cheques", ["Cheque", "Direction", "Party", "Bank", "Amount", "Due", "Status"],
      cheques.map((r: any) => [r.chequeNo ?? "", r.direction, r.partyType, r.bankName ?? "", r.amount, r.dueDate ?? "", r.status]));
    else if (tab === "petty") exportCsv("decoration-petty-cash", ["Date", "Type", "Description", "Amount"],
      petty.map((r: any) => [r.entryDate ?? "", r.entryType, r.description ?? "", r.amount]));
    else exportCsv("decoration-expense-claims", ["Date", "Claim", "Description", "Amount", "Status"],
      claims.map((r: any) => [r.claimDate ?? "", r.claimNo ?? "", r.description ?? "", r.amount, r.status]));
  };

  const printCurrent = () => {
    const map: Record<string, { en: string; ar: string; head: string[]; rows: (string | number)[][] }> = {
      receipts: { en: "Receipt Vouchers", ar: "سندات القبض", head: ["Date", "Receipt", "Project", "Amount", "Status"], rows: receipts.map((r: any) => [r.receiptDate ?? "", r.receiptNo ?? "", r.projectId ? projectCode(r.projectId) : "", money(r.amount), r.status]) },
      payments: { en: "Payment Vouchers", ar: "سندات الصرف", head: ["Date", "Payment", "Payee", "Amount", "Status"], rows: payments.map((r: any) => [r.paymentDate ?? "", r.paymentNo ?? "", r.payeeType, money(r.amount), r.status]) },
      cheques: { en: "Post-dated Cheques", ar: "الشيكات المؤجلة", head: ["Cheque", "Direction", "Bank", "Amount", "Due", "Status"], rows: cheques.map((r: any) => [r.chequeNo ?? "", r.direction, r.bankName ?? "", money(r.amount), r.dueDate ?? "", r.status]) },
      petty: { en: "Petty Cash", ar: "النقدية البسيطة", head: ["Date", "Type", "Description", "Amount"], rows: petty.map((r: any) => [r.entryDate ?? "", r.entryType, r.description ?? "", money(r.amount)]) },
      claims: { en: "Expense Claims", ar: "مطالبات المصروفات", head: ["Date", "Claim", "Description", "Amount", "Status"], rows: claims.map((r: any) => [r.claimDate ?? "", r.claimNo ?? "", r.description ?? "", money(r.amount), r.status]) },
    };
    const m = map[tab] ?? map.receipts;
    printReport({ titleEn: m.en, titleAr: m.ar, rtl: isAr, head: m.head, rows: m.rows, footerNote: L("Decoration & Construction — Treasury", "الديكور والإنشاءات — الخزينة") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Receipts, Payments & Cheques", "سندات القبض والصرف والشيكات")}
        subtitle={L(
          "Client collections, supplier and subcontractor payments, post-dated cheques, petty cash floats and employee expense claims.",
          "تحصيلات العملاء ومدفوعات الموردين والمقاولين والشيكات المؤجلة وعهد النقدية ومطالبات الموظفين.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Receipts", "المقبوضات")} value={money(receiptTotal)} icon={<Banknote className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Payments", "المدفوعات")} value={money(paymentTotal)} icon={<Wallet className="h-5 w-5" />} tone="rose" />
        <Kpi label={L("Pending cheques", "شيكات معلقة")} value={money(pendingCheques)} icon={<Landmark className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Petty cash balance", "رصيد النقدية")} value={money(pettyBalance)} icon={<Coins className="h-5 w-5" />} tone="sky" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "receipts", label: L("Receipts", "القبض"), badge: receipts.length },
            { key: "payments", label: L("Payments", "الصرف"), badge: payments.length },
            { key: "cheques", label: L("Cheques", "الشيكات"), badge: cheques.length },
            { key: "petty", label: L("Petty cash", "النقدية"), badge: petty.length },
            { key: "claims", label: L("Claims", "المطالبات"), badge: claims.length },
          ]}
        />
        <div className="flex gap-2">
          <button type="button" onClick={exportCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">Excel</button>
          <button type="button" onClick={printCurrent} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">PDF</button>
        </div>
      </div>

      {tab === "receipts" ? (
        <RecordPanel
          title={L("Receipt vouchers", "سندات القبض")}
          subtitle={L("Client collections and invoice allocation", "تحصيلات العملاء وتخصيص الفواتير")}
          createLabel={L("New receipt", "سند قبض جديد")}
          columns={receiptCols}
          rows={receipts}
          loading={receiptsQ.isLoading}
          empty={L("No receipts yet.", "لا سندات قبض بعد.")}
          pending={receiptCreate.isPending}
          fields={[
            { name: "receiptDate", en: "Receipt date", ar: "تاريخ السند", type: "date", defaultValue: today, required: true },
            { name: "amount", en: "Amount (SAR)", ar: "المبلغ (ريال)", type: "number", required: true },
            { name: "clientId", en: "Client", ar: "العميل", type: "select", options: clientOptions },
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions },
            { name: "paymentMethod", en: "Method", ar: "الطريقة", type: "select", defaultValue: "bank_transfer", options: ["cash", "bank_transfer", "cheque", "card", "other"].map((s) => ({ value: s, label: s.replace(/_/g, " ") })) },
            { name: "reference", en: "Reference", ar: "المرجع" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "confirmed", options: ["draft", "confirmed", "bounced", "cancelled"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => receiptCreate.mutate({
            receiptDate: v.receiptDate,
            amount: v.amount,
            clientId: v.clientId ? Number(v.clientId) : undefined,
            projectId: v.projectId ? Number(v.projectId) : undefined,
            paymentMethod: v.paymentMethod as any,
            reference: v.reference,
            status: v.status as any,
          })}
        />
      ) : tab === "payments" ? (
        <RecordPanel
          title={L("Payment vouchers", "سندات الصرف")}
          subtitle={L("Supplier, subcontractor and employee payments", "مدفوعات الموردين والمقاولين والموظفين")}
          createLabel={L("New payment", "سند صرف جديد")}
          columns={paymentCols}
          rows={payments}
          loading={paymentsQ.isLoading}
          empty={L("No payments yet.", "لا سندات صرف بعد.")}
          pending={paymentCreate.isPending}
          fields={[
            { name: "paymentDate", en: "Payment date", ar: "تاريخ السند", type: "date", defaultValue: today, required: true },
            { name: "amount", en: "Amount (SAR)", ar: "المبلغ (ريال)", type: "number", required: true },
            { name: "payeeType", en: "Payee type", ar: "نوع المستفيد", type: "select", defaultValue: "supplier", required: true, options: ["supplier", "subcontractor", "employee", "other"].map((s) => ({ value: s, label: s })) },
            { name: "payeeId", en: "Payee ID (optional)", ar: "معرّف المستفيد (اختياري)", type: "number" },
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions },
            { name: "paymentMethod", en: "Method", ar: "الطريقة", type: "select", defaultValue: "bank_transfer", options: ["cash", "bank_transfer", "cheque", "card", "other"].map((s) => ({ value: s, label: s.replace(/_/g, " ") })) },
            { name: "reference", en: "Reference", ar: "المرجع" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "approved", options: ["draft", "approved", "paid", "cancelled"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => paymentCreate.mutate({
            paymentDate: v.paymentDate,
            amount: v.amount,
            payeeType: v.payeeType as any,
            payeeId: v.payeeId ? Number(v.payeeId) : undefined,
            projectId: v.projectId ? Number(v.projectId) : undefined,
            paymentMethod: v.paymentMethod as any,
            reference: v.reference,
            status: v.status as any,
          })}
        />
      ) : tab === "cheques" ? (
        <RecordPanel
          title={L("Post-dated cheques (PDC)", "الشيكات المؤجلة")}
          subtitle={L("Received and issued cheques with due dates", "الشيكات المستلمة والصادرة وتواريخ استحقاقها")}
          createLabel={L("New cheque", "شيك جديد")}
          columns={chequeCols}
          rows={cheques}
          loading={chequesQ.isLoading}
          empty={L("No cheques recorded yet.", "لا شيكات مسجلة بعد.")}
          pending={chequeCreate.isPending}
          fields={[
            { name: "direction", en: "Direction", ar: "الاتجاه", type: "select", defaultValue: "received", required: true, options: [{ value: "received", label: L("Received", "مستلم") }, { value: "issued", label: L("Issued", "صادر") }] },
            { name: "partyType", en: "Party type", ar: "نوع الطرف", type: "select", defaultValue: "client", required: true, options: ["client", "supplier", "subcontractor", "other"].map((s) => ({ value: s, label: s })) },
            { name: "partyId", en: "Party ID (optional)", ar: "معرّف الطرف (اختياري)", type: "number" },
            { name: "chequeNo", en: "Cheque number", ar: "رقم الشيك" },
            { name: "bankName", en: "Bank", ar: "البنك" },
            { name: "amount", en: "Amount (SAR)", ar: "المبلغ (ريال)", type: "number" },
            { name: "chequeDate", en: "Cheque date", ar: "تاريخ الشيك", type: "date" },
            { name: "dueDate", en: "Due date", ar: "تاريخ الاستحقاق", type: "date" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "pending", options: ["pending", "deposited", "cleared", "bounced", "cancelled"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => chequeCreate.mutate({
            direction: v.direction as any,
            partyType: v.partyType as any,
            partyId: v.partyId ? Number(v.partyId) : undefined,
            chequeNo: v.chequeNo,
            bankName: v.bankName,
            amount: v.amount,
            chequeDate: v.chequeDate,
            dueDate: v.dueDate,
            status: v.status as any,
          })}
        />
      ) : tab === "petty" ? (
        <RecordPanel
          title={L("Petty cash", "النقدية البسيطة")}
          subtitle={L("Top-ups and site expenses", "التغذية ومصروفات الموقع")}
          createLabel={L("New entry", "قيد جديد")}
          columns={pettyCols}
          rows={petty}
          loading={pettyQ.isLoading}
          empty={L("No petty cash entries yet.", "لا قيود نقدية بعد.")}
          pending={pettyCreate.isPending}
          fields={[
            { name: "entryDate", en: "Entry date", ar: "تاريخ القيد", type: "date", defaultValue: today, required: true },
            { name: "entryType", en: "Type", ar: "النوع", type: "select", defaultValue: "expense", required: true, options: [{ value: "top_up", label: L("Top-up", "تغذية") }, { value: "expense", label: L("Expense", "مصروف") }] },
            { name: "amount", en: "Amount (SAR)", ar: "المبلغ (ريال)", type: "number", required: true },
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions },
            { name: "description", en: "Description", ar: "الوصف", type: "textarea", span: 2 },
            { name: "receiptUrl", en: "Receipt URL", ar: "رابط الإيصال", span: 2 },
          ]}
          onCreate={(v) => pettyCreate.mutate({
            entryDate: v.entryDate,
            entryType: v.entryType as any,
            amount: v.amount,
            projectId: v.projectId ? Number(v.projectId) : undefined,
            description: v.description,
            receiptUrl: v.receiptUrl,
          })}
        />
      ) : (
        <RecordPanel
          title={L("Employee expense claims", "مطالبات مصروفات الموظفين")}
          subtitle={L("Submit, approve and reimburse", "التقديم والاعتماد والتعويض")}
          createLabel={L("New claim", "مطالبة جديدة")}
          columns={claimCols}
          rows={claims}
          loading={claimsQ.isLoading}
          empty={L("No expense claims yet.", "لا مطالبات بعد.")}
          pending={claimCreate.isPending}
          fields={[
            { name: "claimDate", en: "Claim date", ar: "تاريخ المطالبة", type: "date", defaultValue: today, required: true },
            { name: "amount", en: "Amount (SAR)", ar: "المبلغ (ريال)", type: "number", required: true },
            { name: "employeeId", en: "Employee ID (optional)", ar: "معرّف الموظف (اختياري)", type: "number" },
            { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions },
            { name: "description", en: "Description", ar: "الوصف", type: "textarea", span: 2 },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "submitted", "approved", "rejected", "paid"].map((s) => ({ value: s, label: s })) },
          ]}
          onCreate={(v) => claimCreate.mutate({
            claimDate: v.claimDate,
            amount: v.amount,
            employeeId: v.employeeId ? Number(v.employeeId) : undefined,
            projectId: v.projectId ? Number(v.projectId) : undefined,
            description: v.description,
            status: v.status as any,
          })}
        />
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <FileCheck2 className="h-3.5 w-3.5" />
        {L(
          "Every voucher is audited and can be matched to the Accounting module; the decoration ledger keeps the project dimension.",
          "كل سند مسجّل في سجل التدقيق ويمكن مطابقته مع وحدة المحاسبة؛ ويحتفظ سجل الديكور ببُعد المشروع.",
        )}
      </p>
    </div>
  );
}