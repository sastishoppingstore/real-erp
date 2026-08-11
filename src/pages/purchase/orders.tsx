import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingBag, Trash2 } from "lucide-react";

export default function PurchaseOrdersPage() {
  const { data: orders, refetch } = trpc.purchase.poList.useQuery();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const createPO = trpc.purchase.poCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const emptyItem = { description: "", quantity: 1, unitPrice: "0", totalAmount: "0" };
  const [form, setForm] = useState({
    poNumber: "", supplierId: 0, date: new Date().toISOString().split('T')[0], expectedDelivery: "",
    subTotal: "0", taxAmount: "0", totalAmount: "0",
    items: [{ ...emptyItem }],
  });

  const calculateTotals = (items: typeof form.items) => {
    const subTotal = items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
    const taxAmount = subTotal * 0.15; // Assuming 15% VAT
    const totalAmount = subTotal + taxAmount;
    setForm(prev => ({
      ...prev,
      items,
      subTotal: subTotal.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...form.items];
    const item = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      item.totalAmount = (Number(item.quantity || 0) * Number(item.unitPrice || 0)).toString();
    }
    newItems[index] = item;
    calculateTotals(newItems);
  };

  const addItem = () => {
    calculateTotals([...form.items, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    calculateTotals(newItems.length ? newItems : [{ ...emptyItem }]);
  };

  const filtered = orders?.filter(o => !statusFilter || o.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    partial: "bg-amber-100 text-amber-700",
    received: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    invoiced: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Purchase Orders</h2><p className="text-slate-500">Create and track purchase orders</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New PO</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createPO.mutate(form); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>PO Number</Label><Input value={form.poNumber} onChange={e => setForm({...form, poNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>Expected Delivery</Label><Input type="date" value={form.expectedDelivery} onChange={e => setForm({...form, expectedDelivery: e.target.value})} /></div>
              </div>
              <div><Label>Supplier</Label>
                <Select onValueChange={v => setForm({...form, supplierId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Items</Label>
                <div className="space-y-2 mt-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input placeholder="Description" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} required className="flex-1" />
                      <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))} className="w-20" required min="1" />
                      <Input type="number" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} className="w-24" required min="0" step="0.01" />
                      <div className="w-24 text-right px-2 font-mono text-sm bg-slate-50 border border-slate-200 rounded flex items-center justify-end h-10">{Number(item.totalAmount).toFixed(2)}</div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-2" /> Add Item</Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <div><Label>Subtotal</Label><Input type="number" value={form.subTotal} readOnly className="bg-slate-50" /></div>
                <div><Label>Tax (15%)</Label><Input type="number" value={form.taxAmount} readOnly className="bg-slate-50" /></div>
                <div><Label>Total</Label><Input type="number" value={form.totalAmount} readOnly className="bg-slate-50 font-bold" /></div>
              </div>
              <Button type="submit" className="w-full">Create PO</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["draft", "sent", "partial", "received", "cancelled"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm font-medium">{o.poNumber}</TableCell>
                  <TableCell>{suppliers?.find(s => s.id === o.supplierId)?.name || `Supplier #${o.supplierId}`}</TableCell>
                  <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(o.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status] || ""}`}>{o.status}</span></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No purchase orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
