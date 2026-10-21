import { type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared "beautiful report" kit used by every Sahl report screen.
// Provides: gradient report header (hero), 3D KPI cards with % change,
// chart + table cards, professional footer and the Excel / PDF export engine.
// ---------------------------------------------------------------------------

export type ReportCompany = {
  name?: string;
  nameAr?: string;
  tax?: string;
  cr?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
};

export type Tone = "emerald" | "blue" | "amber" | "rose" | "violet" | "teal" | "slate";

const TONES: Record<Tone, { grad: string; soft: string; text: string; ring: string }> = {
  emerald: { grad: "linear-gradient(135deg,#047857,#10b981)", soft: "#ecfdf5", text: "#047857", ring: "#a7f3d0" },
  blue: { grad: "linear-gradient(135deg,#1d4ed8,#3b82f6)", soft: "#eff6ff", text: "#1d4ed8", ring: "#bfdbfe" },
  amber: { grad: "linear-gradient(135deg,#b45309,#f59e0b)", soft: "#fffbeb", text: "#b45309", ring: "#fde68a" },
  rose: { grad: "linear-gradient(135deg,#be123c,#f43f5e)", soft: "#fff1f2", text: "#be123c", ring: "#fecdd3" },
  violet: { grad: "linear-gradient(135deg,#6d28d9,#8b5cf6)", soft: "#f5f3ff", text: "#6d28d9", ring: "#ddd6fe" },
  teal: { grad: "linear-gradient(135deg,#0f766e,#14b8a6)", soft: "#f0fdfa", text: "#0f766e", ring: "#99f6e4" },
  slate: { grad: "linear-gradient(135deg,#334155,#64748b)", soft: "#f8fafc", text: "#334155", ring: "#cbd5e1" },
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function num(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-US");
}

export function compactMoney(value: number) {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return n.toFixed(0);
}

/** Percentage change between the selected period and the previous one. */
export function changePct(current: number, previous: number | null | undefined): number | null {
  if (previous == null || !isFinite(previous)) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayYmd() {
  return ymd(new Date());
}

export function addDays(value: string, days: number) {
  const [y, m, d] = value.split("-").map(Number);
  return ymd(new Date(y, (m || 1) - 1, (d || 1) + days, 12, 0, 0));
}

export function daysBetween(from: string, to: string) {
  const a = new Date(`${from}T12:00:00`).getTime();
  const b = new Date(`${to}T12:00:00`).getTime();
  if (!isFinite(a) || !isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000) + 1);
}

// Shared recharts styling so every report looks the same.
export const AXIS = {
  tick: { fontSize: 10, fill: "#64748b" },
  tickLine: false,
  axisLine: { stroke: "#cbd5e1" },
} as const;

export const GRID = {
  strokeDasharray: "4 4",
  stroke: "#e2e8f0",
  vertical: false,
} as const;

export const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  color: "#ffffff",
  fontSize: 11,
  padding: "8px 10px",
} as const;

// ---------------------------------------------------------------------------
// KPI cards (3D boxes with % up / down)
// ---------------------------------------------------------------------------

export type KpiItem = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  change?: number | null;
  changeLabel?: string;
  /** when true a rise is bad (expenses, returns, ...) */
  invert?: boolean;
};

export function ChangeBadge({
  value,
  label,
  invert,
}: {
  value: number | null | undefined;
  label?: string;
  invert?: boolean;
}) {
  if (value == null || !isFinite(value)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
        {label ?? "—"}
      </span>
    );
  }
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black"
      style={{
        background: good ? "#ecfdf5" : "#fff1f2",
        color: good ? "#047857" : "#be123c",
      }}
      title={label}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function KpiCard({ item }: { item: KpiItem }) {
  const tone = TONES[item.tone ?? "emerald"];
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_16px_38px_-24px_rgba(15,23,42,0.65)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_46px_-22px_rgba(15,23,42,0.55)]"
      style={{ borderTop: `3px solid ${tone.text}` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: tone.grad }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
            {item.label}
          </div>
          <div className="mt-1 text-[20px] font-black leading-tight text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
            {item.value}
          </div>
          {item.sub ? (
            <div className="mt-0.5 truncate text-[10.5px] font-medium text-slate-500">{item.sub}</div>
          ) : null}
        </div>
        {item.icon ? (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: tone.grad }}
          >
            {item.icon}
          </span>
        ) : null}
      </div>
      <div className="relative mt-2 flex items-center gap-1.5">
        <ChangeBadge value={item.change} label={item.changeLabel} invert={item.invert} />
        {item.changeLabel ? (
          <span className="truncate text-[10px] font-semibold text-slate-400">{item.changeLabel}</span>
        ) : null}
      </div>
    </div>
  );
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <KpiCard key={`${item.label}-${i}`} item={item} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report header (hero) with period controls + export buttons
// ---------------------------------------------------------------------------

export type HeroPreset = { key: string; label: string; from: string; to: string };

export function ReportHero({
  title,
  subtitle,
  periodText,
  from,
  to,
  onFrom,
  onTo,
  singleDate,
  presets,
  activeKey,
  onPreset,
  loading,
  actions,
  company,
  rtl,
  badge,
}: {
  title: string;
  subtitle?: string;
  periodText?: string;
  from?: string;
  to?: string;
  onFrom?: (value: string) => void;
  onTo?: (value: string) => void;
  singleDate?: boolean;
  presets?: HeroPreset[];
  activeKey?: string;
  onPreset?: (preset: HeroPreset) => void;
  loading?: boolean;
  actions?: ReactNode;
  company?: ReportCompany;
  rtl?: boolean;
  badge?: string;
}) {
  const inputDark =
    "rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-emerald-400";
  return (
    <header
      className="relative overflow-hidden rounded-3xl shadow-[0_22px_55px_-28px_rgba(2,6,23,0.85)]"
      style={{ background: "linear-gradient(135deg,#0b1220 0%,#0c2f2b 48%,#065f46 100%)" }}
      dir={rtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {company?.logo ? (
              <img
                src={company.logo}
                alt=""
                className="h-12 w-12 shrink-0 rounded-xl bg-white/95 p-1 object-contain shadow-lg"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-lg font-black text-white shadow-lg">
                R
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate text-[10.5px] font-black uppercase tracking-[0.22em] text-emerald-300/90">
                {company?.name ?? "YASCO ERP"}
              </div>
              <h1 className="truncate text-lg font-black leading-tight text-white md:text-[26px]">{title}</h1>
              {subtitle ? <p className="truncate text-[12px] font-medium text-slate-300">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
              {badge ?? "Report"}
            </span>
            {periodText ? <span className="text-[11.5px] font-semibold text-slate-300">{periodText}</span> : null}
          </div>
        </div>

        {(onFrom || presets?.length || actions) ? (
          <div className="mt-4 space-y-3" data-html2canvas-ignore>
            {(onFrom || presets?.length) && (
              <div className="flex flex-wrap items-center gap-2">
                {onFrom && (
                  <label className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-300" />
                    <span className="text-[11px] font-semibold text-slate-300">{singleDate ? "Date" : "From"}</span>
                    <input
                      type="date"
                      value={from ?? ""}
                      onChange={(e) => onFrom(e.target.value)}
                      className={inputDark}
                      style={{ colorScheme: "dark" }}
                    />
                  </label>
                )}
                {onTo && !singleDate && (
                  <label className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-300" />
                    <span className="text-[11px] font-semibold text-slate-300">To</span>
                    <input
                      type="date"
                      value={to ?? ""}
                      onChange={(e) => onTo?.(e.target.value)}
                      className={inputDark}
                      style={{ colorScheme: "dark" }}
                    />
                  </label>
                )}
                {presets?.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => onPreset?.(p)}
                    className="rounded-full border px-3 py-1.5 text-[11px] font-bold transition"
                    style={
                      activeKey === p.key
                        ? { background: "#10b981", borderColor: "#34d399", color: "#04140f" }
                        : { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.25)", color: "#e2e8f0" }
                    }
                  >
                    {p.label}
                  </button>
                ))}
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-300" /> : null}
              </div>
            )}
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Chart + table cards
// ---------------------------------------------------------------------------

export function ChartCard({
  title,
  subtitle,
  right,
  height = 300,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  height?: number;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_38px_-26px_rgba(15,23,42,0.6)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/70 px-4 py-2.5">
        <div>
          <h3 className="text-[13px] font-black text-slate-800">{title}</h3>
          {subtitle ? <p className="text-[11px] font-medium text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-3" style={{ height: height + 24 }}>
        <div style={{ height }}>{children}</div>
      </div>
    </section>
  );
}

export type ReportColumn = {
  label: string;
  align?: "left" | "right" | "center";
  numeric?: boolean;
  width?: number;
};

export function ReportTable({
  title,
  subtitle,
  columns,
  rows,
  totals,
  emptyText,
  footerNote,
}: {
  title?: string;
  subtitle?: ReactNode;
  columns: ReportColumn[];
  rows: ReactNode[][];
  totals?: ReactNode[];
  emptyText?: string;
  footerNote?: ReactNode;
}) {
  const alignOf = (c?: ReportColumn) => c?.align ?? (c?.numeric ? "right" : "left");
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_38px_-26px_rgba(15,23,42,0.6)]">
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/70 px-4 py-2.5">
          <h3 className="text-[13px] font-black text-slate-800">{title}</h3>
          {subtitle ? <span className="text-[11px] font-semibold text-slate-500">{subtitle}</span> : null}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr style={{ background: "linear-gradient(135deg,#0f172a,#134e4a)" }}>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap px-3 py-2 text-[10.5px] font-black uppercase tracking-wide text-white/90"
                  style={{ textAlign: alignOf(c), width: c.width }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-[12px] font-medium text-slate-400">
                  {emptyText ?? "—"}
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 ? "bg-slate-50/70" : "bg-white"}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="whitespace-nowrap px-3 py-1.5 text-slate-700"
                      style={{ textAlign: alignOf(columns[ci]), fontVariantNumeric: "tabular-nums" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {totals ? (
            <tfoot>
              <tr className="bg-emerald-50/90 font-bold text-emerald-900">
                {totals.map((cell, ci) => (
                  <td
                    key={ci}
                    className="border-t-2 border-emerald-200 px-3 py-2"
                    style={{ textAlign: alignOf(columns[ci]), fontVariantNumeric: "tabular-nums" }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {footerNote ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] font-medium text-slate-500">
          {footerNote}
        </div>
      ) : null}
    </section>
  );
}

/** Small ranked list with progress bars (top customers / top items). */
export function RankList({
  title,
  rows,
  total,
  emptyText,
}: {
  title: string;
  rows: Array<{ name: string; value: number; extra?: string }>;
  total?: number;
  emptyText?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => Math.abs(Number(r.value || 0))));
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_38px_-26px_rgba(15,23,42,0.6)]">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-black text-slate-800">{title}</h3>
        {total != null ? (
          <span className="text-[11px] font-bold text-slate-500">{money(total)}</span>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <div className="py-6 text-center text-[12px] font-medium text-slate-400">{emptyText ?? "—"}</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={`${r.name}-${i}`}>
              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                    style={{ background: "linear-gradient(135deg,#0f172a,#10b981)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate font-semibold text-slate-700">{r.name}</span>
                </span>
                <span className="shrink-0 font-black text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {money(r.value)}
                  {r.extra ? <span className="ml-1 font-semibold text-slate-400">{r.extra}</span> : null}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, (Math.abs(Number(r.value || 0)) / max) * 100)}%`,
                    background: "linear-gradient(90deg,#0f766a,#34d399)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer + export buttons
// ---------------------------------------------------------------------------

export function ReportFooter({
  company,
  generatedAt,
  note,
}: {
  company?: ReportCompany;
  generatedAt?: string;
  note?: string;
}) {
  const line = [company?.address, company?.phone, company?.email, company?.tax ? `Tax No. ${company.tax}` : null]
    .filter(Boolean)
    .join("  ·  ");
  return (
    <footer
      data-html2canvas-ignore
      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-medium text-slate-500 shadow-sm"
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[12px] font-black text-slate-700">{company?.name ?? "YASCO ERP"}</span>
        <span className="truncate">{line}</span>
      </div>
      <div className="flex items-center gap-3">
        {note ? <span>{note}</span> : null}
        <span className="font-semibold">{generatedAt ?? new Date().toLocaleString()}</span>
      </div>
    </footer>
  );
}

export function ExportActions({
  onExcel,
  onPdf,
  onPrint,
  busy,
  extra,
}: {
  onExcel?: () => void;
  onPdf?: () => void;
  onPrint?: () => void;
  busy?: string;
  extra?: ReactNode;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-black text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0";
  return (
    <>
      {onExcel ? (
        <button type="button" className={base} style={{ background: "linear-gradient(135deg,#047857,#10b981)" }} onClick={onExcel} disabled={!!busy}>
          {busy === "excel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
          Excel
        </button>
      ) : null}
      {onPdf ? (
        <button type="button" className={base} style={{ background: "linear-gradient(135deg,#b91c1c,#f43f5e)" }} onClick={onPdf} disabled={!!busy}>
          {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          PDF
        </button>
      ) : null}
      {onPrint ? (
        <button type="button" className={base} style={{ background: "linear-gradient(135deg,#1e293b,#475569)" }} onClick={onPrint} disabled={!!busy}>
          {busy === "print" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          Print
        </button>
      ) : null}
      {extra}
    </>
  );
}

// ---------------------------------------------------------------------------
// Excel export (styled, multi sheet, logo + KPI cards + detail tables)
// ---------------------------------------------------------------------------

export type ExcelColumn = { label: string; numeric?: boolean; width?: number };

export type ExcelSheet = {
  name: string;
  title?: string;
  columns: ExcelColumn[];
  rows: Array<Array<string | number>>;
  totals?: Array<string | number>;
  note?: string;
};

function thin(argb: string) {
  return { style: "thin" as const, color: { argb } };
}

function colLetter(n: number) {
  let s = "";
  let value = n;
  while (value > 0) {
    const m = (value - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    value = Math.floor((value - 1) / 26);
  }
  return s;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function imageToBase64(src: string): Promise<{ base64: string; extension: "png" | "jpeg" }> {
  if (src.startsWith("data:")) {
    const m = src.match(/^data:image\/(png|jpe?g);base64,(.*)$/i);
    if (!m) throw new Error("unsupported image");
    return { base64: m[2], extension: m[1].toLowerCase() === "png" ? "png" : "jpeg" };
  }
  const res = await fetch(src, { credentials: "include" });
  const blob = await res.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
  const m = dataUrl.match(/^data:image\/(png|jpe?g);base64,(.*)$/i);
  return { base64: m ? m[2] : dataUrl.split(",")[1], extension: m && m[1].toLowerCase() !== "png" ? "jpeg" : "png" };
}

const CARD_FILLS = [
  "FFECFDF5",
  "FFEFF6FF",
  "FFFEF3C7",
  "FFFFF1F2",
  "FFF5F3FF",
  "FFF0FDFA",
  "FFF8FAFC",
  "FFFDF4FF",
];

export type ReportChart = {
  title: string;
  labels: string[];
  series: Array<{ name: string; values: number[]; color: string }>;
};

export type ReportSpec = {
  title: string;
  subtitle: string;
  fileName: string;
  company?: ReportCompany;
  period?: string;
  footerNote?: string;
  kpis: KpiItem[];
  chart?: ReportChart;
  sheets: ExcelSheet[];
};

export async function exportReportExcel(spec: ReportSpec) {
  const opts = {
    fileName: spec.fileName.endsWith(".xlsx") ? spec.fileName : `${spec.fileName}.xlsx`,
    title: spec.title,
    subtitle: spec.subtitle,
    company: spec.company,
    kpis: spec.kpis.map((k) => ({
      label: k.label,
      value: String(k.value),
      change: k.change ?? null,
      sub: k.changeLabel,
    })),
    chart: spec.chart
      ? {
          title: spec.chart.title,
          columns: [
            { label: "Period" },
            ...spec.chart.series.map((s) => ({ label: s.name, numeric: true })),
          ],
          rows: spec.chart.labels.map((label, i) => [
            label,
            ...spec.chart!.series.map((s) => Number(s.values[i] || 0)),
          ]),
        }
      : undefined,
    sheets: spec.sheets,
  };
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "YASCO ERP";
  wb.created = new Date();

  const DARK = "FF0F172A";
  const TEAL = "FF065F46";
  const LINE = "FFE2E8F0";

  // ---- summary sheet -----------------------------------------------------
  const ws = wb.addWorksheet("Summary", { views: [{ showGridLines: false }] });
  for (let i = 1; i <= 8; i++) ws.getColumn(i).width = 16.5;

  ws.mergeCells("A1:G2");
  const nameCell = ws.getCell("A1");
  nameCell.value = opts.company?.name || "YASCO ERP";
  nameCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
  nameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
  nameCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 22;
  ws.getRow(2).height = 22;

  if (opts.company?.logo) {
    try {
      const { base64, extension } = await imageToBase64(opts.company.logo);
      const id = wb.addImage({ base64, extension });
      ws.addImage(id, { tl: { col: 7.05, row: 0.15 }, ext: { width: 58, height: 58 } });
    } catch {
      /* logo is optional */
    }
  }

  ws.mergeCells("A3:G3");
  const titleCell = ws.getCell("A3");
  titleCell.value = opts.title;
  titleCell.font = { size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(3).height = 24;

  ws.mergeCells("A4:G4");
  const subCell = ws.getCell("A4");
  subCell.value = opts.subtitle ?? "";
  subCell.font = { size: 11, bold: true, color: { argb: "FF0F172A" } };
  subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  subCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(4).height = 20;

  ws.mergeCells("A5:G5");
  const genCell = ws.getCell("A5");
  genCell.value = `Generated: ${new Date().toLocaleString()}`;
  genCell.font = { size: 10, color: { argb: "FF64748B" } };
  genCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(5).height = 18;

  const kpis = (opts.kpis ?? []).slice(0, 8);
  kpis.forEach((kpi, i) => {
    const col = 1 + (i % 4) * 2;
    const row = 7 + Math.floor(i / 4) * 4;
    const fill = CARD_FILLS[i % CARD_FILLS.length];

    ws.mergeCells(row, col, row, col + 1);
    const label = ws.getCell(row, col);
    label.value = kpi.label;
    label.font = { size: 10, bold: true, color: { argb: "FF475569" } };
    label.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    ws.getRow(row).height = 17;

    ws.mergeCells(row + 1, col, row + 1, col + 1);
    const value = ws.getCell(row + 1, col);
    value.value = kpi.value as any;
    if (typeof kpi.value === "number") value.numFmt = "#,##0.00";
    value.font = { size: 15, bold: true, color: { argb: "FF0F172A" } };
    value.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
    ws.getRow(row + 1).height = 24;

    ws.mergeCells(row + 2, col, row + 2, col + 1);
    const change = ws.getCell(row + 2, col);
    const changeText =
      kpi.change == null
        ? kpi.sub ?? ""
        : `${kpi.change >= 0 ? "▲" : "▼"} ${Math.abs(kpi.change).toFixed(1)}%${kpi.sub ? `  ${kpi.sub}` : ""}`;
    change.value = changeText;
    change.font = {
      size: 10,
      bold: true,
      color: { argb: kpi.change == null ? "FF64748B" : kpi.change >= 0 ? "FF047857" : "FFBE123C" },
    };
    change.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
    ws.getRow(row + 2).height = 16;

    for (let r = row; r <= row + 2; r++) {
      for (let c = col; c <= col + 1; c++) {
        const cell = ws.getCell(r, c);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
        cell.border = {
          top: thin("FFFFFFFF"),
          bottom: thin("FFFFFFFF"),
          left: thin("FFFFFFFF"),
          right: thin("FFFFFFFF"),
        };
      }
    }
  });

  let cursor = 7 + Math.ceil(kpis.length / 4) * 4 + 1;

  if (opts.chart) {
    ws.mergeCells(cursor, 1, cursor, 8);
    const chartTitle = ws.getCell(cursor, 1);
    chartTitle.value = opts.chart.title;
    chartTitle.font = { size: 12, bold: true, color: { argb: "FFFFFFFF" } };
    chartTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
    chartTitle.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    ws.getRow(cursor).height = 22;
    cursor += 1;

    const head = ws.getRow(cursor);
    opts.chart.columns.forEach((c, i) => {
      const cell = head.getCell(i + 1);
      cell.value = c.label;
      cell.font = { size: 10.5, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
      cell.alignment = { horizontal: c.numeric ? "right" : "left", vertical: "middle", indent: 1 };
      cell.border = thin(LINE);
    });
    head.height = 20;

    opts.chart.rows.forEach((row, ri) => {
      const r = ws.getRow(cursor + 1 + ri);
      row.forEach((val, ci) => {
        const cell = r.getCell(ci + 1);
        cell.value = val as any;
        if (typeof val === "number") {
          cell.numFmt = "#,##0.00";
          cell.alignment = { horizontal: "right" };
        }
        cell.font = { size: 10.5, color: { argb: "FF1E293B" } };
        cell.border = thin(LINE);
        if (ri % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      });
      r.height = 17;
    });
    cursor += opts.chart.rows.length + 2;
  }

  ws.mergeCells(cursor, 1, cursor, 8);
  const foot = ws.getCell(cursor, 1);
  foot.value = `Generated by YASCO ERP — ${new Date().toLocaleString()}`;
  foot.font = { size: 9, color: { argb: "FF64748B" } };
  foot.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

  // ---- detail sheets -----------------------------------------------------
  opts.sheets.forEach((sheet) => {
    const sh = wb.addWorksheet(sheet.name.slice(0, 31), {
      views: [{ state: "frozen", ySplit: 4, showGridLines: false }],
    });
    const lastCol = Math.max(sheet.columns.length, 3);
    const last = colLetter(lastCol);

    sh.mergeCells(`A1:${last}1`);
    const t = sh.getCell("A1");
    t.value = sheet.title ?? sheet.name;
    t.font = { size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
    t.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    sh.getRow(1).height = 26;

    sh.mergeCells(`A2:${last}2`);
    const s = sh.getCell("A2");
    s.value = opts.subtitle ?? "";
    s.font = { size: 10, color: { argb: "FF64748B" } };
    s.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    sh.getRow(2).height = 17;

    const head = sh.getRow(4);
    sheet.columns.forEach((c, i) => {
      const cell = head.getCell(i + 1);
      cell.value = c.label;
      cell.font = { size: 10.5, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
      cell.alignment = { horizontal: c.numeric ? "right" : "left", vertical: "middle", indent: 1, wrapText: true };
      cell.border = thin(LINE);
    });
    head.height = 22;

    sheet.rows.forEach((row, ri) => {
      const r = sh.getRow(5 + ri);
      row.forEach((val, ci) => {
        const cell = r.getCell(ci + 1);
        cell.value = val as any;
        if (typeof val === "number") {
          cell.numFmt = "#,##0.00";
          cell.alignment = { horizontal: "right" };
        } else {
          cell.alignment = { horizontal: sheet.columns[ci]?.numeric ? "right" : "left" };
        }
        cell.font = { size: 10.5, color: { argb: "FF1E293B" } };
        cell.border = thin(LINE);
        if (ri % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      });
      r.height = 17;
    });

    if (sheet.totals) {
      const tr = sh.getRow(5 + sheet.rows.length);
      sheet.totals.forEach((val, ci) => {
        const cell = tr.getCell(ci + 1);
        cell.value = val as any;
        if (typeof val === "number") cell.numFmt = "#,##0.00";
        cell.font = { size: 11, bold: true, color: { argb: "FF065F46" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };
        cell.alignment = { horizontal: sheet.columns[ci]?.numeric ? "right" : "left" };
        cell.border = {
          top: { style: "double", color: { argb: "FF10B981" } },
          bottom: thin(LINE),
          left: thin(LINE),
          right: thin(LINE),
        };
      });
      tr.height = 20;
    }

    if (sheet.note) {
      const nr = sh.getRow(6 + sheet.rows.length + (sheet.totals ? 1 : 0));
      nr.getCell(1).value = sheet.note;
      nr.getCell(1).font = { size: 9, italic: true, color: { argb: "FF64748B" } };
    }

    sheet.columns.forEach((c, i) => {
      const values = sheet.rows.map((r) => String(r[i] ?? ""));
      const maxLen = Math.max(c.label.length, ...values.map((v) => v.length), 10);
      sh.getColumn(i + 1).width = c.width ?? Math.min(40, Math.max(12, maxLen + 2));
    });

    sh.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: sheet.columns.length } };
  });

  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    opts.fileName,
  );
}
// ---------------------------------------------------------------------------
// Professional print / PDF document.
// The report is rebuilt as a self contained A4 document (inline CSS + vector
// SVG chart) and handed over to the browser's own print engine, so
// "Save as PDF" produces a crisp, selectable, Arabic correct PDF — and it
// never freezes the browser like a full page canvas capture does.
// ---------------------------------------------------------------------------

function escXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtCell(value: unknown) {
  if (typeof value === "number") {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(value ?? "");
}

function buildChartSvg(chart: ReportChart): string {
  const W = 940;
  const H = 250;
  const padL = 62;
  const padR = 14;
  const padT = 30;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const values = chart.series.flatMap((s) => s.values.map((v) => Math.abs(Number(v || 0))));
  const max = Math.max(1, ...values);
  const n = Math.max(1, chart.labels.length);
  const groupW = innerW / n;
  const barW = Math.max(3, Math.min(26, (groupW * 0.66) / Math.max(1, chart.series.length)));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet">`;
  svg += `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`;

  const gridLines = 4;
  for (let g = 0; g <= gridLines; g++) {
    const y = padT + (innerH * g) / gridLines;
    const val = max - (max * g) / gridLines;
    svg += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-dasharray="4 4"/>`;
    svg += `<text x="${padL - 7}" y="${(y + 4).toFixed(1)}" font-family="Segoe UI,Tahoma,Arial" font-size="10" fill="#64748b" text-anchor="end">${Math.round(val).toLocaleString("en-US")}</text>`;
  }

  chart.labels.forEach((label, i) => {
    const gx = padL + groupW * i + groupW / 2;
    chart.series.forEach((s, si) => {
      const v = Math.abs(Number(s.values[i] || 0));
      const h = (v / max) * innerH;
      const x = gx - (chart.series.length * barW) / 2 + si * barW;
      const y = padT + innerH - h;
      svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barW - 2).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="3" fill="${s.color}"/>`;
    });
    svg += `<text x="${gx.toFixed(1)}" y="${H - 10}" font-family="Segoe UI,Tahoma,Arial" font-size="10" fill="#64748b" text-anchor="middle">${escXml(label)}</text>`;
  });

  let lx = padL;
  chart.series.forEach((s) => {
    svg += `<rect x="${lx}" y="8" width="11" height="11" rx="3" fill="${s.color}"/>`;
    svg += `<text x="${lx + 16}" y="18" font-family="Segoe UI,Tahoma,Arial" font-size="11" fill="#334155">${escXml(s.name)}</text>`;
    lx += 26 + String(s.name).length * 6.4;
  });

  svg += `</svg>`;
  return svg;
}

export function buildReportDocument(spec: ReportSpec): string {
  const company = spec.company ?? {};

  const kpiHtml = spec.kpis
    .map((k) => {
      const tone = TONES[k.tone ?? "emerald"];
      const change = k.change;
      const badge =
        change == null
          ? ""
          : `<span style="display:inline-block;margin-top:5px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:bold;background:${
              change >= 0 ? "#ecfdf5" : "#fff1f2"
            };color:${change >= 0 ? "#047857" : "#be123c"}">${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}%</span>`;
      return `<div style="border:1px solid #e2e8f0;border-top:3px solid ${tone.text};border-radius:10px;padding:10px 12px;background:#fff;page-break-inside:avoid">
        <div style="font-size:9.5px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:#64748b">${escXml(k.label)}</div>
        <div style="font-size:19px;font-weight:bold;color:#0f172a;margin-top:2px">${escXml(String(k.value))}</div>
        ${k.sub ? `<div style="font-size:10px;color:#64748b;margin-top:1px">${escXml(String(k.sub))}</div>` : ""}
        ${badge}
      </div>`;
    })
    .join("");

  const tables = spec.sheets
    .map((s) => {
      const head = s.columns
        .map(
          (c, i) =>
            `<th style="background:#0f172a;color:#fff;padding:5px 6px;text-align:${
              c.numeric ? "right" : i === 0 ? "left" : "center"
            };border:1px solid #0f172a;font-size:10px">${escXml(c.label)}</th>`,
        )
        .join("");
      const body = s.rows.length
        ? s.rows
            .map(
              (row, ri) =>
                `<tr style="background:${ri % 2 ? "#f8fafc" : "#ffffff"}">${row
                  .map(
                    (cell, ci) =>
                      `<td style="border:1px solid #e2e8f0;padding:4px 6px;text-align:${
                        s.columns[ci]?.numeric ? "right" : ci === 0 ? "left" : "center"
                      };color:#1e293b;font-size:10px">${escXml(fmtCell(cell))}</td>`,
                  )
                  .join("")}</tr>`,
            )
            .join("")
        : `<tr><td colspan="${s.columns.length}" style="border:1px solid #e2e8f0;padding:10px;text-align:center;color:#94a3b8;font-size:10px">—</td></tr>`;
      const totals = s.totals
        ? `<tfoot><tr style="background:#ecfdf5;font-weight:bold;color:#065f46">${s.totals
            .map(
              (cell, ci) =>
                `<td style="border:1px solid #e2e8f0;border-top:2px solid #10b981;padding:5px 6px;text-align:${
                  s.columns[ci]?.numeric ? "right" : ci === 0 ? "left" : "center"
                };font-size:10.5px">${escXml(fmtCell(cell))}</td>`,
            )
            .join("")}</tr></tfoot>`
        : "";
      return `<div style="margin-top:18px">
        <div style="font-size:12.5px;font-weight:bold;color:#0f172a;border-bottom:2px solid #10b981;padding-bottom:4px;margin-bottom:6px">${escXml(
          s.title ?? s.name,
        )}</div>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
          <thead><tr>${head}</tr></thead><tbody>${body}</tbody>${totals}
        </table>
      </div>`;
    })
    .join("");

  const chartHtml = spec.chart
    ? `<div style="margin-top:18px;page-break-inside:avoid">
        <div style="font-size:12.5px;font-weight:bold;color:#0f172a;border-bottom:2px solid #10b981;padding-bottom:4px;margin-bottom:6px">${escXml(
          spec.chart.title,
        )}</div>
        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:#fff">${buildChartSvg(spec.chart)}</div>
      </div>`
    : "";

  const contact = [company.address, company.phone, company.email, company.tax ? `Tax No. ${company.tax}` : null]
    .filter(Boolean)
    .join("  ·  ");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escXml(spec.title)}</title>
<style>
  @page { size: A4 portrait; margin: 12mm 10mm 14mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin:0; font-family:"Segoe UI",Tahoma,Arial,sans-serif; color:#0f172a; background:#fff; }
  .toolbar { position:sticky; top:0; z-index:9; background:#0f172a; color:#fff; padding:9px 14px; font-size:12px; display:flex; gap:12px; align-items:center; }
  .toolbar button { background:#10b981; color:#04231a; border:0; border-radius:8px; padding:8px 14px; font-weight:bold; cursor:pointer; font-size:12px; }
  .head { background:#0b1220; color:#fff; padding:16px 20px; border-radius:12px; }
  .head .co { font-size:9.5px; letter-spacing:.2em; text-transform:uppercase; color:#6ee7b7; font-weight:bold; }
  .head h1 { margin:3px 0 0; font-size:21px; }
  .head .per { font-size:11.5px; color:#cbd5e1; margin-top:4px; }
  .kpis { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
  .kpis > div { width:calc(25% - 6px); }
  .foot { position:fixed; bottom:0; left:0; right:0; border-top:1px solid #cbd5e1; padding-top:4px; font-size:8.5px; color:#64748b; display:flex; justify-content:space-between; background:#fff; }
  @media print { .toolbar { display:none; } }
</style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Save as PDF / Print</button>
    <span>Choose “Save as PDF” as the destination in the print dialog — the report is saved as a real PDF file.</span>
  </div>
  <div class="head">
    <div class="co">${escXml(company.name ?? "YASCO ERP")}</div>
    <h1>${escXml(spec.title)}</h1>
    <div class="per">${escXml(spec.period ?? spec.subtitle)}</div>
  </div>
  <div class="kpis">${kpiHtml}</div>
  ${chartHtml}
  ${tables}
  <div class="foot">
    <span>${escXml(company.name ?? "YASCO ERP")}${contact ? ` — ${escXml(contact)}` : ""}${spec.footerNote ? ` — ${escXml(spec.footerNote)}` : ""}</span>
    <span>${escXml(new Date().toLocaleString())}</span>
  </div>
</body>
</html>`;
}

/** Opens the professional report document and triggers the print dialog
 *  (the user picks "Save as PDF" to store the file). */
export function openReportPrint(spec: ReportSpec, opts?: { autoPrint?: boolean }) {
  const html = buildReportDocument(spec);
  const win = window.open("", "_blank");
  if (!win) {
    window.alert("Please allow pop-ups for this site to open the report.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  if (opts?.autoPrint !== false) {
    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch {
        /* user can still print from the opened document */
      }
    }, 500);
  }
}
