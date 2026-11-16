import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Plus, Building2, Layers, DoorOpen, Ruler, Calculator, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, pct, num, StatusPill, SectionTitle } from "./shared";

const ROOM_TYPES = ["room", "hall", "majlis", "corridor", "toilet", "kitchen", "bathroom", "bedroom", "living", "dining", "office", "lobby", "staircase", "balcony", "other"] as const;

export default function ProjectDetail() {
  const { L } = useDeco();
  const navigate = useNavigate();
  const params = useParams();
  const projectId = Number(params.id);

  const { data, refetch } = trpc.decoration.projectGet.useQuery({ id: projectId });
  const { data: tree, refetch: refetchTree } = trpc.decoration.projectTree.useQuery({ projectId });
  const roomsQ = trpc.decoration.roomList.useQuery({ projectId });

  const buildingCreate = trpc.decoration.buildingCreate.useMutation({ onSuccess: () => { refetchTree(); refetch(); } });
  const floorCreate = trpc.decoration.floorCreate.useMutation({ onSuccess: () => { refetchTree(); refetch(); } });
  const unitCreate = trpc.decoration.unitCreate.useMutation({ onSuccess: () => { refetchTree(); refetch(); } });
  const roomCreate = trpc.decoration.roomCreate.useMutation({ onSuccess: () => { roomsQ.refetch(); refetchTree(); } });
  const takeoff = trpc.decoration.roomComputeTakeoff.useMutation({ onSuccess: () => roomsQ.refetch() });

  const project = data?.project;
  const buildings = tree?.buildings ?? [];
  const flats = useMemo(() => buildings.flatMap((b) => (b.floors ?? []).map((f) => ({ ...f, buildingName: b.nameEn }))), [buildings]);
  const units = useMemo(() => buildings.flatMap((b) => (b.floors ?? []).flatMap((f) => (f.units ?? []).map((u) => ({ ...u, floorName: f.nameEn })))), [buildings]);

  const [bForm, setBForm] = useState({ nameEn: "", levels: "" });
  const [fForm, setFForm] = useState({ buildingId: "", nameEn: "" });
  const [uForm, setUForm] = useState({ floorId: "", nameEn: "", unitType: "apartment" });
  const [rForm, setRForm] = useState({
    unitId: "", nameEn: "", roomType: "room",
    lengthM: "", widthM: "", heightM: "",
  });

  const addRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find((u) => String(u.id) === rForm.unitId);
    roomCreate.mutate({
      projectId,
      unitId: unit?.id,
      floorId: unit?.floorId,
      buildingId: unit?.buildingId ?? undefined,
      nameEn: rForm.nameEn,
      roomType: rForm.roomType as any,
      lengthM: rForm.lengthM, widthM: rForm.widthM, heightM: rForm.heightM,
    });
  };

  if (!project) {
    return <div className="p-8 text-slate-500">{L("Loading project…", "جارٍ تحميل المشروع…")}</div>;
  }

  const rooms = roomsQ.data ?? [];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/app/decoration/projects")} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {L("All projects", "كل المشاريع")}
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-slate-400">{project.projectCode} {project.contractNumber ? `· ${project.contractNumber}` : ""}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{project.nameEn}</h1>
            {project.nameAr ? <p className="text-slate-500" dir="rtl">{project.nameAr}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <StatusPill status={project.status} />
              <span>{money(project.contractValue)}</span>
              <span>{pct(project.progress)} {L("complete", "مكتمل")}</span>
              <span>{rooms.length} {L("rooms", "غرفة")}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog><DialogTrigger asChild><Button variant="outline" size="sm"><Building2 className="me-1 h-4 w-4" />{L("Building", "مبنى")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add building / tower", "إضافة مبنى / برج")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); buildingCreate.mutate({ projectId, nameEn: bForm.nameEn, levels: bForm.levels ? Number(bForm.levels) : undefined }); }}>
                  <div><Label>{L("Name", "الاسم")}</Label><Input required value={bForm.nameEn} onChange={(e) => setBForm({ ...bForm, nameEn: e.target.value })} /></div>
                  <div><Label>{L("Levels", "عدد الطوابق")}</Label><Input type="number" value={bForm.levels} onChange={(e) => setBForm({ ...bForm, levels: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog><DialogTrigger asChild><Button variant="outline" size="sm"><Layers className="me-1 h-4 w-4" />{L("Floor", "طابق")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add floor", "إضافة طابق")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const b = buildings.find((x) => String(x.id) === fForm.buildingId); if (!b) return; floorCreate.mutate({ projectId, buildingId: b.id, nameEn: fForm.nameEn }); }}>
                  <div><Label>{L("Building", "المبنى")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={fForm.buildingId} onChange={(e) => setFForm({ ...fForm, buildingId: e.target.value })}>
                      <option value="">—</option>{buildings.map((b) => <option key={b.id} value={b.id}>{b.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Floor name", "اسم الطابق")}</Label><Input required value={fForm.nameEn} onChange={(e) => setFForm({ ...fForm, nameEn: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog><DialogTrigger asChild><Button variant="outline" size="sm"><DoorOpen className="me-1 h-4 w-4" />{L("Unit", "وحدة")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add unit / apartment", "إضافة وحدة / شقة")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const f = flats.find((x) => String(x.id) === uForm.floorId); if (!f) return; unitCreate.mutate({ projectId, buildingId: f.buildingId, floorId: f.id, nameEn: uForm.nameEn, unitType: uForm.unitType as any }); }}>
                  <div><Label>{L("Floor", "الطابق")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={uForm.floorId} onChange={(e) => setUForm({ ...uForm, floorId: e.target.value })}>
                      <option value="">—</option>{flats.map((f) => <option key={f.id} value={f.id}>{f.buildingName} · {f.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Unit name", "اسم الوحدة")}</Label><Input required value={uForm.nameEn} onChange={(e) => setUForm({ ...uForm, nameEn: e.target.value })} /></div>
                  <div><Label>{L("Type", "النوع")}</Label>
                    <select className="h-10 w-full rounded-md border px-3" value={uForm.unitType} onChange={(e) => setUForm({ ...uForm, unitType: e.target.value })}>
                      {["apartment", "villa", "office", "showroom", "retail", "hotel_room", "restaurant", "mosque", "common", "other"].map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Room", "غرفة")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add room", "إضافة غرفة")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={addRoom}>
                  <div><Label>{L("Unit", "الوحدة")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={rForm.unitId} onChange={(e) => setRForm({ ...rForm, unitId: e.target.value })}>
                      <option value="">—</option>{units.map((u) => <option key={u.id} value={u.id}>{u.nameEn} · {u.floorName}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Room name", "اسم الغرفة")}</Label><Input required value={rForm.nameEn} onChange={(e) => setRForm({ ...rForm, nameEn: e.target.value })} /></div>
                    <div><Label>{L("Type", "النوع")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={rForm.roomType} onChange={(e) => setRForm({ ...rForm, roomType: e.target.value })}>
                        {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>{L("Length (m)", "الطول (م)")}</Label><Input type="number" step="0.01" value={rForm.lengthM} onChange={(e) => setRForm({ ...rForm, lengthM: e.target.value })} /></div>
                    <div><Label>{L("Width (m)", "العرض (م)")}</Label><Input type="number" step="0.01" value={rForm.widthM} onChange={(e) => setRForm({ ...rForm, widthM: e.target.value })} /></div>
                    <div><Label>{L("Height (m)", "الارتفاع (م)")}</Label><Input type="number" step="0.01" value={rForm.heightM} onChange={(e) => setRForm({ ...rForm, heightM: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Add room", "إضافة الغرفة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Structure tree */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">{L("Site structure", "هيكل الموقع")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {buildings.length === 0 && <p className="text-slate-400">{L("No buildings yet.", "لا مباني بعد.")}</p>}
            {buildings.map((b) => (
              <div key={b.id}>
                <div className="flex items-center gap-2 font-semibold text-slate-800"><Building2 className="h-4 w-4 text-emerald-600" />{b.nameEn}</div>
                <div className="ms-5 mt-1 space-y-1 border-s ps-3">
                  {(b.floors ?? []).map((f) => (
                    <div key={f.id}>
                      <div className="flex items-center gap-2 text-slate-600"><Layers className="h-3.5 w-3.5" />{f.nameEn}</div>
                      <div className="ms-4 space-y-0.5">
                        {(f.units ?? []).map((u) => (
                          <div key={u.id} className="text-slate-500">
                            <span className="inline-flex items-center gap-1"><Home className="h-3 w-3" />{u.nameEn}
                              <span className="text-xs text-slate-400">({(u.rooms ?? []).length})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rooms table */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{L("Rooms & take-off", "الغرف والحصر")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-start">{L("Room", "الغرفة")}</th>
                    <th className="px-3 py-2 text-start">L×W×H</th>
                    <th className="px-3 py-2 text-start">{L("Ceiling m²", "سقف م²")}</th>
                    <th className="px-3 py-2 text-start">{L("Wall m²", "جدار م²")}</th>
                    <th className="px-3 py-2 text-start">{L("Floor m²", "أرضية م²")}</th>
                    <th className="px-3 py-2 text-start">{L("Take-off", "حصر")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rooms.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-400">{L("No rooms yet.", "لا غرف بعد.")}</td></tr>
                  )}
                  {rooms.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-800">{r.nameEn}</div>
                        <div className="text-xs text-slate-400">{r.roomType}</div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-500">{num(r.lengthM)}×{num(r.widthM)}×{num(r.heightM)}</td>
                      <td className="px-3 py-2">{num(r.ceilingAreaM2)}</td>
                      <td className="px-3 py-2">{num(r.wallAreaM2)}</td>
                      <td className="px-3 py-2">{num(r.floorAreaM2)}</td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" disabled={takeoff.isPending} onClick={() => takeoff.mutate({ roomId: r.id })}>
                          <Calculator className="me-1 h-3.5 w-3.5" />{L("Compute", "حساب")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <Ruler className="h-3.5 w-3.5" />
        {L("Take-off recalculates ceiling, wall (minus door/window openings), floor area and perimeter automatically.",
           "الحصر يعيد حساب السقف والجدار (مع خصم الأبواب والنوافذ) والأرضية والمحيط تلقائياً.")}
      </p>
    </div>
  );
}