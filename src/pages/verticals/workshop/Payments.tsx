import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wallet, Plus } from "lucide-react";
import { trpc } from "@/providers/trpc";
import ActionButton3D from "@/components/ui/ActionButton3D";

const METHODS = ["cash", "card", "bank_transfer", "sadad", "wallet", "insurance"] as const;

export default function WorkshopPaymentsPage() {
  const navigate = useNavigate();
  const { data: jobCards } = trpc.workshop.jobCardList.useQuery(undefined);
  const { data: payments, refetch } = trpc.workshop.paymentList.useQuery(undefined);
  const createPayment = trpc.workshop.paymentCreate.useMutation({ onSuccess: () => { refetch(); reset(); } });

  const [form, setForm] = useState({ jobCardId: "", amount: "", paymentMethod: "cash", referenceNumber: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function reset() {
    setForm({ jobCardId: "", amount: "", paymentMethod: "cash", referenceNumber: "", notes: "" });
    setError(null);
  }

  const totalCollected = (payments || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0);

  function save() {
    const amount = Number(form.amount) || 0;
    if (!(amount > 0)) { setError("Amount 0 se zyada likhein."); return; }
    setError(null);
    createPayment.mutate({
      jobCardId: form.jobCardId ? Number(form.jobCardId) : undefined,
      amount: String(amount),
      paymentMethod: form.paymentMethod,
      referenceNumber: form.referenceNumber.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  }

  const jobNo = (id: number | null) =>
    (jobCards || []).find((j: any) => j.id === id)?.jobNumber || (id ? `#${id}` : "—");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workshop Payments / المدفوعات</h2>
          <p className="text-slate-500">Deposits, final payments and delivery collection</p>
        </div>
        <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Payments</p><p className="text-2xl font-bold">{(payments || []).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Total collected</p><p className="text-2xl font-bold text-emerald-700">{totalCollected.toLocaleString()} SAR</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Open job cards</p><p className="text-2xl font-bold">{(jobCards || []).filter((j: any) => j.status !== "cancelled" && j.status !== "delivered").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Collect Payment</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="col-span-2">
              <Label>Job Card (optional)</Label>
              <Select value={form.jobCardId} onValueChange={(v) => set("jobCardId", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Walk-in / general" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk-in / general</SelectItem>
                  {(jobCards || []).map((j: any) => (
                    <SelectItem key={j.id} value={String(j.id)}>{j.jobNumber} — {j.status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount *</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Method</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => set("paymentMethod", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference</Label>
              <Input value={form.referenceNumber} onChange={(e) => set("referenceNumber", e.target.value)} placeholder="Receipt / Auth #" />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button disabled={createPayment.isPending} onClick={save}>
              <Plus className="mr-1 size-4" />{createPayment.isPending ? "Saving…" : "Collect Payment"}
            </Button>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            {createPayment.error && <p className="text-sm text-red-600">Error: {String((createPayment.error as any)?.message || createPayment.error)}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Job</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments || []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.id}</TableCell>
                  <TableCell className="font-mono">{jobNo(p.jobCardId ?? null)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(p.amount || 0).toLocaleString()} SAR</TableCell>
                  <TableCell><Badge variant="outline">{p.paymentMethod || "cash"}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{p.referenceNumber || "—"}</TableCell>
                  <TableCell className="text-sm text-slate-600">{p.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {(!payments || payments.length === 0) && (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-slate-500"><Wallet className="mx-auto mb-2 size-8 text-slate-300" />No payments collected yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
