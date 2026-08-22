import { mysqlTable, int, text, varchar, double, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const workshopJobCards = mysqlTable("workshop_job_cards", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  vehicleId: int("vehicle_id").notNull(),
  customerId: int("customer_id").notNull(),
  jobNumber: varchar("job_number", { length: 100 }).notNull(),
  serviceType: varchar("service_type", { length: 150 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "quality_check", "completed", "delivered", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["normal", "urgent", "express"]).default("normal"),
  estimatedCost: text("estimated_cost"),
  actualCost: text("actual_cost"),
  technicianId: int("technician_id"),
  estimatedHours: double("estimated_hours"),
  actualHours: double("actual_hours"),
  startDate: varchar("start_date", { length: 60 }),
  completionDate: varchar("completion_date", { length: 60 }),
  warrantyMonths: int("warranty_months").default(3),
  customerApproval: boolean("customer_approval").default(false),
  approvedAt: varchar("approved_at", { length: 60 }),
  invoiceId: int("invoice_id"),
  notes: text("notes"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
  updatedAt: varchar("updated_at", { length: 60 }).default(sql`(now())`),
});

export const workshopJobParts = mysqlTable("workshop_job_parts", {
  id: int("id").autoincrement().primaryKey(),
  jobCardId: int("job_card_id").notNull(),
  partName: varchar("part_name", { length: 255 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }),
  quantity: double("quantity").default(1),
  unitPrice: text("unit_price"),
  totalPrice: text("total_price"),
  supplierId: int("supplier_id"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopJobLabor = mysqlTable("workshop_job_labor", {
  id: int("id").autoincrement().primaryKey(),
  jobCardId: int("job_card_id").notNull(),
  technicianId: int("technician_id"),
  description: text("description"),
  hours: double("hours"),
  rate: text("rate"),
  total: text("total"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopVehicles = mysqlTable("workshop_vehicles", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  customerId: int("customer_id").notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year").notNull(),
  plateNumber: varchar("plate_number", { length: 50 }),
  vin: varchar("vin", { length: 100 }),
  color: varchar("color", { length: 50 }),
  mileage: varchar("mileage", { length: 50 }),
  nextServiceMileage: varchar("next_service_mileage", { length: 50 }),
  nextServiceDate: varchar("next_service_date", { length: 60 }),
  insuranceCompany: varchar("insurance_company", { length: 255 }),
  policyNumber: varchar("policy_number", { length: 100 }),
  insuranceExpiry: varchar("insurance_expiry", { length: 60 }),
  registrationExpiry: varchar("registration_expiry", { length: 60 }),
  notes: text("notes"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopEstimates = mysqlTable("workshop_estimates", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  vehicleId: int("vehicle_id").notNull(),
  customerId: int("customer_id").notNull(),
  estimateNumber: varchar("estimate_number", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["draft", "pending", "approved", "rejected", "converted"]).default("draft").notNull(),
  partsTotal: text("parts_total"),
  laborTotal: text("labor_total"),
  subletTotal: text("sublet_total"),
  taxAmount: text("tax_amount"),
  totalAmount: text("total_amount").notNull(),
  notes: text("notes"),
  sentMethod: varchar("sent_method", { length: 50 }),
  sentAt: varchar("sent_at", { length: 60 }),
  approvedAt: varchar("approved_at", { length: 60 }),
  convertedToJobId: int("converted_to_job_id"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopEstimateItems = mysqlTable("workshop_estimate_items", {
  id: int("id").autoincrement().primaryKey(),
  estimateId: int("estimate_id").notNull(),
  type: mysqlEnum("type", ["part", "labor", "sublet"]).notNull(),
  description: text("description").notNull(),
  quantity: double("quantity").default(1),
  unitPrice: text("unit_price"),
  total: text("total"),
});

export const workshopTechnicians = mysqlTable("workshop_technicians", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  specialty: varchar("specialty", { length: 150 }),
  hourlyRate: text("hourly_rate"),
  isActive: boolean("is_active").default(true),
  jobsCompleted: int("jobs_completed").default(0),
  avgRating: double("avg_rating"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopInspections = mysqlTable("workshop_inspections", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  jobCardId: int("job_card_id").notNull(),
  checklistJson: text("checklist_json"),
  photos: text("photos"),
  customerSignature: text("customer_signature"),
  technicianSignature: text("technician_signature"),
  notes: text("notes"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopServiceTypes = mysqlTable("workshop_service_types", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  estimatedHours: double("estimated_hours"),
  defaultPrice: text("default_price"),
  isActive: boolean("is_active").default(true),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopBaySchedule = mysqlTable("workshop_bay_schedule", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  bayNumber: int("bay_number").notNull(),
  jobCardId: int("job_card_id"),
  date: varchar("date", { length: 60 }).notNull(),
  startTime: varchar("start_time", { length: 30 }),
  endTime: varchar("end_time", { length: 30 }),
  status: mysqlEnum("status", ["available", "occupied", "maintenance", "reserved"]).default("available"),
  notes: text("notes"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});

export const workshopPayments = mysqlTable("workshop_payments", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenant_id").notNull(),
  jobCardId: int("job_card_id"),
  estimateId: int("estimate_id"),
  amount: text("amount").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "bank_transfer", "sadad", "wallet", "insurance"]).default("cash"),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
});
