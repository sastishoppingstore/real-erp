/**
 * YASCO ERP — Decoration / Fit-Out module · tRPC router
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted as `decoration` in api/router.ts (one additive line — see INSTALL.md).
 *
 * Conventions copied from existing routers (constructionRouter, purchaseRouter):
 *   - `authedQuery` for everything (tenant scoped via ctx.user.tenantId)
 *   - `cleanInput()` strips empty strings / nulls before writes
 *   - soft delete via `deletedAt`; every list filters `isNull(deletedAt)`
 *   - document numbers via `docNo()`; audit trail via `audit()`
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import QRCode from "qrcode";
import ExcelJS from "exceljs";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { cleanInput } from "./cleanInput";
import * as S from "@db/schema-decoration";
import { and, eq, isNull, desc, asc, sql, inArray } from "drizzle-orm";

/* ════════════════════════════════════════════════════════════════════════════
 * Small helpers
 * ════════════════════════════════════════════════════════════════════════════ */
type Ctx = any;
const tid = (ctx: Ctx): number => ctx.user?.tenantId as number;
const uid = (ctx: Ctx): number | undefined => ctx.user?.id;

/** Optional numeric-or-string input (money / qty are decimal strings in MySQL). */
const numOrStr = z.union([z.string(), z.number()]).optional();
const optDate = z.string().optional();
const optStr = z.string().optional();

/** Fire-and-forget audit entry — never breaks the caller. */
async function audit(
  ctx: Ctx,
  entityType: string,
  entityId: number | undefined,
  action: "create" | "update" | "delete" | "approve" | "reject" | "login" | "export",
  before?: unknown,
  after?: unknown,
) {
  try {
    const db = getDb();
    await db.insert(S.dcAuditLog).values({
      tenantId: tid(ctx),
      entityType,
      entityId: entityId ?? null,
      action,
      before: (before ?? null) as any,
      after: (after ?? null) as any,
      userId: uid(ctx) ?? null,
    });
  } catch {
    /* audit must never throw */
  }
}

/** Sequential, tenant-scoped document number: PREFIX-YYYYMM-0001. */
async function docNo(ctx: Ctx, prefix: string, table: any): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select({ c: sql<number>`count(*)` })
    .from(table)
    .where(eq(table.tenantId, tid(ctx)));
  const n = Number(row?.c ?? 0) + 1;
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${prefix}-${ym}-${String(n).padStart(4, "0")}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * ZATCA helpers (Phase-2 aligned: TLV QR, UBL 2.1 XML, SHA-256 invoice hash)
 * ──────────────────────────────────────────────────────────────────────────── */
const DECO_VAT_PERCENT = 15;

function xmlEscape(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** ZATCA TLV: tag (1 byte) + length (1 byte) + UTF-8 value (max 255 bytes). */
function zlv(tag: number, value: string): Buffer {
  const bytes = Buffer.from(String(value ?? ""), "utf8");
  const clipped = bytes.length > 255 ? bytes.subarray(0, 255) : bytes;
  return Buffer.concat([Buffer.from([tag, clipped.length]), clipped]);
}

function zlvBase64(tags: Array<[number, string]>): string {
  return Buffer.concat(tags.map(([tag, value]) => zlv(tag, value))).toString("base64");
}

const sha256Base64 = (v: string) =>
  createHash("sha256").update(v, "utf8").digest("base64");

/** Deterministic UUID v5-style id so re-printing an invoice keeps the same UUID. */
function stableUuid(seed: string): string {
  const h = createHash("sha256").update(seed, "utf8").digest("hex");
  const variant = ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${variant}${h.slice(18, 20)}-${h.slice(20, 32)}`;
}

const dataUriBuffer = (dataUri?: string | null): Buffer | null => {
  try {
    const m = String(dataUri ?? "").match(/^data:image\/(\w+);base64,(.+)$/);
    return m ? Buffer.from(m[2], "base64") : null;
  } catch {
    return null;
  }
};

/**
 * Generic tenant-scoped CRUD block (list / create / update / soft-delete).
 * Used for the ~40 straightforward master & document tables so the whole module
 * stays consistent. Complex workflows (BOQ recalc, IPC, take-off, approvals)
 * are written out explicitly below.
 */
function crud(
  name: string,
  table: any,
  createSchema: z.ZodTypeAny,
  updateSchema: z.ZodTypeAny,
  entityType: string,
  /* Optional: fill columns the table requires but the form does not collect
   * (document numbers such as boq_no / quote_no / tender_no). Returning the
   * values unchanged is fine. */
  enrich?: (ctx: Ctx, values: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>,
) {
  const list = authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(table)
      .where(and(eq(table.tenantId, tid(ctx)), isNull(table.deletedAt)))
      .orderBy(desc(table.createdAt));
  });

  const create = authedMutation.input(createSchema as any).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const clean = cleanInput(input as Record<string, any>);
    let values: Record<string, any> = { ...clean, tenantId: tid(ctx), createdBy: uid(ctx) ?? null };
    if (enrich) values = await enrich(ctx, values);
    const [{ id }] = await db
      .insert(table)
      .values(values as any)
      .$returningId();
    await audit(ctx, entityType, id, "create", null, values);
    return { id, success: true };
  });

  const update = authedMutation.input(updateSchema as any).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const { id, ...rest } = input as Record<string, any>;
    const clean = cleanInput(rest);
    await db
      .update(table)
      .set({ ...clean, updatedBy: uid(ctx) ?? null, updatedAt: new Date() } as any)
      .where(and(eq(table.id, id), eq(table.tenantId, tid(ctx))));
    await audit(ctx, entityType, Number(id), "update", null, clean);
    return { success: true };
  });

  const remove = authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(table)
        .set({ deletedAt: new Date(), updatedBy: uid(ctx) ?? null } as any)
        .where(and(eq(table.id, input.id), eq(table.tenantId, tid(ctx))));
      await audit(ctx, entityType, input.id, "delete");
      return { success: true };
    });

  return {
    [`${name}List`]: list,
    [`${name}Create`]: create,
    [`${name}Update`]: update,
    [`${name}Delete`]: remove,
  };
}

/* ── Shared reusable input schemas ─────────────────────────────────────────── */
const billingLine = z.object({
  workItemId: z.number().optional(),
  descriptionEn: optStr,
  descriptionAr: optStr,
  quantity: numOrStr,
  uom: optStr,
  unitPrice: numOrStr,
  vatPercent: numOrStr,
  lineTotal: numOrStr,
});

/* ────────────────────────────────────────────────────────────────────────────
 * Invoice document package (shared by the PDF/print view, XLSX and XML export)
 * ──────────────────────────────────────────────────────────────────────────── */
async function invoicePackage(ctx: Ctx, invoiceId: number) {
  const db = getDb();
  const t = tid(ctx);

  const [inv] = await db
    .select()
    .from(S.dcInvoices)
    .where(and(eq(S.dcInvoices.id, invoiceId), eq(S.dcInvoices.tenantId, t), isNull(S.dcInvoices.deletedAt)))
    .limit(1);
  if (!inv) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });

  const lines = await db
    .select()
    .from(S.dcInvoiceLines)
    .where(eq(S.dcInvoiceLines.invoiceId, invoiceId));

  let project: any = null;
  if (inv.projectId) {
    const [p] = await db.select().from(S.dcProjects)
      .where(and(eq(S.dcProjects.id, Number(inv.projectId)), eq(S.dcProjects.tenantId, t))).limit(1);
    project = p ?? null;
  }
  let client: any = null;
  if (inv.clientId) {
    const [c] = await db.select().from(S.dcClients)
      .where(and(eq(S.dcClients.id, Number(inv.clientId)), eq(S.dcClients.tenantId, t))).limit(1);
    client = c ?? null;
  }

  /* Company identity is owned by Settings — read-only, never duplicated. */
  let company: any = {};
  let legal: any = {};
  try {
    const [coRows] = await db.execute(sql`
      SELECT company_name, company_name_ar, tax_number, cr_number, address, address_ar, phone, email, logo
        FROM company_settings WHERE tenant_id = ${t} LIMIT 1`);
    company = (coRows as unknown as any[])?.[0] ?? {};
  } catch { /* settings table not installed yet */ }
  try {
    const [lgRows] = await db.execute(sql`
      SELECT legal_name_en, legal_name_ar, vat_number, cr_number, street_name, building_number,
             district, city, postal_code, company_logo
        FROM company_legal_details WHERE tenant_id = ${t} LIMIT 1`);
    legal = (lgRows as unknown as any[])?.[0] ?? {};
  } catch { /* legal details optional */ }

  const seller = {
    nameEn: legal.legal_name_en || company.company_name || "YASCO",
    nameAr: legal.legal_name_ar || company.company_name_ar || "ياسكو",
    vatNumber: legal.vat_number || company.tax_number || "",
    crNumber: legal.cr_number || company.cr_number || "",
    address: [
      legal.building_number, legal.street_name, legal.district, legal.city, legal.postal_code,
    ].filter(Boolean).join(", ") || company.address || "",
    phone: company.phone || "",
    email: company.email || "",
    logo: legal.company_logo || company.logo || "",
  };

  const sub = Number(inv.subtotal ?? 0);
  const discount = Number(inv.discountAmount ?? 0);
  const retention = Number(inv.retentionAmount ?? 0);
  const advanceRecovery = Number(inv.advanceRecovery ?? 0);
  const penalty = Number(inv.penaltyAmount ?? 0);
  const vat = Number(inv.vatAmount ?? 0);
  const total = Number(inv.totalAmount ?? 0);
  const paid = Number(inv.paidAmount ?? 0);
  const balance = Number(inv.balanceDue ?? total - paid);
  const vatPercent = Number(inv.vatPercent ?? DECO_VAT_PERCENT);
  const net = Math.max(0, total - vat);

  const issueDate = String(inv.invoiceDate ?? "").slice(0, 10);
  const dueDate = inv.dueDate ? String(inv.dueDate).slice(0, 10) : "";
  const mode = inv.invoiceType === "simplified" ? "simplified" : "standard";
  const uuid = inv.zatcaUuid || stableUuid(`${t}:${inv.invoiceNo}`);

  const xmlLines = (lines.length
    ? lines.map((l: any) => ({
        descriptionEn: l.descriptionEn || "Contract work",
        descriptionAr: l.descriptionAr || "أعمال تعاقدية",
        quantity: Number(l.quantity ?? 1),
        uom: l.uom || "PCE",
        unitPrice: Number(l.unitPrice ?? 0),
        lineTotal: Number(l.lineTotal ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0)),
        vatPercent: Number(l.vatPercent ?? vatPercent),
      }))
    : [{
        descriptionEn: `Contract work — ${String(inv.billingType || "progress").replace(/_/g, " ")}`,
        descriptionAr: "أعمال تعاقدية",
        quantity: 1,
        uom: "PCE",
        unitPrice: sub,
        lineTotal: sub,
        vatPercent,
      }]);

  const linesXml = xmlLines.map((l, i) => `
    <cac:InvoiceLine>
      <cbc:ID>${i + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="${xmlEscape(l.uom)}">${l.quantity.toFixed(2)}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="SAR">${l.lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:TaxTotal><cbc:TaxAmount currencyID="SAR">${(l.lineTotal * l.vatPercent / 100).toFixed(2)}</cbc:TaxAmount></cac:TaxTotal>
      <cac:Item><cbc:Name>${xmlEscape(l.descriptionEn)}</cbc:Name></cac:Item>
      <cac:Price><cbc:PriceAmount currencyID="SAR">${l.unitPrice.toFixed(2)}</cbc:PriceAmount></cac:Price>
    </cac:InvoiceLine>`).join("");

  const billingRef = String(inv.billingType || "progress");
  const invoiceXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:ProfileID>${mode === "standard" ? "clearance:1.0" : "reporting:1.0"}</cbc:ProfileID>
  <cbc:ID>${xmlEscape(inv.invoiceNo)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>00:00:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${mode === "standard" ? "0100000" : "0200000"}">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  <cac:AccountingSupplierParty><cac:Party>
    <cac:PostalAddress>
      <cbc:StreetName>${xmlEscape(legal.street_name || seller.address)}</cbc:StreetName>
      <cbc:BuildingNumber>${xmlEscape(legal.building_number || "")}</cbc:BuildingNumber>
      <cbc:CitySubdivisionName>${xmlEscape(legal.district || "")}</cbc:CitySubdivisionName>
      <cbc:CityName>${xmlEscape(legal.city || "")}</cbc:CityName>
      <cbc:PostalZone>${xmlEscape(legal.postal_code || "")}</cbc:PostalZone>
      <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
    </cac:PostalAddress>
    <cac:PartyTaxScheme><cbc:CompanyID>${xmlEscape(seller.vatNumber)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>
    <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(seller.nameEn)}</cbc:RegistrationName></cac:PartyLegalEntity>
  </cac:Party></cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty><cac:Party>
    <cac:PartyTaxScheme><cbc:CompanyID>${xmlEscape(client?.vatNumber || "")}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>
    <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(client?.nameEn || client?.nameAr || "Client")}</cbc:RegistrationName></cac:PartyLegalEntity>
  </cac:Party></cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${vat.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${net.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${vat.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory><cbc:ID>S</cbc:ID><cbc:Percent>${vatPercent.toFixed(2)}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${sub.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${net.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="SAR">${(discount + retention + advanceRecovery + penalty).toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PrepaidAmount currencyID="SAR">${paid.toFixed(2)}</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="SAR">${balance.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${linesXml}
</Invoice>`;

  const invoiceHash = sha256Base64(invoiceXml);

  /* QR: reuse a QR already registered by the ZATCA service, else build TLV. */
  const storedQr = String(inv.zatcaQrCode ?? "");
  const qrPayload = storedQr && !storedQr.startsWith("{") && !storedQr.startsWith("<")
    ? storedQr
    : zlvBase64([
        [1, seller.nameAr || seller.nameEn],
        [2, seller.vatNumber],
        [3, `${issueDate}T00:00:00Z`],
        [4, total.toFixed(2)],
        [5, vat.toFixed(2)],
        [6, invoiceHash],
      ]);
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 360, margin: 1, errorCorrectionLevel: "M" });

  return {
    invoice: {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      invoiceType: inv.invoiceType,
      billingType: billingRef,
      invoiceDate: issueDate,
      dueDate,
      status: inv.status,
      zatcaStatus: inv.zatcaStatus,
      currency: inv.currency || "SAR",
    },
    lines: xmlLines,
    project: project ? { id: project.id, code: project.projectCode, nameEn: project.nameEn, nameAr: project.nameAr, city: project.city } : null,
    client: client ? { id: client.id, nameEn: client.nameEn, nameAr: client.nameAr, vatNumber: client.vatNumber, crNumber: client.crNumber, address: client.nationalAddress, city: client.city } : null,
    seller,
    totals: {
      subtotal: sub, discount, retention, advanceRecovery, penalty,
      net, vatPercent, vat, total, paid, balance,
    },
    zatca: {
      uuid,
      hash: invoiceHash,
      mode,
      typeCode: mode === "standard" ? "0100000" : "0200000",
      qrPayload,
      qrDataUrl,
      xml: invoiceXml,
    },
  };
}

export const decorationRouter = createRouter({
  /* ══════════════════════════════════════════════════════════════════════════
   * 1. MASTER DATA
   * ══════════════════════════════════════════════════════════════════════════ */
  ...crud(
    "client",
    S.dcClients,
    z.object({
      customerId: z.number().optional(),
      code: optStr, nameEn: z.string().min(1), nameAr: optStr,
      crNumber: optStr, vatNumber: optStr, nationalAddress: optStr,
      buildingNo: optStr, streetEn: optStr, streetAr: optStr,
      districtEn: optStr, districtAr: optStr, city: optStr, postalCode: optStr,
      contactPerson: optStr, phone: optStr, email: optStr,
      creditLimit: numOrStr, paymentTermsDays: z.number().optional(),
      rating: z.enum(["A", "B", "C", "D"]).optional(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_client",
  ),

  ...crud(
    "supplier",
    S.dcSuppliers,
    z.object({
      vendorId: z.number().optional(), code: optStr, nameEn: z.string().min(1), nameAr: optStr,
      crNumber: optStr, vatNumber: optStr, bankName: optStr, iban: optStr,
      contactPerson: optStr, phone: optStr, email: optStr,
      rating: z.enum(["A", "B", "C", "D"]).optional(), docExpiryDate: optDate, notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_supplier",
  ),

  ...crud(
    "subcontractor",
    S.dcSubcontractors,
    z.object({
      code: optStr, nameEn: z.string().min(1), nameAr: optStr, trade: optStr,
      crNumber: optStr, vatNumber: optStr, bankName: optStr, iban: optStr,
      contactPerson: optStr, phone: optStr, email: optStr,
      rating: z.enum(["A", "B", "C", "D"]).optional(),
      defaultRetentionPercent: numOrStr, docExpiryDate: optDate, notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_subcontractor",
  ),

  ...crud(
    "consultant",
    S.dcConsultants,
    z.object({
      code: optStr, nameEn: z.string().min(1), nameAr: optStr,
      kind: z.enum(["consultant", "main_contractor", "supervisor"]).optional(),
      crNumber: optStr, vatNumber: optStr, contactPerson: optStr,
      phone: optStr, email: optStr, address: optStr, notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_consultant",
  ),

  ...crud(
    "labour",
    S.dcLabour,
    z.object({
      employeeId: z.number().optional(), code: optStr, nameEn: z.string().min(1), nameAr: optStr,
      iqamaNumber: optStr, iqamaExpiry: optDate, passportNumber: optStr, passportExpiry: optDate,
      nationality: optStr, profession: optStr,
      labourCategory: z.enum(["carpenter", "gypsum_installer", "painter", "helper", "foreman", "supervisor", "electrician", "sealer", "tiler", "other"]).optional(),
      sponsorship: z.enum(["company", "supplied", "subcontract"]).optional(),
      supplierId: z.number().optional(), gosiNumber: optStr,
      medicalInsuranceExpiry: optDate, workPermitExpiry: optDate, drivingLicenceExpiry: optDate,
      photoUrl: optStr, dailyRate: numOrStr, pieceRatePerM2: numOrStr, campId: z.number().optional(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_labour",
  ),

  ...crud(
    "materialCategory",
    S.dcMaterialCategories,
    z.object({ code: optStr, nameEn: z.string().min(1), nameAr: optStr, parentId: z.number().optional(), sortOrder: z.number().optional() }),
    z.object({ id: z.number() }).passthrough(),
    "dc_material_category",
  ),

  ...crud(
    "material",
    S.dcMaterials,
    z.object({
      itemId: z.number().optional(), categoryId: z.number().optional(), code: z.string().min(1),
      nameEn: z.string().min(1), nameAr: optStr, specification: optStr,
      uom: optStr, altUom: optStr, altUomFactor: numOrStr,
      minStockLevel: numOrStr, reorderLevel: numOrStr, lastCost: numOrStr, avgCost: numOrStr,
      isBatchTracked: z.boolean().optional(), isExpiryTracked: z.boolean().optional(),
      barcode: optStr, defaultVatPercent: numOrStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_material",
  ),

  ...crud(
    "equipment",
    S.dcEquipment,
    z.object({
      assetId: z.number().optional(), code: z.string().min(1), nameEn: z.string().min(1), nameAr: optStr,
      kind: z.enum(["tool", "machine", "vehicle", "scaffolding", "lift", "other"]).optional(),
      ownership: z.enum(["owned", "rented"]).optional(),
      plateNumber: optStr, hourlyRate: numOrStr, dailyRate: numOrStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_equipment",
  ),

  ...crud(
    "workLibrary",
    S.dcWorkLibrary,
    z.object({
      code: z.string().min(1), nameEn: z.string().min(1), nameAr: optStr,
      category: z.enum(["false_ceiling", "partition", "wall_sealing", "waterproofing", "painting", "cornice", "flooring", "wallpaper", "joinery", "glazing", "lighting", "electrical", "hvac", "demolition", "other"]).optional(),
      uom: optStr, materialCost: numOrStr, labourCost: numOrStr, equipmentCost: numOrStr,
      overheadPercent: numOrStr, profitPercent: numOrStr, unitRate: numOrStr, wbsCode: optStr,
    }),
    z.object({ id: z.number() }).passthrough(),
    "dc_work_item",
  ),

  /** Work library material recipe (material + labour breakdown per unit). */
  workLibraryMaterialList: authedQuery
    .input(z.object({ workItemId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcWorkLibraryMaterials)
        .where(and(eq(S.dcWorkLibraryMaterials.tenantId, tid(ctx)), eq(S.dcWorkLibraryMaterials.workItemId, input.workItemId)));
    }),

  workLibraryMaterialSet: authedMutation
    .input(z.object({
      workItemId: z.number(), materialId: z.number(),
      consumptionPerUnit: numOrStr, wastagePercent: numOrStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(S.dcWorkLibraryMaterials).values({
        tenantId: tid(ctx), workItemId: input.workItemId, materialId: input.materialId,
        consumptionPerUnit: String(input.consumptionPerUnit ?? 0),
        wastagePercent: String(input.wastagePercent ?? 0),
      });
      return { success: true };
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 2. PROJECTS
   * ══════════════════════════════════════════════════════════════════════════ */
  projectList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcProjects.tenantId, tid(ctx)), isNull(S.dcProjects.deletedAt)];
      if (input?.status) conds.push(eq(S.dcProjects.status, input.status as any));
      return db.select().from(S.dcProjects).where(and(...conds)).orderBy(desc(S.dcProjects.createdAt));
    }),

  projectGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [project] = await db.select().from(S.dcProjects)
        .where(and(eq(S.dcProjects.id, input.id), eq(S.dcProjects.tenantId, tid(ctx))));
      if (!project) return null;
      const [buildings, floors, units, rooms] = await Promise.all([
        db.select().from(S.dcBuildings).where(eq(S.dcBuildings.projectId, input.id)),
        db.select().from(S.dcFloors).where(eq(S.dcFloors.projectId, input.id)),
        db.select().from(S.dcUnits).where(eq(S.dcUnits.projectId, input.id)),
        db.select().from(S.dcRooms).where(eq(S.dcRooms.projectId, input.id)),
      ]);
      return { project, buildings, floors, units, rooms };
    }),

  projectCreate: authedMutation
    .input(z.object({
      legacyProjectId: z.number().optional(),
      projectCode: z.string().min(1), nameEn: z.string().min(1), nameAr: optStr,
      clientId: z.number().optional(), consultantId: z.number().optional(),
      mainContractorId: z.number().optional(), branchId: z.number().optional(), companyId: z.number().optional(),
      contractNumber: optStr, contractValue: numOrStr, budget: numOrStr,
      city: optStr, districtEn: optStr, districtAr: optStr,
      latitude: numOrStr, longitude: numOrStr, projectManagerId: z.number().optional(),
      startDate: optDate, endDate: optDate,
      status: z.enum(["tender", "awarded", "running", "on_hold", "completed", "handed_over", "dlp", "cancelled"]).optional(),
      retentionPercent: numOrStr, advanceAmount: numOrStr, vatPercent: numOrStr, description: optStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const clean = cleanInput(input as Record<string, any>);
      const [{ id }] = await db.insert(S.dcProjects)
        .values({ ...clean, tenantId: tid(ctx), createdBy: uid(ctx) ?? null } as any)
        .$returningId();
      await audit(ctx, "dc_project", id, "create", null, clean);
      return { id, success: true };
    }),

  projectUpdate: authedMutation
    .input(z.object({ id: z.number() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...rest } = input as Record<string, any>;
      const clean = cleanInput(rest);
      await db.update(S.dcProjects)
        .set({ ...clean, updatedBy: uid(ctx) ?? null, updatedAt: new Date() } as any)
        .where(and(eq(S.dcProjects.id, id), eq(S.dcProjects.tenantId, tid(ctx))));
      await audit(ctx, "dc_project", Number(id), "update", null, clean);
      return { success: true };
    }),

  projectDelete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(S.dcProjects).set({ deletedAt: new Date() } as any)
        .where(and(eq(S.dcProjects.id, input.id), eq(S.dcProjects.tenantId, tid(ctx))));
      await audit(ctx, "dc_project", input.id, "delete");
      return { success: true };
    }),

  /* ── Building / Floor / Unit ──────────────────────────────────────────────── */
  ...crud(
    "building", S.dcBuildings,
    z.object({ projectId: z.number(), code: optStr, nameEn: z.string().min(1), nameAr: optStr, levels: z.number().optional(), sortOrder: z.number().optional() }),
    z.object({ id: z.number() }).passthrough(), "dc_building",
  ),
  ...crud(
    "floor", S.dcFloors,
    z.object({ projectId: z.number(), buildingId: z.number(), code: optStr, nameEn: z.string().min(1), nameAr: optStr, sortOrder: z.number().optional() }),
    z.object({ id: z.number() }).passthrough(), "dc_floor",
  ),
  ...crud(
    "unit", S.dcUnits,
    z.object({
      projectId: z.number(), buildingId: z.number().optional(), floorId: z.number(),
      code: optStr, nameEn: z.string().min(1), nameAr: optStr,
      unitType: z.enum(["apartment", "villa", "office", "showroom", "retail", "hotel_room", "restaurant", "mosque", "common", "other"]).optional(),
      areaM2: numOrStr, status: z.enum(["draft", "active", "on_hold", "completed", "cancelled"]).optional(), progress: numOrStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_unit",
  ),

  /* ── Rooms + take-off ─────────────────────────────────────────────────────── */
  ...crud(
    "room", S.dcRooms,
    z.object({
      projectId: z.number(), buildingId: z.number().optional(), floorId: z.number().optional(),
      unitId: z.number().optional(), code: optStr, nameEn: z.string().min(1), nameAr: optStr,
      roomType: z.enum(["room", "hall", "majlis", "corridor", "toilet", "kitchen", "bathroom", "bedroom", "living", "dining", "office", "lobby", "staircase", "balcony", "other"]).optional(),
      lengthM: numOrStr, widthM: numOrStr, heightM: numOrStr,
      finishType: optStr, ceilingDesign: optStr, wallTreatment: optStr, colourCode: optStr,
      lightingPoints: z.number().optional(), acGrills: z.number().optional(),
      status: z.enum(["pending", "in_progress", "completed", "on_hold"]).optional(), completionPercent: numOrStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_room",
  ),

  roomList: authedQuery
    .input(z.object({ projectId: z.number().optional(), unitId: z.number().optional(), floorId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcRooms.tenantId, tid(ctx)), isNull(S.dcRooms.deletedAt)];
      if (input.projectId) conds.push(eq(S.dcRooms.projectId, input.projectId));
      if (input.unitId) conds.push(eq(S.dcRooms.unitId, input.unitId));
      if (input.floorId) conds.push(eq(S.dcRooms.floorId, input.floorId));
      return db.select().from(S.dcRooms).where(and(...conds)).orderBy(asc(S.dcRooms.nameEn));
    }),

  roomGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [room] = await db.select().from(S.dcRooms)
        .where(and(eq(S.dcRooms.id, input.id), eq(S.dcRooms.tenantId, tid(ctx))));
      if (!room) return null;
      const [finishes, openings] = await Promise.all([
        db.select().from(S.dcRoomFinishes).where(eq(S.dcRoomFinishes.roomId, input.id)),
        db.select().from(S.dcRoomOpenings).where(eq(S.dcRoomOpenings.roomId, input.id)),
      ]);
      return { room, finishes, openings };
    }),

  /** Recalculate ceiling / wall / floor areas from dimensions minus openings. */
  roomComputeTakeoff: authedMutation
    .input(z.object({ roomId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [room] = await db.select().from(S.dcRooms)
        .where(and(eq(S.dcRooms.id, input.roomId), eq(S.dcRooms.tenantId, tid(ctx))));
      if (!room) return { success: false, message: "Room not found" };

      const L = Number(room.lengthM), W = Number(room.widthM), H = Number(room.heightM);
      const floorArea = L * W;
      const ceilingArea = L * W;
      const perimeter = 2 * (L + W);
      const grossWall = perimeter * H;

      const openings = await db.select().from(S.dcRoomOpenings)
        .where(eq(S.dcRoomOpenings.roomId, input.roomId));
      const deduction = openings.reduce((s, o) => s + Number(o.widthM) * Number(o.heightM) * (o.count ?? 1), 0);
      const wallArea = Math.max(0, grossWall - deduction);

      await db.update(S.dcRooms).set({
        ceilingAreaM2: String(ceilingArea.toFixed(3)),
        wallAreaM2: String(wallArea.toFixed(3)),
        floorAreaM2: String(floorArea.toFixed(3)),
        perimeterM: String(perimeter.toFixed(3)),
        updatedAt: new Date(),
      } as any).where(eq(S.dcRooms.id, input.roomId));

      return { success: true, ceilingArea, wallArea, floorArea, perimeter, deduction };
    }),

  roomOpeningAdd: authedMutation
    .input(z.object({
      roomId: z.number(),
      kind: z.enum(["door", "window", "opening", "other"]).optional(),
      widthM: numOrStr, heightM: numOrStr, count: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const area = Number(input.widthM ?? 0) * Number(input.heightM ?? 0) * (input.count ?? 1);
      const [{ id }] = await db.insert(S.dcRoomOpenings).values({
        tenantId: tid(ctx), roomId: input.roomId, kind: input.kind ?? "door",
        widthM: String(input.widthM ?? 0), heightM: String(input.heightM ?? 0),
        count: input.count ?? 1, areaM2: String(area.toFixed(3)),
      }).$returningId();
      return { id, success: true };
    }),

  roomOpeningList: authedQuery
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcRoomOpenings)
        .where(and(eq(S.dcRoomOpenings.tenantId, tid(ctx)), eq(S.dcRoomOpenings.roomId, input.roomId)));
    }),

  roomFinishList: authedQuery
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcRoomFinishes)
        .where(and(eq(S.dcRoomFinishes.tenantId, tid(ctx)), eq(S.dcRoomFinishes.roomId, input.roomId)));
    }),

  roomFinishUpsert: authedMutation
    .input(z.object({
      roomId: z.number(),
      surface: z.enum(["ceiling", "wall", "floor", "skirting", "cornice", "other"]),
      workItemId: z.number().optional(), descriptionEn: optStr, descriptionAr: optStr,
      quantity: numOrStr, uom: optStr, rate: numOrStr, deductionM2: numOrStr, notes: optStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const q = Number(input.quantity ?? 0), r = Number(input.rate ?? 0);
      const [{ id }] = await db.insert(S.dcRoomFinishes).values({
        tenantId: tid(ctx), roomId: input.roomId, surface: input.surface,
        workItemId: input.workItemId ?? null, descriptionEn: input.descriptionEn ?? null,
        descriptionAr: input.descriptionAr ?? null, quantity: String(q), uom: input.uom ?? "m2",
        rate: String(r), amount: String((q * r).toFixed(2)),
        deductionM2: String(input.deductionM2 ?? 0), notes: input.notes ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  /** Nested structure tree for the site-explorer UI. */
  projectTree: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [buildings, floors, units, rooms] = await Promise.all([
        db.select().from(S.dcBuildings).where(and(eq(S.dcBuildings.projectId, input.projectId), isNull(S.dcBuildings.deletedAt))),
        db.select().from(S.dcFloors).where(and(eq(S.dcFloors.projectId, input.projectId), isNull(S.dcFloors.deletedAt))),
        db.select().from(S.dcUnits).where(and(eq(S.dcUnits.projectId, input.projectId), isNull(S.dcUnits.deletedAt))),
        db.select().from(S.dcRooms).where(and(eq(S.dcRooms.projectId, input.projectId), isNull(S.dcRooms.deletedAt))),
      ]);
      return {
        buildings: buildings.map((b) => ({
          ...b,
          floors: floors.filter((f) => f.buildingId === b.id).map((f) => ({
            ...f,
            units: units.filter((u) => u.floorId === f.id).map((u) => ({
              ...u,
              rooms: rooms.filter((r) => r.unitId === u.id),
            })),
            rooms: rooms.filter((r) => r.floorId === f.id && !r.unitId),
          })),
        })),
      };
    }),

  /* ── Documents / diary / progress ─────────────────────────────────────────── */
  ...crud(
    "document", S.dcProjectDocuments,
    z.object({
      projectId: z.number(), buildingId: z.number().optional(), floorId: z.number().optional(),
      unitId: z.number().optional(), roomId: z.number().optional(),
      kind: z.enum(["drawing", "shop_drawing", "photo", "approval", "certificate", "other"]).optional(),
      title: z.string().min(1), fileName: optStr, fileUrl: optStr, mimeType: optStr, revision: optStr,
      status: z.enum(["draft", "submitted", "approved", "rejected", "superseded"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_document",
  ),
  ...crud(
    "siteDiary", S.dcSiteDiary,
    z.object({
      projectId: z.number(), reportDate: z.string(), weather: optStr, temperatureC: z.number().optional(),
      manpowerCount: z.number().optional(), workDoneEn: optStr, workDoneAr: optStr, issues: optStr,
      photoUrls: z.array(z.string()).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_site_diary",
  ),
  ...crud(
    "progress", S.dcProgressEntries,
    z.object({
      projectId: z.number(), buildingId: z.number().optional(), floorId: z.number().optional(),
      unitId: z.number().optional(), roomId: z.number().optional(), workItemId: z.number().optional(),
      activity: z.string().min(1), plannedQty: numOrStr, completedQty: numOrStr, uom: optStr,
      progressPercent: numOrStr, entryDate: z.string(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_progress",
  ),
  ...crud(
    "snag", S.dcSnags,
    z.object({
      projectId: z.number(), unitId: z.number().optional(), roomId: z.number().optional(),
      snagNo: optStr, titleEn: z.string().min(1), titleAr: optStr, description: optStr,
      location: optStr, photoUrl: optStr,
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      assignedTo: z.number().optional(), dueDate: optDate,
      status: z.enum(["open", "in_progress", "resolved", "closed", "rejected"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_snag",
  ),
  ...crud(
    "inspection", S.dcInspectionRequests,
    z.object({
      projectId: z.number(), unitId: z.number().optional(), roomId: z.number().optional(),
      irNo: optStr, activity: z.string().min(1), inspectionDate: optDate, inspectorId: z.number().optional(),
      status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
      result: z.enum(["pass", "fail", "conditional", "pending"]).optional(), remarks: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_inspection",
  ),
  ...crud(
    "mar", S.dcMars,
    z.object({
      projectId: z.number(), marNo: optStr, materialId: z.number().optional(),
      descriptionEn: optStr, descriptionAr: optStr, manufacturer: optStr, brand: optStr, submittalUrl: optStr,
      status: z.enum(["draft", "submitted", "approved", "rejected", "returned"]).optional(), remarks: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_mar",
  ),
  ...crud(
    "rfi", S.dcRfis,
    z.object({
      projectId: z.number(), rfiNo: optStr, subject: z.string().min(1), question: optStr,
      agenda: optStr, dueDate: optDate, status: z.enum(["open", "answered", "closed"]).optional(), answer: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_rfi",
  ),
  ...crud(
    "variation", S.dcVariations,
    z.object({
      projectId: z.number(), voNo: optStr, titleEn: z.string().min(1), titleAr: optStr, description: optStr,
      variationType: z.enum(["addition", "omission", "time_extension"]).optional(),
      amount: numOrStr, timeImpactDays: z.number().optional(),
      status: z.enum(["draft", "submitted", "approved", "rejected", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_variation",
  ),
  ...crud(
    "handover", S.dcHandovers,
    z.object({
      projectId: z.number(), handoverDate: optDate, completionCertificateNo: optStr,
      completionCertificateUrl: optStr, dlpStartDate: optDate, dlpEndDate: optDate,
      warrantyMonths: z.number().optional(),
      status: z.enum(["pending", "handed_over", "dlp", "closed"]).optional(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_handover",
  ),

  /* ══════════════════════════════════════════════════════════════════════════
   * 3. ESTIMATION · BOQ · QUOTATION
   * ══════════════════════════════════════════════════════════════════════════ */
  ...crud(
    "boq", S.dcBoqs,
    z.object({
      projectId: z.number(), boqNo: optStr, revision: optStr, titleEn: optStr, titleAr: optStr,
      status: z.enum(["draft", "submitted", "approved", "rejected", "superseded"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_boq",
    async (ctx, v) => (v.boqNo ? v : { ...v, boqNo: await docNo(ctx, "BOQ", S.dcBoqs) }),
  ),

  boqSectionCreate: authedMutation
    .input(z.object({ boqId: z.number(), code: optStr, nameEn: z.string().min(1), nameAr: optStr, sortOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcBoqSections).values({
        tenantId: tid(ctx), boqId: input.boqId, code: input.code ?? null,
        nameEn: input.nameEn, nameAr: input.nameAr ?? null, sortOrder: input.sortOrder ?? 0,
      }).$returningId();
      return { id, success: true };
    }),

  boqSectionList: authedQuery
    .input(z.object({ boqId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcBoqSections)
        .where(and(eq(S.dcBoqSections.tenantId, tid(ctx)), eq(S.dcBoqSections.boqId, input.boqId)))
        .orderBy(asc(S.dcBoqSections.sortOrder));
    }),

  boqLineList: authedQuery
    .input(z.object({ boqId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcBoqLines)
        .where(and(eq(S.dcBoqLines.tenantId, tid(ctx)), eq(S.dcBoqLines.boqId, input.boqId)))
        .orderBy(asc(S.dcBoqLines.lineNo));
    }),

  boqLineCreate: authedMutation
    .input(z.object({
      boqId: z.number(), sectionId: z.number().optional(), workItemId: z.number().optional(),
      lineNo: z.number().optional(), descriptionEn: z.string().min(1), descriptionAr: optStr,
      quantity: numOrStr, uom: optStr, materialCost: numOrStr, labourCost: numOrStr, equipmentCost: numOrStr,
      overheadPercent: numOrStr, profitPercent: numOrStr, unitRate: numOrStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const cost = Number(input.materialCost ?? 0) + Number(input.labourCost ?? 0) + Number(input.equipmentCost ?? 0);
      const oh = (Number(input.overheadPercent ?? 0) / 100) * cost;
      const pf = (Number(input.profitPercent ?? 0) / 100) * (cost + oh);
      const unitRate = input.unitRate != null ? Number(input.unitRate) : cost + oh + pf;
      const amount = unitRate * Number(input.quantity ?? 0);
      const [{ id }] = await db.insert(S.dcBoqLines).values({
        tenantId: tid(ctx), boqId: input.boqId, sectionId: input.sectionId ?? null,
        workItemId: input.workItemId ?? null, lineNo: input.lineNo ?? 0,
        descriptionEn: input.descriptionEn, descriptionAr: input.descriptionAr ?? null,
        quantity: String(input.quantity ?? 0), uom: input.uom ?? "m2",
        materialCost: String(input.materialCost ?? 0), labourCost: String(input.labourCost ?? 0),
        equipmentCost: String(input.equipmentCost ?? 0), overheadPercent: String(input.overheadPercent ?? 0),
        profitPercent: String(input.profitPercent ?? 0), unitRate: String(unitRate.toFixed(4)),
        amount: String(amount.toFixed(2)),
      }).$returningId();
      return { id, unitRate, amount, success: true };
    }),

  boqLineUpdate: authedMutation
    .input(z.object({ id: z.number() }).passthrough())
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...rest } = input as Record<string, any>;
      await db.update(S.dcBoqLines).set({ ...cleanInput(rest), updatedAt: new Date() } as any)
        .where(and(eq(S.dcBoqLines.id, id), eq(S.dcBoqLines.tenantId, tid(ctx))));
      return { success: true };
    }),

  boqLineDelete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(S.dcBoqLines)
        .where(and(eq(S.dcBoqLines.id, input.id), eq(S.dcBoqLines.tenantId, tid(ctx))));
      return { success: true };
    }),

  /** Recompute BOQ totals from its lines. */
  boqRecalc: authedMutation
    .input(z.object({ boqId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` })
        .from(S.dcBoqLines)
        .where(and(eq(S.dcBoqLines.boqId, input.boqId), eq(S.dcBoqLines.tenantId, tid(ctx))));
      const total = Number(row?.total ?? 0);
      await db.update(S.dcBoqs).set({ totalAmount: String(total.toFixed(2)), updatedAt: new Date() } as any)
        .where(and(eq(S.dcBoqs.id, input.boqId), eq(S.dcBoqs.tenantId, tid(ctx))));
      return { totalAmount: total, success: true };
    }),

  ...crud(
    "quotation", S.dcQuotations,
    z.object({
      projectId: z.number().optional(), clientId: z.number().optional(), quoteNo: optStr, version: z.number().optional(),
      titleEn: optStr, titleAr: optStr, subtotal: numOrStr, vatPercent: numOrStr, vatAmount: numOrStr,
      totalAmount: numOrStr, validUntil: optDate,
      status: z.enum(["draft", "sent", "approved", "rejected", "expired", "converted"]).optional(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_quotation",
    async (ctx, v) => (v.quoteNo ? v : { ...v, quoteNo: await docNo(ctx, "QUO", S.dcQuotations) }),
  ),
  ...crud(
    "tender", S.dcTenders,
    z.object({
      projectId: z.number().optional(), tenderNo: optStr, clientId: z.number().optional(),
      submissionDate: optDate, bidBondAmount: numOrStr, bidBondExpiry: optDate,
      status: z.enum(["preparing", "submitted", "won", "lost", "cancelled"]).optional(),
      winLossReason: optStr, value: numOrStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_tender",
    async (ctx, v) => (v.tenderNo ? v : { ...v, tenderNo: await docNo(ctx, "TND", S.dcTenders) }),
  ),
  ...crud(
    "contract", S.dcContracts,
    z.object({
      projectId: z.number(), contractNo: z.string().min(1), contractDate: optDate, contractValue: numOrStr,
      advancePercent: numOrStr, retentionPercent: numOrStr, penaltyPercent: numOrStr,
      performanceBond: numOrStr, insuranceAmount: numOrStr,
      status: z.enum(["draft", "active", "completed", "terminated"]).optional(), terms: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_contract",
  ),

  /* ══════════════════════════════════════════════════════════════════════════
   * 4. MATERIALS · PROCUREMENT · INVENTORY
   * ══════════════════════════════════════════════════════════════════════════ */
  ...crud(
    "materialRequest", S.dcMaterialRequests,
    z.object({
      projectId: z.number(), mrNo: optStr, requestDate: z.string(), requiredDate: optDate,
      status: z.enum(["draft", "submitted", "approved", "rejected", "fulfilled", "cancelled"]).optional(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_material_request",
    async (ctx, v) => (v.mrNo ? v : { ...v, mrNo: await docNo(ctx, "MR", S.dcMaterialRequests) }),
  ),

  materialRequestLines: authedQuery
    .input(z.object({ mrId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcMaterialRequestLines)
        .where(and(eq(S.dcMaterialRequestLines.tenantId, tid(ctx)), eq(S.dcMaterialRequestLines.mrId, input.mrId)));
    }),

  materialRequestLineAdd: authedMutation
    .input(z.object({ mrId: z.number(), materialId: z.number(), quantity: numOrStr, uom: optStr, requiredDate: optDate, remarks: optStr }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcMaterialRequestLines).values({
        tenantId: tid(ctx), mrId: input.mrId, materialId: input.materialId,
        quantity: String(input.quantity ?? 0), uom: input.uom ?? "pcs",
        requiredDate: input.requiredDate ?? null, remarks: input.remarks ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  materialRequestSubmit: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(S.dcMaterialRequests).set({ status: "submitted", updatedAt: new Date() } as any)
        .where(and(eq(S.dcMaterialRequests.id, input.id), eq(S.dcMaterialRequests.tenantId, tid(ctx))));
      await audit(ctx, "dc_material_request", input.id, "update", null, { status: "submitted" });
      return { success: true };
    }),

  /** Approve an MR → raises a generic approval request + notification. */
  materialRequestApprove: authedMutation
    .input(z.object({ id: z.number(), approved: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const status = input.approved ? "approved" : "rejected";
      await db.update(S.dcMaterialRequests).set({ status: status as any, updatedAt: new Date() } as any)
        .where(and(eq(S.dcMaterialRequests.id, input.id), eq(S.dcMaterialRequests.tenantId, tid(ctx))));
      await db.insert(S.dcApprovalRequests).values({
        tenantId: tid(ctx), entityType: "dc_material_request", entityId: input.id,
        title: `Material Request #${input.id}`, currentStep: 1, totalSteps: 1,
        status: input.approved ? "approved" : "rejected", requestedBy: uid(ctx) ?? null,
      });
      await audit(ctx, "dc_material_request", input.id, input.approved ? "approve" : "reject");
      return { success: true };
    }),

  ...crud(
    "purchaseRequest", S.dcPurchaseRequests,
    z.object({
      projectId: z.number(), mrId: z.number().optional(), prNo: optStr, requestDate: z.string(),
      status: z.enum(["draft", "submitted", "approved", "rejected", "converted", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_purchase_request",
    async (ctx, v) => (v.prNo ? v : { ...v, prNo: await docNo(ctx, "PR", S.dcPurchaseRequests) }),
  ),
  ...crud(
    "rfq", S.dcRfqs,
    z.object({
      prId: z.number().optional(), projectId: z.number(), rfqNo: optStr, issueDate: optDate, dueDate: optDate,
      status: z.enum(["draft", "sent", "closed", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_rfq",
    async (ctx, v) => (v.rfqNo ? v : { ...v, rfqNo: await docNo(ctx, "RFQ", S.dcRfqs) }),
  ),
  ...crud(
    "purchaseOrder", S.dcPurchaseOrders,
    z.object({
      projectId: z.number(), supplierId: z.number(), poNo: optStr, orderDate: optDate, expectedDate: optDate,
      subtotal: numOrStr, vatPercent: numOrStr, vatAmount: numOrStr, totalAmount: numOrStr,
      status: z.enum(["draft", "submitted", "approved", "partially_received", "received", "closed", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_purchase_order",
    async (ctx, v) => {
      const sub = Number(v.subtotal ?? 0);
      const vatP = v.vatPercent != null ? Number(v.vatPercent) : 15;
      const vat = v.vatAmount != null ? Number(v.vatAmount) : (sub * vatP) / 100;
      const total = v.totalAmount != null ? Number(v.totalAmount) : sub + vat;
      return {
        ...v,
        poNo: v.poNo ?? (await docNo(ctx, "PO", S.dcPurchaseOrders)),
        vatPercent: String(vatP),
        vatAmount: String(vat.toFixed(2)),
        totalAmount: String(total.toFixed(2)),
      };
    },
  ),

  purchaseOrderLineAdd: authedMutation
    .input(z.object({ poId: z.number(), materialId: z.number(), quantity: numOrStr, uom: optStr, unitPrice: numOrStr, vatPercent: numOrStr }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const q = Number(input.quantity ?? 0), p = Number(input.unitPrice ?? 0);
      const vat = Number(input.vatPercent ?? 15);
      const lineTotal = q * p * (1 + vat / 100);
      const [{ id }] = await db.insert(S.dcPurchaseOrderLines).values({
        tenantId: tid(ctx), poId: input.poId, materialId: input.materialId,
        quantity: String(q), uom: input.uom ?? "pcs", unitPrice: String(p),
        vatPercent: String(vat), lineTotal: String(lineTotal.toFixed(2)),
      }).$returningId();
      return { id, lineTotal, success: true };
    }),

  purchaseOrderLines: authedQuery
    .input(z.object({ poId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcPurchaseOrderLines)
        .where(and(eq(S.dcPurchaseOrderLines.tenantId, tid(ctx)), eq(S.dcPurchaseOrderLines.poId, input.poId)));
    }),

  ...crud(
    "grn", S.dcGrns,
    z.object({
      projectId: z.number(), poId: z.number().optional(), supplierId: z.number().optional(),
      grnNo: optStr, receiptDate: z.string(), invoiceRef: optStr,
      status: z.enum(["draft", "confirmed", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_grn",
    async (ctx, v) => (v.grnNo ? v : { ...v, grnNo: await docNo(ctx, "GRN", S.dcGrns) }),
  ),

  grnLineAdd: authedMutation
    .input(z.object({
      grnId: z.number(), materialId: z.number(), quantity: numOrStr, acceptedQty: numOrStr, rejectedQty: numOrStr,
      uom: optStr, unitPrice: numOrStr, batchNo: optStr, expiryDate: optDate,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcGrnLines).values({
        tenantId: tid(ctx), grnId: input.grnId, materialId: input.materialId,
        quantity: String(input.quantity ?? 0), acceptedQty: String(input.acceptedQty ?? input.quantity ?? 0),
        rejectedQty: String(input.rejectedQty ?? 0), uom: input.uom ?? "pcs",
        unitPrice: String(input.unitPrice ?? 0), batchNo: input.batchNo ?? null, expiryDate: input.expiryDate ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  ...crud(
    "store", S.dcStores,
    z.object({ projectId: z.number().optional(), warehouseId: z.number().optional(), code: z.string().min(1), nameEn: z.string().min(1), nameAr: optStr, storeType: z.enum(["main", "site", "project"]).optional() }),
    z.object({ id: z.number() }).passthrough(), "dc_store",
  ),

  ...crud(
    "stockMove", S.dcStockMoves,
    z.object({
      storeId: z.number(), projectId: z.number().optional(), materialId: z.number(),
      moveType: z.enum(["in", "out", "transfer", "return", "scrap", "adjust"]),
      quantity: numOrStr, uom: optStr, unitCost: numOrStr, totalCost: numOrStr,
      batchNo: optStr, expiryDate: optDate, refType: optStr, moveDate: z.string(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_stock_move",
  ),

  ...crud(
    "materialIssue", S.dcMaterialIssues,
    z.object({
      projectId: z.number(), storeId: z.number(), roomId: z.number().optional(), workItemId: z.number().optional(),
      issueNo: optStr, issueDate: z.string(), issuedTo: z.number().optional(),
      status: z.enum(["draft", "issued", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_material_issue",
  ),

  materialIssueLineAdd: authedMutation
    .input(z.object({ issueId: z.number(), materialId: z.number(), quantity: numOrStr, uom: optStr, unitCost: numOrStr }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcMaterialIssueLines).values({
        tenantId: tid(ctx), issueId: input.issueId, materialId: input.materialId,
        quantity: String(input.quantity ?? 0), uom: input.uom ?? "pcs", unitCost: String(input.unitCost ?? 0),
      }).$returningId();
      return { id, success: true };
    }),

  ...crud(
    "stockCount", S.dcStockCounts,
    z.object({ storeId: z.number(), countNo: optStr, countDate: z.string(), status: z.enum(["draft", "confirmed", "posted"]).optional() }),
    z.object({ id: z.number() }).passthrough(), "dc_stock_count",
  ),

  /** Budget vs actual + wastage view for a project. */
  budgetConsumptionList: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcBudgetConsumption)
        .where(and(eq(S.dcBudgetConsumption.tenantId, tid(ctx)), eq(S.dcBudgetConsumption.projectId, input.projectId)));
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 5. LABOUR · MANPOWER
   * ══════════════════════════════════════════════════════════════════════════ */
  attendanceList: authedQuery
    .input(z.object({ projectId: z.number(), from: optDate, to: optDate }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcAttendance.tenantId, tid(ctx)), eq(S.dcAttendance.projectId, input.projectId)];
      if (input.from) conds.push(sql`${S.dcAttendance.attendanceDate} >= ${input.from}`);
      if (input.to) conds.push(sql`${S.dcAttendance.attendanceDate} <= ${input.to}`);
      return db.select().from(S.dcAttendance).where(and(...conds)).orderBy(desc(S.dcAttendance.attendanceDate));
    }),

  attendanceUpsert: authedMutation
    .input(z.object({
      projectId: z.number(), labourId: z.number(), attendanceDate: z.string(),
      status: z.enum(["present", "absent", "leave", "holiday", "sick"]).optional(),
      checkIn: optStr, checkOut: optStr, normalHours: numOrStr, overtimeHours: numOrStr,
      source: z.enum(["manual", "mobile", "biometric", "gps"]).optional(),
      latitude: numOrStr, longitude: numOrStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcAttendance).values({
        tenantId: tid(ctx), projectId: input.projectId, labourId: input.labourId,
        attendanceDate: input.attendanceDate, status: input.status ?? "present",
        checkIn: input.checkIn ?? null, checkOut: input.checkOut ?? null,
        normalHours: String(input.normalHours ?? 8), overtimeHours: String(input.overtimeHours ?? 0),
        source: input.source ?? "manual",
        latitude: (input.latitude as any) ?? null, longitude: (input.longitude as any) ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  ...crud(
    "timesheet", S.dcTimesheets,
    z.object({
      projectId: z.number(), labourId: z.number(), workItemId: z.number().optional(), workDate: z.string(),
      hours: numOrStr, overtimeHours: numOrStr, ratePerHour: numOrStr,
      status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_timesheet",
  ),

  ...crud(
    "payrollRun", S.dcPayrollRuns,
    z.object({
      periodMonth: z.number(), periodYear: z.number(), runNo: optStr,
      status: z.enum(["draft", "calculated", "approved", "paid", "cancelled"]).optional(),
      totalGross: numOrStr, totalDeductions: numOrStr, totalNet: numOrStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_payroll_run",
  ),

  payrollLines: authedQuery
    .input(z.object({ runId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcPayrollLines)
        .where(and(eq(S.dcPayrollLines.tenantId, tid(ctx)), eq(S.dcPayrollLines.runId, input.runId)));
    }),

  ...crud(
    "advance", S.dcAdvances,
    z.object({
      labourId: z.number(), advanceDate: z.string(), amount: numOrStr, recoveredAmount: numOrStr,
      balance: numOrStr, installments: z.number().optional(),
      status: z.enum(["active", "closed", "cancelled"]).optional(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_advance",
  ),

  ...crud(
    "camp", S.dcCamps,
    z.object({
      nameEn: z.string().min(1), nameAr: optStr, city: optStr, address: optStr,
      totalRooms: z.number().optional(), totalBeds: z.number().optional(),
      monthlyRent: numOrStr, utilitiesCost: numOrStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_camp",
  ),

  /** Document expiry register + upcoming-expiry alert feed. */
  documentExpiryList: authedQuery
    .input(z.object({ withinDays: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcDocumentExpiry)
        .where(eq(S.dcDocumentExpiry.tenantId, tid(ctx)))
        .orderBy(asc(S.dcDocumentExpiry.expiryDate))
        .limit(500);
    }),

  documentExpiryCreate: authedMutation
    .input(z.object({
      entityType: z.enum(["labour", "supplier", "subcontractor", "equipment", "vehicle", "company"]),
      entityId: z.number(), docType: z.string(), docNumber: optStr,
      issueDate: optDate, expiryDate: z.string(), reminderDays: z.number().optional(), fileUrl: optStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcDocumentExpiry).values({
        tenantId: tid(ctx), entityType: input.entityType, entityId: input.entityId,
        docType: input.docType, docNumber: input.docNumber ?? null, issueDate: input.issueDate ?? null,
        expiryDate: input.expiryDate, reminderDays: input.reminderDays ?? 30, fileUrl: input.fileUrl ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  productivityList: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcProductivity)
        .where(and(eq(S.dcProductivity.tenantId, tid(ctx)), eq(S.dcProductivity.projectId, input.projectId)));
    }),

  productivityCreate: authedMutation
    .input(z.object({
      projectId: z.number(), labourId: z.number().optional(), workItemId: z.number().optional(),
      workDate: z.string(), completedQty: numOrStr, uom: optStr, hoursWorked: numOrStr,
      pieceRate: numOrStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const q = Number(input.completedQty ?? 0), h = Number(input.hoursWorked ?? 0), pr = Number(input.pieceRate ?? 0);
      const [{ id }] = await db.insert(S.dcProductivity).values({
        tenantId: tid(ctx), projectId: input.projectId, labourId: input.labourId ?? null,
        workItemId: input.workItemId ?? null, workDate: input.workDate,
        completedQty: String(q), uom: input.uom ?? "m2", hoursWorked: String(h),
        qtyPerHour: String(h > 0 ? (q / h).toFixed(3) : 0), pieceRate: String(pr),
        pieceAmount: String((q * pr).toFixed(2)),
      }).$returningId();
      return { id, success: true };
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 6. SUBCONTRACTORS
   * ══════════════════════════════════════════════════════════════════════════ */
  ...crud(
    "subcontract", S.dcSubcontracts,
    z.object({
      projectId: z.number(), subcontractorId: z.number(), subcontractNo: optStr, scopeEn: optStr, scopeAr: optStr,
      contractValue: numOrStr, retentionPercent: numOrStr, advanceAmount: numOrStr,
      startDate: optDate, endDate: optDate, status: z.enum(["draft", "active", "completed", "terminated"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_subcontract",
    async (ctx, v) => (v.subcontractNo ? v : { ...v, subcontractNo: await docNo(ctx, "SUB", S.dcSubcontracts) }),
  ),
  ...crud(
    "workOrder", S.dcWorkOrders,
    z.object({
      subcontractId: z.number(), projectId: z.number(), woNo: optStr, workItemId: z.number().optional(),
      descriptionEn: optStr, descriptionAr: optStr, quantity: numOrStr, uom: optStr, rate: numOrStr,
      status: z.enum(["draft", "issued", "in_progress", "completed", "closed"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_work_order",
  ),

  ...crud(
    "ipc", S.dcIpcs,
    z.object({
      projectId: z.number(), subcontractId: z.number(), ipcNo: optStr, periodFrom: optDate, periodTo: optDate,
      workDoneValue: numOrStr, retentionAmount: numOrStr, advanceRecovery: numOrStr,
      backCharges: numOrStr, penaltyAmount: numOrStr, netPayable: numOrStr,
      status: z.enum(["draft", "submitted", "certified", "approved", "paid", "rejected"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_ipc",
    async (ctx, v) => (v.ipcNo ? v : { ...v, ipcNo: await docNo(ctx, "IPC", S.dcIpcs) }),
  ),

  ipcLineList: authedQuery
    .input(z.object({ ipcId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcIpcLines)
        .where(and(eq(S.dcIpcLines.tenantId, tid(ctx)), eq(S.dcIpcLines.ipcId, input.ipcId)));
    }),

  ipcLineAdd: authedMutation
    .input(z.object({ ipcId: z.number(), workOrderId: z.number().optional(), description: optStr, quantity: numOrStr, rate: numOrStr }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const amount = Number(input.quantity ?? 0) * Number(input.rate ?? 0);
      const [{ id }] = await db.insert(S.dcIpcLines).values({
        tenantId: tid(ctx), ipcId: input.ipcId, workOrderId: input.workOrderId ?? null,
        description: input.description ?? null, quantity: String(input.quantity ?? 0),
        rate: String(input.rate ?? 0), amount: String(amount.toFixed(2)),
      }).$returningId();
      return { id, amount, success: true };
    }),

  backChargeCreate: authedMutation
    .input(z.object({
      projectId: z.number(), subcontractId: z.number().optional(), ipcId: z.number().optional(),
      chargeDate: z.string(), reason: optStr, amount: numOrStr, status: z.enum(["draft", "approved", "applied", "cancelled"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcBackCharges).values({
        tenantId: tid(ctx), projectId: input.projectId, subcontractId: input.subcontractId ?? null,
        ipcId: input.ipcId ?? null, chargeDate: input.chargeDate, reason: input.reason ?? null,
        amount: String(input.amount ?? 0), status: input.status ?? "draft",
      }).$returningId();
      return { id, success: true };
    }),

  backChargeList: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcBackCharges)
        .where(and(eq(S.dcBackCharges.tenantId, tid(ctx)), eq(S.dcBackCharges.projectId, input.projectId)));
    }),

  subcontractorLedger: authedQuery
    .input(z.object({ subcontractorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(S.dcSubcontractorLedger)
        .where(and(eq(S.dcSubcontractorLedger.tenantId, tid(ctx)), eq(S.dcSubcontractorLedger.subcontractorId, input.subcontractorId)))
        .orderBy(asc(S.dcSubcontractorLedger.entryDate));
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 7. BILLING · INVOICING (ZATCA-aware)
   * ══════════════════════════════════════════════════════════════════════════ */
  invoiceList: authedQuery
    .input(z.object({ projectId: z.number().optional(), status: optStr }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcInvoices.tenantId, tid(ctx)), isNull(S.dcInvoices.deletedAt)];
      if (input?.projectId) conds.push(eq(S.dcInvoices.projectId, input.projectId));
      if (input?.status) conds.push(eq(S.dcInvoices.status, input.status as any));
      return db.select().from(S.dcInvoices).where(and(...conds)).orderBy(desc(S.dcInvoices.createdAt));
    }),

  invoiceGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [invoice] = await db.select().from(S.dcInvoices)
        .where(and(eq(S.dcInvoices.id, input.id), eq(S.dcInvoices.tenantId, tid(ctx))));
      if (!invoice) return null;
      const lines = await db.select().from(S.dcInvoiceLines)
        .where(and(eq(S.dcInvoiceLines.tenantId, tid(ctx)), eq(S.dcInvoiceLines.invoiceId, input.id)));
      return { invoice, lines };
    }),

  invoiceCreate: authedMutation
    .input(z.object({
      projectId: z.number().optional(), clientId: z.number().optional(),
      invoiceType: z.enum(["tax", "simplified", "credit_note", "debit_note"]).optional(),
      billingType: z.enum(["advance", "progress", "final", "retention_release", "variation", "material", "labour", "service", "rental"]).optional(),
      invoiceDate: z.string(), dueDate: optDate, subtotal: numOrStr, discountAmount: numOrStr,
      retentionAmount: numOrStr, advanceRecovery: numOrStr, penaltyAmount: numOrStr,
      vatPercent: numOrStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const sub = Number(input.subtotal ?? 0);
      const net = sub - Number(input.discountAmount ?? 0) - Number(input.retentionAmount ?? 0)
        - Number(input.advanceRecovery ?? 0) - Number(input.penaltyAmount ?? 0);
      const vat = net * (Number(input.vatPercent ?? 15) / 100);
      const total = net + vat;
      const invoiceNo = await docNo(ctx, "INV", S.dcInvoices);
      const [{ id }] = await db.insert(S.dcInvoices).values({
        tenantId: tid(ctx), projectId: input.projectId ?? null, clientId: input.clientId ?? null,
        invoiceNo, invoiceType: input.invoiceType ?? "tax", billingType: input.billingType ?? "progress",
        invoiceDate: input.invoiceDate, dueDate: input.dueDate ?? null,
        subtotal: String(sub.toFixed(2)), discountAmount: String(input.discountAmount ?? 0),
        retentionAmount: String(input.retentionAmount ?? 0), advanceRecovery: String(input.advanceRecovery ?? 0),
        penaltyAmount: String(input.penaltyAmount ?? 0), vatPercent: String(input.vatPercent ?? 15),
        vatAmount: String(vat.toFixed(2)), totalAmount: String(total.toFixed(2)),
        paidAmount: "0", balanceDue: String(total.toFixed(2)), status: "draft",
        zatcaStatus: "pending", createdBy: uid(ctx) ?? null,
      } as any).$returningId();
      await audit(ctx, "dc_invoice", id, "create", null, { invoiceNo, total });
      return { id, invoiceNo, total, success: true };
    }),

  invoiceLineAdd: authedMutation
    .input(billingLine.extend({ invoiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const q = Number(input.quantity ?? 0), p = Number(input.unitPrice ?? 0);
      const lineTotal = q * p;
      const [{ id }] = await db.insert(S.dcInvoiceLines).values({
        tenantId: tid(ctx), invoiceId: input.invoiceId, workItemId: input.workItemId ?? null,
        descriptionEn: input.descriptionEn ?? null, descriptionAr: input.descriptionAr ?? null,
        quantity: String(q), uom: input.uom ?? "m2", unitPrice: String(p),
        vatPercent: String(input.vatPercent ?? 15), lineTotal: String(lineTotal.toFixed(2)),
      }).$returningId();
      return { id, success: true };
    }),

  /** Record ZATCA e-invoice response (called from the existing ZATCA service). */
  invoiceMarkZatca: authedMutation
    .input(z.object({
      id: z.number(), zatcaUuid: optStr, zatcaInvoiceHash: optStr, zatcaQrCode: optStr,
      zatcaXml: optStr, zatcaStatus: z.enum(["pending", "reported", "cleared", "rejected", "warning"]), zatcaResponse: optStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...rest } = input;
      await db.update(S.dcInvoices).set({ ...cleanInput(rest), updatedAt: new Date() } as any)
        .where(and(eq(S.dcInvoices.id, id), eq(S.dcInvoices.tenantId, tid(ctx))));
      return { success: true };
    }),

  ...crud(
    "progressBill", S.dcProgressBills,
    z.object({
      projectId: z.number(), billNo: optStr, periodFrom: optDate, periodTo: optDate,
      workDoneValue: numOrStr, cumulativeValue: numOrStr, retentionAmount: numOrStr,
      advanceRecovery: numOrStr, netAmount: numOrStr,
      status: z.enum(["draft", "submitted", "certified", "approved", "invoiced", "rejected"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_progress_bill",
  ),
  ...crud(
    "retention", S.dcRetentions,
    z.object({
      projectId: z.number(), invoiceId: z.number().optional(), retentionDate: z.string(),
      amount: numOrStr, releasedAmount: numOrStr,
      status: z.enum(["held", "partially_released", "released"]).optional(), releaseDueDate: optDate,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_retention",
  ),
  ...crud(
    "receipt", S.dcReceipts,
    z.object({
      projectId: z.number().optional(), clientId: z.number().optional(), invoiceId: z.number().optional(),
      receiptNo: optStr, receiptDate: z.string(), amount: numOrStr,
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "card", "other"]).optional(),
      reference: optStr, status: z.enum(["draft", "confirmed", "bounced", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_receipt",
  ),
  ...crud(
    "payment", S.dcPayments,
    z.object({
      projectId: z.number().optional(),
      payeeType: z.enum(["supplier", "subcontractor", "employee", "other"]).optional(), payeeId: z.number().optional(),
      paymentNo: optStr, paymentDate: z.string(), amount: numOrStr,
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "card", "other"]).optional(),
      reference: optStr, status: z.enum(["draft", "approved", "paid", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_payment",
  ),
  ...crud(
    "cheque", S.dcCheques,
    z.object({
      direction: z.enum(["received", "issued"]),
      partyType: z.enum(["client", "supplier", "subcontractor", "other"]),
      partyId: z.number().optional(), chequeNo: optStr, bankName: optStr, amount: numOrStr,
      chequeDate: optDate, dueDate: optDate,
      status: z.enum(["pending", "deposited", "cleared", "bounced", "cancelled"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_cheque",
  ),
  ...crud(
    "pettyCash", S.dcPettyCash,
    z.object({
      projectId: z.number().optional(), entryDate: z.string(), description: optStr, amount: numOrStr,
      entryType: z.enum(["top_up", "expense"]).optional(), receiptUrl: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_petty_cash",
  ),
  ...crud(
    "expenseClaim", S.dcExpenseClaims,
    z.object({
      projectId: z.number().optional(), employeeId: z.number().optional(), claimNo: optStr,
      claimDate: z.string(), description: optStr, amount: numOrStr,
      status: z.enum(["draft", "submitted", "approved", "rejected", "paid"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_expense_claim",
  ),
  ...crud(
    "fixedAsset", S.dcFixedAssets,
    z.object({
      equipmentId: z.number().optional(), assetCode: optStr, nameEn: z.string().min(1), nameAr: optStr,
      purchaseDate: optDate, purchaseCost: numOrStr, salvageValue: numOrStr,
      usefulLifeYears: z.number().optional(), accumulatedDepreciation: numOrStr, bookValue: numOrStr,
      status: z.enum(["active", "disposed", "idle"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_fixed_asset",
  ),

  /* ══════════════════════════════════════════════════════════════════════════
   * 8. EQUIPMENT & FLEET
   * ══════════════════════════════════════════════════════════════════════════ */
  equipmentAllocationList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcEquipmentAllocations.tenantId, tid(ctx))];
      if (input?.projectId) conds.push(eq(S.dcEquipmentAllocations.projectId, input.projectId));
      return db.select().from(S.dcEquipmentAllocations).where(and(...conds));
    }),

  equipmentAllocationCreate: authedMutation
    .input(z.object({
      equipmentId: z.number(), projectId: z.number().optional(), operatorId: z.number().optional(),
      startDate: optDate, endDate: optDate, billingRate: numOrStr, status: z.enum(["active", "returned"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcEquipmentAllocations).values({
        tenantId: tid(ctx), equipmentId: input.equipmentId, projectId: input.projectId ?? null,
        operatorId: input.operatorId ?? null, startDate: input.startDate ?? null, endDate: input.endDate ?? null,
        billingRate: String(input.billingRate ?? 0), status: input.status ?? "active",
      }).$returningId();
      return { id, success: true };
    }),

  equipmentMaintenanceList: authedQuery
    .input(z.object({ equipmentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcEquipmentMaintenance.tenantId, tid(ctx))];
      if (input?.equipmentId) conds.push(eq(S.dcEquipmentMaintenance.equipmentId, input.equipmentId));
      return db.select().from(S.dcEquipmentMaintenance).where(and(...conds));
    }),

  equipmentMaintenanceCreate: authedMutation
    .input(z.object({
      equipmentId: z.number(), maintenanceDate: z.string(),
      maintenanceType: z.enum(["preventive", "corrective", "inspection"]).optional(),
      description: optStr, cost: numOrStr, nextDueDate: optDate,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcEquipmentMaintenance).values({
        tenantId: tid(ctx), equipmentId: input.equipmentId, maintenanceDate: input.maintenanceDate,
        maintenanceType: input.maintenanceType ?? "preventive", description: input.description ?? null,
        cost: String(input.cost ?? 0), nextDueDate: input.nextDueDate ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  fuelLogList: authedQuery
    .input(z.object({ equipmentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcFuelLogs.tenantId, tid(ctx))];
      if (input?.equipmentId) conds.push(eq(S.dcFuelLogs.equipmentId, input.equipmentId));
      return db.select().from(S.dcFuelLogs).where(and(...conds));
    }),

  fuelLogCreate: authedMutation
    .input(z.object({
      equipmentId: z.number(), projectId: z.number().optional(), fuelDate: z.string(),
      litres: numOrStr, ratePerLitre: numOrStr, odometer: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const l = Number(input.litres ?? 0), r = Number(input.ratePerLitre ?? 0);
      const [{ id }] = await db.insert(S.dcFuelLogs).values({
        tenantId: tid(ctx), equipmentId: input.equipmentId, projectId: input.projectId ?? null,
        fuelDate: input.fuelDate, litres: String(l), ratePerLitre: String(r),
        amount: String((l * r).toFixed(2)), odometer: input.odometer ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  vehicleDocList: authedQuery
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(S.dcVehicleDocuments)
        .where(eq(S.dcVehicleDocuments.tenantId, tid(ctx)))
        .orderBy(asc(S.dcVehicleDocuments.expiryDate));
    }),

  vehicleDocCreate: authedMutation
    .input(z.object({
      equipmentId: z.number(), docType: z.enum(["istimara", "insurance", "fahas", "other"]),
      docNumber: optStr, expiryDate: z.string(), fileUrl: optStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcVehicleDocuments).values({
        tenantId: tid(ctx), equipmentId: input.equipmentId, docType: input.docType,
        docNumber: input.docNumber ?? null, expiryDate: input.expiryDate, fileUrl: input.fileUrl ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 9. QUALITY · SAFETY · COMPLIANCE
   * ══════════════════════════════════════════════════════════════════════════ */
  ...crud(
    "qcChecklist", S.dcQcChecklists,
    z.object({ nameEn: z.string().min(1), nameAr: optStr, activity: optStr, items: z.any().optional() }),
    z.object({ id: z.number() }).passthrough(), "dc_qc_checklist",
  ),
  ...crud(
    "qcResult", S.dcQcResults,
    z.object({
      projectId: z.number(), roomId: z.number().optional(), checklistId: z.number().optional(),
      inspectionDate: z.string(), results: z.any().optional(), score: numOrStr,
      status: z.enum(["pass", "fail", "conditional"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_qc_result",
  ),
  ...crud(
    "ncr", S.dcNcrs,
    z.object({
      projectId: z.number(), ncrNo: optStr, title: z.string().min(1), description: optStr,
      severity: z.enum(["minor", "major", "critical"]).optional(), correctiveAction: optStr,
      assignedTo: z.number().optional(), dueDate: optDate,
      status: z.enum(["open", "in_progress", "closed", "verified"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_ncr",
  ),
  ...crud(
    "incident", S.dcIncidents,
    z.object({
      projectId: z.number(), incidentDate: z.string(),
      incidentType: z.enum(["near_miss", "first_aid", "medical", "lost_time", "fatality", "property"]).optional(),
      description: optStr, severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      rootCause: optStr, correctiveAction: optStr, lostDays: z.number().optional(),
      status: z.enum(["open", "investigating", "closed"]).optional(),
    }),
    z.object({ id: z.number() }).passthrough(), "dc_incident",
  ),
  ...crud(
    "toolboxTalk", S.dcToolboxTalks,
    z.object({ projectId: z.number(), talkDate: z.string(), topic: optStr, attendeesCount: z.number().optional(), photoUrl: optStr }),
    z.object({ id: z.number() }).passthrough(), "dc_toolbox_talk",
  ),
  ...crud(
    "companyLicence", S.dcCompanyLicences,
    z.object({
      licenceType: z.string().min(1), licenceNumber: optStr, issuingAuthority: optStr,
      issueDate: optDate, expiryDate: optDate, fileUrl: optStr,
      status: z.enum(["valid", "expiring", "expired"]).optional(), notes: optStr,
    }),
    z.object({ id: z.number() }).passthrough(), "dc_company_licence",
  ),

  ppeList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcPpeIssuance.tenantId, tid(ctx))];
      if (input?.projectId) conds.push(eq(S.dcPpeIssuance.projectId, input.projectId));
      return db.select().from(S.dcPpeIssuance).where(and(...conds));
    }),

  ppeCreate: authedMutation
    .input(z.object({
      projectId: z.number(), labourId: z.number(), itemName: z.string().min(1),
      issueDate: z.string(), quantity: z.number().optional(), expiryDate: optDate,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcPpeIssuance).values({
        tenantId: tid(ctx), projectId: input.projectId, labourId: input.labourId, itemName: input.itemName,
        issueDate: input.issueDate, quantity: input.quantity ?? 1, expiryDate: input.expiryDate ?? null,
      }).$returningId();
      return { id, success: true };
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 10. CLIENT PORTAL
   * ══════════════════════════════════════════════════════════════════════════ */
  ...crud(
    "portalUser", S.dcPortalUsers,
    z.object({ clientId: z.number(), userId: z.number().optional(), email: z.string(), name: optStr }),
    z.object({ id: z.number() }).passthrough(), "dc_portal_user",
  ),

  portalApprovalList: authedQuery
    .input(z.object({ entityType: optStr, entityId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcPortalApprovals.tenantId, tid(ctx))];
      if (input?.entityType) conds.push(eq(S.dcPortalApprovals.entityType, input.entityType));
      if (input?.entityId) conds.push(eq(S.dcPortalApprovals.entityId, input.entityId));
      return db.select().from(S.dcPortalApprovals).where(and(...conds));
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 11. WORKFLOW · APPROVALS · AUDIT · NOTIFICATIONS
   * ══════════════════════════════════════════════════════════════════════════ */
  approvalList: authedQuery
    .input(z.object({ status: optStr, entityType: optStr }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcApprovalRequests.tenantId, tid(ctx))];
      if (input?.status) conds.push(eq(S.dcApprovalRequests.status, input.status as any));
      if (input?.entityType) conds.push(eq(S.dcApprovalRequests.entityType, input.entityType));
      return db.select().from(S.dcApprovalRequests).where(and(...conds)).orderBy(desc(S.dcApprovalRequests.createdAt));
    }),

  approvalCreate: authedMutation
    .input(z.object({
      entityType: z.string(), entityId: z.number(), projectId: z.number().optional(),
      title: optStr, amount: numOrStr, approverRole: optStr,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(S.dcApprovalRequests).values({
        tenantId: tid(ctx), entityType: input.entityType, entityId: input.entityId,
        projectId: input.projectId ?? null, title: input.title ?? null, amount: String(input.amount ?? 0),
        currentStep: 1, totalSteps: 1, status: "pending", requestedBy: uid(ctx) ?? null,
      }).$returningId();
      await db.insert(S.dcApprovalSteps).values({
        tenantId: tid(ctx), requestId: id, stepNo: 1,
        approverRole: input.approverRole ?? "admin", status: "pending",
      });
      return { id, success: true };
    }),

  approvalDecide: authedMutation
    .input(z.object({ requestId: z.number(), approved: z.boolean(), comments: optStr }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const status = input.approved ? "approved" : "rejected";
      await db.update(S.dcApprovalRequests).set({ status: status as any, updatedAt: new Date() } as any)
        .where(and(eq(S.dcApprovalRequests.id, input.requestId), eq(S.dcApprovalRequests.tenantId, tid(ctx))));
      await db.update(S.dcApprovalSteps)
        .set({ status: input.approved ? "approved" : "rejected", comments: input.comments ?? null, actedAt: new Date(), approverId: uid(ctx) ?? null } as any)
        .where(and(eq(S.dcApprovalSteps.requestId, input.requestId), eq(S.dcApprovalSteps.tenantId, tid(ctx))));
      await audit(ctx, "dc_approval_request", input.requestId, input.approved ? "approve" : "reject", null, { comments: input.comments });
      return { success: true };
    }),

  auditLogList: authedQuery
    .input(z.object({ entityType: optStr, entityId: z.number().optional(), limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcAuditLog.tenantId, tid(ctx))];
      if (input?.entityType) conds.push(eq(S.dcAuditLog.entityType, input.entityType));
      if (input?.entityId) conds.push(eq(S.dcAuditLog.entityId, input.entityId));
      return db.select().from(S.dcAuditLog).where(and(...conds))
        .orderBy(desc(S.dcAuditLog.createdAt)).limit(input?.limit ?? 200);
    }),

  notificationList: authedQuery
    .input(z.object({ unreadOnly: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conds = [eq(S.dcNotifications.tenantId, tid(ctx))];
      if (input?.unreadOnly) conds.push(eq(S.dcNotifications.isRead, false));
      return db.select().from(S.dcNotifications).where(and(...conds))
        .orderBy(desc(S.dcNotifications.createdAt)).limit(100);
    }),

  notificationMarkRead: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(S.dcNotifications).set({ isRead: true } as any)
        .where(and(eq(S.dcNotifications.id, input.id), eq(S.dcNotifications.tenantId, tid(ctx))));
      return { success: true };
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 12. DASHBOARD & REPORTS
   * ══════════════════════════════════════════════════════════════════════════ */
  decorationDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const t = tid(ctx);

    /** count(*) helper — tenant scoping is supplied by the caller. */
    const countOf = async (table: any, ...conds: any[]): Promise<number> => {
      const [row] = await db.select({ c: sql<number>`count(*)` }).from(table).where(and(...conds));
      return Number(row?.c ?? 0);
    };
    /** coalesce(sum(col), 0) helper. */
    const sumOf = async (table: any, col: any, ...conds: any[]): Promise<number> => {
      const [row] = await db.select({ v: sql<number>`coalesce(sum(${col}), 0)` }).from(table).where(and(...conds));
      return Number(row?.v ?? 0);
    };

    /* ── core counters ──────────────────────────────────────────────────── */
    const projects = await countOf(S.dcProjects, eq(S.dcProjects.tenantId, t), isNull(S.dcProjects.deletedAt));
    const running = await countOf(S.dcProjects, eq(S.dcProjects.tenantId, t), eq(S.dcProjects.status, "running"));
    const rooms = await countOf(S.dcRooms, eq(S.dcRooms.tenantId, t), isNull(S.dcRooms.deletedAt));
    const openSnags = await countOf(S.dcSnags, eq(S.dcSnags.tenantId, t), eq(S.dcSnags.status, "open"));
    const snagsCritical = await countOf(S.dcSnags, eq(S.dcSnags.tenantId, t), eq(S.dcSnags.status, "open"), eq(S.dcSnags.severity, "critical"));
    const snagsHigh = await countOf(S.dcSnags, eq(S.dcSnags.tenantId, t), eq(S.dcSnags.status, "open"), eq(S.dcSnags.severity, "high"));
    const pendingApprovals = await countOf(S.dcApprovalRequests, eq(S.dcApprovalRequests.tenantId, t), eq(S.dcApprovalRequests.status, "pending"));

    /* ── money ──────────────────────────────────────────────────────────── */
    const contractValue = await sumOf(S.dcProjects, S.dcProjects.contractValue, eq(S.dcProjects.tenantId, t));
    const invoiced = await sumOf(S.dcInvoices, S.dcInvoices.totalAmount, eq(S.dcInvoices.tenantId, t), isNull(S.dcInvoices.deletedAt));
    const collected = await sumOf(S.dcInvoices, S.dcInvoices.paidAmount, eq(S.dcInvoices.tenantId, t), isNull(S.dcInvoices.deletedAt));
    const payables = await sumOf(S.dcPayments, S.dcPayments.amount, eq(S.dcPayments.tenantId, t));

    /* ── pipeline (drives the launcher badges) ──────────────────────────── */
    const tendersOpen = await countOf(S.dcTenders, eq(S.dcTenders.tenantId, t),
      sql`${S.dcTenders.status} IN ('preparing','submitted')`);
    const contractsActive = await countOf(S.dcContracts, eq(S.dcContracts.tenantId, t), eq(S.dcContracts.status, "active"));
    const purchaseOrdersOpen = await countOf(S.dcPurchaseOrders, eq(S.dcPurchaseOrders.tenantId, t),
      sql`${S.dcPurchaseOrders.status} IN ('submitted','approved','partially_received')`);
    const materialRequestsPending = await countOf(S.dcMaterialRequests, eq(S.dcMaterialRequests.tenantId, t),
      eq(S.dcMaterialRequests.status, "submitted"));
    const ipcPending = await countOf(S.dcIpcs, eq(S.dcIpcs.tenantId, t),
      sql`${S.dcIpcs.status} IN ('submitted','certified')`);
    const handoverPending = await countOf(S.dcHandovers, eq(S.dcHandovers.tenantId, t), isNull(S.dcHandovers.deletedAt));
    const activeLabour = await countOf(S.dcLabour, eq(S.dcLabour.tenantId, t), isNull(S.dcLabour.deletedAt), eq(S.dcLabour.isActive, true));

    /* ── alerts ─────────────────────────────────────────────────────────── */
    const overdueInvoices = await countOf(S.dcInvoices, eq(S.dcInvoices.tenantId, t), isNull(S.dcInvoices.deletedAt),
      sql`${S.dcInvoices.balanceDue} > 0`,
      sql`(${S.dcInvoices.status} = 'overdue' OR (${S.dcInvoices.dueDate} IS NOT NULL AND ${S.dcInvoices.dueDate} < CURDATE()))`);
    const expiredDocs = await countOf(S.dcDocumentExpiry, eq(S.dcDocumentExpiry.tenantId, t),
      sql`${S.dcDocumentExpiry.expiryDate} < CURDATE()`);
    const expiringDocs = await countOf(S.dcDocumentExpiry, eq(S.dcDocumentExpiry.tenantId, t),
      sql`${S.dcDocumentExpiry.expiryDate} >= CURDATE() AND ${S.dcDocumentExpiry.expiryDate} <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`);
    const unreadNotifications = await countOf(S.dcNotifications, eq(S.dcNotifications.tenantId, t),
      eq(S.dcNotifications.isRead, false));

    /* Low stock = on-hand (in + return + adjust − out − scrap) ≤ min level. */
    let lowStockItems = 0;
    try {
      const [stockRows] = await db.execute(sql`
        SELECT COUNT(*) AS c FROM (
          SELECT m.id, m.min_stock_level,
                 COALESCE((SELECT SUM(CASE WHEN sm.move_type IN ('in','return','adjust') THEN sm.quantity
                                           WHEN sm.move_type IN ('out','scrap') THEN -sm.quantity
                                           ELSE 0 END)
                             FROM dc_stock_moves sm
                            WHERE sm.material_id = m.id AND sm.tenant_id = ${t}), 0) AS on_hand
            FROM dc_materials m
           WHERE m.tenant_id = ${t} AND m.deleted_at IS NULL AND m.min_stock_level > 0
        ) x WHERE x.on_hand <= x.min_stock_level
      `);
      lowStockItems = Number((stockRows as unknown as any[])?.[0]?.c ?? 0);
    } catch {
      /* fallback: count tracked materials so the badge never breaks the page */
      lowStockItems = await countOf(S.dcMaterials, eq(S.dcMaterials.tenantId, t),
        isNull(S.dcMaterials.deletedAt), sql`${S.dcMaterials.minStockLevel} > 0`);
    }

    return {
      projects,
      runningProjects: running,
      rooms,
      openSnags,
      snagsCritical,
      snagsHigh,
      pendingApprovals,
      contractValue,
      invoiced,
      collected,
      receivables: invoiced - collected,
      payables,
      lowStockItems,
      /* launcher badges */
      tendersOpen,
      contractsActive,
      purchaseOrdersOpen,
      materialRequestsPending,
      ipcPending,
      handoverPending,
      activeLabour,
      overdueInvoices,
      expiredDocs,
      expiringDocs,
      unreadNotifications,
    };
  }),

  projectDashboard: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const t = tid(ctx);
      const pid = input.projectId;
      const [roomsCount] = await db.select({ c: sql<number>`count(*)` }).from(S.dcRooms).where(and(eq(S.dcRooms.tenantId, t), eq(S.dcRooms.projectId, pid)));
      const [avgProgress] = await db.select({ v: sql<number>`coalesce(avg(completion_percent), 0)` }).from(S.dcRooms).where(and(eq(S.dcRooms.tenantId, t), eq(S.dcRooms.projectId, pid)));
      const [snagCount] = await db.select({ c: sql<number>`count(*)` }).from(S.dcSnags).where(and(eq(S.dcSnags.tenantId, t), eq(S.dcSnags.projectId, pid), eq(S.dcSnags.status, "open")));
      const [invoiceTotal] = await db.select({ v: sql<number>`coalesce(sum(total_amount), 0)` }).from(S.dcInvoices).where(and(eq(S.dcInvoices.tenantId, t), eq(S.dcInvoices.projectId, pid)));
      const [materialCost] = await db.select({ v: sql<number>`coalesce(sum(total_cost), 0)` }).from(S.dcStockMoves).where(and(eq(S.dcStockMoves.tenantId, t), eq(S.dcStockMoves.projectId, pid)));
      const [labourCost] = await db.select({ v: sql<number>`coalesce(sum(cost_amount), 0)` }).from(S.dcTimesheets).where(and(eq(S.dcTimesheets.tenantId, t), eq(S.dcTimesheets.projectId, pid)));
      return {
        rooms: Number(roomsCount?.c ?? 0),
        avgProgress: Number(avgProgress?.v ?? 0),
        openSnags: Number(snagCount?.c ?? 0),
        invoiced: Number(invoiceTotal?.v ?? 0),
        materialCost: Number(materialCost?.v ?? 0),
        labourCost: Number(labourCost?.v ?? 0),
      };
    }),

  /* ══════════════════════════════════════════════════════════════════════════
   * 13. ZATCA-COMPLIANT INVOICE OUTPUT (on-screen doc / PDF / XLSX / XML)
   * ══════════════════════════════════════════════════════════════════════════ */

  /** Everything the print-ready invoice view needs (bilingual + QR + UUID + hash). */
  invoiceDocument: authedQuery
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const doc = await invoicePackage(ctx, input.invoiceId);
      await audit(ctx, "dc_invoice", input.invoiceId, "export", null, {
        format: "document", invoiceNo: doc.invoice.invoiceNo,
      });
      return doc;
    }),

  /** UBL 2.1 XML (unsigned) — the file the ZATCA portal / middleware consumes. */
  invoiceXml: authedQuery
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const doc = await invoicePackage(ctx, input.invoiceId);
      await audit(ctx, "dc_invoice", input.invoiceId, "export", null, {
        format: "xml", invoiceNo: doc.invoice.invoiceNo,
      });
      return {
        xml: doc.zatca.xml,
        filename: `ZATCA-${doc.invoice.invoiceNo}.xml`,
        uuid: doc.zatca.uuid,
        hash: doc.zatca.hash,
      };
    }),

  /** Bilingual .xlsx invoice with embedded ZATCA QR, UUID and hash. */
  invoiceXlsx: authedMutation
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await invoicePackage(ctx, input.invoiceId);

      const wb = new ExcelJS.Workbook();
      wb.creator = "YASCO ERP — Decoration & Construction";
      wb.created = new Date();
      const ws = wb.addWorksheet(`Invoice ${doc.invoice.invoiceNo}`, {
        pageSetup: {
          paperSize: 9, orientation: "portrait", fitToPage: true,
          fitToWidth: 1, fitToHeight: 0,
          margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
        },
        views: [{ showGridLines: false }],
      });
      ws.columns = [
        { width: 5 }, { width: 34 }, { width: 24 }, { width: 9 },
        { width: 7 }, { width: 13 }, { width: 8 }, { width: 15 },
      ];
      ws.getColumn(8).alignment = { horizontal: "right" };

      const BRAND = "FF0F5132";
      const BRASS = "FFC08A3E";
      const PAPER = "FFF7F5F0";
      const LINE = "FFE6E1D6";

      const thin = { style: "thin" as const, color: { argb: LINE } };
      const box = { top: thin, left: thin, bottom: thin, right: thin };
      const moneyFmt = "#,##0.00";
      const center = { horizontal: "center" as const, vertical: "middle" as const };
      const right = { horizontal: "right" as const, vertical: "middle" as const };

      /* ── letterhead ─────────────────────────────────────────────────── */
      ws.mergeCells("A1:D4");
      const sellerCell = ws.getCell("A1");
      sellerCell.value = {
        richText: [
          { font: { bold: true, size: 13, color: { argb: BRAND } }, text: `${doc.seller.nameEn}\n` },
          { font: { size: 9 }, text: `VAT No: ${doc.seller.vatNumber || "—"}\n` },
          { font: { size: 9 }, text: `C.R. No: ${doc.seller.crNumber || "—"}\n` },
          { font: { size: 9 }, text: doc.seller.address || "" },
        ],
      };
      sellerCell.alignment = { vertical: "top", wrapText: true };

      ws.mergeCells("E1:H4");
      const sellerAr = ws.getCell("E1");
      sellerAr.value = {
        richText: [
          { font: { bold: true, size: 13, color: { argb: BRAND } }, text: `${doc.seller.nameAr}\n` },
          { font: { size: 9 }, text: `الرقم الضريبي: ${doc.seller.vatNumber || "—"}\n` },
          { font: { size: 9 }, text: `السجل التجاري: ${doc.seller.crNumber || "—"}\n` },
          { font: { size: 9 }, text: `${doc.seller.phone || ""} ${doc.seller.email || ""}` },
        ],
      };
      sellerAr.alignment = { vertical: "top", horizontal: "right", wrapText: true, readingOrder: "rtl" };

      if (doc.seller.logo) {
        const logo = dataUriBuffer(doc.seller.logo);
        if (logo) {
          const ext = /^data:image\/png/i.test(doc.seller.logo) ? "png" : "jpeg";
          const id = wb.addImage({ buffer: logo as any, extension: ext });
          ws.addImage(id, { tl: { col: 3.35, row: 0.25 }, ext: { width: 96, height: 58 } });
        }
      }

      /* ── title band ─────────────────────────────────────────────────── */
      let r = 6;
      ws.mergeCells(`A${r}:H${r}`);
      const title = ws.getCell(`A${r}`);
      title.value = doc.invoice.invoiceType === "simplified"
        ? "SIMPLIFIED TAX INVOICE  ·  فاتورة ضريبية مبسطة"
        : doc.invoice.invoiceType === "credit_note"
          ? "CREDIT NOTE  ·  إشعار دائن ضريبي"
          : doc.invoice.invoiceType === "debit_note"
            ? "DEBIT NOTE  ·  إشعار مدين ضريبي"
            : "TAX INVOICE  ·  فاتورة ضريبية";
      title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
      title.alignment = center;
      ws.getRow(r).height = 24;
      r += 1;
      ws.mergeCells(`A${r}:H${r}`);
      ws.getCell(`A${r}`).value = "Decoration & Construction  ·  الديكور والإنشاءات";
      ws.getCell(`A${r}`).font = { size: 9, color: { argb: BRASS } };
      ws.getCell(`A${r}`).alignment = center;
      r += 2;

      /* ── meta grid ──────────────────────────────────────────────────── */
      const meta: Array<[string, string, string, string]> = [
        ["Invoice No · رقم الفاتورة", doc.invoice.invoiceNo, "Invoice date · تاريخ الفاتورة", doc.invoice.invoiceDate],
        ["Due date · تاريخ الاستحقاق", doc.invoice.dueDate || "—", "Billing type · نوع الفاتورة", doc.invoice.billingType.replace(/_/g, " ")],
        ["Project · المشروع", doc.project ? `${doc.project.code} — ${doc.project.nameEn}` : "—", "Status · الحالة", doc.invoice.status],
        ["Client · العميل", doc.client ? (doc.client.nameEn || doc.client.nameAr || "—") : "—", "Client VAT · الرقم الضريبي للعميل", doc.client?.vatNumber || "—"],
      ];
      for (const [le, ve, lr, vr] of meta) {
        ws.mergeCells(`A${r}:B${r}`);
        ws.getCell(`A${r}`).value = le;
        ws.getCell(`A${r}`).font = { bold: true, size: 9, color: { argb: BRAND } };
        ws.getCell(`A${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAPER } };

        ws.mergeCells(`C${r}:D${r}`);
        ws.getCell(`C${r}`).value = ve;
        ws.getCell(`C${r}`).font = { size: 9 };

        ws.mergeCells(`E${r}:F${r}`);
        ws.getCell(`E${r}`).value = lr;
        ws.getCell(`E${r}`).font = { bold: true, size: 9, color: { argb: BRAND } };
        ws.getCell(`E${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAPER } };
        ws.getCell(`E${r}`).alignment = right;

        ws.mergeCells(`G${r}:H${r}`);
        ws.getCell(`G${r}`).value = vr;
        ws.getCell(`G${r}`).font = { size: 9 };
        ws.getCell(`G${r}`).alignment = right;
        r += 1;
      }
      r += 1;

      /* ── line items ─────────────────────────────────────────────────── */
      const headRow = r;
      const heads = [
        "#", "Description (EN)", "الوصف (عربي)", "Qty", "UOM", "Unit price", "VAT %", "Amount",
      ];
      heads.forEach((h, i) => {
        const cell = ws.getCell(headRow, i + 1);
        cell.value = h;
        cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
        cell.alignment = { horizontal: i === 0 ? "center" : i >= 3 ? "right" : "left", vertical: "middle" };
        cell.border = box;
      });
      ws.getRow(headRow).height = 20;
      r += 1;

      doc.lines.forEach((l, idx) => {
        const values: any[] = [
          idx + 1, l.descriptionEn, l.descriptionAr, l.quantity, l.uom, l.unitPrice, l.vatPercent, l.lineTotal,
        ];
        values.forEach((v, i) => {
          const cell = ws.getCell(r, i + 1);
          cell.value = v;
          cell.font = { size: 9 };
          cell.border = box;
          if (i === 3 || i === 5 || i === 7) cell.numFmt = moneyFmt;
          if (i === 2) cell.alignment = { horizontal: "right", readingOrder: "rtl" };
          else cell.alignment = { horizontal: i === 0 || i === 4 ? "center" : i >= 3 ? "right" : "left" };
        });
        ws.getRow(r).height = 18;
        r += 1;
      });
      r += 1;

      /* ── totals ─────────────────────────────────────────────────────── */
      const t = doc.totals;
      const totalRows: Array<[string, string, number, boolean]> = [
        ["Subtotal", "المجموع الفرعي", t.subtotal, false],
        ["Discount", "الخصم", -t.discount, false],
        ["Retention", "المحتجز", -t.retention, false],
        ["Advance recovery", "استرداد الدفعة المقدمة", -t.advanceRecovery, false],
        ["Penalty / LD", "الغرامات", -t.penalty, false],
        ["Taxable amount", "المبلغ الخاضع للضريبة", t.net, true],
        [`VAT ${t.vatPercent}%`, `ضريبة القيمة المضافة ${t.vatPercent}%`, t.vat, false],
        ["Total including VAT", "الإجمالي شامل الضريبة", t.total, true],
        ["Paid", "المدفوع", -t.paid, false],
        ["Balance due", "الرصيد المستحق", t.balance, true],
      ];
      for (const [en, ar, val, strong] of totalRows) {
        ws.mergeCells(`F${r}:G${r}`);
        ws.getCell(`F${r}`).value = `${en} · ${ar}`;
        ws.getCell(`F${r}`).alignment = right;
        ws.getCell(`F${r}`).font = { size: 9, bold: strong };
        ws.getCell(`H${r}`).value = Number(val.toFixed(2));
        ws.getCell(`H${r}`).numFmt = moneyFmt;
        ws.getCell(`H${r}`).alignment = right;
        ws.getCell(`H${r}`).font = { size: 9, bold: strong };
        ws.getCell(`H${r}`).border = box;
        if (strong) {
          ws.getCell(`F${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAPER } };
          ws.getCell(`H${r}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAPER } };
        }
        r += 1;
      }
      r += 2;

      /* ── ZATCA QR + identifiers ─────────────────────────────────────── */
      const qrRow = r;
      const qrImgId = wb.addImage({ base64: doc.zatca.qrDataUrl, extension: "png" } as any);
      ws.addImage(qrImgId, { tl: { col: 0.15, row: qrRow - 1 + 0.1 }, ext: { width: 104, height: 104 } });

      ws.mergeCells(`C${qrRow}:H${qrRow}`);
      ws.getCell(`C${qrRow}`).value = "ZATCA Phase-2 (Fatoora) e-invoice";
      ws.getCell(`C${qrRow}`).font = { bold: true, size: 9, color: { argb: BRAND } };

      ws.mergeCells(`C${qrRow + 1}:H${qrRow + 1}`);
      ws.getCell(`C${qrRow + 1}`).value = `UUID: ${doc.zatca.uuid}`;
      ws.getCell(`C${qrRow + 1}`).font = { size: 8, color: { argb: "FF6B7280" } };

      ws.mergeCells(`C${qrRow + 2}:H${qrRow + 2}`);
      ws.getCell(`C${qrRow + 2}`).value = `Invoice hash (SHA-256): ${doc.zatca.hash}`;
      ws.getCell(`C${qrRow + 2}`).font = { size: 8, color: { argb: "FF6B7280" } };
      ws.getCell(`C${qrRow + 2}`).alignment = { wrapText: true };

      ws.mergeCells(`C${qrRow + 3}:H${qrRow + 3}`);
      ws.getCell(`C${qrRow + 3}`).value = `Mode: ${doc.zatca.mode} · Type code: ${doc.zatca.typeCode} · Currency: SAR`;
      ws.getCell(`C${qrRow + 3}`).font = { size: 8, color: { argb: "FF6B7280" } };

      r = qrRow + 6;
      ws.mergeCells(`A${r}:H${r}`);
      ws.getCell(`A${r}`).value = "This document was generated electronically by YASCO ERP — Decoration & Construction.";
      ws.getCell(`A${r}`).font = { size: 8, italic: true, color: { argb: "FF8A7A5C" } };
      ws.getCell(`A${r}`).alignment = center;

      const buffer = await wb.xlsx.writeBuffer();
      await audit(ctx, "dc_invoice", input.invoiceId, "export", null, {
        format: "xlsx", invoiceNo: doc.invoice.invoiceNo,
      });

      return {
        buffer_base64: Buffer.from(buffer as ArrayBuffer).toString("base64"),
        filename: `${doc.invoice.invoiceNo}.xlsx`,
        invoiceNo: doc.invoice.invoiceNo,
      };
    }),
});
