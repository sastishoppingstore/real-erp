import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wallet, Banknote, CreditCard, Landmark } from "lucide-react";
import { toast } from "sonner";

// Auto-numbered receipt form: payment # is prefilled, invoices load from the
// customer's list (by number + balance), picking one fills the amount.
const emptyForm = () => ({
  paymentNumber: `PAY-${Date.now().toString().slice(-8)}`,
  customerId: 0,
  invoiceId: 0,
  date: new Date().toISOString().slice(0, 10),
  amount: "0",
  paymentMethod: "cash" as string,
  reference: "",
  notes: "",
});

export default function CustomerPaymentsPage() {
  const { data: payments, refetch } = trpc.sales.paymentList.useQuery();
  const { data: customers } = trpc.sales.customerList.useQuery();
  const { data: invoices } = trpc.sales.invoiceList.useQuery();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const createPayment = trpc.sales.paymentCreate.useMutation({
    onSuccess: () => { toast.success("Payment recorded"); refetch(); },
    onError: (e: any) => toast.error(e.message || "Failed to record payment"),
  });

  const paymentMethodIcons: Record<string, any> = { cash: Banknote, bank_transfer: Landmark, cheque: Wallet, card: CreditCard, online: CreditCard };

  const custInvoices = (invoices || []).filter((inv: any) => !form.customerId || inv.customerId === form.customerId);
  const selectedInvoice = (invoices || []).find((inv: any) => inv.id === form.invoiceId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) { toast.error("Select a customer"); return; }
    if (Number(form.amount) <= 0) { toast.error("Enter a valid amount"); return; }
    createPayment.mutate({
      paymentNumber: form.paymentNumber || `PAY-${Date.now().toString().slice(-8)}`,
      customerId: form.customerId,
      invoiceId: form.invoiceId || undefined,
      date: form.date || new Date().toISOString().slice(0, 10),
      amount: form.amount,
      paymentMethod: form.paymentMethod as any,
      reference: form.reference || undefined,
      notes: form.notes || undefined,
    });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Customer Payments</h2><p className="text-slate-500">Track customer payments &amp; receipts</p></div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setForm(emptyForm()); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Record Payment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Customer Payment</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Payment #</Label><Input value={form.paymentNumber} onChange={e => setForm({ ...form, paymentNumber: e.target.value })} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
              </div>
              <div><Label>Customer</Label>
                <Select value={form.customerId ? String(form.customerId) : ""} onValueChange={v => setForm({ ...form, customerId: Number(v), invoiceId: 0 })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Invoice (optional)</Label>
                <Select value={form.invoiceId ? String(form.invoiceId) : ""} onValueChange={v => {
                  const inv = (invoices || []).find((x: any) => String(x.id) === v);
                  setForm(f => ({ ...f, invoiceId: v ? Number(v) : 0, amount: inv ? String(inv.balanceDue ?? inv.totalAmount ?? 0) : f.amount }));
                }}>
                  <SelectTrigger><SelectValue placeholder="— none —" /></SelectTrigger>
                  <SelectContent>
                    {custInvoices.map((inv: any) => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {inv.invoiceNumber} — due {Number(inv.balanceDue ?? 0).toLocaleString()}
                      </SelectItem>
                    ))}
                    {custInvoices.length === 0 && <SelectItem value="_none" disabled>No invoices</SelectItem>}
                  </SelectContent>
                </Select>
                {selectedInvoice && (
                  <p className="mt-1 text-xs text-slate-500">
                    Total {Number(selectedInvoice.totalAmount || 0).toLocaleString()} · Paid {Number(selectedInvoice.paidAmount || 0).toLocaleString()} · Due <b>{Number(selectedInvoice.balanceDue || 0).toLocaleString()}</b>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
                <div><Label>Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(v: any) => setForm({ ...form, paymentMethod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Reference</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={createPayment.isPending}>
                {createPayment.isPending ? "Saving..." : "Record Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((p: any) => {
                const Icon = paymentMethodIcons[p.paymentMethod] || Wallet;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm font-medium">{p.paymentNumber}</TableCell>
                    <TableCell>{customers?.find((c: any) => c.id === p.customerId)?.name || `Customer #${p.customerId}`}</TableCell>
                    <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm"><Icon className="w-3 h-3 text-slate-500" />{(p.paymentMethod || "").replace("_", " ")}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">{Number(p.amount).toLocaleString()} SAR</TableCell>
                    <TableCell className="text-sm text-slate-500">{p.reference || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-slate-500">{p.notes || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {(!payments || payments.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No payments recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
