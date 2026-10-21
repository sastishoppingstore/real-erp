import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, PlayCircle, RefreshCw, Save, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { SectionHead, SahlField, inputCls, btnCls, btnGreenCls } from "./ui";

// SCR-ZATCA: tenant e-invoicing credentials ("من هنا تُضاف بيانات الاعتماد"),
// onboarding checklist, connection test and ZATCA invoice status. Every tenant
// stores its own encrypted credentials through zatca.integrationSave.

const VAT_PATTERN = /^3\d{13}3$/;

type TaxEnvironment = "sandbox" | "production";

type FormState = {
  environment: TaxEnvironment;
  vatNumber: string;
  organizationIdentifier: string;
  egsSerialNumber: string;
  deviceUuid: string;
  certificateExpiresAt: string;
};

type SecretState = {
  otpCode: string;
  csrInformation: string;
  zatcaCertificate: string;
  privateKey: string;
  publicKey: string;
  complianceCsid: string;
  productionCsid: string;
  accessToken: string;
  secretToken: string;
};

type Notice = { kind: "ok" | "err"; text: string };

const EMPTY_SECRETS: SecretState = {
  otpCode: "",
  csrInformation: "",
  zatcaCertificate: "",
  privateKey: "",
  publicKey: "",
  complianceCsid: "",
  productionCsid: "",
  accessToken: "",
  secretToken: "",
};

function newUuid(): string {
  const cryptoApi = globalThis.crypto as unknown as { randomUUID?: () => string } | undefined;
  if (cryptoApi?.randomUUID) {
    try {
      return cryptoApi.randomUUID();
    } catch {
      // Fall through to the manual generator on older/insecure runtimes.
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function fmtDateTime(value: unknown): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16).replace("T", " ");
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortText(value: unknown, max = 36): string {
  const text = value == null ? "" : String(value);
  if (!text) return "-";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function formatStatus(value: unknown): string {
  const text = String(value ?? "draft").replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function statusTone(status: unknown): string {
  const value = String(status ?? "").toLowerCase();
  if (value === "cleared" || value === "reported") {
    return "border-[#2e7d32] bg-[#e8f5e9] text-[#0a5c2a]";
  }
  if (value === "pending" || value === "signed" || value === "submitted") {
    return "border-[#b08a00] bg-[#fff8e1] text-[#6f5600]";
  }
  if (value === "failed" || value === "rejected") {
    return "border-[#c62828] bg-[#ffebee] text-[#b71c1c]";
  }
  return "border-[#999] bg-[#f5f5f5] text-[#333]";
}

function Flag({ saved, rtl }: { saved: boolean | null; rtl: boolean }) {
  if (saved === null) return <span className="text-[11px] text-[#888]">-</span>;
  return saved ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0a5c2a]">
      <Check className="h-3.5 w-3.5" aria-hidden />
      {rtl ? "محفوظ" : "Saved"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b71c1c]">
      <X className="h-3.5 w-3.5" aria-hidden />
      {rtl ? "ناقص" : "Missing"}
    </span>
  );
}

function StepMark({ complete }: { complete: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center border ${
        complete
          ? "border-[#0a5c2a] bg-[#e8f5e9] text-[#0a5c2a]"
          : "border-[#b71c1c] bg-[#ffebee] text-[#b71c1c]"
      }`}
    >
      {complete ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
    </span>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="border border-[#ccc] bg-[#fafafa] px-2 py-1">
      <div className="text-[11px] leading-tight text-[#555]">{label}</div>
      <div className="text-[16px] font-bold tabular-nums" style={{ color: color ?? "#111" }}>
        {value}
      </div>
    </div>
  );
}

export default function ZatcaSetup() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const utils = trpc.useUtils();

  const integrationQuery = trpc.zatca.integrationGet.useQuery();
  const data = integrationQuery.data;
  const { data: wizard } = trpc.zatca.wizardState.useQuery();
  const { data: dashboard } = trpc.zatca.dashboard.useQuery();
  const { data: statusReport } = trpc.zatca.statusReport.useQuery();
  const { data: resources } = trpc.zatca.officialResources.useQuery();

  const [form, setForm] = useState<FormState>(() => ({
    environment: "sandbox",
    vatNumber: "",
    organizationIdentifier: "",
    egsSerialNumber: "",
    deviceUuid: newUuid(),
    certificateExpiresAt: "",
  }));
  const [secrets, setSecrets] = useState<SecretState>({ ...EMPTY_SECRETS });
  const [notice, setNotice] = useState<Notice | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!data || hydrated.current) return;
    hydrated.current = true;
    setForm((prev) => ({
      ...prev,
      environment: data.environment === "production" ? "production" : "sandbox",
      vatNumber: data.vatNumber ?? "",
      organizationIdentifier: data.organizationIdentifier ?? "",
      egsSerialNumber: data.egsSerialNumber ?? "",
      deviceUuid: data.deviceUuid || prev.deviceUuid || newUuid(),
    }));
  }, [data]);

  const save = trpc.zatca.integrationSave.useMutation({
    onSuccess: () => {
      setSecrets({ ...EMPTY_SECRETS });
      setNotice({
        kind: "ok",
        text: T(
          "تم حفظ بيانات الاعتماد. الأسرار المحفوظة سابقاً بقيت كما هي ما لم تُستبدل.",
          "ZATCA credentials saved. Stored secrets were kept unless replaced."
        ),
      });
      void utils.zatca.integrationGet.invalidate();
      void utils.zatca.wizardState.invalidate();
      void utils.zatca.dashboard.invalidate();
      void utils.zatca.statusReport.invalidate();
    },
    onError: (error) => setNotice({ kind: "err", text: error.message }),
  });

  const testConnection = trpc.zatca.complianceCheck.useMutation({
    onSuccess: (result) => {
      const http = result.httpStatus ? `HTTP ${result.httpStatus}` : T("بدون استجابة", "no HTTP response");
      const payload = (result.responsePayload ?? {}) as Record<string, unknown>;
      const detail =
        typeof payload.message === "string"
          ? payload.message
          : typeof payload.error === "string"
            ? payload.error
            : "";

      if (!result.liveSubmitted) {
        setNotice({
          kind: "ok",
          text: T(
            `تم تسجيل فحص الجاهزية (${http}). لا توجد رموز وصول وسرية مباشرة، لذلك لم يُرسل طلب فعلي إلى ZATCA.`,
            `Readiness check logged (${http}). No live access/secret tokens are configured, so no live request was sent to ZATCA.`
          ),
        });
      } else if (result.status === "success") {
        setNotice({
          kind: "ok",
          text: T(`نجح الاتصال بـ ZATCA (${http}).`, `ZATCA connection succeeded (${http}).`),
        });
      } else {
        setNotice({
          kind: "err",
          text: T(
            `فشل الاتصال بـ ZATCA (${http})${detail ? `: ${detail}` : "."}`,
            `ZATCA connection failed (${http})${detail ? `: ${detail}` : "."}`
          ),
        });
      }
      void utils.zatca.statusReport.invalidate();
      void utils.zatca.dashboard.invalidate();
    },
    onError: (error) => setNotice({ kind: "err", text: error.message }),
  });

  const refreshAll = () => {
    setNotice({ kind: "ok", text: T("تم تحديث حالة ZATCA.", "ZATCA status refreshed.") });
    void utils.zatca.integrationGet.invalidate();
    void utils.zatca.wizardState.invalidate();
    void utils.zatca.dashboard.invalidate();
    void utils.zatca.statusReport.invalidate();
    void utils.zatca.officialResources.invalidate();
  };

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const setSecret = (field: keyof SecretState, value: string) => {
    setSecrets((prev) => ({ ...prev, [field]: value }));
  };

  const secretPlaceholder = (saved: boolean | undefined, empty: string) =>
    saved ? T("محفوظ - اتركه فارغاً للإبقاء", "Saved - leave blank to keep") : empty;

  const vatNumber = form.vatNumber.trim();
  const vatInvalid = vatNumber.length > 0 && !VAT_PATTERN.test(vatNumber);

  const saveCredentials = () => {
    setNotice(null);
    if (!VAT_PATTERN.test(vatNumber)) {
      setNotice({
        kind: "err",
        text: T(
          "الرقم الضريبي يجب أن يكون 15 رقماً، يبدأ وينتهي بالرقم 3.",
          "VAT number must be exactly 15 digits, start with 3 and end with 3."
        ),
      });
      return;
    }

    const deviceUuid = form.deviceUuid || newUuid();
    if (!form.deviceUuid) setField("deviceUuid", deviceUuid);

    save.mutate({
      environment: form.environment,
      vatNumber,
      organizationIdentifier: form.organizationIdentifier.trim() || undefined,
      egsSerialNumber: form.egsSerialNumber.trim() || undefined,
      deviceUuid,
      otpCode: secrets.otpCode.trim() || undefined,
      csrInformation: secrets.csrInformation.trim() || undefined,
      zatcaCertificate: secrets.zatcaCertificate.trim() || undefined,
      privateKey: secrets.privateKey.trim() || undefined,
      publicKey: secrets.publicKey.trim() || undefined,
      complianceCsid: secrets.complianceCsid.trim() || undefined,
      productionCsid: secrets.productionCsid.trim() || undefined,
      accessToken: secrets.accessToken.trim() || undefined,
      secretToken: secrets.secretToken.trim() || undefined,
      certificateExpiresAt: form.certificateExpiresAt || undefined,
    });
  };

  const credentialFlags: Array<{ label: string; saved: boolean | null }> = [
    { label: T("رمز OTP", "OTP"), saved: data ? data.hasOtp : null },
    { label: T("طلب التوقيع CSR", "CSR"), saved: data ? data.hasCsr : null },
    { label: T("الشهادة", "Certificate"), saved: data ? data.hasCertificate : null },
    { label: T("المفتاح الخاص", "Private key"), saved: data ? data.hasPrivateKey : null },
    { label: T("المفتاح العام", "Public key"), saved: data ? data.hasPublicKey : null },
    { label: T("معرّف الامتثال", "Compliance CSID"), saved: data ? data.hasComplianceCsid : null },
    { label: T("معرّف الإنتاج", "Production CSID"), saved: data ? data.hasProductionCsid : null },
    { label: T("رمز الوصول", "Access token"), saved: data ? data.hasAccessToken : null },
    { label: T("الرمز السري", "Secret token"), saved: data ? data.hasSecretToken : null },
  ];

  const steps = wizard ?? [];
  const doneSteps = steps.filter((step) => step.complete).length;
  const progress = steps.length > 0 ? Math.round((doneSteps / steps.length) * 100) : 0;

  const invoiceRows = statusReport?.rows ?? [];
  const statusCount = (status: string) =>
    invoiceRows.filter((row) => String(row.status ?? "").toLowerCase() === status).length;

  const totalCount = dashboard?.totalInvoices ?? invoiceRows.length;
  const pendingCount = dashboard?.pendingInvoices ?? statusCount("pending");
  const signedCount = statusCount("signed");
  const clearedCount = dashboard?.clearedInvoices ?? statusCount("cleared");
  const reportedCount = statusCount("reported");
  const failedCount = dashboard?.failedInvoices ?? statusCount("failed");

  const links = resources ?? data?.officialResources ?? [];
  const recentRows = invoiceRows.slice(0, 12);

  return (
    <div className="min-h-full bg-[#f1f3f1] p-1.5 text-[12px] text-black">
      <div className="border border-[#bdbdbd] bg-white shadow-sm">
        {/* ---------- title / toolbar ---------- */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-black bg-[#0d0d0d] px-2 py-1.5 text-white">
          <div className="min-w-0">
            <div className="text-[14px] font-bold leading-tight">ZATCA / الفاتورة الإلكترونية</div>
            <div className="text-[11px] text-white/60">
              {T("اعتماد الفاتورة الإلكترونية لكل مستأجر", "Tenant e-invoicing credentials and onboarding")}
            </div>
          </div>
          <span
            className={
              form.environment === "production"
                ? "border border-[#6ee7a0] bg-[#2fae4e] px-2 py-0.5 text-[11px] font-bold text-white"
                : "border border-[#ffd54f] bg-[#ffeb3b] px-2 py-0.5 text-[11px] font-bold text-black"
            }
          >
            {form.environment === "production" ? "PRODUCTION" : "SANDBOX"}
          </span>
          {integrationQuery.isLoading && (
            <span className="text-[11px] text-white/60">{T("جارٍ التحميل...", "Loading...")}</span>
          )}
          <div className="flex-1" />
          <button
            type="button"
            className={`${btnGreenCls} inline-flex items-center gap-1`}
            style={{ background: "#0a5c2a" }}
            onClick={() => {
              setNotice(null);
              testConnection.mutate({});
            }}
            disabled={testConnection.isPending}
          >
            <PlayCircle className="h-3.5 w-3.5" aria-hidden />
            {testConnection.isPending
              ? T("جارٍ الاختبار...", "Testing...")
              : T("اختبار الاتصال", "Test connection")}
          </button>
          <button type="button" className={`${btnCls} inline-flex items-center gap-1`} onClick={refreshAll}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {T("تحديث", "Refresh")}
          </button>
        </div>

        <div className="space-y-2 p-2">
          {integrationQuery.error && (
            <div className="border border-[#c62828] bg-[#ffebee] px-2 py-1 text-[#b71c1c]">
              {T("تعذر تحميل إعدادات ZATCA: ", "Could not load ZATCA settings: ")}
              {integrationQuery.error.message}
            </div>
          )}

          {notice && (
            <div
              role={notice.kind === "ok" ? "status" : "alert"}
              className={`border px-2 py-1 ${
                notice.kind === "ok"
                  ? "border-[#2e7d32] bg-[#e8f5e9] text-[#0a5c2a]"
                  : "border-[#c62828] bg-[#ffebee] text-[#b71c1c]"
              }`}
            >
              {notice.text}
            </div>
          )}

          <div className="grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
            {/* ---------- credentials form ---------- */}
            <section className="border border-[#bdbdbd] bg-white">
              <SectionHead>{T("بيانات اعتماد ZATCA", "ZATCA credentials")}</SectionHead>
              <div className="p-2">
                <div className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
                  <SahlField label={T("البيئة", "Environment")}>
                    <select
                      className={inputCls}
                      value={form.environment}
                      onChange={(e) =>
                        setField(
                          "environment",
                          e.target.value === "production" ? "production" : "sandbox"
                        )
                      }
                    >
                      <option value="sandbox">{T("بيئة الاختبار", "Sandbox")}</option>
                      <option value="production">{T("الإنتاج", "Production")}</option>
                    </select>
                  </SahlField>

                  <SahlField label={T("الرقم الضريبي", "VAT number")}>
                    <input
                      className={inputCls}
                      style={vatInvalid ? { borderColor: "#c62828" } : undefined}
                      inputMode="numeric"
                      maxLength={15}
                      value={form.vatNumber}
                      placeholder="3xxxxxxxxxxxxx3"
                      onChange={(e) =>
                        setField("vatNumber", e.target.value.replace(/\D/g, "").slice(0, 15))
                      }
                    />
                    <span
                      className={`mt-0.5 block text-[11px] ${
                        vatInvalid ? "text-[#b71c1c]" : "text-[#666]"
                      }`}
                    >
                      {T(
                        "15 رقماً، يبدأ وينتهي بالرقم 3.",
                        "15 digits, starts with 3 and ends with 3."
                      )}
                    </span>
                  </SahlField>

                  <SahlField label={T("معرّف المنشأة", "Organization ID")}>
                    <input
                      className={inputCls}
                      value={form.organizationIdentifier}
                      placeholder={T("السجل التجاري أو معرّف المنشأة", "CRN or organization identifier")}
                      onChange={(e) => setField("organizationIdentifier", e.target.value)}
                    />
                  </SahlField>

                  <SahlField label={T("الرقم التسلسلي", "EGS serial")}>
                    <input
                      className={inputCls}
                      value={form.egsSerialNumber}
                      placeholder="EGS-0001"
                      onChange={(e) => setField("egsSerialNumber", e.target.value)}
                    />
                  </SahlField>

                  <SahlField label={T("معرّف الجهاز", "Device UUID")}>
                    <span className="flex gap-1">
                      <input
                        className={`${inputCls} min-w-0 flex-1 font-mono text-[11px]`}
                        value={form.deviceUuid}
                        readOnly
                        aria-readonly="true"
                      />
                      <button
                        type="button"
                        className={`${btnCls} shrink-0`}
                        title={T("توليد معرّف جهاز جديد", "Generate a new device UUID")}
                        onClick={() => setField("deviceUuid", newUuid())}
                      >
                        {T("توليد", "Generate")}
                      </button>
                    </span>
                  </SahlField>

                  <SahlField label={T("انتهاء الشهادة", "Certificate expiry")}>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.certificateExpiresAt}
                      onChange={(e) => setField("certificateExpiresAt", e.target.value)}
                    />
                  </SahlField>
                </div>

                {/* secrets are write-only: the API only returns has* flags */}
                <div className="mt-2 border-t border-[#ddd] pt-2">
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-[12px] font-bold">
                      {T("الأسرار (كتابة فقط)", "Secrets (write-only)")}
                    </span>
                    <span className="text-[11px] text-[#666]">
                      {T(
                        "تُخزَّن مشفرة ولا تعود من الواجهة. اتركها فارغة للإبقاء على المحفوظ.",
                        "Stored encrypted and never returned. Leave blank to keep saved values."
                      )}
                    </span>
                  </div>

                  <div className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
                    <SahlField label="OTP">
                      <input
                        type="password"
                        autoComplete="new-password"
                        className={inputCls}
                        value={secrets.otpCode}
                        placeholder={secretPlaceholder(data?.hasOtp, T("رمز OTP من بوابة فاتورة", "OTP from Fatoora portal"))}
                        onChange={(e) => setSecret("otpCode", e.target.value)}
                      />
                    </SahlField>
                    <SahlField label={T("رمز الوصول", "Access token")}>
                      <input
                        type="password"
                        autoComplete="new-password"
                        className={inputCls}
                        value={secrets.accessToken}
                        placeholder={secretPlaceholder(data?.hasAccessToken, T("رمز Basic Auth", "Basic auth token"))}
                        onChange={(e) => setSecret("accessToken", e.target.value)}
                      />
                    </SahlField>
                    <SahlField label={T("الرمز السري", "Secret token")}>
                      <input
                        type="password"
                        autoComplete="new-password"
                        className={inputCls}
                        value={secrets.secretToken}
                        placeholder={secretPlaceholder(data?.hasSecretToken, T("الرمز السري", "Basic auth secret"))}
                        onChange={(e) => setSecret("secretToken", e.target.value)}
                      />
                    </SahlField>
                  </div>

                  <div className="mt-1 grid gap-2 sm:grid-cols-2">
                    <div className="block sm:col-span-2">
                      <div className="mb-0.5 flex flex-wrap items-center justify-between gap-1">
                        <span className="text-[12px] font-bold">
                          {T("طلب توقيع الشهادة (CSR)", "CSR")}
                        </span>
                        {/* api/zatcaRouter.ts does not expose generateCsr yet. When it does,
                            swap this disabled control for trpc.zatca.generateCsr.useMutation(). */}
                        <button
                          type="button"
                          className={btnCls}
                          disabled
                          title={T(
                            "توليد CSR غير متاح في هذه النسخة؛ الصق CSR من بوابة فاتورة.",
                            "Server-side CSR generation (generateCsr) is not available in this build. Paste a CSR from the Fatoora portal."
                          )}
                        >
                          {T("توليد CSR", "Generate CSR")}
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        spellCheck={false}
                        aria-label={T("طلب توقيع الشهادة (CSR)", "CSR")}
                        className={`${inputCls} font-mono text-[11px]`}
                        value={secrets.csrInformation}
                        placeholder={secretPlaceholder(
                          data?.hasCsr,
                          "-----BEGIN CERTIFICATE REQUEST-----"
                        )}
                        onChange={(e) => setSecret("csrInformation", e.target.value)}
                      />
                      <span className="mt-0.5 block text-[11px] text-[#666]">
                        {T(
                          "توليد CSR غير متاح في هذه النسخة؛ الصق CSR من بوابة فاتورة.",
                          "CSR generation is not exposed by this build; paste a CSR from the Fatoora portal."
                        )}
                      </span>
                    </div>

                    <label className="block sm:col-span-2">
                      <span className="mb-0.5 block text-[12px] font-bold">
                        {T("شهادة ZATCA", "ZATCA certificate")}
                      </span>
                      <textarea
                        rows={3}
                        spellCheck={false}
                        className={`${inputCls} font-mono text-[11px]`}
                        value={secrets.zatcaCertificate}
                        placeholder={secretPlaceholder(
                          data?.hasCertificate,
                          "-----BEGIN CERTIFICATE-----"
                        )}
                        onChange={(e) => setSecret("zatcaCertificate", e.target.value)}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-0.5 block text-[12px] font-bold">
                        {T("المفتاح الخاص", "Private key")}
                      </span>
                      <textarea
                        rows={3}
                        spellCheck={false}
                        className={`${inputCls} font-mono text-[11px]`}
                        value={secrets.privateKey}
                        placeholder={secretPlaceholder(
                          data?.hasPrivateKey,
                          "-----BEGIN PRIVATE KEY-----"
                        )}
                        onChange={(e) => setSecret("privateKey", e.target.value)}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-0.5 block text-[12px] font-bold">
                        {T("المفتاح العام", "Public key")}
                      </span>
                      <textarea
                        rows={3}
                        spellCheck={false}
                        className={`${inputCls} font-mono text-[11px]`}
                        value={secrets.publicKey}
                        placeholder={secretPlaceholder(
                          data?.hasPublicKey,
                          "-----BEGIN PUBLIC KEY-----"
                        )}
                        onChange={(e) => setSecret("publicKey", e.target.value)}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-0.5 block text-[12px] font-bold">
                        {T("معرّف الامتثال CSID", "Compliance CSID")}
                      </span>
                      <textarea
                        rows={2}
                        spellCheck={false}
                        className={`${inputCls} font-mono text-[11px]`}
                        value={secrets.complianceCsid}
                        placeholder={secretPlaceholder(data?.hasComplianceCsid, "Compliance CSID")}
                        onChange={(e) => setSecret("complianceCsid", e.target.value)}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-0.5 block text-[12px] font-bold">
                        {T("معرّف الإنتاج CSID", "Production CSID")}
                      </span>
                      <textarea
                        rows={2}
                        spellCheck={false}
                        className={`${inputCls} font-mono text-[11px]`}
                        value={secrets.productionCsid}
                        placeholder={secretPlaceholder(data?.hasProductionCsid, "Production CSID")}
                        onChange={(e) => setSecret("productionCsid", e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[#ddd] pt-2">
                  <button
                    type="button"
                    className={`${btnGreenCls} inline-flex items-center gap-1`}
                    style={{ background: "#0a5c2a" }}
                    onClick={saveCredentials}
                    disabled={save.isPending}
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden />
                    {save.isPending
                      ? T("جارٍ الحفظ...", "Saving...")
                      : T("حفظ بيانات الاعتماد", "Save credentials")}
                  </button>
                  <span className="text-[11px] text-[#666]">
                    {T(
                      "كل مستأجر يحفظ بيانات اعتماده المشفرة الخاصة به.",
                      "Each tenant stores its own encrypted ZATCA credentials."
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* ---------- side panels ---------- */}
            <div className="space-y-2">
              <section className="border border-[#bdbdbd] bg-white">
                <SectionHead>{T("حالة التخزين الآمن", "Secure storage status")}</SectionHead>
                <div className="p-2">
                  {!data && (
                    <div className="mb-1 text-[11px] text-[#666]">
                      {T("جارٍ تحميل حالة البيانات...", "Loading credential status...")}
                    </div>
                  )}
                  <div className="grid gap-x-3 sm:grid-cols-2">
                    {credentialFlags.map((flag) => (
                      <div
                        key={flag.label}
                        className="flex items-center justify-between gap-1 border-b border-dashed border-[#ddd] py-0.5"
                      >
                        <span className="min-w-0 text-[11px] leading-tight">{flag.label}</span>
                        <Flag saved={flag.saved} rtl={rtl} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 text-[11px] text-[#666]">
                    {T(
                      "الأسرار مشفرة في قاعدة البيانات ولا تعود عبر الواجهة البرمجية.",
                      "Secrets are encrypted at rest and never returned by the API."
                    )}
                  </div>
                </div>
              </section>

              <section className="border border-[#bdbdbd] bg-white">
                <SectionHead>{T("خطوات التسجيل", "Onboarding checklist")}</SectionHead>
                <div className="p-2">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span>
                      {doneSteps} / {steps.length} {T("مكتملة", "complete")}
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: "#0a5c2a" }}>
                      {progress}%
                    </span>
                  </div>
                  <div className="mb-1 h-1.5 border border-[#ccc] bg-[#eee]">
                    <div className="h-full bg-[#2fae4e]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="space-y-0.5">
                    {steps.length === 0 ? (
                      <div className="py-1 text-[11px] text-[#777]">
                        {T("لا توجد خطوات تسجيل متاحة.", "No onboarding steps returned.")}
                      </div>
                    ) : (
                      steps.map((step) => (
                        <div
                          key={step.step}
                          className="flex items-center gap-1.5 border-b border-dashed border-[#e0e0e0] py-0.5"
                        >
                          <StepMark complete={Boolean(step.complete)} />
                          <span className="min-w-0 flex-1 text-[11px] leading-tight">{step.label}</span>
                          <span className="shrink-0 text-[10px] text-[#888]">
                            {T("خطوة", "Step")} {step.step}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section className="border border-[#bdbdbd] bg-white">
                <SectionHead>{T("الروابط الرسمية", "Official resources")}</SectionHead>
                <div className="space-y-1 p-2">
                  {links.length === 0 ? (
                    <div className="text-[11px] text-[#777]">
                      {T("لا توجد روابط متاحة.", "No official links available.")}
                    </div>
                  ) : (
                    links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 border border-[#ccc] bg-[#fafafa] px-2 py-1 hover:bg-[#e8f5e9]"
                      >
                        <span className="min-w-0 truncate">{link.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </a>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* ---------- invoice status ---------- */}
          <section className="border border-[#bdbdbd] bg-white">
            <SectionHead>{T("حالة فواتير ZATCA", "ZATCA invoice status")}</SectionHead>
            <div className="p-2">
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
                <Stat label={T("الإجمالي", "Invoices")} value={totalCount} />
                <Stat label={T("قيد الانتظار", "Pending")} value={pendingCount} color="#6f5600" />
                <Stat label={T("موقّعة", "Signed")} value={signedCount} color="#333" />
                <Stat label={T("مصفّاة", "Cleared")} value={clearedCount} color="#0a5c2a" />
                <Stat label={T("مبلّغة", "Reported")} value={reportedCount} color="#0a5c2a" />
                <Stat label={T("فاشلة", "Failed")} value={failedCount} color="#b71c1c" />
              </div>

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 border border-[#e0e0e0] bg-[#fafafa] px-2 py-1 text-[11px] text-[#555]">
                <span>
                  {T("حالة الواجهة", "API status")}:{" "}
                  <b className="text-black">{dashboard?.apiStatus ?? "-"}</b>
                </span>
                <span>
                  {T("ملخص الضريبة", "VAT summary")}:{" "}
                  <b className="text-black">SAR {Number(dashboard?.vatSummary ?? 0).toFixed(2)}</b>
                </span>
                <span>
                  {T("الشهادة", "Certificate")}:{" "}
                  <b className={dashboard?.certificateExpiryWarning?.includes("expires") ? "text-[#b71c1c]" : "text-black"}>
                    {dashboard?.certificateExpiryWarning ??
                      T("لا يوجد تاريخ انتهاء محفوظ", "No certificate expiry saved")}
                  </b>
                </span>
              </div>

              <div className="mt-2 max-h-[320px] overflow-auto border border-[#888] bg-white">
                <table className="w-full min-w-[760px] border-collapse text-[12px]">
                  <thead>
                    <tr style={{ background: "#2fae4e", color: "#fff" }}>
                      {[
                        T("معرّف الفاتورة", "Invoice ID"),
                        T("المعرّف", "UUID"),
                        T("العداد", "Counter"),
                        T("التجزئة", "Hash"),
                        T("الحالة", "Status"),
                        T("آخر تحديث", "Updated"),
                        T("الخطأ", "Error"),
                      ].map((column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap border border-[#1d7a37] px-1.5 py-1 font-normal"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="border border-[#ccc] px-1.5 py-4 text-center text-[#777]"
                        >
                          {T("لا توجد سجلات ZATCA بعد.", "No ZATCA invoice status records yet.")}
                        </td>
                      </tr>
                    ) : (
                      recentRows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#e8f5e9]">
                          <td className="whitespace-nowrap border border-[#ccc] px-1.5 py-1 tabular-nums">
                            {row.invoiceId}
                          </td>
                          <td
                            className="whitespace-nowrap border border-[#ccc] px-1.5 py-1 font-mono text-[11px]"
                            title={String(row.invoiceUuid ?? "")}
                          >
                            {shortText(row.invoiceUuid, 16)}
                          </td>
                          <td className="whitespace-nowrap border border-[#ccc] px-1.5 py-1 text-center tabular-nums">
                            {row.invoiceCounter ?? "-"}
                          </td>
                          <td
                            className="whitespace-nowrap border border-[#ccc] px-1.5 py-1 font-mono text-[11px]"
                            title={String(row.invoiceHash ?? "")}
                          >
                            {shortText(row.invoiceHash, 14)}
                          </td>
                          <td className="whitespace-nowrap border border-[#ccc] px-1.5 py-1">
                            <span
                              className={`inline-block border px-1.5 py-0 text-[11px] font-bold ${statusTone(row.status)}`}
                            >
                              {formatStatus(row.status)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap border border-[#ccc] px-1.5 py-1 text-[11px]">
                            {fmtDateTime(row.updatedAt)}
                          </td>
                          <td
                            className={`border border-[#ccc] px-1.5 py-1 text-[11px] ${
                              row.errorCode || row.errorMessage ? "text-[#b71c1c]" : "text-[#777]"
                            }`}
                            title={String(row.errorMessage ?? "")}
                          >
                            {row.errorCode || row.errorMessage
                              ? `${row.errorCode ? `${row.errorCode}: ` : ""}${shortText(row.errorMessage, 48)}`
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-1 text-[11px] text-[#666]">
                {T(
                  `عرض أحدث ${recentRows.length} من ${invoiceRows.length} سجلاً.`,
                  `Showing latest ${recentRows.length} of ${invoiceRows.length} records.`
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
