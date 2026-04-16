-- CreateEnum
CREATE TYPE "AdminApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "adminApprovalStatus" "AdminApprovalStatus" NOT NULL DEFAULT 'PENDING';
