/*
  Warnings:

  - You are about to drop the column `isAdminApproved` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "isAdminApproved",
ADD COLUMN     "deletionReason" TEXT DEFAULT '',
ADD COLUMN     "isAdminApprovedDeletion" BOOLEAN NOT NULL DEFAULT false;
