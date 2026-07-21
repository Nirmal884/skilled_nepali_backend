-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'DELETED');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "jobStatus" "JobStatus" NOT NULL DEFAULT 'PENDING';
