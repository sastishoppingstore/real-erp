import { useMemo, useState } from "react";
import { Calculator, Plus, Ruler, DoorOpen, RefreshCw, Save, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, num, money, SectionTitle, EmptyRow, StatusPill } from "./shared";

const SURFACES = ["ceiling", "wall", "floor", "skirting", "cornice", "other"] as const;

export default function DecorationTakeoff() {
  const { L } = useDeco();
  const projectsQ = trpc.decoration.projectList.useQuery();
  const [projectId, setProjectId] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<number, { lengthM: string; widthM: string; heightM: string }>>({});
  const [busy, setBusy] = useState(false);

  const roomsQ = trpc.decoration.roomList.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId },
  );
  const openingsQ = trpc.decoration.roomOpeningList.useQuery(
    { roomId: selectedRoom! },
    { enabled: selectedRoom != null },
  );
  const finishesQ = trpc.decoration.roomFinishList.useQuery(
    { roomId: selectedRoom! },
    { enabled: selectedRoom != null },
  );

  const compute = trpc.decoration.roomComputeTakeoff.useMutation();
  const roomUpdate = trpc.decoration.roomUpdate.useMutation({ onSuccess: () => roomsQ.refetch() });
  const openingAdd = trpc.decoration.roomOpeningAdd.useMutation({
    onSuccess: () => { openingsQ.refetch(); if (selectedRoom) compute.mutate({ roomId: selectedRoom }); },
  });
  const finishUpsert = trpc.decoration.roomFinishUpsert.useMutation({ onSuccess: () => finishesQ.refetch() });

  const rooms = roomsQ.data ?? [];

  const totals = useMemo(() => {
    return rooms.reduce(
      (acc, r) => ({
        ceiling: acc.ceiling + Number(r.ceilingAreaM2 ?? 0),
        wall: acc.wall + Number(r.wallAreaM2 ?? 0),
        floor: acc.floor + Number(r.floorAreaM2 ?? 0),
        perimeter: acc.perimeter + Number(r.perimeterM ?? 0),
      }),
      { ceiling: 0, wall: 0, floor: 0, perimeter: 0 },
    );
  }, [rooms]);

  const [of, setOf] = useState({ kind: "door", widthM: "1", heightM: "2.1", count: "1" });
  const [ff, setFf] = useState({ surface: "ceiling", descriptionEn: "", quantity: "0", uom: "m2", rate: "0" });

  const dimsOf = (r: any) =>
    draft[r.id] ?? {
      lengthM: String(r.lengthM ?? ""),
      widthM: String(r.widthM ?? ""),
      heightM: String(r.heightM ?? ""),
    };

  const setDim = (id: number, key: "lengthM" | "widthM" | "heightM", value: string, room: any) => {
    setDraft((d) => ({ ...d, [id]: { ...dimsOf(room), ...(d[id] ?? {}), [key]: value } }));
  };

  const saveDims = async (room: any) => {
    const d = dimsOf(room);
    await roomUpdate.mutateAsync({
      id: room.id,
      lengthM: d.lengthM || "0",
      widthM: d.widthM || "0",
      heightM: d.heightM || "0",
    });
    await compute.mutateAsync({ roomId: room.id });
    setDraft((prev) => { const n = { ...prev }; delete n[room.id]; return n; });
  };

  const computeAll = async () => {
    setBusy(true);
    try {
      for (const r of rooms) {
        await compute.mutateAsync({ roomId: r.id });
      }
      await roomsQ.refetch();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Take-off & Areas", "الكميات والمساحات")}
        subtitle={L("Room-level measurement: ceiling, wall (net of openings), floor area and perimeter", "قياس الغرف: السقف، الجدار (بعد خصم الفتحات)، الأرضية والمحيط")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value); setSelectedRoom(null); setDraft({}); }}
            >
              <option value="">{L("Select project", "اختر المشروع")}</option>
              {(projectsQ.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.projectCode} · {p.nameEn}</option>)}
            </select>
            <Button size="sm" variant="outline" disabled={!projectId || rooms.length === 0 || busy} onClick={computeAll}>
              <RefreshCw className={`me-1 h-4 w-4 ${busy ? "animate-spin" : ""}`} />{L("Compute all", "حساب الكل")}
            </Button>
          </div>
        }
      />

      {!projectId ? (
        <Card><CardContent className="py-14 text-center text-sm text-slate-400">
          {L("Select a project to start the take-off.", "اختر مشروعاً لبدء الحصر.")}
        </CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: L("Ceiling area", "مساحة السقف"), value: `${num(totals.ceiling)} m²`, tone: "text-sky-700" },
              { label: L("Wall area (net)", "مساحة الجدار الصافية"), value: `${num(totals.wall)} m²`, tone: "text-emerald-700" },
              { label: L("Floor area", "مساحة الأرضية"), value: `${num(totals.floor)} m²`, tone: "text-violet-700" },
              { label: L("Perimeter", "المحيط"), value: `${num(totals.perimeter)} m`, tone: "text-amber-700" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">{k.label}</p>
                <p className={`mt-1 text-xl font-bold ${k.tone}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Ruler className="h-4 w-4" />{L("Rooms", "الغرف")}</CardTitle>
              <span className="text-xs text-slate-400">{rooms.length} {L("rooms", "غرفة")}</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-3 text-start">{L("Room", "الغرفة")}</th>
                      <th className="px-3 py-3 text-start">L (m)</th>
                      <th className="px-3 py-3 text-start">W (m)</th>
                      <th className="px-3 py-3 text-start">H (m)</th>
                      <th className="px-3 py-3 text-start">{L("Ceiling", "السقف")}</th>
                      <th className="px-3 py-3 text-start">{L("Wall", "الجدار")}</th>
                      <th className="px-3 py-3 text-start">{L("Floor", "الأرضية")}</th>
                      <th className="px-3 py-3 text-start">{L("Status", "الحالة")}</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rooms.length === 0 && <EmptyRow colSpan={9} label={L("No rooms yet — add rooms from the project page.", "لا غرف بعد — أضف الغرف من صفحة المشروع.")} />}
                    {rooms.map((r) => {
                      const d = dimsOf(r);
                      const dirty = !!draft[r.id];
                      return (
                        <tr key={r.id} className={`hover:bg-slate-50 ${selectedRoom === r.id ? "bg-emerald-50/50" : ""}`}>
                          <td className="px-3 py-2">
                            <button className="text-start" onClick={() => setSelectedRoom(r.id === selectedRoom ? null : r.id)}>
                              <div className="font-medium text-slate-800">{r.nameEn}</div>
                              <div className="text-xs text-slate-400">{String(r.roomType ?? "").replace(/_/g, " ")}</div>
                            </button>
                          </td>
                          {(["lengthM", "widthM", "heightM"] as const).map((k) => (
                            <td key={k} className="px-2 py-2">
                              <Input
                                className="h-8 w-20"
                                type="number"
                                step="0.01"
                                value={d[k]}
                                onChange={(e) => setDim(r.id, k, e.target.value, r)}
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2">{num(r.ceilingAreaM2)}</td>
                          <td className="px-3 py-2">{num(r.wallAreaM2)}</td>
                          <td className="px-3 py-2">{num(r.floorAreaM2)}</td>
                          <td className="px-3 py-2"><StatusPill status={r.status} /></td>
                          <td className="px-3 py-2 text-end">
                            <Button size="sm" variant={dirty ? "default" : "outline"} onClick={() => saveDims(r)} disabled={roomUpdate.isPending || compute.isPending}>
                              {dirty ? <Save className="me-1 h-3.5 w-3.5" /> : <Calculator className="me-1 h-3.5 w-3.5" />}
                              {dirty ? L("Save & compute", "حفظ وحساب") : L("Recompute", "إعادة حساب")}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {selectedRoom != null && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><DoorOpen className="h-4 w-4" />{L("Openings (deductions)", "الفتحات (الخصومات)")}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add", "إضافة")}</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{L("Add door / window", "إضافة باب / نافذة")}</DialogTitle></DialogHeader>
                      <form className="space-y-3" onSubmit={(e) => {
                        e.preventDefault();
                        openingAdd.mutate({
                          roomId: selectedRoom, kind: of.kind as any,
                          widthM: of.widthM, heightM: of.heightM, count: Number(of.count || 1),
                        });
                      }}>
                        <div><Label>{L("Kind", "النوع")}</Label>
                          <select className="h-10 w-full rounded-md border px-3" value={of.kind} onChange={(e) => setOf({ ...of, kind: e.target.value })}>
                            {["door", "window", "opening", "other"].map((k) => <option key={k}>{k}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div><Label>{L("Width", "العرض")}</Label><Input type="number" step="0.01" value={of.widthM} onChange={(e) => setOf({ ...of, widthM: e.target.value })} /></div>
                          <div><Label>{L("Height", "الارتفاع")}</Label><Input type="number" step="0.01" value={of.heightM} onChange={(e) => setOf({ ...of, heightM: e.target.value })} /></div>
                          <div><Label>{L("Count", "العدد")}</Label><Input type="number" value={of.count} onChange={(e) => setOf({ ...of, count: e.target.value })} /></div>
                        </div>
                        <Button type="submit" className="w-full">{L("Add opening", "إضافة فتحة")}</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-2 text-start">{L("Kind", "النوع")}</th>
                        <th className="px-4 py-2 text-start">W × H</th>
                        <th className="px-4 py-2 text-start">{L("Count", "العدد")}</th>
                        <th className="px-4 py-2 text-start">m²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(openingsQ.data ?? []).length === 0 && <EmptyRow colSpan={4} label={L("No openings — wall area uses gross perimeter.", "لا فتحات — يُحسب الجدار بالمحيط الكامل.")} />}
                      {(openingsQ.data ?? []).map((o) => (
                        <tr key={o.id}>
                          <td className="px-4 py-2">{o.kind}</td>
                          <td className="px-4 py-2">{num(o.widthM)} × {num(o.heightM)}</td>
                          <td className="px-4 py-2">{o.count}</td>
                          <td className="px-4 py-2">{num(o.areaM2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" />{L("Finish lines", "بنود التشطيب")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-start">{L("Surface", "السطح")}</th>
                          <th className="px-3 py-2 text-start">{L("Qty", "الكمية")}</th>
                          <th className="px-3 py-2 text-start">{L("Rate", "السعر")}</th>
                          <th className="px-3 py-2 text-start">{L("Amount", "المبلغ")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(finishesQ.data ?? []).length === 0 && <EmptyRow colSpan={4} label={L("No finish lines yet.", "لا بنود تشطيب بعد.")} />}
                        {(finishesQ.data ?? []).map((x) => (
                          <tr key={x.id}>
                            <td className="px-3 py-2">{x.surface}</td>
                            <td className="px-3 py-2">{num(x.quantity)} {x.uom}</td>
                            <td className="px-3 py-2">{money(x.rate)}</td>
                            <td className="px-3 py-2 font-medium">{money(x.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>{L("Surface", "السطح")}</Label>
                        <select className="h-9 w-full rounded-md border px-2 text-sm" value={ff.surface} onChange={(e) => setFf({ ...ff, surface: e.target.value })}>
                          {SURFACES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div><Label>{L("Qty (m²)", "الكمية")}</Label><Input className="h-9" type="number" value={ff.quantity} onChange={(e) => setFf({ ...ff, quantity: e.target.value })} /></div>
                      <div><Label>{L("Rate (SAR)", "السعر")}</Label><Input className="h-9" type="number" value={ff.rate} onChange={(e) => setFf({ ...ff, rate: e.target.value })} /></div>
                      <div><Label>{L("Description", "الوصف")}</Label><Input className="h-9" value={ff.descriptionEn} onChange={(e) => setFf({ ...ff, descriptionEn: e.target.value })} /></div>
                    </div>
                    <Button
                      className="mt-3 w-full" size="sm"
                      disabled={finishUpsert.isPending}
                      onClick={() => finishUpsert.mutate({
                        roomId: selectedRoom, surface: ff.surface as any,
                        descriptionEn: ff.descriptionEn || undefined,
                        quantity: ff.quantity, uom: ff.uom, rate: ff.rate,
                      })}
                    >
                      <Plus className="me-1 h-4 w-4" />{L("Add finish line", "إضافة بند تشطيب")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}