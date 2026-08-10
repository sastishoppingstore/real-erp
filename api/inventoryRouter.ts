import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { TRPCError } from "@trpc/server";
import {
  products, productCategories, brands, units, warehouses,
  inventoryBalances, inventoryMovements, stockTransfers,
  stockTransferItems, stockAdjustments, stockAdjustmentItems
} from "@db/schema";
import { eq, sql, and, like, desc } from "drizzle-orm";
import { checkLowStockAndNotify } from "./lib/notifications/events";

export const inventoryRouter = createRouter({
  // Product Categories
  categoryList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(productCategories).where(eq(productCategories.tenantId, ctx.user.tenantId!));
    }),

  categoryCreate: authedQuery
    .input(z.object({ name: z.string(), nameAr: z.string().optional(), description: z.string().optional(), image: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(productCategories).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  categoryUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameAr: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      const existing = await db.query.productCategories.findFirst({
        where: and(eq(productCategories.id, id), eq(productCategories.tenantId, ctx.user.tenantId!)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      await db.update(productCategories).set(data)
        .where(and(eq(productCategories.id, id), eq(productCategories.tenantId, ctx.user.tenantId!)));
      return { success: true, id };
    }),

  categoryDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(productCategories)
        .where(and(eq(productCategories.id, input.id), eq(productCategories.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // Brands
  brandList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(brands).where(eq(brands.tenantId, ctx.user.tenantId!));
    }),

  brandCreate: authedQuery
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(brands).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Units
  unitList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(units).where(eq(units.tenantId, ctx.user.tenantId!));
    }),

  // Warehouses
  warehouseList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(warehouses).where(eq(warehouses.tenantId, ctx.user.tenantId!));
    }),

  warehouseCreate: authedQuery
    .input(z.object({
      code: z.string(),
      name: z.string(),
      address: z.string().optional(),
      managerName: z.string().optional(),
      phone: z.string().optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(warehouses).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  warehouseUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      code: z.string().optional(),
      name: z.string().optional(),
      address: z.string().optional(),
      managerName: z.string().optional(),
      phone: z.string().optional(),
      isPrimary: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      const existing = await db.query.warehouses.findFirst({
        where: and(eq(warehouses.id, id), eq(warehouses.tenantId, ctx.user.tenantId!)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Warehouse not found" });
      await db.update(warehouses).set(data)
        .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, ctx.user.tenantId!)));
      return { success: true, id };
    }),

  // Products
  productList: authedQuery
    .input(z.object({
      categoryId: z.number().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(products.tenantId, tenantId)];
      if (input?.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
      if (input?.search) conditions.push(like(products.name, `%${input.search}%`));
      return db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
    }),

  productGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.id),
      });
      const balances = await db.select().from(inventoryBalances)
        .where(eq(inventoryBalances.productId, input.id));
      return { product, balances };
    }),

  productCreate: authedQuery
    .input(z.object({
      sku: z.string(),
      name: z.string(),
      nameAr: z.string().optional(),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      brandId: z.number().optional(),
      unitId: z.number().optional(),
      barcode: z.string().optional(),
      productType: z.enum(["goods", "service", "raw_material", "finished_good"]).optional(),
      purchasePrice: z.string().optional(),
      salePrice: z.string().optional(),
      costMethod: z.enum(["fifo", "lifo", "weighted_average"]).optional(),
      reorderLevel: z.number().optional(),
      taxRate: z.string().optional(),
      isTaxable: z.boolean().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(products).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        costMethod: input.costMethod || "fifo",
      }).$returningId();
      return { id, success: true };
    }),

  productUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      sku: z.string().optional(),
      name: z.string().optional(),
      nameAr: z.string().optional(),
      purchasePrice: z.string().optional(),
      salePrice: z.string().optional(),
      isActive: z.boolean().optional(),
      reorderLevel: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  // Inventory Balances
  inventoryList: authedQuery
    .input(z.object({
      warehouseId: z.number().optional(),
      lowStock: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(inventoryBalances.tenantId, tenantId)];
      if (input?.warehouseId) conditions.push(eq(inventoryBalances.warehouseId, input.warehouseId));
      if (input?.lowStock) conditions.push(sql`quantity <= 10`);

      return db.select({
        id: inventoryBalances.id,
        productId: inventoryBalances.productId,
        warehouseId: inventoryBalances.warehouseId,
        quantity: inventoryBalances.quantity,
        reservedQuantity: inventoryBalances.reservedQuantity,
        avgCost: inventoryBalances.avgCost,
        totalValue: inventoryBalances.totalValue,
        productName: products.name,
        productSku: products.sku,
        warehouseName: warehouses.name,
        reorderLevel: products.reorderLevel,
      })
        .from(inventoryBalances)
        .leftJoin(products, eq(inventoryBalances.productId, products.id))
        .leftJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
        .where(and(...conditions));
    }),

  // Stock Movements
  movementList: authedQuery
    .input(z.object({
      productId: z.number().optional(),
      warehouseId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(inventoryMovements.tenantId, tenantId)];
      if (input?.productId) conditions.push(eq(inventoryMovements.productId, input.productId));
      if (input?.warehouseId) conditions.push(eq(inventoryMovements.warehouseId, input.warehouseId));
      return db.select().from(inventoryMovements)
        .where(and(...conditions))
        .orderBy(desc(inventoryMovements.createdAt));
    }),

  // Stock Transfers
  transferList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(stockTransfers).where(eq(stockTransfers.tenantId, ctx.user.tenantId!));
    }),

  transferCreate: authedQuery
    .input(z.object({
      transferNumber: z.string(),
      fromWarehouseId: z.number(),
      toWarehouseId: z.number(),
      date: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitCost: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(stockTransfers).values({
        tenantId: ctx.user.tenantId!,
        transferNumber: input.transferNumber,
        fromWarehouseId: input.fromWarehouseId,
        toWarehouseId: input.toWarehouseId,
        date: input.date,
        notes: input.notes,
      }).$returningId();

      for (const item of input.items) {
        await db.insert(stockTransferItems).values({
          transferId: id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        });
        // decrement from source warehouse
        const fromRows = await db.select().from(inventoryBalances).where(and(eq(inventoryBalances.productId, item.productId), eq(inventoryBalances.tenantId, ctx.user.tenantId!), eq(inventoryBalances.warehouseId, input.fromWarehouseId)));
        if (fromRows.length) {
          const newFrom = Math.max(0, Number(fromRows[0].quantity || 0) - item.quantity);
          await db.update(inventoryBalances).set({ quantity: newFrom }).where(eq(inventoryBalances.id, fromRows[0].id));
        }
        // increment to destination warehouse
        const toRows = await db.select().from(inventoryBalances).where(and(eq(inventoryBalances.productId, item.productId), eq(inventoryBalances.tenantId, ctx.user.tenantId!), eq(inventoryBalances.warehouseId, input.toWarehouseId)));
        if (toRows.length) {
          const newTo = Number(toRows[0].quantity || 0) + item.quantity;
          await db.update(inventoryBalances).set({ quantity: newTo }).where(eq(inventoryBalances.id, toRows[0].id));
        } else {
          await db.insert(inventoryBalances).values({ tenantId: ctx.user.tenantId!, productId: item.productId, warehouseId: input.toWarehouseId, quantity: item.quantity });
        }
      }
      return { id, success: true };
    }),

  // Stock Adjustments
  adjustmentList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(stockAdjustments).where(eq(stockAdjustments.tenantId, ctx.user.tenantId!));
    }),

  adjustmentCreate: authedQuery
    .input(z.object({
      adjustmentDate: z.string(),
      adjustmentType: z.string(),
      reason: z.string().optional(),
      warehouseId: z.number(),
      items: z.array(z.object({
        productId: z.number(),
        productName: z.string().optional(),
        quantity: z.number(),
        unitCost: z.string().optional(),
        notes: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const num = `ADJ-${Date.now()}`;
      let totalValue = 0;
      const typeMap: Record<string,string> = { addition:"other", subtraction:"other", damage:"damage", expiry:"expiry", audit:"count", theft:"theft", other:"other", count:"count" };
      const [{ id }] = await db.insert(stockAdjustments).values({
        tenantId, adjustmentNumber: num, warehouseId: input.warehouseId,
        date: input.adjustmentDate, adjustmentType: (typeMap[input.adjustmentType] || "other") as any,
        totalValue: "0", notes: input.reason, createdBy: ctx.user.id,
      }).$returningId();
      for (const item of input.items) {
        const balRows = await db.select().from(inventoryBalances).where(and(eq(inventoryBalances.productId, item.productId), eq(inventoryBalances.tenantId, tenantId), eq(inventoryBalances.warehouseId, input.warehouseId)));
        const currentQty = balRows.length ? Number(balRows[0].quantity || 0) : 0;
        const adjustedQty = item.quantity;
        const difference = adjustedQty - currentQty;
        totalValue += Math.abs(difference) * Number(item.unitCost || 0);
        await db.insert(stockAdjustmentItems).values({ adjustmentId: id, productId: item.productId, currentQty, adjustedQty, difference, unitCost: item.unitCost, reason: item.notes });
        const newQty = Math.max(0, adjustedQty);
        if (balRows.length) {
          await db.update(inventoryBalances).set({ quantity: newQty }).where(eq(inventoryBalances.id, balRows[0].id));
        } else {
          await db.insert(inventoryBalances).values({ tenantId, productId: item.productId, warehouseId: input.warehouseId, quantity: newQty });
        }
        await db.insert(inventoryMovements).values({ tenantId, productId: item.productId, warehouseId: input.warehouseId, movementType: "adjustment", quantity: difference, reference: "adjustment", referenceId: id, createdBy: ctx.user.id });
      }
      await db.update(stockAdjustments).set({ totalValue: totalValue.toFixed(4) }).where(eq(stockAdjustments.id, id));
      return { id, success: true };
    }),
});
