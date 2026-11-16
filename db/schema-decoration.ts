/**
 * YASCO ERP — Decoration / Fit-Out Module schema
 * ─────────────────────────────────────────────────────────────────────────────
 * New, self-contained module: Construction · False Ceiling · Wall Sealing ·
 * Interior Decoration  (the "Decoration Suite").
 *
 * HARD RULES (from product owner):
 *   1. NEVER modify or drop an existing table. This file only ADDS tables.
 *   2. Every table is prefixed `dc_` so it can never collide with the legacy
 *      construction module (`construction_projects`, `boq_items`, …).
 *   3. Every business table is tenant-scoped (`tenant_id`), soft-deletable
 *      (`deleted_at`) and audited (`created_by`, `updated_by`).
 *   4. Where an existing module owns the master record (customer, supplier,
 *      employee, inventory item, invoice) we keep a REFERENCE column
 *      (`customer_id`, `vendor_id`, `item_id`, …) instead of duplicating it.
 *
 * Conventions mirror `db/schema.ts` exactly:
 *   serial PK · bigint tenant FK · snake_case columns · decimal(18,4) money ·
 *   varchar lengths · mysqlEnum status · created_at/updated_at · index() in the
 *   3rd argument array.
 */
import {
  mysqlTable,
  serial,
  varchar,
  text,
  mediumtext,
  timestamp,
  bigint,
  int,
  decimal,
  boolean,
  mysqlEnum,
  date,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/* ────────────────────────────────────────────────────────────────────────────
 * Reusable column builders
 * ──────────────────────────────────────────────────────────────────────────── */
const tenant = () => bigint("tenant_id", { mode: "number", unsigned: true }).notNull();
const createdBy = () => bigint("created_by", { mode: "number", unsigned: true });
const updatedBy = () => bigint("updated_by", { mode: "number", unsigned: true });
const createdAt = () => timestamp("created_at").defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date());
const deletedAt = () => timestamp("deleted_at");
const money = (name: string) => decimal(name, { precision: 18, scale: 4 }).default("0").notNull();
const qty = (name: string) => decimal(name, { precision: 18, scale: 4 }).default("0").notNull();
const pct = (name: string) => decimal(name, { precision: 7, scale: 3 }).default("0").notNull();
const day = (name: string) => date(name, { mode: "string" });

/* ════════════════════════════════════════════════════════════════════════════
 * 1. MASTER DATA
 * ════════════════════════════════════════════════════════════════════════════ */

/** 1.1 Clients / owners. `customerId` links to the CRM customer master. */
export const dcClients = mysqlTable("dc_clients", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  crNumber: varchar("cr_number", { length: 40 }),
  vatNumber: varchar("vat_number", { length: 40 }),
  nationalAddress: varchar("national_address", { length: 255 }),
  buildingNo: varchar("building_no", { length: 20 }),
  streetEn: varchar("street_en", { length: 255 }),
  streetAr: varchar("street_ar", { length: 255 }),
  districtEn: varchar("district_en", { length: 120 }),
  districtAr: varchar("district_ar", { length: 120 }),
  city: varchar("city", { length: 120 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 80 }).default("Saudi Arabia").notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  creditLimit: money("credit_limit"),
  paymentTermsDays: int("payment_terms_days").default(30).notNull(),
  rating: mysqlEnum("rating", ["A", "B", "C", "D"]).default("B"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_clients_tenant_idx").on(t.tenantId)]);

/** 1.2 Consultants / main contractors (we act as subcontractor). */
export const dcConsultants = mysqlTable("dc_consultants", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  kind: mysqlEnum("kind", ["consultant", "main_contractor", "supervisor"]).default("consultant").notNull(),
  crNumber: varchar("cr_number", { length: 40 }),
  vatNumber: varchar("vat_number", { length: 40 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_consultants_tenant_idx").on(t.tenantId)]);

/** 1.3 Suppliers. `vendorId` links to the inventory vendor master. */
export const dcSuppliers = mysqlTable("dc_suppliers", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  vendorId: bigint("vendor_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  crNumber: varchar("cr_number", { length: 40 }),
  vatNumber: varchar("vat_number", { length: 40 }),
  bankName: varchar("bank_name", { length: 120 }),
  iban: varchar("iban", { length: 34 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  rating: mysqlEnum("rating", ["A", "B", "C", "D"]).default("B"),
  docExpiryDate: day("doc_expiry_date"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_suppliers_tenant_idx").on(t.tenantId)]);

/** 1.4 Subcontractors (fit-out trades). */
export const dcSubcontractors = mysqlTable("dc_subcontractors", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  trade: varchar("trade", { length: 120 }),
  crNumber: varchar("cr_number", { length: 40 }),
  vatNumber: varchar("vat_number", { length: 40 }),
  bankName: varchar("bank_name", { length: 120 }),
  iban: varchar("iban", { length: 34 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  rating: mysqlEnum("rating", ["A", "B", "C", "D"]).default("B"),
  defaultRetentionPercent: decimal("default_retention_percent", { precision: 5, scale: 2 }).default("10").notNull(),
  docExpiryDate: day("doc_expiry_date"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_subcontractors_tenant_idx").on(t.tenantId)]);

/** 1.5 Labour. Personal/payroll master stays in HR (`employee_id` link). */
export const dcLabour = mysqlTable("dc_labour", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  iqamaNumber: varchar("iqama_number", { length: 30 }),
  iqamaExpiry: day("iqama_expiry"),
  passportNumber: varchar("passport_number", { length: 30 }),
  passportExpiry: day("passport_expiry"),
  nationality: varchar("nationality", { length: 80 }),
  profession: varchar("profession", { length: 120 }),
  labourCategory: mysqlEnum("labour_category", [
    "carpenter", "gypsum_installer", "painter", "helper", "foreman",
    "supervisor", "electrician", "sealer", "tiler", "other",
  ]).default("other").notNull(),
  sponsorship: mysqlEnum("sponsorship", ["company", "supplied", "subcontract"]).default("company").notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  gosiNumber: varchar("gosi_number", { length: 40 }),
  medicalInsuranceExpiry: day("medical_insurance_expiry"),
  workPermitExpiry: day("work_permit_expiry"),
  drivingLicenceExpiry: day("driving_licence_expiry"),
  photoUrl: varchar("photo_url", { length: 500 }),
  dailyRate: money("daily_rate"),
  pieceRatePerM2: money("piece_rate_per_m2"),
  campId: bigint("camp_id", { mode: "number", unsigned: true }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [
  index("dc_labour_tenant_idx").on(t.tenantId),
  index("dc_labour_iqama_idx").on(t.iqamaExpiry),
]);

/** 1.6 Material categories. */
export const dcMaterialCategories = mysqlTable("dc_material_categories", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameAr: varchar("name_ar", { length: 160 }),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  sortOrder: int("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_matcat_tenant_idx").on(t.tenantId)]);

/** 1.7 Materials / items. `itemId` links to the inventory item master. */
export const dcMaterials = mysqlTable("dc_materials", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  itemId: bigint("item_id", { mode: "number", unsigned: true }),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 60 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  specification: text("specification"),
  uom: varchar("uom", { length: 20 }).default("pcs").notNull(),
  altUom: varchar("alt_uom", { length: 20 }),
  altUomFactor: decimal("alt_uom_factor", { precision: 18, scale: 6 }).default("1").notNull(),
  minStockLevel: qty("min_stock_level"),
  reorderLevel: qty("reorder_level"),
  lastCost: money("last_cost"),
  avgCost: money("avg_cost"),
  isBatchTracked: boolean("is_batch_tracked").default(false),
  isExpiryTracked: boolean("is_expiry_tracked").default(false),
  barcode: varchar("barcode", { length: 80 }),
  defaultVatPercent: decimal("default_vat_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [
  index("dc_materials_tenant_idx").on(t.tenantId),
  index("dc_materials_code_idx").on(t.code),
]);

/** 1.8 Equipment & tools. */
export const dcEquipment = mysqlTable("dc_equipment", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  assetId: bigint("asset_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 60 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  kind: mysqlEnum("kind", ["tool", "machine", "vehicle", "scaffolding", "lift", "other"]).default("tool").notNull(),
  ownership: mysqlEnum("ownership", ["owned", "rented"]).default("owned").notNull(),
  plateNumber: varchar("plate_number", { length: 30 }),
  hourlyRate: money("hourly_rate"),
  dailyRate: money("daily_rate"),
  isActive: boolean("is_active").default(true),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_equipment_tenant_idx").on(t.tenantId)]);

/** 1.9 Work Items / BOQ library. */
export const dcWorkLibrary = mysqlTable("dc_work_library", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  code: varchar("code", { length: 60 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  category: mysqlEnum("category", [
    "false_ceiling", "partition", "wall_sealing", "waterproofing", "painting",
    "cornice", "flooring", "wallpaper", "joinery", "glazing", "lighting",
    "electrical", "hvac", "demolition", "other",
  ]).default("other").notNull(),
  uom: varchar("uom", { length: 20 }).default("m2").notNull(),
  materialCost: money("material_cost"),
  labourCost: money("labour_cost"),
  equipmentCost: money("equipment_cost"),
  overheadPercent: pct("overhead_percent"),
  profitPercent: pct("profit_percent"),
  unitRate: money("unit_rate"),
  wbsCode: varchar("wbs_code", { length: 40 }),
  isActive: boolean("is_active").default(true),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [
  index("dc_worklib_tenant_idx").on(t.tenantId),
  index("dc_worklib_cat_idx").on(t.category),
]);

/** 1.10 Work-item material recipe. */
export const dcWorkLibraryMaterials = mysqlTable("dc_work_library_materials", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  consumptionPerUnit: qty("consumption_per_unit"),
  wastagePercent: pct("wastage_percent"),
  createdAt: createdAt(),
}, (t) => [index("dc_wlm_item_idx").on(t.workItemId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 2. PROJECT & SITE MANAGEMENT
 * ════════════════════════════════════════════════════════════════════════════ */

/** 2.1 Fit-out project card. */
export const dcProjects = mysqlTable("dc_projects", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  legacyProjectId: bigint("legacy_project_id", { mode: "number", unsigned: true }),
  projectCode: varchar("project_code", { length: 60 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  clientId: bigint("client_id", { mode: "number", unsigned: true }),
  consultantId: bigint("consultant_id", { mode: "number", unsigned: true }),
  mainContractorId: bigint("main_contractor_id", { mode: "number", unsigned: true }),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }),
  companyId: bigint("company_id", { mode: "number", unsigned: true }),
  contractNumber: varchar("contract_number", { length: 80 }),
  contractValue: money("contract_value"),
  budget: money("budget"),
  actualCost: money("actual_cost"),
  city: varchar("city", { length: 120 }),
  districtEn: varchar("district_en", { length: 120 }),
  districtAr: varchar("district_ar", { length: 120 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  projectManagerId: bigint("project_manager_id", { mode: "number", unsigned: true }),
  startDate: day("start_date"),
  endDate: day("end_date"),
  handoverDate: day("handover_date"),
  progress: pct("progress"),
  status: mysqlEnum("status", [
    "tender", "awarded", "running", "on_hold", "completed", "handed_over", "dlp", "cancelled",
  ]).default("tender").notNull(),
  retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default("10").notNull(),
  advanceAmount: money("advance_amount"),
  vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  description: text("description"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [
  index("dc_projects_tenant_idx").on(t.tenantId),
  index("dc_projects_status_idx").on(t.status),
  uniqueIndex("dc_projects_code_uq").on(t.tenantId, t.projectCode),
]);

/** 2.2 Building / tower. */
export const dcBuildings = mysqlTable("dc_buildings", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameAr: varchar("name_ar", { length: 160 }),
  levels: int("levels"),
  sortOrder: int("sort_order").default(0).notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_buildings_project_idx").on(t.projectId)]);

/** 2.3 Floor. */
export const dcFloors = mysqlTable("dc_floors", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  buildingId: bigint("building_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameAr: varchar("name_ar", { length: 160 }),
  sortOrder: int("sort_order").default(0).notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_floors_building_idx").on(t.buildingId)]);

/** 2.4 Unit / apartment / villa / showroom. */
export const dcUnits = mysqlTable("dc_units", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  buildingId: bigint("building_id", { mode: "number", unsigned: true }),
  floorId: bigint("floor_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameAr: varchar("name_ar", { length: 160 }),
  unitType: mysqlEnum("unit_type", [
    "apartment", "villa", "office", "showroom", "retail", "hotel_room",
    "restaurant", "mosque", "common", "other",
  ]).default("apartment").notNull(),
  areaM2: qty("area_m2"),
  status: mysqlEnum("status", ["draft", "active", "on_hold", "completed", "cancelled"]).default("draft").notNull(),
  progress: pct("progress"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_units_floor_idx").on(t.floorId)]);

/** 2.5 Rooms — the heart of the take-off engine. */
export const dcRooms = mysqlTable("dc_rooms", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  buildingId: bigint("building_id", { mode: "number", unsigned: true }),
  floorId: bigint("floor_id", { mode: "number", unsigned: true }),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameAr: varchar("name_ar", { length: 160 }),
  roomType: mysqlEnum("room_type", [
    "room", "hall", "majlis", "corridor", "toilet", "kitchen", "bathroom",
    "bedroom", "living", "dining", "office", "lobby", "staircase", "balcony", "other",
  ]).default("room").notNull(),
  lengthM: decimal("length_m", { precision: 10, scale: 3 }).default("0").notNull(),
  widthM: decimal("width_m", { precision: 10, scale: 3 }).default("0").notNull(),
  heightM: decimal("height_m", { precision: 10, scale: 3 }).default("0").notNull(),
  ceilingAreaM2: qty("ceiling_area_m2"),
  wallAreaM2: qty("wall_area_m2"),
  floorAreaM2: qty("floor_area_m2"),
  perimeterM: qty("perimeter_m"),
  finishType: varchar("finish_type", { length: 120 }),
  ceilingDesign: varchar("ceiling_design", { length: 160 }),
  wallTreatment: varchar("wall_treatment", { length: 160 }),
  colourCode: varchar("colour_code", { length: 60 }),
  lightingPoints: int("lighting_points").default(0).notNull(),
  acGrills: int("ac_grills").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "on_hold"]).default("pending").notNull(),
  completionPercent: pct("completion_percent"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [
  index("dc_rooms_unit_idx").on(t.unitId),
  index("dc_rooms_project_idx").on(t.projectId),
]);

/** 2.6 Per-surface finish lines for a room (ceiling / walls / floor / skirting). */
export const dcRoomFinishes = mysqlTable("dc_room_finishes", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }).notNull(),
  surface: mysqlEnum("surface", ["ceiling", "wall", "floor", "skirting", "cornice", "other"]).notNull(),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  descriptionEn: varchar("description_en", { length: 255 }),
  descriptionAr: varchar("description_ar", { length: 255 }),
  quantity: qty("quantity"),
  uom: varchar("uom", { length: 20 }).default("m2").notNull(),
  rate: money("rate"),
  amount: money("amount"),
  deductionM2: qty("deduction_m2"),
  notes: text("notes"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_roomfin_room_idx").on(t.roomId)]);

/** 2.7 Openings (doors/windows) — used to deduct from wall area. */
export const dcRoomOpenings = mysqlTable("dc_room_openings", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }).notNull(),
  kind: mysqlEnum("kind", ["door", "window", "opening", "other"]).default("door").notNull(),
  widthM: decimal("width_m", { precision: 10, scale: 3 }).default("0").notNull(),
  heightM: decimal("height_m", { precision: 10, scale: 3 }).default("0").notNull(),
  count: int("count").default(1).notNull(),
  areaM2: qty("area_m2"),
  createdAt: createdAt(),
}, (t) => [index("dc_openings_room_idx").on(t.roomId)]);

/** 2.8 Documents (drawings / photos / approvals). Files live on the existing
 *  document store; we keep the metadata + project/room linkage. */
export const dcProjectDocuments = mysqlTable("dc_project_documents", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  buildingId: bigint("building_id", { mode: "number", unsigned: true }),
  floorId: bigint("floor_id", { mode: "number", unsigned: true }),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }),
  roomId: bigint("room_id", { mode: "number", unsigned: true }),
  kind: mysqlEnum("kind", [
    "drawing", "shop_drawing", "photo", "approval", "certificate", "other",
  ]).default("drawing").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }),
  fileUrl: varchar("file_url", { length: 1000 }),
  mimeType: varchar("mime_type", { length: 120 }),
  revision: varchar("revision", { length: 20 }),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "superseded"]).default("draft").notNull(),
  uploadedBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_docs_project_idx").on(t.projectId)]);

/** 2.9 Site diary / daily progress report. */
export const dcSiteDiary = mysqlTable("dc_site_diary", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  reportDate: day("report_date").notNull(),
  weather: varchar("weather", { length: 80 }),
  temperatureC: int("temperature_c"),
  manpowerCount: int("manpower_count").default(0).notNull(),
  workDoneEn: text("work_done_en"),
  workDoneAr: text("work_done_ar"),
  issues: text("issues"),
  photoUrls: json("photo_urls"),
  reportedBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_diary_project_idx").on(t.projectId, t.reportDate)]);

/** 2.10 Progress entries — per room / activity / floor. */
export const dcProgressEntries = mysqlTable("dc_progress_entries", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  buildingId: bigint("building_id", { mode: "number", unsigned: true }),
  floorId: bigint("floor_id", { mode: "number", unsigned: true }),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }),
  roomId: bigint("room_id", { mode: "number", unsigned: true }),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  activity: varchar("activity", { length: 160 }).notNull(),
  plannedQty: qty("planned_qty"),
  completedQty: qty("completed_qty"),
  uom: varchar("uom", { length: 20 }).default("m2").notNull(),
  progressPercent: pct("progress_percent"),
  entryDate: day("entry_date").notNull(),
  recordedBy: createdBy(),
  notes: text("notes"),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_progress_project_idx").on(t.projectId)]);

/** 2.11 Snag / punch list. */
export const dcSnags = mysqlTable("dc_snags", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }),
  roomId: bigint("room_id", { mode: "number", unsigned: true }),
  snagNo: varchar("snag_no", { length: 40 }),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  photoUrl: varchar("photo_url", { length: 1000 }),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  dueDate: day("due_date"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed", "rejected"]).default("open").notNull(),
  raisedBy: createdBy(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_snags_project_idx").on(t.projectId)]);

/** 2.12 Inspection requests (IR). */
export const dcInspectionRequests = mysqlTable("dc_inspection_requests", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }),
  roomId: bigint("room_id", { mode: "number", unsigned: true }),
  irNo: varchar("ir_no", { length: 40 }),
  activity: varchar("activity", { length: 160 }).notNull(),
  inspectionDate: day("inspection_date"),
  inspectorId: bigint("inspector_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected"]).default("draft").notNull(),
  result: mysqlEnum("result", ["pass", "fail", "conditional", "pending"]).default("pending").notNull(),
  remarks: text("remarks"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_ir_project_idx").on(t.projectId)]);

/** 2.13 Material Approval Requests (MAR). */
export const dcMars = mysqlTable("dc_mars", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  marNo: varchar("mar_no", { length: 40 }),
  materialId: bigint("material_id", { mode: "number", unsigned: true }),
  descriptionEn: varchar("description_en", { length: 255 }),
  descriptionAr: varchar("description_ar", { length: 255 }),
  manufacturer: varchar("manufacturer", { length: 160 }),
  brand: varchar("brand", { length: 160 }),
  submittalUrl: varchar("submittal_url", { length: 1000 }),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "returned"]).default("draft").notNull(),
  remarks: text("remarks"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_mars_project_idx").on(t.projectId)]);

/** 2.14 RFIs. */
export const dcRfis = mysqlTable("dc_rfis", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  rfiNo: varchar("rfi_no", { length: 40 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  question: text("question"),
  answer: text("answer"),
  raisedBy: createdBy(),
  answeredBy: bigint("answered_by", { mode: "number", unsigned: true }),
  dueDate: day("due_date"),
  status: mysqlEnum("status", ["open", "answered", "closed"]).default("open").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_rfis_project_idx").on(t.projectId)]);

/** 2.15 Variation Orders / Change Orders. */
export const dcVariations = mysqlTable("dc_variations", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  voNo: varchar("vo_no", { length: 40 }),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  description: text("description"),
  variationType: mysqlEnum("variation_type", ["addition", "omission", "time_extension"]).default("addition").notNull(),
  amount: money("amount"),
  timeImpactDays: int("time_impact_days").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "cancelled"]).default("draft").notNull(),
  approvedAt: timestamp("approved_at"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_variations_project_idx").on(t.projectId)]);

/** 2.16 Handover, completion certificate, DLP & warranty. */
export const dcHandovers = mysqlTable("dc_handovers", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  handoverDate: day("handover_date"),
  completionCertificateNo: varchar("completion_certificate_no", { length: 60 }),
  completionCertificateUrl: varchar("completion_certificate_url", { length: 1000 }),
  dlpStartDate: day("dlp_start_date"),
  dlpEndDate: day("dlp_end_date"),
  warrantyMonths: int("warranty_months").default(12).notNull(),
  status: mysqlEnum("status", ["pending", "handed_over", "dlp", "closed"]).default("pending").notNull(),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_handovers_project_idx").on(t.projectId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 3. ESTIMATION · TENDER · QUOTATION
 * ════════════════════════════════════════════════════════════════════════════ */

/** 3.1 BOQ header. */
export const dcBoqs = mysqlTable("dc_boqs", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  boqNo: varchar("boq_no", { length: 60 }).notNull(),
  revision: varchar("revision", { length: 20 }).default("R0").notNull(),
  titleEn: varchar("title_en", { length: 255 }),
  titleAr: varchar("title_ar", { length: 255 }),
  totalAmount: money("total_amount"),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "superseded"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_boqs_project_idx").on(t.projectId)]);

/** 3.2 BOQ sections (grouping). */
export const dcBoqSections = mysqlTable("dc_boq_sections", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  boqId: bigint("boq_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 40 }),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: createdAt(),
}, (t) => [index("dc_boqsec_boq_idx").on(t.boqId)]);

/** 3.3 BOQ lines. */
export const dcBoqLines = mysqlTable("dc_boq_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  boqId: bigint("boq_id", { mode: "number", unsigned: true }).notNull(),
  sectionId: bigint("section_id", { mode: "number", unsigned: true }),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  lineNo: int("line_no").default(0).notNull(),
  descriptionEn: varchar("description_en", { length: 500 }).notNull(),
  descriptionAr: varchar("description_ar", { length: 500 }),
  quantity: qty("quantity"),
  uom: varchar("uom", { length: 20 }).default("m2").notNull(),
  materialCost: money("material_cost"),
  labourCost: money("labour_cost"),
  equipmentCost: money("equipment_cost"),
  overheadPercent: pct("overhead_percent"),
  profitPercent: pct("profit_percent"),
  unitRate: money("unit_rate"),
  amount: money("amount"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_boqlines_boq_idx").on(t.boqId)]);

/** 3.4 Quotation header (versions via revisions table). */
export const dcQuotations = mysqlTable("dc_quotations", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  clientId: bigint("client_id", { mode: "number", unsigned: true }),
  quoteNo: varchar("quote_no", { length: 60 }).notNull(),
  version: int("version").default(1).notNull(),
  titleEn: varchar("title_en", { length: 255 }),
  titleAr: varchar("title_ar", { length: 255 }),
  subtotal: money("subtotal"),
  vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  vatAmount: money("vat_amount"),
  totalAmount: money("total_amount"),
  validUntil: day("valid_until"),
  status: mysqlEnum("status", ["draft", "sent", "approved", "rejected", "expired", "converted"]).default("draft").notNull(),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_quotes_tenant_idx").on(t.tenantId)]);

/** 3.5 Quotation revisions (full snapshot per revision). */
export const dcQuotationRevisions = mysqlTable("dc_quotation_revisions", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  quotationId: bigint("quotation_id", { mode: "number", unsigned: true }).notNull(),
  revisionNo: int("revision_no").default(1).notNull(),
  snapshot: json("snapshot"),
  totalAmount: money("total_amount"),
  createdBy: createdBy(),
  createdAt: createdAt(),
}, (t) => [index("dc_qrev_quote_idx").on(t.quotationId)]);

/** 3.6 Tender tracking. */
export const dcTenders = mysqlTable("dc_tenders", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  tenderNo: varchar("tender_no", { length: 60 }).notNull(),
  clientId: bigint("client_id", { mode: "number", unsigned: true }),
  submissionDate: day("submission_date"),
  bidBondAmount: money("bid_bond_amount"),
  bidBondExpiry: day("bid_bond_expiry"),
  status: mysqlEnum("status", ["preparing", "submitted", "won", "lost", "cancelled"]).default("preparing").notNull(),
  winLossReason: text("win_loss_reason"),
  value: money("value"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_tenders_tenant_idx").on(t.tenantId)]);

/** 3.7 Contracts. */
export const dcContracts = mysqlTable("dc_contracts", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  contractNo: varchar("contract_no", { length: 80 }).notNull(),
  contractDate: day("contract_date"),
  contractValue: money("contract_value"),
  advancePercent: pct("advance_percent"),
  retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default("10").notNull(),
  penaltyPercent: decimal("penalty_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  performanceBond: money("performance_bond"),
  insuranceAmount: money("insurance_amount"),
  status: mysqlEnum("status", ["draft", "active", "completed", "terminated"]).default("draft").notNull(),
  terms: text("terms"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_contracts_project_idx").on(t.projectId)]);

/** 3.8 Contract payment schedule. */
export const dcContractPaymentTerms = mysqlTable("dc_contract_payment_terms", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
  milestoneNo: int("milestone_no").default(1).notNull(),
  descriptionEn: varchar("description_en", { length: 255 }),
  descriptionAr: varchar("description_ar", { length: 255 }),
  percent: pct("percent"),
  amount: money("amount"),
  dueDate: day("due_date"),
  createdAt: createdAt(),
}, (t) => [index("dc_cpt_contract_idx").on(t.contractId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 4. MATERIALS · PROCUREMENT · INVENTORY
 * ════════════════════════════════════════════════════════════════════════════ */

/** 4.1 Material Request (site → store → purchase). */
export const dcMaterialRequests = mysqlTable("dc_material_requests", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  mrNo: varchar("mr_no", { length: 60 }).notNull(),
  requestDate: day("request_date").notNull(),
  requiredDate: day("required_date"),
  requestedBy: createdBy(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "fulfilled", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_mr_project_idx").on(t.projectId)]);

export const dcMaterialRequestLines = mysqlTable("dc_material_request_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  mrId: bigint("mr_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  quantity: qty("quantity"),
  uom: varchar("uom", { length: 20 }).default("pcs").notNull(),
  requiredDate: day("required_date"),
  remarks: varchar("remarks", { length: 255 }),
  createdAt: createdAt(),
}, (t) => [index("dc_mrl_mr_idx").on(t.mrId)]);

/** 4.2 Purchase Request. */
export const dcPurchaseRequests = mysqlTable("dc_purchase_requests", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  mrId: bigint("mr_id", { mode: "number", unsigned: true }),
  prNo: varchar("pr_no", { length: 60 }).notNull(),
  requestDate: day("request_date").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "converted", "cancelled"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_pr_project_idx").on(t.projectId)]);

/** 4.3 RFQ + supplier comparison. */
export const dcRfqs = mysqlTable("dc_rfqs", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  prId: bigint("pr_id", { mode: "number", unsigned: true }),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  rfqNo: varchar("rfq_no", { length: 60 }).notNull(),
  issueDate: day("issue_date"),
  dueDate: day("due_date"),
  status: mysqlEnum("status", ["draft", "sent", "closed", "cancelled"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_rfq_project_idx").on(t.projectId)]);

export const dcRfqQuotes = mysqlTable("dc_rfq_quotes", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  quoteRef: varchar("quote_ref", { length: 80 }),
  totalAmount: money("total_amount"),
  leadTimeDays: int("lead_time_days"),
  isSelected: boolean("is_selected").default(false),
  notes: text("notes"),
  createdAt: createdAt(),
}, (t) => [index("dc_rfqq_rfq_idx").on(t.rfqId)]);

/** 4.4 Purchase Order. */
export const dcPurchaseOrders = mysqlTable("dc_purchase_orders", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  poNo: varchar("po_no", { length: 60 }).notNull(),
  orderDate: day("order_date"),
  expectedDate: day("expected_date"),
  subtotal: money("subtotal"),
  vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  vatAmount: money("vat_amount"),
  totalAmount: money("total_amount"),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "partially_received", "received", "closed", "cancelled"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_po_project_idx").on(t.projectId)]);

export const dcPurchaseOrderLines = mysqlTable("dc_purchase_order_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  poId: bigint("po_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  quantity: qty("quantity"),
  receivedQty: qty("received_qty"),
  uom: varchar("uom", { length: 20 }).default("pcs").notNull(),
  unitPrice: money("unit_price"),
  vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  lineTotal: money("line_total"),
  createdAt: createdAt(),
}, (t) => [index("dc_pol_po_idx").on(t.poId)]);

/** 4.5 Goods Receipt Note. */
export const dcGrns = mysqlTable("dc_grns", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  poId: bigint("po_id", { mode: "number", unsigned: true }),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  grnNo: varchar("grn_no", { length: 60 }).notNull(),
  receiptDate: day("receipt_date").notNull(),
  invoiceRef: varchar("invoice_ref", { length: 80 }),
  status: mysqlEnum("status", ["draft", "confirmed", "cancelled"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_grn_project_idx").on(t.projectId)]);

export const dcGrnLines = mysqlTable("dc_grn_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  grnId: bigint("grn_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  quantity: qty("quantity"),
  acceptedQty: qty("accepted_qty"),
  rejectedQty: qty("rejected_qty"),
  uom: varchar("uom", { length: 20 }).default("pcs").notNull(),
  unitPrice: money("unit_price"),
  batchNo: varchar("batch_no", { length: 80 }),
  expiryDate: day("expiry_date"),
  createdAt: createdAt(),
}, (t) => [index("dc_grnl_grn_idx").on(t.grnId)]);

/** 4.6 Stores (main + project/site stores). */
export const dcStores = mysqlTable("dc_stores", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }), // ref → warehouses
  code: varchar("code", { length: 40 }).notNull(),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameAr: varchar("name_ar", { length: 160 }),
  storeType: mysqlEnum("store_type", ["main", "site", "project"]).default("site").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_stores_tenant_idx").on(t.tenantId)]);

/** 4.7 Stock movements (in / out / transfer / return / scrap). */
export const dcStockMoves = mysqlTable("dc_stock_moves", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  storeId: bigint("store_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  moveType: mysqlEnum("move_type", ["in", "out", "transfer", "return", "scrap", "adjust"]).notNull(),
  quantity: qty("quantity"),
  uom: varchar("uom", { length: 20 }).default("pcs").notNull(),
  unitCost: money("unit_cost"),
  totalCost: money("total_cost"),
  batchNo: varchar("batch_no", { length: 80 }),
  expiryDate: day("expiry_date"),
  refType: varchar("ref_type", { length: 40 }),
  refId: bigint("ref_id", { mode: "number", unsigned: true }),
  moveDate: day("move_date").notNull(),
  createdBy: createdBy(),
  createdAt: createdAt(),
}, (t) => [
  index("dc_moves_store_idx").on(t.storeId),
  index("dc_moves_mat_idx").on(t.materialId),
]);

/** 4.8 Material issue voucher (per project / room / activity). */
export const dcMaterialIssues = mysqlTable("dc_material_issues", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  storeId: bigint("store_id", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  issueNo: varchar("issue_no", { length: 60 }),
  issueDate: day("issue_date").notNull(),
  issuedTo: bigint("issued_to", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "issued", "cancelled"]).default("draft").notNull(),
  createdBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_issues_project_idx").on(t.projectId)]);

export const dcMaterialIssueLines = mysqlTable("dc_material_issue_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  issueId: bigint("issue_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  quantity: qty("quantity"),
  uom: varchar("uom", { length: 20 }).default("pcs").notNull(),
  unitCost: money("unit_cost"),
  createdAt: createdAt(),
}, (t) => [index("dc_mil_issue_idx").on(t.issueId)]);

/** 4.9 Physical stock count. */
export const dcStockCounts = mysqlTable("dc_stock_counts", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  storeId: bigint("store_id", { mode: "number", unsigned: true }).notNull(),
  countNo: varchar("count_no", { length: 60 }),
  countDate: day("count_date").notNull(),
  status: mysqlEnum("status", ["draft", "confirmed", "posted"]).default("draft").notNull(),
  createdBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_counts_store_idx").on(t.storeId)]);

export const dcStockCountLines = mysqlTable("dc_stock_count_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  countId: bigint("count_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  systemQty: qty("system_qty"),
  countedQty: qty("counted_qty"),
  varianceQty: qty("variance_qty"),
  createdAt: createdAt(),
}, (t) => [index("dc_countl_count_idx").on(t.countId)]);

/** 4.10 Budget vs actual consumption + wastage. */
export const dcBudgetConsumption = mysqlTable("dc_budget_consumption", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }).notNull(),
  budgetQty: qty("budget_qty"),
  actualQty: qty("actual_qty"),
  wastageQty: qty("wastage_qty"),
  budgetCost: money("budget_cost"),
  actualCost: money("actual_cost"),
  varianceCost: money("variance_cost"),
  updatedAt: updatedAt(),
}, (t) => [index("dc_budget_project_idx").on(t.projectId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 5. LABOUR · MANPOWER · HR INTEGRATION
 * ════════════════════════════════════════════════════════════════════════════ */

/** 5.1 Daily attendance per project / site. */
export const dcAttendance = mysqlTable("dc_attendance", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  labourId: bigint("labour_id", { mode: "number", unsigned: true }).notNull(),
  attendanceDate: day("attendance_date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "leave", "holiday", "sick"]).default("present").notNull(),
  checkIn: varchar("check_in", { length: 8 }),
  checkOut: varchar("check_out", { length: 8 }),
  normalHours: decimal("normal_hours", { precision: 6, scale: 2 }).default("8").notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 6, scale: 2 }).default("0").notNull(),
  source: mysqlEnum("source", ["manual", "mobile", "biometric", "gps"]).default("manual").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: createdAt(),
}, (t) => [
  index("dc_att_project_idx").on(t.projectId, t.attendanceDate),
  index("dc_att_labour_idx").on(t.labourId, t.attendanceDate),
]);

/** 5.2 Timesheets allocated to projects / activities. */
export const dcTimesheets = mysqlTable("dc_timesheets", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  labourId: bigint("labour_id", { mode: "number", unsigned: true }).notNull(),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  workDate: day("work_date").notNull(),
  hours: decimal("hours", { precision: 6, scale: 2 }).default("0").notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 6, scale: 2 }).default("0").notNull(),
  ratePerHour: money("rate_per_hour"),
  costAmount: money("cost_amount"),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_ts_project_idx").on(t.projectId)]);

/** 5.3 Payroll run. */
export const dcPayrollRuns = mysqlTable("dc_payroll_runs", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  periodMonth: int("period_month").notNull(),
  periodYear: int("period_year").notNull(),
  runNo: varchar("run_no", { length: 60 }),
  status: mysqlEnum("status", ["draft", "calculated", "approved", "paid", "cancelled"]).default("draft").notNull(),
  totalGross: money("total_gross"),
  totalDeductions: money("total_deductions"),
  totalNet: money("total_net"),
  approvedBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_payroll_period_idx").on(t.periodYear, t.periodMonth)]);

/** 5.4 Payroll lines. */
export const dcPayrollLines = mysqlTable("dc_payroll_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  runId: bigint("run_id", { mode: "number", unsigned: true }).notNull(),
  labourId: bigint("labour_id", { mode: "number", unsigned: true }).notNull(),
  basicSalary: money("basic_salary"),
  housingAllowance: money("housing_allowance"),
  transportAllowance: money("transport_allowance"),
  foodAllowance: money("food_allowance"),
  otherAllowance: money("other_allowance"),
  overtimeAmount: money("overtime_amount"),
  deductions: money("deductions"),
  advanceDeduction: money("advance_deduction"),
  gosiEmployee: money("gosi_employee"),
  gosiEmployer: money("gosi_employer"),
  eosbAccrual: money("eosb_accrual"),
  netPay: money("net_pay"),
  createdAt: createdAt(),
}, (t) => [index("dc_payrolll_run_idx").on(t.runId)]);

/** 5.5 Advances / loans. */
export const dcAdvances = mysqlTable("dc_advances", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  labourId: bigint("labour_id", { mode: "number", unsigned: true }).notNull(),
  advanceDate: day("advance_date").notNull(),
  amount: money("amount"),
  recoveredAmount: money("recovered_amount"),
  balance: money("balance"),
  installments: int("installments").default(1).notNull(),
  status: mysqlEnum("status", ["active", "closed", "cancelled"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_adv_labour_idx").on(t.labourId)]);

/** 5.6 WPS (Mudad) payroll file runs. */
export const dcWpsFiles = mysqlTable("dc_wps_files", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  runId: bigint("run_id", { mode: "number", unsigned: true }),
  fileNo: varchar("file_no", { length: 60 }),
  bankName: varchar("bank_name", { length: 120 }),
  totalAmount: money("total_amount"),
  recordCount: int("record_count").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "generated", "uploaded", "accepted", "rejected"]).default("draft").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_wps_run_idx").on(t.runId)]);

/** 5.7 Document expiry register (iqama / passport / insurance / permit / licence). */
export const dcDocumentExpiry = mysqlTable("dc_document_expiry", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  entityType: mysqlEnum("entity_type", ["labour", "supplier", "subcontractor", "equipment", "vehicle", "company"]).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }).notNull(),
  docType: varchar("doc_type", { length: 80 }).notNull(),
  docNumber: varchar("doc_number", { length: 80 }),
  issueDate: day("issue_date"),
  expiryDate: day("expiry_date").notNull(),
  reminderDays: int("reminder_days").default(30).notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_docexp_expiry_idx").on(t.expiryDate)]);

/** 5.8 Labour camps. */
export const dcCamps = mysqlTable("dc_camps", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  nameAr: varchar("name_ar", { length: 160 }),
  city: varchar("city", { length: 120 }),
  address: text("address"),
  totalRooms: int("total_rooms").default(0).notNull(),
  totalBeds: int("total_beds").default(0).notNull(),
  monthlyRent: money("monthly_rent"),
  utilitiesCost: money("utilities_cost"),
  isActive: boolean("is_active").default(true),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_camps_tenant_idx").on(t.tenantId)]);

/** 5.9 Camp allocations (room / bed). */
export const dcCampAllocations = mysqlTable("dc_camp_allocations", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  campId: bigint("camp_id", { mode: "number", unsigned: true }).notNull(),
  labourId: bigint("labour_id", { mode: "number", unsigned: true }).notNull(),
  roomNo: varchar("room_no", { length: 40 }),
  bedNo: varchar("bed_no", { length: 40 }),
  startDate: day("start_date"),
  endDate: day("end_date"),
  status: mysqlEnum("status", ["active", "vacated"]).default("active").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_campalloc_camp_idx").on(t.campId)]);

/** 5.10 Vehicle assignment. */
export const dcVehicleAssignments = mysqlTable("dc_vehicle_assignments", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  driverLabourId: bigint("driver_labour_id", { mode: "number", unsigned: true }),
  startDate: day("start_date"),
  endDate: day("end_date"),
  status: mysqlEnum("status", ["active", "returned"]).default("active").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_vehassign_eq_idx").on(t.equipmentId)]);

/** 5.11 Productivity / piece-rate records. */
export const dcProductivity = mysqlTable("dc_productivity", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  labourId: bigint("labour_id", { mode: "number", unsigned: true }),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  workDate: day("work_date").notNull(),
  completedQty: qty("completed_qty"),
  uom: varchar("uom", { length: 20 }).default("m2").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 6, scale: 2 }).default("0").notNull(),
  qtyPerHour: qty("qty_per_hour"),
  pieceRate: money("piece_rate"),
  pieceAmount: money("piece_amount"),
  createdAt: createdAt(),
}, (t) => [index("dc_prod_project_idx").on(t.projectId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 6. SUBCONTRACTOR MANAGEMENT
 * ════════════════════════════════════════════════════════════════════════════ */

/** 6.1 Subcontract agreement. */
export const dcSubcontracts = mysqlTable("dc_subcontracts", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }).notNull(),
  subcontractNo: varchar("subcontract_no", { length: 80 }).notNull(),
  scopeEn: text("scope_en"),
  scopeAr: text("scope_ar"),
  contractValue: money("contract_value"),
  retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default("10").notNull(),
  advanceAmount: money("advance_amount"),
  startDate: day("start_date"),
  endDate: day("end_date"),
  status: mysqlEnum("status", ["draft", "active", "completed", "terminated"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_subc_project_idx").on(t.projectId)]);

/** 6.2 Work order (scope / rates / quantities). */
export const dcWorkOrders = mysqlTable("dc_work_orders", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  subcontractId: bigint("subcontract_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  woNo: varchar("wo_no", { length: 60 }),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  descriptionEn: varchar("description_en", { length: 500 }),
  descriptionAr: varchar("description_ar", { length: 500 }),
  quantity: qty("quantity"),
  uom: varchar("uom", { length: 20 }).default("m2").notNull(),
  rate: money("rate"),
  amount: money("amount"),
  status: mysqlEnum("status", ["draft", "issued", "in_progress", "completed", "closed"]).default("draft").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_wo_subc_idx").on(t.subcontractId)]);

/** 6.3 Interim Payment Certificate (IPC). */
export const dcIpcs = mysqlTable("dc_ipcs", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  subcontractId: bigint("subcontract_id", { mode: "number", unsigned: true }).notNull(),
  ipcNo: varchar("ipc_no", { length: 60 }).notNull(),
  periodFrom: day("period_from"),
  periodTo: day("period_to"),
  workDoneValue: money("work_done_value"),
  retentionAmount: money("retention_amount"),
  advanceRecovery: money("advance_recovery"),
  backCharges: money("back_charges"),
  penaltyAmount: money("penalty_amount"),
  netPayable: money("net_payable"),
  status: mysqlEnum("status", ["draft", "submitted", "certified", "approved", "paid", "rejected"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_ipc_subc_idx").on(t.subcontractId)]);

export const dcIpcLines = mysqlTable("dc_ipc_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  ipcId: bigint("ipc_id", { mode: "number", unsigned: true }).notNull(),
  workOrderId: bigint("work_order_id", { mode: "number", unsigned: true }),
  description: varchar("description", { length: 500 }),
  quantity: qty("quantity"),
  rate: money("rate"),
  amount: money("amount"),
  createdAt: createdAt(),
}, (t) => [index("dc_ipcl_ipc_idx").on(t.ipcId)]);

/** 6.4 Back charges / penalties. */
export const dcBackCharges = mysqlTable("dc_back_charges", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  subcontractId: bigint("subcontract_id", { mode: "number", unsigned: true }),
  ipcId: bigint("ipc_id", { mode: "number", unsigned: true }),
  chargeDate: day("charge_date").notNull(),
  reason: varchar("reason", { length: 500 }),
  amount: money("amount"),
  status: mysqlEnum("status", ["draft", "approved", "applied", "cancelled"]).default("draft").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_back_project_idx").on(t.projectId)]);

/** 6.5 Subcontractor ledger. */
export const dcSubcontractorLedger = mysqlTable("dc_subcontractor_ledger", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  entryDate: day("entry_date").notNull(),
  refType: varchar("ref_type", { length: 40 }),
  refId: bigint("ref_id", { mode: "number", unsigned: true }),
  debit: money("debit"),
  credit: money("credit"),
  balance: money("balance"),
  description: varchar("description", { length: 500 }),
  createdAt: createdAt(),
}, (t) => [index("dc_sledger_subc_idx").on(t.subcontractorId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 7. BILLING · INVOICING · FINANCE (ZATCA-aware)
 * ════════════════════════════════════════════════════════════════════════════ */

/** 7.1 Client invoices — ZATCA Phase-2 fields included. */
export const dcInvoices = mysqlTable("dc_invoices", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  clientId: bigint("client_id", { mode: "number", unsigned: true }),
  invoiceNo: varchar("invoice_no", { length: 60 }).notNull(),
  invoiceType: mysqlEnum("invoice_type", ["tax", "simplified", "credit_note", "debit_note"]).default("tax").notNull(),
  billingType: mysqlEnum("billing_type", [
    "advance", "progress", "final", "retention_release", "variation", "material", "labour", "service", "rental",
  ]).default("progress").notNull(),
  invoiceDate: day("invoice_date").notNull(),
  dueDate: day("due_date"),
  subtotal: money("subtotal"),
  discountAmount: money("discount_amount"),
  retentionAmount: money("retention_amount"),
  advanceRecovery: money("advance_recovery"),
  penaltyAmount: money("penalty_amount"),
  vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  vatAmount: money("vat_amount"),
  totalAmount: money("total_amount"),
  paidAmount: money("paid_amount"),
  balanceDue: money("balance_due"),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  status: mysqlEnum("status", [
    "draft", "submitted", "cleared", "reported", "approved", "partially_paid", "paid", "overdue", "cancelled",
  ]).default("draft").notNull(),
  // ── ZATCA (Fatoora Phase 2) ──────────────────────────────
  zatcaUuid: varchar("zatca_uuid", { length: 80 }),
  zatcaInvoiceHash: varchar("zatca_invoice_hash", { length: 200 }),
  zatcaQrCode: text("zatca_qr_code"),
  zatcaXml: mediumtext("zatca_xml"),
  zatcaStatus: mysqlEnum("zatca_status", ["pending", "reported", "cleared", "rejected", "warning"]).default("pending"),
  zatcaResponse: text("zatca_response"),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [
  index("dc_inv_project_idx").on(t.projectId),
  index("dc_inv_status_idx").on(t.status),
]);

export const dcInvoiceLines = mysqlTable("dc_invoice_lines", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  workItemId: bigint("work_item_id", { mode: "number", unsigned: true }),
  descriptionEn: varchar("description_en", { length: 500 }),
  descriptionAr: varchar("description_ar", { length: 500 }),
  quantity: qty("quantity"),
  uom: varchar("uom", { length: 20 }).default("m2").notNull(),
  unitPrice: money("unit_price"),
  vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  lineTotal: money("line_total"),
  createdAt: createdAt(),
}, (t) => [index("dc_invl_inv_idx").on(t.invoiceId)]);

/** 7.2 Progress billing (running bills / IPC to client). */
export const dcProgressBills = mysqlTable("dc_progress_bills", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  billNo: varchar("bill_no", { length: 60 }),
  periodFrom: day("period_from"),
  periodTo: day("period_to"),
  workDoneValue: money("work_done_value"),
  cumulativeValue: money("cumulative_value"),
  retentionAmount: money("retention_amount"),
  advanceRecovery: money("advance_recovery"),
  netAmount: money("net_amount"),
  status: mysqlEnum("status", ["draft", "submitted", "certified", "approved", "invoiced", "rejected"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_pbill_project_idx").on(t.projectId)]);

/** 7.3 Retention register. */
export const dcRetentions = mysqlTable("dc_retentions", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  retentionDate: day("retention_date").notNull(),
  amount: money("amount"),
  releasedAmount: money("released_amount"),
  status: mysqlEnum("status", ["held", "partially_released", "released"]).default("held").notNull(),
  releaseDueDate: day("release_due_date"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_ret_project_idx").on(t.projectId)]);

/** 7.4 Advance recovery register. */
export const dcAdvanceRecovery = mysqlTable("dc_advance_recovery", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  advanceAmount: money("advance_amount"),
  recoveredAmount: money("recovered_amount"),
  balance: money("balance"),
  status: mysqlEnum("status", ["active", "closed"]).default("active").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_advrec_project_idx").on(t.projectId)]);

/** 7.5 Receipts. */
export const dcReceipts = mysqlTable("dc_receipts", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  clientId: bigint("client_id", { mode: "number", unsigned: true }),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  receiptNo: varchar("receipt_no", { length: 60 }),
  receiptDate: day("receipt_date").notNull(),
  amount: money("amount"),
  paymentMethod: mysqlEnum("payment_method", ["cash", "bank_transfer", "cheque", "card", "other"]).default("bank_transfer").notNull(),
  reference: varchar("reference", { length: 120 }),
  status: mysqlEnum("status", ["draft", "confirmed", "bounced", "cancelled"]).default("draft").notNull(),
  createdBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_receipts_project_idx").on(t.projectId)]);

/** 7.6 Payments (supplier / subcontractor / expense). */
export const dcPayments = mysqlTable("dc_payments", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  payeeType: mysqlEnum("payee_type", ["supplier", "subcontractor", "employee", "other"]).default("supplier").notNull(),
  payeeId: bigint("payee_id", { mode: "number", unsigned: true }),
  paymentNo: varchar("payment_no", { length: 60 }),
  paymentDate: day("payment_date").notNull(),
  amount: money("amount"),
  paymentMethod: mysqlEnum("payment_method", ["cash", "bank_transfer", "cheque", "card", "other"]).default("bank_transfer").notNull(),
  reference: varchar("reference", { length: 120 }),
  status: mysqlEnum("status", ["draft", "approved", "paid", "cancelled"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_payments_project_idx").on(t.projectId)]);

/** 7.7 Post-dated cheques. */
export const dcCheques = mysqlTable("dc_cheques", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  direction: mysqlEnum("direction", ["received", "issued"]).notNull(),
  partyType: mysqlEnum("party_type", ["client", "supplier", "subcontractor", "other"]).notNull(),
  partyId: bigint("party_id", { mode: "number", unsigned: true }),
  chequeNo: varchar("cheque_no", { length: 60 }),
  bankName: varchar("bank_name", { length: 120 }),
  amount: money("amount"),
  chequeDate: day("cheque_date"),
  dueDate: day("due_date"),
  status: mysqlEnum("status", ["pending", "deposited", "cleared", "bounced", "cancelled"]).default("pending").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_cheques_due_idx").on(t.dueDate)]);

/** 7.8 Petty cash. */
export const dcPettyCash = mysqlTable("dc_petty_cash", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  entryDate: day("entry_date").notNull(),
  description: varchar("description", { length: 500 }),
  amount: money("amount"),
  entryType: mysqlEnum("entry_type", ["top_up", "expense"]).default("expense").notNull(),
  receiptUrl: varchar("receipt_url", { length: 1000 }),
  createdBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_petty_project_idx").on(t.projectId)]);

/** 7.9 Employee expense claims. */
export const dcExpenseClaims = mysqlTable("dc_expense_claims", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  claimNo: varchar("claim_no", { length: 60 }),
  claimDate: day("claim_date").notNull(),
  description: varchar("description", { length: 500 }),
  amount: money("amount"),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "paid"]).default("draft").notNull(),
  createdBy: createdBy(), updatedBy: updatedBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_claims_project_idx").on(t.projectId)]);

/** 7.10 Fixed assets & depreciation (equipment / vehicles). */
export const dcFixedAssets = mysqlTable("dc_fixed_assets", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }),
  assetCode: varchar("asset_code", { length: 60 }),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  purchaseDate: day("purchase_date"),
  purchaseCost: money("purchase_cost"),
  salvageValue: money("salvage_value"),
  usefulLifeYears: int("useful_life_years").default(5).notNull(),
  accumulatedDepreciation: money("accumulated_depreciation"),
  bookValue: money("book_value"),
  status: mysqlEnum("status", ["active", "disposed", "idle"]).default("active").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_assets_tenant_idx").on(t.tenantId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 8. EQUIPMENT & FLEET
 * ════════════════════════════════════════════════════════════════════════════ */

export const dcEquipmentAllocations = mysqlTable("dc_equipment_allocations", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  operatorId: bigint("operator_id", { mode: "number", unsigned: true }),
  startDate: day("start_date"),
  endDate: day("end_date"),
  billingRate: money("billing_rate"),
  status: mysqlEnum("status", ["active", "returned"]).default("active").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_eqalloc_eq_idx").on(t.equipmentId)]);

export const dcEquipmentMaintenance = mysqlTable("dc_equipment_maintenance", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }).notNull(),
  maintenanceDate: day("maintenance_date").notNull(),
  maintenanceType: mysqlEnum("maintenance_type", ["preventive", "corrective", "inspection"]).default("preventive").notNull(),
  description: varchar("description", { length: 500 }),
  cost: money("cost"),
  nextDueDate: day("next_due_date"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_eqmaint_eq_idx").on(t.equipmentId)]);

export const dcFuelLogs = mysqlTable("dc_fuel_logs", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  fuelDate: day("fuel_date").notNull(),
  litres: decimal("litres", { precision: 12, scale: 3 }).default("0").notNull(),
  ratePerLitre: money("rate_per_litre"),
  amount: money("amount"),
  odometer: int("odometer"),
  createdAt: createdAt(),
}, (t) => [index("dc_fuel_eq_idx").on(t.equipmentId)]);

export const dcVehicleDocuments = mysqlTable("dc_vehicle_documents", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }).notNull(),
  docType: mysqlEnum("doc_type", ["istimara", "insurance", "fahas", "other"]).notNull(),
  docNumber: varchar("doc_number", { length: 80 }),
  expiryDate: day("expiry_date").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_vehdoc_expiry_idx").on(t.expiryDate)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 9. QUALITY · SAFETY · COMPLIANCE
 * ════════════════════════════════════════════════════════════════════════════ */

export const dcQcChecklists = mysqlTable("dc_qc_checklists", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  activity: varchar("activity", { length: 160 }),
  items: json("items"), // [{labelEn, labelAr, required}]
  isActive: boolean("is_active").default(true),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_qccl_tenant_idx").on(t.tenantId)]);

export const dcQcResults = mysqlTable("dc_qc_results", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }),
  checklistId: bigint("checklist_id", { mode: "number", unsigned: true }),
  inspectionDate: day("inspection_date").notNull(),
  results: json("results"),
  score: pct("score"),
  status: mysqlEnum("status", ["pass", "fail", "conditional"]).default("pass").notNull(),
  inspectedBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_qcres_project_idx").on(t.projectId)]);

export const dcNcrs = mysqlTable("dc_ncrs", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  ncrNo: varchar("ncr_no", { length: 60 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["minor", "major", "critical"]).default("minor").notNull(),
  correctiveAction: text("corrective_action"),
  raisedBy: createdBy(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  dueDate: day("due_date"),
  status: mysqlEnum("status", ["open", "in_progress", "closed", "verified"]).default("open").notNull(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_ncr_project_idx").on(t.projectId)]);

export const dcTestCertificates = mysqlTable("dc_test_certificates", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  materialId: bigint("material_id", { mode: "number", unsigned: true }),
  certNo: varchar("cert_no", { length: 80 }),
  testType: varchar("test_type", { length: 160 }),
  testDate: day("test_date"),
  result: mysqlEnum("result", ["pass", "fail", "pending"]).default("pending").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_testcert_project_idx").on(t.projectId)]);

export const dcToolboxTalks = mysqlTable("dc_toolbox_talks", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  talkDate: day("talk_date").notNull(),
  topic: varchar("topic", { length: 255 }),
  attendeesCount: int("attendees_count").default(0).notNull(),
  conductedBy: createdBy(),
  photoUrl: varchar("photo_url", { length: 1000 }),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_toolbox_project_idx").on(t.projectId)]);

export const dcIncidents = mysqlTable("dc_incidents", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  incidentDate: day("incident_date").notNull(),
  incidentType: mysqlEnum("incident_type", ["near_miss", "first_aid", "medical", "lost_time", "fatality", "property"]).default("near_miss").notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("low").notNull(),
  rootCause: text("root_cause"),
  correctiveAction: text("corrective_action"),
  lostDays: int("lost_days").default(0).notNull(),
  status: mysqlEnum("status", ["open", "investigating", "closed"]).default("open").notNull(),
  reportedBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_incident_project_idx").on(t.projectId)]);

export const dcPpeIssuance = mysqlTable("dc_ppe_issuance", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  labourId: bigint("labour_id", { mode: "number", unsigned: true }).notNull(),
  itemName: varchar("item_name", { length: 160 }).notNull(),
  issueDate: day("issue_date").notNull(),
  quantity: int("quantity").default(1).notNull(),
  expiryDate: day("expiry_date"),
  createdBy: createdBy(),
  createdAt: createdAt(),
}, (t) => [index("dc_ppe_project_idx").on(t.projectId)]);

export const dcSafetyInspections = mysqlTable("dc_safety_inspections", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  inspectionDate: day("inspection_date").notNull(),
  findings: text("findings"),
  score: pct("score"),
  status: mysqlEnum("status", ["pass", "fail", "conditional"]).default("pass").notNull(),
  inspectedBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_safinsp_project_idx").on(t.projectId)]);

/** 9.10 Company licence register (CR, Chamber, Balady, Civil Defense,
 *  contractor classification, insurance, Etimad / Monshaat). */
export const dcCompanyLicences = mysqlTable("dc_company_licences", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  licenceType: varchar("licence_type", { length: 120 }).notNull(),
  licenceNumber: varchar("licence_number", { length: 120 }),
  issuingAuthority: varchar("issuing_authority", { length: 160 }),
  issueDate: day("issue_date"),
  expiryDate: day("expiry_date"),
  fileUrl: varchar("file_url", { length: 1000 }),
  status: mysqlEnum("status", ["valid", "expiring", "expired"]).default("valid").notNull(),
  notes: text("notes"),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_licences_expiry_idx").on(t.expiryDate)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 10. CLIENT PORTAL
 * ════════════════════════════════════════════════════════════════════════════ */

export const dcPortalUsers = mysqlTable("dc_portal_users", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  clientId: bigint("client_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: createdAt(), updatedAt: updatedAt(), deletedAt: deletedAt(),
}, (t) => [index("dc_portal_client_idx").on(t.clientId)]);

export const dcPortalApprovals = mysqlTable("dc_portal_approvals", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  portalUserId: bigint("portal_user_id", { mode: "number", unsigned: true }).notNull(),
  entityType: varchar("entity_type", { length: 40 }).notNull(), // variation | invoice | mar
  entityId: bigint("entity_id", { mode: "number", unsigned: true }).notNull(),
  decision: mysqlEnum("decision", ["approved", "rejected", "returned"]).notNull(),
  comments: text("comments"),
  decidedAt: timestamp("decided_at").defaultNow().notNull(),
  createdAt: createdAt(),
}, (t) => [index("dc_portalapp_entity_idx").on(t.entityType, t.entityId)]);

/* ════════════════════════════════════════════════════════════════════════════
 * 11. WORKFLOW · APPROVALS · AUDIT · NOTIFICATIONS
 * ════════════════════════════════════════════════════════════════════════════ */

/** 11.1 Generic approval request (MR, PO, IPC, VO, payroll, payment…). */
export const dcApprovalRequests = mysqlTable("dc_approval_requests", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  entityType: varchar("entity_type", { length: 40 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }),
  amount: money("amount"),
  currentStep: int("current_step").default(1).notNull(),
  totalSteps: int("total_steps").default(1).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "approved", "rejected", "returned", "cancelled"]).default("pending").notNull(),
  requestedBy: createdBy(),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("dc_appr_entity_idx").on(t.entityType, t.entityId)]);

export const dcApprovalSteps = mysqlTable("dc_approval_steps", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  requestId: bigint("request_id", { mode: "number", unsigned: true }).notNull(),
  stepNo: int("step_no").default(1).notNull(),
  approverRole: varchar("approver_role", { length: 60 }),
  approverId: bigint("approver_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "skipped"]).default("pending").notNull(),
  comments: text("comments"),
  actedAt: timestamp("acted_at"),
  createdAt: createdAt(),
}, (t) => [index("dc_apprstep_req_idx").on(t.requestId)]);

/** 11.2 Audit log for every create / edit / delete / approval. */
export const dcAuditLog = mysqlTable("dc_audit_log", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  action: mysqlEnum("action", ["create", "update", "delete", "approve", "reject", "login", "export"]).notNull(),
  before: json("before"),
  after: json("after"),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  ipAddress: varchar("ip_address", { length: 60 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: createdAt(),
}, (t) => [index("dc_audit_entity_idx").on(t.entityType, t.entityId)]);

/** 11.3 Notifications (email / WhatsApp / in-app). */
export const dcNotifications = mysqlTable("dc_notifications", {
  id: serial("id").primaryKey(),
  tenantId: tenant(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  channel: mysqlEnum("channel", ["in_app", "email", "whatsapp", "sms"]).default("in_app").notNull(),
  category: mysqlEnum("category", ["expiry", "delay", "low_stock", "overdue_invoice", "pending_approval", "general"]).default("general").notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  link: varchar("link", { length: 500 }),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: createdAt(),
}, (t) => [index("dc_notif_user_idx").on(t.userId, t.isRead)]);

/* ════════════════════════════════════════════════════════════════════════════
 * Type exports — one pair per table (select / insert)
 * ════════════════════════════════════════════════════════════════════════════ */
export type DcClient = typeof dcClients.$inferSelect;
export type InsertDcClient = typeof dcClients.$inferInsert;
export type DcProject = typeof dcProjects.$inferSelect;
export type InsertDcProject = typeof dcProjects.$inferInsert;
export type DcRoom = typeof dcRooms.$inferSelect;
export type InsertDcRoom = typeof dcRooms.$inferInsert;
export type DcInvoice = typeof dcInvoices.$inferSelect;
export type InsertDcInvoice = typeof dcInvoices.$inferInsert;