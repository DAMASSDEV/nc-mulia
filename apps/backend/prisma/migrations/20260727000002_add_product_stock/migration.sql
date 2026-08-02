-- Migration: add_product_stock
-- Add stock field to Product model for inventory tracking

ALTER TABLE `products` ADD COLUMN `stock` INT NOT NULL DEFAULT 0;
