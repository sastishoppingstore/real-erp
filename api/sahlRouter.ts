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
} from "@db/schema";
import { eq, and, like, desc, or, gte, lte, sql } from "drizzle-orm";

const DEFAULT_LISTS = [
  { code: "P1", name: "Retail", nameAr: "تجزئة" },
  { code: "P2", name: "Wholesale", nameAr: "جملة" },
  { code: "P3", name: "Bulk", nameAr: "جملة الجملة" },
];

async function ensurePriceLists(db: any, tenantId: number) {
  const existing = await db.select().from(sahlPriceLists).where(eq(sahlPriceLists.tenantId, tenantId));
  if (existing.length) return existing;
  for (let i = 0; i < DEFAULT_LISTS.length; i++) {
    await db.insert(sahlPriceLists).values({ tenantId, ...DEFAULT_LISTS[i], isDefault: i === 0 });
  }
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
