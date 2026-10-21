-- Scheduled period-report settings for the Sahl construction module.
-- MySQL 8 / utf8mb4. One row per tenant.

CREATE TABLE IF NOT EXISTS `sahl_report_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `frequency` ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'weekly',
  `send_time` VARCHAR(5) NOT NULL DEFAULT '08:00',
  `period_days` INT NOT NULL DEFAULT 7,
  `recipients` TEXT NULL,
  `last_sent_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sahl_report_settings_tenant_uq` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
