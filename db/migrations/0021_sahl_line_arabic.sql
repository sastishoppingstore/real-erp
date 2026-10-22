-- Sahl: freeze the Arabic name + SKU on document lines (quotations, purchase
-- orders). Additive only, safe to re-run.
SET @db := DATABASE();

-- purchase_order_items
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'purchase_order_items' AND COLUMN_NAME = 'description_ar');
SET @s := IF(@c = 0, 'ALTER TABLE purchase_order_items ADD COLUMN description_ar varchar(500) NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'purchase_order_items' AND COLUMN_NAME = 'sku');
SET @s := IF(@c = 0, 'ALTER TABLE purchase_order_items ADD COLUMN sku varchar(100) NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- sales_quotation_items
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'sales_quotation_items' AND COLUMN_NAME = 'description_ar');
SET @s := IF(@c = 0, 'ALTER TABLE sales_quotation_items ADD COLUMN description_ar varchar(500) NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'sales_quotation_items' AND COLUMN_NAME = 'sku');
SET @s := IF(@c = 0, 'ALTER TABLE sales_quotation_items ADD COLUMN sku varchar(100) NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- products: unit name (used by the invoice / purchase lines)
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'products' AND COLUMN_NAME = 'unit_name');
SET @s := IF(@c = 0, 'ALTER TABLE products ADD COLUMN unit_name varchar(50) NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
