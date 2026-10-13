import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { WhiteDialog, SectionHead, SahlField, inputCls, btnCls } from "./ui";

// SCR-003: white settings dialog, pink-red title, pale-green sections,
// company fields left, list management right. Persists to MySQL via tRPC.
export default function SahlSettings() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const utils = trpc.useUtils();
  const [msg, setMsg] = useState("");
  const [prefs, setPrefs] = useState(() => {
    try {
      return {
        showCost: localStorage.getItem("sahl-showCost") !== "0",
        autoPrint: localStorage.getItem("sahl-autoPrint") === "1",
        confirmDelete: localStorage.getItem("sahl-confirmDelete") !== "0",
      };
    } catch {
      return { showCost: true, autoPrint: false, confirmDelete: true };
    }
  });
  const setPref = (k: "showCost" | "autoPrint" | "confirmDelete", v: boolean) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    try { localStorage.setItem(`sahl-${k}`, v ? "1" : "0"); } catch { /* ignore */ }
  };

  const { data: company } = trpc.settings.companySettingsGet.useQuery();
  const { data: currencies } = trpc.settings.currencyList.useQuery();
  const { data: units } = trpc.inventory.unitList.useQuery();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const { data: categories } = trpc.inventory.categoryList.useQuery();

  const [f, setF] = useState<any>({});
  useEffect(() => {
    if (company)
      setF({
        companyName: company.companyName ?? "",
        companyNameAr: company.companyNameAr ?? "",
        taxNumber: company.taxNumber ?? "",
        crNumber: company.crNumber ?? "",
        phone: company.phone ?? "",
        address: company.address ?? "",
        city: company.city ?? "",
        defaultCurrency: company.defaultCurrency ?? "SAR",
        vatRate: company.vatRate ?? "15",
        invoicePrefix: company.invoicePrefix ?? "INV-",
      });
  }, [company]);

  const save = trpc.settings.companySettingsUpdate.useMutation({
    onSuccess: () => {
      setMsg(rtl ? "تم حفظ الإعدادات" : "Settings saved");
      utils.settings.companySettingsGet.invalidate();
    },
    onError: (e) => setMsg(String(e.message)),
  });
  const addCurrency = trpc.settings.currencyCreate.useMutation({
    onSuccess: () => utils.settings.currencyList.invalidate(),
    onError: (e) => setMsg(e.message),
  });
  const addUnit = trpc.inventory.unitCreate.useMutation({
    onSuccess: () => utils.inventory.unitList.invalidate(),
    onError: (e) => setMsg(e.message),
  });
  const addWarehouse = trpc.inventory.warehouseCreate.useMutation({
    onSuccess: () => utils.inventory.warehouseList.invalidate(),
    onError: (e) => setMsg(e.message),
  });
  const addCategory = trpc.inventory.categoryCreate.useMutation({
    onSuccess: () => utils.inventory.categoryList.invalidate(),
    onError: (e) => setMsg(e.message),
  });

  const ListMgr = ({
    title,
    items,
    onAdd,
    placeholder,
  }: {
    title: string;
    items: any[];
    onAdd?: (n: string) => void;
    placeholder: string;
  }) => {
    const [v, setV] = useState("");
    const [sel, setSel] = useState<number | null>(null);
    return (
      <div className="border border-[#bbb] bg-white p-2">
        <div className="mb-1 text-[12px] font-bold">{title}</div>
        <div className="h-[86px] overflow-auto border border-[#999] text-[12px]">
          {(items ?? []).map((x: any) => (
            <div
              key={x.id}
              onClick={() => setSel(x.id)}
              className="cursor-pointer px-1.5 py-0.5"
              style={sel === x.id ? { background: "#0d47a1", color: "#fff" } : undefined}
            >
              {x.name ?? x.code ?? x.id}
            </div>
          ))}
        </div>
        {onAdd && (
          <div className="mt-1 flex gap-1">
            <input value={v} onChange={(e) => setV(e.target.value)} className={inputCls} placeholder={placeholder} />
            <button
              className={btnCls}
              onClick={() => {
                if (v.trim()) {
                  onAdd(v.trim());
                  setV("");
                }
              }}
            >
              ＋
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-black p-2">
      <WhiteDialog title={rtl ? "إعداد البرنامج" : "Program settings"} onClose={() => navigate("/app/construction")}>
        {msg && <div className="mb-2 border border-green-600 bg-green-100 px-2 py-1 text-[12px]">{msg}</div>}
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <SectionHead>{rtl ? "بيانات المشروع / الشركة" : "Company / project"}</SectionHead>
            <SahlField label={rtl ? "اسم الشركة" : "Company"}>
              <input className={inputCls} value={f.companyName ?? ""} onChange={(e) => setF({ ...f, companyName: e.target.value })} />
            </SahlField>
            <SahlField label={rtl ? "الاسم بالعربية" : "Arabic name"}>
              <input className={inputCls} value={f.companyNameAr ?? ""} onChange={(e) => setF({ ...f, companyNameAr: e.target.value })} />
            </SahlField>
            <SahlField label={rtl ? "الرقم الضريبي" : "VAT number"}>
              <input className={inputCls} value={f.taxNumber ?? ""} onChange={(e) => setF({ ...f, taxNumber: e.target.value })} />
            </SahlField>
            <SahlField label={rtl ? "السجل التجاري" : "CR number"}>
              <input className={inputCls} value={f.crNumber ?? ""} onChange={(e) => setF({ ...f, crNumber: e.target.value })} />
            </SahlField>
            <SahlField label={rtl ? "الهاتف" : "Phone"}>
              <input className={inputCls} value={f.phone ?? ""} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </SahlField>
            <SahlField label={rtl ? "العنوان" : "Address"}>
              <input className={inputCls} value={f.address ?? ""} onChange={(e) => setF({ ...f, address: e.target.value })} />
            </SahlField>
            <div className="grid grid-cols-3 gap-1">
              <SahlField label={rtl ? "العملة" : "Currency"}>
                <input className={inputCls} value={f.defaultCurrency ?? ""} onChange={(e) => setF({ ...f, defaultCurrency: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "الضريبة %" : "VAT %"}>
                <input className={inputCls} value={f.vatRate ?? ""} onChange={(e) => setF({ ...f, vatRate: e.target.value })} />
              </SahlField>
              <SahlField label={rtl ? "بادئة الفواتير" : "Inv prefix"}>
                <input className={inputCls} value={f.invoicePrefix ?? ""} onChange={(e) => setF({ ...f, invoicePrefix: e.target.value })} />
              </SahlField>
            </div>
            <div className="mt-2 flex gap-1">
              <button className={btnCls} disabled={save.isPending} onClick={() => save.mutate(f)}>
                {rtl ? "حفظ" : "Save"}
              </button>
              <button className={btnCls} onClick={() => navigate("/app/construction")}>
                {rtl ? "إغلاق" : "Close"}
              </button>
            </div>
            <SectionHead>{rtl ? "خيارات العرض" : "Display options"}</SectionHead>
            <label className="mb-1 flex items-center gap-2 text-[12px] text-black">
              <input type="checkbox" checked={prefs.showCost} onChange={(e) => setPref("showCost", e.target.checked)} />
              {rtl ? "إظهار سعر التكلفة" : "Show cost price"}
            </label>
            <label className="mb-1 flex items-center gap-2 text-[12px] text-black">
              <input type="checkbox" checked={prefs.autoPrint} onChange={(e) => setPref("autoPrint", e.target.checked)} />
              {rtl ? "طباعة تلقائية بعد الحفظ" : "Auto-print after save"}
            </label>
            <label className="mb-1 flex items-center gap-2 text-[12px] text-black">
              <input type="checkbox" checked={prefs.confirmDelete} onChange={(e) => setPref("confirmDelete", e.target.checked)} />
              {rtl ? "تأكيد قبل الحذف" : "Confirm before delete"}
            </label>
          </div>
          <div className="space-y-2">
            <ListMgr
              title={rtl ? "العملات" : "Currencies"}
              items={currencies ?? []}
              placeholder="+"
              onAdd={(n) => addCurrency.mutate({ code: n.slice(0, 3).toUpperCase(), name: n } as any)}
            />
            <ListMgr
              title={rtl ? "الوحدات" : "Units"}
              items={units ?? []}
              placeholder="+"
              onAdd={(n) => addUnit.mutate({ name: n })}
            />
            <ListMgr
              title={rtl ? "المخازن / الفروع" : "Warehouses / branches"}
              items={warehouses ?? []}
              placeholder="+"
              onAdd={(n) => addWarehouse.mutate({ name: n, code: n.slice(0, 4) } as any)}
            />
            <ListMgr
              title={rtl ? "التصنيفات" : "Categories"}
              items={categories ?? []}
              placeholder="+"
              onAdd={(n) => addCategory.mutate({ name: n } as any)}
            />
          </div>
        </div>
      </WhiteDialog>
    </div>
  );
}
