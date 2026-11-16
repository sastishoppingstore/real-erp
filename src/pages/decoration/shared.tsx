/**
 * Decoration & Construction module — shared UI kit (bilingual, RTL-aware).
 * Kept inside the module so it never edits global i18n files.
 *
 * The visual language is grounded in the trade itself: gypsum-paper white,
 * YASCO emerald, and a brass rule that reads like a fit-out trim detail.
 */
import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

/* ════════════════════════════════════════════════════════════════════════════
 * Language + formatting
 * ════════════════════════════════════════════════════════════════════════════ */
export function useDeco() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const L = (en: string, ar: string) => (isAr ? ar : en);
  return { isAr, dir, L, lang: language };
}

export const money = (v: number | string | null | undefined) =>
  "SAR " +
  Number(v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

export const num = (v: number | string | null | undefined) =>
  Number(v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

export const pct = (v: number | string | null | undefined) =>
  `${Number(v ?? 0).toFixed(1)}%`;

/** Gregorian + Hijri date pair for the current locale. */
export function useToday() {
  const { lang } = useDeco();
  const d = new Date();
  const fmt = (locale: string, opts: Intl.DateTimeFormatOptions) => {
    try {
      return new Intl.DateTimeFormat(locale, opts).format(d);
    } catch {
      return "";
    }
  };
  const gregLocale = lang === "ar" ? "ar-SA-u-ca-gregory" : "en-GB";
  const hijriLocale = lang === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-SA-u-ca-islamic-umalqura";
  return {
    iso: d.toISOString().slice(0, 10),
    gregorian: fmt(gregLocale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    hijri: fmt(hijriLocale, { day: "numeric", month: "long", year: "numeric" }),
    hijriShort: fmt(hijriLocale, { day: "2-digit", month: "2-digit", year: "numeric" }),
  };
}

/* ════════════════════════════════════════════════════════════════════════════
 * Design tokens — one palette for the whole module
 * ════════════════════════════════════════════════════════════════════════════ */
export const DECO = {
  ink: "#10231c",
  brand: "#0f5132",
  brand2: "#14794a",
  brass: "#c08a3e",
  brassSoft: "#e9d5ae",
  paper: "#f7f5f0",
  line: "#e6e1d6",
};

export type Tone = "emerald" | "brass" | "sky" | "violet" | "rose" | "slate" | "teal" | "indigo";

const TONE_GRADIENT: Record<Tone, string> = {
  emerald: "from-emerald-600 to-emerald-800",
  brass: "from-amber-500 to-amber-700",
  sky: "from-sky-500 to-sky-700",
  violet: "from-violet-500 to-violet-700",
  rose: "from-rose-500 to-rose-700",
  slate: "from-slate-500 to-slate-700",
  teal: "from-teal-500 to-teal-700",
  indigo: "from-indigo-500 to-indigo-700",
};

const TONE_TEXT: Record<Tone, string> = {
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
  brass: "text-amber-700 bg-amber-50 border-amber-200",
  sky: "text-sky-700 bg-sky-50 border-sky-200",
  violet: "text-violet-700 bg-violet-50 border-violet-200",
  rose: "text-rose-700 bg-rose-50 border-rose-200",
  slate: "text-slate-700 bg-slate-50 border-slate-200",
  teal: "text-teal-700 bg-teal-50 border-teal-200",
  indigo: "text-indigo-700 bg-indigo-50 border-indigo-200",
};

/* ════════════════════════════════════════════════════════════════════════════
 * Status
 * ════════════════════════════════════════════════════════════════════════════ */
const STATUS_TONE: Record<string, string> = {
  running: "bg-emerald-100 text-emerald-700 border-emerald-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  awarded: "bg-sky-100 text-sky-700 border-sky-200",
  tender: "bg-slate-100 text-slate-700 border-slate-200",
  on_hold: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  handed_over: "bg-teal-100 text-teal-700 border-teal-200",
  dlp: "bg-cyan-100 text-cyan-700 border-cyan-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  certified: "bg-emerald-100 text-emerald-700 border-emerald-200",
  submitted: "bg-sky-100 text-sky-700 border-sky-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  preparing: "bg-slate-100 text-slate-700 border-slate-200",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partially_paid: "bg-amber-100 text-amber-700 border-amber-200",
  overdue: "bg-rose-100 text-rose-700 border-rose-200",
  cleared: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reported: "bg-sky-100 text-sky-700 border-sky-200",
  open: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-sky-100 text-sky-700 border-sky-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-rose-100 text-rose-700 border-rose-200",
  received: "bg-emerald-100 text-emerald-700 border-emerald-200",
  fulfilled: "bg-emerald-100 text-emerald-700 border-emerald-200",
  terminated: "bg-rose-100 text-rose-700 border-rose-200",
};

export function StatusPill({ status }: { status?: string | null }) {
  const s = status ?? "draft";
  const tone = STATUS_TONE[s] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {s.replace(/_/g, " ")}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * KPIs & layout primitives
 * ════════════════════════════════════════════════════════════════════════════ */
export function Kpi({
  label,
  value,
  icon,
  tone = "emerald",
  sub,
  onClick,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[#e6e1d6] bg-white p-5 shadow-sm ${
        onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#10231c]">{value}</p>
          {sub ? <p className="mt-1 truncate text-xs text-slate-400">{sub}</p> : null}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${TONE_GRADIENT[tone]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-[#10231c]">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Standard page header with a breadcrumb back to the launcher. */
export function PageHeader({
  title,
  subtitle,
  action,
  back = true,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean;
}) {
  const { L } = useDeco();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {back ? (
          <Link to="/app/decoration" className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800">
            ← {L("Decoration & Construction", "الديكور والإنشاءات")}
          </Link>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-[#10231c]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#e6e1d6] bg-white shadow-sm ${className}`}>
      {title || action ? (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee9df] px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-[#10231c]">{title}</h3>
            {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
        {label}
      </td>
    </tr>
  );
}

export function MiniStat({ label, value, tone = "slate" }: { label: string; value: ReactNode; tone?: Tone }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${TONE_TEXT[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * Launcher components
 * ════════════════════════════════════════════════════════════════════════════ */
export function LauncherTile({
  label,
  desc,
  icon,
  tone = "emerald",
  badge,
  onClick,
}: {
  label: string;
  desc?: string;
  icon: ReactNode;
  tone?: Tone;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={desc ?? label}
      className="group relative flex h-full w-full flex-col items-center gap-2 rounded-[20px] border border-white/80 bg-white/95 px-3 pb-3.5 pt-4 text-center [transform-style:preserve-3d] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(16,35,28,0.06),0_12px_20px_-14px_rgba(16,35,28,0.55)] transition-all duration-200 hover:-translate-y-1 hover:border-[#d9cdb4] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_4px_rgba(16,35,28,0.08),0_26px_36px_-18px_rgba(16,35,28,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:translate-y-0"
    >
      {/* pedestal shadow */}
      <span className="pointer-events-none absolute inset-x-4 -bottom-1 h-2 rounded-[50%] bg-[#10231c]/10 blur-[5px] transition-opacity duration-200 group-hover:opacity-70" />

      {badge && badge > 0 ? (
        <span className="absolute end-2.5 top-2.5 z-10 inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}

      {/* 3-D icon plate */}
      <span
        className={`relative flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-gradient-to-br ${TONE_GRADIENT[tone]} text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-8px_14px_rgba(0,0,0,0.18),0_10px_16px_-8px_rgba(16,35,28,0.65)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.04]`}
      >
        <span className="pointer-events-none absolute inset-x-1.5 top-1 h-1/2 rounded-[12px] bg-white/20 blur-[1px]" />
        <span className="relative">{icon}</span>
      </span>

      <span className="mt-0.5 line-clamp-2 text-[12px] font-semibold leading-tight text-[#10231c]">{label}</span>
      {desc ? (
        <span className="line-clamp-2 text-[10px] leading-snug text-slate-500">{desc}</span>
      ) : null}
    </button>
  );
}

export function LauncherGroup({
  title,
  subtitle,
  accent = "emerald",
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: Tone;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-sm ${accent === "brass" ? "bg-amber-500" : accent === "sky" ? "bg-sky-600" : accent === "violet" ? "bg-violet-600" : accent === "rose" ? "bg-rose-600" : accent === "teal" ? "bg-teal-600" : accent === "indigo" ? "bg-indigo-600" : "bg-emerald-700"}`} />
        <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#3d4a43]">{title}</h2>
        {subtitle ? <span className="hidden truncate text-[11px] text-slate-400 sm:block">· {subtitle}</span> : null}
        <span className="ms-auto hidden h-px flex-1 bg-[#e6e1d6] sm:block" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">{children}</div>
    </section>
  );
}

export function QuickAction({
  label,
  icon,
  onClick,
  primary = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
        primary
          ? "border-amber-700/30 bg-amber-500 text-amber-950 shadow-sm hover:bg-amber-400"
          : "border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function AlertChip({
  count,
  label,
  tone = "rose",
  onClick,
}: {
  count: number;
  label: string;
  tone?: Tone;
  onClick?: () => void;
}) {
  if (!count) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:brightness-95 ${TONE_TEXT[tone]}`}
    >
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/70 px-1 text-[11px] font-bold">
        {count > 99 ? "99+" : count}
      </span>
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * Tables
 * ════════════════════════════════════════════════════════════════════════════ */
export type Column = {
  key: string;
  en: string;
  ar: string;
  className?: string;
  render?: (row: any) => ReactNode;
};

export function DataTable({
  columns,
  rows,
  empty,
  loading,
  onRowClick,
  compact = false,
}: {
  columns: Column[];
  rows: any[];
  empty: string;
  loading?: boolean;
  onRowClick?: (row: any) => void;
  compact?: boolean;
}) {
  const { L } = useDeco();
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${compact ? "text-xs" : "text-sm"}`}>
        <thead className="border-b border-[#eee9df] bg-[#fbfaf7] text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`whitespace-nowrap px-4 py-2.5 text-start font-semibold ${c.className ?? ""}`}>
                {L(c.en, c.ar)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1ede4]">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-400">
                {L("Loading…", "جارٍ التحميل…")}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={columns.length} label={empty} />
          ) : (
            rows.map((row, i) => (
              <tr
                key={row?.id ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`${onRowClick ? "cursor-pointer" : ""} hover:bg-[#fbfaf7]`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 ${compact ? "py-2" : "py-3"} text-slate-700 ${c.className ?? ""}`}>
                    {c.render ? c.render(row) : (row?.[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * Record panel — list + inline create dialog driven by a field spec
 * ════════════════════════════════════════════════════════════════════════════ */
export type FieldSpec = {
  name: string;
  en: string;
  ar: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
  span?: 1 | 2;
  placeholder?: string;
};

export function RecordPanel({
  title,
  subtitle,
  createLabel,
  fields,
  columns,
  rows,
  loading,
  empty,
  onCreate,
  pending,
  onRowClick,
}: {
  title: string;
  subtitle?: string;
  createLabel?: string;
  fields?: FieldSpec[];
  columns: Column[];
  rows: any[];
  loading?: boolean;
  empty: string;
  onCreate?: (values: Record<string, any>) => void;
  pending?: boolean;
  onRowClick?: (row: any) => void;
}) {
  const { L } = useDeco();
  const [open, setOpen] = useState(false);
  const initial = () =>
    Object.fromEntries((fields ?? []).map((f) => [f.name, f.defaultValue ?? ""]));
  const [form, setForm] = useState<Record<string, any>>(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreate) return;
    const out: Record<string, any> = {};
    for (const f of fields ?? []) {
      const v = form[f.name];
      if (v === "" || v === undefined) continue;
      out[f.name] = f.type === "number" ? v : v;
    }
    onCreate(out);
    setOpen(false);
    setForm(initial());
  };

  return (
    <Panel
      title={title}
      subtitle={subtitle}
      action={
        fields && onCreate ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800">
                + {createLabel ?? L("New", "جديد")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[86vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{createLabel ?? L("New record", "سجل جديد")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(fields ?? []).map((f) => (
                    <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
                      <Label className="mb-1 block text-xs">{L(f.en, f.ar)}{f.required ? " *" : ""}</Label>
                      {f.type === "select" ? (
                        <select
                          required={f.required}
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                        >
                          <option value="">—</option>
                          {(f.options ?? []).map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : f.type === "textarea" ? (
                        <Textarea
                          rows={2}
                          required={f.required}
                          placeholder={f.placeholder}
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        />
                      ) : (
                        <Input
                          type={f.type ?? "text"}
                          required={f.required}
                          placeholder={f.placeholder}
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? L("Saving…", "جارٍ الحفظ…") : L("Save", "حفظ")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : undefined
      }
    >
      <DataTable columns={columns} rows={rows} empty={empty} loading={loading} onRowClick={onRowClick} />
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * Tabs — URL driven so every launcher box can deep-link to its section
 * ════════════════════════════════════════════════════════════════════════════ */
export function useTab(defaultTab: string) {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || defaultTab;
  const setTab = (next: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("tab", next);
    setParams(p, { replace: true });
  };
  return [tab, setTab] as const;
}

export function TabBar({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: string; label: string; badge?: number }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#e6e1d6] bg-white p-1.5 shadow-sm">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            value === t.key
              ? "bg-[#0f5132] text-white shadow-sm"
              : "text-slate-600 hover:bg-[#f5f1e8]"
          }`}
        >
          {t.label}
          {t.badge ? (
            <span className={`rounded-full px-1.5 text-[10px] ${value === t.key ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
              {t.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * Export helpers — CSV (Excel opens it) + print-ready PDF via the browser
 * ════════════════════════════════════════════════════════════════════════════ */
export function exportCsv(filename: string, head: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Opens a print-ready AR/EN document in a new window (letterhead + table).
 * The user can then "Save as PDF" from the print dialog — no server needed.
 */
export function printReport(opts: {
  titleEn: string;
  titleAr: string;
  companyEn?: string;
  companyAr?: string;
  vatNumber?: string;
  head: string[];
  rows: (string | number)[][];
  rtl?: boolean;
  meta?: { label: string; value: string }[];
  footerNote?: string;
}) {
  const dir = opts.rtl ? "rtl" : "ltr";
  const today = new Intl.DateTimeFormat(opts.rtl ? "ar-SA-u-ca-gregory" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date());
  const esc = (v: unknown) =>
    String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

  const html = `<!doctype html><html dir="${dir}" lang="${opts.rtl ? "ar" : "en"}"><head><meta charset="utf-8" />
<title>${esc(opts.titleEn)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: ${opts.rtl ? "'Tajawal','Segoe UI',Tahoma" : "'Inter','Segoe UI',Arial"}, sans-serif; color:#10231c; margin:0; }
  .head { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; border-bottom:3px solid #0f5132; padding-bottom:12px; }
  .brand { font-size:22px; font-weight:800; letter-spacing:-0.3px; margin:0; }
  .brand-ar { font-size:16px; color:#4b5a53; margin:2px 0 0; }
  .tag { font-size:11px; color:#8a7a5c; letter-spacing:.18em; text-transform:uppercase; margin:6px 0 0; }
  .doc { text-align:${opts.rtl ? "left" : "right"}; }
  .doc h1 { font-size:18px; margin:0 0 4px; }
  .doc p { font-size:11px; color:#6b7280; margin:2px 0; }
  .rule { height:4px; width:64px; background:#c08a3e; margin:14px 0 18px; }
  .meta { display:flex; flex-wrap:wrap; gap:8px 24px; font-size:11px; color:#4b5a53; margin-bottom:16px; }
  table { width:100%; border-collapse:collapse; font-size:11px; }
  thead th { background:#0f5132; color:#fff; text-align:${opts.rtl ? "right" : "left"}; padding:8px 10px; font-weight:600; }
  tbody td { padding:7px 10px; border-bottom:1px solid #e6e1d6; vertical-align:top; }
  tbody tr:nth-child(even) { background:#faf8f4; }
  .foot { margin-top:22px; display:flex; justify-content:space-between; font-size:10px; color:#8a7a5c; border-top:1px solid #e6e1d6; padding-top:10px; }
</style></head><body>
  <div class="head">
    <div>
      <p class="brand">${esc(opts.companyEn ?? "YASCO")}</p>
      <p class="brand-ar">${esc(opts.companyAr ?? "ياسكو")}</p>
      <p class="tag">Decoration &amp; Construction</p>
      ${opts.vatNumber ? `<p class="tag">VAT ${esc(opts.vatNumber)}</p>` : ""}
    </div>
    <div class="doc">
      <h1>${esc(opts.titleEn)}</h1>
      <p dir="rtl">${esc(opts.titleAr)}</p>
      <p>${esc(today)}</p>
    </div>
  </div>
  <div class="rule"></div>
  ${opts.meta?.length ? `<div class="meta">${opts.meta.map((m) => `<span><strong>${esc(m.label)}:</strong> ${esc(m.value)}</span>`).join("")}</div>` : ""}
  <table>
    <thead><tr>${opts.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${opts.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
  <div class="foot">
    <span>${esc(opts.footerNote ?? "Generated by YASCO ERP — Decoration & Construction")}</span>
    <span>${esc(today)}</span>
  </div>
  <script>window.onload = function(){ window.print(); };</script>
</body></html>`;

  const w = window.open("", "_blank", "width=980,height=720");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}