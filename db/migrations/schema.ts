import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, primaryKey, unique, serial, bigint, varchar, date, mysqlEnum, text, timestamp, decimal, int, json, foreignKey, tinyint, mediumtext, double, longtext } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const admissions = mysqlTable("admissions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	admissionNumber: varchar("admission_number", { length: 50 }).notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dateOfBirth: date("date_of_birth", { mode: 'string' }),
	gender: mysqlEnum(['male','female']),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	address: text(),
	guardianName: varchar("guardian_name", { length: 255 }),
	guardianPhone: varchar("guardian_phone", { length: 50 }),
	guardianEmail: varchar("guardian_email", { length: 320 }),
	applyingForGrade: varchar("applying_for_grade", { length: 50 }),
	previousSchool: varchar("previous_school", { length: 255 }),
	academicYear: varchar("academic_year", { length: 20 }),
	status: mysqlEnum(['inquiry','applied','interviewed','accepted','rejected','enrolled','waitlisted']).default('inquiry').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	interviewDate: date("interview_date", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("admissions_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "admissions_id"}),
	unique("id").on(table.id),
]);

export const advancePayments = mysqlTable("advance_payments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
	paymentType: mysqlEnum("payment_type", ['advance','mobilization','progress','retention_release']).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	requestDate: date("request_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paidDate: date("paid_date", { mode: 'string' }),
	recoveryMethod: mysqlEnum("recovery_method", ['deduction_from_bills','direct_payment']),
	recoveryPercent: decimal("recovery_percent", { precision: 5, scale: 2 }),
	recoveryInstallments: int("recovery_installments"),
	installmentAmount: decimal("installment_amount", { precision: 18, scale: 4 }),
	remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }),
	status: mysqlEnum(['requested','approved','paid','fully_recovered','cancelled']).default('requested').notNull(),
	bankGuaranteeNumber: varchar("bank_guarantee_number", { length: 100 }),
	bankName: varchar("bank_name", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	guaranteeExpiryDate: date("guarantee_expiry_date", { mode: 'string' }),
	guaranteeAmount: decimal("guarantee_amount", { precision: 18, scale: 4 }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("advance_payments_project_idx").on(table.tenantId, table.projectId),
	index("advance_payments_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "advance_payments_id"}),
	unique("id").on(table.id),
]);

export const advances = mysqlTable("advances", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	purpose: text(),
	status: mysqlEnum(['pending','approved','rejected','deducted']).default('pending').notNull(),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "advances_id"}),
	unique("id").on(table.id),
]);

export const aiAutomationRules = mysqlTable("ai_automation_rules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	ruleType: varchar("rule_type", { length: 50 }).notNull(),
	description: text(),
	configuration: json(),
	aiSuggested: tinyint("ai_suggested").default(0),
	aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
	isActive: tinyint("is_active").default(1),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }),
	runCount: int("run_count").default(0),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ai_automation_tenant_idx").on(table.tenantId),
	index("ai_automation_type_idx").on(table.tenantId, table.ruleType),
	primaryKey({ columns: [table.id], name: "ai_automation_rules_id"}),
	unique("id").on(table.id),
]);

export const aiAutomationSuggestions = mysqlTable("ai_automation_suggestions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	ruleType: varchar("rule_type", { length: 50 }).notNull(),
	sourceEntityType: varchar("source_entity_type", { length: 100 }),
	sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
	suggestedAction: json("suggested_action"),
	confidence: decimal({ precision: 5, scale: 2 }),
	status: varchar({ length: 50 }).default('pending'),
	appliedBy: bigint("applied_by", { mode: "number", unsigned: true }),
	appliedAt: timestamp("applied_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ai_automation_sugg_status_idx").on(table.tenantId, table.status),
	index("ai_automation_sugg_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ai_automation_suggestions_id"}),
	unique("id").on(table.id),
]);

export const aiChatLogs = mysqlTable("ai_chat_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	sessionId: varchar("session_id", { length: 100 }),
	query: text().notNull(),
	response: text(),
	queryType: varchar("query_type", { length: 50 }),
	context: json(),
	tokensUsed: int("tokens_used"),
	processingTimeMs: int("processing_time_ms"),
	rating: int(),
	feedback: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "ai_chat_logs_id"}),
	unique("id").on(table.id),
]);

export const aiChatbotSessions = mysqlTable("ai_chatbot_sessions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	sessionId: varchar("session_id", { length: 100 }).notNull(),
	channel: varchar({ length: 50 }).default('portal'),
	language: varchar({ length: 10 }).default('en'),
	customerName: varchar("customer_name", { length: 255 }),
	customerEmail: varchar("customer_email", { length: 320 }),
	customerPhone: varchar("customer_phone", { length: 50 }),
	context: json(),
	ticketId: bigint("ticket_id", { mode: "number", unsigned: true }),
	rating: int(),
	feedback: text(),
	status: varchar({ length: 50 }).default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ai_chatbot_session_sid_idx").on(table.sessionId),
	index("ai_chatbot_session_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ai_chatbot_sessions_id"}),
	unique("id").on(table.id),
]);

export const aiForecastResults = mysqlTable("ai_forecast_results", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	forecastType: varchar("forecast_type", { length: 50 }).notNull(),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	parameters: json(),
	historicalData: json("historical_data"),
	forecastData: json("forecast_data"),
	confidenceInterval: json("confidence_interval"),
	seasonalPatterns: json("seasonal_patterns"),
	reorderPoint: int("reorder_point"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }),
	accuracyScore: decimal("accuracy_score", { precision: 5, scale: 2 }),
	status: varchar({ length: 50 }).default('completed'),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ai_forecast_tenant_idx").on(table.tenantId),
	index("ai_forecast_type_idx").on(table.tenantId, table.forecastType),
	primaryKey({ columns: [table.id], name: "ai_forecast_results_id"}),
	unique("id").on(table.id),
]);

export const aiReportTemplates = mysqlTable("ai_report_templates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	naturalLanguageQuery: text("natural_language_query").notNull(),
	parsedIntent: varchar("parsed_intent", { length: 100 }),
	generatedSql: text("generated_sql"),
	resultCache: json("result_cache"),
	chartType: varchar("chart_type", { length: 50 }).default('table'),
	isFavorite: tinyint("is_favorite").default(0),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ai_report_templates_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ai_report_templates_id"}),
	unique("id").on(table.id),
]);

export const announcements = mysqlTable("announcements", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	severity: mysqlEnum(['info','warning','critical']).default('info'),
	targetTenants: json("target_tenants"),
	targetPlans: json("target_plans"),
	startAt: timestamp("start_at", { mode: 'string' }),
	endAt: timestamp("end_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	createdBy: int("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_active").on(table.isActive),
	index("idx_end").on(table.endAt),
	index("idx_start").on(table.startAt),
	primaryKey({ columns: [table.id], name: "announcements_id"}),
]);

export const apiKeys = mysqlTable("api_keys", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	keyName: varchar("key_name", { length: 255 }).notNull(),
	keyHash: varchar("key_hash", { length: 512 }).notNull(),
	keyPrefix: varchar("key_prefix", { length: 8 }),
	permissions: json(),
	ipWhitelist: json("ip_whitelist"),
	rateLimitPerMinute: int("rate_limit_per_minute").default(60),
	isActive: tinyint("is_active").default(1),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("api_keys_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "api_keys_id"}),
	unique("id").on(table.id),
]);

export const apiRateLimits = mysqlTable("api_rate_limits", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	apiKeyId: bigint("api_key_id", { mode: "number", unsigned: true }),
	intervalStart: timestamp("interval_start", { mode: 'string' }),
	requestCount: int("request_count").default(0),
	limitPerInterval: int("limit_per_interval").default(60),
	intervalSeconds: int("interval_seconds").default(60),
},
(table) => [
	index("api_rate_limits_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "api_rate_limits_id"}),
	unique("id").on(table.id),
]);

export const apiUsageLogs = mysqlTable("api_usage_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	apiKeyId: bigint("api_key_id", { mode: "number", unsigned: true }),
	endpoint: varchar({ length: 255 }),
	method: varchar({ length: 10 }),
	httpStatus: int("http_status"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	durationMs: int("duration_ms"),
	requestSize: int("request_size"),
	responseSize: int("response_size"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("api_usage_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "api_usage_logs_id"}),
	unique("id").on(table.id),
]);

export const apiWebhooks = mysqlTable("api_webhooks", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	url: varchar({ length: 500 }).notNull(),
	secret: varchar({ length: 255 }),
	events: json(),
	isActive: tinyint("is_active").default(1),
	lastTriggeredAt: timestamp("last_triggered_at", { mode: 'string' }),
	failureCount: int("failure_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "api_webhooks_id"}),
	unique("id").on(table.id),
]);

export const appointments = mysqlTable("appointments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	doctorId: bigint("doctor_id", { mode: "number", unsigned: true }),
	appointmentNumber: varchar("appointment_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	appointmentDate: date("appointment_date", { mode: 'string' }).notNull(),
	startTime: varchar("start_time", { length: 10 }).notNull(),
	endTime: varchar("end_time", { length: 10 }).notNull(),
	appointmentType: mysqlEnum("appointment_type", ['consultation','follow_up','emergency','checkup','procedure','vaccination']).default('consultation').notNull(),
	status: mysqlEnum(['scheduled','checked_in','in_progress','completed','cancelled','no_show','rescheduled']).default('scheduled').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("appointments_date_idx").on(table.tenantId, table.appointmentDate),
	index("appointments_patient_idx").on(table.patientId),
	index("appointments_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "appointments_id"}),
	unique("id").on(table.id),
]);

export const approvalRequests = mysqlTable("approval_requests", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	workflowId: bigint("workflow_id", { mode: "number", unsigned: true }),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
	status: mysqlEnum(['pending','approved','rejected','cancelled']).default('pending').notNull(),
	currentStep: int("current_step").default(0),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "approval_requests_id"}),
	unique("id").on(table.id),
]);

export const approvalWorkflows = mysqlTable("approval_workflows", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	triggerEvent: varchar("trigger_event", { length: 100 }),
	steps: json(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "approval_workflows_id"}),
	unique("id").on(table.id),
]);

export const assetMaintenance = mysqlTable("asset_maintenance", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	assetId: bigint("asset_id", { mode: "number", unsigned: true }).notNull(),
	maintenanceType: mysqlEnum("maintenance_type", ['preventive','corrective','predictive']).default('preventive').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	description: text(),
	cost: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	performedBy: varchar("performed_by", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	nextDueDate: date("next_due_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "asset_maintenance_id"}),
	unique("id").on(table.id),
]);

export const assets = mysqlTable("assets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	assetCode: varchar("asset_code", { length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }),
	location: varchar({ length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	purchaseDate: date("purchase_date", { mode: 'string' }),
	purchaseCost: decimal("purchase_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	salvageValue: decimal("salvage_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	usefulLife: int("useful_life").default(0),
	depreciationMethod: mysqlEnum("depreciation_method", ['straight_line','declining_balance','units_of_production']).default('straight_line').notNull(),
	accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	bookValue: decimal("book_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['active','under_maintenance','disposed','sold']).default('active').notNull(),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	serialNumber: varchar("serial_number", { length: 255 }),
	manufacturer: varchar({ length: 255 }),
	model: varchar({ length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	warrantyExpiry: date("warranty_expiry", { mode: 'string' }),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "assets_id"}),
	unique("id").on(table.id),
]);

export const attachments = mysqlTable("attachments", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	entityType: mysqlEnum("entity_type", ['customer','supplier','employee','invoice','quotation','purchase_order','project','contract','product','other']).notNull(),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }).notNull(),
	documentType: mysqlEnum("document_type", ['cr_certificate','vat_certificate','contract','purchase_order','invoice','receipt','iqama','passport','work_permit','gosi_certificate','insurance','other']).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileSize: int("file_size"),
	filePath: text("file_path").notNull(),
	mimeType: varchar("mime_type", { length: 100 }),
	description: text(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	reminderDays: int("reminder_days").default(30),
	uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("idx_entity").on(table.entityType, table.entityId),
	index("idx_expiry").on(table.expiryDate),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "attachments_id"}),
]);

export const attendance = mysqlTable("attendance", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	checkIn: timestamp("check_in", { mode: 'string' }),
	checkOut: timestamp("check_out", { mode: 'string' }),
	status: mysqlEnum(['present','absent','late','half_day','on_leave','holiday']).default('present').notNull(),
	workHours: decimal("work_hours", { precision: 5, scale: 2 }),
	overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default('0.00').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "attendance_id"}),
	unique("id").on(table.id),
]);

export const auditLogs = mysqlTable("audit_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	oldValues: json("old_values"),
	newValues: json("new_values"),
	ipAddress: varchar("ip_address", { length: 100 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "audit_logs_id"}),
	unique("id").on(table.id),
]);

export const baladyPermits = mysqlTable("balady_permits", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	permitNumber: varchar("permit_number", { length: 100 }),
	permitType: varchar("permit_type", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	applicationDate: date("application_date", { mode: 'string' }),
	scope: text(),
	status: varchar({ length: 50 }).default('Submitted'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	approvalDate: date("approval_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	inspector: varchar({ length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	inspectionDate: date("inspection_date", { mode: 'string' }),
	inspectionStatus: varchar("inspection_status", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_permits_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "balady_permits_id"}),
	unique("permit_number").on(table.permitNumber),
]);

export const batchQualityRecords = mysqlTable("batch_quality_records", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	batchNumber: varchar("batch_number", { length: 100 }).notNull(),
	inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }),
	ncrId: bigint("ncr_id", { mode: "number", unsigned: true }),
	result: mysqlEnum(['pass','fail','rework','quarantine']).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("batch_quality_product_idx").on(table.tenantId, table.productId, table.batchNumber),
	index("batch_quality_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "batch_quality_records_id"}),
	unique("id").on(table.id),
]);

export const biDataWarehouseTables = mysqlTable("bi_data_warehouse_tables", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	tableName: varchar("table_name", { length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 255 }),
	description: text(),
	sourceQuery: text("source_query"),
	refreshFrequency: varchar("refresh_frequency", { length: 50 }).default('daily'),
	lastRefreshedAt: timestamp("last_refreshed_at", { mode: 'string' }),
	nextScheduledRefresh: timestamp("next_scheduled_refresh", { mode: 'string' }),
	rowCount: int("row_count").default(0),
	retentionDays: int("retention_days").default(365),
	isActive: tinyint("is_active").default(1),
	config: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("bi_dw_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "bi_data_warehouse_tables_id"}),
	unique("id").on(table.id),
]);

export const biMetricsDefinitions = mysqlTable("bi_metrics_definitions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	metricKey: varchar("metric_key", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	description: text(),
	category: varchar({ length: 100 }),
	unit: varchar({ length: 50 }),
	calculationType: varchar("calculation_type", { length: 50 }).default('sql'),
	calculationSql: text("calculation_sql"),
	sourceTable: varchar("source_table", { length: 100 }),
	dimensions: json(),
	comparisonPeriods: json("comparison_periods"),
	isPrecomputed: tinyint("is_precomputed").default(0),
	isActive: tinyint("is_active").default(1),
	sortOrder: int("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("bi_metrics_category_idx").on(table.tenantId, table.category),
	index("bi_metrics_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "bi_metrics_definitions_id"}),
	unique("bi_metrics_definitions_key_unique").on(table.tenantId, table.metricKey),
	unique("id").on(table.id),
]);

export const bidComparisons = mysqlTable("bid_comparisons", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	comparisonDate: date("comparison_date", { mode: 'string' }).notNull(),
	preparedBy: bigint("prepared_by", { mode: "number", unsigned: true }),
	criteria: json(),
	summary: text(),
	recommendedSupplierId: bigint("recommended_supplier_id", { mode: "number", unsigned: true }),
	status: mysqlEnum(['draft','approved']).default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("bc_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "bid_comparisons_id"}),
	unique("id").on(table.id),
]);

export const billOfMaterials = mysqlTable("bill_of_materials", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	version: varchar({ length: 20 }).default('1.0').notNull(),
	quantity: int().default(1),
	laborCost: decimal("labor_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	overheadCost: decimal("overhead_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "bill_of_materials_id"}),
	unique("id").on(table.id),
]);

export const bimModels = mysqlTable("bim_models", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	modelName: varchar("model_name", { length: 255 }),
	modelFilePath: text("model_file_path"),
	modelType: varchar("model_type", { length: 50 }),
	fileSizeMb: decimal("file_size_mb", { precision: 10, scale: 2 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	createdDate: date("created_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lastUpdated: date("last_updated", { mode: 'string' }),
	uploadedBy: int("uploaded_by"),
	processingStatus: varchar("processing_status", { length: 50 }).default('pending'),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_bim_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "bim_models_id"}),
]);

export const biometricAccessLogs = mysqlTable("biometric_access_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	templateId: bigint("template_id", { mode: "number", unsigned: true }),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
	action: mysqlEnum(['enroll','verify','identify','view','export','delete','update']).notNull(),
	accessedBy: bigint("accessed_by", { mode: "number", unsigned: true }).notNull(),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	isAllowed: tinyint("is_allowed").default(1).notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("bio_access_employee_idx").on(table.employeeId),
	index("bio_access_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "biometric_access_logs_id"}),
]);

export const biometricConsentRecords = mysqlTable("biometric_consent_records", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	consentType: mysqlEnum("consent_type", ['face','fingerprint','voice','gps_location','all']).notNull(),
	isConsented: tinyint("is_consented").default(1).notNull(),
	consentDate: timestamp("consent_date", { mode: 'string' }).defaultNow().notNull(),
	revokedAt: timestamp("revoked_at", { mode: 'string' }),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	lawfulBasis: varchar("lawful_basis", { length: 255 }).default('explicit_consent').notNull(),
	purposeDescription: text("purpose_description"),
	retentionPeriodDays: int("retention_period_days").default(90),
	dataDeletedAt: timestamp("data_deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("bio_consent_tenant_idx").on(table.tenantId, table.employeeId),
	primaryKey({ columns: [table.id], name: "biometric_consent_records_id"}),
]);

export const biometricTemplates = mysqlTable("biometric_templates", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	templateType: mysqlEnum("template_type", ['face','fingerprint','voice']).notNull(),
	templateHash: varchar("template_hash", { length: 255 }).notNull(),
	templateDataEncrypted: text("template_data_encrypted").notNull(),
	encryptionIv: varchar("encryption_iv", { length: 64 }).notNull(),
	encryptionTag: varchar("encryption_tag", { length: 64 }).notNull(),
	deviceId: varchar("device_id", { length: 100 }),
	isActive: tinyint("is_active").default(1).notNull(),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("bio_device_idx").on(table.deviceId),
	index("bio_tenant_idx").on(table.tenantId, table.employeeId),
	primaryKey({ columns: [table.id], name: "biometric_templates_id"}),
]);

export const bomItems = mysqlTable("bom_items", {
	id: serial().notNull(),
	bomId: bigint("bom_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	unitCost: decimal("unit_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	wastagePercent: decimal("wastage_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "bom_items_id"}),
	unique("id").on(table.id),
]);

export const bookingCalendar = mysqlTable("booking_calendar", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	roomId: bigint("room_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	status: mysqlEnum(['available','booked','maintenance','blocked']).default('available').notNull(),
	bookingId: bigint("booking_id", { mode: "number", unsigned: true }),
	rateOverride: decimal("rate_override", { precision: 18, scale: 4 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("booking_calendar_room_date_idx").on(table.roomId, table.date),
	index("booking_calendar_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "booking_calendar_id"}),
	unique("id").on(table.id),
]);

export const boqItems = mysqlTable("boq_items", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	wbsId: bigint("wbs_id", { mode: "number", unsigned: true }),
	itemCode: varchar("item_code", { length: 50 }).notNull(),
	description: text().notNull(),
	unit: varchar({ length: 50 }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	unitRate: decimal("unit_rate", { precision: 18, scale: 4 }).notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
	wastagePercent: decimal("wastage_percent", { precision: 5, scale: 2 }).default('0.00'),
	materialCost: decimal("material_cost", { precision: 18, scale: 4 }),
	laborCost: decimal("labor_cost", { precision: 18, scale: 4 }),
	equipmentCost: decimal("equipment_cost", { precision: 18, scale: 4 }),
	directCost: decimal("direct_cost", { precision: 18, scale: 4 }),
	indirectCost: decimal("indirect_cost", { precision: 18, scale: 4 }),
	profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }),
	taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('15.00'),
	status: mysqlEnum(['estimated','approved','revised','completed']).default('estimated').notNull(),
	section: varchar({ length: 100 }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("boq_items_project_idx").on(table.tenantId, table.projectId),
	index("boq_items_tenant_idx").on(table.tenantId),
	index("boq_items_wbs_idx").on(table.tenantId, table.wbsId),
	primaryKey({ columns: [table.id], name: "boq_items_id"}),
	unique("id").on(table.id),
]);

export const branches = mysqlTable("branches", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	commercialRegistration: varchar("commercial_registration", { length: 100 }),
	vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }),
	buildingNumber: varchar("building_number", { length: 10 }),
	streetName: varchar("street_name", { length: 255 }),
	streetNameAr: varchar("street_name_ar", { length: 255 }),
	district: varchar({ length: 255 }),
	districtAr: varchar("district_ar", { length: 255 }),
	cityName: varchar("city_name", { length: 100 }),
	cityNameAr: varchar("city_name_ar", { length: 100 }),
	postalCode: varchar("postal_code", { length: 10 }),
	additionalNumber: varchar("additional_number", { length: 10 }),
	phone: varchar({ length: 50 }),
	email: varchar({ length: 320 }),
	managerId: bigint("manager_id", { mode: "number", unsigned: true }),
	isHeadOffice: tinyint("is_head_office").default(0),
	isActive: tinyint("is_active").default(1),
	egsDevices: json("egs_devices"),
	invoiceCounter: int("invoice_counter").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("branches_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "branches_id"}),
	unique("branches_code").on(table.tenantId, table.code),
]);

export const brands = mysqlTable("brands", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	logo: text(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "brands_id"}),
	unique("id").on(table.id),
]);

export const budgets = mysqlTable("budgets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	fiscalYearId: bigint("fiscal_year_id", { mode: "number", unsigned: true }).notNull(),
	accountId: bigint("account_id", { mode: "number", unsigned: true }).notNull(),
	costCenterId: bigint("cost_center_id", { mode: "number", unsigned: true }),
	january: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	february: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	march: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	april: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	may: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	june: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	july: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	august: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	september: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	october: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	november: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	december: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	total: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "budgets_id"}),
	unique("id").on(table.id),
]);

export const capacityResources = mysqlTable("capacity_resources", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	resourceCode: varchar("resource_code", { length: 50 }).notNull(),
	resourceName: varchar("resource_name", { length: 255 }).notNull(),
	resourceType: mysqlEnum("resource_type", ['machine','labor','workstation','work_center']).notNull(),
	departmentId: bigint("department_id", { mode: "number", unsigned: true }),
	availableHours: decimal("available_hours", { precision: 10, scale: 2 }).default('0.00').notNull(),
	efficiencyPercent: decimal("efficiency_percent", { precision: 5, scale: 2 }).default('100.00').notNull(),
	utilizationPercent: decimal("utilization_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	calendarId: bigint("calendar_id", { mode: "number", unsigned: true }),
	costPerHour: decimal("cost_per_hour", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['active','inactive','maintenance']).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("cr_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "capacity_resources_id"}),
	unique("id").on(table.id),
]);

export const cashDrawerLogs = mysqlTable("cash_drawer_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	shiftId: bigint("shift_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	action: mysqlEnum(['opening','sale','cash_in','cash_out','payout','refund','loan','pickup','closing']).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).notNull(),
	balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).notNull(),
	referenceType: varchar("reference_type", { length: 100 }),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("cash_drawer_logs_shift_idx").on(table.shiftId),
	primaryKey({ columns: [table.id], name: "cash_drawer_logs_id"}),
	unique("id").on(table.id),
]);

export const cashboxTransactions = mysqlTable("cashbox_transactions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	sessionId: bigint("session_id", { mode: "number", unsigned: true }),
	transactionNumber: varchar("transaction_number", { length: 50 }).notNull(),
	transactionType: mysqlEnum("transaction_type", ['cash_in','cash_out','sale','purchase','expense','income','transfer','opening_balance','closing_balance','customer_payment','supplier_payment']).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	paymentMethod: mysqlEnum("payment_method", ['cash','card','transfer','cheque','wallet','other']).default('cash').notNull(),
	referenceType: varchar("reference_type", { length: 100 }),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
	description: text(),
	balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['pending','completed','cancelled']).default('completed').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "cashbox_transactions_id"}),
	unique("id").on(table.id),
]);

export const certificateApprovals = mysqlTable("certificate_approvals", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	certificateId: bigint("certificate_id", { mode: "number", unsigned: true }).notNull().references(() => paymentCertificates.id),
	approverRole: varchar("approver_role", { length: 255 }).notNull(),
	approverUserId: bigint("approver_user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
	approvalOrder: int("approval_order").notNull(),
	approvalStatus: varchar("approval_status", { length: 255 }).default('pending'),
	comments: text(),
	signatureBlob: text("signature_blob"),
	signatureDate: timestamp("signature_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
},
(table) => [
	index("approver_user_id").on(table.approverUserId),
	index("idx_cert_approvals_cert").on(table.certificateId),
	primaryKey({ columns: [table.id], name: "certificate_approvals_id"}),
]);

export const changeManagementLogs = mysqlTable("change_management_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	changeType: mysqlEnum("change_type", ['configuration','schema_update','code_deploy','permission_change','data_migration','integration_change','other']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	affectedModules: json("affected_modules"),
	changedBy: bigint("changed_by", { mode: "number", unsigned: true }),
	changedByName: varchar("changed_by_name", { length: 255 }),
	rollbackPlan: text("rollback_plan"),
	riskLevel: mysqlEnum("risk_level", ['low','medium','high']).default('low').notNull(),
	approvalStatus: mysqlEnum("approval_status", ['pending','approved','rejected','rolled_back']).default('pending').notNull(),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	rolledBackAt: timestamp("rolled_back_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("cml_tenant_idx").on(table.tenantId),
	index("cml_type_idx").on(table.changeType),
	primaryKey({ columns: [table.id], name: "change_management_logs_id"}),
]);

export const chartOfAccounts = mysqlTable("chart_of_accounts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	accountType: mysqlEnum("account_type", ['asset','liability','equity','revenue','expense','cost_of_sales']).notNull(),
	accountCategory: mysqlEnum("account_category", ['current_asset','fixed_asset','current_liability','long_term_liability','equity','revenue','expense','cogs','other_income','other_expense']).notNull(),
	parentId: bigint("parent_id", { mode: "number", unsigned: true }),
	level: int().default(1),
	isBankAccount: tinyint("is_bank_account").default(0),
	isCashAccount: tinyint("is_cash_account").default(0),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	openingBalance: decimal("opening_balance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	bankName: varchar("bank_name", { length: 255 }),
	bankAccountNumber: varchar("bank_account_number", { length: 100 }),
	bankIban: varchar("bank_iban", { length: 100 }),
	isActive: tinyint("is_active").default(1),
	costCenterEnabled: tinyint("cost_center_enabled").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("coa_code_idx").on(table.code),
	index("coa_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "chart_of_accounts_id"}),
	unique("id").on(table.id),
]);

export const chatConversations = mysqlTable("chat_conversations", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	subject: varchar({ length: 255 }),
	status: mysqlEnum(['active','resolved','closed']).default('active').notNull(),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("chat_conv_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "chat_conversations_id"}),
]);

export const chatMessages = mysqlTable("chat_messages", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	conversationId: bigint("conversation_id", { mode: "number", unsigned: true }).notNull(),
	senderId: bigint("sender_id", { mode: "number", unsigned: true }),
	senderType: mysqlEnum("sender_type", ['admin','support','tenant','user']).default('tenant').notNull(),
	senderName: varchar("sender_name", { length: 255 }),
	message: text().notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("chat_msg_conversation_idx").on(table.conversationId),
	primaryKey({ columns: [table.id], name: "chat_messages_id"}),
]);

export const claimsChangeOrders = mysqlTable("claims_change_orders", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	coNumber: varchar("co_number", { length: 100 }),
	claimType: varchar("claim_type", { length: 100 }),
	claimBasis: text("claim_basis"),
	requestedAmount: decimal("requested_amount", { precision: 15, scale: 2 }),
	proposedAmount: decimal("proposed_amount", { precision: 15, scale: 2 }),
	approvedAmount: decimal("approved_amount", { precision: 15, scale: 2 }),
	scope: text(),
	impactedTasks: json("impacted_tasks"),
	status: varchar({ length: 50 }).default('Submitted'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	submittedDate: date("submitted_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	approvedDate: date("approved_date", { mode: 'string' }),
	scheduleImpact: int("schedule_impact"),
	costImpact: decimal("cost_impact", { precision: 15, scale: 2 }),
	qualityImpact: varchar("quality_impact", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_claims_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "claims_change_orders_id"}),
	unique("co_number").on(table.coNumber),
]);

export const classTimetables = mysqlTable("class_timetables", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	grade: varchar({ length: 50 }),
	section: varchar({ length: 50 }),
	subject: varchar({ length: 255 }).notNull(),
	teacherId: bigint("teacher_id", { mode: "number", unsigned: true }),
	dayOfWeek: mysqlEnum("day_of_week", ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']).notNull(),
	startTime: varchar("start_time", { length: 10 }).notNull(),
	endTime: varchar("end_time", { length: 10 }).notNull(),
	roomNumber: varchar("room_number", { length: 50 }),
	academicYear: varchar("academic_year", { length: 20 }),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("class_timetables_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "class_timetables_id"}),
	unique("id").on(table.id),
]);

export const commissionRecords = mysqlTable("commission_records", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	agentName: varchar("agent_name", { length: 255 }).notNull(),
	leaseId: bigint("lease_id", { mode: "number", unsigned: true }),
	propertyId: bigint("property_id", { mode: "number", unsigned: true }),
	commissionType: mysqlEnum("commission_type", ['rental','sale','referral']).default('rental').notNull(),
	commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	commissionAmount: decimal("commission_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	status: mysqlEnum(['pending','approved','paid','cancelled']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("commission_records_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "commission_records_id"}),
	unique("id").on(table.id),
]);

export const companies = mysqlTable("companies", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	companyCode: varchar("company_code", { length: 100 }),
	legalName: varchar("legal_name", { length: 255 }).notNull(),
	legalNameAr: varchar("legal_name_ar", { length: 255 }),
	commercialRegistration: varchar("commercial_registration", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	crExpiryDate: date("cr_expiry_date", { mode: 'string' }),
	vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	vatCertificateExpiryDate: date("vat_certificate_expiry_date", { mode: 'string' }),
	branchCode: varchar("branch_code", { length: 50 }),
	branchCr: varchar("branch_cr", { length: 100 }),
	buildingNumber: varchar("building_number", { length: 10 }),
	streetName: varchar("street_name", { length: 255 }),
	streetNameAr: varchar("street_name_ar", { length: 255 }),
	district: varchar({ length: 255 }),
	districtAr: varchar("district_ar", { length: 255 }),
	cityName: varchar("city_name", { length: 100 }),
	cityNameAr: varchar("city_name_ar", { length: 100 }),
	postalCode: varchar("postal_code", { length: 10 }),
	additionalNumber: varchar("additional_number", { length: 10 }),
	bankName: varchar("bank_name", { length: 255 }),
	bankNameAr: varchar("bank_name_ar", { length: 255 }),
	iban: varchar({ length: 34 }),
	bankAccountNumber: varchar("bank_account_number", { length: 100 }),
	swiftCode: varchar("swift_code", { length: 11 }),
	logoUrl: text("logo_url"),
	stampUrl: text("stamp_url"),
	signatureUrl: text("signature_url"),
	brandPrimaryColor: varchar("brand_primary_color", { length: 7 }).default('#1e40af'),
	brandSecondaryColor: varchar("brand_secondary_color", { length: 7 }).default('#3b82f6'),
	invoiceHeaderColor: varchar("invoice_header_color", { length: 7 }).default('#1e40af'),
	companyWebsite: varchar("company_website", { length: 255 }),
	companyEmail: varchar("company_email", { length: 320 }),
	companyPhone: varchar("company_phone", { length: 50 }),
	companyMobile: varchar("company_mobile", { length: 50 }),
	companyWhatsapp: varchar("company_whatsapp", { length: 50 }),
	defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 2 }).default('15.00').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	defaultTaxRateEffectiveDate: date("default_tax_rate_effective_date", { mode: 'string' }),
	invoicePrefix: varchar("invoice_prefix", { length: 10 }).default('INV'),
	quotationPrefix: varchar("quotation_prefix", { length: 10 }).default('QT'),
	orderPrefix: varchar("order_prefix", { length: 10 }).default('SO'),
	poPrefix: varchar("po_prefix", { length: 10 }).default('PO'),
	invoiceTermsEn: text("invoice_terms_en"),
	invoiceTermsAr: text("invoice_terms_ar"),
	whiteLabelEnabled: tinyint("white_label_enabled").default(1),
	allowCustomBranding: tinyint("allow_custom_branding").default(1),
	invoiceCounter: int("invoice_counter").default(0).notNull(),
	lastInvoiceNumber: varchar("last_invoice_number", { length: 100 }),
	displayName: varchar("display_name", { length: 255 }),
	tradeNameEn: varchar("trade_name_en", { length: 255 }),
	tradeNameAr: varchar("trade_name_ar", { length: 255 }),
	countryCode: varchar("country_code", { length: 2 }).default('SA').notNull(),
	baseCurrency: varchar("base_currency", { length: 10 }).default('SAR').notNull(),
	timezone: varchar({ length: 50 }).default('Asia/Riyadh').notNull(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	index("companies_country_idx").on(table.countryCode),
	index("companies_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "companies_id"}),
	unique("companies_tenant_id_unique").on(table.tenantId),
	unique("id").on(table.id),
]);

export const companyLegalDetails = mysqlTable("company_legal_details", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	legalNameEn: varchar("legal_name_en", { length: 255 }).notNull(),
	legalNameAr: varchar("legal_name_ar", { length: 255 }),
	vatNumber: varchar("vat_number", { length: 15 }).notNull(),
	crNumber: varchar("cr_number", { length: 100 }),
	taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),
	businessActivity: varchar("business_activity", { length: 255 }),
	companyAddress: text("company_address"),
	buildingNumber: varchar("building_number", { length: 20 }),
	streetName: varchar("street_name", { length: 255 }),
	district: varchar({ length: 255 }),
	city: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 20 }),
	country: varchar({ length: 100 }).default('Saudi Arabia').notNull(),
	contactPerson: varchar("contact_person", { length: 255 }),
	phoneNumber: varchar("phone_number", { length: 50 }),
	emailAddress: varchar("email_address", { length: 320 }),
	companyLogo: text("company_logo"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	index("company_legal_tenant_idx").on(table.tenantId),
	index("company_legal_vat_idx").on(table.vatNumber),
	primaryKey({ columns: [table.id], name: "company_legal_details_id"}),
	unique("company_legal_details_tenant_id_unique").on(table.tenantId),
	unique("id").on(table.id),
]);

export const companySettings = mysqlTable("company_settings", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	companyName: varchar("company_name", { length: 255 }),
	companyNameAr: varchar("company_name_ar", { length: 255 }),
	tradeName: varchar("trade_name", { length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	mobile: varchar({ length: 50 }),
	website: varchar({ length: 255 }),
	address: text(),
	city: varchar({ length: 100 }),
	country: varchar({ length: 100 }),
	zipCode: varchar("zip_code", { length: 20 }),
	taxNumber: varchar("tax_number", { length: 100 }),
	crNumber: varchar("cr_number", { length: 100 }),
	vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default('15.00').notNull(),
	defaultCurrency: varchar("default_currency", { length: 10 }).default('SAR').notNull(),
	fiscalYearStart: varchar("fiscal_year_start", { length: 20 }).default('01-01').notNull(),
	dateFormat: varchar("date_format", { length: 20 }).default('DD/MM/YYYY').notNull(),
	timeFormat: mysqlEnum("time_format", ['12h','24h']).default('24h').notNull(),
	numberFormat: varchar("number_format", { length: 20 }).default('#,##0.00').notNull(),
	invoicePrefix: varchar("invoice_prefix", { length: 20 }).default('INV-').notNull(),
	invoiceTerms: text("invoice_terms"),
	purchaseOrderPrefix: varchar("purchase_order_prefix", { length: 20 }).default('PO-').notNull(),
	salesOrderPrefix: varchar("sales_order_prefix", { length: 20 }).default('SO-').notNull(),
	quotationPrefix: varchar("quotation_prefix", { length: 20 }).default('QUO-').notNull(),
	theme: varchar({ length: 20 }).default('light').notNull(),
	primaryColor: varchar("primary_color", { length: 20 }).default('#2563eb').notNull(),
	secondaryColor: varchar("secondary_color", { length: 20 }).default('#64748b').notNull(),
	logo: mediumtext(),
	favicon: text(),
	stampUrl: mediumtext("stamp_url"),
	unifiedNationalNo: varchar("unified_national_no", { length: 60 }),
	zatcaEnabled: tinyint("zatca_enabled").default(0),
	zatcaSandbox: tinyint("zatca_sandbox").default(1),
	aiApiKey: text("ai_api_key"),
	aiModel: varchar("ai_model", { length: 50 }).default('gemini-2.0-flash'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "company_settings_id"}),
	unique("tenant_id").on(table.tenantId),
]);

export const companyStamps = mysqlTable("company_stamps", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	type: mysqlEnum(['logo','stamp']).notNull(),
	imageData: text("image_data").notNull(),
	mimeType: varchar("mime_type", { length: 50 }).default('image/png'),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("company_stamp_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "company_stamps_id"}),
	unique("id").on(table.id),
]);

export const complianceAlerts = mysqlTable("compliance_alerts", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	alertType: mysqlEnum("alert_type", ['cr_expiry','vat_cert_expiry','csid_expiry','iqama_expiry','passport_expiry','contract_expiry','gosi_non_compliance','low_stock','overdue_invoice','credit_limit_exceeded']).notNull(),
	severity: mysqlEnum(['critical','high','medium','low']).default('medium').notNull(),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	message: text().notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	daysRemaining: int("days_remaining"),
	status: mysqlEnum(['active','acknowledged','resolved','dismissed']).default('active').notNull(),
	acknowledgedBy: bigint("acknowledged_by", { mode: "number", unsigned: true }),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("idx_status").on(table.status),
	index("idx_tenant").on(table.tenantId),
	index("idx_type").on(table.alertType),
	primaryKey({ columns: [table.id], name: "compliance_alerts_id"}),
]);

export const complianceFrameworkSettings = mysqlTable("compliance_framework_settings", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	framework: mysqlEnum(['soc2','iso27001','gdpr','pdpl','ccpa','hipaa','pci_dss','other']).notNull(),
	isEnabled: tinyint("is_enabled").default(0).notNull(),
	certificationStatus: mysqlEnum("certification_status", ['not_started','in_progress','auditing','certified','expired']).default('not_started').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	certificationDate: date("certification_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	auditorName: varchar("auditor_name", { length: 255 }),
	auditorCompany: varchar("auditor_company", { length: 255 }),
	config: json(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("cfs_tenant_idx").on(table.tenantId, table.framework),
	primaryKey({ columns: [table.id], name: "compliance_framework_settings_id"}),
]);

export const complianceProfiles = mysqlTable("compliance_profiles", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	countryCode: varchar("country_code", { length: 2 }).notNull(),
	profileName: varchar("profile_name", { length: 255 }).notNull(),
	requiresVatNumber: tinyint("requires_vat_number").default(0),
	requiresCrNumber: tinyint("requires_cr_number").default(0),
	requiresNtn: tinyint("requires_ntn").default(0),
	requiresStrn: tinyint("requires_strn").default(0),
	requiresCnic: tinyint("requires_cnic").default(0),
	requiresTrn: tinyint("requires_trn").default(0),
	hasProvinceTax: tinyint("has_province_tax").default(0),
	hasWithholdingTax: tinyint("has_withholding_tax").default(0),
	hasDigitalInvoice: tinyint("has_digital_invoice").default(0),
	hasQrCode: tinyint("has_qr_code").default(0),
	hasEInvoice: tinyint("has_e_invoice").default(0),
	invoiceLanguages: json("invoice_languages"),
	taxTypes: json("tax_types"),
	config: json(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "compliance_profiles_id"}),
	unique("id").on(table.id),
]);

export const conflictResolutions = mysqlTable("conflict_resolutions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: varchar("device_id", { length: 100 }),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: varchar("entity_id", { length: 100 }),
	localVersion: int("local_version").default(0),
	serverVersion: int("server_version").default(0),
	localPayload: json("local_payload"),
	serverPayload: json("server_payload"),
	resolution: mysqlEnum(['local_wins','server_wins','manual','merged']).default('server_wins').notNull(),
	resolvedBy: bigint("resolved_by", { mode: "number", unsigned: true }),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("conflict_resolutions_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "conflict_resolutions_id"}),
	unique("id").on(table.id),
]);

export const consentRecords = mysqlTable("consent_records", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	subjectType: mysqlEnum("subject_type", ['employee','customer','supplier','contact','user']).notNull(),
	subjectId: bigint("subject_id", { mode: "number", unsigned: true }).notNull(),
	consentType: varchar("consent_type", { length: 100 }).notNull(),
	isConsented: tinyint("is_consented").default(1).notNull(),
	consentDate: timestamp("consent_date", { mode: 'string' }).defaultNow().notNull(),
	consentVersion: varchar("consent_version", { length: 20 }).default('1.0'),
	lawfulBasis: varchar("lawful_basis", { length: 255 }).default('explicit_consent').notNull(),
	purposeDescription: text("purpose_description"),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	revokedAt: timestamp("revoked_at", { mode: 'string' }),
	revokedIp: varchar("revoked_ip", { length: 50 }),
	dataDeletedAt: timestamp("data_deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("consent_subject_idx").on(table.subjectType, table.subjectId),
	index("consent_tenant_idx").on(table.tenantId),
	index("consent_type_idx").on(table.consentType),
	primaryKey({ columns: [table.id], name: "consent_records_id"}),
]);

export const consignmentInventory = mysqlTable("consignment_inventory", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	agreedMinLevel: decimal("agreed_min_level", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	agreedMaxLevel: decimal("agreed_max_level", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	unitCost: decimal("unit_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lastConsumptionDate: date("last_consumption_date", { mode: 'string' }),
	status: mysqlEnum(['active','suspended']).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ci_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "consignment_inventory_id"}),
	unique("id").on(table.id),
]);

export const consolidationEliminations = mysqlTable("consolidation_eliminations", {
	id: serial().notNull(),
	groupId: bigint("group_id", { mode: "number", unsigned: true }).notNull(),
	entryType: mysqlEnum("entry_type", ['interco_revenue','interco_expense','interco_receivable','interco_payable','interco_dividend','investment']).notNull(),
	sourceCompanyId: bigint("source_company_id", { mode: "number", unsigned: true }),
	targetCompanyId: bigint("target_company_id", { mode: "number", unsigned: true }),
	accountId: bigint("account_id", { mode: "number", unsigned: true }),
	amount: decimal({ precision: 18, scale: 2 }).default('0.00').notNull(),
	eliminationMethod: mysqlEnum("elimination_method", ['line_by_line','proportional']).default('line_by_line'),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("cons_eliminations_group_idx").on(table.groupId),
	primaryKey({ columns: [table.id], name: "consolidation_eliminations_id"}),
	unique("id").on(table.id),
]);

export const consolidationEntries = mysqlTable("consolidation_entries", {
	id: serial().notNull(),
	groupId: bigint("group_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }),
	entryType: mysqlEnum("entry_type", ['elimination','reclassification','adjustment','translation']).notNull(),
	description: text(),
	amount: decimal({ precision: 18, scale: 2 }).default('0.00').notNull(),
	accountId: bigint("account_id", { mode: "number", unsigned: true }),
	companyId: bigint("company_id", { mode: "number", unsigned: true }),
	currency: varchar({ length: 10 }).default('SAR'),
	exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default('1.000000'),
	status: mysqlEnum(['draft','posted','reversed']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("cons_entries_group_idx").on(table.groupId),
	primaryKey({ columns: [table.id], name: "consolidation_entries_id"}),
	unique("id").on(table.id),
]);

export const consolidationGroupCompanies = mysqlTable("consolidation_group_companies", {
	id: serial().notNull(),
	groupId: bigint("group_id", { mode: "number", unsigned: true }).notNull(),
	companyId: bigint("company_id", { mode: "number", unsigned: true }).notNull(),
	ownershipPercent: decimal("ownership_percent", { precision: 18, scale: 4 }).default('100.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	consolidationDate: date("consolidation_date", { mode: 'string' }),
	isExcluded: tinyint("is_excluded").default(0),
	notes: text(),
},
(table) => [
	index("cons_group_companies_group_idx").on(table.groupId),
	primaryKey({ columns: [table.id], name: "consolidation_group_companies_id"}),
	unique("id").on(table.id),
]);

export const consolidationGroups = mysqlTable("consolidation_groups", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	fiscalYearId: bigint("fiscal_year_id", { mode: "number", unsigned: true }),
	baseCurrency: varchar("base_currency", { length: 10 }).default('SAR').notNull(),
	consolidationMethod: mysqlEnum("consolidation_method", ['equity','proportionate','acquisition']).default('equity').notNull(),
	eliminationMethod: mysqlEnum("elimination_method", ['line_by_line','proportional']).default('line_by_line').notNull(),
	status: mysqlEnum(['draft','in_progress','completed']).default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("cons_groups_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "consolidation_groups_id"}),
	unique("id").on(table.id),
]);

export const constructionAnalytics = mysqlTable("construction_analytics", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportingDate: date("reporting_date", { mode: 'string' }),
	totalBudget: decimal("total_budget", { precision: 15, scale: 2 }),
	totalActual: decimal("total_actual", { precision: 15, scale: 2 }),
	budgetVariancePercent: decimal("budget_variance_percent", { precision: 5, scale: 2 }),
	plannedPercentage: decimal("planned_percentage", { precision: 5, scale: 2 }),
	actualPercentage: decimal("actual_percentage", { precision: 5, scale: 2 }),
	scheduleVariancePercent: decimal("schedule_variance_percent", { precision: 5, scale: 2 }),
	defectCount: int("defect_count"),
	ncrCount: int("ncr_count"),
	qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
	incidents: int(),
	trifr: decimal({ precision: 8, scale: 2 }),
	resourceUtilization: decimal("resource_utilization", { precision: 5, scale: 2 }),
	laborProductivity: decimal("labor_productivity", { precision: 5, scale: 2 }),
	equipmentUtilization: decimal("equipment_utilization", { precision: 5, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_analytics_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "construction_analytics_id"}),
]);

export const constructionContracts = mysqlTable("construction_contracts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	contractNumber: varchar("contract_number", { length: 100 }).notNull(),
	contractType: mysqlEnum("contract_type", ['lump_sum','cost_plus','unit_price','design_build','turnkey']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	clientId: bigint("client_id", { mode: "number", unsigned: true }),
	contractorId: bigint("contractor_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	contractDate: date("contract_date", { mode: 'string' }),
	contractValue: decimal("contract_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	currency: varchar({ length: 3 }).default('SAR'),
	paymentTerms: text("payment_terms"),
	liquidatedDamagesPercent: decimal("liquidated_damages_percent", { precision: 5, scale: 2 }).default('0.00'),
	warrantyPeriodMonths: int("warranty_period_months").default(12),
	retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default('10.00'),
	advancePaymentPercent: decimal("advance_payment_percent", { precision: 5, scale: 2 }).default('0.00'),
	advancePaymentAmount: decimal("advance_payment_amount", { precision: 18, scale: 4 }).default('0.0000'),
	insuranceRequired: tinyint("insurance_required").default(1),
	insuranceAmount: decimal("insurance_amount", { precision: 18, scale: 4 }),
	performanceBondPercent: decimal("performance_bond_percent", { precision: 5, scale: 2 }).default('5.00'),
	performanceBondAmount: decimal("performance_bond_amount", { precision: 18, scale: 4 }),
	status: mysqlEnum(['draft','signed','active','amended','completed','terminated']).default('draft').notNull(),
	signedByClient: tinyint("signed_by_client"),
	signedByContractor: tinyint("signed_by_contractor"),
	signedAt: timestamp("signed_at", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("construction_contracts_project_idx").on(table.tenantId, table.projectId),
	index("construction_contracts_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "construction_contracts_id"}),
	unique("id").on(table.id),
]);

export const constructionInvoiceItems = mysqlTable("construction_invoice_items", {
	id: int().autoincrement().notNull(),
	invoiceId: int("invoice_id").notNull(),
	sr: int().default(1),
	descriptionEn: varchar("description_en", { length: 255 }),
	descriptionAr: varchar("description_ar", { length: 255 }),
	unit: varchar({ length: 30 }).default('Hour'),
	totalHour: decimal("total_hour", { precision: 10, scale: 2 }).default('0.00'),
	rate: decimal({ precision: 18, scale: 4 }).default('0.0000'),
	lineTotal: decimal("line_total", { precision: 18, scale: 4 }).default('0.0000'),
},
(table) => [
	index("idx_cii_invoice").on(table.invoiceId),
	primaryKey({ columns: [table.id], name: "construction_invoice_items_id"}),
]);

export const constructionInvoices = mysqlTable("construction_invoices", {
	id: int().autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	customerName: varchar("customer_name", { length: 255 }),
	customerNameAr: varchar("customer_name_ar", { length: 255 }),
	customerVat: varchar("customer_vat", { length: 100 }),
	customerCr: varchar("customer_cr", { length: 100 }),
	customerAddress: text("customer_address"),
	customerPhone: varchar("customer_phone", { length: 50 }),
	invoiceNo: varchar("invoice_no", { length: 60 }).notNull(),
	poNumber: varchar("po_number", { length: 90 }),
	workedMonth: varchar("worked_month", { length: 30 }),
	paymentType: varchar("payment_type", { length: 40 }).default('Credit'),
	cashier: varchar({ length: 120 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	status: mysqlEnum(['draft','submitted','approved','paid']).default('draft'),
	subtotal: decimal({ precision: 18, scale: 4 }).default('0.0000'),
	vatPercent: decimal("vat_percent", { precision: 5, scale: 2 }).default('15.00'),
	vatAmount: decimal("vat_amount", { precision: 18, scale: 4 }).default('0.0000'),
	grandTotal: decimal("grand_total", { precision: 18, scale: 4 }).default('0.0000'),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_ci_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "construction_invoices_id"}),
	unique("uq_ci_no").on(table.tenantId, table.invoiceNo),
]);

export const constructionProjects = mysqlTable("construction_projects", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectCode: varchar("project_code", { length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	projectManagerId: bigint("project_manager_id", { mode: "number", unsigned: true }),
	location: varchar({ length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	contractValue: decimal("contract_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	budget: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	progress: int().default(0).notNull(),
	status: mysqlEnum(['planning','tendering','active','on_hold','completed','cancelled']).default('planning').notNull(),
	projectType: mysqlEnum("project_type", ['residential','commercial','industrial','infrastructure','renovation']).default('residential').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("construction_projects_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "construction_projects_id"}),
	unique("id").on(table.id),
]);

export const contractAssets = mysqlTable("contract_assets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	obligationId: bigint("obligation_id", { mode: "number", unsigned: true }),
	assetType: mysqlEnum("asset_type", ['contract_asset','receivable','unbilled_receivable']).notNull(),
	amount: decimal({ precision: 18, scale: 2 }).default('0.00'),
	recognizedRevenue: decimal("recognized_revenue", { precision: 18, scale: 2 }).default('0.00'),
	billingAmount: decimal("billing_amount", { precision: 18, scale: 2 }).default('0.00'),
	receivedAmount: decimal("received_amount", { precision: 18, scale: 2 }).default('0.00'),
	status: mysqlEnum(['pending','recognized','billed','collected']).default('pending').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("contract_assets_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "contract_assets_id"}),
	unique("id").on(table.id),
]);

export const contractCosts = mysqlTable("contract_costs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	costType: mysqlEnum("cost_type", ['incremental_fulfillment','mobilization','setup','training','commission']).notNull(),
	description: text(),
	amount: decimal({ precision: 18, scale: 2 }).default('0.00'),
	capitalizedAmount: decimal("capitalized_amount", { precision: 18, scale: 2 }).default('0.00'),
	amortizationPeriod: int("amortization_period"),
	amortizationMethod: varchar("amortization_method", { length: 50 }),
	status: mysqlEnum(['pending','capitalized','amortized']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("contract_costs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "contract_costs_id"}),
	unique("id").on(table.id),
]);

export const contractLiabilities = mysqlTable("contract_liabilities", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	obligationId: bigint("obligation_id", { mode: "number", unsigned: true }),
	liabilityType: mysqlEnum("liability_type", ['deferred_revenue','advance_billing','refund_liability']).notNull(),
	amount: decimal({ precision: 18, scale: 2 }).default('0.00'),
	recognizedAmount: decimal("recognized_amount", { precision: 18, scale: 2 }).default('0.00'),
	remainingAmount: decimal("remaining_amount", { precision: 18, scale: 2 }).default('0.00'),
	status: mysqlEnum(['unearned','partially_recognized','fully_recognized']).default('unearned').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("contract_liab_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "contract_liabilities_id"}),
	unique("id").on(table.id),
]);

export const contractModifications = mysqlTable("contract_modifications", {
	id: serial().notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	modificationType: mysqlEnum("modification_type", ['change_order','extension','termination','discount']).notNull(),
	description: text(),
	preModificationPrice: decimal("pre_modification_price", { precision: 18, scale: 2 }).default('0.00'),
	postModificationPrice: decimal("post_modification_price", { precision: 18, scale: 2 }).default('0.00'),
	effectType: mysqlEnum("effect_type", ['prospective','cumulative']).default('prospective'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveDate: date("effective_date", { mode: 'string' }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "contract_modifications_id"}),
	unique("id").on(table.id),
]);

export const controlledSubstanceLog = mysqlTable("controlled_substance_log", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	batchNumber: varchar("batch_number", { length: 100 }),
	prescriptionId: bigint("prescription_id", { mode: "number", unsigned: true }),
	patientName: varchar("patient_name", { length: 255 }).notNull(),
	patientIdNumber: varchar("patient_id_number", { length: 100 }),
	doctorName: varchar("doctor_name", { length: 255 }),
	quantityDispensed: int("quantity_dispensed").notNull(),
	balanceBefore: int("balance_before").notNull(),
	balanceAfter: int("balance_after").notNull(),
	dispensedBy: bigint("dispensed_by", { mode: "number", unsigned: true }).notNull(),
	witnessedBy: bigint("witnessed_by", { mode: "number", unsigned: true }),
	dispensedAt: timestamp("dispensed_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("controlled_substance_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "controlled_substance_log_id"}),
	unique("id").on(table.id),
]);

export const correctivePreventiveActions = mysqlTable("corrective_preventive_actions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	ncrId: bigint("ncr_id", { mode: "number", unsigned: true }).notNull(),
	actionType: mysqlEnum("action_type", ['corrective','preventive']).notNull(),
	description: text().notNull(),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	status: mysqlEnum(['open','in_progress','completed','verified','cancelled']).default('open').notNull(),
	verificationNotes: text("verification_notes"),
	verifiedBy: bigint("verified_by", { mode: "number", unsigned: true }),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("capa_ncr_idx").on(table.ncrId),
	index("capa_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "corrective_preventive_actions_id"}),
	unique("id").on(table.id),
]);

export const costCenters = mysqlTable("cost_centers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	budgetAmount: decimal("budget_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	actualAmount: decimal("actual_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "cost_centers_id"}),
	unique("id").on(table.id),
]);

export const costVarianceAlerts = mysqlTable("cost_variance_alerts", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	jobCostingDetailId: bigint("job_costing_detail_id", { mode: "number", unsigned: true }).notNull().references(() => jobCostingDetails.id),
	thresholdPercent: int("threshold_percent"),
	alertSeverity: varchar("alert_severity", { length: 255 }).notNull(),
	message: text().notNull(),
	varianceDetails: varchar("variance_details", { length: 255 }),
	isResolved: tinyint("is_resolved").default(0),
	resolvedBy: bigint("resolved_by", { mode: "number", unsigned: true }).references(() => users.id),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	resolutionNotes: varchar("resolution_notes", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
},
(table) => [
	index("idx_cost_alerts_project").on(table.projectId),
	index("idx_cost_alerts_status").on(table.isResolved),
	index("job_costing_detail_id").on(table.jobCostingDetailId),
	index("resolved_by").on(table.resolvedBy),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "cost_variance_alerts_id"}),
]);

export const countries = mysqlTable("countries", {
	id: serial().notNull(),
	code: varchar({ length: 2 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	dialCode: varchar("dial_code", { length: 10 }),
	flagEmoji: varchar("flag_emoji", { length: 10 }),
	isActive: tinyint("is_active").default(1),
	sortOrder: int("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "countries_id"}),
	unique("countries_code_unique").on(table.code),
	unique("id").on(table.id),
]);

export const countryTaxConfigs = mysqlTable("country_tax_configs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	countryCode: varchar("country_code", { length: 2 }).default('SA').notNull(),
	taxName: varchar("tax_name", { length: 100 }).notNull(),
	taxNameAr: varchar("tax_name_ar", { length: 100 }),
	taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('15.00').notNull(),
	taxNumberLabel: varchar("tax_number_label", { length: 100 }),
	taxNumberLabelAr: varchar("tax_number_label_ar", { length: 100 }),
	taxAuthority: varchar("tax_authority", { length: 100 }),
	taxAuthorityAr: varchar("tax_authority_ar", { length: 100 }),
	requiresZatca: tinyint("requires_zatca").default(0),
	requiresFbr: tinyint("requires_fbr").default(0),
	invoiceNote: text("invoice_note"),
	invoiceNoteAr: text("invoice_note_ar"),
	isDefault: tinyint("is_default").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("country_tax_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "country_tax_configs_id"}),
	unique("id").on(table.id),
]);

export const coupons = mysqlTable("coupons", {
	id: serial().notNull(),
	code: varchar({ length: 50 }).notNull(),
	description: text(),
	discountType: mysqlEnum("discount_type", ['percentage','fixed']).default('percentage').notNull(),
	discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
	maxUses: int("max_uses").default(0),
	usedCount: int("used_count").default(0),
	minPlanPrice: decimal("min_plan_price", { precision: 10, scale: 2 }),
	applicablePlans: json("applicable_plans"),
	startsAt: timestamp("starts_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "coupons_id"}),
	unique("coupons_code_unique").on(table.code),
	unique("id").on(table.id),
]);

export const cpmTasks = mysqlTable("cpm_tasks", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	taskCode: varchar("task_code", { length: 50 }),
	taskName: varchar("task_name", { length: 255 }),
	plannedDurationDays: int("planned_duration_days"),
	actualDurationDays: int("actual_duration_days"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	earlyStart: date("early_start", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	earlyFinish: date("early_finish", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lateStart: date("late_start", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lateFinish: date("late_finish", { mode: 'string' }),
	predecessorTaskId: int("predecessor_task_id"),
	relationshipType: varchar("relationship_type", { length: 10 }),
	lagDays: int("lag_days"),
	assignedResourceId: int("assigned_resource_id"),
	resourceHours: int("resource_hours"),
	progressPercent: decimal("progress_percent", { precision: 5, scale: 2 }),
	isCriticalPath: tinyint("is_critical_path"),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_cpm_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "cpm_tasks_id"}),
]);

export const creditNotes = mysqlTable("credit_notes", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	creditNoteNumber: varchar("credit_note_number", { length: 50 }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	reason: text(),
	status: mysqlEnum(['draft','applied','refunded']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "credit_notes_id"}),
	unique("id").on(table.id),
]);

export const crewCertifications = mysqlTable("crew_certifications", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	certificationType: varchar("certification_type", { length: 255 }).notNull(),
	certificationNumber: varchar("certification_number", { length: 100 }),
	issuedBy: varchar("issued_by", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	issueDate: date("issue_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("crew_certifications_emp_idx").on(table.employeeId),
	index("crew_certifications_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "crew_certifications_id"}),
	unique("id").on(table.id),
]);

export const crmActivities = mysqlTable("crm_activities", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	activityType: mysqlEnum("activity_type", ['call','email','meeting','task','note','whatsapp','sms']).notNull(),
	relatedType: mysqlEnum("related_type", ['lead','opportunity','customer','contact']).notNull(),
	relatedId: bigint("related_id", { mode: "number", unsigned: true }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	description: text(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "crm_activities_id"}),
	unique("id").on(table.id),
]);

export const currencies = mysqlTable("currencies", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 10 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	symbol: varchar({ length: 10 }),
	exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default('1.000000').notNull(),
	isBase: tinyint("is_base").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "currencies_id"}),
	unique("id").on(table.id),
]);

export const customerPayments = mysqlTable("customer_payments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	paymentMethod: mysqlEnum("payment_method", ['cash','bank_transfer','cheque','card','online']).notNull(),
	bankAccountId: bigint("bank_account_id", { mode: "number", unsigned: true }),
	reference: varchar({ length: 100 }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "customer_payments_id"}),
	unique("id").on(table.id),
]);

export const customerPriceTiers = mysqlTable("customer_price_tiers", {
	id: serial().notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	priceTierId: bigint("price_tier_id", { mode: "number", unsigned: true }).notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "customer_price_tiers_id"}),
	unique("customer_price_tiers_unique").on(table.customerId, table.priceTierId),
	unique("id").on(table.id),
]);

export const customers = mysqlTable("customers", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }),
	customerCode: varchar("customer_code", { length: 50 }),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	customerType: mysqlEnum("customer_type", ['b2b','b2c','government','cash_customer']).default('b2c').notNull(),
	commercialRegistration: varchar("commercial_registration", { length: 100 }),
	vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	mobile: varchar({ length: 50 }),
	whatsapp: varchar({ length: 50 }),
	address: text(),
	buildingNumber: varchar("building_number", { length: 10 }),
	streetName: varchar("street_name", { length: 255 }),
	district: varchar({ length: 255 }),
	city: varchar({ length: 100 }),
	cityName: varchar("city_name", { length: 100 }),
	postalCode: varchar("postal_code", { length: 10 }),
	additionalNumber: varchar("additional_number", { length: 10 }),
	country: varchar({ length: 100 }).default('Saudi Arabia'),
	taxNumber: varchar("tax_number", { length: 100 }),
	contactPerson: varchar("contact_person", { length: 255 }),
	contactJobTitle: varchar("contact_job_title", { length: 255 }),
	creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).default('0.00'),
	creditLimitCheckEnabled: tinyint("credit_limit_check_enabled").default(1),
	paymentTerms: int("payment_terms").default(30),
	currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default('0.00'),
	openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default('0.00'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	openingBalanceDate: date("opening_balance_date", { mode: 'string' }),
	customerGroup: varchar("customer_group", { length: 100 }),
	customerCategory: varchar("customer_category", { length: 100 }),
	taxCategoryId: bigint("tax_category_id", { mode: "number", unsigned: true }),
	vatValidated: tinyint("vat_validated").default(0),
	crValidated: tinyint("cr_validated").default(0),
	notes: text(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	vatNumber: varchar("vat_number", { length: 15 }),
	crNumber: varchar("cr_number", { length: 100 }),
	contactTitle: varchar("contact_title", { length: 100 }),
	localUuid: varchar("local_uuid", { length: 255 }),
	version: int().default(1),
	serverId: bigint("server_id", { mode: "number", unsigned: true }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
},
(table) => [
	index("cust_luuid_idx").on(table.localUuid),
	index("customers_code_idx").on(table.code),
	index("idx_name").on(table.name),
	index("idx_tenant").on(table.tenantId),
	index("idx_vat").on(table.vatRegistrationNumber),
	primaryKey({ columns: [table.id], name: "customers_id"}),
]);

export const cvrReports = mysqlTable("cvr_reports", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	reportNumber: varchar("report_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }),
	approvedVariations: decimal("approved_variations", { precision: 18, scale: 4 }).default('0.0000'),
	pendingVariations: decimal("pending_variations", { precision: 18, scale: 4 }).default('0.0000'),
	originalContractValue: decimal("original_contract_value", { precision: 18, scale: 4 }),
	revisedContractValue: decimal("revised_contract_value", { precision: 18, scale: 4 }),
	workCompletedValue: decimal("work_completed_value", { precision: 18, scale: 4 }),
	workRemainingValue: decimal("work_remaining_value", { precision: 18, scale: 4 }),
	certifiedAmount: decimal("certified_amount", { precision: 18, scale: 4 }),
	amountsRetention: decimal("amounts_retention", { precision: 18, scale: 4 }),
	amountsPaid: decimal("amounts_paid", { precision: 18, scale: 4 }),
	amountsOutstanding: decimal("amounts_outstanding", { precision: 18, scale: 4 }),
	totalCostToDate: decimal("total_cost_to_date", { precision: 18, scale: 4 }),
	estimatedFinalCost: decimal("estimated_final_cost", { precision: 18, scale: 4 }),
	forecastProfitLoss: decimal("forecast_profit_loss", { precision: 18, scale: 4 }),
	status: mysqlEnum(['draft','reviewed','approved']).default('draft').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("cvr_reports_project_idx").on(table.tenantId, table.projectId),
	index("cvr_reports_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "cvr_reports_id"}),
	unique("id").on(table.id),
]);

export const cycleCountEntries = mysqlTable("cycle_count_entries", {
	id: serial().notNull(),
	scheduleId: bigint("schedule_id", { mode: "number", unsigned: true }).notNull(),
	locationId: bigint("location_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	expectedQuantity: decimal("expected_quantity", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	actualQuantity: decimal("actual_quantity", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	variance: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	varianceReason: mysqlEnum("variance_reason", ['mispick','putaway_error','damage','theft','system_error','other']),
	countedBy: bigint("counted_by", { mode: "number", unsigned: true }),
	countDate: timestamp("count_date", { mode: 'string' }).default(sql`(now())`).notNull(),
	status: mysqlEnum(['open','verified','adjusted']).default('open').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("cce_schedule_idx").on(table.scheduleId),
	primaryKey({ columns: [table.id], name: "cycle_count_entries_id"}),
	unique("id").on(table.id),
]);

export const cycleCountSchedules = mysqlTable("cycle_count_schedules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	zoneId: bigint("zone_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	countDate: date("count_date", { mode: 'string' }).notNull(),
	frequency: mysqlEnum(['daily','weekly','monthly','quarterly','annually']).notNull(),
	status: mysqlEnum(['scheduled','in_progress','completed']).default('scheduled').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ccs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "cycle_count_schedules_id"}),
	unique("id").on(table.id),
]);

export const dashboardWidgets = mysqlTable("dashboard_widgets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	dashboardId: bigint("dashboard_id", { mode: "number", unsigned: true }).notNull(),
	widgetType: varchar("widget_type", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar("title_ar", { length: 255 }),
	dataSource: json("data_source"),
	visualConfig: json("visual_config"),
	positionX: int("position_x").default(0),
	positionY: int("position_y").default(0),
	width: int().default(4),
	height: int().default(3),
	isVisible: tinyint("is_visible").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("dw_dashboard_idx").on(table.tenantId, table.dashboardId),
	primaryKey({ columns: [table.id], name: "dashboard_widgets_id"}),
	unique("id").on(table.id),
]);

export const dashboards = mysqlTable("dashboards", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	description: text(),
	layout: json(),
	templateKey: varchar("template_key", { length: 100 }),
	isTemplate: tinyint("is_template").default(0),
	isDefault: tinyint("is_default").default(0),
	isShared: tinyint("is_shared").default(0),
	roles: json(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("dashboards_template_idx").on(table.tenantId, table.templateKey),
	index("dashboards_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "dashboards_id"}),
	unique("id").on(table.id),
]);

export const dataClassifications = mysqlTable("data_classifications", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	level: int().default(1).notNull(),
	description: text(),
	colorHex: varchar("color_hex", { length: 7 }).default('#6b7280'),
	requiresEncryption: tinyint("requires_encryption").default(0).notNull(),
	requiresConsent: tinyint("requires_consent").default(0).notNull(),
	retentionDays: int("retention_days"),
	isSystem: tinyint("is_system").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("data_class_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "data_classifications_id"}),
]);

export const dataProcessingAgreements = mysqlTable("data_processing_agreements", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	processorName: varchar("processor_name", { length: 255 }).notNull(),
	processorContact: varchar("processor_contact", { length: 255 }),
	processorEmail: varchar("processor_email", { length: 320 }),
	purpose: text().notNull(),
	dataCategories: json("data_categories").notNull(),
	dataSubjectCategories: json("data_subject_categories"),
	processingActivities: text("processing_activities"),
	securityMeasures: text("security_measures"),
	personalDataTransfers: tinyint("personal_data_transfers").default(0).notNull(),
	transferCountries: json("transfer_countries"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveDate: date("effective_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	status: mysqlEnum(['draft','active','expired','terminated']).default('draft').notNull(),
	documentId: bigint("document_id", { mode: "number", unsigned: true }),
	signedByController: tinyint("signed_by_controller").default(0).notNull(),
	signedByProcessor: tinyint("signed_by_processor").default(0).notNull(),
	controllerSignedAt: timestamp("controller_signed_at", { mode: 'string' }),
	processorSignedAt: timestamp("processor_signed_at", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("dpa_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "data_processing_agreements_id"}),
]);

export const dataRetentionPolicies = mysqlTable("data_retention_policies", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	retentionDays: int("retention_days").notNull(),
	action: mysqlEnum(['delete','anonymize','archive','flag_for_review']).default('archive').notNull(),
	legalBasis: text("legal_basis"),
	isActive: tinyint("is_active").default(1).notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("drp_tenant_idx").on(table.tenantId, table.entityType),
	primaryKey({ columns: [table.id], name: "data_retention_policies_id"}),
]);

export const dataSubjectRequests = mysqlTable("data_subject_requests", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	requestType: mysqlEnum("request_type", ['access','rectification','erasure','restrict','portability','objection','withdraw_consent']).notNull(),
	subjectType: mysqlEnum("subject_type", ['employee','customer','supplier','contact','user']).notNull(),
	subjectId: bigint("subject_id", { mode: "number", unsigned: true }).notNull(),
	subjectEmail: varchar("subject_email", { length: 320 }),
	subjectPhone: varchar("subject_phone", { length: 50 }),
	requestDetails: text("request_details"),
	status: mysqlEnum(['pending','verifying','in_progress','completed','rejected','partially_completed']).default('pending').notNull(),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	responseSummary: text("response_summary"),
	rejectionReason: text("rejection_reason"),
	dataExportFile: text("data_export_file"),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	verificationMethod: varchar("verification_method", { length: 100 }),
	regulation: mysqlEnum(['gdpr','pdpl','ccpa','lgpd','other']).default('pdpl').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("dsar_status_idx").on(table.status),
	index("dsar_subject_idx").on(table.subjectType, table.subjectId),
	index("dsar_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "data_subject_requests_id"}),
]);

export const decennialLiability = mysqlTable("decennial_liability", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
	liabilityPeriodYears: int("liability_period_years").default(10),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	insurancePolicyNumber: varchar("insurance_policy_number", { length: 100 }),
	insuranceProvider: varchar("insurance_provider", { length: 255 }),
	insuranceAmount: decimal("insurance_amount", { precision: 18, scale: 4 }),
	coverageDetails: text("coverage_details"),
	decennialCertificate: varchar("decennial_certificate", { length: 255 }),
	status: mysqlEnum(['active','expired','claimed']).default('active').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lastInspectionDate: date("last_inspection_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	nextInspectionDate: date("next_inspection_date", { mode: 'string' }),
	claimsRaised: int("claims_raised").default(0),
	claimsAmount: decimal("claims_amount", { precision: 18, scale: 4 }).default('0.0000'),
	resolvedClaimsAmount: decimal("resolved_claims_amount", { precision: 18, scale: 4 }).default('0.0000'),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("decennial_liability_project_idx").on(table.tenantId, table.projectId),
	index("decennial_liability_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "decennial_liability_id"}),
	unique("id").on(table.id),
]);

export const deletedRecordsTombstone = mysqlTable("deleted_records_tombstone", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: varchar("entity_id", { length: 255 }).notNull(),
	serverId: bigint("server_id", { mode: "number", unsigned: true }),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }).defaultNow(),
	synced: tinyint().default(0),
},
(table) => [
	index("idx_tombstone_entity").on(table.entityType, table.entityId),
	index("idx_tombstone_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "deleted_records_tombstone_id"}),
]);

export const departments = mysqlTable("departments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	managerId: bigint("manager_id", { mode: "number", unsigned: true }),
	parentId: bigint("parent_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "departments_id"}),
	unique("id").on(table.id),
]);

export const depreciationEntries = mysqlTable("depreciation_entries", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	assetId: bigint("asset_id", { mode: "number", unsigned: true }).notNull(),
	period: varchar({ length: 20 }).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	accumulatedAmount: decimal("accumulated_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	bookValue: decimal("book_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "depreciation_entries_id"}),
	unique("id").on(table.id),
]);

export const designations = mysqlTable("designations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "designations_id"}),
	unique("id").on(table.id),
]);

export const desktopLicenses = mysqlTable("desktop_licenses", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	licenseKeyHash: varchar("license_key_hash", { length: 128 }).notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	plan: varchar({ length: 50 }).default('desktop').notNull(),
	maxDevices: int("max_devices").default(1).notNull(),
	status: mysqlEnum(['active','revoked','expired']).default('active').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	issuedBy: bigint("issued_by", { mode: "number", unsigned: true }),
	lastActivatedAt: timestamp("last_activated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("desktop_licenses_status_idx").on(table.status),
	index("desktop_licenses_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "desktop_licenses_id"}),
	unique("desktop_licenses_license_key_hash_unique").on(table.licenseKeyHash),
	unique("id").on(table.id),
]);

export const deviceRegistrations = mysqlTable("device_registrations", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	deviceId: varchar("device_id", { length: 255 }).notNull(),
	deviceName: varchar("device_name", { length: 255 }),
	platform: varchar({ length: 50 }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	lastSeen: timestamp("last_seen", { mode: 'string' }),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	appVersion: varchar("app_version", { length: 50 }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_device_tenant").on(table.tenantId),
	index("idx_device_user").on(table.userId),
	primaryKey({ columns: [table.id], name: "device_registrations_id"}),
	unique("device_id").on(table.deviceId),
]);

export const doctorRosters = mysqlTable("doctor_rosters", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	specialization: varchar({ length: 255 }),
	licenseNumber: varchar("license_number", { length: 100 }),
	consultationFee: decimal("consultation_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	maxPatientsPerDay: int("max_patients_per_day").default(20).notNull(),
	workingDays: json("working_days"),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("doctor_rosters_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "doctor_rosters_id"}),
	unique("id").on(table.id),
]);

export const documentAccessLogs = mysqlTable("document_access_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	documentId: bigint("document_id", { mode: "number", unsigned: true }).notNull(),
	action: varchar({ length: 50 }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	ipAddress: varchar("ip_address", { length: 45 }),
	metadata: text(),
	userAgent: varchar("user_agent", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("doc_access_doc_idx").on(table.tenantId, table.documentId),
	index("doc_access_tenant_idx").on(table.tenantId, table.documentId),
	index("doc_access_user_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "document_access_logs_id"}),
]);

export const documentCategories = mysqlTable("document_categories", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	parentId: bigint("parent_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "document_categories_id"}),
	unique("id").on(table.id),
]);

export const documentExpiryReminders = mysqlTable("document_expiry_reminders", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	documentId: bigint("document_id", { mode: "number", unsigned: true }).notNull(),
	reminderType: mysqlEnum("reminder_type", ['iqama_expiry','trade_license','insurance','contract_renewal','visa_expiry','other']).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }).notNull(),
	reminderDaysBefore: int("reminder_days_before").default(30).notNull(),
	notifyUserIds: json("notify_user_ids"),
	lastRemindedAt: timestamp("last_reminded_at", { mode: 'string' }),
	reminderCount: int("reminder_count").default(0).notNull(),
	status: mysqlEnum(['active','triggered','expired','dismissed']).default('active').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("doc_rem_expiry_idx").on(table.expiryDate),
	index("doc_rem_status_idx").on(table.status),
	index("doc_rem_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "document_expiry_reminders_id"}),
]);

export const documentVersions = mysqlTable("document_versions", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	documentId: bigint("document_id", { mode: "number", unsigned: true }).notNull(),
	versionNumber: int("version_number").default(1).notNull(),
	fileName: varchar("file_name", { length: 255 }),
	filePath: text("file_path"),
	fileSize: bigint("file_size", { mode: "number" }),
	mimeType: varchar("mime_type", { length: 100 }),
	checksumSha256: varchar("checksum_sha256", { length: 64 }),
	changeNotes: text("change_notes"),
	uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("doc_ver_doc_idx").on(table.documentId),
	index("doc_ver_tenant_idx").on(table.tenantId, table.documentId),
	primaryKey({ columns: [table.id], name: "document_versions_id"}),
]);

export const documents = mysqlTable("documents", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	categoryId: bigint("category_id", { mode: "number", unsigned: true }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	fileName: varchar("file_name", { length: 255 }),
	filePath: text("file_path"),
	fileSize: bigint("file_size", { mode: "number" }),
	mimeType: varchar("mime_type", { length: 100 }),
	version: int().default(1),
	relatedType: varchar("related_type", { length: 50 }),
	relatedId: bigint("related_id", { mode: "number", unsigned: true }),
	uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "documents_id"}),
	unique("id").on(table.id),
]);

export const driverSchedules = mysqlTable("driver_schedules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	driverId: bigint("driver_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	startTime: varchar("start_time", { length: 10 }),
	endTime: varchar("end_time", { length: 10 }),
	status: mysqlEnum(['scheduled','on_duty','off_duty','on_leave']).default('scheduled').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("driver_schedules_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "driver_schedules_id"}),
	unique("id").on(table.id),
]);

export const drivers = mysqlTable("drivers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
	licenseNumber: varchar("license_number", { length: 100 }),
	licenseType: varchar("license_type", { length: 50 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	licenseExpiry: date("license_expiry", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "drivers_id"}),
	unique("id").on(table.id),
]);

export const drugInteractions = mysqlTable("drug_interactions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productIdA: bigint("product_id_a", { mode: "number", unsigned: true }).notNull(),
	productIdB: bigint("product_id_b", { mode: "number", unsigned: true }).notNull(),
	severity: mysqlEnum(['mild','moderate','severe','contraindicated']).default('moderate').notNull(),
	description: text(),
	descriptionAr: text("description_ar"),
	recommendation: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("drug_interactions_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "drug_interactions_id"}),
	unique("drug_interaction_pair_unique").on(table.productIdA, table.productIdB),
	unique("id").on(table.id),
]);

export const dwCubeDimensions = mysqlTable("dw_cube_dimensions", {
	id: serial().notNull(),
	cubeId: bigint("cube_id", { mode: "number", unsigned: true }),
	dimensionId: bigint("dimension_id", { mode: "number", unsigned: true }),
	dimensionType: mysqlEnum("dimension_type", ['regular','role_playing']).default('regular'),
	roleName: varchar("role_name", { length: 100 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "dw_cube_dimensions_id"}),
	unique("id").on(table.id),
]);

export const dwCubeMeasures = mysqlTable("dw_cube_measures", {
	id: serial().notNull(),
	cubeId: bigint("cube_id", { mode: "number", unsigned: true }),
	measureName: varchar("measure_name", { length: 255 }).notNull(),
	measureCode: varchar("measure_code", { length: 50 }),
	aggregationType: mysqlEnum("aggregation_type", ['sum','avg','count','min','max','distinct_count']).notNull(),
	sourceColumn: varchar("source_column", { length: 255 }),
	format: varchar({ length: 50 }),
	isActive: tinyint("is_active").default(1),
},
(table) => [
	primaryKey({ columns: [table.id], name: "dw_cube_measures_id"}),
	unique("id").on(table.id),
]);

export const dwCubes = mysqlTable("dw_cubes", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	cubeName: varchar("cube_name", { length: 255 }).notNull(),
	cubeCode: varchar("cube_code", { length: 50 }),
	description: text(),
	factTableId: bigint("fact_table_id", { mode: "number", unsigned: true }),
	status: mysqlEnum(['active','inactive']).default('active'),
	lastProcessedAt: timestamp("last_processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("dw_cubes_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "dw_cubes_id"}),
	unique("id").on(table.id),
]);

export const dwDimensionTables = mysqlTable("dw_dimension_tables", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	dimensionName: varchar("dimension_name", { length: 255 }).notNull(),
	dimensionCode: varchar("dimension_code", { length: 50 }),
	description: text(),
	sourceTable: varchar("source_table", { length: 255 }),
	type: mysqlEnum(['conformed','role_playing','junk','degenerated']).default('conformed'),
	hierarchyLevels: int("hierarchy_levels").default(1),
	isActive: tinyint("is_active").default(1),
},
(table) => [
	index("dw_dims_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "dw_dimension_tables_id"}),
	unique("id").on(table.id),
]);

export const dwEpsilonCertifiedData = mysqlTable("dw_epsilon_certified_data", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	cubeId: bigint("cube_id", { mode: "number", unsigned: true }),
	certificationDate: timestamp("certification_date", { mode: 'string' }),
	certifiedBy: bigint("certified_by", { mode: "number", unsigned: true }),
	notes: text(),
	version: varchar({ length: 50 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "dw_epsilon_certified_data_id"}),
	unique("id").on(table.id),
]);

export const dwEtlMetadata = mysqlTable("dw_etl_metadata", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	etlJobId: varchar("etl_job_id", { length: 100 }),
	jobName: varchar("job_name", { length: 255 }),
	jobType: mysqlEnum("job_type", ['extract','transform','load','full']).default('full'),
	sourceConnector: bigint("source_connector", { mode: "number", unsigned: true }),
	targetConnector: bigint("target_connector", { mode: "number", unsigned: true }),
	schedule: varchar({ length: 100 }),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }),
	status: mysqlEnum(['active','paused','disabled']).default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("dw_etl_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "dw_etl_metadata_id"}),
	unique("id").on(table.id),
]);

export const dwFactTables = mysqlTable("dw_fact_tables", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	factName: varchar("fact_name", { length: 255 }).notNull(),
	factCode: varchar("fact_code", { length: 50 }),
	description: text(),
	sourceSchema: varchar("source_schema", { length: 255 }),
	sourceTable: varchar("source_table", { length: 255 }),
	refreshFrequency: mysqlEnum("refresh_frequency", ['realtime','hourly','daily','weekly','monthly']).default('daily'),
	status: mysqlEnum(['active','inactive']).default('active'),
	lastRefreshedAt: timestamp("last_refreshed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("dw_facts_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "dw_fact_tables_id"}),
	unique("id").on(table.id),
]);

export const eInvoiceDocuments = mysqlTable("e_invoice_documents", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	countryCode: varchar("country_code", { length: 2 }).notNull(),
	documentType: varchar("document_type", { length: 50 }).notNull(),
	xmlPayload: text("xml_payload"),
	jsonPayload: json("json_payload"),
	qrCode: text("qr_code"),
	hash: varchar({ length: 255 }),
	previousHash: varchar("previous_hash", { length: 255 }),
	digitalSignature: text("digital_signature"),
	certificateId: varchar("certificate_id", { length: 255 }),
	status: mysqlEnum(['draft','submitted','cleared','reported','rejected']).default('draft').notNull(),
	submissionId: bigint("submission_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "e_invoice_documents_id"}),
	unique("id").on(table.id),
]);

export const eSignatureLogs = mysqlTable("e_signature_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	signatureRequestId: bigint("signature_request_id", { mode: "number", unsigned: true }).notNull(),
	eventType: mysqlEnum("event_type", ['created','viewed','signed','declined','expired','verified','audit_export']).notNull(),
	signatureData: json("signature_data"),
	signatureHash: varchar("signature_hash", { length: 255 }),
	certificateInfo: json("certificate_info"),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("esig_log_event_idx").on(table.eventType),
	index("esig_log_req_idx").on(table.signatureRequestId),
	index("esig_log_request_idx").on(table.signatureRequestId),
	index("esig_log_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "e_signature_logs_id"}),
]);

export const eSignatureRequests = mysqlTable("e_signature_requests", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	documentId: bigint("document_id", { mode: "number", unsigned: true }).notNull(),
	requestedBy: bigint("requested_by", { mode: "number", unsigned: true }).notNull(),
	signerId: bigint("signer_id", { mode: "number", unsigned: true }),
	signerEmail: varchar("signer_email", { length: 320 }),
	signerName: varchar("signer_name", { length: 255 }),
	signatureType: mysqlEnum("signature_type", ['draw','type','upload','biometric']).default('draw').notNull(),
	status: mysqlEnum(['pending','viewed','signed','declined','expired']).default('pending').notNull(),
	message: text(),
	signatureData: text("signature_data"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	signedAt: timestamp("signed_at", { mode: 'string' }),
	declinedAt: timestamp("declined_at", { mode: 'string' }),
	declineReason: text("decline_reason"),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("esig_req_doc_idx").on(table.tenantId, table.documentId),
	index("esig_req_signer_idx").on(table.signerId),
	index("esig_req_status_idx").on(table.status),
	index("esig_req_tenant_idx").on(table.tenantId, table.documentId),
	primaryKey({ columns: [table.id], name: "e_signature_requests_id"}),
]);

export const ecommerceOrders = mysqlTable("ecommerce_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	channel: mysqlEnum(['Shopify','Salla','Zid','WhatsApp']).default('Salla').notNull(),
	customerName: varchar("customer_name", { length: 255 }).notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paymentMethod: mysqlEnum("payment_method", ['COD','Mada','Card']).default('Mada').notNull(),
	fulfillmentStatus: mysqlEnum("fulfillment_status", ['pending','packed','shipped','delivered']).default('pending').notNull(),
	courier: varchar({ length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ecommerce_orders_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ecommerce_orders_id"}),
	unique("id").on(table.id),
]);

export const ediAcknowledgements = mysqlTable("edi_acknowledgements", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	outboundId: bigint("outbound_id", { mode: "number", unsigned: true }),
	partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
	ackType: mysqlEnum("ack_type", ['technical','functional','application']).notNull(),
	ackCode: varchar("ack_code", { length: 50 }),
	ackDescription: text("ack_description"),
	ackDate: timestamp("ack_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("edi_acks_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_acknowledgements_id"}),
	unique("id").on(table.id),
]);

export const ediDocumentTypes = mysqlTable("edi_document_types", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	documentCode: varchar("document_code", { length: 50 }).notNull(),
	documentName: varchar("document_name", { length: 255 }).notNull(),
	direction: mysqlEnum(['inbound','outbound','both']).notNull(),
	ediStandard: varchar("edi_standard", { length: 50 }),
	status: mysqlEnum(['active','inactive']).default('active'),
},
(table) => [
	index("edi_doc_types_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_document_types_id"}),
	unique("id").on(table.id),
]);

export const ediInboundQueue = mysqlTable("edi_inbound_queue", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
	documentTypeId: bigint("document_type_id", { mode: "number", unsigned: true }),
	rawEdi: text("raw_edi"),
	parsedData: json("parsed_data"),
	status: mysqlEnum(['received','parsed','mapped','processed','failed']).default('received'),
	documentReference: varchar("document_reference", { length: 255 }),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("edi_inbound_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_inbound_queue_id"}),
	unique("id").on(table.id),
]);

export const ediLogs = mysqlTable("edi_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
	direction: mysqlEnum(['inbound','outbound']),
	documentType: varchar("document_type", { length: 100 }),
	transactionRef: varchar("transaction_ref", { length: 255 }),
	status: varchar({ length: 50 }),
	message: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("edi_logs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_logs_id"}),
	unique("id").on(table.id),
]);

export const ediMappings = mysqlTable("edi_mappings", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	mappingName: varchar("mapping_name", { length: 255 }).notNull(),
	direction: mysqlEnum(['inbound','outbound']).notNull(),
	sourceFormat: varchar("source_format", { length: 50 }).default('JSON'),
	targetFormat: varchar("target_format", { length: 50 }).default('EDI'),
	delimiter: varchar({ length: 10 }).default(''),
	segmentTerminator: varchar("segment_terminator", { length: 10 }).default(''),
	elementSeparator: varchar("element_separator", { length: 10 }).default('+'),
	componentSeparator: varchar("component_separator", { length: 10 }).default(':'),
	decimalNotation: varchar("decimal_notation", { length: 10 }).default('.'),
	releaseCharacter: varchar("release_character", { length: 10 }).default('?'),
	isDefault: tinyint("is_default").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("edi_mappings_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_mappings_id"}),
	unique("id").on(table.id),
]);

export const ediOutboundQueue = mysqlTable("edi_outbound_queue", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
	documentTypeId: bigint("document_type_id", { mode: "number", unsigned: true }),
	sourceEntityType: varchar("source_entity_type", { length: 100 }),
	sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
	ediPayload: text("edi_payload"),
	status: mysqlEnum(['pending','generated','transmitted','acknowledged','failed']).default('pending'),
	acknowledgement: text(),
	transmissionDate: timestamp("transmission_date", { mode: 'string' }),
	errorMessage: text("error_message"),
	retryCount: int("retry_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("edi_outbound_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_outbound_queue_id"}),
	unique("id").on(table.id),
]);

export const ediPartners = mysqlTable("edi_partners", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	partnerCode: varchar("partner_code", { length: 50 }).notNull(),
	partnerName: varchar("partner_name", { length: 255 }).notNull(),
	partnerType: mysqlEnum("partner_type", ['customer','supplier','logistics','bank','govt']).notNull(),
	ediStandard: mysqlEnum("edi_standard", ['edifact','x12','tradacoms','custom']).notNull(),
	version: varchar({ length: 50 }),
	senderId: varchar("sender_id", { length: 100 }),
	receiverId: varchar("receiver_id", { length: 100 }),
	qualifier: varchar({ length: 50 }),
	isActive: tinyint("is_active").default(1),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("edi_partners_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_partners_id"}),
	unique("id").on(table.id),
]);

export const ediTransactionSets = mysqlTable("edi_transaction_sets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	transactionSetId: varchar("transaction_set_id", { length: 50 }).notNull(),
	standard: varchar({ length: 50 }),
	version: varchar({ length: 50 }),
	description: text(),
	functionalGroup: varchar("functional_group", { length: 50 }),
	tableDefinition: json("table_definition"),
	isActive: tinyint("is_active").default(1),
},
(table) => [
	index("edi_txn_sets_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "edi_transaction_sets_id"}),
	unique("id").on(table.id),
]);

export const emailLogs = mysqlTable("email_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	templateKey: varchar("template_key", { length: 100 }),
	recipient: varchar({ length: 320 }).notNull(),
	subject: varchar({ length: 500 }).notNull(),
	body: text(),
	status: mysqlEnum(['sent','failed','queued']).default('sent').notNull(),
	errorMessage: text("error_message"),
	sentAt: timestamp("sent_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "email_logs_id"}),
	unique("id").on(table.id),
]);

export const emailTemplates = mysqlTable("email_templates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	templateKey: varchar("template_key", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 500 }).notNull(),
	subjectAr: varchar("subject_ar", { length: 500 }),
	body: text().notNull(),
	bodyAr: text("body_ar"),
	variables: json(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "email_templates_id"}),
	unique("id").on(table.id),
]);

export const employeeLeaveRequests = mysqlTable("employee_leave_requests", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	leaveType: varchar("leave_type", { length: 50 }),
	leaveDays: int("leave_days"),
	reason: text(),
	status: varchar({ length: 50 }).default('Submitted'),
	approvedBy: int("approved_by"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	approvedDate: date("approved_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "employee_leave_requests_id"}),
]);

export const employeeLoans = mysqlTable("employee_loans", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	loanAmount: decimal("loan_amount", { precision: 18, scale: 4 }).notNull(),
	installments: int().default(0),
	installmentAmount: decimal("installment_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	purpose: text(),
	status: mysqlEnum(['pending','approved','rejected','active','completed']).default('pending').notNull(),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "employee_loans_id"}),
	unique("id").on(table.id),
]);

export const employeeTimesheets = mysqlTable("employee_timesheets", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).references(() => constructionProjects.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	weekStartDate: date("week_start_date", { mode: 'string' }),
	dailyHours: json("daily_hours"),
	totalHours: decimal("total_hours", { precision: 10, scale: 2 }),
	status: varchar({ length: 50 }).default('Submitted'),
	approvedBy: int("approved_by"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	approvedDate: date("approved_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("project_id").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "employee_timesheets_id"}),
]);

export const employees = mysqlTable("employees", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeCode: varchar("employee_code", { length: 50 }).notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	mobile: varchar({ length: 50 }),
	gender: mysqlEnum(['male','female']),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dateOfBirth: date("date_of_birth", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	hireDate: date("hire_date", { mode: 'string' }).notNull(),
	departmentId: bigint("department_id", { mode: "number", unsigned: true }),
	designationId: bigint("designation_id", { mode: "number", unsigned: true }),
	managerId: bigint("manager_id", { mode: "number", unsigned: true }),
	employmentType: mysqlEnum("employment_type", ['full_time','part_time','contract','intern']).default('full_time').notNull(),
	status: mysqlEnum(['active','on_leave','terminated','resigned','suspended']).default('active').notNull(),
	basicSalary: decimal("basic_salary", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	housingAllowance: decimal("housing_allowance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	transportAllowance: decimal("transport_allowance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	otherAllowance: decimal("other_allowance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	bankName: varchar("bank_name", { length: 255 }),
	bankAccount: varchar("bank_account", { length: 100 }),
	bankIban: varchar("bank_iban", { length: 100 }),
	address: text(),
	emergencyContact: varchar("emergency_contact", { length: 255 }),
	emergencyPhone: varchar("emergency_phone", { length: 50 }),
	photo: text(),
	passportNumber: varchar("passport_number", { length: 100 }),
	nationalId: varchar("national_id", { length: 100 }),
	nationality: varchar({ length: 100 }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "employees_id"}),
	unique("id").on(table.id),
]);

export const emvTransactions = mysqlTable("emv_transactions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	transactionId: varchar("transaction_id", { length: 255 }),
	terminalId: varchar("terminal_id", { length: 100 }),
	cardType: varchar("card_type", { length: 50 }),
	cardLastFour: varchar("card_last_four", { length: 10 }),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	authCode: varchar("auth_code", { length: 50 }),
	referenceNumber: varchar("reference_number", { length: 100 }),
	status: mysqlEnum(['pending','approved','declined','failed','refunded','voided']).default('pending').notNull(),
	responseCode: varchar("response_code", { length: 20 }),
	responseMessage: text("response_message"),
	requestPayload: json("request_payload"),
	responsePayload: json("response_payload"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("emv_transactions_invoice_idx").on(table.invoiceId),
	primaryKey({ columns: [table.id], name: "emv_transactions_id"}),
	unique("id").on(table.id),
]);

export const engineeringSaudization = mysqlTable("engineering_saudization", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	saudiEngineerCount: int("saudi_engineer_count"),
	totalEngineerCount: int("total_engineer_count"),
	saudiRatio: decimal("saudi_ratio", { precision: 5, scale: 2 }),
	requiredRatio: decimal("required_ratio", { precision: 5, scale: 2 }).default('0.25'),
	saudiSupervisorName: varchar("saudi_supervisor_name", { length: 255 }),
	saudiSupervisorId: bigint("saudi_supervisor_id", { mode: "number", unsigned: true }),
	licenseNumber: varchar("license_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	licenseExpiryDate: date("license_expiry_date", { mode: 'string' }),
	shrhStatus: mysqlEnum("shrh_status", ['compliant','non_compliant','pending']).default('pending').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lastAuditDate: date("last_audit_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	nextAuditDate: date("next_audit_date", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("engineering_saudization_project_idx").on(table.tenantId, table.projectId),
	index("engineering_saudization_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "engineering_saudization_id"}),
	unique("id").on(table.id),
]);

export const eosbAccruals = mysqlTable("eosb_accruals", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	serviceYears: decimal("service_years", { precision: 10, scale: 4 }).default('0.0000').notNull(),
	accrualRate: decimal("accrual_rate", { precision: 5, scale: 4 }).default('0.5000').notNull(),
	accrualAmount: decimal("accrual_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	runningTotal: decimal("running_total", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	lastBasicSalary: decimal("last_basic_salary", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	isHijri: tinyint("is_hijri").default(1).notNull(),
	journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("eosb_period_idx").on(table.periodStart, table.periodEnd),
	index("eosb_tenant_idx").on(table.tenantId, table.employeeId),
	primaryKey({ columns: [table.id], name: "eosb_accruals_id"}),
]);

export const equipmentMaintenance = mysqlTable("equipment_maintenance", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id).references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }),
	maintenanceType: varchar("maintenance_type", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	scheduledDate: date("scheduled_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	actualDate: date("actual_date", { mode: 'string' }),
	estimatedDowntime: int("estimated_downtime"),
	maintenanceCost: decimal("maintenance_cost", { precision: 10, scale: 2 }),
	performedBy: int("performed_by"),
	status: varchar({ length: 50 }).default('Scheduled'),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "equipment_maintenance_id"}),
]);

export const equipmentSchedule = mysqlTable("equipment_schedule", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	operatorName: varchar("operator_name", { length: 255 }),
	purpose: text(),
	status: mysqlEnum(['scheduled','in_use','completed','cancelled']).default('scheduled').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("equipment_schedule_equipment_idx").on(table.tenantId, table.equipmentId),
	index("equipment_schedule_project_idx").on(table.tenantId, table.projectId),
	index("equipment_schedule_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "equipment_schedule_id"}),
	unique("id").on(table.id),
]);

export const equipmentTracking = mysqlTable("equipment_tracking", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	equipmentCode: varchar("equipment_code", { length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	assetId: bigint("asset_id", { mode: "number", unsigned: true }),
	projectId: bigint("project_id", { mode: "number", unsigned: true }),
	type: varchar({ length: 100 }),
	hourlyRate: decimal("hourly_rate", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	dailyRate: decimal("daily_rate", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['available','in_use','maintenance','retired']).default('available').notNull(),
	hoursUsed: decimal("hours_used", { precision: 10, scale: 2 }).default('0.00').notNull(),
	location: varchar({ length: 255 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("equipment_tracking_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "equipment_tracking_id"}),
	unique("id").on(table.id),
]);

export const equipmentUsage = mysqlTable("equipment_usage", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id).references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }),
	usageHours: decimal("usage_hours", { precision: 10, scale: 2 }),
	operatedBy: int("operated_by"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	usageDate: date("usage_date", { mode: 'string' }),
	fuelQuantity: decimal("fuel_quantity", { precision: 10, scale: 2 }),
	fuelCost: decimal("fuel_cost", { precision: 10, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "equipment_usage_id"}),
]);

export const etlConnectors = mysqlTable("etl_connectors", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	connectorName: varchar("connector_name", { length: 255 }).notNull(),
	connectorType: mysqlEnum("connector_type", ['mysql','postgres','s3','ftp','http','csv','excel','api','custom']).notNull(),
	connectionConfig: json("connection_config"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("etl_connectors_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "etl_connectors_id"}),
	unique("id").on(table.id),
]);

export const etlDataQualityLogs = mysqlTable("etl_data_quality_logs", {
	id: serial().notNull(),
	executionId: bigint("execution_id", { mode: "number", unsigned: true }),
	ruleId: bigint("rule_id", { mode: "number", unsigned: true }),
	rowRef: varchar("row_ref", { length: 255 }),
	fieldName: varchar("field_name", { length: 255 }),
	expectedValue: text("expected_value"),
	actualValue: text("actual_value"),
	severity: varchar({ length: 20 }),
	status: mysqlEnum(['passed','failed']).default('failed'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "etl_data_quality_logs_id"}),
	unique("id").on(table.id),
]);

export const etlDataQualityRules = mysqlTable("etl_data_quality_rules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	ruleName: varchar("rule_name", { length: 255 }).notNull(),
	ruleType: mysqlEnum("rule_type", ['not_null','unique','range','format','referenced_integrity','custom']).notNull(),
	fieldName: varchar("field_name", { length: 255 }),
	validationConfig: json("validation_config"),
	severity: mysqlEnum(['warn','error','block']).default('error'),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("etl_dq_rules_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "etl_data_quality_rules_id"}),
	unique("id").on(table.id),
]);

export const etlExecutionLogs = mysqlTable("etl_execution_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	jobId: bigint("job_id", { mode: "number", unsigned: true }),
	executionId: varchar("execution_id", { length: 100 }),
	startTime: timestamp("start_time", { mode: 'string' }),
	endTime: timestamp("end_time", { mode: 'string' }),
	status: mysqlEnum(['running','completed','failed','aborted']).default('running'),
	rowsRead: int("rows_read").default(0),
	rowsProcessed: int("rows_processed").default(0),
	rowsError: int("rows_error").default(0),
	rowsWritten: int("rows_written").default(0),
	durationMs: int("duration_ms"),
	errorMessage: text("error_message"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("etl_exec_logs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "etl_execution_logs_id"}),
	unique("id").on(table.id),
]);

export const etlJobSteps = mysqlTable("etl_job_steps", {
	id: serial().notNull(),
	jobId: bigint("job_id", { mode: "number", unsigned: true }),
	stepOrder: int("step_order").default(0),
	stepType: mysqlEnum("step_type", ['extract','transform','load','validate','dedupe','aggregate','join','filter','map']).notNull(),
	config: json(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "etl_job_steps_id"}),
	unique("id").on(table.id),
]);

export const etlJobs = mysqlTable("etl_jobs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	jobName: varchar("job_name", { length: 255 }).notNull(),
	jobCode: varchar("job_code", { length: 50 }),
	description: text(),
	sourceConnectorId: bigint("source_connector_id", { mode: "number", unsigned: true }),
	targetConnectorId: bigint("target_connector_id", { mode: "number", unsigned: true }),
	scheduleType: mysqlEnum("schedule_type", ['manual','cron','event']).default('manual'),
	scheduleExpression: varchar("schedule_expression", { length: 100 }),
	batchSize: int("batch_size").default(1000),
	errorHandling: mysqlEnum("error_handling", ['skip','abort','retry']).default('abort'),
	retryCount: int("retry_count").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("etl_jobs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "etl_jobs_id"}),
	unique("id").on(table.id),
]);

export const etlTransformations = mysqlTable("etl_transformations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	transformationName: varchar("transformation_name", { length: 255 }).notNull(),
	transformationType: mysqlEnum("transformation_type", ['column_map','datatype_convert','lookup','calculate','conditional','aggregate','sort','dedupe']).notNull(),
	sourceField: varchar("source_field", { length: 255 }),
	targetField: varchar("target_field", { length: 255 }),
	config: json(),
	isActive: tinyint("is_active").default(1),
},
(table) => [
	index("etl_transforms_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "etl_transformations_id"}),
	unique("id").on(table.id),
]);

export const featureFlags = mysqlTable("feature_flags", {
	id: int().autoincrement().notNull(),
	flagName: varchar("flag_name", { length: 100 }).notNull(),
	description: text(),
	isGlobalDefault: tinyint("is_global_default").default(0),
	enabledTenants: json("enabled_tenants"),
	enabledPlans: json("enabled_plans"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_active").on(table.isActive),
	index("idx_name").on(table.flagName),
	primaryKey({ columns: [table.id], name: "feature_flags_id"}),
	unique("flag_name").on(table.flagName),
]);

export const feeStructures = mysqlTable("fee_structures", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	grade: varchar({ length: 50 }),
	academicYear: varchar("academic_year", { length: 20 }),
	tuitionFee: decimal("tuition_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	admissionFee: decimal("admission_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	libraryFee: decimal("library_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	sportsFee: decimal("sports_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	transportFee: decimal("transport_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	otherFee: decimal("other_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalFee: decimal("total_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("fee_structures_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "fee_structures_id"}),
	unique("id").on(table.id),
]);

export const fiscalYears = mysqlTable("fiscal_years", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }).notNull(),
	isClosed: tinyint("is_closed").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "fiscal_years_id"}),
	unique("id").on(table.id),
]);

export const flights = mysqlTable("flights", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	flightNumber: varchar("flight_number", { length: 50 }).notNull(),
	aircraftRegistration: varchar("aircraft_registration", { length: 50 }),
	aircraftType: varchar("aircraft_type", { length: 100 }),
	origin: varchar({ length: 255 }).notNull(),
	destination: varchar({ length: 255 }).notNull(),
	departureTime: timestamp("departure_time", { mode: 'string' }).notNull(),
	arrivalTime: timestamp("arrival_time", { mode: 'string' }).notNull(),
	flightDuration: int("flight_duration"),
	totalSeats: int("total_seats").default(0).notNull(),
	bookedSeats: int("booked_seats").default(0).notNull(),
	status: mysqlEnum(['scheduled','boarding','departed','in_air','landed','cancelled','delayed','diverted']).default('scheduled').notNull(),
	delayReason: text("delay_reason"),
	pilotId: bigint("pilot_id", { mode: "number", unsigned: true }),
	copilotId: bigint("copilot_id", { mode: "number", unsigned: true }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("flights_departure_idx").on(table.tenantId, table.departureTime),
	index("flights_route_idx").on(table.origin, table.destination),
	index("flights_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "flights_id"}),
	unique("id").on(table.id),
]);

export const floorPlans = mysqlTable("floor_plans", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	width: int().default(800).notNull(),
	height: int().default(600).notNull(),
	backgroundImage: text("background_image"),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("floor_plans_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "floor_plans_id"}),
	unique("id").on(table.id),
]);

export const folioCharges = mysqlTable("folio_charges", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	bookingId: bigint("booking_id", { mode: "number", unsigned: true }).notNull(),
	chargeType: mysqlEnum("charge_type", ['room','restaurant','minibar','laundry','spa','transport','other']).default('other').notNull(),
	description: varchar({ length: 255 }).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	quantity: int().default(1).notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	chargeDate: date("charge_date", { mode: 'string' }).notNull(),
	postedToInvoice: tinyint("posted_to_invoice").default(0).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("folio_charges_booking_idx").on(table.bookingId),
	index("folio_charges_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "folio_charges_id"}),
	unique("id").on(table.id),
]);

export const fuelCostAnalytics = mysqlTable("fuel_cost_analytics", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	totalLiters: decimal("total_liters", { precision: 12, scale: 2 }).default('0.00').notNull(),
	totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	distanceCovered: int("distance_covered").default(0).notNull(),
	kmPerLiter: decimal("km_per_liter", { precision: 8, scale: 2 }),
	costPerKm: decimal("cost_per_km", { precision: 10, scale: 4 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("fuel_cost_analytics_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "fuel_cost_analytics_id"}),
	unique("id").on(table.id),
]);

export const fuelRecords = mysqlTable("fuel_records", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	odometer: int().notNull(),
	liters: decimal({ precision: 10, scale: 2 }).notNull(),
	costPerLiter: decimal("cost_per_liter", { precision: 10, scale: 4 }),
	totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	station: varchar({ length: 255 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "fuel_records_id"}),
	unique("id").on(table.id),
]);

export const giftCardTransactions = mysqlTable("gift_card_transactions", {
	id: serial().notNull(),
	giftCardId: bigint("gift_card_id", { mode: "number", unsigned: true }).notNull(),
	transactionType: mysqlEnum("transaction_type", ['issue','redeem','top_up','refund','expire']).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).notNull(),
	balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).notNull(),
	referenceType: varchar("reference_type", { length: 100 }),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
	description: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "gift_card_transactions_id"}),
	unique("id").on(table.id),
]);

export const giftCards = mysqlTable("gift_cards", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	cardNumber: varchar("card_number", { length: 100 }).notNull(),
	pin: varchar({ length: 10 }),
	initialBalance: decimal("initial_balance", { precision: 18, scale: 4 }).notNull(),
	currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	issuerCustomerId: bigint("issuer_customer_id", { mode: "number", unsigned: true }),
	recipientEmail: varchar("recipient_email", { length: 320 }),
	recipientName: varchar("recipient_name", { length: 255 }),
	message: text(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	status: mysqlEnum(['active','redeemed','expired','cancelled']).default('active').notNull(),
	issuedBy: bigint("issued_by", { mode: "number", unsigned: true }),
	issuedAt: timestamp("issued_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	redeemedAt: timestamp("redeemed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("gift_cards_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "gift_cards_id"}),
	unique("gift_cards_number_unique").on(table.cardNumber),
	unique("id").on(table.id),
]);

export const goodsReceivedNotes = mysqlTable("goods_received_notes", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	grnNumber: varchar("grn_number", { length: 50 }).notNull(),
	poId: bigint("po_id", { mode: "number", unsigned: true }),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	status: mysqlEnum(['draft','posted','cancelled']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "goods_received_notes_id"}),
	unique("id").on(table.id),
]);

export const gosiRateTables = mysqlTable("gosi_rate_tables", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveFrom: date("effective_from", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveTo: date("effective_to", { mode: 'string' }),
	systemType: mysqlEnum("system_type", ['new','old']).default('new').notNull(),
	employeeAnnuitiesRate: decimal("employee_annuities_rate", { precision: 5, scale: 4 }).default('0.0950').notNull(),
	employerAnnuitiesRate: decimal("employer_annuities_rate", { precision: 5, scale: 4 }).default('0.0950').notNull(),
	employerHazardsRate: decimal("employer_hazards_rate", { precision: 5, scale: 4 }).default('0.0200').notNull(),
	employeeUnemploymentRate: decimal("employee_unemployment_rate", { precision: 5, scale: 4 }).default('0.0075').notNull(),
	employerUnemploymentRate: decimal("employer_unemployment_rate", { precision: 5, scale: 4 }).default('0.0075').notNull(),
	contributionCap: decimal("contribution_cap", { precision: 18, scale: 4 }).default('45000.0000').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("gosi_rates_effective_idx").on(table.effectiveFrom, table.effectiveTo),
	index("gosi_rates_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "gosi_rate_tables_id"}),
]);

export const gosiRegistrations = mysqlTable("gosi_registrations", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	gosiNumber: varchar("gosi_number", { length: 50 }),
	isSubscriber: tinyint("is_subscriber").default(1).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	registrationDate: date("registration_date", { mode: 'string' }),
	systemType: mysqlEnum("system_type", ['new','old']).default('new'),
	contributionCap: decimal("contribution_cap", { precision: 18, scale: 4 }).default('45000.0000'),
	lastCalculatedAt: timestamp("last_calculated_at", { mode: 'string' }),
	lastContribution: decimal("last_contribution", { precision: 18, scale: 4 }),
	needsUpdate: tinyint("needs_update").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("gosi_reg_employee_idx").on(table.employeeId),
	primaryKey({ columns: [table.id], name: "gosi_registrations_id"}),
	unique("gosi_reg_emp_idx").on(table.tenantId, table.employeeId),
]);

export const gosiSubmissionLogs = mysqlTable("gosi_submission_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	periodMonth: int("period_month").notNull(),
	periodYear: int("period_year").notNull(),
	totalEmployeeShare: decimal("total_employee_share", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalEmployerShare: decimal("total_employer_share", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalContributions: decimal("total_contributions", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	employeeCount: int("employee_count").default(0).notNull(),
	submissionDate: timestamp("submission_date", { mode: 'string' }),
	status: mysqlEnum(['draft','submitted','acknowledged','failed']).default('draft'),
	referenceNumber: varchar("reference_number", { length: 100 }),
	submissionFile: text("submission_file"),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("gosi_sub_tenant_idx").on(table.tenantId, table.periodYear, table.periodMonth),
	primaryKey({ columns: [table.id], name: "gosi_submission_logs_id"}),
]);

export const grnItems = mysqlTable("grn_items", {
	id: serial().notNull(),
	grnId: bigint("grn_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	poItemId: bigint("po_item_id", { mode: "number", unsigned: true }),
	quantity: int().notNull(),
	unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	batchNumber: varchar("batch_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "grn_items_id"}),
	unique("id").on(table.id),
]);

export const gtplCompliance = mysqlTable("gtpl_compliance", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	tenderReference: varchar("tender_reference", { length: 100 }),
	etimadReference: varchar("etimad_reference", { length: 100 }),
	governmentEntity: varchar("government_entity", { length: 255 }),
	listedOnEtimad: tinyint("listed_on_etimad").default(0),
	saudizationRequired: tinyint("saudization_required").default(1),
	saudizationPercent: decimal("saudization_percent", { precision: 5, scale: 2 }),
	localContentPercent: decimal("local_content_percent", { precision: 5, scale: 2 }),
	icvScore: decimal("icv_score", { precision: 5, scale: 2 }),
	complianceStatus: mysqlEnum("compliance_status", ['compliant','non_compliant','in_progress','not_required']).default('in_progress').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lastReviewedDate: date("last_reviewed_date", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("gtpl_compliance_project_idx").on(table.tenantId, table.projectId),
	index("gtpl_compliance_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "gtpl_compliance_id"}),
	unique("id").on(table.id),
]);

export const gymMembers = mysqlTable("gym_members", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	membershipPlan: varchar("membership_plan", { length: 255 }).notNull(),
	status: mysqlEnum(['active','frozen','expired']).default('active').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }).notNull(),
	lastCheckIn: varchar("last_check_in", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("gym_members_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "gym_members_id"}),
	unique("id").on(table.id),
]);

export const healthcareBilling = mysqlTable("healthcare_billing", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
	medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
	billNumber: varchar("bill_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	billDate: date("bill_date", { mode: 'string' }).notNull(),
	consultationFee: decimal("consultation_fee", { precision: 18, scale: 4 }).default('0.0000'),
	procedureFee: decimal("procedure_fee", { precision: 18, scale: 4 }).default('0.0000'),
	medicationFee: decimal("medication_fee", { precision: 18, scale: 4 }).default('0.0000'),
	labFee: decimal("lab_fee", { precision: 18, scale: 4 }).default('0.0000'),
	imagingFee: decimal("imaging_fee", { precision: 18, scale: 4 }).default('0.0000'),
	otherCharges: decimal("other_charges", { precision: 18, scale: 4 }).default('0.0000'),
	subtotal: decimal({ precision: 18, scale: 4 }).notNull(),
	discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default('0.0000'),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000'),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
	insuranceCoverage: decimal("insurance_coverage", { precision: 18, scale: 4 }).default('0.0000'),
	patientResponsibility: decimal("patient_responsibility", { precision: 18, scale: 4 }),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000'),
	balanceDue: decimal("balance_due", { precision: 18, scale: 4 }),
	paymentStatus: mysqlEnum("payment_status", ['unpaid','partial','paid','refunded','cancelled']).default('unpaid'),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("healthcare_billing_patient_idx").on(table.patientId),
	index("healthcare_billing_status_idx").on(table.paymentStatus),
	index("healthcare_billing_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "healthcare_billing_id"}),
	unique("bill_number").on(table.billNumber),
	unique("id").on(table.id),
]);

export const heatStressRecords = mysqlTable("heat_stress_records", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	temperature: decimal({ precision: 5, scale: 2 }),
	humidity: decimal({ precision: 5, scale: 2 }),
	heatIndex: decimal("heat_index", { precision: 5, scale: 2 }),
	workRestRegime: varchar("work_rest_regime", { length: 100 }),
	breaksProvided: tinyint("breaks_provided"),
	waterAvailable: tinyint("water_available"),
	shadeAvailable: tinyint("shade_available"),
	incidentsReported: int("incidents_reported").default(0),
	supervisorName: varchar("supervisor_name", { length: 255 }),
	status: mysqlEnum(['compliant','non_compliant','partial']).default('compliant').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("heat_stress_records_date_idx").on(table.tenantId, table.date),
	index("heat_stress_records_project_idx").on(table.tenantId, table.projectId),
	index("heat_stress_records_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "heat_stress_records_id"}),
	unique("id").on(table.id),
]);

export const hotelBookings = mysqlTable("hotel_bookings", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	bookingNumber: varchar("booking_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	roomTypeId: bigint("room_type_id", { mode: "number", unsigned: true }).notNull(),
	roomId: bigint("room_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	checkIn: date("check_in", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	checkOut: date("check_out", { mode: 'string' }).notNull(),
	adults: int().default(1).notNull(),
	children: int().default(0).notNull(),
	nightlyRate: decimal("nightly_rate", { precision: 18, scale: 4 }).notNull(),
	totalNights: int("total_nights").notNull(),
	subtotal: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	source: mysqlEnum(['direct','booking.com','expedia','agoda','travel_agency','other']).default('direct').notNull(),
	channelBookingId: varchar("channel_booking_id", { length: 255 }),
	status: mysqlEnum(['pending','confirmed','checked_in','checked_out','cancelled','no_show']).default('pending').notNull(),
	specialRequests: text("special_requests"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("hotel_bookings_dates_idx").on(table.tenantId, table.checkIn, table.checkOut),
	index("hotel_bookings_source_idx").on(table.source),
	index("hotel_bookings_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "hotel_bookings_id"}),
	unique("id").on(table.id),
]);

export const housekeepingSchedule = mysqlTable("housekeeping_schedule", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	roomId: bigint("room_id", { mode: "number", unsigned: true }).notNull(),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	taskType: mysqlEnum("task_type", ['daily_clean','tidy_up','deep_clean','turnover','inspection','repair']).default('daily_clean').notNull(),
	status: mysqlEnum(['pending','in_progress','completed','skipped','issue_reported']).default('pending').notNull(),
	notes: text(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("housekeeping_date_idx").on(table.tenantId, table.date),
	index("housekeeping_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "housekeeping_schedule_id"}),
	unique("id").on(table.id),
]);

export const hseCommittees = mysqlTable("hse_committees", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	committeeName: varchar("committee_name", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	formationDate: date("formation_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	members: json(),
	chairperson: varchar({ length: 255 }),
	meetingFrequency: varchar("meeting_frequency", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lastMeetingDate: date("last_meeting_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	nextMeetingDate: date("next_meeting_date", { mode: 'string' }),
	status: mysqlEnum(['active','dissolved']).default('active').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("hse_committees_project_idx").on(table.tenantId, table.projectId),
	index("hse_committees_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "hse_committees_id"}),
	unique("id").on(table.id),
]);

export const hseKpiMetrics = mysqlTable("hse_kpi_metrics", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportingPeriod: date("reporting_period", { mode: 'string' }).notNull(),
	totalIncidents: int("total_incidents").default(0),
	lostTimeIncidents: int("lost_time_incidents").default(0),
	restrictedWorkIncidents: int("restricted_work_incidents").default(0),
	nearMisses: int("near_misses").default(0),
	totalHoursWorked: varchar("total_hours_worked", { length: 255 }).default('0'),
	trifr: varchar({ length: 255 }),
	ltifr: varchar({ length: 255 }),
	sfr: varchar({ length: 255 }),
	trainingCompletionPercent: varchar("training_completion_percent", { length: 255 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	calculatedAt: timestamp("calculated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_hse_kpi_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "hse_kpi_metrics_id"}),
]);

export const hseSafetyIncidents = mysqlTable("hse_safety_incidents", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	reportedBy: bigint("reported_by", { mode: "number", unsigned: true }).notNull().references(() => users.id),
	incidentType: varchar("incident_type", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	incidentDate: date("incident_date", { mode: 'string' }).notNull(),
	incidentDescription: varchar("incident_description", { length: 255 }).notNull(),
	location: varchar({ length: 255 }).notNull(),
	severity: varchar({ length: 255 }).notNull(),
	investigationStatus: varchar("investigation_status", { length: 255 }).default('open'),
	rootCauseAnalysis: varchar("root_cause_analysis", { length: 255 }),
	correctiveActions: varchar("corrective_actions", { length: 255 }),
	preventiveMeasures: varchar("preventive_measures", { length: 255 }),
	investigatedBy: int("investigated_by"),
	assignedTo: int("assigned_to"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	investigationStartedAt: timestamp("investigation_started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
},
(table) => [
	index("idx_hse_incidents_project").on(table.projectId),
	index("idx_hse_incidents_status").on(table.investigationStatus),
	index("reported_by").on(table.reportedBy),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "hse_safety_incidents_id"}),
]);

export const impersonationLogs = mysqlTable("impersonation_logs", {
	id: int().autoincrement().notNull(),
	adminUserId: int("admin_user_id").notNull(),
	adminEmail: varchar("admin_email", { length: 320 }),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	targetUserId: int("target_user_id"),
	reason: text().notNull(),
	approvalTicket: varchar("approval_ticket", { length: 100 }),
	sessionToken: varchar("session_token", { length: 255 }),
	startedAt: timestamp("started_at", { mode: 'string' }).notNull(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	durationSeconds: int("duration_seconds"),
	actionsLog: json("actions_log"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_admin").on(table.adminUserId),
	index("idx_started").on(table.startedAt),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "impersonation_logs_id"}),
]);

export const installmentPayments = mysqlTable("installment_payments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	installmentId: bigint("installment_id", { mode: "number", unsigned: true }).notNull(),
	paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paidDate: date("paid_date", { mode: 'string' }),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	lateFee: decimal("late_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paymentMethod: mysqlEnum("payment_method", ['cash','card','transfer','cheque','wallet','other']).default('cash'),
	status: mysqlEnum(['pending','paid','overdue','cancelled']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "installment_payments_id"}),
	unique("id").on(table.id),
]);

export const installments = mysqlTable("installments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	installmentNumber: varchar("installment_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
	downPayment: decimal("down_payment", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	financedAmount: decimal("financed_amount", { precision: 18, scale: 4 }).notNull(),
	numberOfInstallments: int("number_of_installments").notNull(),
	installmentAmount: decimal("installment_amount", { precision: 18, scale: 4 }).notNull(),
	installmentType: mysqlEnum("installment_type", ['weekly','biweekly','monthly','quarterly','custom']).default('monthly').notNull(),
	intervalDays: int("interval_days").default(30),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	totalPaid: decimal("total_paid", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }).notNull(),
	status: mysqlEnum(['active','completed','defaulted','cancelled']).default('active').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "installments_id"}),
	unique("id").on(table.id),
]);

export const insuranceClaims = mysqlTable("insurance_claims", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	claimNumber: varchar("claim_number", { length: 50 }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	insuranceCompanyId: bigint("insurance_company_id", { mode: "number", unsigned: true }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	policyNumber: varchar("policy_number", { length: 100 }),
	memberId: varchar("member_id", { length: 100 }),
	coPayAmount: decimal("co_pay_amount", { precision: 18, scale: 4 }).default('0.0000'),
	insuredAmount: decimal("insured_amount", { precision: 18, scale: 4 }).default('0.0000'),
	claimAmount: decimal("claim_amount", { precision: 18, scale: 4 }).default('0.0000'),
	status: mysqlEnum(['pending','approved','rejected','paid','partial']).default('pending').notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("insurance_claims_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "insurance_claims_id"}),
	unique("id").on(table.id),
]);

export const insuranceClaimsHealthcare = mysqlTable("insurance_claims_healthcare", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	claimNumber: varchar("claim_number", { length: 50 }).notNull(),
	insuranceProvider: varchar("insurance_provider", { length: 255 }).notNull(),
	policyNumber: varchar("policy_number", { length: 100 }),
	claimAmount: decimal("claim_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	approvedAmount: decimal("approved_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['draft','submitted','approved','rejected','paid','partial']).default('draft').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	submissionDate: date("submission_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	approvalDate: date("approval_date", { mode: 'string' }),
	diagnosis: text(),
	treatment: text(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("insurance_claims_hc_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "insurance_claims_healthcare_id"}),
	unique("id").on(table.id),
]);

export const insuranceCompanies = mysqlTable("insurance_companies", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	code: varchar({ length: 50 }),
	contractNumber: varchar("contract_number", { length: 100 }),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00'),
	coveragePercent: decimal("coverage_percent", { precision: 5, scale: 2 }).default('100.00'),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "insurance_companies_id"}),
	unique("id").on(table.id),
]);

export const intercompanyReconciliations = mysqlTable("intercompany_reconciliations", {
	id: serial().notNull(),
	intercompanyTransactionId: bigint("intercompany_transaction_id", { mode: "number", unsigned: true }).notNull(),
	sourceCompanyId: bigint("source_company_id", { mode: "number", unsigned: true }),
	targetCompanyId: bigint("target_company_id", { mode: "number", unsigned: true }),
	sourceAmount: decimal("source_amount", { precision: 18, scale: 2 }).default('0.00'),
	targetAmount: decimal("target_amount", { precision: 18, scale: 2 }).default('0.00'),
	difference: decimal({ precision: 18, scale: 2 }).default('0.00'),
	reconciledAt: timestamp("reconciled_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	reconciledBy: bigint("reconciled_by", { mode: "number", unsigned: true }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "intercompany_reconciliations_id"}),
	unique("id").on(table.id),
]);

export const intercompanyTransactions = mysqlTable("intercompany_transactions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	transactionNumber: varchar("transaction_number", { length: 100 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	transactionDate: date("transaction_date", { mode: 'string' }).notNull(),
	sourceCompanyId: bigint("source_company_id", { mode: "number", unsigned: true }).notNull(),
	targetCompanyId: bigint("target_company_id", { mode: "number", unsigned: true }).notNull(),
	transactionType: mysqlEnum("transaction_type", ['sale','purchase','loan','dividend','expense']).notNull(),
	referenceNumber: varchar("reference_number", { length: 100 }),
	totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default('0.00').notNull(),
	currency: varchar({ length: 10 }).default('SAR'),
	exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default('1.000000'),
	description: text(),
	status: mysqlEnum(['draft','posted','reconciled']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("interco_tx_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "intercompany_transactions_id"}),
	unique("id").on(table.id),
]);

export const inventoryAdjustmentReasons = mysqlTable("inventory_adjustment_reasons", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	reasonCode: varchar("reason_code", { length: 50 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	category: mysqlEnum(['damage','loss','theft','breakage','expiry','count_error','return','quality']).notNull(),
	requiresApproval: tinyint("requires_approval").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("iar_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "inventory_adjustment_reasons_id"}),
	unique("id").on(table.id),
]);

export const inventoryBalances = mysqlTable("inventory_balances", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	quantity: int().default(0),
	reservedQuantity: int("reserved_quantity").default(0),
	avgCost: decimal("avg_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalValue: decimal("total_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "inventory_balances_id"}),
	unique("id").on(table.id),
	unique("inv_bal_unique").on(table.productId, table.warehouseId),
]);

export const inventoryMovements = mysqlTable("inventory_movements", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	movementType: mysqlEnum("movement_type", ['purchase','sale','adjustment','transfer_in','transfer_out','return_in','return_out','production_in','production_out','opening']).notNull(),
	quantity: int().notNull(),
	unitCost: decimal("unit_cost", { precision: 18, scale: 4 }),
	totalCost: decimal("total_cost", { precision: 18, scale: 4 }),
	reference: varchar({ length: 100 }),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
	batchNumber: varchar("batch_number", { length: 100 }),
	serialNumber: varchar("serial_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "inventory_movements_id"}),
	unique("id").on(table.id),
]);

export const invoiceItems = mysqlTable("invoice_items", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	sortOrder: int("sort_order").default(0),
	itemType: mysqlEnum("item_type", ['product','service','labor','other']).default('product'),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	sku: varchar({ length: 100 }),
	description: varchar({ length: 500 }).notNull(),
	descriptionAr: varchar("description_ar", { length: 500 }),
	unit: varchar({ length: 50 }).default('Piece'),
	quantity: decimal({ precision: 15, scale: 3 }).default('1.000').notNull(),
	hours: decimal({ precision: 15, scale: 2 }),
	unitPrice: decimal("unit_price", { precision: 15, scale: 4 }).notNull(),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00'),
	taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default('15.00').notNull(),
	discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default('0.00'),
	taxableAmount: decimal("taxable_amount", { precision: 15, scale: 2 }).default('0.00').notNull(),
	taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('15.00'),
	taxCategory: mysqlEnum("tax_category", ['standard','zero_rated','exempt','out_of_scope']).default('standard'),
	taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default('0.00').notNull(),
	lineTotal: decimal("line_total", { precision: 15, scale: 2 }).default('0.00').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	workerName: varchar("worker_name", { length: 255 }),
	batchNumber: varchar("batch_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	totalHours: decimal("total_hours", { precision: 10, scale: 2 }),
	ratePerHour: decimal("rate_per_hour", { precision: 18, scale: 4 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	localUuid: varchar("local_uuid", { length: 255 }),
	version: int().default(1),
	serverId: bigint("server_id", { mode: "number", unsigned: true }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
},
(table) => [
	index("idx_invoice").on(table.invoiceId),
	index("idx_tenant").on(table.tenantId),
	index("item_luuid_idx").on(table.localUuid),
	primaryKey({ columns: [table.id], name: "invoice_items_id"}),
]);

export const invoiceTaxSettings = mysqlTable("invoice_tax_settings", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	showTax: tinyint("show_tax").default(1),
	taxLabel: varchar("tax_label", { length: 100 }).default('VAT'),
	taxLabelAr: varchar("tax_label_ar", { length: 100 }).default('ضريبة القيمة المضافة'),
	taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default('15.00'),
	taxInclusive: tinyint("tax_inclusive").default(0),
	showTaxNumber: tinyint("show_tax_number").default(1),
	showStamp: tinyint("show_stamp").default(1),
	showLogo: tinyint("show_logo").default(1),
	showFooter: tinyint("show_footer").default(1),
	footerText: text("footer_text"),
	footerTextAr: text("footer_text_ar"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "invoice_tax_settings_id"}),
	unique("id").on(table.id),
	unique("invoice_tax_settings_tenant_id_unique").on(table.tenantId),
]);

export const invoiceThemes = mysqlTable("invoice_themes", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	nameAr: varchar("name_ar", { length: 100 }),
	themeKey: varchar("theme_key", { length: 50 }).notNull(),
	config: json().notNull(),
	isDefault: tinyint("is_default").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("invoice_theme_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "invoice_themes_id"}),
	unique("id").on(table.id),
]);

export const invoices = mysqlTable("invoices", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
	invoiceType: mysqlEnum("invoice_type", ['standard','simplified','zatca']).default('standard').notNull(),
	invoiceMode: varchar("invoice_mode", { length: 50 }).default('product'),
	status: mysqlEnum(['draft','sent','paid','partial','overdue','cancelled','credit_note']).default('draft').notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	orderId: bigint("order_id", { mode: "number", unsigned: true }),
	customerName: varchar("customer_name", { length: 255 }),
	customerNameAr: varchar("customer_name_ar", { length: 255 }),
	customerPhone: varchar("customer_phone", { length: 50 }),
	customerEmail: varchar("customer_email", { length: 320 }),
	customerVat: varchar("customer_vat", { length: 15 }),
	customerCr: varchar("customer_cr", { length: 100 }),
	customerAddress: text("customer_address"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	issueDate: date("issue_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	time: varchar({ length: 20 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	supplyDate: date("supply_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	supplyPeriodStart: date("supply_period_start", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	supplyPeriodEnd: date("supply_period_end", { mode: 'string' }),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentTerms: int("payment_terms").default(30),
	cashier: varchar({ length: 100 }),
	poNumber: varchar("po_number", { length: 100 }),
	contractNumber: varchar("contract_number", { length: 100 }),
	projectReference: varchar("project_reference", { length: 100 }),
	cashierName: varchar("cashier_name", { length: 255 }),
	subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	subtotal: decimal({ precision: 15, scale: 2 }).default('0.00').notNull(),
	discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default('0.00'),
	taxableAmount: decimal("taxable_amount", { precision: 15, scale: 2 }).default('0.00').notNull(),
	taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('15.00').notNull(),
	taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default('15.00').notNull(),
	shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default('0.00').notNull(),
	totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default('0.00').notNull(),
	paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default('0.00'),
	balanceDue: decimal("balance_due", { precision: 15, scale: 2 }).default('0.00'),
	currency: varchar({ length: 10 }).default('SAR'),
	notes: text(),
	terms: text(),
	termsEn: text("terms_en"),
	termsAr: text("terms_ar"),
	uuid: varchar({ length: 255 }),
	invoiceHash: varchar("invoice_hash", { length: 255 }),
	qrCode: text("qr_code"),
	zatcaStatus: mysqlEnum("zatca_status", ['pending','reported','cleared']),
	zatcaResponse: json("zatca_response"),
	isLocked: tinyint("is_locked").default(0),
	lockedAt: timestamp("locked_at", { mode: 'string' }),
	pdfPath: text("pdf_path"),
	xmlPath: text("xml_path"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	branchId: bigint("branch_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	zatcaQrCode: text("zatca_qr_code"),
	zatcaXml: text("zatca_xml"),
	workedMonth: varchar("worked_month", { length: 20 }),
	localUuid: varchar("local_uuid", { length: 255 }),
	version: int().default(1),
	serverId: bigint("server_id", { mode: "number", unsigned: true }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
},
(table) => [
	index("idx_customer").on(table.customerId),
	index("idx_date").on(table.issueDate),
	index("idx_number").on(table.invoiceNumber),
	index("idx_status").on(table.status),
	index("idx_tenant").on(table.tenantId),
	index("inv_luuid_idx").on(table.localUuid),
	index("inv_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "invoices_id"}),
	unique("inv_num_idx").on(table.tenantId, table.invoiceNumber),
]);

export const iotAlertEvents = mysqlTable("iot_alert_events", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: bigint("device_id", { mode: "number", unsigned: true }).notNull(),
	sensorType: varchar("sensor_type", { length: 100 }).notNull(),
	value: decimal({ precision: 18, scale: 6 }).notNull(),
	thresholdMin: decimal("threshold_min", { precision: 18, scale: 6 }),
	thresholdMax: decimal("threshold_max", { precision: 18, scale: 6 }),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium').notNull(),
	acknowledged: tinyint().default(0).notNull(),
	acknowledgedBy: bigint("acknowledged_by", { mode: "number", unsigned: true }),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("iot_alert_severity_idx").on(table.severity),
	index("iot_alert_tenant_idx").on(table.tenantId, table.deviceId),
	primaryKey({ columns: [table.id], name: "iot_alert_events_id"}),
]);

export const iotDevices = mysqlTable("iot_devices", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: varchar("device_id", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 100 }).notNull(),
	location: varchar({ length: 255 }),
	isOnline: tinyint("is_online").default(0).notNull(),
	lastSeen: timestamp("last_seen", { mode: 'string' }),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("iot_devices_type_idx").on(table.type),
	primaryKey({ columns: [table.id], name: "iot_devices_id"}),
	unique("iot_devices_uidx").on(table.tenantId, table.deviceId),
]);

export const iotSensorData = mysqlTable("iot_sensor_data", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: bigint("device_id", { mode: "number", unsigned: true }).notNull(),
	sensorType: varchar("sensor_type", { length: 100 }).notNull(),
	value: decimal({ precision: 18, scale: 6 }).notNull(),
	unit: varchar({ length: 50 }).default(').notNull(),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("iot_sensor_recorded_idx").on(table.recordedAt),
	index("iot_sensor_tenant_idx").on(table.tenantId, table.deviceId),
	index("iot_sensor_type_idx").on(table.sensorType),
	primaryKey({ columns: [table.id], name: "iot_sensor_data_id"}),
]);

export const iotThresholdAlerts = mysqlTable("iot_threshold_alerts", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: bigint("device_id", { mode: "number", unsigned: true }).notNull(),
	sensorType: varchar("sensor_type", { length: 100 }).notNull(),
	minValue: decimal("min_value", { precision: 18, scale: 6 }),
	maxValue: decimal("max_value", { precision: 18, scale: 6 }),
	enabled: tinyint().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("iot_threshold_tenant_idx").on(table.tenantId, table.deviceId),
	primaryKey({ columns: [table.id], name: "iot_threshold_alerts_id"}),
]);

export const iqamaRecords = mysqlTable("iqama_records", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	iqamaNumber: varchar("iqama_number", { length: 50 }).notNull(),
	passportNumber: varchar("passport_number", { length: 50 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	issuanceDate: date("issuance_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	renewalDate: date("renewal_date", { mode: 'string' }),
	profession: varchar({ length: 255 }),
	sponsorName: varchar("sponsor_name", { length: 255 }),
	borderNumber: varchar("border_number", { length: 50 }),
	status: mysqlEnum(['active','expired','renewed','cancelled']).default('active'),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("iqama_expiry_idx").on(table.expiryDate),
	index("iqama_number_idx").on(table.iqamaNumber),
	index("iqama_tenant_idx").on(table.tenantId, table.employeeId),
	primaryKey({ columns: [table.id], name: "iqama_records_id"}),
]);

export const itineraries = mysqlTable("itineraries", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	bookingId: bigint("booking_id", { mode: "number", unsigned: true }).notNull(),
	day: int().notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }),
	activity: varchar({ length: 255 }).notNull(),
	description: text(),
	location: varchar({ length: 255 }),
	startTime: varchar("start_time", { length: 10 }),
	endTime: varchar("end_time", { length: 10 }),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
	cost: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("itineraries_booking_idx").on(table.bookingId),
	index("itineraries_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "itineraries_id"}),
	unique("id").on(table.id),
]);

export const jobCostingCategories = mysqlTable("job_costing_categories", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	categoryName: text("category_name").notNull(),
	categoryCode: varchar("category_code", { length: 255 }).notNull(),
	description: text(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "job_costing_categories_id"}),
	unique("category_code").on(table.categoryCode),
]);

export const jobCostingDetails = mysqlTable("job_costing_details", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	wbsItemId: bigint("wbs_item_id", { mode: "number", unsigned: true }).references(() => wbsItems.id),
	costCategoryId: bigint("cost_category_id", { mode: "number", unsigned: true }).notNull().references(() => jobCostingCategories.id),
	budgetAmount: varchar("budget_amount", { length: 255 }).notNull(),
	actualAmount: varchar("actual_amount", { length: 255 }).default('0'),
	forecastAmount: varchar("forecast_amount", { length: 255 }).default('0'),
	varianceAmount: varchar("variance_amount", { length: 255 }).default('0'),
	variancePercent: varchar("variance_percent", { length: 255 }).default('0'),
	varianceType: varchar("variance_type", { length: 255 }),
	status: varchar({ length: 255 }).default('on_track'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("cost_category_id").on(table.costCategoryId),
	index("idx_job_costing_project").on(table.projectId),
	index("idx_job_costing_status").on(table.status),
	index("idx_job_costing_wbs").on(table.wbsItemId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "job_costing_details_id"}),
]);

export const journalEntries = mysqlTable("journal_entries", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	entryNumber: varchar("entry_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	reference: varchar({ length: 100 }),
	referenceType: mysqlEnum("reference_type", ['invoice','payment','adjustment','opening','closing','reversal','other']).default('other').notNull(),
	description: text().notNull(),
	totalDebit: decimal("total_debit", { precision: 18, scale: 4 }).notNull(),
	totalCredit: decimal("total_credit", { precision: 18, scale: 4 }).notNull(),
	isPosted: tinyint("is_posted").default(1),
	isReversed: tinyint("is_reversed").default(0),
	reversedEntryId: bigint("reversed_entry_id", { mode: "number", unsigned: true }),
	costCenterId: bigint("cost_center_id", { mode: "number", unsigned: true }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("je_date_idx").on(table.date),
	index("je_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "journal_entries_id"}),
	unique("id").on(table.id),
]);

export const journalEntryLines = mysqlTable("journal_entry_lines", {
	id: serial().notNull(),
	journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }).notNull(),
	accountId: bigint("account_id", { mode: "number", unsigned: true }).notNull(),
	debit: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	credit: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	description: text(),
	costCenterId: bigint("cost_center_id", { mode: "number", unsigned: true }),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default('1.000000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "journal_entry_lines_id"}),
	unique("id").on(table.id),
]);

export const kdsStationProducts = mysqlTable("kds_station_products", {
	id: serial().notNull(),
	stationId: bigint("station_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "kds_station_products_id"}),
	unique("id").on(table.id),
	unique("kds_station_products_unique").on(table.stationId, table.productId),
]);

export const kdsStations = mysqlTable("kds_stations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	stationType: mysqlEnum("station_type", ['kitchen','bar','grill','salad','pizza','dessert','other']).default('kitchen').notNull(),
	printerName: varchar("printer_name", { length: 255 }),
	isActive: tinyint("is_active").default(1).notNull(),
	sortOrder: int("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("kds_stations_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "kds_stations_id"}),
	unique("id").on(table.id),
]);

export const kotTicketItems = mysqlTable("kot_ticket_items", {
	id: serial().notNull(),
	kotTicketId: bigint("kot_ticket_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	productName: varchar("product_name", { length: 255 }).notNull(),
	quantity: int().notNull(),
	modifiers: json(),
	instructions: text(),
	status: mysqlEnum(['pending','preparing','ready','served','cancelled','held']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "kot_ticket_items_id"}),
	unique("id").on(table.id),
]);

export const kotTickets = mysqlTable("kot_tickets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	tableOrderId: bigint("table_order_id", { mode: "number", unsigned: true }),
	restaurantTableId: bigint("restaurant_table_id", { mode: "number", unsigned: true }),
	stationId: bigint("station_id", { mode: "number", unsigned: true }).notNull(),
	kotNumber: varchar("kot_number", { length: 50 }).notNull(),
	course: mysqlEnum(['appetizer','main','dessert','drinks','other']).default('main').notNull(),
	courseSequence: int("course_sequence").default(0).notNull(),
	priority: mysqlEnum(['normal','rush','vip']).default('normal').notNull(),
	status: mysqlEnum(['pending','preparing','ready','served','cancelled']).default('pending').notNull(),
	printed: tinyint().default(0).notNull(),
	printCount: int("print_count").default(0).notNull(),
	preparedBy: bigint("prepared_by", { mode: "number", unsigned: true }),
	readyAt: timestamp("ready_at", { mode: 'string' }),
	servedAt: timestamp("served_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("kot_tickets_order_idx").on(table.tableOrderId),
	index("kot_tickets_station_idx").on(table.stationId, table.status),
	primaryKey({ columns: [table.id], name: "kot_tickets_id"}),
	unique("id").on(table.id),
]);

export const labOrders = mysqlTable("lab_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	orderNumber: varchar("order_number", { length: 50 }).notNull(),
	testName: varchar("test_name", { length: 255 }).notNull(),
	orderedBy: bigint("ordered_by", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	orderDate: date("order_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	resultDate: date("result_date", { mode: 'string' }),
	result: text(),
	status: mysqlEnum(['pending','collected','processing','completed','cancelled']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("lab_orders_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "lab_orders_id"}),
	unique("id").on(table.id),
]);

export const labResults = mysqlTable("lab_results", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	labOrderId: bigint("lab_order_id", { mode: "number", unsigned: true }),
	resultNumber: varchar("result_number", { length: 50 }).notNull(),
	testName: varchar("test_name", { length: 255 }).notNull(),
	testCode: varchar("test_code", { length: 100 }),
	testCategory: varchar("test_category", { length: 100 }),
	specimenType: varchar("specimen_type", { length: 100 }),
	collectionDate: timestamp("collection_date", { mode: 'string' }),
	receivedDate: timestamp("received_date", { mode: 'string' }),
	reportedDate: timestamp("reported_date", { mode: 'string' }),
	result: text(),
	resultValue: varchar("result_value", { length: 255 }),
	resultUnit: varchar("result_unit", { length: 50 }),
	referenceRange: varchar("reference_range", { length: 255 }),
	isAbnormal: tinyint("is_abnormal").default(0),
	abnormalFlag: varchar("abnormal_flag", { length: 10 }),
	interpretation: text(),
	status: mysqlEnum(['pending','in_progress','completed','reviewed','cancelled']).default('pending'),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("lab_results_patient_idx").on(table.patientId),
	index("lab_results_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "lab_results_id"}),
	unique("id").on(table.id),
	unique("result_number").on(table.resultNumber),
]);

export const laundryOrders = mysqlTable("laundry_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	customerName: varchar("customer_name", { length: 255 }).notNull(),
	customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
	itemsCount: int("items_count").default(1).notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['received','washing','ironing','ready','delivered']).default('received').notNull(),
	paymentStatus: mysqlEnum("payment_status", ['paid','unpaid']).default('unpaid').notNull(),
	garmentDetails: text("garment_details"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	deliveryType: mysqlEnum("delivery_type", ['pickup','delivery']).default('pickup').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("laundry_orders_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "laundry_orders_id"}),
	unique("id").on(table.id),
]);

export const leads = mysqlTable("leads", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	mobile: varchar({ length: 50 }),
	company: varchar({ length: 255 }),
	jobTitle: varchar("job_title", { length: 255 }),
	source: mysqlEnum(['website','referral','social_media','email','call','walk_in','other']).default('other').notNull(),
	status: mysqlEnum(['new','contacted','qualified','proposal','negotiation','won','lost']).default('new').notNull(),
	rating: mysqlEnum(['hot','warm','cold']).default('warm').notNull(),
	estimatedValue: decimal("estimated_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	notes: text(),
	nextFollowUp: timestamp("next_follow_up", { mode: 'string' }),
	isConverted: tinyint("is_converted").default(0),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "leads_id"}),
	unique("id").on(table.id),
]);

export const leaseContracts = mysqlTable("lease_contracts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	leaseCode: varchar("lease_code", { length: 100 }).notNull(),
	description: text(),
	lessorName: varchar("lessor_name", { length: 255 }).notNull(),
	leaseType: mysqlEnum("lease_type", ['operating','finance']).notNull(),
	assetId: bigint("asset_id", { mode: "number", unsigned: true }),
	assetCategory: varchar("asset_category", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }).notNull(),
	leaseTermMonths: int("lease_term_months").notNull(),
	rentalPaymentAmount: decimal("rental_payment_amount", { precision: 18, scale: 2 }).default('0.00').notNull(),
	paymentFrequency: mysqlEnum("payment_frequency", ['monthly','quarterly','semi_annual','annual']).default('monthly').notNull(),
	paymentDay: int("payment_day").default(1),
	currency: varchar({ length: 10 }).default('SAR'),
	discountRate: decimal("discount_rate", { precision: 10, scale: 6 }).default('0.000000').notNull(),
	incentiveAmount: decimal("incentive_amount", { precision: 18, scale: 2 }).default('0.00'),
	initialDirectCosts: decimal("initial_direct_costs", { precision: 18, scale: 2 }).default('0.00'),
	residualValueGuarantee: decimal("residual_value_guarantee", { precision: 18, scale: 2 }).default('0.00'),
	purchaseOption: tinyint("purchase_option").default(0),
	purchaseOptionAmount: decimal("purchase_option_amount", { precision: 18, scale: 2 }).default('0.00'),
	renewalOption: tinyint("renewal_option").default(0),
	renewalTermMonths: int("renewal_term_months"),
	terminationOption: tinyint("termination_option").default(0),
	terminationPenaltyAmount: decimal("termination_penalty_amount", { precision: 18, scale: 2 }).default('0.00'),
	rightOfUseAsset: decimal("right_of_use_asset", { precision: 18, scale: 2 }).default('0.00'),
	leaseLiability: decimal("lease_liability", { precision: 18, scale: 2 }).default('0.00'),
	accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 18, scale: 2 }).default('0.00'),
	interestRate: mysqlEnum("interest_rate", ['implicit','incremental']).default('incremental'),
	status: mysqlEnum(['active','expired','terminated','amended']).default('active').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("lease_contracts_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "lease_contracts_id"}),
	unique("id").on(table.id),
]);

export const leaseModifications = mysqlTable("lease_modifications", {
	id: serial().notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	modificationDate: date("modification_date", { mode: 'string' }).notNull(),
	modificationType: mysqlEnum("modification_type", ['extension','termination','rent_revision','asset_change']).notNull(),
	description: text(),
	oldPaymentAmount: decimal("old_payment_amount", { precision: 18, scale: 2 }).default('0.00'),
	newPaymentAmount: decimal("new_payment_amount", { precision: 18, scale: 2 }).default('0.00'),
	oldDiscountRate: decimal("old_discount_rate", { precision: 10, scale: 6 }).default('0.000000'),
	newDiscountRate: decimal("new_discount_rate", { precision: 10, scale: 6 }).default('0.000000'),
	oldLeaseTerm: int("old_lease_term"),
	newLeaseTerm: int("new_lease_term"),
	gainLossAmount: decimal("gain_loss_amount", { precision: 18, scale: 2 }).default('0.00'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveDate: date("effective_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("lease_mods_contract_idx").on(table.contractId),
	primaryKey({ columns: [table.id], name: "lease_modifications_id"}),
	unique("id").on(table.id),
]);

export const leasePaymentSchedules = mysqlTable("lease_payment_schedules", {
	id: serial().notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paymentDate: date("payment_date", { mode: 'string' }).notNull(),
	paymentAmount: decimal("payment_amount", { precision: 18, scale: 2 }).default('0.00').notNull(),
	principalPortion: decimal("principal_portion", { precision: 18, scale: 2 }).default('0.00'),
	interestPortion: decimal("interest_portion", { precision: 18, scale: 2 }).default('0.00'),
	outstandingBalance: decimal("outstanding_balance", { precision: 18, scale: 2 }).default('0.00'),
	paymentStatus: mysqlEnum("payment_status", ['pending','paid','overdue']).default('pending').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paidDate: date("paid_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("lease_pay_sched_contract_idx").on(table.contractId),
	primaryKey({ columns: [table.id], name: "lease_payment_schedules_id"}),
	unique("id").on(table.id),
]);

export const leases = mysqlTable("leases", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	leaseNumber: varchar("lease_number", { length: 50 }).notNull(),
	unitId: bigint("unit_id", { mode: "number", unsigned: true }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }).notNull(),
	monthlyRent: decimal("monthly_rent", { precision: 18, scale: 4 }).notNull(),
	securityDeposit: decimal("security_deposit", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	rentDueDay: int("rent_due_day").default(1).notNull(),
	leaseType: mysqlEnum("lease_type", ['residential','commercial','short_term','long_term']).default('residential').notNull(),
	status: mysqlEnum(['draft','active','expired','terminated','renewed']).default('draft').notNull(),
	renewalCount: int("renewal_count").default(0).notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("leases_tenant_idx").on(table.tenantId),
	index("leases_unit_idx").on(table.unitId),
	primaryKey({ columns: [table.id], name: "leases_id"}),
	unique("id").on(table.id),
]);

export const leaveRequests = mysqlTable("leave_requests", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	leaveTypeId: bigint("leave_type_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }).notNull(),
	days: int().notNull(),
	reason: text(),
	status: mysqlEnum(['pending','approved','rejected','cancelled']).default('pending').notNull(),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "leave_requests_id"}),
	unique("id").on(table.id),
]);

export const leaveTypes = mysqlTable("leave_types", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	daysAllowed: int("days_allowed").default(0),
	isPaid: tinyint("is_paid").default(1),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "leave_types_id"}),
	unique("id").on(table.id),
]);

export const localizationProfiles = mysqlTable("localization_profiles", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	countryCode: varchar("country_code", { length: 2 }).notNull(),
	language: varchar({ length: 10 }).default('en').notNull(),
	currency: varchar({ length: 10 }).default('USD').notNull(),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
	dateFormat: varchar("date_format", { length: 20 }).default('DD/MM/YYYY').notNull(),
	numberFormat: varchar("number_format", { length: 20 }).default('#,##0.00').notNull(),
	isRtl: tinyint("is_rtl").default(0),
	taxProfile: varchar("tax_profile", { length: 50 }),
	isDefault: tinyint("is_default").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "localization_profiles_id"}),
	unique("id").on(table.id),
]);

export const loyaltyCards = mysqlTable("loyalty_cards", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	programId: bigint("program_id", { mode: "number", unsigned: true }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	cardNumber: varchar("card_number", { length: 100 }).notNull(),
	tier: varchar({ length: 50 }).default('standard'),
	totalPoints: decimal("total_points", { precision: 18, scale: 4 }).default('0.0000'),
	lifetimePoints: decimal("lifetime_points", { precision: 18, scale: 4 }).default('0.0000'),
	lifetimeSpend: decimal("lifetime_spend", { precision: 18, scale: 4 }).default('0.0000'),
	currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).default('0.0000'),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("loyalty_cards_customer_idx").on(table.customerId),
	index("loyalty_cards_program_idx").on(table.programId),
	primaryKey({ columns: [table.id], name: "loyalty_cards_id"}),
	unique("id").on(table.id),
	unique("loyalty_cards_number_unique").on(table.cardNumber),
]);

export const loyaltyPrograms = mysqlTable("loyalty_programs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	pointsPerCurrency: decimal("points_per_currency", { precision: 10, scale: 2 }).default('1.00').notNull(),
	currencyPerPoint: decimal("currency_per_point", { precision: 10, scale: 2 }).default('0.01').notNull(),
	pointExpiryDays: int("point_expiry_days").default(365),
	minRedeemPoints: int("min_redeem_points").default(0),
	maxRedeemPercent: decimal("max_redeem_percent", { precision: 5, scale: 2 }).default('100.00'),
	tierConfig: json("tier_config"),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("loyalty_programs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "loyalty_programs_id"}),
	unique("id").on(table.id),
]);

export const loyaltyTransactions = mysqlTable("loyalty_transactions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	cardId: bigint("card_id", { mode: "number", unsigned: true }).notNull(),
	transactionType: mysqlEnum("transaction_type", ['earn','redeem','adjust','expire','transfer']).notNull(),
	points: decimal({ precision: 18, scale: 4 }).notNull(),
	balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).notNull(),
	balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).notNull(),
	referenceType: varchar("reference_type", { length: 100 }),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
	description: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("loyalty_transactions_card_idx").on(table.cardId),
	primaryKey({ columns: [table.id], name: "loyalty_transactions_id"}),
	unique("id").on(table.id),
]);

export const maintenanceAirworthiness = mysqlTable("maintenance_airworthiness", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }),
	aircraftRegistration: varchar("aircraft_registration", { length: 50 }),
	inspectionType: varchar("inspection_type", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	inspectionDate: date("inspection_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	nextDueDate: date("next_due_date", { mode: 'string' }),
	airframeHours: int("airframe_hours"),
	engineHours: int("engine_hours"),
	performedBy: varchar("performed_by", { length: 255 }),
	findings: text(),
	correctiveAction: text("corrective_action"),
	status: mysqlEnum(['scheduled','in_progress','completed','deferred','aog']).default('scheduled').notNull(),
	isAirworthy: tinyint("is_airworthy").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("maintenance_airworthiness_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "maintenance_airworthiness_id"}),
	unique("id").on(table.id),
]);

export const maintenanceRequests = mysqlTable("maintenance_requests", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	unitId: bigint("unit_id", { mode: "number", unsigned: true }).notNull(),
	requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
	requestNumber: varchar("request_number", { length: 50 }).notNull(),
	category: varchar({ length: 100 }),
	description: text().notNull(),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	status: mysqlEnum(['reported','assigned','in_progress','resolved','closed','cancelled']).default('reported').notNull(),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	estimatedCost: decimal("estimated_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	scheduledDate: date("scheduled_date", { mode: 'string' }),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("maintenance_requests_status_idx").on(table.tenantId, table.status),
	index("maintenance_requests_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "maintenance_requests_id"}),
	unique("id").on(table.id),
]);

export const masterProductionSchedules = mysqlTable("master_production_schedules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	scheduleDate: date("schedule_date", { mode: 'string' }).notNull(),
	plannedQuantity: decimal("planned_quantity", { precision: 18, scale: 4 }).notNull(),
	confirmedQuantity: decimal("confirmed_quantity", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	availableToPromise: decimal("available_to_promise", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	demandSource: mysqlEnum("demand_source", ['forecast','sales_order','safety_stock','manual']).notNull(),
	status: mysqlEnum(['planned','firmed','closed']).default('planned').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("mps_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "master_production_schedules_id"}),
	unique("id").on(table.id),
]);

export const materialRequirements = mysqlTable("material_requirements", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	wbsId: bigint("wbs_id", { mode: "number", unsigned: true }),
	boqItemId: bigint("boq_item_id", { mode: "number", unsigned: true }),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	materialName: varchar("material_name", { length: 255 }).notNull(),
	specification: text(),
	requiredQuantity: decimal("required_quantity", { precision: 18, scale: 4 }).notNull(),
	unit: varchar({ length: 50 }).notNull(),
	quantityOrdered: decimal("quantity_ordered", { precision: 18, scale: 4 }).default('0.0000'),
	quantityReceived: decimal("quantity_received", { precision: 18, scale: 4 }).default('0.0000'),
	quantityConsumed: decimal("quantity_consumed", { precision: 18, scale: 4 }).default('0.0000'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	requiredDate: date("required_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deliveryDate: date("delivery_date", { mode: 'string' }),
	status: mysqlEnum(['planned','ordered','partial','received','consumed']).default('planned').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("material_requirements_project_idx").on(table.tenantId, table.projectId),
	index("material_requirements_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "material_requirements_id"}),
	unique("id").on(table.id),
]);

export const medicalRecords = mysqlTable("medical_records", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
	recordNumber: varchar("record_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	recordDate: date("record_date", { mode: 'string' }).notNull(),
	doctorId: bigint("doctor_id", { mode: "number", unsigned: true }),
	chiefComplaint: text("chief_complaint"),
	presentIllnessHistory: text("present_illness_history"),
	pastMedicalHistory: text("past_medical_history"),
	familyHistory: text("family_history"),
	socialHistory: text("social_history"),
	allergies: text(),
	currentMedications: text("current_medications"),
	physicalExamination: text("physical_examination"),
	diagnosis: text(),
	diagnosisCodes: json("diagnosis_codes"),
	treatment: text(),
	prescriptions: json(),
	labOrders: json("lab_orders"),
	imagingOrders: json("imaging_orders"),
	followUpInstructions: text("follow_up_instructions"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	followUpDate: date("follow_up_date", { mode: 'string' }),
	recordStatus: mysqlEnum("record_status", ['draft','completed','reviewed','signed']).default('draft'),
	isSigned: tinyint("is_signed").default(0),
	signedAt: timestamp("signed_at", { mode: 'string' }),
	signedBy: bigint("signed_by", { mode: "number", unsigned: true }),
	attachments: json(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("medical_records_date_idx").on(table.recordDate),
	index("medical_records_doctor_idx").on(table.doctorId),
	index("medical_records_patient_idx").on(table.patientId),
	index("medical_records_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "medical_records_id"}),
	unique("id").on(table.id),
	unique("record_number").on(table.recordNumber),
]);

export const meetingAttendees = mysqlTable("meeting_attendees", {
	id: serial().notNull(),
	meetingId: bigint("meeting_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	email: varchar({ length: 320 }),
	name: varchar({ length: 255 }),
	isRequired: tinyint("is_required").default(1),
	status: mysqlEnum(['pending','accepted','declined','tentative']).default('pending').notNull(),
	responseMessage: text("response_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "meeting_attendees_id"}),
	unique("id").on(table.id),
]);

export const meetingNotes = mysqlTable("meeting_notes", {
	id: serial().notNull(),
	meetingId: bigint("meeting_id", { mode: "number", unsigned: true }).notNull(),
	content: text().notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "meeting_notes_id"}),
	unique("id").on(table.id),
]);

export const meetings = mysqlTable("meetings", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	startTime: varchar("start_time", { length: 10 }).notNull(),
	endTime: varchar("end_time", { length: 10 }).notNull(),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
	meetingType: mysqlEnum("meeting_type", ['online','offline']).default('online').notNull(),
	location: varchar({ length: 255 }),
	meetingLink: varchar("meeting_link", { length: 500 }),
	status: mysqlEnum(['scheduled','in_progress','completed','cancelled','rescheduled']).default('scheduled').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull(),
	reminderSent: tinyint("reminder_sent").default(0),
	outcome: text(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	relatedType: varchar("related_type", { length: 50 }),
	relatedId: bigint("related_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("meeting_date_idx").on(table.tenantId, table.date),
	index("meeting_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "meetings_id"}),
	unique("id").on(table.id),
]);

export const moduleRegistry = mysqlTable("module_registry", {
	id: serial().notNull(),
	moduleKey: varchar("module_key", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	description: text(),
	descriptionAr: text("description_ar"),
	iconName: varchar("icon_name", { length: 100 }),
	category: varchar({ length: 100 }),
	featureCount: int("feature_count").default(0),
	route: varchar({ length: 255 }),
	isErpModule: tinyint("is_erp_module").default(1),
	isVisibleOnWebsite: tinyint("is_visible_on_website").default(1),
	requiresLogin: tinyint("requires_login").default(1),
	sortOrder: int("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "module_registry_id"}),
	unique("id").on(table.id),
	unique("module_registry_module_key_unique").on(table.moduleKey),
]);

export const mrpDemands = mysqlTable("mrp_demands", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	demandType: mysqlEnum("demand_type", ['independent','dependent']).notNull(),
	sourceType: mysqlEnum("source_type", ['forecast','sales_order','service','mps']).notNull(),
	sourceId: varchar("source_id", { length: 100 }),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }).notNull(),
	status: mysqlEnum(['open','partially_fulfilled','fulfilled','cancelled']).default('open').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("mrp_demands_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "mrp_demands_id"}),
	unique("id").on(table.id),
]);

export const mrpNetRequirements = mysqlTable("mrp_net_requirements", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	grossRequirement: decimal("gross_requirement", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	scheduledReceipts: decimal("scheduled_receipts", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	projectedOnHand: decimal("projected_on_hand", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	netRequirement: decimal("net_requirement", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	plannedOrderReceipt: decimal("planned_order_receipt", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	plannedOrderRelease: decimal("planned_order_release", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("mrp_nr_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "mrp_net_requirements_id"}),
	unique("id").on(table.id),
]);

export const mrpPlannedOrders = mysqlTable("mrp_planned_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	orderType: mysqlEnum("order_type", ['purchase','manufacture','transfer']).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	releaseDate: date("release_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }).notNull(),
	status: mysqlEnum(['planned','released','completed','cancelled']).default('planned').notNull(),
	parentPlanId: bigint("parent_plan_id", { mode: "number", unsigned: true }),
	mrpRunId: bigint("mrp_run_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("mrp_po_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "mrp_planned_orders_id"}),
	unique("id").on(table.id),
]);

export const mrpRuns = mysqlTable("mrp_runs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	runDate: timestamp("run_date", { mode: 'string' }).default(sql`(now())`).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	horizonStart: date("horizon_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	horizonEnd: date("horizon_end", { mode: 'string' }).notNull(),
	status: mysqlEnum(['running','completed','failed']).default('running').notNull(),
	actionMessages: text("action_messages"),
	executionTimeMs: int("execution_time_ms"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("mrp_runs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "mrp_runs_id"}),
	unique("id").on(table.id),
]);

export const ncrNonconformances = mysqlTable("ncr_nonconformances", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	ncrNumber: varchar("ncr_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	issuedDate: date("issued_date", { mode: 'string' }),
	areaCode: varchar("area_code", { length: 50 }),
	nonconformanceDescription: text("nonconformance_description"),
	specificationReference: text("specification_reference"),
	severity: varchar({ length: 50 }),
	issuedBy: int("issued_by"),
	assignedTo: int("assigned_to"),
	correctiveAction: text("corrective_action"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	targetCompletionDate: date("target_completion_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	actualCompletionDate: date("actual_completion_date", { mode: 'string' }),
	verifiedBy: int("verified_by"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	verificationDate: date("verification_date", { mode: 'string' }),
	status: varchar({ length: 50 }).default('Open'),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_ncr_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ncr_nonconformances_id"}),
	unique("ncr_number").on(table.ncrNumber),
]);

export const nitaqatComplianceAlerts = mysqlTable("nitaqat_compliance_alerts", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	alertType: text("alert_type").notNull(),
	severity: varchar({ length: 100 }).notNull(),
	message: text().notNull(),
	details: text(),
	isAcknowledged: tinyint("is_acknowledged").default(0),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	acknowledgedBy: int("acknowledged_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("project_id").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "nitaqat_compliance_alerts_id"}),
]);

export const nitaqatSnapshots = mysqlTable("nitaqat_snapshots", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	snapshotDate: date("snapshot_date", { mode: 'string' }).notNull(),
	totalSaudis: int("total_saudis").default(0).notNull(),
	totalExpats: int("total_expats").default(0).notNull(),
	saudiRatio: decimal("saudi_ratio", { precision: 5, scale: 4 }).default('0.0000').notNull(),
	category: mysqlEnum(['platinum','green','yellow','red']),
	targetRatio: decimal("target_ratio", { precision: 5, scale: 4 }),
	forecastRatio: decimal("forecast_ratio", { precision: 5, scale: 4 }),
	whatIfHireSaudi: int("what_if_hire_saudi").default(0),
	whatIfHireExpat: int("what_if_hire_expat").default(0),
	whatIfFireSaudi: int("what_if_fire_saudi").default(0),
	whatIfFireExpat: int("what_if_fire_expat").default(0),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("nitaqat_tenant_idx").on(table.tenantId, table.snapshotDate),
	primaryKey({ columns: [table.id], name: "nitaqat_snapshots_id"}),
]);

export const nitaqatTracking = mysqlTable("nitaqat_tracking", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportingPeriod: date("reporting_period", { mode: 'string' }).notNull(),
	totalWorkforce: int("total_workforce").notNull(),
	saudiCount: int("saudi_count").notNull(),
	nonSaudiCount: int("non_saudi_count").notNull(),
	nitaqatPercentage: varchar("nitaqat_percentage", { length: 255 }).notNull(),
	category: varchar({ length: 255 }).notNull(),
	salaryCeilingViolations: int("salary_ceiling_violations").default(0),
	complianceStatus: varchar("compliance_status", { length: 255 }).default('compliant'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	calculatedAt: timestamp("calculated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_nitaqat_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "nitaqat_tracking_id"}),
]);

export const nonConformanceReports = mysqlTable("non_conformance_reports", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	ncrNumber: varchar("ncr_number", { length: 100 }).notNull(),
	inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }),
	referenceType: mysqlEnum("reference_type", ['purchase_order','goods_receipt','work_order','production_order','sales_order','other']).notNull(),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	batchNumber: varchar("batch_number", { length: 100 }),
	description: text().notNull(),
	severity: mysqlEnum(['minor','major','critical']).default('minor').notNull(),
	status: mysqlEnum(['open','under_review','resolved','closed']).default('open').notNull(),
	rootCause: text("root_cause"),
	resolution: text(),
	resolvedBy: bigint("resolved_by", { mode: "number", unsigned: true }),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ncr_status_idx").on(table.tenantId, table.status),
	index("ncr_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "non_conformance_reports_id"}),
	unique("id").on(table.id),
]);

export const notificationTemplates = mysqlTable("notification_templates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	templateKey: varchar("template_key", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleAr: varchar("title_ar", { length: 500 }),
	message: text().notNull(),
	messageAr: text("message_ar"),
	type: mysqlEnum(['info','warning','success','error']).default('info').notNull(),
	icon: varchar({ length: 50 }),
	variables: json(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "notification_templates_id"}),
	unique("id").on(table.id),
]);

export const notifications = mysqlTable("notifications", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	type: mysqlEnum(['info','warning','success','error']).default('info').notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	link: varchar({ length: 500 }),
	isRead: tinyint("is_read").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "notifications_id"}),
	unique("id").on(table.id),
]);

export const offers = mysqlTable("offers", {
	id: serial().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	description: text(),
	descriptionAr: text("description_ar"),
	offerType: mysqlEnum("offer_type", ['free_days','discount_percentage','discount_fixed','free_upgrade']).default('free_days').notNull(),
	offerValue: decimal("offer_value", { precision: 10, scale: 2 }).notNull(),
	minDurationMonths: int("min_duration_months").default(0),
	planId: bigint("plan_id", { mode: "number", unsigned: true }),
	startsAt: timestamp("starts_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "offers_id"}),
	unique("id").on(table.id),
]);

export const offlineOperations = mysqlTable("offline_operations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: varchar("device_id", { length: 100 }),
	operationType: varchar("operation_type", { length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: varchar("entity_id", { length: 100 }),
	payload: json(),
	status: mysqlEnum(['pending','synced','failed']).default('pending').notNull(),
	localCreatedAt: timestamp("local_created_at", { mode: 'string' }),
	syncedAt: timestamp("synced_at", { mode: 'string' }),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("offline_operations_status_idx").on(table.status),
	index("offline_operations_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "offline_operations_id"}),
	unique("id").on(table.id),
]);

export const opportunities = mysqlTable("opportunities", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	leadId: bigint("lead_id", { mode: "number", unsigned: true }),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	stage: mysqlEnum(['prospecting','qualification','proposal','negotiation','closed_won','closed_lost']).default('prospecting').notNull(),
	probability: int().default(0),
	expectedValue: decimal("expected_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expectedCloseDate: date("expected_close_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	actualCloseDate: date("actual_close_date", { mode: 'string' }),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	description: text(),
	lostReason: text("lost_reason"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "opportunities_id"}),
	unique("id").on(table.id),
]);

export const orderCourses = mysqlTable("order_courses", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	tableOrderId: bigint("table_order_id", { mode: "number", unsigned: true }).notNull(),
	course: mysqlEnum(['appetizer','main','dessert','drinks','other']).default('main').notNull(),
	sequence: int().default(0).notNull(),
	timingMinutes: int("timing_minutes").default(0).notNull(),
	status: mysqlEnum(['pending','preparing','ready','served','cancelled']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "order_courses_id"}),
	unique("id").on(table.id),
]);

export const orderItemModifiers = mysqlTable("order_item_modifiers", {
	id: serial().notNull(),
	orderItemId: bigint("order_item_id", { mode: "number", unsigned: true }),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	modifierGroup: varchar("modifier_group", { length: 100 }).notNull(),
	modifierName: varchar("modifier_name", { length: 255 }).notNull(),
	modifierNameAr: varchar("modifier_name_ar", { length: 255 }),
	priceAdjustment: decimal("price_adjustment", { precision: 18, scale: 4 }).default('0.0000'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "order_item_modifiers_id"}),
	unique("id").on(table.id),
]);

export const otpCodes = mysqlTable("otp_codes", {
	id: serial().notNull(),
	email: varchar({ length: 320 }).notNull(),
	otpHash: varchar("otp_hash", { length: 255 }).notNull(),
	purpose: mysqlEnum(['registration','login','forgot_password','email_change','sensitive_action']).default('login').notNull(),
	attempts: int().default(0).notNull(),
	maxAttempts: int("max_attempts").default(5).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	isVerified: tinyint("is_verified").default(0),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	ipAddress: varchar("ip_address", { length: 100 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("otp_email_idx").on(table.email),
	index("otp_purpose_idx").on(table.email, table.purpose),
	primaryKey({ columns: [table.id], name: "otp_codes_id"}),
	unique("id").on(table.id),
]);

export const partnerAccounts = mysqlTable("partner_accounts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	partnerType: mysqlEnum("partner_type", ['reseller','affiliate','referral','integration_partner']).notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	contactName: varchar("contact_name", { length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default('0.00').notNull(),
	totalEarned: decimal("total_earned", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['active','suspended','terminated']).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "partner_accounts_id"}),
	unique("id").on(table.id),
]);

export const partsInventorySerial = mysqlTable("parts_inventory_serial", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	partNumber: varchar("part_number", { length: 100 }).notNull(),
	partName: varchar("part_name", { length: 255 }).notNull(),
	serialNumber: varchar("serial_number", { length: 100 }).notNull(),
	manufacturer: varchar({ length: 255 }),
	quantity: int().default(1).notNull(),
	condition: mysqlEnum(['new','serviceable','overhauled','unserviceable','scrap']).default('new').notNull(),
	location: varchar({ length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	shelfLife: date("shelf_life", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	installationDate: date("installation_date", { mode: 'string' }),
	installedOnAircraft: varchar("installed_on_aircraft", { length: 50 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	removalDate: date("removal_date", { mode: 'string' }),
	tsn: int().default(0).notNull(),
	csi: int().default(0).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("parts_inventory_serial_part_idx").on(table.partNumber),
	index("parts_inventory_serial_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "parts_inventory_serial_id"}),
	unique("id").on(table.id),
	unique("parts_inventory_serial_unique").on(table.serialNumber),
]);

export const partsUsage = mysqlTable("parts_usage", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }).notNull(),
	partId: bigint("part_id", { mode: "number", unsigned: true }).notNull(),
	quantity: int().notNull(),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
	isWarrantyClaim: tinyint("is_warranty_claim").default(0),
	warrantyClaimId: bigint("warranty_claim_id", { mode: "number", unsigned: true }),
	issuedBy: bigint("issued_by", { mode: "number", unsigned: true }),
	issuedAt: timestamp("issued_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("parts_usage_job_card_idx").on(table.jobCardId),
	index("parts_usage_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "parts_usage_id"}),
	unique("id").on(table.id),
]);

export const patients = mysqlTable("patients", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientNumber: varchar("patient_number", { length: 50 }).notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dateOfBirth: date("date_of_birth", { mode: 'string' }),
	gender: mysqlEnum(['male','female','other']),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	mobile: varchar({ length: 50 }),
	address: text(),
	bloodGroup: varchar("blood_group", { length: 10 }),
	allergies: text(),
	medicalHistory: text("medical_history"),
	emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
	emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
	nationalId: varchar("national_id", { length: 100 }),
	insuranceProvider: varchar("insurance_provider", { length: 255 }),
	insurancePolicyNumber: varchar("insurance_policy_number", { length: 100 }),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("patients_phone_idx").on(table.phone),
	index("patients_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "patients_id"}),
	unique("id").on(table.id),
]);

export const paymentCertificates = mysqlTable("payment_certificates", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	progressBillingId: bigint("progress_billing_id", { mode: "number", unsigned: true }).notNull().references(() => progressBilling.id),
	certificateNumber: varchar("certificate_number", { length: 255 }).notNull(),
	certificateAmount: varchar("certificate_amount", { length: 255 }).notNull(),
	retentionPercent: varchar("retention_percent", { length: 255 }).default('5'),
	retentionAmount: varchar("retention_amount", { length: 255 }).notNull(),
	paymentAmount: varchar("payment_amount", { length: 255 }).notNull(),
	status: varchar({ length: 255 }).default('draft'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	issuedDate: date("issued_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paidDate: date("paid_date", { mode: 'string' }),
	zatcaInvoiceId: varchar("zatca_invoice_id", { length: 255 }),
	zatcaQrCode: varchar("zatca_qr_code", { length: 255 }),
	zatcaSignature: varchar("zatca_signature", { length: 255 }),
	zatcaCertificationStatus: varchar("zatca_certification_status", { length: 255 }).default('pending'),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull().references(() => users.id),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	notes: text(),
},
(table) => [
	index("created_by").on(table.createdBy),
	index("idx_payment_certs_project").on(table.progressBillingId),
	index("idx_payment_certs_status").on(table.status),
	index("idx_payment_certs_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "payment_certificates_id"}),
	unique("certificate_number").on(table.certificateNumber),
]);

export const paymentSplits = mysqlTable("payment_splits", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	paymentMethod: mysqlEnum("payment_method", ['cash','card','transfer','cheque','wallet','loyalty','gift_card','credit','multiple']).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	reference: varchar({ length: 255 }),
	emvTransactionId: bigint("emv_transaction_id", { mode: "number", unsigned: true }),
	giftCardId: bigint("gift_card_id", { mode: "number", unsigned: true }),
	loyaltyPointsUsed: decimal("loyalty_points_used", { precision: 18, scale: 4 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("payment_splits_invoice_idx").on(table.invoiceId),
	primaryKey({ columns: [table.id], name: "payment_splits_id"}),
	unique("id").on(table.id),
]);

export const paymentTransactions = mysqlTable("payment_transactions", {
	id: int().autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: int("invoice_id"),
	transactionId: varchar("transaction_id", { length: 255 }).notNull(),
	amount: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 10 }).default('SAR'),
	gateway: varchar({ length: 50 }).notNull(),
	gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
	gatewayResponse: json("gateway_response"),
	status: mysqlEnum(['pending','processing','completed','failed','refunded']).default('pending'),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_gateway").on(table.gateway),
	index("idx_invoice").on(table.invoiceId),
	index("idx_status").on(table.status),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "payment_transactions_id"}),
	unique("transaction_id").on(table.transactionId),
]);

export const payments = mysqlTable("payments", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	paymentNumber: varchar("payment_number", { length: 100 }),
	paymentType: mysqlEnum("payment_type", ['receipt','payment']).default('receipt'),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	amount: decimal({ precision: 15, scale: 2 }).notNull(),
	paymentMethod: mysqlEnum("payment_method", ['cash','bank_transfer','cheque','card','online']).default('cash'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paymentDate: date("payment_date", { mode: 'string' }).notNull(),
	reference: varchar({ length: 255 }),
	notes: text(),
	status: mysqlEnum(['pending','completed','failed','cancelled']).default('completed'),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("idx_customer").on(table.customerId),
	index("idx_date").on(table.paymentDate),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "payments_id"}),
]);

export const payrollPeriods = mysqlTable("payroll_periods", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }).notNull(),
	month: int().notNull(),
	year: int().notNull(),
	status: mysqlEnum(['draft','processing','completed','paid']).default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "payroll_periods_id"}),
	unique("id").on(table.id),
]);

export const pdplDataSubjectRequests = mysqlTable("pdpl_data_subject_requests", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	requestType: mysqlEnum("request_type", ['access','rectification','erasure','restrict','portability','objection','withdraw_consent']).notNull(),
	requestDetails: text("request_details"),
	status: mysqlEnum(['pending','in_progress','completed','rejected']).default('pending'),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	responseSummary: text("response_summary"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("pdpl_tenant_idx").on(table.tenantId, table.employeeId),
	primaryKey({ columns: [table.id], name: "pdpl_data_subject_requests_id"}),
]);

export const peggingRecords = mysqlTable("pegging_records", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	demandId: bigint("demand_id", { mode: "number", unsigned: true }).notNull(),
	orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	mrpRunId: bigint("mrp_run_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("pegging_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "pegging_records_id"}),
	unique("id").on(table.id),
]);

export const performanceMetrics = mysqlTable("performance_metrics", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportingPeriod: date("reporting_period", { mode: 'string' }),
	schedulePerformance: decimal("schedule_performance", { precision: 5, scale: 2 }),
	costPerformance: decimal("cost_performance", { precision: 5, scale: 2 }),
	qualityPerformance: decimal("quality_performance", { precision: 5, scale: 2 }),
	safetyPerformance: decimal("safety_performance", { precision: 5, scale: 2 }),
	laborProductivity: decimal("labor_productivity", { precision: 10, scale: 2 }),
	equipmentProductivity: decimal("equipment_productivity", { precision: 10, scale: 2 }),
	materialEfficiency: decimal("material_efficiency", { precision: 5, scale: 2 }),
	projectHealthScore: decimal("project_health_score", { precision: 5, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_performance_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "performance_metrics_id"}),
]);

export const performanceObligations = mysqlTable("performance_obligations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	obligationName: varchar("obligation_name", { length: 255 }).notNull(),
	description: text(),
	obligationType: mysqlEnum("obligation_type", ['good','service','software','support','construction']).notNull(),
	performanceTiming: mysqlEnum("performance_timing", ['point_in_time','over_time']).notNull(),
	transactionPrice: decimal("transaction_price", { precision: 18, scale: 2 }).default('0.00'),
	standalonePrice: decimal("standalone_price", { precision: 18, scale: 2 }).default('0.00'),
	allocatedAmount: decimal("allocated_amount", { precision: 18, scale: 2 }).default('0.00'),
	recognitionMethod: mysqlEnum("recognition_method", ['output','input','straight_line']).default('straight_line'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	completionPercent: decimal("completion_percent", { precision: 8, scale: 4 }).default('0.0000'),
	status: mysqlEnum(['identified','satisfied','partially_satisfied','cancelled']).default('identified').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("perf_obl_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "performance_obligations_id"}),
	unique("id").on(table.id),
]);

export const performanceReviews = mysqlTable("performance_reviews", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	reviewPeriod: varchar("review_period", { length: 100 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reviewDate: date("review_date", { mode: 'string' }).notNull(),
	overallRating: int("overall_rating"),
	goalsAchieved: int("goals_achieved"),
	skillsRating: int("skills_rating"),
	attendanceRating: int("attendance_rating"),
	teamworkRating: int("teamwork_rating"),
	comments: text(),
	goals: text(),
	reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "performance_reviews_id"}),
	unique("id").on(table.id),
]);

export const personalDataInventory = mysqlTable("personal_data_inventory", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	dataController: varchar("data_controller", { length: 255 }).default('tenant').notNull(),
	dataSubjectType: mysqlEnum("data_subject_type", ['employee','customer','supplier','contact','user','other']).notNull(),
	dataSubjectId: bigint("data_subject_id", { mode: "number", unsigned: true }),
	category: varchar({ length: 255 }).notNull(),
	fieldName: varchar("field_name", { length: 255 }).notNull(),
	dataType: mysqlEnum("data_type", ['personal','sensitive','biometric','financial','health','criminal','other']).notNull(),
	lawfulBasis: varchar("lawful_basis", { length: 255 }).default('explicit_consent'),
	purpose: text(),
	classificationId: bigint("classification_id", { mode: "number", unsigned: true }),
	storageLocation: varchar("storage_location", { length: 255 }).default('database'),
	retentionDays: int("retention_days"),
	isEncrypted: tinyint("is_encrypted").default(0).notNull(),
	isAnonymized: tinyint("is_anonymized").default(0).notNull(),
	thirdPartySharing: json("third_party_sharing"),
	dataProcessedAt: timestamp("data_processed_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("pdi_classification_idx").on(table.classificationId),
	index("pdi_subject_idx").on(table.dataSubjectType, table.dataSubjectId),
	index("pdi_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "personal_data_inventory_id"}),
]);

export const pharmacyIntegration = mysqlTable("pharmacy_integration", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
	prescriptionNumber: varchar("prescription_number", { length: 50 }).notNull(),
	medicationName: varchar("medication_name", { length: 255 }).notNull(),
	dosage: varchar({ length: 100 }),
	frequency: varchar({ length: 100 }),
	durationDays: int("duration_days"),
	quantity: int().notNull(),
	refills: int().default(0).notNull(),
	status: mysqlEnum(['prescribed','dispensed','partial','cancelled']).default('prescribed').notNull(),
	prescribedBy: bigint("prescribed_by", { mode: "number", unsigned: true }),
	dispensedAt: timestamp("dispensed_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("pharmacy_integration_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "pharmacy_integration_id"}),
	unique("id").on(table.id),
]);

export const pickingRules = mysqlTable("picking_rules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	ruleName: varchar("rule_name", { length: 255 }).notNull(),
	priority: int().default(0).notNull(),
	strategy: mysqlEnum(['fifo','fefo','lifo','zone','batch','wave']).notNull(),
	waveSize: int("wave_size"),
	isDefault: tinyint("is_default").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("pkr_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "picking_rules_id"}),
	unique("id").on(table.id),
]);

export const pickingTasks = mysqlTable("picking_tasks", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	taskNumber: varchar("task_number", { length: 50 }).notNull(),
	sourceType: mysqlEnum("source_type", ['sales_order','transfer_out','manufacturing_issue']).notNull(),
	sourceId: bigint("source_id", { mode: "number", unsigned: true }),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	fromLocationId: bigint("from_location_id", { mode: "number", unsigned: true }),
	toLocationId: bigint("to_location_id", { mode: "number", unsigned: true }),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	status: mysqlEnum(['pending','in_progress','completed','cancelled']).default('pending').notNull(),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
},
(table) => [
	index("pkt_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "picking_tasks_id"}),
	unique("id").on(table.id),
]);

export const planFeatures = mysqlTable("plan_features", {
	id: serial().notNull(),
	planId: bigint("plan_id", { mode: "number", unsigned: true }).notNull(),
	featureKey: varchar("feature_key", { length: 100 }).notNull(),
	featureName: varchar("feature_name", { length: 255 }).notNull(),
	featureNameAr: varchar("feature_name_ar", { length: 255 }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "plan_features_id"}),
	unique("id").on(table.id),
]);

export const plans = mysqlTable("plans", {
	id: serial().notNull(),
	name: varchar({ length: 100 }).notNull(),
	nameAr: varchar("name_ar", { length: 100 }),
	description: text(),
	descriptionAr: text("description_ar"),
	priceMonth: decimal("price_month", { precision: 10, scale: 2 }).default('0.00').notNull(),
	priceYear: decimal("price_year", { precision: 10, scale: 2 }).default('0.00').notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	productLimit: int("product_limit").default(60),
	userLimit: int("user_limit").default(5),
	branchLimit: int("branch_limit").default(1),
	warehouseLimit: int("warehouse_limit").default(1),
	trialDays: int("trial_days").default(3),
	isActive: tinyint("is_active").default(1),
	sortOrder: int("sort_order").default(0),
	features: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "plans_id"}),
	unique("id").on(table.id),
]);

export const pluginHookLogs = mysqlTable("plugin_hook_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	pluginName: varchar("plugin_name", { length: 255 }).notNull(),
	hookName: varchar("hook_name", { length: 255 }).notNull(),
	status: mysqlEnum(['success','failed']).default('success').notNull(),
	inputContext: json("input_context"),
	outputResult: json("output_result"),
	errorMessage: text("error_message"),
	executionTimeMs: int("execution_time_ms"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("plugin_hook_name_idx").on(table.pluginName),
	index("plugin_hook_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "plugin_hook_logs_id"}),
]);

export const pluginInstallations = mysqlTable("plugin_installations", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	pluginName: varchar("plugin_name", { length: 255 }).notNull(),
	version: varchar({ length: 50 }).default('1.0.0').notNull(),
	manifest: json(),
	isEnabled: tinyint("is_enabled").default(1).notNull(),
	config: json(),
	installedAt: timestamp("installed_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("plugin_name_idx").on(table.pluginName),
	index("plugin_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "plugin_installations_id"}),
]);

export const portalDocuments = mysqlTable("portal_documents", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	portalType: mysqlEnum("portal_type", ['customer','vendor','employee']).notNull(),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }).notNull(),
	documentType: varchar("document_type", { length: 100 }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileSize: bigint("file_size", { mode: "number", unsigned: true }),
	mimeType: varchar("mime_type", { length: 100 }),
	filePath: text("file_path").notNull(),
	status: mysqlEnum(['pending','approved','rejected']).default('pending'),
	notes: text(),
	uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_portal_docs_ref").on(table.portalType, table.referenceId),
	index("idx_portal_docs_tenant").on(table.tenantId),
	index("idx_portal_docs_type").on(table.portalType),
	primaryKey({ columns: [table.id], name: "portal_documents_id"}),
]);

export const portalMessages = mysqlTable("portal_messages", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	senderType: mysqlEnum("sender_type", ['customer','vendor','employee','admin']).notNull(),
	senderId: bigint("sender_id", { mode: "number", unsigned: true }).notNull(),
	receiverType: mysqlEnum("receiver_type", ['customer','vendor','employee','admin']).notNull(),
	receiverId: bigint("receiver_id", { mode: "number", unsigned: true }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	isRead: tinyint("is_read").default(0),
	parentId: bigint("parent_id", { mode: "number", unsigned: true }),
	attachmentId: bigint("attachment_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_portal_msgs_receiver").on(table.receiverType, table.receiverId),
	index("idx_portal_msgs_sender").on(table.senderType, table.senderId),
	index("idx_portal_msgs_tenant").on(table.tenantId),
	index("parent_id").on(table.parentId),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "portal_messages_ibfk_1"
		}).onDelete("set null"),
	primaryKey({ columns: [table.id], name: "portal_messages_id"}),
]);

export const portalNotifications = mysqlTable("portal_notifications", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	portalType: mysqlEnum("portal_type", ['customer','vendor','employee']).notNull(),
	portalUserId: bigint("portal_user_id", { mode: "number", unsigned: true }).notNull().references(() => portalUsers.id, { onDelete: "cascade" } ),
	title: varchar({ length: 255 }).notNull(),
	message: text(),
	type: varchar({ length: 50 }),
	referenceType: varchar("reference_type", { length: 100 }),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
	isRead: tinyint("is_read").default(0),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_portal_notif_read").on(table.portalUserId, table.isRead),
	index("idx_portal_notif_user").on(table.portalUserId),
	primaryKey({ columns: [table.id], name: "portal_notifications_id"}),
]);

export const portalSessions = mysqlTable("portal_sessions", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	portalUserId: bigint("portal_user_id", { mode: "number", unsigned: true }).notNull().references(() => portalUsers.id, { onDelete: "cascade" } ),
	token: varchar({ length: 255 }).notNull(),
	refreshToken: varchar("refresh_token", { length: 255 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	lastActivityAt: timestamp("last_activity_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_sessions_token").on(table.token),
	index("idx_sessions_user").on(table.portalUserId),
	primaryKey({ columns: [table.id], name: "portal_sessions_id"}),
	unique("token").on(table.token),
]);

export const portalTemplates = mysqlTable("portal_templates", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	portalType: mysqlEnum("portal_type", ['customer','vendor','employee','all']).default('all'),
	templateType: mysqlEnum("template_type", ['email','sms']).notNull(),
	templateKey: varchar("template_key", { length: 100 }).notNull(),
	subject: varchar({ length: 255 }),
	body: text().notNull(),
	variables: json(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_portal_templates_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "portal_templates_id"}),
	unique("uk_portal_template").on(table.tenantId, table.templateKey, table.templateType),
]);

export const portalUsers = mysqlTable("portal_users", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	portalType: mysqlEnum("portal_type", ['customer','vendor','employee']).notNull(),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	isActive: tinyint("is_active").default(1),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_portal_users_ref").on(table.tenantId, table.portalType, table.referenceId),
	index("idx_portal_users_tenant").on(table.tenantId),
	index("idx_portal_users_type").on(table.portalType),
	primaryKey({ columns: [table.id], name: "portal_users_id"}),
	unique("uk_portal_user").on(table.tenantId, table.portalType, table.email),
]);

export const portfolioMetrics = mysqlTable("portfolio_metrics", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportingDate: date("reporting_date", { mode: 'string' }),
	totalProjects: int("total_projects"),
	activeProjects: int("active_projects"),
	completedProjects: int("completed_projects"),
	onTimeProjects: int("on_time_projects"),
	onBudgetProjects: int("on_budget_projects"),
	totalPortfolioValue: decimal("total_portfolio_value", { precision: 15, scale: 2 }),
	totalSpent: decimal("total_spent", { precision: 15, scale: 2 }),
	portfolioVariancePercent: decimal("portfolio_variance_percent", { precision: 5, scale: 2 }),
	averageProjectHealth: decimal("average_project_health", { precision: 5, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_portfolio_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "portfolio_metrics_id"}),
]);

export const posHolds = mysqlTable("pos_holds", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	holdNumber: varchar("hold_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	items: json().notNull(),
	subtotal: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	status: mysqlEnum(['held','resumed','cancelled']).default('held').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "pos_holds_id"}),
	unique("id").on(table.id),
]);

export const posSessions = mysqlTable("pos_sessions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	branchId: bigint("branch_id", { mode: "number", unsigned: true }),
	status: mysqlEnum(['open','closed','paused']).default('open').notNull(),
	openingBalance: decimal("opening_balance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	closingBalance: decimal("closing_balance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalSales: decimal("total_sales", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalCash: decimal("total_cash", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalCard: decimal("total_card", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalTransfer: decimal("total_transfer", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	openedAt: timestamp("opened_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	closedAt: timestamp("closed_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "pos_sessions_id"}),
	unique("id").on(table.id),
]);

export const posShifts = mysqlTable("pos_shifts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	sessionId: bigint("session_id", { mode: "number", unsigned: true }),
	shiftNumber: varchar("shift_number", { length: 50 }).notNull(),
	openingBalance: decimal("opening_balance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	closingExpected: decimal("closing_expected", { precision: 18, scale: 4 }).default('0.0000'),
	closingActual: decimal("closing_actual", { precision: 18, scale: 4 }).default('0.0000'),
	cashSales: decimal("cash_sales", { precision: 18, scale: 4 }).default('0.0000'),
	cardSales: decimal("card_sales", { precision: 18, scale: 4 }).default('0.0000'),
	transferSales: decimal("transfer_sales", { precision: 18, scale: 4 }).default('0.0000'),
	totalSales: decimal("total_sales", { precision: 18, scale: 4 }).default('0.0000'),
	cashIn: decimal("cash_in", { precision: 18, scale: 4 }).default('0.0000'),
	cashOut: decimal("cash_out", { precision: 18, scale: 4 }).default('0.0000'),
	difference: decimal({ precision: 18, scale: 4 }).default('0.0000'),
	status: mysqlEnum(['open','closed','paused']).default('open').notNull(),
	openedAt: timestamp("opened_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	closedAt: timestamp("closed_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("pos_shifts_tenant_idx").on(table.tenantId),
	index("pos_shifts_user_idx").on(table.userId, table.status),
	primaryKey({ columns: [table.id], name: "pos_shifts_id"}),
	unique("id").on(table.id),
]);

export const ppeIssuance = mysqlTable("ppe_issuance", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
	ppeType: mysqlEnum("ppe_type", ['helmet','vest','gloves','goggles','harness','earplug','mask','boots','full_body']).notNull(),
	quantity: int(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	issueDate: date("issue_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	issuedBy: varchar("issued_by", { length: 255 }),
	condition: varchar("condition_", { length: 100 }),
	returned: tinyint().default(0),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	returnDate: date("return_date", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ppe_issuance_project_idx").on(table.tenantId, table.projectId),
	index("ppe_issuance_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ppe_issuance_id"}),
	unique("id").on(table.id),
]);

export const predictiveAnalytics = mysqlTable("predictive_analytics", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	predictionType: varchar("prediction_type", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	predictedDate: date("predicted_date", { mode: 'string' }),
	delayRiskScore: decimal("delay_risk_score", { precision: 5, scale: 2 }),
	delayRiskLevel: varchar("delay_risk_level", { length: 50 }),
	predictedDelayDays: int("predicted_delay_days"),
	budgetOverrunScore: decimal("budget_overrun_score", { precision: 5, scale: 2 }),
	projectedOverrun: decimal("projected_overrun", { precision: 15, scale: 2 }),
	resourceShortageScore: decimal("resource_shortage_score", { precision: 5, scale: 2 }),
	confidence: decimal({ precision: 5, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("project_id").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "predictive_analytics_id"}),
]);

export const prescriptionItems = mysqlTable("prescription_items", {
	id: serial().notNull(),
	prescriptionId: bigint("prescription_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	dosage: varchar({ length: 255 }),
	frequency: varchar({ length: 255 }),
	durationDays: int("duration_days"),
	quantityPrescribed: int("quantity_prescribed").notNull(),
	quantityDispensed: int("quantity_dispensed").default(0).notNull(),
	instructions: text(),
	isControlled: tinyint("is_controlled").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "prescription_items_id"}),
	unique("id").on(table.id),
]);

export const prescriptions = mysqlTable("prescriptions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	prescriptionNumber: varchar("prescription_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	doctorName: varchar("doctor_name", { length: 255 }),
	doctorLicense: varchar("doctor_license", { length: 100 }),
	clinicName: varchar("clinic_name", { length: 255 }),
	diagnosis: text(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dateIssued: date("date_issued", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dateExpires: date("date_expires", { mode: 'string' }),
	isControlledSubstance: tinyint("is_controlled_substance").default(0).notNull(),
	controlledSubstanceLicense: varchar("controlled_substance_license", { length: 100 }),
	status: mysqlEnum(['active','dispensed','partial','expired','cancelled']).default('active').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("prescriptions_customer_idx").on(table.customerId),
	index("prescriptions_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "prescriptions_id"}),
	unique("id").on(table.id),
]);

export const prescriptionsDetail = mysqlTable("prescriptions_detail", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
	prescriptionNumber: varchar("prescription_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	prescriptionDate: date("prescription_date", { mode: 'string' }).notNull(),
	doctorId: bigint("doctor_id", { mode: "number", unsigned: true }).notNull(),
	medicationName: varchar("medication_name", { length: 255 }).notNull(),
	medicationCode: varchar("medication_code", { length: 100 }),
	genericName: varchar("generic_name", { length: 255 }),
	strength: varchar({ length: 50 }),
	dosageForm: varchar("dosage_form", { length: 50 }),
	route: varchar({ length: 50 }),
	dosage: varchar({ length: 100 }).notNull(),
	frequency: varchar({ length: 100 }).notNull(),
	duration: varchar({ length: 100 }),
	durationDays: int("duration_days"),
	quantity: int().notNull(),
	refills: int().default(0),
	instructions: text(),
	indicationsForUse: text("indications_for_use"),
	warnings: text(),
	isControlledSubstance: tinyint("is_controlled_substance").default(0),
	controlledSubstanceSchedule: varchar("controlled_substance_schedule", { length: 10 }),
	substitutionAllowed: tinyint("substitution_allowed").default(1),
	status: mysqlEnum(['active','dispensed','partial','discontinued','expired','cancelled']).default('active'),
	dispensedAt: timestamp("dispensed_at", { mode: 'string' }),
	dispensedBy: bigint("dispensed_by", { mode: "number", unsigned: true }),
	dispensedQuantity: int("dispensed_quantity"),
	pharmacyNotes: text("pharmacy_notes"),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("prescriptions_detail_patient_idx").on(table.patientId),
	index("prescriptions_detail_status_idx").on(table.status),
	index("prescriptions_detail_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "prescriptions_detail_id"}),
	unique("id").on(table.id),
	unique("prescription_number").on(table.prescriptionNumber),
]);

export const priceTierBreaks = mysqlTable("price_tier_breaks", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	priceTierId: bigint("price_tier_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	categoryId: bigint("category_id", { mode: "number", unsigned: true }),
	minQuantity: int("min_quantity").default(1).notNull(),
	maxQuantity: int("max_quantity"),
	unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "price_tier_breaks_id"}),
	unique("id").on(table.id),
]);

export const priceTiers = mysqlTable("price_tiers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	tierType: mysqlEnum("tier_type", ['quantity_break','customer_group','trade_discount']).default('quantity_break').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("price_tiers_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "price_tiers_id"}),
	unique("id").on(table.id),
]);

export const printTemplates = mysqlTable("print_templates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: mysqlEnum(['invoice_a4','receipt_80mm','receipt_58mm','quotation','delivery_note']).notNull(),
	content: text().notNull(),
	isDefault: tinyint("is_default").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "print_templates_id"}),
	unique("id").on(table.id),
]);

export const productCategories = mysqlTable("product_categories", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	parentId: bigint("parent_id", { mode: "number", unsigned: true }),
	description: text(),
	image: mediumtext(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "product_categories_id"}),
	unique("id").on(table.id),
]);

export const productionItems = mysqlTable("production_items", {
	id: serial().notNull(),
	productionOrderId: bigint("production_order_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: int().notNull(),
	unitCost: decimal("unit_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "production_items_id"}),
	unique("id").on(table.id),
]);

export const productionOrders = mysqlTable("production_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	poNumber: varchar("po_number", { length: 50 }).notNull(),
	workOrderId: bigint("work_order_id", { mode: "number", unsigned: true }),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	status: mysqlEnum(['draft','in_progress','completed','cancelled']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "production_orders_id"}),
	unique("id").on(table.id),
]);

export const products = mysqlTable("products", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	sku: varchar({ length: 100 }),
	barcode: varchar({ length: 100 }),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	description: text(),
	brandId: bigint("brand_id", { mode: "number", unsigned: true }),
	qrCode: varchar("qr_code", { length: 255 }),
	productType: mysqlEnum("product_type", ['goods','service','raw_material','finished_good']).default('goods').notNull(),
	categoryId: bigint("category_id", { mode: "number", unsigned: true }),
	unitId: bigint("unit_id", { mode: "number", unsigned: true }),
	unitName: varchar("unit_name", { length: 50 }).default('Piece'),
	salePrice: decimal("sale_price", { precision: 15, scale: 2 }).default('0.00'),
	costPrice: decimal("cost_price", { precision: 15, scale: 2 }).default('0.00'),
	purchasePrice: decimal("purchase_price", { precision: 18, scale: 4 }),
	costMethod: mysqlEnum("cost_method", ['fifo','lifo','weighted_average']).default('weighted_average').notNull(),
	reorderLevel: int("reorder_level"),
	reorderQuantity: int("reorder_quantity"),
	isTaxable: tinyint("is_taxable").default(1).notNull(),
	weight: decimal({ precision: 10, scale: 4 }),
	dimensions: varchar({ length: 100 }),
	image: mediumtext(),
	taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('15.00'),
	taxCategory: mysqlEnum("tax_category", ['standard','zero_rated','exempt','out_of_scope']).default('standard'),
	stockQuantity: decimal("stock_quantity", { precision: 15, scale: 3 }).default('0.000'),
	minStockLevel: decimal("min_stock_level", { precision: 15, scale: 3 }).default('0.000'),
	isService: tinyint("is_service").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	localUuid: varchar("local_uuid", { length: 255 }),
	version: int().default(1),
	serverId: bigint("server_id", { mode: "number", unsigned: true }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
},
(table) => [
	index("idx_barcode").on(table.barcode),
	index("idx_sku").on(table.sku),
	index("idx_tenant").on(table.tenantId),
	index("prod_luuid_idx").on(table.localUuid),
	index("prod_sku_idx").on(table.sku),
	index("prod_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "products_id"}),
]);

export const progressBilling = mysqlTable("progress_billing", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
	milestoneName: varchar("milestone_name", { length: 255 }),
	billingPeriod: varchar("billing_period", { length: 50 }),
	percentageComplete: decimal("percentage_complete", { precision: 5, scale: 2 }).default('0.00').notNull(),
	billedAmount: decimal("billed_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default('10.00').notNull(),
	retentionAmount: decimal("retention_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	status: mysqlEnum(['draft','submitted','approved','paid','partial','disputed']).default('draft').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("progress_billing_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "progress_billing_id"}),
	unique("id").on(table.id),
]);

export const projectMilestones = mysqlTable("project_milestones", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	deliverables: text(),
	status: mysqlEnum(['pending','completed','overdue']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "project_milestones_id"}),
	unique("id").on(table.id),
]);

export const projectTasks = mysqlTable("project_tasks", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	parentId: bigint("parent_id", { mode: "number", unsigned: true }),
	taskCode: varchar("task_code", { length: 50 }),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
	actualHours: decimal("actual_hours", { precision: 8, scale: 2 }).default('0.00').notNull(),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	status: mysqlEnum(['todo','in_progress','review','done','cancelled']).default('todo').notNull(),
	progress: int().default(0),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "project_tasks_id"}),
	unique("id").on(table.id),
]);

export const projects = mysqlTable("projects", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectCode: varchar("project_code", { length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	managerId: bigint("manager_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	budget: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	status: mysqlEnum(['planning','active','on_hold','completed','cancelled']).default('planning').notNull(),
	progress: int().default(0),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "projects_id"}),
	unique("id").on(table.id),
]);

export const properties = mysqlTable("properties", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	propertyCode: varchar("property_code", { length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	propertyType: mysqlEnum("property_type", ['residential','commercial','industrial','land','mixed_use']).default('residential').notNull(),
	address: text(),
	city: varchar({ length: 100 }),
	district: varchar({ length: 100 }),
	areaSize: decimal("area_size", { precision: 12, scale: 2 }),
	areaUnit: varchar("area_unit", { length: 20 }).default('sqm').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	purchaseDate: date("purchase_date", { mode: 'string' }),
	purchaseCost: decimal("purchase_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	currentValue: decimal("current_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	propertyTax: decimal("property_tax", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("properties_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "properties_id"}),
	unique("id").on(table.id),
]);

export const propertyUnits = mysqlTable("property_units", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	propertyId: bigint("property_id", { mode: "number", unsigned: true }).notNull(),
	unitNumber: varchar("unit_number", { length: 50 }).notNull(),
	floor: varchar({ length: 50 }),
	bedrooms: int().default(0).notNull(),
	bathrooms: int().default(0).notNull(),
	areaSize: decimal("area_size", { precision: 12, scale: 2 }),
	monthlyRent: decimal("monthly_rent", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	securityDeposit: decimal("security_deposit", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['vacant','occupied','maintenance','reserved']).default('vacant').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("property_units_property_idx").on(table.propertyId),
	index("property_units_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "property_units_id"}),
	unique("id").on(table.id),
]);

export const punchLists = mysqlTable("punch_lists", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	punchNumber: varchar("punch_number", { length: 100 }),
	area: varchar({ length: 255 }),
	trade: varchar({ length: 100 }),
	itemDescription: text("item_description"),
	priority: varchar({ length: 50 }),
	locationDescription: text("location_description"),
	photoReference: text("photo_reference"),
	status: varchar({ length: 50 }).default('Open'),
	assignedTo: int("assigned_to"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	createdDate: date("created_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	targetDate: date("target_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	completedDate: date("completed_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_punch_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "punch_lists_id"}),
]);

export const purchaseOrderItems = mysqlTable("purchase_order_items", {
	id: serial().notNull(),
	poId: bigint("po_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	description: text(),
	quantity: int().notNull(),
	receivedQty: int("received_qty").default(0),
	unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default('15.00').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "purchase_order_items_id"}),
	unique("id").on(table.id),
]);

export const purchaseOrders = mysqlTable("purchase_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	poNumber: varchar("po_number", { length: 50 }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expectedDelivery: date("expected_delivery", { mode: 'string' }),
	subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	terms: text(),
	status: mysqlEnum(['draft','sent','partial','received','cancelled','invoiced']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "purchase_orders_id"}),
	unique("id").on(table.id),
]);

export const putawayRules = mysqlTable("putaway_rules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	ruleName: varchar("rule_name", { length: 255 }).notNull(),
	priority: int().default(0).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	productCategoryId: bigint("product_category_id", { mode: "number", unsigned: true }),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	zoneId: bigint("zone_id", { mode: "number", unsigned: true }),
	strategy: mysqlEnum(['fixed','first_empty','near_expiry','fifo','random','last_location']).notNull(),
	isDefault: tinyint("is_default").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("pr_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "putaway_rules_id"}),
	unique("id").on(table.id),
]);

export const putawayTasks = mysqlTable("putaway_tasks", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	taskNumber: varchar("task_number", { length: 50 }).notNull(),
	sourceType: mysqlEnum("source_type", ['purchase','return','transfer_in','manufacturing']).notNull(),
	sourceId: bigint("source_id", { mode: "number", unsigned: true }),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	fromLocationId: bigint("from_location_id", { mode: "number", unsigned: true }),
	toLocationId: bigint("to_location_id", { mode: "number", unsigned: true }),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	status: mysqlEnum(['pending','in_progress','completed','cancelled']).default('pending').notNull(),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
},
(table) => [
	index("pt_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "putaway_tasks_id"}),
	unique("id").on(table.id),
]);

export const qiwaComparisonLogs = mysqlTable("qiwa_comparison_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
	comparisonType: mysqlEnum("comparison_type", ['salary','allowance','contract','all']).notNull(),
	expectedValue: text("expected_value"),
	actualValue: text("actual_value"),
	difference: varchar({ length: 255 }),
	isMatch: tinyint("is_match").default(1).notNull(),
	checkedAt: timestamp("checked_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("qiwa_log_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "qiwa_comparison_logs_id"}),
]);

export const qiwaContracts = mysqlTable("qiwa_contracts", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	qiwaContractId: varchar("qiwa_contract_id", { length: 100 }),
	contractType: mysqlEnum("contract_type", ['full_time','part_time','temporary','probation']).default('full_time'),
	basicSalary: decimal("basic_salary", { precision: 18, scale: 4 }).default('0.0000'),
	housingAllowance: decimal("housing_allowance", { precision: 18, scale: 4 }).default('0.0000'),
	transportAllowance: decimal("transport_allowance", { precision: 18, scale: 4 }).default('0.0000'),
	otherAllowances: decimal("other_allowances", { precision: 18, scale: 4 }).default('0.0000'),
	totalSalary: decimal("total_salary", { precision: 18, scale: 4 }).default('0.0000'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
	isMatched: tinyint("is_matched").default(1).notNull(),
	mismatchDetails: text("mismatch_details"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "qiwa_contracts_id"}),
	unique("qiwa_contract_emp_idx").on(table.tenantId, table.employeeId),
]);

export const qiwaIntegration = mysqlTable("qiwa_integration", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	qiwaOrgId: text("qiwa_org_id").notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token"),
	tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }).notNull(),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	syncStatus: varchar("sync_status", { length: 100 }).default('pending'),
	syncError: text("sync_error"),
	autoSyncEnabled: tinyint("auto_sync_enabled").default(1),
	syncIntervalMinutes: int("sync_interval_minutes").default(60),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "qiwa_integration_id"}),
	unique("tenant_id").on(table.tenantId),
]);

export const qrOrderSessions = mysqlTable("qr_order_sessions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	restaurantTableId: bigint("restaurant_table_id", { mode: "number", unsigned: true }),
	sessionToken: varchar("session_token", { length: 255 }).notNull(),
	deviceId: varchar("device_id", { length: 255 }),
	status: mysqlEnum(['active','ordered','paid','expired','cancelled']).default('active').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("qr_order_sessions_table_idx").on(table.restaurantTableId),
	primaryKey({ columns: [table.id], name: "qr_order_sessions_id"}),
	unique("id").on(table.id),
	unique("session_token").on(table.sessionToken),
]);

export const qualityBlockedStocks = mysqlTable("quality_blocked_stocks", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	batchNumber: varchar("batch_number", { length: 100 }),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	reason: mysqlEnum(['qc_fail','ncr_open','capa_pending','quarantine','hold']).notNull(),
	inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }),
	ncrId: bigint("ncr_id", { mode: "number", unsigned: true }),
	isReleased: tinyint("is_released").default(0),
	releasedBy: bigint("released_by", { mode: "number", unsigned: true }),
	releasedAt: timestamp("released_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("qc_blocked_product_idx").on(table.tenantId, table.productId, table.warehouseId),
	index("qc_blocked_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "quality_blocked_stocks_id"}),
	unique("id").on(table.id),
]);

export const qualityInspectionLines = mysqlTable("quality_inspection_lines", {
	id: serial().notNull(),
	inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }).notNull(),
	templateLineId: bigint("template_line_id", { mode: "number", unsigned: true }).notNull(),
	resultValue: varchar("result_value", { length: 255 }),
	resultStatus: mysqlEnum("result_status", ['pass','fail','na']).default('na').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("qc_inspection_lines_inspection_idx").on(table.inspectionId),
	primaryKey({ columns: [table.id], name: "quality_inspection_lines_id"}),
	unique("id").on(table.id),
]);

export const qualityInspectionTemplateLines = mysqlTable("quality_inspection_template_lines", {
	id: serial().notNull(),
	templateId: bigint("template_id", { mode: "number", unsigned: true }).notNull(),
	checkpointName: varchar("checkpoint_name", { length: 255 }).notNull(),
	checkpointType: mysqlEnum("checkpoint_type", ['visual','dimensional','functional','chemical','microbiological','other']).default('visual').notNull(),
	specificationMin: decimal("specification_min", { precision: 18, scale: 4 }),
	specificationMax: decimal("specification_max", { precision: 18, scale: 4 }),
	specificationText: text("specification_text"),
	isCritical: tinyint("is_critical").default(0),
	sortOrder: int("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("qc_template_lines_template_idx").on(table.templateId),
	primaryKey({ columns: [table.id], name: "quality_inspection_template_lines_id"}),
	unique("id").on(table.id),
]);

export const qualityInspectionTemplates = mysqlTable("quality_inspection_templates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	appliesTo: mysqlEnum("applies_to", ['incoming_material','in_process','final','outgoing']).default('incoming_material').notNull(),
	isActive: tinyint("is_active").default(1),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("qc_templates_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "quality_inspection_templates_id"}),
	unique("id").on(table.id),
]);

export const qualityInspections = mysqlTable("quality_inspections", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	templateId: bigint("template_id", { mode: "number", unsigned: true }).notNull(),
	referenceType: mysqlEnum("reference_type", ['purchase_order','goods_receipt','work_order','production_order','sales_order','other']).notNull(),
	referenceId: bigint("reference_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	batchNumber: varchar("batch_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	inspectionDate: date("inspection_date", { mode: 'string' }).notNull(),
	inspectedBy: bigint("inspected_by", { mode: "number", unsigned: true }),
	overallResult: mysqlEnum("overall_result", ['pass','fail','rework','pending']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("qc_inspections_product_idx").on(table.tenantId, table.productId),
	index("qc_inspections_ref_idx").on(table.tenantId, table.referenceType, table.referenceId),
	index("qc_inspections_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "quality_inspections_id"}),
	unique("id").on(table.id),
]);

export const regions = mysqlTable("regions", {
	id: serial().notNull(),
	countryCode: varchar("country_code", { length: 2 }).notNull(),
	code: varchar({ length: 10 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	taxProfile: varchar("tax_profile", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "regions_id"}),
	unique("id").on(table.id),
]);

export const rentInvoices = mysqlTable("rent_invoices", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	leaseId: bigint("lease_id", { mode: "number", unsigned: true }).notNull(),
	unitId: bigint("unit_id", { mode: "number", unsigned: true }).notNull(),
	invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	rentAmount: decimal("rent_amount", { precision: 18, scale: 4 }).notNull(),
	lateFee: decimal("late_fee", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paidDate: date("paid_date", { mode: 'string' }),
	status: mysqlEnum(['pending','paid','partial','overdue','cancelled']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("rent_invoices_lease_idx").on(table.leaseId),
	index("rent_invoices_status_idx").on(table.tenantId, table.status),
	index("rent_invoices_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "rent_invoices_id"}),
	unique("id").on(table.id),
]);

export const reportCards = mysqlTable("report_cards", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
	academicYear: varchar("academic_year", { length: 20 }).notNull(),
	term: varchar({ length: 50 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	score: decimal({ precision: 8, scale: 2 }),
	grade: varchar({ length: 10 }),
	remarks: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("report_cards_student_idx").on(table.studentId),
	index("report_cards_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "report_cards_id"}),
	unique("id").on(table.id),
]);

export const reportSchedules = mysqlTable("report_schedules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	reportTemplateId: bigint("report_template_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	frequency: varchar({ length: 50 }).notNull(),
	cronExpression: varchar("cron_expression", { length: 100 }),
	dayOfWeek: int("day_of_week"),
	dayOfMonth: int("day_of_month"),
	timeOfDay: varchar("time_of_day", { length: 10 }).default('08:00'),
	format: varchar({ length: 50 }).default('pdf'),
	recipientEmails: json("recipient_emails"),
	lastSentAt: timestamp("last_sent_at", { mode: 'string' }),
	nextRunAt: timestamp("next_run_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("report_schedules_next_run_idx").on(table.nextRunAt),
	index("report_schedules_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "report_schedules_id"}),
	unique("id").on(table.id),
]);

export const reportTemplates = mysqlTable("report_templates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	module: varchar({ length: 100 }),
	columnsConfig: json("columns_config"),
	filtersConfig: json("filters_config"),
	sortConfig: json("sort_config"),
	groupConfig: json("group_config"),
	aggregations: json(),
	chartConfig: json("chart_config"),
	isFavorite: tinyint("is_favorite").default(0),
	isPublic: tinyint("is_public").default(0),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("report_templates_module_idx").on(table.tenantId, table.module),
	index("report_templates_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "report_templates_id"}),
	unique("id").on(table.id),
]);

export const resellerKeyLimits = mysqlTable("reseller_key_limits", {
	id: serial().notNull(),
	resellerUserId: bigint("reseller_user_id", { mode: "number", unsigned: true }).notNull(),
	maxKeys: int("max_keys").default(0).notNull(),
	keysUsed: int("keys_used").default(0).notNull(),
	setBy: bigint("set_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "reseller_key_limits_id"}),
	unique("id").on(table.id),
]);

export const resellerLicenseKeys = mysqlTable("reseller_license_keys", {
	id: serial().notNull(),
	resellerUserId: bigint("reseller_user_id", { mode: "number", unsigned: true }).notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	licenseKey: varchar("license_key", { length: 255 }).notNull(),
	licenseKeyHash: varchar("license_key_hash", { length: 128 }).notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	plan: varchar({ length: 50 }).default('standard').notNull(),
	maxUsers: int("max_users").default(5).notNull(),
	maxDevices: int("max_devices").default(1).notNull(),
	status: mysqlEnum(['pending','approved','rejected','active','expired','revoked']).default('pending').notNull(),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	rejectedReason: text("rejected_reason"),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("reseller_license_reseller_idx").on(table.resellerUserId),
	index("reseller_license_status_idx").on(table.status),
	index("reseller_license_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "reseller_license_keys_id"}),
	unique("id").on(table.id),
	unique("reseller_license_keys_license_key_hash_unique").on(table.licenseKeyHash),
	unique("reseller_license_keys_license_key_unique").on(table.licenseKey),
]);

export const resellerPayouts = mysqlTable("reseller_payouts", {
	id: int().autoincrement().notNull(),
	resellerId: int("reseller_id").notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }),
	totalCommission: decimal("total_commission", { precision: 10, scale: 2 }),
	status: mysqlEnum(['pending','processing','paid','cancelled']).default('pending'),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentReference: varchar("payment_reference", { length: 255 }),
	notes: text(),
	details: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_period").on(table.periodStart, table.periodEnd),
	index("idx_reseller").on(table.resellerId),
	index("idx_status").on(table.status),
	primaryKey({ columns: [table.id], name: "reseller_payouts_id"}),
]);

export const resellerTenants = mysqlTable("reseller_tenants", {
	id: int().autoincrement().notNull(),
	resellerId: int("reseller_id").notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
	commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
	startedAt: timestamp("started_at", { mode: 'string' }),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_reseller").on(table.resellerId),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "reseller_tenants_id"}),
	unique("unique_reseller_tenant").on(table.resellerId, table.tenantId),
]);

export const resellers = mysqlTable("resellers", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	companyName: varchar("company_name", { length: 255 }),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default('10.00'),
	whiteLabelEnabled: tinyint("white_label_enabled").default(0),
	customDomain: varchar("custom_domain", { length: 255 }),
	logoUrl: text("logo_url"),
	faviconUrl: text("favicon_url"),
	primaryColor: varchar("primary_color", { length: 20 }),
	secondaryColor: varchar("secondary_color", { length: 20 }),
	status: mysqlEnum(['active','suspended','inactive']).default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_email").on(table.email),
	index("idx_status").on(table.status),
	primaryKey({ columns: [table.id], name: "resellers_id"}),
	unique("email").on(table.email),
]);

export const restaurantTables = mysqlTable("restaurant_tables", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	floorPlanId: bigint("floor_plan_id", { mode: "number", unsigned: true }).notNull(),
	tableNumber: varchar("table_number", { length: 20 }).notNull(),
	name: varchar({ length: 255 }),
	nameAr: varchar("name_ar", { length: 255 }),
	capacity: int().default(4).notNull(),
	shape: mysqlEnum(['rectangle','circle','square']).default('rectangle').notNull(),
	posX: int("pos_x").default(0).notNull(),
	posY: int("pos_y").default(0).notNull(),
	width: int().default(80).notNull(),
	height: int().default(60).notNull(),
	rotation: int().default(0).notNull(),
	status: mysqlEnum(['vacant','occupied','ordered','served','paid','reserved','cleaning']).default('vacant').notNull(),
	waiterId: bigint("waiter_id", { mode: "number", unsigned: true }),
	currentOrderId: bigint("current_order_id", { mode: "number", unsigned: true }),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("restaurant_tables_plan_idx").on(table.floorPlanId),
	index("restaurant_tables_status_idx").on(table.tenantId, table.status),
	primaryKey({ columns: [table.id], name: "restaurant_tables_id"}),
	unique("id").on(table.id),
]);

export const retentionAccounts = mysqlTable("retention_accounts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }),
	totalRetention: decimal("total_retention", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	releasedAmount: decimal("released_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expectedReleaseDate: date("expected_release_date", { mode: 'string' }),
	status: mysqlEnum(['held','partial_release','released']).default('held').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("retention_accounts_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "retention_accounts_id"}),
	unique("id").on(table.id),
]);

export const revenueRecognitionSchedules = mysqlTable("revenue_recognition_schedules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	obligationId: bigint("obligation_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	scheduledDate: date("scheduled_date", { mode: 'string' }).notNull(),
	recognizedAmount: decimal("recognized_amount", { precision: 18, scale: 2 }).default('0.00'),
	cumulativeAmount: decimal("cumulative_amount", { precision: 18, scale: 2 }).default('0.00'),
	recognitionMethod: mysqlEnum("recognition_method", ['output','input','straight_line']).default('straight_line'),
	status: mysqlEnum(['scheduled','recognized','skipped']).default('scheduled').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("rev_rec_sched_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "revenue_recognition_schedules_id"}),
	unique("id").on(table.id),
]);

export const rfiRequests = mysqlTable("rfi_requests", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	rfiNumber: varchar("rfi_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	issuedDate: date("issued_date", { mode: 'string' }),
	question: text(),
	backgroundInfo: text("background_info"),
	drawingsReference: text("drawings_reference"),
	submittedBy: int("submitted_by"),
	submittedTo: int("submitted_to"),
	responseText: text("response_text"),
	respondedBy: int("responded_by"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	responseDate: date("response_date", { mode: 'string' }),
	status: varchar({ length: 50 }).default('Submitted'),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("project_id").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "rfi_requests_id"}),
	unique("rfi_number").on(table.rfiNumber),
]);

export const rfqHeaders = mysqlTable("rfq_headers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	rfqNumber: varchar("rfq_number", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deadlineDate: date("deadline_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expectedDeliveryDate: date("expected_delivery_date", { mode: 'string' }),
	buyerId: bigint("buyer_id", { mode: "number", unsigned: true }),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	status: mysqlEnum(['draft','sent','received','evaluated','closed','cancelled']).default('draft').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("rfq_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "rfq_headers_id"}),
	unique("id").on(table.id),
]);

export const rfqItems = mysqlTable("rfq_items", {
	id: serial().notNull(),
	rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	productName: varchar("product_name", { length: 255 }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	unit: varchar({ length: 50 }),
	targetPrice: decimal("target_price", { precision: 18, scale: 4 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "rfq_items_id"}),
	unique("id").on(table.id),
]);

export const rfqQuoteLines = mysqlTable("rfq_quote_lines", {
	id: serial().notNull(),
	quoteId: bigint("quote_id", { mode: "number", unsigned: true }).notNull(),
	rfqItemId: bigint("rfq_item_id", { mode: "number", unsigned: true }).notNull(),
	unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).notNull(),
	totalPrice: decimal("total_price", { precision: 18, scale: 4 }).notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deliveryDate: date("delivery_date", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "rfq_quote_lines_id"}),
	unique("id").on(table.id),
]);

export const rfqSupplierQuotes = mysqlTable("rfq_supplier_quotes", {
	id: serial().notNull(),
	rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	submittedDate: timestamp("submitted_date", { mode: 'string' }).default(sql`(now())`).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	validUntil: date("valid_until", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deliveryDate: date("delivery_date", { mode: 'string' }),
	paymentTerms: varchar("payment_terms", { length: 255 }),
	notes: text(),
	status: mysqlEnum(['draft','submitted','withdrawn']).default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "rfq_supplier_quotes_id"}),
	unique("id").on(table.id),
]);

export const rightOfUseAssets = mysqlTable("right_of_use_assets", {
	id: serial().notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
	assetCode: varchar("asset_code", { length: 100 }),
	assetName: varchar("asset_name", { length: 255 }).notNull(),
	category: varchar({ length: 100 }),
	cost: decimal({ precision: 18, scale: 2 }).default('0.00'),
	accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 18, scale: 2 }).default('0.00'),
	depreciationMethod: mysqlEnum("depreciation_method", ['straight_line','declining']).default('straight_line'),
	usefulLifeMonths: int("useful_life_months"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	depreciationStartDate: date("depreciation_start_date", { mode: 'string' }),
	netBookValue: decimal("net_book_value", { precision: 18, scale: 2 }).default('0.00'),
	impairmentLoss: decimal("impairment_loss", { precision: 18, scale: 2 }).default('0.00'),
	status: mysqlEnum(['active','fully_depreciated','disposed']).default('active').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("rou_assets_contract_idx").on(table.contractId),
	primaryKey({ columns: [table.id], name: "right_of_use_assets_id"}),
	unique("id").on(table.id),
]);

export const roles = mysqlTable("roles", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	permissions: json(),
	isSystem: tinyint("is_system").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "roles_id"}),
	unique("id").on(table.id),
]);

export const roomInventory = mysqlTable("room_inventory", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	roomTypeId: bigint("room_type_id", { mode: "number", unsigned: true }).notNull(),
	roomNumber: varchar("room_number", { length: 50 }).notNull(),
	floor: varchar({ length: 50 }),
	status: mysqlEnum(['available','occupied','maintenance','reserved','cleaning']).default('available').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("room_inventory_tenant_idx").on(table.tenantId),
	index("room_inventory_type_idx").on(table.roomTypeId),
	primaryKey({ columns: [table.id], name: "room_inventory_id"}),
	unique("id").on(table.id),
]);

export const roomTypes = mysqlTable("room_types", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	description: text(),
	basePrice: decimal("base_price", { precision: 18, scale: 4 }).notNull(),
	maxOccupancy: int("max_occupancy").default(2).notNull(),
	numberOfRooms: int("number_of_rooms").default(1).notNull(),
	amenities: json(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("room_types_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "room_types_id"}),
	unique("id").on(table.id),
]);

export const roughCutCapacityPlans = mysqlTable("rough_cut_capacity_plans", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	resourceId: bigint("resource_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	availableCapacity: decimal("available_capacity", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	requiredCapacity: decimal("required_capacity", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	overloadPercent: decimal("overload_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	status: mysqlEnum(['draft','confirmed','adjusted']).default('draft').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("rccp_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "rough_cut_capacity_plans_id"}),
	unique("id").on(table.id),
]);

export const routePlanning = mysqlTable("route_planning", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	routeId: bigint("route_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
	driverId: bigint("driver_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	plannedDate: date("planned_date", { mode: 'string' }).notNull(),
	departureTime: varchar("departure_time", { length: 10 }),
	arrivalTime: varchar("arrival_time", { length: 10 }),
	status: mysqlEnum(['planned','in_transit','completed','cancelled']).default('planned').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("route_planning_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "route_planning_id"}),
	unique("id").on(table.id),
]);

export const routes = mysqlTable("routes", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	routeCode: varchar("route_code", { length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	origin: varchar({ length: 255 }).notNull(),
	destination: varchar({ length: 255 }).notNull(),
	distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
	estimatedDuration: varchar("estimated_duration", { length: 50 }),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("routes_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "routes_id"}),
	unique("id").on(table.id),
]);

export const safetyTraining = mysqlTable("safety_training", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
	trainingName: varchar("training_name", { length: 255 }).notNull(),
	trainingProvider: varchar("training_provider", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	trainingDate: date("training_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	certificateNumber: varchar("certificate_number", { length: 100 }),
	certificateFile: varchar("certificate_file", { length: 255 }),
	trainingType: mysqlEnum("training_type", ['induction','specialized','refresher','emergency']),
	status: mysqlEnum(['completed','expired','pending']).default('pending').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("safety_training_project_idx").on(table.tenantId, table.projectId),
	index("safety_training_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "safety_training_id"}),
	unique("id").on(table.id),
]);

export const salarySlips = mysqlTable("salary_slips", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	payrollPeriodId: bigint("payroll_period_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	basicSalary: decimal("basic_salary", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	housingAllowance: decimal("housing_allowance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	transportAllowance: decimal("transport_allowance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	otherAllowances: decimal("other_allowances", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	overtimePay: decimal("overtime_pay", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	grossSalary: decimal("gross_salary", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxDeduction: decimal("tax_deduction", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	socialInsurance: decimal("social_insurance", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	loanDeduction: decimal("loan_deduction", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	advanceDeduction: decimal("advance_deduction", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	otherDeductions: decimal("other_deductions", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalDeductions: decimal("total_deductions", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	netSalary: decimal("net_salary", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['draft','approved','paid']).default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "salary_slips_id"}),
	unique("id").on(table.id),
]);

export const salesOrderItems = mysqlTable("sales_order_items", {
	id: serial().notNull(),
	orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	description: text(),
	quantity: int().notNull(),
	deliveredQty: int("delivered_qty").default(0),
	unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default('15.00').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sales_order_items_id"}),
	unique("id").on(table.id),
]);

export const salesOrders = mysqlTable("sales_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	orderNumber: varchar("order_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	quotationId: bigint("quotation_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deliveryDate: date("delivery_date", { mode: 'string' }),
	subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	status: mysqlEnum(['draft','confirmed','processing','shipped','delivered','cancelled','invoiced']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sales_orders_id"}),
	unique("id").on(table.id),
]);

export const salesQuotationItems = mysqlTable("sales_quotation_items", {
	id: serial().notNull(),
	quotationId: bigint("quotation_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }),
	description: text(),
	quantity: int().notNull(),
	unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default('15.00').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sales_quotation_items_id"}),
	unique("id").on(table.id),
]);

export const salesQuotations = mysqlTable("sales_quotations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	quotationNumber: varchar("quotation_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default('15.00').notNull(),
	shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	terms: text(),
	status: mysqlEnum(['draft','sent','accepted','rejected','expired','converted']).default('draft').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sales_quotations_id"}),
	unique("id").on(table.id),
]);

export const salonAppointments = mysqlTable("salon_appointments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	clientName: varchar("client_name", { length: 255 }).notNull(),
	clientPhone: varchar("client_phone", { length: 50 }).notNull(),
	service: varchar({ length: 255 }).notNull(),
	stylistName: varchar("stylist_name", { length: 255 }).notNull(),
	time: varchar({ length: 50 }).notNull(),
	status: mysqlEnum(['scheduled','in-service','completed','cancelled']).default('scheduled').notNull(),
	price: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("salon_appointments_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "salon_appointments_id"}),
	unique("id").on(table.id),
]);

export const sbcCompliance = mysqlTable("sbc_compliance", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	sbcCode: varchar("sbc_code", { length: 50 }).notNull(),
	description: text(),
	complianceRequired: tinyint("compliance_required").default(1),
	complianceStatus: mysqlEnum("compliance_status", ['compliant','non_compliant','not_applicable','pending_review']).default('pending_review').notNull(),
	inspectorName: varchar("inspector_name", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	inspectionDate: date("inspection_date", { mode: 'string' }),
	certificateNumber: varchar("certificate_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	certificateExpiryDate: date("certificate_expiry_date", { mode: 'string' }),
	nonComplianceNotes: text("non_compliance_notes"),
	correctiveActions: text("corrective_actions"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	correctiveActionDate: date("corrective_action_date", { mode: 'string' }),
	status: mysqlEnum(['active','expired']).default('active').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("sbc_compliance_project_idx").on(table.tenantId, table.projectId),
	index("sbc_compliance_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "sbc_compliance_id"}),
	unique("id").on(table.id),
]);

export const scaClassification = mysqlTable("sca_classification", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	entityName: varchar("entity_name", { length: 255 }).notNull(),
	entityType: mysqlEnum("entity_type", ['contractor','consultant','supplier']).notNull(),
	scaRegistrationNumber: varchar("sca_registration_number", { length: 100 }),
	classificationGrade: mysqlEnum("classification_grade", ['first','second','third','fourth','fifth']),
	specialization: varchar({ length: 255 }),
	maxProjectValue: decimal("max_project_value", { precision: 18, scale: 4 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	status: mysqlEnum(['active','suspended','expired']).default('active').notNull(),
	verificationStatus: mysqlEnum("verification_status", ['unverified','verified','rejected']).default('unverified').notNull(),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("sca_classification_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "sca_classification_id"}),
	unique("id").on(table.id),
]);

export const securityIncidents = mysqlTable("security_incidents", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	incidentType: mysqlEnum("incident_type", ['data_breach','unauthorized_access','malware','phishing','ddos','insider_threat','physical_breach','policy_violation','other']).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium').notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	detectedAt: timestamp("detected_at", { mode: 'string' }).defaultNow().notNull(),
	detectedBy: bigint("detected_by", { mode: "number", unsigned: true }),
	affectedData: json("affected_data"),
	affectedUsers: int("affected_users").default(0),
	rootCause: text("root_cause"),
	resolution: text(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	resolvedBy: bigint("resolved_by", { mode: "number", unsigned: true }),
	status: mysqlEnum(['open','investigating','contained','resolved','closed']).default('open').notNull(),
	notifiedAuthority: tinyint("notified_authority").default(0).notNull(),
	notifiedAt: timestamp("notified_at", { mode: 'string' }),
	authorityReference: varchar("authority_reference", { length: 255 }),
	notifiedAffected: tinyint("notified_affected").default(0).notNull(),
	lessonsLearned: text("lessons_learned"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("sec_inc_severity_idx").on(table.severity),
	index("sec_inc_status_idx").on(table.status),
	index("sec_inc_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "security_incidents_id"}),
]);

export const securityLogs = mysqlTable("security_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	eventType: varchar("event_type", { length: 100 }).notNull(),
	severity: mysqlEnum(['info','warning','critical']).default('info').notNull(),
	ipAddress: varchar("ip_address", { length: 100 }),
	userAgent: text("user_agent"),
	details: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "security_logs_id"}),
	unique("id").on(table.id),
]);

export const serviceReminders = mysqlTable("service_reminders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	reminderType: mysqlEnum("reminder_type", ['scheduled_maintenance','oil_change','tire_rotation','inspection','registration_renewal','insurance_renewal','warranty_expiry','custom']).notNull(),
	serviceTitle: varchar("service_title", { length: 255 }).notNull(),
	serviceDescription: text("service_description"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	dueMileage: int("due_mileage"),
	currentMileage: int("current_mileage"),
	reminderIntervalDays: int("reminder_interval_days"),
	reminderIntervalMiles: int("reminder_interval_miles"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	lastServiceDate: date("last_service_date", { mode: 'string' }),
	lastServiceMileage: int("last_service_mileage"),
	priority: mysqlEnum(['low','normal','high','critical']).default('normal'),
	notificationMethod: json("notification_method"),
	autoSchedule: tinyint("auto_schedule").default(0),
	estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
	status: mysqlEnum(['active','sent','scheduled','completed','snoozed','cancelled']).default('active'),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	snoozedUntil: date("snoozed_until", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	completedJobCardId: bigint("completed_job_card_id", { mode: "number", unsigned: true }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("service_reminders_status_idx").on(table.status),
	index("service_reminders_tenant_idx").on(table.tenantId),
	index("service_reminders_vehicle_idx").on(table.vehicleId),
	primaryKey({ columns: [table.id], name: "service_reminders_id"}),
	unique("id").on(table.id),
]);

export const sfdaSerialNumbers = mysqlTable("sfda_serial_numbers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	batchNumber: varchar("batch_number", { length: 100 }),
	serialNumber: varchar("serial_number", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	status: mysqlEnum(['available','sold','returned','expired','destroyed']).default('available').notNull(),
	soldAt: timestamp("sold_at", { mode: 'string' }),
	invoiceItemId: bigint("invoice_item_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("sfda_serial_product_idx").on(table.productId),
	primaryKey({ columns: [table.id], name: "sfda_serial_numbers_id"}),
	unique("id").on(table.id),
	unique("sfda_serial_numbers_unique").on(table.serialNumber),
]);

export const shipmentTracking = mysqlTable("shipment_tracking", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	trackingNumber: varchar("tracking_number", { length: 100 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	origin: varchar({ length: 255 }).notNull(),
	destination: varchar({ length: 255 }).notNull(),
	weight: decimal({ precision: 10, scale: 2 }),
	volume: decimal({ precision: 10, scale: 2 }),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }),
	driverId: bigint("driver_id", { mode: "number", unsigned: true }),
	routeId: bigint("route_id", { mode: "number", unsigned: true }),
	dispatchedAt: timestamp("dispatched_at", { mode: 'string' }),
	estimatedDelivery: timestamp("estimated_delivery", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	status: mysqlEnum(['pending','picked_up','in_transit','delivered','exception','cancelled']).default('pending').notNull(),
	lastLocation: varchar("last_location", { length: 255 }),
	currentLatitude: decimal("current_latitude", { precision: 10, scale: 7 }),
	currentLongitude: decimal("current_longitude", { precision: 10, scale: 7 }),
	temperature: decimal({ precision: 5, scale: 2 }),
	signature: text(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("shipment_tracking_status_idx").on(table.tenantId, table.status),
	index("shipment_tracking_tenant_idx").on(table.tenantId),
	index("shipment_tracking_tracking_idx").on(table.trackingNumber),
	primaryKey({ columns: [table.id], name: "shipment_tracking_id"}),
	unique("id").on(table.id),
]);

export const siteDailyReports = mysqlTable("site_daily_reports", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportDate: date("report_date", { mode: 'string' }).notNull(),
	reportNumber: varchar("report_number", { length: 50 }).notNull(),
	weatherCondition: varchar("weather_condition", { length: 100 }),
	temperature: decimal({ precision: 5, scale: 2 }),
	workDescription: text("work_description"),
	laborCount: int("labor_count"),
	supervisorName: varchar("supervisor_name", { length: 255 }),
	equipmentUsed: text("equipment_used"),
	materialsReceived: text("materials_received"),
	materialsUsed: text("materials_used"),
	workCompleted: text("work_completed"),
	workInProgress: text("work_in_progress"),
	issuesEncountered: text("issues_encountered"),
	safetyIncidents: text("safety_incidents"),
	visitors: text(),
	photos: json(),
	status: mysqlEnum(['draft','submitted','approved']).default('draft').notNull(),
	submittedBy: bigint("submitted_by", { mode: "number", unsigned: true }),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("site_daily_reports_date_idx").on(table.tenantId, table.reportDate),
	index("site_daily_reports_project_idx").on(table.tenantId, table.projectId),
	index("site_daily_reports_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "site_daily_reports_id"}),
	unique("id").on(table.id),
]);

export const smtpSettings = mysqlTable("smtp_settings", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	host: varchar({ length: 255 }).notNull(),
	port: int().default(587).notNull(),
	username: varchar({ length: 255 }),
	passwordEncrypted: text("password_encrypted"),
	encryption: mysqlEnum(['none','ssl','tls','starttls']).default('starttls').notNull(),
	senderName: varchar("sender_name", { length: 255 }),
	senderEmail: varchar("sender_email", { length: 320 }).notNull(),
	replyToEmail: varchar("reply_to_email", { length: 320 }),
	isActive: tinyint("is_active").default(0),
	testStatus: mysqlEnum("test_status", ['untested','success','failed']).default('untested').notNull(),
	lastTestedAt: timestamp("last_tested_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "smtp_settings_id"}),
	unique("id").on(table.id),
	unique("smtp_settings_tenant_id_unique").on(table.tenantId),
]);

export const stockAdjustmentItems = mysqlTable("stock_adjustment_items", {
	id: serial().notNull(),
	adjustmentId: bigint("adjustment_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	currentQty: int("current_qty").notNull(),
	adjustedQty: int("adjusted_qty").notNull(),
	difference: int().notNull(),
	unitCost: decimal("unit_cost", { precision: 18, scale: 4 }),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "stock_adjustment_items_id"}),
	unique("id").on(table.id),
]);

export const stockAdjustments = mysqlTable("stock_adjustments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	adjustmentNumber: varchar("adjustment_number", { length: 50 }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	adjustmentType: mysqlEnum("adjustment_type", ['damage','expiry','theft','count','other']).notNull(),
	totalValue: decimal("total_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "stock_adjustments_id"}),
	unique("id").on(table.id),
]);

export const stockTransferItems = mysqlTable("stock_transfer_items", {
	id: serial().notNull(),
	transferId: bigint("transfer_id", { mode: "number", unsigned: true }).notNull(),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: int().notNull(),
	unitCost: decimal("unit_cost", { precision: 18, scale: 4 }),
	batchNumber: varchar("batch_number", { length: 100 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "stock_transfer_items_id"}),
	unique("id").on(table.id),
]);

export const stockTransfers = mysqlTable("stock_transfers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	transferNumber: varchar("transfer_number", { length: 50 }).notNull(),
	fromWarehouseId: bigint("from_warehouse_id", { mode: "number", unsigned: true }).notNull(),
	toWarehouseId: bigint("to_warehouse_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	status: mysqlEnum(['draft','pending','shipped','received','cancelled']).default('draft').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "stock_transfers_id"}),
	unique("id").on(table.id),
]);

export const storageBins = mysqlTable("storage_bins", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	locationId: bigint("location_id", { mode: "number", unsigned: true }).notNull(),
	binCode: varchar("bin_code", { length: 50 }),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	lotNumber: varchar("lot_number", { length: 100 }),
	serialNumber: varchar("serial_number", { length: 100 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	expiryDate: date("expiry_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	putawayDate: date("putaway_date", { mode: 'string' }),
	status: mysqlEnum(['available','allocated','picked','blocked']).default('available').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("sb_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "storage_bins_id"}),
	unique("id").on(table.id),
]);

export const storageLocations = mysqlTable("storage_locations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	zoneId: bigint("zone_id", { mode: "number", unsigned: true }),
	locationCode: varchar("location_code", { length: 50 }).notNull(),
	locationType: mysqlEnum("location_type", ['rack','floor','bulk','shelf','bin','drawer']).notNull(),
	aisle: varchar({ length: 50 }),
	rack: varchar({ length: 50 }),
	shelf: varchar({ length: 50 }),
	bin: varchar({ length: 50 }),
	capacity: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	usedCapacity: decimal("used_capacity", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	weightCapacity: decimal("weight_capacity", { precision: 10, scale: 2 }),
	heightCm: decimal("height_cm", { precision: 10, scale: 2 }),
	lengthCm: decimal("length_cm", { precision: 10, scale: 2 }),
	widthCm: decimal("width_cm", { precision: 10, scale: 2 }),
	isReserved: tinyint("is_reserved").default(0),
	isBlocked: tinyint("is_blocked").default(0),
	status: mysqlEnum(['available','occupied','blocked','reserved']).default('available').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("sl_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "storage_locations_id"}),
	unique("id").on(table.id),
]);

export const studentAttendance = mysqlTable("student_attendance", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	status: mysqlEnum(['present','absent','late','excused','holiday']).default('present').notNull(),
	remarks: text(),
	markedBy: bigint("marked_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("student_attendance_date_idx").on(table.tenantId, table.date),
	index("student_attendance_student_idx").on(table.studentId),
	index("student_attendance_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "student_attendance_id"}),
	unique("id").on(table.id),
]);

export const studentFeeInvoices = mysqlTable("student_fee_invoices", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
	feeStructureId: bigint("fee_structure_id", { mode: "number", unsigned: true }),
	invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
	term: varchar({ length: 50 }),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }),
	status: mysqlEnum(['pending','partial','paid','overdue','cancelled']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("student_fee_invoices_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "student_fee_invoices_id"}),
	unique("id").on(table.id),
]);

export const students = mysqlTable("students", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	studentNumber: varchar("student_number", { length: 50 }).notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dateOfBirth: date("date_of_birth", { mode: 'string' }),
	gender: mysqlEnum(['male','female']),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	address: text(),
	guardianName: varchar("guardian_name", { length: 255 }),
	guardianPhone: varchar("guardian_phone", { length: 50 }),
	guardianEmail: varchar("guardian_email", { length: 320 }),
	grade: varchar({ length: 50 }),
	section: varchar({ length: 50 }),
	academicYear: varchar("academic_year", { length: 20 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	enrollmentDate: date("enrollment_date", { mode: 'string' }),
	status: mysqlEnum(['active','transferred','graduated','expelled','withdrawn']).default('active').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("students_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "students_id"}),
	unique("id").on(table.id),
]);

export const subcontractorPayments = mysqlTable("subcontractor_payments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	paymentDate: date("payment_date", { mode: 'string' }),
	invoiceReference: varchar("invoice_reference", { length: 100 }),
	grossAmount: decimal("gross_amount", { precision: 18, scale: 4 }).notNull(),
	retentionDeducted: decimal("retention_deducted", { precision: 18, scale: 4 }),
	advanceRecovery: decimal("advance_recovery", { precision: 18, scale: 4 }),
	penalties: decimal({ precision: 18, scale: 4 }).default('0.0000'),
	otherDeductions: decimal("other_deductions", { precision: 18, scale: 4 }).default('0.0000'),
	netAmount: decimal("net_amount", { precision: 18, scale: 4 }).notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000'),
	paymentMethod: mysqlEnum("payment_method", ['bank_transfer','cheque','cash']),
	bankReference: varchar("bank_reference", { length: 100 }),
	status: mysqlEnum(['pending','approved','paid','cancelled']).default('pending').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("subcontractor_payments_project_idx").on(table.tenantId, table.projectId),
	index("subcontractor_payments_sub_idx").on(table.tenantId, table.subcontractorId),
	index("subcontractor_payments_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "subcontractor_payments_id"}),
	unique("id").on(table.id),
]);

export const subcontractorProjects = mysqlTable("subcontractor_projects", {
	id: serial().notNull(),
	subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	scope: text(),
	contractAmount: decimal("contract_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	status: mysqlEnum(['pending','active','completed','terminated']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "subcontractor_projects_id"}),
	unique("id").on(table.id),
]);

export const subcontractors = mysqlTable("subcontractors", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }),
	name: varchar({ length: 255 }).notNull(),
	contactPerson: varchar("contact_person", { length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	trade: varchar({ length: 255 }),
	licenseNumber: varchar("license_number", { length: 100 }),
	contractAmount: decimal("contract_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default('10.00').notNull(),
	retentionAmount: decimal("retention_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("subcontractors_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "subcontractors_id"}),
	unique("id").on(table.id),
]);

export const subscriptionInvoices = mysqlTable("subscription_invoices", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	subscriptionId: bigint("subscription_id", { mode: "number", unsigned: true }).notNull(),
	invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
	amount: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	status: mysqlEnum(['draft','sent','paid','overdue','cancelled']).default('draft').notNull(),
	billingPeriodStart: timestamp("billing_period_start", { mode: 'string' }),
	billingPeriodEnd: timestamp("billing_period_end", { mode: 'string' }),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	paymentMethod: varchar("payment_method", { length: 50 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "subscription_invoices_id"}),
	unique("id").on(table.id),
]);

export const subscriptionPayments = mysqlTable("subscription_payments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	amount: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }),
	transactionId: varchar("transaction_id", { length: 255 }),
	status: mysqlEnum(['pending','completed','failed','refunded']).default('completed').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "subscription_payments_id"}),
	unique("id").on(table.id),
]);

export const subscriptionPlans = mysqlTable("subscription_plans", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 255 }).notNull(),
	description: text(),
	price: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	billingCycle: mysqlEnum("billing_cycle", ['monthly','yearly','one_time']).default('monthly'),
	maxUsers: int("max_users").default(5),
	maxBranches: int("max_branches").default(1),
	maxInvoicesPerMonth: int("max_invoices_per_month").default(100),
	maxDevices: int("max_devices").default(2),
	maxStorageGb: int("max_storage_gb").default(5),
	modulesIncluded: json("modules_included"),
	features: json(),
	isActive: tinyint("is_active").default(1),
	isPublic: tinyint("is_public").default(1),
	sortOrder: int("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_active").on(table.isActive),
	index("idx_public").on(table.isPublic),
	primaryKey({ columns: [table.id], name: "subscription_plans_id"}),
]);

export const subscriptions = mysqlTable("subscriptions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	planId: bigint("plan_id", { mode: "number", unsigned: true }).notNull(),
	status: mysqlEnum(['trial','active','past_due','cancelled','expired','suspended']).default('trial').notNull(),
	trialStartAt: timestamp("trial_start_at", { mode: 'string' }),
	trialEndAt: timestamp("trial_end_at", { mode: 'string' }),
	currentPeriodStartAt: timestamp("current_period_start_at", { mode: 'string' }),
	currentPeriodEndAt: timestamp("current_period_end_at", { mode: 'string' }),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	gracePeriodEndsAt: timestamp("grace_period_ends_at", { mode: 'string' }),
	billingCycle: mysqlEnum("billing_cycle", ['monthly','yearly']).default('monthly').notNull(),
	productLimit: int("product_limit").default(60),
	userLimit: int("user_limit").default(5),
	branchLimit: int("branch_limit").default(1),
	warehouseLimit: int("warehouse_limit").default(1),
	couponCode: varchar("coupon_code", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "subscriptions_id"}),
	unique("id").on(table.id),
	unique("subscriptions_tenant_id_unique").on(table.tenantId),
]);

export const supplierContracts = mysqlTable("supplier_contracts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	contractNumber: varchar("contract_number", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	terms: text(),
	value: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	status: mysqlEnum(['draft','active','expired','terminated','renewed']).default('draft').notNull(),
	renewalReminderDays: int("renewal_reminder_days").default(30),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("sc_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "supplier_contracts_id"}),
	unique("id").on(table.id),
]);

export const supplierEvaluations = mysqlTable("supplier_evaluations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	evaluationDate: date("evaluation_date", { mode: 'string' }).notNull(),
	evaluatorId: bigint("evaluator_id", { mode: "number", unsigned: true }),
	qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).default('0.00').notNull(),
	deliveryScore: decimal("delivery_score", { precision: 5, scale: 2 }).default('0.00').notNull(),
	priceScore: decimal("price_score", { precision: 5, scale: 2 }).default('0.00').notNull(),
	serviceScore: decimal("service_score", { precision: 5, scale: 2 }).default('0.00').notNull(),
	overallScore: decimal("overall_score", { precision: 5, scale: 2 }).default('0.00').notNull(),
	category: mysqlEnum(['excellent','good','average','poor']).default('average').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("se_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "supplier_evaluations_id"}),
	unique("id").on(table.id),
]);

export const supplierPayments = mysqlTable("supplier_payments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).notNull(),
	paymentMethod: mysqlEnum("payment_method", ['cash','bank_transfer','cheque','card','online']).notNull(),
	bankAccountId: bigint("bank_account_id", { mode: "number", unsigned: true }),
	reference: varchar({ length: 100 }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "supplier_payments_id"}),
	unique("id").on(table.id),
]);

export const supplierPerformanceMetrics = mysqlTable("supplier_performance_metrics", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }).default('0.00').notNull(),
	qualityAcceptanceRate: decimal("quality_acceptance_rate", { precision: 5, scale: 2 }).default('0.00').notNull(),
	fillRate: decimal("fill_rate", { precision: 5, scale: 2 }).default('0.00').notNull(),
	leadTimeDays: decimal("lead_time_days", { precision: 5, scale: 2 }).default('0.00').notNull(),
	returnRate: decimal("return_rate", { precision: 5, scale: 2 }).default('0.00').notNull(),
	priceCompetitiveness: decimal("price_competitiveness", { precision: 5, scale: 2 }).default('0.00').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("spm_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "supplier_performance_metrics_id"}),
	unique("id").on(table.id),
]);

export const supplierPortalUsers = mysqlTable("supplier_portal_users", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	isActive: tinyint("is_active").default(1),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("spu_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "supplier_portal_users_id"}),
	unique("id").on(table.id),
]);

export const supplierReconciliation = mysqlTable("supplier_reconciliation", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	reconciliationNumber: varchar("reconciliation_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	totalBookings: int("total_bookings").default(0).notNull(),
	grossAmount: decimal("gross_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	commissionAmount: decimal("commission_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	netPayable: decimal("net_payable", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	balanceDue: decimal("balance_due", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	status: mysqlEnum(['draft','confirmed','paid','disputed']).default('draft').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("supplier_reconciliation_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "supplier_reconciliation_id"}),
	unique("id").on(table.id),
]);

export const supplierRfqResponses = mysqlTable("supplier_rfq_responses", {
	id: serial().notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
	rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
	respondedAt: timestamp("responded_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	responseType: mysqlEnum("response_type", ['quoted','declined','no_bid']).notNull(),
	notes: text(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "supplier_rfq_responses_id"}),
	unique("id").on(table.id),
]);

export const suppliers = mysqlTable("suppliers", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }),
	supplierCode: varchar("supplier_code", { length: 50 }),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	legalNameEn: varchar("legal_name_en", { length: 255 }),
	legalNameAr: varchar("legal_name_ar", { length: 255 }),
	tradeNameEn: varchar("trade_name_en", { length: 255 }),
	tradeNameAr: varchar("trade_name_ar", { length: 255 }),
	commercialRegistration: varchar("commercial_registration", { length: 100 }),
	vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	mobile: varchar({ length: 50 }),
	whatsapp: varchar({ length: 50 }),
	address: text(),
	buildingNumber: varchar("building_number", { length: 10 }),
	streetName: varchar("street_name", { length: 255 }),
	district: varchar({ length: 255 }),
	city: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 10 }),
	additionalNumber: varchar("additional_number", { length: 10 }),
	country: varchar({ length: 100 }).default('Saudi Arabia'),
	taxNumber: varchar("tax_number", { length: 100 }),
	contactPerson: varchar("contact_person", { length: 255 }),
	contactJobTitle: varchar("contact_job_title", { length: 255 }),
	bankName: varchar("bank_name", { length: 255 }),
	iban: varchar({ length: 34 }),
	bankAccountNumber: varchar("bank_account_number", { length: 100 }),
	creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).default('0.00'),
	paymentTerms: int("payment_terms").default(30),
	currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default('0.00'),
	openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default('0.00'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	openingBalanceDate: date("opening_balance_date", { mode: 'string' }),
	supplierCategory: varchar("supplier_category", { length: 100 }),
	supplierType: varchar("supplier_type", { length: 100 }),
	vatValidated: tinyint("vat_validated").default(0),
	crValidated: tinyint("cr_validated").default(0),
	notes: text(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_name").on(table.name),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "suppliers_id"}),
]);

export const supportTickets = mysqlTable("support_tickets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	ticketNumber: varchar("ticket_number", { length: 50 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 100 }),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	status: mysqlEnum(['open','in_progress','waiting','resolved','closed','escalated']).default('open').notNull(),
	requesterName: varchar("requester_name", { length: 255 }),
	requesterEmail: varchar("requester_email", { length: 320 }),
	requesterPhone: varchar("requester_phone", { length: 50 }),
	assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
	slaDeadline: timestamp("sla_deadline", { mode: 'string' }),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	closedAt: timestamp("closed_at", { mode: 'string' }),
	satisfaction: int(),
	source: mysqlEnum(['email','phone','web','chat','whatsapp']).default('web').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "support_tickets_id"}),
	unique("id").on(table.id),
]);

export const syncLogs = mysqlTable("sync_logs", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	direction: mysqlEnum(['push','pull']).notNull(),
	entityType: varchar("entity_type", { length: 100 }),
	entityId: varchar("entity_id", { length: 255 }),
	action: varchar({ length: 50 }),
	status: varchar({ length: 50 }).notNull(),
	message: text(),
	detailsJson: json("details_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_sync_logs_created").on(table.createdAt),
	index("idx_sync_logs_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "sync_logs_id"}),
]);

export const syncQueue = mysqlTable("sync_queue", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: varchar("device_id", { length: 100 }),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: varchar("entity_id", { length: 100 }),
	action: mysqlEnum(['create','update','delete']).notNull(),
	payload: json(),
	version: int().default(1),
	localUuid: varchar("local_uuid", { length: 255 }),
	status: mysqlEnum(['pending','synced','failed','conflict']).default('pending').notNull(),
	errorMessage: text("error_message"),
	retryCount: int("retry_count").default(0),
	syncedAt: timestamp("synced_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("idx_sync_queue_entity").on(table.entityType, table.entityId),
	index("sync_queue_status_idx").on(table.status),
	index("sync_queue_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "sync_queue_id"}),
	unique("id").on(table.id),
]);

export const syncStats = mysqlTable("sync_stats", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: varchar("device_id", { length: 255 }),
	totalPushes: bigint("total_pushes", { mode: "number", unsigned: true }),
	totalPulls: bigint("total_pulls", { mode: "number", unsigned: true }),
	successfulPushes: bigint("successful_pushes", { mode: "number", unsigned: true }),
	failedPushes: bigint("failed_pushes", { mode: "number", unsigned: true }),
	successfulPulls: bigint("successful_pulls", { mode: "number", unsigned: true }),
	failedPulls: bigint("failed_pulls", { mode: "number", unsigned: true }),
	conflictsResolved: bigint("conflicts_resolved", { mode: "number", unsigned: true }),
	conflictsPending: bigint("conflicts_pending", { mode: "number", unsigned: true }),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	avgSyncDurationMs: bigint("avg_sync_duration_ms", { mode: "number", unsigned: true }),
	dataUploadBytes: bigint("data_upload_bytes", { mode: "number", unsigned: true }),
	dataDownloadBytes: bigint("data_download_bytes", { mode: "number", unsigned: true }),
	isOnline: tinyint("is_online").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_sync_stats_device").on(table.deviceId),
	index("idx_sync_stats_tenant").on(table.tenantId),
	index("sync_stats_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "sync_stats_id"}),
	unique("uk_sync_stats_device").on(table.tenantId, table.deviceId),
]);

export const systemSettings = mysqlTable("system_settings", {
	id: serial().notNull(),
	key: varchar({ length: 150 }).notNull(),
	value: text(),
	category: varchar({ length: 100 }).default('platform'),
	isSecret: tinyint("is_secret").default(0),
	updatedBy: bigint("updated_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	index("system_settings_category_idx").on(table.category),
	primaryKey({ columns: [table.id], name: "system_settings_id"}),
	unique("id").on(table.id),
	unique("system_settings_key_idx").on(table.key),
]);

export const tableOrders = mysqlTable("table_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	restaurantTableId: bigint("restaurant_table_id", { mode: "number", unsigned: true }).notNull(),
	waiterId: bigint("waiter_id", { mode: "number", unsigned: true }),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }),
	guestCount: int("guest_count").default(1).notNull(),
	orderNumber: varchar("order_number", { length: 50 }).notNull(),
	status: mysqlEnum(['open','in_progress','served','partial','completed','cancelled','transferred']).default('open').notNull(),
	orderType: mysqlEnum("order_type", ['dine_in','takeaway','delivery']).default('dine_in').notNull(),
	splitFromId: bigint("split_from_id", { mode: "number", unsigned: true }),
	transferredToTableId: bigint("transferred_to_table_id", { mode: "number", unsigned: true }),
	serviceChargePercent: decimal("service_charge_percent", { precision: 5, scale: 2 }).default('0.00'),
	serviceChargeAmount: decimal("service_charge_amount", { precision: 18, scale: 4 }).default('0.0000'),
	subtotal: decimal({ precision: 18, scale: 4 }).default('0.0000'),
	discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default('0.0000'),
	taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default('0.0000'),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000'),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("table_orders_status_idx").on(table.tenantId, table.status),
	index("table_orders_table_idx").on(table.restaurantTableId),
	primaryKey({ columns: [table.id], name: "table_orders_id"}),
	unique("id").on(table.id),
]);

export const taskAttachments = mysqlTable("task_attachments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	taskId: bigint("task_id", { mode: "number", unsigned: true }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	filePath: text("file_path"),
	fileSize: bigint("file_size", { mode: "number" }),
	mimeType: varchar("mime_type", { length: 100 }),
	uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "task_attachments_id"}),
	unique("id").on(table.id),
]);

export const taskComments = mysqlTable("task_comments", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	taskId: bigint("task_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	comment: text().notNull(),
	isInternal: tinyint("is_internal").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "task_comments_id"}),
	unique("id").on(table.id),
]);

export const taxCategories = mysqlTable("tax_categories", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }).notNull(),
	category: mysqlEnum(['standard','zero_rated','exempt','out_of_scope','reverse_charge']).notNull(),
	taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('0.00').notNull(),
	description: text(),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "tax_categories_id"}),
	unique("tax_categories_code").on(table.tenantId, table.code),
]);

export const taxCredentials = mysqlTable("tax_credentials", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	integrationId: bigint("integration_id", { mode: "number", unsigned: true }),
	credentialType: varchar("credential_type", { length: 50 }).notNull(),
	encryptedValue: text("encrypted_value").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_credentials_id"}),
	unique("id").on(table.id),
]);

export const taxIdentifiers = mysqlTable("tax_identifiers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	countryCode: varchar("country_code", { length: 2 }).notNull(),
	identifierType: varchar("identifier_type", { length: 50 }).notNull(),
	identifierValue: varchar("identifier_value", { length: 255 }).notNull(),
	isVerified: tinyint("is_verified").default(0),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_identifiers_id"}),
	unique("id").on(table.id),
]);

export const taxIntegrations = mysqlTable("tax_integrations", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	countryCode: varchar("country_code", { length: 2 }).notNull(),
	integrationType: varchar("integration_type", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	isEnabled: tinyint("is_enabled").default(0),
	isSandbox: tinyint("is_sandbox").default(1),
	endpointUrl: varchar("endpoint_url", { length: 500 }),
	sandboxUrl: varchar("sandbox_url", { length: 500 }),
	apiVersion: varchar("api_version", { length: 50 }),
	testConnectionAt: timestamp("test_connection_at", { mode: 'string' }),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	config: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_integrations_id"}),
	unique("id").on(table.id),
]);

export const taxProfiles = mysqlTable("tax_profiles", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	countryCode: varchar("country_code", { length: 2 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	taxType: mysqlEnum("tax_type", ['vat','gst','sales_tax','withholding','income_tax','other']).default('vat').notNull(),
	defaultRate: decimal("default_rate", { precision: 5, scale: 2 }).default('0.00').notNull(),
	hasReverseCharge: tinyint("has_reverse_charge").default(0),
	hasZeroRated: tinyint("has_zero_rated").default(0),
	hasExempt: tinyint("has_exempt").default(0),
	hasWithholding: tinyint("has_withholding").default(0),
	hasDigitalInvoicing: tinyint("has_digital_invoicing").default(0),
	hasQrCode: tinyint("has_qr_code").default(0),
	isActive: tinyint("is_active").default(1),
	config: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_profiles_id"}),
	unique("id").on(table.id),
]);

export const taxRateHistory = mysqlTable("tax_rate_history", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveDate: date("effective_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	reason: text(),
	changedBy: bigint("changed_by", { mode: "number", unsigned: true }),
	changedAt: timestamp("changed_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("idx_date").on(table.effectiveDate),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "tax_rate_history_id"}),
]);

export const taxRates = mysqlTable("tax_rates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	rate: decimal({ precision: 5, scale: 2 }).notNull(),
	type: mysqlEnum(['vat','gst','sales_tax','withholding','other']).default('vat').notNull(),
	isDefault: tinyint("is_default").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_rates_id"}),
	unique("id").on(table.id),
]);

export const taxRules = mysqlTable("tax_rules", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	taxProfileId: bigint("tax_profile_id", { mode: "number", unsigned: true }),
	name: varchar({ length: 255 }).notNull(),
	rate: decimal({ precision: 5, scale: 2 }).notNull(),
	ruleType: mysqlEnum("rule_type", ['standard','reduced','zero','exempt','reverse_charge','withholding']).default('standard').notNull(),
	appliesTo: mysqlEnum("applies_to", ['goods','services','both','specific']).default('both').notNull(),
	minAmount: decimal("min_amount", { precision: 18, scale: 4 }),
	maxAmount: decimal("max_amount", { precision: 18, scale: 4 }),
	isActive: tinyint("is_active").default(1),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveFrom: date("effective_from", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	effectiveTo: date("effective_to", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_rules_id"}),
	unique("id").on(table.id),
]);

export const taxSubmissionLogs = mysqlTable("tax_submission_logs", {
	id: serial().notNull(),
	submissionId: bigint("submission_id", { mode: "number", unsigned: true }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	status: varchar({ length: 50 }).notNull(),
	message: text(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_submission_logs_id"}),
	unique("id").on(table.id),
]);

export const taxSubmissions = mysqlTable("tax_submissions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	integrationId: bigint("integration_id", { mode: "number", unsigned: true }),
	submissionType: varchar("submission_type", { length: 50 }).notNull(),
	submissionNumber: varchar("submission_number", { length: 100 }),
	status: mysqlEnum(['pending','submitted','accepted','rejected','error']).default('pending').notNull(),
	payload: json(),
	response: json(),
	errorCode: varchar("error_code", { length: 50 }),
	errorMessage: text("error_message"),
	retryCount: int("retry_count").default(0),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tax_submissions_id"}),
	unique("id").on(table.id),
]);

export const tenantInvoices = mysqlTable("tenant_invoices", {
	id: int().autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	subscriptionId: bigint("subscription_id", { mode: "number", unsigned: true }),
	invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	invoiceDate: date("invoice_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dueDate: date("due_date", { mode: 'string' }).notNull(),
	subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
	taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0.00'),
	discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0.00'),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 10 }).default('SAR'),
	status: mysqlEnum(['draft','issued','paid','overdue','cancelled','refunded']).default('draft'),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentReference: varchar("payment_reference", { length: 255 }),
	notes: text(),
	lineItems: json("line_items"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_due_date").on(table.dueDate),
	index("idx_invoice_date").on(table.invoiceDate),
	index("idx_status").on(table.status),
	index("idx_subscription").on(table.subscriptionId),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "tenant_invoices_id"}),
	unique("invoice_number").on(table.invoiceNumber),
]);

export const tenantLimitsOverride = mysqlTable("tenant_limits_override", {
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	maxUsers: int("max_users"),
	maxBranches: int("max_branches"),
	maxInvoicesPerMonth: int("max_invoices_per_month"),
	maxDevices: int("max_devices"),
	maxStorageGb: int("max_storage_gb"),
	overrideReason: text("override_reason"),
	overrideBy: int("override_by"),
	overrideAt: timestamp("override_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.tenantId], name: "tenant_limits_override_tenant_id"}),
]);

export const tenantModuleControls = mysqlTable("tenant_module_controls", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	moduleKey: varchar("module_key", { length: 100 }).notNull(),
	isEnabled: tinyint("is_enabled").default(1).notNull(),
	source: mysqlEnum(['plan','override','trial','support']).default('plan').notNull(),
	limitJson: json("limit_json"),
	notes: text(),
	updatedBy: bigint("updated_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	index("tenant_module_controls_module_idx").on(table.moduleKey),
	index("tenant_module_controls_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "tenant_module_controls_id"}),
	unique("id").on(table.id),
	unique("tenant_module_controls_unique_idx").on(table.tenantId, table.moduleKey),
]);

export const tenantModules = mysqlTable("tenant_modules", {
	id: int().autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	moduleName: varchar("module_name", { length: 50 }).notNull(),
	isEnabled: tinyint("is_enabled").default(1),
	enabledAt: timestamp("enabled_at", { mode: 'string' }),
	disabledAt: timestamp("disabled_at", { mode: 'string' }),
	enabledBy: int("enabled_by"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_enabled").on(table.isEnabled),
	index("idx_module").on(table.moduleName),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "tenant_modules_id"}),
	unique("unique_tenant_module").on(table.tenantId, table.moduleName),
]);

export const tenantServiceEvents = mysqlTable("tenant_service_events", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	eventType: mysqlEnum("event_type", ['module_toggle','limit_update','billing_update','backup_request','restore_request','support_action','white_label_update']).notNull(),
	status: mysqlEnum(['pending','approved','running','done','failed','cancelled']).default('pending').notNull(),
	title: varchar({ length: 255 }).notNull(),
	metadata: json(),
	requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	index("tenant_service_events_status_idx").on(table.status),
	index("tenant_service_events_tenant_idx").on(table.tenantId),
	index("tenant_service_events_type_idx").on(table.eventType),
	primaryKey({ columns: [table.id], name: "tenant_service_events_id"}),
	unique("id").on(table.id),
]);

export const tenantUsage = mysqlTable("tenant_usage", {
	id: int().autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodStart: date("period_start", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	periodEnd: date("period_end", { mode: 'string' }).notNull(),
	userCount: int("user_count").default(0),
	activeUserCount: int("active_user_count").default(0),
	branchCount: int("branch_count").default(0),
	invoiceCount: int("invoice_count").default(0),
	deviceCount: int("device_count").default(0),
	storageMb: bigint("storage_mb", { mode: "number" }),
	apiCalls: int("api_calls").default(0),
	snapshotAt: timestamp("snapshot_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_period").on(table.periodStart, table.periodEnd),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "tenant_usage_id"}),
	unique("unique_tenant_period").on(table.tenantId, table.periodStart, table.periodEnd),
]);

export const tenantUsageLogs = mysqlTable("tenant_usage_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	activeUsers: int("active_users").default(0),
	storageUsed: bigint("storage_used", { mode: "number" }),
	apiCalls: int("api_calls").default(0),
	invoicesGenerated: int("invoices_generated").default(0),
	transactionsCount: int("transactions_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "tenant_usage_logs_id"}),
	unique("id").on(table.id),
]);

export const tenants = mysqlTable("tenants", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	country: varchar({ length: 100 }).default('Saudi Arabia').notNull(),
	taxNumber: varchar("tax_number", { length: 100 }),
	registrationNumber: varchar("registration_number", { length: 100 }),
	logo: text(),
	signature: mediumtext(),
	stamp: mediumtext(),
	favicon: text(),
	primaryColor: varchar("primary_color", { length: 20 }).default('#2563eb').notNull(),
	secondaryColor: varchar("secondary_color", { length: 20 }).default('#64748b').notNull(),
	font: varchar({ length: 50 }).default('Inter').notNull(),
	timezone: varchar({ length: 50 }).default('Asia/Riyadh').notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	language: varchar({ length: 10 }).default('en').notNull(),
	dateFormat: varchar("date_format", { length: 20 }).default('DD/MM/YYYY').notNull(),
	plan: mysqlEnum(['free','starter','professional','enterprise']).default('free').notNull(),
	status: mysqlEnum(['active','suspended','trial','cancelled']).default('trial').notNull(),
	trialEndsAt: timestamp("trial_ends_at", { mode: 'string' }),
	subscriptionEndsAt: timestamp("subscription_ends_at", { mode: 'string' }),
	whiteLabelEnabled: tinyint("white_label_enabled").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	layoutTheme: mysqlEnum("layout_theme", ['sidebar','app_launcher','launcher_theme']).default('sidebar').notNull(),
},
(table) => [
	index("idx_plan").on(table.plan),
	index("idx_status").on(table.status),
	primaryKey({ columns: [table.id], name: "tenants_id"}),
	unique("slug").on(table.slug),
]);

export const ticketComments = mysqlTable("ticket_comments", {
	id: serial().notNull(),
	ticketId: bigint("ticket_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	comment: text().notNull(),
	isInternal: tinyint("is_internal").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "ticket_comments_id"}),
	unique("id").on(table.id),
]);

export const timesheets = mysqlTable("timesheets", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }),
	taskId: bigint("task_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	hours: decimal({ precision: 5, scale: 2 }).notNull(),
	description: text(),
	billable: tinyint().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "timesheets_id"}),
	unique("id").on(table.id),
]);

export const travelBookings = mysqlTable("travel_bookings", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	bookingNumber: varchar("booking_number", { length: 50 }).notNull(),
	customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
	bookingType: mysqlEnum("booking_type", ['flight','hotel','package','car_rental','insurance','visa']).notNull(),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	bookingDate: date("booking_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	grossAmount: decimal("gross_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	commissionAmount: decimal("commission_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	netAmount: decimal("net_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	currency: varchar({ length: 10 }).default('SAR').notNull(),
	source: mysqlEnum(['direct','online','partner','corporate']).default('direct').notNull(),
	status: mysqlEnum(['pending','confirmed','cancelled','refunded','completed']).default('pending').notNull(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("travel_bookings_tenant_idx").on(table.tenantId),
	index("travel_bookings_type_idx").on(table.bookingType),
	primaryKey({ columns: [table.id], name: "travel_bookings_id"}),
	unique("id").on(table.id),
]);

export const travelSuppliers = mysqlTable("travel_suppliers", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }),
	name: varchar({ length: 255 }).notNull(),
	supplierType: mysqlEnum("supplier_type", ['airline','hotel','car_rental','insurance','tour_operator','visa','other']).notNull(),
	contactPerson: varchar("contact_person", { length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	address: text(),
	commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }).default('0.00').notNull(),
	paymentTerms: varchar("payment_terms", { length: 255 }),
	isActive: tinyint("is_active").default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("travel_suppliers_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "travel_suppliers_id"}),
	unique("id").on(table.id),
]);

export const units = mysqlTable("units", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	symbol: varchar({ length: 20 }).notNull(),
	conversionFactor: decimal("conversion_factor", { precision: 18, scale: 6 }).default('1.000000').notNull(),
	baseUnitId: bigint("base_unit_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "units_id"}),
	unique("id").on(table.id),
]);

export const userRoles = mysqlTable("user_roles", {
	id: serial().notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
	roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_roles_id"}),
	unique("id").on(table.id),
]);

export const users = mysqlTable("users", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
	unionId: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 320 }),
	avatar: text(),
	role: mysqlEnum(['super_admin','admin','reseller','user_admin','manager','accountant','salesman','cashier','hr','store_keeper','user']).default('user').notNull(),
	phone: varchar({ length: 50 }),
	isActive: tinyint("is_active").default(1),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("id").on(table.id),
	unique("users_unionId_unique").on(table.unionId),
]);

export const variationOrders = mysqlTable("variation_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	contractId: bigint("contract_id", { mode: "number", unsigned: true }),
	voNumber: varchar("vo_number", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	reason: mysqlEnum(['change_in_scope','design_change','omission','additional_work','regulatory','other']).notNull(),
	changeType: mysqlEnum("change_type", ['addition','deduction','omission']).notNull(),
	status: mysqlEnum(['draft','submitted','approved','rejected','implemented']).default('draft').notNull(),
	originalValue: decimal("original_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	changeValue: decimal("change_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	revisedValue: decimal("revised_value", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	impactOnTime: int("impact_on_time"),
	impactOnCost: decimal("impact_on_cost", { precision: 18, scale: 4 }),
	approvedBy: varchar("approved_by", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	approvedDate: date("approved_date", { mode: 'string' }),
	submittedBy: bigint("submitted_by", { mode: "number", unsigned: true }),
	approvedByUserId: bigint("approved_by_user_id", { mode: "number", unsigned: true }),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("variation_orders_contract_idx").on(table.tenantId, table.contractId),
	index("variation_orders_project_idx").on(table.tenantId, table.projectId),
	index("variation_orders_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "variation_orders_id"}),
	unique("id").on(table.id),
]);

export const vehicleMaintenance = mysqlTable("vehicle_maintenance", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).notNull(),
	maintenanceType: mysqlEnum("maintenance_type", ['routine','repair','inspection','tire_change','oil_change','other']).default('routine').notNull(),
	description: text(),
	cost: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	serviceProvider: varchar("service_provider", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	nextServiceDate: date("next_service_date", { mode: 'string' }),
	nextServiceOdometer: int("next_service_odometer"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "vehicle_maintenance_id"}),
	unique("id").on(table.id),
]);

export const vehicleParts = mysqlTable("vehicle_parts", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	partNumber: varchar("part_number", { length: 100 }).notNull(),
	partName: varchar("part_name", { length: 255 }).notNull(),
	description: text(),
	manufacturer: varchar({ length: 255 }),
	category: varchar({ length: 100 }),
	vehicleMake: varchar("vehicle_make", { length: 100 }),
	vehicleModel: varchar("vehicle_model", { length: 100 }),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
	quantityInStock: int("quantity_in_stock").default(0),
	reorderLevel: int("reorder_level").default(5),
	supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
	warehouseLocation: varchar("warehouse_location", { length: 100 }),
	isActive: tinyint("is_active").default(1),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("vehicle_parts_category_idx").on(table.category),
	index("vehicle_parts_number_idx").on(table.partNumber),
	index("vehicle_parts_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "vehicle_parts_id"}),
	unique("id").on(table.id),
]);

export const vehicles = mysqlTable("vehicles", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	vehicleNumber: varchar("vehicle_number", { length: 50 }).notNull(),
	make: varchar({ length: 100 }).notNull(),
	model: varchar({ length: 100 }).notNull(),
	year: int(),
	color: varchar({ length: 50 }),
	plateNumber: varchar("plate_number", { length: 50 }),
	vin: varchar({ length: 100 }),
	engineNumber: varchar("engine_number", { length: 100 }),
	vehicleType: mysqlEnum("vehicle_type", ['car','truck','van','bus','bike','other']).default('car').notNull(),
	fuelType: mysqlEnum("fuel_type", ['petrol','diesel','electric','hybrid']).default('petrol').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	purchaseDate: date("purchase_date", { mode: 'string' }),
	purchaseCost: decimal("purchase_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	currentOdometer: int("current_odometer").default(0),
	status: mysqlEnum(['active','maintenance','retired','sold']).default('active').notNull(),
	assignedDriverId: bigint("assigned_driver_id", { mode: "number", unsigned: true }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	insuranceExpiry: date("insurance_expiry", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	registrationExpiry: date("registration_expiry", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "vehicles_id"}),
	unique("id").on(table.id),
]);

export const visaExpiryAlerts = mysqlTable("visa_expiry_alerts", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	workerVisaStatusId: bigint("worker_visa_status_id", { mode: "number", unsigned: true }).notNull().references(() => workerVisaStatus.id),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	daysUntilExpiry: int("days_until_expiry").notNull(),
	alertType: varchar("alert_type", { length: 255 }).notNull(),
	isAcknowledged: tinyint("is_acknowledged").default(0),
	acknowledgedBy: int("acknowledged_by"),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("employee_id").on(table.employeeId),
	index("project_id").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	index("worker_visa_status_id").on(table.workerVisaStatusId),
	primaryKey({ columns: [table.id], name: "visa_expiry_alerts_id"}),
]);

export const visaQuotaTracking = mysqlTable("visa_quota_tracking", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	skillCategory: text("skill_category").notNull(),
	totalQuota: int("total_quota").notNull(),
	usedQuota: int("used_quota").default(0),
	availableQuota: int("available_quota").notNull(),
	qiwaLastUpdatedAt: timestamp("qiwa_last_updated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("idx_visa_quota_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "visa_quota_tracking_id"}),
]);

export const vitalSigns = mysqlTable("vital_signs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
	medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
	appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow(),
	temperature: decimal({ precision: 5, scale: 2 }),
	temperatureUnit: varchar("temperature_unit", { length: 1 }).default('C'),
	bloodPressureSystolic: int("blood_pressure_systolic"),
	bloodPressureDiastolic: int("blood_pressure_diastolic"),
	heartRate: int("heart_rate"),
	respiratoryRate: int("respiratory_rate"),
	oxygenSaturation: decimal("oxygen_saturation", { precision: 5, scale: 2 }),
	weight: decimal({ precision: 8, scale: 2 }),
	weightUnit: varchar("weight_unit", { length: 3 }).default('kg'),
	height: decimal({ precision: 8, scale: 2 }),
	heightUnit: varchar("height_unit", { length: 3 }).default('cm'),
	bmi: decimal({ precision: 5, scale: 2 }),
	painScore: int("pain_score"),
	glucoseLevel: decimal("glucose_level", { precision: 6, scale: 2 }),
	notes: text(),
	recordedBy: bigint("recorded_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("vital_signs_patient_idx").on(table.patientId),
	index("vital_signs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "vital_signs_id"}),
	unique("id").on(table.id),
]);

export const warehouseZones = mysqlTable("warehouse_zones", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
	zoneCode: varchar("zone_code", { length: 50 }).notNull(),
	zoneName: varchar("zone_name", { length: 255 }).notNull(),
	zoneType: mysqlEnum("zone_type", ['storage','picking','putaway','shipping','receiving','quarantine']).notNull(),
	capacity: decimal({ precision: 18, scale: 4 }).default('0.0000').notNull(),
	usedCapacity: decimal("used_capacity", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	colorCode: varchar("color_code", { length: 20 }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("wz_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "warehouse_zones_id"}),
	unique("id").on(table.id),
]);

export const warehouses = mysqlTable("warehouses", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	address: text(),
	managerName: varchar("manager_name", { length: 255 }),
	phone: varchar({ length: 50 }),
	isActive: tinyint("is_active").default(1),
	isPrimary: tinyint("is_primary").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "warehouses_id"}),
	unique("id").on(table.id),
]);

export const warranties = mysqlTable("warranties", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }),
	jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }),
	warrantyNumber: varchar("warranty_number", { length: 50 }).notNull(),
	warrantyType: mysqlEnum("warranty_type", ['manufacturer','extended','service','parts','labor']).notNull(),
	coverageType: varchar("coverage_type", { length: 100 }),
	providerName: varchar("provider_name", { length: 255 }),
	providerContact: varchar("provider_contact", { length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	mileageLimit: int("mileage_limit"),
	currentMileage: int("current_mileage"),
	coveredItems: json("covered_items"),
	exclusions: text(),
	deductible: decimal({ precision: 10, scale: 2 }).default('0.00'),
	coverageAmount: decimal("coverage_amount", { precision: 10, scale: 2 }),
	status: mysqlEnum(['active','expired','cancelled','claimed','void']).default('active'),
	documentUrl: text("document_url"),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("warranties_status_idx").on(table.status),
	index("warranties_tenant_idx").on(table.tenantId),
	index("warranties_vehicle_idx").on(table.vehicleId),
	primaryKey({ columns: [table.id], name: "warranties_id"}),
	unique("id").on(table.id),
	unique("warranty_number").on(table.warrantyNumber),
]);

export const warrantyClaims = mysqlTable("warranty_claims", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	warrantyId: bigint("warranty_id", { mode: "number", unsigned: true }).notNull(),
	vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
	jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }),
	claimNumber: varchar("claim_number", { length: 50 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	claimDate: date("claim_date", { mode: 'string' }).notNull(),
	failureDescription: text("failure_description").notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	failureDate: date("failure_date", { mode: 'string' }),
	mileageAtFailure: int("mileage_at_failure"),
	partsReplaced: json("parts_replaced"),
	laborHours: decimal("labor_hours", { precision: 8, scale: 2 }),
	partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).default('0.00'),
	laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default('0.00'),
	totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
	claimedAmount: decimal("claimed_amount", { precision: 10, scale: 2 }),
	approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }).default('0.00'),
	status: mysqlEnum(['draft','submitted','pending_approval','approved','rejected','paid','partial']).default('draft'),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	attachments: json(),
	notes: text(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("warranty_claims_status_idx").on(table.status),
	index("warranty_claims_tenant_idx").on(table.tenantId),
	index("warranty_claims_vehicle_idx").on(table.vehicleId),
	index("warranty_claims_warranty_idx").on(table.warrantyId),
	primaryKey({ columns: [table.id], name: "warranty_claims_id"}),
	unique("claim_number").on(table.claimNumber),
	unique("id").on(table.id),
]);

export const wavePicking = mysqlTable("wave_picking", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	waveNumber: varchar("wave_number", { length: 50 }).notNull(),
	waveType: mysqlEnum("wave_type", ['single_order','multi_order','zone']).notNull(),
	orderIds: json("order_ids"),
	totalItems: int("total_items").default(0),
	status: mysqlEnum(['created','released','picking','completed']).default('created').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
},
(table) => [
	index("wp_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "wave_picking_id"}),
	unique("id").on(table.id),
]);

export const wbsItems = mysqlTable("wbs_items", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
	parentId: bigint("parent_id", { mode: "number", unsigned: true }),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	level: int().notNull(),
	description: text(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	plannedStartDate: date("planned_start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	plannedEndDate: date("planned_end_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	actualStartDate: date("actual_start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	actualEndDate: date("actual_end_date", { mode: 'string' }),
	plannedCost: decimal("planned_cost", { precision: 18, scale: 4 }),
	actualCost: decimal("actual_cost", { precision: 18, scale: 4 }),
	progressPercent: int("progress_percent").default(0),
	weightPercent: decimal("weight_percent", { precision: 5, scale: 2 }).default('0.00'),
	status: mysqlEnum(['planned','in_progress','completed','delayed','cancelled']).default('planned').notNull(),
	responsiblePersonId: bigint("responsible_person_id", { mode: "number", unsigned: true }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("wbs_items_parent_idx").on(table.tenantId, table.parentId),
	index("wbs_items_project_idx").on(table.tenantId, table.projectId),
	index("wbs_items_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "wbs_items_id"}),
	unique("id").on(table.id),
]);

export const webhookDeliveryLogs = mysqlTable("webhook_delivery_logs", {
	id: serial().notNull(),
	subscriptionId: bigint("subscription_id", { mode: "number", unsigned: true }),
	eventType: varchar("event_type", { length: 100 }),
	payload: json(),
	status: mysqlEnum(['delivered','failed','retrying']).notNull(),
	httpStatus: int("http_status"),
	responseBody: text("response_body"),
	attemptNumber: int("attempt_number").default(1),
	durationMs: int("duration_ms"),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "webhook_delivery_logs_id"}),
	unique("id").on(table.id),
]);

export const webhookEventQueue = mysqlTable("webhook_event_queue", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	eventType: varchar("event_type", { length: 100 }).notNull(),
	payload: json(),
	sourceEntityType: varchar("source_entity_type", { length: 100 }),
	sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
	priority: int().default(5),
	status: mysqlEnum(['pending','delivered','failed']).default('pending'),
	retryCount: int("retry_count").default(0),
	maxRetries: int("max_retries").default(5),
	nextRetryAt: timestamp("next_retry_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("webhook_queue_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "webhook_event_queue_id"}),
	unique("id").on(table.id),
]);

export const webhookSubscriptions = mysqlTable("webhook_subscriptions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	url: varchar({ length: 1024 }).notNull(),
	secret: varchar({ length: 512 }),
	eventTypes: json("event_types").notNull(),
	format: mysqlEnum(['json','xml']).default('json'),
	isActive: tinyint("is_active").default(1),
	retryCount: int("retry_count").default(3),
	timeoutMs: int("timeout_ms").default(5000),
	lastTriggeredAt: timestamp("last_triggered_at", { mode: 'string' }),
	failureCount: int("failure_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("webhook_subs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "webhook_subscriptions_id"}),
	unique("id").on(table.id),
]);

export const websiteHeroSlides = mysqlTable("website_hero_slides", {
	id: serial().notNull(),
	headline: varchar({ length: 500 }).notNull(),
	headlineAr: varchar("headline_ar", { length: 500 }),
	subheadline: text(),
	subheadlineAr: text("subheadline_ar"),
	ctaText: varchar("cta_text", { length: 100 }),
	ctaTextAr: varchar("cta_text_ar", { length: 100 }),
	ctaUrl: varchar("cta_url", { length: 500 }),
	secondaryCtaText: varchar("secondary_cta_text", { length: 100 }),
	secondaryCtaTextAr: varchar("secondary_cta_text_ar", { length: 100 }),
	secondaryCtaUrl: varchar("secondary_cta_url", { length: 500 }),
	backgroundClass: varchar("background_class", { length: 100 }),
	isActive: tinyint("is_active").default(1),
	sortOrder: int("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "website_hero_slides_id"}),
	unique("id").on(table.id),
]);

export const websiteModuleCards = mysqlTable("website_module_cards", {
	id: serial().notNull(),
	moduleKey: varchar("module_key", { length: 100 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar("title_ar", { length: 255 }),
	description: text(),
	descriptionAr: text("description_ar"),
	iconName: varchar("icon_name", { length: 100 }),
	gradientFrom: varchar("gradient_from", { length: 50 }),
	gradientTo: varchar("gradient_to", { length: 50 }),
	featureCount: int("feature_count").default(0),
	detailUrl: varchar("detail_url", { length: 255 }),
	isVisible: tinyint("is_visible").default(1),
	sortOrder: int("sort_order").default(0),
	adminEditable: tinyint("admin_editable").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "website_module_cards_id"}),
	unique("id").on(table.id),
]);

export const websiteSections = mysqlTable("website_sections", {
	id: serial().notNull(),
	sectionKey: varchar("section_key", { length: 100 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	titleAr: varchar("title_ar", { length: 255 }),
	subtitle: text(),
	subtitleAr: text("subtitle_ar"),
	content: json(),
	isVisible: tinyint("is_visible").default(1),
	sortOrder: int("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "website_sections_id"}),
	unique("id").on(table.id),
	unique("website_sections_section_key_unique").on(table.sectionKey),
]);

export const wipCalculation = mysqlTable("wip_calculation", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportingPeriod: date("reporting_period", { mode: 'string' }),
	laborWip: decimal("labor_wip", { precision: 15, scale: 2 }),
	materialsWip: decimal("materials_wip", { precision: 15, scale: 2 }),
	equipmentWip: decimal("equipment_wip", { precision: 15, scale: 2 }),
	overheadWip: decimal("overhead_wip", { precision: 15, scale: 2 }),
	totalWip: decimal("total_wip", { precision: 15, scale: 2 }),
	revenueRecognized: decimal("revenue_recognized", { precision: 15, scale: 2 }),
	profitRecognized: decimal("profit_recognized", { precision: 15, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	index("idx_wip_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "wip_calculation_id"}),
]);

export const workOrders = mysqlTable("work_orders", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	woNumber: varchar("wo_number", { length: 50 }).notNull(),
	bomId: bigint("bom_id", { mode: "number", unsigned: true }),
	productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
	quantity: int().notNull(),
	producedQty: int("produced_qty").default(0),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date("start_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date("end_date", { mode: 'string' }),
	estimatedCost: decimal("estimated_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	notes: text(),
	status: mysqlEnum(['planned','in_progress','completed','cancelled']).default('planned').notNull(),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "work_orders_id"}),
	unique("id").on(table.id),
]);

export const workerVisaStatus = mysqlTable("worker_visa_status", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().references(() => tenants.id),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull().references(() => users.id),
	projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull().references(() => constructionProjects.id),
	visaNumber: varchar("visa_number", { length: 255 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	visaExpiryDate: date("visa_expiry_date", { mode: 'string' }).notNull(),
	sponsorshipStatus: varchar("sponsorship_status", { length: 255 }).default('active'),
	qiwaVerified: tinyint("qiwa_verified").default(0),
	lastVerifiedAt: timestamp("last_verified_at", { mode: 'string' }),
	expiryAlertSent: tinyint("expiry_alert_sent").default(0),
	expiryAlertDate: timestamp("expiry_alert_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("employee_id").on(table.employeeId),
	index("idx_worker_visa_expiry").on(table.visaExpiryDate),
	index("idx_worker_visa_project").on(table.projectId),
	index("tenant_id").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "worker_visa_status_id"}),
]);

export const workflowApprovals = mysqlTable("workflow_approvals", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	workflowId: bigint("workflow_id", { mode: "number", unsigned: true }).notNull(),
	workflowStepId: bigint("workflow_step_id", { mode: "number", unsigned: true }),
	entityType: varchar("entity_type", { length: 100 }),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
	assignedTo: json("assigned_to"),
	status: varchar({ length: 50 }).default('pending'),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	priority: int().default(0),
	dueAt: timestamp("due_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("workflow_approvals_entity_idx").on(table.entityType, table.entityId),
	index("workflow_approvals_status_idx").on(table.tenantId, table.status),
	index("workflow_approvals_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "workflow_approvals_id"}),
	unique("id").on(table.id),
]);

export const workflowLogs = mysqlTable("workflow_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	workflowId: bigint("workflow_id", { mode: "number", unsigned: true }),
	workflowStepId: bigint("workflow_step_id", { mode: "number", unsigned: true }),
	entityType: varchar("entity_type", { length: 100 }),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	action: varchar({ length: 100 }).notNull(),
	status: varchar({ length: 50 }).notNull(),
	message: text(),
	inputData: json("input_data"),
	outputData: json("output_data"),
	executionTimeMs: int("execution_time_ms"),
	triggeredBy: bigint("triggered_by", { mode: "number", unsigned: true }),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("workflow_logs_created_idx").on(table.tenantId, table.createdAt),
	index("workflow_logs_entity_idx").on(table.entityType, table.entityId),
	index("workflow_logs_tenant_idx").on(table.tenantId),
	index("workflow_logs_workflow_idx").on(table.tenantId, table.workflowId),
	primaryKey({ columns: [table.id], name: "workflow_logs_id"}),
	unique("id").on(table.id),
]);

export const workflowSteps = mysqlTable("workflow_steps", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	workflowId: bigint("workflow_id", { mode: "number", unsigned: true }).notNull(),
	stepOrder: int("step_order").notNull(),
	stepType: varchar("step_type", { length: 50 }).notNull(),
	stepConfig: json("step_config"),
	conditions: json(),
	approvalConfig: json("approval_config"),
	isParallel: tinyint("is_parallel").default(0),
	timeoutMinutes: int("timeout_minutes"),
	escalationConfig: json("escalation_config"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("workflow_steps_workflow_idx").on(table.tenantId, table.workflowId),
	primaryKey({ columns: [table.id], name: "workflow_steps_id"}),
	unique("id").on(table.id),
]);

export const workflows = mysqlTable("workflows", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	entityType: varchar("entity_type", { length: 100 }),
	triggerType: varchar("trigger_type", { length: 50 }).notNull(),
	triggerConfig: json("trigger_config"),
	isActive: tinyint("is_active").default(1),
	version: int().default(1),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("workflows_entity_idx").on(table.tenantId, table.entityType),
	index("workflows_tenant_idx").on(table.tenantId),
	index("workflows_trigger_idx").on(table.tenantId, table.triggerType),
	primaryKey({ columns: [table.id], name: "workflows_id"}),
	unique("id").on(table.id),
]);

export const workshopBaySchedule = mysqlTable("workshop_bay_schedule", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	bayNumber: int("bay_number").notNull(),
	jobCardId: int("job_card_id"),
	date: varchar({ length: 60 }).notNull(),
	startTime: varchar("start_time", { length: 30 }),
	endTime: varchar("end_time", { length: 30 }),
	status: mysqlEnum(['available','occupied','maintenance','reserved']).default('available'),
	notes: text(),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_bay_schedule_id"}),
]);

export const workshopEstimateItems = mysqlTable("workshop_estimate_items", {
	id: int().autoincrement().notNull(),
	estimateId: int("estimate_id").notNull(),
	type: mysqlEnum(['part','labor','sublet']).notNull(),
	description: text().notNull(),
	quantity: double().default(1),
	unitPrice: text("unit_price"),
	total: text(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_estimate_items_id"}),
]);

export const workshopEstimates = mysqlTable("workshop_estimates", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	vehicleId: int("vehicle_id").notNull(),
	customerId: int("customer_id").notNull(),
	estimateNumber: varchar("estimate_number", { length: 100 }).notNull(),
	status: mysqlEnum(['draft','pending','approved','rejected','converted']).default('draft').notNull(),
	partsTotal: text("parts_total"),
	laborTotal: text("labor_total"),
	subletTotal: text("sublet_total"),
	taxAmount: text("tax_amount"),
	totalAmount: text("total_amount").notNull(),
	notes: text(),
	sentMethod: varchar("sent_method", { length: 50 }),
	sentAt: varchar("sent_at", { length: 60 }),
	approvedAt: varchar("approved_at", { length: 60 }),
	convertedToJobId: int("converted_to_job_id"),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_estimates_id"}),
]);

export const workshopInspections = mysqlTable("workshop_inspections", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	jobCardId: int("job_card_id").notNull(),
	checklistJson: text("checklist_json"),
	photos: text(),
	customerSignature: text("customer_signature"),
	technicianSignature: text("technician_signature"),
	notes: text(),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_inspections_id"}),
]);

export const workshopJobCards = mysqlTable("workshop_job_cards", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	vehicleId: int("vehicle_id").notNull(),
	customerId: int("customer_id").notNull(),
	jobNumber: varchar("job_number", { length: 100 }).notNull(),
	serviceType: varchar("service_type", { length: 150 }).notNull(),
	description: text(),
	status: mysqlEnum(['pending','in_progress','quality_check','completed','delivered','cancelled']).default('pending').notNull(),
	priority: mysqlEnum(['normal','urgent','express']).default('normal'),
	estimatedCost: text("estimated_cost"),
	actualCost: text("actual_cost"),
	technicianId: int("technician_id"),
	estimatedHours: double("estimated_hours"),
	actualHours: double("actual_hours"),
	startDate: varchar("start_date", { length: 60 }),
	completionDate: varchar("completion_date", { length: 60 }),
	warrantyMonths: int("warranty_months").default(3),
	customerApproval: tinyint("customer_approval").default(0),
	approvedAt: varchar("approved_at", { length: 60 }),
	invoiceId: int("invoice_id"),
	notes: text(),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
	updatedAt: varchar("updated_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_job_cards_id"}),
]);

export const workshopJobLabor = mysqlTable("workshop_job_labor", {
	id: int().autoincrement().notNull(),
	jobCardId: int("job_card_id").notNull(),
	technicianId: int("technician_id"),
	description: text(),
	hours: double(),
	rate: text(),
	total: text(),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_job_labor_id"}),
]);

export const workshopJobParts = mysqlTable("workshop_job_parts", {
	id: int().autoincrement().notNull(),
	jobCardId: int("job_card_id").notNull(),
	partName: varchar("part_name", { length: 255 }).notNull(),
	partNumber: varchar("part_number", { length: 100 }),
	quantity: double().default(1),
	unitPrice: text("unit_price"),
	totalPrice: text("total_price"),
	supplierId: int("supplier_id"),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_job_parts_id"}),
]);

export const workshopPayments = mysqlTable("workshop_payments", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	jobCardId: int("job_card_id"),
	estimateId: int("estimate_id"),
	amount: text().notNull(),
	paymentMethod: mysqlEnum("payment_method", ['cash','card','bank_transfer','sadad','wallet','insurance']).default('cash'),
	referenceNumber: varchar("reference_number", { length: 100 }),
	notes: text(),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_payments_id"}),
]);

export const workshopServiceTypes = mysqlTable("workshop_service_types", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameAr: varchar("name_ar", { length: 255 }),
	description: text(),
	estimatedHours: double("estimated_hours"),
	defaultPrice: text("default_price"),
	isActive: tinyint("is_active").default(1),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_service_types_id"}),
]);

export const workshopTechnicians = mysqlTable("workshop_technicians", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	email: varchar({ length: 255 }),
	specialty: varchar({ length: 150 }),
	hourlyRate: text("hourly_rate"),
	isActive: tinyint("is_active").default(1),
	jobsCompleted: int("jobs_completed").default(0),
	avgRating: double("avg_rating"),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_technicians_id"}),
]);

export const workshopVehicles = mysqlTable("workshop_vehicles", {
	id: int().autoincrement().notNull(),
	tenantId: int("tenant_id").notNull(),
	customerId: int("customer_id").notNull(),
	make: varchar({ length: 100 }).notNull(),
	model: varchar({ length: 100 }).notNull(),
	year: int().notNull(),
	plateNumber: varchar("plate_number", { length: 50 }),
	vin: varchar({ length: 100 }),
	color: varchar({ length: 50 }),
	mileage: varchar({ length: 50 }),
	nextServiceMileage: varchar("next_service_mileage", { length: 50 }),
	nextServiceDate: varchar("next_service_date", { length: 60 }),
	insuranceCompany: varchar("insurance_company", { length: 255 }),
	policyNumber: varchar("policy_number", { length: 100 }),
	insuranceExpiry: varchar("insurance_expiry", { length: 60 }),
	registrationExpiry: varchar("registration_expiry", { length: 60 }),
	notes: text(),
	createdAt: varchar("created_at", { length: 60 }).default(sql`(now())`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "workshop_vehicles_id"}),
]);

export const wpsExceptions = mysqlTable("wps_exceptions", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
	payrollPeriodId: bigint("payroll_period_id", { mode: "number", unsigned: true }).notNull(),
	exceptionType: mysqlEnum("exception_type", ['unpaid_leave','disciplinary_deduction','bank_account_change','other']).notNull(),
	amount: decimal({ precision: 18, scale: 4 }).default('0.0000'),
	reason: text(),
	approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
	status: mysqlEnum(['pending','approved','rejected']).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("wps_exc_tenant_idx").on(table.tenantId, table.payrollPeriodId),
	primaryKey({ columns: [table.id], name: "wps_exceptions_id"}),
]);

export const wpsSubmissions = mysqlTable("wps_submissions", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	payrollPeriodId: bigint("payroll_period_id", { mode: "number", unsigned: true }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	submissionDate: date("submission_date", { mode: 'string' }).notNull(),
	bankFormat: varchar("bank_format", { length: 50 }).default('sarie').notNull(),
	totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default('0.0000').notNull(),
	employeeCount: int("employee_count").default(0).notNull(),
	complianceRate: decimal("compliance_rate", { precision: 5, scale: 2 }),
	fileContent: longtext("file_content"),
	fileName: varchar("file_name", { length: 255 }),
	status: mysqlEnum(['draft','submitted','acknowledged','rejected']).default('draft'),
	referenceNumber: varchar("reference_number", { length: 100 }),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("wps_tenant_idx").on(table.tenantId, table.payrollPeriodId),
	primaryKey({ columns: [table.id], name: "wps_submissions_id"}),
]);

export const wsCollaborationSessions = mysqlTable("ws_collaboration_sessions", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	sessionName: varchar("session_name", { length: 255 }).notNull(),
	sessionType: mysqlEnum("session_type", ['document_review','dashboard','record_edit','chat']).notNull(),
	entityType: varchar("entity_type", { length: 100 }),
	entityId: bigint("entity_id", { mode: "number", unsigned: true }),
	createdBy: bigint("created_by", { mode: "number", unsigned: true }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
},
(table) => [
	index("ws_collab_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ws_collaboration_sessions_id"}),
	unique("id").on(table.id),
]);

export const wsConnections = mysqlTable("ws_connections", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	sessionId: varchar("session_id", { length: 255 }),
	deviceInfo: varchar("device_info", { length: 500 }),
	connectedAt: timestamp("connected_at", { mode: 'string' }).default(sql`(now())`),
	disconnectedAt: timestamp("disconnected_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
},
(table) => [
	index("ws_conn_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ws_connections_id"}),
	unique("id").on(table.id),
]);

export const wsNotifications = mysqlTable("ws_notifications", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	title: varchar({ length: 255 }).notNull(),
	body: text(),
	type: mysqlEnum(['info','warning','error','success']).default('info'),
	sourceModule: varchar("source_module", { length: 100 }),
	sourceEntityType: varchar("source_entity_type", { length: 100 }),
	sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
	actionUrl: varchar("action_url", { length: 1024 }),
	isRead: tinyint("is_read").default(0),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("ws_notif_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ws_notifications_id"}),
	unique("id").on(table.id),
]);

export const wsPresence = mysqlTable("ws_presence", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	status: mysqlEnum(['online','away','busy','offline']).default('offline'),
	lastSeen: timestamp("last_seen", { mode: 'string' }).default(sql`(now())`),
	currentModule: varchar("current_module", { length: 100 }),
	customStatus: varchar("custom_status", { length: 255 }),
	isActive: tinyint("is_active").default(1),
},
(table) => [
	index("ws_presence_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ws_presence_id"}),
	unique("id").on(table.id),
]);

export const wsSessionActivities = mysqlTable("ws_session_activities", {
	id: serial().notNull(),
	sessionId: bigint("session_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	activityType: mysqlEnum("activity_type", ['view','edit','comment','approve','reject','mention']).notNull(),
	activityData: json("activity_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "ws_session_activities_id"}),
	unique("id").on(table.id),
]);

export const wsSessionParticipants = mysqlTable("ws_session_participants", {
	id: serial().notNull(),
	sessionId: bigint("session_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	role: mysqlEnum(['owner','editor','viewer']).default('viewer'),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default(sql`(now())`),
	leftAt: timestamp("left_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
},
(table) => [
	primaryKey({ columns: [table.id], name: "ws_session_participants_id"}),
	unique("id").on(table.id),
]);

export const wsUserTyping = mysqlTable("ws_user_typing", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	sessionId: bigint("session_id", { mode: "number", unsigned: true }),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	isTyping: tinyint("is_typing").default(0),
	lastTypingAt: timestamp("last_typing_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	index("ws_typing_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "ws_user_typing_id"}),
	unique("id").on(table.id),
]);

export const zatcaActivityLogs = mysqlTable("zatca_activity_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	action: varchar({ length: 100 }).notNull(),
	message: text(),
	metadata: json(),
	ipAddress: varchar("ip_address", { length: 100 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("zatca_activity_invoice_idx").on(table.tenantId, table.invoiceId),
	index("zatca_activity_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "zatca_activity_logs_id"}),
	unique("id").on(table.id),
]);

export const zatcaApiLogs = mysqlTable("zatca_api_logs", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
	action: mysqlEnum(['generate_xml','generate_qr','sign_invoice','compliance_check','clearance','reporting','sync_status','download_response']).notNull(),
	environment: mysqlEnum(['sandbox','production']).default('sandbox').notNull(),
	endpoint: varchar({ length: 500 }),
	requestPayload: json("request_payload"),
	responsePayload: json("response_payload"),
	httpStatus: int("http_status"),
	status: mysqlEnum(['success','pending','failed']).default('pending').notNull(),
	errorCode: varchar("error_code", { length: 100 }),
	errorMessage: text("error_message"),
	ipAddress: varchar("ip_address", { length: 100 }),
	userAgent: text("user_agent"),
	userId: bigint("user_id", { mode: "number", unsigned: true }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("zatca_api_logs_action_idx").on(table.tenantId, table.action),
	index("zatca_api_logs_invoice_idx").on(table.tenantId, table.invoiceId),
	index("zatca_api_logs_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "zatca_api_logs_id"}),
	unique("id").on(table.id),
]);

export const zatcaCertificates = mysqlTable("zatca_certificates", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	credentialId: bigint("credential_id", { mode: "number", unsigned: true }),
	certificateType: mysqlEnum("certificate_type", ['ccsid','pcsid','csr','public_key','private_key']).notNull(),
	environment: mysqlEnum(['sandbox','production']).default('sandbox').notNull(),
	serialNumber: varchar("serial_number", { length: 255 }),
	certificateHash: varchar("certificate_hash", { length: 255 }),
	encryptedPayload: text("encrypted_payload").notNull(),
	issuedAt: timestamp("issued_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("zatca_cert_expiry_idx").on(table.tenantId, table.expiresAt),
	index("zatca_cert_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "zatca_certificates_id"}),
	unique("id").on(table.id),
]);

export const zatcaCredentials = mysqlTable("zatca_credentials", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	environment: mysqlEnum(['sandbox','production']).default('sandbox').notNull(),
	vatNumber: varchar("vat_number", { length: 15 }).notNull(),
	organizationIdentifier: varchar("organization_identifier", { length: 255 }),
	egsSerialNumber: varchar("egs_serial_number", { length: 255 }),
	deviceUuid: varchar("device_uuid", { length: 100 }),
	otpEncrypted: text("otp_encrypted"),
	csrEncrypted: text("csr_encrypted"),
	certificateEncrypted: text("certificate_encrypted"),
	privateKeyEncrypted: text("private_key_encrypted"),
	publicKeyEncrypted: text("public_key_encrypted"),
	complianceCsidEncrypted: text("compliance_csid_encrypted"),
	productionCsidEncrypted: text("production_csid_encrypted"),
	accessTokenEncrypted: text("access_token_encrypted"),
	secretTokenEncrypted: text("secret_token_encrypted"),
	isActive: tinyint("is_active").default(1),
	lastTestAt: timestamp("last_test_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	index("zatca_credentials_env_idx").on(table.tenantId, table.environment),
	index("zatca_credentials_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "zatca_credentials_id"}),
	unique("id").on(table.id),
]);

export const zatcaEgsDevices = mysqlTable("zatca_egs_devices", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	branchId: bigint("branch_id", { mode: "number", unsigned: true }),
	deviceUuid: varchar("device_uuid", { length: 255 }).notNull(),
	deviceName: varchar("device_name", { length: 255 }).notNull(),
	deviceType: mysqlEnum("device_type", ['pos_terminal','desktop','mobile','web','kiosk']).notNull(),
	serialNumber: varchar("serial_number", { length: 255 }),
	onboardingStatus: mysqlEnum("onboarding_status", ['not_started','csr_generated','compliance_csid_obtained','compliance_check_passed','production_csid_obtained','active','suspended']).default('not_started').notNull(),
	complianceCsid: text("compliance_csid"),
	productionCsid: text("production_csid"),
	privateKey: text("private_key"),
	publicKey: text("public_key"),
	certificate: text(),
	csrContent: text("csr_content"),
	invoiceCounter: int("invoice_counter").default(0).notNull(),
	lastInvoiceHash: varchar("last_invoice_hash", { length: 255 }),
	isActive: tinyint("is_active").default(1),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "zatca_egs_devices_id"}),
	unique("zatca_devices_uuid").on(table.deviceUuid),
]);

export const zatcaInvoiceArchive = mysqlTable("zatca_invoice_archive", {
	id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	deviceId: bigint("device_id", { mode: "number", unsigned: true }),
	invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
	invoiceType: mysqlEnum("invoice_type", ['standard','simplified','credit_note','debit_note']).notNull(),
	uuid: varchar({ length: 255 }).notNull(),
	icv: int().notNull(),
	pih: varchar({ length: 255 }).notNull(),
	invoiceHash: varchar("invoice_hash", { length: 255 }).notNull(),
	ublXml: text("ubl_xml").notNull(),
	qrCode: text("qr_code").notNull(),
	pdfPath: text("pdf_path"),
	signature: text(),
	submissionStatus: mysqlEnum("submission_status", ['draft','pending','cleared','reported','failed','warning','rejected']).default('draft').notNull(),
	zatcaResponse: json("zatca_response"),
	zatcaErrors: json("zatca_errors"),
	zatcaWarnings: json("zatca_warnings"),
	issuedAt: timestamp("issued_at", { mode: 'string' }).notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	clearedAt: timestamp("cleared_at", { mode: 'string' }),
	isImmutable: tinyint("is_immutable").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("idx_invoice").on(table.invoiceId),
	index("idx_status").on(table.submissionStatus),
	index("idx_tenant").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "zatca_invoice_archive_id"}),
	unique("zatca_archive_invoice").on(table.tenantId, table.invoiceNumber),
]);

export const zatcaInvoiceStatus = mysqlTable("zatca_invoice_status", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	invoiceUuid: varchar("invoice_uuid", { length: 100 }),
	invoiceCounter: int("invoice_counter").default(0).notNull(),
	invoiceHash: varchar("invoice_hash", { length: 255 }),
	previousInvoiceHash: varchar("previous_invoice_hash", { length: 255 }),
	digitalSignature: text("digital_signature"),
	status: mysqlEnum(['draft','signed','pending','submitted','cleared','reported','rejected','failed']).default('draft').notNull(),
	clearanceStatus: varchar("clearance_status", { length: 100 }),
	reportingStatus: varchar("reporting_status", { length: 100 }),
	zatcaRequestId: varchar("zatca_request_id", { length: 255 }),
	zatcaResponseId: varchar("zatca_response_id", { length: 255 }),
	errorCode: varchar("error_code", { length: 100 }),
	errorMessage: text("error_message"),
	warnings: json(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	clearedAt: timestamp("cleared_at", { mode: 'string' }),
	reportedAt: timestamp("reported_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	index("zatca_invoice_status_status_idx").on(table.tenantId, table.status),
	primaryKey({ columns: [table.id], name: "zatca_invoice_status_id"}),
	unique("id").on(table.id),
	unique("zatca_invoice_status_invoice_uidx").on(table.tenantId, table.invoiceId),
]);

export const zatcaOfflineQueue = mysqlTable("zatca_offline_queue", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	action: mysqlEnum(['clearance','reporting']).notNull(),
	uuid: varchar({ length: 255 }).notNull(),
	xmlPayload: text("xml_payload").notNull(),
	signedXml: text("signed_xml"),
	invoiceHash: varchar("invoice_hash", { length: 255 }),
	previousInvoiceHash: varchar("previous_invoice_hash", { length: 255 }),
	status: mysqlEnum(['pending','submitted','cleared','rejected','retrying']).default('pending').notNull(),
	retryCount: int("retry_count").default(0),
	lastError: text("last_error"),
	zatcaResponse: text("zatca_response"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	clearedAt: timestamp("cleared_at", { mode: 'string' }),
	nextRetryAt: timestamp("next_retry_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("zatca_queue_invoice_idx").on(table.tenantId, table.invoiceId),
	index("zatca_queue_status_idx").on(table.tenantId, table.status),
	index("zatca_queue_tenant_idx").on(table.tenantId),
	primaryKey({ columns: [table.id], name: "zatca_offline_queue_id"}),
	unique("id").on(table.id),
]);

export const zatcaQrCodes = mysqlTable("zatca_qr_codes", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	tlvBase64: text("tlv_base64").notNull(),
	qrImageDataUrl: text("qr_image_data_url"),
	tags: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("zatca_qr_tenant_invoice_idx").on(table.tenantId, table.invoiceId),
	primaryKey({ columns: [table.id], name: "zatca_qr_codes_id"}),
	unique("id").on(table.id),
]);

export const zatcaXmlDocuments = mysqlTable("zatca_xml_documents", {
	id: serial().notNull(),
	tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
	invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
	documentType: mysqlEnum("document_type", ['standard','simplified','credit_note','debit_note']).default('standard').notNull(),
	unsignedXml: text("unsigned_xml"),
	signedXml: text("signed_xml"),
	clearedXml: text("cleared_xml"),
	xmlHash: varchar("xml_hash", { length: 255 }),
	isArchived: tinyint("is_archived").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("zatca_xml_hash_idx").on(table.xmlHash),
	index("zatca_xml_tenant_invoice_idx").on(table.tenantId, table.invoiceId),
	primaryKey({ columns: [table.id], name: "zatca_xml_documents_id"}),
	unique("id").on(table.id),
]);
