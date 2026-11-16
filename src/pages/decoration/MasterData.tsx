import { useState } from "react";
import { Plus, Users2, Truck, Package, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, SectionTitle, EmptyRow } from "./shared";

type Tab = "client" | "supplier" | "subcontractor" | "material" | "work";

export default function DecorationMasterData() {
  const { L } = useDeco();
  const [tab, setTab] = useState<Tab>("client");

  const clientsQ = trpc.decoration.clientList.useQuery();
  const suppliersQ = trpc.decoration.supplierList.useQuery();
  const subsQ = trpc.decoration.subcontractorList.useQuery();
  const matsQ = trpc.decoration.materialList.useQuery();
  const workQ = trpc.decoration.workLibraryList.useQuery();

  const clientCreate = trpc.decoration.clientCreate.useMutation({ onSuccess: () => clientsQ.refetch() });
  const supplierCreate = trpc.decoration.supplierCreate.useMutation({ onSuccess: () => suppliersQ.refetch() });
  const subCreate = trpc.decoration.subcontractorCreate.useMutation({ onSuccess: () => subsQ.refetch() });
  const matCreate = trpc.decoration.materialCreate.useMutation({ onSuccess: () => matsQ.refetch() });
  const workCreate = trpc.decoration.workLibraryCreate.useMutation({ onSuccess: () => workQ.refetch() });

  const [client, setClient] = useState({ nameEn: "", nameAr: "", crNumber: "", vatNumber: "", phone: "", email: "", creditLimit: "0" });
  const [supplier, setSupplier] = useState({ nameEn: "", nameAr: "", crNumber: "", vatNumber: "", iban: "", phone: "" });
  const [sub, setSub] = useState({ nameEn: "", nameAr: "", trade: "", crNumber: "", iban: "", phone: "" });
  const [mat, setMat] = useState({ code: "", nameEn: "", nameAr: "", uom: "pcs", minStockLevel: "0", reorderLevel: "0", lastCost: "0" });
  const [work, setWork] = useState({ code: "", nameEn: "", nameAr: "", category: "false_ceiling", uom: "m2", materialCost: "0", labourCost: "0", equipmentCost: "0", overheadPercent: "5", profitPercent: "10" });

  const tabs = [
    { k: "client", en: "Clients", ar: "العملاء", i: Users2 },
    { k: "supplier", en: "Suppliers", ar: "الموردون", i: Truck },
    { k: "subcontractor", en: "Subcontractors", ar: "المقاولون", i: Users2 },
    { k: "material", en: "Materials", ar: "المواد", i: Package },
    { k: "work", en: "Work library", ar: "مكتبة الأعمال", i: ClipboardList },
  ] as const;

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Master Data", "البيانات الأساسية")}
        subtitle={L("Clients, suppliers, subcontractors, materials and the BOQ work-item library", "العملاء والموردون والمقاولون والمواد ومكتبة بنود الأعمال")}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.i;
          return (
            <button key={t.k} onClick={() => setTab(t.k as Tab)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${tab === t.k ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              <Icon className="h-4 w-4" />{L(t.en, t.ar)}
            </button>
          );
        })}
      </div>

      {tab === "client" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Clients / owners", "العملاء / المالكون")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add client", "إضافة عميل")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add client", "إضافة عميل")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); clientCreate.mutate({ nameEn: client.nameEn, nameAr: client.nameAr || undefined, crNumber: client.crNumber || undefined, vatNumber: client.vatNumber || undefined, phone: client.phone || undefined, email: client.email || undefined, creditLimit: client.creditLimit }); }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Name (EN)", "الاسم إنجليزي")}</Label><Input required value={client.nameEn} onChange={(e) => setClient({ ...client, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Name (AR)", "الاسم عربي")}</Label><Input value={client.nameAr} onChange={(e) => setClient({ ...client, nameAr: e.target.value })} /></div>
                    <div><Label>{L("CR number", "السجل التجاري")}</Label><Input value={client.crNumber} onChange={(e) => setClient({ ...client, crNumber: e.target.value })} /></div>
                    <div><Label>{L("VAT number", "الرقم الضريبي")}</Label><Input value={client.vatNumber} onChange={(e) => setClient({ ...client, vatNumber: e.target.value })} /></div>
                    <div><Label>{L("Phone", "الهاتف")}</Label><Input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} /></div>
                    <div><Label>{L("Email", "البريد")}</Label><Input value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} /></div>
                  </div>
                  <div><Label>{L("Credit limit (SAR)", "حد الائتمان")}</Label><Input type="number" value={client.creditLimit} onChange={(e) => setClient({ ...client, creditLimit: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table head={[L("Name", "الاسم"), L("CR", "السجل"), L("VAT", "الضريبي"), L("Phone", "الهاتف"), L("Credit limit", "حد الائتمان")]}
              rows={(clientsQ.data ?? []).map((c) => [<b key={c.id}>{c.nameEn}</b>, c.crNumber ?? "—", c.vatNumber ?? "—", c.phone ?? "—", money(c.creditLimit)])}
              empty={L("No clients yet.", "لا عملاء بعد.")} />
          </CardContent>
        </Card>
      )}

      {tab === "supplier" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Suppliers", "الموردون")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add supplier", "إضافة مورد")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add supplier", "إضافة مورد")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); supplierCreate.mutate({ nameEn: supplier.nameEn, nameAr: supplier.nameAr || undefined, crNumber: supplier.crNumber || undefined, vatNumber: supplier.vatNumber || undefined, iban: supplier.iban || undefined, phone: supplier.phone || undefined }); }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Name (EN)", "الاسم إنجليزي")}</Label><Input required value={supplier.nameEn} onChange={(e) => setSupplier({ ...supplier, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Name (AR)", "الاسم عربي")}</Label><Input value={supplier.nameAr} onChange={(e) => setSupplier({ ...supplier, nameAr: e.target.value })} /></div>
                    <div><Label>{L("CR number", "السجل التجاري")}</Label><Input value={supplier.crNumber} onChange={(e) => setSupplier({ ...supplier, crNumber: e.target.value })} /></div>
                    <div><Label>{L("VAT number", "الرقم الضريبي")}</Label><Input value={supplier.vatNumber} onChange={(e) => setSupplier({ ...supplier, vatNumber: e.target.value })} /></div>
                    <div><Label>IBAN</Label><Input value={supplier.iban} onChange={(e) => setSupplier({ ...supplier, iban: e.target.value })} /></div>
                    <div><Label>{L("Phone", "الهاتف")}</Label><Input value={supplier.phone} onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table head={[L("Name", "الاسم"), "CR", "VAT", "IBAN", L("Phone", "الهاتف")]}
              rows={(suppliersQ.data ?? []).map((s) => [<b key={s.id}>{s.nameEn}</b>, s.crNumber ?? "—", s.vatNumber ?? "—", s.iban ?? "—", s.phone ?? "—"])}
              empty={L("No suppliers yet.", "لا موردون بعد.")} />
          </CardContent>
        </Card>
      )}

      {tab === "subcontractor" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Subcontractors", "المقاولون الفرعيون")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add", "إضافة")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add subcontractor", "إضافة مقاول")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); subCreate.mutate({ nameEn: sub.nameEn, nameAr: sub.nameAr || undefined, trade: sub.trade || undefined, crNumber: sub.crNumber || undefined, iban: sub.iban || undefined, phone: sub.phone || undefined }); }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Name (EN)", "الاسم إنجليزي")}</Label><Input required value={sub.nameEn} onChange={(e) => setSub({ ...sub, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Name (AR)", "الاسم عربي")}</Label><Input value={sub.nameAr} onChange={(e) => setSub({ ...sub, nameAr: e.target.value })} /></div>
                    <div><Label>{L("Trade", "التخصص")}</Label><Input value={sub.trade} onChange={(e) => setSub({ ...sub, trade: e.target.value })} /></div>
                    <div><Label>{L("CR number", "السجل التجاري")}</Label><Input value={sub.crNumber} onChange={(e) => setSub({ ...sub, crNumber: e.target.value })} /></div>
                    <div><Label>IBAN</Label><Input value={sub.iban} onChange={(e) => setSub({ ...sub, iban: e.target.value })} /></div>
                    <div><Label>{L("Phone", "الهاتف")}</Label><Input value={sub.phone} onChange={(e) => setSub({ ...sub, phone: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table head={[L("Name", "الاسم"), L("Trade", "التخصص"), "CR", "IBAN", L("Phone", "الهاتف")]}
              rows={(subsQ.data ?? []).map((s) => [<b key={s.id}>{s.nameEn}</b>, s.trade ?? "—", s.crNumber ?? "—", s.iban ?? "—", s.phone ?? "—"])}
              empty={L("No subcontractors yet.", "لا مقاولون بعد.")} />
          </CardContent>
        </Card>
      )}

      {tab === "material" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Materials", "المواد")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add material", "إضافة مادة")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add material", "إضافة مادة")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); matCreate.mutate({ code: mat.code, nameEn: mat.nameEn, nameAr: mat.nameAr || undefined, uom: mat.uom, minStockLevel: mat.minStockLevel, reorderLevel: mat.reorderLevel, lastCost: mat.lastCost }); }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Code", "الرمز")}</Label><Input required value={mat.code} onChange={(e) => setMat({ ...mat, code: e.target.value })} /></div>
                    <div><Label>{L("Unit", "الوحدة")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={mat.uom} onChange={(e) => setMat({ ...mat, uom: e.target.value })}>
                        {["pcs", "m2", "m", "kg", "roll", "box", "ltr"].map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Name (EN)", "الاسم إنجليزي")}</Label><Input required value={mat.nameEn} onChange={(e) => setMat({ ...mat, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Name (AR)", "الاسم عربي")}</Label><Input value={mat.nameAr} onChange={(e) => setMat({ ...mat, nameAr: e.target.value })} /></div>
                    <div><Label>{L("Min stock", "الحد الأدنى")}</Label><Input type="number" value={mat.minStockLevel} onChange={(e) => setMat({ ...mat, minStockLevel: e.target.value })} /></div>
                    <div><Label>{L("Last cost", "آخر تكلفة")}</Label><Input type="number" value={mat.lastCost} onChange={(e) => setMat({ ...mat, lastCost: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table head={[L("Code", "الرمز"), L("Name", "الاسم"), L("Unit", "الوحدة"), L("Min stock", "الحد الأدنى"), L("Last cost", "آخر تكلفة")]}
              rows={(matsQ.data ?? []).map((m) => [<span key={m.id} className="font-mono text-xs">{m.code}</span>, m.nameEn, m.uom, m.minStockLevel, money(m.lastCost)])}
              empty={L("No materials yet.", "لا مواد بعد.")} />
          </CardContent>
        </Card>
      )}

      {tab === "work" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Work-item library", "مكتبة بنود الأعمال")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add work item", "إضافة بند")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add work item", "إضافة بند عمل")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); workCreate.mutate({ code: work.code, nameEn: work.nameEn, nameAr: work.nameAr || undefined, category: work.category as any, uom: work.uom, materialCost: work.materialCost, labourCost: work.labourCost, equipmentCost: work.equipmentCost, overheadPercent: work.overheadPercent, profitPercent: work.profitPercent }); }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Code", "الرمز")}</Label><Input required value={work.code} onChange={(e) => setWork({ ...work, code: e.target.value })} /></div>
                    <div><Label>{L("Category", "التصنيف")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={work.category} onChange={(e) => setWork({ ...work, category: e.target.value })}>
                        {["false_ceiling", "partition", "wall_sealing", "waterproofing", "painting", "cornice", "flooring", "wallpaper", "joinery", "glazing", "lighting", "electrical", "hvac", "demolition", "other"].map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Name (EN)", "الاسم إنجليزي")}</Label><Input required value={work.nameEn} onChange={(e) => setWork({ ...work, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Unit", "الوحدة")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={work.uom} onChange={(e) => setWork({ ...work, uom: e.target.value })}>
                        {["m2", "m", "pcs", "ls"].map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Material / unit", "المواد / وحدة")}</Label><Input type="number" value={work.materialCost} onChange={(e) => setWork({ ...work, materialCost: e.target.value })} /></div>
                    <div><Label>{L("Labour / unit", "العمالة / وحدة")}</Label><Input type="number" value={work.labourCost} onChange={(e) => setWork({ ...work, labourCost: e.target.value })} /></div>
                    <div><Label>{L("Overhead %", "إداري %")}</Label><Input type="number" value={work.overheadPercent} onChange={(e) => setWork({ ...work, overheadPercent: e.target.value })} /></div>
                    <div><Label>{L("Profit %", "ربح %")}</Label><Input type="number" value={work.profitPercent} onChange={(e) => setWork({ ...work, profitPercent: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table head={[L("Code", "الرمز"), L("Description", "الوصف"), L("Category", "التصنيف"), L("Unit", "الوحدة"), L("Unit rate", "سعر الوحدة")]}
              rows={(workQ.data ?? []).map((w) => [<span key={w.id} className="font-mono text-xs">{w.code}</span>, w.nameEn, String(w.category).replace(/_/g, " "), w.uom, money(w.unitRate)])}
              empty={L("No work items yet.", "لا بنود بعد.")} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: any[][]; empty: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{head.map((h, i) => <th key={i} className="px-4 py-3 text-start">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 ? <EmptyRow colSpan={head.length} label={empty} /> : rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50">{r.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}