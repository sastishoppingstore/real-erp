import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { auditLogs, companySettings, taxRates, currencies, notifications, tenants } from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const settingsRouter = createRouter({
  // Company Settings
  companySettingsGet: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
    }),

  companySettingsUpdate: authedQuery
    .input(z.object({
      companyName: z.string().optional(),
      companyNameAr: z.string().optional(),
      tradeName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional(),
      taxNumber: z.string().optional(),
      crNumber: z.string().optional(),
      vatRate: z.string().optional(),
      defaultCurrency: z.string().optional(),
      fiscalYearStart: z.string().optional(),
      dateFormat: z.string().optional(),
      invoicePrefix: z.string().optional(),
      invoiceTerms: z.string().optional(),
      logo: z.string().optional(),
      signature: z.string().optional(),
      stamp: z.string().optional(),
      theme: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      zatcaEnabled: z.boolean().optional(),
      zatcaSandbox: z.boolean().optional(),
      aiApiKey: z.string().optional(),
      aiModel: z.string().optional(),
      bankName: z.string().optional(),
      bankAccountName: z.string().optional(),
      bankIban: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      paperSize: z.string().optional(),
      printerName: z.string().optional(),
      copiesCount: z.coerce.number().optional(),
      printLogo: z.boolean().optional(),
      printQr: z.boolean().optional(),
      printStamp: z.boolean().optional(),
      printSignature: z.boolean().optional(),
      smtpServer: z.string().optional(),
      smtpPort: z.coerce.number().optional(),
      smtpEmail: z.string().optional(),
      smtpPassword: z.string().optional(),
      smsProvider: z.string().optional(),
      smsApiKey: z.string().optional(),
      whatsappApiKey: z.string().optional(),
      invoiceFooterText: z.string().optional(),
      invoiceFooterTextAr: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const data = input;
      const existing = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
      if (existing) {
        await db.update(companySettings).set(data).where(eq(companySettings.tenantId, ctx.user.tenantId!));
      } else {
        await db.insert(companySettings).values({ tenantId: ctx.user.tenantId!, ...data });
      }
      await db.insert(auditLogs).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        action: "company_settings_update",
        entityType: "company_settings",
        entityId: existing?.id,
        oldValues: existing ?? null,
        newValues: data,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  // Tax Rates
  taxRateList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(taxRates).where(eq(taxRates.tenantId, ctx.user.tenantId!));
    }),

  taxRateCreate: authedQuery
    .input(z.object({
      name: z.string(),
      rate: z.string(),
      type: z.enum(["vat", "gst", "sales_tax", "withholding", "other"]).optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(taxRates).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Currencies
  currencyList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(currencies).where(eq(currencies.tenantId, ctx.user.tenantId!));
    }),

  currencyCreate: authedQuery
    .input(z.object({
      code: z.string(),
      name: z.string(),
      symbol: z.string().optional(),
      exchangeRate: z.string().optional(),
      isBase: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(currencies).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Notifications
  notificationList: authedQuery
    .input(z.object({
      userId: z.number(),
      isRead: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [
        eq(notifications.tenantId, ctx.user.tenantId!),
        eq(notifications.userId, input?.userId || 0),
      ];
      if (input?.isRead !== undefined) conditions.push(eq(notifications.isRead, input.isRead));
      return db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt));
    }),

  notificationCreate: authedQuery
    .input(z.object({
      userId: z.number(),
      title: z.string(),
      message: z.string(),
      type: z.enum(["info", "warning", "success", "error"]).optional(),
      link: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(notifications).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  notificationMarkRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  // Layout Theme
  themeGet: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, ctx.user.tenantId!),
        columns: { layoutTheme: true },
      });
      return { layoutTheme: tenant?.layoutTheme ?? "launcher_theme" };
    }),

  themeUpdate: authedQuery
    .input(z.object({ layoutTheme: z.enum(["sidebar", "app_launcher", "launcher_theme"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(tenants)
        .set({ layoutTheme: input.layoutTheme })
        .where(eq(tenants.id, ctx.user.tenantId!));
      return { success: true };
    }),
});
