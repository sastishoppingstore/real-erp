import { getDb, now } from "./sqlite";
import { enqueue } from "./sync";
import { remoteLogin, remoteSessionActive } from "./remote";
import { generate80mmThermal, type ThermalInvoiceData } from "./escpos";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export class ApiError extends Error {
  code: number;
  httpStatus: number;
  trpcCode: string;
  constructor(message: string, opts: { code?: string; httpStatus?: number } = {}) {
    super(message);
    this.trpcCode = opts.code || "INTERNAL_SERVER_ERROR";
    this.code = opts.code === "BAD_REQUEST" ? -32600 : opts.code === "UNAUTHORIZED" ? -32001 : opts.code === "NOT_FOUND" ? -32004 : opts.code === "METHOD_NOT_SUPPORTED" ? -32005 : -32603;
    this.httpStatus = opts.httpStatus || 500;
  }
}

export function unauthorized() {
  throw new ApiError("Authentication required", { code: "UNAUTHORIZED", httpStatus: 401 });
}

export interface UserRow {
  id: number;
  tenantId: number;
  unionId: string;
  name: string;
  email: string | null;
  avatar: string | null;
  role: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapUser(r: Record<string, unknown>): UserRow {
  return {
    id: r.id as number,
    tenantId: (r.tenant_id as number) ?? 1,
    unionId: r.union_id as string,
    name: r.name as string,
    email: (r.email as string) ?? null,
    avatar: null,
    role: (r.role as string) ?? "super_admin",
    phone: (r.phone as string) ?? null,
    isActive: Boolean(r.is_active),
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at as string) : null,
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  };
}

const APP_SECRET = process.env.APP_SECRET || "yasco-desktop-secret-change-me";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "wafaweb";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Wafa@1122";
const SESSION_COOKIE = "erp_sid";

function signSession(unionId: string, clientId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;
  const payload = Buffer.from(JSON.stringify({ unionId, clientId, iat: Math.floor(Date.now() / 1000), exp })).toString("base64url");
  const sig = createHmac("sha256", APP_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

function verifySession(token: string): { unionId: string; clientId: string } | null {
  try {
    const [header, payload, sig] = token.split(".");
    const expected = createHmac("sha256", APP_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return { unionId: decoded.unionId, clientId: decoded.clientId };
  } catch {
    return null;
  }
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const candidate = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
  } catch {
    return false;
  }
}

function findUserByUnionId(d: DatabaseSync, unionId: string): Record<string, unknown> | undefined {
  return d.prepare("SELECT * FROM users WHERE union_id = ?").get(unionId) as Record<string, unknown> | undefined;
}

function createLocalUser(d: DatabaseSync, unionId: string, name: string, email: string | null, password: string): Record<string, unknown> {
  const hash = hashPassword(password);
  d.prepare("INSERT INTO users (union_id, name, email, role, is_active, tenant_id, password_hash, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)").run(
    unionId, name, email, "super_admin", 1, 1, hash, now(), now()
  );
  return findUserByUnionId(d, unionId)!;
}

function currentUserFromRequest(req: { headers: Record<string, string | undefined>; cookies: Record<string, string> }): UserRow {
  const token = req.cookies[SESSION_COOKIE] ?? req.headers.cookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  if (!token) unauthorized();
  const session = verifySession(token!);
  if (!session) unauthorized();
  const d = getDb();
  const row = findUserByUnionId(d, session.unionId);
  if (!row) unauthorized();
  return mapUser(row);
}

// ---------- row mappers ----------

function camel<T extends Record<string, unknown>>(r: T, map: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [dbCol, apiCol] of Object.entries(map)) {
    out[apiCol] = r[dbCol];
  }
  return out;
}

const CATEGORY_MAP: Record<string, string> = {
  id: "id", tenant_id: "tenantId", name: "name", name_ar: "nameAr", parent_id: "parentId",
  description: "description", image: "image", created_at: "createdAt",
};
const PRODUCT_MAP: Record<string, string> = {
  id: "id", tenant_id: "tenantId", sku: "sku", name: "name", name_ar: "nameAr", description: "description",
  category_id: "categoryId", brand_id: "brandId", unit_id: "unitId", barcode: "barcode", qr_code: "qrCode",
  product_type: "productType", purchase_price: "purchasePrice", sale_price: "salePrice", cost_method: "costMethod",
  reorder_level: "reorderLevel", reorder_quantity: "reorderQuantity", is_active: "isActive", is_taxable: "isTaxable",
  tax_rate: "taxRate", weight: "weight", dimensions: "dimensions", image: "image", created_at: "createdAt", updated_at: "updatedAt",
};
const WAREHOUSE_MAP: Record<string, string> = {
  id: "id", tenant_id: "tenantId", code: "code", name: "name", address: "address", manager_name: "managerName",
  phone: "phone", is_active: "isActive", is_primary: "isPrimary", created_at: "createdAt",
};
const CUSTOMER_MAP: Record<string, string> = {
  id: "id", tenant_id: "tenantId", code: "code", name: "name", name_ar: "nameAr", email: "email", phone: "phone",
  mobile: "mobile", address: "address", city: "city", country: "country", tax_number: "taxNumber",
  credit_limit: "creditLimit", current_balance: "currentBalance", payment_terms: "paymentTerms",
  customer_group: "customerGroup", is_active: "isActive", created_at: "createdAt", updated_at: "updatedAt",
};
const INVOICE_MAP: Record<string, string> = {
  id: "id", tenant_id: "tenantId", invoice_number: "invoiceNumber", invoice_type: "invoiceType",
  customer_id: "customerId", order_id: "orderId", date: "date", due_date: "dueDate", sub_total: "subTotal",
  discount_amount: "discountAmount", tax_amount: "taxAmount", tax_percent: "taxPercent", shipping_amount: "shippingAmount",
  total_amount: "totalAmount", paid_amount: "paidAmount", balance_due: "balanceDue", zatca_qr_code: "zatcaQrCode",
  zatca_xml: "zatcaXml", zatca_status: "zatcaStatus", notes: "notes", terms: "terms", status: "status",
  created_by: "createdBy", created_at: "createdAt",
};
const ITEM_MAP: Record<string, string> = {
  id: "id", invoice_id: "invoiceId", product_id: "productId", description: "description", quantity: "quantity",
  unit_price: "unitPrice", discount_percent: "discountPercent", tax_percent: "taxPercent", total_amount: "totalAmount",
  created_at: "createdAt",
};

function invoiceListRow(d: DatabaseSync, r: Record<string, unknown>): Record<string, unknown> {
  const row = camel(r, INVOICE_MAP);
  const customer = r.customer_id
    ? (d.prepare("SELECT name FROM customers WHERE id = ?").get(r.customer_id) as { name: string } | undefined)
    : undefined;
  row.customerName = customer?.name ?? null;
  return row;
}

// ---------- handlers ----------

async function passwordLogin(input: { username: string; password: string }, req: { headers: Record<string, string | undefined>; cookies: Record<string, string> }, setCookie: (name: string, value: string, opts: Record<string, unknown>) => void) {
  const d = getDb();
  const unionId = `local:${input.username}`;
  let user = findUserByUnionId(d, unionId);
  if (user) {
    if (!verifyPassword(input.password, user.password_hash as string)) {
      if (!(input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD)) {
        throw new ApiError("Invalid username or password.", { code: "INTERNAL_SERVER_ERROR" });
      }
    }
  } else if (input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD) {
    user = createLocalUser(d, unionId, "Local Administrator", null, input.password);
  } else {
    // bootstrap: try remote (online) so offline login works later
    if (remoteSessionActive()) {
      throw new ApiError("Invalid username or password.", { code: "INTERNAL_SERVER_ERROR" });
    }
    try {
      const remote = await remoteLogin(input.username, input.password);
      user = createLocalUser(d, unionId, String(remote.user.name || input.username), (remote.user.email as string) ?? null, input.password);
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

function me(_input: unknown, req: { headers: Record<string, string | undefined>; cookies: Record<string, string> }) {
  return currentUserFromRequest(req);
}

function logout(_input: unknown, _req: { headers: Record<string, string | undefined>; cookies: Record<string, string> }, setCookie: (name: string, value: string, opts: Record<string, unknown>) => void) {
  setCookie(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return { success: true };
}

// inventory
function categoryList() {
  const d = getDb();
  return (d.prepare("SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY id ASC").all() as Record<string, unknown>[]).map((r) => {
    const c = camel(r, CATEGORY_MAP);
    c.createdAt = new Date(r.created_at as string);
    return c;
  });
}

function categoryCreate(input: { name: string; nameAr?: string; parentId?: number; description?: string; image?: string }) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID();
  const res = d.prepare("INSERT INTO categories (tenant_id, name, name_ar, parent_id, description, image, local_uuid, version, created_at, updated_at) VALUES (1,?,?,?,?,?,?,1,?,?)").run(
    input.name, input.nameAr ?? null, input.parentId ?? null, input.description ?? null, input.image ?? null, localUuid, now(), now()
  );
  const id = Number(res.lastInsertRowid);
  return { id, success: true };
}

function productList(input: { categoryId?: number; search?: string } = {}) {
  const d = getDb();
  let sql = "SELECT * FROM products WHERE deleted_at IS NULL";
  const params: unknown[] = [];
  if (input.categoryId) {
    sql += " AND category_id = ?";
    params.push(input.categoryId);
  }
  if (input.search) {
    sql += " AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)";
    params.push(`%${input.search}%`, `%${input.search}%`, `%${input.search}%`);
  }
  sql += " ORDER BY created_at DESC";
  return (d.prepare(sql).all(...params) as Record<string, unknown>[]).map((r) => {
    const c = camel(r, PRODUCT_MAP);
    c.createdAt = new Date(r.created_at as string);
    c.updatedAt = new Date(r.updated_at as string);
    return c;
  });
}

function productCreate(input: Record<string, unknown>) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID();
  const res = d.prepare(
    `INSERT INTO products (tenant_id, sku, name, name_ar, description, category_id, brand_id, unit_id, barcode, product_type,
      purchase_price, sale_price, cost_method, reorder_level, reorder_quantity, is_active, is_taxable, tax_rate, weight, dimensions, image,
      local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,?,1,?,?)`
  ).run(
    input.sku ?? null, input.name, input.nameAr ?? null, input.description ?? null, input.categoryId ?? null,
    input.brandId ?? null, input.unitId ?? null, input.barcode ?? null, input.productType ?? "goods",
    input.purchasePrice ?? "0", input.salePrice ?? "0", input.costMethod ?? "fifo", input.reorderLevel ?? null,
    input.reorderQuantity ?? null, input.isTaxable === false ? 0 : 1, input.taxRate ?? "0", input.weight ?? null,
    input.dimensions ?? null, input.image ?? null, localUuid, now(), now()
  );
  const id = Number(res.lastInsertRowid);
  enqueue(d, "products", String(id), localUuid, "create", {
    id, sku: input.sku ?? null, name: input.name, nameAr: input.nameAr ?? null, description: input.description ?? null,
    categoryId: input.categoryId ?? null, brandId: input.brandId ?? null, unitId: input.unitId ?? null,
    barcode: input.barcode ?? null, productType: input.productType ?? "goods", purchasePrice: input.purchasePrice ?? "0",
    salePrice: input.salePrice ?? "0", costMethod: input.costMethod ?? "fifo", reorderLevel: input.reorderLevel ?? null,
    isActive: true, isTaxable: input.isTaxable !== false, taxRate: input.taxRate ?? "0", version: 1,
  });
  return { id, success: true };
}

function warehouseList() {
  const d = getDb();
  return (d.prepare("SELECT * FROM warehouses WHERE deleted_at IS NULL ORDER BY id ASC").all() as Record<string, unknown>[]).map((r) => {
    const c = camel(r, WAREHOUSE_MAP);
    c.createdAt = new Date(r.created_at as string);
    return c;
  });
}

function warehouseCreate(input: Record<string, unknown>) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID();
  const res = d.prepare("INSERT INTO warehouses (tenant_id, code, name, address, manager_name, phone, is_primary, local_uuid, version, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,1,?,?)").run(
    input.code ?? null, input.name, input.address ?? null, input.managerName ?? null, input.phone ?? null, input.isPrimary ? 1 : 0, localUuid, now(), now()
  );
  const id = Number(res.lastInsertRowid);
  if (input.isPrimary) {
    d.prepare("UPDATE warehouses SET is_primary = 0 WHERE id != ?").run(id);
  }
  d.prepare("INSERT INTO inventory_balances (tenant_id, product_id, warehouse_id, quantity) SELECT 1, id, ?, 0 FROM products WHERE deleted_at IS NULL").run(id);
  return { id, success: true };
}

function inventoryList(input: { warehouseId?: number; lowStock?: boolean } = {}) {
  const d = getDb();
  let sql = `SELECT b.id, b.product_id, b.warehouse_id, b.quantity, b.reserved_quantity, b.avg_cost, b.total_value,
             p.name AS product_name, p.sku AS product_sku, p.reorder_level, w.name AS warehouse_name
             FROM inventory_balances b
             JOIN products p ON p.id = b.product_id AND p.deleted_at IS NULL
             LEFT JOIN warehouses w ON w.id = b.warehouse_id
             WHERE 1=1`;
  const params: unknown[] = [];
  if (input.warehouseId) {
    sql += " AND b.warehouse_id = ?";
    params.push(input.warehouseId);
  }
  if (input.lowStock) {
    sql += " AND b.quantity <= 10";
  }
  sql += " ORDER BY p.name ASC";
  return (d.prepare(sql).all(...params) as Record<string, unknown>[]).map((r) => ({
    id: r.id, productId: r.product_id, warehouseId: r.warehouse_id, quantity: Number(r.quantity ?? 0),
    reservedQuantity: Number(r.reserved_quantity ?? 0), avgCost: String(r.avg_cost ?? "0"), totalValue: String(r.total_value ?? "0"),
    productName: r.product_name, productSku: r.product_sku, warehouseName: r.warehouse_name, reorderLevel: r.reorder_level,
  }));
}

// customers
function customerList(input: { search?: string } = {}) {
  const d = getDb();
  let sql = "SELECT * FROM customers WHERE deleted_at IS NULL";
  const params: unknown[] = [];
  if (input.search) {
    sql += " AND (name LIKE ? OR phone LIKE ? OR tax_number LIKE ?)";
    params.push(`%${input.search}%`, `%${input.search}%`, `%${input.search}%`);
  }
  sql += " ORDER BY created_at DESC";
  return (d.prepare(sql).all(...params) as Record<string, unknown>[]).map((r) => {
    const c = camel(r, CUSTOMER_MAP);
    c.createdAt = new Date(r.created_at as string);
    c.updatedAt = new Date(r.updated_at as string);
    return c;
  });
}

function customerCreate(input: Record<string, unknown>) {
  const d = getDb();
  if (!input.name) throw new ApiError("name is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID();
  const creditLimit = input.creditLimit === "" ? "0" : (input.creditLimit ?? "0");
  const openingBalance = input.openingBalance === "" ? "0" : (input.openingBalance ?? "0");
  const res = d.prepare(
    `INSERT INTO customers (tenant_id, code, name, name_ar, email, phone, mobile, address, city, country, tax_number,
      credit_limit, current_balance, payment_terms, customer_type, notes, is_active, local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,1,?,?)`
  ).run(
    input.code ?? `CUST-${Date.now()}`, input.name, input.nameAr ?? null, input.email ?? null, input.phone ?? null,
    input.mobile ?? null, input.address ?? null, input.city ?? null, input.country ?? null, input.taxNumber ?? null,
    creditLimit, openingBalance, input.paymentTerms ?? 30, input.customerType ?? "b2b", input.notes ?? null,
    localUuid, now(), now()
  );
  const id = Number(res.lastInsertRowid);
  enqueue(d, "customers", String(id), localUuid, "create", {
    id, code: input.code ?? `CUST-${Date.now()}`, name: input.name, nameAr: input.nameAr ?? null, email: input.email ?? null,
    phone: input.phone ?? null, mobile: input.mobile ?? null, address: input.address ?? null, city: input.city ?? null,
    country: input.country ?? null, taxNumber: input.taxNumber ?? null, creditLimit, currentBalance: openingBalance,
    paymentTerms: input.paymentTerms ?? 30, isActive: true, version: 1,
  });
  return { id, success: true };
}

function customerUpdate(input: Record<string, unknown>) {
  const d = getDb();
  if (!input.id) throw new ApiError("id is required", { code: "BAD_REQUEST" });
  const existing = d.prepare("SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL").get(input.id) as Record<string, unknown> | undefined;
  if (!existing) throw new ApiError("Customer not found", { code: "NOT_FOUND", httpStatus: 404 });
  const fields: Record<string, unknown> = {
    name: input.name ?? existing.name,
    name_ar: input.nameAr ?? existing.name_ar,
    email: input.email ?? existing.email,
    phone: input.phone ?? existing.phone,
    mobile: input.mobile ?? existing.mobile,
    address: input.address ?? existing.address,
    city: input.city ?? existing.city,
    country: input.country ?? existing.country,
    tax_number: input.taxNumber ?? existing.tax_number,
    credit_limit: input.creditLimit === "" ? "0" : (input.creditLimit ?? existing.credit_limit),
    payment_terms: input.paymentTerms ?? existing.payment_terms,
    customer_type: input.customerType ?? existing.customer_type,
    notes: input.notes ?? existing.notes,
    is_active: input.isActive !== undefined ? (input.isActive ? 1 : 0) : existing.is_active,
    updated_at: now(),
  };
  const setSql = Object.keys(fields).map((k) => `${k} = @${k}`).join(", ");
  d.prepare(`UPDATE customers SET ${setSql} WHERE id = @id`).run({ ...fields, id: input.id });
  const newVersion = (existing.version as number) + 1;
  d.prepare("UPDATE customers SET version = ? WHERE id = ?").run(newVersion, input.id);
  enqueue(d, "customers", String(input.id), existing.local_uuid as string, "update", {
    id: input.id, name: fields.name, nameAr: fields.name_ar, email: fields.email, phone: fields.phone,
    mobile: fields.mobile, address: fields.address, city: fields.city, country: fields.country,
    taxNumber: fields.tax_number, creditLimit: fields.credit_limit, paymentTerms: fields.payment_terms,
    isActive: Boolean(fields.is_active), version: newVersion,
  });
  return { id: input.id, success: true };
}

// invoices
function invoiceList(input: { status?: string; customerId?: number } = {}) {
  const d = getDb();
  let sql = "SELECT * FROM invoices WHERE deleted_at IS NULL";
  const params: unknown[] = [];
  if (input.status) {
    sql += " AND status = ?";
    params.push(input.status);
  }
  if (input.customerId) {
    sql += " AND customer_id = ?";
    params.push(input.customerId);
  }
  sql += " ORDER BY created_at DESC";
  return (d.prepare(sql).all(...params) as Record<string, unknown>[]).map((r) => {
    const row = invoiceListRow(d, r);
    row.createdAt = new Date(r.created_at as string);
    return row;
  });
}

function invoiceGet(input: { id: number }) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id) as Record<string, unknown> | undefined;
  if (!r) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  const invoice = camel(r, INVOICE_MAP);
  invoice.createdAt = new Date(r.created_at as string);
  const items = (d.prepare("SELECT * FROM invoice_items WHERE invoice_id = ? AND deleted_at IS NULL ORDER BY id ASC").all(input.id) as Record<string, unknown>[]).map((it) => {
    const c = camel(it, ITEM_MAP);
    c.createdAt = new Date(it.created_at as string);
    return c;
  });
  const customer = r.customer_id ? (d.prepare("SELECT * FROM customers WHERE id = ?").get(r.customer_id) as Record<string, unknown> | undefined) : undefined;
  const company = d.prepare("SELECT * FROM company_settings WHERE id = 1").get() as Record<string, unknown> | undefined;
  return {
    invoice,
    items,
    customer: customer ? { ...camel(customer, CUSTOMER_MAP), createdAt: new Date(customer.created_at as string), updatedAt: new Date(customer.updated_at as string) } : null,
    company: company ? { id: company.id, tenantId: 1, companyName: company.company_name, companyNameAr: company.company_name_ar, tradeName: company.trade_name, email: company.email, phone: company.phone, mobile: company.mobile, website: company.website, address: company.address, city: company.city, country: company.country, zipCode: company.zip_code, taxNumber: company.tax_number, crNumber: company.cr_number, vatRate: company.vat_rate, defaultCurrency: company.default_currency, invoicePrefix: company.invoice_prefix, invoiceTerms: company.invoice_terms, theme: company.theme, primaryColor: company.primary_color, logo: company.logo, favicon: company.favicon, zatcaEnabled: Boolean(company.zatca_enabled), zatcaSandbox: Boolean(company.zatca_sandbox), createdAt: new Date(company.created_at as string), updatedAt: new Date(company.updated_at as string) } : null,
  };
}

function isIssuedOrLocked(inv: Record<string, unknown>): boolean {
  return ["paid", "partial", "credit_note", "cancelled"].includes(inv.status as string) || Boolean(inv.zatca_xml);
}

function makeQrBase64(inv: Record<string, unknown>): string {
  const payload = JSON.stringify({ seller: "YASCO", vat: "", date: inv.date, total: inv.total_amount, tax: inv.tax_amount, pending: true });
  return Buffer.from(payload).toString("base64");
}

function invoiceCreate(input: Record<string, unknown>) {
  const d = getDb();
  if (!input.invoiceNumber) throw new ApiError("invoiceNumber is required", { code: "BAD_REQUEST" });
  const localUuid = randomUUID();
  const cs = d.prepare("SELECT country, tax_number FROM company_settings WHERE id = 1").get() as { country: string; tax_number: string };
  const isSaudi = cs?.country === "Saudi Arabia" || cs?.country === "SA";
  const taxAmount = input.taxAmount ?? (input.taxPercent ? (Number(input.subTotal) * Number(input.taxPercent)) / 100 : "0");
  let zatcaStatus: string | null = null;
  let qr: string | null = null;
  if (isSaudi) {
    zatcaStatus = "pending_local";
    qr = makeQrBase64({ date: input.date, total_amount: input.totalAmount, tax_amount: taxAmount });
  } else {
    qr = makeQrBase64({ date: input.date, total_amount: input.totalAmount, tax_amount: taxAmount });
  }
  let customerId: number | null = null;
  if (input.customerId) {
    const cust = d.prepare("SELECT id, local_uuid FROM customers WHERE id = ? AND deleted_at IS NULL").get(input.customerId) as { id: number; local_uuid: string } | undefined;
    if (cust) customerId = cust.id;
  } else {
    const walkin = d.prepare("SELECT id FROM customers WHERE name = 'WALK-IN' AND deleted_at IS NULL LIMIT 1").get() as { id: number } | undefined;
    if (walkin) customerId = walkin.id;
  }
  const res = d.prepare(
    `INSERT INTO invoices (tenant_id, invoice_number, invoice_type, customer_id, date, due_date, sub_total, discount_amount, tax_amount,
      tax_percent, shipping_amount, total_amount, paid_amount, balance_due, zatca_qr_code, zatca_status, notes, status, created_by,
      local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`
  ).run(
    input.invoiceNumber, input.invoiceType ?? "standard", customerId, input.date, input.dueDate ?? null,
    input.subTotal ?? "0", input.discountAmount ?? "0", taxAmount, input.taxPercent ?? "0",
    input.shippingAmount ?? "0", input.totalAmount ?? "0", "0", input.totalAmount ?? "0", qr, zatcaStatus,
    input.notes ?? null, "draft", 1, localUuid, now(), now()
  );
  const id = Number(res.lastInsertRowid);
  const items = (input.items ?? []) as Array<Record<string, unknown>>;
  for (const it of items) {
    d.prepare(
      `INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total_amount, local_uuid, version, created_at, updated_at)
       VALUES (1,?,?,?,?,?,?,?,?,?,1,?,?)`
    ).run(id, it.productId ?? null, it.description ?? null, String(it.quantity ?? 0), String(it.unitPrice ?? 0),
      String(it.discountPercent ?? 0), String(it.taxPercent ?? 0), String(it.totalAmount ?? 0), randomUUID(), now(), now());
  }
  enqueue(d, "invoices", String(id), localUuid, "create", {
    id, invoiceNumber: input.invoiceNumber, invoiceType: input.invoiceType ?? "standard",
    customerId: customerId ? (d.prepare("SELECT server_id FROM customers WHERE id = ?").get(customerId) as { server_id: number | null }).server_id : null,
    date: input.date, dueDate: input.dueDate ?? null, subTotal: input.subTotal ?? "0", discountAmount: input.discountAmount ?? "0",
    taxAmount: String(taxAmount), taxPercent: input.taxPercent ?? "0", shippingAmount: input.shippingAmount ?? "0",
    totalAmount: input.totalAmount ?? "0", notes: input.notes ?? null, status: "draft", version: 1,
    __invoiceLocalUuid: localUuid,
    __items: (items ?? []).map((it) => ({
      productId: it.productId ?? null, description: it.description ?? null, quantity: it.quantity ?? 0,
      unitPrice: it.unitPrice ?? 0, discountPercent: it.discountPercent ?? 0,
      taxPercent: it.taxPercent ?? 0, totalAmount: it.totalAmount ?? 0,
    })),
  });
  return { id, success: true };
}

function invoiceUpdate(input: Record<string, unknown>) {
  const d = getDb();
  if (!input.id) throw new ApiError("id is required", { code: "BAD_REQUEST" });
  const existing = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id) as Record<string, unknown> | undefined;
  if (!existing) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  if (isIssuedOrLocked(existing)) throw new ApiError("Invoice cannot be updated after payment, cancellation or ZATCA clearance", { code: "BAD_REQUEST" });
  const fields: Record<string, unknown> = {
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
    updated_at: now(),
  };
  const setSql = Object.keys(fields).map((k) => `${k} = @${k}`).join(", ");
  d.prepare(`UPDATE invoices SET ${setSql} WHERE id = @id`).run({ ...fields, id: input.id });
  const newVersion = (existing.version as number) + 1;
  d.prepare("UPDATE invoices SET version = ? WHERE id = ?").run(newVersion, input.id);
  if (input.items && Array.isArray(input.items)) {
    d.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(input.id);
    for (const it of input.items as Array<Record<string, unknown>>) {
      d.prepare(
        `INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total_amount, local_uuid, version, created_at, updated_at)
         VALUES (1,?,?,?,?,?,?,?,?,?,1,?,?)`
      ).run(input.id, it.productId ?? null, it.description ?? null, String(it.quantity ?? 0), String(it.unitPrice ?? 0),
        String(it.discountPercent ?? 0), String(it.taxPercent ?? 0), String(it.totalAmount ?? 0), randomUUID(), now(), now());
    }
  }
  enqueue(d, "invoices", String(input.id), existing.local_uuid as string, "update", {
    id: input.id, invoiceNumber: fields.invoice_number, invoiceType: fields.invoice_type,
    customerId: fields.customer_id, date: fields.date, dueDate: fields.due_date, subTotal: fields.sub_total,
    discountAmount: fields.discount_amount, taxAmount: fields.tax_amount, taxPercent: fields.tax_percent,
    totalAmount: fields.total_amount, notes: fields.notes, status: existing.status, version: newVersion,
    __invoiceLocalUuid: existing.local_uuid,
    __items: input.items ?? [],
  });
  return { id: input.id, success: true };
}

function invoiceUpdateStatus(input: { id: number; status: string }) {
  const d = getDb();
  const existing = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id) as Record<string, unknown> | undefined;
  if (!existing) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  d.prepare("UPDATE invoices SET status = ?, updated_at = ? WHERE id = ?").run(input.status, now(), input.id);
  return { success: true };
}

function invoiceDelete(input: { id: number }) {
  const d = getDb();
  const existing = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.id) as Record<string, unknown> | undefined;
  if (!existing) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  if (isIssuedOrLocked(existing)) throw new ApiError("Invoice cannot be deleted after payment, cancellation or ZATCA clearance", { code: "BAD_REQUEST" });
  d.prepare("UPDATE invoices SET deleted_at = ?, updated_at = ? WHERE id = ?").run(now(), now(), input.id);
  enqueue(d, "invoices", String(input.id), existing.local_uuid as string, "delete", { id: input.id, version: (existing.version as number) + 1 });
  return { success: true };
}

// POS
function posCreateSale(input: Record<string, unknown>) {
  const d = getDb();
  const invoiceNumber = `POS-${Date.now()}`;
  const localUuid = randomUUID();
  let customerId: number | null = null;
  if (input.customerId) {
    const cust = d.prepare("SELECT id, local_uuid, server_id FROM customers WHERE id = ? AND deleted_at IS NULL").get(input.customerId) as { id: number; server_id: number | null } | undefined;
    if (cust) customerId = cust.id;
  } else {
    const walkin = d.prepare("SELECT id FROM customers WHERE name = 'WALK-IN' AND deleted_at IS NULL LIMIT 1").get() as { id: number } | undefined;
    if (walkin) customerId = walkin.id;
  }
  const items = (input.items ?? []) as Array<Record<string, unknown>>;
  const res = d.prepare(
    `INSERT INTO invoices (tenant_id, invoice_number, invoice_type, customer_id, date, sub_total, discount_amount, tax_amount,
      total_amount, paid_amount, balance_due, status, zatca_status, created_by, local_uuid, version, created_at, updated_at)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`
  ).run(
    invoiceNumber, "simplified", customerId, input.date, String(input.subtotal ?? "0"), String(input.discountAmount ?? "0"),
    String(input.taxAmount ?? "0"), String(input.totalAmount ?? "0"), String(input.paymentAmount ?? input.totalAmount ?? "0"),
    String(Math.max(0, Number(input.totalAmount ?? 0) - Number(input.paymentAmount ?? input.totalAmount ?? 0)).toFixed(4)),
    "paid", "pending_local", 1, localUuid, now(), now()
  );
  const id = Number(res.lastInsertRowid);
  for (const it of items) {
    const productId = it.productId as number;
    const desc = (it.description as string) || (productId ? `Item #${productId}` : "POS Sale");
    d.prepare(
      `INSERT INTO invoice_items (tenant_id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_percent, total_amount, local_uuid, version, created_at, updated_at)
       VALUES (1,?,?,?,?,?,?,?,?,?,1,?,?)`
    ).run(id, productId ?? null, desc, String(it.quantity ?? 0), String(it.unitPrice ?? 0),
      String(it.discount ?? 0), String(it.taxRate ?? 0), String(it.totalAmount ?? 0), randomUUID(), now(), now());
    if (productId) {
      const balances = d.prepare("SELECT id, quantity FROM inventory_balances WHERE product_id = ? ORDER BY id ASC").all(productId) as Array<{ id: number; quantity: number }>;
      let remaining = Number(it.quantity ?? 0);
      for (const b of balances) {
        if (remaining <= 0) break;
        const take = Math.min(b.quantity, remaining);
        d.prepare("UPDATE inventory_balances SET quantity = MAX(0, quantity - ?) WHERE id = ?").run(take, b.id);
        remaining -= take;
      }
      d.prepare("INSERT INTO stock_movements (tenant_id, product_id, qty_change, reason, ref_type, ref_id, created_at) VALUES (1,?,?,?,?,?,?)").run(
        productId, -Number(it.quantity ?? 0), "POS sale", "invoice", id, now()
      );
    }
  }
  if (Number(input.paymentAmount ?? 0) > 0) {
    const latest = d.prepare("SELECT balance_after FROM cashbox_transactions ORDER BY id DESC LIMIT 1").get() as { balance_after: string } | undefined;
    const before = Number(latest?.balance_after ?? 0);
    d.prepare("INSERT INTO cashbox_transactions (tenant_id, transaction_number, type, amount, balance_before, balance_after, status, created_at) VALUES (1,?,?,?,?,?,?,?)").run(
      `CB-${Date.now()}`, "sale", String(input.paymentAmount ?? 0), String(before), String(before + Number(input.paymentAmount ?? 0)), "completed", now()
    );
  }
  const customerServerId = customerId ? ((d.prepare("SELECT server_id FROM customers WHERE id = ?").get(customerId) as { server_id: number | null }).server_id) : undefined;
  enqueue(d, "sales", String(id), localUuid, "create", {
    saleNumber: invoiceNumber, customerId: customerServerId ?? undefined, date: input.date,
    items: items.map((it) => ({
      productId: it.productId ?? null, description: it.description ?? null, quantity: it.quantity ?? 0,
      unitPrice: it.unitPrice ?? 0, discount: it.discount ?? 0, taxRate: it.taxRate ?? 0, totalAmount: it.totalAmount ?? 0,
    })),
    subtotal: input.subtotal ?? "0", taxAmount: input.taxAmount ?? "0", discountAmount: input.discountAmount ?? "0",
    totalAmount: input.totalAmount ?? "0", paymentAmount: input.paymentAmount ?? input.totalAmount ?? "0",
    paymentMethod: input.paymentMethod ?? "cash", invoiceType: "zatca", version: 1,
  });
  return { id, invoiceNumber, success: true };
}

function todaySalesSummary() {
  const d = getDb();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const rows = d.prepare("SELECT total_amount FROM invoices WHERE deleted_at IS NULL AND status != 'cancelled' AND created_at >= ?").all(today.toISOString()) as Array<{ total_amount: string }>;
  const totalSales = rows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  return { totalSales, count: rows.length, cashTotal: 0, cardTotal: 0, transferTotal: 0 };
}

function sessionCurrent() {
  return null;
}

function heldSalesList() {
  const d = getDb();
  return (d.prepare("SELECT * FROM pos_holds WHERE status = 'held' ORDER BY created_at DESC").all() as Record<string, unknown>[]).map((r) => ({
    id: r.id, tenantId: 1, userId: r.user_id, holdNumber: r.hold_number, customerId: r.customer_id,
    items: JSON.parse((r.items as string) || "[]"), subtotal: r.subtotal, taxAmount: r.tax_amount,
    discountAmount: r.discount_amount, totalAmount: r.total_amount, notes: r.notes, status: r.status,
    createdAt: new Date(r.created_at as string), updatedAt: new Date(r.updated_at as string),
  }));
}

function holdSale(input: Record<string, unknown>) {
  const d = getDb();
  const holdNumber = `HLD-${Date.now()}`;
  const res = d.prepare("INSERT INTO pos_holds (tenant_id, user_id, hold_number, customer_id, items, subtotal, tax_amount, discount_amount, total_amount, notes, status, created_at, updated_at) VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?)").run(
    1, holdNumber, input.customerId ?? null, JSON.stringify(input.items ?? []), String(input.subtotal ?? "0"),
    String(input.taxAmount ?? "0"), String(input.discountAmount ?? "0"), String(input.totalAmount ?? "0"),
    input.notes ?? null, "held", now(), now()
  );
  return { id: Number(res.lastInsertRowid), holdNumber, success: true };
}

function resumeHold(input: { id: number }) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM pos_holds WHERE id = ?").get(input.id) as Record<string, unknown> | undefined;
  if (!r) throw new ApiError("Hold not found", { code: "NOT_FOUND", httpStatus: 404 });
  d.prepare("UPDATE pos_holds SET status = 'resumed', updated_at = ? WHERE id = ?").run(now(), input.id);
  return {
    id: r.id, tenantId: 1, userId: r.user_id, holdNumber: r.hold_number, customerId: r.customer_id,
    items: JSON.parse((r.items as string) || "[]"), subtotal: r.subtotal, taxAmount: r.tax_amount,
    discountAmount: r.discount_amount, totalAmount: r.total_amount, notes: r.notes, status: r.status,
    createdAt: new Date(r.created_at as string), updatedAt: new Date(r.updated_at as string),
  };
}

// thermal
function generateThermal(input: { invoiceId: number; format?: "80mm" | "58mm" }) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.invoiceId) as Record<string, unknown> | undefined;
  if (!r) throw new ApiError("Invoice not found");
  const cs = d.prepare("SELECT * FROM company_settings WHERE id = 1").get() as Record<string, unknown> | undefined;
  if (!cs) throw new ApiError("Company settings not found");
  const items = d.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?").all(input.invoiceId) as Array<Record<string, unknown>>;
  const customer = r.customer_id ? (d.prepare("SELECT name FROM customers WHERE id = ?").get(r.customer_id) as { name: string } | undefined) : undefined;
  const data: ThermalInvoiceData = {
    companyNameAr: (cs.company_name_ar as string) || "",
    companyNameEn: (cs.company_name as string) || "YASCO",
    vatNumber: (cs.tax_number as string) || "",
    address: (cs.address as string) || undefined,
    invoiceNumber: r.invoice_number as string,
    date: (r.date as string) || new Date().toISOString().slice(0, 10),
    customerName: customer?.name,
    items: items.map((it) => ({
      description: it.description as string,
      qty: Number(it.quantity ?? 0),
      unitPrice: Number(it.unit_price ?? 0),
      total: Number(it.total_amount ?? 0),
    })),
    subtotal: Number(r.sub_total ?? 0),
    vatAmount: Number(r.tax_amount ?? 0),
    grandTotal: Number(r.total_amount ?? 0),
    qrData: (r.zatca_qr_code as string) || "YASCO",
    isSimplified: true,
  };
  const format = input.format ?? "80mm";
  const buffer = generate80mmThermal(data);
  return { success: true, data: buffer.toString("base64"), format, message: `Thermal receipt (${format}) generated successfully` };
}

// settings
function companySettingsGet() {
  const d = getDb();
  const r = d.prepare("SELECT * FROM company_settings WHERE id = 1").get() as Record<string, unknown> | undefined;
  if (!r) return null;
  return {
    id: r.id, tenantId: 1, companyName: r.company_name, companyNameAr: r.company_name_ar, tradeName: r.trade_name,
    email: r.email, phone: r.phone, mobile: r.mobile, website: r.website, address: r.address, city: r.city,
    country: r.country, zipCode: r.zip_code, taxNumber: r.tax_number, crNumber: r.cr_number, vatRate: r.vat_rate,
    defaultCurrency: r.default_currency, invoicePrefix: r.invoice_prefix, invoiceTerms: r.invoice_terms,
    theme: r.theme, primaryColor: r.primary_color, logo: r.logo, favicon: r.favicon,
    zatcaEnabled: Boolean(r.zatca_enabled), zatcaSandbox: Boolean(r.zatca_sandbox),
    createdAt: new Date(r.created_at as string), updatedAt: new Date(r.updated_at as string),
  };
}

// dashboard
function dashboardStats() {
  const d = getDb();
  const sales = (d.prepare("SELECT SUM(total_amount) AS s FROM invoices WHERE status != 'cancelled' AND deleted_at IS NULL").get() as { s: string | null })?.s ?? "0";
  const customers = (d.prepare("SELECT COUNT(*) AS c FROM customers WHERE deleted_at IS NULL").get() as { c: number })?.c ?? 0;
  const products = (d.prepare("SELECT COUNT(*) AS c FROM products WHERE deleted_at IS NULL").get() as { c: number })?.c ?? 0;
  const invoices = (d.prepare("SELECT COUNT(*) AS c FROM invoices WHERE deleted_at IS NULL").get() as { c: number })?.c ?? 0;
  return { totalSales: Number(sales), totalCustomers: customers, totalProducts: products, totalInvoices: invoices };
}

function dashboardRevenueByMonth() {
  return [];
}

function dashboardRecentInvoices(input: { limit?: number } = {}) {
  const d = getDb();
  const limit = input.limit ?? 5;
  const rows = d.prepare("SELECT * FROM invoices WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ?").all(limit) as Record<string, unknown>[];
  return rows.map((r) => invoiceListRow(d, r));
}

function dashboardTopCustomers() {
  return [];
}

function zatcaDashboard() {
  const d = getDb();
  const cleared = (d.prepare("SELECT COUNT(*) AS c FROM invoices WHERE zatca_status = 'cleared' AND deleted_at IS NULL").get() as { c: number })?.c ?? 0;
  const pending = (d.prepare("SELECT COUNT(*) AS c FROM invoices WHERE zatca_status IN ('pending', 'pending_local') AND deleted_at IS NULL").get() as { c: number })?.c ?? 0;
  return { clearedCount: cleared, pendingCount: pending, rejectedCount: 0 };
}

// zatca (offline stubs — real clearance via sync engine against remote)
function zatcaGenerateQrCode(input: { invoiceId: number; invoiceMode?: string }) {
  const d = getDb();
  const r = d.prepare("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL").get(input.invoiceId) as Record<string, unknown> | undefined;
  if (!r) throw new ApiError("Invoice not found", { code: "NOT_FOUND", httpStatus: 404 });
  const qr = makeQrBase64(r);
  d.prepare("UPDATE invoices SET zatca_qr_code = ?, zatca_status = 'pending_local', updated_at = ? WHERE id = ?").run(qr, now(), input.id);
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  return { invoiceId: input.invoiceId, qrCodeBase64: qr, qrImageDataUrl: png, invoiceHash: "" };
}

function zatcaSyncStatus(input: { invoiceId: number }) {
  const d = getDb();
  const r = d.prepare("SELECT zatca_status FROM invoices WHERE id = ?").get(input.invoiceId) as { zatca_status: string | null } | undefined;
  if (!r) return { invoiceId: input.invoiceId, status: "draft" };
  return { invoiceId: input.invoiceId, status: r.zatca_status ?? "draft" };
}

// sync (answered against local queue — mirrors server protocol surface)
function syncRegisterDevice(input: { deviceId: string; deviceName?: string; platform?: string; appVersion?: string }) {
  const d = getDb();
  const existing = d.prepare("SELECT device_id FROM devices WHERE device_id = ?").get(input.deviceId);
  const message = existing ? "Device updated" : "Device registered";
  d.prepare(
    "INSERT OR REPLACE INTO devices (device_id, device_name, platform, tenant_id, app_version, is_active, last_seen, created_at) VALUES (?,?,?,1,?,1,?,?)"
  ).run(input.deviceId, input.deviceName ?? null, input.platform ?? null, input.appVersion ?? null, now(), now());
  return { deviceId: input.deviceId, registered: true, message };
}

function syncPush() {
  return { results: [], conflicts: [], serverTime: new Date().toISOString() };
}

function syncPull(input: { since?: string }) {
  return { data: { products: [], customers: [], invoices: [], invoiceItems: [], sales: [] }, tombstones: [], serverTime: new Date().toISOString() };
}

function syncResolveConflict(input: { entityType: string; localUuid: string; resolution: "keep_local" | "keep_server" | "merge"; mergedPayload?: unknown }) {
  const d = getDb();
  const conflict = d.prepare("SELECT * FROM sync_conflicts WHERE local_uuid = ? AND resolved = 0 ORDER BY id DESC LIMIT 1").get(input.localUuid) as Record<string, unknown> | undefined;
  if (conflict) {
    d.prepare("UPDATE sync_conflicts SET resolved = 1, resolution = ? WHERE id = ?").run(input.resolution, conflict.id);
    if (conflict.queue_id) {
      const queueItem = d.prepare("SELECT * FROM sync_queue WHERE id = ?").get(conflict.queue_id) as Record<string, unknown> | undefined;
      if (queueItem) {
        if (input.resolution === "keep_local" || input.resolution === "merge") {
          let payload: Record<string, unknown>;
          if (input.resolution === "merge" && input.mergedPayload) {
            payload = input.mergedPayload as Record<string, unknown>;
          } else {
            payload = JSON.parse(queueItem.payload_json as string);
          }
          payload.version = (Number(payload.version ?? 1) || 1) + 1;
          d.prepare("UPDATE sync_queue SET payload_json = ?, status = 'pending', error = NULL, attempts = 0, updated_at = ? WHERE id = ?").run(
            JSON.stringify(payload), now(), conflict.queue_id
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
  const devices = (d.prepare("SELECT * FROM devices ORDER BY last_seen DESC").all() as Record<string, unknown>[]).map((r) => ({
    id: r.id, deviceId: r.device_id, deviceName: r.device_name, platform: r.platform, userId: r.user_id,
    tenantId: 1, lastSeen: r.last_seen ? new Date(r.last_seen as string) : null,
    lastSyncAt: r.last_sync_at ? new Date(r.last_sync_at as string) : null,
    appVersion: r.app_version, isActive: Boolean(r.is_active), createdAt: new Date(r.created_at as string),
  }));
  return { devices, serverTime: new Date().toISOString() };
}

function syncListDevices() {
  const d = getDb();
  return (d.prepare("SELECT * FROM devices ORDER BY last_seen DESC").all() as Record<string, unknown>[]).map((r) => ({
    id: r.id, deviceId: r.device_id, deviceName: r.device_name, platform: r.platform, userId: r.user_id,
    tenantId: 1, lastSeen: r.last_seen ? new Date(r.last_seen as string) : null,
    lastSyncAt: r.last_sync_at ? new Date(r.last_sync_at as string) : null,
    appVersion: r.app_version, isActive: Boolean(r.is_active), createdAt: new Date(r.created_at as string),
  }));
}

function syncDeactivateDevice(input: { deviceId: string }) {
  const d = getDb();
  d.prepare("UPDATE devices SET is_active = 0 WHERE device_id = ?").run(input.deviceId);
  return { success: true };
}

// ---------- registry ----------

export interface RequestLike {
  headers: Record<string, string | undefined>;
  cookies: Record<string, string>;
}

export type Handler = (input: unknown, req: RequestLike, setCookie: (name: string, value: string, opts: Record<string, unknown>) => void) => unknown | Promise<unknown>;

export const MUTATIONS = new Set<string>([
  "auth.passwordLogin", "auth.logout",
  "inventory.categoryCreate", "inventory.productCreate", "inventory.warehouseCreate",
  "sales.customerCreate", "sales.customerUpdate", "sales.invoiceCreate", "sales.invoiceUpdate",
  "sales.invoiceUpdateStatus", "sales.invoiceDelete",
  "pos.createSaleInvoice", "pos.holdSale", "pos.resumeHold",
  "zatca.generateQrCode", "zatca.syncStatus", "zatca.reportInvoice", "zatca.clearanceInvoice", "zatca.signInvoice", "zatca.generateXml",
  "sync.registerDevice", "sync.push", "sync.pull", "sync.resolveConflict", "sync.deactivateDevice",
]);

export const AUTH_REQUIRED = new Set<string>([
  "inventory.categoryList", "inventory.categoryCreate", "inventory.productList", "inventory.productCreate",
  "inventory.warehouseList", "inventory.warehouseCreate", "inventory.inventoryList",
  "sales.customerList", "sales.customerCreate", "sales.customerUpdate",
  "sales.invoiceList", "sales.invoiceGet", "sales.invoiceCreate", "sales.invoiceUpdate",
  "sales.invoiceUpdateStatus", "sales.invoiceDelete",
  "pos.createSaleInvoice", "pos.todaySalesSummary", "pos.sessionCurrent", "pos.heldSalesList", "pos.holdSale", "pos.resumeHold",
  "thermalPrint.generateThermal",
  "settings.companySettingsGet",
  "zatca.generateQrCode", "zatca.syncStatus", "zatca.dashboard",
  "dashboard.stats", "dashboard.revenueByMonth", "dashboard.recentInvoices", "dashboard.topCustomers",
  "sync.registerDevice", "sync.push", "sync.pull", "sync.resolveConflict", "sync.status", "sync.listDevices", "sync.deactivateDevice",
]);

export const handlers: Record<string, Handler> = {
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
  "sync.deactivateDevice": syncDeactivateDevice,
};

export function authMeHandler(req: RequestLike) {
  return me(req);
}

export { findUserByUnionId, createLocalUser, hashPassword, verifyPassword };
