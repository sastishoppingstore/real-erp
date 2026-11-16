import { useState } from "react";
import { Plus, HardHat, FileSignature, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, StatusPill, SectionTitle, EmptyRow } from "./shared";

export default function DecorationSubcontracts() {
  const { L } = useDeco();
  const [tab, setTab] = useState<"sub" | "ipc">("sub");
  const projectsQ = trpc.decoration.projectList.useQuery();
  const subsQ = trpc.decoration.subcontractorList.useQuery();
  const subcontractsQ = trpc.decoration.subcontractList.useQuery();
  const ipcQ = trpc.decoration.ipcList.useQuery();

  const subCreate = trpc.decoration.subcontractCreate.useMutation({ onSuccess: () => subcontractsQ.refetch() });
  const ipcCreate = trpc.decoration.ipcCreate.useMutation({ onSuccess: () => ipcQ.refetch() });

  const projects = projectsQ.data ?? [];
  const [sf, setSf] = useState({ projectId: "", subcontractorId: "", scopeEn: "", contractValue: "0", retentionPercent: "10", startDate: "", endDate: "" });
  const [inf, setInf] = useState({ projectId: "", subcontractId: "", periodFrom: "", periodTo: "", workDoneValue: "0", retentionAmount: "0", advanceRecovery: "0" });

  const net = Number(inf.workDoneValue) - Number(inf.retentionAmount) - Number(inf.advanceRecovery);

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Subcontractors", "المقاولون الفرعيون")}
        subtitle={L("Subcontract agreements, work orders, interim payment certificates (IPC), retention & back-charges", "عقود المقاولين، أوامر العمل، المستخلصات، المحتجزات والخصومات")}
      />

      <div className="flex gap-2">
        {[{ k: "sub", en: "Agreements", ar: "العقود", i: FileSignature }, { k: "ipc", en: "Payment certificates", ar: "المستخلصات", i: ReceiptText }].map((t) => {
          const Icon = t.i;
          return (
            <button key={t.k} onClick={() => setTab(t.k as any)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${tab === t.k ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              <Icon className="h-4 w-4" />{L(t.en, t.ar)}
            </button>
          );
        })}
      </div>

      {tab === "sub" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Subcontract agreements", "عقود المقاولين")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("New agreement", "عقد جديد")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("New subcontract", "عقد مقاول جديد")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); subCreate.mutate({ projectId: Number(sf.projectId), subcontractorId: Number(sf.subcontractorId), scopeEn: sf.scopeEn || undefined, contractValue: sf.contractValue, retentionPercent: sf.retentionPercent, startDate: sf.startDate || undefined, endDate: sf.endDate || undefined }); }}>
                  <div><Label>{L("Project", "المشروع")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={sf.projectId} onChange={(e) => setSf({ ...sf, projectId: e.target.value })}>
                      <option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Subcontractor", "المقاول")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={sf.subcontractorId} onChange={(e) => setSf({ ...sf, subcontractorId: e.target.value })}>
                      <option value="">—</option>{(subsQ.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Scope", "النطاق")}</Label><Textarea rows={2} value={sf.scopeEn} onChange={(e) => setSf({ ...sf, scopeEn: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Value (SAR)", "القيمة")}</Label><Input type="number" value={sf.contractValue} onChange={(e) => setSf({ ...sf, contractValue: e.target.value })} /></div>
                    <div><Label>{L("Retention %", "المحتجز %")}</Label><Input type="number" value={sf.retentionPercent} onChange={(e) => setSf({ ...sf, retentionPercent: e.target.value })} /></div>
                    <div><Label>{L("Start", "البدء")}</Label><Input type="date" value={sf.startDate} onChange={(e) => setSf({ ...sf, startDate: e.target.value })} /></div>
                    <div><Label>{L("End", "الانتهاء")}</Label><Input type="date" value={sf.endDate} onChange={(e) => setSf({ ...sf, endDate: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Create", "إنشاء")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-start">{L("No", "الرقم")}</th>
                    <th className="px-4 py-3 text-start">{L("Scope", "النطاق")}</th>
                    <th className="px-4 py-3 text-start">{L("Value", "القيمة")}</th>
                    <th className="px-4 py-3 text-start">{L("Retention %", "المحتجز")}</th>
                    <th className="px-4 py-3 text-start">{L("Status", "الحالة")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(subcontractsQ.data ?? []).length === 0 && <EmptyRow colSpan={5} label={L("No agreements yet.", "لا عقود بعد.")} />}
                  {(subcontractsQ.data ?? []).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{s.subcontractNo ?? `#${s.id}`}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-600">{s.scopeEn ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{money(s.contractValue)}</td>
                      <td className="px-4 py-3">{s.retentionPercent}%</td>
                      <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "ipc" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Interim payment certificates", "المستخلصات المؤقتة")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("New IPC", "مستخلص جديد")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("New IPC", "مستخلص جديد")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); ipcCreate.mutate({ projectId: Number(inf.projectId), subcontractId: Number(inf.subcontractId), periodFrom: inf.periodFrom || undefined, periodTo: inf.periodTo || undefined, workDoneValue: inf.workDoneValue, retentionAmount: inf.retentionAmount, advanceRecovery: inf.advanceRecovery, netPayable: String(net) }); }}>
                  <div><Label>{L("Project", "المشروع")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={inf.projectId} onChange={(e) => setInf({ ...inf, projectId: e.target.value })}>
                      <option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Subcontract", "العقد")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={inf.subcontractId} onChange={(e) => setInf({ ...inf, subcontractId: e.target.value })}>
                      <option value="">—</option>{(subcontractsQ.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.subcontractNo ?? `#${s.id}`}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("From", "من")}</Label><Input type="date" value={inf.periodFrom} onChange={(e) => setInf({ ...inf, periodFrom: e.target.value })} /></div>
                    <div><Label>{L("To", "إلى")}</Label><Input type="date" value={inf.periodTo} onChange={(e) => setInf({ ...inf, periodTo: e.target.value })} /></div>
                    <div><Label>{L("Work done", "العمل المنفذ")}</Label><Input type="number" value={inf.workDoneValue} onChange={(e) => setInf({ ...inf, workDoneValue: e.target.value })} /></div>
                    <div><Label>{L("Retention", "المحتجز")}</Label><Input type="number" value={inf.retentionAmount} onChange={(e) => setInf({ ...inf, retentionAmount: e.target.value })} /></div>
                    <div><Label>{L("Advance recovery", "استرداد المقدمة")}</Label><Input type="number" value={inf.advanceRecovery} onChange={(e) => setInf({ ...inf, advanceRecovery: e.target.value })} /></div>
                    <div><Label>{L("Net payable", "الصافي")}</Label><Input readOnly value={net} /></div>
                  </div>
                  <Button type="submit" className="w-full">{L("Create IPC", "إنشاء المستخلص")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-start">{L("IPC No", "رقم المستخلص")}</th>
                    <th className="px-4 py-3 text-start">{L("Work done", "العمل المنفذ")}</th>
                    <th className="px-4 py-3 text-start">{L("Retention", "المحتجز")}</th>
                    <th className="px-4 py-3 text-start">{L("Net payable", "الصافي")}</th>
                    <th className="px-4 py-3 text-start">{L("Status", "الحالة")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(ipcQ.data ?? []).length === 0 && <EmptyRow colSpan={5} label={L("No certificates yet.", "لا مستخلصات بعد.")} />}
                  {(ipcQ.data ?? []).map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{i.ipcNo ?? `#${i.id}`}</td>
                      <td className="px-4 py-3">{money(i.workDoneValue)}</td>
                      <td className="px-4 py-3 text-amber-700">{money(i.retentionAmount)}</td>
                      <td className="px-4 py-3 font-medium text-emerald-700">{money(i.netPayable)}</td>
                      <td className="px-4 py-3"><StatusPill status={i.status} /></td>
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