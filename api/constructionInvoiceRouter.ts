import { z } from "zod";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, constructionInvoices, constructionInvoiceItems } from "@db/schema";
import { eq, and, desc, sql, or, like } from "drizzle-orm";
import { cleanInput } from "./cleanInput";

const itemSchema = z.object({
  descriptionEn: z.string().min(1).max(255),
  descriptionAr: z.string().max(255).optional(),
  unit: z.string().max(30).optional(),
  totalHour: z.coerce.number().min(0),
  rate: z.coerce.number().min(0),
});

const newCustomerSchema = z.object({
  nameEn: z.string().min(2).max(255),
  nameAr: z.string().max(255).optional(),
  vatNo: z.string().max(100).optional(),
  crNo: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(1000).optional(),
});

const createSchema = z.object({
  customerId: z.number().int().positive().optional(),
  newCustomer: newCustomerSchema.optional(),
  invoiceNo: z.string().max(60).optional(),
  poNumber: z.string().max(90).optional(),
  workedMonth: z.string().max(30).optional(),
  paymentType: z.string().max(40).optional(),
  cashier: z.string().max(120).optional(),
  dueDate: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(["draft", "submitted", "approved", "paid"]).optional(),
  items: z.array(itemSchema).min(1),
}).refine((d) => !!d.customerId || !!d.newCustomer, { message: "customer required" });

export const constructionInvoiceRouter = {
  /** Autocomplete: search BOTH English + Arabic names. Fires from 2 chars. */
  customerSearch: authedQuery.input(z.object({ q: z.string().min(2).max(80) })).query(async ({ ctx, input }) => {
    const db = getDb();
    const term = `%${input.q.trim()}%`;
    return db.select({
      id: customers.id,
      name: customers.name,
      nameAr: customers.nameAr,
      vatNo: customers.taxNumber,
      crNo: sql<string>`commercial_registration`,
      address: customers.address,
      phone: customers.phone,
    }).from(customers)
      .where(and(
        eq(customers.tenantId, ctx.user.tenantId!),
        or(like(customers.name, term), like(customers.nameAr, term)),
      ))
      .orderBy(customers.name)
      .limit(10);
  }),

  nextInvoiceNo: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select({ c: sql<number>`count(*)` }).from(constructionInvoices)
      .where(eq(constructionInvoices.tenantId, ctx.user.tenantId!));
    const seq = Number(rows[0]?.c || 0) + 1;
    const d = new Date();
    return `YCI-${d.getFullYear()}-${String(seq).padStart(4, "0")}`;
  }),

  /** Create bill; if only details given (no id) the customer is AUTO-CREATED. */
  invoiceCreate: authedQuery.input(createSchema).mutation(async ({ ctx, input }) => {
    const db = getDb();
    let customerId = input.customerId ?? null;
    let cust = {
      name: input.newCustomer?.nameEn ?? "",
      nameAr: input.newCustomer?.nameAr ?? "",
      vatNo: input.newCustomer?.vatNo ?? "",
      crNo: input.newCustomer?.crNo ?? "",
      address: input.newCustomer?.address ?? "",
      phone: input.newCustomer?.phone ?? "",
    };

    if (!customerId && input.newCustomer) {
      const [created] = await db.insert(customers).values({
        tenantId: ctx.user.tenantId!,
        name: input.newCustomer.nameEn,
        nameAr: input.newCustomer.nameAr || null,
        taxNumber: input.newCustomer.vatNo || null,
        commercialRegistration: (input.newCustomer as any).crNo || null,
        address: input.newCustomer.address || null,
        phone: input.newCustomer.phone || null,
        isActive: true,
      } as any).$returningId();
      customerId = created.id;
    }

    if (customerId && !input.newCustomer) {
      const rows = await db.select().from(customers)
        .where(and(eq(customers.id, customerId), eq(customers.tenantId, ctx.user.tenantId!))).limit(1);
      if (rows[0]) {
        cust = {
          name: rows[0].name, nameAr: rows[0].nameAr || "",
          vatNo: rows[0].taxNumber || "", crNo: (rows[0] as any).commercialRegistration || "",
          address: rows[0].address || "", phone: rows[0].phone || "",
        };
      }
    }

    // totals computed server-side (VAT 15%)
    const items = input.items.map((it, i) => ({
      sr: i + 1,
      descriptionEn: it.descriptionEn,
      descriptionAr: it.descriptionAr || null,
      unit: it.unit || "Hour",
      totalHour: String(it.totalHour),
      rate: String(it.rate),
      lineTotal: String(+(it.totalHour * it.rate).toFixed(4)),
    }));
    const subtotal = items.reduce((s, r) => s + Number(r.lineTotal), 0);
    const vatAmount = +(subtotal * 0.15).toFixed(4);
    const grandTotal = +(subtotal + vatAmount).toFixed(4);

    let invoiceNo = input.invoiceNo?.trim();
    if (!invoiceNo) {
      const rows = await db.select({ c: sql<number>`count(*)` }).from(constructionInvoices)
        .where(eq(constructionInvoices.tenantId, ctx.user.tenantId!));
      invoiceNo = `YCI-${new Date().getFullYear()}-${String(Number(rows[0]?.c || 0) + 1).padStart(4, "0")}`;
    }

    const [inv] = await db.insert(constructionInvoices).values({
      tenantId: ctx.user.tenantId!,
      projectId: null,
      customerId,
      invoiceNo,
      poNumber: input.poNumber || null,
      workedMonth: input.workedMonth || null,
      paymentType: input.paymentType || "Credit",
      cashier: input.cashier || "مدير النظام",
      dueDate: input.dueDate || null,
      status: input.status || "draft",
      subtotal: String(+subtotal.toFixed(4)),
      vatPercent: "15",
      vatAmount: String(vatAmount),
      grandTotal: String(grandTotal),
      notes: input.notes || null,
      createdBy: (ctx.user as any)?.id ?? null,
      customerName: cust.name || null,
      customerNameAr: cust.nameAr || null,
      customerVat: cust.vatNo || null,
      customerCr: cust.crNo || null,
      customerAddress: cust.address || null,
      customerPhone: cust.phone || null,
    } as any).$returningId();

    await db.insert(constructionInvoiceItems).values(
      items.map((r) => ({ ...r, invoiceId: inv.id })) as any,
    );

    const saved = await db.select().from(constructionInvoices)
      .where(eq(constructionInvoices.id, inv.id)).limit(1);
    const savedItems = await db.select().from(constructionInvoiceItems)
      .where(eq(constructionInvoiceItems.invoiceId, inv.id));
    return { ok: true, autoCreatedCustomer: !input.customerId && !!input.newCustomer, customerId, invoice: saved[0], items: savedItems };
  }),

  invoiceList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(constructionInvoices)
      .where(eq(constructionInvoices.tenantId, ctx.user.tenantId!))
      .orderBy(desc(constructionInvoices.createdAt)).limit(300);
  }),

  invoiceGet: authedQuery.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = getDb();
    const rows = await db.select().from(constructionInvoices)
      .where(and(eq(constructionInvoices.id, input.id), eq(constructionInvoices.tenantId, ctx.user.tenantId!))).limit(1);
    if (!rows[0]) throw new Error("Invoice not found");
    const items = await db.select().from(constructionInvoiceItems)
      .where(eq(constructionInvoiceItems.invoiceId, input.id));
    return { invoice: rows[0], items };
  }),

  itemSearch: authedQuery.input(z.object({ q: z.string().min(2).max(80) })).query(async ({ ctx, input }) => {
    const db = getDb();
    const pat = `%${input.q}%`;
    const rows = await db.select({
      descriptionEn: constructionInvoiceItems.descriptionEn,
      descriptionAr: constructionInvoiceItems.descriptionAr,
      unit: constructionInvoiceItems.unit,
      rate: constructionInvoiceItems.rate,
    })
      .from(constructionInvoiceItems)
      .innerJoin(constructionInvoices, eq(constructionInvoiceItems.invoiceId, constructionInvoices.id))
      .where(and(
        eq(constructionInvoices.tenantId, ctx.user.tenantId!),
        or(
          like(constructionInvoiceItems.descriptionEn, pat),
          like(constructionInvoiceItems.descriptionAr, pat),
        ),
      ))
      .orderBy(desc(constructionInvoiceItems.id))
      .limit(100);
    const seen = new Set<string>();
    const out: any[] = [];
    for (const r of rows) {
      const key = String(r.descriptionEn || "").toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(r);
      if (out.length >= 20) break;
    }
    return out;
  }),

  invoiceDelete: authedMutation.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const rows = await db.select({ id: constructionInvoices.id }).from(constructionInvoices)
      .where(and(eq(constructionInvoices.id, input.id), eq(constructionInvoices.tenantId, ctx.user.tenantId!))).limit(1);
    if (!rows[0]) throw new Error("Invoice not found");
    await db.delete(constructionInvoiceItems).where(eq(constructionInvoiceItems.invoiceId, rows[0].id));
    await db.delete(constructionInvoices).where(eq(constructionInvoices.id, rows[0].id));
    return { success: true };
  }),
};
