/*
  Warnings:

  - You are about to drop the column `isAdminApproved` on the `testimonials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "testimonials" DROP COLUMN "isAdminApproved",
ADD COLUMN     "status" "AdminApprovalStatus" NOT NULL DEFAULT 'PENDING';
