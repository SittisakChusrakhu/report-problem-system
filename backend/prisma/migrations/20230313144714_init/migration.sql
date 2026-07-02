/*
  Warnings:

  - You are about to drop the column `pro_image` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the `_ProblemToTag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pro_images` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ProblemToTag` DROP FOREIGN KEY `_ProblemToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ProblemToTag` DROP FOREIGN KEY `_ProblemToTag_B_fkey`;

-- AlterTable
ALTER TABLE `Problem` DROP COLUMN `pro_image`,
    ADD COLUMN `pro_images` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_ProblemToTag`;

-- CreateTable
CREATE TABLE `_ProblemTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProblemTag_AB_unique`(`A`, `B`),
    INDEX `_ProblemTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Tag_name_key` ON `Tag`(`name`);

-- AddForeignKey
ALTER TABLE `_ProblemTag` ADD CONSTRAINT `_ProblemTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Problem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProblemTag` ADD CONSTRAINT `_ProblemTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
