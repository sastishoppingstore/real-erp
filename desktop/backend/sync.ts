import { getDb, now } from "./sqlite";
import { remoteCall, remoteUserId, remoteSessionActive } from "./remote";
import { randomUUID } from "node:crypto";
import os from "node:os";
import type { DatabaseSync } from "node:sqlite";

export interface SyncState {
  online: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  queued: number;
  synced: number;
  failed: number;
  conflicts: number;
  lastPushAt: string | null;
}

let state: SyncState = {
  online: false,
  lastSyncAt: null,
  lastError: null,
  queued: 0,
  synced: 0,
  failed: 0,
  conflicts: 0,
  lastPushAt: null,
};

export function getSyncState(): SyncState {
  const d = getDb();
  const meta = (key: string) => {
    const r = d.prepare("SELECT value FROM sync_meta WHERE key = ?").get(key) as { value: string } | undefined;
    return r?.value ?? null;
  };
  const q = d.prepare("SELECT status, COUNT(*) AS c FROM sync_queue GROUP BY status").all() as {
    status: string;
    c: number;
  }[];
  const counts: Record<string, number> = {};
  for (const row of q) counts[row.status] = row.c;
  const c = d.prepare("SELECT COUNT(*) AS c FROM sync_conflicts WHERE resolved = 0").get() as { c: number };
  return {
    online: state.online,
    lastSyncAt: meta("last_sync_at"),
    lastError: meta("engine_error"),
    queued: counts.pending || 0,
    synced: counts.synced || 0,
    failed: counts.failed || 0,
    conflicts: c.c,
    lastPushAt: meta("last_push_at"),
  };
}

let running = false;

export async function syncOnce(force = false): Promise<void> {
  if (running) return;
  running = true;
  const d = getDb();
  try {
    if (!remoteSessionActive() && !force) return;
    try {
      await remoteCall("auth.me", {});
      state.online = true;
    } catch {
      state.online = false;
      d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('engine_error', ?)").run(
        "Remote unreachable or session expired — sync paused"
      );
      return;
    }
    d.prepare("DELETE FROM sync_meta WHERE key = 'engine_error'").run();
    await ensureDeviceRegistered(d);
    await pushPending(d);
    await pullChanges(d);
    state.lastSyncAt = now();
    d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync_at', ?)").run(state.lastSyncAt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    state.lastError = msg;
    d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('engine_error', ?)").run(msg);
    state.online = false;
  } finally {
    running = false;
  }
}

function ensureDeviceRegistered(d: DatabaseSync) {
  const deviceId = (d.prepare("SELECT value FROM sync_meta WHERE key = 'device_id'").get() as { value: string }).value;
  const existing = d.prepare("SELECT device_id FROM devices WHERE device_id = ?").get(deviceId);
  if (!existing) {
    const deviceName = process.env.COMPUTERNAME || os.hostname() || "Desktop";
    remoteCall("sync.registerDevice", { deviceId, deviceName, platform: process.platform, appVersion: "1.0.0" }, { method: "POST" }).then(() => {
      d.prepare("INSERT OR REPLACE INTO devices (device_id, device_name, platform, tenant_id, app_version, last_seen) VALUES (?,?,?,?,?,?)").run(
        deviceId, deviceName, process.platform, 1, "1.0.0", now()
      );
    });
  }
}

const ENTITY_TABLE: Record<string, string> = {
  products: "products",
  customers: "customers",
  invoices: "invoices",
  invoiceItems: "invoice_items",
  suppliers: null as unknown as string,
  purchases: null as unknown as string,
  payments: null as unknown as string,
  tasks: null as unknown as string,
  meetings: null as unknown as string,
};

async function pushPending(d: DatabaseSync) {
  const items = d
    .prepare("SELECT * FROM sync_queue WHERE status IN ('pending','failed') AND attempts < 8 ORDER BY id ASC LIMIT 50")
    .all() as Record<string, unknown>[];

  for (const item of items) {
    const id = item.id as number;
    const entityType = item.entity_type as string;
    const action = item.action as string;
    let payload = item.payload_json ? JSON.parse(item.payload_json as string) : {};

    if (entityType === "sales" && action === "create") {
      const remapped = remapSalePayload(d, payload);
      if (!remapped.ok) {
        d.prepare("UPDATE sync_queue SET attempts = attempts + 1, error = ?, updated_at = ? WHERE id = ?").run(
          remapped.error, now(), id
        );
        continue;
      }
      payload = remapped.payload;
    }

    d.prepare("UPDATE sync_queue SET status = 'syncing', updated_at = ? WHERE id = ?").run(now(), id);
    try {
      const sendPayload = { ...payload } as Record<string, unknown>;
      if (entityType === "invoices") {
        delete sendPayload.__items;
      }
      const res = (await remoteCall("sync.push", {
        changes: [
          {
            entityType,
            entityId: item.local_uuid as string,
            action,
            payload: sendPayload,
            deviceId: (d.prepare("SELECT value FROM sync_meta WHERE key = 'device_id'").get() as { value: string }).value,
            localUuid: item.local_uuid as string,
          },
        ],
      }, { method: "POST" })) as {
        results: Array<{ entityId: string; localUuid: string; serverId?: number; status: string; error?: string; serverVersion?: unknown }>;
        conflicts?: Array<unknown>;
        serverTime?: string;
      };

      const result = res.results?.[0];
      if (!result) {
        d.prepare("UPDATE sync_queue SET status = 'failed', error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?").run(
          "No result from server", now(), id
        );
        continue;
      }
      if (result.status === "conflict") {
        d.prepare(
          `INSERT INTO sync_conflicts (queue_id, entity_type, entity_id, local_uuid, local_version, server_version, local_payload_json, server_payload_json)
           VALUES (?,?,?,?,?,?,?,?)`
        ).run(
          id, entityType, item.local_uuid, item.local_uuid,
          payload.version ?? 1,
          JSON.stringify(result.serverVersion ?? null),
          JSON.stringify(payload),
          JSON.stringify(result.serverVersion ?? null)
        );
        d.prepare("UPDATE sync_queue SET status = 'conflict', updated_at = ? WHERE id = ?").run(now(), id);
        continue;
      }
      if (result.status === "synced") {
        const serverId = result.serverId ?? null;
        if (serverId != null) {
          applyServerId(d, entityType, item.local_uuid as string, serverId);
        }
        if (entityType === "invoices" && action === "create") {
          scheduleZatcaForInvoice(d, serverId, item.local_uuid as string);
          enqueueInvoiceItems(d, payload, serverId);
        }
        if (entityType === "invoices" && action === "update") {
          enqueueInvoiceItems(d, payload, serverId ?? existingServerId(d, item.local_uuid as string));
        }
        d.prepare("UPDATE sync_queue SET status = 'synced', server_id = ?, error = NULL, updated_at = ? WHERE id = ?").run(
          serverId, now(), id
        );
        d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_push_at', ?)").run(now());
        continue;
      }
      d.prepare("UPDATE sync_queue SET status = 'failed', error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?").run(
        result.error || "Push failed", now(), id
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      d.prepare("UPDATE sync_queue SET status = 'pending', error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?").run(
        msg, now(), id
      );
    }
  }
}

function remapSalePayload(d: DatabaseSync, payload: Record<string, unknown>): { ok: true; payload: Record<string, unknown> } | { ok: false; error: string } {
  const items = (payload.items ?? []) as Array<{ productId?: number; sku?: string }>;
  const out = { ...payload, items: [] as unknown[] };
  for (const it of items) {
    if (it.productId == null) {
      out.items.push(it);
      continue;
    }
    const prod = d.prepare("SELECT server_id FROM products WHERE id = ?").get(it.productId) as { server_id: number | null } | undefined;
    if (!prod?.server_id) {
      return { ok: false, error: `Product #${it.productId} not yet synced to server` };
    }
    out.items.push({ ...it, productId: prod.server_id });
  }
  return { ok: true, payload: out };
}

function applyServerId(d: DatabaseSync, entityType: string, localUuid: string, serverId: number) {
  const table = entityType === "invoiceItems" ? "invoice_items" : entityType === "customers" ? "customers" : entityType === "products" ? "products" : entityType === "invoices" ? "invoices" : null;
  if (!table) return;
  d.prepare(`UPDATE ${table} SET server_id = ?, updated_at = ? WHERE local_uuid = ?`).run(serverId, now(), localUuid);
}

function existingServerId(d: DatabaseSync, localUuid: string): number | null {
  const r = d.prepare("SELECT server_id FROM invoices WHERE local_uuid = ?").get(localUuid) as { server_id: number | null } | undefined;
  return r?.server_id ?? null;
}

function enqueueInvoiceItems(d: DatabaseSync, payload: Record<string, unknown>, invoiceServerId: number | null) {
  const items = (payload.__items ?? []) as Array<Record<string, unknown>>;
  if (items.length === 0 || !invoiceServerId) return;
  for (const it of items) {
    let productId: number | null = null;
    if (it.productId != null) {
      const prod = d.prepare("SELECT server_id FROM products WHERE id = ?").get(it.productId) as { server_id: number | null } | undefined;
      productId = prod?.server_id ?? null;
    }
    const luuid = `${payload.__invoiceLocalUuid ?? "inv"}-${randomUUID()}`;
    const itemPayload = {
      invoiceId: invoiceServerId,
      productId,
      description: it.description ?? null,
      quantity: Number(it.quantity ?? 0),
      unitPrice: String(it.unitPrice ?? 0),
      discountPercent: String(it.discountPercent ?? 0),
      taxPercent: String(it.taxPercent ?? 0),
      totalAmount: String(it.totalAmount ?? 0),
      version: 1,
    };
    d.prepare("INSERT INTO sync_queue (entity_type, entity_id, local_uuid, server_id, action, payload_json, status, created_at, updated_at) VALUES ('invoiceItems',?,?,?,?,?,?,?,?)").run(
      luuid, luuid, invoiceServerId, "create", JSON.stringify(itemPayload), "pending", now(), now()
    );
  }
}

function scheduleZatcaForInvoice(d: DatabaseSync, serverId: number | null, localUuid: string) {
  if (!serverId) return;
  const inv = d.prepare("SELECT zatca_status FROM invoices WHERE local_uuid = ?").get(localUuid) as { zatca_status: string | null } | undefined;
  if (!inv || !["pending_local", "pending", "draft"].includes(inv.zatca_status ?? "draft")) return;
  const cs = d.prepare("SELECT country, tax_number, company_name FROM company_settings WHERE id = 1").get() as { country: string; tax_number: string; company_name: string | null };
  if (!cs || !/^3\d{13}3$/.test(cs.tax_number || "")) return;
  d.prepare("INSERT INTO sync_queue (entity_type, entity_id, local_uuid, server_id, action, payload_json, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)").run(
    "zatca", String(localUuid), localUuid, serverId, "clearance", JSON.stringify({ invoiceId: serverId, localUuid }), "pending", now(), now()
  );
}

async function pullChanges(d: DatabaseSync) {
  const since = (d.prepare("SELECT value FROM sync_meta WHERE key = 'last_pull_at'").get() as { value: string | null } | undefined)?.value ?? null;
  const res = (await remoteCall("sync.pull", { since, entityTypes: ["products", "customers", "invoices", "invoiceItems"] }, { method: "POST" })) as {
    data: Record<string, unknown[]>;
    tombstones: Array<{ entityType: string; entityId: string; localUuid?: string; deletedAt?: string }>;
    serverTime?: string;
  };

  const data = res.data || {};
  for (const row of data.products || []) applyPulledRow(d, "products", row as Record<string, unknown>);
  for (const row of data.customers || []) applyPulledRow(d, "customers", row as Record<string, unknown>);
  const invoiceIdMap = new Map<number, number>();
  for (const row of data.invoices || []) {
    const mapped = applyPulledRow(d, "invoices", row as Record<string, unknown>) as number | null;
    if (mapped != null) {
      const serverId = (row as Record<string, unknown>).id as number;
      invoiceIdMap.set(serverId, mapped);
    }
  }
  for (const row of data.invoiceItems || []) {
    const r = row as Record<string, unknown>;
    const mappedInvoiceId = invoiceIdMap.get(r.invoiceId as number);
    applyPulledItem(d, r, mappedInvoiceId);
  }
  for (const row of data.sales || []) applyPulledSale(d, row as Record<string, unknown>);
  for (const t of res.tombstones || []) {
    if (t.entityType === "products") applyTombstone(d, "products", t);
    if (t.entityType === "customers") applyTombstone(d, "customers", t);
    if (t.entityType === "invoices") applyTombstone(d, "invoices", t);
  }
  if (res.serverTime) {
    d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_pull_at', ?)").run(res.serverTime);
  }
}

function versionOf(row: Record<string, unknown>): number {
  return Number(row.version ?? row.updatedAtVersion ?? 1);
}

function applyPulledRow(d: DatabaseSync, entityType: string, row: Record<string, unknown>): number | null {
  const table = entityType === "invoiceItems" ? "invoice_items" : entityType;
  const luuid = (row.local_uuid as string) || String(row.id);
  const existing = d.prepare(`SELECT id, version FROM ${table} WHERE local_uuid = ?`).get(luuid) as { id: number; version: number } | undefined;

  const serverVersion = versionOf(row);
  const cols = columnsFor(table);
  const values: Record<string, unknown> = {};
  for (const c of cols) {
    if (c === "local_uuid") values[c] = luuid;
    else if (c === "server_id") values[c] = row.id ?? null;
    else if (c === "version") values[c] = serverVersion;
    else if (c === "updated_at") values[c] = new Date().toISOString();
    else if (row[c] !== undefined) values[c] = row[c];
  }
  if (existing) {
    if (serverVersion < existing.version) return existing.id;
    if (serverVersion === existing.version && existing.version === 1) {
      // ambiguous first-version collision — prefer server row only when local was never touched after pull marker
    }
    if (serverVersion === existing.version && existing.version > 1) {
      // same version both sides: server row is authoritative unless local queue has pending update for it
      const pending = d.prepare("SELECT COUNT(*) AS c FROM sync_queue WHERE local_uuid = ? AND status IN ('pending','syncing','failed')").get(luuid) as { c: number };
      if (pending.c > 0) return existing.id;
    }
    if (serverVersion <= existing.version && !(serverVersion === existing.version && existing.version === 1)) {
      return existing.id;
    }
    // conflict: server has newer
    if (serverVersion > existing.version && existing.version > 1) {
      d.prepare(
        `INSERT INTO sync_conflicts (entity_type, entity_id, local_uuid, local_version, server_version, local_payload_json, server_payload_json)
         VALUES (?,?,?,?,?,?,?)`
      ).run(entityType, luuid, luuid, existing.version, serverVersion, JSON.stringify({}), JSON.stringify(row));
      return existing.id;
    }
  }
  const setSql = valuesToSql(values);
  if (existing) {
    d.prepare(`UPDATE ${table} SET ${setSql} WHERE local_uuid = ?`).run(...Object.values(values), luuid);
    return existing.id;
  }
  const keys = Object.keys(values);
  const placeholders = keys.map((k) => `@${k}`).join(", ");
  d.prepare(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`).run(values);
  const inserted = d.prepare("SELECT id FROM ${table} WHERE local_uuid = ?").get(luuid) as { id: number };
  return inserted.id;
}

function valuesToSql(values: Record<string, unknown>): string {
  return Object.keys(values)
    .map((k) => `${k} = @${k}`)
    .join(", ");
}

function applyPulledItem(d: DatabaseSync, row: Record<string, unknown>, mappedInvoiceId: number | null) {
  const luuid = (row.local_uuid as string) || String(row.id);
  const existing = d.prepare("SELECT id FROM invoice_items WHERE local_uuid = ?").get(luuid) as { id: number } | undefined;
  const values: Record<string, unknown> = {};
  for (const c of ["product_id", "description", "quantity", "unit_price", "discount_percent", "tax_percent", "total_amount", "version"]) {
    if (row[c] !== undefined) values[c] = row[c];
  }
  values.local_uuid = luuid;
  values.server_id = row.id ?? null;
  if (mappedInvoiceId != null) values.invoice_id = mappedInvoiceId;
  if (existing) {
    d.prepare(`UPDATE invoice_items SET ${valuesToSql(values)} WHERE local_uuid = ?`).run(...Object.values(values), luuid);
  } else if (mappedInvoiceId != null) {
    values.invoice_id = mappedInvoiceId;
    const keys = Object.keys(values);
    d.prepare(`INSERT INTO invoice_items (${keys.join(", ")}) VALUES (${keys.map((k) => `@${k}`).join(", ")})`).run(values);
  }
}

function applyPulledSale(d: DatabaseSync, row: Record<string, unknown>) {
  const luuid = (row.local_uuid as string) || String(row.id);
  const existing = d.prepare("SELECT id FROM invoices WHERE local_uuid = ?").get(luuid) as { id: number } | undefined;
  if (existing) {
    d.prepare("UPDATE invoices SET server_id = ?, paid_amount = ?, balance_due = ?, zatca_status = ?, updated_at = ? WHERE id = ?").run(
      row.id ?? null,
      row.paidAmount ?? row.totalAmount ?? "0",
      row.balanceDue ?? "0",
      row.zatcaStatus ?? "pending",
      now(),
      existing.id
    );
    return;
  }
  const items = (row.items as Array<Record<string, unknown>>) || [];
  d.prepare(
    "INSERT INTO invoices (tenant_id, invoice_number, invoice_type, customer_id, date, sub_total, tax_amount, discount_amount, total_amount, paid_amount, balance_due, status, zatca_status, local_uuid, server_id, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).run(
    row.invoiceNumber || `SYNC-${Date.now()}`,
    "simplified",
    null,
    row.date || new Date().toISOString().slice(0, 10),
    row.subtotal ?? "0",
    row.taxAmount ?? "0",
    row.discountAmount ?? "0",
    row.totalAmount ?? "0",
    row.paidAmount ?? row.totalAmount ?? "0",
    "0",
    "paid",
    row.zatcaStatus ?? "pending",
    luuid,
    row.id ?? null,
    now(),
    now()
  );
  const invId = (d.prepare("SELECT id FROM invoices WHERE local_uuid = ?").get(luuid) as { id: number }).id;
  for (const it of items) {
    d.prepare(
      "INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, total_amount, local_uuid, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,?,?)"
    ).run(invId, it.productId ?? null, it.description ?? "POS Sale", String(it.quantity ?? 0), String(it.unitPrice ?? 0), String(it.totalAmount ?? 0), `${luuid}-${Math.random().toString(36).slice(2, 8)}`, now(), now());
  }
}

function applyTombstone(d: DatabaseSync, table: string, t: { entityId?: string; localUuid?: string }) {
  const luuid = t.localUuid || t.entityId;
  if (!luuid) return;
  d.prepare(`UPDATE ${table} SET deleted_at = ?, updated_at = ? WHERE local_uuid = ?`).run(now(), now(), luuid);
}

const TABLE_COLUMNS: Record<string, string[]> = {
  products: ["tenant_id", "sku", "name", "name_ar", "description", "category_id", "brand_id", "unit_id", "barcode", "qr_code", "product_type", "purchase_price", "sale_price", "cost_method", "reorder_level", "reorder_quantity", "is_active", "is_taxable", "tax_rate", "weight", "dimensions", "image"],
  customers: ["tenant_id", "code", "name", "name_ar", "email", "phone", "mobile", "address", "city", "country", "tax_number", "credit_limit", "current_balance", "payment_terms", "customer_group", "customer_type"],
  invoices: ["tenant_id", "invoice_number", "invoice_type", "customer_id", "order_id", "date", "due_date", "sub_total", "discount_amount", "tax_amount", "tax_percent", "shipping_amount", "total_amount", "paid_amount", "balance_due", "zatca_qr_code", "zatca_xml", "zatca_status", "notes", "terms", "status", "created_by"],
};

function columnsFor(table: string): string[] {
  return [...(TABLE_COLUMNS[table] || []), "local_uuid", "server_id", "version", "updated_at"];
}

export function enqueue(d: DatabaseSync, entityType: string, entityId: string, localUuid: string, action: string, payload: Record<string, unknown>) {
  d.prepare("INSERT INTO sync_queue (entity_type, entity_id, local_uuid, action, payload_json, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)").run(
    entityType, entityId, localUuid, action, JSON.stringify(payload), "pending", now(), now()
  );
}

export function startSyncEngine() {
  syncOnce(true).catch(() => {});
  setInterval(() => {
    syncOnce().catch(() => {});
  }, 30_000);
}

export type { DatabaseSync };
