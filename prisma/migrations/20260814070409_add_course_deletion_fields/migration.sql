-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "deleteRequestedOn" TIMESTAMP(3),
ADD COLUMN     "deletionReason" TEXT DEFAULT '';
