import { useState } from "react";
import { Plus, ShoppingCart, Truck, FileInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, StatusPill, SectionTitle, EmptyRow } from "./shared";

type Tab = "mr" | "po" | "grn";

export default function DecorationProcurement() {
  const { L } = useDeco();
  const [tab, setTab] = useState<Tab>("mr");
  const projectsQ = trpc.decoration.projectList.useQuery();
  const suppliersQ = trpc.decoration.supplierList.useQuery();
  const mrQ = trpc.decoration.materialRequestList.useQuery();
  const poQ = trpc.decoration.purchaseOrderList.useQuery();
  const grnQ = trpc.decoration.grnList.useQuery();

  const mrCreate = trpc.decoration.materialRequestCreate.useMutation({ onSuccess: () => mrQ.refetch() });
  const poCreate = trpc.decoration.purchaseOrderCreate.useMutation({ onSuccess: () => poQ.refetch() });
  const grnCreate = trpc.decoration.grnCreate.useMutation({ onSuccess: () => grnQ.refetch() });

  const projects = projectsQ.data ?? [];
  const [mr, setMr] = useState({ projectId: "", requestDate: "", requiredDate: "" });
  const [po, setPo] = useState({ projectId: "", supplierId: "", orderDate: "", expectedDate: "", subtotal: "0" });
  const [grn, setGrn] = useState({ projectId: "", poId: "", receiptDate: "" });

  const tabs: { key: Tab; en: string; ar: string; icon: any }[] = [
    { key: "mr", en: "Material Requests", ar: "طلبات المواد", icon: FileInput },
    { key: "po", en: "Purchase Orders", ar: "أوامر الشراء", icon: ShoppingCart },
    { key: "grn", en: "Goods Receipts", ar: "إيصالات الاستلام", icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        title={L("Procurement & Inventory", "المشتريات والمخزون")}
        subtitle={L("Material request → RFQ → PO → GRN, with project & site stores", "طلب مواد ← عروض ← أمر شراء ← استلام، مع مخازن المشروع")}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${tab === t.key ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <Icon className="h-4 w-4" />{L(t.en, t.ar)}
            </button>
          );
        })}
      </div>

      {tab === "mr" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Material Requests", "طلبات المواد")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("New request", "طلب جديد")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("New material request", "طلب مواد جديد")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); mrCreate.mutate({ projectId: Number(mr.projectId), requestDate: mr.requestDate, requiredDate: mr.requiredDate || undefined }); }}>
                  <div><Label>{L("Project", "المشروع")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={mr.projectId} onChange={(e) => setMr({ ...mr, projectId: e.target.value })}>
                      <option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} · {p.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Request date", "تاريخ الطلب")}</Label><Input type="date" required value={mr.requestDate} onChange={(e) => setMr({ ...mr, requestDate: e.target.value })} /></div>
                  <div><Label>{L("Required by", "مطلوب قبل")}</Label><Input type="date" value={mr.requiredDate} onChange={(e) => setMr({ ...mr, requiredDate: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Create", "إنشاء")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("MR No", "رقم الطلب"), L("Request date", "تاريخ الطلب"), L("Required", "مطلوب"), L("Status", "الحالة")]}
              rows={(mrQ.data ?? []).map((m) => [m.mrNo ?? `#${m.id}`, m.requestDate, m.requiredDate ?? "—", <StatusPill key={m.id} status={m.status} />])}
              empty={L("No material requests yet.", "لا طلبات مواد بعد.")}
            />
          </CardContent>
        </Card>
      )}

      {tab === "po" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Purchase Orders", "أوامر الشراء")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("New PO", "أمر شراء")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("New purchase order", "أمر شراء جديد")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); poCreate.mutate({ projectId: Number(po.projectId), supplierId: Number(po.supplierId), orderDate: po.orderDate || undefined, expectedDate: po.expectedDate || undefined, subtotal: po.subtotal }); }}>
                  <div><Label>{L("Project", "المشروع")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={po.projectId} onChange={(e) => setPo({ ...po, projectId: e.target.value })}>
                      <option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} · {p.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Supplier", "المورد")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={po.supplierId} onChange={(e) => setPo({ ...po, supplierId: e.target.value })}>
                      <option value="">—</option>{(suppliersQ.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{L("Order date", "تاريخ الأمر")}</Label><Input type="date" value={po.orderDate} onChange={(e) => setPo({ ...po, orderDate: e.target.value })} /></div>
                    <div><Label>{L("Expected", "متوقع")}</Label><Input type="date" value={po.expectedDate} onChange={(e) => setPo({ ...po, expectedDate: e.target.value })} /></div>
                  </div>
                  <div><Label>{L("Subtotal (SAR)", "المجموع الفرعي")}</Label><Input type="number" value={po.subtotal} onChange={(e) => setPo({ ...po, subtotal: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Create", "إنشاء")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("PO No", "رقم الأمر"), L("Order date", "التاريخ"), L("Total", "الإجمالي"), L("Status", "الحالة")]}
              rows={(poQ.data ?? []).map((p) => [p.poNo ?? `#${p.id}`, p.orderDate ?? "—", money(p.totalAmount), <StatusPill key={p.id} status={p.status} />])}
              empty={L("No purchase orders yet.", "لا أوامر شراء بعد.")}
            />
          </CardContent>
        </Card>
      )}

      {tab === "grn" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{L("Goods Receipt Notes", "إيصالات الاستلام")}</CardTitle>
            <Dialog><DialogTrigger asChild><Button size="sm"><Plus className="me-1 h-4 w-4" />{L("New GRN", "إيصال جديد")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{L("New goods receipt", "إيصال استلام جديد")}</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); grnCreate.mutate({ projectId: Number(grn.projectId), poId: grn.poId ? Number(grn.poId) : undefined, receiptDate: grn.receiptDate }); }}>
                  <div><Label>{L("Project", "المشروع")}</Label>
                    <select required className="h-10 w-full rounded-md border px-3" value={grn.projectId} onChange={(e) => setGrn({ ...grn, projectId: e.target.value })}>
                      <option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectCode} · {p.nameEn}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Against PO", "مرتبط بأمر شراء")}</Label>
                    <select className="h-10 w-full rounded-md border px-3" value={grn.poId} onChange={(e) => setGrn({ ...grn, poId: e.target.value })}>
                      <option value="">—</option>{(poQ.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.poNo ?? `#${p.id}`}</option>)}
                    </select>
                  </div>
                  <div><Label>{L("Receipt date", "تاريخ الاستلام")}</Label><Input type="date" required value={grn.receiptDate} onChange={(e) => setGrn({ ...grn, receiptDate: e.target.value })} /></div>
                  <Button type="submit" className="w-full">{L("Create", "إنشاء")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              head={[L("GRN No", "رقم الإيصال"), L("Receipt date", "التاريخ"), L("Invoice ref", "مرجع الفاتورة"), L("Status", "الحالة")]}
              rows={(grnQ.data ?? []).map((g) => [g.grnNo ?? `#${g.id}`, g.receiptDate, g.invoiceRef ?? "—", <StatusPill key={g.id} status={g.status} />])}
              empty={L("No receipts yet.", "لا إيصالات بعد.")}
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