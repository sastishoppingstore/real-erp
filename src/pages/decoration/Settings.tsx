import { useState } from "react";
import { Bell, BadgeCheck, LifeBuoy, Check, Settings as SettingsIcon, Building2, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import {
  useDeco, PageHeader, Kpi, TabBar, useTab, StatusPill,
  Panel, RecordPanel, DataTable, type Column,
} from "./shared";

export default function DecorationSettings() {
  const { L, isAr } = useDeco();
  const [tab, setTab] = useTab("notifications");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const notifQ = trpc.decoration.notificationList.useQuery({ unreadOnly: onlyUnread || undefined });
  const licencesQ = trpc.decoration.companyLicenceList.useQuery();
  const companyQ = trpc.settings.companySettingsGet.useQuery(undefined, { retry: false });

  const utils = trpc.useUtils();
  const markRead = trpc.decoration.notificationMarkRead.useMutation({
    onSuccess: () => utils.decoration.notificationList.invalidate(),
  });
  const licenceCreate = trpc.decoration.companyLicenceCreate.useMutation({ onSuccess: () => licencesQ.refetch() });

  const notifications = notifQ.data ?? [];
  const licences = licencesQ.data ?? [];
  const company = companyQ.data as any;

  const unread = notifications.filter((n: any) => !n.isRead).length;
  const expiring = licences.filter((l: any) => l.status === "expiring").length;
  const expired = licences.filter((l: any) => l.status === "expired").length;

  const CATEGORY_TONE: Record<string, string> = {
    expiry: "text-amber-700 bg-amber-50 border-amber-200",
    overdue: "text-rose-700 bg-rose-50 border-rose-200",
    stock: "text-sky-700 bg-sky-50 border-sky-200",
    approval: "text-violet-700 bg-violet-50 border-violet-200",
    system: "text-slate-700 bg-slate-50 border-slate-200",
  };

  const licenceCols: Column[] = [
    { key: "licenceType", en: "Licence", ar: "الترخيص", render: (r) => <span className="font-medium">{r.licenceType}</span> },
    { key: "licenceNumber", en: "Number", ar: "الرقم", render: (r) => <span className="font-mono text-xs">{r.licenceNumber ?? "—"}</span> },
    { key: "issuingAuthority", en: "Authority", ar: "الجهة المصدرة", render: (r) => r.issuingAuthority ?? "—" },
    { key: "issueDate", en: "Issued", ar: "الإصدار", render: (r) => r.issueDate ?? "—" },
    { key: "expiryDate", en: "Expiry", ar: "الانتهاء", render: (r) => r.expiryDate ?? "—" },
    { key: "status", en: "Status", ar: "الحالة", render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={L("Module Settings", "إعدادات الوحدة")}
        subtitle={L(
          "Notifications, company licences and setup help. Company identity, VAT rate and branding are owned by the global Settings module and read here — never duplicated.",
          "الإشعارات وتراخيص الشركة والمساعدة في الإعداد. هوية الشركة ونسبة الضريبة والهوية البصرية مملوكة لوحدة الإعدادات العامة وتُقرأ هنا — دون تكرار.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={L("Unread notifications", "إشعارات غير مقروءة")} value={unread} icon={<Bell className="h-5 w-5" />} tone="rose" />
        <Kpi label={L("Licences tracked", "تراخيص متتبعة")} value={licences.length} icon={<BadgeCheck className="h-5 w-5" />} tone="emerald" />
        <Kpi label={L("Expiring soon", "تنتهي قريباً")} value={expiring} icon={<BadgeCheck className="h-5 w-5" />} tone="brass" />
        <Kpi label={L("Expired", "منتهية")} value={expired} icon={<BadgeCheck className="h-5 w-5" />} tone="slate" />
      </div>

      <TabBar
        value={tab}
        onChange={setTab}
        tabs={[
          { key: "notifications", label: L("Notifications", "الإشعارات"), badge: unread },
          { key: "licences", label: L("Company licences", "تراخيص الشركة"), badge: licences.length },
          { key: "company", label: L("Company & tax", "الشركة والضريبة") },
          { key: "help", label: L("Setup & help", "الإعداد والمساعدة") },
        ]}
      />

      {tab === "notifications" ? (
        <Panel
          title={L("Notifications", "الإشعارات")}
          subtitle={L("Expiry, delays, low stock and overdue invoices", "الانتهاء والتأخير ونقص المخزون والفواتير المتأخرة")}
          action={
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => setOnlyUnread(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
              />
              {L("Unread only", "غير المقروءة فقط")}
            </label>
          }
        >
          <ul className="divide-y divide-[#f1ede4]">
            {notifQ.isLoading ? (
              <li className="px-5 py-10 text-center text-sm text-slate-400">{L("Loading...", "جارٍ التحميل...")}</li>
            ) : notifications.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-slate-400">{L("No notifications.", "لا إشعارات.")}</li>
            ) : (
              notifications.map((n: any) => (
                <li key={n.id} className={`flex items-start gap-3 px-5 py-3 ${n.isRead ? "opacity-60" : ""}`}>
                  <span className={`mt-1 inline-flex h-6 items-center rounded-full border px-2 text-[10px] font-semibold uppercase ${CATEGORY_TONE[n.category] ?? CATEGORY_TONE.system}`}>
                    {n.category ?? "system"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{n.title ?? L("Notification", "إشعار")}</p>
                    {n.body ? <p className="text-[11px] text-slate-500">{n.body}</p> : null}
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString(isAr ? "ar-SA" : "en-GB") : ""}
                    </p>
                  </div>
                  {!n.isRead ? (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => markRead.mutate({ id: n.id })} disabled={markRead.isPending}>
                      <Check className="me-1 h-3 w-3" />{L("Mark read", "مقروء")}
                    </Button>
                  ) : (
                    <span className="text-[10px] font-medium uppercase text-slate-400">{L("Read", "مقروء")}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </Panel>
      ) : tab === "licences" ? (
        <RecordPanel
          title={L("Company licences", "تراخيص الشركة")}
          subtitle={L("CR, Balady, Civil Defense, Etimad and other permits", "السجل التجاري وبلدي والدفاع المدني واعتماد وغيرها")}
          createLabel={L("New licence", "ترخيص جديد")}
          columns={licenceCols}
          rows={licences}
          loading={licencesQ.isLoading}
          empty={L("No licences tracked yet.", "لا تراخيص متتبعة بعد.")}
          pending={licenceCreate.isPending}
          fields={[
            { name: "licenceType", en: "Licence type", ar: "نوع الترخيص", required: true, placeholder: "CR / Balady / Civil Defense" },
            { name: "licenceNumber", en: "Licence number", ar: "رقم الترخيص" },
            { name: "issuingAuthority", en: "Issuing authority", ar: "الجهة المصدرة" },
            { name: "issueDate", en: "Issue date", ar: "تاريخ الإصدار", type: "date" },
            { name: "expiryDate", en: "Expiry date", ar: "تاريخ الانتهاء", type: "date" },
            { name: "status", en: "Status", ar: "الحالة", type: "select", defaultValue: "valid", options: ["valid", "expiring", "expired"].map((s) => ({ value: s, label: s })) },
            { name: "fileUrl", en: "File URL", ar: "رابط الملف", span: 2 },
            { name: "notes", en: "Notes", ar: "ملاحظات", type: "textarea", span: 2 },
          ]}
          onCreate={(v) => licenceCreate.mutate({
            licenceType: v.licenceType,
            licenceNumber: v.licenceNumber,
            issuingAuthority: v.issuingAuthority,
            issueDate: v.issueDate || undefined,
            expiryDate: v.expiryDate || undefined,
            status: v.status as any,
            fileUrl: v.fileUrl,
            notes: v.notes,
          })}
        />
      ) : tab === "company" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title={L("Company identity (read-only)", "هوية الشركة (للقراءة فقط)")} subtitle={L("Maintained in Settings", "تُدار في الإعدادات")}>
            <div className="divide-y divide-[#f1ede4]">
              {[
                { icon: Building2, en: "Company name (EN)", ar: "اسم الشركة (إنجليزي)", value: company?.companyName },
                { icon: Building2, en: "Company name (AR)", ar: "اسم الشركة (عربي)", value: company?.companyNameAr },
                { icon: BadgeCheck, en: "VAT number", ar: "الرقم الضريبي", value: company?.taxNumber },
                { icon: BadgeCheck, en: "CR number", ar: "السجل التجاري", value: company?.crNumber },
                { icon: Percent, en: "VAT rate", ar: "نسبة الضريبة", value: company?.vatRate ? `${company.vatRate}%` : "15%" },
                { icon: Building2, en: "Address", ar: "العنوان", value: company?.address },
                { icon: Building2, en: "Phone", ar: "الهاتف", value: company?.phone },
                { icon: Building2, en: "Email", ar: "البريد", value: company?.email },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.en} className="flex items-center gap-3 px-5 py-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="w-40 shrink-0 text-xs text-slate-500">{L(row.en, row.ar)}</span>
                    <span className="truncate text-sm font-medium text-slate-800">{row.value || "—"}</span>
                  </div>
                );
              })}
            </div>
            <p className="border-t border-[#eee9df] px-5 py-3 text-[11px] text-slate-400">
              {L(
                "These values are used on invoice letterheads, ZATCA XML and reports. Update them once in Settings and every document follows.",
                "تُستخدم هذه القيم في ترويسات الفواتير وملفات زاتكا والتقارير. حدّثها مرة واحدة في الإعدادات وتتبعها كل المستندات.",
              )}
            </p>
          </Panel>

          <Panel title={L("Module defaults", "إعدادات الوحدة الافتراضية")} subtitle={L("Applied to new records", "تُطبّق على السجلات الجديدة")}>
            <div className="divide-y divide-[#f1ede4]">
              {[
                { icon: Percent, en: "Standard VAT", ar: "ضريبة القيمة المضافة", value: "15%", noteEn: "ZATCA standard rate", noteAr: "النسبة القياسية لهيئة الزكاة" },
                { icon: SettingsIcon, en: "Invoice numbering", ar: "ترقيم الفواتير", value: "INV-YYYYMM-0001", noteEn: "Per tenant, resets monthly", noteAr: "لكل منشأة، يتجدد شهرياً" },
                { icon: ShieldCheck, en: "Retention default", ar: "المحتجز الافتراضي", value: "10%", noteEn: "Editable per contract", noteAr: "قابل للتعديل لكل عقد" },
                { icon: Building2, en: "Currency", ar: "العملة", value: "SAR", noteEn: "Saudi Riyal", noteAr: "ريال سعودي" },
                { icon: ShieldCheck, en: "Date system", ar: "نظام التاريخ", value: L("Gregorian + Hijri", "ميلادي + هجري"), noteEn: "Both shown on documents", noteAr: "يظهران معاً في المستندات" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.en} className="flex items-start gap-3 px-5 py-3">
                    <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">{L(row.en, row.ar)}</p>
                      <p className="text-[11px] text-slate-400">{L(row.noteEn, row.noteAr)}</p>
                    </div>
                    <span className="whitespace-nowrap rounded-md bg-[#f7f5f0] px-2 py-1 text-xs font-semibold text-[#10231c]">{row.value}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title={L("Install & enable", "التركيب والتفعيل")} className="lg:col-span-2">
            <ol className="divide-y divide-[#f1ede4]">
              {[
                { en: "Apply the SQL migration to your MySQL database (97 dc_* tables, additive only).", ar: "طبّق ترحيل SQL على قاعدة MySQL (٩٧ جدول dc_*، إضافي فقط)." },
                { en: "Copy the module folders (db, api, src/pages/decoration) into the ERP.", ar: "انسخ مجلدات الوحدة (db، api، src/pages/decoration) إلى النظام." },
                { en: "Register decorationRouter in api/router.ts and add the routes in App.tsx + AppLayout.tsx.", ar: "سجّل decorationRouter في api/router.ts وأضف المسارات في App.tsx وAppLayout.tsx." },
                { en: "Enable the 'decoration' module for the tenant in Settings → Modules.", ar: "فعّل وحدة 'decoration' للمنشأة من الإعدادات ← الوحدات." },
                { en: "Assign roles: manager, QS, storekeeper, accountant, HSE officer, client.", ar: "عيّن الأدوار: مدير، حاصر كميات، أمين مخزن، محاسب، مسؤول سلامة، عميل." },
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">{i + 1}</span>
                  <p className="text-sm text-slate-600">{L(s.en, s.ar)}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <div className="space-y-4">
            <Panel title={L("Support", "الدعم")}>
              <div className="space-y-3 px-5 py-4">
                <p className="flex items-center gap-2 text-sm text-slate-600"><LifeBuoy className="h-4 w-4 text-emerald-700" /> {L("YASCO ERP support", "دعم ياسكو")}</p>
                <p className="text-[11px] text-slate-400">{L("Email: support@yasco.tech", "البريد: support@yasco.tech")}</p>
                <p className="text-[11px] text-slate-400">{L("Documentation is bundled in /docs (01–07).", "التوثيق مرفق في /docs (٠١–٠٧).")}</p>
              </div>
            </Panel>
            <Panel title={L("ZATCA readiness", "الجاهزية لزاتكا")}>
              <div className="space-y-2 px-5 py-4 text-[11px] text-slate-500">
                <p>✓ {L("Phase-2 TLV QR (tags 1–6)", "رمز QR المرحلة الثانية (الحقول ١–٦)")}</p>
                <p>✓ {L("UBL 2.1 XML with UUID + SHA-256 hash", "ملف UBL 2.1 مع UUID وبصمة SHA-256")}</p>
                <p>✓ {L("Tax & simplified invoices, credit/debit notes", "فواتير ضريبية ومبسطة وإشعارات دائن/مدين")}</p>
                <p>✓ {L("Clearance / reporting profiles", "ملفات الاعتماد والإبلاغ")}</p>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}