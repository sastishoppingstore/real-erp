import { useState } from "react";
import { Plus, Users, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, StatusPill, SectionTitle, EmptyRow } from "./shared";

const CATEGORIES = ["carpenter", "gypsum_installer", "painter", "helper", "foreman", "supervisor", "electrician", "sealer", "tiler", "other"] as const;

export default function DecorationLabour() {
  const { L } = useDeco();
  const [tab, setTab] = useState<"labour" | "attendance">("labour");
  const [projectId, setProjectId] = useState("");

  const projectsQ = trpc.decoration.projectList.useQuery();
  const labourQ = trpc.decoration.labourList.useQuery();
  const { data: attendance = [], refetch: refetchAtt } = trpc.decoration.attendanceList.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId },
  );

  const labourCreate = trpc.decoration.labourCreate.useMutation({ onSuccess: () => labourQ.refetch() });
  const attCreate = trpc.decoration.attendanceUpsert.useMutation({ onSuccess: () => refetchAtt() });

  const [lf, setLf] = useState({ nameEn: "", iqamaNumber: "", nationality: "", profession: "", labourCategory: "gypsum_installer", dailyRate: "150" });
  const [af, setAf] = useState({ labourId: "", attendanceDate: "", status: "present", overtimeHours: "0" });

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Labour & Manpower", "العمالة والقوى العاملة")}
        subtitle={L("Workers, Iqama/document expiry, daily attendance, timesheets & productivity", "العمال، انتهاء الإقامة، الحضور اليومي، الجداول والإنتاجية")}
      />

      <div className="flex gap-2">
        {[{ k: "labour", en: "Workers", ar: "العمال", i: Users }, { k: "attendance", en: "Attendance", ar: "الحضور", i: CalendarCheck }].map((t) => {
          const Icon = t.i;
          return (
            <button key={t.k} onClick={() => setTab(t.k as any)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${tab === t.k ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              <Icon className="h-4 w-4" />{L(t.en, t.ar)}
            </button>
          );
        })}
      </div>

      {tab === "labour" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Workers", "العمال")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("Add worker", "إضافة عامل")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("Add worker", "إضافة عامل")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); labourCreate.mutate({ nameEn: lf.nameEn, iqamaNumber: lf.iqamaNumber || undefined, nationality: lf.nationality || undefined, profession: lf.profession || undefined, labourCategory: lf.labourCategory as any, dailyRate: lf.dailyRate }); }}>
                  <div><Label>{L("Name", "الاسم")}</Label><Input required value={lf.nameEn} onChange={(e) => setLf({ ...lf, nameEn: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Iqama no.", "رقم الإقامة")}</Label><Input value={lf.iqamaNumber} onChange={(e) => setLf({ ...lf, iqamaNumber: e.target.value })} /></div>
                    <div><Label>{L("Nationality", "الجنسية")}</Label><Input value={lf.nationality} onChange={(e) => setLf({ ...lf, nationality: e.target.value })} /></div>
                  </div>
                  <div><Label>{L("Profession", "المهنة")}</Label><Input value={lf.profession} onChange={(e) => setLf({ ...lf, profession: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Category", "التصنيف")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={lf.labourCategory} onChange={(e) => setLf({ ...lf, labourCategory: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Daily rate (SAR)", "الأجر اليومي")}</Label><Input type="number" value={lf.dailyRate} onChange={(e) => setLf({ ...lf, dailyRate: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Add", "إضافة")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-start">{L("Name", "الاسم")}</th>
                    <th className="px-4 py-3 text-start">{L("Category", "التصنيف")}</th>
                    <th className="px-4 py-3 text-start">{L("Iqama", "الإقامة")}</th>
                    <th className="px-4 py-3 text-start">{L("Daily rate", "الأجر اليومي")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(labourQ.data ?? []).length === 0 && <EmptyRow colSpan={4} label={L("No workers yet.", "لا عمال بعد.")} />}
                  {(labourQ.data ?? []).map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{w.nameEn}<div className="text-xs text-slate-400">{w.nationality ?? ""}</div></td>
                      <td className="px-4 py-3">{String(w.labourCategory).replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 font-mono text-xs">{w.iqamaNumber ?? "—"}</td>
                      <td className="px-4 py-3">{money(w.dailyRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "attendance" && (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">{L("Daily attendance", "الحضور اليومي")}</CardTitle>
            <div className="flex items-center gap-2">
              <select className="h-10 rounded-md border px-3 text-sm" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">{L("Select project", "اختر المشروع")}</option>
                {(projectsQ.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
              </select>
              <Dialog><DialogTrigger asChild><Button size="sm" disabled={!projectId}><Plus className="me-1 h-4 w-4" />{L("Mark", "تسجيل")}</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>{L("Mark attendance", "تسجيل حضور")}</DialogTitle></DialogHeader>
                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); attCreate.mutate({ projectId: Number(projectId), labourId: Number(af.labourId), attendanceDate: af.attendanceDate, status: af.status as any, overtimeHours: af.overtimeHours }); }}>
                    <div><Label>{L("Worker", "العامل")}</Label>
                      <select required className="h-10 w-full rounded-md border px-3" value={af.labourId} onChange={(e) => setAf({ ...af, labourId: e.target.value })}>
                        <option value="">—</option>{(labourQ.data ?? []).map((w) => <option key={w.id} value={w.id}>{w.nameEn}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Date", "التاريخ")}</Label><Input type="date" required value={af.attendanceDate} onChange={(e) => setAf({ ...af, attendanceDate: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>{L("Status", "الحالة")}</Label>
                        <select className="h-10 w-full rounded-md border px-3" value={af.status} onChange={(e) => setAf({ ...af, status: e.target.value })}>
                          {["present", "absent", "leave", "holiday", "sick"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div><Label>{L("Overtime hrs", "ساعات إضافية")}</Label><Input type="number" value={af.overtimeHours} onChange={(e) => setAf({ ...af, overtimeHours: e.target.value })} /></div>
                    </div>
                    <Button type="submit" className="w-full">{L("Save", "حفظ")}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-start">{L("Date", "التاريخ")}</th>
                    <th className="px-4 py-3 text-start">{L("Status", "الحالة")}</th>
                    <th className="px-4 py-3 text-start">{L("Normal hrs", "ساعات")}</th>
                    <th className="px-4 py-3 text-start">{L("Overtime", "إضافي")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {!projectId && <EmptyRow colSpan={4} label={L("Select a project to view attendance.", "اختر مشروعاً لعرض الحضور.")} />}
                  {projectId && attendance.length === 0 && <EmptyRow colSpan={4} label={L("No attendance recorded.", "لا حضور مسجل.")} />}
                  {attendance.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3">{a.attendanceDate}</td>
                      <td className="px-4 py-3"><StatusPill status={a.status} /></td>
                      <td className="px-4 py-3">{a.normalHours}</td>
                      <td className="px-4 py-3">{a.overtimeHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}