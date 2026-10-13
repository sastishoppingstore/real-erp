-- 0016_sahl_product_units.sql — additive only. Apply once.
ALTER TABLE products ADD COLUMN is_serial_tracked BOOLEAN NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS sahl_product_units (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  unit_name VARCHAR(50) NOT NULL,
  factor DECIMAL(18,4) NOT NULL DEFAULT '1',
  sale_price DECIMAL(18,4) NOT NULL DEFAULT '0',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX sahl_product_units_tenant_idx (tenant_id),
  INDEX sahl_product_units_product_idx (product_id)
);
