import { createRequire } from 'module';const require = createRequire(import.meta.url);

// desktop/backend/server.ts
import { createServer } from "node:http";
import { readFileSync, existsSync, createReadStream, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";

// desktop/backend/sqlite.ts
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
var db = null;
function getDb() {
  if (!db) throw new Error("Database not initialized");
  return db;
}
function initDb(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });
  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  seedDefaults(db);
  return db;
}
var SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  union_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'super_admin',
  phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  password_hash TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  name_ar TEXT,
  parent_id INTEGER,
  description TEXT,
  image TEXT,
  local_uuid TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  server_id INTEGER,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  sku TEXT,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  category_id INTEGER,
  brand_id INTEGER,
  unit_id INTEGER,
  barcode TEXT,
  qr_code TEXT,
  product_type TEXT DEFAULT 'goods',
  purchase_price TEXT DEFAULT '0',
  sale_price TEXT DEFAULT '0',
  cost_method TEXT DEFAULT 'fifo',
  reorder_level INTEGER,
  reorder_quantity INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_taxable INTEGER NOT NULL DEFAULT 1,
  tax_rate TEXT DEFAULT '0',
  weight TEXT,
  dimensions TEXT,
  image TEXT,
  local_uuid TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  server_id INTEGER,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_luuid ON products(local_uuid);

CREATE TABLE IF NOT EXISTS warehouses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  code TEXT,
  name TEXT NOT NULL,
  address TEXT,
  manager_name TEXT,
  phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_primary INTEGER NOT NULL DEFAULT 0,
  local_uuid TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  server_id INTEGER,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  product_id INTEGER NOT NULL,
  warehouse_id INTEGER NOT NULL,
  quantity REAL NOT NULL DEFAULT 0,
  reserved_quantity REAL NOT NULL DEFAULT 0,
  avg_cost TEXT DEFAULT '0',
  total_value TEXT DEFAULT '0'
);
CREATE INDEX IF NOT EXISTS idx_balances_product ON inventory_balances(product_id);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  code TEXT,
  name TEXT NOT NULL,
  name_ar TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  tax_number TEXT,
  credit_limit TEXT DEFAULT '0',
  current_balance TEXT DEFAULT '0',
  payment_terms INTEGER,
  customer_group TEXT,
  customer_type TEXT DEFAULT 'b2b',
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  local_uuid TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  server_id INTEGER,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_luuid ON customers(local_uuid);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT DEFAULT 'standard',
  customer_id INTEGER,
  order_id INTEGER,
  date TEXT,
  due_date TEXT,
  sub_total TEXT DEFAULT '0',
  discount_amount TEXT DEFAULT '0',
  tax_amount TEXT DEFAULT '0',
  tax_percent TEXT DEFAULT '0',
  shipping_amount TEXT DEFAULT '0',
  total_amount TEXT DEFAULT '0',
  paid_amount TEXT DEFAULT '0',
  balance_due TEXT DEFAULT '0',
  zatca_qr_code TEXT,
  zatca_xml TEXT,
  zatca_status TEXT,
  notes TEXT,
  terms TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by INTEGER,
  local_uuid TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  server_id INTEGER,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_luuid ON invoices(local_uuid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number_tenant ON invoices(tenant_id, invoice_number);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  invoice_id INTEGER NOT NULL,
  product_id INTEGER,
  description TEXT,
  quantity TEXT DEFAULT '0',
  unit_price TEXT DEFAULT '0',
  discount_percent TEXT DEFAULT '0',
  tax_percent TEXT DEFAULT '0',
  total_amount TEXT DEFAULT '0',
  local_uuid TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  server_id INTEGER,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_items_luuid ON invoice_items(local_uuid);

CREATE TABLE IF NOT EXISTS cashbox_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  transaction_number TEXT,
  type TEXT,
  amount TEXT,
  balance_before TEXT,
  balance_after TEXT,
  status TEXT DEFAULT 'completed',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pos_holds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  user_id INTEGER,
  hold_number TEXT,
  customer_id INTEGER,
  items TEXT,
  subtotal TEXT,
  tax_amount TEXT,
  discount_amount TEXT,
  total_amount TEXT,
  notes TEXT,
  status TEXT DEFAULT 'held',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS company_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  company_name TEXT,
  company_name_ar TEXT,
  trade_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  zip_code TEXT,
  tax_number TEXT,
  cr_number TEXT,
  vat_rate TEXT DEFAULT '15',
  default_currency TEXT DEFAULT 'SAR',
  invoice_prefix TEXT,
  invoice_terms TEXT,
  theme TEXT,
  primary_color TEXT,
  logo TEXT,
  favicon TEXT,
  zatca_enabled INTEGER NOT NULL DEFAULT 0,
  zatca_sandbox INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL UNIQUE,
  device_name TEXT,
  platform TEXT,
  user_id INTEGER,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  app_version TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_seen TEXT,
  last_sync_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  local_uuid TEXT,
  server_id INTEGER,
  action TEXT NOT NULL,
  payload_json TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_queue_status ON sync_queue(status);

CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_id INTEGER,
  entity_type TEXT,
  entity_id TEXT,
  local_uuid TEXT,
  local_version INTEGER,
  server_version INTEGER,
  local_payload_json TEXT,
  server_payload_json TEXT,
  resolved INTEGER NOT NULL DEFAULT 0,
  resolution TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  product_id INTEGER NOT NULL,
  warehouse_id INTEGER,
  qty_change REAL NOT NULL,
  reason TEXT,
  ref_type TEXT,
  ref_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
function seedDefaults(d) {
  const count = d.prepare("SELECT COUNT(*) AS c FROM company_settings").get();
  if (count.c === 0) {
    d.prepare(
      `INSERT INTO company_settings (tenant_id, company_name, company_name_ar, country, tax_number, vat_rate, default_currency)
       VALUES (1, 'YASCO ERP', '\u064A\u0627\u0633\u0643\u0648', 'Saudi Arabia', '', '15', 'SAR')`
    ).run();
  }
  const metaCount = d.prepare("SELECT COUNT(*) AS c FROM sync_meta").get();
  if (metaCount.c === 0) {
    d.prepare("INSERT INTO sync_meta (key, value) VALUES ('device_id', ?)").run(randomUUID());
  }
}
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}

// desktop/backend/superjson.ts
function serialize(value) {
  const values = {};
  const json = walk(value, [], values);
  return { json, meta: { values, v: 1 } };
}
function walk(value, path, values) {
  if (value instanceof Date) {
    values[path.join(".")] = ["Date"];
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => walk(v, [...path, String(i)], values));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = walk(v, [...path, k], values);
    }
    return out;
  }
  return value;
}
function deserialize(json, values) {
  if (!values) return json;
  return dewalk(json, [], values);
}
function dewalk(value, path, values) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const key = path.join(".");
    if (values[key]?.includes("Date") && typeof value === "string") {
      return new Date(value);
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = dewalk(v, [...path, k], values);
    }
    return out;
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => dewalk(v, [...path, String(i)], values));
  }
  return value;
}

// desktop/backend/remote.ts
var REMOTE_URL = process.env.ERP_REMOTE_URL || "https://www.yasco.tech";
var cookieJarCache = null;
function loadCookies() {
  if (cookieJarCache) return cookieJarCache;
  try {
    const row = getDb().prepare("SELECT value FROM sync_meta WHERE key = 'remote_cookies'").get();
    cookieJarCache = row?.value ? JSON.parse(row.value) : {};
  } catch {
    cookieJarCache = {};
  }
  return cookieJarCache;
}
function saveCookies(jar) {
  cookieJarCache = jar;
  try {
    getDb().prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('remote_cookies', ?)").run(JSON.stringify(jar));
  } catch {
  }
}
function setRemoteCookies(cookies) {
  const current = loadCookies();
  const next = { ...current, ...cookies };
  saveCookies(next);
}
function remoteSessionActive() {
  const jar = loadCookies();
  return Boolean(jar.erp_sid);
}
function extractCookies(setCookieHeader) {
  const out = {};
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : setCookieHeader ? [setCookieHeader] : [];
  for (const h of headers) {
    const m = /^([^=;]+)=([^;]*)/.exec(h);
    if (m) out[m[1].trim()] = m[2];
  }
  return out;
}
function parseBatchResponse(body) {
  const parsed = JSON.parse(body);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((item) => {
    if (item?.error) throw new RemoteError(item.error.json?.message || "Remote error", item.error.json);
    return {
      json: item?.result?.data?.json,
      meta: item?.result?.data?.meta
    };
  });
}
var RemoteError = class extends Error {
  info;
  constructor(message, info) {
    super(message);
    this.info = info;
  }
};
async function remoteCall(procedurePath, input, opts = {}) {
  const method = opts.method || "GET";
  const url = `${REMOTE_URL}/api/trpc/${procedurePath}?batch=1`;
  const jar = loadCookies();
  const headers = {
    accept: "application/json",
    cookie: Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ")
  };
  let body;
  if (method === "POST") {
    headers["content-type"] = "application/json";
    const ser = serialize(input);
    body = JSON.stringify({ "0": ser });
  } else {
    const ser = serialize(input);
    const q = encodeURIComponent(JSON.stringify({ "0": ser }));
    const finalUrl = `${url}&input=${q}`;
    const res2 = await fetch(finalUrl, { method, headers });
    const text2 = await res2.text();
    const results2 = parseBatchResponse(text2);
    return deserialize(results2[0].json, results2[0].meta?.values);
  }
  const res = await fetch(url, { method, headers, body });
  const setCookies = extractCookies(res.headers.get("set-cookie") || void 0);
  if (Object.keys(setCookies).length > 0) {
    setRemoteCookies(setCookies);
  }
  const text = await res.text();
  const results = parseBatchResponse(text);
  return deserialize(results[0].json, results[0].meta?.values);
}
async function remoteLogin(username, password) {
  const result = await remoteCall("auth.passwordLogin", { username, password }, { method: "POST" });
  return { user: result.user };
}

// desktop/backend/sync.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import os from "node:os";
var state = {
  online: false,
  lastSyncAt: null,
  lastError: null,
  queued: 0,
  synced: 0,
  failed: 0,
  conflicts: 0,
  lastPushAt: null
};
var running = false;
async function syncOnce(force = false) {
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
        "Remote unreachable or session expired \u2014 sync paused"
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
function ensureDeviceRegistered(d) {
  const deviceId = d.prepare("SELECT value FROM sync_meta WHERE key = 'device_id'").get().value;
  const existing = d.prepare("SELECT device_id FROM devices WHERE device_id = ?").get(deviceId);
  if (!existing) {
    const deviceName = process.env.COMPUTERNAME || os.hostname() || "Desktop";
    remoteCall("sync.registerDevice", { deviceId, deviceName, platform: process.platform, appVersion: "1.0.0" }, { method: "POST" }).then(() => {
      d.prepare("INSERT OR REPLACE INTO devices (device_id, device_name, platform, tenant_id, app_version, last_seen) VALUES (?,?,?,?,?,?)").run(
        deviceId,
        deviceName,
        process.platform,
        1,
        "1.0.0",
        now()
      );
    });
  }
}
async function pushPending(d) {
  const items = d.prepare("SELECT * FROM sync_queue WHERE status IN ('pending','failed') AND attempts < 8 ORDER BY id ASC LIMIT 50").all();
  for (const item of items) {
    const id = item.id;
    const entityType = item.entity_type;
    const action = item.action;
    let payload = item.payload_json ? JSON.parse(item.payload_json) : {};
    if (entityType === "sales" && action === "create") {
      const remapped = remapSalePayload(d, payload);
      if (!remapped.ok) {
        d.prepare("UPDATE sync_queue SET attempts = attempts + 1, error = ?, updated_at = ? WHERE id = ?").run(
          remapped.error,
          now(),
          id
        );
        continue;
      }
      payload = remapped.payload;
    }
    d.prepare("UPDATE sync_queue SET status = 'syncing', updated_at = ? WHERE id = ?").run(now(), id);
    try {
      const sendPayload = { ...payload };
      if (entityType === "invoices") {
        delete sendPayload.__items;
      }
      const res = await remoteCall("sync.push", {
        changes: [
          {
            entityType,
            entityId: item.local_uuid,
            action,
            payload: sendPayload,
            deviceId: d.prepare("SELECT value FROM sync_meta WHERE key = 'device_id'").get().value,
            localUuid: item.local_uuid
          }
        ]
      }, { method: "POST" });
      const result = res.results?.[0];
      if (!result) {
        d.prepare("UPDATE sync_queue SET status = 'failed', error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?").run(
          "No result from server",
          now(),
          id
        );
        continue;
      }
      if (result.status === "conflict") {
        d.prepare(
          `INSERT INTO sync_conflicts (queue_id, entity_type, entity_id, local_uuid, local_version, server_version, local_payload_json, server_payload_json)
           VALUES (?,?,?,?,?,?,?,?)`
        ).run(
          id,
          entityType,
          item.local_uuid,
          item.local_uuid,
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
          applyServerId(d, entityType, item.local_uuid, serverId);
        }
        if (entityType === "invoices" && action === "create") {
          scheduleZatcaForInvoice(d, serverId, item.local_uuid);
          enqueueInvoiceItems(d, payload, serverId);
        }
        if (entityType === "invoices" && action === "update") {
          enqueueInvoiceItems(d, payload, serverId ?? existingServerId(d, item.local_uuid));
        }
        d.prepare("UPDATE sync_queue SET status = 'synced', server_id = ?, error = NULL, updated_at = ? WHERE id = ?").run(
          serverId,
          now(),
          id
        );
        d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_push_at', ?)").run(now());
        continue;
      }
      d.prepare("UPDATE sync_queue SET status = 'failed', error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?").run(
        result.error || "Push failed",
        now(),
        id
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      d.prepare("UPDATE sync_queue SET status = 'pending', error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?").run(
        msg,
        now(),
        id
      );
    }
  }
}
function remapSalePayload(d, payload) {
  const items = payload.items ?? [];
  const out = { ...payload, items: [] };
  for (const it of items) {
    if (it.productId == null) {
      out.items.push(it);
      continue;
    }
    const prod = d.prepare("SELECT server_id FROM products WHERE id = ?").get(it.productId);
    if (!prod?.server_id) {
      return { ok: false, error: `Product #${it.productId} not yet synced to server` };
    }
    out.items.push({ ...it, productId: prod.server_id });
  }
  return { ok: true, payload: out };
}
function applyServerId(d, entityType, localUuid, serverId) {
  const table = entityType === "invoiceItems" ? "invoice_items" : entityType === "customers" ? "customers" : entityType === "products" ? "products" : entityType === "invoices" ? "invoices" : null;
  if (!table) return;
  d.prepare(`UPDATE ${table} SET server_id = ?, updated_at = ? WHERE local_uuid = ?`).run(serverId, now(), localUuid);
}
function existingServerId(d, localUuid) {
  const r = d.prepare("SELECT server_id FROM invoices WHERE local_uuid = ?").get(localUuid);
  return r?.server_id ?? null;
}
function enqueueInvoiceItems(d, payload, invoiceServerId) {
  const items = payload.__items ?? [];
  if (items.length === 0 || !invoiceServerId) return;
  for (const it of items) {
    let productId = null;
    if (it.productId != null) {
      const prod = d.prepare("SELECT server_id FROM products WHERE id = ?").get(it.productId);
      productId = prod?.server_id ?? null;
    }
    const luuid = `${payload.__invoiceLocalUuid ?? "inv"}-${randomUUID2()}`;
    const itemPayload = {
      invoiceId: invoiceServerId,
      productId,
      description: it.description ?? null,
      quantity: Number(it.quantity ?? 0),
      unitPrice: String(it.unitPrice ?? 0),
      discountPercent: String(it.discountPercent ?? 0),
      taxPercent: String(it.taxPercent ?? 0),
      totalAmount: String(it.totalAmount ?? 0),
      version: 1
    };
    d.prepare("INSERT INTO sync_queue (entity_type, entity_id, local_uuid, server_id, action, payload_json, status, created_at, updated_at) VALUES ('invoiceItems',?,?,?,?,?,?,?,?)").run(
      luuid,
      luuid,
      invoiceServerId,
      "create",
      JSON.stringify(itemPayload),
      "pending",
      now(),
      now()
    );
  }
}
function scheduleZatcaForInvoice(d, serverId, localUuid) {
  if (!serverId) return;
  const inv = d.prepare("SELECT zatca_status FROM invoices WHERE local_uuid = ?").get(localUuid);
  if (!inv || !["pending_local", "pending", "draft"].includes(inv.zatca_status ?? "draft")) return;
  const cs = d.prepare("SELECT country, tax_number, company_name FROM company_settings WHERE id = 1").get();
  if (!cs || !/^3\d{13}3$/.test(cs.tax_number || "")) return;
  d.prepare("INSERT INTO sync_queue (entity_type, entity_id, local_uuid, server_id, action, payload_json, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)").run(
    "zatca",
    String(localUuid),
    localUuid,
    serverId,
    "clearance",
    JSON.stringify({ invoiceId: serverId, localUuid }),
    "pending",
    now(),
    now()
  );
}
async function pullChanges(d) {
  const since = d.prepare("SELECT value FROM sync_meta WHERE key = 'last_pull_at'").get()?.value ?? null;
  const res = await remoteCall("sync.pull", { since, entityTypes: ["products", "customers", "invoices", "invoiceItems"] }, { method: "POST" });
  const data = res.data || {};
  for (const row of data.products || []) applyPulledRow(d, "products", row);
  for (const row of data.customers || []) applyPulledRow(d, "customers", row);
  const invoiceIdMap = /* @__PURE__ */ new Map();
  for (const row of data.invoices || []) {
    const mapped = applyPulledRow(d, "invoices", row);
    if (mapped != null) {
      const serverId = row.id;
      invoiceIdMap.set(serverId, mapped);
    }
  }
  for (const row of data.invoiceItems || []) {
    const r = row;
    const mappedInvoiceId = invoiceIdMap.get(r.invoiceId);
    applyPulledItem(d, r, mappedInvoiceId);
  }
  for (const row of data.sales || []) applyPulledSale(d, row);
  for (const t of res.tombstones || []) {
    if (t.entityType === "products") applyTombstone(d, "products", t);
    if (t.entityType === "customers") applyTombstone(d, "customers", t);
    if (t.entityType === "invoices") applyTombstone(d, "invoices", t);
  }
  if (res.serverTime) {
    d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_pull_at', ?)").run(res.serverTime);
  }
}
function versionOf(row) {
  return Number(row.version ?? row.updatedAtVersion ?? 1);
}
function applyPulledRow(d, entityType, row) {
  const table = entityType === "invoiceItems" ? "invoice_items" : entityType;
  const luuid = row.local_uuid || String(row.id);
  const existing = d.prepare(`SELECT id, version FROM ${table} WHERE local_uuid = ?`).get(luuid);
  const serverVersion = versionOf(row);
  const cols = columnsFor(table);
  const values = {};
  for (const c of cols) {
    if (c === "local_uuid") values[c] = luuid;
    else if (c === "server_id") values[c] = row.id ?? null;
    else if (c === "version") values[c] = serverVersion;
    else if (c === "updated_at") values[c] = (/* @__PURE__ */ new Date()).toISOString();
    else if (row[c] !== void 0) values[c] = row[c];
  }
  if (existing) {
    if (serverVersion < existing.version) return existing.id;
    if (serverVersion === existing.version && existing.version === 1) {
    }
    if (serverVersion === existing.version && existing.version > 1) {
      const pending = d.prepare("SELECT COUNT(*) AS c FROM sync_queue WHERE local_uuid = ? AND status IN ('pending','syncing','failed')").get(luuid);
      if (pending.c > 0) return existing.id;
    }
    if (serverVersion <= existing.version && !(serverVersion === existing.version && existing.version === 1)) {
      return existing.id;
    }
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
  const inserted = d.prepare("SELECT id FROM ${table} WHERE local_uuid = ?").get(luuid);
  return inserted.id;
}
function valuesToSql(values) {
  return Object.keys(values).map((k) => `${k} = @${k}`).join(", ");
}
function applyPulledItem(d, row, mappedInvoiceId) {
  const luuid = row.local_uuid || String(row.id);
  const existing = d.prepare("SELECT id FROM invoice_items WHERE local_uuid = ?").get(luuid);
  const values = {};
  for (const c of ["product_id", "description", "quantity", "unit_price", "discount_percent", "tax_percent", "total_amount", "version"]) {
    if (row[c] !== void 0) values[c] = row[c];
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
function applyPulledSale(d, row) {
  const luuid = row.local_uuid || String(row.id);
  const existing = d.prepare("SELECT id FROM invoices WHERE local_uuid = ?").get(luuid);
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
  const items = row.items || [];
  d.prepare(
    "INSERT INTO invoices (tenant_id, invoice_number, invoice_type, customer_id, date, sub_total, tax_amount, discount_amount, total_amount, paid_amount, balance_due, status, zatca_status, local_uuid, server_id, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  ).run(
    row.invoiceNumber || `SYNC-${Date.now()}`,
    "simplified",
    null,
    row.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
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
  const invId = d.prepare("SELECT id FROM invoices WHERE local_uuid = ?").get(luuid).id;
  for (const it of items) {
    d.prepare(
      "INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, total_amount, local_uuid, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,?,?)"
    ).run(invId, it.productId ?? null, it.description ?? "POS Sale", String(it.quantity ?? 0), String(it.unitPrice ?? 0), String(it.totalAmount ?? 0), `${luuid}-${Math.random().toString(36).slice(2, 8)}`, now(), now());
  }
}
function applyTombstone(d, table, t) {
  const luuid = t.localUuid || t.entityId;
  if (!luuid) return;
  d.prepare(`UPDATE ${table} SET deleted_at = ?, updated_at = ? WHERE local_uuid = ?`).run(now(), now(), luuid);
}
var TABLE_COLUMNS = {
  products: ["tenant_id", "sku", "name", "name_ar", "description", "category_id", "brand_id", "unit_id", "barcode", "qr_code", "product_type", "purchase_price", "sale_price", "cost_method", "reorder_level", "reorder_quantity", "is_active", "is_taxable", "tax_rate", "weight", "dimensions", "image"],
  customers: ["tenant_id", "code", "name", "name_ar", "email", "phone", "mobile", "address", "city", "country", "tax_number", "credit_limit", "current_balance", "payment_terms", "customer_group", "customer_type"],
  invoices: ["tenant_id", "invoice_number", "invoice_type", "customer_id", "order_id", "date", "due_date", "sub_total", "discount_amount", "tax_amount", "tax_percent", "shipping_amount", "total_amount", "paid_amount", "balance_due", "zatca_qr_code", "zatca_xml", "zatca_status", "notes", "terms", "status", "created_by"]
};
function columnsFor(table) {
  return [...TABLE_COLUMNS[table] || [], "local_uuid", "server_id", "version", "updated_at"];
}
function enqueue(d, entityType, entityId, localUuid, action, payload) {
  d.prepare("INSERT INTO sync_queue (entity_type, entity_id, local_uuid, action, payload_json, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)").run(
    entityType,
    entityId,
    localUuid,
    action,
    JSON.stringify(payload),
    "pending",
    now(),
    now()
  );
}
function startSyncEngine() {
  syncOnce(true).catch(() => {
  });
  setInterval(() => {
    syncOnce().catch(() => {
    });
  }, 3e4);
}

// desktop/backend/escpos.ts
var ESC = 27;
var GS = 29;
var LF = 10;
var ThermalPrinter = class {
  commands = [];
  add(...bytes) {
    this.commands.push(...bytes);
  }
  init() {
    this.add(ESC, 64);
    return this;
  }
  alignCenter() {
    this.add(ESC, 97, 1);
    return this;
  }
  alignLeft() {
    this.add(ESC, 97, 0);
    return this;
  }
  alignRight() {
    this.add(ESC, 97, 2);
    return this;
  }
  boldOn() {
    this.add(ESC, 69, 1);
    return this;
  }
  boldOff() {
    this.add(ESC, 69, 0);
    return this;
  }
  doubleWidthOn() {
    this.add(ESC, 33, 32);
    return this;
  }
  doubleWidthOff() {
    this.add(ESC, 33, 0);
    return this;
  }
  text(str) {
    this.add(...Buffer.from(str, "utf8"));
    return this;
  }
  line(str = "") {
    this.text(str);
    this.add(LF);
    return this;
  }
  separator(char = "\u2500", width = 48) {
    this.line(char.repeat(width));
    return this;
  }
  qrCode(data, size = 8) {
    const buf = Buffer.from(data);
    this.add(GS, 40, 107, 3, 0, 49, 67, size);
    this.add(GS, 40, 107, buf.length + 3, 0, 49, 80, 48);
    this.add(...buf);
    this.add(GS, 40, 107, 3, 0, 49, 81, 48);
    return this;
  }
  cut() {
    this.add(GS, 86, 1);
    return this;
  }
  build() {
    return Buffer.from(this.commands);
  }
};
function generate80mmThermal(invoice) {
  const p = new ThermalPrinter();
  p.init().alignCenter().boldOn().doubleWidthOn().line(invoice.companyNameAr).doubleWidthOff().boldOff().line(invoice.companyNameEn).line(`VAT: ${invoice.vatNumber}`).separator().alignCenter().boldOn().line(invoice.isSimplified ? "\u0641\u0627\u062A\u0648\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629 \u0645\u0628\u0633\u0637\u0629" : "\u0641\u0627\u062A\u0648\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629").boldOff().line(`\u0631\u0642\u0645: ${invoice.invoiceNumber}`).line(invoice.date).separator();
  if (invoice.customerName) {
    p.alignLeft().line(`\u0627\u0644\u0639\u0645\u064A\u0644: ${invoice.customerName}`).separator();
  }
  p.alignLeft();
  for (const item of invoice.items) {
    p.line(`${item.description} \xD7${item.qty} = ${item.total.toFixed(2)} SAR`);
  }
  p.separator("\u2550").alignRight().boldOn().line(`\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: ${invoice.grandTotal.toFixed(2)} SAR`).boldOff().separator();
  p.alignCenter().qrCode(invoice.qrData, 6).line("\u0627\u0645\u0633\u062D \u0644\u0644\u062A\u062D\u0642\u0642 / Scan to Verify").line("\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643\u0645 \u0645\u0639\u0646\u0627").cut();
  return p.build();
}

// desktop/backend/handlers.ts
import { randomBytes, randomUUID as randomUUID3, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
var ApiError = class extends Error {
  code;
  httpStatus;
  trpcCode;
  constructor(message, opts = {}) {
    super(message);
    this.trpcCode = opts.code || "INTERNAL_SERVER_ERROR";
    this.code = opts.code === "BAD_REQUEST" ? -32600 : opts.code === "UNAUTHORIZED" ? -32001 : opts.code === "NOT_FOUND" ? -32004 : opts.code === "METHOD_NOT_SUPPORTED" ? -32005 : -32603;
    this.httpStatus = opts.httpStatus || 500;
  }
};
function unauthorized() {
  throw new ApiError("Authentication required", { code: "UNAUTHORIZED", httpStatus: 401 });
}
function mapUser(r) {
  return {
    id: r.id,
    tenantId: r.tenant_id ?? 1,
    unionId: r.union_id,
    name: r.name,
    email: r.email ?? null,
    avatar: null,
    role: r.role ?? "super_admin",
    phone: r.phone ?? null,
    isActive: Boolean(r.is_active),
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at) : null,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at)
  };
}
var APP_SECRET = process.env.APP_SECRET || "yasco-desktop-secret-change-me";
var ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
var SESSION_COOKIE = "erp_sid";
function signSession(unionId, clientId) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1e3) + 365 * 24 * 3600;
  const payload = Buffer.from(JSON.stringify({ unionId, clientId, iat: Math.floor(Date.now() / 1e3), exp })).toString("base64url");
  const sig = createHmac("sha256", APP_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}
function verifySession(token) {
  try {
    const [header, payload, sig] = token.split(".");
    const expected = createHmac("sha256", APP_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decoded.exp < Math.floor(Date.now() / 1e3)) return null;
    return { unionId: decoded.unionId, clientId: decoded.clientId };
  } catch {
    return null;
  }
}
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const candidate = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
  } catch {
    return false;
  }
}
function findUserByUnionId(d, unionId) {
  return d.prepare("SELECT * FROM users WHERE union_id = ?").get(unionId);
}
function createLocalUser(d, unionId, name, email, password) {
  const hash = hashPassword(password);
  d.prepare("INSERT INTO users (union_id, name, email, role, is_active, tenant_id, password_hash, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)").run(
    unionId,
    name,
    email,
    "super_admin",
    1,
    1,
    hash,
    now(),
    now()
  );
  return findUserByUnionId(d, unionId);
}
function currentUserFromRequest(req) {
  const token = req.cookies[SESSION_COOKIE] ?? req.headers.cookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  if (!token) unauthorized();
  const session = verifySession(token);
  if (!session) unauthorized();
  const d = getDb();
  const row = findUserByUnionId(d, session.unionId);
  if (!row) unauthorized();
  return mapUser(row);
}
function camel(r, map) {
  const out = {};
  for (const [dbCol, apiCol] of Object.entries(map)) {
    out[apiCol] = r[dbCol];
  }
  return out;
}
var CATEGORY_MAP = {
  id: "id",
  tenant_id: "tenantId",
  name: "name",
  name_ar: "nameAr",
  parent_id: "parentId",
  description: "description",
  image: "image",
  created_at: "createdAt"
};
var PRODUCT_MAP = {
  id: "id",
  tenant_id: "tenantId",
  sku: "sku",
  name: "name",
  name_ar: "nameAr",
  description: "description",
  category_id: "categoryId",
  brand_id: "brandId",
  unit_id: "unitId",
  barcode: "barcode",
  qr_code: "qrCode",
  product_type: "productType",
  purchase_price: "purchasePrice",
  sale_price: "salePrice",
  cost_method: "costMethod",
  reorder_level: "reorderLevel",
  reorder_quantity: "reorderQuantity",
  is_active: "isActive",
  is_taxable: "isTaxable",
  tax_rate: "taxRate",
  weight: "weight",
  dimensions: "dimensions",
  image: "image",
  created_at: "createdAt",
  updated_at: "updatedAt"
};
var WAREHOUSE_MAP = {
  id: "id",
  tenant_id: "tenantId",
  code: "code",
  name: "name",
  address: "address",
  manager_name: "managerName",
  phone: "phone",
  is_active: "isActive",
  is_primary: "isPrimary",
  created_at: "createdAt"
};
var CUSTOMER_MAP = {
  id: "id",
  tenant_id: "tenantId",
  code: "code",
  name: "name",
  name_ar: "nameAr",
  email: "email",
  phone: "phone",
  mobile: "mobile",
  address: "address",
  city: "city",
  country: "country",
  tax_number: "taxNumber",
  credit_limit: "creditLimit",
  current_balance: "currentBalance",
  payment_terms: "paymentTerms",
  customer_group: "customerGroup",
  is_active: "isActive",
  created_at: "createdAt",
  updated_at: "updatedAt"
};
var INVOICE_MAP = {
  id: "id",
  tenant_id: "tenantId",
  invoice_number: "invoiceNumber",
  invoice_type: "invoiceType",
  customer_id: "customerId",
  order_id: "orderId",
  date: "date",
  due_date: "dueDate",
  sub_total: "subTotal",
  discount_amount: "discountAmount",
  tax_amount: "taxAmount",
  tax_percent: "taxPercent",
  shipping_amount: "shippingAmount",
  total_amount: "totalAmount",
  paid_amount: "paidAmount",
  balance_due: "balanceDue",
  zatca_qr_code: "zatcaQrCode",
  zatca_xml: "zatcaXml",
  zatca_status: "zatcaStatus",
  notes: "notes",
  terms: "terms",
  status: "status",
  created_by: "createdBy",
  created_at: "createdAt"
};
var ITEM_MAP = {
  id: "id",
  invoice_id: "invoiceId",
  product_id: "productId",
  description: "description",
  quantity: "quantity",
  unit_price: "unitPrice",
  discount_percent: "discountPercent",
  tax_percent: "taxPercent",
  total_amount: "totalAmount",
  created_at: "createdAt"
};
function invoiceListRow(d, r) {
  const row = camel(r, INVOICE_MAP);
  const customer = r.customer_id ? d.prepare("SELECT name FROM customers WHERE id = ?").get(r.customer_id) : void 0;
  row.customerName = customer?.name ?? null;
  return row;
}
async function passwordLogin(input, req, setCookie) {
  const d = getDb();
  const unionId = `local:${input.username}`;
  let user = findUserByUnionId(d, unionId);
  if (user) {
    if (!verifyPassword(input.password, user.password_hash)) {
      if (!(input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD)) {
        throw new ApiError("Invalid username or password.", { code: "INTERNAL_SERVER_ERROR" });
      }
    }
  } else if (input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD) {
    user = createLocalUser(d, unionId, "Local Administrator", null, input.password);
  } else {
    if (remoteSessionActive()) {
      throw new ApiError("Invalid username or password.", { code: "INTERNAL_SERVER_ERROR" });
    }
    try {
      const remote = await remoteLogin(input.username, input.password);
      user = createLocalUser(d, unionId, String(remote.user.name || input.username), remote.user.email ?? null, input.password);
      const rm = remote.user;
      d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('remote_user_id', ?)").run(String(rm.id ?? ""));
      d.prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('remote_tenant_id', ?)").run(String(rm.tenantId ?? ""));
    } catch {
      throw new ApiError("Invalid username or password.", { code: "INTERNAL_SERVER_ERROR" });
    }
  }
  const lastLogin = now();
  d.prepare("UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?").run(lastLogin, now(), user.id);
  setCookie(SESSION_COOKIE, signSession(unionId, "desktop"), { maxAge: 365 * 24 * 3600, httpOnly: true, path: "/", sameSite: "Lax" });
  return { success: true, user: mapUser(user) };
}
function me(req) {
  return currentUserFromRequest(req);
}
function logout(_input, _req, setCookie) {
  setCookie(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return { success: true };
}
function categoryList() {
  const d = getDb();
  return d.prepare("SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY id ASC").all().map((r) => {
    const c = camel(r, CATEGORY_MAP);
    c.createdAt = new Date(r.created_at);
    return c;
  });
}
function categoryCreate(input) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID3();
  const res = d.prepare("INSERT INTO categories (tenant_id, name, name_ar, parent_id, description, image, local_uuid, version, created_at, updated_at) VALUES (1,?,?,?,?,?,?,1,?,?)").run(
    input.name,
    input.nameAr ?? null,
    input.parentId ?? null,
    input.description ?? null,
    input.image ?? null,
    localUuid,
    now(),
    now()
  );
  const id = Number(res.lastInsertRowid);
  return { id, success: true };
}
function productList(input = {}) {
  const d = getDb();
  let sql = "SELECT * FROM products WHERE deleted_at IS NULL";
  const params = [];
  if (input.categoryId) {
    sql += " AND category_id = ?";
    params.push(input.categoryId);
  }
  if (input.search) {
    sql += " AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)";
    params.push(`%${input.search}%`, `%${input.search}%`, `%${input.search}%`);
  }
  sql += " ORDER BY created_at DESC";
  return d.prepare(sql).all(...params).map((r) => {
    const c = camel(r, PRODUCT_MAP);
    c.createdAt = new Date(r.created_at);
    c.updatedAt = new Date(r.updated_at);
    return c;
  });
}
function productCreate(input) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID3();
  const res = d.prepare(
    `INSERT INTO products (tenant_id, sku, name, name_ar, description, category_id, brand_id, unit_id, barcode, product_type,
      purchase_price, sale_price, cost_method, reorder_level, reorder_quantity, is_active, is_taxable, tax_rate, weight, dimensions, image,
      local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,?,1,?,?)`
  ).run(
    input.sku ?? null,
    input.name,
    input.nameAr ?? null,
    input.description ?? null,
    input.categoryId ?? null,
    input.brandId ?? null,
    input.unitId ?? null,
    input.barcode ?? null,
    input.productType ?? "goods",
    input.purchasePrice ?? "0",
    input.salePrice ?? "0",
    input.costMethod ?? "fifo",
    input.reorderLevel ?? null,
    input.reorderQuantity ?? null,
    input.isTaxable === false ? 0 : 1,
    input.taxRate ?? "0",
    input.weight ?? null,
    input.dimensions ?? null,
    input.image ?? null,
    localUuid,
    now(),
    now()
  );
  const id = Number(res.lastInsertRowid);
  enqueue(d, "products", String(id), localUuid, "create", {
    id,
    sku: input.sku ?? null,
    name: input.name,
    nameAr: input.nameAr ?? null,
    description: input.description ?? null,
    categoryId: input.categoryId ?? null,
    brandId: input.brandId ?? null,
    unitId: input.unitId ?? null,
    barcode: input.barcode ?? null,
    productType: input.productType ?? "goods",
    purchasePrice: input.purchasePrice ?? "0",
    salePrice: input.salePrice ?? "0",
    costMethod: input.costMethod ?? "fifo",
    reorderLevel: input.reorderLevel ?? null,
    isActive: true,
    isTaxable: input.isTaxable !== false,
    taxRate: input.taxRate ?? "0",
    version: 1
  });
  return { id, success: true };
}
function warehouseList() {
  const d = getDb();
  return d.prepare("SELECT * FROM warehouses WHERE deleted_at IS NULL ORDER BY id ASC").all().map((r) => {
    const c = camel(r, WAREHOUSE_MAP);
    c.createdAt = new Date(r.created_at);
    return c;
  });
}
function warehouseCreate(input) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID3();
  const res = d.prepare("INSERT INTO warehouses (tenant_id, code, name, address, manager_name, phone, is_primary, local_uuid, version, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,1,?,?)").run(
    input.code ?? null,
    input.name,
    input.address ?? null,
    input.managerName ?? null,
    input.phone ?? null,
    input.isPrimary ? 1 : 0,
    localUuid,
    now(),
    now()
  );
  const id = Number(res.lastInsertRowid);
  if (input.isPrimary) {
    d.prepare("UPDATE warehouses SET is_primary = 0 WHERE id != ?").run(id);
  }
  d.prepare("INSERT INTO inventory_balances (tenant_id, product_id, warehouse_id, quantity) SELECT 1, id, ?, 0 FROM products WHERE deleted_at IS NULL").run(id);
  return { id, success: true };
}
function inventoryList(input = {}) {
  const d = getDb();
  let sql = `SELECT b.id, b.product_id, b.warehouse_id, b.quantity, b.reserved_quantity, b.avg_cost, b.total_value,
             p.name AS product_name, p.sku AS product_sku, p.reorder_level, w.name AS warehouse_name
             FROM inventory_balances b
             JOIN products p ON p.id = b.product_id AND p.deleted_at IS NULL
             LEFT JOIN warehouses w ON w.id = b.warehouse_id
             WHERE 1=1`;
  const params = [];
  if (input.warehouseId) {
    sql += " AND b.warehouse_id = ?";
    params.push(input.warehouseId);
  }
  if (input.lowStock) {
    sql += " AND b.quantity <= 10";
  }
  sql += " ORDER BY p.name ASC";
  return d.prepare(sql).all(...params).map((r) => ({
    id: r.id,
    productId: r.product_id,
    warehouseId: r.warehouse_id,
    quantity: Number(r.quantity ?? 0),
    reservedQuantity: Number(r.reserved_quantity ?? 0),
    avgCost: String(r.avg_cost ?? "0"),
    totalValue: String(r.total_value ?? "0"),
    productName: r.product_name,
    productSku: r.product_sku,
    warehouseName: r.warehouse_name,
    reorderLevel: r.reorder_level
  }));
}
function customerList(input = {}) {
  const d = getDb();
  let sql = "SELECT * FROM customers WHERE deleted_at IS NULL";
  const params = [];
  if (input.search) {
    sql += " AND (name LIKE ? OR phone LIKE ? OR tax_number LIKE ?)";
    params.push(`%${input.search}%`, `%${input.search}%`, `%${input.search}%`);
  }
  sql += " ORDER BY created_at DESC";
  return d.prepare(sql).all(...params).map((r) => {
    const c = camel(r, CUSTOMER_MAP);
    c.createdAt = new Date(r.created_at);
    c.updatedAt = new Date(r.updated_at);
    return c;
  });
}
function customerCreate(input) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID3();
  const creditLimit = input.creditLimit === "" ? "0" : input.creditLimit ?? "0";
  const openingBalance = input.openingBalance === "" ? "0" : input.openingBalance ?? "0";
  const res = d.prepare(
    `INSERT INTO customers (tenant_id, code, name, name_ar, email, phone, mobile, address, city, country, tax_number,
      credit_limit, current_balance, payment_terms, customer_type, notes, is_active, local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,1,?,?)`
  ).run(
    input.code ?? `CUST-${Date.now()}`,
    input.name,
    input.nameAr ?? null,
    input.email ?? null,
    input.phone ?? null,
    input.mobile ?? null,
    input.address ?? null,
    input.city ?? null,
    input.country ?? null,
    input.taxNumber ?? null,
    creditLimit,
    openingBalance,
    input.paymentTerms ?? 30,
    input.customerType ?? "b2b",
    input.notes ?? null,
    localUuid,
    now(),
    now()
  );
  const id = Number(res.lastInsertRowid);
  enqueue(d, "customers", String(id), localUuid, "create", {
    id,
    code: input.code ?? `CUST-${Date.now()}`,
    name: input.name,
    nameAr: input.nameAr ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    mobile: input.mobile ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    country: input.country ?? null,
    taxNumber: input.taxNumber ?? null,
    creditLimit,
    currentBalance: openingBalance,
    paymentTerms: input.paymentTerms ?? 30,
    isActive: true,
    version: 1
  });
  return { id, success: true };
}
function customerUpdate(input) {
  const d = getDb();
  if (!input.id) throw new ApiError("id is required", { code: "BAD_REQUEST" });
  const existing = d.prepare("SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL").get(input.id);
  if (!existing) throw new ApiError("Customer not found", { code: "NOT_FOUND", httpStatus: 404 });
  const fields = {
    name: input.name ?? existing.name,
    name_ar: input.nameAr ?? existing.name_ar,
    email: input.email ?? existing.email,
    phone: input.phone ?? existing.phone,
    mobile: input.mobile ?? existing.mobile,
    address: input.address ?? existing.address,
    city: input.city ?? existing.city,
    country: input.country ?? existing.country,
    tax_number: input.taxNumber ?? existing.tax_number,
    credit_limit: input.creditLimit === "" ? "0" : input.creditLimit ?? existing.credit_limit,
    payment_terms: input.paymentTerms ?? existing.payment_terms,
    customer_type: input.customerType ?? existing.customer_type,
    notes: input.notes ?? existing.notes,
    is_active: input.isActive !== void 0 ? input.isActive ? 1 : 0 : existing.is_active,
    updated_at: now()
  };
  const setSql = Object.keys(fields).map((k) => `${k} = @${k}`).join(", ");
  d.prepare(`UPDATE customers SET ${setSql} WHERE id = @id`).run({ ...fields, id: input.id });
  const newVersion = existing.version + 1;
  d.prepare("UPDATE customers SET version = ? WHERE id = ?").run(newVersion, input.id);
  enqueue(d, "customers", String(input.id), existing.local_uuid, "update", {
    id: input.id,
    name: fields.name,
    nameAr: fields.name_ar,
    email: fields.email,
    phone: fields.phone,
    mobile: fields.mobile,
    address: fields.address,
    city: fields.city,
    country: fields.country,
    taxNumber: fields.tax_number,
    creditLimit: fields.credit_limit,
    paymentTerms: fields.payment_terms,
    isActive: Boolean(fields.is_active),
    version: newVersion
  });
  return { id: input.id, success: true };
}
function invoiceList(input = {}) {
  const d = getDb();
  let sql = "SELECT * FROM invoices WHERE deleted_at IS NULL";
  const params = [];
  if (input.status) {
    sql += " AND status = ?";
    params.push(input.status);
  }
  if (input.customerId) {
    sql += " AND customer_id = ?";
    params.push(input.customerId);
  }
  sql += " ORDER BY created_at DESC";
  return d.prepare(sql).all(...params).map((r) => {
    const row = invoiceListRow(d, r);
    row.createdAt = new Date(r.created_at);
    return row;
  });
}
function invoiceGet(input) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id);
  if (!r) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  const invoice = camel(r, INVOICE_MAP);
  invoice.createdAt = new Date(r.created_at);
  const items = d.prepare("SELECT * FROM invoice_items WHERE invoice_id = ? AND deleted_at IS NULL ORDER BY id ASC").all(input.id).map((it) => {
    const c = camel(it, ITEM_MAP);
    c.createdAt = new Date(it.created_at);
    return c;
  });
  const customer = r.customer_id ? d.prepare("SELECT * FROM customers WHERE id = ?").get(r.customer_id) : void 0;
  const company = d.prepare("SELECT * FROM company_settings WHERE id = 1").get();
  return {
    invoice,
    items,
    customer: customer ? { ...camel(customer, CUSTOMER_MAP), createdAt: new Date(customer.created_at), updatedAt: new Date(customer.updated_at) } : null,
    company: company ? { id: company.id, tenantId: 1, companyName: company.company_name, companyNameAr: company.company_name_ar, tradeName: company.trade_name, email: company.email, phone: company.phone, mobile: company.mobile, website: company.website, address: company.address, city: company.city, country: company.country, zipCode: company.zip_code, taxNumber: company.tax_number, crNumber: company.cr_number, vatRate: company.vat_rate, defaultCurrency: company.default_currency, invoicePrefix: company.invoice_prefix, invoiceTerms: company.invoice_terms, theme: company.theme, primaryColor: company.primary_color, logo: company.logo, favicon: company.favicon, zatcaEnabled: Boolean(company.zatca_enabled), zatcaSandbox: Boolean(company.zatca_sandbox), createdAt: new Date(company.created_at), updatedAt: new Date(company.updated_at) } : null
  };
}
function isIssuedOrLocked(inv) {
  return ["paid", "partial", "credit_note", "cancelled"].includes(inv.status) || Boolean(inv.zatca_xml);
}
function makeQrBase64(inv) {
  const payload = JSON.stringify({ seller: "YASCO", vat: "", date: inv.date, total: inv.total_amount, tax: inv.tax_amount, pending: true });
  return Buffer.from(payload).toString("base64");
}
function invoiceCreate(input) {
  const d = getDb();
  if (!input.invoiceNumber) throw new ApiError("invoiceNumber is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID3();
  const cs = d.prepare("SELECT country, tax_number FROM company_settings WHERE id = 1").get();
  const isSaudi = cs?.country === "Saudi Arabia" || cs?.country === "SA";
  const taxAmount = input.taxAmount ?? (input.taxPercent ? Number(input.subTotal) * Number(input.taxPercent) / 100 : "0");
  let zatcaStatus = null;
  let qr = null;
  if (isSaudi) {
    zatcaStatus = "pending_local";
    qr = makeQrBase64({ date: input.date, total_amount: input.totalAmount, tax_amount: taxAmount });
  } else {
    qr = makeQrBase64({ date: input.date, total_amount: input.totalAmount, tax_amount: taxAmount });
  }
  let customerId = null;
  if (input.customerId) {
    const cust = d.prepare("SELECT id, local_uuid FROM customers WHERE id = ? AND deleted_at IS NULL").get(input.customerId);
    if (cust) customerId = cust.id;
  } else {
    const walkin = d.prepare("SELECT id FROM customers WHERE name = 'WALK-IN' AND deleted_at IS NULL LIMIT 1").get();
    if (walkin) customerId = walkin.id;
  }
  const res = d.prepare(
    `INSERT INTO invoices (tenant_id, invoice_number, invoice_type, customer_id, date, due_date, sub_total, discount_amount, tax_amount,
      tax_percent, shipping_amount, total_amount, paid_amount, balance_due, zatca_qr_code, zatca_status, notes, status, created_by,
      local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`
  ).run(
    input.invoiceNumber,
    input.invoiceType ?? "standard",
    customerId,
    input.date,
    input.dueDate ?? null,
    input.subTotal ?? "0",
    input.discountAmount ?? "0",
    taxAmount,
    input.taxPercent ?? "0",
    input.shippingAmount ?? "0",
    input.totalAmount ?? "0",
    "0",
    input.totalAmount ?? "0",
    qr,
    zatcaStatus,
    input.notes ?? null,
    "draft",
    1,
    localUuid,
    now(),
    now()
  );
  const id = Number(res.lastInsertRowid);
  const items = input.items ?? [];
  for (const it of items) {
    d.prepare(
      `INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total_amount, local_uuid, version, created_at, updated_at)
       VALUES (1,?,?,?,?,?,?,?,?,?,1,?,?)`
    ).run(
      id,
      it.productId ?? null,
      it.description ?? null,
      String(it.quantity ?? 0),
      String(it.unitPrice ?? 0),
      String(it.discountPercent ?? 0),
      String(it.taxPercent ?? 0),
      String(it.totalAmount ?? 0),
      randomUUID3(),
      now(),
      now()
    );
  }
  enqueue(d, "invoices", String(id), localUuid, "create", {
    id,
    invoiceNumber: input.invoiceNumber,
    invoiceType: input.invoiceType ?? "standard",
    customerId: customerId ? d.prepare("SELECT server_id FROM customers WHERE id = ?").get(customerId).server_id : null,
    date: input.date,
    dueDate: input.dueDate ?? null,
    subTotal: input.subTotal ?? "0",
    discountAmount: input.discountAmount ?? "0",
    taxAmount: String(taxAmount),
    taxPercent: input.taxPercent ?? "0",
    shippingAmount: input.shippingAmount ?? "0",
    totalAmount: input.totalAmount ?? "0",
    notes: input.notes ?? null,
    status: "draft",
    version: 1,
    __invoiceLocalUuid: localUuid,
    __items: (items ?? []).map((it) => ({
      productId: it.productId ?? null,
      description: it.description ?? null,
      quantity: it.quantity ?? 0,
      unitPrice: it.unitPrice ?? 0,
      discountPercent: it.discountPercent ?? 0,
      taxPercent: it.taxPercent ?? 0,
      totalAmount: it.totalAmount ?? 0
    }))
  });
  return { id, success: true };
}
function invoiceUpdate(input) {
  const d = getDb();
  if (!input.id) throw new ApiError("id is required", { code: "BAD_REQUEST" });
  const existing = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id);
  if (!existing) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  if (isIssuedOrLocked(existing)) throw new ApiError("Invoice cannot be updated after payment, cancellation or ZATCA clearance", { code: "BAD_REQUEST" });
  const fields = {
    invoice_number: input.invoiceNumber ?? existing.invoice_number,
    invoice_type: input.invoiceType ?? existing.invoice_type,
    customer_id: input.customerId ?? existing.customer_id,
    date: input.date ?? existing.date,
    due_date: input.dueDate ?? existing.due_date,
    sub_total: input.subTotal ?? existing.sub_total,
    discount_amount: input.discountAmount ?? existing.discount_amount,
    tax_amount: input.taxAmount ?? existing.tax_amount,
    tax_percent: input.taxPercent ?? existing.tax_percent,
    total_amount: input.totalAmount ?? existing.total_amount,
    notes: input.notes ?? existing.notes,
    balance_due: String((Number(input.totalAmount ?? existing.total_amount) - Number(existing.paid_amount ?? 0)).toFixed(2)),
    updated_at: now()
  };
  const setSql = Object.keys(fields).map((k) => `${k} = @${k}`).join(", ");
  d.prepare(`UPDATE invoices SET ${setSql} WHERE id = @id`).run({ ...fields, id: input.id });
  const newVersion = existing.version + 1;
  d.prepare("UPDATE invoices SET version = ? WHERE id = ?").run(newVersion, input.id);
  if (input.items && Array.isArray(input.items)) {
    d.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(input.id);
    for (const it of input.items) {
      d.prepare(
        `INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total_amount, local_uuid, version, created_at, updated_at)
         VALUES (1,?,?,?,?,?,?,?,?,?,1,?,?)`
      ).run(
        input.id,
        it.productId ?? null,
        it.description ?? null,
        String(it.quantity ?? 0),
        String(it.unitPrice ?? 0),
        String(it.discountPercent ?? 0),
        String(it.taxPercent ?? 0),
        String(it.totalAmount ?? 0),
        randomUUID3(),
        now(),
        now()
      );
    }
  }
  enqueue(d, "invoices", String(input.id), existing.local_uuid, "update", {
    id: input.id,
    invoiceNumber: fields.invoice_number,
    invoiceType: fields.invoice_type,
    customerId: fields.customer_id,
    date: fields.date,
    dueDate: fields.due_date,
    subTotal: fields.sub_total,
    discountAmount: fields.discount_amount,
    taxAmount: fields.tax_amount,
    taxPercent: fields.tax_percent,
    totalAmount: fields.total_amount,
    notes: fields.notes,
    status: existing.status,
    version: newVersion,
    __invoiceLocalUuid: existing.local_uuid,
    __items: input.items ?? []
  });
  return { id: input.id, success: true };
}
function invoiceUpdateStatus(input) {
  const d = getDb();
  const existing = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id);
  if (!existing) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  d.prepare("UPDATE invoices SET status = ?, updated_at = ? WHERE id = ?").run(input.status, now(), input.id);
  return { success: true };
}
function invoiceDelete(input) {
  const d = getDb();
  const existing = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id);
  if (!existing) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  if (isIssuedOrLocked(existing)) throw new ApiError("Invoice cannot be deleted after payment, cancellation or ZATCA clearance", { code: "BAD_REQUEST" });
  d.prepare("UPDATE invoices SET deleted_at = ?, updated_at = ? WHERE id = ?").run(now(), now(), input.id);
  enqueue(d, "invoices", String(input.id), existing.local_uuid, "delete", { id: input.id, version: existing.version + 1 });
  return { success: true };
}
function posCreateSale(input) {
  const d = getDb();
  const invoiceNumber = `POS-${Date.now()}`;
  const localUuid = randomUUID3();
  let customerId = null;
  if (input.customerId) {
    const cust = d.prepare("SELECT id, local_uuid, server_id FROM customers WHERE id = ? AND deleted_at IS NULL").get(input.customerId);
    if (cust) customerId = cust.id;
  } else {
    const walkin = d.prepare("SELECT id FROM customers WHERE name = 'WALK-IN' AND deleted_at IS NULL LIMIT 1").get();
    if (walkin) customerId = walkin.id;
  }
  const items = input.items ?? [];
  const res = d.prepare(
    `INSERT INTO invoices (tenant_id, invoice_number, invoice_type, customer_id, date, sub_total, discount_amount, tax_amount,
      total_amount, paid_amount, balance_due, status, zatca_status, created_by, local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`
  ).run(
    invoiceNumber,
    "simplified",
    customerId,
    input.date,
    String(input.subtotal ?? "0"),
    String(input.discountAmount ?? "0"),
    String(input.taxAmount ?? "0"),
    String(input.totalAmount ?? "0"),
    String(input.paymentAmount ?? input.totalAmount ?? "0"),
    String(Math.max(0, Number(input.totalAmount ?? 0) - Number(input.paymentAmount ?? input.totalAmount ?? 0)).toFixed(4)),
    "paid",
    "pending_local",
    1,
    localUuid,
    now(),
    now()
  );
  const id = Number(res.lastInsertRowid);
  for (const it of items) {
    const productId = it.productId;
    const desc = it.description || (productId ? `Item #${productId}` : "POS Sale");
    d.prepare(
      `INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total_amount, local_uuid, version, created_at, updated_at)
       VALUES (1,?,?,?,?,?,?,?,?,?,1,?,?)`
    ).run(
      id,
      productId ?? null,
      desc,
      String(it.quantity ?? 0),
      String(it.unitPrice ?? 0),
      String(it.discount ?? 0),
      String(it.taxRate ?? 0),
      String(it.totalAmount ?? 0),
      randomUUID3(),
      now(),
      now()
    );
    if (productId) {
      const balances = d.prepare("SELECT id, quantity FROM inventory_balances WHERE product_id = ? ORDER BY id ASC").all(productId);
      let remaining = Number(it.quantity ?? 0);
      for (const b of balances) {
        if (remaining <= 0) break;
        const take = Math.min(b.quantity, remaining);
        d.prepare("UPDATE inventory_balances SET quantity = MAX(0, quantity - ?) WHERE id = ?").run(take, b.id);
        remaining -= take;
      }
      d.prepare("INSERT INTO stock_movements (tenant_id, product_id, qty_change, reason, ref_type, ref_id, created_at) VALUES (1,?,?,?,?,?,?)").run(
        productId,
        -Number(it.quantity ?? 0),
        "POS sale",
        "invoice",
        id,
        now()
      );
    }
  }
  if (Number(input.paymentAmount ?? 0) > 0) {
    const latest = d.prepare("SELECT balance_after FROM cashbox_transactions ORDER BY id DESC LIMIT 1").get();
    const before = Number(latest?.balance_after ?? 0);
    d.prepare("INSERT INTO cashbox_transactions (tenant_id, transaction_number, type, amount, balance_before, balance_after, status, created_at) VALUES (1,?,?,?,?,?,?,?)").run(
      `CB-${Date.now()}`,
      "sale",
      String(input.paymentAmount ?? 0),
      String(before),
      String(before + Number(input.paymentAmount ?? 0)),
      "completed",
      now()
    );
  }
  const customerServerId = customerId ? d.prepare("SELECT server_id FROM customers WHERE id = ?").get(customerId).server_id : void 0;
  enqueue(d, "sales", String(id), localUuid, "create", {
    saleNumber: invoiceNumber,
    customerId: customerServerId ?? void 0,
    date: input.date,
    items: items.map((it) => ({
      productId: it.productId ?? null,
      description: it.description ?? null,
      quantity: it.quantity ?? 0,
      unitPrice: it.unitPrice ?? 0,
      discount: it.discount ?? 0,
      taxRate: it.taxRate ?? 0,
      totalAmount: it.totalAmount ?? 0
    })),
    subtotal: input.subtotal ?? "0",
    taxAmount: input.taxAmount ?? "0",
    discountAmount: input.discountAmount ?? "0",
    totalAmount: input.totalAmount ?? "0",
    paymentAmount: input.paymentAmount ?? input.totalAmount ?? "0",
    paymentMethod: input.paymentMethod ?? "cash",
    invoiceType: "zatca",
    version: 1
  });
  return { id, invoiceNumber, success: true };
}
function todaySalesSummary() {
  const d = getDb();
  const today = /* @__PURE__ */ new Date();
  today.setUTCHours(0, 0, 0, 0);
  const rows = d.prepare("SELECT total_amount FROM invoices WHERE deleted_at IS NULL AND status != 'cancelled' AND created_at >= ?").all(today.toISOString());
  const totalSales = rows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  return { totalSales, count: rows.length, cashTotal: 0, cardTotal: 0, transferTotal: 0 };
}
function sessionCurrent() {
  return null;
}
function heldSalesList() {
  const d = getDb();
  return d.prepare("SELECT * FROM pos_holds WHERE status = 'held' ORDER BY created_at DESC").all().map((r) => ({
    id: r.id,
    tenantId: 1,
    userId: r.user_id,
    holdNumber: r.hold_number,
    customerId: r.customer_id,
    items: JSON.parse(r.items || "[]"),
    subtotal: r.subtotal,
    taxAmount: r.tax_amount,
    discountAmount: r.discount_amount,
    totalAmount: r.total_amount,
    notes: r.notes,
    status: r.status,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at)
  }));
}
function holdSale(input) {
  const d = getDb();
  const holdNumber = `HLD-${Date.now()}`;
  const res = d.prepare("INSERT INTO pos_holds (tenant_id, user_id, hold_number, customer_id, items, subtotal, tax_amount, discount_amount, total_amount, notes, status, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?)").run(
    1,
    holdNumber,
    input.customerId ?? null,
    JSON.stringify(input.items ?? []),
    String(input.subtotal ?? "0"),
    String(input.taxAmount ?? "0"),
    String(input.discountAmount ?? "0"),
    String(input.totalAmount ?? "0"),
    input.notes ?? null,
    "held",
    now(),
    now()
  );
  return { id: Number(res.lastInsertRowid), holdNumber, success: true };
}
function resumeHold(input) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM pos_holds WHERE id = ?").get(input.id);
  if (!r) throw new ApiError("Hold not found", { code: "NOT_FOUND", httpStatus: 404 });
  d.prepare("UPDATE pos_holds SET status = 'resumed', updated_at = ? WHERE id = ?").run(now(), input.id);
  return {
    id: r.id,
    tenantId: 1,
    userId: r.user_id,
    holdNumber: r.hold_number,
    customerId: r.customer_id,
    items: JSON.parse(r.items || "[]"),
    subtotal: r.subtotal,
    taxAmount: r.tax_amount,
    discountAmount: r.discount_amount,
    totalAmount: r.total_amount,
    notes: r.notes,
    status: r.status,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at)
  };
}
function generateThermal(input) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.invoiceId);
  if (!r) throw new ApiError("Invoice not found");
  const cs = d.prepare("SELECT * FROM company_settings WHERE id = 1").get();
  if (!cs) throw new ApiError("Company settings not found");
  const items = d.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").all(input.invoiceId);
  const customer = r.customer_id ? d.prepare("SELECT name FROM customers WHERE id = ?").get(r.customer_id) : void 0;
  const data = {
    companyNameAr: cs.company_name_ar || "",
    companyNameEn: cs.company_name || "YASCO",
    vatNumber: cs.tax_number || "",
    address: cs.address || void 0,
    invoiceNumber: r.invoice_number,
    date: r.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    customerName: customer?.name,
    items: items.map((it) => ({
      description: it.description,
      qty: Number(it.quantity ?? 0),
      unitPrice: Number(it.unit_price ?? 0),
      total: Number(it.total_amount ?? 0)
    })),
    subtotal: Number(r.sub_total ?? 0),
    vatAmount: Number(r.tax_amount ?? 0),
    grandTotal: Number(r.total_amount ?? 0),
    qrData: r.zatca_qr_code || "YASCO",
    isSimplified: true
  };
  const format = input.format ?? "80mm";
  const buffer = generate80mmThermal(data);
  return { success: true, data: buffer.toString("base64"), format, message: `Thermal receipt (${format}) generated successfully` };
}
function companySettingsGet() {
  const d = getDb();
  const r = d.prepare("SELECT * FROM company_settings WHERE id = 1").get();
  if (!r) return null;
  return {
    id: r.id,
    tenantId: 1,
    companyName: r.company_name,
    companyNameAr: r.company_name_ar,
    tradeName: r.trade_name,
    email: r.email,
    phone: r.phone,
    mobile: r.mobile,
    website: r.website,
    address: r.address,
    city: r.city,
    country: r.country,
    zipCode: r.zip_code,
    taxNumber: r.tax_number,
    crNumber: r.cr_number,
    vatRate: r.vat_rate,
    defaultCurrency: r.default_currency,
    invoicePrefix: r.invoice_prefix,
    invoiceTerms: r.invoice_terms,
    theme: r.theme,
    primaryColor: r.primary_color,
    logo: r.logo,
    favicon: r.favicon,
    zatcaEnabled: Boolean(r.zatca_enabled),
    zatcaSandbox: Boolean(r.zatca_sandbox),
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at)
  };
}
function dashboardStats() {
  const d = getDb();
  const sales = d.prepare("SELECT SUM(total_amount) AS s FROM invoices WHERE status != 'cancelled' AND deleted_at IS NULL").get()?.s ?? "0";
  const customers = d.prepare("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL").get()?.c ?? 0;
  const products = d.prepare("SELECT COUNT(*) AS c FROM products WHERE deleted_at IS NULL").get()?.c ?? 0;
  const invoices = d.prepare("SELECT COUNT(*) AS c FROM invoices WHERE deleted_at IS NULL").get()?.c ?? 0;
  return { totalSales: Number(sales), totalCustomers: customers, totalProducts: products, totalInvoices: invoices };
}
function dashboardRevenueByMonth() {
  return [];
}
function dashboardRecentInvoices(input = {}) {
  const d = getDb();
  const limit = input.limit ?? 5;
  const rows = d.prepare("SELECT * FROM invoices WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ?").all(limit);
  return rows.map((r) => invoiceListRow(d, r));
}
function dashboardTopCustomers() {
  return [];
}
function zatcaDashboard() {
  const d = getDb();
  const cleared = d.prepare("SELECT COUNT(*) AS c FROM invoices WHERE zatca_status = 'cleared' AND deleted_at IS NULL").get()?.c ?? 0;
  const pending = d.prepare("SELECT COUNT(*) AS c FROM invoices WHERE zatca_status IN ('pending', 'pending_local') AND deleted_at IS NULL").get()?.c ?? 0;
  return { clearedCount: cleared, pendingCount: pending, rejectedCount: 0 };
}
function zatcaGenerateQrCode(input) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.invoiceId);
  if (!r) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  const qr = makeQrBase64(r);
  d.prepare("UPDATE invoices SET zatca_qr_code = ?, zatca_status = 'pending_local', updated_at = ? WHERE id = ?").run(qr, now(), input.id);
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  return { invoiceId: input.invoiceId, qrCodeBase64: qr, qrImageDataUrl: png, invoiceHash: "" };
}
function zatcaSyncStatus(input) {
  const d = getDb();
  const r = d.prepare("SELECT zatca_status FROM invoices WHERE id = ?").get(input.invoiceId);
  if (!r) return { invoiceId: input.invoiceId, status: "draft" };
  return { invoiceId: input.invoiceId, status: r.zatca_status ?? "draft" };
}
function syncRegisterDevice(input) {
  const d = getDb();
  const existing = d.prepare("SELECT device_id FROM devices WHERE device_id = ?").get(input.deviceId);
  const message = existing ? "Device updated" : "Device registered";
  d.prepare(
    "INSERT OR REPLACE INTO devices (device_id, device_name, platform, tenant_id, app_version, is_active, last_seen, created_at) VALUES (?,?,?,1,?,1,?,?)"
  ).run(input.deviceId, input.deviceName ?? null, input.platform ?? null, input.appVersion ?? null, now(), now());
  return { deviceId: input.deviceId, registered: true, message };
}
function syncPush() {
  return { results: [], conflicts: [], serverTime: (/* @__PURE__ */ new Date()).toISOString() };
}
function syncPull(input) {
  return { data: { products: [], customers: [], invoices: [], invoiceItems: [], sales: [] }, tombstones: [], serverTime: (/* @__PURE__ */ new Date()).toISOString() };
}
function syncResolveConflict(input) {
  const d = getDb();
  const conflict = d.prepare("SELECT * FROM sync_conflicts WHERE local_uuid = ? AND resolved = 0 ORDER BY id DESC LIMIT 1").get(input.localUuid);
  if (conflict) {
    d.prepare("UPDATE sync_conflicts SET resolved = 1, resolution = ? WHERE id = ?").run(input.resolution, conflict.id);
    if (conflict.queue_id) {
      const queueItem = d.prepare("SELECT * FROM sync_queue WHERE id = ?").get(conflict.queue_id);
      if (queueItem) {
        if (input.resolution === "keep_local" || input.resolution === "merge") {
          let payload;
          if (input.resolution === "merge" && input.mergedPayload) {
            payload = input.mergedPayload;
          } else {
            payload = JSON.parse(queueItem.payload_json);
          }
          payload.version = (Number(payload.version ?? 1) || 1) + 1;
          d.prepare("UPDATE sync_queue SET payload_json = ?, status = 'pending', error = NULL, attempts = 0, updated_at = ? WHERE id = ?").run(
            JSON.stringify(payload),
            now(),
            conflict.queue_id
          );
        } else {
          d.prepare("UPDATE sync_queue SET status = 'synced', error = 'resolved: keep_server', updated_at = ? WHERE id = ?").run(now(), conflict.queue_id);
        }
      }
    }
  }
  return { success: true, message: `Conflict resolved: ${input.resolution}` };
}
function syncStatus() {
  const d = getDb();
  const devices = d.prepare("SELECT * FROM devices ORDER BY last_seen DESC").all().map((r) => ({
    id: r.id,
    deviceId: r.device_id,
    deviceName: r.device_name,
    platform: r.platform,
    userId: r.user_id,
    tenantId: 1,
    lastSeen: r.last_seen ? new Date(r.last_seen) : null,
    lastSyncAt: r.last_sync_at ? new Date(r.last_sync_at) : null,
    appVersion: r.app_version,
    isActive: Boolean(r.is_active),
    createdAt: new Date(r.created_at)
  }));
  return { devices, serverTime: (/* @__PURE__ */ new Date()).toISOString() };
}
function syncListDevices() {
  const d = getDb();
  return d.prepare("SELECT * FROM devices ORDER BY last_seen DESC").all().map((r) => ({
    id: r.id,
    deviceId: r.device_id,
    deviceName: r.device_name,
    platform: r.platform,
    userId: r.user_id,
    tenantId: 1,
    lastSeen: r.last_seen ? new Date(r.last_seen) : null,
    lastSyncAt: r.last_sync_at ? new Date(r.last_sync_at) : null,
    appVersion: r.app_version,
    isActive: Boolean(r.is_active),
    createdAt: new Date(r.created_at)
  }));
}
function syncDeactivateDevice(input) {
  const d = getDb();
  d.prepare("UPDATE devices SET is_active = 0 WHERE device_id = ?").run(input.deviceId);
  return { success: true };
}
var MUTATIONS = /* @__PURE__ */ new Set([
  "auth.passwordLogin",
  "auth.logout",
  "inventory.categoryCreate",
  "inventory.productCreate",
  "inventory.warehouseCreate",
  "sales.customerCreate",
  "sales.customerUpdate",
  "sales.invoiceCreate",
  "sales.invoiceUpdate",
  "sales.invoiceUpdateStatus",
  "sales.invoiceDelete",
  "pos.createSaleInvoice",
  "pos.holdSale",
  "pos.resumeHold",
  "zatca.generateQrCode",
  "zatca.syncStatus",
  "zatca.reportInvoice",
  "zatca.clearanceInvoice",
  "zatca.signInvoice",
  "zatca.generateXml",
  "sync.registerDevice",
  "sync.push",
  "sync.pull",
  "sync.resolveConflict",
  "sync.deactivateDevice"
]);
var AUTH_REQUIRED = /* @__PURE__ */ new Set([
  "inventory.categoryList",
  "inventory.categoryCreate",
  "inventory.productList",
  "inventory.productCreate",
  "inventory.warehouseList",
  "inventory.warehouseCreate",
  "inventory.inventoryList",
  "sales.customerList",
  "sales.customerCreate",
  "sales.customerUpdate",
  "sales.invoiceList",
  "sales.invoiceGet",
  "sales.invoiceCreate",
  "sales.invoiceUpdate",
  "sales.invoiceUpdateStatus",
  "sales.invoiceDelete",
  "pos.createSaleInvoice",
  "pos.todaySalesSummary",
  "pos.sessionCurrent",
  "pos.heldSalesList",
  "pos.holdSale",
  "pos.resumeHold",
  "thermalPrint.generateThermal",
  "settings.companySettingsGet",
  "zatca.generateQrCode",
  "zatca.syncStatus",
  "zatca.dashboard",
  "dashboard.stats",
  "dashboard.revenueByMonth",
  "dashboard.recentInvoices",
  "dashboard.topCustomers",
  "sync.registerDevice",
  "sync.push",
  "sync.pull",
  "sync.resolveConflict",
  "sync.status",
  "sync.listDevices",
  "sync.deactivateDevice"
]);
var handlers = {
  "auth.passwordLogin": passwordLogin,
  "auth.me": me,
  "auth.logout": logout,
  "inventory.categoryList": categoryList,
  "inventory.categoryCreate": categoryCreate,
  "inventory.productList": productList,
  "inventory.productCreate": productCreate,
  "inventory.warehouseList": warehouseList,
  "inventory.warehouseCreate": warehouseCreate,
  "inventory.inventoryList": inventoryList,
  "sales.customerList": customerList,
  "sales.customerCreate": customerCreate,
  "sales.customerUpdate": customerUpdate,
  "sales.invoiceList": invoiceList,
  "sales.invoiceGet": invoiceGet,
  "sales.invoiceCreate": invoiceCreate,
  "sales.invoiceUpdate": invoiceUpdate,
  "sales.invoiceUpdateStatus": invoiceUpdateStatus,
  "sales.invoiceDelete": invoiceDelete,
  "pos.createSaleInvoice": posCreateSale,
  "pos.todaySalesSummary": todaySalesSummary,
  "pos.sessionCurrent": sessionCurrent,
  "pos.heldSalesList": heldSalesList,
  "pos.holdSale": holdSale,
  "pos.resumeHold": resumeHold,
  "thermalPrint.generateThermal": generateThermal,
  "settings.companySettingsGet": companySettingsGet,
  "zatca.generateQrCode": zatcaGenerateQrCode,
  "zatca.syncStatus": zatcaSyncStatus,
  "zatca.dashboard": zatcaDashboard,
  "dashboard.stats": dashboardStats,
  "dashboard.revenueByMonth": dashboardRevenueByMonth,
  "dashboard.recentInvoices": dashboardRecentInvoices,
  "dashboard.topCustomers": dashboardTopCustomers,
  "sync.registerDevice": syncRegisterDevice,
  "sync.push": syncPush,
  "sync.pull": syncPull,
  "sync.resolveConflict": syncResolveConflict,
  "sync.status": syncStatus,
  "sync.listDevices": syncListDevices,
  "sync.deactivateDevice": syncDeactivateDevice
};
function authMeHandler(req) {
  return me(req);
}

// desktop/backend/server.ts
var HOST = process.env.HOST || "127.0.0.1";
var PORT = Number(process.env.PORT || 32145);
var STATIC_DIR = process.env.ERP_STATIC_DIR || join(process.cwd(), "dist", "public");
var DB_PATH = process.env.ERP_DB_PATH || join(process.env.APPDATA || process.env.HOME || ".", ".yasco", "erp.sqlite");
initDb(DB_PATH);
startSyncEngine();
var MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain"
};
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function parseInputJson(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function buildSetCookie(c) {
  const parts = [`${c.name}=${c.value}`];
  const o = c.opts;
  if (o.maxAge !== void 0) parts.push(`Max-Age=${o.maxAge}`);
  if (o.path) parts.push(`Path=${o.path}`);
  if (o.httpOnly) parts.push("HttpOnly");
  if (o.sameSite) parts.push(`SameSite=${o.sameSite}`);
  if (o.secure) parts.push("Secure");
  return parts.join("; ");
}
async function handleTrpc(req, res, pathname, query) {
  const procNames = pathname.replace(/^\/api\/trpc\/?/, "").split(",").filter(Boolean);
  if (procNames.length === 0) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "No procedure path" }));
    return;
  }
  const method = (req.method || "GET").toUpperCase();
  const isBatch = query.get("batch") === "1";
  const isGet = method === "GET";
  let inputMap = {};
  if (isGet) {
    inputMap = parseInputJson(query.get("input") || void 0);
  } else {
    const body = await parseBody(req);
    inputMap = parseInputJson(body);
  }
  const reqLike = {
    headers: req.headers,
    cookies: parseCookies(req.headers.cookie)
  };
  const setCookies = [];
  const setCookieFn = (name, value, opts) => {
    setCookies.push({ name, value, opts });
  };
  const results = await Promise.all(
    procNames.map(async (proc, i) => {
      const input = inputMap[String(i)]?.json ?? {};
      const isMutation = MUTATIONS.has(proc);
      if (isGet && isMutation) {
        return errorEnvelope(proc, new ApiError(`Unsupported GET-request to mutation procedure at path "${proc}"`, { code: "METHOD_NOT_SUPPORTED", httpStatus: 405 }));
      }
      if (!isGet && !isMutation) {
        return errorEnvelope(proc, new ApiError(`Unsupported POST-request to query procedure at path "${proc}"`, { code: "METHOD_NOT_SUPPORTED", httpStatus: 405 }));
      }
      if (AUTH_REQUIRED.has(proc) && !handlers[proc]) {
        return errorEnvelope(proc, new ApiError(`Procedure not found: ${proc}`, { code: "NOT_FOUND", httpStatus: 404 }));
      }
      if (!handlers[proc]) {
        return errorEnvelope(proc, new ApiError(`Procedure not found: ${proc}`, { code: "NOT_FOUND", httpStatus: 404 }));
      }
      try {
        if (AUTH_REQUIRED.has(proc) && proc !== "auth.passwordLogin" && proc !== "auth.logout") {
          authMeHandler(reqLike);
        }
        const value = await handlers[proc](input, reqLike, setCookieFn);
        const ser = serialize(value);
        return {
          result: {
            data: ser
          }
        };
      } catch (err) {
        return errorEnvelope(proc, err);
      }
    })
  );
  if (setCookies.length > 0) {
    res.setHeader("set-cookie", setCookies.map(buildSetCookie));
  }
  res.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(isBatch ? results : results[0]));
}
function errorEnvelope(proc, err) {
  const apiErr = err instanceof ApiError ? err : new ApiError(err instanceof Error ? err.message : String(err));
  return {
    error: {
      json: {
        message: apiErr.message,
        code: apiErr.code,
        data: { code: apiErr.trpcCode, httpStatus: apiErr.httpStatus, path: proc }
      }
    }
  };
}
function serveStatic(req, res, pathname) {
  if (!existsSync(STATIC_DIR)) {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Frontend build not found \u2014 run: npm run build" }));
    return;
  }
  let rel = pathname;
  if (rel.startsWith("/app")) rel = rel.slice(4) || "/";
  if (rel === "/") rel = "/index.html";
  const filePath = normalize(join(STATIC_DIR, rel));
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
    });
    createReadStream(filePath).pipe(res);
    return;
  }
  const indexFile = join(STATIC_DIR, "index.html");
  if (existsSync(indexFile)) {
    const content = readFileSync(indexFile);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
    res.end(content);
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
}
var server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  const pathname = url.pathname;
  try {
    if (pathname.startsWith("/api/")) {
      if (pathname === "/api/health" || pathname === "/api/ping") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, ts: Date.now(), desktop: true }));
        return;
      }
      if (pathname.startsWith("/api/trpc")) {
        await handleTrpc(req, res, pathname, url.searchParams);
        return;
      }
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }
    serveStatic(req, res, pathname);
  } catch (err) {
    try {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
    } catch {
    }
  }
});
server.listen(PORT, HOST, () => {
  console.log(`[desktop] YASCO desktop backend listening on http://${HOST}:${PORT}`);
  console.log(`[desktop] DB: ${DB_PATH}`);
  console.log(`[desktop] Static: ${STATIC_DIR}`);
  console.log(`[desktop] Remote: ${process.env.ERP_REMOTE_URL || "https://www.yasco.tech"}`);
  syncOnce().catch(() => {
  });
});
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
