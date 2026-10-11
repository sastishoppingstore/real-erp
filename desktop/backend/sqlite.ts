import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) throw new Error("Database not initialized");
  return db;
}

export function initDb(dbPath: string): DatabaseSync {
  mkdirSync(dirname(dbPath), { recursive: true });
  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  seedDefaults(db);
  return db;
}

const SCHEMA = `
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

function seedDefaults(d: DatabaseSync) {
  const count = d.prepare("SELECT COUNT(*) AS c FROM company_settings").get() as { c: number };
  if (count.c === 0) {
    d.prepare(
      `INSERT INTO company_settings (tenant_id, company_name, company_name_ar, country, tax_number, vat_rate, default_currency)
       VALUES (1, 'YASCO ERP', 'ياسكو', 'Saudi Arabia', '', '15', 'SAR')`
    ).run();
  }
  const metaCount = d.prepare("SELECT COUNT(*) AS c FROM sync_meta").get() as { c: number };
  if (metaCount.c === 0) {
    d.prepare("INSERT INTO sync_meta (key, value) VALUES ('device_id', ?)").run(randomUUID());
  }
}

export function now(): string {
  return new Date().toISOString();
}
