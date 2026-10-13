import { z } from "zod";
import crypto from "node:crypto";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  users,
  inventoryBalances,
  inventoryMovements,
  stockTransfers,
  stockTransferItems,
  invoices,
  customers,
  sahlSalesmen,
  sahlPriceLists,
  sahlPriceItems,
  sahlProductUnits,
  sahlReservations,
  sahlCheques,
  sahlBarcodes,
  sahlAccountFlags,
  sahlSettings,
  sahlSerials,
  sahlShifts,
} from "@db/schema";
import { eq, and, like, desc, or, gte, lte, sql } from "drizzle-orm";

const DEFAULT_LISTS = [
  { code: "P1", name: "Retail", nameAr: "تجزئة" },
  { code: "P2", name: "Wholesale", nameAr: "جملة" },
  { code: "P3", name: "Bulk", nameAr: "جملة الجملة" },
  { code: "P4", name: "Corporate", nameAr: "شركات" },
];

async function ensurePriceLists(db: any, tenantId: number) {
  const existing = await db.select().from(sahlPriceLists).where(eq(sahlPriceLists.tenantId, tenantId));
  const codes = new Set(existing.map((e: any) => e.code));
  for (let i = 0; i < DEFAULT_LISTS.length; i++) {
    if (!codes.has(DEFAULT_LISTS[i].code)) {
      await db.insert(sahlPriceLists).values({ tenantId, ...DEFAULT_LISTS[i], isDefault: i === 0 && existing.length === 0 });
    }
  }
  if (existing.length >= DEFAULT_LISTS.length) return existing;
  return db.select().from(sahlPriceLists).where(eq(sahlPriceLists.tenantId, tenantId));
}

export const sahlRouter = createRouter({
  // ---- Salesmen (مندوبى المبيعات) ----
  salesmanList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(sahlSalesmen)
      .where(eq(sahlSalesmen.tenantId, ctx.user.tenantId!))
      .orderBy(desc(sahlSalesmen.createdAt));
  }),
  salesmanCreate: authedQuery
    .input(z.object({
      name: z.string().min(1), nameAr: z.string().optional(),
      phone: z.string().optional(), commissionRate: z.number().min(0).max(100).default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(sahlSalesmen).values({
        tenantId: ctx.user.tenantId!, name: input.name, nameAr: input.nameAr,
        phone: input.phone, commissionRate: String(input.commissionRate),
      }).$returningId();
      return { id, success: true };
    }),
  salesmanUpdate: authedQuery
    .input(z.object({
      id: z.number(), name: z.string().optional(), nameAr: z.string().optional(),
      phone: z.string().optional(), commissionRate: z.number().min(0).max(100).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, commissionRate, ...rest } = input;
      await db.update(sahlSalesmen)
        .set({ ...rest, ...(commissionRate !== undefined ? { commissionRate: String(commissionRate) } : {}) })
        .where(and(eq(sahlSalesmen.id, id), eq(sahlSalesmen.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // ---- Price lists (3 renameable lists, selectable at sale) ----
  priceListList: authedQuery.query(async ({ ctx }) => {
    return ensurePriceLists(getDb(), ctx.user.tenantId!);
  }),
  priceListUpdate: authedQuery
    .input(z.object({ id: z.number(), name: z.string().optional(), nameAr: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(sahlPriceLists).set(data)
        .where(and(eq(sahlPriceLists.id, id), eq(sahlPriceLists.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),
  priceSet: authedQuery
    .input(z.object({ priceListId: z.number(), productId: z.number(), price: z.number().min(0) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const rows = await db.select().from(sahlPriceItems).where(
        and(eq(sahlPriceItems.priceListId, input.priceListId), eq(sahlPriceItems.productId, input.productId)));
      if (rows.length) {
        await db.update(sahlPriceItems).set({ price: String(input.price) }).where(eq(sahlPriceItems.id, rows[0].id));
      } else {
        await db.insert(sahlPriceItems).values({
          priceListId: input.priceListId, productId: input.productId, price: String(input.price),
        });
      }
      return { success: true };
    }),
  priceBulk: authedQuery
    .input(z.object({
      priceListId: z.number(),
      items: z.array(z.object({ productId: z.number(), price: z.number().min(0) })).min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const it of input.items) {
        const rows = await db.select().from(sahlPriceItems).where(
          and(eq(sahlPriceItems.priceListId, input.priceListId), eq(sahlPriceItems.productId, it.productId)));
        if (rows.length) {
          await db.update(sahlPriceItems).set({ price: String(it.price) }).where(eq(sahlPriceItems.id, rows[0].id));
        } else {
          await db.insert(sahlPriceItems).values({
            priceListId: input.priceListId, productId: it.productId, price: String(it.price),
          });
        }
      }
      return { success: true, count: input.items.length };
    }),
  priceFor: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const lists = await ensurePriceLists(db, ctx.user.tenantId!);
      const items = await db.select().from(sahlPriceItems)
        .where(eq(sahlPriceItems.productId, input.productId));
      const map: Record<number, string> = {};
      for (const it of items) map[it.priceListId] = String(it.price);
      return lists.map((l: any) => ({ ...l, price: map[l.id] ?? null }));
    }),

  // ---- Reservations (حجز بضاعة, expiry + convert/release) ----
  reservationList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conds = [eq(sahlReservations.tenantId, ctx.user.tenantId!)];
      if (input?.status) conds.push(eq(sahlReservations.status, input.status as any));
      return db.select().from(sahlReservations).where(and(...conds)).orderBy(desc(sahlReservations.createdAt));
    }),
  reservationCreate: authedQuery
    .input(z.object({
      quotationId: z.number().optional(), customerId: z.number().optional(),
      productId: z.number(), warehouseId: z.number().optional(),
      quantity: z.number().positive(), expiresAt: z.string().optional(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(sahlReservations).values({
        tenantId: ctx.user.tenantId!, quotationId: input.quotationId, customerId: input.customerId,
        productId: input.productId, warehouseId: input.warehouseId,
        quantity: String(input.quantity), expiresAt: input.expiresAt,
        status: "reserved", notes: input.notes,
      }).$returningId();
      return { id, success: true };
    }),
  reservationSetStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["converted", "released", "expired"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(sahlReservations).set({ status: input.status })
        .where(and(eq(sahlReservations.id, input.id), eq(sahlReservations.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // ---- Cheques (تسجيل + متابعة تحصيل) ----
  chequeList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conds = [eq(sahlCheques.tenantId, ctx.user.tenantId!)];
      if (input?.status) conds.push(eq(sahlCheques.status, input.status as any));
      return db.select().from(sahlCheques).where(and(...conds)).orderBy(desc(sahlCheques.createdAt));
    }),
  chequeCreate: authedQuery
    .input(z.object({
      number: z.string().min(1), bank: z.string().optional(),
      partyType: z.enum(["customer", "supplier"]).default("customer"),
      partyId: z.number().optional(), amount: z.number().positive(),
      dueDate: z.string().optional(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(sahlCheques).values({
        tenantId: ctx.user.tenantId!, number: input.number, bank: input.bank,
        partyType: input.partyType, partyId: input.partyId,
        amount: String(input.amount), dueDate: input.dueDate,
        status: "registered", notes: input.notes,
      }).$returningId();
      return { id, success: true };
    }),
  chequeSetStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["collected", "returned"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(sahlCheques).set({ status: input.status })
        .where(and(eq(sahlCheques.id, input.id), eq(sahlCheques.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // ---- Atomic warehouse transfer (validates + writes movements) ----
  transferAtomic: authedQuery
    .input(z.object({
      transferNumber: z.string(),
      fromWarehouseId: z.number(), toWarehouseId: z.number(),
      date: z.string(), notes: z.string().optional(),
      items: z.array(z.object({ productId: z.number(), quantity: z.number().positive() })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.fromWarehouseId === input.toWarehouseId) throw new Error("Same warehouse");
      const db = getDb();
      return db.transaction(async (tx) => {
        for (const it of input.items) {
          const from = await tx.select().from(inventoryBalances).where(and(
            eq(inventoryBalances.productId, it.productId),
            eq(inventoryBalances.tenantId, ctx.user.tenantId!),
            eq(inventoryBalances.warehouseId, input.fromWarehouseId)));
          if (!from.length || Number(from[0].quantity || 0) < it.quantity) {
            throw new Error(`Insufficient stock for product ${it.productId}`);
          }
        }
        const [{ id }] = await tx.insert(stockTransfers).values({
          tenantId: ctx.user.tenantId!, transferNumber: input.transferNumber,
          fromWarehouseId: input.fromWarehouseId, toWarehouseId: input.toWarehouseId,
          date: input.date, status: "received", notes: input.notes,
          createdBy: ctx.user.id,
        }).$returningId();
        for (const it of input.items) {
          await tx.insert(stockTransferItems).values({ transferId: id, productId: it.productId, quantity: it.quantity });
          const from = await tx.select().from(inventoryBalances).where(and(
            eq(inventoryBalances.productId, it.productId),
            eq(inventoryBalances.tenantId, ctx.user.tenantId!),
            eq(inventoryBalances.warehouseId, input.fromWarehouseId)));
          await tx.update(inventoryBalances)
            .set({ quantity: Number(from[0].quantity || 0) - it.quantity })
            .where(eq(inventoryBalances.id, from[0].id));
          const to = await tx.select().from(inventoryBalances).where(and(
            eq(inventoryBalances.productId, it.productId),
            eq(inventoryBalances.tenantId, ctx.user.tenantId!),
            eq(inventoryBalances.warehouseId, input.toWarehouseId)));
          if (to.length) {
            await tx.update(inventoryBalances)
              .set({ quantity: Number(to[0].quantity || 0) + it.quantity })
              .where(eq(inventoryBalances.id, to[0].id));
          } else {
            await tx.insert(inventoryBalances).values({
              tenantId: ctx.user.tenantId!, productId: it.productId,
              warehouseId: input.toWarehouseId, quantity: it.quantity,
            });
          }
          await tx.insert(inventoryMovements).values({
            tenantId: ctx.user.tenantId!, productId: it.productId,
            warehouseId: input.fromWarehouseId, movementType: "transfer_out",
            quantity: -it.quantity, reference: "transfer", referenceId: id,
            createdBy: ctx.user.id,
          });
          await tx.insert(inventoryMovements).values({
            tenantId: ctx.user.tenantId!, productId: it.productId,
            warehouseId: input.toWarehouseId, movementType: "transfer_in",
            quantity: it.quantity, reference: "transfer", referenceId: id,
            createdBy: ctx.user.id,
          });
        }
        return { id, success: true };
      });
    }),

  // ---- Invoice archive search (number / customer / memo text) ----
  archiveSearch: authedQuery
    .input(z.object({
      q: z.string().optional(), customerId: z.number().optional(),
      from: z.string().optional(), to: z.string().optional(), limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conds = [eq(invoices.tenantId, ctx.user.tenantId!)];
      if (input.customerId) conds.push(eq(invoices.customerId, input.customerId));
      if (input.from) conds.push(gte(invoices.date, input.from));
      if (input.to) conds.push(lte(invoices.date, input.to));
      if (input.q) {
        conds.push(or(
          like(invoices.invoiceNumber, `%${input.q}%`),
          like(invoices.notes, `%${input.q}%`),
          like(customers.name, `%${input.q}%`),
        )!);
      }
      return db.select({
        id: invoices.id, invoiceNumber: invoices.invoiceNumber, date: invoices.date,
        customerId: invoices.customerId, customerName: customers.name,
        subTotal: invoices.subTotal, taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount, paidAmount: invoices.paidAmount,
        balanceDue: invoices.balanceDue, status: invoices.status, notes: invoices.notes,
      }).from(invoices)
        .leftJoin(customers, eq(customers.id, invoices.customerId))
        .where(and(...conds))
        .orderBy(desc(invoices.createdAt))
        .limit(Math.min(input.limit, 200));
    }),

  // ---- Barcode label data (print via label layout) ----
  labelData: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { products } = await import("@db/schema");
      const p = await db.query.products.findFirst({ where: eq(products.id, input.productId) });
      if (!p || (p as any).tenantId !== ctx.user.tenantId!) throw new Error("Not found");
      return {
        sku: (p as any).sku, name: (p as any).nameAr || (p as any).name,
        barcode: (p as any).barcode || (p as any).sku,
        price: (p as any).salePrice,
      };
    }),

  // ---- Product units (وحدات الصنف + conversion + price) ----
  productUnitList: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select().from(sahlProductUnits).where(and(
        eq(sahlProductUnits.productId, input.productId),
        eq(sahlProductUnits.tenantId, ctx.user.tenantId!)));
    }),
  productUnitAdd: authedQuery
    .input(z.object({
      productId: z.number(), unitName: z.string().min(1),
      factor: z.number().positive().default(1), salePrice: z.number().min(0).default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(sahlProductUnits).values({
        tenantId: ctx.user.tenantId!, productId: input.productId, unitName: input.unitName,
        factor: String(input.factor), salePrice: String(input.salePrice),
      }).$returningId();
      return { id, success: true };
    }),
  productUnitUpdate: authedQuery
    .input(z.object({
      id: z.number(), unitName: z.string().optional(),
      factor: z.number().positive().optional(), salePrice: z.number().min(0).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, factor, salePrice, ...rest } = input;
      await db.update(sahlProductUnits).set({
        ...rest,
        ...(factor !== undefined ? { factor: String(factor) } : {}),
        ...(salePrice !== undefined ? { salePrice: String(salePrice) } : {}),
      }).where(and(eq(sahlProductUnits.id, id), eq(sahlProductUnits.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),
  productUnitDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(sahlProductUnits).where(and(
        eq(sahlProductUnits.id, input.id), eq(sahlProductUnits.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // ---- Barcode / code / name lookup (name, sku, barcode LIKE) ----
  lookup: authedQuery
    .input(z.object({ q: z.string().min(1), limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { products, units } = await import("@db/schema");
      const pattern = `%${input.q}%`;
      return db.select({
        id: products.id, sku: products.sku, name: products.name, nameAr: products.nameAr,
        barcode: products.barcode, purchasePrice: products.purchasePrice,
        salePrice: products.salePrice, minPrice: (products as any).minPrice,
        fixedDiscount: (products as any).fixedDiscount,
        taxRate: products.taxRate, isActive: products.isActive,
        unitName: units.name,
        isSerialTracked: (products as any).isSerialTracked,
      }).from(products)
        .leftJoin(units, eq(units.id, (products as any).unitId))
        .where(and(
          eq(products.tenantId, ctx.user.tenantId!),
          or(
            like(products.name, pattern),
            like(products.sku, pattern),
            like(products.barcode, pattern),
          )!))
        .limit(Math.min(input.limit, 50));
    }),

  // ---- Extra barcodes per product (multi-barcode table) ----
  barcodeList: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select().from(sahlBarcodes).where(and(
        eq(sahlBarcodes.productId, input.productId),
        eq(sahlBarcodes.tenantId, ctx.user.tenantId!)));
    }),
  barcodeAdd: authedQuery
    .input(z.object({ productId: z.number(), barcode: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const code = input.barcode.trim();
      const dup = await db.select({ id: sahlBarcodes.id }).from(sahlBarcodes)
        .where(and(eq(sahlBarcodes.tenantId, ctx.user.tenantId!), eq(sahlBarcodes.barcode, code))).limit(1);
      if (dup.length) throw new Error("Barcode already used");
      const [{ id }] = await db.insert(sahlBarcodes).values({
        tenantId: ctx.user.tenantId!, productId: input.productId, barcode: code,
      }).$returningId();
      return { id, success: true };
    }),
  barcodeDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(sahlBarcodes).where(and(
        eq(sahlBarcodes.id, input.id), eq(sahlBarcodes.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // ---- Strict product delete (blocked by stock OR any history) ----
  productDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { products, invoiceItems, purchaseOrderItems, salesQuotationItems } = await import("@db/schema");
      const stock = await db.select().from(inventoryBalances)
        .where(and(eq(inventoryBalances.productId, input.id), eq(inventoryBalances.tenantId, ctx.user.tenantId!)));
      const qty = stock.reduce((a: number, s: any) => a + Number(s.quantity || 0), 0);
      if (qty !== 0) throw new Error(`Cannot delete: stock is ${qty}, must be zero`);
      const moves = await db.select({ id: inventoryMovements.id }).from(inventoryMovements)
        .where(and(eq(inventoryMovements.productId, input.id), eq(inventoryMovements.tenantId, ctx.user.tenantId!))).limit(1);
      if (moves.length) throw new Error("Cannot delete: stock movements exist — deactivate instead");
      const inv = await db.select({ id: invoiceItems.id }).from(invoiceItems)
        .where(eq(invoiceItems.productId, input.id)).limit(1);
      if (inv.length) throw new Error("Cannot delete: invoice lines exist — deactivate instead");
      const po = await db.select({ id: purchaseOrderItems.id }).from(purchaseOrderItems)
        .where(eq(purchaseOrderItems.productId, input.id)).limit(1);
      if (po.length) throw new Error("Cannot delete: purchase lines exist — deactivate instead");
      const qo = await db.select({ id: salesQuotationItems.id }).from(salesQuotationItems)
        .where(eq(salesQuotationItems.productId, input.id)).limit(1);
      if (qo.length) throw new Error("Cannot delete: quotation lines exist — deactivate instead");
      await db.delete(sahlBarcodes).where(eq(sahlBarcodes.productId, input.id));
      await db.delete(sahlProductUnits).where(eq(sahlProductUnits.productId, input.id));
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  // ---- Moved-items audit (only items that moved in range) ----
  movedItems: authedQuery
    .input(z.object({ from: z.string(), to: z.string(), warehouseId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { products } = await import("@db/schema");
      const conds = [
        eq(inventoryMovements.tenantId, ctx.user.tenantId!),
        gte(inventoryMovements.createdAt, new Date(input.from)),
        lte(inventoryMovements.createdAt, new Date(input.to + "T23:59:59")),
      ];
      if (input.warehouseId) conds.push(eq(inventoryMovements.warehouseId, input.warehouseId));
      const rows = await db.select({
        productId: inventoryMovements.productId,
        name: products.name,
        sku: products.sku,
        inQty: sql<number>`coalesce(sum(case when ${inventoryMovements.quantity} > 0 then ${inventoryMovements.quantity} else 0 end),0)`,
        outQty: sql<number>`coalesce(sum(case when ${inventoryMovements.quantity} < 0 then -${inventoryMovements.quantity} else 0 end),0)`,
      }).from(inventoryMovements)
        .leftJoin(products, eq(products.id, inventoryMovements.productId))
        .where(and(...conds))
        .groupBy(inventoryMovements.productId, products.name, products.sku);
      const bals = await db.select().from(inventoryBalances)
        .where(eq(inventoryBalances.tenantId, ctx.user.tenantId!));
      return rows.map((r: any) => {
        const closing = bals.filter((b: any) => b.productId === r.productId)
          .reduce((a: number, b: any) => a + Number(b.quantity || 0), 0);
        return { ...r, closing, opening: closing - Number(r.inQty || 0) + Number(r.outQty || 0) };
      });
    }),

  // ---- Serial search (movement serialNumber trail) ----
  serialSearch: authedQuery
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { products } = await import("@db/schema");
      return db.select({
        id: inventoryMovements.id,
        serialNumber: inventoryMovements.serialNumber,
        movementType: inventoryMovements.movementType,
        quantity: inventoryMovements.quantity,
        reference: inventoryMovements.reference,
        referenceId: inventoryMovements.referenceId,
        createdAt: inventoryMovements.createdAt,
        productId: inventoryMovements.productId,
        productName: products.name,
        productSku: products.sku,
      }).from(inventoryMovements)
        .leftJoin(products, eq(products.id, inventoryMovements.productId))
        .where(and(
          eq(inventoryMovements.tenantId, ctx.user.tenantId!),
          like(inventoryMovements.serialNumber, `%${input.q}%`)))
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(100);
    }),

  // ---- Treasury daily ledger (running balance) ----
  treasuryLedger: authedQuery
    .input(z.object({ from: z.string(), to: z.string(), limit: z.number().default(200) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { cashboxTransactions } = await import("@db/schema");
      const rows = await db.select().from(cashboxTransactions)
        .where(and(
          eq(cashboxTransactions.tenantId, ctx.user.tenantId!),
          gte(cashboxTransactions.createdAt, new Date(input.from)),
          lte(cashboxTransactions.createdAt, new Date(input.to + "T23:59:59"))))
        .orderBy(cashboxTransactions.createdAt)
        .limit(Math.min(input.limit, 500));
      let running = rows.length ? Number(rows[0].balanceBefore || 0) : 0;
      return rows.map((r: any) => {
        running = Number(r.balanceAfter ?? running);
        return { ...r, running };
      });
    }),

  // ---- Expense analysis (by بند category + by payee note) ----
  expenseAnalysis: authedQuery
    .input(z.object({ from: z.string(), to: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { cashboxTransactions } = await import("@db/schema");
      const rows = await db.select().from(cashboxTransactions)
        .where(and(
          eq(cashboxTransactions.tenantId, ctx.user.tenantId!),
          eq(cashboxTransactions.transactionType, "expense"),
          gte(cashboxTransactions.createdAt, new Date(input.from)),
          lte(cashboxTransactions.createdAt, new Date(input.to + "T23:59:59"))));
      const byCat: Record<string, number> = {};
      for (const r of rows as any[]) {
        const m = String(r.notes || "").match(/بند:([^—]+)/);
        const cat = (m ? m[1] : "عام").trim();
        byCat[cat] = (byCat[cat] || 0) + Number(r.amount || 0);
      }
      return {
        total: rows.reduce((a: number, r: any) => a + Number(r.amount || 0), 0),
        count: rows.length,
        byCategory: Object.entries(byCat).map(([category, total]) => ({ category, total })),
      };
    }),

  // ---- Itemized account statement (lines per invoice) ----
  itemizedStatement: authedQuery
    .input(z.object({ customerId: z.number(), from: z.string().optional(), to: z.string().optional(), limit: z.number().default(200) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { invoiceItems, products } = await import("@db/schema");
      const conds = [
        eq(invoices.tenantId, ctx.user.tenantId!),
        eq(invoices.customerId, input.customerId),
      ];
      if (input.from) conds.push(gte(invoices.date, input.from));
      if (input.to) conds.push(lte(invoices.date, input.to));
      return db.select({
        invoiceId: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        date: invoices.date,
        productName: products.name,
        sku: products.sku,
        quantity: invoiceItems.quantity,
        unitPrice: invoiceItems.unitPrice,
        totalAmount: invoiceItems.totalAmount,
      }).from(invoiceItems)
        .innerJoin(invoices, eq(invoices.id, invoiceItems.invoiceId))
        .leftJoin(products, eq(products.id, invoiceItems.productId))
        .where(and(...conds))
        .orderBy(desc(invoices.date))
        .limit(Math.min(input.limit, 500));
    }),

  // ---- Account review flags ----
  flagDue: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    return db.select().from(sahlAccountFlags).where(and(
      eq(sahlAccountFlags.tenantId, ctx.user.tenantId!),
      lte(sahlAccountFlags.reminderDate, today)));
  }),
  flagGet: authedQuery
    .input(z.object({ accountKind: z.string(), accountId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const rows = await db.select().from(sahlAccountFlags).where(and(
        eq(sahlAccountFlags.tenantId, ctx.user.tenantId!),
        eq(sahlAccountFlags.accountKind, input.accountKind),
        eq(sahlAccountFlags.accountId, input.accountId)));
      return rows[0] ?? null;
    }),
  flagSet: authedQuery
    .input(z.object({
      accountKind: z.string(), accountId: z.number(),
      reminderDate: z.string().optional(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const ex = await db.select({ id: sahlAccountFlags.id }).from(sahlAccountFlags).where(and(
        eq(sahlAccountFlags.tenantId, ctx.user.tenantId!),
        eq(sahlAccountFlags.accountKind, input.accountKind),
        eq(sahlAccountFlags.accountId, input.accountId)));
      if (ex.length) {
        await db.update(sahlAccountFlags)
          .set({ reminderDate: input.reminderDate || null, notes: input.notes || null })
          .where(eq(sahlAccountFlags.id, ex[0].id));
      } else {
        await db.insert(sahlAccountFlags).values({
          tenantId: ctx.user.tenantId!, accountKind: input.accountKind, accountId: input.accountId,
          reminderDate: input.reminderDate || null, notes: input.notes || null,
        });
      }
      return { success: true };
    }),

  // ---- PO / quotation line detail (invoice-hub master-detail) ----
  poDetail: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { purchaseOrders, purchaseOrderItems, products } = await import("@db/schema");
      const po = await db.query.purchaseOrders.findFirst({
        where: and(eq(purchaseOrders.id, input.id), eq(purchaseOrders.tenantId, ctx.user.tenantId!)),
      });
      if (!po) return null;
      const items = await db.select({
        description: purchaseOrderItems.description,
        quantity: purchaseOrderItems.quantity,
        unitPrice: purchaseOrderItems.unitPrice,
        totalAmount: purchaseOrderItems.totalAmount,
        productName: products.name,
      }).from(purchaseOrderItems)
        .leftJoin(products, eq(products.id, purchaseOrderItems.productId))
        .where(eq(purchaseOrderItems.poId, input.id));
      return { ...po, items };
    }),
  quoteDetail: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { salesQuotations, salesQuotationItems, products } = await import("@db/schema");
      const q = await db.query.salesQuotations.findFirst({
        where: and(eq(salesQuotations.id, input.id), eq(salesQuotations.tenantId, ctx.user.tenantId!)),
      });
      if (!q) return null;
      const items = await db.select({
        description: salesQuotationItems.description,
        quantity: salesQuotationItems.quantity,
        unitPrice: salesQuotationItems.unitPrice,
        totalAmount: salesQuotationItems.totalAmount,
        productName: products.name,
      }).from(salesQuotationItems)
        .leftJoin(products, eq(products.id, salesQuotationItems.productId))
        .where(eq(salesQuotationItems.quotationId, input.id));
      return { ...q, items };
    }),

  // ---- Supervisor passcode (verified server-side with scrypt) ----
  supervisorSet: adminQuery
    .input(z.object({ password: z.string().min(4) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync(input.password, salt, 64).toString("hex");
      const ex = await db.select({ id: sahlSettings.id }).from(sahlSettings).where(and(
        eq(sahlSettings.tenantId, ctx.user.tenantId!), eq(sahlSettings.key, "supervisor_pin")));
      if (ex.length) {
        await db.update(sahlSettings).set({ value: `scrypt$${salt}$${hash}` }).where(eq(sahlSettings.id, ex[0].id));
      } else {
        await db.insert(sahlSettings).values({
          tenantId: ctx.user.tenantId!, key: "supervisor_pin", value: `scrypt$${salt}$${hash}`,
        });
      }
      return { success: true };
    }),
  supervisorHas: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select({ id: sahlSettings.id }).from(sahlSettings).where(and(
      eq(sahlSettings.tenantId, ctx.user.tenantId!), eq(sahlSettings.key, "supervisor_pin"))).limit(1);
    return { set: rows.length > 0 };
  }),
  supervisorVerify: authedQuery
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const rows = await db.select().from(sahlSettings).where(and(
        eq(sahlSettings.tenantId, ctx.user.tenantId!), eq(sahlSettings.key, "supervisor_pin"))).limit(1);
      if (!rows.length || !rows[0].value) throw new Error("No supervisor passcode set");
      const [, salt, hash] = String(rows[0].value).split("$");
      const candidate = crypto.scryptSync(input.password, salt, 64).toString("hex");
      if (candidate !== hash) throw new Error("Wrong passcode");
      return { ok: true };
    }),

  // ---- Serial tracking (per-unit receive/issue/history) ----
  serialReceive: authedQuery
    .input(z.object({
      productId: z.number(), serials: z.array(z.string().min(1)).min(1).max(200),
      purchaseRef: z.string().optional(), warrantyMonths: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      let added = 0;
      for (const s of input.serials.map((x) => x.trim()).filter(Boolean)) {
        const ex = await db.select({ id: sahlSerials.id }).from(sahlSerials).where(and(
          eq(sahlSerials.tenantId, ctx.user.tenantId!), eq(sahlSerials.serial, s))).limit(1);
        if (ex.length) {
          await db.update(sahlSerials).set({
            status: "in_stock", productId: input.productId,
            purchaseRef: input.purchaseRef || null, saleInvoiceId: null, customerId: null,
          }).where(eq(sahlSerials.id, ex[0].id));
        } else {
          await db.insert(sahlSerials).values({
            tenantId: ctx.user.tenantId!, productId: input.productId, serial: s,
            status: "in_stock", purchaseRef: input.purchaseRef || null,
            warrantyMonths: input.warrantyMonths ?? 12,
          });
          added++;
        }
      }
      return { success: true, added };
    }),
  serialIssue: authedQuery
    .input(z.object({
      productId: z.number(), serials: z.array(z.string().min(1)).min(1).max(200),
      invoiceId: z.number().optional(), customerId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      for (const s of input.serials.map((x) => x.trim()).filter(Boolean)) {
        const ex = await db.select().from(sahlSerials).where(and(
          eq(sahlSerials.tenantId, ctx.user.tenantId!), eq(sahlSerials.serial, s))).limit(1);
        if (!ex.length || ex[0].status !== "in_stock" || ex[0].productId !== input.productId) {
          throw new Error(`Serial not in stock: ${s}`);
        }
        await db.update(sahlSerials).set({
          status: "sold", saleInvoiceId: input.invoiceId || null, customerId: input.customerId || null,
        }).where(eq(sahlSerials.id, ex[0].id));
      }
      return { success: true, count: input.serials.length };
    }),
  serialHistory: authedQuery
    .input(z.object({ q: z.string().optional(), productId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { products, invoices: invT, customers: custT } = await import("@db/schema");
      const conds = [eq(sahlSerials.tenantId, ctx.user.tenantId!)];
      if (input?.q) conds.push(like(sahlSerials.serial, `%${input.q}%`));
      if (input?.productId) conds.push(eq(sahlSerials.productId, input.productId));
      return db.select({
        id: sahlSerials.id, serial: sahlSerials.serial, status: sahlSerials.status,
        purchaseRef: sahlSerials.purchaseRef, saleInvoiceId: sahlSerials.saleInvoiceId,
        createdAt: sahlSerials.createdAt,
        productName: products.name, productSku: products.sku,
        invoiceNumber: invT.invoiceNumber, customerName: custT.name,
      }).from(sahlSerials)
        .leftJoin(products, eq(products.id, sahlSerials.productId))
        .leftJoin(invT, eq(invT.id, sahlSerials.saleInvoiceId))
        .leftJoin(custT, eq(custT.id, sahlSerials.customerId))
        .where(and(...conds))
        .orderBy(desc(sahlSerials.createdAt))
        .limit(200);
    }),

  // ---- Shifts (open / close with counted cash) ----
  shiftCurrent: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(sahlShifts).where(and(
      eq(sahlShifts.tenantId, ctx.user.tenantId!), eq(sahlShifts.status, "open")))
      .orderBy(desc(sahlShifts.openedAt)).limit(1);
    return rows[0] ?? null;
  }),
  shiftOpen: authedQuery
    .input(z.object({ openingBalance: z.number().min(0).default(0), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const open = await db.select({ id: sahlShifts.id }).from(sahlShifts).where(and(
        eq(sahlShifts.tenantId, ctx.user.tenantId!), eq(sahlShifts.status, "open"))).limit(1);
      if (open.length) throw new Error("A shift is already open");
      const [{ id }] = await db.insert(sahlShifts).values({
        tenantId: ctx.user.tenantId!, userId: ctx.user.id,
        openingBalance: String(input.openingBalance), notes: input.notes || null, status: "open",
      }).$returningId();
      return { id, success: true };
    }),
  shiftClose: authedQuery
    .input(z.object({ counted: z.number().min(0), daySales: z.number().min(0).default(0), dayExpenses: z.number().min(0).default(0), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const open = await db.select().from(sahlShifts).where(and(
        eq(sahlShifts.tenantId, ctx.user.tenantId!), eq(sahlShifts.status, "open")))
        .orderBy(desc(sahlShifts.openedAt)).limit(1);
      if (!open.length) throw new Error("No open shift");
      await db.update(sahlShifts).set({
        status: "closed", closedAt: new Date(),
        closingCounted: String(input.counted),
        daySales: String(input.daySales), dayExpenses: String(input.dayExpenses),
        notes: input.notes || open[0].notes,
      }).where(eq(sahlShifts.id, open[0].id));
      const expected = Number(open[0].openingBalance || 0) + Number(input.daySales) - Number(input.dayExpenses);
      return { success: true, expected, counted: input.counted, diff: input.counted - expected };
    }),
  shiftList: authedQuery
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select().from(sahlShifts)
        .where(eq(sahlShifts.tenantId, ctx.user.tenantId!))
        .orderBy(desc(sahlShifts.openedAt))
        .limit(Math.min(input?.limit ?? 20, 100));
    }),

  // ---- Year summary (closing visibility WITHOUT purge) ----
  yearSummary: authedQuery
    .input(z.object({ year: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const { cashboxTransactions } = await import("@db/schema");
      const invs = await db.select().from(invoices)
        .where(and(eq(invoices.tenantId, ctx.user.tenantId!),
          gte(invoices.date, `${input.year}-01-01`), lte(invoices.date, `${input.year}-12-31`)));
      const cash = await db.select().from(cashboxTransactions)
        .where(eq(cashboxTransactions.tenantId, ctx.user.tenantId!));
      const sales = invs.reduce((a: number, i: any) => a + Number(i.totalAmount || 0), 0);
      return {
        year: input.year,
        invoiceCount: invs.length,
        salesTotal: sales,
        cashIn: cash.filter((c: any) => c.transactionType === "cash_in").reduce((a: number, c: any) => a + Number(c.amount || 0), 0),
        cashOut: cash.filter((c: any) => c.transactionType !== "cash_in").reduce((a: number, c: any) => a + Number(c.amount || 0), 0),
      };
    }),

  // ---- Tenant data export (JSON backup of master + docs) ----
  backupExport: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const { products, productCategories, suppliers, warehouses, units } = await import("@db/schema");
    const tid = ctx.user.tenantId!;
    const [prods, cats, custs, sups, whs, uns, lists, serials, cheques, invs] = await Promise.all([
      db.select().from(products).where(eq(products.tenantId, tid)),
      db.select().from(productCategories).where(eq(productCategories.tenantId, tid)),
      db.select().from(customers).where(eq(customers.tenantId, tid)),
      db.select().from(suppliers).where(eq(suppliers.tenantId, tid)),
      db.select().from(warehouses).where(eq(warehouses.tenantId, tid)),
      db.select().from(units).where(eq(units.tenantId, tid)),
      db.select().from(sahlPriceLists).where(eq(sahlPriceLists.tenantId, tid)),
      db.select().from(sahlSerials).where(eq(sahlSerials.tenantId, tid)),
      db.select().from(sahlCheques).where(eq(sahlCheques.tenantId, tid)),
      db.select().from(invoices).where(eq(invoices.tenantId, tid)).limit(2000),
    ]);
    return {
      exportedAt: new Date().toISOString(), tenantId: tid,
      products: prods, categories: cats, customers: custs, suppliers: sups,
      warehouses: whs, units: uns, priceLists: lists, serials, cheques, invoices: invs,
    };
  }),

  // ---- Own password change ----
  changePasswordSelf: authedQuery
    .input(z.object({ oldPassword: z.string().min(1), newPassword: z.string().min(4) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const rows = await db.select().from(users).where(and(
        eq(users.id, ctx.user.id), eq(users.tenantId, ctx.user.tenantId!))).limit(1);
      if (!rows.length || !rows[0].passwordEncrypted) throw new Error("Account not found");
      const stored = String(rows[0].passwordEncrypted);
      let ok = false;
      try {
        if (stored.startsWith("scrypt$")) {
          const [, salt, hash] = stored.split("$");
          ok = crypto.scryptSync(input.oldPassword, salt, 64).toString("hex") === hash;
        } else {
          ok = crypto.createHash("sha256").update(input.oldPassword).digest("hex") === stored;
        }
      } catch { ok = false; }
      if (!ok) throw new Error("Wrong current password");
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync(input.newPassword, salt, 64).toString("hex");
      await db.update(users).set({ passwordEncrypted: `scrypt$${salt}$${hash}` })
        .where(eq(users.id, rows[0].id));
      return { success: true };
    }),

  // ---- Users (admin only; scrypt format matches passwordLogin) ----
  userList: adminQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select({
      id: users.id, name: users.name, email: users.email,
      username: users.username, role: users.role, phone: users.phone,
      isActive: users.isActive, lastLoginAt: users.lastLoginAt,
    }).from(users).where(eq(users.tenantId, ctx.user.tenantId!));
    return rows;
  }),
  userCreate: adminQuery
    .input(z.object({
      name: z.string().min(1), username: z.string().min(3), email: z.string().email().optional(),
      password: z.string().min(4),
      role: z.enum(["admin", "manager", "accountant", "salesman", "cashier", "store_keeper", "user"]).default("cashier"),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync(input.password, salt, 64).toString("hex");
      const email = (input.email || `${input.username}@local`).toLowerCase();
      const [{ id }] = await db.insert(users).values({
        tenantId: ctx.user.tenantId!,
        unionId: `local:${ctx.user.tenantId}:${input.username.toLowerCase()}`,
        name: input.name, email, username: input.username.toLowerCase(),
        passwordEncrypted: `scrypt$${salt}$${hash}`,
        role: input.role as any, phone: input.phone, isActive: true,
      }).$returningId();
      return { id, success: true };
    }),
  userSetActive: adminQuery
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(users).set({ isActive: input.isActive })
        .where(and(eq(users.id, input.id), eq(users.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),
});
