import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Building2, Receipt, Palette, Shield, Bot, Eye, EyeOff, LayoutDashboard, Grid, Check, Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TaxComplianceSettings } from "./TaxComplianceSettings";
import ThemeSelector from "@/components/ThemeSelector";
import { useLayoutTheme } from "@/providers/layoutTheme";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function SettingsPage() {
  const { data: settings, refetch } = trpc.settings.companySettingsGet.useQuery();
  const updateSettings = trpc.settings.companySettingsUpdate.useMutation({
    onSuccess: () => {
      refetch();
      setSaved(true);
      toast.success("Settings saved");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (e: any) => toast.error(e?.message || "Failed to save settings"),
  });
  const { data: taxRates } = trpc.settings.taxRateList.useQuery();
  const { data: currencies } = trpc.settings.currencyList.useQuery();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    companyName: "", companyNameAr: "", tradeName: "", email: "", phone: "", mobile: "", website: "",
    address: "", city: "", country: "Saudi Arabia", zipCode: "",
    taxNumber: "", crNumber: "", vatRate: "15", defaultCurrency: "SAR", invoiceTerms: "",
    logo: "", stamp: "", theme: "light",
    primaryColor: "#2563eb", secondaryColor: "#64748b", zatcaEnabled: false, zatcaSandbox: true,
  });

  useEffect(() => {
    if (settings) {
      setForm(prev => ({
        ...prev,
        companyName: settings.companyName ?? "",
        companyNameAr: settings.companyNameAr ?? "",
        tradeName: settings.tradeName ?? "",
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        mobile: settings.mobile ?? "",
        website: settings.website ?? "",
        address: settings.address ?? "",
        city: settings.city ?? "",
        country: settings.country ?? "Saudi Arabia",
        zipCode: settings.zipCode ?? "",
        taxNumber: settings.taxNumber ?? "",
        crNumber: settings.crNumber ?? "",
        vatRate: settings.vatRate ?? "15",
        defaultCurrency: settings.defaultCurrency ?? "SAR",
        invoiceTerms: settings.invoiceTerms ?? "",
        logo: settings.logo ?? "",
        stamp: settings.stamp ?? "",
        theme: settings.theme ?? "light",
        primaryColor: settings.primaryColor ?? "#2563eb",
        secondaryColor: settings.secondaryColor ?? "#64748b",
        zatcaEnabled: settings.zatcaEnabled ?? false,
        zatcaSandbox: settings.zatcaSandbox ?? true,
      }));
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Settings</h2><p className="text-slate-500">Configure your company and system preferences</p></div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2 hidden sm:inline" />Company</TabsTrigger>
          <TabsTrigger value="finance"><Receipt className="w-4 h-4 mr-2 hidden sm:inline" />Finance</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2 hidden sm:inline" />Appearance</TabsTrigger>
                    <TabsTrigger value="compliance"><Shield className="w-4 h-4 mr-2 hidden sm:inline" />Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Company Name</Label><Input value={form.companyName} placeholder="Al Watan Trading Co." onChange={e => setForm({...form, companyName: e.target.value})} /></div>
                <div><Label>Company Name (Arabic)</Label><Input value={form.companyNameAr} placeholder="شركة الوطن للتجارة" onChange={e => setForm({...form, companyNameAr: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Trade Name</Label><Input value={form.tradeName} placeholder="Retail / Branch Name" onChange={e => setForm({...form, tradeName: e.target.value})} /></div>
                <div className="flex gap-6">
                  <div><Label>Company Logo</Label><ImageUpload value={form.logo} onChange={(dataUrl) => setForm({...form, logo: dataUrl})} /><p className="text-xs text-slate-400 mt-1">Upload logo (PNG, JPG)</p></div>
                  <div><Label>Company Stamp / Signature</Label><ImageUpload value={form.stamp} onChange={(dataUrl) => setForm({...form, stamp: dataUrl})} /><p className="text-xs text-slate-400 mt-1">Upload stamp/seal (PNG with transparency)</p></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={form.email} placeholder="info@company.sa" onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} placeholder="+966-11-454-0000" onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Mobile / WhatsApp</Label><Input value={form.mobile} placeholder="+966-5x-xxx-xxxx" onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                <div><Label>Website</Label><Input value={form.website} placeholder="https://company.sa" onChange={e => setForm({...form, website: e.target.value})} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} placeholder="King Fahd Road, Riyadh" onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>City</Label><Input value={form.city} placeholder="Riyadh" onChange={e => setForm({...form, city: e.target.value})} /></div>
                <div><Label>Country</Label><Input value={form.country} placeholder="Saudi Arabia" onChange={e => setForm({...form, country: e.target.value})} /></div>
                <div><Label>Zip / Postal Code</Label><Input value={form.zipCode} placeholder="12211" onChange={e => setForm({...form, zipCode: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>VAT Number / Tax Number</Label><Input value={form.taxNumber} placeholder="300000000000003" onChange={e => setForm({...form, taxNumber: e.target.value})} /></div>
                <div><Label>CR Number</Label><Input value={form.crNumber} placeholder="1010123456" onChange={e => setForm({...form, crNumber: e.target.value})} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Financial Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><Label>Default VAT Rate (%)</Label><Input value={form.vatRate} onChange={e => setForm({...form, vatRate: e.target.value})} /></div>
                <div><Label>Default Currency</Label><Input value={form.defaultCurrency} onChange={e => setForm({...form, defaultCurrency: e.target.value})} /></div>
              </div>
              <div className="mb-6"><Label>Invoice Terms</Label><Input value={form.invoiceTerms} placeholder="Payment due on receipt. Goods sold are subject to VAT rules." onChange={e => setForm({...form, invoiceTerms: e.target.value})} /></div>
              <div className="mb-6 flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Enable Saudi ZATCA Invoice Readiness</Label>
                  <p className="text-xs text-slate-500">Adds Saudi VAT 15%, QR payload, XML archive fields, and ZATCA status to invoices.</p>
                </div>
                <Switch checked={form.zatcaEnabled} onCheckedChange={(v) => setForm({...form, zatcaEnabled: v})} />
              </div>
              <h4 className="font-medium mb-3">Tax Rates</h4>
              <div className="space-y-2">
                {taxRates?.map(tax => (
                  <div key={tax.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div><span className="font-medium">{tax.name}</span><span className="text-xs text-slate-500 ml-2">({tax.type})</span></div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{tax.rate}%</span>
                      {tax.isDefault && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Default</span>}
                    </div>
                  </div>
                ))}
              </div>
              <h4 className="font-medium mb-3 mt-6">Currencies</h4>
              <div className="space-y-2">
                {currencies?.map(curr => (
                  <div key={curr.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div><span className="font-medium">{curr.code}</span><span className="text-sm text-slate-500 ml-2">{curr.name}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{curr.symbol} {curr.exchangeRate}</span>
                      {curr.isBase && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Base</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="appearance" className="space-y-4">
            <LayoutThemeCard />
            <Card>
              <CardHeader><CardTitle>Theme Presets</CardTitle></CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Custom Colors</CardTitle></CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div><Label>Primary Color</Label><div className="flex items-center gap-2"><Input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} className="w-16 h-10 p-1" /><span className="text-sm text-slate-500">{form.primaryColor}</span></div></div>
                 <div><Label>Secondary Color</Label><div className="flex items-center gap-2"><Input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} className="w-16 h-10 p-1" /><span className="text-sm text-slate-500">{form.secondaryColor}</span></div></div>
               </div>
               <div><Label>Invoice Prefix</Label><Input defaultValue="INV-" /></div>
               <div><Label>PO Prefix</Label><Input defaultValue="PO-" /></div>
               <div><Label>Date Format</Label><Input defaultValue="DD/MM/YYYY" /></div>
             </CardContent>
           </Card>
         </TabsContent>


        <TabsContent value="compliance" className="space-y-4">
          <TaxComplianceSettings />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function LayoutThemeCard() {
  const { layoutTheme, setLayoutTheme } = useLayoutTheme();
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-blue-500" />
          {isAr ? "نمط لوحة التحكم" : "Dashboard Layout"}
        </CardTitle>
        <CardDescription>
          {isAr ? "اختر طريقة عرض القائمة الرئيسية" : "Choose how you navigate the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setLayoutTheme("sidebar")}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all hover:shadow-md ${
              layoutTheme === "sidebar"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-sm"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
            }`}
          >
            <div className={`rounded-xl p-3 ${layoutTheme === "sidebar" ? "bg-blue-100 dark:bg-blue-900 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>
              <LayoutDashboard className="size-8" />
            </div>
            <div>
              <p className="font-medium text-sm">{isAr ? "قائمة جانبية كلاسيكية" : "Classic Sidebar"}</p>
              <p className="text-xs text-slate-500 mt-1">{isAr ? "قائمة جانبية تقليدية" : "Traditional sidebar navigation"}</p>
            </div>
            {layoutTheme === "sidebar" && <Check className="size-5 text-blue-600" />}
          </button>
          <button
            type="button"
            onClick={() => setLayoutTheme("app_launcher")}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all hover:shadow-md ${
              layoutTheme === "app_launcher"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-sm"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
            }`}
          >
            <div className={`rounded-xl p-3 ${layoutTheme === "app_launcher" ? "bg-blue-100 dark:bg-blue-900 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>
              <Grid className="size-8" />
            </div>
            <div>
              <p className="font-medium text-sm">{isAr ? "شاشة التطبيقات" : "App Launcher"}</p>
              <p className="text-xs text-slate-500 mt-1">{isAr ? "أيقونات في شبكة" : "Icon grid home screen"}</p>
            </div>
            {layoutTheme === "app_launcher" && <Check className="size-5 text-blue-600" />}
          </button>
          <button
            type="button"
            onClick={() => setLayoutTheme("launcher_theme")}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all hover:shadow-md ${
              layoutTheme === "launcher_theme"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-sm"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
            }`}
          >
            <div className={`rounded-xl p-3 ${layoutTheme === "launcher_theme" ? "bg-blue-100 dark:bg-blue-900 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>
              <Rocket className="size-8" />
            </div>
            <div>
              <p className="font-medium text-sm">{isAr ? "ثيم المشغل" : "Launcher Theme"}</p>
              <p className="text-xs text-slate-500 mt-1">{isAr ? "واجهة تطبيقات ثلاثية الأبعاد" : "3D app launcher dashboard"}</p>
            </div>
            {layoutTheme === "launcher_theme" && <Check className="size-5 text-blue-600" />}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

