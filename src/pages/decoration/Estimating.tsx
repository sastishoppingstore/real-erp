import { useState } from "react";
import { FileSignature, ScrollText, Trophy, TrendingUp } from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useDeco, money, PageHeader, Kpi, TabBar, useTab, StatusPill,
  RecordPanel, exportCsv, printReport, type Column,
} from "./shared";

const STATUSES = ["preparing", "submitted", "won", "lost", "cancelled"] as const;

export default function DecorationEstimating() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("tenders");
  const [q, setQ] = useState("");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const tendersQ = trpc.decoration.tenderList.useQuery();
  const quotesQ = trpc.decoration.quotationList.useQuery();

  const tenderCreate = trpc.decoration.tenderCreate.useMutation({ onSuccess: () => tendersQ.refetch() });
  const quoteCreate = trpc.decoration.quotationCreate.useMutation({ onSuccess: () => quotesQ.refetch() });

  const projectOptions = (projectsQ.data ?? []).map((p: any) => ({
    value: String(p.id), label: `${p.projectCode} — ${p.nameEn}`,
  }));
  const projectName = (id: any) => {
    const p = (projectsQ.data ?? []).find((x: any) => x.id === Number(id));
    return p ? `${p.projectCode}` : "—";
  };

  const tenders = (tendersQ.data ?? []).filter((t: any) =>
    !q || `${t.winLossReason ?? ""} ${t.status}`.toLowerCase().includes(q.toLowerCase()));
  const quotes = (quotesQ.data ?? []).filter((t: any) =>
    !q || `${t.titleEn ?? ""} ${t.status}`.toLowerCase().includes(q.toLowerCase()));

  const won = (tendersQ.data ?? []).filter((t: any) => t.status === "won").length;
  const lost = (tendersQ.data ?? []).filter((t: any) => t.status === "lost").length;
  const open = (tendersQ.data ?? []).filter((t: any) => ["preparing", "submitted"].includes(t.status)).length;
  const quoteValue = (quotesQ.data ?? []).reduce((s: number, x: any) => s + Number(x.totalAmount ?? 0), 0);

  const tenderCols: Column[] = [
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => <span className="font-mono text-xs">{projectName(r.projectId)}</span> },
    { key: "submissionDate", en: "Submission", ar: "التقديم", render: (r) => r.submissionDate ?? "—" },
    { key: "bidBondAmount", en: "Bid bond", ar: "ضمان المناقصة", render: (r) => money(r.bidBondAmount) },
    { key: "value", en: "Tender value", ar: "قيمة المناقصة", render: (r) => money(r.value) },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
    { key: "winLossReason", en: "Win / loss note", ar: "ملاحظة الفوز/الخسارة", render: (r) => <span className="text-xs text-slate-500">{r.winLossReason || "—"}</span> },
  ];

  const quoteCols: Column[] = [
    { key: "titleEn", en: "Quotation", ar: "عرض السعر", render: (r) => <span className="font-medium">{r.titleEn}</span> },
    { key: "projectId", en: "Project", ar: "المشروع", render: (r) => <span className="font-mono text-xs">{projectName(r.projectId)}</span> },
    { key: "totalAmount", en: "Value", ar: "القيمة", render: (r) => money(r.totalAmount) },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
    { key: "createdAt", en: "Created", ar: "أُنشئ", render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-GB") : "—" },
  ];

  const onExport = () => {
    if (tab === "tenders") {
      exportCsv("decoration-tenders", ["Project", "Submission", "Bid bond", "Value", "Status", "Note"],
        tenders.map((r: any) => [projectName(r.projectId), r.submissionDate ?? "", r.bidBondAmount, r.value, r.status, r.winLossReason ?? ""]));
    } else {
      exportCsv("decoration-quotations", ["Title", "Project", "Value", "Status"],
        quotes.map((r: any) => [r.titleEn, projectName(r.projectId), r.totalAmount, r.status]));
    }
  };

  const onPrint = () => {
    const isT = tab === "tenders";
    printReport({
      titleEn: isT ? "Tender Register" : "Quotation Register",
      titleAr: isT ? "سجل المناقصات" : "سجل عروض الأسعار",
      rtl: isAr,
      head: isT ? ["Project", "Submission", "Bid bond", "Value", "Status"] : ["Quotation", "Project", "Value", "Status"],
      rows: isT
        ? tenders.map((r: any) => [projectName(r.projectId), r.submissionDate ?? "", money(r.bidBondAmount), money(r.value), r.status])
        : quotes.map((r: any) => [r.titleEn, projectName(r.projectId), money(r.totalAmount), r.status]),
      footerNote: L("Decoration & Construction — Estimating", "الديكور والإنشاءات — التسعير"),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Estimating, Tenders & Quotations", "التسعير والمناقصات وعروض الأسعار")}
        subtitle={L(
          "Track bids, bid bonds, submission dates and win/loss; issue client quotations and convert them into BOQ and contracts.",
          "تابع المناقصات وضماناتها وتواريخ التقديم ونتائج الفوز/الخسارة؛ وأصدر عروض الأسعار للعملاء وحوّلها إلى جداول تقديرية وعقود.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Open tenders", "مناقصات مفتوحة")} value={open} icon={<FileSignature className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Won", "فائزة")} value={won} icon={<Trophy className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Lost", "خاسرة")} value={lost} icon={<TrendingUp className="h-5 w-5" />} tone="rose" />
        <Kpi label={L("Quotation value", "قيمة العروض")} value={money(quoteValue)} icon={<ScrollText className="h-5 w-5" />} tone="sky" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "tenders", label: L("Tenders", "المناقصات"), badge: tenders.length },
            { key: "quotations", label: L("Quotations", "عروض الأسعار"), badge: quotes.length },
          ]}
        />
        <div className="flex items-center gap-2">
          <input
            className="h-9 w-56 rounded-md border border-slate-300 bg-white px-3 text-sm"
            placeholder={L("Filter…", "تصفية…")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" onClick={onExport} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">
            Excel
          </button>
          <button type="button" onClick={onPrint} className="h-9 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-600 hover:text-amber-700">
            PDF
          </button>
        </div>
      </div>

      {tab === "tenders" ? (
        <RecordPanel
            title={L("Tender register", "سجل المناقصات")}
            subtitle={L("Bid bond, submission and outcome", "ضمان المناقصة والتقديم والنتيجة")}
            createLabel={L("New tender", "مناقصة جديدة")}
            columns={tenderCols}
            rows={tenders}
            loading={tendersQ.isLoading}
            empty={L("No tenders yet.", "لا مناقصات بعد.")}
            pending={tenderCreate.isPending}
            fields={[
              { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
              { name: "submissionDate", en: "Submission date", ar: "تاريخ التقديم", type: "date" },
              { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "preparing", options: STATUSES.map((s) => ({ value: s, label: s })) },
              { name: "winLossReason", en: "Win / loss note", ar: "ملاحظة الفوز أو الخسارة", span: 2 },
            ]}
            onCreate={(v) => tenderCreate.mutate({
              projectId: Number(v.projectId),
              submissionDate: v.submissionDate,
              status: v.status as any,
              winLossReason: v.winLossReason,
            })}
          />
      ) : (
        <RecordPanel
            title={L("Client quotations", "عروض أسعار العملاء")}
            subtitle={L("Value, status and conversion to BOQ / contract", "القيمة والحالة والتحويل إلى جدول تقديري أو عقد")}
            createLabel={L("New quotation", "عرض سعر جديد")}
            columns={quoteCols}
            rows={quotes}
            loading={quotesQ.isLoading}
            empty={L("No quotations yet.", "لا عروض أسعار بعد.")}
            pending={quoteCreate.isPending}
            fields={[
              { name: "projectId", en: "Project", ar: "المشروع", type: "select", options: projectOptions, required: true },
              { name: "titleEn", en: "Title", ar: "العنوان", required: true },
              { name: "totalAmount", en: "Value (SAR)", ar: "القيمة (ريال)", type: "number", required: true },
              { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "draft", options: ["draft", "submitted", "approved", "rejected", "converted"].map((s) => ({ value: s, label: s })) },
            ]}
            onCreate={(v) => quoteCreate.mutate({
              projectId: Number(v.projectId),
              titleEn: v.titleEn,
              totalAmount: v.totalAmount,
              status: v.status as any,
            })}
          />
      )}

      <p className="text-xs text-slate-400">
        {L(
          "Approved quotations feed the BOQ (Estimation) and the contract record; nothing is duplicated from Sales.",
          "عروض الأسعار المعتمدة تغذي الجدول التقديري والعقد؛ ولا يتم تكرار بيانات المبيعات.",
        )}
      </p>
    </div>
  );
}