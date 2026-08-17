-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "businessDocument" TEXT DEFAULT '',
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED';
