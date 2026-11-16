/**
 * Decoration & Construction — invoice quick-create + ZATCA output actions.
 * Used by the launcher (New Invoice box) and the Billing page.
 */
import { useMemo, useState, type ReactNode } from "react";
import { FileSpreadsheet, FileText, FileCode2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useDeco, money, StatusPill } from "./shared";
import { downloadBase64, downloadText, printInvoiceDoc, type InvoiceDoc } from "./invoiceDoc";

const BILLING_TYPES = [
  "advance", "progress", "final", "retention_release", "variation", "material", "labour", "service", "rental",
] as const;

/* ════════════════════════════════════════════════════════════════════════════
 * Quick create (also used from the launcher)
 * ════════════════════════════════════════════════════════════════════════════ */
export function QuickInvoiceDialog({
  trigger,
  onCreated,
}: {
  trigger: ReactNode;
  onCreated?: () => void;
}) {
  const { L } = useDeco();
  const [open, setOpen] = useState(false);
  const projectsQ = trpc.decoration.projectList.useQuery(undefined, { enabled: open });
  const clientsQ = trpc.decoration.clientList.useQuery(undefined, { enabled: open });
  const utils = trpc.useUtils();
  const create = trpc.decoration.invoiceCreate.useMutation({
    onSuccess: async () => {
      await utils.decoration.invoiceList.invalidate();
      await utils.decoration.decorationDashboard.invalidate();
      setOpen(false);
      onCreated?.();
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    projectId: "", clientId: "", invoiceType: "tax", billingType: "progress",
    invoiceDate: today, dueDate: "", subtotal: "0", discountAmount: "0",
    retentionAmount: "0", advanceRecovery: "0", penaltyAmount: "0", vatPercent: "15",
  });

  const totals = useMemo(() => {
    const sub = Number(form.subtotal || 0);
    const net = sub - Number(form.discountAmount || 0) - Number(form.retentionAmount || 0)
      - Number(form.advanceRecovery || 0) - Number(form.penaltyAmount || 0);
    const vat = net * (Number(form.vatPercent || 0) / 100);
    return { sub, net, vat, total: net + vat };
  }, [form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{L("New invoice", "فاتورة جديدة")}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({
              projectId: form.projectId ? Number(form.projectId) : undefined,
              clientId: form.clientId ? Number(form.clientId) : undefined,
              invoiceType: form.invoiceType as any,
              billingType: form.billingType as any,
              invoiceDate: form.invoiceDate,
              dueDate: form.dueDate || undefined,
              subtotal: form.subtotal,
              discountAmount: form.discountAmount,
              retentionAmount: form.retentionAmount,
              advanceRecovery: form.advanceRecovery,
              penaltyAmount: form.penaltyAmount,
              vatPercent: form.vatPercent,
            });
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>{L("Project", "المشروع")}</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">—</option>
                {(projectsQ.data ?? []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.projectCode} — {p.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{L("Client", "العميل")}</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="">—</option>
                {(clientsQ.data ?? []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{L("Invoice type", "نوع الفاتورة")}</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.invoiceType}
                onChange={(e) => setForm({ ...form, invoiceType: e.target.value })}
              >
                <option value="tax">{L("Tax invoice", "فاتورة ضريبية")}</option>
                <option value="simplified">{L("Simplified tax invoice", "فاتورة ضريبية مبسطة")}</option>
                <option value="credit_note">{L("Credit note", "إشعار دائن")}</option>
                <option value="debit_note">{L("Debit note", "إشعار مدين")}</option>
              </select>
            </div>
            <div>
              <Label>{L("Billing type", "نوع الفوترة")}</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.billingType}
                onChange={(e) => setForm({ ...form, billingType: e.target.value })}
              >
                {BILLING_TYPES.map((b) => <option key={b} value={b}>{b.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <Label>{L("Invoice date", "تاريخ الفاتورة")}</Label>
              <Input type="date" required value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} />
            </div>
            <div>
              <Label>{L("Due date", "تاريخ الاستحقاق")}</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <Label>{L("Subtotal (SAR)", "المجموع الفرعي (ريال)")}</Label>
              <Input type="number" step="0.01" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} />
            </div>
            <div>
              <Label>{L("Discount", "الخصم")}</Label>
              <Input type="number" step="0.01" value={form.discountAmount} onChange={(e) => setForm({ ...form, discountAmount: e.target.value })} />
            </div>
            <div>
              <Label>{L("Retention", "المحتجز")}</Label>
              <Input type="number" step="0.01" value={form.retentionAmount} onChange={(e) => setForm({ ...form, retentionAmount: e.target.value })} />
            </div>
            <div>
              <Label>{L("Advance recovery", "استرداد الدفعة المقدمة")}</Label>
              <Input type="number" step="0.01" value={form.advanceRecovery} onChange={(e) => setForm({ ...form, advanceRecovery: e.target.value })} />
            </div>
            <div>
              <Label>{L("Penalty / LD", "الغرامات")}</Label>
              <Input type="number" step="0.01" value={form.penaltyAmount} onChange={(e) => setForm({ ...form, penaltyAmount: e.target.value })} />
            </div>
            <div>
              <Label>{L("VAT %", "ضريبة القيمة المضافة %")}</Label>
              <Input type="number" step="0.01" value={form.vatPercent} onChange={(e) => setForm({ ...form, vatPercent: e.target.value })} />
            </div>
          </div>

          <div className="rounded-xl border border-[#e6e1d6] bg-[#fbfaf7] p-3 text-sm">
            <div className="flex justify-between"><span>{L("Taxable amount", "المبلغ الخاضع للضريبة")}</span><span>{money(totals.net)}</span></div>
            <div className="flex justify-between"><span>{L("VAT", "الضريبة")} {form.vatPercent}%</span><span>{money(totals.vat)}</span></div>
            <div className="mt-1 flex justify-between border-t border-[#e6e1d6] pt-1 font-bold text-emerald-800">
              <span>{L("Total", "الإجمالي")}</span><span>{money(totals.total)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={create.isPending}>
            {create.isPending
              ? L("Creating…", "جارٍ الإنشاء…")
              : L("Create & queue for ZATCA", "إنشاء وإرسال إلى زاتكا")}
          </Button>
          <p className="text-center text-[11px] text-slate-400">
            {L("VAT 15% is applied per Saudi ZATCA rules. A QR, UUID and SHA-256 hash are generated automatically.",
               "تُطبّق ضريبة 15% حسب قواعد زاتكا السعودية. يتم توليد رمز QR ومعرّف UUID وبصمة SHA-256 تلقائياً.")}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 * ZATCA output actions (PDF / Excel / XML / preview)
 * ════════════════════════════════════════════════════════════════════════════ */
export function InvoiceActions({ invoiceId, compact = false }: { invoiceId: number; compact?: boolean }) {
  const { L } = useDeco();
  const utils = trpc.useUtils();
  const [doc, setDoc] = useState<InvoiceDoc | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const xlsx = trpc.decoration.invoiceXlsx.useMutation({
    onSuccess: (res: any) => {
      downloadBase64(
        res.filename ?? `INV-${invoiceId}.xlsx`,
        res.buffer_base64,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    },
    onSettled: () => setBusy(null),
  });

  const fetchDoc = async () => {
    setBusy("doc");
    try {
      const res = await utils.decoration.invoiceDocument.fetch({ invoiceId });
      setDoc(res as unknown as InvoiceDoc);
      return res as unknown as InvoiceDoc;
    } finally {
      setBusy(null);
    }
  };

  const onPdf = async () => {
    const d = await fetchDoc();
    if (d) printInvoiceDoc(d);
  };

  const onXml = async () => {
    setBusy("xml");
    try {
      const res = await utils.decoration.invoiceXml.fetch({ invoiceId });
      downloadText(res.filename, res.xml);
    } finally {
      setBusy(null);
    }
  };

  const btn = compact
    ? "inline-flex h-8 items-center gap-1 rounded-md border border-[#e6e1d6] bg-white px-2 text-[11px] font-medium text-slate-600 transition hover:border-amber-500 hover:text-amber-700"
    : "inline-flex h-9 items-center gap-1.5 rounded-md border border-[#e6e1d6] bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-amber-500 hover:text-amber-700";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" className={btn} onClick={onPdf} disabled={busy === "doc"}>
        <FileText className="h-3.5 w-3.5" />
        {busy === "doc" ? "…" : "PDF"}
      </button>
      <button type="button" className={btn} onClick={() => xlsx.mutate({ invoiceId })} disabled={xlsx.isPending}>
        <FileSpreadsheet className="h-3.5 w-3.5" />
        {xlsx.isPending ? "…" : "Excel"}
      </button>
      <button type="button" className={btn} onClick={onXml} disabled={busy === "xml"}>
        <FileCode2 className="h-3.5 w-3.5" />
        {busy === "xml" ? "…" : "XML"}
      </button>
      <button type="button" className={btn} onClick={fetchDoc} disabled={busy === "doc"}>
        <Eye className="h-3.5 w-3.5" />
        {L("View", "عرض")}
      </button>

      <Dialog open={!!doc} onOpenChange={(o) => { if (!o) setDoc(null); }}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {doc ? `${doc.invoice.invoiceNo} · ${doc.invoice.billingType.replace(/_/g, " ")}` : ""}
            </DialogTitle>
          </DialogHeader>
          {doc ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#e6e1d6] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">{L("Client", "العميل")}</p>
                  <p className="text-sm font-semibold">{doc.client?.nameEn ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-[#e6e1d6] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">{L("Total", "الإجمالي")}</p>
                  <p className="text-sm font-semibold">{money(doc.totals.total)}</p>
                </div>
                <div className="rounded-xl border border-[#e6e1d6] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">{L("Status", "الحالة")}</p>
                  <StatusPill status={doc.invoice.status} />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#e6e1d6]">
                <table className="w-full text-xs">
                  <thead className="bg-[#f7f5f0] text-[10px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-start">{L("Description", "الوصف")}</th>
                      <th className="px-3 py-2 text-end">{L("Qty", "الكمية")}</th>
                      <th className="px-3 py-2 text-end">{L("Price", "السعر")}</th>
                      <th className="px-3 py-2 text-end">{L("Amount", "المبلغ")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1ede4]">
                    {doc.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <div>{l.descriptionEn}</div>
                          <div className="text-[11px] text-slate-500" dir="rtl">{l.descriptionAr}</div>
                        </td>
                        <td className="px-3 py-2 text-end">{l.quantity} {l.uom}</td>
                        <td className="px-3 py-2 text-end">{money(l.unitPrice)}</td>
                        <td className="px-3 py-2 text-end font-medium">{money(l.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[#e6e1d6] bg-[#fbfaf7] p-4">
                <div className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-semibold text-slate-800">UUID:</span> <span className="break-all font-mono text-[10px]">{doc.zatca.uuid}</span></p>
                  <p><span className="font-semibold text-slate-800">{L("Hash", "البصمة")}:</span> <span className="break-all font-mono text-[10px]">{doc.zatca.hash}</span></p>
                  <p><span className="font-semibold text-slate-800">{L("Mode", "الوضع")}:</span> {doc.zatca.mode} · ZATCA {doc.invoice.zatcaStatus ?? "pending"}</p>
                </div>
                <div className="text-center">
                  <img src={doc.zatca.qrDataUrl} alt="ZATCA QR" className="h-28 w-28 rounded border border-[#e6e1d6] bg-white p-1" />
                  <p className="mt-1 text-[10px] text-slate-400">ZATCA QR</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => printInvoiceDoc(doc)}>
                  <FileText className="me-2 h-4 w-4" /> {L("Print / Save PDF", "طباعة / حفظ PDF")}
                </Button>
                <Button variant="outline" onClick={() => xlsx.mutate({ invoiceId })} disabled={xlsx.isPending}>
                  <FileSpreadsheet className="me-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" onClick={onXml} disabled={busy === "xml"}>
                  <FileCode2 className="me-2 h-4 w-4" /> ZATCA XML
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}