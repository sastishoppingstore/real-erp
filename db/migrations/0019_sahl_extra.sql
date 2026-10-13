-- 0019_sahl_settings_serials_shifts.sql — additive only. Apply once.
CREATE TABLE IF NOT EXISTS sahl_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY sahl_settings_tenant_key (tenant_id, `key`)
);

CREATE TABLE IF NOT EXISTS sahl_serials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  serial VARCHAR(255) NOT NULL,
  status ENUM('in_stock','sold','returned') NOT NULL DEFAULT 'in_stock',
  purchase_ref VARCHAR(100) NULL,
  sale_invoice_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NULL,
  warranty_months INT NULL DEFAULT 12,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY sahl_serials_tenant_serial (tenant_id, serial),
  INDEX sahl_serials_product_idx (product_id)
);

CREATE TABLE IF NOT EXISTS sahl_shifts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  opening_balance DECIMAL(18,4) NOT NULL DEFAULT '0',
  closing_counted DECIMAL(18,4) NULL,
  day_sales DECIMAL(18,4) NULL DEFAULT '0',
  day_expenses DECIMAL(18,4) NULL DEFAULT '0',
  notes TEXT NULL,
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  INDEX sahl_shifts_tenant_idx (tenant_id)
);

ALTER TABLE installments ADD COLUMN profit_percent DECIMAL(5,2) NULL DEFAULT '0';
