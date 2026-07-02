/*
  Warnings:

  - You are about to drop the column `tag` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Problem` DROP COLUMN `tag`,
    MODIFY `pro_title` VARCHAR(255) NOT NULL,
    MODIFY `pro_type` VARCHAR(255) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'กำลังส่งเรื่อง';

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProblemToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProblemToTag_AB_unique`(`A`, `B`),
    INDEX `_ProblemToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProblemToTag` ADD CONSTRAINT `_ProblemToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Problem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProblemToTag` ADD CONSTRAINT `_ProblemToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
