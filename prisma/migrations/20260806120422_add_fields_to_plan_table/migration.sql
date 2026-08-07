-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "employerVisibilityDuration" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "hasCandidateAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "searchVisibilityDuration" INTEGER NOT NULL DEFAULT 1;
