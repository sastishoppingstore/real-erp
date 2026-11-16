CREATE TABLE `dc_advance_recovery` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`advance_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`recovered_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`balance` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('active','closed') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_advance_recovery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_advances` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`labour_id` bigint unsigned NOT NULL,
	`advance_date` date NOT NULL,
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`recovered_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`balance` decimal(18,4) NOT NULL DEFAULT '0',
	`installments` int NOT NULL DEFAULT 1,
	`status` enum('active','closed','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_advances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_approval_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`title` varchar(255),
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`current_step` int NOT NULL DEFAULT 1,
	`total_steps` int NOT NULL DEFAULT 1,
	`status` enum('pending','in_progress','approved','rejected','returned','cancelled') NOT NULL DEFAULT 'pending',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_approval_steps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`request_id` bigint unsigned NOT NULL,
	`step_no` int NOT NULL DEFAULT 1,
	`approver_role` varchar(60),
	`approver_id` bigint unsigned,
	`status` enum('pending','approved','rejected','skipped') NOT NULL DEFAULT 'pending',
	`comments` text,
	`acted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_approval_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_attendance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`labour_id` bigint unsigned NOT NULL,
	`attendance_date` date NOT NULL,
	`status` enum('present','absent','leave','holiday','sick') NOT NULL DEFAULT 'present',
	`check_in` varchar(8),
	`check_out` varchar(8),
	`normal_hours` decimal(6,2) NOT NULL DEFAULT '8',
	`overtime_hours` decimal(6,2) NOT NULL DEFAULT '0',
	`source` enum('manual','mobile','biometric','gps') NOT NULL DEFAULT 'manual',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_audit_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`entity_type` varchar(60) NOT NULL,
	`entity_id` bigint unsigned,
	`action` enum('create','update','delete','approve','reject','login','export') NOT NULL,
	`before` json,
	`after` json,
	`user_id` bigint unsigned,
	`ip_address` varchar(60),
	`user_agent` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_back_charges` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`subcontract_id` bigint unsigned,
	`ipc_id` bigint unsigned,
	`charge_date` date NOT NULL,
	`reason` varchar(500),
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','approved','applied','cancelled') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_back_charges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_boq_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`boq_id` bigint unsigned NOT NULL,
	`section_id` bigint unsigned,
	`work_item_id` bigint unsigned,
	`line_no` int NOT NULL DEFAULT 0,
	`description_en` varchar(500) NOT NULL,
	`description_ar` varchar(500),
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'm2',
	`material_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`labour_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`equipment_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`overhead_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`profit_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`unit_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_boq_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_boq_sections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`boq_id` bigint unsigned NOT NULL,
	`code` varchar(40),
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_boq_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_boqs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`boq_no` varchar(60) NOT NULL,
	`revision` varchar(20) NOT NULL DEFAULT 'R0',
	`title_en` varchar(255),
	`title_ar` varchar(255),
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','submitted','approved','rejected','superseded') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_boqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_budget_consumption` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned NOT NULL,
	`budget_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`wastage_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`budget_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`variance_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_budget_consumption_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_buildings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`code` varchar(40),
	`name_en` varchar(160) NOT NULL,
	`name_ar` varchar(160),
	`levels` int,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_buildings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_camp_allocations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`camp_id` bigint unsigned NOT NULL,
	`labour_id` bigint unsigned NOT NULL,
	`room_no` varchar(40),
	`bed_no` varchar(40),
	`start_date` date,
	`end_date` date,
	`status` enum('active','vacated') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_camp_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_camps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name_en` varchar(160) NOT NULL,
	`name_ar` varchar(160),
	`city` varchar(120),
	`address` text,
	`total_rooms` int NOT NULL DEFAULT 0,
	`total_beds` int NOT NULL DEFAULT 0,
	`monthly_rent` decimal(18,4) NOT NULL DEFAULT '0',
	`utilities_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_camps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_cheques` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`direction` enum('received','issued') NOT NULL,
	`party_type` enum('client','supplier','subcontractor','other') NOT NULL,
	`party_id` bigint unsigned,
	`cheque_no` varchar(60),
	`bank_name` varchar(120),
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`cheque_date` date,
	`due_date` date,
	`status` enum('pending','deposited','cleared','bounced','cancelled') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_cheques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_clients` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`customer_id` bigint unsigned,
	`code` varchar(40),
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`cr_number` varchar(40),
	`vat_number` varchar(40),
	`national_address` varchar(255),
	`building_no` varchar(20),
	`street_en` varchar(255),
	`street_ar` varchar(255),
	`district_en` varchar(120),
	`district_ar` varchar(120),
	`city` varchar(120),
	`postal_code` varchar(20),
	`country` varchar(80) NOT NULL DEFAULT 'Saudi Arabia',
	`contact_person` varchar(255),
	`phone` varchar(50),
	`email` varchar(320),
	`credit_limit` decimal(18,4) NOT NULL DEFAULT '0',
	`payment_terms_days` int NOT NULL DEFAULT 30,
	`rating` enum('A','B','C','D') DEFAULT 'B',
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_company_licences` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`licence_type` varchar(120) NOT NULL,
	`licence_number` varchar(120),
	`issuing_authority` varchar(160),
	`issue_date` date,
	`expiry_date` date,
	`file_url` varchar(1000),
	`status` enum('valid','expiring','expired') NOT NULL DEFAULT 'valid',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_company_licences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_consultants` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(40),
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`kind` enum('consultant','main_contractor','supervisor') NOT NULL DEFAULT 'consultant',
	`cr_number` varchar(40),
	`vat_number` varchar(40),
	`contact_person` varchar(255),
	`phone` varchar(50),
	`email` varchar(320),
	`address` text,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_consultants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_contract_payment_terms` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned NOT NULL,
	`milestone_no` int NOT NULL DEFAULT 1,
	`description_en` varchar(255),
	`description_ar` varchar(255),
	`percent` decimal(7,3) NOT NULL DEFAULT '0',
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`due_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_contract_payment_terms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_contracts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`contract_no` varchar(80) NOT NULL,
	`contract_date` date,
	`contract_value` decimal(18,4) NOT NULL DEFAULT '0',
	`advance_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`retention_percent` decimal(5,2) NOT NULL DEFAULT '10',
	`penalty_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`performance_bond` decimal(18,4) NOT NULL DEFAULT '0',
	`insurance_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','active','completed','terminated') NOT NULL DEFAULT 'draft',
	`terms` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_document_expiry` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`entity_type` enum('labour','supplier','subcontractor','equipment','vehicle','company') NOT NULL,
	`entity_id` bigint unsigned NOT NULL,
	`doc_type` varchar(80) NOT NULL,
	`doc_number` varchar(80),
	`issue_date` date,
	`expiry_date` date NOT NULL,
	`reminder_days` int NOT NULL DEFAULT 30,
	`file_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_document_expiry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_equipment` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`asset_id` bigint unsigned,
	`code` varchar(60) NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`kind` enum('tool','machine','vehicle','scaffolding','lift','other') NOT NULL DEFAULT 'tool',
	`ownership` enum('owned','rented') NOT NULL DEFAULT 'owned',
	`plate_number` varchar(30),
	`hourly_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`daily_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_equipment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_equipment_allocations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`operator_id` bigint unsigned,
	`start_date` date,
	`end_date` date,
	`billing_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('active','returned') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_equipment_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_equipment_maintenance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned NOT NULL,
	`maintenance_date` date NOT NULL,
	`maintenance_type` enum('preventive','corrective','inspection') NOT NULL DEFAULT 'preventive',
	`description` varchar(500),
	`cost` decimal(18,4) NOT NULL DEFAULT '0',
	`next_due_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_equipment_maintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_expense_claims` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`employee_id` bigint unsigned,
	`claim_no` varchar(60),
	`claim_date` date NOT NULL,
	`description` varchar(500),
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','submitted','approved','rejected','paid') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_expense_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_fixed_assets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned,
	`asset_code` varchar(60),
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`purchase_date` date,
	`purchase_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`salvage_value` decimal(18,4) NOT NULL DEFAULT '0',
	`useful_life_years` int NOT NULL DEFAULT 5,
	`accumulated_depreciation` decimal(18,4) NOT NULL DEFAULT '0',
	`book_value` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('active','disposed','idle') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_fixed_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_floors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`building_id` bigint unsigned NOT NULL,
	`code` varchar(40),
	`name_en` varchar(160) NOT NULL,
	`name_ar` varchar(160),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_floors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_fuel_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`fuel_date` date NOT NULL,
	`litres` decimal(12,3) NOT NULL DEFAULT '0',
	`rate_per_litre` decimal(18,4) NOT NULL DEFAULT '0',
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`odometer` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_fuel_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_grn_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`grn_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`accepted_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`rejected_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'pcs',
	`unit_price` decimal(18,4) NOT NULL DEFAULT '0',
	`batch_no` varchar(80),
	`expiry_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_grn_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_grns` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`po_id` bigint unsigned,
	`supplier_id` bigint unsigned,
	`grn_no` varchar(60) NOT NULL,
	`receipt_date` date NOT NULL,
	`invoice_ref` varchar(80),
	`status` enum('draft','confirmed','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_grns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_handovers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`handover_date` date,
	`completion_certificate_no` varchar(60),
	`completion_certificate_url` varchar(1000),
	`dlp_start_date` date,
	`dlp_end_date` date,
	`warranty_months` int NOT NULL DEFAULT 12,
	`status` enum('pending','handed_over','dlp','closed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_handovers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_incidents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`incident_date` date NOT NULL,
	`incident_type` enum('near_miss','first_aid','medical','lost_time','fatality','property') NOT NULL DEFAULT 'near_miss',
	`description` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
	`root_cause` text,
	`corrective_action` text,
	`lost_days` int NOT NULL DEFAULT 0,
	`status` enum('open','investigating','closed') NOT NULL DEFAULT 'open',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_inspection_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`unit_id` bigint unsigned,
	`room_id` bigint unsigned,
	`ir_no` varchar(40),
	`activity` varchar(160) NOT NULL,
	`inspection_date` date,
	`inspector_id` bigint unsigned,
	`status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
	`result` enum('pass','fail','conditional','pending') NOT NULL DEFAULT 'pending',
	`remarks` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_inspection_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_invoice_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned NOT NULL,
	`work_item_id` bigint unsigned,
	`description_en` varchar(500),
	`description_ar` varchar(500),
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'm2',
	`unit_price` decimal(18,4) NOT NULL DEFAULT '0',
	`vat_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`line_total` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_invoice_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_invoices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`client_id` bigint unsigned,
	`invoice_no` varchar(60) NOT NULL,
	`invoice_type` enum('tax','simplified','credit_note','debit_note') NOT NULL DEFAULT 'tax',
	`billing_type` enum('advance','progress','final','retention_release','variation','material','labour','service','rental') NOT NULL DEFAULT 'progress',
	`invoice_date` date NOT NULL,
	`due_date` date,
	`subtotal` decimal(18,4) NOT NULL DEFAULT '0',
	`discount_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`retention_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`advance_recovery` decimal(18,4) NOT NULL DEFAULT '0',
	`penalty_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`vat_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`vat_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`balance_due` decimal(18,4) NOT NULL DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`status` enum('draft','submitted','cleared','reported','approved','partially_paid','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`zatca_uuid` varchar(80),
	`zatca_invoice_hash` varchar(200),
	`zatca_qr_code` text,
	`zatca_xml` mediumtext,
	`zatca_status` enum('pending','reported','cleared','rejected','warning') DEFAULT 'pending',
	`zatca_response` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_ipc_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`ipc_id` bigint unsigned NOT NULL,
	`work_order_id` bigint unsigned,
	`description` varchar(500),
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`rate` decimal(18,4) NOT NULL DEFAULT '0',
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_ipc_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_ipcs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`subcontract_id` bigint unsigned NOT NULL,
	`ipc_no` varchar(60) NOT NULL,
	`period_from` date,
	`period_to` date,
	`work_done_value` decimal(18,4) NOT NULL DEFAULT '0',
	`retention_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`advance_recovery` decimal(18,4) NOT NULL DEFAULT '0',
	`back_charges` decimal(18,4) NOT NULL DEFAULT '0',
	`penalty_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`net_payable` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','submitted','certified','approved','paid','rejected') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_ipcs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_labour` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned,
	`code` varchar(40),
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`iqama_number` varchar(30),
	`iqama_expiry` date,
	`passport_number` varchar(30),
	`passport_expiry` date,
	`nationality` varchar(80),
	`profession` varchar(120),
	`labour_category` enum('carpenter','gypsum_installer','painter','helper','foreman','supervisor','electrician','sealer','tiler','other') NOT NULL DEFAULT 'other',
	`sponsorship` enum('company','supplied','subcontract') NOT NULL DEFAULT 'company',
	`supplier_id` bigint unsigned,
	`gosi_number` varchar(40),
	`medical_insurance_expiry` date,
	`work_permit_expiry` date,
	`driving_licence_expiry` date,
	`photo_url` varchar(500),
	`daily_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`piece_rate_per_m2` decimal(18,4) NOT NULL DEFAULT '0',
	`camp_id` bigint unsigned,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_labour_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_mars` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`mar_no` varchar(40),
	`material_id` bigint unsigned,
	`description_en` varchar(255),
	`description_ar` varchar(255),
	`manufacturer` varchar(160),
	`brand` varchar(160),
	`submittal_url` varchar(1000),
	`status` enum('draft','submitted','approved','rejected','returned') NOT NULL DEFAULT 'draft',
	`remarks` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_mars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_material_categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(40),
	`name_en` varchar(160) NOT NULL,
	`name_ar` varchar(160),
	`parent_id` bigint unsigned,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_material_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_material_issue_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`issue_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'pcs',
	`unit_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_material_issue_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_material_issues` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`store_id` bigint unsigned NOT NULL,
	`room_id` bigint unsigned,
	`work_item_id` bigint unsigned,
	`issue_no` varchar(60),
	`issue_date` date NOT NULL,
	`issued_to` bigint unsigned,
	`status` enum('draft','issued','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_material_issues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_material_request_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`mr_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'pcs',
	`required_date` date,
	`remarks` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_material_request_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_material_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`mr_no` varchar(60) NOT NULL,
	`request_date` date NOT NULL,
	`required_date` date,
	`created_by` bigint unsigned,
	`status` enum('draft','submitted','approved','rejected','fulfilled','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_material_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_materials` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`item_id` bigint unsigned,
	`category_id` bigint unsigned,
	`code` varchar(60) NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`specification` text,
	`uom` varchar(20) NOT NULL DEFAULT 'pcs',
	`alt_uom` varchar(20),
	`alt_uom_factor` decimal(18,6) NOT NULL DEFAULT '1',
	`min_stock_level` decimal(18,4) NOT NULL DEFAULT '0',
	`reorder_level` decimal(18,4) NOT NULL DEFAULT '0',
	`last_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`avg_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`is_batch_tracked` boolean DEFAULT false,
	`is_expiry_tracked` boolean DEFAULT false,
	`barcode` varchar(80),
	`default_vat_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`is_active` boolean DEFAULT true,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_ncrs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`ncr_no` varchar(60),
	`title` varchar(255) NOT NULL,
	`description` text,
	`severity` enum('minor','major','critical') NOT NULL DEFAULT 'minor',
	`corrective_action` text,
	`created_by` bigint unsigned,
	`assigned_to` bigint unsigned,
	`due_date` date,
	`status` enum('open','in_progress','closed','verified') NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_ncrs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`channel` enum('in_app','email','whatsapp','sms') NOT NULL DEFAULT 'in_app',
	`category` enum('expiry','delay','low_stock','overdue_invoice','pending_approval','general') NOT NULL DEFAULT 'general',
	`title` varchar(255),
	`body` text,
	`link` varchar(500),
	`is_read` boolean DEFAULT false,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`payee_type` enum('supplier','subcontractor','employee','other') NOT NULL DEFAULT 'supplier',
	`payee_id` bigint unsigned,
	`payment_no` varchar(60),
	`payment_date` date NOT NULL,
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`payment_method` enum('cash','bank_transfer','cheque','card','other') NOT NULL DEFAULT 'bank_transfer',
	`reference` varchar(120),
	`status` enum('draft','approved','paid','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_payroll_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`run_id` bigint unsigned NOT NULL,
	`labour_id` bigint unsigned NOT NULL,
	`basic_salary` decimal(18,4) NOT NULL DEFAULT '0',
	`housing_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`transport_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`food_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`other_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`overtime_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`deductions` decimal(18,4) NOT NULL DEFAULT '0',
	`advance_deduction` decimal(18,4) NOT NULL DEFAULT '0',
	`gosi_employee` decimal(18,4) NOT NULL DEFAULT '0',
	`gosi_employer` decimal(18,4) NOT NULL DEFAULT '0',
	`eosb_accrual` decimal(18,4) NOT NULL DEFAULT '0',
	`net_pay` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_payroll_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_payroll_runs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`period_month` int NOT NULL,
	`period_year` int NOT NULL,
	`run_no` varchar(60),
	`status` enum('draft','calculated','approved','paid','cancelled') NOT NULL DEFAULT 'draft',
	`total_gross` decimal(18,4) NOT NULL DEFAULT '0',
	`total_deductions` decimal(18,4) NOT NULL DEFAULT '0',
	`total_net` decimal(18,4) NOT NULL DEFAULT '0',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_payroll_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_petty_cash` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`entry_date` date NOT NULL,
	`description` varchar(500),
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`entry_type` enum('top_up','expense') NOT NULL DEFAULT 'expense',
	`receipt_url` varchar(1000),
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_petty_cash_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_portal_approvals` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`portal_user_id` bigint unsigned NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` bigint unsigned NOT NULL,
	`decision` enum('approved','rejected','returned') NOT NULL,
	`comments` text,
	`decided_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_portal_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_portal_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`client_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`is_active` boolean DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_portal_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_ppe_issuance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`labour_id` bigint unsigned NOT NULL,
	`item_name` varchar(160) NOT NULL,
	`issue_date` date NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`expiry_date` date,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_ppe_issuance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_productivity` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`labour_id` bigint unsigned,
	`work_item_id` bigint unsigned,
	`work_date` date NOT NULL,
	`completed_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'm2',
	`hours_worked` decimal(6,2) NOT NULL DEFAULT '0',
	`qty_per_hour` decimal(18,4) NOT NULL DEFAULT '0',
	`piece_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`piece_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_productivity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_progress_bills` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`bill_no` varchar(60),
	`period_from` date,
	`period_to` date,
	`work_done_value` decimal(18,4) NOT NULL DEFAULT '0',
	`cumulative_value` decimal(18,4) NOT NULL DEFAULT '0',
	`retention_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`advance_recovery` decimal(18,4) NOT NULL DEFAULT '0',
	`net_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','submitted','certified','approved','invoiced','rejected') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_progress_bills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_progress_entries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`building_id` bigint unsigned,
	`floor_id` bigint unsigned,
	`unit_id` bigint unsigned,
	`room_id` bigint unsigned,
	`work_item_id` bigint unsigned,
	`activity` varchar(160) NOT NULL,
	`planned_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`completed_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'm2',
	`progress_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`entry_date` date NOT NULL,
	`created_by` bigint unsigned,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_progress_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_project_documents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`building_id` bigint unsigned,
	`floor_id` bigint unsigned,
	`unit_id` bigint unsigned,
	`room_id` bigint unsigned,
	`kind` enum('drawing','shop_drawing','photo','approval','certificate','other') NOT NULL DEFAULT 'drawing',
	`title` varchar(255) NOT NULL,
	`file_name` varchar(255),
	`file_url` varchar(1000),
	`mime_type` varchar(120),
	`revision` varchar(20),
	`status` enum('draft','submitted','approved','rejected','superseded') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_project_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_projects` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`legacy_project_id` bigint unsigned,
	`project_code` varchar(60) NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`client_id` bigint unsigned,
	`consultant_id` bigint unsigned,
	`main_contractor_id` bigint unsigned,
	`branch_id` bigint unsigned,
	`company_id` bigint unsigned,
	`contract_number` varchar(80),
	`contract_value` decimal(18,4) NOT NULL DEFAULT '0',
	`budget` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`city` varchar(120),
	`district_en` varchar(120),
	`district_ar` varchar(120),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`project_manager_id` bigint unsigned,
	`start_date` date,
	`end_date` date,
	`handover_date` date,
	`progress` decimal(7,3) NOT NULL DEFAULT '0',
	`status` enum('tender','awarded','running','on_hold','completed','handed_over','dlp','cancelled') NOT NULL DEFAULT 'tender',
	`retention_percent` decimal(5,2) NOT NULL DEFAULT '10',
	`advance_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`vat_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`description` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `dc_projects_code_uq` UNIQUE(`tenant_id`,`project_code`)
);
--> statement-breakpoint
CREATE TABLE `dc_purchase_order_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`po_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`received_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'pcs',
	`unit_price` decimal(18,4) NOT NULL DEFAULT '0',
	`vat_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`line_total` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_purchase_order_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_purchase_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`po_no` varchar(60) NOT NULL,
	`order_date` date,
	`expected_date` date,
	`subtotal` decimal(18,4) NOT NULL DEFAULT '0',
	`vat_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`vat_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','submitted','approved','partially_received','received','closed','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_purchase_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`mr_id` bigint unsigned,
	`pr_no` varchar(60) NOT NULL,
	`request_date` date NOT NULL,
	`status` enum('draft','submitted','approved','rejected','converted','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_purchase_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_qc_checklists` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`activity` varchar(160),
	`items` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_qc_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_qc_results` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`room_id` bigint unsigned,
	`checklist_id` bigint unsigned,
	`inspection_date` date NOT NULL,
	`results` json,
	`score` decimal(7,3) NOT NULL DEFAULT '0',
	`status` enum('pass','fail','conditional') NOT NULL DEFAULT 'pass',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_qc_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_quotation_revisions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`quotation_id` bigint unsigned NOT NULL,
	`revision_no` int NOT NULL DEFAULT 1,
	`snapshot` json,
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_quotation_revisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_quotations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`client_id` bigint unsigned,
	`quote_no` varchar(60) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`title_en` varchar(255),
	`title_ar` varchar(255),
	`subtotal` decimal(18,4) NOT NULL DEFAULT '0',
	`vat_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`vat_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`valid_until` date,
	`status` enum('draft','sent','approved','rejected','expired','converted') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_quotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_receipts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`client_id` bigint unsigned,
	`invoice_id` bigint unsigned,
	`receipt_no` varchar(60),
	`receipt_date` date NOT NULL,
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`payment_method` enum('cash','bank_transfer','cheque','card','other') NOT NULL DEFAULT 'bank_transfer',
	`reference` varchar(120),
	`status` enum('draft','confirmed','bounced','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_receipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_retentions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned,
	`retention_date` date NOT NULL,
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`released_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('held','partially_released','released') NOT NULL DEFAULT 'held',
	`release_due_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_retentions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_rfis` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`rfi_no` varchar(40),
	`subject` varchar(255) NOT NULL,
	`question` text,
	`answer` text,
	`created_by` bigint unsigned,
	`answered_by` bigint unsigned,
	`due_date` date,
	`status` enum('open','answered','closed') NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_rfis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_rfq_quotes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`rfq_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`quote_ref` varchar(80),
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`lead_time_days` int,
	`is_selected` boolean DEFAULT false,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_rfq_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_rfqs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`pr_id` bigint unsigned,
	`project_id` bigint unsigned NOT NULL,
	`rfq_no` varchar(60) NOT NULL,
	`issue_date` date,
	`due_date` date,
	`status` enum('draft','sent','closed','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_rfqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_room_finishes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`room_id` bigint unsigned NOT NULL,
	`surface` enum('ceiling','wall','floor','skirting','cornice','other') NOT NULL,
	`work_item_id` bigint unsigned,
	`description_en` varchar(255),
	`description_ar` varchar(255),
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'm2',
	`rate` decimal(18,4) NOT NULL DEFAULT '0',
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`deduction_m2` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_room_finishes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_room_openings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`room_id` bigint unsigned NOT NULL,
	`kind` enum('door','window','opening','other') NOT NULL DEFAULT 'door',
	`width_m` decimal(10,3) NOT NULL DEFAULT '0',
	`height_m` decimal(10,3) NOT NULL DEFAULT '0',
	`count` int NOT NULL DEFAULT 1,
	`area_m2` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_room_openings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_rooms` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`building_id` bigint unsigned,
	`floor_id` bigint unsigned,
	`unit_id` bigint unsigned,
	`code` varchar(40),
	`name_en` varchar(160) NOT NULL,
	`name_ar` varchar(160),
	`room_type` enum('room','hall','majlis','corridor','toilet','kitchen','bathroom','bedroom','living','dining','office','lobby','staircase','balcony','other') NOT NULL DEFAULT 'room',
	`length_m` decimal(10,3) NOT NULL DEFAULT '0',
	`width_m` decimal(10,3) NOT NULL DEFAULT '0',
	`height_m` decimal(10,3) NOT NULL DEFAULT '0',
	`ceiling_area_m2` decimal(18,4) NOT NULL DEFAULT '0',
	`wall_area_m2` decimal(18,4) NOT NULL DEFAULT '0',
	`floor_area_m2` decimal(18,4) NOT NULL DEFAULT '0',
	`perimeter_m` decimal(18,4) NOT NULL DEFAULT '0',
	`finish_type` varchar(120),
	`ceiling_design` varchar(160),
	`wall_treatment` varchar(160),
	`colour_code` varchar(60),
	`lighting_points` int NOT NULL DEFAULT 0,
	`ac_grills` int NOT NULL DEFAULT 0,
	`status` enum('pending','in_progress','completed','on_hold') NOT NULL DEFAULT 'pending',
	`completion_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_safety_inspections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`inspection_date` date NOT NULL,
	`findings` text,
	`score` decimal(7,3) NOT NULL DEFAULT '0',
	`status` enum('pass','fail','conditional') NOT NULL DEFAULT 'pass',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_safety_inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_site_diary` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`report_date` date NOT NULL,
	`weather` varchar(80),
	`temperature_c` int,
	`manpower_count` int NOT NULL DEFAULT 0,
	`work_done_en` text,
	`work_done_ar` text,
	`issues` text,
	`photo_urls` json,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_site_diary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_snags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`unit_id` bigint unsigned,
	`room_id` bigint unsigned,
	`snag_no` varchar(40),
	`title_en` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`description` text,
	`location` varchar(255),
	`photo_url` varchar(1000),
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`assigned_to` bigint unsigned,
	`due_date` date,
	`status` enum('open','in_progress','resolved','closed','rejected') NOT NULL DEFAULT 'open',
	`created_by` bigint unsigned,
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_snags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_stock_count_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`count_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned NOT NULL,
	`system_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`counted_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`variance_qty` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_stock_count_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_stock_counts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`store_id` bigint unsigned NOT NULL,
	`count_no` varchar(60),
	`count_date` date NOT NULL,
	`status` enum('draft','confirmed','posted') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_stock_counts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_stock_moves` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`store_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`material_id` bigint unsigned NOT NULL,
	`move_type` enum('in','out','transfer','return','scrap','adjust') NOT NULL,
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'pcs',
	`unit_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`total_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`batch_no` varchar(80),
	`expiry_date` date,
	`ref_type` varchar(40),
	`ref_id` bigint unsigned,
	`move_date` date NOT NULL,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_stock_moves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_stores` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`warehouse_id` bigint unsigned,
	`code` varchar(40) NOT NULL,
	`name_en` varchar(160) NOT NULL,
	`name_ar` varchar(160),
	`store_type` enum('main','site','project') NOT NULL DEFAULT 'site',
	`is_active` boolean DEFAULT true,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_stores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_subcontractor_ledger` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`subcontractor_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`entry_date` date NOT NULL,
	`ref_type` varchar(40),
	`ref_id` bigint unsigned,
	`debit` decimal(18,4) NOT NULL DEFAULT '0',
	`credit` decimal(18,4) NOT NULL DEFAULT '0',
	`balance` decimal(18,4) NOT NULL DEFAULT '0',
	`description` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_subcontractor_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_subcontractors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(40),
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`trade` varchar(120),
	`cr_number` varchar(40),
	`vat_number` varchar(40),
	`bank_name` varchar(120),
	`iban` varchar(34),
	`contact_person` varchar(255),
	`phone` varchar(50),
	`email` varchar(320),
	`rating` enum('A','B','C','D') DEFAULT 'B',
	`default_retention_percent` decimal(5,2) NOT NULL DEFAULT '10',
	`doc_expiry_date` date,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_subcontractors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_subcontracts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`subcontractor_id` bigint unsigned NOT NULL,
	`subcontract_no` varchar(80) NOT NULL,
	`scope_en` text,
	`scope_ar` text,
	`contract_value` decimal(18,4) NOT NULL DEFAULT '0',
	`retention_percent` decimal(5,2) NOT NULL DEFAULT '10',
	`advance_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`start_date` date,
	`end_date` date,
	`status` enum('draft','active','completed','terminated') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_subcontracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_suppliers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`vendor_id` bigint unsigned,
	`code` varchar(40),
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`cr_number` varchar(40),
	`vat_number` varchar(40),
	`bank_name` varchar(120),
	`iban` varchar(34),
	`contact_person` varchar(255),
	`phone` varchar(50),
	`email` varchar(320),
	`rating` enum('A','B','C','D') DEFAULT 'B',
	`doc_expiry_date` date,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_tenders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`tender_no` varchar(60) NOT NULL,
	`client_id` bigint unsigned,
	`submission_date` date,
	`bid_bond_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`bid_bond_expiry` date,
	`status` enum('preparing','submitted','won','lost','cancelled') NOT NULL DEFAULT 'preparing',
	`win_loss_reason` text,
	`value` decimal(18,4) NOT NULL DEFAULT '0',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_tenders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_test_certificates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned,
	`cert_no` varchar(80),
	`test_type` varchar(160),
	`test_date` date,
	`result` enum('pass','fail','pending') NOT NULL DEFAULT 'pending',
	`file_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_test_certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_timesheets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`labour_id` bigint unsigned NOT NULL,
	`work_item_id` bigint unsigned,
	`work_date` date NOT NULL,
	`hours` decimal(6,2) NOT NULL DEFAULT '0',
	`overtime_hours` decimal(6,2) NOT NULL DEFAULT '0',
	`rate_per_hour` decimal(18,4) NOT NULL DEFAULT '0',
	`cost_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_timesheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_toolbox_talks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`talk_date` date NOT NULL,
	`topic` varchar(255),
	`attendees_count` int NOT NULL DEFAULT 0,
	`created_by` bigint unsigned,
	`photo_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_toolbox_talks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_units` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`building_id` bigint unsigned,
	`floor_id` bigint unsigned NOT NULL,
	`code` varchar(40),
	`name_en` varchar(160) NOT NULL,
	`name_ar` varchar(160),
	`unit_type` enum('apartment','villa','office','showroom','retail','hotel_room','restaurant','mosque','common','other') NOT NULL DEFAULT 'apartment',
	`area_m2` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'draft',
	`progress` decimal(7,3) NOT NULL DEFAULT '0',
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_variations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`vo_no` varchar(40),
	`title_en` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`description` text,
	`variation_type` enum('addition','omission','time_extension') NOT NULL DEFAULT 'addition',
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`time_impact_days` int NOT NULL DEFAULT 0,
	`status` enum('draft','submitted','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
	`approved_at` timestamp,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_variations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_vehicle_assignments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`driver_labour_id` bigint unsigned,
	`start_date` date,
	`end_date` date,
	`status` enum('active','returned') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_vehicle_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_vehicle_documents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned NOT NULL,
	`doc_type` enum('istimara','insurance','fahas','other') NOT NULL,
	`doc_number` varchar(80),
	`expiry_date` date NOT NULL,
	`file_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_vehicle_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_work_library` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(60) NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`category` enum('false_ceiling','partition','wall_sealing','waterproofing','painting','cornice','flooring','wallpaper','joinery','glazing','lighting','electrical','hvac','demolition','other') NOT NULL DEFAULT 'other',
	`uom` varchar(20) NOT NULL DEFAULT 'm2',
	`material_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`labour_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`equipment_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`overhead_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`profit_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`unit_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`wbs_code` varchar(40),
	`is_active` boolean DEFAULT true,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_work_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_work_library_materials` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`work_item_id` bigint unsigned NOT NULL,
	`material_id` bigint unsigned NOT NULL,
	`consumption_per_unit` decimal(18,4) NOT NULL DEFAULT '0',
	`wastage_percent` decimal(7,3) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_work_library_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_work_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`subcontract_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`wo_no` varchar(60),
	`work_item_id` bigint unsigned,
	`description_en` varchar(500),
	`description_ar` varchar(500),
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`uom` varchar(20) NOT NULL DEFAULT 'm2',
	`rate` decimal(18,4) NOT NULL DEFAULT '0',
	`amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','issued','in_progress','completed','closed') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `dc_work_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dc_wps_files` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`run_id` bigint unsigned,
	`file_no` varchar(60),
	`bank_name` varchar(120),
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`record_count` int NOT NULL DEFAULT 0,
	`status` enum('draft','generated','uploaded','accepted','rejected') NOT NULL DEFAULT 'draft',
	`file_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dc_wps_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `dc_advrec_project_idx` ON `dc_advance_recovery` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_adv_labour_idx` ON `dc_advances` (`labour_id`);--> statement-breakpoint
CREATE INDEX `dc_appr_entity_idx` ON `dc_approval_requests` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `dc_apprstep_req_idx` ON `dc_approval_steps` (`request_id`);--> statement-breakpoint
CREATE INDEX `dc_att_project_idx` ON `dc_attendance` (`project_id`,`attendance_date`);--> statement-breakpoint
CREATE INDEX `dc_att_labour_idx` ON `dc_attendance` (`labour_id`,`attendance_date`);--> statement-breakpoint
CREATE INDEX `dc_audit_entity_idx` ON `dc_audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `dc_back_project_idx` ON `dc_back_charges` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_boqlines_boq_idx` ON `dc_boq_lines` (`boq_id`);--> statement-breakpoint
CREATE INDEX `dc_boqsec_boq_idx` ON `dc_boq_sections` (`boq_id`);--> statement-breakpoint
CREATE INDEX `dc_boqs_project_idx` ON `dc_boqs` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_budget_project_idx` ON `dc_budget_consumption` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_buildings_project_idx` ON `dc_buildings` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_campalloc_camp_idx` ON `dc_camp_allocations` (`camp_id`);--> statement-breakpoint
CREATE INDEX `dc_camps_tenant_idx` ON `dc_camps` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_cheques_due_idx` ON `dc_cheques` (`due_date`);--> statement-breakpoint
CREATE INDEX `dc_clients_tenant_idx` ON `dc_clients` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_licences_expiry_idx` ON `dc_company_licences` (`expiry_date`);--> statement-breakpoint
CREATE INDEX `dc_consultants_tenant_idx` ON `dc_consultants` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_cpt_contract_idx` ON `dc_contract_payment_terms` (`contract_id`);--> statement-breakpoint
CREATE INDEX `dc_contracts_project_idx` ON `dc_contracts` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_docexp_expiry_idx` ON `dc_document_expiry` (`expiry_date`);--> statement-breakpoint
CREATE INDEX `dc_equipment_tenant_idx` ON `dc_equipment` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_eqalloc_eq_idx` ON `dc_equipment_allocations` (`equipment_id`);--> statement-breakpoint
CREATE INDEX `dc_eqmaint_eq_idx` ON `dc_equipment_maintenance` (`equipment_id`);--> statement-breakpoint
CREATE INDEX `dc_claims_project_idx` ON `dc_expense_claims` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_assets_tenant_idx` ON `dc_fixed_assets` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_floors_building_idx` ON `dc_floors` (`building_id`);--> statement-breakpoint
CREATE INDEX `dc_fuel_eq_idx` ON `dc_fuel_logs` (`equipment_id`);--> statement-breakpoint
CREATE INDEX `dc_grnl_grn_idx` ON `dc_grn_lines` (`grn_id`);--> statement-breakpoint
CREATE INDEX `dc_grn_project_idx` ON `dc_grns` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_handovers_project_idx` ON `dc_handovers` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_incident_project_idx` ON `dc_incidents` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_ir_project_idx` ON `dc_inspection_requests` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_invl_inv_idx` ON `dc_invoice_lines` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `dc_inv_project_idx` ON `dc_invoices` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_inv_status_idx` ON `dc_invoices` (`status`);--> statement-breakpoint
CREATE INDEX `dc_ipcl_ipc_idx` ON `dc_ipc_lines` (`ipc_id`);--> statement-breakpoint
CREATE INDEX `dc_ipc_subc_idx` ON `dc_ipcs` (`subcontract_id`);--> statement-breakpoint
CREATE INDEX `dc_labour_tenant_idx` ON `dc_labour` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_labour_iqama_idx` ON `dc_labour` (`iqama_expiry`);--> statement-breakpoint
CREATE INDEX `dc_mars_project_idx` ON `dc_mars` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_matcat_tenant_idx` ON `dc_material_categories` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_mil_issue_idx` ON `dc_material_issue_lines` (`issue_id`);--> statement-breakpoint
CREATE INDEX `dc_issues_project_idx` ON `dc_material_issues` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_mrl_mr_idx` ON `dc_material_request_lines` (`mr_id`);--> statement-breakpoint
CREATE INDEX `dc_mr_project_idx` ON `dc_material_requests` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_materials_tenant_idx` ON `dc_materials` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_materials_code_idx` ON `dc_materials` (`code`);--> statement-breakpoint
CREATE INDEX `dc_ncr_project_idx` ON `dc_ncrs` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_notif_user_idx` ON `dc_notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `dc_payments_project_idx` ON `dc_payments` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_payrolll_run_idx` ON `dc_payroll_lines` (`run_id`);--> statement-breakpoint
CREATE INDEX `dc_payroll_period_idx` ON `dc_payroll_runs` (`period_year`,`period_month`);--> statement-breakpoint
CREATE INDEX `dc_petty_project_idx` ON `dc_petty_cash` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_portalapp_entity_idx` ON `dc_portal_approvals` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `dc_portal_client_idx` ON `dc_portal_users` (`client_id`);--> statement-breakpoint
CREATE INDEX `dc_ppe_project_idx` ON `dc_ppe_issuance` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_prod_project_idx` ON `dc_productivity` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_pbill_project_idx` ON `dc_progress_bills` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_progress_project_idx` ON `dc_progress_entries` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_docs_project_idx` ON `dc_project_documents` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_projects_tenant_idx` ON `dc_projects` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_projects_status_idx` ON `dc_projects` (`status`);--> statement-breakpoint
CREATE INDEX `dc_pol_po_idx` ON `dc_purchase_order_lines` (`po_id`);--> statement-breakpoint
CREATE INDEX `dc_po_project_idx` ON `dc_purchase_orders` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_pr_project_idx` ON `dc_purchase_requests` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_qccl_tenant_idx` ON `dc_qc_checklists` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_qcres_project_idx` ON `dc_qc_results` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_qrev_quote_idx` ON `dc_quotation_revisions` (`quotation_id`);--> statement-breakpoint
CREATE INDEX `dc_quotes_tenant_idx` ON `dc_quotations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_receipts_project_idx` ON `dc_receipts` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_ret_project_idx` ON `dc_retentions` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_rfis_project_idx` ON `dc_rfis` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_rfqq_rfq_idx` ON `dc_rfq_quotes` (`rfq_id`);--> statement-breakpoint
CREATE INDEX `dc_rfq_project_idx` ON `dc_rfqs` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_roomfin_room_idx` ON `dc_room_finishes` (`room_id`);--> statement-breakpoint
CREATE INDEX `dc_openings_room_idx` ON `dc_room_openings` (`room_id`);--> statement-breakpoint
CREATE INDEX `dc_rooms_unit_idx` ON `dc_rooms` (`unit_id`);--> statement-breakpoint
CREATE INDEX `dc_rooms_project_idx` ON `dc_rooms` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_safinsp_project_idx` ON `dc_safety_inspections` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_diary_project_idx` ON `dc_site_diary` (`project_id`,`report_date`);--> statement-breakpoint
CREATE INDEX `dc_snags_project_idx` ON `dc_snags` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_countl_count_idx` ON `dc_stock_count_lines` (`count_id`);--> statement-breakpoint
CREATE INDEX `dc_counts_store_idx` ON `dc_stock_counts` (`store_id`);--> statement-breakpoint
CREATE INDEX `dc_moves_store_idx` ON `dc_stock_moves` (`store_id`);--> statement-breakpoint
CREATE INDEX `dc_moves_mat_idx` ON `dc_stock_moves` (`material_id`);--> statement-breakpoint
CREATE INDEX `dc_stores_tenant_idx` ON `dc_stores` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_sledger_subc_idx` ON `dc_subcontractor_ledger` (`subcontractor_id`);--> statement-breakpoint
CREATE INDEX `dc_subcontractors_tenant_idx` ON `dc_subcontractors` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_subc_project_idx` ON `dc_subcontracts` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_suppliers_tenant_idx` ON `dc_suppliers` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_tenders_tenant_idx` ON `dc_tenders` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_testcert_project_idx` ON `dc_test_certificates` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_ts_project_idx` ON `dc_timesheets` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_toolbox_project_idx` ON `dc_toolbox_talks` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_units_floor_idx` ON `dc_units` (`floor_id`);--> statement-breakpoint
CREATE INDEX `dc_variations_project_idx` ON `dc_variations` (`project_id`);--> statement-breakpoint
CREATE INDEX `dc_vehassign_eq_idx` ON `dc_vehicle_assignments` (`equipment_id`);--> statement-breakpoint
CREATE INDEX `dc_vehdoc_expiry_idx` ON `dc_vehicle_documents` (`expiry_date`);--> statement-breakpoint
CREATE INDEX `dc_worklib_tenant_idx` ON `dc_work_library` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dc_worklib_cat_idx` ON `dc_work_library` (`category`);--> statement-breakpoint
CREATE INDEX `dc_wlm_item_idx` ON `dc_work_library_materials` (`work_item_id`);--> statement-breakpoint
CREATE INDEX `dc_wo_subc_idx` ON `dc_work_orders` (`subcontract_id`);--> statement-breakpoint
CREATE INDEX `dc_wps_run_idx` ON `dc_wps_files` (`run_id`);