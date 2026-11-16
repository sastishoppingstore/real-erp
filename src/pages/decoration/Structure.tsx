import { useMemo, useState } from "react";
import { Plus, Building2, Layers, DoorOpen, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, num, StatusPill, SectionTitle, EmptyRow } from "./shared";

const UNIT_TYPES = ["apartment", "villa", "office", "showroom", "retail", "hotel_room", "restaurant", "mosque", "common", "other"] as const;

export default function DecorationStructure() {
  const { L } = useDeco();
  const projectsQ = trpc.decoration.projectList.useQuery();
  const [projectId, setProjectId] = useState("");

  const treeQ = trpc.decoration.projectTree.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId },
  );

  const buildingCreate = trpc.decoration.buildingCreate.useMutation({ onSuccess: () => treeQ.refetch() });
  const floorCreate = trpc.decoration.floorCreate.useMutation({ onSuccess: () => treeQ.refetch() });
  const unitCreate = trpc.decoration.unitCreate.useMutation({ onSuccess: () => treeQ.refetch() });

  const buildings = treeQ.data?.buildings ?? [];
  const floors = useMemo(() => buildings.flatMap((b) => (b.floors ?? []).map((f) => ({ ...f, buildingName: b.nameEn }))), [buildings]);
  const units = useMemo(
    () => buildings.flatMap((b) => (b.floors ?? []).flatMap((f) => (f.units ?? []).map((u) => ({ ...u, buildingName: b.nameEn, floorName: f.nameEn })))),
    [buildings],
  );

  const roomCount = useMemo(() => units.reduce((s, u) => s + (u.rooms ?? []).length, 0), [units]);

  const [b, setB] = useState({ nameEn: "", nameAr: "", levels: "" });
  const [f, setF] = useState({ buildingId: "", nameEn: "", nameAr: "" });
  const [u, setU] = useState({ floorId: "", nameEn: "", nameAr: "", unitType: "apartment", areaM2: "" });

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Site & Room Structure", "هيكل الموقع والغرف")}
        subtitle={L("Buildings → floors → units → rooms for every decoration project", "المباني ← الطوابق ← الوحدات ← الغرف لكل مشروع ديكور")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">{L("Select project", "اختر المشروع")}</option>
              {(projectsQ.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.projectCode} · {p.nameEn}</option>
              ))}
            </select>
          </div>
        }
      />

      {!projectId ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-slate-400">
            {L("Select a project to manage its buildings, floors and units.", "اختر مشروعاً لإدارة مبانيه وطوابقه ووحداته.")}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: L("Buildings", "المباني"), value: buildings.length },
              { label: L("Floors", "الطوابق"), value: floors.length },
              { label: L("Units", "الوحدات"), value: units.length },
              { label: L("Rooms", "الغرف"), value: roomCount },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">{k.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{num(k.value)}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Building2 className="me-1 h-4 w-4" />{L("Building", "مبنى")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{L("Add building / tower", "إضافة مبنى / برج")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  buildingCreate.mutate({
                    projectId: Number(projectId),
                    nameEn: b.nameEn,
                    nameAr: b.nameAr || undefined,
                    levels: b.levels ? Number(b.levels) : undefined,
                  });
                  setB({ nameEn: "", nameAr: "", levels: "" });
                }}>
                  <div><Label>{L("Name (EN)", "الاسم إنجليزي")}</Label><Input required value={b.nameEn} onChange={(e) => setB({ ...b, nameEn: e.target.value })} /></div>
                  <div><Label>{L("Name (AR)", "الاسم عربي")}</Label><Input value={b.nameAr} onChange={(e) => setB({ ...b, nameAr: e.target.value })} /></div>
                  <div><Label>{L("Levels", "عدد الطوابق")}</Label><Input type="number" value={b.levels} onChange={(e) => setB({ ...b, levels: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={buildings.length === 0}><Layers className="me-1 h-4 w-4" />{L("Floor", "طابق")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{L("Add floor", "إضافة طابق")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  const bld = buildings.find((x) => String(x.id) === f.buildingId);
                  if (!bld) return;
                  floorCreate.mutate({ projectId: Number(projectId), buildingId: bld.id, nameEn: f.nameEn, nameAr: f.nameAr || undefined });
                  setF({ buildingId: "", nameEn: "", nameAr: "" });
                }}>
                  <div><Label>{L("Building", "المبنى")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={f.buildingId} onChange={(e) => setF({ ...f, buildingId: e.target.value })}>
                      <option value="">—</option>{buildings.map((x) => <option key={x.id} value={x.id}>{x.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Floor name", "اسم الطابق")}</Label><Input required value={f.nameEn} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /></div>
                  <div><Label>{L("Name (AR)", "الاسم عربي")}</Label><Input value={f.nameAr} onChange={(e) => setF({ ...f, nameAr: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" disabled={floors.length === 0}><DoorOpen className="me-1 h-4 w-4" />{L("Unit", "وحدة")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{L("Add unit / apartment", "إضافة وحدة / شقة")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => {
                  e.preventDefault();
                  const fl = floors.find((x) => String(x.id) === u.floorId);
                  if (!fl) return;
                  unitCreate.mutate({
                    projectId: Number(projectId), buildingId: fl.buildingId, floorId: fl.id,
                    nameEn: u.nameEn, nameAr: u.nameAr || undefined,
                    unitType: u.unitType as any, areaM2: u.areaM2 || undefined,
                  });
                  setU({ floorId: "", nameEn: "", nameAr: "", unitType: "apartment", areaM2: "" });
                }}>
                  <div><Label>{L("Floor", "الطابق")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={u.floorId} onChange={(e) => setU({ ...u, floorId: e.target.value })}>
                      <option value="">—</option>{floors.map((x) => <option key={x.id} value={x.id}>{x.buildingName} · {x.nameEn}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Unit name", "اسم الوحدة")}</Label><Input required value={u.nameEn} onChange={(e) => setU({ ...u, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Area m²", "المساحة م²")}</Label><Input type="number" step="0.01" value={u.areaM2} onChange={(e) => setU({ ...u, areaM2: e.target.value })} /></div>
                  </div>
                  <div><Label>{L("Type", "النوع")}</Label>
                    <select className="h-10 w-full rounded-md border px-3" value={u.unitType} onChange={(e) => setU({ ...u, unitType: e.target.value })}>
                      {UNIT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">{L("Structure tree", "شجرة الهيكل")}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {buildings.length === 0 && <p className="text-slate-400">{L("No buildings yet.", "لا مباني بعد.")}</p>}
                {buildings.map((bld) => (
                  <div key={bld.id}>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Building2 className="h-4 w-4 text-emerald-600" />{bld.nameEn}
                      <span className="text-xs font-normal text-slate-400">({(bld.floors ?? []).length} {L("floors", "طابق")})</span>
                    </div>
                    <div className="ms-5 mt-1 space-y-1 border-s ps-3">
                      {(bld.floors ?? []).map((fl) => (
                        <div key={fl.id}>
                          <div className="flex items-center gap-1.5 text-slate-600"><Layers className="h-3.5 w-3.5" />{fl.nameEn}</div>
                          <div className="ms-4 space-y-0.5">
                            {(fl.units ?? []).map((un) => (
                              <div key={un.id} className="text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Home className="h-3 w-3" />{un.nameEn}
                                  <span className="text-xs text-slate-400">({(un.rooms ?? []).length})</span>
                                </span>
                              </div>
                            ))}
                            {(fl.units ?? []).length === 0 && <p className="text-xs text-slate-300">{L("no units", "لا وحدات")}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="text-base">{L("Units", "الوحدات")}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-start">{L("Unit", "الوحدة")}</th>
                        <th className="px-4 py-3 text-start">{L("Building / floor", "المبنى / الطابق")}</th>
                        <th className="px-4 py-3 text-start">{L("Type", "النوع")}</th>
                        <th className="px-4 py-3 text-start">{L("Area m²", "المساحة")}</th>
                        <th className="px-4 py-3 text-start">{L("Rooms", "الغرف")}</th>
                        <th className="px-4 py-3 text-start">{L("Status", "الحالة")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {units.length === 0 && <EmptyRow colSpan={6} label={L("No units yet.", "لا وحدات بعد.")} />}
                      {units.map((un) => (
                        <tr key={un.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{un.nameEn}</td>
                          <td className="px-4 py-3 text-slate-600">
                            <span className="inline-flex items-center gap-1 text-xs"><Building2 className="h-3 w-3" />{un.buildingName}
                              <ChevronRight className="h-3 w-3" />{un.floorName}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{String(un.unitType ?? "—").replace(/_/g, " ")}</td>
                          <td className="px-4 py-3">{num(un.areaM2)}</td>
                          <td className="px-4 py-3">{(un.rooms ?? []).length}</td>
                          <td className="px-4 py-3"><StatusPill status={un.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}