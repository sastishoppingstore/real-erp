import { z } from "zod";
import { createRouter, authedQuery, superAdminQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";
import { pluginRegistry } from "./lib/plugins/pluginRegistry";
import { getHookDescriptions, registerPluginHook } from "./lib/plugins/hooks";

const PLUGIN_INSTALL_TABLE = "plugin_installations";

export const pluginRouter = createRouter({
  // ── Marketplace (plugin store) ──
  getStore: authedQuery.query(async () => {
    return pluginRegistry.getStore();
  }),
  getStoreItem: authedQuery.input(z.object({ name: z.string() })).query(async ({ input }) => {
    return pluginRegistry.getFromStore(input.name);
  }),

  // ── Installation ──
  install: adminQuery.input(z.object({ name: z.string() })).mutation(async ({ input, ctx }) => {
    const manifest = pluginRegistry.getFromStore(input.name);
    if (!manifest) throw new Error(`Plugin '${input.name}' not found in store`);
    const db = getDb();
    const existing = (await db.execute(
      sql`SELECT id FROM ${sql.raw(PLUGIN_INSTALL_TABLE)} WHERE tenant_id = ${ctx.user.tenantId!} AND plugin_name = ${input.name} LIMIT 1`,
    ) as any);
    const existingRows = Array.isArray(existing?.[0]) ? existing[0] : existing;
    if (existingRows.length > 0) throw new Error("Plugin already installed");

    await db.execute(
      sql`INSERT INTO ${sql.raw(PLUGIN_INSTALL_TABLE)} (tenant_id, plugin_name, version, manifest, is_enabled, config, installed_at)
       VALUES (${ctx.user.tenantId!}, ${input.name}, ${manifest.version}, ${JSON.stringify(manifest)}, 1, '{}', NOW())`,
    );

    pluginRegistry.register(manifest);
    for (const hook of manifest.hooks) {
      registerPluginHook(input.name, hook as any, async (context: any) => {
        return { plugin: input.name, handled: true, context };
      }, 100);
    }

    return { success: true, name: input.name };
  }),
  uninstall: adminQuery.input(z.object({ name: z.string() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.execute(
      sql`DELETE FROM ${sql.raw(PLUGIN_INSTALL_TABLE)} WHERE tenant_id = ${ctx.user.tenantId!} AND plugin_name = ${input.name}`,
    );
    pluginRegistry.unregister(input.name);
    return { success: true };
  }),
  toggle: adminQuery.input(z.object({ name: z.string(), isEnabled: z.boolean() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.execute(
      sql`UPDATE ${sql.raw(PLUGIN_INSTALL_TABLE)} SET is_enabled = ${input.isEnabled ? 1 : 0} WHERE tenant_id = ${ctx.user.tenantId!} AND plugin_name = ${input.name}`,
    );
    if (input.isEnabled) {
      const manifest = pluginRegistry.getFromStore(input.name);
      if (manifest) pluginRegistry.register(manifest);
    } else {
      pluginRegistry.unregister(input.name);
    }
    return { success: true };
  }),
  listInstalled: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db.execute(
      sql`SELECT * FROM ${sql.raw(PLUGIN_INSTALL_TABLE)} WHERE tenant_id = ${ctx.user.tenantId!} ORDER BY installed_at DESC`,
    ) as any;
    const rows = Array.isArray(result?.[0]) ? result[0] : (Array.isArray(result) ? result : []);
    return rows.map((r: any) => ({
      id: r.id, tenantId: r.tenant_id, pluginName: r.plugin_name,
      version: r.version,
      manifest: typeof r.manifest === "string" ? JSON.parse(r.manifest) : r.manifest,
      isEnabled: !!r.is_enabled,
      config: typeof r.config === "string" ? JSON.parse(r.config || "{}") : (r.config || {}),
      installedAt: r.installed_at,
    }));
  }),
  updateConfig: adminQuery
    .input(z.object({ name: z.string(), config: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.execute(
        sql`UPDATE ${sql.raw(PLUGIN_INSTALL_TABLE)} SET config = ${JSON.stringify(input.config)} WHERE tenant_id = ${ctx.user.tenantId!} AND plugin_name = ${input.name}`,
      );
      return { success: true };
    }),

  // ── Hooks ──
  getHookDefinitions: authedQuery.query(() => getHookDescriptions()),
  getHookLogs: adminQuery.input(z.object({ pluginName: z.string().optional(), limit: z.number().default(50) })).query(async ({ input, ctx }) => {
    const db = getDb();
    const result = await db.execute(
      sql`SELECT * FROM plugin_hook_logs WHERE tenant_id = ${ctx.user.tenantId!} ${input.pluginName ? sql`AND plugin_name = ${input.pluginName}` : sql``} ORDER BY created_at DESC LIMIT ${input.limit}`,
    ) as any;
    return Array.isArray(result?.[0]) ? result[0] : (Array.isArray(result) ? result : []);
    ;
  }),
});
