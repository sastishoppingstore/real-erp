import { z } from "zod";
import { createRouter, authedQuery, adminQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { sendEmail } from "./lib/smtp";
import * as schema from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateInvoiceHtml } from "../src/lib/invoiceHtml";

export const emailRouter = createRouter({
  templates: {
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.emailTemplates).where(
        and(eq(schema.emailTemplates.isActive, true), eq(schema.emailTemplates.tenantId, ctx.user.tenantId!)),
      ).orderBy(desc(schema.emailTemplates.createdAt));
    }),
  },
  test: {
    send: adminQuery
      .input(z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const result = await sendEmail(input.to, input.subject, input.body);
        await db.insert(schema.emailLogs).values({
          tenantId: 1,
          templateKey: "test",
          recipient: input.to,
          subject: input.subject,
          body: input.body,
          status: result.sent ? "sent" : "failed",
          errorMessage: result.sent ? null : "SMTP error",
        });
        if (!result.sent) throw new Error("Failed to send test email");
        return { success: true, message: "Test email sent successfully" };
      }),
  },

  // Send invoice PDF via email
  sendInvoice: authedMutation
    .input(z.object({ invoiceId: z.number(), to: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      // Get invoice with items and customer
      const invoice = await db.query.invoices.findFirst({
        where: and(eq(schema.invoices.id, input.invoiceId), eq(schema.invoices.tenantId, tenantId)),
      });
      if (!invoice) throw new Error("Invoice not found");

      const items = await db.query.invoiceItems.findMany({
        where: eq(schema.invoiceItems.invoiceId, input.invoiceId),
      });

      // Get company settings
      const companySettings = await db.query.companySettings.findFirst({
        where: eq(schema.companySettings.tenantId, tenantId),
      });

      // Get customer
      const customer = invoice.customerId
        ? await db.query.customers.findFirst({ where: eq(schema.customers.id, invoice.customerId) })
        : null;

      // Build HTML using shared template
      const printItems = items.map((it: any, i: number) => ({
        no: i + 1,
        name: it.description || `Item #${it.productId || it.id}`,
        qty: Number(it.quantity || 1),
        rate: Number(it.unitPrice || 0),
        total: Number(it.totalAmount || 0),
      }));

      const html = generateInvoiceHtml({
        companyName: companySettings?.companyName || "Company",
        companyNameAr: companySettings?.companyNameAr || "",
        companyLogo: companySettings?.logo || "",
        companyStamp: companySettings?.stamp || "",
        companyAddress: companySettings?.address || "",
        companyPhone: companySettings?.phone || "",
        companyVat: companySettings?.taxNumber || "",
        currency: companySettings?.defaultCurrency || "SAR",
        taxPercent: invoice.taxPercent || "15",
        note: invoice.notes || "",
        pSub: Number(invoice.subTotal || 0),
        pDisc: Number(invoice.discountAmount || 0),
        pVat: Number(invoice.taxAmount || 0),
        pTotal: Number(invoice.totalAmount || 0),
        pCustName: customer?.name || customer?.nameAr || "Walk-in Customer",
        pCustPhone: customer?.phone || "",
        pCustAddr: customer?.address || "",
        pCustVat: customer?.vatNumber || customer?.taxNumber || "",
        pType: invoice.invoiceType === "zatca" ? "zatca" : "standard",
        printItems,
      });

      const subject = `Invoice ${invoice.invoiceNumber} from ${companySettings?.companyName || "Company"}`;
      let emailSent = false;
      let emailError = null;
      try {
        const result = await sendEmail(input.to, subject, html);
        emailSent = result.sent;
        emailError = result.sent ? null : "SMTP error";
      } catch (e: any) {
        emailError = e?.message || "Email send failed";
      }

      // Log email
      await db.insert(schema.emailLogs).values({
        tenantId,
        templateKey: "invoice",
        recipient: input.to,
        subject,
        body: html.substring(0, 500),
        status: emailSent ? "sent" : "failed",
        errorMessage: emailError,
      });

      // Return success even if email fails — don't break invoice creation
      return { success: true, emailSent, message: emailSent ? `Invoice sent to ${input.to}` : `Invoice created but email failed: ${emailError}` };
    }),
});
