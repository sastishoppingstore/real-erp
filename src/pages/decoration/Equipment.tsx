import { useState } from "react";
import { Plus, Wrench, Truck, CalendarClock, Fuel, FileText, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, num, StatusPill, SectionTitle, EmptyRow } from "./shared";

type Tab = "register" | "allocation" | "maintenance" | "fuel" | "docs";

const KINDS = ["tool", "machine", "vehicle", "scaffolding", "lift", "other"] as const;

export default function DecorationEquipment() {
  const { L } = useDeco();
  const [tab, setTab] = useState<Tab>("register");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const equipmentQ = trpc.decoration.equipmentList.useQuery();
  const allocQ = trpc.decoration.equipmentAllocationList.useQuery(undefined);
  const maintQ = trpc.decoration.equipmentMaintenanceList.useQuery(undefined);
  const fuelQ = trpc.decoration.fuelLogList.useQuery(undefined);
  const docsQ = trpc.decoration.vehicleDocList.useQuery(undefined);

  const eqCreate = trpc.decoration.equipmentCreate.useMutation({ onSuccess: () => equipmentQ.refetch() });
  const allocCreate = trpc.decoration.equipmentAllocationCreate.useMutation({ onSuccess: () => allocQ.refetch() });
  const maintCreate = trpc.decoration.equipmentMaintenanceCreate.useMutation({ onSuccess: () => maintQ.refetch() });
  const fuelCreate = trpc.decoration.fuelLogCreate.useMutation({ onSuccess: () => fuelQ.refetch() });
  const docCreate = trpc.decoration.vehicleDocCreate.useMutation({ onSuccess: () => docsQ.refetch() });

  const equipment = equipmentQ.data ?? [];
  const projects = projectsQ.data ?? [];

  const [ef, setEf] = useState({ code: "", nameEn: "", kind: "machine", ownership: "owned", plateNumber: "", dailyRate: "0" });
  const [af, setAf] = useState({ equipmentId: "", projectId: "", startDate: "", endDate: "", billingRate: "0" });
  const [mf, setMf] = useState({ equipmentId: "", maintenanceDate: "", maintenanceType: "preventive", description: "", cost: "0", nextDueDate: "" });
  const [flf, setFlf] = useState({ equipmentId: "", projectId: "", fuelDate: "", litres: "0", ratePerLitre: "0" });
  const [df, setDf] = useState({ equipmentId: "", docType: "istimara", docNumber: "", expiryDate: "" });

  const tabs = [
    { k: "register", en: "Register", ar: "السجل", i: Wrench },
    { k: "allocation", en: "Allocations", ar: "التخصيص", i: Truck },
    { k: "maintenance", en: "Maintenance", ar: "الصيانة", i: CalendarClock },
    { k: "fuel", en: "Fuel", ar: "الوقود", i: Fuel },
    { k: "docs", en: "Documents", ar: "المستندات", i: FileText },
  ] as const;

  const eqName = (id: number) => equipment.find((e) => e.id === id)?.nameEn ?? `#${id}`;
  const projName = (id: number | null) => projects.find((p) => p.id === id)?.projectCode ?? "—";

  const dueSoon = (d: string | null) => {
    if (!d) return false;
    const diff = (new Date(d).getTime() - Date.now()) / 86400000;
    return diff <= 30;
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Equipment, Tools & Fleet", "المعدات والأدوات والأسطول")}
        subtitle={L("Register, site allocation, preventive maintenance, fuel cost and Istimara/insurance expiry", "السجل، التخصيص للموقع، الصيانة الوقائية، تكلفة الوقود، وانتهاء الاستمارة والتأمين")}
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

      {tab === "register" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Equipment register", "سجل المعدات")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add equipment", "إضافة معدة")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add equipment", "إضافة معدة")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  eqCreate.mutate({
                    code: ef.code, nameEn: ef.nameEn, kind: ef.kind as any, ownership: ef.ownership as any,
                    plateNumber: ef.plateNumber || undefined, dailyRate: ef.dailyRate,
                  });
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Code", "الرمز")}</Label><Input required value={ef.code} onChange={(e) => setEf({ ...ef, code: e.target.value })} /></div>
                    <div><Label>{L("Name", "الاسم")}</Label><Input required value={ef.nameEn} onChange={(e) => setEf({ ...ef, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Kind", "النوع")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={ef.kind} onChange={(e) => setEf({ ...ef, kind: e.target.value })}>
                        {KINDS.map((k) => <option key={k}>{k}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Ownership", "الملكية")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={ef.ownership} onChange={(e) => setEf({ ...ef, ownership: e.target.value })}>
                        {["owned", "rented"].map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Plate no.", "رقم اللوحة")}</Label><Input value={ef.plateNumber} onChange={(e) => setEf({ ...ef, plateNumber: e.target.value })} /></div>
                    <div><Label>{L("Daily rate (SAR)", "الأجر اليومي")}</Label><Input type="number" value={ef.dailyRate} onChange={(e) => setEf({ ...ef, dailyRate: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("Code", "الرمز"), L("Name", "الاسم"), L("Kind", "النوع"), L("Ownership", "الملكية"), L("Plate", "اللوحة"), L("Daily rate", "الأجر اليومي")]}
              rows={equipment.map((e) => [
                <span key={e.id} className="font-mono text-xs">{e.code}</span>,
                <b key={`n${e.id}`}>{e.nameEn}</b>,
                String(e.kind ?? "—"),
                <StatusPill key={`o${e.id}`} status={e.ownership} />,
                e.plateNumber ?? "—",
                money(e.dailyRate),
              ])}
              empty={L("No equipment yet.", "لا معدات بعد.")}
            />
          </CardContent>
        </Card>
      )}

      {tab === "allocation" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Site allocations", "التخصيص للمواقع")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm" disabled={equipment.length === 0}><Plus className="me-1 h-4 w-4" />{L("Allocate", "تخصيص")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Allocate equipment", "تخصيص معدة")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  allocCreate.mutate({
                    equipmentId: Number(af.equipmentId),
                    projectId: af.projectId ? Number(af.projectId) : undefined,
                    startDate: af.startDate || undefined, endDate: af.endDate || undefined,
                    billingRate: af.billingRate,
                  });
                }}>
                  <div><Label>{L("Equipment", "المعدة")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={af.equipmentId} onChange={(e) => setAf({ ...af, equipmentId: e.target.value })}>
                      <option value="">—</option>{equipment.map((x) => <option key={x.id} value={x.id}>{x.code} · {x.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Project", "المشروع")}</Label>
                    <select className="h-10 w-full rounded-md border px-3" value={af.projectId} onChange={(e) => setAf({ ...af, projectId: e.target.value })}>
                      <option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("From", "من")}</Label><Input type="date" value={af.startDate} onChange={(e) => setAf({ ...af, startDate: e.target.value })} /></div>
                    <div><Label>{L("To", "إلى")}</Label><Input type="date" value={af.endDate} onChange={(e) => setAf({ ...af, endDate: e.target.value })} /></div>
                  </div>
                  <div><Label>{L("Billing rate (SAR/day)", "سعر الاحتساب")}</Label><Input type="number" value={af.billingRate} onChange={(e) => setAf({ ...af, billingRate: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Allocate", "تخصيص")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("Equipment", "المعدة"), L("Project", "المشروع"), L("From", "من"), L("To", "إلى"), L("Rate", "السعر"), L("Status", "الحالة")]}
              rows={(allocQ.data ?? []).map((a) => [
                eqName(a.equipmentId), projName(a.projectId), a.startDate ?? "—", a.endDate ?? "—",
                money(a.billingRate), <StatusPill key={a.id} status={a.status} />,
              ])}
              empty={L("No allocations yet.", "لا تخصيصات بعد.")}
            />
          </CardContent>
        </Card>
      )}

      {tab === "maintenance" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Maintenance log", "سجل الصيانة")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm" disabled={equipment.length === 0}><Plus className="me-1 h-4 w-4" />{L("Log maintenance", "تسجيل صيانة")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Log maintenance", "تسجيل صيانة")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  maintCreate.mutate({
                    equipmentId: Number(mf.equipmentId), maintenanceDate: mf.maintenanceDate,
                    maintenanceType: mf.maintenanceType as any, description: mf.description || undefined,
                    cost: mf.cost, nextDueDate: mf.nextDueDate || undefined,
                  });
                }}>
                  <div><Label>{L("Equipment", "المعدة")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={mf.equipmentId} onChange={(e) => setMf({ ...mf, equipmentId: e.target.value })}>
                      <option value="">—</option>{equipment.map((x) => <option key={x.id} value={x.id}>{x.code} · {x.nameEn}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Date", "التاريخ")}</Label><Input type="date" required value={mf.maintenanceDate} onChange={(e) => setMf({ ...mf, maintenanceDate: e.target.value })} /></div>
                    <div><Label>{L("Type", "النوع")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={mf.maintenanceType} onChange={(e) => setMf({ ...mf, maintenanceType: e.target.value })}>
                        {["preventive", "corrective", "inspection"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><Label>{L("Description", "الوصف")}</Label><Input value={mf.description} onChange={(e) => setMf({ ...mf, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Cost (SAR)", "التكلفة")}</Label><Input type="number" value={mf.cost} onChange={(e) => setMf({ ...mf, cost: e.target.value })} /></div>
                    <div><Label>{L("Next due", "الاستحقاق التالي")}</Label><Input type="date" value={mf.nextDueDate} onChange={(e) => setMf({ ...mf, nextDueDate: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Save", "حفظ")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("Equipment", "المعدة"), L("Date", "التاريخ"), L("Type", "النوع"), L("Cost", "التكلفة"), L("Next due", "الاستحقاق")]}
              rows={(maintQ.data ?? []).map((m) => [
                eqName(m.equipmentId), m.maintenanceDate, String(m.maintenanceType ?? "—"), money(m.cost),
                <span key={m.id} className={dueSoon(m.nextDueDate) ? "font-semibold text-amber-700" : ""}>
                  {m.nextDueDate ?? "—"}{dueSoon(m.nextDueDate) ? ` · ${L("due soon", "قريب")}` : ""}
                </span>,
              ])}
              empty={L("No maintenance records.", "لا سجلات صيانة.")}
            />
          </CardContent>
        </Card>
      )}

      {tab === "fuel" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Fuel log", "سجل الوقود")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm" disabled={equipment.length === 0}><Plus className="me-1 h-4 w-4" />{L("Add fuel", "تسجيل وقود")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add fuel entry", "تسجيل وقود")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  fuelCreate.mutate({
                    equipmentId: Number(flf.equipmentId), projectId: flf.projectId ? Number(flf.projectId) : undefined,
                    fuelDate: flf.fuelDate, litres: flf.litres, ratePerLitre: flf.ratePerLitre,
                  });
                }}>
                  <div><Label>{L("Equipment", "المعدة")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={flf.equipmentId} onChange={(e) => setFlf({ ...flf, equipmentId: e.target.value })}>
                      <option value="">—</option>{equipment.map((x) => <option key={x.id} value={x.id}>{x.code} · {x.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Project", "المشروع")}</Label>
                    <select className="h-10 w-full rounded-md border px-3" value={flf.projectId} onChange={(e) => setFlf({ ...flf, projectId: e.target.value })}>
                      <option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>{L("Date", "التاريخ")}</Label><Input type="date" required value={flf.fuelDate} onChange={(e) => setFlf({ ...flf, fuelDate: e.target.value })} /></div>
                    <div><Label>{L("Litres", "لتر")}</Label><Input type="number" value={flf.litres} onChange={(e) => setFlf({ ...flf, litres: e.target.value })} /></div>
                    <div><Label>{L("Rate", "السعر")}</Label><Input type="number" value={flf.ratePerLitre} onChange={(e) => setFlf({ ...flf, ratePerLitre: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Save", "حفظ")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("Equipment", "المعدة"), L("Project", "المشروع"), L("Date", "التاريخ"), L("Litres", "لتر"), L("Amount", "المبلغ")]}
              rows={(fuelQ.data ?? []).map((f) => [
                eqName(f.equipmentId), projName(f.projectId), f.fuelDate, num(f.litres), money(f.amount),
              ])}
              empty={L("No fuel entries.", "لا سجلات وقود.")}
            />
          </CardContent>
        </Card>
      )}

      {tab === "docs" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Vehicle & tool documents", "مستندات المركبات والمعدات")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm" disabled={equipment.length === 0}><Plus className="me-1 h-4 w-4" />{L("Add document", "إضافة مستند")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add document", "إضافة مستند")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  docCreate.mutate({
                    equipmentId: Number(df.equipmentId), docType: df.docType as any,
                    docNumber: df.docNumber || undefined, expiryDate: df.expiryDate,
                  });
                }}>
                  <div><Label>{L("Equipment", "المعدة")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={df.equipmentId} onChange={(e) => setDf({ ...df, equipmentId: e.target.value })}>
                      <option value="">—</option>{equipment.map((x) => <option key={x.id} value={x.id}>{x.code} · {x.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Document type", "نوع المستند")}</Label>
                    <select className="h-10 w-full rounded-md border px-3" value={df.docType} onChange={(e) => setDf({ ...df, docType: e.target.value })}>
                      {["istimara", "insurance", "fahas", "other"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Doc number", "رقم المستند")}</Label><Input value={df.docNumber} onChange={(e) => setDf({ ...df, docNumber: e.target.value })} /></div>
                    <div><Label>{L("Expiry date", "تاريخ الانتهاء")}</Label><Input type="date" required value={df.expiryDate} onChange={(e) => setDf({ ...df, expiryDate: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Save", "حفظ")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("Equipment", "المعدة"), L("Type", "النوع"), L("Doc no.", "الرقم"), L("Expiry", "الانتهاء"), L("Alert", "التنبيه")]}
              rows={(docsQ.data ?? []).map((d) => [
                eqName(d.equipmentId), String(d.docType), d.docNumber ?? "—",
                d.expiryDate,
                dueSoon(d.expiryDate)
                  ? <span key={d.id} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700"><PackageCheck className="h-3 w-3" />{L("expiring", "قارب الانتهاء")}</span>
                  : <span key={d.id} className="text-xs text-slate-400">{L("valid", "ساري")}</span>,
              ])}
              empty={L("No documents yet.", "لا مستندات بعد.")}
            />
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