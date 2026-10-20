import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  customers, salesQuotations, salesQuotationItems,
  salesOrders, salesOrderItems, invoices, invoiceItems,
  creditNotes, customerPayments, companySettings, auditLogs, companies, products,
  inventoryBalances, inventoryMovements, warehouses, cashboxTransactions
} from "@db/schema";
import { eq, sql, and, like, or, desc } from "drizzle-orm";
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
      if (input?.search) {
        // Search across English/Arabic names, phone and code so Arabic-named
        // customers remain findable from the entry screens.
        const q = `%${input.search}%`;
        conditions.push(or(
          like(customers.name, q),
          like(customers.nameAr, q),
          like(customers.phone, q),
          like(customers.code, q),
        )!);
      }
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
        dueDate: invoices.dueDate, time: invoices.time,
        subTotal: invoices.subTotal, discountAmount: invoices.discountAmount,
        taxAmount: invoices.taxAmount, taxPercent: invoices.taxPercent, shippingAmount: invoices.shippingAmount,
        totalAmount: invoices.totalAmount, paidAmount: invoices.paidAmount, balanceDue: invoices.balanceDue,
        paymentMethod: invoices.paymentMethod, cashier: invoices.cashier,
        customerNameAr: invoices.customerNameAr, customerPhone: invoices.customerPhone,
        customerVat: invoices.customerVat, customerCr: invoices.customerCr,
        customerEmail: invoices.customerEmail, customerAddress: invoices.customerAddress,
        customerAddressAr: invoices.customerAddressAr,
        zatcaQrCode: invoices.zatcaQrCode, zatcaXml: invoices.zatcaXml, zatcaStatus: invoices.zatcaStatus,
        status: invoices.status, notes: invoices.notes, notesAr: invoices.notesAr,
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
      warehouseId: z.number().optional(),

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
      const explicitBillCustomer = !!(invoiceData.customerId && invoiceData.customerId > 0);
      let resolvedCustomerId = explicitBillCustomer ? invoiceData.customerId : null;
      if (!resolvedCustomerId) {
        if (invoiceData.customerName) {
          // Auto-save the customer (bilingual) so they can be searched and auto-filled next time
          const [{ id: wid }] = await db.insert(customers).values({
            tenantId,
            code: `CUST-${Date.now().toString().slice(-6)}`,
            name: invoiceData.customerName,
            nameAr: invoiceData.customerNameAr || null,
            phone: invoiceData.customerPhone || null,
            email: invoiceData.customerEmail || null,
            address: invoiceData.customerAddress || null,
            addressAr: invoiceData.customerAddressAr || null,
            vatNumber: invoiceData.customerVat || null,
            taxNumber: invoiceData.customerVat || null,
            commercialRegistration: invoiceData.customerCr || null,
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

      // Refresh the saved customer record (non-empty typed values only) so the
      // next bill auto-fills every detail after typing 2 letters of the name.
      if (explicitBillCustomer && resolvedCustomerId) {
        const refresh: Record<string, any> = {};
        const setIf = (k: string, v: any) => { if (v !== undefined && v !== null && String(v).trim() !== "") refresh[k] = v; };
        setIf("name", invoiceData.customerName);
        setIf("nameAr", invoiceData.customerNameAr);
        setIf("phone", invoiceData.customerPhone);
        setIf("email", invoiceData.customerEmail);
        setIf("address", invoiceData.customerAddress);
        setIf("addressAr", invoiceData.customerAddressAr);
        setIf("vatNumber", invoiceData.customerVat);
        setIf("taxNumber", invoiceData.customerVat);
        setIf("commercialRegistration", invoiceData.customerCr);
        if (Object.keys(refresh).length) {
          await db.update(customers).set(refresh).where(and(eq(customers.id, resolvedCustomerId), eq(customers.tenantId, tenantId)));
        }
      }
      // Payment state: cash/card are collected at the counter -> fully paid,
      // credit/deferred stays fully due (customer balance = due amount).
      const payType = String(invoiceData.paymentType || "").toLowerCase();
      const isCashPaid = payType === "cash";
      const isPaidNow = isCashPaid || payType === "card";
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
        paymentMethod: invoiceData.paymentType || null,
        cashier: invoiceData.cashier || (ctx.user as any)?.name || (ctx.user as any)?.username || null,
        poNumber: invoiceData.poNumber || null,
        tenantId,
        zatcaQrCode: isAboveThreshold ? zatcaQrCode : undefined,
        zatcaXml: isAboveThreshold ? zatcaXml : undefined,
        zatcaStatus: isAboveThreshold && isZatcaEligible ? "pending" : undefined,
        terms: settings?.invoiceTerms,
        paidAmount: isPaidNow ? String(invoiceData.totalAmount || "0") : "0",
        balanceDue: isPaidNow ? "0" : invoiceData.totalAmount,
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
          unit: item.unit,
          sku: item.sku || null,
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
      // ---- Stock posting (sale): decrease warehouse balance + movement ----
      // Without this the "Avail" column, stock reports and valuation always
      // showed 0 because no invoice ever touched inventory_balances.
      let stockWarehouseId = invoiceData.warehouseId;
      if (!stockWarehouseId) {
        const ws = await db.select({ id: warehouses.id }).from(warehouses)
          .where(eq(warehouses.tenantId, tenantId)).limit(1);
        stockWarehouseId = ws[0]?.id;
      }
      if (stockWarehouseId) {
        for (const item of items) {
          if (!item.productId) continue;
          const qty = Number(item.quantity || 0);
          if (!qty) continue;
          const balRows = await db.select().from(inventoryBalances).where(and(
            eq(inventoryBalances.productId, item.productId),
            eq(inventoryBalances.tenantId, tenantId),
            eq(inventoryBalances.warehouseId, stockWarehouseId)));
          if (balRows.length) {
            const newQty = Number(balRows[0].quantity || 0) - qty;
            await db.update(inventoryBalances).set({ quantity: newQty })
              .where(eq(inventoryBalances.id, balRows[0].id));
          } else {
            await db.insert(inventoryBalances).values({
              tenantId, productId: item.productId, warehouseId: stockWarehouseId, quantity: -qty,
            });
          }
          await db.insert(inventoryMovements).values({
            tenantId, productId: item.productId, warehouseId: stockWarehouseId,
            movementType: "sale", quantity: -qty, reference: "Invoice", referenceId: id,
            createdBy: ctx.user.id, unitCost: item.unitPrice,
          });
        }
      }
      // ---- Cash invoice: money collected -> cashbox (General Safe) ----
      if (isCashPaid && Number(invoiceData.totalAmount || 0) > 0) {
        try {
          const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
            .from(cashboxTransactions).where(eq(cashboxTransactions.tenantId, tenantId))
            .orderBy(desc(cashboxTransactions.createdAt)).limit(1);
          const prevBal = Number(lastTx[0]?.bal || 0);
          const amt = Number(invoiceData.totalAmount || 0);
          await db.insert(cashboxTransactions).values({
            tenantId, userId: ctx.user.id,
            transactionNumber: `SALE-${invoiceData.invoiceNumber}`.slice(0, 50),
            transactionType: "sale", amount: String(amt), paymentMethod: "cash",
            referenceType: "Invoice", referenceId: id,
            description: `Invoice ${invoiceData.invoiceNumber}${invoiceData.customerName ? " - " + invoiceData.customerName : ""}`,
            balanceBefore: String(prevBal), balanceAfter: String(prevBal + amt),
            status: "completed",
          });
        } catch (e) {
          console.warn("Cashbox posting failed:", e);
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
      customerName: z.string().optional(),
      customerNameAr: z.string().optional(),
      customerPhone: z.string().optional(),
      customerAddress: z.string().optional(),
      customerAddressAr: z.string().optional(),
      customerVat: z.string().optional(),
      customerCr: z.string().optional(),
      customerEmail: z.string().optional(),
      notesAr: z.string().optional(),
      time: z.string().optional(),
      paymentType: z.string().optional(),
      cashier: z.string().optional(),
      poNumber: z.string().optional(),
      workedMonth: z.string().optional(),
      date: z.string().optional(),
      dueDate: z.string().optional(),
      subTotal: z.string().optional(),
      discountAmount: z.string().optional(),
      shippingAmount: z.string().optional(),
      taxAmount: z.string().optional(),
      taxPercent: z.string().optional(),
      totalAmount: z.string().optional(),
      warehouseId: z.number().optional(),
      notes: z.string().optional(),
      status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled", "credit_note"]).optional(),
      items: z.array(z.object({
        id: z.number().optional(),
        productId: z.number().optional(),
        description: z.string(),
        descriptionAr: z.string().optional(),
        quantity: z.number(),
        unitPrice: z.string(),
        taxPercent: z.string().optional(),
        totalAmount: z.string(),
        unit: z.string().optional(),
        sku: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const { items, warehouseId: inputWarehouseId, ...invoiceData } = input;
      const invoiceId = input.id;

      const existingInvoice = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
      });
      if (!existingInvoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }
      // Sales invoices can be corrected after saving (draft, paid or partial).
      // Only regulator-locked / cancelled / credit-note rows stay immutable.
      if (
        existingInvoice.zatcaStatus === "reported" ||
        existingInvoice.zatcaStatus === "cleared" ||
        existingInvoice.status === "cancelled" ||
        existingInvoice.status === "credit_note"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reported, cleared, cancelled or credit-note invoices are immutable. Use a credit/debit note instead.",
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
        // Only invoices that already carry a regulator payload get it
        // refreshed — an edit must not create a ZATCA XML out of nothing
        // (that would lock the document against further corrections).
        if (existingInvoice.zatcaXml || existingInvoice.zatcaQrCode) {
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
      }

      const invoiceUpdateData: Record<string, any> = { ...invoiceData };
      delete invoiceUpdateData.id;
      // Keep the original author when the client does not send a cashier.
      if (!invoiceUpdateData.cashier) {
        invoiceUpdateData.cashier = existingInvoice.cashier
          || (ctx.user as any)?.name || (ctx.user as any)?.username || null;
      }
      if (!invoiceUpdateData.dueDate) invoiceUpdateData.dueDate = null;
      if (invoiceUpdateData.paymentType) invoiceUpdateData.paymentMethod = invoiceUpdateData.paymentType;
      delete invoiceUpdateData.paymentType;
      const newTotal = Number(invoiceData.totalAmount ?? existingInvoice.totalAmount ?? 0);
      const paidSoFar = Number(existingInvoice.paidAmount || 0);
      const newBalance = Math.max(0, newTotal - paidSoFar);
      let nextStatus = existingInvoice.status;
      if (paidSoFar > 0) nextStatus = newBalance <= 0.005 ? "paid" : "partial";
      else if (nextStatus === "paid" || nextStatus === "partial") nextStatus = "sent";
      // Refresh the saved customer record (non-empty typed values only) so the
      // next bill auto-fills every detail after typing 2 letters of the name.
      const updCustId = invoiceData.customerId || existingInvoice.customerId;
      if (updCustId) {
        const refresh: Record<string, any> = {};
        const setIf = (k: string, v: any) => { if (v !== undefined && v !== null && String(v).trim() !== "") refresh[k] = v; };
        setIf("name", invoiceData.customerName);
        setIf("nameAr", invoiceData.customerNameAr);
        setIf("phone", invoiceData.customerPhone);
        setIf("email", invoiceData.customerEmail);
        setIf("address", invoiceData.customerAddress);
        setIf("addressAr", invoiceData.customerAddressAr);
        setIf("vatNumber", invoiceData.customerVat);
        setIf("taxNumber", invoiceData.customerVat);
        setIf("commercialRegistration", invoiceData.customerCr);
        if (Object.keys(refresh).length) {
          await db.update(customers).set(refresh).where(and(eq(customers.id, updCustId), eq(customers.tenantId, tenantId)));
        }
      }
      await db.update(invoices).set({
        ...invoiceUpdateData,
        invoiceType,
        taxPercent,
        taxAmount,
        zatcaQrCode,
        zatcaXml,
        zatcaStatus,
        balanceDue: newBalance.toFixed(2),
        status: nextStatus as any,
        updatedAt: new Date(),
      }).where(eq(invoices.id, invoiceId));

      const oldItemRows = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
      if (items) {
        await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
        for (const item of items) {
          await db.insert(invoiceItems).values({ ...item, invoiceId });
        }
      }

      // ---- Stock correction for edited lines ----
      // Invoice create already subtracted the old quantities. Apply only the
      // difference so editing 1 → 100 adds -99, not another -100.
      if (items) {
        let stockWh = inputWarehouseId;
        if (!stockWh) {
          const ws = await db.select({ id: warehouses.id }).from(warehouses)
            .where(eq(warehouses.tenantId, tenantId)).limit(1);
          stockWh = ws[0]?.id;
        }
        if (stockWh) {
          const oldQty = new Map<number, number>();
          for (const it of oldItemRows) {
            if (!it.productId) continue;
            oldQty.set(it.productId, (oldQty.get(it.productId) || 0) + Number(it.quantity || 0));
          }
          const newQty = new Map<number, number>();
          for (const it of items) {
            if (!it.productId) continue;
            newQty.set(it.productId, (newQty.get(it.productId) || 0) + Number(it.quantity || 0));
          }
          const productIds = new Set<number>([...oldQty.keys(), ...newQty.keys()]);
          for (const productId of productIds) {
            const delta = (newQty.get(productId) || 0) - (oldQty.get(productId) || 0);
            if (!delta) continue;
            const stockDelta = -delta; // sales invoice reduces stock
            const balRows = await db.select().from(inventoryBalances).where(and(
              eq(inventoryBalances.productId, productId),
              eq(inventoryBalances.tenantId, tenantId),
              eq(inventoryBalances.warehouseId, stockWh)));
            if (balRows.length) {
              await db.update(inventoryBalances).set({ quantity: Number(balRows[0].quantity || 0) + stockDelta })
                .where(eq(inventoryBalances.id, balRows[0].id));
            } else {
              await db.insert(inventoryBalances).values({
                tenantId, productId, warehouseId: stockWh, quantity: stockDelta,
              });
            }
            await db.insert(inventoryMovements).values({
              tenantId, productId, warehouseId: stockWh,
              movementType: "adjustment", quantity: stockDelta,
              reference: "Invoice Edit", referenceId: invoiceId,
              createdBy: ctx.user.id,
            });
          }
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
      warehouseId: z.number().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        code: z.string().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string().optional(),
        totalAmount: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      // The returned item lines are kept inside the note text (marker block) so
      // the invoice history can show product details for sales returns too.
      const items = input.items ?? [];
      const head = String(input.reason ?? "").trim();
      const itemsBlock = items.length ? `\n[ITEMS]${JSON.stringify(items)}` : "";
      const [{ id }] = await db.insert(creditNotes).values({
        creditNoteNumber: input.creditNoteNumber,
        customerId: input.customerId,
        invoiceId: input.invoiceId || 0,
        date: input.date,
        amount: input.amount,
        reason: (head + itemsBlock) || null,
        tenantId,
        status: "draft",
        createdBy: ctx.user.id,
      }).$returningId();
      // ---- Stock back in (return_in) ----
      let whId = input.warehouseId;
      if (!whId) {
        const ws = await db.select({ id: warehouses.id }).from(warehouses)
          .where(eq(warehouses.tenantId, tenantId)).limit(1);
        whId = ws[0]?.id;
      }
      if (whId && items.length) {
        for (const it of items) {
          if (!it.productId) continue;
          const qty = Number(it.quantity || 0);
          if (!qty) continue;
          const balRows = await db.select().from(inventoryBalances).where(and(
            eq(inventoryBalances.productId, it.productId),
            eq(inventoryBalances.tenantId, tenantId),
            eq(inventoryBalances.warehouseId, whId)));
          if (balRows.length) {
            await db.update(inventoryBalances)
              .set({ quantity: Number(balRows[0].quantity || 0) + qty })
              .where(eq(inventoryBalances.id, balRows[0].id));
          } else {
            await db.insert(inventoryBalances).values({
              tenantId, productId: it.productId, warehouseId: whId, quantity: qty,
            });
          }
          await db.insert(inventoryMovements).values({
            tenantId, productId: it.productId, warehouseId: whId,
            movementType: "return_in", quantity: qty, reference: "Credit Note",
            referenceId: id, createdBy: ctx.user.id, unitCost: it.unitPrice,
          });
        }
      }
      return { id, success: true };
    }),

  creditNoteGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const cn = await db.query.creditNotes.findFirst({
        where: and(eq(creditNotes.id, input.id), eq(creditNotes.tenantId, tenantId)),
      });
      if (!cn) return null;
      const raw = String(cn.reason ?? "");
      const idx = raw.indexOf("[ITEMS]");
      const reason = idx >= 0 ? raw.slice(0, idx).trim() : raw;
      let items: any[] = [];
      if (idx >= 0) {
        try { items = JSON.parse(raw.slice(idx + 7).trim()) || []; } catch { items = []; }
      }
      const cust = cn.customerId
        ? await db.query.customers.findFirst({ where: and(eq(customers.id, cn.customerId), eq(customers.tenantId, tenantId)) })
        : null;
      const inv = cn.invoiceId
        ? await db.query.invoices.findFirst({ where: and(eq(invoices.id, cn.invoiceId), eq(invoices.tenantId, tenantId)) })
        : null;
      return { creditNote: cn, items, reason, customer: cust, invoice: inv };
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
      const tenantId = ctx.user.tenantId!;
      const amount = Number(input.amount || 0);
      // The receipt is always attributed to the user who collected it.
      const paymentBase = { ...input, tenantId, createdBy: ctx.user.id };
      let firstPaymentId = 0;
      let firstInvoiceId: number | undefined;
      let appliedTotal = 0;

      if (input.invoiceId) {
        // Payment aimed at one specific invoice (e.g. a credit invoice's
        // partial payment from the invoice screen).
        const [row] = await db.insert(customerPayments).values(paymentBase).$returningId();
        firstPaymentId = row.id;
        const inv: any = await db.query.invoices.findFirst({
          where: and(eq(invoices.id, input.invoiceId), eq(invoices.tenantId, tenantId)),
        });
        if (inv) {
          const paidNow = Number(inv.paidAmount || 0) + amount;
          const due = Math.max(0, Number(inv.totalAmount || 0) - paidNow);
          await db.update(invoices).set({
            paidAmount: String(paidNow),
            balanceDue: String(due),
            status: due <= 0.001 ? "paid" : (paidNow > 0 ? "partial" : inv.status),
          }).where(eq(invoices.id, inv.id));
          firstInvoiceId = inv.id;
          appliedTotal = amount;
        }
        onPaymentReceived(tenantId, input.customerId, input.invoiceId, input.amount).catch((err) =>
          console.error("[notify] onPaymentReceived error:", err)
        );
      } else {
        // General customer receipt: settle open invoices oldest-first so the
        // whole outstanding balance can be collected in one go (the previous
        // code applied the entire amount to the oldest invoice only and lost
        // the excess).
        const open: any[] = await db.select().from(invoices).where(and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.customerId, input.customerId),
        )).orderBy(invoices.date, invoices.id);
        let remaining = amount;
        let seq = 0;
        for (const inv of open) {
          if (remaining <= 0.001) break;
          const due = Number(inv.balanceDue || 0);
          if (due <= 0.001) continue;
          const pay = Math.min(remaining, due);
          seq += 1;
          const [row] = await db.insert(customerPayments).values({
            ...paymentBase,
            invoiceId: inv.id,
            amount: String(pay),
            paymentNumber: `${input.paymentNumber}-${seq}`.slice(0, 50),
          }).$returningId();
          if (!firstPaymentId) firstPaymentId = row.id;
          if (!firstInvoiceId) firstInvoiceId = inv.id;
          const paidNow = Number(inv.paidAmount || 0) + pay;
          const newDue = Math.max(0, due - pay);
          await db.update(invoices).set({
            paidAmount: String(paidNow),
            balanceDue: String(newDue),
            status: newDue <= 0.001 ? "paid" : "partial",
          }).where(eq(invoices.id, inv.id));
          appliedTotal += pay;
          remaining -= pay;
        }
        if (remaining > 0.001) {
          // Amount beyond all open invoices → keep it as an on-account advance.
          const [row] = await db.insert(customerPayments).values({
            ...paymentBase,
            invoiceId: null,
            amount: String(remaining),
            paymentNumber: `${input.paymentNumber}-ADV`.slice(0, 50),
          }).$returningId();
          if (!firstPaymentId) firstPaymentId = row.id;
        }
        if (firstInvoiceId) {
          onPaymentReceived(tenantId, input.customerId, firstInvoiceId, String(appliedTotal)).catch((err) =>
            console.error("[notify] onPaymentReceived error:", err)
          );
        }
      }

      // Cash / card collections increase the cashbox (General Safe) balance.
      // One cashbox row per receipt, not one per allocated invoice.
      if ((input.paymentMethod === "cash" || input.paymentMethod === "card") && amount > 0) {
        try {
          const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
            .from(cashboxTransactions).where(eq(cashboxTransactions.tenantId, tenantId))
            .orderBy(desc(cashboxTransactions.createdAt)).limit(1);
          const prevBal = Number(lastTx[0]?.bal || 0);
          await db.insert(cashboxTransactions).values({
            tenantId, userId: ctx.user.id,
            transactionNumber: `PAY-${input.paymentNumber}`.slice(0, 50),
            transactionType: "customer_payment", amount: String(amount),
            paymentMethod: input.paymentMethod === "card" ? "card" : "cash",
            referenceType: firstInvoiceId ? "Invoice" : "Customer",
            referenceId: firstInvoiceId ?? input.customerId,
            description: firstInvoiceId
              ? `Customer payment${input.reference ? " - " + input.reference : ""}`
              : `Customer advance${input.reference ? " - " + input.reference : ""}`,
            balanceBefore: String(prevBal), balanceAfter: String(prevBal + amount),
            status: "completed",
          });
        } catch (e) {
          console.warn("cashbox receipt failed:", e);
        }
      }

      // Keep the customer master balance in sync with open invoices.
      try {
        const dueAgg = await db.select({
          total: sql<number>`COALESCE(SUM(CAST(${invoices.balanceDue} AS DECIMAL(15,2))), 0)`,
        }).from(invoices).where(and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.customerId, input.customerId),
        ));
        await db.update(customers).set({
          currentBalance: String(Number(dueAgg[0]?.total || 0)),
        }).where(and(
          eq(customers.id, input.customerId),
          eq(customers.tenantId, tenantId),
        ));
      } catch (e) {
        console.warn("customer balance update failed:", e);
      }

      return { id: firstPaymentId, success: true };
    }),
});
