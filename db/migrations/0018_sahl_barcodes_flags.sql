-- 0018_sahl_barcodes_flags.sql — additive only. Apply once.
CREATE TABLE IF NOT EXISTS sahl_barcodes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  barcode VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY sahl_barcodes_tenant_code (tenant_id, barcode),
  INDEX sahl_barcodes_product_idx (product_id)
);

CREATE TABLE IF NOT EXISTS sahl_account_flags (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  account_kind VARCHAR(20) NOT NULL DEFAULT 'customer',
  account_id BIGINT UNSIGNED NOT NULL,
  reminder_date DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY sahl_account_flags_acct (tenant_id, account_kind, account_id)
);
