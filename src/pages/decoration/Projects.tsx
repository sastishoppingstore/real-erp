import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Building2, MapPin, Calendar, Search, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, pct, StatusPill, SectionTitle, EmptyRow } from "./shared";

const STATUSES = ["tender", "awarded", "running", "on_hold", "completed", "handed_over", "dlp", "cancelled"] as const;

export default function DecorationProjects() {
  const { L } = useDeco();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data: projects = [], refetch } = trpc.decoration.projectList.useQuery(
    status ? { status } : undefined,
  );
  const create = trpc.decoration.projectCreate.useMutation({ onSuccess: () => { setOpen(false); refetch(); } });

  const [form, setForm] = useState({
    projectCode: "", nameEn: "", nameAr: "", city: "", contractNumber: "",
    contractValue: "0", budget: "0", startDate: "", endDate: "", description: "",
  });

  const filtered = projects.filter((p) =>
    !q || `${p.projectCode} ${p.nameEn} ${p.nameAr ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      projectCode: form.projectCode,
      nameEn: form.nameEn,
      nameAr: form.nameAr || undefined,
      city: form.city || undefined,
      contractNumber: form.contractNumber || undefined,
      contractValue: form.contractValue,
      budget: form.budget,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      description: form.description || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Decoration Projects", "مشاريع الديكور")}
        subtitle={L("Fit-out, false ceiling, wall sealing & interior decoration projects", "مشاريع التشطيبات والأسقف المستعارة وعزل الجدران والديكور الداخلي")}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="me-2 h-4 w-4" />{L("New project", "مشروع جديد")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{L("Create decoration project", "إنشاء مشروع ديكور")}</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><Label>{L("Project code", "رمز المشروع")}</Label><Input required value={form.projectCode} onChange={(e) => setForm({ ...form, projectCode: e.target.value })} /></div>
                  <div><Label>{L("Contract number", "رقم العقد")}</Label><Input value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} /></div>
                  <div><Label>{L("Name (EN)", "الاسم (إنجليزي)")}</Label><Input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></div>
                  <div><Label>{L("Name (AR)", "الاسم (عربي)")}</Label><Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
                  <div><Label>{L("City", "المدينة")}</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                  <div><Label>{L("Contract value (SAR)", "قيمة العقد (ريال)")}</Label><Input type="number" value={form.contractValue} onChange={(e) => setForm({ ...form, contractValue: e.target.value })} /></div>
                  <div><Label>{L("Start date", "تاريخ البدء")}</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div><Label>{L("End date", "تاريخ الانتهاء")}</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                </div>
                <div><Label>{L("Description", "الوصف")}</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={create.isPending}>
                  {create.isPending ? L("Saving…", "جارٍ الحفظ…") : L("Create project", "إنشاء المشروع")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input className="ps-9" placeholder={L("Search projects…", "بحث في المشاريع…")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{L("All statuses", "كل الحالات")}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <span className="text-sm text-slate-500">{filtered.length} {L("projects", "مشروع")}</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-start text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-start">{L("Code", "الرمز")}</th>
                  <th className="px-4 py-3 text-start">{L("Project", "المشروع")}</th>
                  <th className="px-4 py-3 text-start">{L("City", "المدينة")}</th>
                  <th className="px-4 py-3 text-start">{L("Contract value", "قيمة العقد")}</th>
                  <th className="px-4 py-3 text-start">{L("Progress", "التقدم")}</th>
                  <th className="px-4 py-3 text-start">{L("Status", "الحالة")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 && <EmptyRow colSpan={7} label={L("No projects yet — create your first one.", "لا توجد مشاريع بعد — أنشئ الأول.")} />}
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.projectCode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <Building2 className="h-4 w-4 text-emerald-600" />
                        {p.nameEn}
                      </div>
                      {p.nameAr ? <div className="text-xs text-slate-400" dir="rtl">{p.nameAr}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.city ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{money(p.contractValue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Number(p.progress ?? 0))}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{pct(p.progress)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-end">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/app/decoration/projects/${p.id}`)}>
                        {L("Open", "فتح")} <ArrowUpRight className="ms-1 h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <Calendar className="h-3.5 w-3.5" />
        {L("Dates are stored as Gregorian (YYYY-MM-DD); reports can print Hijri alongside.",
           "التواريخ ميلادية (YYYY-MM-DD)؛ ويمكن طباعة الهجري في التقارير.")}
      </p>
    </div>
  );
}