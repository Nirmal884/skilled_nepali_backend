-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "featuredJobCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "hasDirectChat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasResumeAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobPostingLimit" INTEGER NOT NULL DEFAULT 5;
