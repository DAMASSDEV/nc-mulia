-- Migration: discounts
-- Add dynamic discount configuration table

CREATE TABLE `discounts` (
    `id` VARCHAR(191) NOT NULL,
    `discount_key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `rate` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `discounts_discount_key_key`(`discount_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
