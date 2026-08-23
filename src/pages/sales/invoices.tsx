import { FormEvent, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { generateInvoiceHtml } from "@/lib/invoiceHtml";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/ImageUpload";

type CartItem = { id: string; name: string; nameAr?: string; price: number; qty: number; sku?: string; discountPercent?: number; unit?: string };
type InvoiceMode = "product" | "service" | "construction";

// Sub-component to render invoice preview (WYSIWYG - same HTML as print)
function InvoicePreview({ detail, companyData }: { detail: any; companyData: any }) {
  if (!detail?.invoice) return null;
  const dInv = detail.invoice;
  const dItems = (detail.items || []).map((it: any, i: number) => ({
    no: i + 1, name: it.description || `Item #${it.productId || it.id}`,
    qty: Number(it.quantity || 1), rate: Number(it.unitPrice || 0), total: Number(it.totalAmount || 0),
  }));
  const dCust = detail.customer;
  const pSub = Number(dInv.subTotal || 0);
  const pDisc = Number(dInv.discountAmount || 0);
  const pVat = Number(dInv.taxAmount || 0);
  const pTotal = Number(dInv.totalAmount || 0);
  const pCustName = dCust?.name || dCust?.nameAr || "Walk-in Customer";
  const pCustNameAr = dCust?.nameAr || "";
  const pCustPhone = dCust?.phone || "";
  const pCustAddr = dCust?.address || "";
  const pCustAddrAr = dCust?.addressAr || "";
  const pCustVat = dCust?.vatNumber || dCust?.taxNumber || "";
  const pCustCr = dCust?.crNumber || "";
  const pType = dInv.invoiceType === "zatca" ? "zatca" : "standard";
  const printItemsWithAr = (detail.items || []).map((it: any, i: number) => ({
    no: i + 1, name: it.description || `Item #${it.productId || it.id}`,
    nameAr: it.descriptionAr || "",
    qty: Number(it.quantity || 1), rate: Number(it.unitPrice || 0), total: Number(it.totalAmount || 0),
  }));
  const html = generateInvoiceHtml({
    companyName: companyData.companyName || "Company Name",
    companyNameAr: companyData.companyNameAr || "",
    companyLogo: companyData.companyLogo || "",
    companyStamp: companyData.companyStamp || "",
    companyAddress: companyData.companyAddress || "",
    companyPhone: companyData.companyPhone || "",
    companyVat: companyData.companyVat || "",
    companyCr: companyData.companyCr || "",
    companyEmail: companyData.companyEmail || "",
    companyWebsite: companyData.companyWebsite || "",
    currency: companyData.currency || "SAR",
    taxPercent: dInv.taxPercent || "15",
    note: dInv.notes || "",
    noteAr: dInv.notesAr || "",
    pSub, pDisc, pVat, pTotal,
    pCustName, pCustNameAr, pCustPhone, pCustAddr, pCustAddrAr, pCustVat, pCustCr, pType, printItems: printItemsWithAr
  });
  return (
    <div
      className="invoice-preview-container"
      style={{ minHeight: "85vh" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const { data: invoices, refetch } = trpc.sales.invoiceList.useQuery(undefined);
  const { data: customers } = trpc.sales.customerList.useQuery(undefined);
  const { data: products, refetch: refetchProducts } = trpc.inventory.productList.useQuery(undefined);
  const { data: categories, refetch: refetchCategories } = trpc.inventory.categoryList.useQuery(undefined);
  const { data: settings } = trpc.settings.companySettingsGet.useQuery(undefined);
  // Force company settings to load on mount (fixes Tauri desktop not loading settings)
  const { data: freshSettings } = trpc.settings.companySettingsGet.useQuery(undefined, { staleTime: 0, refetchOnMount: true });

  const createInvoice = trpc.sales.invoiceCreate.useMutation({
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast.success("Bill created");
      clearCart();
      const newId = data?.id;
      if (newId && customerEmail.trim()) {
        emailSend.mutate({ invoiceId: newId, to: customerEmail.trim() });
      }
      if (newId) {
        setTimeout(() => openViewInvoice(newId), 400);
      }
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || error?.message || "Network or Server Error";
      toast.error(errorMsg);
    },
  });
  const updateInvoice = trpc.sales.invoiceUpdate.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['sales', 'invoiceList']] });
      queryClient.invalidateQueries({ queryKey: [['sales', 'invoiceGet']] });
      toast.success("Invoice updated");
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || error?.message || "Network or Server Error";
      toast.error(errorMsg);
    },
  });
  const deleteInvoiceMut = trpc.sales.invoiceDelete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['sales', 'invoiceList']] });
      queryClient.invalidateQueries({ queryKey: [['sales', 'invoiceGet']] });
      toast.success("Invoice deleted");
      setViewInvoiceId(null);
    },
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
  const emailSend = trpc.emails.sendInvoice.useMutation({ onSuccess: () => toast.success("Invoice sent via email"), onError: (e) => toast.error("Email failed: " + e.message) });
  const createQuickProduct = trpc.inventory.productCreate.useMutation({
    onSuccess: () => { refetchProducts(); toast.success("Product added"); },
    onError: (e) => toast.error(e.message),
  });
  const createQuickCategory = trpc.inventory.categoryCreate.useMutation({
    onSuccess: () => { refetchCategories(); toast.success("Category created"); },
    onError: (e) => toast.error(e.message),
  });
  const thermalPrint = trpc.thermalPrint.generateThermal.useMutation({
    onSuccess: (data) => {
      try {
        const binary = atob(data.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${data.format}.bin`;
        link.click();
        toast.success(`Thermal receipt (${data.format}) ready to print`);
      } catch (e) {
        toast.error("Failed to process thermal data");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [customerNameAr, setCustomerNameAr] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerAddressAr, setCustomerAddressAr] = useState("");
  const [customerVat, setCustomerVat] = useState("");
  const [customerCr, setCustomerCr] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [noteAr, setNoteAr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [custDropdownOpen, setCustDropdownOpen] = useState(false);
  const [custFocus, setCustFocus] = useState(-1);
  const custRef = useRef<HTMLDivElement>(null);

  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewTab, setViewTab] = useState<"create" | "history">("create");
  const [invoiceTypeMode, setInvoiceTypeMode] = useState<"standard" | "zatca">("standard");
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
  const invoiceDetail = trpc.sales.invoiceGet.useQuery({ id: (viewInvoiceId ?? editTargetId)! }, { enabled: !!viewInvoiceId || !!editTargetId });

  const currency = settings?.defaultCurrency || "SAR";
  const taxPercent = Number(settings?.vatRate ?? 15);
  const companyName = settings?.companyName || settings?.companyNameAr || "Company Name";
  const companyNameAr = settings?.companyNameAr || "";
  const companyAddress = settings?.address || "";
  const companyPhone = settings?.phone || "";
  const companyVat = settings?.taxNumber || settings?.vatNumber || "";
  const companyCr = settings?.crNumber || "";
  const companyEmail = settings?.email || "";
  const companyWebsite = settings?.website || "";
  const companyLogo = settings?.logo || "";
  const companyStamp = settings?.stamp || "";
  const companyCountry = settings?.country || "";

  const safePrice = (p: number) => Number.isNaN(p) ? 0 : p;
  const subtotal = cart.reduce((s, i) => s + safePrice(i.price) * i.qty, 0);
  const taxable = Math.max(0, subtotal - discount);
  const vat = taxable * taxPercent / 100;
  const total = taxable + vat;

  const filteredProducts = (products || []).filter(p =>
    !searchQuery || (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustomers = (customers || []).filter(c => {
    if (!customerName && !customerNameAr) return false;
    const q = (customerName || "").toLowerCase();
    const qAr = (customerNameAr || "").toLowerCase();
    return (!q || (c.name || "").toLowerCase().includes(q) || (c.nameAr || "").toLowerCase().includes(q))
      && (!qAr || (c.nameAr || "").toLowerCase().includes(qAr));
  }).slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (custRef.current && !custRef.current.contains(e.target as Node)) {
        setCustDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Load invoice for editing
  useEffect(() => {
    if (!editTargetId) return;
    const d = invoiceDetail.data;
    if (!d || !d.invoice || d.invoice.id !== editTargetId) return;
    const inv = d.invoice;
    setEditingInvoiceId(inv.id);
    setEditTargetId(null);
    setViewTab("create");
    setCart((d.items || []).map((it: any, i: number) => ({
      id: String(it.productId || `-${i}`),
      name: (it.description || "Item").replace(/^\[\d+\]\s*/, ""),
      price: Number(it.unitPrice || 0),
      qty: Number(it.quantity || 1),
      sku: it.sku,
    })));
    setCustomerId(d.customer?.id || 0);
    setCustomerName(d.customer?.name || "");
    setCustomerPhone(d.customer?.phone || "");
    setCustomerAddress(d.customer?.address || "");
    setCustomerVat(d.customer?.vatNumber || d.customer?.taxNumber || "");
    setCustomerEmail(d.customer?.email || "");
    setDiscount(Number(inv.discountAmount || 0));
    setNote(inv.notes || "");
  }, [editTargetId, invoiceDetail.data]);

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
    // Allow empty while typing; strip leading zeros (fixes "0500" bug)
    if (value === "" || value === "0" || value === "0.00") {
      setCart(prev => prev.map((item, i) => i === index ? { ...item, price: value === "" ? NaN : 0 } : item));
      return;
    }
    const cleaned = value.replace(/^0+(?=\d)/, "");
    const num = parseFloat(cleaned);
    setCart(prev => prev.map((item, i) => i === index ? { ...item, price: isNaN(num) ? 0 : Math.max(0, num) } : item));
  };
  const updateItemName = (index: number, value: string) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, name: value } : item));
  };
  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };
  const clearCart = () => {
    setCart([]); setCustomerId(0); setCustomerName(""); setCustomerNameAr(""); setCustomerPhone("");
    setCustomerAddress(""); setCustomerAddressAr(""); setCustomerVat(""); setCustomerCr(""); setDiscount(0); setNote(""); setNoteAr("");
  };
  const selectCustomer = (c: { id: number; name: string; nameAr?: string; address?: string; addressAr?: string; vatNumber?: string; crNumber?: string; phone?: string }) => {
    setCustomerId(c.id); setCustomerName(c.name || ""); setCustomerNameAr(c.nameAr || "");
    setCustomerAddress(c.address || ""); setCustomerAddressAr(c.addressAr || "");
    setCustomerVat(c.vatNumber || ""); setCustomerCr(c.crNumber || ""); setCustomerPhone(c.phone || ""); setCustDropdownOpen(false);
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

  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const addCustomItem = () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);
    if (!name || isNaN(price) || price < 0) { toast.error("Enter item name and a valid price"); return; }
    const qty = Math.max(1, parseFloat(newItemQty) || 1);
    setCart(prev => [...prev, { id: `custom-${Date.now()}`, name, price, qty, sku: undefined, unit: newItemUnit }]);
    setNewItemName(""); setNewItemQty("1"); setNewItemPrice(""); setNewItemUnit("pcs");
    setAddItemDialogOpen(false);
    toast.success("Item added to cart");
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
    if (!cart.length) { toast.error("Add at least one item to the cart"); return; }
    try {
      const items = cart.map(item => ({
        description: `[${item.id}] ${item.name}`,
        quantity: item.qty,
        unitPrice: item.price.toString(),
        taxPercent: taxPercent.toString(),
        totalAmount: (item.price * item.qty).toFixed(2),
        unit: item.unit || "pcs", sku: item.sku,
      }));
      const payload = {
        invoiceNumber: `BILL-${Date.now().toString().slice(-6)}`,
        customerId: customerId || 0,
        customerName: customerName.trim() || undefined,
        customerNameAr: customerNameAr.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        customerAddressAr: customerAddressAr.trim() || undefined,
        customerVat: customerVat.trim() || undefined,
        customerCr: customerCr.trim() || undefined,
        date: new Date().toISOString().slice(0, 10), dueDate: "",
        invoiceType: invoiceTypeMode, invoiceMode: "product" as InvoiceMode,
        subTotal: subtotal.toFixed(2), taxAmount: vat.toFixed(2),
        taxPercent: taxPercent.toString(), totalAmount: total.toFixed(2),
        discountAmount: discount.toString(), taxableAmount: taxable.toFixed(2),
        notes: note, notesAr: noteAr, items,
      };
      if (editingInvoiceId) {
        updateInvoice.mutate({ id: editingInvoiceId, ...payload });
      } else {
        createInvoice.mutate(payload);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "Network or Server Error";
      toast.error(errorMsg);
    }
  };

  // A4 Print handler - uses shared HTML generator
  const handlePrint = () => {
    const useDetail = !!viewInvoiceId && !!invoiceDetail.data;
    const detailInvoice = useDetail ? invoiceDetail.data!.invoice : null;
    const detailItems = useDetail ? (invoiceDetail.data!.items || []) : [];
    const detailCustomer = useDetail ? invoiceDetail.data!.customer : null;

    const printItems = useDetail
      ? detailItems.map((it: any, i: number) => ({
          no: i + 1, name: it.description || `Item #${it.productId || it.id}`,
          nameAr: it.descriptionAr || "",
          qty: Number(it.quantity || 1), rate: Number(it.unitPrice || 0), total: Number(it.totalAmount || 0),
        }))
      : cart.map((item, i) => ({ no: i + 1, name: item.name, nameAr: item.nameAr, qty: item.qty, rate: item.price, total: item.price * item.qty }));
    if (printItems.length === 0) { toast.error("Add items to cart before printing"); return; }

    const pSub = useDetail ? Number(detailInvoice?.subTotal || 0) : subtotal;
    const pDisc = useDetail ? Number(detailInvoice?.discountAmount || 0) : discount;
    const pVat = useDetail ? Number(detailInvoice?.taxAmount || 0) : vat;
    const pTotal = useDetail ? Number(detailInvoice?.totalAmount || 0) : total;
    const pCustName = useDetail ? (detailCustomer?.name || detailCustomer?.nameAr || "Walk-in Customer") : (customerName || "Walk-in Customer");
    const pCustNameAr = useDetail ? (detailCustomer?.nameAr || "") : customerNameAr;
    const pCustPhone = useDetail ? detailCustomer?.phone : customerPhone;
    const pCustAddr = useDetail ? detailCustomer?.address : customerAddress;
    const pCustAddrAr = useDetail ? detailCustomer?.addressAr : customerAddressAr;
    const pCustVat = useDetail ? (detailCustomer?.vatNumber || detailCustomer?.taxNumber) : customerVat;
    const pCustCr = useDetail ? detailCustomer?.crNumber : customerCr;
    const pType = useDetail ? (detailInvoice?.invoiceType === "zatca" ? "zatca" : "standard") : invoiceTypeMode;

    const html = generateInvoiceHtml({
      companyName, companyNameAr, companyLogo, companyStamp, companyAddress, companyPhone, companyVat, companyCr, companyEmail, companyWebsite,
      currency, taxPercent, note, noteAr: useDetail ? detailInvoice?.notesAr : noteAr, pSub, pDisc, pVat, pTotal,
      pCustName, pCustNameAr, pCustPhone, pCustAddr, pCustAddrAr, pCustVat, pCustCr, pType, printItems
    });

    // Tauri/desktop fix: use hidden iframe for printing instead of window.open
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    } else {
      // Fallback for Tauri: create blob and write to temp file
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  // Word (.docx) export function - calls backend API
  const handleWordExport = async (inv: any) => {
    if (!inv) return;
    try {
      const res = await fetch(`/api/word-export/${inv.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to generate Word document");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${inv.invoiceNumber}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e: any) {
      toast.error("Word export failed: " + e.message);
    }
  };

  const handleWhatsAppFromView = () => {
    if (!detail?.invoice) return;
    const inv = detail.invoice;
    const custName = detail.customer?.name || "Walk-in Customer";
    const total = Number(inv.totalAmount || 0).toFixed(2);
    const msg = `*${companyName}*\n*Invoice: ${inv.invoiceNumber}*\nCustomer: ${custName}\nTotal: ${currency} ${total}\nDate: ${inv.date}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    // Anchor click works in both web and Tauri webview
    const a = document.createElement("a");
    a.href = waUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    sendWhatsAppInvoice.mutate({ invoiceId: inv.id });
  };

  const handleEmailFromView = () => {
    if (!detail?.invoice) return;
    const inv = detail.invoice;
    const to = detail.customer?.email || "";
    if (!to) {
      toast.error("No customer email. Add email to customer record first.");
      return;
    }
    emailSend.mutate({ invoiceId: inv.id, to });
  };

  // Delete from view dialog
  const handleDeleteFromView = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMut.mutate(id);
    }
  };

  // View invoice handler
  const openViewInvoice = (id: number) => {
    setViewInvoiceId(id);
    setEditingInvoiceId(null);
    setCart([]);
    setCustomerId(0);
    setCustomerName("");
    setCustomerNameAr("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerAddressAr("");
    setCustomerVat("");
    setCustomerCr("");
    setCustomerEmail("");
    setDiscount(0);
    setNote("");
    setNoteAr("");
  };

  // Load invoice for editing
  const loadInvoiceForEdit = (id: number) => {
    setEditTargetId(id);
    setViewInvoiceId(null);
  };

  // Print invoice handler
  const handlePrintInvoice = (invId: number, printType: "thermal" | "a4" = "a4") => {
    if (printType === "thermal") {
      thermalPrint.mutate({ invoiceId: invId, format: "80mm" });
    } else {
      setViewInvoiceId(invId);
    }
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
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="p-4 border-b bg-white flex-none">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold">Invoices / فواتير</h2>
            <p className="text-slate-500 text-sm">{filtered.length} invoices</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button type="button" onClick={() => { setViewTab("create"); setViewInvoiceId(null); setEditingInvoiceId(null); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewTab === "create" ? "bg-white shadow text-blue-700" : "text-slate-500 hover:text-slate-700"}`}>
                Create Bill
              </button>
              <button type="button" onClick={() => setViewTab("history")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewTab === "history" ? "bg-white shadow text-blue-700" : "text-slate-500 hover:text-slate-700"}`}>
                Invoice History ({filtered.length})
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { clearCart(); setEditingInvoiceId(null); setViewInvoiceId(null); setViewTab("create"); }}>New Bill</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {viewTab === "create" && (
        <div className="flex-1 flex min-h-0 w-full">
          {/* Left: Customer Details */}
          <div className="w-72 border-r bg-white p-3 space-y-2 overflow-y-auto flex-none">
            <div className="relative" ref={custRef}>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Customer / العميل</Label>
              <Input value={customerName} onChange={e => { setCustomerName(e.target.value); setCustDropdownOpen(true); }} onFocus={() => setCustDropdownOpen(true)} placeholder="Type customer name..." className="h-7 text-xs" />
              {custDropdownOpen && filteredCustomers.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button key={c.id} type="button" onClick={() => selectCustomer(c)} className="w-full text-left px-2 py-1.5 hover:bg-blue-50 border-b border-gray-100 last:border-0">
                      <div className="text-xs font-semibold text-slate-700">{c.name}{c.nameAr ? ` / ${c.nameAr}` : ''}</div>
                      <div className="text-[10px] text-slate-500">{c.phone || ''} {c.vatNumber ? `• VAT: ${c.vatNumber}` : ''}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Customer Name (Arabic) / اسم العميل</Label>
              <Input dir="rtl" value={customerNameAr} onChange={e => setCustomerNameAr(e.target.value)} placeholder="اسم العميل..." className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Phone</Label>
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+966..." className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Address</Label>
              <Input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Address..." className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Address (Arabic) / العنوان بالعربي</Label>
              <Input dir="rtl" value={customerAddressAr} onChange={e => setCustomerAddressAr(e.target.value)} placeholder="العنوان بالعربي..." className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">VAT No</Label>
              <Input value={customerVat} onChange={e => setCustomerVat(e.target.value)} placeholder="300000000000003" className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">CR No</Label>
              <Input value={customerCr} onChange={e => setCustomerCr(e.target.value)} placeholder="CR number" className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Email (auto-send bill)</Label>
              <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="customer@email.com" className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Notes / ملاحظات</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Additional notes..." className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Notes (Arabic) / ملاحظات إضافية</Label>
              <Input dir="rtl" value={noteAr} onChange={e => setNoteAr(e.target.value)} placeholder="ملاحظات إضافية..." className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Discount</Label>
              <Input type="number" className="w-20 h-7 text-xs text-right" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Center: Products */}
          <div className="flex-1 p-3 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase">Products / المنتجات</h3>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setAddItemDialogOpen(true); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item / اضافة بند
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {products?.map(p => (
                <button key={p.id} onClick={() => addToCart(p as any)}
                  className="border-2 border-slate-200 rounded-lg p-2 text-left hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="text-xs font-bold text-slate-700 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.sku}</div>
                  <div className="text-sm font-bold text-blue-600">{currency} {Number(p.salePrice).toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Cart Summary with Sticky Footer */}
          <div className="w-80 border-l bg-white flex flex-col flex-none">
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              <h3 className="font-semibold text-slate-800 text-sm">Cart</h3>
              {cart.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No items in cart</p>
              ) : cart.map((item, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <input className="flex-1 border rounded px-1 py-0.5 text-xs" value={item.name}
                      onChange={e => updateItemName(i, e.target.value)} title="Edit name" />
                    <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700" title="Remove">×</button>
                  </div>
                  {item.nameAr && <div dir="rtl" className="text-[11px] text-slate-500">{item.nameAr}</div>}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span>Qty / الكمية:</span>
                    <input type="number" min={1} value={String(item.qty)} onFocus={e => { if (e.target.value === "1") e.target.select(); }} onChange={e => { const raw = e.target.value.replace(/^0+(?=\d)/, ""); const v = Math.max(1, parseInt(raw) || 1); setCart(prev => prev.map((it, j) => j === i ? { ...it, qty: v } : it)); }} className="w-12 border rounded px-1 py-0.5 text-right" />
                    <span>Rate/Hour / سعر الساعة:</span>
                    <input type="number" min={0} placeholder="0" value={Number.isNaN(item.price) ? "" : item.price} onFocus={e => e.target.select()} onChange={e => updatePrice(i, e.target.value)} className="w-16 border rounded px-1 py-0.5 text-right" />
                    <span className="ml-auto font-bold">{(safePrice(item.price) * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Sticky Footer - INSIDE the cart column */}
            <div className="flex-none border-t bg-white p-3 shadow-md z-10">
              <div className="space-y-1 text-xs mb-3">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal:</span><span className="font-semibold">{currency} {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">VAT ({taxPercent}%):</span><span className="font-semibold">{currency} {vat.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-sm border-t pt-1"><span>TOTAL:</span><span>{currency} {total.toFixed(2)}</span></div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createInvoice.isPending || updateInvoice.isPending || cart.length === 0}>
                <Send className="h-4 w-4 mr-2" /> {editingInvoiceId ? "Update" : "Create Bill"}
              </Button>
            </div>
          </div>
        </div>
        )}

        {viewTab === "history" && (
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No invoices found.</div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(inv => (
                <div key={inv.id} className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-blue-700">{inv.invoiceNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || "bg-slate-100 text-slate-700"}`}>{inv.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{new Date(inv.date).toLocaleDateString()} · {inv.invoiceType}</div>
                  <div className="text-sm text-slate-700 mb-1">{inv.customerName || "Walk-in Customer"}</div>
                  <div className="text-lg font-bold text-emerald-600 mb-3">{currency} {Number(inv.totalAmount || 0).toFixed(2)}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openViewInvoice(inv.id)}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => loadInvoiceForEdit(inv.id)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handlePrintInvoice(inv.id, "a4")} title="A4 PDF">
                      📄 A4
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handlePrintInvoice(inv.id, "thermal")} disabled={thermalPrint.isPending} title="80mm Receipt">
                      🖨️ 80mm
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:border-red-300" onClick={() => handleDeleteInvoice(inv.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {/* View Invoice Dialog — FULL SCREEN with WYSIWYG (same HTML as print) */}
      <Dialog open={!!viewInvoiceId} onOpenChange={(o) => { if (!o) { setViewInvoiceId(null); setEditTargetId(null); } }}>
        <DialogContent data-invoice-view="true" className="overflow-hidden flex flex-col p-0" aria-describedby="invoice-view-desc">
          <DialogTitle className="sr-only">Invoice View</DialogTitle>
          <p id="invoice-view-desc" className="sr-only">Invoice details with actions: edit, print, delete, send via WhatsApp</p>

          {/* Sticky Action Bar */}
          <div className="flex items-center justify-between p-4 border-b bg-white shrink-0 shadow-sm">
            <h2 className="text-lg font-bold">Invoice {detail?.invoice?.invoiceNumber || "Loading..."}</h2>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="default" onClick={handlePrint} disabled={invoiceDetail.isPending || !detail?.invoice || thermalPrint.isPending} title="Print A4 PDF">
                📄 A4 Print
              </Button>
              <Button size="sm" variant="outline" disabled={invoiceDetail.isPending || !detail?.invoice} onClick={() => detail?.invoice && handleWordExport(detail.invoice)} title="Export to Word">
                📝 Word
              </Button>
              <Button size="sm" variant="outline" onClick={() => detail?.invoice && loadInvoiceForEdit(detail.invoice.id)} disabled={invoiceDetail.isPending || !detail?.invoice}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={handleWhatsAppFromView} disabled={!detail?.invoice}>
                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
              </Button>
              <Button size="sm" variant="outline" onClick={handleEmailFromView} disabled={!detail?.invoice || emailSend.isPending} title="Send invoice via email">
                ✉️ {emailSend.isPending ? "..." : "Email"}
              </Button>
              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:border-red-300" onClick={() => detail?.invoice && handleDeleteFromView(detail.invoice.id)} disabled={!detail?.invoice}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setViewInvoiceId(null); setEditTargetId(null); }}>
                ✕ Close
              </Button>
            </div>
          </div>

          {/* Scrollable Invoice Content — WYSIWYG with same HTML as print */}
          <DialogDescription id="invoice-view-desc" className="sr-only">Invoice preview - what you see is what you print</DialogDescription>
          <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
            {detail?.invoice && !invoiceDetail.isPending && (
              <InvoicePreview detail={detail} companyData={{ companyName, companyNameAr, companyLogo, companyStamp, companyAddress, companyPhone, companyVat, currency }} />
            )}
            {!detail?.invoice && !invoiceDetail.isPending && (
              <div className="py-16 text-center text-slate-400">Loading invoice...</div>
            )}
            {invoiceDetail.isPending && (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
                Loading invoice details...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Item Dialog — lets user add a line item even when no products exist yet (hourly/service items etc.) */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Item / اضافة بند</DialogTitle>
            <DialogDescription>Type a custom item (e.g. hourly labor, service) — no product needed.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Description / الوصف</Label>
              <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g. Hourly labor / الخدمة الساعية" className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Qty</Label><Input type="number" min={1} value={newItemQty} onChange={e => setNewItemQty(e.target.value)} className="h-8" /></div>
              <div className="col-span-2"><Label>Rate</Label><Input type="number" min={0} value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="0.00" className="h-8" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Unit / الوحدة</Label><Input value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} className="h-8" /></div>
              <div className="col-span-1 flex items-end"><Label className="text-xs text-slate-400">{currency}</Label></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={addCustomItem}>Add to Cart</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
