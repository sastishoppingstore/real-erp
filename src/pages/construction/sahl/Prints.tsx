import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { inputCls, btnCls, btnGreenCls } from "./ui";
import {
  BUILTINS, DOC_TITLES, ALL_COLUMNS,
  renderXlsx, downloadBlob, importXlsx, printHtml,
  type DocType, type PrintConfig, type DocData,
} from "./printEngine";

// تصميم نماذج الطباعة — gallery + editor + preview + xlsx import/export.
// Templates persist in invoiceThemes (config.kind === "sahl-xlsx").
// Saving requires user-admin role (backend); errors shown honestly.
const DOCTYPES: DocType[] = ["sale", "quotation", "purchase", "sales-return", "payment", "receipt", "stocktake", "transfer"];

const SAMPLE: DocData = {
  no: "INV-00001", date: new Date().toISOString().slice(0, 10), time: "12:00",
  party: "عميل تجريبي", partyTax: "300000000000003", partyPhone: "0500000000", branch: "الفرع الرئيسي",
  lines: [
    { code: "P-001", name: "سكر 10كجم", unit: "قطعة", qty: 2, price: 35, disc: 0, total: 70 },
    { code: "P-002", name: "أرز 5كجم", unit: "قطعة", qty: 1, price: 24, disc: 2, total: 22 },
  ],
  subtotal: 94, discount: 2, tax: 13.8, net: 105.8, paid: 0, notes: "",
  qrText: "INV-00001|105.80",
};

export default function SahlPrints() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const T = (ar: string, en: string) => (rtl ? ar : en);
  const [docType, setDocType] = useState<DocType>("sale");
  const [selKey, setSelKey] = useState<string>("sales-0060");
  const [cfg, setCfg] = useState<PrintConfig>({ ...BUILTINS[0].config });  const [msg, setMsg] = useState("");
  const [myName, setMyName] = useState("");

  const { data: themesQ } = trpc.invoiceTheme.list.useQuery();
  const allThemes: any[] = Array.isArray(themesQ) ? themesQ : [];
  const mine = allThemes.filter((t: any) => t.config?.kind === "sahl-xlsx" && (t.config?.docType ?? "sale") === docType);

  const saveTheme = trpc.invoiceTheme.save.useMutation({
    onSuccess: () => { setMsg(T("✓ تم الحفظ", "✓ Saved")); utils.invoiceTheme.list.invalidate(); },
    onError: (e) => setMsg(e.message),
  });
  const setDefault = trpc.invoiceTheme.setDefault.useMutation({
    onSuccess: () => { setMsg(T("✓ تم", "✓ Done")); utils.invoiceTheme.list.invalidate(); },
    onError: (e) => setMsg(e.message),
  });

  const pickBuiltin = (key: string) => {
    const b = BUILTINS.find((x) => x.key === key)!;
    setSelKey(key);
    setCfg({ ...b.config, docType, columns: b.config.columns.map((c) => ({ ...c })) });
  };
  const pickMine = (t: any) => {
    setSelKey(`my-${t.id}`);
    setCfg({ ...(t.config as PrintConfig), docType });
  };

  const addToMine = () => {
    const name = myName.trim() || prompt(T("ما اسم تصميمك الجديد؟", "Name your new design?")) || "";
    if (!name.trim()) return;
    setMyName("");
    saveTheme.mutate({
      name: name.trim(),
      themeKey: `sahl-${docType}-${Date.now().toString(36)}`,
      config: { ...cfg, docType },
      isDefault: false,
    } as any);
  };

  const downloadSample = async () => {
    const blob = await renderXlsx(cfg, SAMPLE, { nameAr: "شركة تجريبية" });
    downloadBlob(blob, `template-${selKey}-sample.xlsx`);
  };

  const doImport = async (file: File) => {
    try {
      const part = await importXlsx(file, docType);
      setCfg({ ...cfg, ...part, docType });
      setMsg(T("تم الاستيراد — راجع ثم احفظ", "Imported — review then save"));
    } catch (e: any) {
      setMsg(e.message ?? String(e));
    }
  };

  const previewRows = useMemo(() => {
    const cols = cfg.columns.filter((c) => c.visible);
    return {
      cols,
      lines: SAMPLE.lines.map((l) => {
        const m: Record<string, string> = {
          code: l.code ?? "", name: l.name, unit: l.unit ?? "",
          qty: String(l.qty), price: Number(l.price).toFixed(2),
          disc: Number(l.disc || 0).toFixed(2), total: Number(l.total).toFixed(2),
        };
        return cols.map((c) => m[c.key] ?? "");
      }),
    };
  }, [cfg]);

  const paperW = cfg.paper === "A4" ? 560 : cfg.paper === "thermal80" ? 300 : 220;

  return (
    <div className="min-h-full bg-black p-2 text-[12px] text-white">
      <div className="mb-2 flex flex-wrap items-center gap-1 border border-[#333] bg-[#111] p-1.5">
        <b className="text-[13px]">{T("تصميم نماذج الطباعة", "Print template designer")}</b>
        {DOCTYPES.map((d) => (
          <button key={d} onClick={() => setDocType(d)}
            className="border border-[#555] px-2 py-1 text-white"
            style={{ background: docType === d ? "#2fae4e" : "#222" }}>
            {rtl ? DOC_TITLES[d][0] : DOC_TITLES[d][1]}
          </button>
        ))}
        {msg && <span className="bg-white px-1 text-black">{msg}</span>}
      </div>

      <div className="grid gap-2 lg:grid-cols-3">
        {/* gallery */}
        <div className="border border-[#333] bg-[#111] p-2">
          <b>{T("النماذج الجاهزة", "Built-in")}</b>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {BUILTINS.map((b) => (
              <button key={b.key} onClick={() => pickBuiltin(b.key)}
                className="border px-2 py-2 text-white"
                style={{ background: selKey === b.key ? b.config.accent : "#222", borderColor: "#555" }}>
                {rtl ? b.nameAr : b.name}
              </button>
            ))}
          </div>
          <b className="mt-2 block">{T("تصميماتي", "My templates")}</b>
          <div className="mt-1 space-y-1">
            {mine.length === 0 && <div className="text-[11px] text-white/50">{T("لا توجد بعد", "None yet")}</div>}
            {mine.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-1 border border-[#444] px-1 py-0.5">
                <button className="flex-1 text-start hover:underline" onClick={() => pickMine(t)}>{t.name}</button>
                {typeof t.id === "number" && (
                  <button className={btnCls} onClick={() => setDefault.mutate({ themeId: t.id })}>
                    {t.isDefault ? "✓" : T("افتراضي", "Default")}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <input className={inputCls} value={myName} onChange={(e) => setMyName(e.target.value)}
              placeholder={T("اسم التصميم (فاتورتنا)", "Design name")} />
            <button className={btnGreenCls} style={{ background: "#0a5c2a" }}
              disabled={saveTheme.isPending} onClick={addToMine}>
              {T("أضف إلى تصميماتي", "Add to mine")}
            </button>
          </div>
          <label className="mt-2 block border border-dashed border-[#666] p-2 text-center text-[11px] text-white/70">
            {T("استيراد xlsx (يقرأ الوسوم)", "Import xlsx (reads tags)")}
            <input type="file" accept=".xlsx" className="mt-1 w-full text-[11px]"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ""; }} />
          </label>
        </div>

        {/* preview (paper-sized) */}
        <div className="border border-[#333] bg-[#111] p-2">
          <div className="mb-1 flex items-center justify-between">
            <b>{T("معاينة حية", "Live preview")}</b>
            <span className="flex gap-1">
              <button className={btnCls} onClick={downloadSample}>xlsx ↓</button>
              <button className={btnCls} onClick={() => printHtml("preview",
                `<h1>${cfg.titleAr}</h1><p>${SAMPLE.no} · ${SAMPLE.date}</p>` +
                `<table><tr>${previewRows.cols.map((c) => `<th>${c.ar}</th>`).join("")}</tr>` +
                previewRows.lines.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") +
                `</table><div class="tot">الصافي: ${SAMPLE.net}</div>`)}>🖨</button>
            </span>
          </div>
          <div className="mx-auto overflow-auto bg-white p-2 text-black" style={{ maxWidth: paperW }}>
            <div className="py-1 text-center font-bold text-white" style={{ background: cfg.accent, fontSize: 15 }}>
              {cfg.titleAr} — {SAMPLE.no}
            </div>
            <div className="py-1 text-center text-[11px] text-[#444]">
              {SAMPLE.date} · {SAMPLE.party} · {SAMPLE.partyPhone}
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead><tr style={{ background: cfg.accent, color: "#fff" }}>
                {previewRows.cols.map((c) => <th key={c.key} className="border border-[#555] px-1 py-0.5">{c.ar}</th>)}
              </tr></thead>
              <tbody>
                {previewRows.lines.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j} className="border border-[#aaa] px-1 py-0.5 text-center">{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <div className="mt-1 text-[12px] font-bold">الصافي: {SAMPLE.net} · {T("الكلمات", "Words")}: ...</div>
            {cfg.footerText && <div className="mt-1 text-[11px]">{cfg.footerText}</div>}
            {cfg.showSignatures && (
              <div className="mt-2 flex justify-between text-[11px] text-[#555]">
                <span>{T("التوقيع", "Signature")}: ______</span><span>{T("الختم", "Stamp")}: ______</span>
              </div>
            )}
          </div>
          <div className="mt-1 text-[11px] text-white/60">
            {T("الوسوم: <Data:id|date> <Account:title|tax_id|phone> <Items:title|qty|price|total> <AmountString> <ZATCA:QR_TLV>",
              "Tags: <Data:id|date> <Account:title|tax_id|phone> <Items:title|qty|price|total> <AmountString> <ZATCA:QR_TLV>")}
          </div>
        </div>

        {/* editor */}
        <div className="border border-[#333] bg-[#111] p-2 text-white">
          <b>{T("محرر القالب", "Template editor")}</b>
          <div className="mt-1 space-y-1.5">
            <label className="block">{T("العنوان عربي", "Arabic title")}
              <input className={inputCls} value={cfg.titleAr} onChange={(e) => setCfg({ ...cfg, titleAr: e.target.value })} /></label>
            <label className="block">{T("العنوان إنجليزي", "English title")}
              <input className={inputCls} value={cfg.titleEn} onChange={(e) => setCfg({ ...cfg, titleEn: e.target.value })} /></label>
            <label className="block">{T("الورق", "Paper")}
              <select className={inputCls} value={cfg.paper} onChange={(e) => setCfg({ ...cfg, paper: e.target.value as any })}>
                <option value="A4">A4</option>
                <option value="thermal80">{T("حراري 80مم", "Thermal 80mm")}</option>
                <option value="thermal58">{T("حراري 58مم", "Thermal 58mm")}</option>
              </select></label>
            <label className="block">{T("اللون", "Accent")}
              <span className="flex gap-1">
                <input type="color" value={cfg.accent} onChange={(e) => setCfg({ ...cfg, accent: e.target.value })} />
                <input className={inputCls} value={cfg.accent} onChange={(e) => setCfg({ ...cfg, accent: e.target.value })} />
              </span></label>
            <div>
              <div className="mb-0.5 font-bold">{T("الأعمدة", "Columns")}</div>
              {cfg.columns.map((c) => (
                <label key={c.key} className="me-2 inline-flex items-center gap-1 text-[12px]">
                  <input type="checkbox" checked={c.visible}
                    onChange={(e) => setCfg({ ...cfg, columns: cfg.columns.map((x) => x.key === c.key ? { ...x, visible: e.target.checked } : x) })} />
                  {c.ar}
                </label>
              ))}
            </div>
            {[0, 1, 2].map((i) => (
              <label key={i} className="block">{T(`سطر الترويسة ${i + 1}`, `Header line ${i + 1}`)}
                <input className={inputCls} value={cfg.headerLines[i] ?? ""}
                  onChange={(e) => setCfg({ ...cfg, headerLines: cfg.headerLines.map((h, j) => j === i ? e.target.value : h) })} /></label>
            ))}
            {[0, 1, 2].map((i) => (
              <label key={`c${i}`} className="block">{T(`سطر التواصل ${i + 1} (أسفل Thank You)`, `Contact line ${i + 1}`)}
                <input className={inputCls} value={cfg.contactLines[i] ?? ""}
                  onChange={(e) => setCfg({ ...cfg, contactLines: [...cfg.contactLines.slice(0, i), e.target.value, ...cfg.contactLines.slice(i + 1)] })} /></label>
            ))}
            <label className="block">{T("التذييل", "Footer")}
              <input className={inputCls} value={cfg.footerText} onChange={(e) => setCfg({ ...cfg, footerText: e.target.value })} /></label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cfg.showTax} onChange={(e) => setCfg({ ...cfg, showTax: e.target.checked })} />
              {T("إظهار الضريبة", "Show tax")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cfg.showBalances} onChange={(e) => setCfg({ ...cfg, showBalances: e.target.checked })} />
              {T("أرصدة العميل (قبل/بعد)", "Customer balances")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={cfg.showSignatures} onChange={(e) => setCfg({ ...cfg, showSignatures: e.target.checked })} />
              {T("التوقيع والختم", "Signature & stamp")}
            </label>
            <button className={btnGreenCls} style={{ background: "#0a5c2a" }}
              disabled={saveTheme.isPending || !selKey.startsWith("my-")}
              title={!selKey.startsWith("my-") ? T("انسخ لقالبك أولاً", "Copy to your template first") : ""}
              onClick={() => {
                const id = Number(selKey.slice(3));
                const cur = mine.find((t: any) => t.id === id);
                if (!cur) return;
                saveTheme.mutate({ name: cur.name, themeKey: cur.themeKey || cur.theme_key, config: { ...cfg, docType } } as any);
              }}>
              {T("حفظ التعديلات", "Save edits")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
