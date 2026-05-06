-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3);
