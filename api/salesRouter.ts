import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  customers, salesQuotations, salesQuotationItems,
  salesOrders, salesOrderItems, invoices, invoiceItems,
  creditNotes, customerPayments, companySettings, auditLogs, companies
} from "@db/schema";
import { eq, sql, and, like, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { onInvoiceCreated, onPaymentReceived } from "./lib/notifications/events";

function encodeZatcaTlv(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const buf = new Uint8Array(2 + valueBytes.length);
  buf[0] = tag;
  buf[1] = valueBytes.length;
  buf.set(valueBytes, 2);
  return buf;
}

function buildZatcaQrPayload(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalWithVat: string,
  vatTotal: string,
): string {
  const parts = [
    encodeZatcaTlv(1, sellerName),
    encodeZatcaTlv(2, vatNumber),
    encodeZatcaTlv(3, timestamp),
    encodeZatcaTlv(4, totalWithVat),
    encodeZatcaTlv(5, vatTotal),
  ];
  const combined = Buffer.concat(parts.map((part) => Buffer.from(part)));
  return combined.toString("base64");
}

function buildSaudiInvoiceXml(input: {
  invoiceNumber: string;
  date: string;
  sellerName: string;
  vatNumber: string;
  crNumber?: string | null;
  currency: string;
  subTotal: string;
  taxAmount: string;
  totalAmount: string;
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${input.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${input.date}</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${input.currency}</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme><cbc:CompanyID>${input.vatNumber}</cbc:CompanyID></cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${input.sellerName}</cbc:RegistrationName>
        ${input.crNumber ? `<cbc:CompanyID>${input.crNumber}</cbc:CompanyID>` : ""}
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${input.currency}">${input.subTotal}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${input.currency}">${input.subTotal}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${input.currency}">${input.totalAmount}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${input.currency}">${input.totalAmount}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:TaxTotal><cbc:TaxAmount currencyID="${input.currency}">${input.taxAmount}</cbc:TaxAmount></cac:TaxTotal>
</Invoice>`;
}

function isSaudiCompany(settings: typeof companySettings.$inferSelect | undefined) {
  const country = (settings?.country || "").toLowerCase();
  return country.includes("saudi") || country.includes("ksa") || settings?.defaultCurrency === "SAR";
}

function isValidSaudiVatNumber(vatNumber: string) {
  const cleaned = vatNumber.replace(/\D/g, "");
  return /^3\d{13}3$/.test(cleaned);
}

function isIssuedOrZatcaLocked(invoice: typeof invoices.$inferSelect) {
  return Boolean(
    invoice.zatcaXml ||
    invoice.zatcaStatus === "reported" ||
    invoice.zatcaStatus === "cleared" ||
    invoice.status === "paid" ||
    invoice.status === "partial" ||
    invoice.status === "credit_note",
  );
}

export const salesRouter = createRouter({
  // Customers
  customerList: authedQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(customers.tenantId, tenantId)];
      if (input?.search) conditions.push(like(customers.name, `%${input.search}%`));
      return db.select().from(customers).where(and(...conditions)).orderBy(desc(customers.createdAt));
    }),

  customerGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      return db.query.customers.findFirst({
        where: and(eq(customers.tenantId, tenantId), eq(customers.id, input.id)),
      });
    }),

  customerCreate: authedQuery
    .input(z.object({
      code: z.string().optional(),
      name: z.string(),
      nameAr: z.string().optional(),
      customerType: z.enum(["b2b", "b2c", "government", "cash_customer"]).optional(),
      crNumber: z.string().optional(),
      vatNumber: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      whatsapp: z.string().optional(),
      address: z.string().optional(),
      addressAr: z.string().optional(),
      buildingNumber: z.string().optional(),
      streetName: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      additionalNumber: z.string().optional(),
      taxNumber: z.string().optional(),
      contactPerson: z.string().optional(),
      contactTitle: z.string().optional(),
      creditLimit: z.string().optional(),
      paymentTerms: z.number().optional(),
      openingBalance: z.string().optional(),
      openingBalanceDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(customers).values({
        tenantId: ctx.user.tenantId!,
        code: input.code || `CUST-${Date.now()}`,
        name: input.name,
        nameAr: input.nameAr,
        customerType: input.customerType || "b2b",
        crNumber: input.crNumber,
        vatNumber: input.vatNumber,
        email: input.email,
        phone: input.phone,
        mobile: input.mobile,
        whatsapp: input.whatsapp,
        address: input.address,
        addressAr: input.addressAr,
        buildingNumber: input.buildingNumber,
        streetName: input.streetName,
        district: input.district,
        city: input.city,
        postalCode: input.postalCode,
        additionalNumber: input.additionalNumber,
        taxNumber: input.taxNumber,
        contactPerson: input.contactPerson,
        contactTitle: input.contactTitle,
        creditLimit: input.creditLimit || "0",
        paymentTerms: input.paymentTerms ?? 30,
        openingBalance: input.openingBalance || "0",
        openingBalanceDate: input.openingBalanceDate,
        notes: input.notes,
      }).$returningId();
      return { id, success: true };
    }),

  customerUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      name: z.string().optional(),
      nameAr: z.string().optional(),
      customerType: z.enum(["b2b", "b2c", "government", "cash_customer"]).optional(),
      crNumber: z.string().optional(),
      vatNumber: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      whatsapp: z.string().optional(),
      address: z.string().optional(),
      addressAr: z.string().optional(),
      buildingNumber: z.string().optional(),
      streetName: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      additionalNumber: z.string().optional(),
      taxNumber: z.string().optional(),
      contactPerson: z.string().optional(),
      contactTitle: z.string().optional(),
      creditLimit: z.string().optional(),
      paymentTerms: z.number().optional(),
      openingBalance: z.string().optional(),
      openingBalanceDate: z.string().optional(),
      notes: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (updateData.creditLimit === "" || updateData.creditLimit === undefined) updateData.creditLimit = "0";
      if (updateData.openingBalance === "" || updateData.openingBalance === undefined) updateData.openingBalance = "0";
      if (updateData.openingBalanceDate === "") updateData.openingBalanceDate = null;
      if (updateData.paymentTerms === undefined) delete updateData.paymentTerms;
      const existing = await db.query.customers.findFirst({
        where: and(eq(customers.id, id), eq(customers.tenantId, ctx.user.tenantId!)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      await db.update(customers).set(updateData)
        .where(and(eq(customers.id, id), eq(customers.tenantId, ctx.user.tenantId!)));
      return { success: true, id };
    }),

  quotationList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(salesQuotations.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(salesQuotations.status, input.status as any));
      if (input?.customerId) conditions.push(eq(salesQuotations.customerId, input.customerId));
      return db.select().from(salesQuotations).where(and(...conditions)).orderBy(desc(salesQuotations.createdAt));
    }),

  quotationCreate: authedQuery
    .input(z.object({
      quotationNumber: z.string(),
      customerId: z.number(),
      date: z.string(),
      expiryDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...quotationData } = input;
      const [{ id }] = await db.insert(salesQuotations).values({
        ...quotationData,
        tenantId: ctx.user.tenantId!,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(salesQuotationItems).values({ ...item, quotationId: id });
      }
      return { id, success: true };
    }),

  orderList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(salesOrders.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(salesOrders.status, input.status as any));
      if (input?.customerId) conditions.push(eq(salesOrders.customerId, input.customerId));
      return db.select().from(salesOrders).where(and(...conditions)).orderBy(desc(salesOrders.createdAt));
    }),

  orderCreate: authedQuery
    .input(z.object({
      orderNumber: z.string(),
      customerId: z.number(),
      date: z.string(),
      deliveryDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...orderData } = input;
      const [{ id }] = await db.insert(salesOrders).values({
        ...orderData,
        tenantId: ctx.user.tenantId!,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(salesOrderItems).values({ ...item, orderId: id });
      }
      return { id, success: true };
    }),

  invoiceList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(invoices.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(invoices.status, input.status as any));
      if (input?.customerId) conditions.push(eq(invoices.customerId, input.customerId));
      const rows = await db.select({
        id: invoices.id, tenantId: invoices.tenantId, invoiceNumber: invoices.invoiceNumber,
        invoiceType: invoices.invoiceType, customerId: invoices.customerId,
        customerName: customers.name, orderId: invoices.orderId, date: invoices.date,
        dueDate: invoices.dueDate, subTotal: invoices.subTotal, discountAmount: invoices.discountAmount,
        taxAmount: invoices.taxAmount, taxPercent: invoices.taxPercent, shippingAmount: invoices.shippingAmount,
        totalAmount: invoices.totalAmount, paidAmount: invoices.paidAmount, balanceDue: invoices.balanceDue,
        zatcaQrCode: invoices.zatcaQrCode, zatcaXml: invoices.zatcaXml, zatcaStatus: invoices.zatcaStatus,
        status: invoices.status, notes: invoices.notes,
        createdAt: invoices.createdAt,
      }).from(invoices)
        .leftJoin(customers, eq(customers.id, invoices.customerId))
        .where(and(...conditions)).orderBy(desc(invoices.createdAt));
      return rows;
    }),

  invoiceGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const invoice = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)),
      });
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, input.id));
      const customer = invoice ? await db.query.customers.findFirst({
        where: and(eq(customers.id, invoice.customerId), eq(customers.tenantId, tenantId)),
      }) : null;
      const company = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, tenantId),
      });
      return { invoice, items, customer, company };
    }),

  invoiceCreate: authedQuery
    .input(z.object({
      invoiceNumber: z.string(),
      invoiceType: z.enum(["standard", "simplified", "zatca"]).optional(),
      invoiceMode: z.string().optional(),
      customerId: z.number().optional(),
      date: z.string(),
      dueDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      taxPercent: z.string().optional(),
      taxableAmount: z.string().optional(),
      discountAmount: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      notesAr: z.string().optional(),
      customerName: z.string().optional(),
      customerNameAr: z.string().optional(),
      customerPhone: z.string().optional(),
      customerAddress: z.string().optional(),
      customerAddressAr: z.string().optional(),
      customerVat: z.string().optional(),
      customerCr: z.string().optional(),
      customerEmail: z.string().optional(),
      workedMonth: z.string().optional(),
      time: z.string().optional(),
      paymentType: z.string().optional(),
      cashier: z.string().optional(),
      poNumber: z.string().optional(),

      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        descriptionAr: z.string().optional(),
        quantity: z.number(),
        unitPrice: z.string(),
        unit: z.string().optional(),
        sku: z.string().optional(),
        taxPercent: z.string().optional(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...invoiceData } = input;
      const tenantId = ctx.user.tenantId!;
      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, tenantId),
      });
      const isForcedZatca = invoiceData.invoiceType === "zatca";
      const saudiInvoice = isSaudiCompany(settings) || isForcedZatca;
      const currency = settings?.defaultCurrency || (saudiInvoice ? "SAR" : "USD");
      const taxPercent = invoiceData.taxPercent || (settings?.vatRate ? String(settings.vatRate) : saudiInvoice ? "15" : "0");
      const taxAmount = invoiceData.taxAmount || "0";
      let sellerName = settings?.companyName || settings?.companyNameAr || "";
      const vatNumber = settings?.taxNumber || "";

      // Auto-seed company settings from registered company info if missing (e.g. fresh signups)
      if (!sellerName.trim()) {
        const company = await db.query.companies.findFirst({ where: eq(companies.tenantId, tenantId) });
        const fallbackName = company?.legalName || company?.displayName || "";
        if (fallbackName.trim()) {
          sellerName = fallbackName;
          const existing = await db.select({ id: companySettings.id }).from(companySettings)
            .where(eq(companySettings.tenantId, tenantId)).limit(1);
          const seed: Record<string, any> = {
            companyName: fallbackName, companyNameAr: settings?.companyNameAr || "",
            defaultCurrency: company?.baseCurrency || settings?.defaultCurrency,
            vatRate: (company?.countryCode === "SA" ? 15 : settings?.vatRate) ?? undefined,
            taxNumber: company?.taxNumber || settings?.taxNumber || "",
            address: settings?.address || "", phone: settings?.phone || "", email: settings?.email || "",
          };
          if (existing.length > 0) await db.update(companySettings).set(seed).where(eq(companySettings.id, existing[0].id));
          else await db.insert(companySettings).values({ tenantId, ...seed });
        }
      }

      // Determine actual invoice type
      // - If forced ZATCA and VAT valid → zatca (full ZATCA XML + TLV QR)
      // - If forced ZATCA but VAT invalid → simplified (ZATCA TLV QR, no XML)
      // - If standard → standard (simple JSON QR, no XML)
      const isZatcaEligible = saudiInvoice && isValidSaudiVatNumber(vatNumber) && sellerName.trim();
      const isSimplified = saudiInvoice && !isZatcaEligible;

      // ZATCA threshold: if total sales > 700,000 (7 lac), ZATCA is mandatory
      const ZATCA_THRESHOLD = 700000;
      const salesAgg = await db.select({ total: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL(15,2))), 0)` }).from(invoices).where(eq(invoices.tenantId, tenantId));
      const totalSales = Number(salesAgg[0]?.total || 0) + Number(invoiceData.totalAmount || 0);
      const isAboveThreshold = totalSales > ZATCA_THRESHOLD;

      // If above threshold, force ZATCA even if not Saudi company
      let invoiceType: string;
      if (isAboveThreshold) {
        // ZATCA mandatory above threshold
        if (isValidSaudiVatNumber(vatNumber) && sellerName.trim()) {
          invoiceType = "zatca";
        } else {
          // Block invoice creation without valid VAT when above threshold
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `ZATCA mandatory: Total sales (SAR ${totalSales.toLocaleString()}) exceeded SAR ${ZATCA_THRESHOLD.toLocaleString()}. Please add a valid 15-digit VAT number in Settings → Company Legal Information before creating invoices.`,
          });
        }
      } else {
        invoiceType = isZatcaEligible ? "zatca" : (isSimplified ? "simplified" : (invoiceData.invoiceType || "standard"));
      }

      // Block if company name missing for any invoice
      if (!sellerName.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please enter your company name in Settings → Company Profile before creating invoices.",
        });
      }

      const timestamp = new Date(`${invoiceData.date}T00:00:00.000Z`).toISOString();

      // QR code — ALL invoices get a QR code:
      // ZATCA: standard TLV base64 per ZATCA spec
      // Standard/Simplified: simple base64 JSON payload (scannable by any QR reader)
      let zatcaQrCode: string | undefined;
      if (isZatcaEligible || isSimplified) {
        // ZATCA-style TLV QR (works even without full ZATCA certification)
        zatcaQrCode = buildZatcaQrPayload(sellerName, vatNumber || "0000000000000000", timestamp, invoiceData.totalAmount, taxAmount);
      } else {
        // Standard invoice: simple readable QR (seller, total, date, vat)
        const simpleQrObj = {
          seller: sellerName,
          total: invoiceData.totalAmount,
          tax: taxAmount,
          date: invoiceData.date,
          invoice: invoiceData.invoiceNumber,
        };
        zatcaQrCode = Buffer.from(JSON.stringify(simpleQrObj)).toString("base64");
      }

      // ZATCA XML only when fully eligible
      const zatcaXml = isZatcaEligible
        ? buildSaudiInvoiceXml({
            invoiceNumber: invoiceData.invoiceNumber,
            date: invoiceData.date,
            sellerName,
            vatNumber,
            crNumber: settings?.crNumber,
            currency,
            subTotal: invoiceData.subTotal,
            taxAmount,
            totalAmount: invoiceData.totalAmount,
          })
        : undefined;
      // Resolve customerId — 0 or undefined means walk-in/cash customer
      let resolvedCustomerId = invoiceData.customerId && invoiceData.customerId > 0
        ? invoiceData.customerId
        : null;
      if (!resolvedCustomerId) {
        if (invoiceData.customerName) {
          // Auto-save the customer (bilingual) so they can be searched and auto-filled next time
          const [{ id: wid }] = await db.insert(customers).values({
            tenantId,
            code: `CUST-${Date.now().toString().slice(-6)}`,
            name: invoiceData.customerName,
            nameAr: invoiceData.customerNameAr || null,
            phone: invoiceData.customerPhone || null,
            address: invoiceData.customerAddress || null,
            addressAr: invoiceData.customerAddressAr || null,
            vatNumber: invoiceData.customerVat || null,
            crNumber: invoiceData.customerCr || null,
            taxNumber: invoiceData.customerVat || null,
            country: settings?.country || "Saudi Arabia",
            isActive: true,
          }).$returningId();
          resolvedCustomerId = wid;
        } else {
          const walkIn = await db.query.customers.findFirst({
            where: and(eq(customers.tenantId, tenantId), eq(customers.code, "WALK-IN")),
          });
          if (walkIn) {
            resolvedCustomerId = walkIn.id;
          } else {
            const [{ id: wid }] = await db.insert(customers).values({
              tenantId,
              code: "WALK-IN",
              name: "Walk-in Customer",
              nameAr: "عميل نقدي",
              country: settings?.country || "Saudi Arabia",
              isActive: true,
            }).$returningId();
            resolvedCustomerId = wid;
          }
        }
      }

      const [{ id }] = await db.insert(invoices).values({
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceType,
        customerId: resolvedCustomerId,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate || null,
        subTotal: invoiceData.subTotal,
        taxAmount,
        taxPercent,
        totalAmount: invoiceData.totalAmount,
        notes: invoiceData.notes,
        notesAr: invoiceData.notesAr,
        customerName: invoiceData.customerName || null,
        customerNameAr: invoiceData.customerNameAr || null,
        customerPhone: invoiceData.customerPhone || null,
        customerAddress: invoiceData.customerAddress || null,
        customerAddressAr: invoiceData.customerAddressAr || null,
        customerVat: invoiceData.customerVat || null,
        customerCr: invoiceData.customerCr || null,
        customerEmail: invoiceData.customerEmail || null,
        workedMonth: invoiceData.workedMonth || null,
        time: invoiceData.time || null,
        paymentType: invoiceData.paymentType || null,
        cashier: invoiceData.cashier || null,
        poNumber: invoiceData.poNumber || null,
        tenantId,
        zatcaQrCode: isAboveThreshold ? zatcaQrCode : undefined,
        zatcaXml: isAboveThreshold ? zatcaXml : undefined,
        zatcaStatus: isAboveThreshold && isZatcaEligible ? "pending" : undefined,
        terms: settings?.invoiceTerms,
        balanceDue: invoiceData.totalAmount,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(invoiceItems).values({
          invoiceId: id,
          description: item.description,
          descriptionAr: item.descriptionAr,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxPercent: item.taxPercent,
          totalAmount: item.totalAmount,
          productId: item.productId,
        });
        // Auto-save new products to database for future use
        if (!item.productId && item.description) {
          try {
            await db.insert(products).values({
              tenantId,
              sku: item.sku || `PRD-${Date.now().toString().slice(-6)}`,
              name: item.description,
              nameAr: item.descriptionAr || null,
              salePrice: item.unitPrice || "0",
              unitName: item.unit || "Piece",
              isActive: true,
            });
          } catch (e) {
            console.warn("Product auto-save failed:", e);
          }
        }
      }
      await db.insert(auditLogs).values({
        tenantId,
        userId: ctx.user.id,
        action: "invoice_create",
        entityType: "invoice",
        entityId: id,
        newValues: {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceType,
          customerId: invoiceData.customerId,
          totalAmount: invoiceData.totalAmount,
          taxAmount,
          taxPercent,
          saudiInvoice,
          zatcaStatus: saudiInvoice ? "pending" : null,
        },
        createdAt: new Date(),
      });

      onInvoiceCreated(tenantId, id).catch((err) =>
        console.error("[notify] onInvoiceCreated error:", err)
      );

      return { id, success: true };
    }),

  invoiceUpdateStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(invoices).set({ status: input.status }).where(eq(invoices.id, input.id));
      return { success: true };
    }),

  invoiceUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      invoiceNumber: z.string().optional(),
      invoiceType: z.enum(["standard", "simplified", "zatca"]).optional(),
      customerId: z.number().optional(),
      date: z.string().optional(),
      dueDate: z.string().optional(),
      subTotal: z.string().optional(),
      taxAmount: z.string().optional(),
      taxPercent: z.string().optional(),
      totalAmount: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled", "credit_note"]).optional(),
      items: z.array(z.object({
        id: z.number().optional(),
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        taxPercent: z.string().optional(),
        totalAmount: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const { items, ...invoiceData } = input;
      const invoiceId = input.id;

      const existingInvoice = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
      });
      if (!existingInvoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }
      if (isIssuedOrZatcaLocked(existingInvoice)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Issued, paid, reported, or cleared invoices are immutable. Use a credit/debit note instead.",
        });
      }

      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, tenantId),
      });
      const saudiInvoice = isSaudiCompany(settings) || invoiceData.invoiceType === "zatca";
      const currency = settings?.defaultCurrency || (saudiInvoice ? "SAR" : "USD");
      const taxPercent = invoiceData.taxPercent || (settings?.vatRate ? String(settings.vatRate) : saudiInvoice ? "15" : "0");
      const taxAmount = invoiceData.taxAmount || "0";
      const invoiceType = saudiInvoice ? "zatca" : (invoiceData.invoiceType || existingInvoice.invoiceType);
      const sellerName = settings?.companyName || settings?.companyNameAr || "";
      const vatNumber = settings?.taxNumber || "";

      let zatcaQrCode = existingInvoice.zatcaQrCode;
      let zatcaXml = existingInvoice.zatcaXml;
      let zatcaStatus = existingInvoice.zatcaStatus;

      if (saudiInvoice) {
        if (!sellerName.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saudi ZATCA invoices require company name in Settings before billing.",
          });
        }
        if (!isValidSaudiVatNumber(vatNumber)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saudi ZATCA invoices require a valid 15-digit VAT number that starts and ends with 3.",
          });
        }
        const timestamp = new Date(`${invoiceData.date || existingInvoice.date}T00:00:00.000Z`).toISOString();
        zatcaQrCode = buildZatcaQrPayload(sellerName, vatNumber, timestamp, invoiceData.totalAmount || existingInvoice.totalAmount, taxAmount);
        zatcaXml = buildSaudiInvoiceXml({
          invoiceNumber: invoiceData.invoiceNumber || existingInvoice.invoiceNumber,
          date: invoiceData.date || existingInvoice.date,
          sellerName,
          vatNumber,
          crNumber: settings?.crNumber,
          currency,
          subTotal: invoiceData.subTotal || existingInvoice.subTotal,
          taxAmount,
          totalAmount: invoiceData.totalAmount || existingInvoice.totalAmount,
        });
        zatcaStatus = "pending";
      }

      const invoiceUpdateData = { ...invoiceData };
      if (!invoiceUpdateData.dueDate) invoiceUpdateData.dueDate = null;
      await db.update(invoices).set({
        ...invoiceUpdateData,
        invoiceType,
        taxPercent,
        taxAmount,
        zatcaQrCode,
        zatcaXml,
        zatcaStatus,
        balanceDue: (Number(invoiceData.totalAmount || existingInvoice.totalAmount) - Number(existingInvoice.paidAmount)).toFixed(2),
        updatedAt: new Date(),
      }).where(eq(invoices.id, invoiceId));

      if (items) {
        await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
        for (const item of items) {
          await db.insert(invoiceItems).values({ ...item, invoiceId });
        }
      }

      await db.insert(auditLogs).values({
        tenantId,
        userId: ctx.user.id,
        action: "invoice_update",
        entityType: "invoice",
        entityId: invoiceId,
        newValues: {
          ...invoiceData,
          items: items?.length,
          saudiInvoice,
          zatcaStatus,
        },
        createdAt: new Date(),
      });

      return { id: invoiceId, success: true };
    }),

  invoiceDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const invoiceId = input.id;

      const existingInvoice = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
      });
      if (!existingInvoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (isIssuedOrZatcaLocked(existingInvoice)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete issued, paid, reported, or cleared invoices. Create a credit/debit note instead.",
        });
      }

      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
      await db.delete(invoices).where(eq(invoices.id, invoiceId));

      await db.insert(auditLogs).values({
        tenantId,
        userId: ctx.user.id,
        action: "invoice_delete",
        entityType: "invoice",
        entityId: invoiceId,
        newValues: {
          invoiceNumber: existingInvoice.invoiceNumber,
          totalAmount: existingInvoice.totalAmount,
          status: existingInvoice.status,
        },
        createdAt: new Date(),
      });

      return { success: true };
    }),

  // Credit Notes
  creditNoteList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(creditNotes).where(eq(creditNotes.tenantId, ctx.user.tenantId!));
    }),

  creditNoteCreate: authedQuery
    .input(z.object({
      creditNoteNumber: z.string(),
      customerId: z.number(),
      invoiceId: z.number().optional(),
      date: z.string(),
      amount: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(creditNotes).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        invoiceId: input.invoiceId || 0,
        status: "draft",
      }).$returningId();
      return { id, success: true };
    }),

  // Customer Payments
  paymentList: authedQuery
    .input(z.object({
      customerId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(customerPayments.tenantId, tenantId)];
      if (input?.customerId) conditions.push(eq(customerPayments.customerId, input.customerId));
      return db.select().from(customerPayments).where(and(...conditions));
    }),

  paymentCreate: authedQuery
    .input(z.object({
      paymentNumber: z.string(),
      customerId: z.number(),
      invoiceId: z.number().optional(),
      date: z.string(),
      amount: z.string(),
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "card", "online"]),
      reference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(customerPayments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      if (input.invoiceId) {
        onPaymentReceived(ctx.user.tenantId!, input.customerId, input.invoiceId, input.amount).catch((err) =>
          console.error("[notify] onPaymentReceived error:", err)
        );
      }
      return { id, success: true };
    }),
});
