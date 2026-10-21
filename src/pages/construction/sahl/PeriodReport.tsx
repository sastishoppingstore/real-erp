import { useEffect, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, btnGreenCls, SahlGrid, SectionHead } from "./ui";
import { printHtml } from "./printEngine";

type Frequency = "daily" | "weekly" | "monthly";

type PeriodSummary = {
  from: string;
  to: string;
  sales: { count: number; total: number; tax: number; paid: number; due: number };
  returns: { count: number; total: number };
  purchases: { count: number; total: number };
  payments: { count: number; total: number };
  expenses: { count: number; total: number };
  contracts: { count: number; value: number; invoiced: number };
  invoices: Array<{ no: string; date: string; customer: string; type: string; total: number; paid: number; due: number }>;
  returnRows: Array<{ no: string; date: string; customer: string; amount: number; reason: string }>;
  purchaseRows: Array<{ no: string; date: string; supplier: string; total: number; status: string }>;
  paymentRows: Array<{ date: string; customer: string; amount: number; method: string }>;
  contractRows: Array<{ no: string; title: string; client: string; date: string; value: number; status: string }>;
  topCustomers: Array<{ name: string; total: number }>;
  topItems: Array<{ name: string; qty: number; total: number }>;
};

type Config = {
  enabled: boolean;
  frequency: Frequency;
  sendTime: string;
  periodDays: string;
  recipients: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(value: string, days: number) {
  const [y, m, d] = value.split("-").map(Number);
  return ymd(new Date(y, (m || 1) - 1, (d || 1) + days, 12, 0, 0));
}

function todayYmd() {
  return ymd(new Date());
}

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPrintHtml(d: PeriodSummary) {
  const table = (title: string, columns: string[], rows: Array<Array<string | number>>) => {
    const head = columns.map((c) => `<th>${esc(c)}</th>`).join("");
    const body = rows.length
      ? rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${columns.length}">—</td></tr>`;
    return `<h3 style="margin:14px 0 4px;font-size:13px">${esc(title)}</h3>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  };

  const kpis: Array<[string, string]> = [
    ["Sales / المبيعات", money(d.sales.total)],
    ["VAT / الضريبة", money(d.sales.tax)],
    ["Paid / المحصّل", money(d.sales.paid)],
    ["Due / المتبقي", money(d.sales.due)],
    ["Invoices / الفواتير", String(d.sales.count)],
    ["Returns / المرتجعات", money(d.returns.total)],
    ["Purchases / المشتريات", money(d.purchases.total)],
    ["Expenses / المصروفات", money(d.expenses.total)],
  ];

  const kpiRows: string[] = [];
  for (let i = 0; i < kpis.length; i += 2) {
    const left = kpis[i];
    const right = kpis[i + 1];
    kpiRows.push(`<tr>
      <td style="font-weight:bold;text-align:left">${esc(left[0])}</td>
      <td style="text-align:left">${esc(left[1])}</td>
      <td style="font-weight:bold;text-align:left">${esc(right?.[0] ?? "")}</td>
      <td style="text-align:left">${esc(right?.[1] ?? "")}</td>
    </tr>`);
  }

  return `<h1>Period report / تقرير فترة</h1>
    <div style="text-align:center;margin-bottom:10px">${esc(d.from)} — ${esc(d.to)}</div>
    <table style="width:auto;margin:0 auto 10px"><tbody>${kpiRows.join("")}</tbody></table>
    ${table("Sales invoices / فواتير البيع", ["No.", "Date", "Customer", "Type", "Total", "Paid", "Due"],
      d.invoices.map((r) => [r.no, r.date, r.customer, r.type, money(r.total), money(r.paid), money(r.due)]))}
    ${table("Returns / المرتجعات", ["No.", "Date", "Customer", "Amount", "Reason"],
      d.returnRows.map((r) => [r.no, r.date, r.customer, money(r.amount), r.reason]))}
    ${table("Purchases / المشتريات", ["No.", "Date", "Supplier", "Total", "Status"],
      d.purchaseRows.map((r) => [r.no, r.date, r.supplier, money(r.total), r.status]))}
    ${table("Payments / المقبوضات", ["Date", "Customer", "Amount", "Method"],
      d.paymentRows.map((r) => [r.date, r.customer, money(r.amount), r.method]))}
    ${table("Top customers / أعلى العملاء", ["Customer", "Total"],
      d.topCustomers.map((r) => [r.name, money(r.total)]))}
    ${table("Top items / أعلى الأصناف", ["Item", "Qty", "Total"],
      d.topItems.map((r) => [r.name, r.qty, money(r.total)]))}
    ${table(`Contracts / العقود — ${d.contracts.count} (${money(d.contracts.value)}), invoiced ${money(d.contracts.invoiced)}`,
      ["No.", "Title", "Client", "Date", "Value", "Status"],
      d.contractRows.map((r) => [r.no, r.title, r.client, r.date, money(r.value), r.status]))}`;
}

export default function PeriodReport() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const utils = trpc.useUtils();

  const [from, setFrom] = useState(() => addDays(todayYmd(), -6));
  const [to, setTo] = useState(() => todayYmd());
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cfgMsg, setCfgMsg] = useState("");
  const fromRef = useRef<HTMLInputElement>(null);

  const valid = DATE_RE.test(from) && DATE_RE.test(to) && from <= to;

  const { data: summary, isFetching } = trpc.sahlReports.periodSummary.useQuery(
    { from, to },
    { enabled: valid },
  );
  const d = summary as PeriodSummary | undefined;

  const { data: settings } = trpc.sahlReports.settingsGet.useQuery();

  const [cfg, setCfg] = useState<Config>({
    enabled: false,
    frequency: "weekly",
    sendTime: "08:00",
    periodDays: "7",
    recipients: "",
  });

  useEffect(() => {
    if (!settings) return;
    const s = settings as any;
    setCfg({
      enabled: !!s.enabled,
      frequency: (s.frequency ?? "weekly") as Frequency,
      sendTime: s.sendTime ?? "08:00",
      periodDays: String(s.periodDays ?? 7),
      recipients: s.recipients ?? "",
    });
  }, [settings]);

  const emailM = trpc.sahlReports.emailPeriod.useMutation({
    onSuccess: (res: any) => {
      setEmailMsg(res?.sent
        ? `${T("أُرسل إلى", "Sent to")} ${res.to}`
        : (res?.error || T("لم يتم الإرسال", "Email was not sent")));
    },
    onError: (err: any) => setEmailMsg(err?.message || T("فشل الإرسال", "Email failed")),
  });

  const saveM = trpc.sahlReports.settingsSave.useMutation({
    onSuccess: () => {
      setCfgMsg(T("تم حفظ الإعدادات", "Settings saved"));
      utils.sahlReports.settingsGet.invalidate();
    },
    onError: (err: any) => setCfgMsg(err?.message || T("فشل الحفظ", "Save failed")),
  });

  const sendNowM = trpc.sahlReports.sendNow.useMutation({
    onSuccess: (res: any) => {
      setCfgMsg(res?.sent
        ? `${T("أُرسل إلى", "Sent to")} ${res.to}`
        : (res?.error || T("لم يتم الإرسال", "Email was not sent")));
      utils.sahlReports.settingsGet.invalidate();
    },
    onError: (err: any) => setCfgMsg(err?.message || T("فشل الإرسال", "Email failed")),
  });

  const today = todayYmd();
  const presets: Array<{ key: string; label: string; from: string; to: string }> = [
    { key: "today", label: T("اليوم", "Today"), from: today, to: today },
    { key: "7", label: T("7 أيام", "7 days"), from: addDays(today, -6), to: today },
    { key: "30", label: T("30 يوم", "30 days"), from: addDays(today, -29), to: today },
    { key: "month", label: T("هذا الشهر", "This month"), from: `${today.slice(0, 7)}-01`, to: today },
  ];
  const activeKey = presets.find((p) => p.from === from && p.to === to)?.key ?? "custom";

  const typeLabel = (value: string) => {
    if (value === "standard") return T("قياسية", "Standard");
    if (value === "simplified") return T("مبسطة", "Simplified");
    if (value === "zatca") return T("زاتكا", "ZATCA");
    return value;
  };

  const kpis: Array<[string, string]> = [
    [T("المبيعات", "Sales"), money(d?.sales.total)],
    [T("الضريبة", "VAT"), money(d?.sales.tax)],
    [T("المحصّل", "Paid"), money(d?.sales.paid)],
    [T("المتبقي", "Due"), money(d?.sales.due)],
    [T("الفواتير", "Invoices"), String(d?.sales.count ?? 0)],
    [T("المرتجعات", "Returns"), money(d?.returns.total)],
    [T("المشتريات", "Purchases"), money(d?.purchases.total)],
    [T("المصروفات", "Expenses"), money(d?.expenses.total)],
  ];

  const openEmail = () => {
    setEmailMsg("");
    setEmailOpen(true);
  };

  const printReport = () => {
    if (!d) return;
    printHtml(`Period report ${d.from} — ${d.to}`, buildPrintHtml(d));
  };

  const sendEmail = () => {
    if (!valid) return;
    setEmailMsg("");
    emailM.mutate({ from, to, email: emailTo.trim() || undefined });
  };

  const saveSettings = () => {
    setCfgMsg("");
    saveM.mutate({
      enabled: cfg.enabled,
      frequency: cfg.frequency,
      sendTime: cfg.sendTime,
      periodDays: Math.min(365, Math.max(1, Math.round(Number(cfg.periodDays) || 7))),
      recipients: cfg.recipients.trim() || undefined,
    });
  };

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex flex-wrap items-center gap-1.5 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تقرير فترة / Period report", "Period report / تقرير فترة")}</b>
        <span className="text-white/50">{T("من", "From")}</span>
        <input
          ref={fromRef}
          type="date"
          className={inputCls}
          style={{ width: 150 }}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <span className="text-white/50">{T("إلى", "To")}</span>
        <input
          type="date"
          className={inputCls}
          style={{ width: 150 }}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        {presets.map((p) => (
          <button
            key={p.key}
            className="border border-[#555] px-2 py-1 text-[11px] text-white hover:brightness-110"
            style={{ background: activeKey === p.key ? "#2fae4e" : "#222" }}
            onClick={() => {
              setFrom(p.from);
              setTo(p.to);
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          className="border border-[#555] px-2 py-1 text-[11px] text-white hover:brightness-110"
          style={{ background: activeKey === "custom" ? "#2fae4e" : "#222" }}
          onClick={() => fromRef.current?.focus()}
        >
          {T("مخصص", "Custom")}
        </button>
        <span className="flex-1" />
        <button className={btnCls} onClick={printReport} disabled={!d}>
          {T("طباعة", "Print")}
        </button>
        <button
          className={btnGreenCls}
          style={{ background: "#0a5c2a" }}
          onClick={() => (emailOpen ? setEmailOpen(false) : openEmail())}
          disabled={!valid}
        >
          {T("إرسال بالبريد", "Email")}
        </button>
        {isFetching && <span className="text-white/50">{T("تحميل...", "Loading...")}</span>}
      </div>

      {!valid && (
        <div className="mb-2 border border-red-800 bg-[#2a0b0b] px-2 py-1 text-red-300">
          {T("تاريخ البداية يجب أن يكون قبل تاريخ النهاية", "From must be on or before To")}
        </div>
      )}

      {emailOpen && (
        <div className="mb-2 border border-[#333] bg-[#111] p-2">
          <div className="mb-1 font-bold">{T("إرسال التقرير بالبريد", "Email this report")}</div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              className={inputCls}
              style={{ maxWidth: 300 }}
              placeholder={T("بريد المستلم (اتركه فارغاً للافتراضي)", "Recipient email (blank = default)")}
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendEmail();
              }}
            />
            <button
              className={btnGreenCls}
              style={{ background: "#0a5c2a" }}
              onClick={sendEmail}
              disabled={emailM.isPending || !valid}
            >
              {emailM.isPending ? T("جارٍ الإرسال...", "Sending...") : T("إرسال", "Send")}
            </button>
            <button className={btnCls} onClick={() => setEmailOpen(false)}>
              {T("إغلاق", "Close")}
            </button>
          </div>
          {emailMsg && <div className="mt-1 text-[#9ccc65]">{emailMsg}</div>}
          <div className="mt-1 text-white/50">
            {T("يُرسل نفس تقرير الفترة المعروض.", "The currently selected period is sent.")}
          </div>
        </div>
      )}

      <div className="mb-2 flex flex-wrap gap-2">
        {kpis.map(([label, value]) => (
          <div key={label} className="border border-[#333] bg-[#111] px-2 py-1">
            <span className="text-white/60">{label}: </span>
            <b className="tabular-nums">{value}</b>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <SectionHead>
          {T("فواتير البيع (فواتير أعمال)", "Sales invoices (labour)")} — {d?.sales.count ?? 0}
        </SectionHead>
        <SahlGrid
          columns={[T("الرقم", "No."), T("التاريخ", "Date"), T("العميل", "Customer"), T("النوع", "Type"), T("الإجمالي", "Total"), T("المدفوع", "Paid"), T("المتبقي", "Due")]}
          rows={(d?.invoices ?? []).map((r) => [
            r.no, r.date, r.customer, typeLabel(r.type),
            money(r.total), money(r.paid), money(r.due),
          ])}
          emptyText={T("لا توجد فواتير في هذه الفترة", "No invoices in this period")}
        />
      </div>

      <div className="mb-2">
        <SectionHead>{T("المرتجعات", "Returns")} — {d?.returns.count ?? 0}</SectionHead>
        <SahlGrid
          columns={[T("الرقم", "No."), T("التاريخ", "Date"), T("العميل", "Customer"), T("المبلغ", "Amount"), T("السبب", "Reason")]}
          rows={(d?.returnRows ?? []).map((r) => [r.no, r.date, r.customer, money(r.amount), r.reason])}
          emptyText={T("لا توجد مرتجعات", "No returns")}
        />
      </div>

      <div className="mb-2">
        <SectionHead>{T("المشتريات", "Purchases")} — {d?.purchases.count ?? 0}</SectionHead>
        <SahlGrid
          columns={[T("الرقم", "No."), T("التاريخ", "Date"), T("المورد", "Supplier"), T("الإجمالي", "Total"), T("الحالة", "Status")]}
          rows={(d?.purchaseRows ?? []).map((r) => [r.no, r.date, r.supplier, money(r.total), r.status])}
          emptyText={T("لا توجد مشتريات", "No purchases")}
        />
      </div>

      <div className="mb-2">
        <SectionHead>{T("المقبوضات", "Payments")} — {d?.payments.count ?? 0}</SectionHead>
        <SahlGrid
          columns={[T("التاريخ", "Date"), T("العميل", "Customer"), T("المبلغ", "Amount"), T("الطريقة", "Method")]}
          rows={(d?.paymentRows ?? []).map((r) => [r.date, r.customer, money(r.amount), r.method])}
          emptyText={T("لا توجد مقبوضات", "No payments")}
        />
      </div>

      <div className="mb-2">
        <SectionHead>{T("المصروفات (الخزينة)", "Expenses (cashbox)")} — {d?.expenses.count ?? 0}</SectionHead>
        <div className="border border-[#333] bg-[#111] px-2 py-1">
          <span className="text-white/60">{T("الإجمالي", "Total")}: </span>
          <b className="tabular-nums">{money(d?.expenses.total)}</b>
        </div>
      </div>

      <div className="mb-2 grid gap-2 xl:grid-cols-2">
        <div>
          <SectionHead>{T("أعلى العملاء", "Top customers")}</SectionHead>
          <SahlGrid
            columns={[T("العميل", "Customer"), T("الإجمالي", "Total")]}
            rows={(d?.topCustomers ?? []).map((r) => [r.name, money(r.total)])}
            emptyText={T("لا توجد بيانات", "No data")}
          />
        </div>
        <div>
          <SectionHead>{T("أعلى الأصناف", "Top items")}</SectionHead>
          <SahlGrid
            columns={[T("الصنف", "Item"), T("الكمية", "Qty"), T("الإجمالي", "Total")]}
            rows={(d?.topItems ?? []).map((r) => [r.name, Number(r.qty || 0), money(r.total)])}
            emptyText={T("لا توجد بيانات", "No data")}
          />
        </div>
      </div>

      <div className="mb-2">
        <SectionHead>
          {T("العقود", "Contracts")} — {d?.contracts.count ?? 0} · {T("القيمة", "Value")}: {money(d?.contracts.value)} · {T("المفوتر", "Invoiced")}: {money(d?.contracts.invoiced)}
        </SectionHead>
        <SahlGrid
          columns={[T("الرقم", "No."), T("العنوان", "Title"), T("العميل", "Client"), T("التاريخ", "Date"), T("القيمة", "Value"), T("الحالة", "Status")]}
          rows={(d?.contractRows ?? []).map((r) => [r.no, r.title, r.client, r.date, money(r.value), r.status])}
          emptyText={T("لا توجد عقود", "No contracts")}
        />
      </div>

      <div className="border border-[#333] bg-[#111]">
        <button
          className="flex w-full items-center justify-between px-2 py-1.5 text-left hover:bg-[#1a1a1a]"
          onClick={() => setSettingsOpen((open) => !open)}
        >
          <span className="font-bold">
            {T("إعدادات الإرسال التلقائي", "Scheduled email settings")}
          </span>
          <span className="text-white/60">{settingsOpen ? "−" : "+"}</span>
        </button>

        {settingsOpen && (
          <div className="border-t border-[#333] p-2">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={cfg.enabled}
                  onChange={(e) => setCfg((c) => ({ ...c, enabled: e.target.checked }))}
                />
                {T("مُفعّل", "Enabled")}
              </label>

              <label className="flex items-center gap-1.5">
                <span className="text-white/60">{T("التكرار", "Frequency")}</span>
                <select
                  className={inputCls}
                  style={{ width: 120 }}
                  value={cfg.frequency}
                  onChange={(e) => setCfg((c) => ({ ...c, frequency: e.target.value as Frequency }))}
                >
                  <option value="daily">{T("يومي", "Daily")}</option>
                  <option value="weekly">{T("أسبوعي", "Weekly")}</option>
                  <option value="monthly">{T("شهري", "Monthly")}</option>
                </select>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="text-white/60">{T("الوقت", "Time")}</span>
                <input
                  type="time"
                  className={inputCls}
                  style={{ width: 100 }}
                  value={cfg.sendTime}
                  onChange={(e) => setCfg((c) => ({ ...c, sendTime: e.target.value }))}
                />
              </label>

              <label className="flex items-center gap-1.5">
                <span className="text-white/60">{T("عدد أيام الفترة", "Period days")}</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  className={inputCls}
                  style={{ width: 80 }}
                  value={cfg.periodDays}
                  onChange={(e) => setCfg((c) => ({ ...c, periodDays: e.target.value }))}
                />
              </label>
            </div>

            <label className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="w-24 text-white/60">{T("المستلمون", "Recipients")}</span>
              <input
                type="text"
                className={inputCls}
                style={{ maxWidth: 420 }}
                placeholder={T("بريد أو أكثر مفصولاً بفاصلة (فارغ = بريد الشركة)", "One or more emails, comma separated (blank = company email)")}
                value={cfg.recipients}
                onChange={(e) => setCfg((c) => ({ ...c, recipients: e.target.value }))}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className={btnGreenCls}
                style={{ background: "#0a5c2a" }}
                onClick={saveSettings}
                disabled={saveM.isPending}
              >
                {saveM.isPending ? T("جارٍ الحفظ...", "Saving...") : T("حفظ", "Save")}
              </button>
              <button
                className={btnCls}
                onClick={() => {
                  setCfgMsg("");
                  sendNowM.mutate();
                }}
                disabled={sendNowM.isPending}
              >
                {sendNowM.isPending ? T("جارٍ الإرسال...", "Sending...") : T("إرسال الآن", "Send now")}
              </button>
              <span className="text-white/50">
                {T("الإرسال التلقائي يستخدم آخر إعدادات محفوظة.", "Scheduled sends use the last saved settings.")}
              </span>
            </div>

            {cfgMsg && <div className="mt-1 text-[#9ccc65]">{cfgMsg}</div>}
            {(settings as any)?.lastSentAt && (
              <div className="mt-1 text-white/50">
                {T("آخر إرسال", "Last sent")}:{" "}
                {new Date((settings as any).lastSentAt).toLocaleString(rtl ? "ar-SA" : "en-GB")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
