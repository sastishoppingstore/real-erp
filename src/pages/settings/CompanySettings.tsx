import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import ActionButton3D from "@/components/ui/ActionButton3D";
import { Building2, Save, Upload, Stamp } from "lucide-react";

async function fileToScaledDataUrl(file: File, max = 420): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      const ctx = cv.getContext("2d")!;
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      res(cv.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
}

export default function CompanySettingsPage() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.company.getSettings.useQuery(undefined);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  if (settings && !loaded && !isLoading) {
    setLoaded(true);
    setForm({
      nameEn: (settings as any).nameEn || "", nameAr: (settings as any).nameAr || "",
      vatNo: (settings as any).vatNo || "", crNo: (settings as any).crNo || "",
      address: (settings as any).address || "", email: (settings as any).email || "",
      phone: (settings as any).phone || "", unifiedNationalNo: (settings as any).unifiedNationalNo || "",
      logoUrl: (settings as any).logoUrl || "", stampUrl: (settings as any).stampUrl || "",
    });
  }
  const saveMut = trpc.company.saveSettings.useMutation({
    onSuccess: () => utils.company.getSettings.invalidate(),
  });

  async function pick(field: "logoUrl" | "stampUrl", f?: File | null) {
    if (!f) return;
    const url = await fileToScaledDataUrl(f, field === "stampUrl" ? 360 : 420);
    setForm((p) => ({ ...p, [field]: url }));
  }

  const F = (k: string) => ({
    value: form[k] || "",
    onChange: (e: any) => setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Company Settings</h2>
          <p className="text-slate-500">Yeh details invoices par company header aur stamp ke tor par print hongi.</p>
        </div>
        <ActionButton3D icon={<Save className="size-4" />} label={saveMut.isPending ? "Saving…" : "Save"} color="green"
          onClick={() => saveMut.mutate(form as any)} />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="size-4" /> Company Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><Label>Name (English)</Label><Input {...F("nameEn")} placeholder="YAFCO AL ARABIAH EST." /></div>
          <div><Label dir="rtl">الاسم (عربي)</Label><Input dir="rtl" {...F("nameAr")} placeholder="مؤسسة يافكو العربية" /></div>
          <div><Label>VAT No</Label><Input {...F("vatNo")} placeholder="4700012896" /></div>
          <div><Label>CR No</Label><Input {...F("crNo")} placeholder="300995897900003" /></div>
          <div><Label>Unified National No (stamp)</Label><Input {...F("unifiedNationalNo")} placeholder="7011789505" /></div>
          <div><Label>Phone</Label><Input {...F("phone")} placeholder="+966…" /></div>
          <div className="md:col-span-2"><Label>Address</Label><Input {...F("address")} placeholder="Saudi Arabia - Yanbu Al Bahr…" /></div>
          <div className="md:col-span-2"><Label>Email</Label><Input type="email" {...F("email")} placeholder="info@company.com.sa" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Logo & Official Stamp</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {(["logoUrl", "stampUrl"] as const).map((field) => (
            <div key={field} className="rounded-lg border p-4 text-center">
              <Label className="mb-2 block">{field === "logoUrl" ? "Company Logo" : "Official Stamp (round)"}</Label>
              <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-lg border bg-white">
                {form[field]
                  ? <img src={form[field]} alt={field} className="max-h-full max-w-full object-contain"
                      style={field === "stampUrl" ? { borderRadius: "50%" } : undefined} />
                  : field === "stampUrl" ? <Stamp className="size-8 text-slate-300" /> : <Building2 className="size-8 text-slate-300" />}
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
                <Upload className="size-4" /> Upload
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => pick(field, e.target.files?.[0])} />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
      {saveMut.isSuccess && !saveMut.isPending && <p className="text-sm text-emerald-600">Saved ✓ — ab invoices par yehi details print hongi.</p>}
      {saveMut.error && <p className="text-sm text-red-600">Error: {String((saveMut.error as any)?.message)}</p>}
    </div>
  );
}
