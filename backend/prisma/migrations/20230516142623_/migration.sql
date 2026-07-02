/*
  Warnings:

  - You are about to drop the column `lect_id` on the `Problem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Problem` DROP FOREIGN KEY `Problem_lect_id_fkey`;

-- AlterTable
ALTER TABLE `Problem` DROP COLUMN `lect_id`;

-- CreateTable
CREATE TABLE `_lect_id` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_lect_id_AB_unique`(`A`, `B`),
    INDEX `_lect_id_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_lect_id` ADD CONSTRAINT `_lect_id_A_fkey` FOREIGN KEY (`A`) REFERENCES `Lecturer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_lect_id` ADD CONSTRAINT `_lect_id_B_fkey` FOREIGN KEY (`B`) REFERENCES `Problem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
