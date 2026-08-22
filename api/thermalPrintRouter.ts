import { createRouter, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and } from "drizzle-orm";
import { invoiceItems, invoices, companySettings } from "@db/schema";
import { generate80mmThermal, generate58mmThermal, ThermalInvoiceData } from "./lib/thermal/escpos";
import { z } from "zod";

export const thermalPrintRouter = createRouter({
  generateThermal: authedMutation
    .input(z.object({
      invoiceId: z.number(),
      format: z.enum(["80mm", "58mm"]).default("80mm"),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = getDb();
        const tenantId = ctx.user.tenantId!;

        // Fetch invoice
        const invoice = await db.query.invoices.findFirst({
          where: and(eq(invoices.id, input.invoiceId), eq(invoices.tenantId, tenantId)),
        });
        if (!invoice) throw new Error("Invoice not found");

        // Fetch company settings
        const company = await db.query.companySettings.findFirst({
          where: eq(companySettings.tenantId, tenantId),
        });
        if (!company) throw new Error("Company settings not found");

        // Fetch invoice items
        const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, input.invoiceId));

        // Fetch customer if needed
        const customer = invoice.customerId 
          ? await db.query.customers.findFirst({ where: eq(schema.customers.id, invoice.customerId) })
          : null;

        // Prepare thermal data
        const thermalData: ThermalInvoiceData = {
          companyNameAr: company.companyNameAr || company.companyName || "شركة",
          companyNameEn: company.companyName || "Company",
          vatNumber: company.taxNumber || company.vatNumber || "",
          address: company.address,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          customerName: customer?.name,
          items: items.map(i => ({
            description: i.description || "",
            qty: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            total: Number(i.totalAmount),
          })),
          subtotal: Number(invoice.subTotal || 0),
          vatAmount: Number(invoice.taxAmount || 0),
          grandTotal: Number(invoice.totalAmount || 0),
          qrData: invoice.zatcaQrCode || "",
          isSimplified: invoice.invoiceType === "simplified",
        };

        // Generate thermal data
        const buffer = input.format === "80mm"
          ? generate80mmThermal(thermalData)
          : generate58mmThermal(thermalData);

        return {
          success: true,
          data: buffer.toString("base64"),
          format: input.format,
          message: `Thermal receipt (${input.format}) generated successfully`,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate thermal receipt";
        throw new Error(message);
      }
    }),
});
