-- 0015_sahl_extension.sql — additive only, safe to re-run (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS sahl_salesmen (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT '0',
  is_active BOOLEAN NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX sahl_salesmen_tenant_idx (tenant_id)
);

CREATE TABLE IF NOT EXISTS sahl_price_lists (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NULL,
  is_default BOOLEAN NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX sahl_price_lists_tenant_idx (tenant_id)
);

CREATE TABLE IF NOT EXISTS sahl_price_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  price_list_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  price DECIMAL(18,4) NOT NULL DEFAULT '0',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY sahl_price_items_list_product (price_list_id, product_id),
  INDEX sahl_price_items_product_idx (product_id)
);

CREATE TABLE IF NOT EXISTS sahl_reservations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  quotation_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  warehouse_id BIGINT UNSIGNED NULL,
  quantity DECIMAL(18,4) NOT NULL,
  expires_at DATE NULL,
  status ENUM('reserved','converted','released','expired') NOT NULL DEFAULT 'reserved',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX sahl_reservations_tenant_idx (tenant_id),
  INDEX sahl_reservations_product_idx (product_id)
);

CREATE TABLE IF NOT EXISTS sahl_cheques (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  number VARCHAR(100) NOT NULL,
  bank VARCHAR(255) NULL,
  party_type ENUM('customer','supplier') NOT NULL DEFAULT 'customer',
  party_id BIGINT UNSIGNED NULL,
  amount DECIMAL(18,4) NOT NULL,
  due_date DATE NULL,
  status ENUM('registered','collected','returned') NOT NULL DEFAULT 'registered',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX sahl_cheques_tenant_idx (tenant_id),
  INDEX sahl_cheques_status_idx (status)
);
