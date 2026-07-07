/*
  Warnings:

  - You are about to drop the column `datetime` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `datetime` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Problem` table. All the data in the column will be lost.
  - You are about to alter the column `pro_type` on the `Problem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Enum(EnumId(1))`.
  - You are about to alter the column `status` on the `Problem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `stu_grade` on the `Student` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the `_lect_id` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Lecturer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role_name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `update_at` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Admin` DROP FOREIGN KEY `Admin_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Feedback` DROP FOREIGN KEY `Feedback_pro_id_fkey`;

-- DropForeignKey
ALTER TABLE `Feedback` DROP FOREIGN KEY `Feedback_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Lecturer` DROP FOREIGN KEY `Lecturer_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Problem` DROP FOREIGN KEY `Problem_sid_fkey`;

-- DropForeignKey
ALTER TABLE `Problem` DROP FOREIGN KEY `Problem_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Student` DROP FOREIGN KEY `Student_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `_lect_id` DROP FOREIGN KEY `_lect_id_A_fkey`;

-- DropForeignKey
ALTER TABLE `_lect_id` DROP FOREIGN KEY `_lect_id_B_fkey`;

-- AlterTable
ALTER TABLE `Admin` MODIFY `avatar` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Feedback` DROP COLUMN `datetime`,
    DROP COLUMN `userId`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_read` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `update_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedByUserId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Lecturer` ADD COLUMN `lect_faculty` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Problem` DROP COLUMN `datetime`,
    DROP COLUMN `userId`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_read` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lecturerId` INTEGER NULL,
    ADD COLUMN `update_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedByUserId` INTEGER NULL,
    MODIFY `pro_type` ENUM('ACADEMIC', 'FACILITY', 'ADMINISTRATIVE', 'OTHER') NOT NULL,
    MODIFY `status` ENUM('UNASSIGNED', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'UNASSIGNED';

-- AlterTable
ALTER TABLE `Student` MODIFY `stu_grade` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `user_password` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `_lect_id`;

-- CreateTable
CREATE TABLE `LecturerExpertise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lecturerId` INTEGER NOT NULL,
    `type` ENUM('ACADEMIC', 'FACILITY', 'ADMINISTRATIVE', 'OTHER') NOT NULL,

    UNIQUE INDEX `LecturerExpertise_lecturerId_type_key`(`lecturerId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `pro_id` INTEGER NULL,
    `feed_id` INTEGER NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Admin_user_id_key` ON `Admin`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Lecturer_user_id_key` ON `Lecturer`(`user_id`);

-- CreateIndex
CREATE INDEX `Problem_lecturerId_idx` ON `Problem`(`lecturerId`);

-- CreateIndex
CREATE INDEX `Problem_status_idx` ON `Problem`(`status`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_user_id_key` ON `Student`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_role_name_key` ON `roles`(`role_name`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lecturer` ADD CONSTRAINT `Lecturer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LecturerExpertise` ADD CONSTRAINT `LecturerExpertise_lecturerId_fkey` FOREIGN KEY (`lecturerId`) REFERENCES `Lecturer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Problem` ADD CONSTRAINT `Problem_sid_fkey` FOREIGN KEY (`sid`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Problem` ADD CONSTRAINT `Problem_lecturerId_fkey` FOREIGN KEY (`lecturerId`) REFERENCES `Lecturer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Problem` ADD CONSTRAINT `Problem_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_pro_id_fkey` FOREIGN KEY (`pro_id`) REFERENCES `Problem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_pro_id_fkey` FOREIGN KEY (`pro_id`) REFERENCES `Problem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_feed_id_fkey` FOREIGN KEY (`feed_id`) REFERENCES `Feedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Feedback` RENAME INDEX `Feedback_pro_id_fkey` TO `Feedback_pro_id_idx`;

-- RenameIndex
ALTER TABLE `Problem` RENAME INDEX `Problem_sid_fkey` TO `Problem_sid_idx`;

-- RenameIndex
ALTER TABLE `User` RENAME INDEX `User_role_id_fkey` TO `User_role_id_idx`;
