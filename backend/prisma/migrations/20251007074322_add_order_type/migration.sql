-- AlterTable
ALTER TABLE `order` ADD COLUMN `order_type` ENUM('pickup', 'delivery', 'dine_in') NOT NULL DEFAULT 'delivery';
