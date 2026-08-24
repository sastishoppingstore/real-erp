import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, DollarSign, Percent, Printer, Search, Trash2, UserPlus, X, FileDown } from "lucide-react";
import { trpc } from "@/providers/trpc";
import ActionButton3D from "@/components/ui/ActionButton3D";
import ConstructionInvoicePrint, { type CInvPrintData } from "@/components/ConstructionInvoicePrint";
import { numberToEnglishWords, formatMoney } from "@/lib/numberToWords";

interface ItemRow {
  descriptionEn: string; descriptionAr: string; unit: string;
  totalHour: string; rate: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paid: "bg-purple-100 text-purple-700 border-purple-200",
};

const emptyItem: ItemRow = { descriptionEn: "", descriptionAr: "", unit: "Hour", totalHour: "", rate: "" };

export default function ConstructionInvoicePage() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [printData, setPrintData] = useState<CInvPrintData | null>(null);

  // ---- create form state ----
  const [custMode, setCustMode] = useState<"existing" | "new">("existing");
  const [q, setQ] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [cust, setCust] = useState({ nameEn: "", nameAr: "", vatNo: "", crNo: "", address: "", phone: "" });
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [meta, setMeta] = useState({
    invoiceNo: "", poNumber: "", workedMonth: defaultMonth,
    paymentType: "Credit", cashier: "مدير النظام", dueDate: "",
  });
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItem }]);

  const { data: list = [] } = trpc.constructionInvoices.invoiceList.useQuery(undefined);
  const { data: suggestedNo } = trpc.constructionInvoices.nextInvoiceNo.useQuery(undefined, { enabled: openCreate });
  const { data: companySettings } = trpc.company.getSettings.useQuery(undefined);
  const customerQuery = trpc.constructionInvoices.customerSearch.useQuery(
    { q },
    { enabled: custMode === "existing" && q.trim().length >= 2 },
  );

  const createMut = trpc.constructionInvoices.invoiceCreate.useMutation({
    onSuccess: async () => {
      await utils.constructionInvoices.invoiceList.invalidate();
      closeCreate();
    },
  });

  const filtered = useMemo(
    () => list.filter((inv: any) =>
      !search ||
      String(inv.invoiceNo || "").toLowerCase().includes(search.toLowerCase()) ||
      String(inv.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      String(inv.customerNameAr || "").includes(search) ||
      String(inv.poNumber || "").toLowerCase().includes(search.toLowerCase()),
    ),
    [list, search],
  );
  const totals = useMemo(() => ({
    count: filtered.length,
    subtotal: filtered.reduce((s: number, i: any) => s + Number(i.subtotal || 0), 0),
    vat: filtered.reduce((s: number, i: any) => s + Number(i.vatAmount || 0), 0),
    grand: filtered.reduce((s: number, i: any) => s + Number(i.grandTotal || 0), 0),
  }), [filtered]);

  const liveSubtotal = items.reduce((s, it) => s + (Number(it.totalHour) || 0) * (Number(it.rate) || 0), 0);
  const liveVat = liveSubtotal * 0.15;
  const liveGrand = liveSubtotal + liveVat;

  function resetForm() {
    setCustMode("existing"); setQ(""); setShowResults(false); setCustomerId(null);
    setCust({ nameEn: "", nameAr: "", vatNo: "", crNo: "", address: "", phone: "" });
    setMeta({ invoiceNo: "", poNumber: "", workedMonth: defaultMonth, paymentType: "Credit", cashier: "مدير النظام", dueDate: "" });
    setItems([{ ...emptyItem }]);
  }
  function closeCreate() { setOpenCreate(false); resetForm(); }

  function pickCustomer(c: any) {
    setCustomerId(c.id);
    setCust({
      nameEn: c.name || "", nameAr: c.nameAr || "",
      vatNo: c.vatNo || "", crNo: c.crNo || "",
      address: c.address || "", phone: c.phone || "",
    });
    setQ(""); setShowResults(false);
  }

  function save(printAfter?: boolean) {
    const validItems = items.filter((it) => it.descriptionEn.trim() && (Number(it.totalHour) > 0));
    createMut.mutate(
      {
        customerId: custMode === "existing" && customerId ? customerId : undefined,
        newCustomer: custMode === "new" ? {
          nameEn: cust.nameEn, nameAr: cust.nameAr || undefined,
          vatNo: cust.vatNo || undefined, crNo: cust.crNo || undefined,
          phone: cust.phone || undefined, address: cust.address || undefined,
        } : undefined,
        invoiceNo: meta.invoiceNo || undefined,
        poNumber: meta.poNumber || undefined,
        workedMonth: meta.workedMonth || undefined,
        paymentType: meta.paymentType,
        cashier: meta.cashier || undefined,
        dueDate: meta.dueDate || undefined,
        items: validItems.map((it) => ({
          descriptionEn: it.descriptionEn, descriptionAr: it.descriptionAr || undefined,
          unit: it.unit, totalHour: Number(it.totalHour), rate: Number(it.rate),
        })),
      } as any,
      {
        onSuccess: (res: any) => {
          if (printAfter && res?.invoice) {
            openPrint(res.invoice, res.items);
          }
        },
      },
    );
  }

  function openPrint(inv: any, its: any[]) {
    setPrintData({
      ...(inv.id ? { _id: inv.id } : {}),
      invoiceNo: inv.invoiceNo, poNumber: inv.poNumber, workedMonth: inv.workedMonth,
      paymentType: inv.paymentType, cashier: inv.cashier, dueDate: inv.dueDate, createdAt: inv.createdAt,
      customer: {
        name: inv.customerName || "—", nameAr: inv.customerNameAr,
        vatNo: inv.customerVat, crNo: inv.customerCr,
        address: inv.customerAddress, phone: inv.customerPhone,
      },
      company: {
        nameEn: (companySettings as any)?.nameEn || "", nameAr: (companySettings as any)?.nameAr || "",
        vatNo: (companySettings as any)?.vatNo || "", crNo: (companySettings as any)?.crNo || "",
        address: (companySettings as any)?.address || "", email: (companySettings as any)?.email || "",
        stampUrl: (companySettings as any)?.stampUrl || "", unifiedNationalNo: (companySettings as any)?.unifiedNationalNo || "",
      },
      items: (its || []).map((r: any) => ({
        sr: r.sr, descriptionEn: r.descriptionEn, descriptionAr: r.descriptionAr,
        unit: r.unit, totalHour: r.totalHour, rate: r.rate, lineTotal: r.lineTotal,
      })),
      subtotal: inv.subtotal, vatPercent: inv.vatPercent || 15,
      vatAmount: inv.vatAmount, grandTotal: inv.grandTotal,
    });
  }

  function updateItem(idx: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Invoices</h2>
          <p className="text-slate-500">Bilingual construction invoices — A4 print with VAT 15%</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input className="w-56 pl-8" placeholder="Search invoices…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <ActionButton3D icon={<Plus className="size-4" />} label="New Tax Invoice" color="blue" onClick={() => setOpenCreate(true)} />
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><FileText className="size-4 text-slate-600" /><p className="text-xs font-medium text-slate-600">Invoices</p></div>
            <p className="mt-1 text-2xl font-bold">{totals.count}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><DollarSign className="size-4 text-blue-600" /><p className="text-xs font-medium text-blue-700">Subtotal</p></div>
            <p className="mt-1 text-2xl font-bold text-blue-800">{formatMoney(totals.subtotal)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Percent className="size-4 text-amber-600" /><p className="text-xs font-medium text-amber-700">VAT 15%</p></div>
            <p className="mt-1 text-2xl font-bold text-amber-800">{formatMoney(totals.vat)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><DollarSign className="size-4 text-emerald-600" /><p className="text-xs font-medium text-emerald-700">Grand Total</p></div>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{formatMoney(totals.grand)}</p>
          </CardContent>
        </Card>
      </div>

      {/* list */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Worked Month</TableHead>
                <TableHead>PO No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">VAT 15%</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="py-12 text-center text-slate-500">No invoices yet — create your first tax invoice.</TableCell></TableRow>
              )}
              {filtered.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm font-semibold">{inv.invoiceNo}</TableCell>
                  <TableCell>{inv.workedMonth || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{inv.poNumber || "—"}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{inv.customerName}</div>
                    {inv.customerNameAr && <div dir="rtl" className="text-xs text-slate-500">{inv.customerNameAr}</div>}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatMoney(inv.subtotal)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatMoney(inv.vatAmount)}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">{formatMoney(inv.grandTotal)}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[inv.status] || statusColors.draft}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={async () => {
                      const full: any = await utils.constructionInvoices.invoiceGet.fetch({ id: inv.id });
                      openPrint(full.invoice, full.items);
                    }}>
                      <Printer className="mr-1 size-3.5" /> Print
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===== Create dialog ===== */}
      <Dialog open={openCreate} onOpenChange={(v) => !v && closeCreate()}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto" dir="ltr">
          <DialogHeader><DialogTitle>New Tax Invoice — فاتورة ضريبية</DialogTitle></DialogHeader>

          {/* --- Customer block --- */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Customer / العميل</Label>
              <div className="flex rounded-md border overflow-hidden text-xs">
                <button type="button" onClick={() => setCustMode("existing")} className={`px-3 py-1 ${custMode === "existing" ? "bg-blue-600 text-white" : "bg-white"}`}>Existing</button>
                <button type="button" onClick={() => { setCustMode("new"); setCustomerId(null); }} className={`px-3 py-1 ${custMode === "new" ? "bg-blue-600 text-white" : "bg-white"}`}>
                  <UserPlus className="mr-1 inline size-3" />New
                </button>
              </div>
            </div>

            {custMode === "existing" && (
              <div className="relative">
                <Input
                  placeholder="Type 2+ letters — English ya Arabic naam…"
                  value={custMode === "existing" && customerId ? `${cust.nameEn}${cust.nameAr ? " — " + cust.nameAr : ""}` : q}
                  onFocus={() => { if (!customerId) setShowResults(true); }}
                  onChange={(e) => { setCustomerId(null); setQ(e.target.value); setShowResults(true); setCust({ nameEn: "", nameAr: "", vatNo: "", crNo: "", address: "", phone: "" }); }}
                />
                {customerId && (
                  <Button type="button" size="sm" variant="ghost" className="absolute right-1 top-1 h-6 px-2" onClick={() => { setCustomerId(null); setQ(""); }}>
                    <X className="size-3" />
                  </Button>
                )}
                {showResults && !customerId && q.trim().length >= 2 && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg">
                    {(customerQuery.data || []).length === 0 && <div className="px-3 py-2 text-sm text-slate-500">Koi customer nahi mila — "New" tab se add karein.</div>}
                    {(customerQuery.data || []).map((c: any) => (
                      <button key={c.id} type="button" className="block w-full px-3 py-2 text-left hover:bg-slate-50 border-b last:border-b-0"
                        onClick={() => pickCustomer(c)}>
                        <span className="text-sm font-medium">{c.name}</span>
                        {c.nameAr && <span dir="rtl" className="ml-2 text-sm text-slate-600">{c.nameAr}</span>}
                        {c.vatNo && <span className="ml-2 text-[11px] text-slate-400">VAT {c.vatNo}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={custMode === "new" ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3 opacity-90"}>
              <div>
                <Label>Name (English){custMode === "new" ? " *" : ""}</Label>
                <Input value={cust.nameEn} readOnly={custMode === "existing"} disabled={custMode === "existing"}
                  onChange={(e) => setCust({ ...cust, nameEn: e.target.value })} placeholder="Customer name EN" />
              </div>
              <div>
                <Label dir="rtl">الاسم (عربي)</Label>
                <Input dir="rtl" value={cust.nameAr} readOnly={custMode === "existing"} disabled={custMode === "existing"}
                  onChange={(e) => setCust({ ...cust, nameAr: e.target.value })} placeholder="اسم العميل" />
              </div>
              <div>
                <Label>VAT No</Label>
                <Input value={cust.vatNo} readOnly={custMode === "existing"} disabled={custMode === "existing"}
                  onChange={(e) => setCust({ ...cust, vatNo: e.target.value })} placeholder="300000000000003" />
              </div>
              <div>
                <Label>CR No</Label>
                <Input value={cust.crNo} readOnly={custMode === "existing"} disabled={custMode === "existing"}
                  onChange={(e) => setCust({ ...cust, crNo: e.target.value })} placeholder="1010…" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={cust.phone} readOnly={custMode === "existing"} disabled={custMode === "existing"}
                  onChange={(e) => setCust({ ...cust, phone: e.target.value })} placeholder="+9665…" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={cust.address} readOnly={custMode === "existing"} disabled={custMode === "existing"}
                  onChange={(e) => setCust({ ...cust, address: e.target.value })} placeholder="Street / District, City" />
              </div>
            </div>
            {custMode === "new" && (
              <p className="text-xs text-slate-500">Save par ye customer khud-ba-khud customers me add ho jayega aur agli dafa autocomplete me aayega.</p>
            )}
          </div>

          {/* --- Meta row --- */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div><Label>Invoice No</Label><Input placeholder={suggestedNo || "YCI-2026-0001"} value={meta.invoiceNo} onChange={(e) => setMeta({ ...meta, invoiceNo: e.target.value })} /></div>
            <div><Label>Worked Month</Label><Input placeholder="2026-May" value={meta.workedMonth} onChange={(e) => setMeta({ ...meta, workedMonth: e.target.value })} /></div>
            <div><Label>PO Number</Label><Input value={meta.poNumber} onChange={(e) => setMeta({ ...meta, poNumber: e.target.value })} placeholder="GSCA2026-YAE-M-001" /></div>
            <div>
              <Label>Payment</Label>
              <Select value={meta.paymentType} onValueChange={(v) => setMeta({ ...meta, paymentType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Credit", "Cash", "Bank Transfer", "Advance"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cashier</Label><Input dir="rtl" value={meta.cashier} onChange={(e) => setMeta({ ...meta, cashier: e.target.value })} /></div>
            <div><Label>Due Date</Label><Input type="date" value={meta.dueDate} onChange={(e) => setMeta({ ...meta, dueDate: e.target.value })} /></div>
          </div>

          {/* --- Items editor --- */}
          <div className="rounded-lg border">
            <div className="border-b px-3 py-2 flex items-center justify-between">
              <Label className="font-semibold">Line Items / بنود</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, { ...emptyItem }])}>
                <Plus className="mr-1 size-3" /> Add Item
              </Button>
            </div>
            <div className="space-y-2 p-3">
              {items.map((it, idx) => {
                const lt = (Number(it.totalHour) || 0) * (Number(it.rate) || 0);
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end rounded-md border p-2">
                    <div className="col-span-4">
                      <Label className="text-[10px]">Job Description (EN)</Label>
                      <Input value={it.descriptionEn} onChange={(e) => updateItem(idx, { descriptionEn: e.target.value })} placeholder="Multi Welder Firdaws" />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-[10px]" dir="rtl">وصف العمل (AR)</Label>
                      <Input dir="rtl" value={it.descriptionAr} onChange={(e) => updateItem(idx, { descriptionAr: e.target.value })} placeholder="ملحام متعدد" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">Unit</Label>
                      <Select value={it.unit} onValueChange={(v) => updateItem(idx, { unit: v })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{["Hour", "Day", "Month", "LS", "M²"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Label className="text-[10px]">Hours</Label>
                      <Input type="number" min="0" step="0.5" className="h-9" value={it.totalHour} onChange={(e) => updateItem(idx, { totalHour: e.target.value })} />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-[10px]">Rate</Label>
                      <Input type="number" min="0" className="h-9" value={it.rate} onChange={(e) => updateItem(idx, { rate: e.target.value })} />
                    </div>
                    <div className="col-span-1 flex flex-col items-end gap-1">
                      <Label className="text-[10px]">Total</Label>
                      <div className="flex h-9 items-center gap-1">
                        <span className="font-mono text-xs">{formatMoney(lt)}</span>
                        {items.length > 1 && (
                          <button type="button" className="text-red-500" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Totals + actions --- */}
          <div className="flex items-end justify-between gap-4">
            <table className="text-sm">
              <tbody>
                <tr><td className="pr-4 text-slate-500">Subtotal (بدون الضريبة)</td><td className="text-right font-mono font-semibold">{formatMoney(liveSubtotal)}</td></tr>
                <tr><td className="pr-4 text-slate-500">VAT 15% (القيمة المضافة)</td><td className="text-right font-mono">{formatMoney(liveVat)}</td></tr>
                <tr><td className="pr-4 font-semibold">Grand Total Due (إجمالي المستحق)</td><td className="text-right font-mono font-bold text-emerald-700">{formatMoney(liveGrand)}</td></tr>
                <tr><td colSpan={2} className="pt-1 text-[11px] italic text-slate-500">{numberToEnglishWords(liveGrand)} Saudi Riyals only</td></tr>
              </tbody>
            </table>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeCreate}>Cancel</Button>
              <Button variant="secondary" disabled={createMut.isPending} onClick={() => save(false)}>Save</Button>
              <Button disabled={createMut.isPending} onClick={() => save(true)}>
                <Printer className="mr-1 size-4" />{createMut.isPending ? "Saving…" : "Save & Print"}
              </Button>
            </div>
          </div>
          {createMut.error && <p className="text-sm text-red-600">Error: {String((createMut.error as any)?.message || createMut.error)}</p>}
        </DialogContent>
      </Dialog>

      {/* ===== Print modal ===== */}
      <Dialog open={!!printData} onOpenChange={(v) => !v && setPrintData(null)}>
        <DialogContent className="max-w-[230mm] max-h-[95vh] overflow-auto bg-white">
          <div className="no-print mb-3 flex items-center justify-between">
            <DialogTitle className="text-black">TAX INVOICE — {printData?.invoiceNo}</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={() => window.print()}><Printer className="mr-1 size-4" /> Print / PDF (A4)</Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!printData) return;
                  try {
                    const res = await fetch("/api/trpc/word.generateWord", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ json: { invoiceId: (printData as any)._id || 0 } }),
                    });
                    if (!res.ok) throw new Error("Failed to generate Word document");
                    const data = await res.json();
                    const html = data?.result?.data?.json?.html;
                    if (!html) throw new Error("No HTML content returned");
                    const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>@page{size:Letter;margin:10mm}body{font-family:Calibri,Arial,sans-serif;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:0.5pt solid #000;padding:4pt 6pt;vertical-align:top}</style></head><body>${html}</body></html>`;
                    const blob = new Blob(['\ufeff', wordHtml], { type: "application/msword;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Invoice-${printData.invoiceNo}.doc`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 10000);
                  } catch (e: any) {
                    alert("Word export failed: " + e.message);
                  }
                }}
              >
                <FileDown className="mr-1 size-4" /> Export Word
              </Button>
            </div>
          </div>
          {printData && <ConstructionInvoicePrint data={printData} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
