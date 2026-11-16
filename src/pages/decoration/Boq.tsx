import { useState } from "react";
import { Plus, ClipboardList, Calculator, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, num, StatusPill, SectionTitle, EmptyRow } from "./shared";

export default function DecorationBoq() {
  const { L } = useDeco();
  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const projectsQ = trpc.decoration.projectList.useQuery();
  const boqsQ = trpc.decoration.boqList.useQuery();
  const { data: lines = [], refetch: refetchLines } = trpc.decoration.boqLineList.useQuery(
    { boqId: selected! },
    { enabled: selected != null },
  );

  const boqCreate = trpc.decoration.boqCreate.useMutation({ onSuccess: () => { setOpen(false); boqsQ.refetch(); } });
  const lineCreate = trpc.decoration.boqLineCreate.useMutation({ onSuccess: () => refetchLines() });
  const lineDelete = trpc.decoration.boqLineDelete.useMutation({ onSuccess: () => refetchLines() });
  const recalc = trpc.decoration.boqRecalc.useMutation({ onSuccess: () => boqsQ.refetch() });

  const [bForm, setBForm] = useState({ projectId: "", titleEn: "", revision: "R0" });
  const [lForm, setLForm] = useState({
    descriptionEn: "", quantity: "1", uom: "m2",
    materialCost: "0", labourCost: "0", equipmentCost: "0",
    overheadPercent: "5", profitPercent: "10",
  });

  const projected = (() => {
    const cost = Number(lForm.materialCost) + Number(lForm.labourCost) + Number(lForm.equipmentCost);
    const oh = (Number(lForm.overheadPercent) / 100) * cost;
    const pf = (Number(lForm.profitPercent) / 100) * (cost + oh);
    return (cost + oh + pf) * Number(lForm.quantity || 0);
  })();

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("BOQ & Estimation", "الجدول التقديري والتسعير")}
        subtitle={L("Bill of quantities with material + labour + equipment cost breakdown", "جدول الكميات مع تفصيل المواد والعمالة والمعدات")}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="me-2 h-4 w-4" />{L("New BOQ", "جدول جديد")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{L("Create BOQ", "إنشاء جدول تقديري")}</DialogTitle></DialogHeader>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); boqCreate.mutate({ projectId: Number(bForm.projectId), titleEn: bForm.titleEn, revision: bForm.revision }); }}>
                <div><Label>{L("Project", "المشروع")}</Label>
                  <select required className="h-10 w-full rounded-md border px-3" value={bForm.projectId} onChange={(e) => setBForm({ ...bForm, projectId: e.target.value })}>
                    <option value="">—</option>
                    {(projectsQ.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.projectCode} · {p.nameEn}</option>)}
                  </select>
                </div>
                <div><Label>{L("Title", "العنوان")}</Label><Input value={bForm.titleEn} onChange={(e) => setBForm({ ...bForm, titleEn: e.target.value })} /></div>
                <div><Label>{L("Revision", "المراجعة")}</Label><Input value={bForm.revision} onChange={(e) => setBForm({ ...bForm, revision: e.target.value })} /></div>
                <Button type="submit" className="w-full">{L("Create", "إنشاء")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">{L("BOQs", "الجداول")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(boqsQ.data ?? []).length === 0 && <p className="text-sm text-slate-400">{L("No BOQs yet.", "لا جداول بعد.")}</p>}
            {(boqsQ.data ?? []).map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={`w-full rounded-lg border p-3 text-start transition ${selected === b.id ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{b.boqNo ?? `BOQ #${b.id}`}</span>
                  <StatusPill status={b.status} />
                </div>
                <div className="text-xs text-slate-500">{b.titleEn ?? "—"} · {b.revision}</div>
                <div className="mt-1 text-sm font-semibold text-emerald-700">{money(b.totalAmount)}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Lines", "البنود")}</CardTitle>
            {selected && (
              <Button size="sm" variant="outline" onClick={() => recalc.mutate({ boqId: selected })}>
                <Calculator className="me-1 h-4 w-4" />{L("Recalculate total", "إعادة الحساب")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!selected ? (
              <p className="py-8 text-center text-sm text-slate-400">{L("Select a BOQ to view its lines.", "اختر جدولاً لعرض بنوده.")}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-start">{L("Description", "الوصف")}</th>
                        <th className="px-3 py-2 text-start">{L("Qty", "الكمية")}</th>
                        <th className="px-3 py-2 text-start">{L("Unit rate", "سعر الوحدة")}</th>
                        <th className="px-3 py-2 text-start">{L("Amount", "المبلغ")}</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {lines.length === 0 && <EmptyRow colSpan={5} label={L("No lines yet.", "لا بنود بعد.")} />}
                      {lines.map((ln) => (
                        <tr key={ln.id}>
                          <td className="px-3 py-2 text-slate-700">{ln.descriptionEn}{ln.descriptionAr ? <div className="text-xs text-slate-400" dir="rtl">{ln.descriptionAr}</div> : null}</td>
                          <td className="px-3 py-2">{num(ln.quantity)} {ln.uom}</td>
                          <td className="px-3 py-2">{money(ln.unitRate)}</td>
                          <td className="px-3 py-2 font-medium">{money(ln.amount)}</td>
                          <td className="px-3 py-2 text-end">
                            <Button size="sm" variant="ghost" onClick={() => lineDelete.mutate({ id: ln.id })}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><ClipboardList className="h-4 w-4" />{L("Add line", "إضافة بند")}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Label>{L("Description", "الوصف")}</Label><Input value={lForm.descriptionEn} onChange={(e) => setLForm({ ...lForm, descriptionEn: e.target.value })} placeholder={L("False ceiling, gypsum board …", "سقف مستعار، جبس بورد…")} /></div>
                    <div><Label>{L("Quantity", "الكمية")}</Label><Input type="number" value={lForm.quantity} onChange={(e) => setLForm({ ...lForm, quantity: e.target.value })} /></div>
                    <div><Label>{L("Unit", "الوحدة")}</Label>
                      <select className="h-10 w-full rounded-md border px-3" value={lForm.uom} onChange={(e) => setLForm({ ...lForm, uom: e.target.value })}>
                        {["m2", "m", "pcs", "kg", "ls", "day"].map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div><Label>{L("Material cost / unit", "تكلفة المواد / وحدة")}</Label><Input type="number" value={lForm.materialCost} onChange={(e) => setLForm({ ...lForm, materialCost: e.target.value })} /></div>
                    <div><Label>{L("Labour cost / unit", "تكلفة العمالة / وحدة")}</Label><Input type="number" value={lForm.labourCost} onChange={(e) => setLForm({ ...lForm, labourCost: e.target.value })} /></div>
                    <div><Label>{L("Equipment cost / unit", "تكلفة المعدات / وحدة")}</Label><Input type="number" value={lForm.equipmentCost} onChange={(e) => setLForm({ ...lForm, equipmentCost: e.target.value })} /></div>
                    <div><Label>{L("Overhead %", "المصاريف الإدارية %")}</Label><Input type="number" value={lForm.overheadPercent} onChange={(e) => setLForm({ ...lForm, overheadPercent: e.target.value })} /></div>
                    <div><Label>{L("Profit %", "هامش الربح %")}</Label><Input type="number" value={lForm.profitPercent} onChange={(e) => setLForm({ ...lForm, profitPercent: e.target.value })} /></div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">{L("Computed line amount", "مبلغ البند المحسوب")}: <span className="font-semibold text-slate-800">{money(projected)}</span></p>
                    <Button
                      disabled={!lForm.descriptionEn || lineCreate.isPending}
                      onClick={() => lineCreate.mutate({
                        boqId: selected, descriptionEn: lForm.descriptionEn,
                        quantity: lForm.quantity, uom: lForm.uom,
                        materialCost: lForm.materialCost, labourCost: lForm.labourCost, equipmentCost: lForm.equipmentCost,
                        overheadPercent: lForm.overheadPercent, profitPercent: lForm.profitPercent,
                      })}
                    >
                      <Plus className="me-1 h-4 w-4" />{L("Add line", "إضافة بند")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}