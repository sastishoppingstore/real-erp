-- 0017_sahl_price_floor.sql — additive only. Apply once.
ALTER TABLE products ADD COLUMN min_price DECIMAL(18,4) NULL DEFAULT '0';
ALTER TABLE products ADD COLUMN fixed_discount DECIMAL(18,4) NULL DEFAULT '0';
