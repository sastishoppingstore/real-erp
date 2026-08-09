import { FormEvent, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { Eye, Printer, Send, Trash2, Pencil, MessageCircle, Plus, Minus, Search, FileCode2, FileSignature, RefreshCw, QrCode, Package } from "lucide-react";
import QRCode from "qrcode";
import ActionButton3D from "@/components/ui/ActionButton3D";
import SaudiInvoicePrint from "./SaudiInvoicePrint";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/ImageUpload";

type CartItem = { id: string; name: string; price: number; qty: number; sku?: string; discountPercent?: number };
type InvoiceMode = "product" | "service" | "construction";

export default function InvoicesPage() {
  const { data: invoices, refetch } = trpc.sales.invoiceList.useQuery(undefined);
  const { data: customers } = trpc.sales.customerList.useQuery(undefined);
  const { data: products, refetch: refetchProducts } = trpc.inventory.productList.useQuery(undefined);
  const { data: categories, refetch: refetchCategories } = trpc.inventory.categoryList.useQuery(undefined);
  const { data: settings } = trpc.settings.companySettingsGet.useQuery();

  const createInvoice = trpc.sales.invoiceCreate.useMutation({
    onSuccess: () => { refetch(); toast.success("Bill created"); clearCart(); },
    onError: (error) => toast.error(error.message),
  });
  const updateInvoice = trpc.sales.invoiceUpdate.useMutation({
    onSuccess: () => { refetch(); toast.success("Invoice updated"); },
    onError: (error) => toast.error(error.message),
  });
  const deleteInvoiceMut = trpc.sales.invoiceDelete.useMutation({
    onSuccess: () => { refetch(); toast.success("Invoice deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatus = trpc.sales.invoiceUpdateStatus.useMutation({ onSuccess: () => refetch() });
  const generateXml = trpc.zatca.generateXml.useMutation({ onSuccess: () => { toast.success("ZATCA UBL XML generated"); refetch(); }, onError: (e) => toast.error(e.message) });
  const generateQr = trpc.zatca.generateQrCode.useMutation({ onSuccess: () => { toast.success("ZATCA QR generated"); refetch(); }, onError: (e) => toast.error(e.message) });
  const signInvoice = trpc.zatca.signInvoice.useMutation({ onSuccess: () => { toast.success("Invoice signed"); refetch(); }, onError: (e) => toast.error(e.message) });
  const clearInvoice = trpc.zatca.clearanceInvoice.useMutation({ onSuccess: () => toast.success("ZATCA clearance logged"), onError: (e) => toast.error(e.message) });
  const reportInvoice = trpc.zatca.reportInvoice.useMutation({ onSuccess: () => toast.success("ZATCA reporting logged"), onError: (e) => toast.error(e.message) });
  const syncZatcaStatus = trpc.zatca.syncStatus.useMutation({ onSuccess: () => toast.success("ZATCA status synced"), onError: (e) => toast.error(e.message) });
  const sendWhatsAppInvoice = trpc.whatsapp.sendInvoiceCreated.useMutation({ onSuccess: () => toast.success("Invoice sent on WhatsApp"), onError: (e) => toast.error(e.message) });
  const createQuickProduct = trpc.inventory.productCreate.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("Product added"); },
    onError: (e) => toast.error(e.message),
  });
  const createQuickCategory = trpc.inventory.categoryCreate.useMutation({
    onSuccess: () => { refetchCategories(); toast.success("Category created"); },
    onError: (e) => toast.error(e.message),
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerVat, setCustomerVat] = useState("");
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [custDropdownOpen, setCustDropdownOpen] = useState(false);
  const [custFocus, setCustFocus] = useState(-1);
  const custRef = useRef<HTMLDivElement>(null);

  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPurchasePrice, setNewProductPurchasePrice] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductCategoryId, setNewProductCategoryId] = useState<number | undefined>(undefined);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const invoiceDetail = trpc.sales.invoiceGet.useQuery({ id: viewInvoiceId! }, { enabled: !!viewInvoiceId });

  const currency = settings?.defaultCurrency || "SAR";
  const taxPercent = Number(settings?.vatRate ?? 15);
  const companyName = settings?.companyName || settings?.companyNameAr || "Company Name";
  const companyNameAr = settings?.companyNameAr || "";
  const companyAddress = settings?.address || "";
  const companyPhone = settings?.phone || "";
  const companyVat = settings?.taxNumber || settings?.vatNumber || "";
  const companyLogo = settings?.logo || "";
  const companyCountry = settings?.country || "";

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxable = Math.max(0, subtotal - discount);
  const vat = taxable * taxPercent / 100;
  const total = taxable + vat;

  const filteredProducts = (products || []).filter(p =>
    !searchQuery || (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustomers = (customers || []).filter(c =>
    !customerName || (c.name || "").toLowerCase().includes(customerName.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (custRef.current && !custRef.current.contains(e.target as Node)) {
        setCustDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const addToCart = (product: { id: string; name: string; price: number; sku?: string }) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name || "Item", price: Number(product.price || 0), qty: 1, sku: product.sku }];
    });
  };

  const updateQty = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };
  const updatePrice = (index: number, value: string) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, price: Math.max(0, parseFloat(value) || 0) } : item));
  };
  const updateItemName = (index: number, value: string) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, name: value } : item));
  };
  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };
  const clearCart = () => {
    setCart([]); setCustomerId(0); setCustomerName(""); setCustomerPhone("");
    setCustomerAddress(""); setCustomerVat(""); setDiscount(0); setNote("");
  };
  const selectCustomer = (c: { id: number; name: string; address?: string; vatNumber?: string; phone?: string }) => {
    setCustomerId(c.id); setCustomerName(c.name || ""); setCustomerAddress(c.address || "");
    setCustomerVat(c.vatNumber || ""); setCustomerPhone(c.phone || ""); setCustDropdownOpen(false);
  };

  const handleAddQuickCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    createQuickCategory.mutate({ name, image: newCategoryImage || undefined }, {
      onSuccess: (res) => {
        setNewProductCategoryId(res.id);
        setNewCategoryMode(false);
        setNewCategoryName("");
        setNewCategoryImage("");
      },
    });
  };

  const handleAddQuickProduct = () => {
    const name = newProductName.trim();
    if (!name) { toast.error("Enter product name"); return; }
    createQuickProduct.mutate({
      sku: `PRD-${Date.now().toString().slice(-6)}`,
      name,
      purchasePrice: newProductPurchasePrice || "0",
      salePrice: newProductPrice || "0",
      image: newProductImage || undefined,
      categoryId: newProductCategoryId,
    }, {
      onSuccess: () => {
        setProductDialogOpen(false);
        setNewProductName(""); setNewProductPurchasePrice(""); setNewProductPrice("");
        setNewProductImage(""); setNewProductCategoryId(undefined);
        setNewCategoryMode(false); setNewCategoryName(""); setNewCategoryImage("");
      },
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cart.length) { toast.error("Cart is empty"); return; }
    if (!customerName) { toast.error("Enter customer name"); return; }
    const items = cart.map(item => ({
      description: `[${item.id}] ${item.name}`,
      quantity: item.qty,
      unitPrice: item.price.toString(),
      taxPercent: taxPercent.toString(),
      totalAmount: (item.price * item.qty).toFixed(2),
      unit: "pcs", sku: item.sku,
    }));
    const payload = {
      invoiceNumber: `BILL-${Date.now().toString().slice(-6)}`,
      customerId, date: new Date().toISOString().slice(0, 10), dueDate: "",
      invoiceType: "standard", invoiceMode: "product" as InvoiceMode,
      subTotal: subtotal.toFixed(2), taxAmount: vat.toFixed(2),
      taxPercent: taxPercent.toString(), totalAmount: total.toFixed(2),
      discountAmount: discount.toString(), taxableAmount: taxable.toFixed(2),
      notes: note, items,
    };
    if (editingInvoiceId) {
      updateInvoice.mutate({ id: editingInvoiceId, ...payload });
    } else {
      createInvoice.mutate(payload);
    }
  };

  const handlePrint = () => {
    const items = cart.map((item, i) => ({ no: i + 1, name: item.name, qty: item.qty, rate: item.price, total: item.price * item.qty }));
    const qrData = btoa(JSON.stringify({
      seller: companyNameAr || companyName, vat: companyVat,
      total: total.toFixed(2), tax: vat.toFixed(2), date: new Date().toISOString(),
    }));
    const html = `<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8"><title>Bill - ${companyName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:10mm}
.invoice{max-width:800px;margin:0 auto;background:#fff;padding:20mm;box-shadow:0 0 10px rgba(0,0,0,.1)}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #1e3c72;padding-bottom:15px;margin-bottom:20px;gap:20px}
.qr-code{width:80px;height:80px;border:2px solid #000;padding:3px}
.company-info h1{font-size:20px;color:#1e3c72;font-weight:900}
.company-info h2{font-size:16px;color:#d4af37;font-weight:700}
.info-line{font-size:12px;color:#333;margin:2px 0}
.title{text-align:center;background:linear-gradient(135deg,#1e3c72,#2a5298);color:#fff;padding:12px;margin:15px 0;font-size:18px;font-weight:700;border-radius:5px}
.customer{border:1px solid #ddd;padding:15px;margin:15px 0;border-radius:5px}
.customer h3{color:#1e3c72;margin-bottom:8px}
.customer p{margin:3px 0;font-size:13px}
table{width:100%;border-collapse:collapse;margin:20px 0}
thead{background:#1e3c72;color:#fff}
th{padding:10px;text-align:center;border:1px solid #fff;font-size:12px}
td{padding:8px;text-align:center;border:1px solid #ddd;font-size:12px}
tr:nth-child(even){background:#f9f9f9}
.totals{margin-top:20px;padding:15px;background:#f5f5f5;border-radius:5px}
.total-row{display:flex;justify-content:space-between;padding:8px 15px;font-size:14px}
.total-row.grand{background:linear-gradient(135deg,#d4af37,#f9d423);color:#1e3c72;font-weight:900;font-size:18px;border-radius:5px;margin-top:10px}
.footer{margin-top:20px;text-align:center;padding:15px;border-top:2px solid #ddd;font-size:16px;font-weight:700;color:#1e3c72}
@media print{body{background:#fff;padding:0}.invoice{box-shadow:none;margin:0}}
</style></head><body>
<div class="invoice">
<div class="header">
<div class="qr-code"><img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}" style="width:100%"></div>
<div class="company-info">
<h1>${companyName}</h1>${companyNameAr ? `<h2>${companyNameAr}</h2>` : ""}
${companyLogo ? `<img src="${companyLogo}" style="max-width:60px;max-height:40px">` : ""}
${companyAddress ? `<div class="info-line">${companyAddress}</div>` : ""}
${companyPhone ? `<div class="info-line">${companyPhone}</div>` : ""}
${companyVat ? `<div class="info-line"><strong>VAT: ${companyVat}</strong></div>` : ""}
</div>
</div>
<div class="title">TAX INVOICE / فاتورة ضريبية</div>
<div class="customer">
<h3>Customer / العميل</h3>
<p><strong>${customerName || "Walk-in Customer"}</strong></p>
${customerPhone ? `<p>Phone: ${customerPhone}</p>` : ""}
${customerAddress ? `<p>Address: ${customerAddress}</p>` : ""}
${customerVat ? `<p>VAT: ${customerVat}</p>` : ""}
</div>
<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
${items.map(i => `<tr><td>${i.no}</td><td>${i.name}</td><td>${i.qty}</td><td>${i.rate.toFixed(2)}</td><td>${i.total.toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal:</span><span>${currency} ${subtotal.toFixed(2)}</span></div>
${discount > 0 ? `<div class="total-row"><span>Discount:</span><span>-${currency} ${discount.toFixed(2)}</span></div>` : ""}
<div class="total-row"><span>Sales Tax ${taxPercent}%:</span><span>${currency} ${vat.toFixed(2)}</span></div>
<div class="total-row grand"><span>TOTAL:</span><span>${currency} ${total.toFixed(2)}</span></div>
</div>
${note ? `<div style="margin-top:15px;padding:10px;background:#f9f9fa;border-radius:5px;font-size:13px"><strong>Note:</strong> ${note}</div>` : ""}
<div class="footer">شكراً لتعاملكم معنا / Thank You For Your Business!</div>
</div>
<script>window.print();</script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html); w.document.close();
  };

  const handleWhatsAppSend = () => {
    if (!customerName || !total) return;
    const waMsg = `*${companyName}*\n*Bill: BILL-${Date.now().toString().slice(-6)}*\nCustomer: ${customerName}\nTotal: ${currency} ${total.toFixed(2)}`;
    const waPhone = companyPhone ? companyPhone.replace(/\D/g, "") : "";
    if (waPhone) window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`, "_blank");
    else toast("Add company phone number for WhatsApp");
  };

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700", sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700", partial: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-700",
  };
  const filtered = invoices?.filter(i => !statusFilter || statusFilter === "all" || i.status === statusFilter) || [];
  const detail = invoiceDetail.data;
  const selectedInvoiceId = detail?.invoice?.id;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold">Invoices / فواتير</h2>
            <p className="text-slate-500 text-sm">{filtered.length} invoices</p>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => { clearCart(); setEditingInvoiceId(null); setViewInvoiceId(null); }}>New Bill</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Product Grid */}
        <div className="w-1/2 border-r p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setProductDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </div>
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Product Name</Label>
                  <Input value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="e.g. Office Chair" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Buying Price ({currency})</Label>
                    <Input type="number" value={newProductPurchasePrice} onChange={e => setNewProductPurchasePrice(e.target.value)} placeholder="0.00" />
                  </div>
                  <div>
                    <Label className="text-xs">Sale Price ({currency})</Label>
                    <Input type="number" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Cover Image</Label>
                  <ImageUpload value={newProductImage} onChange={setNewProductImage} />
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={newProductCategoryId ? String(newProductCategoryId) : undefined}
                    onValueChange={v => {
                      if (v === "__new") { setNewCategoryMode(true); return; }
                      setNewProductCategoryId(Number(v)); setNewCategoryMode(false);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      <SelectItem value="__new">+ New Category</SelectItem>
                    </SelectContent>
                  </Select>
                  {newCategoryMode && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Category name" className="h-8 text-xs" />
                        <Button size="sm" onClick={handleAddQuickCategory} disabled={!newCategoryName.trim() || createQuickCategory.isPending}>Add</Button>
                      </div>
                      <ImageUpload value={newCategoryImage} onChange={setNewCategoryImage} />
                    </div>
                  )}
                </div>
                <Button className="w-full" onClick={handleAddQuickProduct} disabled={!newProductName.trim() || createQuickProduct.isPending}>
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
            {!products?.length && (
              <div className="col-span-full text-center py-10 text-slate-400">
                No products yet.<br />
                <span className="text-blue-500 font-medium">Click "Add Product" to create one.</span>
              </div>
            )}
            {filteredProducts.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart({ id: String(p.id), name: p.name || "", price: Number(p.salePrice || p.price || 0), sku: p.sku })}
                className="border-2 border-slate-200 rounded-lg p-3 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors active:scale-95"
              >
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-20 object-cover rounded-md mb-1.5" />
                ) : (
                  <div className="w-full h-20 rounded-md mb-1.5 bg-slate-100 flex items-center justify-center text-slate-300">
                    <Package className="h-8 w-8" />
                  </div>
                )}
                {p.category && <div className="text-[10px] text-slate-400 mb-1">{p.category}</div>}
                <div className="text-xs font-semibold text-slate-700 line-clamp-2 min-h-[32px]">{p.name}</div>
                <div className="text-sm font-bold text-emerald-600 mt-2">{currency} {Number(p.salePrice || p.price || 0).toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer + Cart */}
        <div className="w-1/2 p-4 overflow-y-auto">
          <h3 className="font-semibold text-slate-800 mb-3">Create Bill</h3>

          {/* Customer */}
          <div className="mb-3 relative" ref={custRef}>
            <Label className="text-xs">Customer Name</Label>
            <Input
              placeholder="Type customer name..."
              value={customerName}
              onChange={e => { setCustomerName(e.target.value); setCustDropdownOpen(e.target.value.length >= 2); }}
              onKeyDown={e => {
                if (!custDropdownOpen || !filteredCustomers.length) return;
                if (e.key === "ArrowDown") { e.preventDefault(); setCustFocus(prev => Math.min(prev + 1, filteredCustomers.length - 1)); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setCustFocus(prev => Math.max(prev - 1, 0)); }
                else if (e.key === "Enter" && custFocus >= 0) { e.preventDefault(); selectCustomer(filteredCustomers[custFocus]); }
                else if (e.key === "Escape") setCustDropdownOpen(false);
              }}
            />
            {custDropdownOpen && filteredCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-b-lg max-h-40 overflow-y-auto z-50 shadow-lg">
                {filteredCustomers.map((c, i) => (
                  <div key={c.id}
                    className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${i === custFocus ? "bg-blue-50" : ""}`}
                    onClick={() => selectCustomer({ id: c.id, name: c.name, address: c.address, vatNumber: c.vatNumber, phone: c.phone })}>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {c.vatNumber ? `VAT: ${c.vatNumber}` : ""} {c.address ? `· ${c.address}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1 mb-3">
            <Label className="text-xs">Phone</Label>
            <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1 mb-3">
            <Label className="text-xs">Address</Label>
            <Input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1 mb-3">
            <Label className="text-xs">Customer VAT Reg. No. (رقم ضريبي)</Label>
            <Input value={customerVat} onChange={e => setCustomerVat(e.target.value)} placeholder="e.g. 311777758600003" />
          </div>

          {/* Cart Items */}
          <div className="border-t pt-3 max-h-[300px] overflow-y-auto space-y-2">
            {cart.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">Cart is empty.<br />Select products or add custom item.</div>
            )}
            {cart.map((item, i) => (
              <div key={i} className="flex items-center gap-2 border-b pb-2">
                <input className="flex-1 min-w-0 border rounded px-2 py-1 text-xs font-medium"
                  value={item.name} onChange={e => updateItemName(i, e.target.value)} />
                <input type="number" className="w-16 text-center border rounded px-1 py-1 text-xs"
                  value={item.price} onChange={e => updatePrice(i, e.target.value)} />
                <button onClick={() => updateQty(i, -1)} className="w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100">
                  <Minus className="h-3 w-3" />
                </button>
                <input type="number" className="w-10 text-center border rounded px-1 py-1 text-xs"
                  value={item.qty} onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 1); setCart(prev => prev.map((it, idx) => idx === i ? { ...it, qty: v } : it)); }} />
                <button onClick={() => updateQty(i, 1)} className="w-6 h-6 border rounded flex items-center justify-center hover:bg-slate-100">
                  <Plus className="h-3 w-3" />
                </button>
                <div className="text-xs font-semibold text-slate-700 w-16 text-right">
                  {(item.price * item.qty).toFixed(2)}
                </div>
                <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>{currency} {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
              <span>Discount:</span>
              <Input type="number" className="w-20 h-7 text-xs text-right" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex justify-between"><span>VAT ({taxPercent}%):</span><span>{currency} {vat.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total:</span><span className="text-emerald-600">{currency} {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3">
            <Label className="text-xs">Note</Label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" className="h-8 text-xs" />
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="flex-1" onClick={handleSubmit} disabled={createInvoice.isPending || updateInvoice.isPending}>
              <Send className="h-4 w-4 mr-2" /> {editingInvoiceId ? "Update" : "Create Bill"}
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={!cart.length}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
