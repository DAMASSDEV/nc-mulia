-- Migration: add_membership_plans
-- Add MembershipPlan model for dynamic membership tiers

CREATE TABLE `membership_plans` (
  `id` CHAR(25) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `fee` DECIMAL(12, 0) NOT NULL DEFAULT 0,
  `duration_days` INT NOT NULL DEFAULT 365,
  `discount_rate` FLOAT NOT NULL DEFAULT 0.30,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY `membership_plans_key_key`(`key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
