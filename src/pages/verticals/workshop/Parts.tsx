import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import ActionButton3D from "@/components/ui/ActionButton3D";

export default function WorkshopPartsPage() {
  const navigate = useNavigate();
  const { data: jobCards } = trpc.workshop.jobCardList.useQuery(undefined);
  const { data: parts, refetch } = trpc.workshop.jobPartsList.useQuery(undefined);
  const addPart = trpc.workshop.jobPartAdd.useMutation({ onSuccess: () => { refetch(); reset(); } });
  const removePart = trpc.workshop.jobPartRemove.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState({ jobCardId: "", partName: "", partNumber: "", quantity: "1", unitPrice: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function reset() {
    setForm({ jobCardId: "", partName: "", partNumber: "", quantity: "1", unitPrice: "" });
    setError(null);
  }

  const totalValue = (parts || []).reduce((s: number, p: any) => s + Number(p.totalPrice || 0), 0);

  function save() {
    const jobCardId = Number(form.jobCardId);
    const quantity = Number(form.quantity) || 0;
    const unitPrice = Number(form.unitPrice) || 0;
    if (!jobCardId) { setError("Job card chunein."); return; }
    if (!form.partName.trim()) { setError("Part ka naam likhein."); return; }
    if (!(quantity > 0)) { setError("Quantity 0 se zyada likhein."); return; }
    setError(null);
    addPart.mutate({
      jobCardId,
      partName: form.partName.trim(),
      partNumber: form.partNumber.trim() || undefined,
      quantity,
      unitPrice: String(unitPrice),
      totalPrice: String(+(quantity * unitPrice).toFixed(2)),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workshop Parts / قطع الغيار</h2>
          <p className="text-slate-500">Parts issued to job cards — job-card cost posting</p>
        </div>
        <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Parts lines</p><p className="text-2xl font-bold">{(parts || []).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Total parts value</p><p className="text-2xl font-bold">{totalValue.toLocaleString()} SAR</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Open job cards</p><p className="text-2xl font-bold">{(jobCards || []).filter((j: any) => j.status !== "cancelled" && j.status !== "delivered").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Issue Part to Job Card</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="col-span-2">
              <Label>Job Card *</Label>
              <Select value={form.jobCardId} onValueChange={(v) => set("jobCardId", v)}>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {(jobCards || []).map((j: any) => (
                    <SelectItem key={j.id} value={String(j.id)}>{j.jobNumber} — {j.status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Part Name *</Label>
              <Input value={form.partName} onChange={(e) => set("partName", e.target.value)} placeholder="Brake pads" />
            </div>
            <div>
              <Label>Part No</Label>
              <Input value={form.partNumber} onChange={(e) => set("partNumber", e.target.value)} placeholder="BP-2201" />
            </div>
            <div>
              <Label>Qty *</Label>
              <Input type="number" min="0" step="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} placeholder="0.00" />
            </div>
            <div className="flex items-end">
              <Button className="w-full" disabled={addPart.isPending} onClick={save}>
                <Plus className="mr-1 size-4" />{addPart.isPending ? "Saving…" : "Issue Part"}
              </Button>
            </div>
          </div>
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
          {addPart.error && <p className="mt-2 text-sm text-red-600">Error: {String((addPart.error as any)?.message || addPart.error)}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Part No</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(parts || []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.jobNumber || `#${p.jobCardId}`}</TableCell>
                  <TableCell className="font-medium">{p.partName}</TableCell>
                  <TableCell className="font-mono text-xs">{p.partNumber || "—"}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{Number(p.unitPrice || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(p.totalPrice || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="text-red-600" disabled={removePart.isPending} onClick={() => {
                      if (confirm(`Remove ${p.partName} from job?`)) removePart.mutate({ id: p.id });
                    }}>
                      <Trash2 className="mr-1 size-3.5" /> Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!parts || parts.length === 0) && (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-slate-500"><Package className="mx-auto mb-2 size-8 text-slate-300" />No parts issued yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
