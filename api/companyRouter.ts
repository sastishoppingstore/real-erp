import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { companySettings } from "@db/schema";
import { eq } from "drizzle-orm";
import { cleanInput } from "./cleanInput";

const settingsSchema = z.object({
  nameEn: z.string().max(255).optional(),
  nameAr: z.string().max(255).optional(),
  vatNo: z.string().max(100).optional(),
  crNo: z.string().max(100).optional(),
  address: z.string().max(2000).optional(),
  email: z.string().max(320).optional(),
  phone: z.string().max(50).optional(),
  logoUrl: z.string().max(300000).optional(),
  stampUrl: z.string().max(300000).optional(),
  unifiedNationalNo: z.string().max(60).optional(),
});

// UI keys -> drizzle columns (original companySettings schema)
const MAP = {
  nameEn: "companyName",
  nameAr: "companyNameAr",
  vatNo: "taxNumber",
  crNo: "crNumber",
  address: "address",
  email: "email",
  phone: "phone",
  logoUrl: "logo",
  stampUrl: "stampUrl",
  unifiedNationalNo: "unifiedNationalNo",
} as const;

export const companyRouter = {
  getSettings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(companySettings)
      .where(eq(companySettings.tenantId, ctx.user.tenantId!)).limit(1);
    if (!rows[0]) return null;
    const r: any = rows[0];
    const inv: Record<string, any> = {};
    for (const [ui, col] of Object.entries(MAP)) inv[ui] = r[col as string] ?? null;
    return inv;
  }),

  saveSettings: authedQuery.input(settingsSchema).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const data: Record<string, any> = cleanInput(
      Object.fromEntries(Object.entries(input).map(([k, v]) => [(MAP as any)[k] ?? k, v])),
    );
    const existing = await db.select({ id: companySettings.id }).from(companySettings)
      .where(eq(companySettings.tenantId, ctx.user.tenantId!)).limit(1);
    if (existing.length > 0) {
      await db.update(companySettings).set(data).where(eq(companySettings.id, existing[0].id));
      return { ok: true, id: existing[0].id };
    }
    const [row] = await db.insert(companySettings).values({
      tenantId: ctx.user.tenantId!, ...data,
    } as any).$returningId();
    return { ok: true, id: row.id };
  }),
};
